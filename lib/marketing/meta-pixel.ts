"use client";

import type { StoreCurrency } from "@/lib/commerce/money";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export type MetaContent = {
  id: string;
  quantity?: number;
  item_price?: number;
};

export function trackMetaEvent(
  event: string,
  parameters?: {
    value?: number;
    currency?: StoreCurrency;
    content_ids?: string[];
    contents?: MetaContent[];
  },
) {
  window.fbq?.("track", event, parameters);
}
