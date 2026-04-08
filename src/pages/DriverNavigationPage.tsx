import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, CheckCircle2, Clock, ExternalLink, Route } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { formatDistance } from "@/lib/freshness";
import DriverRouteMap from "@/components/maps/DriverRouteMap";
import { DeliveryItem } from "@/data/mockDeliveries";
import { listDeliveryRequests } from "@/lib/repositories/deliveriesRepo";
import { useAuth } from "@/contexts/AuthContext";

// Simulated coordinates for demo (aligned with KL/Klang Valley pickup/dropoff in DriverDashboard)
const locationCoords: Record<string, { lat: number; lng: number }> = {
  "Chow Kit Wet Market, Kuala Lumpur": { lat: 3.1674, lng: 101.6982 },
  "Petaling Street, Kuala Lumpur": { lat: 3.1422, lng: 101.6970 },
  "Pasar Seni, Kuala Lumpur": { lat: 3.1426, lng: 101.6959 },
  "KL Sentral, Kuala Lumpur": { lat: 3.1349, lng: 101.6861 },
  "KLCC, Kuala Lumpur": { lat: 3.1579, lng: 101.7123 },
  "Bukit Bintang, Kuala Lumpur": { lat: 3.1466, lng: 101.7113 },
  "Bangsar, Kuala Lumpur": { lat: 3.1319, lng: 101.6656 },
  "Sri Petaling, Kuala Lumpur": { lat: 3.0656, lng: 101.6896 },
  "Wangsa Maju, Kuala Lumpur": { lat: 3.2038, lng: 101.7318 },
  "Kebun Sayur, Serdang": { lat: 2.9928, lng: 101.7124 },
  "Seri Kembangan Town Centre, Selangor": { lat: 3.0218, lng: 101.7055 },
  // Legacy keys kept for other demo pages / translations
  "Taman Melawati, KL": { lat: 3.2148, lng: 101.7501 },
  "Petaling Jaya, Selangor": { lat: 3.1073, lng: 101.6067 },
  "Subang Jaya, Selangor": { lat: 3.0565, lng: 101.5851 },
  "Kuantan, Pahang": { lat: 3.8077, lng: 103.326 },
  "Ladang Jagung, Kota Bharu": { lat: 6.1254, lng: 102.2381 },
};

// Fallback: Kuala Lumpur city centre when GPS unavailable
const fallbackDriverLocation = { lat: 3.139, lng: 101.6869 };

function buildGoogleMapsDirectionsUrl(origin: { lat: number; lng: number }, destination: { lat: number; lng: number }) {
  const originStr = `${origin.lat},${origin.lng}`;
  const destStr = `${destination.lat},${destination.lng}`;
  return `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(originStr)}&destination=${encodeURIComponent(destStr)}&travelmode=driving`;
}

const DriverNavigationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);
  const { user } = useAuth();
  const driverId = user?.role === "driver" ? user.id : null;
  const [currentStep, setCurrentStep] = useState<"to_pickup" | "to_dropoff">("to_pickup");
  const [driverLocation, setDriverLocation] = useState(fallbackDriverLocation);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; etaMinutes: number } | null>(null);
  const [deliveryRequests, setDeliveryRequests] = useState<DeliveryItem[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      const req = await listDeliveryRequests(driverId);
      if (mounted) setDeliveryRequests(req);
    })();
    return () => {
      mounted = false;
    };
  }, [driverId]);

  const delivery = deliveryRequests.find((d) => d.id === id);

  const pickupCoord = delivery ? locationCoords[delivery.pickup] || { lat: 3.2, lng: 101.7 } : null;
  const dropoffCoord = delivery ? locationCoords[delivery.dropoff] || { lat: 3.1, lng: 101.6 } : null;

  useEffect(() => {
    if (!("geolocation" in navigator)) return;
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setDriverLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      () => {
        // keep fallback location
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const target = currentStep === "to_pickup" ? "pickup" : "dropoff";

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

  const destination = currentStep === "to_pickup" ? pickupCoord : dropoffCoord;
  const externalNavUrl = destination ? buildGoogleMapsDirectionsUrl(driverLocation, destination) : null;

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

        {/* Live Map */}
        {pickupCoord && dropoffCoord ? (
          <div className="mb-4 space-y-3">
            <DriverRouteMap
              driver={driverLocation}
              pickup={pickupCoord}
              dropoff={dropoffCoord}
              target={target}
              onRouteInfo={setRouteInfo}
            />
            {externalNavUrl ? (
              <div className="flex justify-end">
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="rounded-full"
                  onClick={() => window.open(externalNavUrl, "_blank", "noopener,noreferrer")}
                >
                  <ExternalLink className="h-4 w-4 mr-1" /> {t("driver.navigate")}
                </Button>
              </div>
            ) : null}
          </div>
        ) : null}

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
                  <Route className="h-3 w-3" />{" "}
                  {formatDistance(routeInfo && currentStep === "to_pickup" ? routeInfo.distanceKm : Math.round(delivery.distance * 0.8), language)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> ~{routeInfo && currentStep === "to_pickup" ? routeInfo.etaMinutes : Math.round(delivery.distance * 0.8 * 1.5)}{" "}
                  {t("driver.minutes")}
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
                  <Route className="h-3 w-3" />{" "}
                  {formatDistance(routeInfo && currentStep === "to_dropoff" ? routeInfo.distanceKm : delivery.distance, language)}
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" /> ~{routeInfo && currentStep === "to_dropoff" ? routeInfo.etaMinutes : Math.round(delivery.distance * 1.5)}{" "}
                  {t("driver.minutes")}
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
