/**
 * Vercel serverless handler: same contract as vite-plugin-gemini-proxy (POST /api/gemini).
 * Set GOOGLE_API_KEY in Vercel → Project → Settings → Environment Variables (server-only).
 */
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(204).end();
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: { message: "Method Not Allowed" } });
    return;
  }

  const apiKey = process.env.GOOGLE_API_KEY || process.env.VITE_GOOGLE_API_KEY;
  if (!apiKey) {
    res.status(500).json({
      error: {
        message:
          "Missing GOOGLE_API_KEY on the server. In Vercel: Project Settings → Environment Variables → add GOOGLE_API_KEY (do not expose this in VITE_*).",
      },
    });
    return;
  }

  try {
    const body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
    const { model, requestBody } = body as { model?: string; requestBody?: unknown };
    if (!model || !requestBody) {
      res.status(400).json({ error: { message: "Invalid body: need model and requestBody" } });
      return;
    }

    const upstream = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    const r = await fetch(upstream, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(requestBody),
    });
    const text = await r.text();
    res.status(r.status);
    res.setHeader("Content-Type", "application/json");
    res.send(text);
  } catch (e) {
    res.status(500).json({ error: { message: e instanceof Error ? e.message : String(e) } });
  }
}
