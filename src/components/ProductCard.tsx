import { CropListing } from "@/contexts/CartContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { MapPin, ShoppingCart, Clock, Sprout } from "lucide-react";
import { toast } from "sonner";
import { getFreshnessInfo } from "@/lib/freshness";

interface ProductCardProps {
  crop: CropListing;
}

const ProductCard = ({ crop }: ProductCardProps) => {
  const { addToCart } = useCart();
  const discount = Math.round(((crop.usualPrice - crop.discountPrice) / crop.usualPrice) * 100);
  const freshness = getFreshnessInfo(crop.harvestDate);

  return (
    <div className="farm-card overflow-hidden group animate-fade-in-up">
      <div className="relative overflow-hidden">
        <img
          src={crop.image}
          alt={crop.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 left-3 farm-badge-green text-xs font-bold">
          Save {discount}%
        </span>
        <span className="absolute top-3 right-3 bg-card/90 backdrop-blur-sm text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
          {freshness.emoji} {freshness.label}
        </span>
      </div>
      <div className="p-4 space-y-2.5">
        <h3 className="font-heading font-bold text-foreground leading-tight">{crop.name}</h3>
        
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <MapPin className="h-3 w-3 shrink-0" />
          <span className="truncate">{crop.farmLocation}</span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <span className="farm-badge-orange">{crop.state}</span>
          <span className="text-muted-foreground flex items-center gap-1">
            <Sprout className="h-3 w-3" />
            {crop.quantity} kg left
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Clock className="h-3 w-3" />
          <span>Harvested: {freshness.daysAgo}</span>
        </div>

        {crop.distanceKm && (
          <div className="text-xs text-muted-foreground">
            📍 {crop.distanceKm} km from you
          </div>
        )}

        <div className="flex items-end justify-between pt-1">
          <div>
            <p className="price-original">RM{crop.usualPrice.toFixed(2)}/kg</p>
            <p className="price-discount">RM{crop.discountPrice.toFixed(2)}/kg</p>
          </div>
          <Button
            size="sm"
            onClick={() => {
              addToCart(crop, 1);
              toast.success(`${crop.name} added to cart! 🥕`);
            }}
            className="rounded-full"
          >
            <ShoppingCart className="h-4 w-4 mr-1" />
            Add
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
