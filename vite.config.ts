import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

/**
 * Convert a single message's content (string or array of parts) into
 * Gemini API parts. The browser pre-converts image_url → inline_data,
 * so the proxy only needs to handle text and inline_data.
 */
function buildGeminiParts(content: string | any[]): any[] {
  if (typeof content === "string") {
    return [{ text: content }];
  }
  const parts: any[] = [];
  for (const part of content) {
    if (part.type === "text") {
      parts.push({ text: part.text ?? "" });
    } else if (part.type === "inline_data" && part.data && part.mimeType) {
      // Browser already fetched & base64-encoded the image
      parts.push({ inline_data: { mime_type: part.mimeType, data: part.data } });
    } else if (part.type === "image_url" && typeof part.image_url === "string") {
      // Fallback: if somehow an image_url slips through, log it
      console.warn("[AI proxy] Received raw image_url — browser should have resolved it:", part.image_url.slice(0, 80));
      parts.push({ text: `[image: ${part.image_url}]` });
    }
  }
  return parts;
}

/** Collect all configured Gemini API keys in order: GEMINI_API_KEY, GEMINI_API_KEY_B, GEMINI_API_KEY_C, … */
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

async function callGeminiWithFallback(
  requestBody: any,
  model: string,
  keys: string[]
): Promise<{ status: number; data: any; keyIndex: number }> {
  let lastStatus = 500;
  let lastData: any = { error: "No API keys configured" };

  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    try {
      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
          signal: AbortSignal.timeout(120000),
        }
      );
      const data = await geminiRes.json();
      lastStatus = geminiRes.status;
      lastData = data;

      if (geminiRes.ok) {
        if (i > 0) console.log(`[AI proxy] Key #${i + 1} succeeded after ${i} failure(s)`);
        return { status: geminiRes.status, data, keyIndex: i };
      }

      const isRateLimit = geminiRes.status === 429 || geminiRes.status === 503;
      console.warn(`[AI proxy] Key #${i + 1} failed (${geminiRes.status}${isRateLimit ? " rate-limited" : ""}):`, data.error?.message ?? "unknown");

      if (!isRateLimit) break; // non-rate-limit errors won't be fixed by switching keys
    } catch (err: any) {
      console.warn(`[AI proxy] Key #${i + 1} threw:`, err.message);
      lastData = { error: err.message };
    }
  }

  return { status: lastStatus, data: lastData, keyIndex: -1 };
}

async function geminiProxy(req: any, res: any, model: string, defaults: { max_tokens: number; temperature: number }) {
  let body = "";
  req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
  req.on("end", async () => {
    try {
      const parsed = JSON.parse(body);
      const keys = getGeminiApiKeys();

      if (keys.length === 0) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "GEMINI_API_KEY not configured" }));
        return;
      }

      const messages: { role: string; content: string | any[] }[] = parsed.messages ?? [];
      const systemMsg = messages.find((m) => m.role === "system");
      const conversationMsgs = messages.filter((m) => m.role !== "system");

      const imageCount = conversationMsgs.reduce((acc, m) => {
        if (Array.isArray(m.content)) {
          return acc + m.content.filter((p: any) => p.type === "inline_data").length;
        }
        return acc;
      }, 0);
      console.log(`[AI proxy] ${model} | maxTokens=${parsed.maxTokens ?? defaults.max_tokens} | images=${imageCount} | keys=${keys.length}`);

      const contents = conversationMsgs.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: buildGeminiParts(m.content),
      }));

      const requestBody: any = {
        contents,
        generationConfig: {
          maxOutputTokens: parsed.maxTokens ?? parsed.max_tokens ?? defaults.max_tokens,
          temperature: parsed.temperature ?? defaults.temperature,
          ...(typeof parsed.thinkingBudget === "number"
            ? { thinkingConfig: { thinkingBudget: parsed.thinkingBudget } }
            : {}),
        },
      };

      if (systemMsg) {
        requestBody.system_instruction = { parts: [{ text: systemMsg.content }] };
      }

      const { status, data, keyIndex } = await callGeminiWithFallback(requestBody, model, keys);

      if (keyIndex === -1) {
        console.error(`[AI proxy] All ${keys.length} key(s) exhausted. Last status: ${status}`);
        res.writeHead(status, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: data.error?.message ?? "Gemini API error" }));
        return;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      if (!text) {
        const reason = data.candidates?.[0]?.finishReason ?? "unknown";
        console.error(`[AI proxy] Gemini returned no text. finishReason=${reason}`);
      } else {
        console.log(`[AI proxy] OK — response length=${text.length} chars`);
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ choices: [{ message: { role: "assistant", content: text } }] }));
    } catch (err: any) {
      console.error("[AI proxy] Unhandled error:", err.message);
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

function geminiApiPlugin() {
  return {
    name: "gemini-api-middleware",
    configureServer(server: any) {
      server.middlewares.use("/api/ai", (req: any, res: any) => {
        if (req.method !== "POST") { res.writeHead(405); res.end("Method Not Allowed"); return; }
        geminiProxy(req, res, "gemini-2.5-flash", { max_tokens: 512, temperature: 0.7 });
      });

      server.middlewares.use("/api/chat", (req: any, res: any) => {
        if (req.method !== "POST") { res.writeHead(405); res.end("Method Not Allowed"); return; }
        geminiProxy(req, res, "gemini-2.5-flash", { max_tokens: 2048, temperature: 0.7 });
      });

      server.middlewares.use("/api/groq-proxy", (req: any, res: any) => {
        if (req.method !== "POST") { res.writeHead(405); res.end("Method Not Allowed"); return; }
        geminiProxy(req, res, "gemini-2.5-flash", { max_tokens: 2048, temperature: 0.7 });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    geminiApiPlugin(),
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
          await import("@replit/vite-plugin-dev-banner").then((m) =>
            m.devBanner(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  base: "/",
  build: {
    outDir: "../dist",
    emptyOutDir: true,
    chunkSizeWarningLimit: 1000,
    reportCompressedSize: false,
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("node_modules")) {
            if (id.includes("/react/") || id.includes("/react-dom/") || id.includes("/scheduler/") || id.includes("/wouter/"))
              return "vendor-react";
            if (id.includes("@tanstack/react-query")) return "vendor-query";
            if (id.includes("framer-motion")) return "vendor-motion";
            if (id.includes("react-helmet-async")) return "vendor-helmet";
            if (id.includes("@radix-ui/")) return "vendor-radix";
            if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
            if (id.includes("@tiptap") || id.includes("prosemirror")) return "vendor-tiptap";
            if (id.includes("embla-carousel")) return "vendor-embla";
            if (id.includes("@dnd-kit")) return "vendor-dnd";
            if (id.includes("firebase/firestore") || id.includes("firebase-admin")) return "vendor-firestore";
            if (id.includes("firebase/auth")) return "vendor-firebase-auth";
            if (id.includes("firebase/")) return "vendor-firebase";
            if (id.includes("lucide-react") || id.includes("clsx") || id.includes("tailwind-merge") || id.includes("class-variance-authority"))
              return "vendor-ui";
            if (id.includes("zod") || id.includes("@hookform") || id.includes("react-hook-form")) return "vendor-forms";
            if (id.includes("date-fns")) return "vendor-date";
          }
          return undefined;
        },
      },
    },
  },
  server: {
    port: 5000,
    host: true,
    allowedHosts: true,
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
  },
  define: {
    "process.env": {},
  },
});
