import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

async function groqProxy(req: any, res: any, model: string, defaults: { max_tokens: number; temperature: number }) {
  let body = "";
  req.on("data", (chunk: Buffer) => { body += chunk.toString(); });
  req.on("end", async () => {
    try {
      const parsed = JSON.parse(body);
      const apiKey = process.env.GROQ_API_KEY;

      if (!apiKey) {
        res.writeHead(500, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "GROQ_API_KEY not configured" }));
        return;
      }

      const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
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

      const data = await groqRes.json();
      res.writeHead(groqRes.status, { "Content-Type": "application/json" });
      res.end(JSON.stringify(data));
    } catch (err: any) {
      res.writeHead(500, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: err.message }));
    }
  });
}

function groqApiPlugin() {
  return {
    name: "groq-api-middleware",
    configureServer(server: any) {
      server.middlewares.use("/api/ai", (req: any, res: any) => {
        if (req.method !== "POST") { res.writeHead(405); res.end("Method Not Allowed"); return; }
        groqProxy(req, res, "llama-3.3-70b-versatile", { max_tokens: 512, temperature: 0.7 });
      });

      server.middlewares.use("/api/chat", (req: any, res: any) => {
        if (req.method !== "POST") { res.writeHead(405); res.end("Method Not Allowed"); return; }
        groqProxy(req, res, "llama-3.1-8b-instant", { max_tokens: 512, temperature: 0.7 });
      });
    },
  };
}

export default defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    groqApiPlugin(),
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
