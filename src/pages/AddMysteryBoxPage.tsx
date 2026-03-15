import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import VoiceInput from "@/components/VoiceInput";

const AddMysteryBoxPage = () => {
  const navigate = useNavigate();
  const { addCrop } = useCropInventory();
  const { t } = useLanguage();

  const [name, setName] = useState("");
  const [weight, setWeight] = useState("");
  const [price, setPrice] = useState("");
  const [qty, setQty] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [description, setDescription] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const boxPrice = Number(price);
    addCrop({
      id: crypto.randomUUID(),
      name,
      image: "",
      quantity: Number(qty),
      usualPrice: boxPrice,
      discountPrice: boxPrice,
      farmLocation: "Your Farm",
      state: "Selangor",
      farmerName: "You",
      sellerId: "seller-self",
      sellerType: "farm",
      description: description || t("mystery.desc_placeholder"),
      harvestDate: new Date().toISOString(),
      expiryDate: expiryDate ? new Date(expiryDate).toISOString() : undefined,
      distanceKm: 0,
      imperfectReason: "irregular_shape",
      isBundle: true,
      isMysteryBox: true,
      bundleWeight: Number(weight),
    });
    toast.success(t("farmer.mystery_added") + " 🎁");
    navigate("/farmer-dashboard");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-4" onClick={() => navigate("/farmer-dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-2" /> {t("common.back_dashboard")}
        </Button>
        <h1 className="text-2xl font-heading font-bold text-foreground mb-6">🎁 {t("mystery.title")}</h1>

        <form onSubmit={handleSubmit} className="farm-card p-6 space-y-5">
          <div className="space-y-1.5">
            <Label>{t("mystery.name")}</Label>
            <div className="flex gap-2">
              <Input placeholder={t("mystery.name_placeholder")} value={name} onChange={(e) => setName(e.target.value)} required />
              <VoiceInput onResult={(text) => setName((prev) => prev ? prev + " " + text : text)} />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label>{t("mystery.description")}</Label>
            <div className="flex gap-2">
              <Input placeholder={t("mystery.desc_placeholder")} value={description} onChange={(e) => setDescription(e.target.value)} />
              <VoiceInput onResult={(text) => setDescription((prev) => prev ? prev + " " + text : text)} />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("mystery.weight")}</Label>
              <Input type="number" step="0.1" min={0.1} placeholder="3" value={weight} onChange={(e) => setWeight(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("mystery.price")}</Label>
              <Input type="number" step="0.01" min={0} placeholder="10.00" value={price} onChange={(e) => setPrice(e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>{t("mystery.quantity")}</Label>
              <Input type="number" min={1} placeholder="10" value={qty} onChange={(e) => setQty(e.target.value)} required />
            </div>
            <div className="space-y-1.5">
              <Label>{t("mystery.expiry")}</Label>
              <Input type="date" value={expiryDate} onChange={(e) => setExpiryDate(e.target.value)} />
            </div>
          </div>

          <div className="bg-secondary/50 rounded-xl p-4 text-sm text-muted-foreground">
            <p className="font-medium text-foreground mb-1">🎁 {t("mystery.info_title")}</p>
            <p>{t("mystery.info_desc")}</p>
          </div>

          <Button type="submit" className="rounded-full w-full" size="lg">🎁 {t("mystery.add_btn")}</Button>
        </form>
      </div>
    </div>
  );
};

export default AddMysteryBoxPage;
