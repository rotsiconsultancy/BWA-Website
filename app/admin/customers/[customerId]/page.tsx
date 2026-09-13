import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

export default async function CustomerDetail({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { admin } = await requireAdmin();
  const { customerId } = await params;
  const { data: customer } = await admin
    .from("customers")
    .select(
      "id,first_name,last_name,email,phone,whatsapp_opt_in,marketing_opt_in,source,created_at,customer_addresses(address,city,county,delivery_note,is_default),orders(order_number,status,total_amount,created_at),custom_bracelet_requests(request_number,status,intention,palette,created_at)",
    )
    .eq("id", customerId)
    .maybeSingle();
  if (!customer) notFound();
  return (
    <div className="admin-page">
      <Link href="/admin/customers" className="admin-back-link">
        ← All customers
      </Link>
      <header className="admin-order-header">
        <div>
          <p className="admin-kicker">Customer profile</p>
          <h1>
            {customer.first_name} {customer.last_name || ""}
          </h1>
          <p>
            {customer.phone} · {customer.email || "No email"}
          </p>
        </div>
      </header>
      <div className="admin-order-grid">
        <section className="admin-panel">
          <p className="admin-kicker">Consent & source</p>
          <div className="admin-data-list">
            <span>
              WhatsApp
              <strong>
                {customer.whatsapp_opt_in ? "Allowed" : "Not opted in"}
              </strong>
            </span>
            <span>
              Marketing
              <strong>
                {customer.marketing_opt_in ? "Allowed" : "Not opted in"}
              </strong>
            </span>
            <span>
              Source<strong>{customer.source}</strong>
            </span>
          </div>
        </section>
        <section className="admin-panel">
          <p className="admin-kicker">Saved addresses</p>
          <div className="admin-data-list">
            {customer.customer_addresses?.length ? (
              customer.customer_addresses.map((address: any, index: number) => (
                <span key={index}>
                  <strong>
                    {[address.address, address.city, address.county]
                      .filter(Boolean)
                      .join(", ")}
                  </strong>
                  <em>{address.delivery_note || "No delivery note"}</em>
                </span>
              ))
            ) : (
              <p>No saved address yet.</p>
            )}
          </div>
        </section>
        <section className="admin-panel">
          <p className="admin-kicker">Order history</p>
          <div className="admin-data-list">
            {customer.orders?.length ? (
              customer.orders.map((order: any) => (
                <Link
                  key={order.order_number}
                  href={`/admin/orders/${order.order_number}`}
                >
                  <strong>
                    {order.order_number} · KES{" "}
                    {Number(order.total_amount).toLocaleString()}
                  </strong>
                  <em>
                    {order.status.replaceAll("_", " ")} ·{" "}
                    {new Date(order.created_at).toLocaleDateString("en-KE")}
                  </em>
                </Link>
              ))
            ) : (
              <p>No orders yet.</p>
            )}
          </div>
        </section>
        <section className="admin-panel">
          <p className="admin-kicker">Bespoke requests</p>
          <div className="admin-data-list">
            {customer.custom_bracelet_requests?.length ? (
              customer.custom_bracelet_requests.map((request: any) => (
                <span key={request.request_number}>
                  <strong>{request.request_number}</strong>
                  <em>
                    {request.status} ·{" "}
                    {(request.intention || []).join(", ") ||
                      "No intention selected"}
                  </em>
                </span>
              ))
            ) : (
              <p>No bespoke requests yet.</p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
