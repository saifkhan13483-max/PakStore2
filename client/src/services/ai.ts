type AIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: string };

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string | AIContentPart[];
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

export async function generateVariantNames(
  productName: string,
  category: string,
  variantType: string,
  imageUrls: string[]
): Promise<string[]> {
  if (imageUrls.length === 0) return [];

  const promptText = `You are naming product variant options for a Pakistani fashion/accessories e-commerce store.

Product: "${productName}"
Category: ${category}
Variant Type: ${variantType || "Option"}

I'm providing ${imageUrls.length} image(s) below — one per variant option, in order. Look at each image and produce a SIMPLE, customer-friendly name for that option.

Naming rules:
- Keep names VERY SIMPLE — 1 to 3 words maximum.
- Match the variant type. If type is "Color", return plain color names (e.g., "Blue", "Gold", "Black", "Rose Gold"). If "Size", return sizes (e.g., "Small", "Medium", "Large"). If "Material", return material names. If "Pattern", return pattern names.
- Use everyday words shoppers recognize. Avoid flowery descriptors like "Sapphire" or "Royal" unless the image clearly shows that exact shade.
- Title Case. No emojis. No quotes. No extra description.
- One name per image, in the SAME ORDER as provided.

Return ONLY a valid JSON array of ${imageUrls.length} strings. No markdown, no explanation. Example: ["Blue","Gold","Black"]`;

  const result = await callAI(
    [
      {
        role: "user",
        content: [
          { type: "text", text: promptText },
          ...imageUrls.map((url) => ({ type: "image_url" as const, image_url: url })),
        ],
      },
    ],
    { maxTokens: 300, temperature: 0.4 }
  );

  try {
    const cleaned = result.replace(/```json|```/g, "").trim();
    const arr = JSON.parse(cleaned);
    if (Array.isArray(arr)) {
      return arr.slice(0, imageUrls.length).map((s) => String(s).trim());
    }
    return [];
  } catch {
    return [];
  }
}

export interface FullProductContent {
  name: string;
  slug: string;
  shortDescription: string;
  longDescriptionHtml: string;
  features: string[];
  variants: string[];
  raw: string;
}

function markdownToHtml(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let inList = false;
  const flushList = () => {
    if (inList) {
      out.push("</ul>");
      inList = false;
    }
  };
  const inline = (s: string) =>
    s
      .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
      .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "<em>$1</em>");

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) {
      flushList();
      continue;
    }
    const headingMatch = line.match(/^(#{1,6})\s+(.+)$/);
    if (headingMatch) {
      flushList();
      const level = Math.min(headingMatch[1].length + 1, 6);
      out.push(`<h${level}>${inline(headingMatch[2])}</h${level}>`);
      continue;
    }
    const bulletMatch = line.match(/^[-*]\s+(.+)$/);
    if (bulletMatch) {
      if (!inList) {
        out.push("<ul>");
        inList = true;
      }
      out.push(`<li>${inline(bulletMatch[1])}</li>`);
      continue;
    }
    const boldOnlyMatch = line.match(/^\*\*(.+?):\*\*$/);
    if (boldOnlyMatch) {
      flushList();
      out.push(`<h3>${inline(boldOnlyMatch[1])}</h3>`);
      continue;
    }
    flushList();
    out.push(`<p>${inline(line)}</p>`);
  }
  flushList();
  return out.join("\n");
}

function extractSection(text: string, label: string): string {
  const re = new RegExp(
    `\\*\\*${label}:\\*\\*\\s*\\n?([\\s\\S]*?)(?=\\n\\*\\*[^*]+:\\*\\*|$)`,
    "i"
  );
  const m = text.match(re);
  return m ? m[1].trim() : "";
}

function parseListItems(section: string): string[] {
  return section
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => /^[-*]\s+/.test(l))
    .map((l) =>
      l
        .replace(/^[-*]\s+/, "")
        .replace(/\*\*(.+?)\*\*/g, "$1")
        .replace(/__([^_]+)__/g, "$1")
        .replace(/`([^`]+)`/g, "$1")
        .trim()
    )
    .filter((l) => l.length > 0);
}

const FULL_CONTENT_PROMPT = `Analyze both the text and product images using these guidelines:

- Examine visible color, shape, style, material cues, packaging, use case, and positioning from images
- Do not invent hidden specifications that are not visible or not provided
- Make only safe, context-based assumptions when something is unclear
- Base all claims on provided information and image evidence

Generate exactly these sections in this order:

1. Product Name — Clear and compelling, SEO-friendly with natural keywords, conversion-focused (max 5–6 words).
2. Slug — Short, readable, keyword-based for URL optimization (lowercase, hyphenated).
3. Short Description — Concise and sales-focused, 15–25 words max, hook-driven opening.
4. Long Description — Persuasive and structured, 70–150 words max. Must include a "Product Details" subsection heading. Combine emotional appeal with practical benefits. Sound premium, clear, trustworthy.
5. Key Features — 3 to 5 features. Each 4–6 words max. Benefit-oriented and punchy. Bold the most important words.
6. Available Variants — 1 to 3 words per variant. Only include actual or clearly supported variants visible in images. If none, write: "No variants specified".

STRICT RULES:
- Do NOT mention price, cost, profit, margin, discount, or currency.
- Do NOT invent fake claims, warranty, guarantee, refund, or return policies unless explicitly provided.
- Do NOT use generic language or keyword stuffing.
- Write SEO-friendly but natural language.
- Use emotional and benefit-led language strategically.
- Position product as differentiated, not generic.
- Bold all key differentiators and important words.
- Maintain professional, document-ready formatting.

Long Description flow:
Opening Hook → Problem or Desire → Why This Product Matters → Key Benefits → **Product Details:** subsection (with bold spec subheadings and bullet specs) → Why It Stands Out → Who It's For → Soft CTA (no price mention).

Product Details subsection format example:
**Product Details:**

**[Product Type] Specifications:**
- Chest Size: [measurement]
- Length: [measurement]
- Fabric: [material and finish]
- Design: [key design elements]

OUTPUT FORMAT — return EXACTLY in this template, nothing else, no preamble, no closing remarks:

**Product Name:**
[5–6 words max]

**Slug:**
[lowercase-hyphenated]

**Short Description:**
[15–25 words]

**Long Description:**
[Opening Hook + Problem + Why It Matters + Key Benefits]

**Product Details:**

**[Product Type] Specifications:**
- [Spec]: [value]
- [Spec]: [value]
- [Spec]: [value]

[Why It Stands Out + Who It's For + Soft CTA]

**Key Features:**
- **[Feature 1 - 4–6 words]**
- **[Feature 2 - 4–6 words]**
- **[Feature 3 - 4–6 words]**

**Available Variants:**
- [Variant 1 - 1–3 words]
- [Variant 2 - 1–3 words]

All variation names must be very simple.`;

export async function generateFullProductContent(
  productImageUrls: string[],
  hints: { nameHint?: string; category?: string; variantTypes?: string[]; extraDetails?: string } = {}
): Promise<FullProductContent | null> {
  const contextLines: string[] = [];
  if (hints.nameHint) contextLines.push(`Product name hint from seller: "${hints.nameHint}"`);
  if (hints.category) contextLines.push(`Category: ${hints.category}`);
  if (hints.variantTypes && hints.variantTypes.length > 0) {
    contextLines.push(`Existing variant types in form: ${hints.variantTypes.join(", ")}`);
  }
  if (hints.extraDetails && hints.extraDetails.trim()) {
    contextLines.push(
      `Additional product details provided by the seller (TREAT AS GROUND TRUTH — use these specs verbatim where applicable, especially in the Product Details subsection. Do not contradict them):\n${hints.extraDetails.trim()}`
    );
  }
  contextLines.push(`Store: PakCart (Pakistani e-commerce). Audience: Pakistani shoppers.`);

  const userText = `${FULL_CONTENT_PROMPT}\n\n--- CONTEXT ---\n${contextLines.join("\n")}\n\n--- IMAGES ---\n${productImageUrls.length} product image(s) attached below for analysis.`;

  const content: AIContentPart[] = [
    { type: "text", text: userText },
    ...productImageUrls.map((url) => ({ type: "image_url" as const, image_url: url })),
  ];

  const result = await callAI(
    [{ role: "user", content }],
    { maxTokens: 1400, temperature: 0.7 }
  );

  if (!result || !result.trim()) return null;

  const cleaned = result.replace(/```(?:markdown|md)?|```/g, "").trim();

  const name = extractSection(cleaned, "Product Name").replace(/^["']|["']$/g, "").trim();
  let slug = extractSection(cleaned, "Slug")
    .replace(/^["']|["']$/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const shortDescription = extractSection(cleaned, "Short Description")
    .replace(/^\*+|\*+$/g, "")
    .trim();

  const longRaw = extractSection(cleaned, "Long Description");
  const longDescriptionHtml = longRaw ? markdownToHtml(longRaw) : "";

  const features = parseListItems(extractSection(cleaned, "Key Features"));
  const variantsSection = extractSection(cleaned, "Available Variants");
  const variants = /no variants specified/i.test(variantsSection)
    ? []
    : parseListItems(variantsSection);

  if (!slug && name) {
    slug = name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/[\s_]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  return {
    name,
    slug,
    shortDescription,
    longDescriptionHtml,
    features,
    variants,
    raw: cleaned,
  };
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
