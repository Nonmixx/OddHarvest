import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CheckCircle, MapPin, Truck, PackageCheck, Wallet, Building, Banknote } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";

const CheckoutPage = () => {
  const { items, total, clearCart } = useCart();
  const navigate = useNavigate();
  const [delivery, setDelivery] = useState<"pickup" | "delivery">("pickup");
  const [distance, setDistance] = useState(5);
  const [payment, setPayment] = useState<"cash" | "ewallet" | "bank">("ewallet");
  const [confirmed, setConfirmed] = useState(false);

  const deliveryFee = delivery === "delivery" ? Math.max(1, distance * 1) : 0;
  const grandTotal = total + deliveryFee;

  if (confirmed) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center max-w-md">
          <CheckCircle className="h-20 w-20 text-primary mx-auto mb-6" />
          <h1 className="text-3xl font-heading font-bold text-foreground mb-3">Order Confirmed! 🎉</h1>
          <p className="text-muted-foreground mb-2">Thank you for rescuing imperfect crops!</p>
          <p className="text-sm text-muted-foreground mb-8">
            {delivery === "pickup" ? "Please head to the farm for pickup." : `A driver will deliver your order (${distance} km).`}
          </p>
          <div className="farm-card p-4 mb-6 text-left space-y-1">
            <p className="text-sm text-muted-foreground">Payment: <span className="font-medium text-foreground capitalize">{payment === "ewallet" ? "E-Wallet" : payment === "bank" ? "Bank Transfer" : "Cash"}</span></p>
            <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-primary">RM{grandTotal.toFixed(2)}</span></p>
          </div>
          <Button className="rounded-full" onClick={() => navigate("/marketplace")}>Continue Shopping</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-6">Checkout 📦</h1>

        {/* Order summary */}
        <div className="farm-card p-4 mb-6">
          <h2 className="font-heading font-bold text-foreground mb-3">Order Summary</h2>
          {items.map((item) => (
            <div key={item.crop.id} className="flex justify-between text-sm py-1">
              <span className="text-muted-foreground">{item.crop.name} × {item.quantity} kg</span>
              <span className="font-medium">RM{(item.crop.discountPrice * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-border mt-2 pt-2 flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="font-medium">RM{total.toFixed(2)}</span>
          </div>
        </div>

        {/* Delivery method */}
        <div className="farm-card p-4 mb-6 space-y-4">
          <h2 className="font-heading font-bold text-foreground">Delivery Method</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setDelivery("pickup")}
              className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${
                delivery === "pickup" ? "border-primary bg-farm-green-light" : "border-border"
              }`}
            >
              <PackageCheck className={`h-6 w-6 mx-auto ${delivery === "pickup" ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium">Self Pickup</p>
              <p className="text-xs text-muted-foreground">Free</p>
            </button>
            <button
              onClick={() => setDelivery("delivery")}
              className={`p-4 rounded-xl border-2 transition-all text-center space-y-2 ${
                delivery === "delivery" ? "border-primary bg-farm-green-light" : "border-border"
              }`}
            >
              <Truck className={`h-6 w-6 mx-auto ${delivery === "delivery" ? "text-primary" : "text-muted-foreground"}`} />
              <p className="text-sm font-medium">Delivery</p>
              <p className="text-xs text-muted-foreground">RM1/km</p>
            </button>
          </div>

          {delivery === "delivery" && (
            <div className="space-y-2">
              <Label className="text-sm">Distance (km)</Label>
              <div className="flex items-center gap-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="number"
                  min={1}
                  value={distance}
                  onChange={(e) => setDistance(Math.max(1, Number(e.target.value)))}
                  className="w-24"
                />
                <span className="text-sm text-muted-foreground">km → Delivery fee: <span className="font-bold text-primary">RM{deliveryFee.toFixed(2)}</span></span>
              </div>
            </div>
          )}
        </div>

        {/* Payment method */}
        <div className="farm-card p-4 mb-6 space-y-4">
          <h2 className="font-heading font-bold text-foreground">Payment Method</h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { value: "cash" as const, label: "Cash", icon: Banknote },
              { value: "ewallet" as const, label: "E-Wallet", icon: Wallet },
              { value: "bank" as const, label: "Bank Transfer", icon: Building },
            ].map((p) => (
              <button
                key={p.value}
                onClick={() => setPayment(p.value)}
                className={`p-3 rounded-xl border-2 transition-all text-center space-y-1 ${
                  payment === p.value ? "border-primary bg-farm-green-light" : "border-border"
                }`}
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
            <span className="text-muted-foreground">Subtotal</span>
            <span>RM{total.toFixed(2)}</span>
          </div>
          {delivery === "delivery" && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Delivery Fee ({distance} km)</span>
              <span>RM{deliveryFee.toFixed(2)}</span>
            </div>
          )}
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-heading font-bold text-lg">Total</span>
            <span className="font-heading font-bold text-lg text-primary">RM{grandTotal.toFixed(2)}</span>
          </div>
          <Button
            className="w-full rounded-full mt-2"
            size="lg"
            onClick={() => { setConfirmed(true); clearCart(); }}
          >
            Confirm Order
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
