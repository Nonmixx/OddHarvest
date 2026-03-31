import React, { createContext, useContext, useState, ReactNode } from "react";

export type SellerType = "farm" | "community";

export type ImperfectReason = "irregular_shape" | "too_small" | "too_large" | "cosmetic_blemish" | "slight_discoloration";

export const IMPERFECT_REASONS: { value: ImperfectReason; label: string; emoji: string }[] = [
  { value: "irregular_shape", label: "Irregular Shape", emoji: "🥕" },
  { value: "too_small", label: "Too Small", emoji: "🤏" },
  { value: "too_large", label: "Too Large", emoji: "📏" },
  { value: "cosmetic_blemish", label: "Cosmetic Blemish", emoji: "🍎" },
  { value: "slight_discoloration", label: "Slight Discoloration", emoji: "🎨" },
];

export interface SellerProfile {
  id: string;
  name: string;
  sellerType: SellerType;
  farmName?: string;
  location: string;
  state: string;
  yearsExperience?: number;
  cropsGrown: string[];
  totalCropsSold: number;
  cropsRescuedKg: number;
  ordersCompleted: number;
  averageRating: number;
  reviews: SellerReview[];
}

export interface SellerReview {
  id: string;
  buyerName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface CropListing {
  id: string;
  name: string;
  image: string;
  images?: string[]; // multiple images support
  quantity: number;
  usualPrice: number;
  discountPrice: number;
  farmLocation: string;
  state: string;
  farmerName: string;
  sellerId: string;
  sellerType: SellerType;
  description?: string;
  harvestDate: string;
  expiryDate?: string; // estimated expiry date
  distanceKm: number;
  imperfectReason: ImperfectReason;
  isBundle?: boolean;
  bundleContents?: string[];
  bundleWeight?: number;
  isMysteryBox?: boolean;
  isAiDescription?: boolean;
}

export interface CartItem {
  crop: CropListing;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (crop: CropListing, qty?: number) => void;
  removeFromCart: (cropId: string) => void;
  updateQuantity: (cropId: string, qty: number) => void;
  clearCart: () => void;
  total: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [items, setItems] = useState<CartItem[]>([]);

  const addToCart = (crop: CropListing, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.crop.id === crop.id);
      if (existing) {
        return prev.map((i) =>
          i.crop.id === crop.id ? { ...i, quantity: Math.round((i.quantity + qty) * 10) / 10 } : i
        );
      }
      return [...prev, { crop, quantity: qty }];
    });
  };

  const removeFromCart = (cropId: string) => {
    setItems((prev) => prev.filter((i) => i.crop.id !== cropId));
  };

  const updateQuantity = (cropId: string, qty: number) => {
    if (qty <= 0) return removeFromCart(cropId);
    setItems((prev) =>
      prev.map((i) => (i.crop.id === cropId ? { ...i, quantity: Math.round(qty * 10) / 10 } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.crop.discountPrice * i.quantity, 0);
  const itemCount = items.length;

  return (
    <CartContext.Provider value={{ items, addToCart, removeFromCart, updateQuantity, clearCart, total, itemCount }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};
