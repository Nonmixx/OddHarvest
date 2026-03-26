import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { CropListing, IMPERFECT_REASONS } from "@/contexts/CartContext";
import { useCart } from "@/contexts/CartContext";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent, translateContentArray } from "@/lib/contentTranslations";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Clock, Package, Star, Timer, Gift } from "lucide-react";
import { toast } from "sonner";
import { formatDistance, getExpiryInfo, getFreshnessInfo, getPriceUnitLabel, getUnitLabel } from "@/lib/freshness";
import { mockSellers } from "@/data/mockSellers";
import mysteryBoxImg from "@/assets/mystery-box.png";

interface ProductCardProps {
  crop: CropListing;
}


const ProductCard = ({ crop }: ProductCardProps) => {
  const { addToCart } = useCart();
  const { updateStock } = useCropInventory();
  const { t, language } = useLanguage();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const tc = (text: string) => translateContent(text, language);
  const isBundle = crop.isBundle;
  const isMysteryBox = crop.isMysteryBox;
  const unitLabel = getUnitLabel(language, isBundle ? "box" : "kg");
  const priceUnitLabel = getPriceUnitLabel(language, isBundle ? "box" : "kg");
  const initQty = isBundle ? 1 : 0.5;
  const [qty, setQty] = useState(initQty);
  const [qtyInput, setQtyInput] = useState(String(initQty));
  const discount = isBundle ? 0 : Math.round(((crop.usualPrice - crop.discountPrice) / crop.usualPrice) * 100);
  const freshness = getFreshnessInfo(crop.harvestDate, language);
  const outOfStock = crop.quantity <= 0;
  const reasonInfo = IMPERFECT_REASONS.find((r) => r.value === crop.imperfectReason);
  const seller = mockSellers.find((s) => s.id === crop.sellerId);
  const expiryInfo = getExpiryInfo(crop.expiryDate, language);

  const handleAdd = () => {
    if (!isAuthenticated) {
      navigate("/auth");
      return;
    }
    if (outOfStock || qty > crop.quantity) return;
    addToCart(crop, qty);
    updateStock(crop.id, qty);
    toast.success(`${qty} ${unitLabel} ${tc(crop.name)} ${t("product.added")} 🥕`);
    const resetQty = isBundle ? 1 : 0.5;
    setQty(resetQty);
    setQtyInput(String(resetQty));
  };

  return (
    <div className="farm-card overflow-hidden group animate-fade-in-up">
      <div className="relative overflow-hidden">
        <img
          src={isMysteryBox ? mysteryBoxImg : crop.image}
          alt={tc(crop.name)}
          className={`w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300 ${isMysteryBox ? "object-contain bg-secondary p-4" : ""}`}
        />
        {!isBundle && discount > 0 && (
          <span className="absolute top-3 left-3 farm-badge-green text-xs font-bold">
            {t("product.save")} {discount}%
          </span>
        )}
        <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          {freshness.emoji} {freshness.label}
        </span>
        {isMysteryBox ? (
          <span className="absolute bottom-3 left-3 bg-primary text-primary-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Gift className="h-3 w-3" /> {t("product.mystery_box")}
          </span>
        ) : isBundle ? (
          <span className="absolute bottom-3 left-3 bg-accent text-accent-foreground text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Package className="h-3 w-3" /> {t("product.bundle")}
          </span>
        ) : null}
      </div>
      <div className="p-4 space-y-2.5">
        <h3 className="font-heading font-bold text-foreground leading-tight">{tc(crop.name)}</h3>

        <div className="flex items-center gap-2">
          <button onClick={() => isAuthenticated ? navigate(`/seller/${crop.sellerId}`) : navigate("/auth")} className="text-xs text-primary hover:underline font-medium flex items-center gap-1">
            {crop.sellerType === "community" ? "🌱" : "🌾"} {tc(crop.farmerName)}
          </button>
          {seller && (
            <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
              <Star className="h-3 w-3 text-farm-orange fill-current" /> {seller.averageRating}
            </span>
          )}
          {crop.sellerType === "community" && (
            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
              {t("product.community_grower")}
            </Badge>
          )}
        </div>

        {reasonInfo && (
          <div className="farm-badge-orange text-[11px] inline-flex gap-1">
            {reasonInfo.emoji} {t(`imperfect.${crop.imperfectReason}`)}
          </div>
        )}

        {isMysteryBox ? (
          <div className="text-xs text-muted-foreground bg-primary/10 rounded-lg p-2">
            <span className="font-medium text-foreground">🎁 {t("product.surprise")}</span>{" "}
            {t("product.surprise_desc")} {crop.bundleWeight} {getUnitLabel(language, "kg")} {t("product.rescued_produce")}
          </div>
        ) : isBundle && crop.bundleContents ? (
          <div className="text-xs text-muted-foreground bg-secondary rounded-lg p-2">
            <span className="font-medium text-foreground">{t("product.includes")}:</span>{" "}
            {translateContentArray(crop.bundleContents, language).join(", ")} ({crop.bundleWeight} {getUnitLabel(language, "kg")})
          </div>
        ) : null}

        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <span>📍</span>
          <span className="truncate">{tc(crop.farmLocation)}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="farm-badge-green text-[11px]">{tc(crop.state)}</span>
          <span className={`flex items-center gap-1 ${outOfStock ? "text-destructive font-bold" : "text-muted-foreground"}`}>
            <Sprout className="h-3 w-3" />
            {outOfStock ? t("product.out_of_stock") : `${crop.quantity} ${isBundle ? t("product.boxes_left") : t("product.left")}`}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>{t("product.harvested")}: {freshness.daysAgo}</span>
        </div>

        {expiryInfo && (
          <div className={`flex items-center gap-2 text-xs font-medium ${expiryInfo.color}`}>
            <Timer className={`h-3 w-3 ${expiryInfo.urgent ? "animate-pulse" : ""}`} />
            <span>⏰ {expiryInfo.urgent ? "🔥 " : ""}{expiryInfo.label}</span>
          </div>
        )}

        {crop.distanceKm && (
          <div className="text-xs text-muted-foreground">
            📍 {formatDistance(crop.distanceKm, language)} {language === "zh" ? "距离您" : t("product.from_you")}
          </div>
        )}

        <div className="flex items-end justify-between pt-1">
          <div>
            {isBundle ? (
              <p className="price-discount">RM{crop.discountPrice.toFixed(2)}{priceUnitLabel}</p>
            ) : (
              <>
                <p className="price-original">RM{crop.usualPrice.toFixed(2)}{getPriceUnitLabel(language, "kg")}</p>
                <p className="price-discount">RM{crop.discountPrice.toFixed(2)}{getPriceUnitLabel(language, "kg")}</p>
              </>
            )}
          </div>
          <div className="flex flex-col items-end gap-2">
            {!outOfStock && (
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => {
                    const step = isBundle ? 1 : 0.1;
                    const minVal = isBundle ? 1 : 0.1;
                    const newVal = Math.max(minVal, Math.round((qty - step) * 10) / 10);
                    setQty(newVal);
                    setQtyInput(String(newVal));
                  }}
                  className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 text-foreground"
                  disabled={qty <= (isBundle ? 1 : 0.1)}
                >
                  −
                </button>
                <input
                  type="text"
                  inputMode={isBundle ? "numeric" : "decimal"}
                  value={qtyInput}
                  onChange={(e) => {
                    const raw = e.target.value;
                    if (isBundle) {
                      if (raw === "" || /^\d*$/.test(raw)) {
                        setQtyInput(raw);
                        const v = parseInt(raw, 10);
                        if (!isNaN(v) && v > 0 && v <= crop.quantity) {
                          setQty(v);
                        }
                      }
                    } else {
                      if (raw === "" || /^\d*\.?\d*$/.test(raw)) {
                        setQtyInput(raw);
                        const v = parseFloat(raw);
                        if (!isNaN(v) && v > 0 && v <= crop.quantity) {
                          setQty(Math.round(v * 10) / 10);
                        }
                      }
                    }
                  }}
                  onBlur={() => {
                    if (isBundle) {
                      const v = parseInt(qtyInput, 10);
                      if (isNaN(v) || v < 1) {
                        setQty(1);
                        setQtyInput("1");
                      } else if (v > crop.quantity) {
                        setQty(crop.quantity);
                        setQtyInput(String(crop.quantity));
                      } else {
                        setQty(v);
                        setQtyInput(String(v));
                      }
                    } else {
                      const v = parseFloat(qtyInput);
                      const minVal = 0.1;
                      if (isNaN(v) || v < minVal) {
                        setQty(minVal);
                        setQtyInput(String(minVal));
                      } else if (v > crop.quantity) {
                        setQty(crop.quantity);
                        setQtyInput(String(crop.quantity));
                      } else {
                        const rounded = Math.round(v * 10) / 10;
                        setQty(rounded);
                        setQtyInput(String(rounded));
                      }
                    }
                  }}
                  className="w-14 text-center text-sm font-bold bg-background border border-input rounded-md py-1"
                />
                <span className="text-xs text-muted-foreground">{unitLabel}</span>
                <button
                  onClick={() => {
                    const step = isBundle ? 1 : 0.1;
                    const newVal = Math.min(crop.quantity, Math.round((qty + step) * 10) / 10);
                    setQty(newVal);
                    setQtyInput(String(newVal));
                  }}
                  className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80 text-foreground"
                  disabled={qty >= crop.quantity}
                >
                  +
                </button>
              </div>
            )}
            <Button size="sm" onClick={handleAdd} className="rounded-full" disabled={outOfStock}>
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
