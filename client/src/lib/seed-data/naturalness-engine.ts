/**
 * Naturalness engine — applies realistic imperfections to seeded review text.
 *
 * Simulates the subtle quirks of real user-written reviews:
 * missing punctuation, occasional typos, Pakistani English patterns,
 * and informal sentence structures.
 */

// ---------------------------------------------------------------------------
// Common typos (correct → misspelled)
// ---------------------------------------------------------------------------

const COMMON_TYPOS: [string, string][] = [
  ["received", "recieved"],
  ["definitely", "definately"],
  ["recommend", "reccomend"],
  ["separate", "seperate"],
  ["beautiful", "beautifull"],
  ["packaging", "packagning"],
  ["quality", "quailty"],
  ["occasion", "occassion"],
  ["comfortable", "confortable"],
  ["disappointed", "dissapointed"],
];

// ---------------------------------------------------------------------------
// Informal Pakistani English additions (appended to review)
// ---------------------------------------------------------------------------

const PAKISTANI_ENGLISH_PHRASES = [
  "Will order again inshallah!",
  "Product is v good.",
  "Delivery was on time, no issues.",
  "Mashallah quality is really good.",
  "V fast delivery. Happy with purchase.",
  "No issues at all. Good product.",
  "Highly recommend to all.",
  "Will definitely buy again.",
  "5 stars from my side.",
  "Very happy with purchase.",
];

const PAKISTANI_URDU_MIX = [
  "Bhai sab theek hai. Recommend karta hun.",
  "Sach mein bahut acha product hai.",
  "Bohat acha laga. Highly recommended.",
];

// ---------------------------------------------------------------------------
// Roman Urdu trailing phrases — used when language === "ur"
// ---------------------------------------------------------------------------

const ROMAN_URDU_PHRASES = [
  "InshaAllah phir order karunga.",
  "MashaAllah quality bohat achi hai.",
  "Bhai sab theek hai, recommend karta hun.",
  "Iss product mein koi issue nahi.",
  "Sab dosto ko recommend kiya hai.",
  "5 stars meri taraf se.",
  "Bohat khush hun apni purchase se.",
  "Delivery time pe thi, koi shikayat nahi.",
  "Bohat acha laga, highly recommended.",
  "Pakka phir order karunga.",
];

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Applies randomised naturalness imperfections to a review string.
 *
 * Each imperfection fires independently at its own probability:
 * - 10% → missing trailing period
 * - 5%  → stray double space
 * - 8%  → "..." replacing first mid-sentence period
 * - 5%  → one content word in ALL CAPS for emphasis
 * - 3%  → common spelling typo (English mode only)
 * - 15% → informal trailing phrase appended
 *
 * @param lang - "en" (default) or "ur". In Urdu mode the trailing phrase
 *               and the typo-pool are language-appropriate.
 */
export function applyNaturalness(text: string, lang: "en" | "ur" = "en"): string {
  let result = text;

  // 10% — missing trailing period
  if (Math.random() < 0.10 && result.endsWith(".")) {
    result = result.slice(0, -1);
  }

  // 5% — stray double space
  if (Math.random() < 0.05) {
    const idx = Math.floor(result.length * 0.3 + Math.random() * result.length * 0.5);
    result = result.slice(0, idx) + " " + result.slice(idx);
  }

  // 8% — "..." replacing first mid-sentence period
  if (Math.random() < 0.08) {
    result = result.replace(/\. (?=[A-Z])/, "... ");
  }

  // 5% — ALL CAPS content word for emphasis (works for both languages)
  if (Math.random() < 0.05) {
    const words = result.split(" ");
    const eligible = words
      .map((w, i) => ({ w, i }))
      .filter(({ w }) => /^[a-zA-Z]{4,}$/.test(w));
    if (eligible.length > 0) {
      const { w, i } = pick(eligible);
      words[i] = w.toUpperCase();
      result = words.join(" ");
    }
  }

  // 3% — common spelling typo (English-only — Urdu reviews already have
  // natural transliteration variation built into the templates)
  if (lang === "en" && Math.random() < 0.03) {
    for (const [correct, typo] of COMMON_TYPOS) {
      const re = new RegExp(`\\b${correct}\\b`, "i");
      if (re.test(result)) {
        result = result.replace(re, typo);
        break;
      }
    }
  }

  // 15% — informal trailing phrase appended
  if (Math.random() < 0.15) {
    let pool: string[];
    if (lang === "ur") {
      pool = ROMAN_URDU_PHRASES;
    } else {
      const useUrduMix = Math.random() < 0.33; // ~5% overall
      pool = useUrduMix ? PAKISTANI_URDU_MIX : PAKISTANI_ENGLISH_PHRASES;
    }
    result = result.trimEnd() + " " + pick(pool);
  }

  return result;
}
