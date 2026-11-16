"use client";

import Link from "next/link";
import { FormEvent, useEffect, useRef, useState } from "react";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { trackMetaEvent } from "@/lib/marketing/meta-pixel";
import { DELIVERY_NOTE } from "@/lib/commerce/money";
import {
  forgetSavedCustomer,
  readSavedCustomer,
  saveCustomerOrder,
} from "@/lib/commerce/saved-customer";
import GrowBwaLinks from "@/components/marketing/GrowBwaLinks";
import {
  cartLineToGa4Item,
  cartValue,
  trackGa4Event,
} from "@/lib/marketing/ga4";

type Confirmation = {
  orderNumber: string;
  total: number;
  discountAmount: number;
  discountCode: string | null;
  whatsappUrl: string;
  doorstep: boolean;
} | null;

type AppliedDiscount = {
  code: string;
  discountAmount: number;
  discountedSubtotal: number;
};

const whatsappNumber = process.env.WHATSAPP_NUMBER || "254745474586";

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
  const discountAmount = appliedDiscount?.discountAmount || 0;
  const checkoutTracked = useRef(false);
  const [whatsappOpened, setWhatsappOpened] = useState(false);
  const [returning, setReturning] = useState(false);
  // Fill the form from the last order on this phone, once, before typing.
  useEffect(() => {
    const saved = readSavedCustomer();
    if (!saved) return;
    setReturning(true);
    setDeliveryMethod(saved.deliveryMethod);
    setForm((current) => ({
      ...current,
      firstName: saved.firstName,
      lastName: saved.lastName,
      email: saved.email,
      phone: saved.phone,
      address: saved.address,
      city: saved.city,
      county: saved.county || current.county,
    }));
  }, []);
  useEffect(() => {
    if (checkoutTracked.current || !items.length) return;
    checkoutTracked.current = true;
    trackGa4Event("begin_checkout", {
      currency,
      value: cartValue(items, currency),
      items: items.map((line) => cartLineToGa4Item(line, currency)),
    });
  }, [currency, items]);
  useEffect(() => {
    if (!items.length || hasUnavailableCurrencyPrice) return;
    trackMetaEvent("InitiateCheckout", {
      value: subtotal,
      currency,
      content_ids: items.map((line) => line.variantId),
      contents: items.map((line) => ({
        id: line.variantId,
        quantity: line.quantity,
        item_price: line.unitPrices[currency] ?? 0,
      })),
    });
  }, [currency, hasUnavailableCurrencyPrice, items, subtotal]);
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
          phone: form.phone,
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
    const orderedLines = items;
    const ga4Items = orderedLines.map((line) => ({
      ...cartLineToGa4Item(line, currency),
      coupon: appliedDiscount?.code,
    }));
    trackGa4Event("add_shipping_info", {
      currency,
      value: cartValue(orderedLines, currency) - discountAmount,
      coupon: appliedDiscount?.code,
      shipping_tier:
        deliveryMethod === "pickup" ? "Collect with BWA" : "Doorstep delivery",
      items: ga4Items,
    });
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": idempotencyKey,
        },
        body: JSON.stringify({
          customer: {
            ...form,
            // Made-to-fit sizes reach the order record, not only WhatsApp.
            note: [
              form.note,
              ...items
                .filter((line) => line.wristCm)
                .map((line) => `${line.title}: ${line.variantName}`),
            ]
              .filter(Boolean)
              .join(" | "),
          },
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
      trackGa4Event("purchase", {
        transaction_id: data.orderNumber,
        currency,
        value: Number(data.total),
        coupon: data.discountCode || undefined,
        items: ga4Items,
      });
      // The full order travels in the message so staff can act without
      // opening the dashboard, and the customer sees exactly what they sent.
      const message = [
        `Hello BWA, I have placed website order ${data.orderNumber}.`,
        "",
        ...orderedLines.map(
          (line) => `• ${line.title} (${line.variantName}) × ${line.quantity}`,
        ),
        "",
        data.discountCode
          ? `Code ${data.discountCode} saved ${format(Number(data.discountAmount || 0))}.`
          : "",
        deliveryMethod === "pickup"
          ? `Total: ${format(Number(data.total))}`
          : `Total: ${format(Number(data.total))} (before delivery)`,
        deliveryMethod === "pickup"
          ? "Delivery: Collect with BWA"
          : `Deliver to: ${[form.address, form.city, form.county].filter(Boolean).join(", ")}`,
        `Name: ${[form.firstName, form.lastName].filter(Boolean).join(" ")}`,
        "",
        deliveryMethod === "pickup"
          ? "Please confirm payment and where I can collect."
          : "Please confirm payment and the delivery cost.",
      ]
        .filter((part, index, parts) => part || parts[index - 1])
        .join("\n");
      const whatsappUrl =
        "https://wa.me/" +
        whatsappNumber +
        "?text=" +
        encodeURIComponent(message);
      saveCustomerOrder(
        {
          firstName: form.firstName.trim(),
          lastName: form.lastName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          address: form.address.trim(),
          city: form.city.trim(),
          county: form.county.trim(),
          deliveryMethod,
        },
        {
          orderNumber: data.orderNumber,
          placedAt: new Date().toISOString(),
          total: format(Number(data.total)),
        },
      );
      setConfirmation({
        orderNumber: data.orderNumber,
        total: Number(data.total),
        discountAmount: Number(data.discountAmount || 0),
        discountCode: data.discountCode || null,
        whatsappUrl,
        doorstep: deliveryMethod === "standard",
      });
      clearCart();
      setDiscoverySessionToken(null);
      // Often blocked on mobile after an async request; the confirmation
      // screen below is the reliable path and asks the customer to send.
      const opened = window.open(whatsappUrl, "_blank", "noopener,noreferrer");
      if (opened)
        trackGa4Event("whatsapp_order_open", {
          transaction_id: data.orderNumber,
          method: "auto",
        });
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
        <p className="eyebrow">Order {confirmation.orderNumber} saved</p>
        <h1>One last step: send us your order on WhatsApp.</h1>
        <section className="order-send-callout" role="status">
          <p>
            <strong>
              Your order is not confirmed until we receive your WhatsApp
              message.
            </strong>{" "}
            Tap the button below, then press <strong>Send</strong> in WhatsApp.
            The message is already written for you.
          </p>
        </section>
        <a
          href={confirmation.whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="btn btn-whatsapp order-send-button"
          onClick={() => {
            setWhatsappOpened(true);
            trackGa4Event("whatsapp_order_open", {
              transaction_id: confirmation.orderNumber,
              method: "button",
            });
          }}
        >
          <FaWhatsapp size={18} />
          {whatsappOpened ? "Open WhatsApp again" : "Send order on WhatsApp"}
        </a>
        {whatsappOpened && (
          <p className="order-send-done">
            <CheckCircle2 size={16} /> Once you have pressed Send, we will reply
            to confirm payment and delivery.
          </p>
        )}
        <div>
          <span>
            {confirmation.doorstep ? "Total before delivery" : "Total"}
          </span>
          <strong>{format(confirmation.total)}</strong>
        </div>
        {confirmation.doorstep && <p>{DELIVERY_NOTE}</p>}
        {confirmation.discountCode && (
          <p>
            {confirmation.discountCode} saved{" "}
            {format(confirmation.discountAmount)} on this order.
          </p>
        )}
        <p className="order-confirmation-note">
          No WhatsApp? Call or text{" "}
          <a href={`tel:+${whatsappNumber}`}>+{whatsappNumber}</a> and quote{" "}
          <strong>{confirmation.orderNumber}</strong>.
        </p>
        <Link href={"/order/" + confirmation.orderNumber}>
          Track your order
        </Link>
        <Link href="/bracelets">Continue exploring</Link>
        <section className="order-grow">
          <h2>While we confirm your order</h2>
          <GrowBwaLinks placement="order_confirmation" />
        </section>
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
            {returning && (
              <p className="checkout-returning">
                Welcome back, {form.firstName || "friend"}. We filled in your
                details from this phone.{" "}
                <button
                  type="button"
                  onClick={() => {
                    forgetSavedCustomer();
                    setReturning(false);
                    setDeliveryMethod("pickup");
                    setForm((current) => ({
                      ...current,
                      firstName: "",
                      lastName: "",
                      email: "",
                      phone: "",
                      address: "",
                      city: "",
                      county: "Nairobi",
                    }));
                  }}
                >
                  Not you?
                </button>
              </p>
            )}
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
                  Nairobi: Uber or Bolt fare · Elsewhere: confirmed on WhatsApp
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
            {deliveryMethod === "standard" && (
              <p className="checkout-delivery-note">{DELIVERY_NOTE}</p>
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
          <p className="checkout-send-hint">
            Next, WhatsApp opens with your order already written. Press{" "}
            <strong>Send</strong> so we receive it. That is what confirms your
            order.
          </p>
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
            <strong>
              {deliveryMethod === "pickup" ? "Free" : "Confirmed on WhatsApp"}
            </strong>
          </div>
          <div className="checkout-total">
            <span>
              {deliveryMethod === "pickup" ? "Total" : "Total before delivery"}
            </span>
            <strong>{format(subtotal - discountAmount)}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
