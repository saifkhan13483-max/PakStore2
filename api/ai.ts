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

async function callGeminiWithFallback(
  requestBody: any,
  primaryModel: string,
  keys: string[]
): Promise<{ status: number; data: any; keyIndex: number; modelUsed: string | null }> {
  let lastStatus = 500;
  let lastData: any = { error: "No API keys configured" };
  const models = buildModelChain(primaryModel);

  for (let mi = 0; mi < models.length; mi++) {
    const model = models[mi];
    let allRateLimited = true;

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
          if (mi > 0 || i > 0) {
            console.log(`[AI] Succeeded on model "${model}" with key #${i + 1} (after ${mi} model fallback(s))`);
          }
          return { status: geminiRes.status, data, keyIndex: i, modelUsed: model };
        }

        const isRateLimit = geminiRes.status === 429 || geminiRes.status === 503;
        console.warn(`[AI] ${model} key #${i + 1} failed (${geminiRes.status}${isRateLimit ? " rate-limited" : ""}):`, data.error?.message ?? "unknown");

        if (!isRateLimit) {
          allRateLimited = false;
          break;
        }
      } catch (err: any) {
        console.warn(`[AI] ${model} key #${i + 1} threw:`, err.message);
        lastData = { error: err.message };
        allRateLimited = false;
        break;
      }
    }

    if (!allRateLimited) break;
  }

  return { status: lastStatus, data: lastData, keyIndex: -1, modelUsed: null };
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

    const { status, data, keyIndex, modelUsed } = await callGeminiWithFallback(
      requestBody,
      "gemini-2.5-flash",
      keys
    );

    if (keyIndex === -1) {
      const retryAfter = extractRetryAfter(data);
      const baseMsg = data?.error?.message ?? "Gemini API error";
      const friendlyMsg = status === 429 || status === 503
        ? `All ${keys.length} Gemini API key(s) are rate-limited on every fallback model${retryAfter ? `. Try again in ~${retryAfter}s.` : "."} Add another GEMINI_API_KEY_B/C/D… to increase capacity. (${baseMsg})`
        : baseMsg;
      return res.status(status).json({ error: friendlyMsg, retryAfter });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    if (!text) {
      const reason = data.candidates?.[0]?.finishReason ?? "unknown";
      console.error(`[AI] ${modelUsed} returned no text. finishReason=${reason}`);
    }

    return res.status(200).json({
      choices: [{ message: { content: text } }],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
