import Link from "next/link";
import { notFound } from "next/navigation";
import OrderFulfilmentForm from "@/components/admin/OrderFulfilmentForm";
import { requireAdmin } from "@/lib/admin/auth";
import { toWhatsAppNumber, whatsAppLink } from "@/lib/commerce/whatsapp";

export default async function AdminOrderDetail({
  params,
  searchParams,
}: {
  params: Promise<{ orderNumber: string }>;
  searchParams: Promise<{ updated?: string; error?: string }>;
}) {
  const { admin } = await requireAdmin();
  const { orderNumber } = await params;
  const query = await searchParams;
  const { data: order } = await admin
    .from("orders")
    .select(
      "id,order_number,status,payment_status,subtotal,discount_amount,discount_code_snapshot,delivery_fee,total_amount,currency,delivery_method,delivery_address,city,county,delivery_note,courier_name,tracking_reference,created_at,customers(first_name,last_name,email,phone,whatsapp_opt_in,marketing_opt_in),order_items(product_title_snapshot,variant_title_snapshot,quantity,unit_price,line_total,image_snapshot),order_status_history(status,note,created_at)",
    )
    .eq("order_number", orderNumber.toUpperCase())
    .maybeSingle();
  if (!order) notFound();
  const customer: any = order.customers;
  const customerWhatsApp = toWhatsAppNumber(customer?.phone);
  // For orders the customer created but never sent on WhatsApp.
  const followUpMessage = [
    `Hello ${customer?.first_name || "there"}, this is Beads World Africa.`,
    `Thank you for your website order ${order.order_number}:`,
    ...(order.order_items || []).map(
      (item: any) =>
        `• ${item.product_title_snapshot} (${item.variant_title_snapshot}) × ${item.quantity}`,
    ),
    `Total: ${order.currency} ${Number(order.total_amount).toLocaleString()}`,
    "",
    "Shall we go ahead and confirm payment and delivery?",
  ].join("\n");
  const history = [...(order.order_status_history || [])].sort(
    (a: any, b: any) =>
      new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
  );
  return (
    <div className="admin-page">
      <Link href="/admin/orders" className="admin-back-link">
        ← All orders
      </Link>
      <header className="admin-order-header">
        <div>
          <p className="admin-kicker">Order {order.order_number}</p>
          <h1>
            {order.currency} {Number(order.total_amount).toLocaleString()}
          </h1>
          <p>
            {new Date(order.created_at).toLocaleString("en-KE", {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </p>
        </div>
        <span className={`admin-status admin-status-${order.status}`}>
          {order.status.replaceAll("_", " ")}
        </span>
      </header>
      {query.updated && (
        <p className="admin-form-notice is-success">
          Fulfilment update saved. The customer tracking page now reflects the
          new status.
        </p>
      )}
      {query.error && (
        <p className="admin-form-notice is-error">
          We could not save that update. Please try again.
        </p>
      )}
      <div className="admin-order-grid">
        <section className="admin-panel">
          <p className="admin-kicker">Fulfilment</p>
          <OrderFulfilmentForm order={order} />
        </section>
        <aside className="admin-panel">
          <p className="admin-kicker">Customer</p>
          <h2>
            {customer?.first_name || "—"} {customer?.last_name || ""}
          </h2>
          <div className="admin-data-list">
            <span>
              Phone<strong>{customer?.phone || "—"}</strong>
            </span>
            <span>
              Email<strong>{customer?.email || "—"}</strong>
            </span>
            <span>
              WhatsApp
              <strong>
                {customer?.whatsapp_opt_in ? "Allowed" : "Not opted in"}
              </strong>
            </span>
            <span>
              Marketing
              <strong>
                {customer?.marketing_opt_in ? "Allowed" : "Not opted in"}
              </strong>
            </span>
          </div>
          {customerWhatsApp ? (
            <a
              className="admin-primary-action admin-whatsapp-action"
              href={whatsAppLink(customerWhatsApp, followUpMessage)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Message customer on WhatsApp
            </a>
          ) : (
            <p className="admin-field-help admin-whatsapp-action">
              No usable phone number on this order.
            </p>
          )}
        </aside>
        <section className="admin-panel">
          <p className="admin-kicker">Delivery</p>
          <div className="admin-data-list">
            <span>
              Method<strong>{order.delivery_method}</strong>
            </span>
            <span>
              Address
              <strong>
                {[order.delivery_address, order.city, order.county]
                  .filter(Boolean)
                  .join(", ") || "—"}
              </strong>
            </span>
            <span>
              Instructions<strong>{order.delivery_note || "—"}</strong>
            </span>
            <span>
              Courier<strong>{order.courier_name || "Not assigned"}</strong>
            </span>
            <span>
              Reference
              <strong>{order.tracking_reference || "Not assigned"}</strong>
            </span>
          </div>
        </section>
        <section className="admin-panel">
          <p className="admin-kicker">Items</p>
          <div className="admin-data-list">
            {order.order_items?.map((item: any) => (
              <span key={item.variant_title_snapshot}>
                <strong>
                  {item.product_title_snapshot} · {item.variant_title_snapshot}
                </strong>
                <em>
                  {item.quantity} × {order.currency}{" "}
                  {Number(item.unit_price).toLocaleString()} = {order.currency}{" "}
                  {Number(item.line_total).toLocaleString()}
                </em>
              </span>
            ))}
          </div>
        </section>
        <section className="admin-panel">
          <p className="admin-kicker">Order total</p>
          <div className="admin-data-list">
            <span>
              Bracelet subtotal
              <strong>
                {order.currency} {Number(order.subtotal).toLocaleString()}
              </strong>
            </span>
            {Number(order.discount_amount) > 0 && (
              <span>
                {order.discount_code_snapshot || "Discount"}
                <strong>
                  −{order.currency}{" "}
                  {Number(order.discount_amount).toLocaleString()}
                </strong>
              </span>
            )}
            <span>
              Delivery
              <strong>
                {Number(order.delivery_fee) > 0
                  ? `${order.currency} ${Number(order.delivery_fee).toLocaleString()}`
                  : order.delivery_method === "pickup"
                    ? "Collection (free)"
                    : "Arranged on WhatsApp"}
              </strong>
            </span>
            <span>
              Total
              <strong>
                {order.currency} {Number(order.total_amount).toLocaleString()}
              </strong>
            </span>
          </div>
        </section>
        <section className="admin-panel admin-order-history">
          <p className="admin-kicker">Status history</p>
          {history.length ? (
            <ol>
              {history.map((item: any) => (
                <li key={item.created_at}>
                  <strong>{item.status.replaceAll("_", " ")}</strong>
                  <span>{item.note || "Status updated"}</span>
                  <time>
                    {new Date(item.created_at).toLocaleString("en-KE", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </time>
                </li>
              ))}
            </ol>
          ) : (
            <p>No updates recorded yet.</p>
          )}
        </section>
      </div>
    </div>
  );
}
