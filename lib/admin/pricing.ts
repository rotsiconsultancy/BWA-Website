import type { SupabaseClient } from "@supabase/supabase-js";
import {
  emptyCostRecipe,
  mergePricingSettings,
  type CostRecipe,
  type PackagingChoice,
  type PricingSettings,
} from "@/lib/commerce/cost-pricing";

export const PRICING_SETTINGS_KEY = "pricing";

export const canManagePricing = (role: string) =>
  ["owner", "commerce_manager"].includes(role);

export async function loadPricingSettings(
  admin: SupabaseClient,
): Promise<PricingSettings> {
  const { data } = await admin
    .from("site_settings")
    .select("value")
    .eq("key", PRICING_SETTINGS_KEY)
    .maybeSingle();
  return mergePricingSettings(data?.value);
}

/** Bracelets sold since the stand was bought, so its charge can stop once paid back. */
export async function unitsSoldSince(
  admin: SupabaseClient,
  isoDate: string | null,
) {
  if (!isoDate) return 0;
  const { data } = await admin
    .from("order_items")
    .select("quantity,orders!inner(created_at,status)")
    .gte("orders.created_at", `${isoDate}T00:00:00+03:00`)
    .not("orders.status", "in", "(cancelled,refunded)");
  return (data || []).reduce(
    (total: number, item: any) => total + Number(item.quantity || 0),
    0,
  );
}

const packagingValues: PackagingChoice[] = [
  "none",
  "pouch",
  "box",
  "pouch_and_box",
];

export function toCostRecipe(row: any): CostRecipe {
  if (!row) return emptyCostRecipe;
  return {
    material_cost: Number(row.material_cost) || 0,
    material_yield: Number(row.material_yield) || 1,
    charm_cost: Number(row.charm_cost) || 0,
    charm_count: Number(row.charm_count) || 0,
    extra_cost: Number(row.extra_cost) || 0,
    packaging: packagingValues.includes(row.packaging)
      ? row.packaging
      : emptyCostRecipe.packaging,
    labour_kes: Number(row.labour_kes) || 0,
  };
}
