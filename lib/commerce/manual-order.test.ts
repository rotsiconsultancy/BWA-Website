import { describe, expect, it } from "vitest";
import {
  manualOrderTotals,
  nairobiInputToIso,
  normaliseAnyPhone,
  parseManualOrder,
} from "./manual-order";

const form = (over: Record<string, string> = {}) => {
  const values: Record<string, string> = {
    first_name: "Wanjiru",
    phone: "0712 345 678",
    channel: "instagram",
    ordered_at: "2026-11-01T14:30",
    currency: "KES",
    lines: JSON.stringify([
      { variantId: "v1", title: "Simba Gold", quantity: 2, unitPrice: 1500 },
      { variantId: "v2", title: "Chyulu Black", quantity: 3, unitPrice: 1200 },
      { variantId: null, title: "Custom pair", quantity: 1, unitPrice: 2000 },
    ]),
    delivery_fee: "300",
    discount: "200",
    status: "delivered",
    payment_status: "paid",
    ...over,
  };
  return (name: string) => values[name] ?? "";
};
const now = new Date("2026-11-09T09:00:00Z");

describe("manual orders", () => {
  it("accepts several bracelets with different quantities, backdated", () => {
    const result = parseManualOrder(form(), now);
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(result.order.lines.map((l) => l.quantity)).toEqual([2, 3, 1]);
    expect(result.order.customer.phone).toBe("254712345678");
    expect(result.order.orderedAt).toBe("2026-11-01T11:30:00.000Z");
    expect(manualOrderTotals(result.order)).toEqual({
      subtotal: 8600,
      total: 8700,
    });
  });

  it("refuses a future date, an empty order and a discount above the subtotal", () => {
    expect(
      parseManualOrder(form({ ordered_at: "2026-12-01T10:00" }), now).ok,
    ).toBe(false);
    expect(parseManualOrder(form({ lines: "[]" }), now).ok).toBe(false);
    expect(parseManualOrder(form({ discount: "9000" }), now).ok).toBe(false);
    expect(
      parseManualOrder(
        form({
          lines: JSON.stringify([{ title: "X", quantity: 0, unitPrice: 1 }]),
        }),
        now,
      ).ok,
    ).toBe(false);
  });

  it("normalises phones and Nairobi dates", () => {
    expect(normaliseAnyPhone("+254 712 345 678")).toBe("254712345678");
    expect(normaliseAnyPhone("712345678")).toBe("254712345678");
    expect(normaliseAnyPhone("+1 415 555 0100")).toBe("14155550100");
    expect(nairobiInputToIso("nope")).toBeNull();
  });
});
