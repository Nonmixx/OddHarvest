import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation, Truck, Route, Clock, CircleDot, CheckCircle2 } from "lucide-react";
import { deliveryRequests } from "@/pages/DriverDashboard";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { formatDistance } from "@/lib/freshness";

// Simulated coordinates for demo
const locationCoords: Record<string, { lat: number; lng: number }> = {
  "Ladang Pak Ali, Cameron Highlands": { lat: 4.4725, lng: 101.3891 },
  "Kebun Mak Intan, Tanah Rata": { lat: 4.4693, lng: 101.3826 },
  "Ladang Jagung, Kota Bharu": { lat: 6.1254, lng: 102.2381 },
  "Taman Melawati, KL": { lat: 3.2148, lng: 101.7501 },
  "Kuantan, Pahang": { lat: 3.8077, lng: 103.326 },
  "Petaling Jaya, Selangor": { lat: 3.1073, lng: 101.6067 },
  "Subang Jaya, Selangor": { lat: 3.0565, lng: 101.5851 },
};

// Simulated driver location (KL area)
const driverLocation = { lat: 3.139, lng: 101.6869 };

const DriverNavigationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);
  const [currentStep, setCurrentStep] = useState<"to_pickup" | "to_dropoff">("to_pickup");

  const delivery = deliveryRequests.find((d) => d.id === id);

  const pickupCoord = delivery ? locationCoords[delivery.pickup] || { lat: 3.2, lng: 101.7 } : null;
  const dropoffCoord = delivery ? locationCoords[delivery.dropoff] || { lat: 3.1, lng: 101.6 } : null;

  // Estimate time: ~1.5 min per km
  const estTimeToPickup = delivery ? Math.round(delivery.distance * 0.8 * 1.5) : 0;
  const estTimeToDropoff = delivery ? Math.round(delivery.distance * 1.5) : 0;
  const distToPickup = delivery ? Math.round(delivery.distance * 0.8) : 0;

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
      </div>
    );
  }

  const handlePickupComplete = () => {
    setCurrentStep("to_dropoff");
  };

  const handleDeliveryComplete = () => {
    navigate("/driver-dashboard");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-6 max-w-3xl">
        <Button variant="ghost" className="mb-4 rounded-full" onClick={() => navigate("/driver-dashboard")}>
          <ArrowLeft className="h-4 w-4 mr-1" /> {t("common.back_dashboard")}
        </Button>

        <div className="flex items-center gap-3 mb-5">
          <h1 className="text-2xl font-heading font-bold text-foreground">{t("driver.navigation")}</h1>
          <Badge className="bg-primary/20 text-primary border-primary/30">{delivery.id}</Badge>
        </div>

        {/* Map Visual */}
        <div className="relative w-full h-64 sm:h-80 rounded-2xl bg-muted/30 border border-border overflow-hidden mb-6">
          {/* Simulated map grid */}
          <div className="absolute inset-0 opacity-10">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`h-${i}`} className="absolute w-full border-t border-foreground/20" style={{ top: `${(i + 1) * 10}%` }} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={`v-${i}`} className="absolute h-full border-l border-foreground/20" style={{ left: `${(i + 1) * 10}%` }} />
            ))}
          </div>

          {/* Route line - SVG */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Driver to pickup */}
            <line
              x1="20" y1="70" x2="50" y2="25"
              stroke="hsl(var(--primary))"
              strokeWidth="0.8"
              strokeDasharray={currentStep === "to_pickup" ? "2,1" : "none"}
              opacity={currentStep === "to_pickup" ? 1 : 0.3}
            />
            {/* Pickup to dropoff */}
            <line
              x1="50" y1="25" x2="80" y2="65"
              stroke="hsl(var(--accent))"
              strokeWidth="0.8"
              strokeDasharray={currentStep === "to_dropoff" ? "2,1" : "none"}
              opacity={currentStep === "to_dropoff" ? 1 : 0.3}
            />
          </svg>

          {/* Driver marker */}
          <div className="absolute flex flex-col items-center" style={{ left: "18%", top: "65%" }}>
            <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center shadow-lg ring-4 ring-primary/20 animate-pulse">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="text-[10px] font-bold text-primary mt-1 bg-background/80 px-1.5 rounded">{t("driver.you")}</span>
          </div>

          {/* Pickup marker */}
          <div className="absolute flex flex-col items-center" style={{ left: "47%", top: "18%" }}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg ring-4 ${currentStep === "to_pickup" ? "bg-primary ring-primary/20" : "bg-muted ring-muted-foreground/10"}`}>
              <MapPin className={`h-5 w-5 ${currentStep === "to_pickup" ? "text-primary-foreground" : "text-muted-foreground"}`} />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1 bg-background/80 px-1.5 rounded max-w-[80px] truncate">{t("driver.pickup")}</span>
          </div>

          {/* Dropoff marker */}
          <div className="absolute flex flex-col items-center" style={{ left: "76%", top: "58%" }}>
            <div className={`h-10 w-10 rounded-full flex items-center justify-center shadow-lg ring-4 ${currentStep === "to_dropoff" ? "bg-accent ring-accent/20" : "bg-muted ring-muted-foreground/10"}`}>
              <Navigation className={`h-5 w-5 ${currentStep === "to_dropoff" ? "text-accent-foreground" : "text-muted-foreground"}`} />
            </div>
            <span className="text-[10px] font-bold text-foreground mt-1 bg-background/80 px-1.5 rounded max-w-[80px] truncate">{t("driver.dropoff")}</span>
          </div>

          {/* Legend */}
          <div className="absolute bottom-3 left-3 bg-background/90 backdrop-blur rounded-lg px-3 py-2 flex gap-3 text-[10px] border border-border">
            <span className="flex items-center gap-1"><CircleDot className="h-3 w-3 text-primary" /> {t("driver.you")}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3 w-3 text-primary" /> {t("driver.pickup")}</span>
            <span className="flex items-center gap-1"><Navigation className="h-3 w-3 text-accent" /> {t("driver.dropoff")}</span>
          </div>
        </div>

        {/* Route Steps */}
        <div className="space-y-4 mb-6">
          {/* Step 1: To Pickup */}
          <div className={`farm-card p-4 transition-all ${currentStep === "to_pickup" ? "ring-2 ring-primary/40" : "opacity-60"}`}>
            <div className="flex items-center gap-2 mb-2">
              {currentStep === "to_dropoff" ? (
                <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
              ) : (
                <div className="h-5 w-5 rounded-full border-2 border-primary flex items-center justify-center shrink-0">
                  <span className="text-[10px] font-bold text-primary">1</span>
                </div>
              )}
              <p className="font-heading font-bold text-foreground text-sm">{t("driver.go_to_pickup")}</p>
            </div>
            <div className="ml-7 space-y-1">
              <p className="text-sm font-medium text-foreground">{tc(delivery.pickup)}</p>
              <p className="text-xs text-muted-foreground">{t("driver.seller")}: {delivery.seller}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Route className="h-3 w-3" /> {formatDistance(distToPickup, language)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> ~{estTimeToPickup} {t("driver.minutes")}
                </span>
              </div>
            </div>
            {currentStep === "to_pickup" && (
              <Button size="sm" className="rounded-full mt-3 ml-7" onClick={handlePickupComplete}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> {t("driver.pickup_done")}
              </Button>
            )}
          </div>

          {/* Step 2: To Dropoff */}
          <div className={`farm-card p-4 transition-all ${currentStep === "to_dropoff" ? "ring-2 ring-accent/40" : "opacity-60"}`}>
            <div className="flex items-center gap-2 mb-2">
              <div className="h-5 w-5 rounded-full border-2 border-accent flex items-center justify-center shrink-0">
                <span className="text-[10px] font-bold text-accent">2</span>
              </div>
              <p className="font-heading font-bold text-foreground text-sm">{t("driver.go_to_dropoff")}</p>
            </div>
            <div className="ml-7 space-y-1">
              <p className="text-sm font-medium text-foreground">{tc(delivery.dropoff)}</p>
              <p className="text-xs text-muted-foreground">{t("driver.buyer")}: {delivery.buyer}</p>
              <div className="flex gap-4 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Route className="h-3 w-3" /> {formatDistance(delivery.distance, language)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> ~{estTimeToDropoff} {t("driver.minutes")}
                </span>
              </div>
            </div>
            {currentStep === "to_dropoff" && (
              <Button size="sm" className="rounded-full mt-3 ml-7 bg-accent hover:bg-accent/90 text-accent-foreground" onClick={handleDeliveryComplete}>
                <CheckCircle2 className="h-4 w-4 mr-1" /> {t("driver.delivery_done")}
              </Button>
            )}
          </div>
        </div>

        {/* Delivery Info Card */}
        <div className="farm-card p-4">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-muted-foreground">{t("driver.item")}</p>
              <p className="font-heading font-bold text-foreground">{tc(delivery.crop)}</p>
              <p className="text-xs text-muted-foreground">{delivery.orderId}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">{t("driver.delivery_fee")}</p>
              <p className="font-bold text-primary text-lg">RM{delivery.fee.toFixed(2)}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DriverNavigationPage;
