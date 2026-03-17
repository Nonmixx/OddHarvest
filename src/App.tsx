import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { CropInventoryProvider } from "@/contexts/CropInventoryContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import AuthPage from "./pages/AuthPage";
import MarketplacePage from "./pages/MarketplacePage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import FarmerDashboard from "./pages/FarmerDashboard";
import FarmerSoldCrops from "./pages/FarmerSoldCrops";
import BuyerDashboard from "./pages/BuyerDashboard";
import DriverDashboard from "./pages/DriverDashboard";
import DriverDeliveries from "./pages/DriverDeliveries";
import DriverDeliveryDetail from "./pages/DriverDeliveryDetail";
import SellerProfilePage from "./pages/SellerProfilePage";
import AddCropPage from "./pages/AddCropPage";
import AddBundlePage from "./pages/AddBundlePage";
import AddMysteryBoxPage from "./pages/AddMysteryBoxPage";
import ProfilePage from "./pages/ProfilePage";
import MealPlannerPage from "./pages/MealPlannerPage";
import OrderDetailPage from "./pages/OrderDetailPage";

const queryClient = new QueryClient();

// App root with all providers
const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <AuthProvider>
        <CropInventoryProvider>
          <CartProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/auth" element={<AuthPage />} />
                  <Route path="/marketplace" element={<MarketplacePage />} />
                  <Route path="/cart" element={<CartPage />} />
                  <Route path="/checkout" element={<CheckoutPage />} />
                  <Route path="/farmer-dashboard" element={<FarmerDashboard />} />
                  <Route path="/farmer-sold-crops" element={<FarmerSoldCrops />} />
                  <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
                  <Route path="/driver-dashboard" element={<DriverDashboard />} />
                  <Route path="/driver-deliveries" element={<DriverDeliveries />} />
                  <Route path="/driver-delivery/:id" element={<DriverDeliveryDetail />} />
                  <Route path="/seller/:id" element={<SellerProfilePage />} />
                  <Route path="/add-crop" element={<AddCropPage />} />
                  <Route path="/add-bundle" element={<AddBundlePage />} />
                  <Route path="/add-mystery-box" element={<AddMysteryBoxPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/meal-planner" element={<MealPlannerPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </CartProvider>
        </CropInventoryProvider>
      </AuthProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
