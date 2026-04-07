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
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json200({ error: "Invalid JSON body.", meals: [] });
    }
    const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    const { language } = body;
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      return json200({
        error:
          "GOOGLE_API_KEY is not set. In Supabase: Project Settings → Edge Functions → Secrets, add GOOGLE_API_KEY, then redeploy this function.",
        meals: [],
      });
    }
    if (ingredients.length < 2) {
      return json200({ error: "Add at least 2 ingredients.", meals: [] });
    }

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

    const userContent = `My available ingredients: ${ingredients.join(", ")}. Suggest 3-5 meals I can make.`;

    const result = await geminiGenerateText({
      apiKey: GOOGLE_API_KEY,
      systemInstruction: systemPrompt,
      userContent,
      temperature: 0.4,
      jsonMode: true,
    });

    if (!result.ok) {
      const msg =
        result.status === 429
          ? "Rate limit exceeded. Please try again in a moment."
          : result.userMessage || "AI service error";
      console.error("Google AI error:", result.status, result.body);
      return json200({ error: msg, meals: [] });
    }

    const content = result.text || "[]";

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
    return json200({
      error: e instanceof Error ? e.message : "Unknown error",
      meals: [],
    });
  }
});
