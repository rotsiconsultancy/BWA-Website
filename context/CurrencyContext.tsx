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

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function detectTimezoneCurrency(): StoreCurrency {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
    if (tz.includes("Nairobi") || tz.includes("Africa/Nairobi")) {
      return "KES";
    }
  } catch {
    // Fallback if browser Intl is unavailable
  }
  return "USD";
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<StoreCurrency>("KES");

  useEffect(() => {
    // 1. Explicit user preference saved in localStorage takes top priority
    const savedLocal = localStorage.getItem(STORAGE_KEY);
    if (savedLocal === "KES" || savedLocal === "USD") {
      setCurrencyState(savedLocal);
      return;
    }

    // 2. Middleware-injected geo cookie from edge location headers
    const cookieCurrency = getCookie(STORAGE_KEY);
    if (cookieCurrency === "KES" || cookieCurrency === "USD") {
      setCurrencyState(cookieCurrency);
      return;
    }

    // 3. Client browser timezone heuristic fallback
    const detected = detectTimezoneCurrency();
    setCurrencyState(detected);
  }, []);

  const value = useMemo(
    () => ({
      currency,
      setCurrency: (next: StoreCurrency) => {
        setCurrencyState(next);
        localStorage.setItem(STORAGE_KEY, next);
        document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
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
