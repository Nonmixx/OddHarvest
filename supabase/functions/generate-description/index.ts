import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { geminiGenerateText } from "../_shared/googleGemini.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function json200(body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    let payload: Record<string, unknown>;
    try {
      payload = await req.json();
    } catch {
      return json200({ error: "Invalid JSON body.", description: "" });
    }
    const { name, imperfectReason, harvestDate, bundleContents, isBundle, language } = payload as {
      name?: string;
      imperfectReason?: string;
      harvestDate?: string;
      bundleContents?: string;
      isBundle?: boolean;
      language?: string;
    };
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      return json200({
        error:
          "GOOGLE_API_KEY is not set. In Supabase: Project Settings → Edge Functions → Secrets, add GOOGLE_API_KEY, then redeploy this function.",
        description: "",
      });
    }

    const langLabel = language === "zh" ? "Chinese" : language === "ms" ? "Malay" : "English";

    let userContent: string;
    if (isBundle) {
      userContent =
        `Write a short, friendly product description (1-2 sentences) in ${langLabel} for a rescue veggie bundle called "${name}" containing: ${bundleContents || "mixed vegetables"}. Emphasize freshness, value, and reducing food waste. Only return the description text, nothing else.`;
    } else {
      const reasonMap: Record<string, string> = {
        irregular_shape: "irregular shape",
        too_small: "smaller than usual size",
        too_large: "larger than usual size",
        cosmetic_blemish: "minor cosmetic blemish",
        slight_discoloration: "slight discoloration",
      };
      const reasonText = reasonMap[imperfectReason] || "cosmetic imperfection";
      const harvestInfo = harvestDate ? ` Harvested on ${harvestDate}.` : "";
      userContent =
        `Write a short, friendly product description (1-2 sentences) in ${langLabel} for imperfect "${name}" that has ${reasonText}.${harvestInfo} Emphasize that despite the imperfection, the produce is fresh, nutritious, and perfect for cooking. Only return the description text, nothing else.`;
    }

    const systemInstruction =
      "You are a produce marketing copywriter. Write concise, appealing product descriptions.";

    const result = await geminiGenerateText({
      apiKey: GOOGLE_API_KEY,
      systemInstruction,
      userContent,
      temperature: 0.5,
    });

    if (!result.ok) {
      const msg =
        result.status === 429
          ? "Rate limit exceeded. Please try again."
          : result.userMessage || "AI service error";
      console.error("Google AI error:", result.status, result.body);
      return json200({ error: msg, description: "" });
    }

    const description = result.text.trim();

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-description error:", e);
    return json200({
      error: e instanceof Error ? e.message : "Unknown error",
      description: "",
    });
  }
});
