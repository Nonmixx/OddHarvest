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
    const { ingredients, language } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const langLabel =
      language === "zh" ? "Chinese" : language === "ms" ? "Malay" : "English";

    const systemPrompt = `You are a professional chef and nutritionist AI. The user will give you a list of ingredients they have. You MUST respond with a JSON array of 3-5 meal suggestions. Each meal object must have these exact fields:
{
  "name": "Meal name in ${langLabel}",
  "calories": number,
  "protein": "High" | "Medium" | "Low",
  "nutritionLevel": "balanced" | "high_protein" | "high_carb",
  "servings": number,
  "time": number (minutes),
  "ingredients": ["all", "ingredients", "needed"],
  "missingIngredients": ["ingredients", "user", "does", "not", "have"],
  "steps": ["Step 1 in ${langLabel}", "Step 2 in ${langLabel}", ...]
}

Rules:
- Return ONLY valid JSON array, no markdown, no explanation, no code fences
- Suggest 3-5 different meals ranging from simple to elaborate
- Each meal must use at least 2 of the user's available ingredients
- Include realistic calorie counts
- Steps should be clear and in ${langLabel}
- Meal names must be in ${langLabel}
- Sort by number of matching ingredients (best match first)
- Include a mix of meal types (soup, stir-fry, salad, etc.)
- Focus on Malaysian/Asian cuisine when possible`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemPrompt },
            {
              role: "user",
              content: `My available ingredients: ${ingredients.join(", ")}. Suggest 3-5 meals I can make.`,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits depleted. Please top up your Lovable AI usage." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "[]";

    // Parse the JSON from the AI response, stripping any markdown fences
    let meals;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      meals = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      meals = [];
    }

    return new Response(JSON.stringify({ meals }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("meal-planner error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
