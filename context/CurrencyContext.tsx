"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import type { StoreCurrency } from "@/lib/commerce/money";
import { formatMoney } from "@/lib/commerce/money";

const STORAGE_KEY = "bwa_store_currency";
const MANUAL_KEY = "bwa_store_currency_manual";
type Detected = { currency: StoreCurrency; country: string };

type CurrencyContextValue = {
  currency: StoreCurrency;
  setCurrency: (currency: StoreCurrency) => void;
  format: (amount: number) => string;
  /** ISO 3166-1 alpha-2 country code detected via ipapi, e.g. "KE", "US", "CA" */
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

/** Resolve currency & country from ipapi.co/json — returns null on network/parse error */
async function detectCurrencyViaIpApi(): Promise<{
  currency: StoreCurrency;
  country: string;
} | null> {
  try {
    const res = await fetch("https://ipapi.co/json/", {
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    const countryCode: string = (
      data.country_code ||
      data.country ||
      ""
    ).toUpperCase();
    if (!countryCode) return null;
    const currency: StoreCurrency = countryCode === "KE" ? "KES" : "USD";
    return { currency, country: countryCode };
  } catch {
    return null;
  }
}

/** Provider 2: ipwho.is — HTTPS, no key required */
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
    // 1. Only respect saved local currency if the user EXPLICITLY selected it manually
    const isManualSelection = localStorage.getItem(MANUAL_KEY) === "true";
    const savedLocal = localStorage.getItem(STORAGE_KEY);

    if (isManualSelection && (savedLocal === "KES" || savedLocal === "USD")) {
      setIsManual(true);
      setCurrencyState(savedLocal);
      detectCurrencyViaIpApi().then((result) => {
        if (result) setDetectedCountry(result.country);
      });
      return;
    }

    // 2. If not explicitly chosen manually by user, perform IP geolocation auto-detection
    detectCurrencyViaIpApi().then((result) => {
      if (result) {
        setCurrencyState(result.currency);
        setDetectedCountry(result.country);
      } else {
        // Fallback 1: check middleware cookie
        const cookieCurrency = getCookie(STORAGE_KEY);
        if (cookieCurrency === "KES" || cookieCurrency === "USD") {
          setCurrencyState(cookieCurrency);
        } else {
          // Fallback 2: browser timezone
          try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone || "";
            if (tz.includes("Nairobi") || tz.includes("Africa/Nairobi")) {
              setCurrencyState("KES");
            } else {
              setCurrencyState("USD");
            }
          } catch {
            setCurrencyState("KES");
          }
        }
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
