import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, ImagePlus, X, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import VoiceInput from "@/components/VoiceInput";
import { Badge } from "@/components/ui/badge";
import { invokeGenerateDescription } from "@/lib/geminiClient";
import { resolveSellerIdForFarmer } from "@/lib/demoPersonas";

const AddBundlePage = () => {
  const navigate = useNavigate();
  const { addCrop } = useCropInventory();
  const { user } = useAuth();
  const { t, language } = useLanguage();

  const [name, setName] = useState("");
  const [contents, setContents] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [expiryDate, setExpiryDate] = useState("");
  const [desc, setDesc] = useState("");
  const [isAiDesc, setIsAiDesc] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remaining = 5 - images.length;
    Array.from(files).slice(0, remaining).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setImages((prev) => [...prev.slice(0, 4), ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleGenerateDescription = async () => {
    if (!name) {
      toast.error("Please enter a bundle name first");
      return;
    }
    setGenerating(true);
    try {
      const { data, error } = await invokeGenerateDescription({
        name,
        bundleContents: contents,
        isBundle: true,
        language,
      });
      if (error) throw error;
      if (data?.error) {
        toast.error(data.error);
        return;
      }
      if (data?.description) {
        setDesc(data.description);
        setIsAiDesc(true);
        toast.success("Description generated! ✨");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to generate description");
    } finally {
      setGenerating(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const contentList = contents.split(",").map((s) => s.trim()).filter(Boolean);
    const bundlePrice = Number(price);
    addCrop({
      id: crypto.randomUUID(),
      name,
      image: images[0] || "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=400&h=300&fit=crop",
      images: images.length > 0 ? images : undefined,
      quantity: Number(qty),
      usualPrice: bundlePrice,
      discountPrice: bundlePrice,
      farmLocation: user?.farmName || "Your Farm",
      state: user?.state || "Selangor",
      farmerName: user?.name || "You",
      sellerId: user ? resolveSellerIdForFarmer(user.id, user.email) : "seller-self",
      sellerType: "farm",
      description: desc,
      harvestDate: new Date().toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      distanceKm: 0,
      imperfectReason: "irregular_shape",
      isBundle: true,
      bundleContents: contentList,
      bundleWeight: Number(weight),
      isAiDescription: isAiDesc && desc.length > 0,
    });
    toast.success(t("farmer.bundle_added") + " 📦");
    navigate("/farmer-dashboard");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/farmer-dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.back_dashboard")}
        </Button>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">📦 {t("farmer.create_bundle")}</h1>

        <form onSubmit={handleSubmit} className="farm-card p-6 space-y-5">
          <div className="space-y-1.5">
            <Label>{t("farmer.bundle_name")}</Label>
            <div className="flex gap-2">
              <Input placeholder={t("farmer.bundle_name_placeholder")} value={name} onChange={(e) => setName(e.target.value)} required />
              <VoiceInput onResult={(text) => setName((prev) => prev ? prev + " " + text : text)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("farmer.bundle_contents")}</Label>
            <div className="flex gap-2">
              <Input placeholder={t("farmer.bundle_contents_placeholder")} value={contents} onChange={(e) => setContents(e.target.value)} required />
              <VoiceInput onResult={(text) => setContents((prev) => prev ? prev + ", " + text : text)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("common.photos_max")}</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
                  <img src={img} alt={`${t("common.profile")} ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">{t("common.add")}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>{t("common.description")}</Label>
              {isAiDesc && desc && (
                <Badge variant="secondary" className="text-[10px] gap-1">
                  <Sparkles className="h-3 w-3" /> {t("common.ai_generated")}
                </Badge>
              )}
            </div>
            <Textarea
              placeholder={t("common.describe_bundle")}
              value={desc}
              onChange={(e) => {
                setDesc(e.target.value);
                if (isAiDesc) setIsAiDesc(false);
              }}
              rows={3}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="mt-1.5 gap-1.5"
              onClick={handleGenerateDescription}
              disabled={generating}
            >
              {generating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
              {generating ? t("common.generating") : t("common.generate_ai")}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("farmer.bundle_weight")}</Label>
              <Input type="number" step="0.1" min={0.1} placeholder="5" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("bundle.price")}</Label>
              <Input type="number" step="0.01" min={0} placeholder="12.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("farmer.qty")}</Label>
              <Input type="number" min={1} placeholder="10" value={qty} onChange={(e) => setQty(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("mystery.expiry")}</Label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <Button type="submit" className="rounded-full w-full" size="lg">📦 {t("farmer.add_bundle")}</Button>
        </form>
      </div>
    </div>
  );
};

export default AddBundlePage;
