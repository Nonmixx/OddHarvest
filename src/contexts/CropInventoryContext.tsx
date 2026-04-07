import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
import { mockCrops } from "@/data/mockCrops";
import { CropListing } from "@/contexts/CartContext";
import { deleteCrop, insertCrop, listCrops, patchCrop } from "@/lib/repositories/cropsRepo";

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

  useEffect(() => {
    let mounted = true;
    (async () => {
      const rows = await listCrops();
      if (mounted) setCrops(rows);
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const updateStock = useCallback((cropId: string, quantityBought: number) => {
    setCrops((prev) => {
      let nextQty: number | null = null;
      const next = prev.map((c) => {
        if (c.id !== cropId) return c;
        nextQty = Math.max(0, c.quantity - quantityBought);
        return { ...c, quantity: nextQty };
      });
      if (nextQty !== null) void patchCrop(cropId, { quantity: nextQty });
      return next;
    });
  }, []);

  const updateCrop = useCallback((cropId: string, updates: Partial<CropListing>) => {
    setCrops((prev) =>
      prev.map((c) => (c.id === cropId ? { ...c, ...updates } : c))
    );
    void patchCrop(cropId, updates);
  }, []);

  const addCrop = useCallback((crop: CropListing) => {
    setCrops((prev) => [...prev, crop]);
    void insertCrop(crop);
  }, []);

  const removeCrop = useCallback((cropId: string) => {
    setCrops((prev) => prev.filter((c) => c.id !== cropId));
    void deleteCrop(cropId);
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
