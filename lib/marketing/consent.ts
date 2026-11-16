"use client";

/** One choice covers Meta Pixel and Google Analytics cookies. */
export const CONSENT_KEY = "bwa_marketing_consent";
export type MarketingConsent = "accepted" | "declined";

export function readMarketingConsent(): MarketingConsent | null {
  try {
    const saved = localStorage.getItem(CONSENT_KEY);
    return saved === "accepted" || saved === "declined" ? saved : null;
  } catch {
    return null;
  }
}

/**
 * Opt-out (owner, 2026-11-17): Meta Pixel and Google Analytics run until the
 * visitor declines. No choice yet counts as allowed.
 */
export function marketingAllowed(consent: MarketingConsent | null) {
  return consent !== "declined";
}

/** Google Consent Mode v2 state for a consent choice (none yet = granted). */
export function googleConsentState(consent: MarketingConsent | null) {
  const value = marketingAllowed(consent) ? "granted" : "denied";
  return {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  };
}
