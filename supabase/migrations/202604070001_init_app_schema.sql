create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  auth_user_id uuid unique,
  email text unique not null,
  name text not null,
  role text not null check (role in ('farmer','buyer','driver')),
  seller_type text check (seller_type in ('farm','community')),
  farm_name text,
  location text,
  address text,
  state text,
  phone text,
  years_exp text,
  crops_grown text,
  vehicle_type text,
  license_no text,
  profile_picture text,
  preferred_pickup_area text,
  bank_name text,
  bank_account_holder text,
  bank_account_number text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.sellers (
  id text primary key,
  profile_id uuid references public.profiles(id) on delete set null,
  name text not null,
  seller_type text not null check (seller_type in ('farm','community')),
  farm_name text,
  location text not null,
  state text not null,
  years_experience int,
  crops_grown text[] not null default '{}',
  total_crops_sold int not null default 0,
  crops_rescued_kg int not null default 0,
  orders_completed int not null default 0,
  average_rating numeric(3,2) not null default 0
);

create table if not exists public.crops (
  id text primary key,
  name text not null,
  image text not null,
  images text[],
  quantity numeric not null,
  usual_price numeric not null,
  discount_price numeric not null,
  farm_location text not null,
  state text not null,
  farmer_name text not null,
  seller_id text not null references public.sellers(id) on delete cascade,
  seller_type text not null check (seller_type in ('farm','community')),
  description text,
  harvest_date timestamptz not null,
  expiry_date timestamptz,
  distance_km numeric not null default 0,
  imperfect_reason text not null check (imperfect_reason in ('irregular_shape','too_small','too_large','cosmetic_blemish','slight_discoloration')),
  is_bundle boolean not null default false,
  bundle_contents text[],
  bundle_weight numeric,
  is_mystery_box boolean not null default false,
  is_ai_description boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id text primary key,
  date text not null,
  status text not null,
  total numeric not null,
  kg numeric not null,
  buyer_profile_id uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.order_items (
  id uuid primary key default gen_random_uuid(),
  order_id text not null references public.orders(id) on delete cascade,
  name text not null,
  qty numeric not null,
  price numeric not null,
  image text not null,
  seller_id text not null references public.sellers(id) on delete cascade,
  seller_name text not null,
  seller_location text not null
);

create table if not exists public.deliveries (
  id text primary key,
  order_id text not null,
  crop text not null,
  pickup text not null,
  dropoff text not null,
  distance numeric not null,
  fee numeric not null,
  date text not null,
  seller text not null,
  buyer text not null,
  status text not null check (status in ('request','completed')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.sellers enable row level security;
alter table public.crops enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.deliveries enable row level security;

drop policy if exists "public read profiles" on public.profiles;
create policy "public read profiles" on public.profiles for select using (true);
drop policy if exists "owner update profile" on public.profiles;
create policy "owner update profile" on public.profiles for update using (auth.uid() = auth_user_id);
drop policy if exists "owner insert profile" on public.profiles;
create policy "owner insert profile" on public.profiles for insert with check (auth.uid() = auth_user_id);

drop policy if exists "public read sellers" on public.sellers;
create policy "public read sellers" on public.sellers for select using (true);
drop policy if exists "farmers manage sellers" on public.sellers;
create policy "farmers manage sellers" on public.sellers
for all
using (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'farmer'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'farmer'
  )
);

drop policy if exists "public read crops" on public.crops;
create policy "public read crops" on public.crops for select using (true);
drop policy if exists "farmers manage crops" on public.crops;
create policy "farmers manage crops" on public.crops
for all
using (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'farmer'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'farmer'
  )
);

drop policy if exists "public read orders" on public.orders;
create policy "public read orders" on public.orders for select using (true);
drop policy if exists "public write orders" on public.orders;
create policy "buyers write orders" on public.orders
for all
using (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'buyer'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'buyer'
  )
);

drop policy if exists "public read order_items" on public.order_items;
create policy "public read order_items" on public.order_items for select using (true);
drop policy if exists "buyers write order_items" on public.order_items;
create policy "buyers write order_items" on public.order_items
for all
using (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'buyer'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'buyer'
  )
);

drop policy if exists "public read deliveries" on public.deliveries;
create policy "public read deliveries" on public.deliveries for select using (true);
drop policy if exists "drivers write deliveries" on public.deliveries;
create policy "drivers write deliveries" on public.deliveries
for all
using (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'driver'
  )
)
with check (
  exists (
    select 1 from public.profiles p
    where p.auth_user_id = auth.uid() and p.role = 'driver'
  )
);

