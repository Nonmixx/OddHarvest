import { mockOrders, OrderData } from "@/data/mockOrders";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseBackend } from "@/lib/backendConfig";
import { DEMO_BUYER_PROFILE_ID } from "@/lib/demoPersonas";

type OrderRow = {
  id: string;
  date: string;
  status: string;
  total: number;
  kg: number;
  buyer_profile_id?: string | null;
};

type OrderItemRow = {
  order_id: string;
  name: string;
  qty: number;
  price: number;
  image: string;
  seller_id: string;
  seller_name: string;
  seller_location: string;
};

function mapOrdersWithItems(orders: OrderRow[], items: OrderItemRow[] | null): OrderData[] {
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  items?.forEach((it) => {
    const arr = itemsByOrder.get(it.order_id) ?? [];
    arr.push(it);
    itemsByOrder.set(it.order_id, arr);
  });
  return orders.map((o) => ({
    id: o.id,
    date: o.date,
    status: o.status,
    total: Number(o.total),
    kg: Number(o.kg),
    items: (itemsByOrder.get(o.id) ?? []).map((it) => ({
      name: it.name,
      qty: Number(it.qty),
      price: Number(it.price),
      image: it.image,
      sellerId: it.seller_id,
      sellerName: it.seller_name,
      sellerLocation: it.seller_location,
    })),
  }));
}

/** Pass the signed-in buyer profile id; other buyers see no rows. */
export async function listOrders(buyerProfileId?: string | null): Promise<OrderData[]> {
  if (!useSupabaseBackend || !supabase) return Object.values(mockOrders);
  if (!buyerProfileId) return [];

  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .eq("buyer_profile_id", buyerProfileId)
    .order("date", { ascending: false });
  if (error) return [];
  let rows = (orders as OrderRow[] | null) ?? [];
  // Legacy seeded DBs may still have buyer_profile_id null on historical orders.
  if (!rows.length && buyerProfileId === DEMO_BUYER_PROFILE_ID) {
    const { data: legacy } = await supabase.from("orders").select("*").is("buyer_profile_id", null).order("date", { ascending: false });
    rows = (legacy as OrderRow[] | null) ?? [];
  }
  if (!rows.length) return [];

  const ids = rows.map((o) => o.id);
  const { data: items } = await supabase.from("order_items").select("*").in("order_id", ids);
  return mapOrdersWithItems(rows, (items as OrderItemRow[] | null) ?? null);
}

export async function getOrderById(orderId: string, buyerProfileId?: string | null): Promise<OrderData | null> {
  if (!useSupabaseBackend || !supabase) return mockOrders[orderId] ?? null;
  if (!buyerProfileId) return null;

  const { data: o, error } = await supabase
    .from("orders")
    .select("*")
    .eq("id", orderId)
    .eq("buyer_profile_id", buyerProfileId)
    .maybeSingle();
  if (error || !o) return null;

  const { data: items } = await supabase.from("order_items").select("*").eq("order_id", orderId);
  return mapOrdersWithItems([o as OrderRow], (items as OrderItemRow[] | null) ?? null)[0] ?? null;
}
