import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { SellerType } from "@/contexts/CartContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Sprout, ShoppingBag, Truck, Home } from "lucide-react";
import VoiceInput from "@/components/VoiceInput";
import Navbar from "@/components/Navbar";
import { toast } from "@/hooks/use-toast";

const roles: { value: UserRole; labelKey: string; icon: typeof Sprout; descKey: string }[] = [
  { value: "farmer", labelKey: "auth.farmer", icon: Sprout, descKey: "auth.farmer_desc" },
  { value: "buyer", labelKey: "auth.buyer", icon: ShoppingBag, descKey: "auth.buyer_desc" },
  { value: "driver", labelKey: "auth.driver", icon: Truck, descKey: "auth.driver_desc" },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const [sellerType, setSellerType] = useState<SellerType>("farm");
  const [farmName, setFarmName] = useState("");
  const { login, signup } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login(email, password, role);
    } else {
      signup(name, email, password, role, role === "farmer" ? sellerType : undefined, farmName || undefined);
    }
    const dest = role === "farmer" ? "/farmer-dashboard" : role === "driver" ? "/driver-dashboard" : "/marketplace";
    navigate(dest);
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="text-center mb-8">
          <Leaf className="h-10 w-10 text-primary mx-auto mb-3" />
          <h1 className="text-3xl font-heading font-bold text-foreground">
            {isLogin ? t("auth.welcome") : t("auth.join")}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLogin ? t("auth.login_desc") : t("auth.signup_desc")}
          </p>
        </div>

        <div className="farm-card p-6 space-y-6">
          {/* Role selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">{t("auth.iam")}</Label>
            <div className="grid grid-cols-3 gap-2">
              {roles.map((r) => (
                <button
                  key={r.value}
                  onClick={() => setRole(r.value)}
                  className={`p-3 rounded-xl border-2 transition-all text-center space-y-1 ${
                    role === r.value
                      ? "border-primary bg-farm-green-light"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <r.icon className={`h-5 w-5 mx-auto ${role === r.value ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-xs font-medium">{t(r.labelKey)}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Seller type for farmer registration */}
          {!isLogin && role === "farmer" && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">{t("auth.seller_type")}</Label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setSellerType("farm")}
                  className={`p-3 rounded-xl border-2 transition-all text-center space-y-1 ${
                    sellerType === "farm"
                      ? "border-primary bg-farm-green-light"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Sprout className={`h-5 w-5 mx-auto ${sellerType === "farm" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-xs font-medium">🌾 {t("seller.farm")}</p>
                </button>
                <button
                  onClick={() => setSellerType("community")}
                  className={`p-3 rounded-xl border-2 transition-all text-center space-y-1 ${
                    sellerType === "community"
                      ? "border-primary bg-farm-green-light"
                      : "border-border hover:border-primary/30"
                  }`}
                >
                  <Home className={`h-5 w-5 mx-auto ${sellerType === "community" ? "text-primary" : "text-muted-foreground"}`} />
                  <p className="text-xs font-medium">🌱 {t("seller.community")}</p>
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                {sellerType === "farm" ? t("auth.farm_desc") : t("auth.community_desc")}
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="name">{t("auth.name")}</Label>
                  <div className="flex gap-2">
                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder={t("auth.name_placeholder")} required />
                    <VoiceInput onResult={(text) => setName(text)} />
                  </div>
                </div>
                {role === "farmer" && sellerType === "farm" && (
                  <div className="space-y-1.5">
                    <Label htmlFor="farmName">{t("auth.farm_name")}</Label>
                    <div className="flex gap-2">
                      <Input id="farmName" value={farmName} onChange={(e) => setFarmName(e.target.value)} placeholder={t("auth.farm_name_placeholder")} />
                      <VoiceInput onResult={(text) => setFarmName(text)} />
                    </div>
                  </div>
                )}
              </>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">{t("auth.email")}</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t("auth.email_placeholder")} required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">{t("auth.password")}</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("auth.password_placeholder")} required />
            </div>
            <Button type="submit" className="w-full rounded-full" size="lg">
              {isLogin ? t("auth.login_btn") : t("auth.signup_btn")}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? t("auth.no_account") + " " : t("auth.has_account") + " "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? t("auth.signup_btn") : t("auth.login_btn")}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
