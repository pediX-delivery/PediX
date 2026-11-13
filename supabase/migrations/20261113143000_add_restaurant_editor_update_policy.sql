create or replace function private.is_restaurant_editor(target_restaurant uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $function$
  select exists (
    select 1
    from public.restaurant_members m
    where m.restaurant_id = target_restaurant
      and m.user_id = (select auth.uid())
      and m.role in ('owner', 'admin', 'manager')
  );
$function$;

revoke all on function private.is_restaurant_editor(uuid) from public;
revoke all on function private.is_restaurant_editor(uuid) from anon;
grant usage on schema private to authenticated;
grant execute on function private.is_restaurant_editor(uuid) to authenticated;

drop policy if exists restaurants_staff_update on public.restaurants;
create policy restaurants_staff_update
on public.restaurants
for update
to authenticated
using (private.is_restaurant_editor(id))
with check (private.is_restaurant_editor(id));
