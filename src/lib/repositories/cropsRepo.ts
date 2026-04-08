import { CropListing } from "@/contexts/CartContext";
import { mockCrops } from "@/data/mockCrops";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseBackend } from "@/lib/backendConfig";
import { DEMO_FARMER_PROFILE_ID, DEMO_SELLER_ID } from "@/lib/demoPersonas";

type CropRow = {
  id: string;
  name: string;
  image: string;
  images: string[] | null;
  quantity: number;
  usual_price: number;
  discount_price: number;
  farm_location: string;
  state: string;
  farmer_name: string;
  seller_id: string;
  seller_type: "farm" | "community";
  description: string | null;
  harvest_date: string;
  expiry_date: string | null;
  distance_km: number;
  imperfect_reason: CropListing["imperfectReason"];
  is_bundle: boolean;
  bundle_contents: string[] | null;
  bundle_weight: number | null;
  is_mystery_box: boolean;
  is_ai_description: boolean;
  created_at?: string;
};

function fromRow(r: CropRow): CropListing {
  return {
    id: r.id,
    name: r.name,
    image: r.image,
    images: r.images ?? undefined,
    quantity: Number(r.quantity),
    usualPrice: Number(r.usual_price),
    discountPrice: Number(r.discount_price),
    farmLocation: r.farm_location,
    state: r.state,
    farmerName: r.farmer_name,
    sellerId: r.seller_id,
    sellerType: r.seller_type,
    description: r.description ?? undefined,
    harvestDate: r.harvest_date,
    expiryDate: r.expiry_date ?? undefined,
    distanceKm: Number(r.distance_km),
    imperfectReason: r.imperfect_reason,
    isBundle: r.is_bundle || undefined,
    bundleContents: r.bundle_contents ?? undefined,
    bundleWeight: r.bundle_weight ?? undefined,
    isMysteryBox: r.is_mystery_box || undefined,
    isAiDescription: r.is_ai_description || undefined,
  };
}

function toRow(c: CropListing): CropRow {
  return {
    id: c.id,
    name: c.name,
    image: c.image,
    images: c.images ?? null,
    quantity: c.quantity,
    usual_price: c.usualPrice,
    discount_price: c.discountPrice,
    farm_location: c.farmLocation,
    state: c.state,
    farmer_name: c.farmerName,
    seller_id: c.sellerId,
    seller_type: c.sellerType,
    description: c.description ?? null,
    harvest_date: c.harvestDate,
    expiry_date: c.expiryDate ?? null,
    distance_km: c.distanceKm,
    imperfect_reason: c.imperfectReason,
    is_bundle: Boolean(c.isBundle),
    bundle_contents: c.bundleContents ?? null,
    bundle_weight: c.bundleWeight ?? null,
    is_mystery_box: Boolean(c.isMysteryBox),
    is_ai_description: Boolean(c.isAiDescription),
  };
}

export async function listCrops(): Promise<CropListing[]> {
  if (!useSupabaseBackend || !supabase) return mockCrops;
  const { data, error } = await supabase
    .from("crops")
    .select("*")
    .order("created_at", { ascending: true });
  if (error || !data) return mockCrops;
  return (data as CropRow[]).map(fromRow);
}

export async function insertCrop(crop: CropListing): Promise<void> {
  if (!useSupabaseBackend || !supabase) return;
  // Ensure referenced seller exists (add-crop pages currently use seller-self in demo mode).
  const sellerRow: Record<string, unknown> = {
    id: crop.sellerId,
    name: crop.farmerName || "You",
    seller_type: crop.sellerType,
    farm_name: crop.sellerType === "farm" ? (crop.farmLocation || "Your Farm") : null,
    location: crop.farmLocation || "Unknown",
    state: crop.state || "Selangor",
    years_experience: null,
    crops_grown: [],
    total_crops_sold: 0,
    crops_rescued_kg: 0,
    orders_completed: 0,
    average_rating: 4.5,
  };
  if (crop.sellerId === DEMO_SELLER_ID) {
    sellerRow.profile_id = DEMO_FARMER_PROFILE_ID;
  }
  const { error: sellerError } = await supabase.from("sellers").upsert(sellerRow);
  if (sellerError) {
    throw new Error(`Failed to ensure seller exists: ${sellerError.message}`);
  }

  const { error } = await supabase.from("crops").insert(toRow(crop));
  if (error) {
    throw new Error(`Failed to insert crop: ${error.message}`);
  }
}

export async function patchCrop(cropId: string, updates: Partial<CropListing>): Promise<void> {
  if (!useSupabaseBackend || !supabase) return;
  const partial: Partial<CropRow> = {};
  if (updates.name !== undefined) partial.name = updates.name;
  if (updates.quantity !== undefined) partial.quantity = updates.quantity;
  if (updates.usualPrice !== undefined) partial.usual_price = updates.usualPrice;
  if (updates.discountPrice !== undefined) partial.discount_price = updates.discountPrice;
  if (updates.farmLocation !== undefined) partial.farm_location = updates.farmLocation;
  if (updates.state !== undefined) partial.state = updates.state;
  if (updates.imperfectReason !== undefined) partial.imperfect_reason = updates.imperfectReason;
  if (updates.description !== undefined) partial.description = updates.description ?? null;
  if (updates.images !== undefined) partial.images = updates.images ?? null;
  if (updates.image !== undefined) partial.image = updates.image;
  if (updates.expiryDate !== undefined) partial.expiry_date = updates.expiryDate ?? null;
  if (updates.harvestDate !== undefined) partial.harvest_date = updates.harvestDate;
  if (updates.bundleContents !== undefined) partial.bundle_contents = updates.bundleContents ?? null;
  if (updates.bundleWeight !== undefined) partial.bundle_weight = updates.bundleWeight ?? null;
  if (updates.distanceKm !== undefined) partial.distance_km = updates.distanceKm;
  await supabase.from("crops").update(partial).eq("id", cropId);
}

export async function deleteCrop(cropId: string): Promise<void> {
  if (!useSupabaseBackend || !supabase) return;
  await supabase.from("crops").delete().eq("id", cropId);
}

