import { useState, useRef, useMemo } from "react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { formatDistance, getUnitLabel } from "@/lib/freshness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, MapPin, Truck, PackageCheck, Wallet, Building, Banknote, Plus, Home, AlertCircle, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const DEFAULT_PICKUP_SLOTS: string[] = [
  "7:00 AM – 8:00 AM", "8:00 AM – 9:00 AM", "9:00 AM – 10:00 AM",
  "10:00 AM – 11:00 AM", "11:00 AM – 12:00 PM", "12:00 PM – 1:00 PM",
  "1:00 PM – 2:00 PM", "2:00 PM – 3:00 PM", "3:00 PM – 4:00 PM",
  "4:00 PM – 5:00 PM", "5:00 PM – 6:00 PM", "6:00 PM – 7:00 PM",
];

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [payment, setPayment] = useState<"cash" | "ewallet" | "bank">("ewallet");
  const [pickupSlot, setPickupSlot] = useState(DEFAULT_PICKUP_SLOTS[2]);
  const [confirmed, setConfirmed] = useState(false);
  const [customSlot, setCustomSlot] = useState("");
  const [pickupSlots, setPickupSlots] = useState(DEFAULT_PICKUP_SLOTS);

  // Group items by seller and calculate per-seller delivery fees
  const sellerGroups = useMemo(() => {
    const groups: Record<string, { sellerName: string; sellerLocation: string; items: typeof items; distance: number; deliveryFee: number }> = {};
    items.forEach((item) => {
      const sid = item.crop.sellerId;
      if (!groups[sid]) {
        groups[sid] = {
          sellerName: item.crop.farmerName,
          sellerLocation: item.crop.farmLocation,
          items: [],
          distance: item.crop.distanceKm,
          deliveryFee: Math.max(1, item.crop.distanceKm * 1),
        };
      }
      groups[sid].items.push(item);
    });
    return groups;
  }, [items]);

  const totalDeliveryFee = delivery === "delivery"
    ? Object.values(sellerGroups).reduce((sum, g) => sum + g.deliveryFee, 0)
    : 0;
  const grandTotal = total + totalDeliveryFee;

  const savedRef = useRef({ total: 0, totalDeliveryFee: 0, grandTotal: 0, items: [] as typeof items, sellerGroups: {} as typeof sellerGroups });

  const userAddress = user?.address || "";
  const userLocation = user?.location || "";
  const userState = user?.state || "";
  const fullAddress = [userAddress, userLocation, userState].filter(Boolean).join(", ");
  const pickupArea = user?.preferredPickupArea || "";

  const handleConfirm = () => {
    savedRef.current = { total, totalDeliveryFee, grandTotal, items: [...items], sellerGroups: { ...sellerGroups } };
    setConfirmed(true);
    clearCart();
  };

  const addCustomSlot = () => {
    if (customSlot.trim() && !pickupSlots.includes(customSlot.trim())) {
      setPickupSlots((prev) => [...prev, customSlot.trim()]);
      setPickupSlot(customSlot.trim());
      setCustomSlot("");
    }
  };

  const paymentLabel = payment === "ewallet" ? t("checkout.ewallet") : payment === "bank" ? t("checkout.bank") : t("checkout.cash");

  if (confirmed) {
    const saved = savedRef.current;
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold text-foreground mb-3">{t("checkout.confirmed")}</h1>
          <p className="text-muted-foreground mb-2">{t("checkout.thank_you")}</p>
          <p className="text-sm text-muted-foreground mb-8">
            {delivery === "pickup"
              ? `${tc("Please head to")} ${pickupArea || tc("the farm")} ${tc("for pickup.")} Slot: ${pickupSlot}`
              : t("checkout.delivery_msg")}
          </p>
          <div className="farm-card p-4 mb-6 text-left space-y-2">
            {delivery === "delivery" && fullAddress && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b border-border">
                <Home className="h-4 w-4 shrink-0" />
                <span>{t("checkout.deliver_to")}: <span className="font-medium text-foreground">{fullAddress}</span></span>
              </div>
            )}
            {delivery === "pickup" && pickupArea && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground pb-2 border-b border-border">
                <MapPin className="h-4 w-4 shrink-0" />
                <span>{tc("Pickup at")}: <span className="font-medium text-foreground">{pickupArea}</span></span>
              </div>
            )}
            {saved.items.map((item) => (
              <div key={item.crop.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{tc(item.crop.name)} × {item.quantity} {getUnitLabel(language, item.crop.isBundle ? "box" : "kg")}</span>
                <span className="font-medium">RM{(item.crop.discountPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-border pt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
                <span>RM{saved.total.toFixed(2)}</span>
              </div>
              {delivery === "delivery" && Object.entries(saved.sellerGroups).map(([sid, group]) => (
                <div key={sid} className="flex justify-between text-sm">
                  <span className="text-muted-foreground">{t("checkout.delivery_fee")} ({tc(group.sellerName)} · {formatDistance(group.distance, language)})</span>
                  <span>RM{group.deliveryFee.toFixed(2)}</span>
                </div>
              ))}
              <p className="text-sm text-muted-foreground">{t("checkout.payment")}: <span className="font-medium text-foreground capitalize">{paymentLabel}</span></p>
              <p className="text-sm font-bold">{t("cart.total")}: <span className="text-primary">RM{saved.grandTotal.toFixed(2)}</span></p>
            </div>
          </div>
          <Button className="rounded-full" onClick={() => navigate("/marketplace")}>{t("checkout.continue_shopping")}</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-6">{t("checkout.title")}</h1>

        {/* Delivery Method - moved above order summary */}
        <div className="farm-card p-4 mb-6 space-y-4">
          <h2 className="font-heading font-bold text-foreground">{t("checkout.delivery_method")}</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDelivery("pickup")}
              className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${delivery === "pickup" ? "border-primary bg-farm-green-light" : "border-border"}`}
            >
              <PackageCheck className={`h-6 w-6 mx-auto ${delivery === "pickup" ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium">{t("checkout.self_pickup")}</p>
              <p className="text-xs text-muted-foreground">{t("checkout.free")}</p>
            </button>
            <button
              onClick={() => setDelivery("delivery")}
              className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${delivery === "delivery" ? "border-primary bg-farm-green-light" : "border-border"}`}
            >
              <Truck className={`h-6 w-6 mx-auto ${delivery === "delivery" ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium">{t("checkout.delivery")}</p>
              <p className="text-xs text-muted-foreground">{t("checkout.rate_per_km")}</p>
            </button>
          </div>

          {delivery === "pickup" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">{t("checkout.pickup_slot")}</Label>
              <div className="grid grid-cols-3 gap-2">
                {pickupSlots.map((slot) => (
                  <button
                    key={slot}
                    onClick={() => setPickupSlot(slot)}
                    className={`p-2 rounded-lg border-2 text-xs font-medium transition-all ${pickupSlot === slot ? "border-primary bg-farm-green-light text-primary" : "border-border text-muted-foreground hover:border-primary/50"}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input placeholder={t("checkout.add_custom_slot")} value={customSlot} onChange={(e) => setCustomSlot(e.target.value)} className="text-sm" />
                <Button type="button" variant="outline" size="sm" onClick={addCustomSlot}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Delivery Address */}
        {delivery === "delivery" && (
          <div className="farm-card p-4 mb-6">
            <h2 className="font-heading font-bold text-foreground mb-2 flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              {t("checkout.your_address")}
            </h2>
            {fullAddress ? (
              <p className="text-sm text-muted-foreground">{fullAddress}</p>
            ) : (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{t("checkout.no_address")}</span>
                <Button variant="link" size="sm" className="text-primary p-0 h-auto" onClick={() => navigate("/profile")}>
                  {t("checkout.add_address")}
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Order Summary - grouped by seller */}
        <div className="farm-card p-4 mb-6">
          <h2 className="font-heading font-bold text-foreground mb-3">{t("checkout.order_summary")}</h2>
          {Object.entries(sellerGroups).map(([sid, group], idx) => (
            <div key={sid}>
              {idx > 0 && <div className="border-t border-border my-3" />}
              <p className="text-xs font-medium text-foreground flex items-center gap-1 mb-2">
                <Store className="h-3 w-3 text-primary" />
                {tc(group.sellerName)}
              </p>
              {group.items.map((item) => (
                <div key={item.crop.id} className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground">{tc(item.crop.name)} × {item.quantity} {getUnitLabel(language, item.crop.isBundle ? "box" : "kg")}</span>
                  <span className="font-medium">RM{(item.crop.discountPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              {delivery === "delivery" && (
                <div className="flex justify-between text-sm py-1">
                  <span className="text-muted-foreground flex items-center gap-1">
                    <Truck className="h-3 w-3" />
                    {t("checkout.delivery_fee")} ({formatDistance(group.distance, language)})
                  </span>
                  <span className="font-medium text-primary">RM{group.deliveryFee.toFixed(2)}</span>
                </div>
              )}
            </div>
          ))}
          <div className="border-t border-border mt-3 pt-2 flex justify-between text-sm font-medium">
            <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
            <span>RM{grandTotal.toFixed(2)}</span>
          </div>
        </div>

        {/* Payment Method */}
        <div className="farm-card p-4 mb-6 space-y-4">
          <h2 className="font-heading font-bold text-foreground">{t("checkout.payment_method")}</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "cash" as const, label: t("checkout.cash"), icon: Banknote },
              { value: "ewallet" as const, label: t("checkout.ewallet"), icon: Wallet },
              { value: "bank" as const, label: t("checkout.bank"), icon: Building },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPayment(p.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center space-y-1 ${payment === p.value ? "border-primary bg-farm-green-light" : "border-border"}`}
              >
                <p.icon className={`h-5 w-5 mx-auto ${payment === p.value ? "text-primary" : "text-muted-foreground"}`} />
                <p className="text-xs font-medium">{p.label}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Total */}
        <div className="farm-card p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">{t("checkout.subtotal")}</span>
            <span>RM{total.toFixed(2)}</span>
          </div>
          {delivery === "delivery" && Object.entries(sellerGroups).map(([sid, group]) => (
            <div key={sid} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("checkout.delivery_fee")} ({tc(group.sellerName)})</span>
              <span>RM{group.deliveryFee.toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-heading font-bold text-lg">{t("cart.total")}</span>
            <span className="font-heading font-bold text-lg text-primary">RM{grandTotal.toFixed(2)}</span>
          </div>
          <Button className="w-full rounded-full mt-2" size="lg" onClick={handleConfirm}>{t("checkout.confirm")}</Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
