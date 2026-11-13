-- Anonymous visitors only need read access to active public storefront data.
-- Row-level security remains responsible for restricting which rows are visible.
revoke all privileges on all tables in schema public from anon;
grant select on table public.restaurants, public.categories, public.products to anon;

-- Prevent future public tables created by the migration owner from inheriting
-- unnecessary anonymous privileges.
alter default privileges for role postgres in schema public
  revoke all on tables from anon;
