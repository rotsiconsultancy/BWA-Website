"use client";

import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import {
  MANUAL_ORDER_CHANNELS,
  manualOrderTotals,
} from "@/lib/commerce/manual-order";

export type CatalogueOption = {
  variantId: string;
  label: string;
  priceKes: number;
  priceUsd: number | null;
};

type Line = {
  key: number;
  variantId: string; // "" = custom piece
  title: string;
  quantity: string;
  unitPrice: string;
};

const STATUS_CHOICES = [
  ["delivered", "Delivered"],
  ["dispatched", "Dispatched"],
  ["ready_for_dispatch", "Ready for dispatch"],
  ["hand_crafting", "Being made"],
  ["payment_confirmed", "Paid, not yet made"],
  ["order_received", "Order received"],
] as const;

export default function ManualOrderForm({
  action,
  catalogue,
  idempotencyKey,
  defaultDate,
}: {
  action: (formData: FormData) => void | Promise<void>;
  catalogue: CatalogueOption[];
  idempotencyKey: string;
  defaultDate: string;
}) {
  const [currency, setCurrency] = useState<"KES" | "USD">("KES");
  const [lines, setLines] = useState<Line[]>([
    { key: 1, variantId: "", title: "", quantity: "1", unitPrice: "" },
  ]);
  const [deliveryFee, setDeliveryFee] = useState("0");
  const [discount, setDiscount] = useState("0");
  const byId = useMemo(
    () => new Map(catalogue.map((c) => [c.variantId, c])),
    [catalogue],
  );

  const priceFor = (option: CatalogueOption | undefined, cur: string) =>
    option
      ? String(cur === "USD" ? (option.priceUsd ?? "") : option.priceKes)
      : "";

  const update = (key: number, patch: Partial<Line>) =>
    setLines((all) => all.map((l) => (l.key === key ? { ...l, ...patch } : l)));

  const pick = (key: number, variantId: string) => {
    const option = byId.get(variantId);
    update(key, {
      variantId,
      title: option?.label ?? "",
      unitPrice: priceFor(option, currency),
    });
  };

  const switchCurrency = (next: "KES" | "USD") => {
    setCurrency(next);
    // Re-price catalogue lines in the new currency.
    setLines((all) =>
      all.map((l) =>
        l.variantId
          ? { ...l, unitPrice: priceFor(byId.get(l.variantId), next) }
          : l,
      ),
    );
  };

  const parsedLines = lines
    .filter((l) => l.variantId || l.title.trim())
    .map((l) => ({
      variantId: l.variantId || null,
      title: l.variantId ? byId.get(l.variantId)?.label || "" : l.title.trim(),
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
    }));
  const { subtotal, total } = manualOrderTotals({
    lines: parsedLines.map((l) => ({
      ...l,
      quantity: Number.isFinite(l.quantity) ? l.quantity : 0,
      unitPrice: Number.isFinite(l.unitPrice) ? l.unitPrice : 0,
    })),
    deliveryFee: Number(deliveryFee) || 0,
    discount: Number(discount) || 0,
  });
  const fmt = (n: number) =>
    `${currency} ${n.toLocaleString("en-KE", { maximumFractionDigits: 2 })}`;
  const pieces = parsedLines.reduce(
    (sum, l) => sum + (Number.isInteger(l.quantity) ? l.quantity : 0),
    0,
  );

  return (
    <form action={action} className="admin-product-form admin-manual-order">
      <input type="hidden" name="idempotency_key" value={idempotencyKey} />
      <input type="hidden" name="lines" value={JSON.stringify(parsedLines)} />

      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <p className="admin-kicker">Customer</p>
            <h2>Who bought it?</h2>
          </div>
        </div>
        <div className="admin-form-grid">
          <label>
            First name
            <input name="first_name" required autoComplete="off" />
          </label>
          <label>
            Last name <small>optional</small>
            <input name="last_name" autoComplete="off" />
          </label>
          <label>
            Phone (WhatsApp)
            <input
              name="phone"
              required
              inputMode="tel"
              placeholder="0712 345 678"
              autoComplete="off"
            />
            <small>
              If this number already ordered, the order joins that customer.
            </small>
          </label>
          <label>
            Email <small>optional</small>
            <input name="email" type="email" autoComplete="off" />
          </label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <p className="admin-kicker">The sale</p>
            <h2>When and where?</h2>
          </div>
        </div>
        <div className="admin-form-grid">
          <label>
            Order date and time (Nairobi)
            <input
              name="ordered_at"
              type="datetime-local"
              required
              defaultValue={defaultDate}
              max={defaultDate}
            />
            <small>Backdate it to the day the customer ordered.</small>
          </label>
          <label>
            Ordered through
            <select name="channel" required defaultValue="whatsapp">
              {MANUAL_ORDER_CHANNELS.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Currency
            <select
              name="currency"
              value={currency}
              onChange={(e) => switchCurrency(e.target.value as "KES" | "USD")}
            >
              <option value="KES">KES</option>
              <option value="USD">USD</option>
            </select>
          </label>
        </div>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <p className="admin-kicker">Bracelets</p>
            <h2>What did they take?</h2>
          </div>
        </div>
        <div className="admin-manual-lines">
          {lines.map((line, index) => (
            <div className="admin-manual-line" key={line.key}>
              <label className="admin-manual-line-item">
                Bracelet {index + 1}
                <select
                  value={line.variantId}
                  onChange={(e) => pick(line.key, e.target.value)}
                >
                  <option value="">Custom piece (not in the catalogue)</option>
                  {catalogue.map((c) => (
                    <option key={c.variantId} value={c.variantId}>
                      {c.label}
                    </option>
                  ))}
                </select>
                {!line.variantId && (
                  <input
                    placeholder="Name it, e.g. Design Your Own, lava + tiger's eye"
                    value={line.title}
                    onChange={(e) =>
                      update(line.key, { title: e.target.value })
                    }
                  />
                )}
              </label>
              <label>
                Qty
                <input
                  type="number"
                  min="1"
                  max="999"
                  step="1"
                  value={line.quantity}
                  onChange={(e) =>
                    update(line.key, { quantity: e.target.value })
                  }
                />
              </label>
              <label>
                Price each ({currency})
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={line.unitPrice}
                  onChange={(e) =>
                    update(line.key, { unitPrice: e.target.value })
                  }
                />
              </label>
              <p className="admin-manual-line-total">
                {fmt(
                  (Number(line.quantity) || 0) * (Number(line.unitPrice) || 0),
                )}
              </p>
              <button
                type="button"
                className="admin-manual-remove"
                aria-label={`Remove bracelet ${index + 1}`}
                disabled={lines.length === 1}
                onClick={() =>
                  setLines((all) => all.filter((l) => l.key !== line.key))
                }
              >
                <Trash2 size={16} aria-hidden="true" />
              </button>
            </div>
          ))}
          <button
            type="button"
            className="admin-secondary-action"
            onClick={() =>
              setLines((all) => [
                ...all,
                {
                  key: Math.max(...all.map((l) => l.key)) + 1,
                  variantId: "",
                  title: "",
                  quantity: "1",
                  unitPrice: "",
                },
              ])
            }
          >
            <Plus size={16} aria-hidden="true" /> Add another bracelet
          </button>
        </div>
        <p>
          The price is filled in from the catalogue; change it if the customer
          paid something different.
        </p>
      </section>

      <section className="admin-form-section">
        <div className="admin-form-heading">
          <div>
            <p className="admin-kicker">Delivery and payment</p>
            <h2>How did it reach them?</h2>
          </div>
        </div>
        <div className="admin-form-grid">
          <label>
            Delivery
            <select name="delivery_method" defaultValue="standard">
              <option value="standard">Delivered</option>
              <option value="pickup">Picked up / handed over</option>
            </select>
          </label>
          <label>
            Town or area <small>optional</small>
            <input name="city" placeholder="Westlands" />
          </label>
          <label className="admin-form-wide">
            Address <small>optional</small>
            <input name="address" />
          </label>
          <label>
            Delivery fee paid ({currency})
            <input
              name="delivery_fee"
              type="number"
              min="0"
              step="0.01"
              value={deliveryFee}
              onChange={(e) => setDeliveryFee(e.target.value)}
            />
            <small>Leave 0 if the customer paid the rider directly.</small>
          </label>
          <label>
            Discount given ({currency})
            <input
              name="discount"
              type="number"
              min="0"
              step="0.01"
              value={discount}
              onChange={(e) => setDiscount(e.target.value)}
            />
          </label>
          <label>
            Order status
            <select name="status" defaultValue="delivered">
              {STATUS_CHOICES.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>
          <label>
            Payment
            <select name="payment_status" defaultValue="paid">
              <option value="paid">Paid</option>
              <option value="pending">Not paid yet</option>
            </select>
          </label>
          <label className="admin-form-wide">
            Note <small>optional</small>
            <textarea
              name="note"
              rows={2}
              maxLength={500}
              placeholder="M-Pesa code, who handled it, anything to remember"
            />
          </label>
        </div>
      </section>

      <div className="admin-form-actions">
        <div>
          <strong>
            {pieces} piece{pieces === 1 ? "" : "s"} · Total {fmt(total)}
          </strong>
          <span>
            Bracelets {fmt(subtotal)}
            {Number(discount) > 0 ? ` − discount ${fmt(Number(discount))}` : ""}
            {Number(deliveryFee) > 0
              ? ` + delivery ${fmt(Number(deliveryFee))}`
              : ""}
            . No email alert is sent and stock isn&apos;t changed.
          </span>
        </div>
        <button className="admin-primary-action" type="submit">
          Save order
        </button>
      </div>
    </form>
  );
}
