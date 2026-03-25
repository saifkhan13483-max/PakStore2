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

      const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model,
          messages: parsed.messages,
          max_tokens: parsed.maxTokens ?? defaults.max_tokens,
          temperature: parsed.temperature ?? defaults.temperature,
        }),
      });

      const data = await geminiRes.json();
      res.writeHead(geminiRes.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
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
        geminiProxy(req, res, "gemini-2.0-flash", { max_tokens: 512, temperature: 0.7 });
      });

      server.middlewares.use("/api/chat", (req: any, res: any) => {
        if (req.method !== "POST") { res.writeHead(405); res.end("Method Not Allowed"); return; }
        geminiProxy(req, res, "gemini-2.0-flash", { max_tokens: 512, temperature: 0.7 });
      });

      server.middlewares.use("/api/groq-proxy", (req: any, res: any) => {
        if (req.method !== "POST") { res.writeHead(405); res.end("Method Not Allowed"); return; }
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
            const geminiRes = await fetch("https://generativelanguage.googleapis.com/v1beta/openai/chat/completions", {
              method: "POST",
              headers: {
                "Authorization": `Bearer ${apiKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                model: parsed.model ?? "gemini-2.0-flash",
                messages: parsed.messages,
                max_tokens: parsed.max_tokens ?? 1024,
                temperature: parsed.temperature ?? 0.7,
              }),
            });
            const data = await geminiRes.json();
            res.writeHead(geminiRes.status, { "Content-Type": "application/json" });
            res.end(JSON.stringify(data));
          } catch (err: any) {
            res.writeHead(500, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: err.message }));
          }
        });
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
        manualChunks: {
          "vendor-react": ["react", "react-dom", "wouter"],
          "vendor-query": ["@tanstack/react-query"],
          "vendor-ui": ["lucide-react", "clsx", "tailwind-merge"],
          "vendor-firebase": ["firebase/app", "firebase/auth", "firebase/firestore"],
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
