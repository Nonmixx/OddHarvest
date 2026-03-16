import React, { createContext, useContext, useState, ReactNode } from "react";
import { SellerType } from "@/contexts/CartContext";

export type UserRole = "farmer" | "buyer" | "driver";

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sellerType?: SellerType;
  farmName?: string;
  location?: string;
  state?: string;
  phone?: string;
  yearsExp?: string;
  cropsGrown?: string;
  vehicleType?: string;
  licenseNo?: string;
  profilePicture?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => void;
  signup: (name: string, email: string, password: string, role: UserRole, sellerType?: SellerType, farmName?: string) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = (email: string, _password: string, role: UserRole) => {
    setUser({ id: crypto.randomUUID(), name: email.split("@")[0], email, role });
  };

  const signup = (name: string, email: string, _password: string, role: UserRole, sellerType?: SellerType, farmName?: string) => {
    setUser({ id: crypto.randomUUID(), name, email, role, sellerType, farmName });
  };

  const logout = () => setUser(null);

  const updateProfile = (data: Partial<User>) => {
    setUser((prev) => prev ? { ...prev, ...data } : prev);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
};
