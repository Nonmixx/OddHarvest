import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Truck, MapPin, Navigation, DollarSign, CheckCircle, User, XCircle } from "lucide-react";
import { toast } from "sonner";
import { useLanguage } from "@/contexts/LanguageContext";

export const deliveryRequests = [
  { id: "DEL-101", crop: "Tomatoes (5kg)", pickup: "Ladang Pak Ali, Cameron Highlands", dropoff: "Taman Melawati, KL", distance: 12, fee: 12, date: "5 Mar 2026", farmer: "Pak Ali", buyer: "Lee Wei Ming" },
  { id: "DEL-102", crop: "Carrots (3kg)", pickup: "Kebun Mak Intan, Tanah Rata", dropoff: "Damansara, KL", distance: 8, fee: 8, date: "4 Mar 2026", farmer: "Mak Intan", buyer: "Farah Nadia" },
  { id: "DEL-103", crop: "Corn (10kg)", pickup: "Ladang Jagung, Kota Bharu", dropoff: "Kuantan, Pahang", distance: 25, fee: 25, date: "3 Mar 2026", farmer: "Encik Zul", buyer: "Ravi Kumar" },
];

export const completedDeliveries = [
  { id: "DEL-050", crop: "Spinach (4kg)", pickup: "Ladang Hijau, Ipoh", dropoff: "Subang Jaya, Selangor", distance: 15, fee: 15, date: "2 Mar 2026", farmer: "Pak Hassan", buyer: "Siti Aminah" },
  { id: "DEL-051", crop: "Tomatoes (8kg)", pickup: "Kebun Tomat, Cameron Highlands", dropoff: "Petaling Jaya, Selangor", distance: 20, fee: 20, date: "28 Feb 2026", farmer: "Mak Jah", buyer: "Ahmad Rizal" },
  { id: "DEL-052", crop: "Chillies (2kg)", pickup: "Ladang Cili, Kota Bharu", dropoff: "Kuala Terengganu", distance: 10, fee: 10, date: "25 Feb 2026", farmer: "Encik Razak", buyer: "Noraini Bt Yusof" },
];

const DriverDashboard = () => {
  const [accepted, setAccepted] = useState<string[]>([]);
  const [rejected, setRejected] = useState<string[]>([]);
  const navigate = useNavigate();
  const { t } = useLanguage();

  const handleAccept = (id: string) => {
    setAccepted((prev) => [...prev, id]);
    toast.success(`${id} ${t("driver.accepted_msg")} 🚗`);
  };

  const handleReject = (id: string) => {
    setRejected((prev) => [...prev, id]);
    toast.success(`${id} ${t("driver.rejected_msg")} ❌`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t("driver.title")}</h1>
            <p className="text-muted-foreground text-sm">{t("driver.subtitle")}</p>
          </div>
          <Button variant="outline" className="rounded-full" onClick={() => navigate("/profile")}>
            <User className="h-4 w-4 mr-1" /> {t("common.profile")}
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={CheckCircle} label={t("driver.deliveries_completed")} value={15} />
          <StatCard icon={Navigation} label={t("driver.total_distance")} value={180} color="bg-farm-orange-light" />
          <StatCard icon={DollarSign} label={t("driver.total_earnings")} value={180} />
        </div>

        <h2 className="font-heading font-bold text-foreground text-lg mb-4">{t("driver.available_requests")}</h2>
        <div className="space-y-4">
          {deliveryRequests.map((d) => {
            const isAccepted = accepted.includes(d.id);
            return (
              <div key={d.id} className={`farm-card p-5 ${isAccepted ? "opacity-60" : ""}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-heading font-bold text-foreground">{d.id}</p>
                    <p className="text-sm text-muted-foreground">{d.crop}</p>
                  </div>
                  <span className="font-bold text-primary text-lg">RM{d.fee.toFixed(2)}</span>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("driver.pickup")}</p>
                      <p className="font-medium">{d.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">{t("driver.dropoff")}</p>
                      <p className="font-medium">{d.dropoff}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">{t("driver.distance")}: {d.distance} km</p>
                </div>
                <div className="mt-4">
                  {isAccepted ? (
                    <span className="farm-badge-green">✓ {t("driver.accepted")}</span>
                  ) : (
                    <Button onClick={() => handleAccept(d.id)} className="rounded-full" size="sm">
                      <Truck className="h-4 w-4 mr-1" /> {t("driver.accept")}
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverDashboard;
