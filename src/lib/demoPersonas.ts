/**
 * Three reserved demo accounts. Create matching users in Supabase Auth with these emails,
 * then log in — the app links auth to pre-seeded profiles on first login.
 * Defaults match `supabase/seed.sql`; override with VITE_DEMO_* if you change seed emails.
 */
const DEFAULT_FARMER = "demo-farmer@oddharvest.demo";
const DEFAULT_BUYER = "demo-buyer@oddharvest.demo";
const DEFAULT_DRIVER = "demo-driver@oddharvest.demo";

export const DEMO_FARMER_EMAIL =
  (import.meta.env.VITE_DEMO_FARMER_EMAIL as string | undefined)?.toLowerCase().trim() || DEFAULT_FARMER;
export const DEMO_BUYER_EMAIL =
  (import.meta.env.VITE_DEMO_BUYER_EMAIL as string | undefined)?.toLowerCase().trim() || DEFAULT_BUYER;
export const DEMO_DRIVER_EMAIL =
  (import.meta.env.VITE_DEMO_DRIVER_EMAIL as string | undefined)?.toLowerCase().trim() || DEFAULT_DRIVER;

export const DEMO_SELLER_ID = "seller-demo-farmer";

/** Must match `supabase/seed.sql` demo farmer profile id. */
export const DEMO_FARMER_PROFILE_ID = "11111111-1111-4111-8111-111111111101";
export const DEMO_BUYER_PROFILE_ID = "11111111-1111-4111-8111-111111111102";
export const DEMO_DRIVER_PROFILE_ID = "11111111-1111-4111-8111-111111111103";

export function isReservedDemoEmail(email: string): boolean {
  const e = email.toLowerCase().trim();
  return e === DEMO_FARMER_EMAIL || e === DEMO_BUYER_EMAIL || e === DEMO_DRIVER_EMAIL;
}

export function isDemoFarmerEmail(email: string): boolean {
  return email.toLowerCase().trim() === DEMO_FARMER_EMAIL;
}

export function resolveSellerIdForFarmer(profileId: string, email: string): string {
  if (profileId === DEMO_FARMER_PROFILE_ID || isDemoFarmerEmail(email)) return DEMO_SELLER_ID;
  return `seller-${profileId}`;
}
