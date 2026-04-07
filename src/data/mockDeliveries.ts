export interface DeliveryItem {
  id: string;
  orderId: string;
  crop: string;
  pickup: string;
  dropoff: string;
  distance: number;
  fee: number;
  date: string;
  seller: string;
  buyer: string;
}

export const deliveryRequests: DeliveryItem[] = [
  { id: "DEL-101", orderId: "ORD-007", crop: "Tomatoes (5kg)", pickup: "Chow Kit Wet Market, Kuala Lumpur", dropoff: "Bukit Bintang, Kuala Lumpur", distance: 6, fee: 6, date: "5 Mar 2026", seller: "Pak Ali", buyer: "Lee Wei Ming" },
  { id: "DEL-102", orderId: "ORD-007", crop: "Carrots (3kg)", pickup: "Petaling Street, Kuala Lumpur", dropoff: "KLCC, Kuala Lumpur", distance: 5, fee: 5, date: "5 Mar 2026", seller: "Mak Intan", buyer: "Lee Wei Ming" },
  { id: "DEL-103", orderId: "ORD-008", crop: "Corn (10kg)", pickup: "Wangsa Maju, Kuala Lumpur", dropoff: "Taman Melawati, KL", distance: 7, fee: 7, date: "3 Mar 2026", seller: "Pak Murad", buyer: "Ravi Kumar" },
];

export const completedDeliveries: DeliveryItem[] = [
  { id: "DEL-050", orderId: "ORD-004", crop: "Bananas (3kg)", pickup: "Pasar Seni, Kuala Lumpur", dropoff: "Bangsar, Kuala Lumpur", distance: 7, fee: 7, date: "2 Mar 2026", seller: "Pak Ali", buyer: "Siti Aminah" },
  { id: "DEL-051", orderId: "ORD-004", crop: "Spinach (2kg)", pickup: "Kebun Sayur, Serdang", dropoff: "Sri Petaling, Kuala Lumpur", distance: 10, fee: 10, date: "2 Mar 2026", seller: "Encik Lim", buyer: "Siti Aminah" },
  { id: "DEL-052", orderId: "ORD-001", crop: "Tomatoes (2kg)", pickup: "Subang Jaya, Selangor", dropoff: "Petaling Jaya, Selangor", distance: 12, fee: 12, date: "28 Feb 2026", seller: "Pak Ali", buyer: "Ahmad Rizal" },
  { id: "DEL-053", orderId: "ORD-001", crop: "Carrots (1kg)", pickup: "Damansara, KL", dropoff: "KL Sentral, Kuala Lumpur", distance: 6, fee: 6, date: "28 Feb 2026", seller: "Mak Intan", buyer: "Ahmad Rizal" },
  { id: "DEL-054", orderId: "ORD-006", crop: "Carrots (2kg)", pickup: "KLCC, Kuala Lumpur", dropoff: "Wangsa Maju, Kuala Lumpur", distance: 9, fee: 9, date: "25 Feb 2026", seller: "Mak Intan", buyer: "Noraini Bt Yusof" },
];

