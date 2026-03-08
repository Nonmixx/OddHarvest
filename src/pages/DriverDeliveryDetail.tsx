import { useParams, useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MapPin, Navigation, Truck, User, DollarSign, Calendar, Route } from "lucide-react";
import { deliveryRequests, completedDeliveries } from "@/pages/DriverDashboard";

const allDeliveries = [...deliveryRequests, ...completedDeliveries];

const DriverDeliveryDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const delivery = allDeliveries.find((d) => d.id === id);

  if (!delivery) {
    return (
      <div className="min-h-screen">
        <Navbar />
        <div className="container mx-auto px-4 py-16 text-center">
          <p className="text-2xl font-heading font-bold text-foreground mb-4">Delivery not found 😕</p>
          <Button onClick={() => navigate("/driver-dashboard")} className="rounded-full">
            Back to Dashboard
          </Button>
        </div>
        <Footer />
      </div>
    );
  }

  const isCompleted = completedDeliveries.some((d) => d.id === id);

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="ghost"
          className="mb-4 rounded-full"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>

        <div className="flex items-center gap-3 mb-6">
          <h1 className="text-3xl font-heading font-bold text-foreground">{delivery.id}</h1>
          {isCompleted ? (
            <Badge className="bg-primary/20 text-primary border-primary/30">Completed</Badge>
          ) : (
            <Badge variant="secondary">In Progress</Badge>
          )}
        </div>

        <div className="farm-card p-6 space-y-6">
          {/* Crop Info */}
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Truck className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Item</p>
              <p className="font-heading font-bold text-foreground text-lg">{delivery.crop}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Pickup */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
              <MapPin className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Pickup Location</p>
              <p className="font-medium text-foreground">{delivery.pickup}</p>
              <p className="text-xs text-muted-foreground mt-1">Farmer: {delivery.farmer}</p>
            </div>
          </div>

          {/* Dropoff */}
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center shrink-0">
              <Navigation className="h-5 w-5 text-accent" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Drop-off Location</p>
              <p className="font-medium text-foreground">{delivery.dropoff}</p>
              <p className="text-xs text-muted-foreground mt-1">Buyer: {delivery.buyer}</p>
            </div>
          </div>

          <div className="border-t border-border" />

          {/* Details Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center gap-2">
              <Route className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Distance</p>
                <p className="font-bold text-foreground">{delivery.distance} km</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Delivery Fee</p>
                <p className="font-bold text-primary">RM{delivery.fee.toFixed(2)}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Date</p>
                <p className="font-bold text-foreground">{delivery.date}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-xs text-muted-foreground">Farmer</p>
                <p className="font-bold text-foreground">{delivery.farmer}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default DriverDeliveryDetail;
