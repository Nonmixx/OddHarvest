import { useState } from "react";
import { CropListing } from "@/contexts/CartContext";
import { useCart } from "@/contexts/CartContext";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { MapPin, ShoppingCart, Clock, Sprout, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { getFreshnessInfo } from "@/lib/freshness";

interface ProductCardProps {
  crop: CropListing;
}

const ProductCard = ({ crop }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { updateStock } = useCropInventory();
  const { t } = useLanguage();
  const [qty, setQty] = useState(1);
  const discount = Math.round(((crop.usualPrice - crop.discountPrice) / crop.usualPrice) * 100);
  const freshness = getFreshnessInfo(crop.harvestDate);
  const outOfStock = crop.quantity <= 0;

  const handleAdd = () => {
    if (outOfStock || qty > crop.quantity) return;
    addToCart(crop, qty);
    updateStock(crop.id, qty);
    toast.success(`${qty} kg ${crop.name} ${t("product.added")} 🥕`);
    setQty(1);
  };

  return (
    <div className="farm-card overflow-hidden group animate-fade-in-up">
      <div className="relative overflow-hidden">
        <img
          src={crop.image}
          alt={crop.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 farm-badge-green text-xs font-bold">
          {t("product.save")} {discount}%
        </span>
        <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          {freshness.emoji} {freshness.label}
        </span>
      </div>
      <div className="p-4 space-y-2.5">
        <h3 className="font-heading font-bold text-foreground leading-tight">{crop.name}</h3>

        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{crop.farmLocation}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="farm-badge-orange">{crop.state}</span>
          <span className={`flex items-center gap-1 ${outOfStock ? "text-destructive font-bold" : "text-muted-foreground"}`}>
            <Sprout className="h-3 w-3" />
            {outOfStock ? t("product.out_of_stock") : `${crop.quantity} ${t("product.left")}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{t("product.harvested")}: {freshness.daysAgo}</span>
        </div>

        {crop.distanceKm && (
          <div className="text-xs text-muted-foreground">
            📍 {crop.distanceKm} {t("product.from_you")}
          </div>
        )}

        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="price-original">RM{crop.usualPrice.toFixed(2)}/kg</p>
            <p className="price-discount">RM{crop.discountPrice.toFixed(2)}/kg</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            {!outOfStock && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setQty(Math.max(1, qty - 1))}
                  className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                >
                  <Minus className="h-3 w-3" />
                </button>
                <input
                  type="number"
                  min={1}
                  max={crop.quantity}
                  value={qty}
                  onChange={(e) => {
                    const v = Number(e.target.value);
                    if (v >= 1 && v <= crop.quantity) setQty(v);
                    else if (v < 1) setQty(1);
                    else setQty(crop.quantity);
                  }}
                  className="w-12 text-center text-sm font-bold bg-background border border-input rounded-md py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                />
                <span className="text-xs text-muted-foreground">kg</span>
                <button
                  onClick={() => setQty(Math.min(crop.quantity, qty + 1))}
                  className="h-6 w-6 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                >
                  <Plus className="h-3 w-3" />
                </button>
              </div>
            )}
            <Button
              size="sm"
              onClick={handleAdd}
              className="rounded-full"
              disabled={outOfStock}
            >
              <ShoppingCart className="h-4 w-4 mr-1" />
              {outOfStock ? t("product.out_of_stock") : t("product.add")}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
