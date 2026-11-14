-- ==============================================================================
-- EVENT CURATION PLATFORM: SUPABASE DATABASE SCHEMA
-- Features: Live Headcounts, Zone Boosting Strategy, Sponsor Validation, QR Check-ins, Rewards
-- ==============================================================================

-- 1. EXTENSIONS
create extension if not exists "uuid-ossp";

-- 2. ZONES TABLE
create table if not exists public.zones (
    id text primary key,
    name text not null,
    description text,
    is_boosted boolean default false,
    boost_multiplier numeric(3,1) default 2.0,
    capacity integer default 500,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. STALLS TABLE
create table if not exists public.stalls (
    id text primary key,
    zone_id text references public.zones(id) on delete cascade,
    name text not null,
    sponsor_name text not null,
    sponsor_category text,
    base_points integer default 50,
    live_headcount integer default 0,
    total_footfall integer default 0,
    capacity integer default 150,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. ATTENDEES / PROFILES TABLE
create table if not exists public.attendees (
    id uuid default uuid_generate_v4() primary key,
    pass_id text unique not null,
    full_name text not null,
    email text unique not null,
    role text default 'consumer', -- 'consumer' or 'staff'
    tier text default 'Standard Pass', -- 'VIP Pass', 'Standard Pass', 'Sponsor Guest'
    avatar_url text,
    points_balance integer default 100,
    lifetime_points integer default 100,
    medical_profile jsonb default '{"blood_group": "O+", "age": 24, "height": "5''11\"", "weight": "72 kg", "emergency_contact": {"name": "Primary Contact", "relation": "Family", "phone": "+91 98765 43210"}}'::jsonb,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. CHECKINS TABLE (Every scan logged here)
create table if not exists public.checkins (
    id uuid default uuid_generate_v4() primary key,
    attendee_id uuid references public.attendees(id) on delete cascade,
    attendee_pass_id text not null,
    location_type text not null, -- 'main_gate' or 'stall'
    location_id text not null,   -- 'main_gate', 'stall_1', 'stall_2', etc.
    zone_id text,                -- null for main gate, or 'zone_1', 'zone_2'
    points_awarded integer default 0,
    was_boosted boolean default false,
    multiplier numeric(3,1) default 1.0,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. REWARDS CATALOG TABLE
create table if not exists public.rewards_catalog (
    id text primary key,
    title text not null,
    sponsor_name text not null,
    points_cost integer not null,
    description text,
    category text default 'Merchandise',
    stock integer default 50,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. REDEMPTIONS TABLE
create table if not exists public.redemptions (
    id uuid default uuid_generate_v4() primary key,
    attendee_id uuid references public.attendees(id) on delete cascade,
    reward_id text references public.rewards_catalog(id) on delete set null,
    voucher_code text unique not null,
    points_spent integer not null,
    status text default 'claimed', -- 'claimed', 'redeemed', 'expired'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. EMERGENCY DISPATCHES & MEDICAL TRIAGE LOG
create table if not exists public.emergency_dispatches (
    id uuid default uuid_generate_v4() primary key,
    attendee_pass_id text not null,
    attendee_name text not null,
    location_id text not null,
    location_name text not null,
    reporter_type text default 'bystander', -- 'bystander' or 'staff'
    reporter_note text,
    medical_snapshot jsonb,
    sms_alert_sent boolean default true,
    paramedic_unit_assigned text default 'Paramedic Unit #2 (Zone 2 Station)',
    status text default 'ACTIVE_DISPATCH', -- 'ACTIVE_DISPATCH', 'RESOLVED'
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. INITIAL SEED DATA
insert into public.zones (id, name, description, is_boosted, boost_multiplier, capacity) values
('zone_1', 'Zone 1: Tech & Innovation Pavilions', 'Front hall featuring emerging technologies, robotics, and interactive hardware demonstrations.', false, 2.0, 300),
('zone_2', 'Zone 2: Creator & Entertainment Hub', 'Central arena featuring gaming lounges, media studios, and future mobility showcases.', true, 2.5, 450)
on conflict (id) do update set 
    is_boosted = excluded.is_boosted,
    boost_multiplier = excluded.boost_multiplier;

insert into public.stalls (id, zone_id, name, sponsor_name, sponsor_category, base_points, live_headcount, total_footfall, capacity) values
('stall_1', 'zone_1', 'Stall 1 - HyperTech AI Showcase', 'HyperTech Systems', 'Cloud & AI Infrastructure', 50, 24, 185, 120),
('stall_2', 'zone_1', 'Stall 2 - NovaDynamics Robotics Lab', 'NovaDynamics', 'Hardware & Autonomous Robotics', 50, 19, 142, 100),
('stall_3', 'zone_2', 'Stall 3 - SonicMedia Creator Studio', 'SonicMedia Studios', 'Audio & Digital Creation', 60, 48, 290, 150),
('stall_4', 'zone_2', 'Stall 4 - ApexPlay Esports & VR Arena', 'ApexPlay Interactive', 'Gaming & Immersive Tech', 75, 62, 340, 180),
('stall_5', 'zone_2', 'Stall 5 - VoltMotors Future Mobility', 'VoltMotors Global', 'EV & Clean Energy Tech', 50, 31, 210, 120)
on conflict (id) do nothing;

insert into public.attendees (id, pass_id, full_name, email, role, tier, points_balance, lifetime_points) values
('e5555555-5555-5555-5555-555555555555', 'PQ-7F3K', 'Aarav S.', 'aarav.s@technova26.io', 'consumer', 'TechNova ''26 · Band', 170, 240),
('a1111111-1111-1111-1111-111111111111', 'PASS-ALEX-8821', 'Alex Rivera', 'alex.rivera@example.com', 'consumer', 'VIP All-Access', 350, 600),
('b2222222-2222-2222-2222-222222222222', 'PASS-PRIYA-4920', 'Priya Sharma', 'priya.sharma@example.com', 'consumer', 'Standard Pass', 180, 280),
('c3333333-3333-3333-3333-333333333333', 'PASS-JORDAN-3104', 'Jordan Lee', 'jordan.lee@example.com', 'consumer', 'Tech Explorer Pass', 90, 150),
('d4444444-4444-4444-4444-444444444444', 'STAFF-ADMIN-01', 'Elena Rostova', 'staff.curation@eventflow.io', 'staff', 'Lead Event Curator', 0, 0)
on conflict (email) do nothing;

insert into public.rewards_catalog (id, title, sponsor_name, points_cost, description, category, stock) values
('rew_1', 'HyperTech Limited Edition Swag Bag', 'HyperTech Systems', 150, 'Branded thermal flask, embroidered tech pouch, and premium stickers.', 'Merchandise', 40),
('rew_2', 'ApexPlay VIP Gaming Lounge Access', 'ApexPlay Interactive', 250, '1-hour fast-track pass to the VR simulator and drinks bar.', 'Experience', 20),
('rew_3', 'SonicMedia Hi-Res Audio Sampler', 'SonicMedia Studios', 100, 'Exclusive lossless soundtrack collection + streaming pass.', 'Digital', 100),
('rew_4', 'VoltMotors Supercharger Coffee & Snacks', 'VoltMotors Global', 80, 'Fresh barista beverage and pastry at the EV hospitality lounge.', 'Hospitality', 65),
('rew_5', 'Grand Prize Keynote Raffle Ticket', 'Event Curation Board', 200, 'Entry ticket for the flagship giveaway at the Main Stage closing.', 'Raffle', 150)
on conflict (id) do nothing;

-- 9. ENABLE REALTIME PUBLICATION
alter publication supabase_realtime add table public.checkins;
alter publication supabase_realtime add table public.zones;
alter publication supabase_realtime add table public.stalls;
alter publication supabase_realtime add table public.attendees;

-- 10. SPONSOR FOOTFALL VALIDATION VIEW
create or replace view public.sponsor_validation_report as
select 
    s.id as stall_id,
    s.name as stall_name,
    s.sponsor_name,
    s.sponsor_category,
    z.name as zone_name,
    z.is_boosted,
    s.live_headcount,
    s.total_footfall,
    count(c.id) as verified_scan_count,
    count(distinct c.attendee_id) as unique_attendees,
    coalesce(sum(c.points_awarded), 0) as total_sponsor_points_distributed
from public.stalls s
left join public.zones z on s.zone_id = z.id
left join public.checkins c on c.location_id = s.id
group by s.id, s.name, s.sponsor_name, s.sponsor_category, z.name, z.is_boosted, s.live_headcount, s.total_footfall;
