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
      return json200({ error: "Invalid JSON body.", preservations: [] });
    }
    const ingredients = Array.isArray(body.ingredients) ? body.ingredients : [];
    const { language, tools, skillLevel, timeAvailable } = body;
    const GOOGLE_API_KEY = Deno.env.get("GOOGLE_API_KEY");
    if (!GOOGLE_API_KEY) {
      return json200({
        error:
          "GOOGLE_API_KEY is not set. In Supabase: Project Settings → Edge Functions → Secrets, add GOOGLE_API_KEY, then redeploy this function.",
        preservations: [],
      });
    }
    if (ingredients.length === 0) {
      return json200({ error: "Add at least one ingredient.", preservations: [] });
    }

    const langLabel =
      language === "zh" ? "Chinese" : language === "ms" ? "Malay" : "English";

    const toolsList = tools && tools.length > 0 ? tools.join(", ") : "refrigerator, freezer";
    const skill = skillLevel || "beginner";
    const time = timeAvailable || "30 minutes";

    const systemPrompt = `You are an expert food preservation and upcycling AI assistant. The user will give you food items they want to preserve. You MUST respond with a JSON array of preservation suggestions. Each item in the array must have these exact fields:
{
  "foodItem": "name of the food item in ${langLabel}",
  "spoilageRisk": "low" | "medium" | "high",
  "spoilageTimeframe": "estimated days before spoilage as a string in ${langLabel}",
  "methods": [
    {
      "name": "Preservation method name in ${langLabel}",
      "type": "pickling" | "freezing" | "drying" | "fermenting" | "cooking" | "canning" | "other",
      "difficulty": "easy" | "medium" | "hard",
      "timeNeeded": "time as string in ${langLabel}",
      "shelfLife": "expected shelf life as string in ${langLabel}",
      "ingredientsNeeded": ["list", "of", "additional", "ingredients", "in ${langLabel}"],
      "toolsNeeded": ["list", "of", "tools", "needed", "in ${langLabel}"],
      "steps": ["Step 1 in ${langLabel}", "Step 2 in ${langLabel}"],
      "tips": "A helpful tip in ${langLabel}"
    }
  ],
  "upcycleIdeas": [
    {
      "name": "Transformation idea name in ${langLabel}",
      "description": "Brief description in ${langLabel}",
      "emoji": "relevant emoji"
    }
  ]
}

Rules:
- Return ONLY valid JSON array, no markdown, no explanation, no code fences
- The user has these kitchen tools available: ${toolsList}
- The user's skill level is: ${skill}
- The user has this much time: ${time}
- Only suggest methods that match the user's available tools
- Adjust complexity based on skill level (${skill})
- Prioritize methods that fit within the time constraint (${time})
- For each food item, suggest 2-4 preservation methods sorted by easiest first
- Include 1-3 upcycling/transformation ideas per food item
- Focus on practical, realistic suggestions
- All text must be in ${langLabel}
- Consider Malaysian/Asian preservation techniques when relevant (e.g., sambal, acar, jeruk)`;

    const userContent =
      `I need to preserve these food items: ${ingredients.join(", ")}. Please suggest preservation methods and upcycling ideas.`;

    const result = await geminiGenerateText({
      apiKey: GOOGLE_API_KEY,
      systemInstruction: systemPrompt,
      userContent,
      temperature: 0.4,
      jsonMode: true,
    });

    if (!result.ok) {
      // Use HTTP 200 + { error } so supabase.functions.invoke returns parsed JSON (non-2xx often hides body in client).
      const msg =
        result.status === 429
          ? "Rate limit exceeded. Please try again in a moment."
          : result.userMessage || "AI service error";
      console.error("Google AI error:", result.status, result.body);
      return json200({ error: msg, preservations: [] });
    }

    const content = result.text || "[]";

    let preservations;
    try {
      const cleaned = content.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      preservations = JSON.parse(cleaned);
    } catch {
      console.error("Failed to parse AI response:", content);
      preservations = [];
    }

    return new Response(JSON.stringify({ preservations }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("food-preservation error:", e);
    return json200({
      error: e instanceof Error ? e.message : "Unknown error",
      preservations: [],
    });
  }
});
