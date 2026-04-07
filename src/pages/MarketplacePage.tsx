import { useEffect, useState, useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { formatDistance } from "@/lib/freshness";
import { IMPERFECT_REASONS, ImperfectReason, CropListing } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter, Sparkles } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";

const STATES = ["All", "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"];
const DISTANCE_OPTIONS_KEYS = [
  { labelKey: "market.any_dist", value: 999 },
  { label: "< 5 km", value: 5 },
  { label: "< 10 km", value: 10 },
  { label: "< 20 km", value: 20 },
  { label: "< 50 km", value: 50 },
];

type LatLng = { lat: number; lng: number };

const FALLBACK_USER_LOCATION_KL: LatLng = { lat: 3.139, lng: 101.6869 };
const MAX_RECOMMENDATION_DISTANCE_KM = 60;

// Coords for demo seller locations (used to compute "nearby" + recommendations)
const FARM_LOCATION_COORDS: Record<string, LatLng> = {
  "Ladang Pak Ali, Cameron Highlands": { lat: 4.4725, lng: 101.3891 },
  "Kebun Mak Intan, Tanah Rata": { lat: 4.4693, lng: 101.3826 },
  "Kebun Buah, Cameron Highlands": { lat: 4.4785, lng: 101.377 },
  "Ladang Hijau, Ipoh": { lat: 4.5975, lng: 101.0901 },
  "Ladang Jagung, Kota Bharu": { lat: 6.1254, lng: 102.2381 },
  "Kebun Organik, Kundasang": { lat: 6.0268, lng: 116.5481 },
  "Ladang Pisang, Johor Bahru": { lat: 1.4927, lng: 103.7414 },
  "Home Garden, Petaling Jaya": { lat: 3.1073, lng: 101.6067 },
  "Home Garden, Kajang": { lat: 2.993, lng: 101.787 },
  "Kebun Sayur, Serdang": { lat: 2.9928, lng: 101.7124 },
};

const STATE_CENTER_COORDS: Record<string, LatLng> = {
  "Kuala Lumpur": { lat: 3.139, lng: 101.6869 },
  Selangor: { lat: 3.0738, lng: 101.5183 },
  Pahang: { lat: 3.8077, lng: 103.326 },
  Perak: { lat: 4.5975, lng: 101.0901 },
  Johor: { lat: 1.4927, lng: 103.7414 },
  Kelantan: { lat: 6.1254, lng: 102.2381 },
  Sabah: { lat: 5.9804, lng: 116.0735 },
  "Negeri Sembilan": { lat: 2.7297, lng: 101.9381 },
  Penang: { lat: 5.4164, lng: 100.3327 },
  Terengganu: { lat: 5.3302, lng: 103.1408 },
  Melaka: { lat: 2.1896, lng: 102.2501 },
  Kedah: { lat: 6.1248, lng: 100.3678 },
  Sarawak: { lat: 1.5535, lng: 110.3593 },
  Perlis: { lat: 6.4449, lng: 100.2048 },
  Putrajaya: { lat: 2.9264, lng: 101.6964 },
  Labuan: { lat: 5.2831, lng: 115.2308 },
};

function inferCoordsFromLocationText(text: string): LatLng | null {
  const v = text.toLowerCase();
  if (v.includes("kuala lumpur") || v.includes(" kl")) return { lat: 3.139, lng: 101.6869 };
  if (v.includes("petaling jaya")) return { lat: 3.1073, lng: 101.6067 };
  if (v.includes("subang jaya")) return { lat: 3.0565, lng: 101.5851 };
  if (v.includes("kajang")) return { lat: 2.993, lng: 101.787 };
  if (v.includes("serdang")) return { lat: 2.9928, lng: 101.7124 };
  if (v.includes("cameron")) return { lat: 4.4725, lng: 101.3891 };
  if (v.includes("ipoh")) return { lat: 4.5975, lng: 101.0901 };
  if (v.includes("johor bahru")) return { lat: 1.4927, lng: 103.7414 };
  if (v.includes("kota bharu")) return { lat: 6.1254, lng: 102.2381 };
  if (v.includes("kundasang")) return { lat: 6.0268, lng: 116.5481 };
  return null;
}

function resolveCropCoords(farmLocation: string, state: string): LatLng | null {
  return (
    FARM_LOCATION_COORDS[farmLocation] ||
    inferCoordsFromLocationText(farmLocation) ||
    STATE_CENTER_COORDS[state] ||
    null
  );
}

function haversineKm(a: LatLng, b: LatLng) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const s =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s));
  return R * c;
}

function inferUserRegionState(userCoords: LatLng): "Kuala Lumpur" | "Selangor" | null {
  // Rough bounding box around Kuala Lumpur Federal Territory
  const inKL =
    userCoords.lat >= 3.05 &&
    userCoords.lat <= 3.25 &&
    userCoords.lng >= 101.60 &&
    userCoords.lng <= 101.80;
  if (inKL) return "Kuala Lumpur";
  return null;
}

const MarketplacePage = () => {
  const { crops } = useCropInventory();
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [maxDistance, setMaxDistance] = useState(999);
  const [sortBy, setSortBy] = useState<"default" | "price" | "freshness" | "distance">("default");
  const [sellerTypeFilter, setSellerTypeFilter] = useState<"all" | "farm" | "community">("all");
  const [imperfectFilter, setImperfectFilter] = useState<ImperfectReason | "all">("all");
  const [showBundlesOnly, setShowBundlesOnly] = useState(false);
  const [showMysteryOnly, setShowMysteryOnly] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const [userCoords, setUserCoords] = useState<LatLng>(FALLBACK_USER_LOCATION_KL);
  const [geoPermission, setGeoPermission] = useState<"unknown" | "granted" | "denied" | "prompt">("unknown");

  useEffect(() => {
    if (!user) return;
    if (!("geolocation" in navigator)) return;
    let watchId: number | null = null;

    const startWatch = () => {
      if (watchId != null) return;
      watchId = navigator.geolocation.watchPosition(
        (pos) => setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => {
          if (err.code === err.PERMISSION_DENIED) setGeoPermission("denied");
          // keep fallback (KL) for demo if denied/unavailable
        },
        { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 }
      );
    };

    // Ask permission early when marketplace loads (some browsers still require user gesture,
    // but this will prompt on most).
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoPermission("granted");
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        startWatch();
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGeoPermission("denied");
        else setGeoPermission("prompt");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 }
    );

    // If Permissions API is available, keep permission state in sync
    (async () => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const perms: any = (navigator as any).permissions;
        if (!perms?.query) return;
        const status = await perms.query({ name: "geolocation" });
        setGeoPermission(status.state);
        status.onchange = () => setGeoPermission(status.state);
        if (status.state === "granted") startWatch();
      } catch {
        // ignore
      }
    })();

    return () => {
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);

  const requestLocation = useCallback(() => {
    if (!("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeoPermission("granted");
        setUserCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) setGeoPermission("denied");
        else setGeoPermission("prompt");
      },
      { enableHighAccuracy: true, maximumAge: 10000, timeout: 8000 }
    );
  }, []);

  const cropsWithGeoDistance = useMemo(() => {
    return crops.map((c) => {
      const farm = resolveCropCoords(c.farmLocation, c.state);
      if (!farm) {
        // Still avoid false "nearby" when we have no reliable coordinates.
        return { ...c, distanceKm: 999 };
      }
      const km = haversineKm(userCoords, farm);
      const rounded = Math.max(1, Math.round(km * 10) / 10);
      return { ...c, distanceKm: rounded };
    });
  }, [crops, userCoords]);

  const userRegionState = useMemo(() => inferUserRegionState(userCoords), [userCoords]);

  const cropsInReasonableRegion = useMemo(() => {
    return cropsWithGeoDistance.filter((c) => {
      if (c.distanceKm > MAX_RECOMMENDATION_DISTANCE_KM) return false;
      if (!userRegionState) return true;
      // Treat KL + Selangor as one metro region for recommendations
      if (userRegionState === "Kuala Lumpur") return c.state === "Kuala Lumpur" || c.state === "Selangor";
      return c.state === userRegionState;
    });
  }, [cropsWithGeoDistance, userRegionState]);


  let filtered = cropsWithGeoDistance.filter((c) => {
    const translatedName = tc(c.name).toLowerCase();
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase()) || translatedName.includes(search.toLowerCase());
    const matchState = stateFilter === "All" || c.state === stateFilter;
    const matchDistance = c.distanceKm <= maxDistance;
    const matchSellerType = sellerTypeFilter === "all" || c.sellerType === sellerTypeFilter;
    const matchImperfect = imperfectFilter === "all" || c.imperfectReason === imperfectFilter;
    const matchBundle = !showBundlesOnly || (c.isBundle && !c.isMysteryBox);
    const matchMystery = !showMysteryOnly || c.isMysteryBox;
    return matchSearch && matchState && matchDistance && matchSellerType && matchImperfect && matchBundle && matchMystery;
  });

  if (sortBy === "price") filtered = [...filtered].sort((a, b) => a.discountPrice - b.discountPrice);
  else if (sortBy === "freshness") filtered = [...filtered].sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
  else if (sortBy === "distance") filtered = [...filtered].sort((a, b) => a.distanceKm - b.distanceKm);

  const nearbyFarms = cropsWithGeoDistance
    .filter((c) => c.distanceKm <= 10)
    .reduce((acc, c) => {
      if (!acc.find((f) => f.sellerId === c.sellerId)) {
        acc.push({ location: c.farmLocation, distance: c.distanceKm, farmerName: c.farmerName, sellerId: c.sellerId });
      }
      return acc;
    }, [] as { location: string; distance: number; farmerName: string; sellerId: string }[])
    .sort((a, b) => a.distance - b.distance);

  // Smart recommendations
  const recommendations = useMemo(() => {
    const tagged: { crop: CropListing; tag: string }[] = [];
    const usedIds = new Set<string>();

    // Near you (distance <= 10km)
    const nearby = [...cropsInReasonableRegion]
      .filter((c) => c.distanceKm <= 10 && c.quantity > 0)
      .sort((a, b) => a.distanceKm - b.distanceKm);
    for (const c of nearby) {
      if (tagged.length >= 2 || usedIds.has(c.id)) continue;
      tagged.push({ crop: c, tag: "market.near_you" });
      usedIds.add(c.id);
    }

    // Best deal (highest discount %)
    const deals = [...cropsInReasonableRegion]
      .filter((c) => !c.isBundle && !c.isMysteryBox && c.quantity > 0)
      .map((c) => ({ crop: c, discount: Math.round(((c.usualPrice - c.discountPrice) / c.usualPrice) * 100) }))
      .sort((a, b) => b.discount - a.discount);
    for (const d of deals) {
      if (tagged.length >= 4 || usedIds.has(d.crop.id) || d.discount < 10) continue;
      tagged.push({ crop: d.crop, tag: "market.best_deal" });
      usedIds.add(d.crop.id);
    }

    // Popular / recently added
    const recent = [...cropsInReasonableRegion]
      .filter((c) => c.quantity > 0)
      .sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
    for (const c of recent) {
      if (tagged.length >= 6 || usedIds.has(c.id)) continue;
      tagged.push({ crop: c, tag: "market.popular" });
      usedIds.add(c.id);
    }

    return tagged;
  }, [cropsInReasonableRegion]);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t("market.title")}</h1>
          <p className="text-muted-foreground">{t("market.subtitle")}</p>
        </div>

        {user && geoPermission !== "granted" && (
          <div className="farm-card p-5 mb-8 border-primary/20 bg-farm-green-light">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="space-y-1">
                <p className="font-heading font-bold text-foreground">{t("market.location_title")}</p>
                <p className="text-sm text-muted-foreground">{t("market.location_desc")}</p>
              </div>
              <div className="flex items-center gap-2">
                <Button className="rounded-full" onClick={requestLocation}>
                  {t("market.enable_location")}
                </Button>
                {geoPermission === "denied" && (
                  <span className="text-xs text-muted-foreground">{t("market.location_denied")}</span>
                )}
              </div>
            </div>
          </div>
        )}

        {user && nearbyFarms.length > 0 && (
          <div className="farm-card p-5 mb-8">
            <h2 className="font-heading font-bold text-foreground flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              {t("market.nearby")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {nearbyFarms.map((f, i) => (
                <div
                  key={i}
                  className="bg-farm-green-light rounded-xl px-4 py-2.5 flex items-center gap-2 cursor-pointer hover:shadow-md hover:bg-farm-green-light/80 transition-all"
                  onClick={() => navigate(`/seller/${f.sellerId}`)}
                >
                  <span className="text-sm font-medium text-foreground">{tc(f.location)}</span>
                  <span className="text-xs text-primary font-bold">{formatDistance(f.distance, language)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {user && recommendations.length > 0 && (
          <div className="mb-8">
            <button
              onClick={() => setShowRecommendations(!showRecommendations)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-input bg-background text-sm font-medium text-foreground hover:bg-secondary transition-colors"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              {showRecommendations ? t("market.hide_recommendations") : t("market.show_recommendations")}
            </button>
            {showRecommendations && (
              <div className="mt-4">
                <ScrollArea className="w-full">
                  <div className="flex gap-4 pb-4">
                    {recommendations.map(({ crop, tag }) => (
                      <div key={crop.id} className="min-w-[260px] max-w-[280px] flex-shrink-0">
                        <Badge
                          variant="secondary"
                          className="mb-2 text-[10px] font-semibold"
                        >
                          {tag === "market.near_you" && "📍"} 
                          {tag === "market.best_deal" && "🔥"} 
                          {tag === "market.popular" && "⭐"} 
                          {t(tag)}
                        </Badge>
                        <ProductCard crop={crop} />
                      </div>
                    ))}
                  </div>
                  <ScrollBar orientation="horizontal" />
                </ScrollArea>
              </div>
            )}
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder={t("market.search")} value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" />
              </div>
              <VoiceInput onResult={(text) => setSearch(text)} />
            </div>
            <select value={maxDistance} onChange={(e) => setMaxDistance(Number(e.target.value))} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
              {DISTANCE_OPTIONS_KEYS.map((d) => (
                <option key={d.value} value={d.value}>{d.labelKey ? t(d.labelKey) : d.label}</option>
              ))}
            </select>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)} className="h-10 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="default">{t("market.sort")}</option>
              <option value="price">{t("market.sort.price")}</option>
              <option value="freshness">{t("market.sort.fresh")}</option>
              <option value="distance">{t("market.sort.near")}</option>
            </select>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select value={sellerTypeFilter} onChange={(e) => setSellerTypeFilter(e.target.value as typeof sellerTypeFilter)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="all">{t("market.all_sellers")}</option>
              <option value="farm">🌾 {t("seller.farm")}</option>
              <option value="community">🌱 {t("seller.community")}</option>
            </select>
            <select value={imperfectFilter} onChange={(e) => setImperfectFilter(e.target.value as typeof imperfectFilter)} className="h-9 rounded-lg border border-input bg-background px-3 text-sm">
              <option value="all">{t("market.all_reasons")}</option>
              {IMPERFECT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.emoji} {t(`imperfect.${r.value}`)}</option>
              ))}
            </select>
            <button
              onClick={() => { setShowBundlesOnly(!showBundlesOnly); if (!showBundlesOnly) setShowMysteryOnly(false); }}
              className={`h-9 px-4 rounded-lg border text-sm font-medium transition-colors ${showBundlesOnly ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input text-foreground hover:bg-secondary"}`}
            >
              📦 {t("market.bundles")}
            </button>
            <button
              onClick={() => { setShowMysteryOnly(!showMysteryOnly); if (!showMysteryOnly) setShowBundlesOnly(false); }}
              className={`h-9 px-4 rounded-lg border text-sm font-medium transition-colors ${showMysteryOnly ? "bg-primary text-primary-foreground border-primary" : "bg-background border-input text-foreground hover:bg-secondary"}`}
            >
              🎁 {t("product.mystery_box") || "Mystery Box"}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATES.map((s) => (
              <button
                key={s}
                onClick={() => setStateFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${stateFilter === s ? "bg-primary text-primary-foreground" : "bg-secondary text-secondary-foreground hover:bg-secondary/80"}`}
              >
                {tc(s)}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">
          {filtered.length} {filtered.length !== 1 ? t("market.crops_count") : t("market.crop_count")} {t("market.found")}
        </p>

        {imperfectFilter !== "all" && (
          <div className="farm-card p-4 mb-6 bg-farm-green-light border-primary/20">
            <p className="text-sm text-foreground">💡 {t("imperfect.education")}</p>
          </div>
        )}

        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((crop) => (
              <ProductCard key={crop.id} crop={crop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="farm-card max-w-md mx-auto p-10 space-y-4">
              <span className="text-5xl block">🌱</span>
              <h2 className="font-heading font-bold text-foreground text-xl">
                {stateFilter !== "All" ? t("market.no_crops_in_state").replace("{state}", tc(stateFilter)) : t("market.no_crops")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {stateFilter !== "All"
                  ? t("market.no_crops_in_state_desc").replace("{state}", tc(stateFilter))
                  : t("market.no_crops_desc")}
              </p>
              {stateFilter !== "All" && (
                <button onClick={() => setStateFilter("All")} className="text-sm text-primary font-medium hover:underline">
                  {t("market.browse_all")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      
    </div>
  );
};

export default MarketplacePage;
