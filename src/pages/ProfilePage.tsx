import React, { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, MapPin, Phone, Mail, Sprout, ShoppingBag, Truck, Save } from "lucide-react";
import { toast } from "sonner";
import VoiceInput from "@/components/VoiceInput";

const ProfilePage = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState(user?.location || "");
  const [state, setState] = useState(user?.state || "Selangor");
  // Seller-specific
  const [farmName, setFarmName] = useState(user?.farmName || "");
  const [yearsExp, setYearsExp] = useState("");
  const [cropsGrown, setCropsGrown] = useState("");
  // Driver-specific
  const [vehicleType, setVehicleType] = useState("Motorcycle");
  const [licenseNo, setLicenseNo] = useState("");

  const roleIcon = user?.role === "farmer" ? Sprout : user?.role === "driver" ? Truck : ShoppingBag;
  const roleLabel = user?.role === "farmer" ? "Seller" : user?.role === "driver" ? "Driver" : "Buyer";

  const handleSave = () => {
    toast.success("Profile updated! ✅");
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
            <User className="h-8 w-8 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">My Profile</h1>
            <div className="flex items-center gap-2 mt-1">
              {React.createElement(roleIcon, { className: "h-4 w-4 text-primary" })}
              <span className="text-sm text-muted-foreground">{roleLabel}</span>
              {user?.role === "farmer" && user?.sellerType && (
                <span className="text-xs bg-farm-green-light text-primary px-2 py-0.5 rounded-full">
                  {user.sellerType === "farm" ? "🌾 Farm Seller" : "🌱 Community Grower"}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* Basic info */}
          <div className="farm-card p-6 space-y-4">
            <h2 className="font-heading font-bold text-foreground">Basic Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                  <VoiceInput onResult={(text) => setName(text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <div className="flex gap-2">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <VoiceInput onResult={(text) => setEmail(text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input placeholder="+60 12-345 6789" value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <VoiceInput onResult={(text) => setPhone(text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Location</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input placeholder="Your area" value={location} onChange={(e) => setLocation(e.target.value)} />
                  <VoiceInput onResult={(text) => setLocation(text)} />
                </div>
              </div>
            </div>
          </div>

          {/* Seller-specific */}
          {user?.role === "farmer" && (
            <div className="farm-card p-6 space-y-4">
              <h2 className="font-heading font-bold text-foreground">Seller Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.sellerType === "farm" && (
                  <div className="space-y-1.5">
                    <Label>Farm Name</Label>
                    <div className="flex gap-2">
                      <Input value={farmName} onChange={(e) => setFarmName(e.target.value)} />
                      <VoiceInput onResult={(text) => setFarmName(text)} />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>Years of Experience</Label>
                  <Input type="number" min={0} value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>Crops Grown (comma separated)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Tomatoes, Carrots, Chili" value={cropsGrown} onChange={(e) => setCropsGrown(e.target.value)} />
                    <VoiceInput onResult={(text) => setCropsGrown((prev) => prev ? prev + ", " + text : text)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <div className="flex gap-2">
                    <Input value={state} onChange={(e) => setState(e.target.value)} />
                    <VoiceInput onResult={(text) => setState(text)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Driver-specific */}
          {user?.role === "driver" && (
            <div className="farm-card p-6 space-y-4">
              <h2 className="font-heading font-bold text-foreground">Driver Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Vehicle Type</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                    <option>Motorcycle</option>
                    <option>Car</option>
                    <option>Van</option>
                    <option>Truck</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>License Number</Label>
                  <div className="flex gap-2">
                    <Input placeholder="e.g. ABC1234" value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} />
                    <VoiceInput onResult={(text) => setLicenseNo(text)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Buyer-specific */}
          {user?.role === "buyer" && (
            <div className="farm-card p-6 space-y-4">
              <h2 className="font-heading font-bold text-foreground">Preferences</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Preferred Pickup Area</Label>
                  <div className="flex gap-2">
                    <Input placeholder="e.g. Petaling Jaya" value={location} onChange={(e) => setLocation(e.target.value)} />
                    <VoiceInput onResult={(text) => setLocation(text)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>State</Label>
                  <div className="flex gap-2">
                    <Input value={state} onChange={(e) => setState(e.target.value)} />
                    <VoiceInput onResult={(text) => setState(text)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button className="rounded-full w-full" size="lg" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> Save Profile
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
