// Manual orders (2026-11-09): orders the owner records in admin for sales that
// happened outside the website checkout (Instagram DM, WhatsApp, in person, a
// stockist...). They can be backdated to the day the sale happened.

export const MANUAL_ORDER_CHANNELS = [
  { id: "whatsapp", label: "WhatsApp" },
  { id: "instagram", label: "Instagram" },
  { id: "facebook", label: "Facebook" },
  { id: "tiktok", label: "TikTok" },
  { id: "in_person", label: "In person" },
  { id: "phone_call", label: "Phone call" },
  { id: "stockist", label: "Through a stockist" },
  { id: "corporate", label: "Corporate order" },
  { id: "other", label: "Other" },
] as const;

export const orderSourceLabel = (source?: string | null) =>
  source === "website" || !source
    ? "Website"
    : (MANUAL_ORDER_CHANNELS.find((c) => c.id === source)?.label ?? source);

export const ORDER_STATUSES = [
  "order_received",
  "payment_pending",
  "payment_confirmed",
  "hand_crafting",
  "quality_checked",
  "ready_for_dispatch",
  "dispatched",
  "delivered",
  "cancelled",
  "refunded",
] as const;
export const PAYMENT_STATUSES = [
  "pending",
  "paid",
  "failed",
  "refunded",
] as const;

export type ManualOrderLine = {
  variantId: string | null; // null = a custom piece not in the catalogue
  title: string;
  quantity: number;
  unitPrice: number;
};

export type ManualOrder = {
  customer: {
    firstName: string;
    lastName: string;
    phone: string;
    email: string;
  };
  channel: string;
  orderedAt: string; // ISO
  currency: "KES" | "USD";
  lines: ManualOrderLine[];
  deliveryMethod: "standard" | "pickup";
  address: string;
  city: string;
  deliveryFee: number;
  discount: number;
  status: (typeof ORDER_STATUSES)[number];
  paymentStatus: (typeof PAYMENT_STATUSES)[number];
  note: string;
};

/** Kenyan numbers become 2547…/2541…; other countries keep their digits. */
export function normaliseAnyPhone(value: string) {
  const digits = value.replace(/\D/g, "");
  if (/^0[17]\d{8}$/.test(digits)) return "254" + digits.slice(1);
  if (/^[17]\d{8}$/.test(digits)) return "254" + digits;
  return digits;
}

/** "2026-11-01T14:30" typed in Nairobi time → ISO. */
export function nairobiInputToIso(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(value)) return null;
  const date = new Date(`${value}:00+03:00`);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

const money = (value: unknown) => {
  const n = Number(value);
  return Number.isFinite(n) && n >= 0 ? Math.round(n * 100) / 100 : NaN;
};

export function manualOrderTotals(order: {
  lines: ManualOrderLine[];
  deliveryFee: number;
  discount: number;
}) {
  const subtotal =
    Math.round(
      order.lines.reduce((sum, l) => sum + l.unitPrice * l.quantity * 100, 0),
    ) / 100;
  return {
    subtotal,
    total:
      Math.round((subtotal - order.discount + order.deliveryFee) * 100) / 100,
  };
}

type Field = (name: string) => string;

/** Validate the admin form. Returns the order or a message for the owner. */
export function parseManualOrder(
  get: Field,
  now = new Date(),
): { ok: true; order: ManualOrder } | { ok: false; error: string } {
  const firstName = get("first_name").trim().slice(0, 60);
  if (!firstName) return { ok: false, error: "Add the customer's first name." };
  const phone = normaliseAnyPhone(get("phone"));
  if (!/^\d{9,15}$/.test(phone))
    return {
      ok: false,
      error: "Add the customer's phone number (e.g. 0712 345 678).",
    };
  const email = get("email").trim().toLowerCase().slice(0, 120);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return { ok: false, error: "That email address doesn't look right." };

  const channel = get("channel");
  if (!MANUAL_ORDER_CHANNELS.some((c) => c.id === channel))
    return { ok: false, error: "Choose where the customer ordered." };

  const orderedAt = nairobiInputToIso(get("ordered_at"));
  if (!orderedAt) return { ok: false, error: "Add the date of the order." };
  // A few minutes of slack for clocks; never a future date.
  if (new Date(orderedAt).getTime() > now.getTime() + 5 * 60_000)
    return { ok: false, error: "The order date can't be in the future." };

  const currency = get("currency") === "USD" ? "USD" : "KES";

  let rawLines: unknown;
  try {
    rawLines = JSON.parse(get("lines") || "[]");
  } catch {
    rawLines = [];
  }
  if (!Array.isArray(rawLines) || !rawLines.length)
    return { ok: false, error: "Add at least one bracelet." };
  if (rawLines.length > 50)
    return { ok: false, error: "That's too many lines for one order." };
  const lines: ManualOrderLine[] = [];
  for (const raw of rawLines as any[]) {
    const variantId = raw?.variantId ? String(raw.variantId) : null;
    const title = String(raw?.title ?? "")
      .trim()
      .slice(0, 120);
    const quantity = Number(raw?.quantity);
    const unitPrice = money(raw?.unitPrice);
    if (!title)
      return { ok: false, error: "Every line needs a bracelet or a name." };
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 999)
      return { ok: false, error: `Check the quantity for ${title}.` };
    if (Number.isNaN(unitPrice))
      return { ok: false, error: `Check the price for ${title}.` };
    lines.push({ variantId, title, quantity, unitPrice });
  }

  const deliveryFee = money(get("delivery_fee") || 0);
  const discount = money(get("discount") || 0);
  if (Number.isNaN(deliveryFee) || Number.isNaN(discount))
    return { ok: false, error: "Check the delivery fee and discount." };
  const { subtotal } = manualOrderTotals({ lines, deliveryFee, discount });
  if (discount > subtotal)
    return {
      ok: false,
      error: "The discount can't be more than the bracelets cost.",
    };

  const status = get("status") as ManualOrder["status"];
  const paymentStatus = get("payment_status") as ManualOrder["paymentStatus"];
  if (
    !ORDER_STATUSES.includes(status) ||
    !PAYMENT_STATUSES.includes(paymentStatus)
  )
    return { ok: false, error: "Choose the order and payment status." };

  return {
    ok: true,
    order: {
      customer: {
        firstName,
        lastName: get("last_name").trim().slice(0, 60),
        phone,
        email,
      },
      channel,
      orderedAt,
      currency,
      lines,
      deliveryMethod:
        get("delivery_method") === "pickup" ? "pickup" : "standard",
      address: get("address").trim().slice(0, 300),
      city: get("city").trim().slice(0, 80),
      deliveryFee,
      discount,
      status,
      paymentStatus,
      note: get("note").trim().slice(0, 500),
    },
  };
}
