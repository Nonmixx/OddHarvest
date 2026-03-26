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
    const { ingredients, language, tools, skillLevel, timeAvailable } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

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
              content: `I need to preserve these food items: ${ingredients.join(", ")}. Please suggest preservation methods and upcycling ideas.`,
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
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
