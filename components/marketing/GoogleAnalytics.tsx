"use client";

import Script from "next/script";
import { useEffect } from "react";
import { ensureGtag, GA4_MEASUREMENT_ID } from "@/lib/marketing/ga4";

export default function GoogleAnalytics() {
  useEffect(ensureGtag, []);
  return (
    <Script
      src={`https://www.googletagmanager.com/gtag/js?id=${GA4_MEASUREMENT_ID}`}
      strategy="afterInteractive"
    />
  );
}
