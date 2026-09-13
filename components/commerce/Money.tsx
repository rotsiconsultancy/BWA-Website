"use client";

import type { Prices } from "@/lib/commerce/money";
import { useCurrency } from "@/context/CurrencyContext";

export default function Money({ prices }: { prices: Prices }) {
  const { currency, format } = useCurrency();
  const amount = prices[currency];
  return amount === null ? (
    <>Price unavailable in {currency}</>
  ) : (
    <>{format(amount)}</>
  );
}
