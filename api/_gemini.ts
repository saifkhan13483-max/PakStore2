/**
 * Shared Gemini call helper for Vercel serverless functions.
 *
 * Files starting with `_` are NOT deployed as endpoints by Vercel — they can
 * only be imported from sibling api/* files. This module centralises the
 * multi-key + multi-model fallback logic so both /api/ai (admin generation)
 * and /api/chat (PakBot widget) get the same resilience.
 *
 * Why fallback matters here: from regions where Gemini API access is gated
 * (e.g. Pakistan), individual API keys frequently return 401/403/429 even
 * when they work fine elsewhere. Cycling through GEMINI_API_KEY,
 * GEMINI_API_KEY_B, …, _F and across the 2.5-flash → 2.5-flash-lite →
 * 2.0-flash chain dramatically improves the success rate.
 */

export function getGeminiApiKeys(): string[] {
  const keys: string[] = [];
  const primary = process.env.GEMINI_API_KEY;
  if (primary) keys.push(primary);
  for (const suffix of ["B", "C", "D", "E", "F"]) {
    const k = process.env[`GEMINI_API_KEY_${suffix}`];
    if (k) keys.push(k);
  }
  return keys;
}

export const MODEL_FALLBACK_CHAIN = [
  "gemini-2.5-flash",
  "gemini-2.5-flash-lite",
  "gemini-2.0-flash",
];

export function buildModelChain(primary: string): string[] {
  const chain = [primary, ...MODEL_FALLBACK_CHAIN.filter((m) => m !== primary)];
  return Array.from(new Set(chain));
}

export function extractGeminiText(data: any): string {
  return data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

export function isEmptyFinish(data: any): { empty: boolean; finishReason: string } {
  const text = extractGeminiText(data);
  const finishReason = data?.candidates?.[0]?.finishReason ?? "UNKNOWN";
  return { empty: !text || !text.trim(), finishReason };
}

export function extractRetryAfter(data: any): number | undefined {
  const detailsArr = data?.error?.details;
  if (!Array.isArray(detailsArr)) return undefined;
  const retryInfo = detailsArr.find((d: any) => typeof d?.retryDelay === "string");
  if (!retryInfo) return undefined;
  const m = String(retryInfo.retryDelay).match(/(\d+(?:\.\d+)?)/);
  return m ? Math.ceil(parseFloat(m[1])) : undefined;
}

export interface GeminiCallResult {
  status: number;
  data: any;
  keyIndex: number;
  modelUsed: string | null;
  emptyReason: string | null;
}

/**
 * Try `requestBody` against every (model × key) combination until one returns
 * a non-empty 2xx response. A "recoverable" failure (rate-limit, perm-denied,
 * transient server error, or empty-but-OK) advances to the next key/model.
 * A non-recoverable failure (e.g. 400 Bad Request — same body will fail
 * everywhere) aborts immediately.
 */
export async function callGeminiWithFallback(
  requestBody: any,
  primaryModel: string,
  keys: string[],
  logTag = "AI"
): Promise<GeminiCallResult> {
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
              console.log(`[${logTag}] succeeded on "${model}" key #${i + 1} (after ${mi} model fallback(s))`);
            }
            return { status: geminiRes.status, data, keyIndex: i, modelUsed: model, emptyReason: null };
          }
          lastEmptyReason = finishReason;
          console.warn(`[${logTag}] ${model} key #${i + 1} returned empty text (finishReason=${finishReason}). Falling through.`);
          continue;
        }

        const status = geminiRes.status;
        const reason = data?.error?.status ?? "";
        const isRateLimit = status === 429 || status === 503;
        const isAuthOrPermDenied = status === 401 || status === 403;
        const isTransientServer = status === 500 || status === 502 || status === 504;
        const isRecoverable = isRateLimit || isAuthOrPermDenied || isTransientServer;
        console.warn(
          `[${logTag}] ${model} key #${i + 1} failed (${status} ${reason}${isRateLimit ? " rate-limited" : isAuthOrPermDenied ? " perm-denied" : ""}):`,
          data.error?.message ?? "unknown"
        );

        if (!isRecoverable) {
          allRecoverable = false;
          break;
        }
      } catch (err: any) {
        console.warn(`[${logTag}] ${model} key #${i + 1} threw:`, err?.message);
        lastData = { error: err?.message };
        allRecoverable = false;
        break;
      }
    }

    if (!allRecoverable) break;
  }

  return { status: lastStatus, data: lastData, keyIndex: -1, modelUsed: null, emptyReason: lastEmptyReason };
}
