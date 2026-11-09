import PageHeader from "@/components/admin/PageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/auth";
import { orderSourceLabel } from "@/lib/commerce/manual-order";

const PAGE_SIZE = 10;

export default async function AdminOrders({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { admin } = await requireAdmin();
  const { data: orders, count: totalCount } = await admin
    .from("orders")
    .select(
      "order_number,status,payment_status,total_amount,currency,created_at,source,customers(first_name,last_name,phone)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Fulfilment"
        title="Orders"
        description="Every customer order begins here, in BWA—not in the CRM."
        action={{ href: "/admin/orders/new", label: "Record an order" }}
      />
      <div className="admin-list-toolbar">
        <p>
          {totalCount || 0} order{totalCount === 1 ? "" : "s"}
        </p>
        <span className="admin-toolbar-note">
          Status editing is available in order detail.
        </span>
      </div>
      <div className="admin-table admin-orders-table">
        <div className="admin-table-head">
          <span>Order</span>
          <span>Customer</span>
          <span>Status</span>
          <span>Total</span>
          <span>Manage</span>
        </div>
        {orders?.map((order: any) => (
          <Link
            href={`/admin/orders/${order.order_number}`}
            key={order.order_number}
          >
            <strong>
              {order.order_number}
              <small>
                {new Date(order.created_at).toLocaleDateString("en-KE", {
                  dateStyle: "medium",
                  timeZone: "Africa/Nairobi",
                })}
                {" · "}
                {orderSourceLabel(order.source)}
              </small>
            </strong>
            <span>
              {order.customers?.first_name || "—"}{" "}
              {order.customers?.last_name || ""}
              <small>{order.customers?.phone}</small>
            </span>
            <span className={`admin-status admin-status-${order.status}`}>
              {order.status.replaceAll("_", " ")}
            </span>
            <strong>
              {order.currency} {Number(order.total_amount).toLocaleString()}
            </strong>
            <span className="admin-table-action">View order →</span>
          </Link>
        )) || <p className="admin-table-empty">No orders yet.</p>}
      </div>
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount || 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
