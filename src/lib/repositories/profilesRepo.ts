import { supabase } from "@/lib/supabaseClient";
import { useSupabaseBackend } from "@/lib/backendConfig";
import { isReservedDemoEmail } from "@/lib/demoPersonas";

export type AppProfile = {
  id: string;
  authUserId?: string;
  isDemoPersona?: boolean;
  email: string;
  name: string;
  role: "farmer" | "buyer" | "driver";
  sellerType?: "farm" | "community";
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
};

type ProfileRow = {
  id: string;
  auth_user_id: string | null;
  email: string;
  name: string;
  role: "farmer" | "buyer" | "driver";
  seller_type: "farm" | "community" | null;
  farm_name: string | null;
  location: string | null;
  address: string | null;
  state: string | null;
  phone: string | null;
  years_exp: string | null;
  crops_grown: string | null;
  vehicle_type: string | null;
  license_no: string | null;
  profile_picture: string | null;
  preferred_pickup_area: string | null;
  bank_name: string | null;
  bank_account_holder: string | null;
  bank_account_number: string | null;
  is_demo_persona?: boolean | null;
};

const fromRow = (r: ProfileRow): AppProfile => ({
  id: r.id,
  authUserId: r.auth_user_id ?? undefined,
  isDemoPersona: r.is_demo_persona ?? undefined,
  email: r.email,
  name: r.name,
  role: r.role,
  sellerType: r.seller_type ?? undefined,
  farmName: r.farm_name ?? undefined,
  location: r.location ?? undefined,
  address: r.address ?? undefined,
  state: r.state ?? undefined,
  phone: r.phone ?? undefined,
  yearsExp: r.years_exp ?? undefined,
  cropsGrown: r.crops_grown ?? undefined,
  vehicleType: r.vehicle_type ?? undefined,
  licenseNo: r.license_no ?? undefined,
  profilePicture: r.profile_picture ?? undefined,
  preferredPickupArea: r.preferred_pickup_area ?? undefined,
  bankName: r.bank_name ?? undefined,
  bankAccountHolder: r.bank_account_holder ?? undefined,
  bankAccountNumber: r.bank_account_number ?? undefined,
});

export async function upsertProfile(profile: AppProfile): Promise<void> {
  if (!useSupabaseBackend || !supabase) return;
  await supabase.from("profiles").upsert({
    id: profile.id,
    auth_user_id: profile.authUserId ?? null,
    email: profile.email,
    name: profile.name,
    role: profile.role,
    seller_type: profile.sellerType ?? null,
    farm_name: profile.farmName ?? null,
    location: profile.location ?? null,
    address: profile.address ?? null,
    state: profile.state ?? null,
    phone: profile.phone ?? null,
    years_exp: profile.yearsExp ?? null,
    crops_grown: profile.cropsGrown ?? null,
    vehicle_type: profile.vehicleType ?? null,
    license_no: profile.licenseNo ?? null,
    profile_picture: profile.profilePicture ?? null,
    preferred_pickup_area: profile.preferredPickupArea ?? null,
    bank_name: profile.bankName ?? null,
    bank_account_holder: profile.bankAccountHolder ?? null,
    bank_account_number: profile.bankAccountNumber ?? null,
  });
}

export async function getProfileByAuthUserId(authUserId: string): Promise<AppProfile | null> {
  if (!useSupabaseBackend || !supabase) return null;
  const { data } = await supabase.from("profiles").select("*").eq("auth_user_id", authUserId).maybeSingle();
  return data ? fromRow(data as ProfileRow) : null;
}

export async function getProfileByEmail(email: string): Promise<AppProfile | null> {
  if (!useSupabaseBackend || !supabase) return null;
  const normalized = email.trim();
  const { data } = await supabase.from("profiles").select("*").ilike("email", normalized).maybeSingle();
  return data ? fromRow(data as ProfileRow) : null;
}

/**
 * After login/session restore: link demo row, then prefer profile by auth id, else reserved demo row by email.
 * Avoids stale localStorage (wrong id/email) when the RPC link is delayed or the row was matched by email only.
 */
export async function getSessionAppProfile(authUserId: string, email: string): Promise<AppProfile | null> {
  if (!useSupabaseBackend || !supabase) return null;
  const trimmed = email.trim();
  if (trimmed) await linkReservedDemoProfile(trimmed);

  const byAuth = await getProfileByAuthUserId(authUserId);
  if (byAuth) return byAuth;

  const byEmail = await getProfileByEmail(trimmed);
  if (!byEmail) return null;
  if (!byEmail.isDemoPersona && !isReservedDemoEmail(trimmed)) return null;
  if (byEmail.authUserId && byEmail.authUserId !== authUserId) return null;
  return byEmail;
}

/** Links JWT user to a pre-seeded demo row (same email, is_demo_persona, auth_user_id null). */
export async function linkReservedDemoProfile(email: string): Promise<boolean> {
  if (!useSupabaseBackend || !supabase) return false;
  const { data, error } = await supabase.rpc("link_demo_profile_if_reserved", {
    p_email: email,
  });
  if (error) return false;
  return data === true;
}

