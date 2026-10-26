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

/** Google Consent Mode v2 state for a consent choice (none yet = denied). */
export function googleConsentState(consent: MarketingConsent | null) {
  const value = consent === "accepted" ? "granted" : "denied";
  return {
    analytics_storage: value,
    ad_storage: value,
    ad_user_data: value,
    ad_personalization: value,
  };
}
