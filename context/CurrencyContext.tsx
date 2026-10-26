"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { StoreCurrency } from "@/lib/commerce/money";
import { formatMoney } from "@/lib/commerce/money";

const STORAGE_KEY = "bwa_store_currency";
const MANUAL_KEY = "bwa_store_currency_manual";
const COUNTRY_KEY = "bwa_country";
type Detected = { currency: StoreCurrency; country: string };

type CurrencyContextValue = {
  currency: StoreCurrency;
  setCurrency: (currency: StoreCurrency) => void;
  format: (amount: number) => string;
  /** ISO 3166-1 alpha-2 country code from the edge header, e.g. "KE", "US", "CA" */
  detectedCountry: string | null;
  /** Whether the current currency was explicitly selected by the user */
  isManual: boolean;
};

const CurrencyContext = createContext<CurrencyContextValue | undefined>(
  undefined,
);

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match ? match[2] : null;
}

function toDetected(code: string): Detected | null {
  const country = code.trim().toUpperCase();
  if (!country) return null;
  return { currency: country === "KE" ? "KES" : "USD", country };
}

/** Fallback only when the host sends no country header (e.g. local dev). */
async function detectViaIpWho(): Promise<Detected | null> {
  try {
    const res = await fetch("https://ipwho.is/?fields=success,country_code", {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.success === false) return null;
    return toDetected(data.country_code ?? "");
  } catch {
    return null;
  }
}

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<StoreCurrency>("KES");
  const [detectedCountry, setDetectedCountry] = useState<string | null>(null);
  const [isManual, setIsManual] = useState<boolean>(false);

  useEffect(() => {
    // 1. An explicit manual choice always wins.
    const isManualSelection = localStorage.getItem(MANUAL_KEY) === "true";
    const savedLocal = localStorage.getItem(STORAGE_KEY);
    const manual =
      isManualSelection && (savedLocal === "KES" || savedLocal === "USD")
        ? savedLocal
        : null;
    if (manual) {
      setIsManual(true);
      setCurrencyState(manual);
    }

    // 2. Country set by proxy.ts from the hosting edge's geolocation header.
    const edge = toDetected(getCookie(COUNTRY_KEY) ?? "");
    if (edge) {
      setDetectedCountry(edge.country);
      if (!manual) setCurrencyState(edge.currency);
      return;
    }

    // 3. No edge header: one external lookup, then the browser timezone.
    detectViaIpWho().then((result) => {
      if (result) {
        setDetectedCountry(result.country);
        if (!manual) setCurrencyState(result.currency);
        return;
      }
      if (manual) return;
      try {
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
        setCurrencyState(tz.includes("Nairobi") ? "KES" : "USD");
      } catch {
        setCurrencyState("KES");
      }
    });
  }, []);

  const value = useMemo(
    () => ({
      currency,
      detectedCountry,
      isManual,
      setCurrency: (next: StoreCurrency) => {
        setIsManual(true);
        setCurrencyState(next);
        localStorage.setItem(STORAGE_KEY, next);
        localStorage.setItem(MANUAL_KEY, "true");
        document.cookie = `${STORAGE_KEY}=${next}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax`;
      },
      format: (amount: number) => formatMoney(amount, currency),
    }),
    [currency, detectedCountry, isManual],
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
