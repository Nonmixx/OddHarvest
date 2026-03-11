import { useState } from "react";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { IMPERFECT_REASONS, ImperfectReason } from "@/contexts/CartContext";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Search, MapPin, Filter } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";

const STATES = ["All", "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"];
const DISTANCE_OPTIONS_KEYS = [
  { labelKey: "market.any_dist", value: 999 },
  { label: "< 5 km", value: 5 },
  { label: "< 10 km", value: 10 },
  { label: "< 20 km", value: 20 },
  { label: "< 50 km", value: 50 },
];

const MarketplacePage = () => {
  const { crops } = useCropInventory();
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [maxDistance, setMaxDistance] = useState(999);
  const [sortBy, setSortBy] = useState<"default" | "price" | "freshness" | "distance">("default");
  const [sellerTypeFilter, setSellerTypeFilter] = useState<"all" | "farm" | "community">("all");
  const [imperfectFilter, setImperfectFilter] = useState<ImperfectReason | "all">("all");
  const [showBundlesOnly, setShowBundlesOnly] = useState(false);

  let filtered = crops.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchState = stateFilter === "All" || c.state === stateFilter;
    const matchDistance = c.distanceKm <= maxDistance;
    const matchSellerType = sellerTypeFilter === "all" || c.sellerType === sellerTypeFilter;
    const matchImperfect = imperfectFilter === "all" || c.imperfectReason === imperfectFilter;
    const matchBundle = !showBundlesOnly || c.isBundle;
    return matchSearch && matchState && matchDistance && matchSellerType && matchImperfect && matchBundle;
  });

  if (sortBy === "price") {
    filtered = [...filtered].sort((a, b) => a.discountPrice - b.discountPrice);
  } else if (sortBy === "freshness") {
    filtered = [...filtered].sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
  } else if (sortBy === "distance") {
    filtered = [...filtered].sort((a, b) => a.distanceKm - b.distanceKm);
  }

  const nearbyFarms = crops
    .filter((c) => c.distanceKm <= 10)
    .reduce((acc, c) => {
      const key = c.farmLocation;
      if (!acc.find((f) => f.location === key)) {
        acc.push({ location: key, distance: c.distanceKm, farmerName: c.farmerName });
      }
      return acc;
    }, [] as { location: string; distance: number; farmerName: string }[])
    .sort((a, b) => a.distance - b.distance);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">{t("market.title")}</h1>
          <p className="text-muted-foreground">{t("market.subtitle")}</p>
        </div>

        {nearbyFarms.length > 0 && (
          <div className="farm-card p-5 mb-8">
            <h2 className="font-heading font-bold text-foreground flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              {t("market.nearby")}
            </h2>
            <div className="flex flex-wrap gap-3">
              {nearbyFarms.map((f, i) => (
                <div key={i} className="bg-farm-green-light rounded-xl px-4 py-2.5 flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground">{f.location}</span>
                  <span className="text-xs text-primary font-bold">{f.distance} km</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t("market.search")}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <VoiceInput onResult={(text) => setSearch(text)} />
            </div>
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {DISTANCE_OPTIONS_KEYS.map((d) => (
                <option key={d.value} value={d.value}>{d.labelKey ? t(d.labelKey) : d.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="default">{t("market.sort")}</option>
              <option value="price">{t("market.sort.price")}</option>
              <option value="freshness">{t("market.sort.fresh")}</option>
              <option value="distance">{t("market.sort.near")}</option>
            </select>
          </div>

          {/* Seller type & imperfect reason filters */}
          <div className="flex flex-wrap items-center gap-3">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select
              value={sellerTypeFilter}
              onChange={(e) => setSellerTypeFilter(e.target.value as typeof sellerTypeFilter)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="all">{t("market.all_sellers")}</option>
              <option value="farm">🌾 {t("seller.farm")}</option>
              <option value="community">🌱 {t("seller.community")}</option>
            </select>
            <select
              value={imperfectFilter}
              onChange={(e) => setImperfectFilter(e.target.value as typeof imperfectFilter)}
              className="h-9 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="all">{t("market.all_reasons")}</option>
              {IMPERFECT_REASONS.map((r) => (
                <option key={r.value} value={r.value}>{r.emoji} {t(`imperfect.${r.value}`)}</option>
              ))}
            </select>
            <button
              onClick={() => setShowBundlesOnly(!showBundlesOnly)}
              className={`h-9 px-4 rounded-lg border text-sm font-medium transition-colors ${
                showBundlesOnly
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-background border-input text-foreground hover:bg-secondary"
              }`}
            >
              📦 {t("market.bundles")}
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {STATES.map((s) => (
              <button
                key={s}
                onClick={() => setStateFilter(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  stateFilter === s
                    ? "bg-primary text-primary-foreground"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <p className="text-sm text-muted-foreground mb-4">{filtered.length} crop{filtered.length !== 1 ? "s" : ""} {t("market.found")}</p>

        {/* Imperfect reason education banner */}
        {imperfectFilter !== "all" && (
          <div className="farm-card p-4 mb-6 bg-farm-green-light border-primary/20">
            <p className="text-sm text-foreground">
              💡 {t("imperfect.education")}
            </p>
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
                {stateFilter !== "All" ? `No crops in ${stateFilter} yet` : t("market.no_crops")}
              </h2>
              <p className="text-sm text-muted-foreground">
                {stateFilter !== "All"
                  ? `There are no farmers listing crops in ${stateFilter} at the moment.`
                  : "Try adjusting your search or filters to find fresh produce."}
              </p>
              {stateFilter !== "All" && (
                <button
                  onClick={() => setStateFilter("All")}
                  className="text-sm text-primary font-medium hover:underline"
                >
                  {t("market.browse_all")}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MarketplacePage;
