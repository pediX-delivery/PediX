"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const dayKeys = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;

function field(formData: FormData, name: string, max: number) {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

async function authorizedRestaurant(restaurantId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: membership } = await supabase
    .from("restaurant_members")
    .select("role")
    .eq("restaurant_id", restaurantId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership || !["owner", "admin", "manager"].includes(membership.role)) {
    redirect("/painel/dados?error=permission");
  }
  return supabase;
}

function finish(ok: boolean, error = "save", path = "/painel"): never {
  revalidatePath("/painel");
  revalidatePath(path);
  redirect(ok ? `${path}?catalog=saved` : `${path}?catalog_error=${error}`);
}

export async function updateRestaurant(formData: FormData) {
  const restaurantId = field(formData, "restaurant_id", 64);
  if (!restaurantId) redirect("/painel/dados");
  const supabase = await authorizedRestaurant(restaurantId);

  const name = field(formData, "name", 120);
  const description = field(formData, "description", 600);
  const phone = field(formData, "phone", 30);
  const whatsapp = field(formData, "whatsapp", 30);
  const addressStreet = field(formData, "address_street", 160);
  const addressNumber = field(formData, "address_number", 30);
  const neighborhood = field(formData, "neighborhood", 100);
  const postalCode = field(formData, "postal_code", 20);
  if (!name) redirect("/painel/dados?error=validation");

  const businessHours: Record<string, { open: string; close: string; closed: boolean }> = {};
  for (const day of dayKeys) {
    const open = field(formData, `${day}_open`, 5);
    const close = field(formData, `${day}_close`, 5);
    const closed = formData.get(`${day}_closed`) === "on";
    const validTime = (value: string) => /^([01]\d|2[0-3]):[0-5]\d$/.test(value);
    if (!closed && (!validTime(open) || !validTime(close))) redirect("/painel/dados?error=hours");
    businessHours[day] = { open: open || "00:00", close: close || "00:00", closed };
  }

  const { data, error } = await supabase.from("restaurants").update({
    name, description: description || null, phone: phone || null, whatsapp: whatsapp || null,
    address_street: addressStreet || null, address_number: addressNumber || null,
    neighborhood: neighborhood || null, postal_code: postalCode || null, business_hours: businessHours,
  }).eq("id", restaurantId).select("id").maybeSingle();
  if (error || !data) redirect("/painel/dados?error=save");
  revalidatePath("/painel");
  redirect("/painel/dados?saved=1");
}

export async function createCategory(formData: FormData) {
  const restaurantId = field(formData, "restaurant_id", 64);
  const name = field(formData, "category_name", 80);
  const description = field(formData, "category_description", 240);
  if (!restaurantId || !name) redirect("/painel/categorias?catalog_error=validation");
  const supabase = await authorizedRestaurant(restaurantId);
  const { error } = await supabase.from("categories").insert({
    restaurant_id: restaurantId, name, description: description || null,
  });
  if (error) finish(false, error.code === "23505" ? "duplicate" : "save", "/painel/categorias");
  finish(true, "save", "/painel/categorias");
}

export async function updateCategory(formData: FormData) {
  const restaurantId = field(formData, "restaurant_id", 64);
  const categoryId = field(formData, "category_id", 64);
  const name = field(formData, "category_name", 80);
  const description = field(formData, "category_description", 240);
  const isActive = formData.get("is_active") === "on";
  if (!restaurantId || !categoryId || !name) redirect("/painel/categorias?catalog_error=validation");
  const supabase = await authorizedRestaurant(restaurantId);
  const { data, error } = await supabase.from("categories")
    .update({ name, description: description || null, is_active: isActive })
    .eq("restaurant_id", restaurantId).eq("id", categoryId).select("id").maybeSingle();
  if (error || !data) finish(false, error?.code === "23505" ? "duplicate" : "save", "/painel/categorias");
  finish(true, "save", "/painel/produtos");
}

export async function createProduct(formData: FormData) {
  const restaurantId = field(formData, "restaurant_id", 64);
  const name = field(formData, "product_name", 120);
  const description = field(formData, "product_description", 500);
  const categoryId = field(formData, "category_id", 64);
  const rawPrice = field(formData, "price", 20).replace(",", ".");
  const price = Number(rawPrice);
  if (!restaurantId || !name || !rawPrice || !Number.isFinite(price) || price < 0 || price > 999999) {
    redirect("/painel/produtos?catalog_error=validation");
  }
  const supabase = await authorizedRestaurant(restaurantId);
  const { error } = await supabase.from("products").insert({
    restaurant_id: restaurantId, category_id: categoryId || null, name,
    description: description || null, price_cents: Math.round(price * 100),
  });
  if (error) finish(false, "save", "/painel/produtos");
  finish(true);
}

export async function updateProduct(formData: FormData) {
  const restaurantId = field(formData, "restaurant_id", 64);
  const productId = field(formData, "product_id", 64);
  const name = field(formData, "product_name", 120);
  const description = field(formData, "product_description", 500);
  const categoryId = field(formData, "category_id", 64);
  const rawPrice = field(formData, "price", 20).replace(",", ".");
  const price = Number(rawPrice);
  const isAvailable = formData.get("is_available") === "on";
  if (!restaurantId || !productId || !name || !rawPrice || !Number.isFinite(price) || price < 0 || price > 999999) {
    redirect("/painel?catalog_error=validation");
  }
  const supabase = await authorizedRestaurant(restaurantId);
  const { data, error } = await supabase.from("products").update({
    category_id: categoryId || null, name, description: description || null,
    price_cents: Math.round(price * 100), is_available: isAvailable,
  }).eq("restaurant_id", restaurantId).eq("id", productId).select("id").maybeSingle();
  if (error || !data) finish(false);
  finish(true);
}
