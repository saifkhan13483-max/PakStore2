interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

const AI_SYSTEM_PROMPT = `You are a professional e-commerce conversion expert and SEO specialist for PakCart, a Pakistani e-commerce store selling Bags & Wallets, Jewelry, Shoes, Slippers, Stitched Dresses, Watches, and Tech Gadgets. Help increase sales by writing persuasive product content, recommending relevant products, and improving the shopping experience. Keep responses concise, persuasive, human-like, and conversion-focused.`;

async function callAI(
  messages: AIMessage[],
  opts: { maxTokens?: number; temperature?: number } = {}
): Promise<string> {
  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: [{ role: "system", content: AI_SYSTEM_PROMPT }, ...messages],
      maxTokens: opts.maxTokens ?? 512,
      temperature: opts.temperature ?? 0.7,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "AI request failed");

  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("No response from AI");

  return content;
}

export async function generateProductDescription(
  name: string,
  category: string,
  price: number
): Promise<string> {
  return callAI(
    [
      {
        role: "user",
        content: `Write a compelling SEO-optimized product description for:

Product: ${name}
Category: ${category}
Price: Rs. ${price.toLocaleString()}

Include:
1. Engaging opening sentence (mention Pakistani craftsmanship if relevant)
2. 3-4 bullet points with key features (use "•" symbol)
3. Emotional selling points (gifting, quality, artisanal value)
4. Natural keyword integration for Pakistani e-commerce search
5. Brief call-to-action

Keep it under 180 words. Write in English.`,
      },
    ],
    { maxTokens: 600 }
  );
}

export async function generateSmartSearchQuery(naturalQuery: string): Promise<{
  keywords: string[];
  suggestedCategory?: string;
  priceHint?: string;
}> {
  const result = await callAI(
    [
      {
        role: "user",
        content: `Parse this Pakistani e-commerce shopping query and return ONLY a valid JSON object (no markdown, no explanation):

Query: "${naturalQuery}"

Available categories: Bags & Wallets, Jewelry, Shoes, Slippers, Stitched Dresses, Watches, Tech Gadgets

Return exactly:
{"keywords":["word1","word2"],"suggestedCategory":"category name or null","priceHint":"budget description or null"}`,
      },
    ],
    { maxTokens: 120, temperature: 0.2 }
  );

  try {
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return { keywords: naturalQuery.split(" ").filter((w) => w.length > 2) };
  }
}

export async function generateAIRecommendations(
  currentProduct: { name: string; category: string; price: number },
  availableProducts: { id: string; name: string; category: string; price: number }[]
): Promise<string[]> {
  const productList = availableProducts
    .filter((p) => p.name !== currentProduct.name)
    .slice(0, 20)
    .map((p) => `${p.id}|||${p.name}|||${p.category}|||Rs.${p.price}`)
    .join("\n");

  const result = await callAI(
    [
      {
        role: "user",
        content: `A customer is viewing: "${currentProduct.name}" (${currentProduct.category}, Rs.${currentProduct.price.toLocaleString()})

Pick 4 products from the list below that best complement or pair with it. Consider category mix, price range, and gifting potential.

Return ONLY a JSON array of 4 product IDs, nothing else: ["id1","id2","id3","id4"]

Products:
${productList}`,
      },
    ],
    { maxTokens: 80, temperature: 0.3 }
  );

  try {
    const cleaned = result.replace(/```json|```/g, "").trim();
    const ids = JSON.parse(cleaned);
    return Array.isArray(ids) ? ids.slice(0, 4) : [];
  } catch {
    return [];
  }
}

export async function generateCartConversionMessage(
  items: { name: string; price: number; quantity: number }[],
  total: number
): Promise<{ urgency: string; offer: string; trust: string }> {
  const itemNames = items.map((i) => i.name).join(", ");

  const result = await callAI(
    [
      {
        role: "user",
        content: `Generate 3 short sales messages for a Pakistani e-commerce cart.
Cart contains: ${itemNames}
Total: Rs. ${total.toLocaleString()}

Return ONLY valid JSON (no markdown):
{"urgency":"stock or time urgency, max 12 words","offer":"value or savings message, max 15 words","trust":"quality or authenticity assurance, max 15 words"}`,
      },
    ],
    { maxTokens: 150, temperature: 0.8 }
  );

  try {
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      urgency: "High demand — order now to secure your items!",
      offer: "Free shipping on orders over Rs. 10,000.",
      trust: "100% authentic Pakistani craftsmanship, guaranteed.",
    };
  }
}

export async function generateAIReviews(
  productName: string,
  category: string,
  count: number = 5
): Promise<{ userName: string; content: string; rating: number }[]> {
  const result = await callAI(
    [
      {
        role: "user",
        content: `Generate ${count} realistic customer reviews for: "${productName}" (${category}) on a Pakistani e-commerce store.

Requirements:
- Use Pakistani names (mix of male/female)
- Ratings between 3 and 5 stars
- Mix of brief (1-2 sentences) and detailed (3-4 sentences) reviews
- Some reviews in Roman Urdu, some in English — sound genuine, not promotional

ROMAN URDU SPELLING RULES (follow strictly for any Roman Urdu review):
- "kia" (not "kya") for what/did
- "hai" (singular is) / "hain" (plural/respectful are)
- "nahi" (not "nahin") for no/not
- "toh" (not "tou") for then/so
- "aur" (not "or") for and
- "woh" (not "wo") for he/she/that
- "yeh" (not "ye") for this/these
- "mein" for in, "main" for I
- "aap" (never "ap") for you (respectful)
- Full words only: "hai" not "h", "kyun" not "kyu", "par" not "pr", "se" not "sy"
- Common words: Shukriya (thanks), Acha (good), Behtareen (excellent), Zabardast (great), Bilkul (absolutely), Theek hai (okay), Pasand aaya (liked it), Qeemat (price), Mahenga (expensive), Sasta (affordable)
- Example correct sentence: "Bohot acha product hai, delivery bhi time pe aayi. Bilkul recommend karunga."

Return ONLY a JSON array (no markdown):
[{"userName":"name","content":"review text","rating":4}]`,
      },
    ],
    { maxTokens: 900, temperature: 0.9 }
  );

  try {
    const cleaned = result.replace(/```json|```/g, "").trim();
    const reviews = JSON.parse(cleaned);
    return Array.isArray(reviews) ? reviews.slice(0, count) : [];
  } catch {
    return [];
  }
}

export async function generateSEOMeta(
  productName: string,
  category: string,
  description: string
): Promise<{ title: string; description: string; keywords: string }> {
  const result = await callAI(
    [
      {
        role: "user",
        content: `Generate SEO meta tags for this Pakistani e-commerce product:

Name: ${productName}
Category: ${category}
Description: ${description.slice(0, 300)}

Return ONLY valid JSON (no markdown):
{"title":"max 60 chars with primary keyword and PakCart brand","description":"max 155 chars, conversion-focused with Pakistan delivery mention","keywords":"6-8 comma-separated search keywords"}`,
      },
    ],
    { maxTokens: 200, temperature: 0.3 }
  );

  try {
    const cleaned = result.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch {
    return {
      title: `${productName} | PakCart`,
      description: `Buy ${productName} online in Pakistan. Premium quality with fast delivery across Pakistan.`,
      keywords: `${productName}, ${category}, buy online pakistan, pakcart`,
    };
  }
}
