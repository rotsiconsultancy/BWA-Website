"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { trackGa4Event } from "@/lib/marketing/ga4";

// A link that sends one GA4 event when clicked, for server-rendered pages.
// External links (WhatsApp, email) open without next/link.
export default function TrackedLink({
  href,
  event,
  params,
  className,
  children,
}: {
  href: string;
  event: string;
  params: Record<string, string>;
  className?: string;
  children: ReactNode;
}) {
  const track = () => trackGa4Event(event, params);
  if (href.startsWith("/"))
    return (
      <Link href={href} className={className} onClick={track}>
        {children}
      </Link>
    );
  const newTab = href.startsWith("http");
  return (
    <a
      href={href}
      className={className}
      onClick={track}
      target={newTab ? "_blank" : undefined}
      rel={newTab ? "noopener noreferrer" : undefined}
    >
      {children}
    </a>
  );
}
