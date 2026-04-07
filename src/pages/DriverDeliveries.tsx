import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation, ChevronRight, Store } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { DeliveryItem } from "@/data/mockDeliveries";
import { listCompletedDeliveries } from "@/lib/repositories/deliveriesRepo";

const DriverDeliveries = () => {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [completedDeliveries, setCompletedDeliveries] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rows = await listCompletedDeliveries();
      if (mounted) setCompletedDeliveries(rows);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button variant="ghost" className="mb-4 rounded-full" onClick={() => navigate("/driver-dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("driver.back_summary")}
        </Button>

        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t("driver.completed_title")}</h1>
        <p className="text-muted-foreground text-sm mb-8">
          {t("driver.completed_count").replace("{count}", String(completedDeliveries.length))}
        </p>

        <div className="space-y-3">
          {completedDeliveries.map((d) => (
            <div
              key={d.id}
              className="farm-card p-4 cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => navigate(`/driver-delivery/${d.id}`)}
            >
              <div className="flex justify-between items-center">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-heading font-bold text-foreground">{d.id}</p>
                    <span className="text-xs text-muted-foreground">{d.orderId}</span>
                    <Badge variant="secondary">{d.date}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">{d.crop}</p>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3 text-primary" /> {d.pickup.split(",")[0]}
                    </span>
                    <span>→</span>
                    <span className="flex items-center gap-1">
                      <Navigation className="h-3 w-3 text-accent" /> {d.dropoff.split(",")[0]}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1"><Store className="h-3 w-3" />{d.seller}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-bold text-primary">RM{d.fee.toFixed(2)}</span>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      
    </div>
  );
};

export default DriverDeliveries;
