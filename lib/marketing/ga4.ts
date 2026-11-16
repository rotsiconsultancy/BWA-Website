"use client";

import type { StoreCurrency } from "@/lib/commerce/money";
import type { CartLine, CommerceProduct } from "@/lib/commerce/types";
import {
  googleConsentState,
  readMarketingConsent,
} from "@/lib/marketing/consent";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

// GA4 recommended ecommerce item shape. item_id uses the variant id where one
// is known, matching the Google Merchant feed so Ads/Shopping reports join up.
export type Ga4Item = {
  item_id: string;
  item_name: string;
  item_brand: "Beads World Africa";
  item_category: string;
  item_category2?: string;
  item_variant?: string;
  item_list_name?: string;
  index?: number;
  price?: number;
  quantity?: number;
  coupon?: string;
};

export const GA4_MEASUREMENT_ID = "G-4HNRWEMRVY";

// Standard gtag bootstrap, run on first use so events fired by page effects
// before the GA component mounts still queue behind the config call.
// Consent Mode: granted by default; after "Turn off", GA sends cookieless
// pings only.
export function ensureGtag() {
  if (typeof window === "undefined" || window.gtag) return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag only reads queued Arguments objects, not plain arrays.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("consent", "default", googleConsentState(readMarketingConsent()));
  window.gtag("js", new Date());
  window.gtag("config", GA4_MEASUREMENT_ID);
}

export function updateGa4Consent(
  consent: Parameters<typeof googleConsentState>[0],
) {
  ensureGtag();
  window.gtag!("consent", "update", googleConsentState(consent));
}

export function trackGa4Event(event: string, parameters?: object) {
  if (typeof window === "undefined") return;
  ensureGtag();
  window.gtag!("event", event, parameters);
}

export function cartLineToGa4Item(
  line: CartLine,
  currency: StoreCurrency,
): Ga4Item {
  return {
    item_id: line.variantId,
    item_name: line.title,
    item_brand: "Beads World Africa",
    item_category: "Bracelets",
    item_category2: line.subtitle,
    item_variant: line.variantName,
    price: line.unitPrices[currency] ?? undefined,
    quantity: line.quantity,
  };
}

export function productToGa4Item(
  product: CommerceProduct,
  currency: StoreCurrency,
  extra: Partial<Ga4Item> = {},
): Ga4Item {
  return {
    item_id: product.id,
    item_name: product.title,
    item_brand: "Beads World Africa",
    item_category: product.category || "Bracelets",
    item_category2: product.subtitle,
    price: product.prices[currency] ?? undefined,
    quantity: 1,
    ...extra,
  };
}

export function cartValue(lines: CartLine[], currency: StoreCurrency) {
  return lines.reduce(
    (total, line) => total + (line.unitPrices[currency] ?? 0) * line.quantity,
    0,
  );
}
