import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "GROQ_API_KEY not configured" });
  }

  const { messages, model, max_tokens, temperature } = req.body;

  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required" });
  }

  try {
    const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: model ?? "llama-3.3-70b-versatile",
        messages,
        max_tokens: max_tokens ?? 1024,
        temperature: temperature ?? 0.7,
      }),
    });

    const data = await groqRes.json();
    return res.status(groqRes.status).json(data);
  } catch (err: any) {
    return res.status(500).json({ error: err.message });
  }
}
