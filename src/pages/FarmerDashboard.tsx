import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sprout, Package, Recycle, Plus, TrendingDown, CalendarDays, Pencil, ChevronRight, Trash2, User, Timer, Gift } from "lucide-react";
import { toast } from "sonner";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent, translateContentArray } from "@/lib/contentTranslations";
import { IMPERFECT_REASONS } from "@/contexts/CartContext";
import { formatDistance, getPriceUnitLabel, getUnitLabel } from "@/lib/freshness";

const STATES = ["Pahang", "Perak", "Kelantan", "Sabah", "Johor", "Selangor", "Penang", "Kedah", "Terengganu", "Melaka"];

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { crops, updateCrop, removeCrop } = useCropInventory();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);
  const [editCropId, setEditCropId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  const openEdit = (crop: any) => {
    setEditCropId(crop.id);
    setEditData({
      name: crop.name, quantity: crop.quantity, usualPrice: crop.usualPrice,
      discountPrice: crop.discountPrice, farmLocation: crop.farmLocation,
      state: crop.state, imperfectReason: crop.imperfectReason,
    });
  };

  const handleSaveEdit = () => {
    if (!editCropId || !editData) return;
    updateCrop(editCropId, editData);
    setEditCropId(null);
    setEditData(null);
    toast.success(t("farmer.listing_updated") + " ✅");
  };

  const handleDelete = (cropId: string) => {
    removeCrop(cropId);
    toast.success(t("farmer.listing_removed") + " 🗑️");
  };

  const getFreshness = (harvestDate: string) => {
    const days = Math.floor((Date.now() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 2) return "🟢 " + t("farmer.very_fresh");
    if (days <= 5) return "🟠 " + t("farmer.use_soon");
    return "🔴 " + t("farmer.expiring");
  };

  const getDaysAgo = (harvestDate: string) => {
    const days = Math.floor((Date.now() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return t("farmer.today");
    return `${days} ${days > 1 ? t("farmer.days_ago") : t("farmer.day_ago")}`;
  };

  const getExpiryLabel = (expiryDate?: string) => {
    if (!expiryDate) return null;
    const diffDays = Math.floor((new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (diffDays <= 0) return "⚠️ " + t("product.expired");
    if (diffDays <= 2) return `🔥 ${diffDays}d`;
    return `${diffDays}d`;
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">{t("farmer.title")}</h1>
            <p className="text-muted-foreground text-sm mt-1">{t("farmer.subtitle")}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/add-mystery-box")}>
              <Gift className="h-4 w-4 mr-1" /> {t("farmer.add_mystery_box")}
            </Button>
            <Button variant="outline" className="rounded-full" onClick={() => navigate("/add-bundle")}>
              <Package className="h-4 w-4 mr-1" /> {t("farmer.add_bundle")}
            </Button>
            <Button className="rounded-full" onClick={() => navigate("/add-crop")}>
              <Plus className="h-4 w-4 mr-1" /> {t("farmer.add_crop")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Sprout} label={t("farmer.listed")} value={crops.length} />
          <div className="cursor-pointer" onClick={() => navigate("/farmer-sold-crops")}>
            <StatCard icon={Package} label={t("farmer.sold")} value={8} color="bg-farm-orange-light" />
          </div>
          <StatCard icon={Recycle} label={t("farmer.rescued")} value={120} />
          <StatCard icon={TrendingDown} label={t("farmer.waste")} value="96%" color="bg-farm-green-light" />
        </div>

        <div
          className="farm-card p-4 mb-8 cursor-pointer hover:shadow-md transition-shadow flex items-center justify-between"
          onClick={() => navigate("/farmer-sold-crops")}
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-accent/10 flex items-center justify-center">
              <Package className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="font-heading font-bold text-foreground text-sm">{t("farmer.view_sold")}</p>
              <p className="text-xs text-muted-foreground">{t("farmer.view_sold.desc")}</p>
            </div>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground" />
        </div>

        <div className="farm-card p-6 mb-8 bg-farm-green-light border-primary/20">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Recycle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground text-lg">{t("farmer.impact")}</h2>
              <p className="text-muted-foreground">
                {t("farmer.impact_desc1")} <span className="text-primary font-bold">120 kg</span> {t("farmer.impact_desc2")} <span className="text-primary font-bold">240 kg</span> {t("farmer.impact_desc3")}
              </p>
            </div>
          </div>
        </div>

        <h2 className="font-heading font-bold text-foreground text-lg mb-4">{t("farmer.listings")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crops.map((c) => {
            const expiryLabel = getExpiryLabel(c.expiryDate);
            return (
              <div key={c.id} className="farm-card p-4 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-heading font-bold text-foreground text-sm">{tc(c.name)}</h3>
                      {c.isMysteryBox ? (
                        <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">🎁 {t("product.mystery_box")}</span>
                      ) : c.isBundle ? (
                        <span className="text-xs bg-accent/10 text-accent px-2 py-0.5 rounded-full">📦 {t("product.bundle")}</span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">{c.quantity} {getUnitLabel(language, c.isBundle ? "box" : "kg")} · {tc(c.state)}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(c)}>
                      <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(c.id)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                    <span className={`text-xs ${c.quantity > 0 ? "farm-badge-green" : "farm-badge-orange"}`}>
                      {c.quantity > 0 ? t("farmer.active") : t("farmer.sold_out")}
                    </span>
                  </div>
                </div>
                {c.imperfectReason && (
                  <span className="farm-badge-orange text-[11px]">
                    {IMPERFECT_REASONS.find((r) => r.value === c.imperfectReason)?.emoji} {t(`imperfect.${c.imperfectReason}`)}
                  </span>
                )}
                {c.isBundle && c.bundleContents && (
                  <p className="text-xs text-muted-foreground">📦 {translateContentArray(c.bundleContents, language).join(", ")} ({c.bundleWeight} {getUnitLabel(language, "kg")})</p>
                )}
                <div className="flex gap-2 items-center">
                  {c.isBundle ? (
                    <span className="text-primary font-bold text-sm">RM{c.discountPrice.toFixed(2)}{getPriceUnitLabel(language, "box")}</span>
                  ) : (
                    <>
                      <span className="price-original text-xs">RM{c.usualPrice.toFixed(2)}{getPriceUnitLabel(language, "kg")}</span>
                      <span className="text-primary font-bold text-sm">RM{c.discountPrice.toFixed(2)}{getPriceUnitLabel(language, "kg")}</span>
                      <span className="text-xs text-muted-foreground">· {t("product.save")} {Math.round(((c.usualPrice - c.discountPrice) / c.usualPrice) * 100)}%</span>
                    </>
                  )}
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="h-3 w-3" />
                  <span>{t("product.harvested")} {getDaysAgo(c.harvestDate)}</span>
                  <span>{getFreshness(c.harvestDate)}</span>
                </div>
                {expiryLabel && (
                  <div className="flex items-center gap-1 text-xs font-medium text-farm-orange">
                    <Timer className="h-3 w-3" />
                    <span>{t("farmer.expiry")}: {expiryLabel}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
      <Footer />

      <Dialog open={editCropId !== null} onOpenChange={(open) => { if (!open) { setEditCropId(null); setEditData(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("farmer.edit")}</DialogTitle>
          </DialogHeader>
          {editData && (
            <div className="grid gap-4 py-2">
              <div className="space-y-1.5">
                <Label>{t("farmer.crop_name")}</Label>
                <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.imperfect_reason")}</Label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={editData.imperfectReason} onChange={(e) => setEditData({ ...editData, imperfectReason: e.target.value })}>
                  {IMPERFECT_REASONS.map((r) => (
                    <option key={r.value} value={r.value}>{r.emoji} {t(`imperfect.${r.value}`)}</option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("farmer.qty")}</Label>
                  <Input type="number" value={editData.quantity} onChange={(e) => setEditData({ ...editData, quantity: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("farmer.state")}</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={editData.state} onChange={(e) => setEditData({ ...editData, state: e.target.value })}>
                    {STATES.map((s) => <option key={s} value={s}>{tc(s)}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("farmer.usual_price")}</Label>
                  <Input type="number" step="0.01" value={editData.usualPrice} onChange={(e) => setEditData({ ...editData, usualPrice: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("farmer.disc_price")}</Label>
                  <Input type="number" step="0.01" value={editData.discountPrice} onChange={(e) => setEditData({ ...editData, discountPrice: Number(e.target.value) })} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.location")}</Label>
                <Input value={editData.farmLocation} onChange={(e) => setEditData({ ...editData, farmLocation: e.target.value })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" className="rounded-full" onClick={() => { setEditCropId(null); setEditData(null); }}>{t("farmer.cancel")}</Button>
            <Button className="rounded-full" onClick={handleSaveEdit}>{t("farmer.save")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FarmerDashboard;
