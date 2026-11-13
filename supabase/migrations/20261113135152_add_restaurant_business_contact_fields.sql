alter table public.restaurants
  add column if not exists address_street text,
  add column if not exists address_number text,
  add column if not exists neighborhood text,
  add column if not exists postal_code text,
  add column if not exists phone text,
  add column if not exists whatsapp text;
