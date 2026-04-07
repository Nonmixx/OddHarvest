import { completedDeliveries, deliveryRequests, DeliveryItem } from "@/data/mockDeliveries";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseBackend } from "@/lib/backendConfig";

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

export async function listDeliveryRequests(): Promise<DeliveryItem[]> {
  if (!useSupabaseBackend || !supabase) return deliveryRequests;
  const { data, error } = await supabase.from("deliveries").select("*").eq("status", "request").order("created_at");
  if (error || !data) return deliveryRequests;
  return (data as DeliveryRow[]).map(fromRow);
}

export async function listCompletedDeliveries(): Promise<DeliveryItem[]> {
  if (!useSupabaseBackend || !supabase) return completedDeliveries;
  const { data, error } = await supabase.from("deliveries").select("*").eq("status", "completed").order("created_at");
  if (error || !data) return completedDeliveries;
  return (data as DeliveryRow[]).map(fromRow);
}

