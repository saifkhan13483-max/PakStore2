import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

async function geminiProxy(req: any, res: any, model: string, defaults: { max_tokens: number; temperature: number }) {
  let body = "";
  req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
  req.on("end", async () => {
    try {
      const parsed = JSON.parse(body);
      const apiKey = process.env.GEMINI_API_KEY;

      if (!apiKey) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "GEMINI_API_KEY not configured" }));
        return;
      }

      const messages: { role: string; content: string }[] = parsed.messages ?? [];

      const systemMsg = messages.find((m) => m.role === "system");
      const conversationMsgs = messages.filter((m) => m.role !== "system");

      const contents = conversationMsgs.map((m) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.content }],
      }));

      const requestBody: any = {
        contents,
        generationConfig: {
          maxOutputTokens: parsed.maxTokens ?? parsed.max_tokens ?? defaults.max_tokens,
          temperature: parsed.temperature ?? defaults.temperature,
        },
      };

      if (systemMsg) {
        requestBody.system_instruction = { parts: [{ text: systemMsg.content }] };
      }

      const geminiRes = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        }
      );

      const data = await geminiRes.json();

      if (!geminiRes.ok) {
        res.writeHead(geminiRes.status, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: data.error?.message ?? "Gemini API error" }));
        return;
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
      const openAiResponse = {
        choices: [{ message: { role: "assistant", content: text } }],
      };

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(openAiResponse));
    } catch (err: any) {
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
