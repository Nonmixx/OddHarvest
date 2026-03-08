import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Truck, MapPin, Navigation, DollarSign, CheckCircle, XCircle, List } from "lucide-react";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export interface DeliveryRequest {
  id: string;
  crop: string;
  pickup: string;
  dropoff: string;
  distance: number;
  fee: number;
  buyer: string;
  farmer: string;
  date: string;
}

export const deliveryRequests: DeliveryRequest[] = [
  { id: "DEL-101", crop: "Tomatoes (5kg)", pickup: "Ladang Pak Ali, Cameron Highlands", dropoff: "Taman Melawati, KL", distance: 12, fee: 12, buyer: "Ahmad bin Ismail", farmer: "Pak Ali", date: "2026-03-07" },
  { id: "DEL-102", crop: "Carrots (3kg)", pickup: "Kebun Mak Intan, Tanah Rata", dropoff: "Damansara, KL", distance: 8, fee: 8, buyer: "Siti Nurhaliza", farmer: "Mak Intan", date: "2026-03-07" },
  { id: "DEL-103", crop: "Corn (10kg)", pickup: "Ladang Jagung, Kota Bharu", dropoff: "Kuantan, Pahang", distance: 25, fee: 25, buyer: "Lee Wei Ming", farmer: "Pak Hassan", date: "2026-03-06" },
];

export const completedDeliveries: DeliveryRequest[] = [
  { id: "DEL-090", crop: "Cucumbers (4kg)", pickup: "Kebun Serdang, Selangor", dropoff: "Bangsar, KL", distance: 10, fee: 10, buyer: "Nurul Aina", farmer: "Pak Razak", date: "2026-03-05" },
  { id: "DEL-085", crop: "Apples (6kg)", pickup: "Ladang Cameron, Pahang", dropoff: "Petaling Jaya, Selangor", distance: 18, fee: 18, buyer: "Tan Mei Ling", farmer: "Uncle Chong", date: "2026-03-04" },
  { id: "DEL-078", crop: "Tomatoes (8kg)", pickup: "Ladang Pak Ali, Cameron Highlands", dropoff: "Subang Jaya, Selangor", distance: 15, fee: 15, buyer: "Ravi Kumar", farmer: "Pak Ali", date: "2026-03-03" },
  { id: "DEL-072", crop: "Lettuce (3kg)", pickup: "Kebun Organik, Ipoh", dropoff: "Shah Alam, Selangor", distance: 20, fee: 20, buyer: "Farah Diba", farmer: "Cik Aminah", date: "2026-03-02" },
  { id: "DEL-065", crop: "Corn (12kg)", pickup: "Ladang Jagung, Kota Bharu", dropoff: "Kuala Terengganu", distance: 30, fee: 30, buyer: "Mohd Firdaus", farmer: "Pak Hassan", date: "2026-03-01" },
];

const DriverDashboard = () => {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState<string[]>([]);
  const [cancelled, setCancelled] = useState<string[]>([]);

  const handleAccept = (id: string) => {
    setAccepted((prev) => [...prev, id]);
    toast.success(`Delivery ${id} accepted! 🚗`);
  };

  const handleCancel = (id: string) => {
    setAccepted((prev) => prev.filter((a) => a !== id));
    setCancelled((prev) => [...prev, id]);
    toast.info(`Delivery ${id} cancelled.`);
  };

  const activeDeliveries = deliveryRequests.filter(
    (d) => !cancelled.includes(d.id)
  );

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-heading font-bold text-foreground mb-2">Quick Summary 🚗</h1>
        <p className="text-muted-foreground text-sm mb-8">Your delivery overview at a glance</p>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <StatCard icon={CheckCircle} label="Deliveries Completed" value={completedDeliveries.length + accepted.length} />
          <StatCard icon={Navigation} label="Total Distance (km)" value={180} color="bg-farm-orange-light" />
          <StatCard icon={DollarSign} label="Total Earnings (RM)" value={180} />
        </div>

        {/* View Completed Deliveries Link */}
        <div className="mb-8">
          <Button
            onClick={() => navigate("/driver-deliveries")}
            variant="outline"
            className="rounded-full"
          >
            <List className="h-4 w-4 mr-1" /> View Completed Deliveries
          </Button>
        </div>

        {/* Available deliveries */}
        <h2 className="font-heading font-bold text-foreground text-lg mb-4">Available Delivery Requests</h2>
        <div className="space-y-4">
          {activeDeliveries.map((d) => {
            const isAccepted = accepted.includes(d.id);
            return (
              <div key={d.id} className={`farm-card p-5 ${isAccepted ? "border-primary/40" : ""}`}>
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="font-heading font-bold text-foreground">{d.id}</p>
                    <p className="text-sm text-muted-foreground">{d.crop}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {isAccepted && <Badge className="bg-primary/20 text-primary border-primary/30">Accepted</Badge>}
                    <span className="font-bold text-primary text-lg">RM{d.fee.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Pickup</p>
                      <p className="font-medium">{d.pickup}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Navigation className="h-4 w-4 text-accent mt-0.5 shrink-0" />
                    <div>
                      <p className="text-xs text-muted-foreground">Drop-off</p>
                      <p className="font-medium">{d.dropoff}</p>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">Distance: {d.distance} km</p>
                </div>
                <div className="mt-4 flex gap-2">
                  {isAccepted ? (
                    <>
                      <Button
                        onClick={() => navigate(`/driver-delivery/${d.id}`)}
                        variant="outline"
                        className="rounded-full"
                        size="sm"
                      >
                        View Details
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="destructive" className="rounded-full" size="sm">
                            <XCircle className="h-4 w-4 mr-1" /> Cancel
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Cancel Delivery {d.id}?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to cancel this delivery? The job will be available for other drivers.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Keep It</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleCancel(d.id)}>
                              Yes, Cancel
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  ) : (
                    <Button onClick={() => handleAccept(d.id)} className="rounded-full" size="sm">
                      <Truck className="h-4 w-4 mr-1" /> Accept Delivery
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverDashboard;
