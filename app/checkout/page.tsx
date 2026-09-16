"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { trackMetaEvent } from "@/lib/marketing/meta-pixel";
import { deliveryFeeFor } from "@/lib/commerce/money";

type Confirmation = {
  orderNumber: string;
  total: number;
  discountAmount: number;
  discountCode: string | null;
} | null;

type AppliedDiscount = {
  code: string;
  discountAmount: number;
  discountedSubtotal: number;
};

export default function CheckoutPage() {
  const {
    items,
    subtotal,
    clearCart,
    discoverySessionToken,
    setDiscoverySessionToken,
    hasUnavailableCurrencyPrice,
  } = useCart();
  const { currency, format } = useCurrency();
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "pickup">(
    "pickup",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
  const [discountCode, setDiscountCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] =
    useState<AppliedDiscount | null>(null);
  const [discountMessage, setDiscountMessage] = useState("");
  const [discountLoading, setDiscountLoading] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    county: "Nairobi",
    note: "",
    marketingOptIn: false,
  });
  const deliveryFee =
    deliveryMethod === "pickup" ? 0 : deliveryFeeFor(currency);
  const discountAmount = appliedDiscount?.discountAmount || 0;
  useEffect(() => {
    if (!items.length || hasUnavailableCurrencyPrice) return;
    trackMetaEvent("InitiateCheckout", {
      value: subtotal + deliveryFee,
      currency,
      content_ids: items.map((line) => line.variantId),
      contents: items.map((line) => ({
        id: line.variantId,
        quantity: line.quantity,
        item_price: line.unitPrices[currency] ?? 0,
      })),
    });
  }, [currency, deliveryFee, hasUnavailableCurrencyPrice, items, subtotal]);
  useEffect(() => {
    if (!appliedDiscount) return;
    setAppliedDiscount(null);
    setDiscountMessage("Your bag changed, so please apply your code again.");
  }, [currency, items]);
  if (!items.length && !confirmation)
    return (
      <main className="empty-state">
        <h1>Your bag is empty.</h1>
        <Link href="/bracelets" className="btn btn-primary">
          Return to collection
        </Link>
      </main>
    );
  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
  const applyDiscount = async () => {
    const code = discountCode.trim();
    if (!code) {
      setDiscountMessage("Enter a discount code first.");
      return;
    }
    if (hasUnavailableCurrencyPrice) {
      setDiscountMessage(
        `Your bag needs ${currency} prices before a code can be applied.`,
      );
      return;
    }
    setDiscountLoading(true);
    setDiscountMessage("");
    try {
      const response = await fetch("/api/discounts/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          currency,
          lines: items.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            image: line.image,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "We could not check that code.");
      if (!data.valid) {
        setAppliedDiscount(null);
        setDiscountMessage(
          data.error || "This discount code is not available.",
        );
        return;
      }
      setDiscountCode(data.code);
      setAppliedDiscount({
        code: data.code,
        discountAmount: Number(data.discountAmount),
        discountedSubtotal: Number(data.discountedSubtotal),
      });
      setDiscountMessage(`${data.code} applied to your order.`);
    } catch (reason) {
      setAppliedDiscount(null);
      setDiscountMessage(
        reason instanceof Error
          ? reason.message
          : "We could not check that code.",
      );
    } finally {
      setDiscountLoading(false);
    }
  };
  const removeDiscount = () => {
    setAppliedDiscount(null);
    setDiscountCode("");
    setDiscountMessage("Discount code removed.");
  };
  const order = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);
    setError("");
    const idempotencyKey = crypto.randomUUID();
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          customer: form,
          deliveryMethod,
          currency,
          lines: items.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            image: line.image,
          })),
          discountCode: appliedDiscount?.code || null,
          discoverySessionToken,
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not create your order.");
      trackMetaEvent("Lead", {
        value: Number(data.total),
        currency,
        content_ids: items.map((line) => line.variantId),
        contents: items.map((line) => ({
          id: line.variantId,
          quantity: line.quantity,
          item_price: line.unitPrices[currency] ?? 0,
        })),
      });
      setConfirmation({
        orderNumber: data.orderNumber,
        total: Number(data.total),
        discountAmount: Number(data.discountAmount || 0),
        discountCode: data.discountCode || null,
      });
      clearCart();
      setDiscoverySessionToken(null);
      const message =
        "Hello BWA, I have placed website order " +
        data.orderNumber +
        " for " +
        format(Number(data.total)) +
        (data.discountCode
          ? ` after ${data.discountCode} saved ${format(Number(data.discountAmount || 0))}.`
          : ".") +
        " Please confirm payment and delivery details.";
      window.open(
        "https://wa.me/" +
          (process.env.WHATSAPP_NUMBER || "254712345678") +
          "?text=" +
          encodeURIComponent(message),
        "_blank",
        "noopener,noreferrer",
      );
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "Could not create your order.",
      );
    } finally {
      setLoading(false);
    }
  };
  if (confirmation)
    return (
      <main className="order-confirmation">
        <p className="eyebrow">Order received</p>
        <h1>Thank you. We have your piece.</h1>
        <p>
          Your BWA order reference is{" "}
          <strong>{confirmation.orderNumber}</strong>. WhatsApp should have
          opened with your order summary; if it did not, share this reference
          with our concierge.
        </p>
        <div>
          <span>Total</span>
          <strong>{format(confirmation.total)}</strong>
        </div>
        {confirmation.discountCode && (
          <p>
            {confirmation.discountCode} saved{" "}
            {format(confirmation.discountAmount)}
            on this order.
          </p>
        )}
        <Link
          href={"/order/" + confirmation.orderNumber}
          className="btn btn-primary"
        >
          Track your order
        </Link>
        <Link href="/bracelets">Continue exploring</Link>
      </main>
    );
  return (
    <main className="checkout-page">
      <section className="checkout-intro">
        <div className="container">
          <Link href="/cart">
            <ArrowLeft size={16} /> Return to bag
          </Link>
          <p className="eyebrow">BWA concierge order</p>
          <h1>We’ll finish this together.</h1>
          <p>
            Place your order here, then our team will confirm payment and
            delivery with you on WhatsApp.
          </p>
        </div>
      </section>
      <div className="container checkout-grid">
        <form onSubmit={order} className="checkout-form">
          <section>
            <h2>Contact</h2>
            <div className="checkout-fields">
              <label>
                First name
                <input
                  required
                  value={form.firstName}
                  autoComplete="first-name"
                  onChange={(event) => update("firstName", event.target.value)}
                />
              </label>
              <label>
                Last name
                <input
                  value={form.lastName}
                  autoComplete="last-name"
                  onChange={(event) => update("lastName", event.target.value)}
                />
              </label>
              <label className="checkout-field-full">
                Phone / WhatsApp
                <input
                  required
                  placeholder="+254 7XX XXX XXX"
                  value={form.phone}
                  autoComplete="tel"
                  onChange={(event) => update("phone", event.target.value)}
                />
              </label>
              <label className="checkout-field-full">
                Email
                <input
                  type="email"
                  value={form.email}
                  autoComplete="email"
                  onChange={(event) => update("email", event.target.value)}
                />
              </label>
            </div>
          </section>
          <section>
            <h2>Delivery</h2>
            <div className="delivery-choice">
              <button
                type="button"
                onClick={() => setDeliveryMethod("pickup")}
                className={deliveryMethod === "pickup" ? "is-selected" : ""}
              >
                <strong>Collect with BWA</strong>
                <span>Location confirmed on WhatsApp · Free</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod("standard")}
                className={deliveryMethod === "standard" ? "is-selected" : ""}
              >
                <strong>Doorstep delivery</strong>
                <span>
                  Kenya delivery ·{" "}
                  {currency === "KES"
                    ? "KES 250"
                    : "USD price confirmed with BWA"}
                </span>
              </button>
            </div>
            {deliveryMethod === "standard" && (
              <div className="checkout-fields">
                <label className="checkout-field-full">
                  Address / Estate
                  <input
                    required
                    value={form.address}
                    autoComplete="street-address"
                    onChange={(event) => update("address", event.target.value)}
                  />
                </label>
                <label>
                  City
                  <input
                    required
                    value={form.city}
                    autoComplete="city"
                    onChange={(event) => update("city", event.target.value)}
                  />
                </label>
                <label>
                  County
                  <input
                    required
                    value={form.county}
                    autoComplete="county"
                    onChange={(event) => update("county", event.target.value)}
                  />
                </label>
              </div>
            )}
            <label className="checkout-field-full">
              Delivery note{" "}
              <input
                value={form.note}
                onChange={(event) => update("note", event.target.value)}
              />
            </label>
          </section>
          <label className="checkout-consent">
            <input
              type="checkbox"
              checked={form.marketingOptIn}
              onChange={(event) =>
                update("marketingOptIn", event.target.checked)
              }
            />{" "}
            Send me occasional BWA stories and new drop news and discount
            announcements. I can unsubscribe at any time.
          </label>
          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}
          <button
            disabled={loading || hasUnavailableCurrencyPrice}
            className="btn btn-primary checkout-submit"
          >
            {loading ? "Creating your order…" : "Create order & open WhatsApp"}{" "}
            <FaWhatsapp size={17} />
          </button>
        </form>
        <aside className="checkout-summary">
          <p className="eyebrow">Your order</p>
          {items.map((line) => (
            <div key={line.productId + line.variantId}>
              <span>
                {line.title} · {line.variantName} × {line.quantity}
              </span>
              <strong>
                {line.unitPrices[currency] === null
                  ? "Price unavailable"
                  : format((line.unitPrices[currency] ?? 0) * line.quantity)}
              </strong>
            </div>
          ))}
          <div>
            <span>Subtotal</span>
            <strong>{format(subtotal)}</strong>
          </div>
          <div className="checkout-discount">
            <span>Discount code</span>
            {appliedDiscount ? (
              <div className="checkout-discount-applied">
                <strong>{appliedDiscount.code}</strong>
                <button type="button" onClick={removeDiscount}>
                  Remove
                </button>
              </div>
            ) : (
              <div className="checkout-discount-input">
                <input
                  value={discountCode}
                  onChange={(event) => setDiscountCode(event.target.value)}
                  placeholder="Enter code"
                  aria-label="Discount code"
                  autoCapitalize="characters"
                />
                <button
                  type="button"
                  onClick={applyDiscount}
                  disabled={discountLoading || hasUnavailableCurrencyPrice}
                >
                  {discountLoading ? "Checking…" : "Apply"}
                </button>
              </div>
            )}
            {discountMessage && (
              <small
                className={appliedDiscount ? "is-success" : "is-error"}
                role="status"
              >
                {discountMessage}
              </small>
            )}
          </div>
          {appliedDiscount && (
            <div className="checkout-savings">
              <span>{appliedDiscount.code} savings</span>
              <strong>−{format(discountAmount)}</strong>
            </div>
          )}
          <div>
            <span>Delivery</span>
            <strong>{deliveryFee ? format(deliveryFee) : "Free"}</strong>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>{format(subtotal - discountAmount + deliveryFee)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
