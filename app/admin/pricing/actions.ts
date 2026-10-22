"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  PRICING_SETTINGS_KEY,
  canManagePricing,
  loadPricingSettings,
  toCostRecipe,
} from "@/lib/admin/pricing";
import {
  defaultPricingSettings,
  makingCost,
  type PricingSettings,
} from "@/lib/commerce/cost-pricing";

const value = (formData: FormData, key: string) =>
  String(formData.get(key) || "").trim();

const amount = (formData: FormData, key: string) => {
  const input = value(formData, key);
  if (!input) return 0;
  const parsed = Number(input);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : Number.NaN;
};

const fail = (path: string, message: string): never =>
  redirect(`${path}?error=${encodeURIComponent(message)}`);

export async function savePricingSettings(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  if (!canManagePricing(profile.role))
    fail(
      "/admin/pricing",
      "Only owners and commerce managers can change pricing.",
    );

  const settings = { ...defaultPricingSettings };
  for (const key of Object.keys(settings) as (keyof PricingSettings)[]) {
    if (key === "stand_bought_on") continue;
    const parsed = amount(formData, key);
    if (Number.isNaN(parsed))
      fail("/admin/pricing", "Every amount must be a number of zero or more.");
    (settings as Record<string, unknown>)[key] = parsed;
  }
  const standDate = value(formData, "stand_bought_on");
  settings.stand_bought_on = /^\d{4}-\d{2}-\d{2}$/.test(standDate)
    ? standDate
    : null;

  if (settings.string_roll_yield <= 0 || settings.stand_payback_units <= 0)
    fail(
      "/admin/pricing",
      "Bracelets per string roll and stand payback sales must be more than zero.",
    );
  if (settings.target_profit_pct >= 100)
    fail("/admin/pricing", "Target profit must be below 100%.");
  if (settings.better_products_pct + settings.reserves_pct > 100)
    fail(
      "/admin/pricing",
      "Better products and reserves together cannot be more than 100% of profit.",
    );

  const previous = await loadPricingSettings(admin);
  const { error } = await admin.from("site_settings").upsert({
    key: PRICING_SETTINGS_KEY,
    value: settings,
    updated_at: new Date().toISOString(),
  });
  if (error) fail("/admin/pricing", "We could not save the pricing settings.");
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "pricing_settings",
    action: "updated_pricing_settings",
    before_value: previous,
    after_value: settings,
  });
  revalidatePath("/admin/pricing", "layout");
  redirect("/admin/pricing?saved=settings");
}

export async function saveCostRecipe(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  const productId = value(formData, "product_id");
  const path = `/admin/pricing/${productId}`;
  if (!productId) redirect("/admin/pricing");
  if (!canManagePricing(profile.role))
    fail(path, "Only owners and commerce managers can change pricing.");

  const recipe = toCostRecipe({
    material_cost: amount(formData, "material_cost"),
    material_yield: amount(formData, "material_yield"),
    charm_cost: amount(formData, "charm_cost"),
    charm_count: amount(formData, "charm_count"),
    extra_cost: amount(formData, "extra_cost"),
    packaging: value(formData, "packaging"),
    labour_kes: amount(formData, "labour_kes"),
  });
  const rawYield = Number(value(formData, "material_yield"));
  if (
    [
      "material_cost",
      "charm_cost",
      "charm_count",
      "extra_cost",
      "labour_kes",
    ].some((key) => Number.isNaN(amount(formData, key))) ||
    !Number.isFinite(rawYield) ||
    rawYield <= 0
  )
    fail(
      path,
      "Use numbers of zero or more, and at least one bracelet per pack or strand.",
    );
  recipe.material_yield = rawYield;
  recipe.charm_count = Math.round(recipe.charm_count);

  const { error } = await admin.from("product_cost_recipes").upsert({
    product_id: productId,
    ...recipe,
    notes: value(formData, "notes") || null,
    updated_by: user.id,
    updated_at: new Date().toISOString(),
  });
  if (error) fail(path, "We could not save this cost recipe.");

  // Keep the product's own cost field in step so other reports can read it.
  const settings = await loadPricingSettings(admin);
  const cost = Math.round(makingCost(recipe, settings).total * 100) / 100;
  await admin.from("products").update({ cost_price: cost }).eq("id", productId);
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "product",
    entity_id: productId,
    action: "updated_cost_recipe",
    after_value: { ...recipe, cost_price: cost },
  });
  revalidatePath("/admin/pricing");
  revalidatePath(path);
  redirect(`${path}?saved=recipe`);
}

export async function applyStorePrice(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  const productId = value(formData, "product_id");
  const path = `/admin/pricing/${productId}`;
  if (!productId) redirect("/admin/pricing");
  if (!canManagePricing(profile.role))
    fail(path, "Only owners and commerce managers can change prices.");
  const priceKes = Number(value(formData, "price_kes"));
  if (!Number.isFinite(priceKes) || priceKes <= 0)
    fail(path, "Enter a store price above zero.");

  const { data: previous } = await admin
    .from("products")
    .select("price,price_kes,slug")
    .eq("id", productId)
    .maybeSingle();
  if (!previous) redirect("/admin/pricing");
  const { error } = await admin
    .from("products")
    .update({ price: priceKes, price_kes: priceKes })
    .eq("id", productId);
  if (error) fail(path, "We could not update the store price.");
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "product",
    entity_id: productId,
    action: "applied_pricing_price",
    before_value: { price: previous.price, price_kes: previous.price_kes },
    after_value: { price: priceKes, price_kes: priceKes },
  });
  revalidatePath("/");
  revalidatePath("/bracelets");
  revalidatePath("/shop");
  revalidatePath(`/product/${previous.slug}`);
  revalidatePath("/admin/products");
  revalidatePath("/admin/pricing");
  revalidatePath(path);
  redirect(`${path}?saved=price`);
}
