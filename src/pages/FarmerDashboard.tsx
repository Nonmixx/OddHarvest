import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Sprout, Package, Recycle, Plus, ImageIcon, TrendingDown, CalendarDays } from "lucide-react";
import { toast } from "sonner";

const STATES = ["Pahang", "Perak", "Kelantan", "Sabah", "Johor", "Selangor", "Penang", "Kedah", "Terengganu", "Melaka"];

const FarmerDashboard = () => {
  const [showForm, setShowForm] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success("Crop listing added! 🌽");
    setShowForm(false);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-heading font-bold text-foreground">Farmer Dashboard 🌾</h1>
            <p className="text-muted-foreground text-sm mt-1">Manage your crop listings & impact</p>
          </div>
          <Button className="rounded-full" onClick={() => setShowForm(!showForm)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Crop
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Sprout} label="Crops Listed" value={12} />
          <StatCard icon={Package} label="Crops Sold" value={8} color="bg-farm-orange-light" />
          <StatCard icon={Recycle} label="Crops Rescued (kg)" value={120} />
          <StatCard icon={TrendingDown} label="Waste Prevented" value="96%" color="bg-farm-green-light" />
        </div>

        {/* Impact banner */}
        <div className="farm-card p-6 mb-8 bg-farm-green-light border-primary/20">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-primary/10 flex items-center justify-center shrink-0">
              <Recycle className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h2 className="font-heading font-bold text-foreground text-lg">🎉 Amazing Impact!</h2>
              <p className="text-muted-foreground">
                You helped rescue <span className="text-primary font-bold">120 kg</span> of crops from food waste.
                That's equivalent to preventing <span className="text-primary font-bold">240 kg</span> of CO₂ emissions!
              </p>
            </div>
          </div>
        </div>

        {/* Add crop form */}
        {showForm && (
          <div className="farm-card p-6 mb-8 animate-fade-in-up">
            <h2 className="font-heading font-bold text-foreground text-lg mb-4">Add New Crop Listing</h2>
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Crop Name</Label>
                <Input placeholder="e.g. Tomatoes (Imperfect Shape)" required />
              </div>
              <div className="space-y-1.5">
                <Label>Crop Image URL</Label>
                <div className="flex gap-2">
                  <Input placeholder="https://..." />
                  <Button type="button" variant="outline" size="icon"><ImageIcon className="h-4 w-4" /></Button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Quantity Available (kg)</Label>
                <Input type="number" min={1} placeholder="50" required />
              </div>
              <div className="space-y-1.5">
                <Label>Usual Price (RM/kg)</Label>
                <Input type="number" step="0.01" min={0} placeholder="5.00" required />
              </div>
              <div className="space-y-1.5">
                <Label>Discount Price (RM/kg)</Label>
                <Input type="number" step="0.01" min={0} placeholder="3.00" required />
              </div>
              <div className="space-y-1.5">
                <Label>Harvest Date</Label>
                <Input type="date" required />
              </div>
              <div className="space-y-1.5">
                <Label>Farm Location</Label>
                <Input placeholder="e.g. Ladang Pak Ali, Cameron Highlands" required />
              </div>
              <div className="space-y-1.5">
                <Label>State</Label>
                <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" required>
                  <option value="">Select state</option>
                  {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="md:col-span-2">
                <Button type="submit" className="rounded-full w-full">Add Listing</Button>
              </div>
            </form>
          </div>
        )}

        {/* Recent listings */}
        <h2 className="font-heading font-bold text-foreground text-lg mb-4">Your Listings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { name: "Tomatoes (Imperfect Shape)", qty: 50, usual: 5, disc: 3, state: "Pahang", harvest: "2 days ago", freshness: "🟢 Very Fresh" },
            { name: "Carrots (Curvy)", qty: 30, usual: 4, disc: 2.5, state: "Pahang", harvest: "1 day ago", freshness: "🟢 Very Fresh" },
            { name: "Corn (Irregular Kernels)", qty: 60, usual: 2, disc: 1.2, state: "Kelantan", harvest: "5 days ago", freshness: "🟠 Use Soon" },
          ].map((c, i) => (
            <div key={i} className="farm-card p-4 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-heading font-bold text-foreground text-sm">{c.name}</h3>
                  <p className="text-xs text-muted-foreground">{c.qty} kg · {c.state}</p>
                </div>
                <span className="farm-badge-green text-xs">Active</span>
              </div>
              <div className="flex gap-2 items-center">
                <span className="price-original text-xs">RM{c.usual.toFixed(2)}</span>
                <span className="text-primary font-bold text-sm">RM{c.disc.toFixed(2)}/kg</span>
                <span className="text-xs text-muted-foreground">· Save {Math.round(((c.usual - c.disc) / c.usual) * 100)}%</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <CalendarDays className="h-3 w-3" />
                <span>Harvested {c.harvest}</span>
                <span>{c.freshness}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default FarmerDashboard;
