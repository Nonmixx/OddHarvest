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

    const systemPrompt = `You are an expert home food preservation coach (food safety aware). The user lists ingredients they need to use or store. You MUST respond with a JSON array with ONE object per ingredient they listed. Each object must have these exact fields:
{
  "foodItem": "name of the food item in ${langLabel} (match the user's item)",
  "spoilageRisk": "low" | "medium" | "high",
  "spoilageTimeframe": "realistic fridge/counter spoilage window in ${langLabel} (e.g. leafy greens: a few days; root veg: 1–2 weeks refrigerated; ripe stone fruit: days)",
  "methods": [
    {
      "name": "Specific method name in ${langLabel} (e.g. quick refrigerator pickle, blanch-and-freeze, dry in oven, jeruk asam, sambal base)",
      "type": "pickling" | "freezing" | "drying" | "fermenting" | "cooking" | "canning" | "other",
      "difficulty": "easy" | "medium" | "hard",
      "timeNeeded": "honest active + wait time in ${langLabel}, must respect user's time budget (${time}) for the active part where possible",
      "shelfLife": "realistic stored shelf life for that method in ${langLabel}",
      "ingredientsNeeded": ["extras in ${langLabel} — vinegar/salt/sugar/oil only when the method truly needs them"],
      "toolsNeeded": ["only tools the user likely has from their list OR basic items like pot, knife, chopping board"],
      "steps": ["4–8 short steps in ${langLabel} with concrete details: wash/trim, ratios if pickling, blanch times, freezer packaging, oven temp & duration if drying, cool-down"],
      "tips": "One food-safety or quality tip in ${langLabel} (e.g. cool before freezing, leave headspace in jars, high-acid only for simple water-bath-style pickles at home)"
    }
  ],
  "upcycleIdeas": [
    {
      "name": "Specific dish or product in ${langLabel}",
      "description": "One sentence: what to make and why it fits this ingredient in ${langLabel}",
      "emoji": "relevant emoji"
    }
  ]
}

Rules:
- Return ONLY valid JSON array, no markdown, no explanation, no code fences
- Tools the user selected (use these literally; do NOT require tools they did not list): ${toolsList}
- Skill level: ${skill} — beginners get fewer steps and no advanced pressure-canning; "hard" methods only if skill is not beginner
- Time budget label: ${time} — prefer methods whose main hands-on work fits that window; long passive fermenting may note "then wait X days" separately
- Every method must be appropriate for THAT food (e.g. do not sun-dry raw meat; leafy greens: salad prep, pesto, blanch-freeze, or quick pickle — not nonsense like "canning whole lettuce")
- Do not suggest water-bath or shelf-stable canning of low-acid foods without proper acidification; when unsure, prefer refrigerator/freezer methods
- ingredientsNeeded must not list the main food twice; assume salt, sugar, water, basic oil are pantry unless the recipe needs unusual amounts
- Upcycle ideas must vary (not three smoothies for every fruit); tie each idea to the actual ingredient
- Sort methods easiest first; 2–4 methods per item; 1–3 upcycle ideas per item
- All user-facing text in ${langLabel}
- Where it fits, include Malaysian/Asian options (acar, jeruk, sambal, ikan bilis-style uses, rempah bases) when realistic for the ingredient`;

    const userContent =
      `Preserve or use soon these items: ${ingredients.join(", ")}.
Constraints: tools = [${toolsList}]; skill = ${skill}; time I can spend now ≈ ${time}.
Return one array element per item above, in the same order.`;

    const result = await geminiGenerateText({
      apiKey: GOOGLE_API_KEY,
      systemInstruction: systemPrompt,
      userContent,
      temperature: 0.35,
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
