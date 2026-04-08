import React, { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SellerType } from "@/contexts/CartContext";
import { useSupabaseBackend } from "@/lib/backendConfig";
import { supabase } from "@/lib/supabaseClient";
import { getSessionAppProfile, upsertProfile, type AppProfile } from "@/lib/repositories/profilesRepo";
import { isReservedDemoEmail } from "@/lib/demoPersonas";

export type UserRole = "farmer" | "buyer" | "driver";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  sellerType?: SellerType;
  farmName?: string;
  location?: string;
  address?: string;
  state?: string;
  phone?: string;
  yearsExp?: string;
  cropsGrown?: string;
  vehicleType?: string;
  licenseNo?: string;
  profilePicture?: string;
  preferredPickupArea?: string;
  bankName?: string;
  bankAccountHolder?: string;
  bankAccountNumber?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string, role: UserRole) => Promise<void>;
  signup: (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    sellerType?: SellerType,
    farmName?: string
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_KEY = "oddharvest.user";

function profileToUser(prof: AppProfile): User {
  return {
    id: prof.id,
    name: prof.name,
    email: prof.email,
    role: prof.role,
    sellerType: prof.sellerType,
    farmName: prof.farmName,
    location: prof.location,
    address: prof.address,
    state: prof.state,
    phone: prof.phone,
    yearsExp: prof.yearsExp,
    cropsGrown: prof.cropsGrown,
    vehicleType: prof.vehicleType,
    licenseNo: prof.licenseNo,
    profilePicture: prof.profilePicture,
    preferredPickupArea: prof.preferredPickupArea,
    bankName: prof.bankName,
    bankAccountHolder: prof.bankAccountHolder,
    bankAccountNumber: prof.bankAccountNumber,
  };
}

function loadUserFromStorage(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed as User;
  } catch {
    return null;
  }
}

function saveUserToStorage(user: User | null) {
  try {
    if (!user) localStorage.removeItem(STORAGE_KEY);
    else localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  } catch {
    // ignore storage failures (private mode / quota)
  }
}

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => loadUserFromStorage());

  useEffect(() => {
    if (!useSupabaseBackend || !supabase) return;
    const bootstrap = async () => {
      const { data } = await supabase.auth.getSession();
      const sessionUser = data.session?.user;
      if (!sessionUser?.id) return;
      const email = sessionUser.email ?? "";
      const prof = email ? await getSessionAppProfile(sessionUser.id, email) : null;
      if (prof) {
        const next = profileToUser(prof);
        setUser(next);
        saveUserToStorage(next);
      }
    };
    void bootstrap();
  }, []);

  const login = async (email: string, password: string, role: UserRole) => {
    if (useSupabaseBackend && supabase) {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      const authUserId = data.user?.id;
      if (!authUserId) throw new Error("Login failed");
      const prof = await getSessionAppProfile(authUserId, email);
      if (prof) {
        const next = profileToUser(prof);
        setUser(next);
        saveUserToStorage(next);
        return;
      }
      if (isReservedDemoEmail(email)) {
        throw new Error("Demo profile could not be loaded. Please run migrations + seed, then sign in again.");
      }
      const next = { id: crypto.randomUUID(), name: email.split("@")[0], email, role };
      setUser(next);
      saveUserToStorage(next);
      await upsertProfile({
        id: next.id,
        authUserId,
        email: next.email,
        name: next.name,
        role: next.role,
      });
      return;
    }

    const next = { id: crypto.randomUUID(), name: email.split("@")[0], email, role };
    setUser(next);
    saveUserToStorage(next);
  };

  const signup = async (
    name: string,
    email: string,
    password: string,
    role: UserRole,
    sellerType?: SellerType,
    farmName?: string
  ) => {
    if (useSupabaseBackend && supabase) {
      if (isReservedDemoEmail(email)) {
        throw new Error("This email is reserved for a demo account. Sign in with the password you set in Supabase Auth instead.");
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { role, sellerType, farmName, name } },
      });
      if (error) throw error;
      const next = { id: crypto.randomUUID(), name, email, role, sellerType, farmName };
      if (data.user?.id) {
        await upsertProfile({
          id: next.id,
          authUserId: data.user.id,
          email: next.email,
          name: next.name,
          role: next.role,
          sellerType: next.sellerType,
          farmName: next.farmName,
        });
      }
      // When email confirmation is enabled, session is null until user verifies.
      const needsEmailConfirmation = !data.session;
      if (needsEmailConfirmation) {
        setUser(null);
        saveUserToStorage(null);
      } else {
        setUser(next);
        saveUserToStorage(next);
      }
      return { needsEmailConfirmation };
    }

    const next = { id: crypto.randomUUID(), name, email, role, sellerType, farmName };
    setUser(next);
    saveUserToStorage(next);
    return { needsEmailConfirmation: false };
  };

  const logout = async () => {
    if (useSupabaseBackend && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    saveUserToStorage(null);
  };

  const updateProfile = async (data: Partial<User>) => {
    let persisted: User | null = null;
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...data };
      saveUserToStorage(next);
      persisted = next;
      return next;
    });
    if (useSupabaseBackend && supabase && persisted) {
      const { data: authData } = await supabase.auth.getUser();
      await upsertProfile({
        id: persisted.id,
        authUserId: authData.user?.id,
        email: persisted.email,
        name: persisted.name,
        role: persisted.role,
        sellerType: persisted.sellerType,
        farmName: persisted.farmName,
        location: persisted.location,
        address: persisted.address,
        state: persisted.state,
        phone: persisted.phone,
        yearsExp: persisted.yearsExp,
        cropsGrown: persisted.cropsGrown,
        vehicleType: persisted.vehicleType,
        licenseNo: persisted.licenseNo,
        profilePicture: persisted.profilePicture,
        preferredPickupArea: persisted.preferredPickupArea,
        bankName: persisted.bankName,
        bankAccountHolder: persisted.bankAccountHolder,
        bankAccountNumber: persisted.bankAccountNumber,
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout, updateProfile, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
