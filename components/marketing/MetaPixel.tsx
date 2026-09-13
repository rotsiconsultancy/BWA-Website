"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { trackMetaEvent } from "@/lib/marketing/meta-pixel";

const CONSENT_KEY = "bwa_marketing_consent";
const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

export default function MetaPixel() {
  const pathname = usePathname();
  const trackedPath = useRef<string | null>(null);
  const isAdmin = pathname.startsWith("/admin");
  const [consent, setConsent] = useState<"accepted" | "declined" | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem(CONSENT_KEY);
    if (saved === "accepted" || saved === "declined") setConsent(saved);
  }, []);
  useEffect(() => {
    if (
      isAdmin ||
      consent !== "accepted" ||
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
  }, [consent, isAdmin, pathname]);
  useEffect(() => {
    if (
      !isAdmin &&
      consent === "accepted" &&
      window.fbq &&
      trackedPath.current !== pathname
    ) {
      trackedPath.current = pathname;
      trackMetaEvent("PageView");
    }
  }, [pathname, consent, isAdmin]);

  if (isAdmin || !pixelId || consent) return null;
  const choose = (value: "accepted" | "declined") => {
    localStorage.setItem(CONSENT_KEY, value);
    setConsent(value);
  };
  return (
    <aside
      className="marketing-consent"
      role="dialog"
      aria-label="Marketing cookies"
    >
      <p>
        We use optional Meta marketing cookies to understand which BWA stories
        lead to visits and enquiries.
      </p>
      <div>
        <button type="button" onClick={() => choose("declined")}>
          Decline
        </button>
        <button type="button" onClick={() => choose("accepted")}>
          Accept
        </button>
      </div>
    </aside>
  );
}
