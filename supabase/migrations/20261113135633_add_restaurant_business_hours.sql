alter table public.restaurants
  add column if not exists business_hours jsonb not null default '{}'::jsonb;
