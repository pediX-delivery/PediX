import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getPanelData() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data } = await supabase.from("restaurant_members").select("restaurant_id, role, restaurants(id,name,slug,status,description,address_street,address_number,neighborhood,postal_code,phone,whatsapp,business_hours)").eq("user_id", user.id).order("created_at");
  const memberships = (data ?? []) as any[];
  const ids = memberships.map((m) => m.restaurant_id);
  const [{ data: categories }, { data: products }] = ids.length ? await Promise.all([
    supabase.from("categories").select("id,restaurant_id,name,description,sort_order,is_active").in("restaurant_id", ids).order("sort_order"),
    supabase.from("products").select("id,restaurant_id,category_id,name,description,price_cents,is_available").in("restaurant_id", ids).order("created_at", { ascending: false }),
  ]) : [{ data: [] }, { data: [] }];
  return { user, memberships, categories: categories ?? [], products: products ?? [] };
}
