"use client";
import { useState } from "react";
import OrderSummary from "@/components/commerce/OrderSummary";
export default function Checkout() {
  const [method, setMethod] = useState("delivery");
  return (
    <main className="container checkout-layout">
      <section>
        <div className="eyebrow">Beads World Africa · Checkout</div>
        <h1 className="display">Complete your order.</h1>
        <p className="muted" style={{ lineHeight: 1.8, fontSize: 13 }}>
          One final step. Your bracelet is almost on its way.
        </p>
        <div className="checkout-section">
          <h2 className="display">Contact information</h2>
          <div className="form-grid">
            <label className="full">
              Email address
              <input type="email" placeholder="you@example.com" />
            </label>
          </div>
        </div>
        <div className="checkout-section">
          <h2 className="display">Delivery details</h2>
          <div className="form-grid">
            <label>
              First name
              <input placeholder="First name" />
            </label>
            <label>
              Last name
              <input placeholder="Last name" />
            </label>
            <label className="full">
              Phone number
              <input placeholder="+254 7XX XXX XXX" />
            </label>
            <label className="full">
              Address
              <input placeholder="Street / building / estate" />
            </label>
            <label>
              City
              <input placeholder="City" />
            </label>
            <label>
              County
              <select>
                <option>Select county</option>
                <option>Nairobi</option>
                <option>Mombasa</option>
                <option>Kiambu</option>
                <option>Nakuru</option>
                <option>Other</option>
              </select>
            </label>
          </div>
        </div>
        <div className="checkout-section">
          <h2 className="display">Delivery method</h2>
          <label
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid var(--charcoal)",
              fontSize: 12,
            }}
          >
            <input
              type="radio"
              checked={method === "delivery"}
              onChange={() => setMethod("delivery")}
            />{" "}
            Standard delivery · KES 250
          </label>
          <label
            style={{
              display: "block",
              padding: "16px",
              border: "1px solid var(--line)",
              marginTop: 10,
              fontSize: 12,
            }}
          >
            <input
              type="radio"
              checked={method === "pickup"}
              onChange={() => setMethod("pickup")}
            />{" "}
            Pick up · Free
          </label>
          <div className="notice">
            Your order is prepared with care. Delivery details will be sent to
            the contact information provided.
          </div>
        </div>
        <div className="checkout-section">
          <h2 className="display">Payment</h2>
          <div
            style={{
              padding: 16,
              border: "1px solid var(--charcoal)",
              fontSize: 12,
            }}
          >
            Card / M-Pesa
            <br />
            <span className="muted">
              Secure payment — payment integration comes next.
            </span>
          </div>
        </div>
      </section>
      <div>
        <OrderSummary />
        <button
          className="btn primary full-btn"
          style={{ marginTop: 15 }}
          onClick={() => alert("Prototype ready for real payment integration.")}
        >
          Continue to secure payment
        </button>
      </div>
    </main>
  );
}
