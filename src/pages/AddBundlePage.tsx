import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, ImagePlus, X } from "lucide-react";
import { toast } from "sonner";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import VoiceInput from "@/components/VoiceInput";

const AddBundlePage = () => {
  const navigate = useNavigate();
  const { addCrop } = useCropInventory();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [contents, setContents] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [expiryDate, setExpiryDate] = useState("");

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
      farmLocation: "Your Farm",
      state: "Selangor",
      farmerName: "You",
      sellerId: "seller-self",
      sellerType: "farm",
      harvestDate: new Date().toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      distanceKm: 0,
      imperfectReason: "irregular_shape",
      isBundle: true,
      bundleContents: contentList,
      bundleWeight: Number(weight),
    });
    toast.success(t("farmer.bundle_added") + " 📦");
    navigate("/farmer-dashboard");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/farmer-dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
        </Button>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">📦 {t("farmer.create_bundle")}</h1>

        <form onSubmit={handleSubmit} className="farm-card p-6 space-y-5">
          <div className="space-y-1.5">
            <Label>{t("farmer.bundle_name")}</Label>
            <div className="flex gap-2">
              <Input placeholder="e.g. Rescue Veggie Box" value={name} onChange={(e) => setName(e.target.value)} required />
              <VoiceInput onResult={(text) => setName((prev) => prev ? prev + " " + text : text)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("farmer.bundle_contents")}</Label>
            <div className="flex gap-2">
              <Input placeholder="Carrots, Cucumbers, Tomatoes" value={contents} onChange={(e) => setContents(e.target.value)} required />
              <VoiceInput onResult={(text) => setContents((prev) => prev ? prev + ", " + text : text)} />
            </div>
          </div>

          {/* Image upload */}
          <div className="space-y-1.5">
            <Label>Photos (max 5)</Label>
            <div className="flex flex-wrap gap-3">
              {images.map((img, idx) => (
                <div key={idx} className="relative h-20 w-20 rounded-lg overflow-hidden border border-border">
                  <img src={img} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removeImage(idx)} className="absolute top-0.5 right-0.5 bg-destructive text-destructive-foreground rounded-full h-5 w-5 flex items-center justify-center">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              {images.length < 5 && (
                <label className="h-20 w-20 rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-colors">
                  <ImagePlus className="h-5 w-5 text-muted-foreground" />
                  <span className="text-[10px] text-muted-foreground mt-1">Add</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("farmer.bundle_weight")}</Label>
              <Input type="number" step="0.1" min={0.1} placeholder="5" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Bundle Price (RM/box)</Label>
              <Input type="number" step="0.01" min={0} placeholder="12.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("farmer.qty")}</Label>
              <Input type="number" min={1} placeholder="10" value={qty} onChange={(e) => setQty(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>Estimated Expiry Date</Label>
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
