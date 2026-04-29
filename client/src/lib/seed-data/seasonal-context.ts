/**
 * Seasonal context — injects occasion/season awareness into seeded reviews.
 *
 * Reviews sometimes reference Eid, summer, winter, or gifting season
 * when the comment date and/or product category make it relevant.
 * Only ~25% of reviews receive a seasonal note so the pattern stays subtle.
 */

// ---------------------------------------------------------------------------
// Note pools
// ---------------------------------------------------------------------------

const EID_NOTES = [
  "Bought this for Eid — perfect timing!",
  "Ordered ahead of Eid and very pleased with the quality.",
  "Great Eid gift for the family. Everyone loved it.",
  "Got this for Eid celebrations — could not be happier.",
];

const SUMMER_NOTES: Record<string, string[]> = {
  clothing: [
    "Perfect for summer — stays cool and comfortable even in the heat.",
    "Great fabric for the summer season.",
    "Breathable and light — ideal for Pakistani summers.",
  ],
  slippers: [
    "Ideal summer slippers — airy and comfortable.",
    "Great for summer use indoors and outdoors.",
    "Perfect for the heat — very comfortable on the feet.",
  ],
  bedsheets: [
    "Cool and comfortable for summer nights.",
    "Stays cool in the summer heat — very happy.",
  ],
  general: ["Great summer purchase!", "Perfect for summer.", "Ideal for the warm season."],
};

const WINTER_NOTES: Record<string, string[]> = {
  bedsheets: [
    "Very warm and cosy for winter nights.",
    "Perfect choice for the winter season.",
    "Keeps us warm — great winter buy.",
  ],
  clothing: [
    "Keeping me warm this winter — very happy with the purchase.",
    "Excellent fabric quality for winter.",
    "Cosy and warm — ideal for winter.",
  ],
  general: ["Great for winter.", "Cosy winter purchase!", "Warm and comfortable — winter approved."],
};

const GIFTING_NOTES = [
  "Great for the gifting season!",
  "Bought as a year-end gift — everyone loved it.",
  "Perfect gift at this time of year. Will order more.",
  "Excellent gift option during the holiday season.",
];

// ---------------------------------------------------------------------------
// Roman Urdu seasonal pools (mirror English pools above)
// ---------------------------------------------------------------------------

const EID_NOTES_UR = [
  "Eid ke liye liya tha — perfect timing!",
  "Eid se pehle order kiya, quality se bohat khush hun.",
  "Ghar walon ke liye Eid gift, sab ko bohat pasand aaya.",
  "Eid celebrations ke liye liya — itni khushi mili.",
];

const SUMMER_NOTES_UR: Record<string, string[]> = {
  clothing: [
    "Garmi mein bhi cool aur comfortable rehta hai — summer ke liye perfect.",
    "Garmi ke season ke liye fabric ekdum sahi hai.",
    "Breathable aur light — Pakistani garmi ke liye ideal.",
  ],
  slippers: [
    "Garmi ke liye ideal slippers — airy aur comfortable.",
    "Indoor outdoor dono mein garmi ke andar ache lagte hain.",
    "Garmi mein perfect — pairon pe bohat comfortable.",
  ],
  bedsheets: [
    "Garmi ki raato mein cool aur comfortable.",
    "Garmi ki sakhti mein bhi cool rehti hai — bohat khush hun.",
  ],
  general: ["Bohat acha summer purchase!", "Garmi ke liye perfect.", "Garam mausam ke liye ideal."],
};

const WINTER_NOTES_UR: Record<string, string[]> = {
  bedsheets: [
    "Sardiyo ki raato ke liye bohat warm aur cosy.",
    "Winter season ke liye perfect choice.",
    "Garam rakhti hai — sahi winter buy.",
  ],
  clothing: [
    "Iss sardi mein garam rakh raha hai — bohat khush hun purchase se.",
    "Sardi ke liye fabric quality excellent.",
    "Cosy aur garam — winter ke liye ideal.",
  ],
  general: ["Sardi ke liye bohat acha.", "Cosy winter purchase!", "Garam aur comfortable — winter approved."],
};

const GIFTING_NOTES_UR = [
  "Gifting season ke liye bohat acha!",
  "Saal ke aakhir ka gift, sab ko pasand aaya.",
  "Iss waqt ka perfect gift. Aur order karunga.",
  "Holiday season ke liye excellent gift option.",
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function isEidSeason(date: Date): boolean {
  const m = date.getMonth() + 1;
  const d = date.getDate();
  // Approximate: late March/April/May (Eid ul Fitr), mid-June (Eid ul Adha)
  return (m === 3 && d >= 20) || m === 4 || m === 5 || (m === 6 && d <= 20);
}

function isSummer(date: Date): boolean {
  const m = date.getMonth() + 1;
  return m >= 5 && m <= 8;
}

function isWinter(date: Date): boolean {
  const m = date.getMonth() + 1;
  return m === 12 || m <= 2;
}

function isYearEnd(date: Date): boolean {
  const m = date.getMonth() + 1;
  return m >= 11;
}

// ---------------------------------------------------------------------------
// Main export
// ---------------------------------------------------------------------------

/**
 * Returns a short seasonal/occasion note to append to a review, or null.
 * Only ~25% of reviews receive a note to keep the pattern realistic.
 *
 * @param date     - The review's timestamp (determines current season/occasion)
 * @param category - Detected product category (for category-specific notes)
 * @param lang     - "en" (default) or "ur" — picks language-appropriate notes.
 */
export function getSeasonalNote(
  date: Date,
  category: string,
  lang: "en" | "ur" = "en"
): string | null {
  // Only 25% of reviews mention any seasonal context
  if (Math.random() > 0.25) return null;

  const eidPool = lang === "ur" ? EID_NOTES_UR : EID_NOTES;
  const summerPool = lang === "ur" ? SUMMER_NOTES_UR : SUMMER_NOTES;
  const winterPool = lang === "ur" ? WINTER_NOTES_UR : WINTER_NOTES;
  const giftingPool = lang === "ur" ? GIFTING_NOTES_UR : GIFTING_NOTES;

  if (isEidSeason(date) && Math.random() < 0.55) {
    return pick(eidPool);
  }

  if (isSummer(date) && Math.random() < 0.45) {
    const pool = summerPool[category] ?? summerPool["general"];
    return pick(pool);
  }

  if (isWinter(date) && Math.random() < 0.45) {
    const pool = winterPool[category] ?? winterPool["general"];
    return pick(pool);
  }

  if (isYearEnd(date) && Math.random() < 0.35) {
    return pick(giftingPool);
  }

  return null;
}
