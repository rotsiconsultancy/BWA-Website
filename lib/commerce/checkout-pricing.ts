import type { SupabaseClient } from "@supabase/supabase-js";
import type { StoreCurrency } from "./money";

export type CheckoutLineInput = {
  variantId: string;
  quantity: number;
  image?: string;
};

export type CheckoutItemSnapshot = {
  product_id: string;
  variant_id: string;
  product_title_snapshot: string;
  variant_title_snapshot: string;
  image_snapshot: string;
  sku_snapshot: string;
  unit_price: number;
  quantity: number;
  line_total: number;
};

export type DiscountCampaign = {
  id: string;
  code: string;
  discount_type: "percentage" | "fixed";
  percentage_basis_points: number | null;
  fixed_amount_kes: number | null;
  fixed_amount_usd: number | null;
  minimum_subtotal_kes: number | null;
  minimum_subtotal_usd: number | null;
  max_redemptions: number | null;
  starts_at: string | null;
  ends_at: string | null;
  active: boolean;
};

export type DiscountQuote = {
  valid: boolean;
  code?: string;
  discountAmount: number;
  discountedSubtotal: number;
  error?: string;
};

const customerSafeDiscountError = "This discount code is not available.";

const scaleFor = (currency: StoreCurrency) => (currency === "USD" ? 100 : 1);

const toMinor = (amount: unknown, currency: StoreCurrency) =>
  Math.round(Number(amount) * scaleFor(currency));

const fromMinor = (amount: number, currency: StoreCurrency) =>
  amount / scaleFor(currency);

export const normaliseDiscountCode = (value: unknown) =>
  String(value || "")
    .trim()
    .toUpperCase();

export const isDiscountCodeShapeValid = (value: string) =>
  /^[A-Z0-9][A-Z0-9_-]{1,31}$/.test(value);

export const quoteCampaignDiscount = (
  campaign: DiscountCampaign | null,
  activeRedemptions: number,
  subtotal: number,
  currency: StoreCurrency,
  now = new Date(),
): DiscountQuote => {
  if (!campaign || !campaign.active)
    return {
      valid: false,
      discountAmount: 0,
      discountedSubtotal: subtotal,
      error: customerSafeDiscountError,
    };
  const startsAt = campaign.starts_at ? new Date(campaign.starts_at) : null;
  const endsAt = campaign.ends_at ? new Date(campaign.ends_at) : null;
  const minimum =
    currency === "USD"
      ? campaign.minimum_subtotal_usd
      : campaign.minimum_subtotal_kes;
  if (
    (startsAt && startsAt > now) ||
    (endsAt && endsAt <= now) ||
    (campaign.max_redemptions !== null &&
      activeRedemptions >= campaign.max_redemptions) ||
    (minimum !== null && subtotal < Number(minimum))
  )
    return {
      valid: false,
      discountAmount: 0,
      discountedSubtotal: subtotal,
      error: customerSafeDiscountError,
    };

  const subtotalMinor = toMinor(subtotal, currency);
  const discountMinor =
    campaign.discount_type === "percentage"
      ? Math.floor(
          (subtotalMinor * Number(campaign.percentage_basis_points) + 5000) /
            10000,
        )
      : Math.min(
          subtotalMinor,
          toMinor(
            currency === "USD"
              ? campaign.fixed_amount_usd
              : campaign.fixed_amount_kes,
            currency,
          ),
        );
  const discountAmount = fromMinor(discountMinor, currency);
  return {
    valid: true,
    code: campaign.code,
    discountAmount,
    discountedSubtotal: fromMinor(subtotalMinor - discountMinor, currency),
  };
};

export async function calculateCheckout(
  supabase: SupabaseClient,
  currency: StoreCurrency,
  rawLines: unknown,
): Promise<
  | { ok: true; subtotal: number; items: CheckoutItemSnapshot[] }
  | { ok: false; error: string }
> {
  if (!Array.isArray(rawLines) || !rawLines.length)
    return { ok: false, error: "Add at least one bracelet to your bag." };

  const quantities = new Map<string, { quantity: number; image: string }>();
  for (const input of rawLines as CheckoutLineInput[]) {
    const variantId = String(input?.variantId || "");
    const quantity = Number(input?.quantity);
    if (!variantId || !Number.isInteger(quantity) || quantity < 1)
      return { ok: false, error: "One of your bag quantities is invalid." };
    const previous = quantities.get(variantId);
    quantities.set(variantId, {
      quantity: (previous?.quantity || 0) + quantity,
      image: String(input?.image || previous?.image || ""),
    });
  }

  const variantIds = [...quantities.keys()];
  const { data: variants, error } = await supabase
    .from("product_variants")
    .select(
      "id,title,sku,stock_quantity,reserved_quantity,price_adjustment,price_adjustment_kes,price_adjustment_usd,product_id,products!inner(id,title,price,price_kes,price_usd,active)",
    )
    .in("id", variantIds)
    .eq("active", true);
  if (error || !variants || variants.length !== variantIds.length)
    return {
      ok: false,
      error: "One or more selected sizes are no longer available.",
    };

  let subtotalMinor = 0;
  const items: CheckoutItemSnapshot[] = [];
  for (const variant of variants as any[]) {
    const line = quantities.get(variant.id);
    const product = variant.products;
    if (
      !line ||
      !product?.active ||
      Number(variant.stock_quantity) - Number(variant.reserved_quantity) <
        line.quantity
    )
      return {
        ok: false,
        error: "A selected bracelet is no longer available in that quantity.",
      };
    const productPrice =
      currency === "USD"
        ? product.price_usd
        : (product.price_kes ?? product.price);
    const adjustment =
      currency === "USD"
        ? variant.price_adjustment_usd
        : (variant.price_adjustment_kes ?? variant.price_adjustment);
    if (
      productPrice === null ||
      adjustment === null ||
      productPrice === undefined ||
      adjustment === undefined
    )
      return {
        ok: false,
        error: `This bracelet does not yet have a ${currency} price.`,
      };
    const unitPriceMinor =
      toMinor(productPrice, currency) + toMinor(adjustment, currency);
    const lineTotalMinor = unitPriceMinor * line.quantity;
    subtotalMinor += lineTotalMinor;
    items.push({
      product_id: product.id,
      variant_id: variant.id,
      product_title_snapshot: product.title,
      variant_title_snapshot: variant.title,
      image_snapshot: line.image,
      sku_snapshot: variant.sku,
      unit_price: fromMinor(unitPriceMinor, currency),
      quantity: line.quantity,
      line_total: fromMinor(lineTotalMinor, currency),
    });
  }
  return { ok: true, subtotal: fromMinor(subtotalMinor, currency), items };
}

export async function loadDiscountQuote(
  supabase: SupabaseClient,
  codeInput: unknown,
  subtotal: number,
  currency: StoreCurrency,
): Promise<DiscountQuote> {
  const code = normaliseDiscountCode(codeInput);
  if (!isDiscountCodeShapeValid(code))
    return {
      valid: false,
      discountAmount: 0,
      discountedSubtotal: subtotal,
      error: customerSafeDiscountError,
    };
  const { data: campaign } = await supabase
    .from("discount_codes")
    .select(
      "id,code,discount_type,percentage_basis_points,fixed_amount_kes,fixed_amount_usd,minimum_subtotal_kes,minimum_subtotal_usd,max_redemptions,starts_at,ends_at,active",
    )
    .eq("code", code)
    .maybeSingle();
  if (!campaign)
    return {
      valid: false,
      discountAmount: 0,
      discountedSubtotal: subtotal,
      error: customerSafeDiscountError,
    };
  const { count } = await supabase
    .from("discount_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("discount_code_id", campaign.id)
    .is("released_at", null);
  return quoteCampaignDiscount(
    campaign as DiscountCampaign,
    count || 0,
    subtotal,
    currency,
  );
}
