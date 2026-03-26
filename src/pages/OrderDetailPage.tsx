import { useParams, useNavigate } from "react-router-dom";
import { useState, useRef } from "react";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Star, Store, MapPin, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { translateContent } from "@/lib/contentTranslations";
import { toast } from "sonner";

interface OrderCrop {
  name: string;
  qty: number;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
}

interface OrderData {
  id: string;
  date: string;
  status: string;
  total: number;
  kg: number;
  items: OrderCrop[];
}

const mockOrders: Record<string, OrderData> = {
  "ORD-001": {
    id: "ORD-001",
    date: "2026-03-05",
    status: "Delivered",
    total: 15.5,
    kg: 5,
    items: [
      { name: "Tomatoes (Imperfect Shape)", qty: 2, price: 3, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop", sellerId: "seller-1", sellerName: "Pak Ali", sellerLocation: "Cameron Highlands" },
      { name: "Carrots (Imperfect Shape)", qty: 1, price: 2.5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop", sellerId: "seller-2", sellerName: "Mak Intan", sellerLocation: "Tanah Rata" },
    ],
  },
  "ORD-002": {
    id: "ORD-002",
    date: "2026-03-03",
    status: "Delivered",
    total: 8.4,
    kg: 6,
    items: [
      { name: "Corn (Irregular Kernels)", qty: 3, price: 1.2, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop", sellerId: "seller-7", sellerName: "Pak Murad", sellerLocation: "Kota Bharu" },
      { name: "Cucumbers (Oversized)", qty: 2, price: 1.8, image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=300&fit=crop", sellerId: "seller-3", sellerName: "Encik Hassan", sellerLocation: "Ipoh" },
    ],
  },
  "ORD-003": {
    id: "ORD-003",
    date: "2026-02-28",
    status: "Picked Up",
    total: 22,
    kg: 4,
    items: [
      { name: "Apples (Minor Blemishes)", qty: 2, price: 5, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop", sellerId: "seller-6", sellerName: "Puan Siti", sellerLocation: "Cameron Highlands" },
      { name: "Bell Peppers (Mixed Colors)", qty: 2, price: 3.5, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop", sellerId: "seller-3", sellerName: "Encik Hassan", sellerLocation: "Ipoh" },
    ],
  },
  "ORD-004": {
    id: "ORD-004",
    date: "2026-02-25",
    status: "Delivered",
    total: 10.5,
    kg: 5,
    items: [
      { name: "Bananas (Short & Stubby)", qty: 3, price: 1.5, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop", sellerId: "seller-1", sellerName: "Pak Ali", sellerLocation: "Cameron Highlands" },
      { name: "Spinach (Leafy Overgrowth)", qty: 2, price: 2, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop", sellerId: "seller-8", sellerName: "Encik Lim", sellerLocation: "Serdang" },
    ],
  },
  "ORD-005": {
    id: "ORD-005",
    date: "2026-02-20",
    status: "Picked Up",
    total: 12,
    kg: 3,
    items: [
      { name: "Tomatoes (Imperfect Shape)", qty: 1, price: 3, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop", sellerId: "seller-1", sellerName: "Pak Ali", sellerLocation: "Cameron Highlands" },
      { name: "Corn (Irregular Kernels)", qty: 2, price: 1.2, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop", sellerId: "seller-7", sellerName: "Pak Murad", sellerLocation: "Kota Bharu" },
    ],
  },
  "ORD-006": {
    id: "ORD-006",
    date: "2026-02-15",
    status: "Delivered",
    total: 5,
    kg: 2,
    items: [
      { name: "Carrots (Imperfect Shape)", qty: 2, price: 2.5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop", sellerId: "seller-2", sellerName: "Mak Intan", sellerLocation: "Tanah Rata" },
    ],
  },
};

const RatingStars = ({ rating, onRate }: { rating: number; onRate: (r: number) => void }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((star) => (
      <button key={star} onClick={() => onRate(star)} className="transition-transform hover:scale-110">
        <Star
          className={`h-6 w-6 ${star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground/30"}`}
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

  const order = id ? mockOrders[id] : null;

  // Ratings state: keyed by `sellerId-cropName`
  const [ratings, setRatings] = useState<Record<string, number>>({});
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

  const handleSubmitRating = (key: string, sellerName: string) => {
    setSubmittedRatings((prev) => ({ ...prev, [key]: true }));
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
                      <div key={ratingKey} className="flex gap-3">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm truncate">{tc(item.name)}</p>
                          <p className="text-xs text-muted-foreground">
                            x{item.qty} · RM{item.price.toFixed(2)}/{tc("kg")}
                          </p>
                          <p className="text-xs font-semibold text-primary">
                            RM{(item.qty * item.price).toFixed(2)}
                          </p>

                          {/* Rating section */}
                          <div className="mt-2">
                            {isSubmitted ? (
                              <div className="flex items-center gap-1.5 text-xs text-primary">
                                <CheckCircle className="h-4 w-4" />
                                {t("order.rated")} {currentRating}/5 — {t("order.thank_you")}
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                <p className="text-xs text-muted-foreground">{t("order.rate_crop")}:</p>
                                <div className="flex items-center gap-2">
                                  <RatingStars rating={currentRating} onRate={(r) => handleRate(ratingKey, r)} />
                                  {currentRating > 0 && (
                                    <Button
                                      size="sm"
                                      variant="outline"
                                      className="h-7 text-xs rounded-full"
                                      onClick={() => handleSubmitRating(ratingKey, seller.sellerName)}
                                    >
                                      {t("order.submit")}
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
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
