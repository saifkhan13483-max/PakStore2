import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { messages, maxTokens = 512, temperature = 0.7 } = req.body;
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not configured" });
  }

  const systemMessage = messages.find((m: any) => m.role === "system");
  const userMessages = messages.filter((m: any) => m.role !== "system");

  const geminiContents = userMessages.map((m: any) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  while (geminiContents.length > 0 && geminiContents[0].role === "model") {
    geminiContents.shift();
  }

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-lite:generateContent?key=${apiKey}`,
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
