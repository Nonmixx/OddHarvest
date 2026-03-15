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
import { IMPERFECT_REASONS, ImperfectReason } from "@/contexts/CartContext";
import VoiceInput from "@/components/VoiceInput";

const STATES = ["Pahang", "Perak", "Kelantan", "Sabah", "Johor", "Selangor", "Penang", "Kedah", "Terengganu", "Melaka", "Negeri Sembilan", "Perlis", "Sarawak", "Kuala Lumpur", "Putrajaya", "Labuan"];

const AddCropPage = () => {
  const navigate = useNavigate();
  const { addCrop } = useCropInventory();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [qty, setQty] = useState("");
  const [usualPrice, setUsualPrice] = useState("");
  const [discPrice, setDiscPrice] = useState("");
  const [harvestDate, setHarvestDate] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [location, setLocation] = useState("");
  const [state, setState] = useState("");
  const [reason, setReason] = useState<ImperfectReason>("irregular_shape");
  const [desc, setDesc] = useState("");

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
    addCrop({
      id: crypto.randomUUID(),
      name,
      image: images[0] || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
      images: images.length > 0 ? images : undefined,
      quantity: Number(qty),
      usualPrice: Number(usualPrice),
      discountPrice: Number(discPrice),
      farmLocation: location,
      state,
      farmerName: "You",
      sellerId: "seller-self",
      sellerType: "farm",
      description: desc,
      harvestDate: new Date(harvestDate).toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      distanceKm: Math.floor(Math.random() * 50) + 1,
      imperfectReason: reason,
    });
    toast.success(t("farmer.crop_added") + " 🌽");
    navigate("/farmer-dashboard");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/farmer-dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.back_dashboard")}
        </Button>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">{t("farmer.add_new")}</h1>

        <form onSubmit={handleSubmit} className="farm-card p-6 space-y-5">
          <div className="space-y-1.5">
            <Label>{t("farmer.crop_name")}</Label>
            <div className="flex gap-2">
              <Input placeholder="e.g. Tomatoes (Imperfect Shape)" value={name} onChange={(e) => setName(e.target.value)} required />
              <VoiceInput onResult={(text) => setName((prev) => prev ? prev + " " + text : text)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("farmer.imperfect_reason")}</Label>
            <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={reason} onChange={(e) => setReason(e.target.value as ImperfectReason)} required>
              {IMPERFECT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.emoji} {t(`imperfect.${r.value}`)}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label>{t("common.photos_max")}</Label>
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
                  <span className="text-[10px] text-muted-foreground mt-1">{t("common.add")}</span>
                  <input type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("farmer.description")}</Label>
            <div className="flex gap-2">
              <Input placeholder={t("common.describe_crop")} value={desc} onChange={(e) => setDesc(e.target.value)} />
              <VoiceInput onResult={(text) => setDesc((prev) => prev ? prev + " " + text : text)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("farmer.qty")}</Label>
              <Input type="number" min={0.1} step="0.1" placeholder="50" value={qty} onChange={(e) => setQty(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("farmer.usual_price")}</Label>
              <Input type="number" step="0.01" min={0} placeholder="5.00" value={usualPrice} onChange={(e) => setUsualPrice(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("farmer.disc_price")}</Label>
              <Input type="number" step="0.01" min={0} placeholder="3.00" value={discPrice} onChange={(e) => setDiscPrice(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("farmer.harvest_date")}</Label>
              <Input type="date" value={harvestDate} onChange={(e) => setHarvestDate(e.target.value)} required />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("mystery.expiry")}</Label>
            <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("farmer.location")}</Label>
              <div className="flex gap-2">
                <Input placeholder="e.g. Ladang Pak Ali" value={location} onChange={(e) => setLocation(e.target.value)} required />
                <VoiceInput onResult={(text) => setLocation((prev) => prev ? prev + " " + text : text)} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>{t("farmer.state")}</Label>
              <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={state} onChange={(e) => setState(e.target.value)} required>
                <option value="">{t("common.select_state")}</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <Button type="submit" className="rounded-full w-full" size="lg">{t("farmer.add_listing")}</Button>
        </form>
      </div>
    </div>
  );
};

export default AddCropPage;
