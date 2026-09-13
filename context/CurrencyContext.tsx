"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { StoreCurrency } from "@/lib/commerce/money";
import { formatMoney } from "@/lib/commerce/money";

const STORAGE_KEY = "bwa_store_currency";

type CurrencyContextValue = {
  currency: StoreCurrency;
  setCurrency: (currency: StoreCurrency) => void;
  format: (amount: number) => string;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrency] = useState<StoreCurrency>("KES");
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "KES" || saved === "USD") setCurrency(saved);
  }, []);
  const value = useMemo(
    () => ({
      currency,
      setCurrency: (next: StoreCurrency) => {
        setCurrency(next);
        localStorage.setItem(STORAGE_KEY, next);
      },
      format: (amount: number) => formatMoney(amount, currency),
    }),
    [currency],
  );
  return (
    <CurrencyContext.Provider value={value}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (!context)
    throw new Error("useCurrency must be used within CurrencyProvider");
  return context;
}
