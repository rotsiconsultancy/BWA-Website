"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function CheckoutPage() {
  const { items, subtotal, showToast } = useCart();

  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "pickup">("standard");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);
  const [discountMessage, setDiscountMessage] = useState<{ text: string; error?: boolean } | null>(null);

  // Form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [note, setNote] = useState("");
  const [formError, setFormError] = useState("");

  const finalSubtotal = discountApplied ? Math.round(subtotal * 0.9) : subtotal;
  const deliveryFee = items.length === 0 ? 0 : deliveryMethod === "pickup" ? 0 : 250;
  const total = finalSubtotal + deliveryFee;

  const applyCode = () => {
    if (discountCode.trim().toUpperCase() === "BWA10") {
      setDiscountApplied(true);
      setDiscountMessage({ text: "10% discount code applied!" });
      showToast("Code BWA10 applied — 10% off", "success");
    } else {
      setDiscountMessage({ text: "Invalid code. Use BWA10 for 10% off.", error: true });
    }
  };

  const handleWhatsAppCheckout = () => {
    if (!firstName.trim() || !phone.trim()) {
      setFormError("Please enter your First Name and Phone Number to complete your order.");
      showToast("Please enter your First Name and Phone Number.", "error");
      return;
    }

    setFormError("");
    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254712345678";

    const itemsSummary = items
      .map((item, i) => `• ${i + 1}. ${item.title} (${item.subtitle}) - Size: ${item.size} - Qty ${item.quantity} (KES ${(item.price * item.quantity).toLocaleString()})`)
      .join("\n");

    const message =
      `*NEW ORDER - BEADS WORLD AFRICA* 🛍️\n\n` +
      `*Customer:* ${firstName} ${lastName}\n` +
      `*Phone:* ${phone}\n` +
      `*Email:* ${email || "N/A"}\n` +
      `*Delivery:* ${deliveryMethod === "standard" ? "Standard Delivery (KES 250)" : "Self Pick-Up (Free)"}\n` +
      `*Location:* ${address || "N/A"}, ${city || ""}, ${county}\n` +
      (note ? `*Delivery Note:* ${note}\n` : "") +
      `\n*Order Items (${items.length}):*\n${itemsSummary}\n\n` +
      `*Subtotal:* KES ${finalSubtotal.toLocaleString()}\n` +
      `*Delivery Fee:* KES ${deliveryFee.toLocaleString()}\n` +
      `*TOTAL AMOUNT:* KES ${total.toLocaleString()}\n\n` +
      `Please confirm availability and payment instructions. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

  if (items.length === 0) {
    return (
      <main style={{ minHeight: "60vh", display: "grid", placeItems: "center", padding: "80px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "400px" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "var(--soft)", display: "grid", placeItems: "center", margin: "0 auto 18px", color: "var(--muted)" }}>
            <ShoppingBag size={24} />
          </div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "36px", margin: "0 0 10px" }}>
            Your bag is empty
          </h1>
          <p style={{ fontSize: "13px", color: "var(--muted)", marginBottom: "24px" }}>
            Add items to your bag before proceeding to checkout.
          </p>
          <Link className="btn btn-primary" href="/shop">
            <ArrowLeft size={16} /> Return to shop
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      {/* Header */}
      <section
        style={{
          background: "var(--charcoal)",
          color: "var(--ivory)",
          borderBottom: "1px solid rgba(245,241,232,0.12)",
        }}
      >
        <div className="checkout-wrap checkout-head">
          <div className="eyebrow">Beads World Africa · Direct Order</div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 500,
              fontSize: "clamp(43px,5vw,58px)",
              margin: "0 0 14px",
              lineHeight: 0.98,
            }}
          >
            Complete your order.
          </h1>
          <p style={{ maxWidth: "590px", color: "#b5afa5", fontSize: "14px", lineHeight: "1.8" }}>
            Fill in your details below and click to route your order summary directly to our WhatsApp concierge.
          </p>
        </div>
      </section>

      <div className="checkout-wrap">
        <div className="checkout-grid-layout">
          {/* Left Column: Form */}
          <div>
            {formError && (
              <div
                style={{
                  background: "rgba(154, 64, 56, 0.1)",
                  border: "1px solid var(--error)",
                  color: "var(--error)",
                  padding: "14px 18px",
                  borderRadius: "4px",
                  fontSize: "13px",
                  marginBottom: "28px",
                }}
              >
                {formError}
              </div>
            )}

            {/* Contact */}
            <section style={{ marginBottom: "44px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  borderBottom: "1px solid var(--line-translucent)",
                  paddingBottom: "13px",
                  marginBottom: "22px",
                }}
              >
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "30px", fontWeight: 500 }}>
                  Contact information
                </span>
                <span style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Required
                </span>
              </div>
              <div className="form-fields-grid">
                <div className="full-width">
                  <label>Email address</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Delivery Details */}
            <section style={{ marginBottom: "44px" }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  borderBottom: "1px solid var(--line-translucent)",
                  paddingBottom: "13px",
                  marginBottom: "22px",
                }}
              >
                <span style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "30px", fontWeight: 500 }}>
                  Delivery details
                </span>
                <span style={{ fontSize: "10px", color: "var(--muted)", letterSpacing: "0.12em", textTransform: "uppercase" }}>
                  Required
                </span>
              </div>
              <div className="form-fields-grid">
                <div>
                  <label>First name *</label>
                  <input
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label>Last name</label>
                  <input
                    placeholder="Last name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
                <div className="full-width">
                  <label>Phone number (WhatsApp) *</label>
                  <input
                    placeholder="+254 7XX XXX XXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                  />
                </div>
                <div className="full-width">
                  <label>Address / Estate</label>
                  <input
                    placeholder="Street / building / estate"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                  />
                </div>
                <div>
                  <label>City</label>
                  <input
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>
                <div>
                  <label>County</label>
                  <select value={county} onChange={(e) => setCounty(e.target.value)}>
                    <option value="Nairobi">Nairobi</option>
                    <option value="Mombasa">Mombasa</option>
                    <option value="Kiambu">Kiambu</option>
                    <option value="Nakuru">Nakuru</option>
                    <option value="Machakos">Machakos</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="full-width">
                  <label>Delivery note <span style={{ color: "var(--muted)" }}>(optional)</span></label>
                  <input
                    placeholder="Anything our courier should know?"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                  />
                </div>
              </div>
            </section>

            {/* Delivery Method */}
            <section style={{ marginBottom: "44px" }}>
              <div
                style={{
                  borderBottom: "1px solid var(--line-translucent)",
                  paddingBottom: "13px",
                  marginBottom: "22px",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "30px",
                  fontWeight: 500,
                }}
              >
                Delivery method
              </div>
              <div style={{ display: "grid", gap: "10px" }}>
                <label
                  className={`radio-card ${deliveryMethod === "standard" ? "selected" : ""}`}
                  onClick={() => setDeliveryMethod("standard")}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "standard"}
                    onChange={() => setDeliveryMethod("standard")}
                    style={{ width: "16px", height: "16px", margin: 0 }}
                  />
                  <div>
                    <strong style={{ fontSize: "12px", fontWeight: 600 }}>Standard doorstep delivery</strong>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>
                      Delivery within 1–3 business days
                    </span>
                  </div>
                  <b style={{ marginLeft: "auto", fontSize: "12px" }}>KES 250</b>
                </label>
                <label
                  className={`radio-card ${deliveryMethod === "pickup" ? "selected" : ""}`}
                  onClick={() => setDeliveryMethod("pickup")}
                >
                  <input
                    type="radio"
                    name="delivery"
                    checked={deliveryMethod === "pickup"}
                    onChange={() => setDeliveryMethod("pickup")}
                    style={{ width: "16px", height: "16px", margin: 0 }}
                  />
                  <div>
                    <strong style={{ fontSize: "12px", fontWeight: 600 }}>Pick up</strong>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>
                      Collection point location shared via WhatsApp
                    </span>
                  </div>
                  <b style={{ marginLeft: "auto", fontSize: "12px" }}>Free</b>
                </label>
              </div>
            </section>

            {/* Payment Method Notice */}
            <section style={{ marginBottom: "44px" }}>
              <div
                style={{
                  borderBottom: "1px solid var(--line-translucent)",
                  paddingBottom: "13px",
                  marginBottom: "22px",
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "30px",
                  fontWeight: 500,
                }}
              >
                Payment Method
              </div>
              <div
                style={{
                  background: "#f7f5f0",
                  border: "1px solid var(--line)",
                  padding: "20px",
                  borderRadius: "4px",
                  display: "flex",
                  gap: "14px",
                  alignItems: "flex-start",
                }}
              >
                <MessageSquare size={24} style={{ color: "#25D366", flex: "0 0 auto", marginTop: "2px" }} />
                <div>
                  <strong style={{ fontSize: "14px", display: "block", marginBottom: "4px" }}>
                    WhatsApp Concierge Checkout
                  </strong>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
                    Automated card payments are currently disabled. Clicking the order button below will launch WhatsApp with your pre-filled item summary to complete payment via M-Pesa or Cash on Delivery.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="checkout-order-summary">
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "31px", fontWeight: 500, margin: "0 0 24px" }}>
              Your order ({items.length})
            </h2>

            {/* Items */}
            <div style={{ display: "grid", gap: "16px", marginBottom: "20px", borderBottom: "1px solid var(--line-translucent)", paddingBottom: "20px" }}>
              {items.map((item) => (
                <div
                  key={`${item.id}-${item.size}`}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "60px 1fr auto",
                    gap: "12px",
                    alignItems: "center",
                  }}
                >
                  <div style={{ width: "60px", height: "72px", borderRadius: "4px", overflow: "hidden", background: "var(--stone)" }}>
                    <img src={item.image} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <div>
                    <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "18px", fontWeight: 500, lineHeight: 1.1 }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: "10px", color: "var(--muted)" }}>
                      Size: {item.size} · Qty {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", fontWeight: 600 }}>
                    KES {(item.price * item.quantity).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>

            {/* Discount code */}
            <div style={{ marginBottom: "22px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  style={{
                    flex: 1,
                    height: "44px",
                    border: "1px solid var(--line-translucent)",
                    background: "transparent",
                    padding: "0 12px",
                    fontSize: "12px",
                  }}
                  placeholder="Discount code (try BWA10)"
                  value={discountCode}
                  onChange={(e) => setDiscountCode(e.target.value)}
                  disabled={discountApplied}
                />
                <button
                  onClick={applyCode}
                  disabled={discountApplied}
                  style={{
                    height: "44px",
                    padding: "0 15px",
                    border: "1px solid var(--charcoal)",
                    background: "transparent",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    fontSize: "10px",
                    cursor: "pointer",
                  }}
                >
                  Apply
                </button>
              </div>
              {discountMessage && (
                <div
                  style={{
                    fontSize: "11px",
                    marginTop: "6px",
                    color: discountMessage.error ? "var(--error)" : "var(--success)",
                  }}
                >
                  {discountMessage.text}
                </div>
              )}
            </div>

            {/* Totals */}
            <div style={{ display: "grid", gap: "13px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal</span>
                <span>KES {finalSubtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Delivery</span>
                <span>{deliveryFee === 0 ? "Free" : `KES ${deliveryFee.toLocaleString()}`}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600,
                  fontSize: "15px",
                  paddingTop: "17px",
                  borderTop: "1px solid var(--line-translucent)",
                }}
              >
                <span>Total</span>
                <span>KES {total.toLocaleString()}</span>
              </div>
            </div>

            <button
              onClick={handleWhatsAppCheckout}
              style={{
                width: "100%",
                minHeight: "56px",
                border: "none",
                background: "#25D366",
                color: "#ffffff",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                fontSize: "13px",
                fontWeight: 700,
                marginTop: "23px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "10px",
                borderRadius: "4px",
                boxShadow: "0 4px 14px rgba(37, 211, 102, 0.35)",
              }}
            >
              <MessageSquare size={18} />
              Order via WhatsApp 💬
            </button>

            <div style={{ textAlign: "center", fontSize: "10px", color: "var(--muted)", marginTop: "13px", lineHeight: "1.6" }}>
              Direct support from Beads World Africa concierge.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
