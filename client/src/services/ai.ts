type AIContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: string }
  | { type: "inline_data"; mimeType: string; data: string };

interface AIMessage {
  role: "system" | "user" | "assistant";
  content: string | AIContentPart[];
}

const AI_SYSTEM_PROMPT = `You are a professional e-commerce conversion expert and SEO specialist for PakCart, a Pakistani e-commerce store selling Bags & Wallets, Jewelry, Shoes, Slippers, Stitched Dresses, Watches, and Tech Gadgets. Help increase sales by writing persuasive product content, recommending relevant products, and improving the shopping experience. Keep responses concise, persuasive, human-like, and conversion-focused.`;

/** Fetch a URL in the browser and return its base64 encoded data + MIME type. */
async function browserFetchBase64(url: string): Promise<{ mimeType: string; data: string } | null> {
  try {
    const res = await fetch(url);
    if (!res.ok) return null;
    const blob = await res.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/s);
        if (!match) { resolve(null); return; }
        resolve({ mimeType: match[1], data: match[2] });
      };
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Convert any image_url parts in a message's content to inline_data (base64)
 * so the proxy never needs to do server-side image fetching.
 */
async function resolveImageParts(content: string | AIContentPart[]): Promise<string | AIContentPart[]> {
  if (typeof content === "string") return content;
  return Promise.all(
    content.map(async (part) => {
      if (part.type !== "image_url") return part;
      const b64 = await browserFetchBase64(part.image_url);
      if (!b64) return { type: "text" as const, text: "[image unavailable]" };
      return { type: "inline_data" as const, mimeType: b64.mimeType, data: b64.data };
    })
  );
}

async function callAI(
  messages: AIMessage[],
  opts: { maxTokens?: number; temperature?: number; thinkingBudget?: number } = {}
): Promise<string> {
  const allMessages = [{ role: "system" as const, content: AI_SYSTEM_PROMPT }, ...messages];

  // Convert all image_url parts to base64 inline_data in the browser before sending
  const resolvedMessages = await Promise.all(
    allMessages.map(async (m) => ({ ...m, content: await resolveImageParts(m.content) }))
  );

  const res = await fetch("/api/ai", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: resolvedMessages,
      maxTokens: opts.maxTokens ?? 512,
      temperature: opts.temperature ?? 0.7,
      ...(typeof opts.thinkingBudget === "number" ? { thinkingBudget: opts.thinkingBudget } : {}),
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
  imageUrls: string[],
  productImageUrls: string[] = []
): Promise<string[]> {
  if (imageUrls.length === 0) return [];

  const hasProductImages = productImageUrls.length > 0;

  const promptText = `You are a professional product analyst for a Pakistani fashion/accessories e-commerce store. Your task is to examine each variant image carefully and assign it the MOST ACCURATE possible name.

Product: "${productName}"
Category: ${category}
Variant Type: ${variantType || "Color"}
${hasProductImages ? `\nContext: ${productImageUrls.length} main product image(s) appear FIRST (before the variant images) to give you product context. Then ${imageUrls.length} VARIANT image(s) follow — one per option, in order.` : `\n${imageUrls.length} variant image(s) follow — one per option, in order.`}

YOUR JOB:
- Carefully look at EACH variant image pixel by pixel.
- Identify the DOMINANT attribute of that variant (color, size, material, pattern, etc.) based on the variant type.
- ${variantType === "Color" || !variantType ? "For COLOR variants: Look at the actual hue of the garment/item. Name it using a simple, widely-recognized color word a Pakistani shopper would use (e.g., Pink, Teal, Maroon, Black, Purple, Navy Blue, Off White, Beige, Red, Olive Green)." : ""}
- ${variantType === "Size" ? "For SIZE variants: Use standard sizing (XS, S, M, L, XL, XXL, Free Size, etc.)." : ""}
- Do NOT guess or assume — only name what you can clearly see in the image.
- Do NOT use poetic or decorative names unless they perfectly describe the visible attribute.
- Do NOT combine two colors into one name (e.g., avoid "Dark Teal" when it is simply "Teal").

STRICT NAMING RULES:
- 1 to 3 words maximum per name.
- Title Case always.
- No emojis, no quotes, no punctuation, no extra explanation.
- One name per variant image, in EXACT ORDER provided.
- Total names returned MUST equal exactly ${imageUrls.length} (one per variant image).

Return ONLY a valid JSON array of exactly ${imageUrls.length} strings. No markdown, no extra text.
Example output for 5 color variants: ["Pink","Teal","Maroon","Black","Purple"]`;

  const contentParts: AIContentPart[] = [
    { type: "text", text: promptText },
  ];

  if (hasProductImages) {
    contentParts.push({ type: "text", text: `\n--- PRODUCT CONTEXT IMAGES (${productImageUrls.length}) ---` });
    productImageUrls.forEach((url) => contentParts.push({ type: "image_url" as const, image_url: url }));
    contentParts.push({ type: "text", text: `\n--- VARIANT OPTION IMAGES (${imageUrls.length}, name these in order) ---` });
  }

  imageUrls.forEach((url) => contentParts.push({ type: "image_url" as const, image_url: url }));

  // Allow ~40 output tokens per variant name, with a healthy floor and ceiling.
  // Without an explicit thinkingBudget, Gemini 2.5 Flash silently spends most of
  // maxOutputTokens on hidden reasoning and returns an empty answer — so we also
  // disable thinking for this deterministic naming task.
  const dynamicMaxTokens = Math.min(2048, Math.max(400, imageUrls.length * 40 + 200));

  const result = await callAI(
    [{ role: "user", content: contentParts }],
    { maxTokens: dynamicMaxTokens, temperature: 0.2, thinkingBudget: 0 }
  );

  const cleaned = result.replace(/```json|```/g, "").trim();

  // Primary: strict JSON array parse.
  try {
    const arr = JSON.parse(cleaned);
    if (Array.isArray(arr) && arr.length > 0) {
      return arr.slice(0, imageUrls.length).map((s) => String(s).trim()).filter(Boolean);
    }
  } catch {
    // fall through to fallback parsers
  }

  // Fallback 1: extract the first [...] block from the response.
  const bracketMatch = cleaned.match(/\[[\s\S]*?\]/);
  if (bracketMatch) {
    try {
      const arr = JSON.parse(bracketMatch[0]);
      if (Array.isArray(arr) && arr.length > 0) {
        return arr.slice(0, imageUrls.length).map((s) => String(s).trim()).filter(Boolean);
      }
    } catch {
      // continue
    }
  }

  // Fallback 2: take any quoted strings the model returned.
  const quoted = Array.from(cleaned.matchAll(/"([^"\n]{1,40})"/g)).map((m) => m[1].trim()).filter(Boolean);
  if (quoted.length > 0) {
    return quoted.slice(0, imageUrls.length);
  }

  console.warn("[generateVariantNames] Could not parse AI response:", cleaned.slice(0, 200));
  return [];
}

export interface FullProductContent {
  name: string;
  slug: string;
  category: string;
  shortDescription: string;
  longDescriptionHtml: string;
  features: string[];
  variantType: string;
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

function stripInlineMarkdown(s: string): string {
  return s
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, "$1")
    .replace(/__([^_]+)__/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    .replace(/^\s*#{1,6}\s+/g, "")
    .replace(/\*+/g, "")
    .replace(/_+/g, "")
    .trim();
}

function extractSection(text: string, label: string): string {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const patterns = [
    new RegExp(`\\*\\*${escaped}:?\\*\\*\\s*:?\\s*\\n?([\\s\\S]*?)(?=\\n\\s*\\*\\*[^*\\n]+:?\\*\\*|$)`, "i"),
    new RegExp(`(?:^|\\n)\\s*#{1,6}\\s*${escaped}:?\\s*\\n([\\s\\S]*?)(?=\\n\\s*#{1,6}\\s|\\n\\s*\\*\\*[^*\\n]+:?\\*\\*|$)`, "i"),
    new RegExp(`(?:^|\\n)${escaped}:\\s*([\\s\\S]*?)(?=\\n\\s*[A-Z][A-Za-z ]{2,40}:\\s|\\n\\s*\\*\\*[^*\\n]+:?\\*\\*|$)`, "i"),
  ];
  for (const re of patterns) {
    const m = text.match(re);
    if (m && m[1] && m[1].trim()) return m[1].trim();
  }
  return "";
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

MULTI-IMAGE & VARIANT DETECTION (CRITICAL):
- If multiple images clearly show the SAME product in different colors, sizes, or finishes, treat them as ONE product with VARIANTS — not as separate products.
- The product name describes the single item (e.g. "2-Piece Romper Maxi & Front-Open Shirt"). Do NOT include a color/variant in the product name itself.
- Identify the variant axis (Color, Size, Material, Pattern, Style, etc.) and write it on the "Variant Type" line.
- Available Variants MUST contain EXACTLY ONE entry per image, in the SAME ORDER as the images were provided. If 5 images are provided, output exactly 5 variant entries.
- For each image, output the SIMPLEST 1–2 word identifier of the dominant variant attribute visible (e.g. for color variants: "Pink", "Teal", "Maroon", "Black", "Purple"). NEVER combine two attributes into one entry like "White & Teal" — pick the single dominant color.
- Use plain everyday color/size names a Pakistani shopper would recognize. Avoid flowery terms.
- If only one image is provided, or images show genuinely different products, write "No variants specified".

INPUT-TEXT CLEANING (when seller pastes WhatsApp/Facebook style text):
- IGNORE and never reproduce: prices, currency mentions, "Price only Rs X", "Come First Get First", "JESA DEKHAGA WESA MELAGA", religious openers like ﷽ or "Bismillah", contact numbers, Whatsapp/IG handles, store-name slogans, and similar seller boilerplate.
- Silently NORMALIZE common Pakistani-English misspellings into proper English: "Shiffon" → "Chiffon", "Lenght" → "Length", "Artical" → "Article", "Romper" stays "Romper", "Gehra" → "Flare/Width", "plane/plain" pick the right one from context, etc.
- Convert Roman Urdu specs into clean English specs.
- Treat any measurements (Chest, Length, Flare, Fabric, etc.) as ground-truth facts to use verbatim in Product Details.

Generate exactly these sections in this order:

1. Product Name — Clear and compelling, SEO-friendly with natural keywords, conversion-focused (max 5–6 words).
2. Slug — Short, readable, keyword-based for URL optimization (lowercase, hyphenated).
3. Short Description — Concise and sales-focused, 15–25 words max, hook-driven opening.
4. Long Description — Persuasive and structured, 70–150 words max. Must include a "Product Details" subsection heading. Combine emotional appeal with practical benefits. Sound premium, clear, trustworthy.
5. Key Features — 3 to 5 features. Each 4–6 words max. Benefit-oriented and punchy. Bold the most important words.
6. Category — Pick the SINGLE BEST matching category for this product from the "Available Categories" list given in CONTEXT. Write the category name EXACTLY as it appears in that list (case and punctuation must match). If the list is missing or no match fits, write "Uncategorized".
7. Variant Type — A single word/short label naming the variant axis (e.g. "Color", "Size", "Material"). Write "None" if no variants.
8. Available Variants — 1 to 3 words per variant. Only include actual or clearly supported variants visible in images. If none, write: "No variants specified".

STRICT RULES:
- Do NOT mention price, cost, profit, margin, discount, or currency anywhere in output.
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

**Category:**
[exact category name from Available Categories list, or "Uncategorized"]

**Variant Type:**
[Color | Size | Material | Pattern | Style | None]

**Available Variants:**
- [Variant 1 - 1–3 words]
- [Variant 2 - 1–3 words]

All variation names must be very simple.`;

export async function generateFullProductContent(
  productImageUrls: string[],
  hints: {
    nameHint?: string;
    currentCategory?: string;
    availableCategories?: string[];
    variantTypes?: string[];
    variantOptionImages?: string[];
    extraDetails?: string;
  } = {}
): Promise<FullProductContent | null> {
  const contextLines: string[] = [];
  if (hints.nameHint) contextLines.push(`Product name hint from seller: "${hints.nameHint}"`);
  if (hints.currentCategory) {
    contextLines.push(`Currently selected category in form: ${hints.currentCategory} (you may keep or change it).`);
  }
  if (hints.availableCategories && hints.availableCategories.length > 0) {
    contextLines.push(
      `Available Categories (PICK EXACTLY ONE for the Category section, write the name verbatim):\n${hints.availableCategories.map((c) => `- ${c}`).join("\n")}`
    );
  }
  if (hints.variantTypes && hints.variantTypes.length > 0) {
    contextLines.push(`Existing variant types in form: ${hints.variantTypes.join(", ")}`);
  }
  if (hints.extraDetails && hints.extraDetails.trim()) {
    contextLines.push(
      `Additional product details provided by the seller (TREAT AS GROUND TRUTH — use these specs verbatim where applicable, especially in the Product Details subsection. Do not contradict them):\n${hints.extraDetails.trim()}`
    );
  }
  contextLines.push(`Store: PakCart (Pakistani e-commerce). Audience: Pakistani shoppers.`);

  const variantImgs = (hints.variantOptionImages || []).filter(Boolean);
  const variantNote =
    variantImgs.length > 0
      ? `\n\nIMPORTANT VARIANT IMAGES: After the ${productImageUrls.length} product image(s), there are ${variantImgs.length} additional VARIANT OPTION image(s). Each variant image represents ONE option (typically a color swatch or alternate-color photo) in the order shown. For the "Available Variants" section you MUST output EXACTLY ${variantImgs.length} entries, one per variant image, in the SAME ORDER. Use simple 1–2 word names that describe the dominant color/attribute of EACH variant image individually. Do not repeat or skip variant images.`
      : "";

  const userText = `${FULL_CONTENT_PROMPT}\n\n--- CONTEXT ---\n${contextLines.join("\n")}\n\n--- IMAGES ---\n${productImageUrls.length} main product image(s) attached below for analysis.${variantNote}`;

  const content: AIContentPart[] = [
    { type: "text", text: userText },
    ...productImageUrls.map((url) => ({ type: "image_url" as const, image_url: url })),
    ...(variantImgs.length > 0
      ? [
          { type: "text" as const, text: `\n\n--- VARIANT OPTION IMAGES (${variantImgs.length}, in option order) ---` },
          ...variantImgs.map((url) => ({ type: "image_url" as const, image_url: url })),
        ]
      : []),
  ];

  const result = await callAI(
    [{ role: "user", content }],
    { maxTokens: 4000, temperature: 0.4, thinkingBudget: 0 }
  );

  if (!result || !result.trim()) return null;

  const cleaned = result.replace(/```(?:markdown|md)?|```/g, "").trim();

  const name = stripInlineMarkdown(
    extractSection(cleaned, "Product Name").replace(/^["']|["']$/g, "").replace(/^["']|["']$/g, "").trim()
  );
  let slug = stripInlineMarkdown(extractSection(cleaned, "Slug"))
    .replace(/^["']|["']$/g, "")
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const shortDescription = stripInlineMarkdown(extractSection(cleaned, "Short Description"))
    .replace(/^["']|["']$/g, "")
    .trim();

  const longRaw = extractSection(cleaned, "Long Description");
  const detailsRaw = extractSection(cleaned, "Product Details");
  const combinedLong = [
    longRaw,
    detailsRaw ? `**Product Details:**\n\n${detailsRaw}` : "",
  ]
    .filter(Boolean)
    .join("\n\n");
  const longDescriptionHtml = combinedLong ? markdownToHtml(combinedLong) : "";

  const features = parseListItems(extractSection(cleaned, "Key Features"));
  const categoryRaw = extractSection(cleaned, "Category")
    .replace(/^[-*]\s*/g, "")
    .replace(/\*\*/g, "")
    .replace(/^["']|["']$/g, "")
    .trim();
  const category = /^uncategorized$/i.test(categoryRaw) ? "" : categoryRaw;
  const variantTypeRaw = extractSection(cleaned, "Variant Type")
    .replace(/^[-*]\s*/g, "")
    .replace(/\*\*/g, "")
    .trim();
  const variantType = /^none$/i.test(variantTypeRaw) ? "" : variantTypeRaw;
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
    category,
    shortDescription,
    longDescriptionHtml,
    features,
    variantType,
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
