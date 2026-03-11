import { useParams, Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { mockSellers } from "@/data/mockSellers";
import { useCropInventory } from "@/contexts/CropInventoryContext";
import { useLanguage } from "@/contexts/LanguageContext";
import ProductCard from "@/components/ProductCard";
import { Star, MapPin, Calendar, Sprout, Package, Recycle, Award } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import VoiceInput from "@/components/VoiceInput";
import { toast } from "sonner";

const SellerProfilePage = () => {
  const { id } = useParams<{ id: string }>();
  const { crops } = useCropInventory();
  const { t } = useLanguage();
  const seller = mockSellers.find((s) => s.id === id);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviews, setReviews] = useState(seller?.reviews ?? []);

  if (!seller) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-20 text-center">
          <span className="text-5xl block mb-4">🔍</span>
          <h1 className="text-2xl font-heading font-bold text-foreground">Seller not found</h1>
          <Link to="/marketplace" className="text-primary hover:underline text-sm mt-2 block">← Back to Marketplace</Link>
        </div>
        <Footer />
      </div>
    );
  }

  const sellerCrops = crops.filter((c) => c.sellerId === seller.id);
  const avgRating = reviews.length > 0
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : seller.averageRating.toFixed(1);

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    const newReview = {
      id: crypto.randomUUID(),
      buyerName: "You",
      rating: reviewRating,
      comment: reviewText,
      date: new Date().toISOString().split("T")[0],
    };
    setReviews((prev) => [newReview, ...prev]);
    setReviewText("");
    setReviewRating(5);
    toast.success(t("seller.review_submitted"));
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        {/* Profile Header */}
        <div className="farm-card p-6 mb-8">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="h-24 w-24 rounded-2xl bg-farm-green-light flex items-center justify-center shrink-0">
              <span className="text-4xl">{seller.sellerType === "community" ? "🌱" : "🌾"}</span>
            </div>
            <div className="flex-1 space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-heading font-bold text-foreground">
                  {seller.farmName || seller.name}
                </h1>
                <Badge variant={seller.sellerType === "community" ? "secondary" : "default"}>
                  {seller.sellerType === "community" ? "🌱 " + t("seller.community") : "🌾 " + t("seller.farm")}
                </Badge>
              </div>
              {seller.farmName && (
                <p className="text-muted-foreground text-sm">{t("seller.by")} {seller.name}</p>
              )}
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <MapPin className="h-4 w-4" /> {seller.location}, {seller.state}
                </span>
                {seller.yearsExperience && (
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" /> {seller.yearsExperience} {t("seller.years_exp")}
                  </span>
                )}
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 text-farm-orange fill-current" /> {avgRating} ({reviews.length} {t("seller.reviews")})
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {seller.cropsGrown.map((c) => (
                  <span key={c} className="farm-badge-green text-xs">{c}</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
          <div className="stat-card">
            <div className="h-12 w-12 rounded-full bg-farm-green-light flex items-center justify-center">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{seller.totalCropsSold}</p>
            <p className="text-sm text-muted-foreground">{t("seller.crops_sold")}</p>
          </div>
          <div className="stat-card">
            <div className="h-12 w-12 rounded-full bg-farm-green-light flex items-center justify-center">
              <Recycle className="h-6 w-6 text-primary" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{seller.cropsRescuedKg} kg</p>
            <p className="text-sm text-muted-foreground">{t("seller.rescued")}</p>
          </div>
          <div className="stat-card">
            <div className="h-12 w-12 rounded-full bg-farm-orange-light flex items-center justify-center">
              <Award className="h-6 w-6 text-accent" />
            </div>
            <p className="text-2xl font-heading font-bold text-foreground">{seller.ordersCompleted}</p>
            <p className="text-sm text-muted-foreground">{t("seller.orders")}</p>
          </div>
        </div>

        {/* Crops */}
        <h2 className="text-xl font-heading font-bold text-foreground mb-4">{t("seller.listings")}</h2>
        {sellerCrops.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {sellerCrops.map((crop) => (
              <ProductCard key={crop.id} crop={crop} />
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground text-sm mb-8">{t("seller.no_listings")}</p>
        )}

        {/* Reviews */}
        <h2 className="text-xl font-heading font-bold text-foreground mb-4">{t("seller.reviews_title")}</h2>
        
        {/* Submit review */}
        <div className="farm-card p-5 mb-6 space-y-3">
          <p className="font-medium text-sm text-foreground">{t("seller.leave_review")}</p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button key={star} onClick={() => setReviewRating(star)}>
                <Star
                  className={`h-6 w-6 transition-colors ${
                    star <= reviewRating ? "text-farm-orange fill-current" : "text-muted-foreground"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <Input
              placeholder={t("seller.review_placeholder")}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              className="flex-1"
            />
            <VoiceInput onResult={(text) => setReviewText(text)} />
            <Button onClick={handleSubmitReview} className="rounded-full" size="sm">
              {t("seller.submit")}
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="farm-card p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium text-sm text-foreground">{review.buyerName}</span>
                <span className="text-xs text-muted-foreground">{review.date}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${star <= review.rating ? "text-farm-orange fill-current" : "text-muted-foreground"}`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">"{review.comment}"</p>
            </div>
          ))}
          {reviews.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">{t("seller.no_reviews")}</p>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default SellerProfilePage;
