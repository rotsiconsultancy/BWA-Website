import PageHeader from "@/components/admin/PageHeader";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
export default async function AdminOrders() {
  const { admin } = await requireAdmin();
  const { data: orders } = await admin
    .from("orders")
    .select(
      "order_number,status,payment_status,total_amount,created_at,customers(first_name,last_name,phone)",
    )
    .order("created_at", { ascending: false })
    .limit(40);
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Every customer order begins here, in BWA—not in the CRM."
      />
      <div className="admin-list-toolbar">
        <p>
          {orders?.length || 0} recent order{orders?.length === 1 ? "" : "s"}
        </p>
        <span className="admin-toolbar-note">
          Status editing is the next operational release.
        </span>
      </div>
      <div className="admin-table admin-orders-table">
        <div className="admin-table-head">
          <span>Order</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Total</span>
        </div>
        {orders?.map((order: any) => (
          <Link
            href={`/admin/orders/${order.order_number}`}
            key={order.order_number}
          >
            <strong>{order.order_number}</strong>
            <span>
              {order.customers?.first_name || "—"}{" "}
              {order.customers?.last_name || ""}
              <small>{order.customers?.phone}</small>
            </span>
            <span className={`admin-status admin-status-${order.status}`}>
              {order.status.replaceAll("_", " ")}
            </span>
            <strong>KES {Number(order.total_amount).toLocaleString()}</strong>
          </Link>
        )) || <p className="admin-table-empty">No orders yet.</p>}
      </div>
    </div>
  );
}
