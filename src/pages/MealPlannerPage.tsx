import { useState, useEffect, useRef } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useAuth } from "@/contexts/AuthContext";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { translateContent } from "@/lib/contentTranslations";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import VoiceInput from "@/components/VoiceInput";
import {
  ChefHat, Sparkles, Flame, Dumbbell, Wheat, Leaf, ShoppingCart, X, Plus,
  ArrowRight, Clock, Users, Loader2, Snowflake, AlertTriangle, Lightbulb,
  Timer, Wrench, GraduationCap,
} from "lucide-react";
import { toast } from "sonner";

// ───────── Types ─────────

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

interface PreservationMethod {
  name: string;
  type: string;
  difficulty: string;
  timeNeeded: string;
  shelfLife: string;
  ingredientsNeeded: string[];
  toolsNeeded: string[];
  steps: string[];
  tips: string;
}

interface UpcycleIdea {
  name: string;
  description: string;
  emoji: string;
}

interface PreservationResult {
  foodItem: string;
  spoilageRisk: "low" | "medium" | "high";
  spoilageTimeframe: string;
  methods: PreservationMethod[];
  upcycleIdeas: UpcycleIdea[];
}

type Mode = "meal" | "preservation";

// ───────── Ingredient data ─────────

const INGREDIENT_ALIASES: Record<string, string[]> = {
  "tomato": ["tomato", "tomatoes", "番茄"],
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
  "pasta": ["pasta", "noodle", "noodles", "意面"],
  "lemon": ["lemon", "柠檬"],
  "rice": ["rice", "米饭", "nasi"],
  "tofu": ["tofu", "豆腐", "tauhu"],
  "prawn": ["prawn", "prawns", "shrimp", "虾", "udang"],
  "fish": ["fish", "鱼", "ikan"],
  "eggplant": ["eggplant", "aubergine", "茄子", "terung"],
  "mushroom": ["mushroom", "mushrooms", "蘑菇", "cendawan"],
  "ginger": ["ginger", "姜", "halia"],
  "coconut milk": ["coconut milk", "santan", "椰奶"],
};

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

// ───────── Labels ─────────

const labels = {
  // shared
  title: { en: "AI Smart Meal Planner 🍳", zh: "AI 智能膳食规划师 🍳", ms: "Perancang Hidangan Pintar AI 🍳" },
  subtitle: { en: "Turn your rescued ingredients into delicious, nutritious meals — powered by AI!", zh: "用 AI 将您拯救的食材变成美味又营养的膳食！", ms: "Tukar bahan yang diselamatkan menjadi hidangan lazat dan berkhasiat — dikuasakan oleh AI!" },
  input_label: { en: "What ingredients do you have?", zh: "您有什么食材？", ms: "Apakah bahan yang anda ada?" },
  input_placeholder: { en: "Type an ingredient (e.g., tomato, chicken, rice)...", zh: "输入食材（例如：番茄、鸡肉、米饭）...", ms: "Taip bahan (cth: tomato, ayam, nasi)..." },
  add: { en: "Add", zh: "添加", ms: "Tambah" },
  quick_add: { en: "Quick add from your rescued crops:", zh: "从您拯救的农产品中快速添加：", ms: "Tambah pantas dari tanaman yang diselamatkan:" },
  your_ingredients: { en: "Your Ingredients", zh: "您的食材", ms: "Bahan Anda" },
  ai_badge: { en: "Powered by AI", zh: "AI 驱动", ms: "Dikuasakan AI" },
  error: { en: "Failed to generate results. Please try again.", zh: "生成结果失败。请再试一次。", ms: "Gagal menjana keputusan. Sila cuba lagi." },
  no_ingredients: { en: "Add at least 2 ingredients to get started", zh: "添加至少2种食材以开始", ms: "Tambah sekurang-kurangnya 2 bahan untuk bermula" },

  // mode toggle
  meal_mode: { en: "🍽️ Meal Mode", zh: "🍽️ 膳食模式", ms: "🍽️ Mod Hidangan" },
  preservation_mode: { en: "❄️ Preservation Mode", zh: "❄️ 保鲜模式", ms: "❄️ Mod Pengawetan" },

  // meal mode
  generate: { en: "🍽️ Generate Meal Ideas with AI", zh: "🍽️ 用 AI 生成膳食建议", ms: "🍽️ Jana Idea Hidangan dengan AI" },
  generating: { en: "🤖 AI is cooking up ideas...", zh: "🤖 AI 正在构思菜谱...", ms: "🤖 AI sedang menjana idea..." },
  suggested_meals: { en: "AI Suggested Meals", zh: "AI 建议膳食", ms: "Hidangan Dicadangkan AI" },
  calories: { en: "Calories", zh: "卡路里", ms: "Kalori" },
  protein: { en: "Protein", zh: "蛋白质", ms: "Protein" },
  missing: { en: "Missing Ingredients", zh: "缺少食材", ms: "Bahan yang Tiada" },
  nearby_surplus: { en: "Available nearby as surplus!", zh: "附近有剩余的可用！", ms: "Tersedia berdekatan sebagai lebihan!" },
  cooking_guide: { en: "Cooking Guide", zh: "烹饪指南", ms: "Panduan Memasak" },
  step: { en: "Step", zh: "步骤", ms: "Langkah" },
  no_meals: { en: "No meals found. Try different ingredients!", zh: "未找到匹配的膳食。尝试不同的食材！", ms: "Tiada hidangan ditemui. Cuba bahan lain!" },
  servings: { en: "servings", zh: "份", ms: "hidangan" },
  minutes: { en: "min", zh: "分钟", ms: "minit" },
  all_ingredients: { en: "All Ingredients Needed", zh: "所需全部食材", ms: "Semua Bahan Diperlukan" },
  analyzing: { en: "Analyzing your ingredients and finding the best recipes...", zh: "正在分析您的食材并寻找最佳食谱...", ms: "Menganalisis bahan anda dan mencari resipi terbaik..." },
  meals_count: { en: "meals", zh: "道菜", ms: "hidangan" },

  // preservation mode
  pres_title: { en: "AI Preservation Mode 🧊", zh: "AI 保鲜模式 🧊", ms: "Mod Pengawetan AI 🧊" },
  pres_subtitle: { en: "Don't waste it. Preserve it. Transform it.", zh: "别浪费。保存它。转化它。", ms: "Jangan bazir. Awetkan. Ubahkan." },
  pres_generate: { en: "🧊 Get Preservation Guide", zh: "🧊 获取保鲜指南", ms: "🧊 Dapatkan Panduan Pengawetan" },
  pres_generating: { en: "🤖 AI is analyzing preservation options...", zh: "🤖 AI 正在分析保鲜方案...", ms: "🤖 AI sedang menganalisis pilihan pengawetan..." },
  pres_analyzing: { en: "Evaluating spoilage risks and best preservation methods...", zh: "评估变质风险和最佳保鲜方法...", ms: "Menilai risiko kerosakan dan kaedah pengawetan terbaik..." },
  pres_results: { en: "Preservation Guide", zh: "保鲜指南", ms: "Panduan Pengawetan" },
  pres_no_results: { en: "No preservation suggestions found. Try different items!", zh: "未找到保鲜建议。尝试不同的食材！", ms: "Tiada cadangan pengawetan ditemui. Cuba bahan lain!" },
  spoilage_risk: { en: "Spoilage Risk", zh: "变质风险", ms: "Risiko Kerosakan" },
  spoilage_high: { en: "High", zh: "高", ms: "Tinggi" },
  spoilage_medium: { en: "Medium", zh: "中等", ms: "Sederhana" },
  spoilage_low: { en: "Low", zh: "低", ms: "Rendah" },
  shelf_life: { en: "Shelf Life", zh: "保质期", ms: "Jangka Hayat" },
  tools_needed: { en: "Tools Needed", zh: "所需工具", ms: "Alatan Diperlukan" },
  extra_ingredients: { en: "Extra Ingredients", zh: "额外食材", ms: "Bahan Tambahan" },
  pro_tip: { en: "Pro Tip", zh: "专业提示", ms: "Tip Pro" },
  upcycle_ideas: { en: "🔄 Upcycling Ideas", zh: "🔄 升级改造创意", ms: "🔄 Idea Kitar Semula" },
  view_steps: { en: "View Steps", zh: "查看步骤", ms: "Lihat Langkah" },
  items_count: { en: "items", zh: "项", ms: "item" },

  // preferences
  your_tools: { en: "What tools do you have?", zh: "您有什么工具？", ms: "Apakah alatan yang anda ada?" },
  skill_level: { en: "Your cooking level", zh: "您的烹饪水平", ms: "Tahap masakan anda" },
  time_available: { en: "How much time do you have?", zh: "您有多少时间？", ms: "Berapa banyak masa anda ada?" },
  beginner: { en: "Beginner", zh: "初学者", ms: "Pemula" },
  intermediate: { en: "Intermediate", zh: "中级", ms: "Pertengahan" },
  advanced: { en: "Advanced", zh: "高级", ms: "Lanjutan" },
  time_10: { en: "10 minutes", zh: "10 分钟", ms: "10 minit" },
  time_30: { en: "30 minutes", zh: "30 分钟", ms: "30 minit" },
  time_60: { en: "1 hour+", zh: "1 小时+", ms: "1 jam+" },
  tool_refrigerator: { en: "Refrigerator", zh: "冰箱", ms: "Peti Sejuk" },
  tool_freezer: { en: "Freezer", zh: "冷冻柜", ms: "Peti Beku" },
  tool_blender: { en: "Blender", zh: "搅拌机", ms: "Pengisar" },
  tool_dehydrator: { en: "Dehydrator", zh: "脱水机", ms: "Mesin Pengering" },
  tool_glass_jars: { en: "Glass Jars", zh: "玻璃罐", ms: "Balang Kaca" },
  tool_oven: { en: "Oven", zh: "烤箱", ms: "Ketuhar" },
};

// ───────── Component ─────────

const MealPlannerPage = () => {
  const { language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const { crops } = useCropInventory();

  const [mode, setMode] = useState<Mode>("meal");
  const [inputText, setInputText] = useState("");
  const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Meal mode state
  const [suggestedMeals, setSuggestedMeals] = useState<AIMeal[]>([]);
  const [expandedMeal, setExpandedMeal] = useState<number | null>(null);

  // Preservation mode state
  const [preservationResults, setPreservationResults] = useState<PreservationResult[]>([]);
  const [expandedPres, setExpandedPres] = useState<number | null>(null);
  const [expandedMethod, setExpandedMethod] = useState<string | null>(null);

  // Preservation preferences
  const [selectedTools, setSelectedTools] = useState<string[]>(["refrigerator", "freezer"]);
  const [skillLevel, setSkillLevel] = useState<string>("beginner");
  const [timeAvailable, setTimeAvailable] = useState<string>("30 minutes");

  const l = (key: keyof typeof labels) => labels[key][language];

  // Clear AI-generated results when language changes so user re-generates in new language
  const prevLangRef = useRef(language);
  useEffect(() => {
    if (prevLangRef.current !== language) {
      prevLangRef.current = language;
      setSuggestedMeals([]);
      setPreservationResults([]);
      setHasSearched(false);
      setExpandedMeal(null);
      setExpandedPres(null);
      setExpandedMethod(null);
    }
  }, [language]);

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

  const removeIngredient = (ing: string) => setSelectedIngredients((prev) => prev.filter((i) => i !== ing));

  const quickAddFromMarket = (cropName: string) => {
    const normalized = normalizeIngredient(cropName);
    if (normalized && !selectedIngredients.includes(normalized)) {
      setSelectedIngredients((prev) => [...prev, normalized]);
    }
  };

  const toggleTool = (tool: string) => {
    setSelectedTools((prev) =>
      prev.includes(tool) ? prev.filter((t) => t !== tool) : [...prev, tool]
    );
  };

  // ── Meal generation ──
  const generateMeals = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setExpandedMeal(null);
    setSuggestedMeals([]);
    try {
      const { data, error } = await supabase.functions.invoke("meal-planner", {
        body: { ingredients: selectedIngredients, language },
      });
      if (error) { toast.error(l("error")); return; }
      if (data?.error) { toast.error(data.error); return; }
      const meals = data?.meals || [];
      setSuggestedMeals(meals);
      if (meals.length === 0) toast.info(l("no_meals"));
    } catch { toast.error(l("error")); } finally { setIsLoading(false); }
  };

  // ── Preservation generation ──
  const generatePreservation = async () => {
    setIsLoading(true);
    setHasSearched(true);
    setExpandedPres(null);
    setExpandedMethod(null);
    setPreservationResults([]);
    try {
      const { data, error } = await supabase.functions.invoke("food-preservation", {
        body: {
          ingredients: selectedIngredients,
          language,
          tools: selectedTools,
          skillLevel,
          timeAvailable,
        },
      });
      if (error) { toast.error(l("error")); return; }
      if (data?.error) { toast.error(data.error); return; }
      const results = data?.preservations || [];
      setPreservationResults(results);
      if (results.length === 0) toast.info(l("pres_no_results"));
    } catch { toast.error(l("error")); } finally { setIsLoading(false); }
  };

  const handleGenerate = () => (mode === "meal" ? generateMeals() : generatePreservation());

  const switchMode = (newMode: Mode) => {
    setMode(newMode);
    setHasSearched(false);
    setSuggestedMeals([]);
    setPreservationResults([]);
    setExpandedMeal(null);
    setExpandedPres(null);
    setExpandedMethod(null);
  };

  // helpers
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
  const getSpoilageColor = (risk: string) => {
    switch (risk) {
      case "high": return "bg-destructive/10 text-destructive border-destructive/20";
      case "medium": return "bg-farm-orange/10 text-farm-orange border-farm-orange/20";
      case "low": return "bg-primary/10 text-primary border-primary/20";
      default: return "bg-muted text-muted-foreground";
    }
  };
  const getSpoilageLabel = (risk: string) => {
    const map: Record<string, keyof typeof labels> = { high: "spoilage_high", medium: "spoilage_medium", low: "spoilage_low" };
    return l(map[risk] || "spoilage_low");
  };
  const getDifficultyEmoji = (d: string) => {
    switch (d) { case "easy": return "🟢"; case "medium": return "🟡"; case "hard": return "🔴"; default: return "⚪"; }
  };

  const quickCrops = crops.slice(0, 8).filter((c) => !c.isBundle);

  const toolOptions = [
    { id: "refrigerator", label: l("tool_refrigerator") },
    { id: "freezer", label: l("tool_freezer") },
    { id: "blender", label: l("tool_blender") },
    { id: "dehydrator", label: l("tool_dehydrator") },
    { id: "glass_jars", label: l("tool_glass_jars") },
    { id: "oven", label: l("tool_oven") },
  ];

  const skillOptions = [
    { id: "beginner", label: l("beginner") },
    { id: "intermediate", label: l("intermediate") },
    { id: "advanced", label: l("advanced") },
  ];

  const timeOptions = [
    { id: "10 minutes", label: l("time_10"), icon: "⚡" },
    { id: "30 minutes", label: l("time_30"), icon: "⏱️" },
    { id: "1 hour+", label: l("time_60"), icon: "🕐" },
  ];

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 bg-primary/10 rounded-full px-4 py-2 mb-4">
            {mode === "meal" ? <ChefHat className="h-5 w-5 text-primary" /> : <Snowflake className="h-5 w-5 text-primary" />}
            <Sparkles className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-primary">{l("ai_badge")}</span>
          </div>
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">
            {mode === "meal" ? l("title") : l("pres_title")}
          </h1>
          <p className="text-muted-foreground">
            {mode === "meal" ? l("subtitle") : l("pres_subtitle")}
          </p>
        </div>

        {/* Mode Toggle */}
        <div className="flex justify-center mb-6">
          <div className="inline-flex bg-muted rounded-full p-1 gap-1">
            <button
              onClick={() => switchMode("meal")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === "meal" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l("meal_mode")}
            </button>
            <button
              onClick={() => switchMode("preservation")}
              className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all ${
                mode === "preservation" ? "bg-primary text-primary-foreground shadow-md" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {l("preservation_mode")}
            </button>
          </div>
        </div>

        {/* Ingredient Input */}
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
            <VoiceInput onResult={(text) => setInputText((prev) => (prev ? prev + " " + text : text))} />
            <Button onClick={addIngredient} size="sm">
              <Plus className="h-4 w-4 mr-1" /> {l("add")}
            </Button>
          </div>

          {selectedIngredients.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-2">{l("your_ingredients")}:</p>
              <div className="flex flex-wrap gap-2">
                {selectedIngredients.map((ing) => (
                  <Badge key={ing} variant="secondary" className="gap-1 px-3 py-1.5 text-sm">
                    {displayIngredient(ing, language)}
                    <button onClick={() => removeIngredient(ing)}><X className="h-3 w-3" /></button>
                  </Badge>
                ))}
              </div>
            </div>
          )}

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
        </div>

        {/* Preservation Preferences */}
        {mode === "preservation" && (
          <div className="farm-card p-6 mb-6 space-y-5">
            {/* Tools */}
            <div>
              <div className="mb-3">
                <span className="font-heading font-bold text-foreground text-sm">{l("your_tools")}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {toolOptions.map((tool) => (
                  <button
                    key={tool.id}
                    onClick={() => toggleTool(tool.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium border transition-all ${
                      selectedTools.includes(tool.id)
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {tool.label}
                    {selectedTools.includes(tool.id) && <span className="text-xs">✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* Skill Level */}
            <div>
              <div className="mb-3">
                <span className="font-heading font-bold text-foreground text-sm">{l("skill_level")}</span>
              </div>
              <div className="flex gap-2">
                {skillOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setSkillLevel(opt.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      skillLevel === opt.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Time */}
            <div>
              <div className="mb-3">
                <span className="font-heading font-bold text-foreground text-sm">{l("time_available")}</span>
              </div>
              <div className="flex gap-2">
                {timeOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setTimeAvailable(opt.id)}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                      timeAvailable === opt.id
                        ? "bg-primary/10 border-primary text-primary"
                        : "bg-background border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Generate Button */}
        <div className="mb-6">
          <Button
            onClick={handleGenerate}
            disabled={selectedIngredients.length < 2 || isLoading}
            className="w-full rounded-full"
            size="lg"
          >
            {isLoading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> {mode === "meal" ? l("generating") : l("pres_generating")}</>
            ) : selectedIngredients.length < 2 ? (
              l("no_ingredients")
            ) : mode === "meal" ? (
              l("generate")
            ) : (
              l("pres_generate")
            )}
          </Button>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="farm-card p-10 text-center mb-6 animate-pulse">
            <div className="inline-flex items-center gap-3">
              <Loader2 className="h-8 w-8 text-primary animate-spin" />
              <div className="text-left">
                <p className="font-heading font-bold text-foreground">
                  {mode === "meal" ? l("generating") : l("pres_generating")}
                </p>
                <p className="text-xs text-muted-foreground">
                  {mode === "meal" ? l("analyzing") : l("pres_analyzing")}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ═══ MEAL RESULTS ═══ */}
        {mode === "meal" && hasSearched && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-foreground text-lg">{l("suggested_meals")}</h2>
              <Badge variant="outline" className="text-xs gap-1">
                <Sparkles className="h-3 w-3" /> {suggestedMeals.length} {l("meals_count")}
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
                    <div className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors" onClick={() => setExpandedMeal(isExpanded ? null : idx)}>
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-heading font-bold text-foreground text-lg">{meal.name}</h3>
                          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {meal.time} {l("minutes")}</span>
                            <span className="flex items-center gap-1"><Users className="h-3 w-3" /> {meal.servings} {l("servings")}</span>
                          </div>
                        </div>
                        <Badge className="bg-primary/10 text-primary border-0">{matchedCount}/{meal.ingredients.length} ✓</Badge>
                      </div>
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
                        <Leaf className="h-3 w-3" /> {getNutritionLabel(meal.nutritionLevel)}
                      </div>
                      {meal.missingIngredients && meal.missingIngredients.length > 0 && (
                        <div className="mt-3 p-3 rounded-lg bg-destructive/5 border border-destructive/10">
                          <p className="text-xs font-medium text-destructive mb-1">{l("missing")}:</p>
                          <div className="flex flex-wrap gap-1.5">
                            {meal.missingIngredients.map((m, i) => (
                              <span key={i} className="px-2 py-0.5 bg-destructive/10 text-destructive rounded-full text-xs capitalize">
                                {displayIngredient(normalizeIngredient(m) || m.toLowerCase(), language)}
                              </span>
                            ))}
                          </div>
                          {meal.missingIngredients.some((m) =>
                            crops.some((c) => { const norm = normalizeIngredient(c.name); return norm && m.toLowerCase().includes(norm); })
                          ) && (
                            <p className="text-xs text-primary mt-2 flex items-center gap-1">
                              <ShoppingCart className="h-3 w-3" /> {l("nearby_surplus")}
                            </p>
                          )}
                        </div>
                      )}
                      <div className="flex items-center gap-1 mt-3 text-xs text-primary font-medium">
                        <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        {l("cooking_guide")}
                      </div>
                    </div>
                    {isExpanded && (
                      <div className="border-t border-border p-5 bg-secondary/20">
                        <div className="mb-4">
                          <h4 className="font-heading font-bold text-foreground text-sm mb-2">{l("all_ingredients")}:</h4>
                          <div className="flex flex-wrap gap-1.5">
                            {meal.ingredients.map((ing, i) => {
                              const isAvailable = selectedIngredients.some((si) => ing.toLowerCase().includes(si) || si.includes(ing.toLowerCase()));
                              return (
                                <span key={i} className={`px-2.5 py-1 rounded-full text-xs font-medium capitalize ${isAvailable ? "bg-primary/10 text-primary" : "bg-destructive/10 text-destructive"}`}>
                                  {isAvailable ? "✓" : "✗"} {displayIngredient(normalizeIngredient(ing) || ing.toLowerCase(), language)}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <h4 className="font-heading font-bold text-foreground mb-3 flex items-center gap-2">
                          <Wheat className="h-4 w-4 text-primary" /> {l("cooking_guide")}
                        </h4>
                        <ol className="space-y-3">
                          {meal.steps.map((step, sIdx) => (
                            <li key={sIdx} className="flex gap-3">
                              <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{sIdx + 1}</span>
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

        {/* ═══ PRESERVATION RESULTS ═══ */}
        {mode === "preservation" && hasSearched && !isLoading && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-heading font-bold text-foreground text-lg">{l("pres_results")}</h2>
              <Badge variant="outline" className="text-xs gap-1">
                <Snowflake className="h-3 w-3" /> {preservationResults.length} {l("items_count")}
              </Badge>
            </div>

            {preservationResults.length === 0 ? (
              <div className="farm-card p-8 text-center">
                <span className="text-4xl mb-4 block">🤔</span>
                <p className="text-muted-foreground">{l("pres_no_results")}</p>
              </div>
            ) : (
              preservationResults.map((item, idx) => {
                const isExpanded = expandedPres === idx;
                return (
                  <div key={idx} className="farm-card overflow-hidden">
                    <div
                      className="p-5 cursor-pointer hover:bg-secondary/30 transition-colors"
                      onClick={() => setExpandedPres(isExpanded ? null : idx)}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <h3 className="font-heading font-bold text-foreground text-lg capitalize">{item.foodItem}</h3>
                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border ${getSpoilageColor(item.spoilageRisk)}`}>
                          <AlertTriangle className="h-3 w-3" />
                          {l("spoilage_risk")}: {getSpoilageLabel(item.spoilageRisk)}
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">⏳ {item.spoilageTimeframe}</p>

                      {/* Method summary badges */}
                      <div className="flex flex-wrap gap-2 mb-2">
                        {item.methods.map((method, mIdx) => (
                          <span key={mIdx} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                            {getDifficultyEmoji(method.difficulty)} {method.name}
                          </span>
                        ))}
                      </div>

                      <div className="flex items-center gap-1 mt-2 text-xs text-primary font-medium">
                        <ArrowRight className={`h-3 w-3 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                        {l("view_steps")}
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border bg-secondary/20">
                        {/* Methods */}
                        {item.methods.map((method, mIdx) => {
                          const methodKey = `${idx}-${mIdx}`;
                          const isMethodExpanded = expandedMethod === methodKey;
                          return (
                            <div key={mIdx} className="border-b border-border/50 last:border-b-0">
                              <div
                                className="px-5 py-4 cursor-pointer hover:bg-secondary/40 transition-colors"
                                onClick={(e) => { e.stopPropagation(); setExpandedMethod(isMethodExpanded ? null : methodKey); }}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-3">
                                    <span className="text-lg">{getDifficultyEmoji(method.difficulty)}</span>
                                    <div>
                                      <h4 className="font-heading font-bold text-foreground">{method.name}</h4>
                                      <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {method.timeNeeded}</span>
                                        <span className="flex items-center gap-1"><Snowflake className="h-3 w-3" /> {l("shelf_life")}: {method.shelfLife}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <ArrowRight className={`h-4 w-4 text-primary transition-transform ${isMethodExpanded ? "rotate-90" : ""}`} />
                                </div>
                              </div>

                              {isMethodExpanded && (
                                <div className="px-5 pb-5 space-y-4">
                                  {/* Tools needed */}
                                  {method.toolsNeeded.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground mb-1.5 flex items-center gap-1">
                                        <Wrench className="h-3 w-3" /> {l("tools_needed")}:
                                      </p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {method.toolsNeeded.map((t, i) => (
                                          <span key={i} className="px-2.5 py-1 rounded-full bg-muted text-muted-foreground text-xs">{t}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Extra ingredients */}
                                  {method.ingredientsNeeded.length > 0 && (
                                    <div>
                                      <p className="text-xs font-medium text-muted-foreground mb-1.5">{l("extra_ingredients")}:</p>
                                      <div className="flex flex-wrap gap-1.5">
                                        {method.ingredientsNeeded.map((ing, i) => (
                                          <span key={i} className="px-2.5 py-1 rounded-full bg-farm-orange/10 text-farm-orange text-xs capitalize">{ing}</span>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Steps */}
                                  <div>
                                    <h5 className="font-heading font-bold text-foreground text-sm mb-3 flex items-center gap-2">
                                      <Wheat className="h-4 w-4 text-primary" /> {l("cooking_guide")}
                                    </h5>
                                    <ol className="space-y-3">
                                      {method.steps.map((step, sIdx) => (
                                        <li key={sIdx} className="flex gap-3">
                                          <span className="shrink-0 h-6 w-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center">{sIdx + 1}</span>
                                          <p className="text-sm text-foreground pt-0.5">{step}</p>
                                        </li>
                                      ))}
                                    </ol>
                                  </div>

                                  {/* Tip */}
                                  {method.tips && (
                                    <div className="flex items-start gap-2 p-3 rounded-lg bg-primary/5 border border-primary/10">
                                      <Lightbulb className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                                      <div>
                                        <p className="text-xs font-medium text-primary mb-0.5">{l("pro_tip")}</p>
                                        <p className="text-sm text-foreground">{method.tips}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {/* Upcycle Ideas */}
                        {item.upcycleIdeas && item.upcycleIdeas.length > 0 && (
                          <div className="px-5 py-4 bg-accent/5">
                            <h4 className="font-heading font-bold text-foreground text-sm mb-3">{l("upcycle_ideas")}</h4>
                            <div className="grid gap-2">
                              {item.upcycleIdeas.map((idea, uIdx) => (
                                <div key={uIdx} className="flex items-start gap-3 p-3 rounded-lg bg-background border border-border">
                                  <span className="text-xl">{idea.emoji}</span>
                                  <div>
                                    <p className="font-medium text-foreground text-sm">{idea.name}</p>
                                    <p className="text-xs text-muted-foreground">{idea.description}</p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MealPlannerPage;
