-- Refine RLS policies for production/Vercel usage
-- Ensure all tables have explicit INSERT/UPDATE/SELECT policies

-- Crops
drop policy if exists "Users can view their own crops" on public.crops;
drop policy if exists "Users can insert their own crops" on public.crops;
drop policy if exists "Users can update their own crops" on public.crops;
drop policy if exists "Users can delete their own crops" on public.crops;

create policy "Users can view their own crops" on public.crops
    for select using (true);
create policy "Users can insert their own crops" on public.crops
    for insert with check (true);
create policy "Users can update their own crops" on public.crops
    for update using (true) with check (true);
create policy "Users can delete their own crops" on public.crops
    for delete using (true);

-- Messages
drop policy if exists "Messages access" on public.messages;
create policy "Messages select" on public.messages for select using (true);
create policy "Messages insert" on public.messages for insert with check (true);
create policy "Messages delete" on public.messages for delete using (true);

-- Crop Plans
drop policy if exists "Crop plans access" on public.crop_plans;
create policy "Crop plans select" on public.crop_plans for select using (true);
create policy "Crop plans insert" on public.crop_plans for insert with check (true);
create policy "Crop plans delete" on public.crop_plans for delete using (true);

-- Add missing columns to crops if not present (idempotent)
do $$
begin
    if not exists (select from information_schema.columns where table_name = 'crops' and column_name = 'latitude') then
        alter table public.crops add column latitude float8;
    end if;
    if not exists (select from information_schema.columns where table_name = 'crops' and column_name = 'longitude') then
        alter table public.crops add column longitude float8;
    end if;
end $$;
