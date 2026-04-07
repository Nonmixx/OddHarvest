export interface OrderCrop {
  name: string;
  qty: number;
  price: number;
  image: string;
  sellerId: string;
  sellerName: string;
  sellerLocation: string;
}

export interface OrderData {
  id: string;
  date: string;
  status: string;
  total: number;
  kg: number;
  items: OrderCrop[];
}

export const mockOrders: Record<string, OrderData> = {
  "ORD-001": {
    id: "ORD-001",
    date: "2026-03-05",
    status: "Delivered",
    total: 15.5,
    kg: 5,
    items: [
      { name: "Tomatoes (Imperfect Shape)", qty: 2, price: 3, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop", sellerId: "seller-1", sellerName: "Pak Ali", sellerLocation: "Cameron Highlands" },
      { name: "Carrots (Imperfect Shape)", qty: 1, price: 2.5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop", sellerId: "seller-2", sellerName: "Mak Intan", sellerLocation: "Tanah Rata" },
    ],
  },
  "ORD-002": {
    id: "ORD-002",
    date: "2026-03-03",
    status: "Delivered",
    total: 8.4,
    kg: 6,
    items: [
      { name: "Corn (Irregular Kernels)", qty: 3, price: 1.2, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop", sellerId: "seller-7", sellerName: "Pak Murad", sellerLocation: "Kota Bharu" },
      { name: "Cucumbers (Oversized)", qty: 2, price: 1.8, image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400&h=300&fit=crop", sellerId: "seller-3", sellerName: "Encik Hassan", sellerLocation: "Ipoh" },
    ],
  },
  "ORD-003": {
    id: "ORD-003",
    date: "2026-02-28",
    status: "Picked Up",
    total: 22,
    kg: 4,
    items: [
      { name: "Apples (Minor Blemishes)", qty: 2, price: 5, image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop", sellerId: "seller-6", sellerName: "Puan Siti", sellerLocation: "Cameron Highlands" },
      { name: "Bell Peppers (Mixed Colors)", qty: 2, price: 3.5, image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=400&h=300&fit=crop", sellerId: "seller-3", sellerName: "Encik Hassan", sellerLocation: "Ipoh" },
    ],
  },
  "ORD-004": {
    id: "ORD-004",
    date: "2026-02-25",
    status: "Delivered",
    total: 10.5,
    kg: 5,
    items: [
      { name: "Bananas (Short & Stubby)", qty: 3, price: 1.5, image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop", sellerId: "seller-1", sellerName: "Pak Ali", sellerLocation: "Cameron Highlands" },
      { name: "Spinach (Leafy Overgrowth)", qty: 2, price: 2, image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=300&fit=crop", sellerId: "seller-8", sellerName: "Encik Lim", sellerLocation: "Serdang" },
    ],
  },
  "ORD-005": {
    id: "ORD-005",
    date: "2026-02-20",
    status: "Picked Up",
    total: 12,
    kg: 3,
    items: [
      { name: "Tomatoes (Imperfect Shape)", qty: 1, price: 3, image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400&h=300&fit=crop", sellerId: "seller-1", sellerName: "Pak Ali", sellerLocation: "Cameron Highlands" },
      { name: "Corn (Irregular Kernels)", qty: 2, price: 1.2, image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400&h=300&fit=crop", sellerId: "seller-7", sellerName: "Pak Murad", sellerLocation: "Kota Bharu" },
    ],
  },
  "ORD-006": {
    id: "ORD-006",
    date: "2026-02-15",
    status: "Delivered",
    total: 5,
    kg: 2,
    items: [
      { name: "Carrots (Imperfect Shape)", qty: 2, price: 2.5, image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop", sellerId: "seller-2", sellerName: "Mak Intan", sellerLocation: "Tanah Rata" },
    ],
  },
};

