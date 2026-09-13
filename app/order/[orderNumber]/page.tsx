"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";

const labels: Record<string, string> = {
  order_received: "Order received",
  payment_pending: "Payment pending",
  payment_confirmed: "Payment confirmed",
  hand_crafting: "Hand-crafting",
  quality_checked: "Quality checked",
  ready_for_dispatch: "Ready for dispatch",
  dispatched: "Dispatched",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export default function OrderTrackingPage() {
  const params = useParams<{ orderNumber: string }>();
  const [phone, setPhone] = useState("");
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState("");
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    const response = await fetch("/api/orders/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderNumber: params.orderNumber, phone }),
    });
    const data = await response.json();
    if (!response.ok || !data.order)
      return setError(data.error || "We could not verify those order details.");
    setResult(data.order);
  };
  return (
    <main className="order-track-page">
      <p className="eyebrow">BWA order tracking</p>
      <h1>Follow your piece.</h1>
      <p>Enter the phone number used at checkout to view your order.</p>
      {!result ? (
        <form onSubmit={submit}>
          <label>
            Phone number
            <input
              required
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+254 7XX XXX XXX"
            />
          </label>
          {error && <p role="alert">{error}</p>}
          <button className="btn btn-primary">View order</button>
        </form>
      ) : (
        <section className="track-result">
          <p className="eyebrow">{result.order_number}</p>
          <h2>{labels[result.status] || result.status}</h2>
          <p>
            Payment: {result.payment_status}. Delivery: {result.delivery_method}
            .
          </p>
          {result.courier_name && (
            <p>
              Courier: {result.courier_name}
              {result.tracking_reference
                ? ` · ${result.tracking_reference}`
                : ""}
            </p>
          )}
          {result.order_status_history?.length > 0 && (
            <ol className="track-timeline">
              {[...result.order_status_history]
                .sort(
                  (a: any, b: any) =>
                    new Date(a.created_at).getTime() -
                    new Date(b.created_at).getTime(),
                )
                .map((item: any) => (
                  <li key={item.created_at}>
                    <strong>{labels[item.status] || item.status}</strong>
                    <span>{item.note || "Status updated"}</span>
                  </li>
                ))}
            </ol>
          )}
          <ul>
            {result.order_items?.map((item: any) => (
              <li key={item.variant_title_snapshot}>
                {item.product_title_snapshot} · {item.variant_title_snapshot} ×{" "}
                {item.quantity}
              </li>
            ))}
          </ul>
        </section>
      )}
      <Link href="/shop">Return to the collection</Link>
    </main>
  );
}
