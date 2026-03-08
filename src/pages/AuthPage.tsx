import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Leaf, Sprout, ShoppingBag, Truck } from "lucide-react";
import Navbar from "@/components/Navbar";

const roles: { value: UserRole; label: string; icon: typeof Sprout; desc: string }[] = [
  { value: "farmer", label: "Farmer", icon: Sprout, desc: "Sell your imperfect crops" },
  { value: "buyer", label: "Buyer", icon: ShoppingBag, desc: "Buy affordable fresh produce" },
  { value: "driver", label: "Driver", icon: Truck, desc: "Deliver crops and earn" },
];

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("buyer");
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isLogin) {
      login(email, password, role);
    } else {
      signup(name, email, password, role);
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
            {isLogin ? "Welcome Back!" : "Join OddHarvest"}
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            {isLogin ? "Login to your account" : "Create your account and start rescuing crops"}
          </p>
        </div>

        <div className="farm-card p-6 space-y-6">
          {/* Role selector */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">I am a...</Label>
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
                  <p className="text-xs font-medium">{r.label}</p>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div className="space-y-1.5">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" required />
              </div>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required />
            </div>
            <Button type="submit" className="w-full rounded-full" size="lg">
              {isLogin ? "Login" : "Sign Up"}
            </Button>
          </form>

          <p className="text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} className="text-primary font-medium hover:underline">
              {isLogin ? "Sign Up" : "Login"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
