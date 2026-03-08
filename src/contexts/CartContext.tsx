import React, { createContext, useContext, useState, ReactNode } from "react";

export interface CropListing {
  id: string;
  name: string;
  image: string;
  quantity: number;
  usualPrice: number;
  discountPrice: number;
  farmLocation: string;
  state: string;
  farmerName: string;
  description?: string;
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
          i.crop.id === crop.id ? { ...i, quantity: i.quantity + qty } : i
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
      prev.map((i) => (i.crop.id === cropId ? { ...i, quantity: qty } : i))
    );
  };

  const clearCart = () => setItems([]);

  const total = items.reduce((sum, i) => sum + i.crop.discountPrice * i.quantity, 0);
  const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);

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
