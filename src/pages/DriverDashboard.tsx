import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Navigation, DollarSign, CheckCircle, User, XCircle, History, ChevronRight, Store, Map } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { formatDistance } from "@/lib/freshness";

// Delivery requests are now per-seller within each order
export const deliveryRequests = [
  { id: "DEL-101", orderId: "ORD-007", crop: "Tomatoes (5kg)", pickup: "Ladang Pak Ali, Cameron Highlands", dropoff: "Taman Melawati, KL", distance: 15, fee: 15, date: "5 Mar 2026", seller: "Pak Ali", buyer: "Lee Wei Ming" },
  { id: "DEL-102", orderId: "ORD-007", crop: "Carrots (3kg)", pickup: "Kebun Mak Intan, Tanah Rata", dropoff: "Taman Melawati, KL", distance: 12, fee: 12, date: "5 Mar 2026", seller: "Mak Intan", buyer: "Lee Wei Ming" },
  { id: "DEL-103", orderId: "ORD-008", crop: "Corn (10kg)", pickup: "Ladang Jagung, Kota Bharu", dropoff: "Kuantan, Pahang", distance: 25, fee: 25, date: "3 Mar 2026", seller: "Pak Murad", buyer: "Ravi Kumar" },
];

export const completedDeliveries = [
  { id: "DEL-050", orderId: "ORD-004", crop: "Bananas (3kg)", pickup: "Ladang Pisang, Cameron Highlands", dropoff: "Subang Jaya, Selangor", distance: 7, fee: 7, date: "2 Mar 2026", seller: "Pak Ali", buyer: "Siti Aminah" },
  { id: "DEL-051", orderId: "ORD-004", crop: "Spinach (2kg)", pickup: "Kebun Sayur, Serdang", dropoff: "Subang Jaya, Selangor", distance: 3, fee: 3, date: "2 Mar 2026", seller: "Encik Lim", buyer: "Siti Aminah" },
  { id: "DEL-052", orderId: "ORD-001", crop: "Tomatoes (2kg)", pickup: "Ladang Pak Ali, Cameron Highlands", dropoff: "Petaling Jaya, Selangor", distance: 15, fee: 15, date: "28 Feb 2026", seller: "Pak Ali", buyer: "Ahmad Rizal" },
  { id: "DEL-053", orderId: "ORD-001", crop: "Carrots (1kg)", pickup: "Kebun Mak Intan, Tanah Rata", dropoff: "Petaling Jaya, Selangor", distance: 12, fee: 12, date: "28 Feb 2026", seller: "Mak Intan", buyer: "Ahmad Rizal" },
  { id: "DEL-054", orderId: "ORD-006", crop: "Carrots (2kg)", pickup: "Kebun Mak Intan, Tanah Rata", dropoff: "Kuala Terengganu", distance: 12, fee: 12, date: "25 Feb 2026", seller: "Mak Intan", buyer: "Noraini Bt Yusof" },
];

const DriverDashboard = () => {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);

  const handleAccept = (id: string) => {
    setAccepted((prev) => [...prev, id]);
    toast.success(`${id} ${t("driver.accepted_msg")} 🚗`);
  };

  const handleReject = (id: string) => {
    setRejected((prev) => [...prev, id]);
    toast.success(`${id} ${t("driver.rejected_msg")} ❌`);
  };

  const handleCancel = (id: string) => {
    setAccepted((prev) => prev.filter((a) => a !== id));
    toast.success(`${id} ${tc("cancelled")} 🔄`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t("driver.title")}</h1>
          <p className="text-muted-foreground text-sm">{t("driver.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={CheckCircle} label={t("driver.deliveries_completed")} value={15} />
          <StatCard icon={Navigation} label={t("driver.total_distance")} value={180} color="bg-farm-orange-light" />
          <StatCard icon={DollarSign} label={t("driver.total_earnings")} value={180} />
        </div>

        <h2 className="font-heading font-bold text-foreground text-lg mb-4">{t("driver.available_requests")}</h2>
        <div className="space-y-4">
          {deliveryRequests.filter((d) => !rejected.includes(d.id)).map((d) => {
            const isAccepted = accepted.includes(d.id);
            return (
              <div key={d.id} className={`farm-card p-5 ${isAccepted ? "opacity-60" : ""}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-heading font-bold text-foreground">{d.id}</p>
                    <p className="text-xs text-muted-foreground">{d.orderId}</p>
                    <p className="text-sm text-muted-foreground">{tc(d.crop)}</p>
                  </div>
                  <span className="font-bold text-primary text-lg">RM{d.fee.toFixed(2)}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("driver.pickup")}</p>
                      <p className="font-medium">{tc(d.pickup)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Store className="h-3 w-3" />{t("driver.seller") || tc("Seller")}: {d.seller}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("driver.dropoff")}</p>
                      <p className="font-medium">{tc(d.dropoff)}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{t("driver.buyer")}: {d.buyer}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("driver.distance")}: {formatDistance(d.distance, language)}</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {isAccepted ? (
                    <div className="flex items-center gap-2">
                      <span className="farm-badge-green">✓ {t("driver.accepted")}</span>
                      <Button variant="outline" size="sm" className="rounded-full text-destructive border-destructive/30 hover:bg-destructive/10" onClick={() => handleCancel(d.id)}>
                        <XCircle className="h-4 w-4 mr-1" /> {tc("Cancel")}
                      </Button>
                    </div>
                  ) : (
                    <>
                      <Button onClick={() => handleAccept(d.id)} className="rounded-full" size="sm">
                        <Truck className="h-4 w-4 mr-1" /> {t("driver.accept")}
                      </Button>
                      <Button variant="destructive" onClick={() => handleReject(d.id)} className="rounded-full" size="sm">
                        <XCircle className="h-4 w-4 mr-1" /> {t("driver.reject")}
                      </Button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Completed Deliveries Section */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-heading font-bold text-foreground text-lg">{t("driver.completed_title") || "Completed Deliveries"}</h2>
            <Button variant="ghost" size="sm" className="rounded-full" onClick={() => navigate("/driver-deliveries")}>
              {tc("View All")} <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
          <div className="space-y-3">
            {completedDeliveries.slice(0, 3).map((d) => (
              <div
                key={d.id}
                className="farm-card p-4 cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => navigate(`/driver-delivery/${d.id}`)}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-heading font-bold text-foreground text-sm">{d.id}</p>
                      <span className="text-xs text-muted-foreground">{d.orderId}</span>
                      <span className="farm-badge-green text-xs">{tc("Completed")}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">{tc(d.crop)} · {d.date}</p>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
                      <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" />{tc(d.pickup.split(",")[0])}</span>
                      <span>→</span>
                      <span className="flex items-center gap-1"><Navigation className="h-3 w-3 text-accent" />{tc(d.dropoff.split(",")[0])}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Store className="h-3 w-3" />{d.seller}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-primary text-sm">RM{d.fee.toFixed(2)}</span>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
    </div>
  );
};

export default DriverDashboard;
