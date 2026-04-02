import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

type SupportedLanguage = "en" | "zh" | "ms";

type MealSuggestion = {
  name: string;
  calories: number;
  protein: "High" | "Medium" | "Low";
  nutritionLevel: "balanced" | "high_protein" | "high_carb";
  servings: number;
  time: number;
  ingredients: string[];
  missingIngredients: string[];
  steps: string[];
};

const ingredientLabels: Record<string, Record<SupportedLanguage, string>> = {
  tomato: { en: "tomato", zh: "番茄", ms: "tomato" },
  carrot: { en: "carrot", zh: "胡萝卜", ms: "lobak merah" },
  corn: { en: "corn", zh: "玉米", ms: "jagung" },
  cucumber: { en: "cucumber", zh: "黄瓜", ms: "timun" },
  chicken: { en: "chicken", zh: "鸡肉", ms: "ayam" },
  egg: { en: "egg", zh: "鸡蛋", ms: "telur" },
  onion: { en: "onion", zh: "洋葱", ms: "bawang" },
  garlic: { en: "garlic", zh: "大蒜", ms: "bawang putih" },
  rice: { en: "rice", zh: "米饭", ms: "nasi" },
  tofu: { en: "tofu", zh: "豆腐", ms: "tauhu" },
  fish: { en: "fish", zh: "鱼", ms: "ikan" },
  prawn: { en: "prawn", zh: "虾", ms: "udang" },
  spinach: { en: "spinach", zh: "菠菜", ms: "bayam" },
  mushroom: { en: "mushroom", zh: "蘑菇", ms: "cendawan" },
  potato: { en: "potato", zh: "土豆", ms: "kentang" },
  chili: { en: "chili", zh: "辣椒", ms: "cili" },
  ginger: { en: "ginger", zh: "姜", ms: "halia" },
  "soy sauce": { en: "soy sauce", zh: "酱油", ms: "kicap" },
  pasta: { en: "pasta", zh: "意面", ms: "pasta" },
  apple: { en: "apple", zh: "苹果", ms: "epal" },
  banana: { en: "banana", zh: "香蕉", ms: "pisang" },
  lemon: { en: "lemon", zh: "柠檬", ms: "lemon" },
  milk: { en: "milk", zh: "牛奶", ms: "susu" },
  honey: { en: "honey", zh: "蜂蜜", ms: "madu" },
  basil: { en: "basil", zh: "罗勒", ms: "selasih" },
  mint: { en: "mint", zh: "薄荷", ms: "pudina" },
  "bell pepper": { en: "bell pepper", zh: "彩椒", ms: "lada benggala" },
  eggplant: { en: "eggplant", zh: "茄子", ms: "terung" },
  "coconut milk": { en: "coconut milk", zh: "椰奶", ms: "santan" },
};

const calorieMap: Record<string, number> = {
  tomato: 22,
  carrot: 41,
  corn: 86,
  cucumber: 16,
  chicken: 165,
  egg: 78,
  onion: 40,
  garlic: 15,
  rice: 205,
  tofu: 76,
  fish: 140,
  prawn: 99,
  spinach: 23,
  mushroom: 22,
  potato: 161,
  chili: 18,
  ginger: 12,
  "soy sauce": 10,
  pasta: 220,
  apple: 95,
  banana: 105,
  lemon: 17,
  milk: 103,
  honey: 64,
  basil: 5,
  mint: 5,
  "bell pepper": 31,
  eggplant: 35,
  "coconut milk": 150,
};

const proteinIngredients = new Set(["chicken", "egg", "tofu", "fish", "prawn"]);
const carbIngredients = new Set(["rice", "pasta", "potato", "corn", "banana"]);

function normalizeIngredients(rawIngredients: unknown): string[] {
  if (!Array.isArray(rawIngredients)) return [];

  return Array.from(
    new Set(
      rawIngredients
        .map((item) => String(item).trim().toLowerCase())
        .filter(Boolean)
    )
  );
}

function tIngredient(ingredient: string, language: SupportedLanguage) {
  return ingredientLabels[ingredient]?.[language] ?? ingredient;
}

function joinIngredients(items: string[], language: SupportedLanguage) {
  const translated = items.map((item) => tIngredient(item, language));

  if (translated.length <= 1) return translated[0] ?? "";
  if (language === "zh") return translated.join("、");
  if (language === "ms") return `${translated.slice(0, -1).join(", ")} dan ${translated.at(-1)}`;
  return `${translated.slice(0, -1).join(", ")} and ${translated.at(-1)}`;
}

function estimateCalories(items: string[]) {
  return items.reduce((sum, item) => sum + (calorieMap[item] ?? 45), 0) + 40;
}

function estimateProtein(items: string[]): MealSuggestion["protein"] {
  if (items.some((item) => proteinIngredients.has(item))) return "High";
  if (items.some((item) => ["mushroom", "spinach", "corn"].includes(item))) return "Medium";
  return "Low";
}

function estimateNutrition(items: string[]): MealSuggestion["nutritionLevel"] {
  if (items.some((item) => proteinIngredients.has(item))) return "high_protein";
  if (items.some((item) => carbIngredients.has(item))) return "high_carb";
  return "balanced";
}

function buildName(style: "stirfry" | "soup" | "salad" | "bowl", items: string[], language: SupportedLanguage) {
  const joined = joinIngredients(items, language);

  switch (language) {
    case "zh":
      if (style === "stirfry") return `${joined}快炒`;
      if (style === "soup") return `${joined}汤`;
      if (style === "salad") return `${joined}沙拉`;
      return `${joined}暖碗`;
    case "ms":
      if (style === "stirfry") return `Tumis Pantas ${joined}`;
      if (style === "soup") return `Sup ${joined}`;
      if (style === "salad") return `Salad ${joined}`;
      return `Mangkuk Hangat ${joined}`;
    default:
      if (style === "stirfry") return `Quick ${joined} Stir-Fry`;
      if (style === "soup") return `${joined} Soup`;
      if (style === "salad") return `${joined} Salad`;
      return `Warm ${joined} Bowl`;
  }
}

function buildSteps(style: "stirfry" | "soup" | "salad" | "bowl", items: string[], language: SupportedLanguage) {
  const [first, second, third] = items.map((item) => tIngredient(item, language));
  const combo = joinIngredients(items, language);

  switch (language) {
    case "zh": {
      if (style === "stirfry") {
        return [
          `将${combo}切成适合入口的小块。`,
          `加热平底锅，先下${first}翻炒约2分钟。`,
          `加入${second}${third ? `和${third}` : ""}，翻炒到刚熟。`,
          `试味后立即盛出热食。`,
        ];
      }
      if (style === "soup") {
        return [
          `把${combo}切好备用。`,
          `将${first}${second ? `和${second}` : ""}放入锅中，加水小火煮。`,
          `${third ? `加入${third}后继续煮至食材变软。` : "继续煮至食材变软并融合味道。"}`,
          `调整味道后趁热享用。`,
        ];
      }
      if (style === "salad") {
        return [
          `把${combo}切成薄片或小块。`,
          `将所有食材放入大碗中轻轻拌匀。`,
          `静置1分钟让食材自然出汁。`,
          `装盘后立即食用。`,
        ];
      }
      return [
        `将${combo}准备好并切成小块。`,
        `先把${first}加热至熟透。`,
        `加入${second}${third ? `和${third}` : ""}，拌匀加热。`,
        `装入碗中温热享用。`,
      ];
    }
    case "ms": {
      if (style === "stirfry") {
        return [
          `Potong ${combo} kepada saiz kecil.`,
          `Panaskan kuali dan masak ${first} selama kira-kira 2 minit.`,
          `Masukkan ${second}${third ? ` dan ${third}` : ""}, kemudian tumis hingga lembut.`,
          `Rasa dan hidangkan semasa panas.`,
        ];
      }
      if (style === "soup") {
        return [
          `Sediakan dan potong ${combo}.`,
          `Masukkan ${first}${second ? ` dan ${second}` : ""} ke dalam periuk bersama air.`,
          `${third ? `Tambah ${third} dan reneh hingga semua bahan lembut.` : "Reneh hingga semua bahan lembut dan sebati."}`,
          `Laraskan rasa dan hidangkan panas.`,
        ];
      }
      if (style === "salad") {
        return [
          `Hiris ${combo} nipis atau kecil.`,
          `Masukkan semua bahan ke dalam mangkuk besar dan gaul perlahan.`,
          `Biarkan selama 1 minit supaya rasa bercampur.`,
          `Hidangkan segera.`,
        ];
      }
      return [
        `Sediakan ${combo} dan potong kecil.`,
        `Masak ${first} dahulu hingga panas dan lembut.`,
        `Masukkan ${second}${third ? ` dan ${third}` : ""}, kemudian kacau hingga sebati.`,
        `Alihkan ke mangkuk dan hidangkan hangat.`,
      ];
    }
    default: {
      if (style === "stirfry") {
        return [
          `Cut the ${combo} into bite-sized pieces.`,
          `Heat a pan and cook the ${first} for about 2 minutes.`,
          `Add the ${second}${third ? ` and ${third}` : ""} and stir-fry until just tender.`,
          `Taste and serve while hot.`,
        ];
      }
      if (style === "soup") {
        return [
          `Prep and chop the ${combo}.`,
          `Add the ${first}${second ? ` and ${second}` : ""} to a pot with water and bring to a gentle simmer.`,
          `${third ? `Add the ${third} and cook until all the ingredients are tender.` : "Cook until the ingredients are tender and the flavors combine."}`,
          `Adjust the seasoning lightly and serve hot.`,
        ];
      }
      if (style === "salad") {
        return [
          `Slice the ${combo} into thin, easy-to-eat pieces.`,
          `Place all the ingredients in a bowl and toss gently.`,
          `Let the mixture rest for 1 minute so the ingredients settle together.`,
          `Serve immediately while fresh.`,
        ];
      }
      return [
        `Prepare the ${combo} and cut everything into small pieces.`,
        `Warm the ${first} first until it is cooked through.`,
        `Add the ${second}${third ? ` and ${third}` : ""} and combine everything well.`,
        `Transfer to a bowl and serve warm.`,
      ];
    }
  }
}

function createMeal(style: "stirfry" | "soup" | "salad" | "bowl", items: string[], language: SupportedLanguage, time: number): MealSuggestion {
  const uniqueItems = Array.from(new Set(items)).slice(0, 3);

  return {
    name: buildName(style, uniqueItems, language),
    calories: estimateCalories(uniqueItems),
    protein: estimateProtein(uniqueItems),
    nutritionLevel: estimateNutrition(uniqueItems),
    servings: 2,
    time,
    ingredients: uniqueItems,
    missingIngredients: [],
    steps: buildSteps(style, uniqueItems, language),
  };
}

function buildFallbackMeals(ingredients: string[], language: SupportedLanguage) {
  const uniqueIngredients = normalizeIngredients(ingredients);

  if (uniqueIngredients.length < 2) return [];

  const firstPair = uniqueIngredients.slice(0, 2);
  const firstTrio = uniqueIngredients.slice(0, 3);
  const secondPair = uniqueIngredients.length >= 4
    ? uniqueIngredients.slice(2, 4)
    : [uniqueIngredients[1], uniqueIngredients[0]];

  const meals = [
    createMeal("stirfry", firstTrio.length >= 2 ? firstTrio : firstPair, language, 15),
    createMeal("soup", firstPair, language, 20),
    createMeal(
      uniqueIngredients.some((ingredient) => ["cucumber", "apple", "tomato", "banana"].includes(ingredient)) ? "salad" : "bowl",
      firstTrio.length >= 2 ? firstTrio : firstPair,
      language,
      10,
    ),
  ];

  if (secondPair.every(Boolean)) {
    meals.push(createMeal("bowl", secondPair, language, 12));
  }

  return meals
    .filter((meal, index, list) => list.findIndex((candidate) => candidate.name === meal.name) === index)
    .sort((a, b) => b.ingredients.length - a.ingredients.length)
    .slice(0, 4);
}

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
        const meals = buildFallbackMeals(ingredients, language);
        return new Response(
          JSON.stringify({
            meals,
            notice: "Lovable AI is busy right now, so simplified meal ideas are shown instead.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        const meals = buildFallbackMeals(ingredients, language);
        return new Response(
          JSON.stringify({
            meals,
            notice: "Lovable AI credits are depleted, so simplified meal ideas are shown instead.",
          }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" } }
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
      meals = buildFallbackMeals(ingredients, language as SupportedLanguage);
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
