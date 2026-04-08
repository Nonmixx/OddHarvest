import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Store, MapPin, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { toast } from "sonner";
import { useReviews } from "@/contexts/ReviewContext";
import { useAuth } from "@/contexts/AuthContext";
import { OrderCrop, OrderData } from "@/data/mockOrders";
import { getOrderById } from "@/lib/repositories/ordersRepo";

const RatingStars = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} onClick={() => onRate(star)} className="transition-transform hover:scale-125">
        <Star
          className={`h-5 w-5 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30 hover:text-yellow-300"}`}
        />
      </button>
    ))}
  </div>
);

const OrderDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t, language } = useLanguage();
  const tc = (text: string) => translateContent(text, language);
  const { addReview } = useReviews();
  const { user } = useAuth();
  const [order, setOrder] = useState<OrderData | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!id) return;
    (async () => {
      const buyerId = user?.role === "buyer" ? user.id : null;
      const row = await getOrderById(id, buyerId);
      if (mounted) setOrder(row);
    })();
    return () => {
      mounted = false;
    };
  }, [id, user?.id, user?.role]);

  // Ratings state: keyed by `sellerId-cropName`
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [reviewTexts, setReviewTexts] = useState<Record<string, string>>({});
  const [submittedRatings, setSubmittedRatings] = useState<Record<string, boolean>>({});

  if (!order) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <h1 className="text-2xl font-heading font-bold text-foreground mb-4">{t("order.not_found")}</h1>
          <Button onClick={() => navigate("/buyer-dashboard")}>{t("order.back_dashboard")}</Button>
        </div>
        
      </div>
    );
  }

  // Group items by seller
  const sellerGroups: Record<string, OrderCrop[]> = {};
  order.items.forEach((item) => {
    if (!sellerGroups[item.sellerId]) sellerGroups[item.sellerId] = [];
    sellerGroups[item.sellerId].push(item);
  });

  const handleRate = (key: string, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmitRating = (key: string, sellerName: string, sellerId: string) => {
    setSubmittedRatings((prev) => ({ ...prev, [key]: true }));
    addReview({
      id: crypto.randomUUID(),
      buyerName: user?.name || "Anonymous",
      rating: ratings[key] || 5,
      comment: reviewTexts[key] || "",
      date: new Date().toISOString().split("T")[0],
      sellerId,
    });
    toast.success(`${t("order.rating_submitted")} ${sellerName}! ⭐`);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/buyer-dashboard")}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{t("order.details")}</h1>
            <p className="text-muted-foreground text-sm">{order.id}</p>
          </div>
        </div>

        {/* Order Summary */}
        <Card className="mb-6">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("order.date")}</span>
              <span className="font-medium text-foreground">{order.date}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("order.status")}</span>
              <span className="farm-badge-green text-xs">{tc(order.status)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("order.total_rescued")}</span>
              <span className="font-medium text-foreground">{order.kg} kg</span>
            </div>
            <div className="flex justify-between text-sm font-bold">
              <span className="text-foreground">{t("order.total")}</span>
              <span className="text-primary">RM{order.total.toFixed(2)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Items grouped by seller */}
        {Object.entries(sellerGroups).map(([sellerId, items]) => {
          const seller = items[0];
          return (
            <Card key={sellerId} className="mb-4">
              <CardContent className="p-4">
                {/* Seller header */}
                <div
                  className="flex items-center gap-2 mb-4 pb-3 border-b border-border cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => navigate(`/seller/${sellerId}`)}
                >
                  <Store className="h-5 w-5 text-primary" />
                  <div>
                    <p className="font-heading font-bold text-foreground text-sm">{tc(seller.sellerName)}</p>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {tc(seller.sellerLocation)}
                    </div>
                  </div>
                </div>

                {/* Crops from this seller */}
                <div className="space-y-4">
                  {items.map((item) => {
                    const ratingKey = `${sellerId}-${item.name}`;
                    const currentRating = ratings[ratingKey] || 0;
                    const isSubmitted = submittedRatings[ratingKey] || false;

                    return (
                      <div key={ratingKey}>
                        <div className="flex gap-3 items-center">
                          <img
                            src={item.image}
                            alt={item.name}
                            className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{tc(item.name)}</p>
                          </div>
                          <div className="text-right flex-shrink-0">
                            <p className="text-sm font-semibold text-primary">RM{(item.qty * item.price).toFixed(2)}</p>
                            <p className="text-xs text-muted-foreground">{item.qty} kg</p>
                          </div>
                        </div>

                        {/* Rating & Review section */}
                        <div className="mt-3 p-3 rounded-xl bg-muted/50 border border-border/50">
                          {isSubmitted ? (
                            <div className="space-y-1.5">
                              <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium text-primary">{t("order.thank_you")}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`h-3.5 w-3.5 ${star <= currentRating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`} />
                                ))}
                                <span className="text-xs text-muted-foreground ml-1">{currentRating}/5</span>
                              </div>
                              {reviewTexts[ratingKey] && (
                                <p className="text-xs text-muted-foreground italic">"{reviewTexts[ratingKey]}"</p>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-2.5">
                              <div className="flex items-center justify-between">
                                <p className="text-xs font-medium text-foreground">{t("order.rate_crop")}</p>
                                <RatingStars rating={currentRating} onRate={(r) => handleRate(ratingKey, r)} />
                              </div>
                              <textarea
                                placeholder={t("order.review_placeholder") || "Share your experience with this product..."}
                                value={reviewTexts[ratingKey] || ""}
                                onChange={(e) => setReviewTexts((prev) => ({ ...prev, [ratingKey]: e.target.value }))}
                                rows={2}
                                className="w-full text-sm rounded-lg border border-border bg-background px-3 py-2 placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring resize-none"
                              />
                              <Button
                                size="sm"
                                className="h-8 text-xs rounded-full px-5 bg-primary hover:bg-primary/90"
                                disabled={currentRating === 0 && !reviewTexts[ratingKey]}
                                onClick={() => handleSubmitRating(ratingKey, seller.sellerName, sellerId)}
                              >
                                {t("order.submit_review")}
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
    </div>
  );
};

export default OrderDetailPage;
