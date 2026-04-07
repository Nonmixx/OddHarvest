import { mockOrders, OrderData } from "@/data/mockOrders";
import { supabase } from "@/lib/supabaseClient";
import { useSupabaseBackend } from "@/lib/backendConfig";

type OrderRow = {
  id: string;
  date: string;
  status: string;
  total: number;
  kg: number;
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

export async function listOrders(): Promise<OrderData[]> {
  if (!useSupabaseBackend || !supabase) return Object.values(mockOrders);
  const { data: orders, error } = await supabase.from("orders").select("*").order("date", { ascending: false });
  if (error || !orders) return Object.values(mockOrders);

  const { data: items } = await supabase.from("order_items").select("*");
  const itemsByOrder = new Map<string, OrderItemRow[]>();
  (items as OrderItemRow[] | null)?.forEach((it) => {
    const arr = itemsByOrder.get(it.order_id) ?? [];
    arr.push(it);
    itemsByOrder.set(it.order_id, arr);
  });

  return (orders as OrderRow[]).map((o) => ({
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

export async function getOrderById(orderId: string): Promise<OrderData | null> {
  if (!useSupabaseBackend || !supabase) return mockOrders[orderId] ?? null;
  const list = await listOrders();
  return list.find((o) => o.id === orderId) ?? null;
}

