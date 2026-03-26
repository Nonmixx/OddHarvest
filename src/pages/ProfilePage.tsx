import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, Save, Camera } from "lucide-react";
import { toast } from "sonner";
import VoiceInput from "@/components/VoiceInput";

const STATES = ["Johor", "Kedah", "Kelantan", "Melaka", "Negeri Sembilan", "Pahang", "Penang", "Perak", "Perlis", "Sabah", "Sarawak", "Selangor", "Terengganu", "Kuala Lumpur", "Putrajaya", "Labuan"];

const ProfilePage = () => {
  const { user, updateProfile } = useAuth();
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [location, setLocation] = useState(user?.location || "");
  const [address, setAddress] = useState(user?.address || "");
  const [state, setState] = useState(user?.state || "Selangor");
  const [farmName, setFarmName] = useState(user?.farmName || "");
  const [yearsExp, setYearsExp] = useState(user?.yearsExp || "");
  const [cropsGrown, setCropsGrown] = useState(user?.cropsGrown || "");
  const [vehicleType, setVehicleType] = useState(user?.vehicleType || "Motorcycle");
  const [licenseNo, setLicenseNo] = useState(user?.licenseNo || "");
  const [profilePicture, setProfilePicture] = useState(user?.profilePicture || "");
  const [preferredPickupArea, setPreferredPickupArea] = useState(user?.preferredPickupArea || "");

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
      setLocation(user.location || "");
      setAddress(user.address || "");
      setState(user.state || "Selangor");
      setFarmName(user.farmName || "");
      setYearsExp(user.yearsExp || "");
      setCropsGrown(user.cropsGrown || "");
      setVehicleType(user.vehicleType || "Motorcycle");
      setLicenseNo(user.licenseNo || "");
      setProfilePicture(user.profilePicture || "");
      setPreferredPickupArea(user.preferredPickupArea || "");
    }
  }, [user]);

  const roleEmoji = user?.role === "farmer" ? "🌾" : user?.role === "driver" ? "🚚" : "🛒";
  const roleLabel = user?.role === "farmer" ? t("profile.seller") : user?.role === "driver" ? t("profile.driver") : t("profile.buyer");

  const handleProfilePictureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) {
        const pic = ev.target.result as string;
        setProfilePicture(pic);
        updateProfile({ profilePicture: pic });
        toast.success(t("profile.photo_updated") + " 📸");
      }
    };
    reader.readAsDataURL(file);
  };

  const navigate = useNavigate();

  const handleSave = () => {
    updateProfile({
      name, email, phone, location, address, state,
      farmName, yearsExp, cropsGrown,
      vehicleType, licenseNo, profilePicture, preferredPickupArea,
    });
    toast.success(t("profile.updated") + " ✅");
    if (user?.role === "buyer") {
      navigate("/marketplace");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="relative group">
            <div
              className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center overflow-hidden cursor-pointer"
              onClick={() => fileInputRef.current?.click()}
            >
              {profilePicture ? (
                <img src={profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="h-8 w-8 text-primary" />
              )}
            </div>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-md"
            >
              <Camera className="h-3 w-3" />
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleProfilePictureUpload}
            />
          </div>
          <div>
            <h1 className="text-2xl font-heading font-bold text-foreground">{t("profile.title")}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span>{roleEmoji}</span>
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
          {/* Basic Info */}
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
                  <span>📍</span>
                  <Input placeholder={t("profile.location_placeholder")} value={location} onChange={(e) => setLocation(e.target.value)} />
                  <VoiceInput onResult={(text) => setLocation(text)} />
                </div>
              </div>
            </div>
          </div>

          {/* Address Section - ALL ROLES */}
          <div className="farm-card p-6 space-y-4">
            <h2 className="font-heading font-bold text-foreground flex items-center gap-2">
              <Home className="h-4 w-4 text-primary" />
              {t("profile.address_section")}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2 space-y-1.5">
                <Label>{t("profile.address")}</Label>
                <div className="flex gap-2">
                  <Input placeholder={t("profile.address_placeholder")} value={address} onChange={(e) => setAddress(e.target.value)} />
                  <VoiceInput onResult={(text) => setAddress((prev) => prev ? prev + " " + text : text)} />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>{t("profile.state")}</Label>
                <select
                  className="w-full h-10 rounded-lg border border-input bg-background px-3 text-sm"
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                >
                  {STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Seller Details */}
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
              </div>
            </div>
          )}

          {/* Driver Details */}
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

          <Button className="rounded-full w-full" size="lg" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" /> {t("profile.save")}
          </Button>
        </div>
      </div>
      
    </div>
  );
};

export default ProfilePage;
