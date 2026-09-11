import Link from "next/link";
import OrderSummary from "@/components/commerce/OrderSummary";
export default function Cart() {
  return (
    <main className="container cart-layout">
      <section>
        <div className="eyebrow">Your bag</div>
        <h1 className="display">Ready when you are.</h1>
        <div className="cart-item">
          <div className="cart-thumb">
            <div className="ring" />
          </div>
          <div>
            <div className="display" style={{ fontSize: 28 }}>
              THE GROUNDED
            </div>
            <div className="muted" style={{ fontSize: 11 }}>
              Black Onyx + Lava Stone
            </div>
            <div style={{ marginTop: 15, fontSize: 11 }}>Qty 1 · Standard</div>
          </div>
          <div>KES 3,800</div>
        </div>
        <Link className="smallcaps" href="/shop">
          ← Continue shopping
        </Link>
      </section>
      <div>
        <OrderSummary />
        <Link
          href="/checkout"
          className="btn primary full-btn"
          style={{ marginTop: 15 }}
        >
          Proceed to checkout
        </Link>
      </div>
    </main>
  );
}
