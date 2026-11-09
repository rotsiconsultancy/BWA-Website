// QR links & welcome codes: the packaging card's QR opens /welcome/<slug>.
// Each slug is one printed link (a channel or print run) so scans,
// registrations and later orders can be counted per link. Registering gives a
// one-time welcome code tied to the customer's phone number; one per number.

import { normaliseKenyanPhone } from "./checkout-pricing";
import { SITE_URL } from "./seo";

export const QR_CHANNELS = [
  { id: "online", label: "Online orders" },
  { id: "mancave", label: "ManCave" },
  { id: "stockist", label: "Other shop" },
  { id: "event", label: "Event or pop-up" },
  { id: "other", label: "Other" },
] as const;
export type QrChannel = (typeof QR_CHANNELS)[number]["id"];

export const qrChannelLabel = (id: string) =>
  QR_CHANNELS.find((c) => c.id === id)?.label ?? id;

export const isQrChannel = (value: unknown): value is QrChannel =>
  QR_CHANNELS.some((c) => c.id === value);

/** Defaults for a new link (owner, 2026-11-09): 10% off, valid 60 days. */
export const QR_DEFAULTS = { rewardPercent: 10, validDays: 60 } as const;

export const QR_SLUG = /^[a-z0-9][a-z0-9-]{2,47}$/;
export const VISITOR_ID = /^[A-Za-z0-9_-]{8,64}$/;

/** The public address a QR code points to. */
export const welcomeUrl = (slug: string) => `${SITE_URL}/welcome/${slug}`;

// No 0/O, 1/I/L: codes get read out and typed on phones.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
const SLUG_ALPHABET = "23456789abcdefghjkmnpqrstuvwxyz";

const randomFrom = (alphabet: string, length: number) =>
  Array.from(
    crypto.getRandomValues(new Uint8Array(length)),
    (b) => alphabet[b % alphabet.length],
  ).join("");

/** e.g. "mancave-7k2p": the channel, then 4 random characters. */
export const newQrSlug = (channel: QrChannel) =>
  `${channel}-${randomFrom(SLUG_ALPHABET, 4)}`;

export const newWelcomeCode = () => `WELCOME-${randomFrom(CODE_ALPHABET, 6)}`;

/** Stored with every yes, so we know exactly what the customer agreed to. */
export const CONSENT_TEXT =
  "Tell me first about new offers, collections, discounts. You can unsubscribe any time.";

export const BWA_WHATSAPP = "254745474586";

export type QrRegistration = {
  slug: string;
  firstName: string;
  phone: string;
  productId: string | null;
  consent: boolean;
  visitorId: string | null;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export type ParseResult =
  { ok: true; value: QrRegistration } | { ok: false; error: string };

/** Validate the welcome form. Returns a message the customer can act on. */
export function parseQrRegistration(body: any): ParseResult {
  const slug = String(body?.slug ?? "");
  if (!QR_SLUG.test(slug))
    return { ok: false, error: "This link isn't valid." };
  const firstName = String(body?.firstName ?? "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 60);
  if (!firstName) return { ok: false, error: "Add your first name." };
  const phone = normaliseKenyanPhone(body?.phone);
  if (!/^254[17]\d{8}$/.test(phone))
    return {
      ok: false,
      error: "Enter a Kenyan WhatsApp number, e.g. 0712 345 678.",
    };
  const productId = UUID.test(String(body?.productId ?? ""))
    ? String(body.productId)
    : null;
  const visitorId = VISITOR_ID.test(String(body?.visitorId ?? ""))
    ? String(body.visitorId)
    : null;
  return {
    ok: true,
    value: {
      slug,
      firstName,
      phone,
      productId,
      consent: body?.consent === true,
      visitorId,
    },
  };
}

/** "9 Jan 2027", in Nairobi time. */
export const formatQrDate = (iso: string | null) =>
  iso
    ? new Intl.DateTimeFormat("en-KE", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Africa/Nairobi",
      }).format(new Date(iso))
    : "";

/** Count rows per Nairobi day for the last `days` days, oldest first. */
export function scansPerDay(
  scannedAt: string[],
  days: number,
  now = new Date(),
): { day: string; count: number }[] {
  const key = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(d);
  const counts = new Map<string, number>();
  for (const iso of scannedAt) {
    const k = key(new Date(iso));
    counts.set(k, (counts.get(k) ?? 0) + 1);
  }
  return Array.from({ length: days }, (_, i) => {
    const d = new Date(now.getTime() - (days - 1 - i) * 86_400_000);
    const k = key(d);
    return { day: k, count: counts.get(k) ?? 0 };
  });
}

export const qrKes = (n: number) =>
  `KES ${Math.round(Number(n) || 0).toLocaleString("en-KE")}`;

/** "42%", or "–" when there is nothing to divide by. */
export const qrPercent = (part: number, whole: number) =>
  whole > 0 ? `${Math.round((part / whole) * 100)}%` : "–";
