// BWA cost-plus pricing. All amounts are KES; percentages are whole numbers
// (35 means 35%). Kept free of Supabase so it can run in client calculators,
// server pages, and tests alike.

export type PackagingChoice = "none" | "pouch" | "box" | "pouch_and_box";

export const packagingOptions: { value: PackagingChoice; label: string }[] = [
  { value: "none", label: "No packaging" },
  { value: "pouch", label: "Branded pouch" },
  { value: "box", label: "Gift box" },
  { value: "pouch_and_box", label: "Pouch + gift box" },
];

export type PricingSettings = {
  string_roll_cost: number;
  string_roll_yield: number;
  pouch_cost: number;
  box_cost: number;
  wastage_pct: number;
  monthly_ads_kes: number;
  monthly_other_costs_kes: number;
  expected_monthly_sales_kes: number;
  stand_cost_kes: number;
  stand_payback_units: number;
  /** ISO date (YYYY-MM-DD). Sales from this date count towards stand payback. */
  stand_bought_on: string | null;
  consignment_commission_pct: number;
  target_profit_pct: number;
  better_products_pct: number;
  reserves_pct: number;
  round_to: number;
};

export const defaultPricingSettings: PricingSettings = {
  string_roll_cost: 300,
  string_roll_yield: 45,
  pouch_cost: 80,
  box_cost: 120,
  wastage_pct: 5,
  monthly_ads_kes: 3000,
  monthly_other_costs_kes: 0,
  expected_monthly_sales_kes: 30000,
  stand_cost_kes: 800,
  stand_payback_units: 100,
  stand_bought_on: null,
  consignment_commission_pct: 30,
  target_profit_pct: 35,
  better_products_pct: 30,
  reserves_pct: 20,
  round_to: 10,
};

export type CostRecipe = {
  /** What one bead pack or stone strand cost. */
  material_cost: number;
  /** How many bracelets that pack or strand makes. */
  material_yield: number;
  charm_cost: number;
  charm_count: number;
  /** Spacers, clasps or anything else used per bracelet. */
  extra_cost: number;
  packaging: PackagingChoice;
  /** Paid making cost per bracelet. Zero while the owner makes them. */
  labour_kes: number;
};

export const emptyCostRecipe: CostRecipe = {
  material_cost: 0,
  material_yield: 1,
  charm_cost: 0,
  charm_count: 0,
  extra_cost: 0,
  packaging: "pouch",
  labour_kes: 0,
};

export type SalesChannel = "direct" | "consignment";

export type PriceStatus = "loss" | "below_target" | "good";

const safeDivide = (amount: number, by: number) => (by > 0 ? amount / by : 0);

export const roundUpTo = (amount: number, step: number) =>
  step > 0 ? Math.ceil(amount / step - 1e-9) * step : Math.ceil(amount);

export function mergePricingSettings(value: unknown): PricingSettings {
  const stored = (value && typeof value === "object" ? value : {}) as Record<
    string,
    unknown
  >;
  const merged = { ...defaultPricingSettings };
  for (const key of Object.keys(merged) as (keyof PricingSettings)[]) {
    const raw = stored[key];
    if (key === "stand_bought_on") {
      merged.stand_bought_on = typeof raw === "string" && raw ? raw : null;
    } else if (typeof raw === "number" && Number.isFinite(raw)) {
      merged[key] = raw;
    }
  }
  return merged;
}

/** Ads and other monthly costs as a share of every KES sold (0–1). */
export const sharedCostRate = (settings: PricingSettings) =>
  safeDivide(
    settings.monthly_ads_kes + settings.monthly_other_costs_kes,
    settings.expected_monthly_sales_kes,
  );

export const standChargePerBracelet = (
  settings: PricingSettings,
  unitsSoldSinceStand: number,
) =>
  unitsSoldSinceStand >= settings.stand_payback_units
    ? 0
    : safeDivide(settings.stand_cost_kes, settings.stand_payback_units);

export function packagingCost(
  packaging: PackagingChoice,
  settings: PricingSettings,
) {
  if (packaging === "pouch") return settings.pouch_cost;
  if (packaging === "box") return settings.box_cost;
  if (packaging === "pouch_and_box")
    return settings.pouch_cost + settings.box_cost;
  return 0;
}

export function makingCost(recipe: CostRecipe, settings: PricingSettings) {
  const beads = safeDivide(recipe.material_cost, recipe.material_yield);
  const string = safeDivide(
    settings.string_roll_cost,
    settings.string_roll_yield,
  );
  const charms = recipe.charm_cost * recipe.charm_count;
  const materials = beads + string + charms + recipe.extra_cost;
  const wastage = materials * (settings.wastage_pct / 100);
  const packaging = packagingCost(recipe.packaging, settings);
  return {
    beads,
    string,
    charms,
    extra: recipe.extra_cost,
    wastage,
    packaging,
    labour: recipe.labour_kes,
    total: materials + wastage + packaging + recipe.labour_kes,
  };
}

export function priceGuide(
  recipe: CostRecipe,
  settings: PricingSettings,
  channel: SalesChannel,
  unitsSoldSinceStand = 0,
) {
  const making = makingCost(recipe, settings);
  const stand = standChargePerBracelet(settings, unitsSoldSinceStand);
  const fullCost = making.total + stand;
  const sharedRate = sharedCostRate(settings);
  const commissionRate =
    channel === "consignment" ? settings.consignment_commission_pct / 100 : 0;
  const keepRate = 1 - sharedRate - commissionRate;
  const targetRate = settings.target_profit_pct / 100;
  const priceable = keepRate > 0 && targetRate < 1;
  return {
    making,
    stand,
    fullCost,
    sharedRate,
    commissionRate,
    /** Lowest price that returns every cost with no profit. */
    breakEven: priceable ? Math.ceil(fullCost / keepRate - 1e-9) : null,
    /** Price that also leaves the target profit, rounded up for display. */
    goodPrice: priceable
      ? roundUpTo(fullCost / (keepRate * (1 - targetRate)), settings.round_to)
      : null,
  };
}

/** Where the money goes when a bracelet sells at `price`. */
export function checkPrice(
  price: number,
  recipe: CostRecipe,
  settings: PricingSettings,
  channel: SalesChannel,
  unitsSoldSinceStand = 0,
) {
  const guide = priceGuide(recipe, settings, channel, unitsSoldSinceStand);
  const shared = price * guide.sharedRate;
  const commission = price * guide.commissionRate;
  const reachesYou = price - shared - commission;
  const profit = reachesYou - guide.fullCost;
  const profitPct = reachesYou > 0 ? (profit / reachesYou) * 100 : 0;
  const status: PriceStatus =
    profit < 0
      ? "loss"
      : profitPct + 1e-9 < settings.target_profit_pct
        ? "below_target"
        : "good";
  const positive = Math.max(profit, 0);
  const betterProducts = positive * (settings.better_products_pct / 100);
  const reserves = positive * (settings.reserves_pct / 100);
  return {
    ...guide,
    price,
    shared,
    commission,
    reachesYou,
    profit,
    profitPct,
    status,
    split: {
      restock: guide.fullCost,
      betterProducts,
      reserves,
      ownerPay: positive - betterProducts - reserves,
    },
  };
}

export const priceStatusLabel: Record<PriceStatus, string> = {
  loss: "Too cheap",
  below_target: "OK",
  good: "Good price",
};

export const formatKes = (amount: number) =>
  `KES ${Math.round(amount).toLocaleString("en-KE")}`;
