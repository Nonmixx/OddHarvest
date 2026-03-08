import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { Minus, Plus, Trash2, ShoppingBag } from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";

const CartPage = () => {
  const { items, updateQuantity, removeFromCart, total, itemCount } = useCart();

  if (items.length === 0) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h1 className="text-2xl font-heading font-bold text-foreground mb-2">Your cart is empty</h1>
          <p className="text-muted-foreground mb-6">Start shopping for imperfect but delicious crops!</p>
          <Link to="/marketplace">
            <Button className="rounded-full">Browse Marketplace</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-6">Your Cart 🛒</h1>

        <div className="space-y-4 mb-8">
          {items.map((item) => (
            <div key={item.crop.id} className="farm-card p-4 flex gap-4">
              <img src={item.crop.image} alt={item.crop.name} className="w-20 h-20 rounded-xl object-cover" />
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-foreground text-sm truncate">{item.crop.name}</h3>
                <p className="text-xs text-muted-foreground">{item.crop.farmLocation}</p>
                <div className="flex items-center gap-1 mt-1">
                  <span className="price-original text-xs">RM{item.crop.usualPrice.toFixed(2)}</span>
                  <span className="text-primary font-bold text-sm">RM{item.crop.discountPrice.toFixed(2)}/kg</span>
                </div>
              </div>
              <div className="flex flex-col items-end justify-between">
                <button onClick={() => removeFromCart(item.crop.id)} className="text-muted-foreground hover:text-destructive transition-colors">
                  <Trash2 className="h-4 w-4" />
                </button>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => updateQuantity(item.crop.id, item.quantity - 1)}
                    className="h-7 w-7 rounded-full bg-secondary flex items-center justify-center hover:bg-secondary/80"
                  >
                    <Minus className="h-3 w-3" />
                  </button>
                  <span className="font-bold text-sm w-6 text-center">{item.quantity}</span>
                  <button
                    onClick={() => updateQuantity(item.crop.id, item.quantity + 1)}
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
          ))}
        </div>

        {/* Summary */}
        <div className="farm-card p-6 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items ({itemCount})</span>
            <span className="font-medium">RM{total.toFixed(2)}</span>
          </div>
          <div className="border-t border-border pt-3 flex justify-between">
            <span className="font-heading font-bold text-lg">Total</span>
            <span className="font-heading font-bold text-lg text-primary">RM{total.toFixed(2)}</span>
          </div>
          <Link to="/checkout">
            <Button className="w-full rounded-full mt-2" size="lg">Proceed to Checkout</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartPage;
