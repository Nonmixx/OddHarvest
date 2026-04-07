import type { Connect } from "vite";
import type { Plugin } from "vite";
import type { ServerResponse } from "node:http";

/**
 * Proxies POST /api/gemini → Google Generative Language API with the key from env (never sent to the browser bundle).
 * Uses GOOGLE_API_KEY, or falls back to VITE_GOOGLE_API_KEY from .env for local demo convenience.
 */
export function geminiProxyPlugin(apiKey: string | undefined): Plugin {
  const handler = (req: Connect.IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
    const url = req.url ?? "";
    if (!url.startsWith("/api/gemini")) {
      next();
      return;
    }

    if (req.method === "OPTIONS") {
      res.statusCode = 204;
      res.setHeader("Access-Control-Allow-Origin", "*");
      res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
      res.end();
      return;
    }

    if (req.method !== "POST") {
      res.statusCode = 405;
      res.end("Method Not Allowed");
      return;
    }

    if (!apiKey) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(
        JSON.stringify({
          error: {
            message:
              "Missing GOOGLE_API_KEY in .env (used only by the dev/preview server — not bundled). Add: GOOGLE_API_KEY=your_key",
          },
        }),
      );
      return;
    }

    const chunks: Buffer[] = [];
    req.on("data", (c: Buffer) => chunks.push(c));
    req.on("end", async () => {
      try {
        const raw = Buffer.concat(chunks).toString("utf8");
        const { model, requestBody } = JSON.parse(raw) as {
          model?: string;
          requestBody?: unknown;
        };
        if (!model || !requestBody) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: { message: "Invalid body: need model and requestBody" } }));
          return;
        }

        const upstream = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
        const r = await fetch(upstream, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestBody),
        });
        const text = await r.text();
        res.statusCode = r.status;
        res.setHeader("Content-Type", "application/json");
        res.end(text);
      } catch (e) {
        res.statusCode = 500;
        res.setHeader("Content-Type", "application/json");
        res.end(JSON.stringify({ error: { message: e instanceof Error ? e.message : String(e) } }));
      }
    });
  };

  return {
    name: "gemini-proxy",
    configureServer(server) {
      server.middlewares.use(handler as Connect.HandleFunction);
    },
    configurePreviewServer(server) {
      server.middlewares.use(handler as Connect.HandleFunction);
    },
  };
}
