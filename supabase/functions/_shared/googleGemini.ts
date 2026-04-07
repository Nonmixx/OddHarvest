/** Google Gemini (Generative Language API) — shared by Edge Functions. Requires GOOGLE_API_KEY secret. */

/** Prefer a current model; override with GOOGLE_GEMINI_MODEL secret if needed. */
const DEFAULT_MODEL = "gemini-2.5-flash";

export type GeminiResult =
  | { ok: true; text: string }
  | { ok: false; status: number; body: string; userMessage?: string };

function parseGoogleErrorBody(body: string): string {
  try {
    const j = JSON.parse(body) as { error?: { message?: string; status?: string } };
    return j?.error?.message || body;
  } catch {
    return body;
  }
}

export async function geminiGenerateText(params: {
  apiKey: string;
  systemInstruction: string;
  userContent: string;
  temperature?: number;
  /** Ask Gemini to return JSON only (helps meal/preservation parsing). */
  jsonMode?: boolean;
}): Promise<GeminiResult> {
  const model = Deno.env.get("GOOGLE_GEMINI_MODEL") ?? DEFAULT_MODEL;
  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${params.apiKey}`;

  const generationConfig: Record<string, unknown> = {
    temperature: params.temperature ?? 0.4,
  };
  if (params.jsonMode) {
    generationConfig.responseMimeType = "application/json";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: params.systemInstruction }] },
      contents: [
        {
          role: "user",
          parts: [{ text: params.userContent }],
        },
      ],
      generationConfig,
    }),
  });

  const rawText = await res.text();

  if (!res.ok) {
    const msg = parseGoogleErrorBody(rawText);
    return {
      ok: false,
      status: res.status,
      body: rawText,
      userMessage:
        res.status === 400 || res.status === 404
          ? `Gemini API error (${res.status}). Check GOOGLE_GEMINI_MODEL and that Generative Language API is enabled. ${msg}`
          : res.status === 403 || res.status === 401
            ? "Invalid or restricted Google API key. Check API key restrictions and billing."
            : `Gemini API error: ${msg}`,
    };
  }

  let data: {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  try {
    data = JSON.parse(rawText);
  } catch {
    return { ok: false, status: 500, body: rawText, userMessage: "Invalid JSON from Gemini" };
  }

  const blockReason = data?.promptFeedback?.blockReason;
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

  if (!text && (blockReason || !data?.candidates?.length)) {
    return {
      ok: false,
      status: 400,
      body: rawText,
      userMessage: blockReason
        ? `Response blocked (${blockReason}). Try different wording.`
        : "Empty response from Gemini. Try again or change GOOGLE_GEMINI_MODEL.",
    };
  }

  return { ok: true, text: typeof text === "string" ? text : "" };
}
