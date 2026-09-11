"use client";

import { useState } from "react";
import Link from "next/link";

export default function CheckoutPage() {
  const [deliveryMethod, setDeliveryMethod] = useState<"standard" | "pickup">("standard");
  const [discountCode, setDiscountCode] = useState("");
  const [discountApplied, setDiscountApplied] = useState(false);

  const subtotal = discountApplied ? 3420 : 3800;
  const delivery = deliveryMethod === "pickup" ? 0 : 250;
  const total = subtotal + delivery;

  const applyCode = () => {
    if (discountCode.trim().toUpperCase() === "BWA10") {
      setDiscountApplied(true);
      alert("Discount applied — 10% off.");
    } else {
      alert("For this prototype, try code BWA10.");
    }
  };

  return (
    <main>
      {/* Dark sticky header for checkout */}
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
            One final step. Your bracelet is almost on its way. Enter your details below and choose how you would like to receive it.
          </p>
          <div className="checkout-steps">
            <div className="checkout-step">
              <span className="step-dot">✓</span>
              Bag
            </div>
            <span className="checkout-connector"></span>
            <div className="checkout-step active">
              <span className="step-dot">2</span>
              Details
            </div>
            <span className="checkout-connector"></span>
            <div className="checkout-step">
              <span className="step-dot">3</span>
              Payment
            </div>
          </div>
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
                <span
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "30px",
                    fontWeight: 500,
                  }}
                >
                  Contact information
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--muted)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Required
                </span>
              </div>
              <div className="form-fields-grid">
                <div className="full-width">
                  <label>Email address</label>
                  <input type="email" placeholder="you@example.com" />
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
                <span
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "30px",
                    fontWeight: 500,
                  }}
                >
                  Delivery details
                </span>
                <span
                  style={{
                    fontSize: "10px",
                    color: "var(--muted)",
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                  }}
                >
                  Required
                </span>
              </div>
              <div className="form-fields-grid">
                <div>
                  <label>First name</label>
                  <input placeholder="First name" />
                </div>
                <div>
                  <label>Last name</label>
                  <input placeholder="Last name" />
                </div>
                <div className="full-width">
                  <label>Phone number</label>
                  <input placeholder="+254 7XX XXX XXX" />
                </div>
                <div className="full-width">
                  <label>Address</label>
                  <input placeholder="Street / building / estate" />
                </div>
                <div>
                  <label>City</label>
                  <input placeholder="City" />
                </div>
                <div>
                  <label>County</label>
                  <select>
                    <option>Select county</option>
                    <option>Nairobi</option>
                    <option>Mombasa</option>
                    <option>Kiambu</option>
                    <option>Nakuru</option>
                    <option>Machakos</option>
                    <option>Other</option>
                  </select>
                </div>
                <div className="full-width">
                  <label>
                    Delivery note{" "}
                    <span style={{ color: "var(--muted)" }}>(optional)</span>
                  </label>
                  <input placeholder="Anything our courier should know?" />
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
                      Reliable delivery · Estimated 2–4 business days
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
                      We'll confirm collection details with you
                    </span>
                  </div>
                  <b style={{ marginLeft: "auto", fontSize: "12px" }}>Free</b>
                </label>
              </div>
              <div
                style={{
                  background: "var(--stone)",
                  padding: "17px 18px",
                  fontSize: "12px",
                  lineHeight: "1.6",
                  marginTop: "16px",
                }}
              >
                Your order is prepared with care. Once it leaves us, we'll send your delivery details to the email and phone number provided.
              </div>
            </section>

            {/* Payment */}
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
                Payment
              </div>
              <label className="radio-card selected">
                <input
                  type="radio"
                  name="payment"
                  defaultChecked
                  style={{ width: "16px", height: "16px", margin: 0 }}
                />
                <div>
                  <strong style={{ fontSize: "12px", fontWeight: 600 }}>Card / M-Pesa</strong>
                  <span style={{ display: "block", fontSize: "11px", color: "var(--muted)", marginTop: "3px" }}>
                    Secure payment. You'll be taken to the payment step after reviewing your order.
                  </span>
                </div>
              </label>
            </section>
          </div>

          {/* Right Column: Order Summary */}
          <aside className="checkout-order-summary">
            <h2
              style={{
                fontFamily: "Cormorant Garamond, serif",
                fontSize: "31px",
                fontWeight: 500,
                margin: "0 0 24px",
              }}
            >
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
                <div
                  style={{
                    fontFamily: "Cormorant Garamond, serif",
                    fontSize: "21px",
                    fontWeight: 500,
                    lineHeight: 1.05,
                    marginBottom: "5px",
                  }}
                >
                  THE GROUNDED
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)", lineHeight: "1.5" }}>
                  Black Onyx + Lava Stone
                  <br />
                  Adjustable / Unisex
                </div>
                <div style={{ fontSize: "10px", color: "var(--muted)", marginTop: "8px" }}>Qty 1</div>
              </div>
              <div style={{ fontSize: "12px", whiteSpace: "nowrap" }}>
                KES {subtotal.toLocaleString()}
              </div>
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
                placeholder="Discount code"
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
              style={{
                width: "100%",
                height: "54px",
                border: "1px solid var(--charcoal)",
                background: "var(--charcoal)",
                color: "var(--ivory)",
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                fontSize: "12px",
                fontWeight: 600,
                marginTop: "23px",
                cursor: "pointer",
              }}
              onClick={() => alert("Checkout prototype ready — next step is connecting payment.")}
            >
              Continue to secure payment
            </button>
            <div
              style={{
                textAlign: "center",
                fontSize: "10px",
                color: "var(--muted)",
                marginTop: "13px",
                lineHeight: "1.6",
              }}
            >
              Secure checkout · Your payment details are handled securely.
              <br />
              By continuing, you agree to our terms and privacy policy.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
