import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { ShoppingBag, Package, Recycle, Leaf } from "lucide-react";

const BuyerDashboard = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Buyer Dashboard 🛍️</h1>
        <p className="text-muted-foreground text-sm mb-8">Your impact and order history</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={ShoppingBag} label="Orders Completed" value={6} />
          <StatCard icon={Package} label="Total Crops Purchased (kg)" value={18} color="bg-farm-orange-light" />
          <StatCard icon={Recycle} label="Crops Rescued (kg)" value={18} />
        </div>

        {/* Impact */}
        <div className="farm-card p-6 mb-8 text-center">
          <Leaf className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="font-heading font-bold text-foreground text-xl mb-1">Your Environmental Impact 🌍</h2>
          <p className="text-muted-foreground">
            You helped rescue <span className="text-primary font-bold">18 kg</span> of crops from food waste!
          </p>
          <p className="text-sm text-muted-foreground mt-1">That's equivalent to saving 36 meals 🍽️</p>
        </div>

        {/* Recent orders */}
        <h2 className="font-heading font-bold text-foreground text-lg mb-4">Recent Orders</h2>
        <div className="space-y-3">
          {[
            { id: "ORD-001", items: "Tomatoes, Carrots", total: 15.5, date: "2026-03-05", status: "Delivered" },
            { id: "ORD-002", items: "Corn, Cucumbers", total: 8.4, date: "2026-03-03", status: "Delivered" },
            { id: "ORD-003", items: "Apples, Bell Peppers", total: 22, date: "2026-02-28", status: "Picked Up" },
          ].map((o) => (
            <div key={o.id} className="farm-card p-4 flex justify-between items-center">
              <div>
                <p className="font-heading font-bold text-foreground text-sm">{o.id}</p>
                <p className="text-xs text-muted-foreground">{o.items}</p>
                <p className="text-xs text-muted-foreground">{o.date}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-sm">RM{o.total.toFixed(2)}</p>
                <span className="farm-badge-green text-xs">{o.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BuyerDashboard;
