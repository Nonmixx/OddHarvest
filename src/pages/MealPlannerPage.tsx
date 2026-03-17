import { useCallback, useEffect, useRef, useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { translateContent } from "@/lib/contentTranslations";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import VoiceInput from "@/components/VoiceInput";
import { ChefHat, Sparkles, Flame, Dumbbell, Wheat, Leaf, ShoppingCart, X, Plus, ArrowRight, Clock, Users, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface AIMeal {
  name: string;
  calories: number;
  protein: "High" | "Medium" | "Low";
  nutritionLevel: "balanced" | "high_protein" | "high_carb";
  servings: number;
  time: number;
  ingredients: string[];
  missingIngredients: string[];
  steps: string[];
}

// Ingredient aliases for matching user input
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
  "rice": ["rice", "米饭", "nasi"],
  "tofu": ["tofu", "豆腐", "tauhu"],
  "prawn": ["prawn", "prawns", "shrimp", "虾", "udang"],
  "fish": ["fish", "鱼", "ikan"],
  "eggplant": ["eggplant", "aubergine", "茄子", "terung"],
  "mushroom": ["mushroom", "mushrooms", "蘑菇", "cendawan"],
  "ginger": ["ginger", "姜", "halia"],
  "coconut milk": ["coconut milk", "santan", "椰奶"],
};

// Display names for ingredients per language
const INGREDIENT_DISPLAY: Record<string, Record<string, string>> = {
  "tomato": { en: "Tomato", zh: "番茄", ms: "Tomato" },
  "carrot": { en: "Carrot", zh: "胡萝卜", ms: "Lobak Merah" },
  "cucumber": { en: "Cucumber", zh: "黄瓜", ms: "Timun" },
  "apple": { en: "Apple", zh: "苹果", ms: "Epal" },
  "corn": { en: "Corn", zh: "玉米", ms: "Jagung" },
  "bell pepper": { en: "Bell Pepper", zh: "彩椒", ms: "Lada Benggala" },
  "banana": { en: "Banana", zh: "香蕉", ms: "Pisang" },
  "spinach": { en: "Spinach", zh: "菠菜", ms: "Bayam" },
  "chili": { en: "Chili", zh: "辣椒", ms: "Cili" },
  "chicken": { en: "Chicken", zh: "鸡肉", ms: "Ayam" },
  "potato": { en: "Potato", zh: "土豆", ms: "Kentang" },
  "onion": { en: "Onion", zh: "洋葱", ms: "Bawang" },
  "garlic": { en: "Garlic", zh: "大蒜", ms: "Bawang Putih" },
  "egg": { en: "Egg", zh: "鸡蛋", ms: "Telur" },
  "basil": { en: "Basil", zh: "罗勒", ms: "Selasih" },
  "mint": { en: "Mint", zh: "薄荷", ms: "Pudina" },
  "soy sauce": { en: "Soy Sauce", zh: "酱油", ms: "Kicap" },
  "milk": { en: "Milk", zh: "牛奶", ms: "Susu" },
  "honey": { en: "Honey", zh: "蜂蜜", ms: "Madu" },
  "pasta": { en: "Pasta", zh: "意面", ms: "Pasta" },
  "lemon": { en: "Lemon", zh: "柠檬", ms: "Lemon" },
  "rice": { en: "Rice", zh: "米饭", ms: "Nasi" },
  "tofu": { en: "Tofu", zh: "豆腐", ms: "Tauhu" },
  "prawn": { en: "Prawn", zh: "虾", ms: "Udang" },
  "fish": { en: "Fish", zh: "鱼", ms: "Ikan" },
  "eggplant": { en: "Eggplant", zh: "茄子", ms: "Terung" },
  "mushroom": { en: "Mushroom", zh: "蘑菇", ms: "Cendawan" },
  "ginger": { en: "Ginger", zh: "姜", ms: "Halia" },
  "coconut milk": { en: "Coconut Milk", zh: "椰奶", ms: "Santan" },
};

function displayIngredient(key: string, lang: string): string {
  return INGREDIENT_DISPLAY[key]?.[lang] || translateContent(key, lang as "en" | "zh" | "ms") || key.charAt(0).toUpperCase() + key.slice(1);
}

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
  const [suggestedMeals, setSuggestedMeals] = useState<AIMeal[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  const generateMeals = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setExpandedMeal(null);
    setSuggestedMeals([]);

    try {
      const { data, error } = await supabase.functions.invoke("meal-planner", {
        body: { ingredients: selectedIngredients, language },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error(labels.error[language]);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const meals = data?.meals || [];
      setSuggestedMeals(meals);

      if (meals.length === 0) {
        toast.info(labels.no_meals[language]);
      }
    } catch (err) {
      console.error("Failed to generate meals:", err);
      toast.error(labels.error[language]);
    } finally {
      setIsLoading(false);
    }
  };

  const getNutritionColor = (level: string) => {
    switch (level) {
      case "balanced": return "bg-primary/10 text-primary";
      case "high_protein": return "bg-accent/10 text-accent";
      case "high_carb": return "bg-farm-orange/20 text-farm-orange";
      default: return "bg-muted text-muted-foreground";
    }
  };

  const getNutritionLabel = (level: string) => {
    const map: Record<string, Record<string, string>> = {
      "balanced": { en: "Balanced Meal ✅", zh: "均衡膳食 ✅", ms: "Hidangan Seimbang ✅" },
      "high_protein": { en: "High Protein 💪", zh: "高蛋白 💪", ms: "Protein Tinggi 💪" },
      "high_carb": { en: "High Carbs 🍞", zh: "高碳水 🍞", ms: "Karbohidrat Tinggi 🍞" },
    };
    return map[level]?.[language] ?? level;
  };

  const getProteinLabel = (protein: string) => {
    const map: Record<string, Record<string, string>> = {
      "High": { en: "High", zh: "高", ms: "Tinggi" },
      "Medium": { en: "Medium", zh: "中等", ms: "Sederhana" },
      "Low": { en: "Low", zh: "低", ms: "Rendah" },
    };
    return map[protein]?.[language] ?? protein;
  };

  const labels = {
    title: { en: "AI Smart Meal Planner 🍳", zh: "AI 智能膳食规划师 🍳", ms: "Perancang Hidangan Pintar AI 🍳" },
    subtitle: { en: "Turn your rescued ingredients into delicious, nutritious meals — powered by AI!", zh: "用 AI 将您拯救的食材变成美味又营养的膳食！", ms: "Tukar bahan yang diselamatkan menjadi hidangan lazat dan berkhasiat — dikuasakan oleh AI!" },
    input_label: { en: "What ingredients do you have?", zh: "您有什么食材？", ms: "Apakah bahan yang anda ada?" },
    input_placeholder: { en: "Type an ingredient (e.g., tomato, chicken, rice)...", zh: "输入食材（例如：番茄、鸡肉、米饭）...", ms: "Taip bahan (cth: tomato, ayam, nasi)..." },
    add: { en: "Add", zh: "添加", ms: "Tambah" },
    quick_add: { en: "Quick add from your rescued crops:", zh: "从您拯救的农产品中快速添加：", ms: "Tambah pantas dari tanaman yang diselamatkan:" },
    generate: { en: "🍽️ Generate Meal Ideas with AI", zh: "🍽️ 用 AI 生成膳食建议", ms: "🍽️ Jana Idea Hidangan dengan AI" },
    generating: { en: "🤖 AI is cooking up ideas...", zh: "🤖 AI 正在构思菜谱...", ms: "🤖 AI sedang menjana idea..." },
    your_ingredients: { en: "Your Ingredients", zh: "您的食材", ms: "Bahan Anda" },
    suggested_meals: { en: "AI Suggested Meals", zh: "AI 建议膳食", ms: "Hidangan Dicadangkan AI" },
    calories: { en: "Calories", zh: "卡路里", ms: "Kalori" },
    protein: { en: "Protein", zh: "蛋白质", ms: "Protein" },
    nutrition: { en: "Nutrition Level", zh: "营养等级", ms: "Tahap Pemakanan" },
    missing: { en: "Missing Ingredients", zh: "缺少食材", ms: "Bahan yang Tiada" },
    nearby_surplus: { en: "Available nearby as surplus!", zh: "附近有剩余的可用！", ms: "Tersedia berdekatan sebagai lebihan!" },
    cooking_guide: { en: "Cooking Guide", zh: "烹饪指南", ms: "Panduan Memasak" },
    step: { en: "Step", zh: "步骤", ms: "Langkah" },
    no_meals: { en: "No meals found. Try different ingredients!", zh: "未找到匹配的膳食。尝试不同的食材！", ms: "Tiada hidangan ditemui. Cuba bahan lain!" },
    servings: { en: "servings", zh: "份", ms: "hidangan" },
    minutes: { en: "min", zh: "分钟", ms: "minit" },
    no_ingredients: { en: "Add at least 2 ingredients to generate meal ideas", zh: "添加至少2种食材以生成膳食建议", ms: "Tambah sekurang-kurangnya 2 bahan untuk menjana idea hidangan" },
    error: { en: "Failed to generate meals. Please try again.", zh: "生成膳食失败。请再试一次。", ms: "Gagal menjana hidangan. Sila cuba lagi." },
    ai_badge: { en: "Powered by AI", zh: "AI 驱动", ms: "Dikuasakan AI" },
    all_ingredients: { en: "All Ingredients Needed", zh: "所需全部食材", ms: "Semua Bahan Diperlukan" },
    analyzing: { en: "Analyzing your ingredients and finding the best recipes...", zh: "正在分析您的食材并寻找最佳食谱...", ms: "Menganalisis bahan anda dan mencari resipi terbaik..." },
    meals_count: { en: "meals", zh: "道菜", ms: "hidangan" },
  };

  const l = (key: keyof typeof labels) => labels[key][language];

  const quickCrops = crops.slice(0, 8).filter((c) => !c.isBundle);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            <ChefHat className="h-5 w-5 text-primary" />
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">{l("ai_badge")}</span>
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
                  <Badge key={ing} variant="secondary" className="gap-1 px-3 py-1.5 text-sm">
                    {displayIngredient(ing, language)}
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
            disabled={selectedIngredients.length < 2 || isLoading}
            className="w-full rounded-full"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {l("generating")}</>
            ) : selectedIngredients.length < 2 ? (
              l("no_ingredients")
            ) : (
              l("generate")
            )}
          </Button>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="farm-card p-10 text-center mb-6 animate-pulse">
            <div className="inline-flex items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="text-left">
                <p className="font-heading font-bold text-foreground">{l("generating")}</p>
                <p className="text-xs text-muted-foreground">
                  {language === "en" ? "Analyzing your ingredients and finding the best recipes..." :
                   language === "zh" ? "正在分析您的食材并寻找最佳食谱..." :
                   "Menganalisis bahan anda dan mencari resipi terbaik..."}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {hasSearched && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-foreground text-lg">{l("suggested_meals")}</h2>
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" /> {suggestedMeals.length} {language === "en" ? "meals" : language === "zh" ? "道菜" : "hidangan"}
              </Badge>
            </div>

            {suggestedMeals.length === 0 ? (
              <div className="farm-card p-8 text-center">
                <span className="text-4xl mb-4 block">🤔</span>
                <p className="text-muted-foreground">{l("no_meals")}</p>
              </div>
            ) : (
              suggestedMeals.map((meal, idx) => {
                const isExpanded = expandedMeal === idx;
                const matchedCount = meal.ingredients.filter((ing) =>
                  selectedIngredients.some((si) => ing.toLowerCase().includes(si) || si.includes(ing.toLowerCase()))
                ).length;

                return (
                  <div key={idx} className="farm-card overflow-hidden">
                    <div
                      className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedMeal(isExpanded ? null : idx)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-heading font-bold text-foreground text-lg">{meal.name}</h3>
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
                          <span className="font-bold">{getProteinLabel(meal.protein)}</span>
                        </div>
                      </div>

                      <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${getNutritionColor(meal.nutritionLevel)}`}>
                        <Leaf className="h-3 w-3" />
                        {getNutritionLabel(meal.nutritionLevel)}
                      </div>

                      {/* Missing ingredients */}
                      {meal.missingIngredients && meal.missingIngredients.length > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <p className="text-xs font-medium text-destructive mb-1">{l("missing")}:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {meal.missingIngredients.map((m, i) => (
                              <span key={i} className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs capitalize">
                                {m}
                              </span>
                            ))}
                          </div>
                          {meal.missingIngredients.some((m) =>
                            crops.some((c) => {
                              const norm = normalizeIngredient(c.name);
                              return norm && m.toLowerCase().includes(norm);
                            })
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
                        {/* All ingredients needed */}
                        <div className="mb-4">
                          <h4 className="font-heading font-bold text-foreground text-sm mb-2">{l("all_ingredients")}:</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {meal.ingredients.map((ing, i) => {
                              const isAvailable = selectedIngredients.some(
                                (si) => ing.toLowerCase().includes(si) || si.includes(ing.toLowerCase())
                              );
                              return (
                                <span
                                  key={i}
                                  className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${
                                    isAvailable
                                      ? "bg-primary/10 text-primary"
                                      : "bg-destructive/10 text-destructive"
                                  }`}
                                >
                                  {isAvailable ? "✓" : "✗"} {ing}
                                </span>
                              );
                            })}
                          </div>
                        </div>

                        <h4 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                          <Wheat className="h-4 w-4 text-primary" />
                          {l("cooking_guide")}
                        </h4>
                        <ol className="space-y-3">
                          {meal.steps.map((step, sIdx) => (
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
