import { useCart } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { getPriceUnitLabel, getUnitLabel } from "@/lib/freshness";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">{t("cart.empty")}</h1>
          <p className="text-muted-foreground mb-6">{t("cart.empty.desc")}</p>
          <Link to="/marketplace">
            <Button className="rounded-full">{t("nav.marketplace")}</Button>
          </Link>
        </div>
      </div>
    );
  }

  const step = 0.1;

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-6">{t("cart.title")}</h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => {
            const isBundle = item.crop.isBundle;
            const unitLabel = getUnitLabel(language, isBundle ? "box" : "kg");
            const priceUnitLabel = getPriceUnitLabel(language, isBundle ? "box" : "kg");
            const qtyStep = isBundle ? 1 : step;
            return (
              <div key={item.crop.id} className="farm-card p-4 flex gap-4">
                <img src={item.crop.image} alt={tc(item.crop.name)} className="w-20 h-20 rounded-xl object-cover" />
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-foreground text-sm truncate">{tc(item.crop.name)}</h3>
                  <p className="text-xs text-muted-foreground">{tc(item.crop.farmLocation)}</p>
                  <div className="flex items-center gap-1 mt-1">
                    {!isBundle && <span className="price-original text-xs">RM{item.crop.usualPrice.toFixed(2)}</span>}
                    <span className="text-primary font-bold text-sm">RM{item.crop.discountPrice.toFixed(2)}/{unit}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end justify-between">
                  <button onClick={() => removeFromCart(item.crop.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateQuantity(item.crop.id, Math.round((item.quantity - qtyStep) * 10) / 10)}
                      className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                      disabled={item.quantity <= minQty}
                    >
                      <Minus className="h-3 w-3" />
                    </button>
                    <input
                      type="number"
                      min={minQty}
                      step={qtyStep}
                      value={item.quantity}
                      onChange={(e) => {
                        const v = Number(e.target.value);
                        if (v >= minQty) updateQuantity(item.crop.id, Math.round(v * 10) / 10);
                      }}
                      className="w-16 text-center font-bold text-sm bg-background border border-input rounded-md py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <span className="text-xs text-muted-foreground">{unit}</span>
                    <button
                      onClick={() => updateQuantity(item.crop.id, Math.round((item.quantity + qtyStep) * 10) / 10)}
                      className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                    >
                      <Plus className="h-3 w-3" />
                    </button>
                  </div>
                  <span className="font-bold text-sm text-foreground">
                    RM{(item.crop.discountPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Summary */}
        <div className="farm-card p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("cart.items")} ({itemCount})</span>
            <span className="font-medium">RM{total.toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-heading font-bold text-lg">{t("cart.total")}</span>
            <span className="font-heading font-bold text-lg text-primary">RM{total.toFixed(2)}</span>
          </div>
          <Link to="/checkout">
            <Button className="w-full rounded-full mt-2" size="lg">{t("cart.checkout")}</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
