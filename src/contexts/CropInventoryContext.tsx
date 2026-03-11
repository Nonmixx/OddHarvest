import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { mockCrops } from "@/data/mockCrops";
import { CropListing } from "@/contexts/CartContext";

interface CropInventoryContextType {
  crops: CropListing[];
  updateStock: (cropId: string, quantityBought: number) => void;
  updateCrop: (cropId: string, updates: Partial<CropListing>) => void;
  addCrop: (crop: CropListing) => void;
  removeCrop: (cropId: string) => void;
}

const CropInventoryContext = createContext<CropInventoryContextType | undefined>(undefined);

export const CropInventoryProvider = ({ children }: { children: ReactNode }) => {
  const [crops, setCrops] = useState<CropListing[]>(mockCrops);

  const updateStock = useCallback((cropId: string, quantityBought: number) => {
    setCrops((prev) =>
      prev.map((c) =>
        c.id === cropId ? { ...c, quantity: Math.max(0, c.quantity - quantityBought) } : c
      )
    );
  }, []);

  const updateCrop = useCallback((cropId: string, updates: Partial<CropListing>) => {
    setCrops((prev) =>
      prev.map((c) => (c.id === cropId ? { ...c, ...updates } : c))
    );
  }, []);

  const addCrop = useCallback((crop: CropListing) => {
    setCrops((prev) => [...prev, crop]);
  }, []);

  const removeCrop = useCallback((cropId: string) => {
    setCrops((prev) => prev.filter((c) => c.id !== cropId));
  }, []);

  return (
    <CropInventoryContext.Provider value={{ crops, updateStock, updateCrop, addCrop, removeCrop }}>
      {children}
    </CropInventoryContext.Provider>
  );
};

export const useCropInventory = () => {
  const ctx = useContext(CropInventoryContext);
  if (!ctx) throw new Error("useCropInventory must be used within CropInventoryProvider");
  return ctx;
};
