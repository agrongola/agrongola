-- Migration to add geolocation to crops and support globe visualization
alter table public.crops add column if not exists latitude double precision;
alter table public.crops add column if not exists longitude double precision;

-- Table for globe markers or POIs if needed separately
create table if not exists public.globe_markers (
    id uuid default uuid_generate_v4() primary key,
    label text not null,
    latitude double precision not null,
    longitude double precision not null,
    color text default '#76c893',
    size float default 0.1,
    created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.globe_markers enable row level security;

-- Policies
create policy "Globe markers are viewable by everyone" on public.globe_markers
    for select using (true);
