"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function field(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

export async function updateRestaurant(formData: FormData) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const restaurantId = field(formData, "restaurant_id", 64);
  if (!restaurantId) redirect("/painel");

  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("role")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!membership || !["owner", "admin", "manager"].includes(membership.role)) {
    redirect("/painel?error=permission");
  }

  const name = field(formData, "name", 120);
  const description = field(formData, "description", 600);
  const phone = field(formData, "phone", 30);
  const whatsapp = field(formData, "whatsapp", 30);
  const addressStreet = field(formData, "address_street", 160);
  const addressNumber = field(formData, "address_number", 30);
  const neighborhood = field(formData, "neighborhood", 100);
  const postalCode = field(formData, "postal_code", 20);

  if (!name) redirect("/painel?error=validation");

  const businessHours: Record<string, { open: string; close: string; closed: boolean }> = {};
  for (const day of dayKeys) {
    const open = field(formData, `${day}_open`, 5);
    const close = field(formData, `${day}_close`, 5);
    const closed = formData.get(`${day}_closed`) === "on";
    const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    if (!closed && (!validTime(open) || !validTime(close))) {
      redirect("/painel?error=hours");
    }
    businessHours[day] = { open: open || "00:00", close: close || "00:00", closed };
  }

  const { data, error } = await supabase
    .from("restaurants")
    .update({
      name,
      description: description || null,
      phone: phone || null,
      whatsapp: whatsapp || null,
      address_street: addressStreet || null,
      address_number: addressNumber || null,
      neighborhood: neighborhood || null,
      postal_code: postalCode || null,
      business_hours: businessHours,
    })
    .eq("id", restaurantId)
    .select("id")
    .maybeSingle();

  if (error || !data) redirect("/painel?error=save");

  revalidatePath("/painel");
  redirect("/painel?saved=1");
}
