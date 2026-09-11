export default function OrderSummary() {
  return (
    <aside className="summary">
      <h2 className="display">Your order</h2>
      <div className="order-item">
        <div className="card-img" style={{ aspectRatio: "4/5" }}>
          <div className="ring" />
        </div>
        <div>
          <div className="display" style={{ fontSize: 22 }}>
            THE GROUNDED
          </div>
          <div className="muted" style={{ fontSize: 10 }}>
            Black Onyx + Lava Stone
            <br />
            Qty 1
          </div>
        </div>
        <div>KES 3,800</div>
      </div>
      <div className="summary-row">
        <span>Subtotal</span>
        <span>KES 3,800</span>
      </div>
      <div className="summary-row">
        <span>Delivery</span>
        <span>KES 250</span>
      </div>
      <div className="summary-row total">
        <span>Total</span>
        <span>KES 4,050</span>
      </div>
    </aside>
  );
}
