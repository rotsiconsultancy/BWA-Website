"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

type Confirmation = { orderNumber: string; total: number } | null;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "pickup">(
    "standard",
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [confirmation, setConfirmation] = useState<Confirmation>(null);
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
  const deliveryFee = deliveryMethod === "pickup" ? 0 : 250;
  if (!items.length && !confirmation)
    return (
      <main className="empty-state">
        <h1>Your bag is empty.</h1>
        <Link href="/shop" className="btn btn-primary">
          Return to collection
        </Link>
      </main>
    );
  const update = (key: keyof typeof form, value: string | boolean) =>
    setForm((current) => ({ ...current, [key]: value }));
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
          lines: items.map((line) => ({
            variantId: line.variantId,
            quantity: line.quantity,
            image: line.image,
          })),
        }),
      });
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.error || "Could not create your order.");
      setConfirmation({ orderNumber: data.orderNumber, total: data.total });
      clearCart();
      const message =
        "Hello BWA, I have placed website order " +
        data.orderNumber +
        " for KES " +
        Number(data.total).toLocaleString() +
        ". Please confirm payment and delivery details.";
      window.open(
        "https://wa.me/" +
          (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254712345678") +
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
          <strong>KES {confirmation.total.toLocaleString()}</strong>
        </div>
        <Link
          href={"/order/" + confirmation.orderNumber}
          className="btn btn-primary"
        >
          Track your order
        </Link>
        <Link href="/shop">Continue exploring</Link>
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
                  onChange={(event) => update("firstName", event.target.value)}
                />
              </label>
              <label>
                Last name
                <input
                  value={form.lastName}
                  onChange={(event) => update("lastName", event.target.value)}
                />
              </label>
              <label className="checkout-field-full">
                Phone / WhatsApp
                <input
                  required
                  placeholder="+254 7XX XXX XXX"
                  value={form.phone}
                  onChange={(event) => update("phone", event.target.value)}
                />
              </label>
              <label className="checkout-field-full">
                Email
                <input
                  type="email"
                  value={form.email}
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
                onClick={() => setDeliveryMethod("standard")}
                className={deliveryMethod === "standard" ? "is-selected" : ""}
              >
                <strong>Doorstep delivery</strong>
                <span>Kenya delivery · KES 250</span>
              </button>
              <button
                type="button"
                onClick={() => setDeliveryMethod("pickup")}
                className={deliveryMethod === "pickup" ? "is-selected" : ""}
              >
                <strong>Collect with BWA</strong>
                <span>Location confirmed on WhatsApp · Free</span>
              </button>
            </div>
            {deliveryMethod === "standard" && (
              <div className="checkout-fields">
                <label className="checkout-field-full">
                  Address / Estate
                  <input
                    required
                    value={form.address}
                    onChange={(event) => update("address", event.target.value)}
                  />
                </label>
                <label>
                  City
                  <input
                    required
                    value={form.city}
                    onChange={(event) => update("city", event.target.value)}
                  />
                </label>
                <label>
                  County
                  <input
                    required
                    value={form.county}
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
            Send me occasional BWA stories and new drop news.
          </label>
          {error && (
            <p className="checkout-error" role="alert">
              {error}
            </p>
          )}
          <button
            disabled={loading}
            className="btn btn-primary checkout-submit"
          >
            {loading ? "Creating your order…" : "Create order & open WhatsApp"}{" "}
            <MessageCircle size={17} />
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
                KES {(line.unitPrice * line.quantity).toLocaleString()}
              </strong>
            </div>
          ))}
          <div>
            <span>Subtotal</span>
            <strong>KES {subtotal.toLocaleString()}</strong>
          </div>
          <div>
            <span>Delivery</span>
            <strong>
              {deliveryFee ? "KES " + deliveryFee.toLocaleString() : "Free"}
            </strong>
          </div>
          <div className="checkout-total">
            <span>Total</span>
            <strong>KES {(subtotal + deliveryFee).toLocaleString()}</strong>
          </div>
        </aside>
      </div>
    </main>
  );
}
