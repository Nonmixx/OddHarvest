import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Package, CalendarDays, MapPin, User } from "lucide-react";

const soldCrops = [
  { id: "SOLD-001", name: "Tomatoes (Imperfect Shape)", qty: 15, price: 3, total: 45, buyer: "Lee Wei Ming", state: "Pahang", date: "5 Mar 2026", location: "Ladang Pak Ali, Cameron Highlands" },
  { id: "SOLD-002", name: "Carrots (Curvy)", qty: 10, price: 2.5, total: 25, buyer: "Siti Aminah", state: "Pahang", date: "3 Mar 2026", location: "Kebun Mak Intan, Tanah Rata" },
  { id: "SOLD-003", name: "Corn (Irregular Kernels)", qty: 20, price: 1.2, total: 24, buyer: "Ahmad Rizal", state: "Kelantan", date: "1 Mar 2026", location: "Ladang Jagung, Kota Bharu" },
  { id: "SOLD-004", name: "Cucumbers (Oversized)", qty: 8, price: 1.8, total: 14.4, buyer: "Noraini Bt Yusof", state: "Perak", date: "28 Feb 2026", location: "Ladang Hijau, Ipoh" },
  { id: "SOLD-005", name: "Spinach (Leafy Overgrowth)", qty: 12, price: 2, total: 24, buyer: "Ravi Kumar", state: "Selangor", date: "25 Feb 2026", location: "Kebun Sayur, Serdang" },
];

const totalRevenue = soldCrops.reduce((sum, c) => sum + c.total, 0);
const totalQty = soldCrops.reduce((sum, c) => sum + c.qty, 0);

const FarmerSoldCrops = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          className="mb-4 rounded-full"
          onClick={() => navigate("/farmer-dashboard")}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>

        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Crops Sold 📦</h1>

        <p className="text-muted-foreground text-sm mb-6">
          {soldCrops.length} orders · {totalQty} kg sold · RM{totalRevenue.toFixed(2)} earned
        </p>

        {/* Summary cards */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
          <div className="farm-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{soldCrops.length}</p>
            <p className="text-xs text-muted-foreground">Orders</p>
          </div>
          <div className="farm-card p-4 text-center">
            <p className="text-2xl font-bold text-primary">{totalQty} kg</p>
            <p className="text-xs text-muted-foreground">Total Sold</p>
          </div>
          <div className="farm-card p-4 text-center sm:col-span-1 col-span-2">
            <p className="text-2xl font-bold text-primary">RM{totalRevenue.toFixed(2)}</p>
            <p className="text-xs text-muted-foreground">Revenue</p>
          </div>
        </div>

        {/* Sold items list */}
        <div className="space-y-3">
          {soldCrops.map((c) => (
            <div key={c.id} className="farm-card p-4">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-heading font-bold text-foreground text-sm">{c.name}</h3>
                    <Badge variant="secondary" className="text-xs">{c.id}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{c.qty} kg · RM{c.price.toFixed(2)}/kg</p>
                </div>
                <span className="font-bold text-primary">RM{c.total.toFixed(2)}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mt-2">
                <span className="flex items-center gap-1">
                  <User className="h-3 w-3 text-primary" /> {c.buyer}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="h-3 w-3 text-accent" /> {c.state}
                </span>
                <span className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" /> {c.date}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FarmerSoldCrops;
