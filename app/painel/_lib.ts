import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

type RestaurantPanelRow = {
  id: string;
  name: string;
  slug: string;
  status: string;
  description: string | null;
  address_street: string | null;
  address_number: string | null;
  neighborhood: string | null;
  postal_code: string | null;
  phone: string | null;
  whatsapp: string | null;
  business_hours: Record<string, { open?: string; close?: string; closed?: boolean }> | null;
};
type PanelMembership = {
  restaurant_id: string;
  role: string;
  restaurants: RestaurantPanelRow | null;
};

export async function getPanelData() {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error || !user) redirect("/login");
  const { data } = await supabase.from("restaurant_members")
    .select("restaurant_id, role, restaurants(id,name,slug,status,description,address_street,address_number,neighborhood,postal_code,phone,whatsapp,business_hours)")
    .eq("user_id", user.id).order("created_at");
  const memberships = (data ?? []) as unknown as PanelMembership[];
  const ids = memberships.map((membership) => membership.restaurant_id);
  const [{ data: categories }, { data: products }] = ids.length ? await Promise.all([
    supabase.from("categories").select("id,restaurant_id,name,description,sort_order,is_active").in("restaurant_id", ids).order("sort_order"),
    supabase.from("products").select("id,restaurant_id,category_id,name,description,price_cents,is_available").in("restaurant_id", ids).order("created_at", { ascending: false }),
  ]) : [{ data: [] }, { data: [] }];
  return { user, memberships, categories: categories ?? [], products: products ?? [] };
}
