"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackMetaEvent } from "@/lib/marketing/meta-pixel";
import { updateGa4Consent } from "@/lib/marketing/ga4";
import {
  CONSENT_KEY,
  marketingAllowed,
  readMarketingConsent,
  type MarketingConsent,
} from "@/lib/marketing/consent";

const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);
  const isAdmin = pathname.startsWith("/admin");
  const [consent, setConsent] = useState<MarketingConsent | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    setConsent(readMarketingConsent());
    setChecked(true);
  }, []);
  // Opt-out: the Pixel loads unless the visitor has declined. Wait until the
  // saved choice is read, so a visitor who declined never loads it.
  const allowed = checked && marketingAllowed(consent);
  useEffect(() => {
    if (
      isAdmin ||
      !allowed ||
      !pixelId ||
      window.fbq ||
      window._fbq ||
      document.getElementById("bwa-meta-pixel")
    )
      return;
    const queue: unknown[][] = [];
    const fbq = ((...args: unknown[]) => {
      queue.push(args);
    }) as ((...args: unknown[]) => void) & {
      queue: unknown[][];
      loaded?: boolean;
      version?: string;
    };
    fbq.queue = queue;
    fbq.loaded = true;
    fbq.version = "2.0";
    window.fbq = fbq;
    const script = document.createElement("script");
    script.id = "bwa-meta-pixel";
    script.async = true;
    script.src = "https://connect.facebook.net/en_US/fbevents.js";
    document.head.appendChild(script);
    fbq("init", pixelId);
    trackedPath.current = pathname;
    trackMetaEvent("PageView");
  }, [allowed, isAdmin, pathname]);
  useEffect(() => {
    if (!isAdmin && allowed && window.fbq && trackedPath.current !== pathname) {
      trackedPath.current = pathname;
      trackMetaEvent("PageView");
    }
  }, [pathname, allowed, isAdmin]);

  // The notice shows until the visitor chooses; GA4 needs it too, so it shows
  // even when no Meta Pixel is configured.
  if (isAdmin || !checked || consent) return null;
  const choose = (value: MarketingConsent) => {
    try {
      localStorage.setItem(CONSENT_KEY, value);
    } catch {}
    setConsent(value);
    updateGa4Consent(value);
    // Already loaded this visit: tell Meta to stop (or resume) sending.
    window.fbq?.("consent", value === "declined" ? "revoke" : "grant");
  };
  return (
    <aside
      className="marketing-consent"
      role="dialog"
      aria-label="Marketing cookies"
    >
      <p>
        We use Google and Meta cookies to see which BWA stories lead to visits
        and orders, and to show BWA on Instagram and Facebook. You can turn them
        off.
      </p>
      <div>
        <button type="button" onClick={() => choose("declined")}>
          Turn off
        </button>
        <button type="button" onClick={() => choose("accepted")}>
          OK
        </button>
      </div>
    </aside>
  );
}
