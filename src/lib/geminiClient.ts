/**
 * Calls Gemini via POST /api/gemini (Vite dev uses vite-plugin-gemini-proxy; Vercel uses api/gemini.ts).
 * The API key stays server-side (GOOGLE_API_KEY in .env locally, Vercel env in production).
 */

const DEFAULT_MODEL = "gemini-2.5-flash";

function modelFromEnv(): string {
  const m = import.meta.env.VITE_GOOGLE_GEMINI_MODEL;
  return typeof m === "string" && m.length > 0 ? m : DEFAULT_MODEL;
}

type GeminiGenerateParams = {
  systemInstruction: string;
  userContent: string;
  temperature?: number;
  jsonMode?: boolean;
};

async function geminiGenerateRaw(params: GeminiGenerateParams): Promise<
  | { ok: true; data: unknown }
  | { ok: false; message: string }
> {
  const model = modelFromEnv();
  const generationConfig: Record<string, unknown> = {
    temperature: params.temperature ?? 0.4,
  };
  if (params.jsonMode) {
    generationConfig.responseMimeType = "application/json";
  }

  const requestBody = {
    systemInstruction: { parts: [{ text: params.systemInstruction }] },
    contents: [{ role: "user", parts: [{ text: params.userContent }] }],
    generationConfig,
  };

  let res: Response;
  try {
    res = await fetch("/api/gemini", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model, requestBody }),
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "Network error calling Gemini proxy" };
  }

  let data: unknown;
  try {
    data = await res.json();
  } catch {
    return { ok: false, message: `Gemini proxy returned non-JSON (HTTP ${res.status})` };
  }

  if (!res.ok) {
    const err = data as {
      error?: {
        message?: string;
        status?: string;
        details?: Array<{ reason?: string }>;
      };
    };
    const upstreamMessage = err?.error?.message ?? `Gemini API HTTP ${res.status}`;
    const reason = err?.error?.details?.find((d) => d?.reason)?.reason;
    const status = err?.error?.status;
    let msg = upstreamMessage;

    if (reason === "API_KEY_INVALID" || /api key expired/i.test(upstreamMessage)) {
      msg = "Google API key is invalid or expired. Update GOOGLE_API_KEY in .env, then restart npm run dev.";
    } else if (status === "PERMISSION_DENIED") {
      msg = "Google API key is blocked by permissions/restrictions. Enable Generative Language API and check key restrictions.";
    } else if (status === "RESOURCE_EXHAUSTED") {
      msg = "Google API quota exceeded. Check billing/quota in Google AI Studio or Google Cloud.";
    }
    return { ok: false, message: msg };
  }

  return { ok: true, data };
}

function extractText(data: unknown): string {
  const d = data as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    promptFeedback?: { blockReason?: string };
  };
  const block = d?.promptFeedback?.blockReason;
  if (block) return "";
  return d?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
}

function parseJsonArray<T>(text: string): T[] {
  try {
    const cleaned = text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
    const parsed = JSON.parse(cleaned);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** @returns same shape as supabase.functions.invoke for minimal page changes */
export async function invokeMealPlanner(body: {
  ingredients: string[];
  language: string;
}): Promise<{ data: { meals?: unknown[]; error?: string } | null; error: { message: string } | null }> {
  const { ingredients, language } = body;
  if (ingredients.length < 1) {
    return { data: { error: "Add at least 1 ingredient.", meals: [] }, error: null };
  }

  const langLabel = language === "zh" ? "Chinese" : language === "ms" ? "Malay" : "English";
  const systemPrompt = `You are an expert chef that suggests REAL-WORLD dishes (not generic templates).
The user will give you ingredients they currently have.
You MUST respond with a JSON array of 3-5 meal suggestions. Each meal object must have these exact fields:
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
- Suggest 3-5 DIFFERENT dishes that exist in real cuisine (home-style or common restaurant dishes)
- Each meal must use at least 1 of the user's available ingredients
- Include realistic calorie counts
- Steps should be clear and in ${langLabel}
- Meal names must be in ${langLabel}
- Sort by number of matching ingredients (best match first)
- Include a mix of meal types (e.g. stir-fry, soup, curry, roasted, salad, noodle/rice dish)
- Focus on Malaysian/Asian cuisine when possible, but keep recipes practical
- DO NOT repeat the same cooking method for all meals
- Make each recipe's method match the ingredient type (e.g. cucumber -> salad/pickle, fish -> grill/steam/curry, chicken -> stir-fry/soup/bake)
- Prefer recognizable dish names (e.g. Acar Timun, Tomato Egg Stir-Fry, Basil Omelette, Cucumber Raita) instead of vague names like "Mixed Vegetable Dish"
- Keep steps actionable with concrete techniques, timings, and heat levels
- Assume basic pantry staples are available unless missing ingredients should be listed (oil, salt, pepper, garlic, onion, soy sauce, sugar)
- Avoid impossible combinations and avoid repeating near-identical steps across meals`;

  const userContent = `My available ingredients: ${ingredients.join(", ")}. Suggest 3-5 meals I can make.`;

  const result = await geminiGenerateRaw({
    systemInstruction: systemPrompt,
    userContent,
    temperature: 0.4,
    jsonMode: true,
  });

  if (!result.ok) {
    return { data: { error: result.message, meals: [] }, error: null };
  }

  const text = extractText(result.data);
  const meals = parseJsonArray<unknown>(text);
  return { data: { meals }, error: null };
}

export async function invokeFoodPreservation(body: {
  ingredients: string[];
  language: string;
  tools: string[];
  skillLevel: string;
  timeAvailable: string;
}): Promise<{ data: { preservations?: unknown[]; error?: string } | null; error: { message: string } | null }> {
  const { ingredients, language, tools, skillLevel, timeAvailable } = body;
  if (ingredients.length === 0) {
    return { data: { error: "Add at least one ingredient.", preservations: [] }, error: null };
  }

  const langLabel = language === "zh" ? "Chinese" : language === "ms" ? "Malay" : "English";
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

  const userContent = `Preserve or use soon these items: ${ingredients.join(", ")}.
Constraints: tools = [${toolsList}]; skill = ${skill}; time I can spend now ≈ ${time}.
Return one array element per item above, in the same order.`;

  const result = await geminiGenerateRaw({
    systemInstruction: systemPrompt,
    userContent,
    temperature: 0.35,
    jsonMode: true,
  });

  if (!result.ok) {
    return { data: { error: result.message, preservations: [] }, error: null };
  }

  const text = extractText(result.data);
  const preservations = parseJsonArray<unknown>(text);
  return { data: { preservations }, error: null };
}

export async function invokeGenerateDescription(body: {
  name: string;
  imperfectReason?: string;
  harvestDate?: string;
  bundleContents?: string;
  isBundle: boolean;
  language: string;
}): Promise<{ data: { description?: string; error?: string } | null; error: { message: string } | null }> {
  const { name, imperfectReason, harvestDate, bundleContents, isBundle, language } = body;
  const langLabel = language === "zh" ? "Chinese" : language === "ms" ? "Malay" : "English";

  let userContent: string;
  if (isBundle) {
    userContent = `Write a short, friendly product description (1-2 sentences) in ${langLabel} for a rescue veggie bundle called "${name}" containing: ${bundleContents || "mixed vegetables"}. Emphasize freshness, value, and reducing food waste. Only return the description text, nothing else.`;
  } else {
    const reasonMap: Record<string, string> = {
      irregular_shape: "irregular shape",
      too_small: "smaller than usual size",
      too_large: "larger than usual size",
      cosmetic_blemish: "minor cosmetic blemish",
      slight_discoloration: "slight discoloration",
    };
    const reasonText = imperfectReason ? reasonMap[imperfectReason] || "cosmetic imperfection" : "cosmetic imperfection";
    const harvestInfo = harvestDate ? ` Harvested on ${harvestDate}.` : "";
    userContent = `Write a short, friendly product description (1-2 sentences) in ${langLabel} for imperfect "${name}" that has ${reasonText}.${harvestInfo} Emphasize that despite the imperfection, the produce is fresh, nutritious, and perfect for cooking. Only return the description text, nothing else.`;
  }

  const result = await geminiGenerateRaw({
    systemInstruction: "You are a produce marketing copywriter. Write concise, appealing product descriptions.",
    userContent,
    temperature: 0.5,
    jsonMode: false,
  });

  if (!result.ok) {
    return { data: { error: result.message, description: "" }, error: null };
  }

  const description = extractText(result.data).trim();
  return { data: { description }, error: null };
}
