import { useState } from "react";
import { mockCrops } from "@/data/mockCrops";
import ProductCard from "@/components/ProductCard";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Input } from "@/components/ui/input";
import { Search, MapPin, SlidersHorizontal } from "lucide-react";

const STATES = ["All", "Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"];
const DISTANCE_OPTIONS = [
  { label: "Any distance", value: 999 },
  { label: "< 5 km", value: 5 },
  { label: "< 10 km", value: 10 },
  { label: "< 20 km", value: 20 },
  { label: "< 50 km", value: 50 },
];

const MarketplacePage = () => {
  const [search, setSearch] = useState("");
  const [stateFilter, setStateFilter] = useState("All");
  const [maxDistance, setMaxDistance] = useState(999);
  const [sortBy, setSortBy] = useState<"default" | "price" | "freshness" | "distance">("default");

  let filtered = mockCrops.filter((c) => {
    const matchSearch = c.name.toLowerCase().includes(search.toLowerCase());
    const matchState = stateFilter === "All" || c.state === stateFilter;
    const matchDistance = c.distanceKm <= maxDistance;
    return matchSearch && matchState && matchDistance;
  });

  // Sort
  if (sortBy === "price") {
    filtered = [...filtered].sort((a, b) => a.discountPrice - b.discountPrice);
  } else if (sortBy === "freshness") {
    filtered = [...filtered].sort((a, b) => new Date(b.harvestDate).getTime() - new Date(a.harvestDate).getTime());
  } else if (sortBy === "distance") {
    filtered = [...filtered].sort((a, b) => a.distanceKm - b.distanceKm);
  }

  // Nearby farms
  const nearbyFarms = mockCrops
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
          <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Marketplace 🛒</h1>
          <p className="text-muted-foreground">Fresh, imperfect produce at amazing prices</p>
        </div>

        {/* Nearby Farms */}
        {nearbyFarms.length > 0 && (
          <div className="farm-card p-5 mb-8">
            <h2 className="font-heading font-bold text-foreground flex items-center gap-2 mb-3">
              <MapPin className="h-5 w-5 text-primary" />
              Nearby Farms
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

        {/* Filters */}
        <div className="space-y-4 mb-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search crops..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Distance filter */}
            <select
              value={maxDistance}
              onChange={(e) => setMaxDistance(Number(e.target.value))}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              {DISTANCE_OPTIONS.map((d) => (
                <option key={d.value} value={d.value}>{d.label}</option>
              ))}
            </select>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="h-10 rounded-lg border border-input bg-background px-3 text-sm"
            >
              <option value="default">Sort by</option>
              <option value="price">Lowest Price</option>
              <option value="freshness">Most Fresh</option>
              <option value="distance">Nearest</option>
            </select>
          </div>

          {/* State filter pills */}
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

        {/* Results count */}
        <p className="text-sm text-muted-foreground mb-4">{filtered.length} crop{filtered.length !== 1 ? "s" : ""} found</p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((crop) => (
              <ProductCard key={crop.id} crop={crop} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No crops found 🥲</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default MarketplacePage;
