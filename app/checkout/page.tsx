"use client";

import { useState } from "react";
import Link from "next/link";
import { MessageSquare, CheckCircle, ShieldCheck } from "lucide-react";

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "pickup">("standard");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  // Form inputs
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [city, setCity] = useState("");
  const [county, setCounty] = useState("Nairobi");
  const [note, setNote] = useState("");

  const subtotal = discountApplied ? 3420 : 3800;
  const delivery = deliveryMethod === "pickup" ? 0 : 250;
  const total = subtotal + delivery;

  const applyCode = () => {
    if (discountCode.trim().toUpperCase() === "BWA10") {
      setDiscountApplied(true);
      alert("Discount applied — 10% off!");
    } else {
      alert("Try code BWA10 for 10% off.");
    }
  };

  const handleWhatsAppCheckout = () => {
    if (!firstName || !phone) {
      alert("Please fill in at least your First Name and Phone Number to place your order via WhatsApp.");
      return;
    }

    const whatsappNumber = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "254712345678";

    const message = `*NEW ORDER - BEADS WORLD AFRICA* 🛍️\n\n` +
      `*Customer:* ${firstName} ${lastName}\n` +
      `*Phone:* ${phone}\n` +
      `*Email:* ${email || "N/A"}\n` +
      `*Delivery Method:* ${deliveryMethod === "standard" ? "Standard Delivery (KES 250)" : "Self Pick-Up (Free)"}\n` +
      `*Address:* ${address || "N/A"}, ${city || ""}, ${county}\n` +
      (note ? `*Delivery Note:* ${note}\n` : "") +
      `\n*Order Summary:*\n` +
      `• 1x THE GROUNDED (Black Onyx + Lava Stone) - KES ${subtotal.toLocaleString()}\n` +
      `• Delivery Fee: KES ${delivery.toLocaleString()}\n` +
      `*TOTAL AMOUNT:* KES ${total.toLocaleString()}\n\n` +
      `Please confirm availability and payment instructions. Thank you!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

    window.open(whatsappUrl, "_blank");
  };

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
          <div className="eyebrow">Beads World Africa · Checkout</div>
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
          <p style={{ maxWidth: "590px", color: "#57534c", fontSize: "14px", lineHeight: "1.8" }}>
            Direct ordering via WhatsApp is currently active. Fill in your details below and click to send your order directly to our concierge on WhatsApp.
          </p>
        </div>
      </section>

      <div className="checkout-wrap">
        <div className="checkout-grid-layout">
          {/* Left Column: Form */}
          <div>
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
                    <strong style={{ fontSize: "12px", fontWeight: 600 }}>Standard delivery</strong>
                    <span style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>
                      Doorstep delivery within 1–3 business days
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
                      Collection point instructions sent via WhatsApp
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
                    Order directly via WhatsApp
                  </strong>
                  <p style={{ fontSize: "12px", color: "var(--muted)", margin: 0, lineHeight: 1.6 }}>
                    Direct card/automated checkout is currently disabled. Clicking the order button below will open WhatsApp with your pre-filled order summary, where our concierge will assist you with M-Pesa / Cash on Delivery payment.
                  </p>
                </div>
              </div>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="checkout-order-summary">
            <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "31px", fontWeight: 500, margin: "0 0 24px" }}>
              Your order
            </h2>

            {/* Item */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "78px 1fr auto",
                gap: "13px",
                alignItems: "start",
                paddingBottom: "20px",
                marginBottom: "20px",
                borderBottom: "1px solid var(--line-translucent)",
              }}
            >
              <div
                style={{
                  width: "78px",
                  height: "96px",
                  background: "linear-gradient(145deg,#292825,#756b5b)",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <div
                  style={{
                    width: "54px",
                    height: "54px",
                    border: "7px solid #26231f",
                    borderRadius: "50%",
                    boxShadow: "inset 0 0 0 2px #8d7658",
                  }}
                />
              </div>
              <div>
                <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "21px", fontWeight: 500, marginBottom: "5px" }}>
                  THE GROUNDED
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.5" }}>
                  Black Onyx + Lava Stone
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "8px" }}>Qty 1</div>
              </div>
              <div style={{ fontSize: "12px" }}>KES {subtotal.toLocaleString()}</div>
            </div>

            {/* Discount code */}
            <div style={{ display: "flex", gap: "8px", margin: "22px 0" }}>
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

            {/* Totals */}
            <div style={{ display: "grid", gap: "13px", fontSize: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Subtotal</span>
                <span>KES {subtotal.toLocaleString()}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Delivery</span>
                <span>{delivery === 0 ? "Free" : `KES ${delivery.toLocaleString()}`}</span>
              </div>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  fontWeight: 600,
                  fontSize: "14px",
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
              Fast response · Direct support from Beads World Africa concierge.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
