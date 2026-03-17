import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Package, Recycle, Leaf, TreePine, Droplets, User } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";

const BuyerDashboard = () => {
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t("buyer.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("buyer.subtitle")}</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/profile")}>
            <User className="h-4 w-4 mr-1" /> {t("common.profile")}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={ShoppingBag} label={t("buyer.orders_completed")} value={6} />
          <StatCard icon={Package} label={t("buyer.crops_purchased")} value={25} color="bg-farm-orange-light" />
          <StatCard icon={Recycle} label={t("buyer.crops_rescued")} value={25} />
        </div>

        <div className="farm-card p-6 mb-8 bg-farm-green-light border-primary/20">
          <div className="text-center space-y-4">
            <Leaf className="h-12 w-12 text-primary mx-auto" />
            <h2 className="font-heading font-bold text-foreground text-xl">{t("buyer.impact_title")}</h2>
            <p className="text-muted-foreground">
              {t("buyer.impact_desc1")} <span className="text-primary font-bold text-2xl">25 kg</span> {t("buyer.impact_desc2")}
            </p>
            <div className="grid grid-cols-3 gap-4 pt-2">
              <div className="text-center">
                <Droplets className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-lg font-heading font-bold text-foreground">12,500L</p>
                <p className="text-xs text-muted-foreground">{t("buyer.water_saved")}</p>
              </div>
              <div className="text-center">
                <TreePine className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-lg font-heading font-bold text-foreground">50 kg</p>
                <p className="text-xs text-muted-foreground">{t("buyer.co2_prevented")}</p>
              </div>
              <div className="text-center">
                <ShoppingBag className="h-6 w-6 text-primary mx-auto mb-1" />
                <p className="text-lg font-heading font-bold text-foreground">50</p>
                <p className="text-xs text-muted-foreground">{t("buyer.meals_saved")}</p>
              </div>
            </div>
          </div>
        </div>

        <h2 className="font-heading font-bold text-foreground text-lg mb-4">{t("buyer.recent_orders")}</h2>
        <div className="space-y-3">
          {[{ id: "ORD-001", items: "Tomatoes, Carrots", total: 15.5, date: "2026-03-05", status: "Delivered", kg: 5 },
          { id: "ORD-002", items: "Corn, Cucumbers", total: 8.4, date: "2026-03-03", status: "Delivered", kg: 6 },
          { id: "ORD-003", items: "Apples, Bell Peppers", total: 22, date: "2026-02-28", status: "Picked Up", kg: 4 },
          { id: "ORD-004", items: "Bananas, Spinach", total: 10.5, date: "2026-02-25", status: "Delivered", kg: 5 },
          { id: "ORD-005", items: "Tomatoes, Corn", total: 12, date: "2026-02-20", status: "Picked Up", kg: 3 },
          { id: "ORD-006", items: "Carrots", total: 5, date: "2026-02-15", status: "Delivered", kg: 2 }].map((o) =>
            <div key={o.id} className="farm-card p-4 flex justify-between items-center cursor-pointer hover:shadow-md transition-shadow" onClick={() => navigate(`/order/${o.id}`)}>
              <div>
                <p className="font-heading font-bold text-foreground text-sm">{o.id}</p>
                <p className="text-xs text-muted-foreground">{tc(o.items)}</p>
                <p className="text-xs text-muted-foreground">{o.date} · {o.kg} {t("buyer.kg_rescued")}</p>
              </div>
              <div className="text-right">
                <p className="font-bold text-primary text-sm">RM{o.total.toFixed(2)}</p>
                <span className="farm-badge-green text-xs">{tc(o.status)}</span>
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default BuyerDashboard;
