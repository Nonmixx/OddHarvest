import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation, Truck, User, DollarSign, Calendar, Route, XCircle } from "lucide-react";
import { deliveryRequests, completedDeliveries } from "@/pages/DriverDashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { formatDistance } from "@/lib/freshness";
import { toast } from "sonner";

const allDeliveries = [...deliveryRequests, ...completedDeliveries];

const DriverDeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);
  const [rejected, setRejected] = useState(false);

  const delivery = allDeliveries.find((d) => d.id === id);

  if (!delivery) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-2xl font-heading font-bold text-foreground mb-4">{t("driver.not_found")}</p>
          <Button onClick={() => navigate("/driver-dashboard")} className="rounded-full">
            {t("common.back_dashboard")}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isCompleted = completedDeliveries.some((d) => d.id === id);

  const handleReject = () => {
    setRejected(true);
    toast.success(`${delivery.id} ${t("driver.rejected_msg")} ❌`);
    setTimeout(() => navigate("/driver-dashboard"), 1500);
  };

  if (rejected) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <XCircle className="h-16 w-16 text-destructive mx-auto mb-4" />
          <p className="text-2xl font-heading font-bold text-foreground mb-2">{t("driver.delivery_rejected")}</p>
          <p className="text-muted-foreground mb-6">{t("driver.rejected_desc")}</p>
          <Button onClick={() => navigate("/driver-dashboard")} className="rounded-full">
            {t("common.back_dashboard")}
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" className="mb-4 rounded-full" onClick={() => navigate(-1)}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("common.back")}
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground">{delivery.id}</h1>
          {isCompleted ? (
            <Badge className="bg-primary/20 text-primary border-primary/30">{t("driver.completed")}</Badge>
          ) : (
            <Badge variant="secondary">{t("driver.in_progress")}</Badge>
          )}
        </div>

        <div className="farm-card p-6 space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("driver.item")}</p>
              <p className="font-heading font-bold text-foreground text-lg">{tc(delivery.crop)}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("driver.pickup_location")}</p>
              <p className="font-medium text-foreground">{tc(delivery.pickup)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("driver.farmer")}: {delivery.farmer}</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Navigation className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t("driver.dropoff_location")}</p>
              <p className="font-medium text-foreground">{tc(delivery.dropoff)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("driver.buyer")}: {delivery.buyer}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("driver.distance")}</p>
                <p className="font-bold text-foreground">{delivery.distance} km</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("driver.delivery_fee")}</p>
                <p className="font-bold text-primary">RM{delivery.fee.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("driver.date")}</p>
                <p className="font-bold text-foreground">{delivery.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">{t("driver.farmer")}</p>
                <p className="font-bold text-foreground">{delivery.farmer}</p>
              </div>
            </div>
          </div>

          {!isCompleted && (
            <div className="border-t border-border pt-4">
              <Button variant="destructive" className="rounded-full w-full" onClick={handleReject}>
                <XCircle className="h-4 w-4 mr-2" /> {t("driver.reject")}
              </Button>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverDeliveryDetail;
