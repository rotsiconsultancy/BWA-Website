import Link from "next/link";

export default function CartPage() {
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
            Your Bag
          </h1>

          {/* Cart item */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "120px 1fr auto",
              gap: "22px",
              borderTop: "1px solid var(--line)",
              padding: "20px 0",
            }}
          >
            <div
              style={{
                aspectRatio: "4/5",
                background: "linear-gradient(145deg,#292825,#81735e)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  width: "55px",
                  height: "55px",
                  border: "8px solid #25221f",
                  borderRadius: "50%",
                  boxShadow: "inset 0 0 0 2.5px #8f785b",
                }}
              />
            </div>
            <div>
              <div
                style={{
                  fontFamily: "Cormorant Garamond, serif",
                  fontSize: "28px",
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
                M / 18cm · Adjustable / Unisex
              </div>
              <div style={{ marginTop: "15px", fontSize: "11px" }}>Qty 1</div>
            </div>
            <div style={{ fontSize: "12px", fontWeight: 700 }}>KES 3,800</div>
          </div>

          <Link
            href="/shop"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "10px",
              letterSpacing: "0.12em",
              textTransform: "uppercase",
              marginTop: "16px",
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

          {/* Mini item */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "65px 1fr auto",
              gap: "12px",
              alignItems: "start",
              borderBottom: "1px solid var(--line)",
              paddingBottom: "20px",
              marginBottom: "20px",
              fontSize: "11px",
            }}
          >
            <div
              style={{
                width: "65px",
                height: "80px",
                background: "linear-gradient(145deg,#292825,#81735e)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <div
                style={{
                  width: "42px",
                  height: "42px",
                  border: "6px solid #25221f",
                  borderRadius: "50%",
                  boxShadow: "inset 0 0 0 2px #8f785b",
                }}
              />
            </div>
            <div>
              <div style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "16px", marginBottom: "3px" }}>
                THE GROUNDED
              </div>
              <div style={{ color: "var(--muted)" }}>M / 18cm · Qty 1</div>
            </div>
            <div>KES 3,800</div>
          </div>

          <div style={{ display: "grid", gap: "13px", fontSize: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Subtotal</span>
              <span>KES 3,800</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Delivery</span>
              <span>KES 250</span>
            </div>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                fontWeight: 600,
                fontSize: "14px",
                paddingTop: "17px",
                borderTop: "1px solid var(--line)",
              }}
            >
              <span>Total</span>
              <span>KES 4,050</span>
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
            }}
          >
            Proceed to checkout
          </Link>
        </div>
      </div>
    </main>
  );
}
