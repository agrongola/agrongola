-- Table for user-specific chat profiles/settings
create table if not exists public.chat_profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    full_name text,
    avatar_url text,
    language text default 'pt-AO',
    globe_theme text default 'satellite',
    assistant_name text default 'AGRONGOLA',
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.chat_profiles enable row level security;

-- Policies
create policy "Users can view their own profile" on public.chat_profiles
    for select using (auth.uid() = user_id);

create policy "Users can update their own profile" on public.chat_profiles
    for update using (auth.uid() = user_id);

create policy "Users can insert their own profile" on public.chat_profiles
    for insert with check (auth.uid() = user_id);
