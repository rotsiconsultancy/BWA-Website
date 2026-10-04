"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { StoreCurrency } from "@/lib/commerce/money";
import { formatMoney } from "@/lib/commerce/money";

const STORAGE_KEY = "bwa_store_currency";

type CurrencyContextValue = {
  currency: StoreCurrency;
  setCurrency: (currency: StoreCurrency) => void;
  format: (amount: number) => string;
  /** ISO 3166-1 alpha-2 country code detected via ipapi, e.g. "KE", "US" */
  detectedCountry: string | null;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

/** Resolve currency from ipapi.co/json — returns null on network/parse error */
async function detectCurrencyViaIpApi(): Promise<{
  currency: StoreCurrency;
  country: string;
} | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      // Use a short timeout — we don't want to block the UX
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const countryCode: string = data.country_code ?? "";
    const currency: StoreCurrency = countryCode === "KE" ? "KES" : "USD";
    return { currency, country: countryCode };
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<StoreCurrency>("KES");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);

  useEffect(() => {
    // 1. Explicit user preference saved in localStorage takes top priority
    const savedLocal = localStorage.getItem(STORAGE_KEY);
    if (savedLocal === "KES" || savedLocal === "USD") {
      setCurrencyState(savedLocal);
      // Still try to get country code for the flag display, but don't override currency
      detectCurrencyViaIpApi().then((result) => {
        if (result) setDetectedCountry(result.country);
      });
      return;
    }

    // 2. Middleware-injected geo cookie from edge location headers
    const cookieCurrency = getCookie(STORAGE_KEY);
    if (cookieCurrency === "KES" || cookieCurrency === "USD") {
      setCurrencyState(cookieCurrency);
      detectCurrencyViaIpApi().then((result) => {
        if (result) setDetectedCountry(result.country);
      });
      return;
    }

    // 3. ipapi.co geolocation — most reliable client-side detection
    detectCurrencyViaIpApi().then((result) => {
      if (result) {
        setCurrencyState(result.currency);
        setDetectedCountry(result.country);
      }
      // Fallback: if ipapi fails completely, stay on "KES" (our home market)
    });
  }, []);

  const value = useMemo(
    () => ({
      currency,
      detectedCountry,
      setCurrency: (next: StoreCurrency) => {
        setCurrencyState(next);
        localStorage.setItem(STORAGE_KEY, next);
        document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      },
      format: (amount: number) => formatMoney(amount, currency),
    }),
    [currency, detectedCountry],
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
