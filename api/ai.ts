import type { VercelRequest, VercelResponse } from "@vercel/node";

async function fetchImageAsInlineData(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const resp = await fetch(url);
    if (!resp.ok) return null;
    const mimeType = resp.headers.get("content-type")?.split(";")[0]?.trim() || "image/jpeg";
    const buf = Buffer.from(await resp.arrayBuffer());
    return { mimeType, data: buf.toString("base64") };
  } catch {
    return null;
  }
}

async function buildPartsFromContent(content: any): Promise<any[]> {
  if (typeof content === "string") {
    return [{ text: content }];
  }
  if (Array.isArray(content)) {
    const parts: any[] = [];
    for (const item of content) {
      if (item?.type === "text" && typeof item.text === "string") {
        parts.push({ text: item.text });
      } else if (item?.type === "inline_data" && item.data && item.mimeType) {
        parts.push({ inline_data: { mime_type: item.mimeType, data: item.data } });
      } else if (item?.type === "image_url" && typeof item.image_url === "string") {
        const img = await fetchImageAsInlineData(item.image_url);
        if (img) {
          parts.push({ inline_data: { mime_type: img.mimeType, data: img.data } });
        }
      }
    }
    return parts;
  }
  return [{ text: String(content ?? "") }];
}

function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  const primary = process.env.GEMINI_API_KEY;
  if (primary) keys.push(primary);
  for (const suffix of ["B", "C", "D", "E", "F"]) {
    const k = process.env[`GEMINI_API_KEY_${suffix}`];
    if (k) keys.push(k);
  }
  return keys;
}

const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

function buildModelChain(primary: string): string[] {
  const chain = [primary, ...MODEL_FALLBACK_CHAIN.filter((m) => m !== primary)];
  return Array.from(new Set(chain));
}

function extractGeminiText(data: any): string {
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function isEmptyFinish(data: any): { empty: boolean; finishReason: string } {
  const text = extractGeminiText(data);
  const finishReason = data?.candidates?.[0]?.finishReason ?? "UNKNOWN";
  return { empty: !text || !text.trim(), finishReason };
}

async function callGeminiWithFallback(
  requestBody: any,
  primaryModel: string,
  keys: string[]
): Promise<{ status: number; data: any; keyIndex: number; modelUsed: string | null; emptyReason: string | null }> {
  let lastStatus = 500;
  let lastData: any = { error: "No API keys configured" };
  let lastEmptyReason: string | null = null;
  const models = buildModelChain(primaryModel);

  for (let mi = 0; mi < models.length; mi++) {
    const model = models[mi];
    let allRecoverable = true;

    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      try {
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );
        const data = await geminiRes.json();
        lastStatus = geminiRes.status;
        lastData = data;

        if (geminiRes.ok) {
          const { empty, finishReason } = isEmptyFinish(data);
          if (!empty) {
            if (mi > 0 || i > 0) {
              console.log(`[AI] Succeeded on model "${model}" with key #${i + 1} (after ${mi} model fallback(s))`);
            }
            return { status: geminiRes.status, data, keyIndex: i, modelUsed: model, emptyReason: null };
          }
          lastEmptyReason = finishReason;
          console.warn(`[AI] ${model} key #${i + 1} returned empty text (finishReason=${finishReason}). Falling through.`);
          continue;
        }

        const status = geminiRes.status;
        const reason = data?.error?.status ?? "";
        const isRateLimit = status === 429 || status === 503;
        const isAuthOrPermDenied = status === 401 || status === 403;
        const isTransientServer = status === 500 || status === 502 || status === 504;
        const isRecoverable = isRateLimit || isAuthOrPermDenied || isTransientServer;
        console.warn(
          `[AI] ${model} key #${i + 1} failed (${status} ${reason}${isRateLimit ? " rate-limited" : isAuthOrPermDenied ? " perm-denied" : ""}):`,
          data.error?.message ?? "unknown"
        );

        if (!isRecoverable) {
          allRecoverable = false;
          break;
        }
      } catch (err: any) {
        console.warn(`[AI] ${model} key #${i + 1} threw:`, err.message);
        lastData = { error: err.message };
        allRecoverable = false;
        break;
      }
    }

    if (!allRecoverable) break;
  }

  return { status: lastStatus, data: lastData, keyIndex: -1, modelUsed: null, emptyReason: lastEmptyReason };
}

function extractRetryAfter(data: any): number | undefined {
  const detailsArr = data?.error?.details;
  if (!Array.isArray(detailsArr)) return undefined;
  const retryInfo = detailsArr.find((d: any) => typeof d?.retryDelay === "string");
  if (!retryInfo) return undefined;
  const m = String(retryInfo.retryDelay).match(/(\d+(?:\.\d+)?)/);
  return m ? Math.ceil(parseFloat(m[1])) : undefined;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages, maxTokens = 512, temperature = 0.7, thinkingBudget } = req.body;
  const keys = getGeminiApiKeys();

  if (keys.length === 0) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  const systemMessage = messages.find((m: any) => m.role === "system");
  const userMessages = messages.filter((m: any) => m.role !== "system");

  const geminiContents = await Promise.all(
    userMessages.map(async (m: any) => ({
      role: m.role === "assistant" ? "model" : "user",
      parts: await buildPartsFromContent(m.content),
    }))
  );

  while (geminiContents.length > 0 && geminiContents[0].role === "model") {
    geminiContents.shift();
  }

  try {
    const requestBody: any = {
      system_instruction: systemMessage
        ? { parts: [{ text: systemMessage.content }] }
        : undefined,
      contents: geminiContents,
      generationConfig: {
        maxOutputTokens: maxTokens,
        temperature,
        ...(typeof thinkingBudget === "number"
          ? { thinkingConfig: { thinkingBudget } }
          : {}),
      },
    };

    const { status, data, keyIndex, modelUsed, emptyReason } = await callGeminiWithFallback(
      requestBody,
      "gemini-2.5-flash",
      keys
    );

    if (keyIndex === -1) {
      const retryAfter = extractRetryAfter(data);
      const baseMsg = data?.error?.message ?? "Gemini API error";
      let friendlyMsg: string;
      let httpStatus = status;
      if (emptyReason) {
        httpStatus = 502;
        if (emptyReason === "SAFETY" || emptyReason === "BLOCKLIST" || emptyReason === "PROHIBITED_CONTENT") {
          friendlyMsg = `Gemini blocked the response on every key/model (finishReason=${emptyReason}). Try removing emojis, slang, or sensitive wording from your input and try again.`;
        } else if (emptyReason === "MAX_TOKENS") {
          friendlyMsg = `The model ran out of output tokens (finishReason=MAX_TOKENS) on every fallback. Try shorter input or fewer images.`;
        } else if (emptyReason === "RECITATION") {
          friendlyMsg = `Gemini suppressed the response due to recitation policy on every key/model. Try rewording your input.`;
        } else {
          friendlyMsg = `Gemini returned no text on every key/model (finishReason=${emptyReason}). Try again or simplify your input.`;
        }
      } else if (status === 429 || status === 503) {
        friendlyMsg = `All ${keys.length} Gemini API key(s) are rate-limited on every fallback model${retryAfter ? `. Try again in ~${retryAfter}s.` : "."} Add another GEMINI_API_KEY_B/C/D… to increase capacity. (${baseMsg})`;
      } else if (status === 401 || status === 403) {
        friendlyMsg = `All ${keys.length} Gemini API key(s) were denied by Google on every fallback model. Common causes: (1) the API key's Google Cloud project is in a country/region where Gemini API is unavailable — create the keys at https://aistudio.google.com from a supported region; (2) the project has billing or admin restrictions; (3) the key was revoked. Generate fresh keys at https://aistudio.google.com/app/apikey and replace GEMINI_API_KEY / GEMINI_API_KEY_B / GEMINI_API_KEY_C in Replit Secrets. (${baseMsg})`;
      } else {
        friendlyMsg = baseMsg;
      }
      return res.status(httpStatus).json({ error: friendlyMsg, retryAfter, finishReason: emptyReason });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    console.log(`[AI] OK — model=${modelUsed} key=#${keyIndex + 1} response length=${text.length} chars`);

    return res.status(200).json({
      choices: [{ message: { content: text } }],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
