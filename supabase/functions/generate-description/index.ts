import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { name, imperfectReason, harvestDate, bundleContents, isBundle, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langLabel = language === "zh" ? "Chinese" : language === "ms" ? "Malay" : "English";

    let prompt: string;
    if (isBundle) {
      prompt = `Write a short, friendly product description (1-2 sentences) in ${langLabel} for a rescue veggie bundle called "${name}" containing: ${bundleContents || "mixed vegetables"}. Emphasize freshness, value, and reducing food waste. Only return the description text, nothing else.`;
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
      prompt = `Write a short, friendly product description (1-2 sentences) in ${langLabel} for imperfect "${name}" that has ${reasonText}.${harvestInfo} Emphasize that despite the imperfection, the produce is fresh, nutritious, and perfect for cooking. Only return the description text, nothing else.`;
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: "You are a produce marketing copywriter. Write concise, appealing product descriptions." },
          { role: "user", content: prompt },
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limit exceeded. Please try again." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits depleted." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(JSON.stringify({ error: "AI service error" }), {
        status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const description = data.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ description }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-description error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
