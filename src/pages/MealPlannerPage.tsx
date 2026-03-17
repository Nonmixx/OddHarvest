import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { translateContent } from "@/lib/contentTranslations";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import VoiceInput from "@/components/VoiceInput";
import { ChefHat, Sparkles, Flame, Dumbbell, Wheat, Leaf, ShoppingCart, X, Plus, ArrowRight, Clock, Users } from "lucide-react";

// Meal database with nutrition and recipes
const MEAL_DATABASE = [
  {
    nameKey: "meal.chicken_soup",
    name: { en: "Chicken Vegetable Soup", zh: "鸡肉蔬菜汤", ms: "Sup Ayam Sayur" },
    ingredients: ["chicken", "carrot", "potato", "onion", "garlic"],
    calories: 350,
    protein: "High",
    proteinKey: "meal.high",
    nutritionLevel: "balanced",
    nutritionKey: "meal.balanced",
    servings: 4,
    time: 40,
    steps: {
      en: ["Boil chicken in water for 15 minutes", "Dice carrots and potatoes", "Add vegetables and simmer for 20 minutes", "Season with salt and pepper, serve hot"],
      zh: ["将鸡肉在水中煮15分钟", "切胡萝卜和土豆", "加入蔬菜，小火煮20分钟", "加盐和胡椒调味，趁热食用"],
      ms: ["Rebus ayam dalam air selama 15 minit", "Potong dadu lobak merah dan kentang", "Tambah sayur dan masak perlahan selama 20 minit", "Perasakan dengan garam dan lada, hidang panas"],
    },
  },
  {
    nameKey: "meal.stir_fry",
    name: { en: "Stir-Fried Vegetables", zh: "炒蔬菜", ms: "Sayur Goreng" },
    ingredients: ["bell pepper", "carrot", "cucumber", "garlic", "soy sauce"],
    calories: 180,
    protein: "Low",
    proteinKey: "meal.low",
    nutritionLevel: "balanced",
    nutritionKey: "meal.balanced",
    servings: 2,
    time: 15,
    steps: {
      en: ["Heat oil in a wok", "Add garlic and stir until fragrant", "Add vegetables and stir-fry on high heat for 5 minutes", "Add soy sauce, toss and serve"],
      zh: ["在锅中加热油", "加入大蒜炒至香", "加入蔬菜大火翻炒5分钟", "加入酱油，翻炒后上桌"],
      ms: ["Panaskan minyak dalam kuali", "Masukkan bawang putih dan tumis hingga wangi", "Masukkan sayur dan goreng atas api besar 5 minit", "Tambah kicap, gaul dan hidang"],
    },
  },
  {
    nameKey: "meal.banana_smoothie",
    name: { en: "Banana Smoothie Bowl", zh: "香蕉冰沙碗", ms: "Mangkuk Smoothie Pisang" },
    ingredients: ["banana", "spinach", "milk", "honey"],
    calories: 280,
    protein: "Medium",
    proteinKey: "meal.medium",
    nutritionLevel: "high_carb",
    nutritionKey: "meal.high_carb",
    servings: 1,
    time: 5,
    steps: {
      en: ["Blend frozen bananas with spinach and milk", "Pour into a bowl", "Drizzle with honey", "Top with sliced fruits or granola"],
      zh: ["将冷冻香蕉与菠菜和牛奶混合", "倒入碗中", "淋上蜂蜜", "上面放切片水果或格兰诺拉麦片"],
      ms: ["Kisar pisang beku dengan bayam dan susu", "Tuang ke dalam mangkuk", "Titiskan madu", "Hias dengan buah potong atau granola"],
    },
  },
  {
    nameKey: "meal.tomato_pasta",
    name: { en: "Tomato Pasta", zh: "番茄意面", ms: "Pasta Tomato" },
    ingredients: ["tomato", "pasta", "garlic", "basil", "onion"],
    calories: 420,
    protein: "Medium",
    proteinKey: "meal.medium",
    nutritionLevel: "high_carb",
    nutritionKey: "meal.high_carb",
    servings: 2,
    time: 25,
    steps: {
      en: ["Cook pasta until al dente", "Sauté garlic and onion in olive oil", "Add diced tomatoes and simmer 10 minutes", "Toss with pasta, garnish with basil"],
      zh: ["煮意面至半熟", "在橄榄油中炒大蒜和洋葱", "加入切丁番茄小火煮10分钟", "与意面拌匀，用罗勒装饰"],
      ms: ["Masak pasta hingga al dente", "Tumis bawang putih dan bawang dalam minyak zaitun", "Tambah tomato potong dadu dan masak perlahan 10 minit", "Gaul dengan pasta, hiaskan dengan selasih"],
    },
  },
  {
    nameKey: "meal.spicy_chili",
    name: { en: "Spicy Chili Stir-Fry", zh: "辣椒炒肉", ms: "Tumis Cili Pedas" },
    ingredients: ["chili", "chicken", "garlic", "bell pepper", "soy sauce"],
    calories: 310,
    protein: "High",
    proteinKey: "meal.high",
    nutritionLevel: "high_protein",
    nutritionKey: "meal.high_protein",
    servings: 2,
    time: 20,
    steps: {
      en: ["Slice chicken into strips", "Heat oil, add garlic and chili", "Stir-fry chicken until golden", "Add bell peppers and soy sauce, cook 5 more minutes"],
      zh: ["将鸡肉切成条", "加热油，放入大蒜和辣椒", "翻炒鸡肉至金黄", "加入彩椒和酱油，再煮5分钟"],
      ms: ["Hiris ayam menjadi jalur", "Panaskan minyak, masukkan bawang putih dan cili", "Goreng ayam hingga keemasan", "Tambah lada benggala dan kicap, masak 5 minit lagi"],
    },
  },
  {
    nameKey: "meal.corn_soup",
    name: { en: "Sweet Corn Soup", zh: "甜玉米汤", ms: "Sup Jagung Manis" },
    ingredients: ["corn", "egg", "chicken stock", "cornstarch"],
    calories: 200,
    protein: "Medium",
    proteinKey: "meal.medium",
    nutritionLevel: "balanced",
    nutritionKey: "meal.balanced",
    servings: 3,
    time: 20,
    steps: {
      en: ["Blend half the corn kernels", "Bring stock to a boil, add blended and whole corn", "Thicken with cornstarch slurry", "Drizzle beaten egg, stir gently and serve"],
      zh: ["将一半玉米粒打碎", "煮沸高汤，加入打碎的和整粒玉米", "用玉米淀粉勾芡", "淋入蛋液，轻轻搅拌后上桌"],
      ms: ["Kisar separuh biji jagung", "Didihkan stok, tambah jagung yang dikisar dan biji jagung", "Pekatkan dengan bancuhan kanji", "Titiskan telur pukul, kacau perlahan dan hidang"],
    },
  },
  {
    nameKey: "meal.apple_salad",
    name: { en: "Apple Cucumber Salad", zh: "苹果黄瓜沙拉", ms: "Salad Epal Timun" },
    ingredients: ["apple", "cucumber", "lemon", "honey", "mint"],
    calories: 150,
    protein: "Low",
    proteinKey: "meal.low",
    nutritionLevel: "balanced",
    nutritionKey: "meal.balanced",
    servings: 2,
    time: 10,
    steps: {
      en: ["Dice apples and cucumbers", "Mix lemon juice and honey for dressing", "Toss vegetables with dressing", "Garnish with fresh mint leaves"],
      zh: ["将苹果和黄瓜切丁", "混合柠檬汁和蜂蜜做酱汁", "将蔬菜与酱汁拌匀", "用新鲜薄荷叶装饰"],
      ms: ["Potong dadu epal dan timun", "Campurkan jus lemon dan madu untuk sos", "Gaul sayur dengan sos", "Hiaskan dengan daun pudina segar"],
    },
  },
];

// Ingredient aliases for matching
const INGREDIENT_ALIASES: Record<string, string[]> = {
  "tomato": ["tomato", "tomatoes", "番茄", "tomato"],
  "carrot": ["carrot", "carrots", "胡萝卜", "lobak merah", "lobak"],
  "cucumber": ["cucumber", "cucumbers", "黄瓜", "timun"],
  "apple": ["apple", "apples", "苹果", "epal"],
  "corn": ["corn", "玉米", "jagung"],
  "bell pepper": ["bell pepper", "bell peppers", "pepper", "彩椒", "lada benggala"],
  "banana": ["banana", "bananas", "香蕉", "pisang"],
  "spinach": ["spinach", "菠菜", "bayam"],
  "chili": ["chili", "chilli", "chillies", "辣椒", "cili", "cili padi"],
  "chicken": ["chicken", "鸡肉", "ayam"],
  "potato": ["potato", "potatoes", "土豆", "kentang"],
  "onion": ["onion", "onions", "洋葱", "bawang"],
  "garlic": ["garlic", "大蒜", "bawang putih"],
  "egg": ["egg", "eggs", "鸡蛋", "telur"],
  "basil": ["basil", "罗勒", "selasih"],
  "mint": ["mint", "薄荷", "pudina"],
  "soy sauce": ["soy sauce", "酱油", "kicap"],
  "milk": ["milk", "牛奶", "susu"],
  "honey": ["honey", "蜂蜜", "madu"],
  "pasta": ["pasta", "noodle", "noodles", "意面", "pasta"],
  "lemon": ["lemon", "柠檬", "lemon"],
  "chicken stock": ["chicken stock", "broth", "高汤", "stok ayam"],
  "cornstarch": ["cornstarch", "corn starch", "玉米淀粉", "kanji"],
};

function normalizeIngredient(input: string): string | null {
  const lower = input.toLowerCase().trim();
  for (const [key, aliases] of Object.entries(INGREDIENT_ALIASES)) {
    if (aliases.some((a) => lower.includes(a))) return key;
  }
  return null;
}

const MealPlannerPage = () => {
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { crops } = useCropInventory();
  const [inputText, setInputText] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [suggestedMeals, setSuggestedMeals] = useState<typeof MEAL_DATABASE>([]);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const addIngredient = () => {
    const trimmed = inputText.trim();
    if (!trimmed) return;
    const normalized = normalizeIngredient(trimmed);
    const toAdd = normalized || trimmed.toLowerCase();
    if (!selectedIngredients.includes(toAdd)) {
      setSelectedIngredients((prev) => [...prev, toAdd]);
    }
    setInputText("");
  };

  const removeIngredient = (ing: string) => {
    setSelectedIngredients((prev) => prev.filter((i) => i !== ing));
  };

  const quickAddFromMarket = (cropName: string) => {
    const normalized = normalizeIngredient(cropName);
    if (normalized && !selectedIngredients.includes(normalized)) {
      setSelectedIngredients((prev) => [...prev, normalized]);
    }
  };

  const generateMeals = () => {
    const matched = MEAL_DATABASE.filter((meal) => {
      const matchCount = meal.ingredients.filter((ing) => selectedIngredients.includes(ing)).length;
      return matchCount >= 2;
    }).sort((a, b) => {
      const aMatch = a.ingredients.filter((ing) => selectedIngredients.includes(ing)).length;
      const bMatch = b.ingredients.filter((ing) => selectedIngredients.includes(ing)).length;
      return bMatch - aMatch;
    });
    setSuggestedMeals(matched);
    setHasSearched(true);
    setExpandedMeal(null);
  };

  const getMissingIngredients = (meal: typeof MEAL_DATABASE[0]) => {
    return meal.ingredients.filter((ing) => !selectedIngredients.includes(ing));
  };

  const getNutritionColor = (level: string) => {
    switch (level) {
      case "balanced": return "bg-primary/10 text-primary";
      case "high_protein": return "bg-accent/10 text-accent";
      case "high_carb": return "bg-farm-orange/20 text-farm-orange";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getNutritionLabel = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      "meal.balanced": { en: "Balanced Meal ✅", zh: "均衡膳食 ✅", ms: "Hidangan Seimbang ✅" },
      "meal.high_protein": { en: "High Protein 💪", zh: "高蛋白 💪", ms: "Protein Tinggi 💪" },
      "meal.high_carb": { en: "High Carbs 🍞", zh: "高碳水 🍞", ms: "Karbohidrat Tinggi 🍞" },
      "meal.high": { en: "High", zh: "高", ms: "Tinggi" },
      "meal.medium": { en: "Medium", zh: "中等", ms: "Sederhana" },
      "meal.low": { en: "Low", zh: "低", ms: "Rendah" },
    };
    return labels[key]?.[language] ?? key;
  };

  const labels = {
    title: { en: "AI Smart Meal Planner 🍳", zh: "AI 智能膳食规划师 🍳", ms: "Perancang Hidangan Pintar AI 🍳" },
    subtitle: { en: "Turn your rescued ingredients into delicious, nutritious meals!", zh: "将您拯救的食材变成美味又营养的膳食！", ms: "Tukar bahan yang diselamatkan menjadi hidangan lazat dan berkhasiat!" },
    input_label: { en: "What ingredients do you have?", zh: "您有什么食材？", ms: "Apakah bahan yang anda ada?" },
    input_placeholder: { en: "Type an ingredient (e.g., tomato, chicken)...", zh: "输入食材（例如：番茄、鸡肉）...", ms: "Taip bahan (cth: tomato, ayam)..." },
    add: { en: "Add", zh: "添加", ms: "Tambah" },
    quick_add: { en: "Quick add from your rescued crops:", zh: "从您拯救的农产品中快速添加：", ms: "Tambah pantas dari tanaman yang diselamatkan:" },
    generate: { en: "🍽️ Generate Meal Ideas", zh: "🍽️ 生成膳食建议", ms: "🍽️ Jana Idea Hidangan" },
    your_ingredients: { en: "Your Ingredients", zh: "您的食材", ms: "Bahan Anda" },
    suggested_meals: { en: "Suggested Meals", zh: "建议膳食", ms: "Hidangan Dicadangkan" },
    calories: { en: "Calories", zh: "卡路里", ms: "Kalori" },
    protein: { en: "Protein", zh: "蛋白质", ms: "Protein" },
    nutrition: { en: "Nutrition Level", zh: "营养等级", ms: "Tahap Pemakanan" },
    missing: { en: "Missing Ingredients", zh: "缺少食材", ms: "Bahan yang Tiada" },
    nearby_surplus: { en: "Available nearby as surplus!", zh: "附近有剩余的可用！", ms: "Tersedia berdekatan sebagai lebihan!" },
    cooking_guide: { en: "Cooking Guide", zh: "烹饪指南", ms: "Panduan Memasak" },
    step: { en: "Step", zh: "步骤", ms: "Langkah" },
    no_meals: { en: "No meals found with your ingredients. Try adding more!", zh: "未找到匹配的膳食。尝试添加更多食材！", ms: "Tiada hidangan ditemui dengan bahan anda. Cuba tambah lagi!" },
    servings: { en: "servings", zh: "份", ms: "hidangan" },
    minutes: { en: "min", zh: "分钟", ms: "minit" },
    no_ingredients: { en: "Add at least 2 ingredients to generate meal ideas", zh: "添加至少2种食材以生成膳食建议", ms: "Tambah sekurang-kurangnya 2 bahan untuk menjana idea hidangan" },
  };

  const l = (key: keyof typeof labels) => labels[key][language];

  // Get some crops for quick-add
  const quickCrops = crops.slice(0, 6).filter((c) => !c.isBundle);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <ChefHat className="h-5 w-5 text-primary" />
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{l("title")}</h1>
          <p className="text-muted-foreground">{l("subtitle")}</p>
        </div>

        {/* Input Section */}
        <div className="farm-card p-6 mb-6 space-y-4">
          <label className="font-heading font-bold text-foreground">{l("input_label")}</label>
          <div className="flex gap-2">
            <Input
              placeholder={l("input_placeholder")}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addIngredient()}
              className="flex-1"
            />
            <VoiceInput onResult={(text) => {
              const normalized = normalizeIngredient(text);
              const toAdd = normalized || text.toLowerCase().trim();
              if (toAdd && !selectedIngredients.includes(toAdd)) {
                setSelectedIngredients((prev) => [...prev, toAdd]);
              }
            }} />
            <Button onClick={addIngredient} size="sm">
              <Plus className="h-4 w-4 mr-1" /> {l("add")}
            </Button>
          </div>

          {/* Selected ingredients */}
          {selectedIngredients.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{l("your_ingredients")}:</p>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ing) => (
                  <Badge key={ing} variant="secondary" className="gap-1 px-3 py-1.5 text-sm capitalize">
                    {ing}
                    <button onClick={() => removeIngredient(ing)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Quick add from marketplace */}
          {quickCrops.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{l("quick_add")}</p>
              <div className="flex flex-wrap gap-2">
                {quickCrops.map((crop) => (
                  <button
                    key={crop.id}
                    onClick={() => quickAddFromMarket(crop.name)}
                    className="px-3 py-1.5 rounded-full bg-farm-green-light text-primary text-xs font-medium hover:bg-primary/20 transition-colors"
                  >
                    + {translateContent(crop.name, language)}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button
            onClick={generateMeals}
            disabled={selectedIngredients.length < 2}
            className="w-full rounded-full"
            size="lg"
          >
            {selectedIngredients.length < 2 ? l("no_ingredients") : l("generate")}
          </Button>
        </div>

        {/* Results */}
        {hasSearched && (
          <div className="space-y-4">
            <h2 className="font-heading font-bold text-foreground text-lg">{l("suggested_meals")}</h2>

            {suggestedMeals.length === 0 ? (
              <div className="farm-card p-8 text-center">
                <span className="text-4xl mb-4 block">🤔</span>
                <p className="text-muted-foreground">{l("no_meals")}</p>
              </div>
            ) : (
              suggestedMeals.map((meal, idx) => {
                const missing = getMissingIngredients(meal);
                const isExpanded = expandedMeal === idx;
                const matchedCount = meal.ingredients.filter((ing) => selectedIngredients.includes(ing)).length;

                return (
                  <div key={idx} className="farm-card overflow-hidden">
                    <div
                      className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedMeal(isExpanded ? null : idx)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-heading font-bold text-foreground text-lg">{meal.name[language]}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {meal.time} {l("minutes")}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {meal.servings} {l("servings")}</span>
                          </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-0">
                          {matchedCount}/{meal.ingredients.length} ✓
                        </Badge>
                      </div>

                      {/* Nutrition */}
                      <div className="flex flex-wrap gap-3 mb-3">
                        <div className="flex items-center gap-1.5 text-sm">
                          <Flame className="h-4 w-4 text-farm-orange" />
                          <span className="text-muted-foreground">{l("calories")}:</span>
                          <span className="font-bold">{meal.calories} kcal</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-sm">
                          <Dumbbell className="h-4 w-4 text-primary" />
                          <span className="text-muted-foreground">{l("protein")}:</span>
                          <span className="font-bold">{getNutritionLabel(meal.proteinKey)}</span>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getNutritionColor(meal.nutritionLevel)}`}>
                        <Leaf className="h-3 w-3" />
                        {getNutritionLabel(meal.nutritionKey)}
                      </div>

                      {/* Missing ingredients */}
                      {missing.length > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <p className="text-xs font-medium text-destructive mb-1">{l("missing")}:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {missing.map((m) => (
                              <span key={m} className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs capitalize">
                                {m}
                              </span>
                            ))}
                          </div>
                          {/* Check if any missing ingredient is available in the market */}
                          {missing.some((m) => 
                            crops.some((c) => normalizeIngredient(c.name) === m)
                          ) && (
                            <p className="text-xs text-primary mt-2 flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" />
                              {l("nearby_surplus")}
                            </p>
                          )}
                        </div>
                      )}

                      <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                        <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        {l("cooking_guide")}
                      </div>
                    </div>

                    {/* Expanded cooking guide */}
                    {isExpanded && (
                      <div className="border-t border-border p-5 bg-secondary/20">
                        <h4 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                          <Wheat className="h-4 w-4 text-primary" />
                          {l("cooking_guide")}
                        </h4>
                        <ol className="space-y-3">
                          {meal.steps[language].map((step, sIdx) => (
                            <li key={sIdx} className="flex gap-3">
                              <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">
                                {sIdx + 1}
                              </span>
                              <p className="text-sm text-foreground pt-0.5">{step}</p>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MealPlannerPage;
