import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Sprout, Package, Recycle, Plus, ImageIcon, TrendingDown, CalendarDays, Pencil, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import VoiceInput from "@/components/VoiceInput";

const STATES = ["Pahang", "Perak", "Kelantan", "Sabah", "Johor", "Selangor", "Penang", "Kedah", "Terengganu", "Melaka"];

const FarmerDashboard = () => {
  const navigate = useNavigate();
  const { crops, updateCrop, addCrop } = useCropInventory();
  const { t } = useLanguage();
  const [showForm, setShowForm] = useState(false);
  const [editCropId, setEditCropId] = useState<string | null>(null);
  const [editData, setEditData] = useState<any>(null);

  // New crop form state
  const [newName, setNewName] = useState("");
  const [newImage, setNewImage] = useState("");
  const [newQty, setNewQty] = useState("");
  const [newUsual, setNewUsual] = useState("");
  const [newDisc, setNewDisc] = useState("");
  const [newHarvest, setNewHarvest] = useState("");
  const [newLocation, setNewLocation] = useState("");
  const [newState, setNewState] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCrop({
      id: crypto.randomUUID(),
      name: newName,
      image: newImage || "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop",
      quantity: Number(newQty),
      usualPrice: Number(newUsual),
      discountPrice: Number(newDisc),
      farmLocation: newLocation,
      state: newState,
      farmerName: "You",
      harvestDate: new Date(newHarvest).toISOString(),
      distanceKm: Math.floor(Math.random() * 50) + 1,
    });
    toast.success("Crop listing added! 🌽");
    setShowForm(false);
    setNewName(""); setNewImage(""); setNewQty(""); setNewUsual(""); setNewDisc(""); setNewHarvest(""); setNewLocation(""); setNewState("");
  };

  const openEdit = (crop: any) => {
    setEditCropId(crop.id);
    setEditData({
      name: crop.name,
      quantity: crop.quantity,
      usualPrice: crop.usualPrice,
      discountPrice: crop.discountPrice,
      farmLocation: crop.farmLocation,
      state: crop.state,
    });
  };

  const handleSaveEdit = () => {
    if (!editCropId || !editData) return;
    updateCrop(editCropId, {
      name: editData.name,
      quantity: editData.quantity,
      usualPrice: editData.usualPrice,
      discountPrice: editData.discountPrice,
      farmLocation: editData.farmLocation,
      state: editData.state,
    });
    setEditCropId(null);
    setEditData(null);
    toast.success("Listing updated! ✅");
  };

  const getFreshness = (harvestDate: string) => {
    const days = Math.floor((Date.now() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 2) return "🟢 Very Fresh";
    if (days <= 5) return "🟠 Use Soon";
    return "🔴 Expiring";
  };

  const getDaysAgo = (harvestDate: string) => {
    const days = Math.floor((Date.now() - new Date(harvestDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days === 0) return "Today";
    return `${days} day${days > 1 ? "s" : ""} ago`;
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
          <Button className="rounded-full" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            {t("farmer.add_crop")}
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Sprout} label={t("farmer.listed")} value={crops.length} />
          <div className="cursor-pointer" onClick={() => navigate("/farmer-sold-crops")}>
            <StatCard icon={Package} label={t("farmer.sold")} value={8} color="bg-farm-orange-light" />
          </div>
          <StatCard icon={Recycle} label={t("farmer.rescued")} value={120} />
          <StatCard icon={TrendingDown} label={t("farmer.waste")} value="96%" color="bg-farm-green-light" />
        </div>

        {/* View sold crops link */}
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

        {/* Impact banner */}
        <div className="farm-card p-6 mb-8 bg-farm-green-light border-primary/20">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Recycle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground text-lg">{t("farmer.impact")}</h2>
              <p className="text-muted-foreground">
                You helped rescue <span className="text-primary font-bold">120 kg</span> of crops from food waste.
                That's equivalent to preventing <span className="text-primary font-bold">240 kg</span> of CO₂ emissions!
              </p>
            </div>
          </div>
        </div>

        {/* Add crop form */}
        {showForm && (
          <div className="farm-card p-6 mb-8 animate-fade-in-up">
            <h2 className="font-heading font-bold text-foreground text-lg mb-4">{t("farmer.add_new")}</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("farmer.crop_name")}</Label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. Tomatoes (Imperfect Shape)" value={newName} onChange={(e) => setNewName(e.target.value)} required />
                  <VoiceInput onResult={(text) => setNewName(text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.image_url")}</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://..." value={newImage} onChange={(e) => setNewImage(e.target.value)} />
                  <Button type="button" variant="outline" size="icon"><ImageIcon className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.qty")}</Label>
                <Input type="number" min={1} placeholder="50" value={newQty} onChange={(e) => setNewQty(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.usual_price")}</Label>
                <Input type="number" step="0.01" min={0} placeholder="5.00" value={newUsual} onChange={(e) => setNewUsual(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.disc_price")}</Label>
                <Input type="number" step="0.01" min={0} placeholder="3.00" value={newDisc} onChange={(e) => setNewDisc(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.harvest_date")}</Label>
                <Input type="date" value={newHarvest} onChange={(e) => setNewHarvest(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.location")}</Label>
                <div className="flex gap-2">
                  <Input placeholder="e.g. Ladang Pak Ali, Cameron Highlands" value={newLocation} onChange={(e) => setNewLocation(e.target.value)} required />
                  <VoiceInput onResult={(text) => setNewLocation(text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("farmer.state")}</Label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={newState} onChange={(e) => setNewState(e.target.value)} required>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="rounded-full w-full">{t("farmer.add_listing")}</Button>
              </div>
            </form>
          </div>
        )}

        {/* Crop listings from shared inventory */}
        <h2 className="font-heading font-bold text-foreground text-lg mb-4">{t("farmer.listings")}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {crops.map((c) => (
            <div key={c.id} className="farm-card p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-heading font-bold text-foreground text-sm">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.quantity} kg · {c.state}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7"
                    onClick={() => openEdit(c)}
                  >
                    <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                  <span className={`text-xs ${c.quantity > 0 ? "farm-badge-green" : "farm-badge-orange"}`}>
                    {c.quantity > 0 ? "Active" : "Sold Out"}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <span className="price-original text-xs">RM{c.usualPrice.toFixed(2)}</span>
                <span className="text-primary font-bold text-sm">RM{c.discountPrice.toFixed(2)}/kg</span>
                <span className="text-xs text-muted-foreground">· {t("product.save")} {Math.round(((c.usualPrice - c.discountPrice) / c.usualPrice) * 100)}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                <span>{t("product.harvested")} {getDaysAgo(c.harvestDate)}</span>
                <span>{getFreshness(c.harvestDate)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />

      {/* Edit Dialog */}
      <Dialog open={editCropId !== null} onOpenChange={(open) => { if (!open) { setEditCropId(null); setEditData(null); } }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="font-heading">{t("farmer.edit")}</DialogTitle>
          </DialogHeader>
          {editData && (
            <div className="grid gap-4 py-2">
              <div className="space-y-1.5">
                <Label>{t("farmer.crop_name")}</Label>
                <div className="flex gap-2">
                  <Input value={editData.name} onChange={(e) => setEditData({ ...editData, name: e.target.value })} />
                  <VoiceInput onResult={(text) => setEditData({ ...editData, name: text })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>{t("farmer.qty")}</Label>
                  <Input type="number" value={editData.quantity} onChange={(e) => setEditData({ ...editData, quantity: Number(e.target.value) })} />
                </div>
                <div className="space-y-1.5">
                  <Label>{t("farmer.state")}</Label>
                  <select
                    className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                    value={editData.state}
                    onChange={(e) => setEditData({ ...editData, state: e.target.value })}
                  >
                    {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
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
                <div className="flex gap-2">
                  <Input value={editData.farmLocation} onChange={(e) => setEditData({ ...editData, farmLocation: e.target.value })} />
                  <VoiceInput onResult={(text) => setEditData({ ...editData, farmLocation: text })} />
                </div>
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
