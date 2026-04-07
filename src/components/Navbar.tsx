import { Link, useNavigate, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Leaf, LogOut, User, ChefHat } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useAuth } from "@/contexts/AuthContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import LanguageSelector from "@/components/LanguageSelector";
import { useState } from "react";

const Navbar = () => {
  const { itemCount } = useCart();
  const { user, logout, isAuthenticated } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + "/");

  const dashboardPath = user
    ? user.role === "farmer"
      ? "/farmer-dashboard"
      : user.role === "driver"
      ? "/driver-dashboard"
      : "/buyer-dashboard"
    : "/auth";

  const showMarketplace = !user || user.role === "buyer";
  const showCart = !user || user.role === "buyer";
  const showMealPlanner = !user || user.role === "buyer";

  return (
    <nav className="sticky top-0 z-[1100] bg-card/90 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <Leaf className="h-7 w-7 text-primary" />
          <span className="text-xl font-heading font-bold text-foreground">OddHarvest</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <LanguageSelector />
          {showMarketplace && isAuthenticated && (
            <Link to="/marketplace" className={`text-sm font-medium transition-colors min-w-[80px] text-center ${isActive("/marketplace") ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
              {t("nav.marketplace")}
            </Link>
          )}
          {isAuthenticated && (
            <Link to={dashboardPath} className={`text-sm font-medium transition-colors min-w-[80px] text-center ${isActive(dashboardPath) ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
              {t("nav.dashboard")}
            </Link>
          )}
          {showMealPlanner && isAuthenticated && (
            <Link to="/meal-planner" className={`text-sm font-medium transition-colors flex items-center gap-1 ${isActive("/meal-planner") ? "text-foreground font-semibold" : "text-muted-foreground hover:text-foreground"}`}>
              {t("nav.meal_planner")}
            </Link>
          )}
          {showCart && isAuthenticated && (
            <Link to="/cart" className={`relative ${isActive("/cart") ? "text-foreground" : ""}`}>
              <ShoppingCart className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
              {itemCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          )}
          {isAuthenticated ? (
            <div className="flex items-center gap-3">
              <Link to="/profile" className="flex items-center gap-1.5 hover:opacity-80 transition-opacity">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="h-7 w-7 rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                <span className="text-sm text-muted-foreground">{user?.name}</span>
              </Link>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <Link to="/auth">
              <Button size="sm">{t("nav.login")}</Button>
            </Link>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="md:hidden" onClick={() => setMobileOpen(!mobileOpen)}>
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-card border-b border-border px-4 pb-4 space-y-3">
          <LanguageSelector />
          {showMarketplace && isAuthenticated && (
            <Link to="/marketplace" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>{t("nav.marketplace")}</Link>
          )}
          {isAuthenticated && (
            <Link to={dashboardPath} className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>{t("nav.dashboard")}</Link>
          )}
          {showMealPlanner && isAuthenticated && (
            <Link to="/meal-planner" className="flex items-center gap-1 text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
              <ChefHat className="h-4 w-4" /> {t("nav.meal_planner")}
            </Link>
          )}
          {showCart && isAuthenticated && (
            <Link to="/cart" className="block text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
              {t("nav.cart")} ({itemCount})
            </Link>
          )}
          {isAuthenticated ? (
            <>
              <Link to="/profile" className="flex items-center gap-2 text-sm font-medium py-2" onClick={() => setMobileOpen(false)}>
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Profile" className="h-6 w-6 rounded-full object-cover" />
                ) : (
                  <User className="h-4 w-4" />
                )}
                {t("common.profile")}
              </Link>
              <Button variant="ghost" size="sm" onClick={() => { logout(); navigate("/"); setMobileOpen(false); }}>
                {t("nav.logout")}
              </Button>
            </>
          ) : (
            <Link to="/auth" onClick={() => setMobileOpen(false)}>
              <Button size="sm" className="w-full">{t("nav.login")}</Button>
            </Link>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
