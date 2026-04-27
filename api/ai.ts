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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages, maxTokens = 512, temperature = 0.7, thinkingBudget } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
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
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
      }
    );

    const data = await geminiRes.json();

    if (!geminiRes.ok) {
      return res.status(geminiRes.status).json({ error: data.error?.message || "Gemini API error" });
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
    return res.status(200).json({
      choices: [{ message: { content: text } }],
    });
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
