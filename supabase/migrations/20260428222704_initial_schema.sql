-- Initial Schema for Agrongola 3.0

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Table for crops (plantations)
create table if not exists public.crops (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null, -- Links to auth.users if needed
    name text not null,
    planted_at date not null,
    location text,
    moisture_alert boolean default false,
    moisture_threshold integer default 30,
    nutrients_alert boolean default false,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for chat history
create table if not exists public.messages (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null,
    role text not null check (role in ('user', 'model')),
    parts jsonb not null, -- Array of ContentPart
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table for crop plans
create table if not exists public.crop_plans (
    id uuid default uuid_generate_v4() primary key,
    user_id uuid not null,
    crop text not null,
    report text not null,
    data jsonb not null, -- Wizard questionnaire data
    timestamp text,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Set up Row Level Security (RLS)
alter table public.crops enable row level security;
alter table public.messages enable row level security;
alter table public.crop_plans enable row level security;

-- Basic policies (assuming anonymous auth or specific user auth)
create policy "Users can view their own crops" on public.crops
    for select using (true); -- Simplified for demo/initial phase

create policy "Users can insert their own crops" on public.crops
    for insert with check (true);

create policy "Users can update their own crops" on public.crops
    for update using (true);

create policy "Users can delete their own crops" on public.crops
    for delete using (true);

-- Similar policies for messages and crop_plans
create policy "Messages access" on public.messages for all using (true);
create policy "Crop plans access" on public.crop_plans for all using (true);
