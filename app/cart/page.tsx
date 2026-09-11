"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export default function CartPage() {
  const { items, removeFromCart, updateQuantity, subtotal, cartCount } = useCart();
  const deliveryFee = items.length > 0 ? 250 : 0;
  const total = subtotal + deliveryFee;

  if (items.length === 0) {
    return (
      <main style={{ minHeight: "65vh", display: "grid", placeItems: "center", padding: "80px 20px" }}>
        <div style={{ textAlign: "center", maxWidth: "420px" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              background: "var(--soft)",
              display: "grid",
              placeItems: "center",
              margin: "0 auto 20px",
              color: "var(--muted)",
            }}
          >
            <ShoppingBag size={28} />
          </div>
          <h1 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "38px", margin: "0 0 10px" }}>
            Your bag is empty
          </h1>
          <p style={{ fontSize: "14px", color: "var(--muted)", marginBottom: "28px", lineHeight: "1.6" }}>
            Discover contemporary bracelets crafted from natural stones and handmade in Africa.
          </p>
          <Link className="btn btn-primary" href="/shop">
            Explore Collection <ArrowRight size={16} />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main>
      <div
        className="container"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: "70px",
          padding: "65px 0 110px",
        }}
      >
        {/* Left: Cart items */}
        <div>
          <h1
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontWeight: 500,
              fontSize: "clamp(45px,5vw,58px)",
              margin: "10px 0 45px",
              lineHeight: 0.98,
            }}
          >
            Your Bag ({cartCount})
          </h1>

          {/* Cart items list */}
          <div style={{ display: "grid", gap: "20px" }}>
            {items.map((item) => (
              <div
                key={`${item.id}-${item.size}`}
                style={{
                  display: "grid",
                  gridTemplateColumns: "100px 1fr auto",
                  gap: "22px",
                  borderTop: "1px solid var(--line)",
                  paddingTop: "24px",
                }}
              >
                <div
                  style={{
                    aspectRatio: "4/5",
                    borderRadius: "4px",
                    overflow: "hidden",
                    background: "var(--stone)",
                  }}
                >
                  <img
                    src={item.image}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>
                <div>
                  <div
                    style={{
                      fontFamily: "Cormorant Garamond, serif",
                      fontSize: "24px",
                      fontWeight: 500,
                      lineHeight: 1.05,
                      marginBottom: "5px",
                    }}
                  >
                    {item.title}
                  </div>
                  <div style={{ fontSize: "11px", color: "var(--muted)", lineHeight: "1.5" }}>
                    {item.subtitle}
                    <br />
                    Size: {item.size}
                  </div>

                  {/* Quantity controls & Remove */}
                  <div style={{ display: "flex", alignItems: "center", gap: "18px", marginTop: "18px" }}>
                    <div className="qty-box" style={{ width: "95px", height: "36px" }}>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity - 1)}>-</button>
                      <span style={{ fontSize: "12px" }}>{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.size, item.quantity + 1)}>+</button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.id, item.size)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        fontSize: "11px",
                        color: "var(--muted)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                      }}
                    >
                      <Trash2 size={14} /> Remove
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: "14px", fontWeight: 700, textAlign: "right" }}>
                  KES {(item.price * item.quantity).toLocaleString()}
                </div>
              </div>
            ))}
          </div>

          <Link
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "11px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: "36px",
              fontWeight: 600,
            }}
          >
            ← Continue shopping
          </Link>
        </div>

        {/* Right: Order Summary */}
        <div
          style={{
            background: "#fff",
            border: "1px solid var(--line)",
            padding: "28px",
            alignSelf: "start",
            position: "sticky",
            top: "100px",
          }}
        >
          <h2
            style={{
              fontFamily: "Cormorant Garamond, serif",
              fontSize: "31px",
              fontWeight: 500,
              margin: "0 0 24px",
            }}
          >
            Order summary
          </h2>

          <div style={{ display: "grid", gap: "13px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span>KES {subtotal.toLocaleString()}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Estimated Delivery</span>
              <span>KES {deliveryFee.toLocaleString()}</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 600,
                fontSize: "15px",
                paddingTop: "17px",
                borderTop: "1px solid var(--line)",
              }}
            >
              <span>Total</span>
              <span>KES {total.toLocaleString()}</span>
            </div>
          </div>

          <Link
            href="/checkout"
            style={{
              display: "block",
              width: "100%",
              height: "52px",
              background: "var(--charcoal)",
              color: "var(--ivory)",
              border: "1px solid var(--charcoal)",
              textAlign: "center",
              lineHeight: "52px",
              fontSize: "12px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              marginTop: "22px",
              borderRadius: "4px",
            }}
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
