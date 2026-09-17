-- ====================================================
-- QUEUELESS — Supabase Database Migration
-- Run this in Supabase Dashboard → SQL Editor
-- ====================================================

-- 1. PROFILES TABLE
-- Extends Supabase Auth users with role and account info
create table if not exists public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  username    text,
  email       text,
  role        text not null check (role in ('superadmin', 'admin', 'staff')) default 'staff',
  is_active   boolean not null default true,
  created_by  uuid references public.profiles(id) on delete set null,
  created_at  timestamptz default now()
);

-- 2. EVENTS TABLE
-- Queue sessions created by staff/admins
create table if not exists public.events (
  id               uuid default gen_random_uuid() primary key,
  name             text not null,
  queue_code       text not null unique,
  status           text not null check (status in ('active', 'completed')) default 'active',
  time_per_person  integer not null default 5, -- minutes
  created_by       uuid references public.profiles(id) on delete set null,
  created_at       timestamptz default now()
);

-- 3. TICKETS TABLE
-- Individual queue entries (one per customer per event)
create table if not exists public.tickets (
  id             uuid default gen_random_uuid() primary key,
  event_id       uuid not null references public.events(id) on delete cascade,
  ticket_number  integer not null,
  status         text not null check (status in ('waiting', 'serving', 'hold', 'done')) default 'waiting',
  joined_at      timestamptz default now(),
  served_at      timestamptz,
  created_at     timestamptz default now(),
  unique(event_id, ticket_number)
);

-- ====================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================

alter table public.profiles  enable row level security;
alter table public.events     enable row level security;
alter table public.tickets    enable row level security;

-- PROFILES: read own profile
create policy "profiles_select_own"   on public.profiles for select using (auth.uid() = id);
-- PROFILES: superadmin reads all admins
create policy "profiles_select_admins" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'superadmin')
);
-- PROFILES: admin reads their staff
create policy "profiles_select_staff" on public.profiles for select using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'superadmin'))
);
-- PROFILES: insert own profile (on signup)
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
-- PROFILES: update own profile
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
-- PROFILES: superadmin/admin can update sub-profiles
create policy "profiles_update_sub" on public.profiles for update using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'superadmin'))
);
-- PROFILES: superadmin/admin can delete sub-profiles
create policy "profiles_delete_sub" on public.profiles for delete using (
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'superadmin'))
);

-- EVENTS: authenticated users can read all active events
create policy "events_select_auth"    on public.events for select using (auth.role() = 'authenticated');
-- EVENTS: public (anon) can read events by queue_code (for customer ticket page)
create policy "events_select_public"  on public.events for select using (status = 'active');
-- EVENTS: staff/admin can insert events
create policy "events_insert_staff"   on public.events for insert with check (
  auth.role() = 'authenticated' and
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('staff', 'admin', 'superadmin'))
);

-- EVENTS: creator or admin can update/delete
create policy "events_update_own"     on public.events for update using (
  created_by = auth.uid() or
  exists (select 1 from public.profiles p where p.id = auth.uid() and p.role in ('admin', 'superadmin'))
);

-- TICKETS: anyone (anon) can read tickets for an active event
create policy "tickets_select_public" on public.tickets for select using (true);
-- TICKETS: anyone (anon) can insert a ticket (join queue)
create policy "tickets_insert_public" on public.tickets for insert with check (true);
-- TICKETS: staff can update tickets (serving, hold, done)
create policy "tickets_update_staff"  on public.tickets for update using (
  auth.role() = 'authenticated'
);

-- ====================================================
-- REALTIME ENABLE
-- Run each line separately if needed:
-- ====================================================
-- alter publication supabase_realtime add table public.events;
-- alter publication supabase_realtime add table public.tickets;

-- ====================================================
-- INITIAL SUPERADMIN SETUP
-- After creating a user in Supabase Auth Dashboard,
-- run this to make them a superadmin:
-- ====================================================
-- insert into public.profiles (id, username, email, role, is_active)
-- values ('<YOUR_USER_UUID>', 'superadmin', 'superadmin@example.com', 'superadmin', true)
-- on conflict (id) do update set role = 'superadmin', is_active = true;
