import React, { useState, useEffect } from "react";
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
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [state, setState] = useState(user?.state || "Selangor");
  const [farmName, setFarmName] = useState(user?.farmName || "");
  const [yearsExp, setYearsExp] = useState(user?.yearsExp || "");
  const [cropsGrown, setCropsGrown] = useState(user?.cropsGrown || "");
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || "Motorcycle");
  const [licenseNo, setLicenseNo] = useState(user?.licenseNo || "");

  // Sync from user context when user changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setLocation(user.location || "");
      setState(user.state || "Selangor");
      setFarmName(user.farmName || "");
      setYearsExp(user.yearsExp || "");
      setCropsGrown(user.cropsGrown || "");
      setVehicleType(user.vehicleType || "Motorcycle");
      setLicenseNo(user.licenseNo || "");
    }
  }, [user]);

  const roleIcon = user?.role === "farmer" ? Sprout : user?.role === "driver" ? Truck : ShoppingBag;
  const roleLabel = user?.role === "farmer" ? t("profile.seller") : user?.role === "driver" ? t("profile.driver") : t("profile.buyer");

  const handleSave = () => {
    updateProfile({
      name, email, phone, location, state,
      farmName, yearsExp, cropsGrown,
      vehicleType, licenseNo,
    });
    toast.success(t("profile.updated") + " ✅");
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
            <h1 className="text-2xl font-heading font-bold text-foreground">{t("profile.title")}</h1>
            <div className="flex items-center gap-2 mt-1">
              {React.createElement(roleIcon, { className: "h-4 w-4 text-primary" })}
              <span className="text-sm text-muted-foreground">{roleLabel}</span>
              {user?.role === "farmer" && user?.sellerType && (
                <span className="text-xs bg-farm-green-light text-primary px-2 py-0.5 rounded-full">
                  {user.sellerType === "farm" ? "🌾 " + t("profile.farm_seller") : "🌱 " + t("profile.community_grower")}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="farm-card p-6 space-y-4">
            <h2 className="font-heading font-bold text-foreground">{t("profile.basic_info")}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>{t("profile.full_name")}</Label>
                <div className="flex gap-2">
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                  <VoiceInput onResult={(text) => setName(text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("profile.email")}</Label>
                <div className="flex gap-2">
                  <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                  <VoiceInput onResult={(text) => setEmail(text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("profile.phone")}</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input placeholder={t("profile.phone_placeholder")} value={phone} onChange={(e) => setPhone(e.target.value)} />
                  <VoiceInput onResult={(text) => setPhone(text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("profile.location")}</Label>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground shrink-0" />
                  <Input placeholder={t("profile.location_placeholder")} value={location} onChange={(e) => setLocation(e.target.value)} />
                  <VoiceInput onResult={(text) => setLocation(text)} />
                </div>
              </div>
            </div>
          </div>

          {user?.role === "farmer" && (
            <div className="farm-card p-6 space-y-4">
              <h2 className="font-heading font-bold text-foreground">{t("profile.seller_details")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user.sellerType === "farm" && (
                  <div className="space-y-1.5">
                    <Label>{t("profile.farm_name")}</Label>
                    <div className="flex gap-2">
                      <Input value={farmName} onChange={(e) => setFarmName(e.target.value)} />
                      <VoiceInput onResult={(text) => setFarmName(text)} />
                    </div>
                  </div>
                )}
                <div className="space-y-1.5">
                  <Label>{t("profile.years_exp")}</Label>
                  <Input type="number" min={0} value={yearsExp} onChange={(e) => setYearsExp(e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label>{t("profile.crops_grown")}</Label>
                  <div className="flex gap-2">
                    <Input placeholder={t("profile.crops_placeholder")} value={cropsGrown} onChange={(e) => setCropsGrown(e.target.value)} />
                    <VoiceInput onResult={(text) => setCropsGrown((prev) => prev ? prev + ", " + text : text)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("profile.state")}</Label>
                  <div className="flex gap-2">
                    <Input value={state} onChange={(e) => setState(e.target.value)} />
                    <VoiceInput onResult={(text) => setState(text)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {user?.role === "driver" && (
            <div className="farm-card p-6 space-y-4">
              <h2 className="font-heading font-bold text-foreground">{t("profile.driver_details")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("profile.vehicle_type")}</Label>
                  <select className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm" value={vehicleType} onChange={(e) => setVehicleType(e.target.value)}>
                    <option value="Motorcycle">{t("profile.motorcycle")}</option>
                    <option value="Car">{t("profile.car")}</option>
                    <option value="Van">{t("profile.van")}</option>
                    <option value="Truck">{t("profile.truck")}</option>
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("profile.license_no")}</Label>
                  <div className="flex gap-2">
                    <Input placeholder={t("profile.license_placeholder")} value={licenseNo} onChange={(e) => setLicenseNo(e.target.value)} />
                    <VoiceInput onResult={(text) => setLicenseNo(text)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          {user?.role === "buyer" && (
            <div className="farm-card p-6 space-y-4">
              <h2 className="font-heading font-bold text-foreground">{t("profile.preferences")}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>{t("profile.preferred_area")}</Label>
                  <div className="flex gap-2">
                    <Input placeholder={t("profile.area_placeholder")} value={location} onChange={(e) => setLocation(e.target.value)} />
                    <VoiceInput onResult={(text) => setLocation(text)} />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label>{t("profile.state")}</Label>
                  <div className="flex gap-2">
                    <Input value={state} onChange={(e) => setState(e.target.value)} />
                    <VoiceInput onResult={(text) => setState(text)} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <Button className="rounded-full w-full" size="lg" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> {t("profile.save")}
          </Button>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
