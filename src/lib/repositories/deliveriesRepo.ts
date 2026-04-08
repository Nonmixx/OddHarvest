import { completedDeliveries, deliveryRequests, DeliveryItem } from "@/data/mockDeliveries";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseBackend } from "@/lib/backendConfig";
import { DEMO_DRIVER_PROFILE_ID } from "@/lib/demoPersonas";

type DeliveryRow = {
  id: string;
  order_id: string;
  crop: string;
  pickup: string;
  dropoff: string;
  distance: number;
  fee: number;
  date: string;
  seller: string;
  buyer: string;
  status: "request" | "completed";
  driver_profile_id?: string | null;
  created_at?: string;
};

function fromRow(r: DeliveryRow): DeliveryItem {
  return {
    id: r.id,
    orderId: r.order_id,
    crop: r.crop,
    pickup: r.pickup,
    dropoff: r.dropoff,
    distance: Number(r.distance),
    fee: Number(r.fee),
    date: r.date,
    seller: r.seller,
    buyer: r.buyer,
  };
}

/** Scoped to the signed-in driver; new drivers see empty lists until rows are assigned. */
export async function listDeliveryRequests(driverProfileId?: string | null): Promise<DeliveryItem[]> {
  if (!useSupabaseBackend || !supabase) return deliveryRequests;
  if (!driverProfileId) return [];
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("status", "request")
    .eq("driver_profile_id", driverProfileId)
    .order("created_at");
  if (!error && data) return (data as DeliveryRow[]).map(fromRow);
  // Backward-compatible fallback for DBs without driver_profile_id migration.
  if (driverProfileId !== DEMO_DRIVER_PROFILE_ID) return [];
  const { data: legacy } = await supabase.from("deliveries").select("*").eq("status", "request").order("created_at");
  return ((legacy as DeliveryRow[] | null) ?? []).map(fromRow);
}

export async function listCompletedDeliveries(driverProfileId?: string | null): Promise<DeliveryItem[]> {
  if (!useSupabaseBackend || !supabase) return completedDeliveries;
  if (!driverProfileId) return [];
  const { data, error } = await supabase
    .from("deliveries")
    .select("*")
    .eq("status", "completed")
    .eq("driver_profile_id", driverProfileId)
    .order("created_at");
  if (!error && data) return (data as DeliveryRow[]).map(fromRow);
  if (driverProfileId !== DEMO_DRIVER_PROFILE_ID) return [];
  const { data: legacy } = await supabase.from("deliveries").select("*").eq("status", "completed").order("created_at");
  return ((legacy as DeliveryRow[] | null) ?? []).map(fromRow);
}
