-- Demo personas: reserved profiles + driver assignment on deliveries
alter table public.profiles
  add column if not exists is_demo_persona boolean not null default false;

alter table public.deliveries
  add column if not exists driver_profile_id uuid references public.profiles(id) on delete set null;

create index if not exists deliveries_driver_profile_id_idx on public.deliveries(driver_profile_id);
create index if not exists orders_buyer_profile_id_idx on public.orders(buyer_profile_id);

-- Link pre-seeded demo profiles on first login (RLS otherwise blocks updating auth_user_id from null).
create or replace function public.link_demo_profile_if_reserved(p_email text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_jwt_email text;
begin
  v_jwt_email := lower(trim(coalesce((auth.jwt() ->> 'email'), '')));
  if v_jwt_email = '' or lower(trim(coalesce(p_email, ''))) <> v_jwt_email then
    return false;
  end if;
  update public.profiles p
  set auth_user_id = auth.uid(), updated_at = now()
  where p.is_demo_persona = true
    and p.auth_user_id is null
    and lower(trim(p.email)) = v_jwt_email;
  return found;
end;
$$;

grant execute on function public.link_demo_profile_if_reserved(text) to authenticated;
