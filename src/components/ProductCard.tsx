import { CropListing } from "@/contexts/CartContext";
import { useCart } from "@/contexts/CartContext";
import { Button } from "@/components/ui/button";
import { MapPin, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
  crop: CropListing;
}

const ProductCard = ({ crop }: ProductCardProps) => {
  const { addToCart } = useCart();
  const discount = Math.round(((crop.usualPrice - crop.discountPrice) / crop.usualPrice) * 100);

  return (
    <div className="farm-card overflow-hidden group animate-fade-in-up">
      <div className="relative overflow-hidden">
        <img
          src={crop.image}
          alt={crop.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <span className="absolute top-3 right-3 farm-badge-green text-xs font-bold">
          {discount}% OFF
        </span>
      </div>
      <div className="p-4 space-y-3">
        <h3 className="font-heading font-bold text-foreground leading-tight">{crop.name}</h3>
        <div className="flex items-center gap-1 text-muted-foreground text-xs">
          <MapPin className="h-3 w-3" />
          <span>{crop.farmLocation}</span>
        </div>
        <div className="flex items-center gap-1 text-xs">
          <span className="farm-badge-orange">{crop.state}</span>
          <span className="text-muted-foreground">· {crop.quantity} kg available</span>
        </div>
        <div className="flex items-end justify-between">
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
