import Link from "next/link";
import {
  ArrowRight,
  CircleAlert,
  Package,
  RefreshCw,
  ShoppingBag,
} from "lucide-react";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminDashboard() {
  const { admin, profile } = await requireAdmin();
  const [
    { count: orders },
    { count: pendingSync },
    { count: lowStock },
    { data: recentOrders },
  ] = await Promise.all([
    admin
      .from("orders")
      .select("*", { count: "exact", head: true })
      .in("status", [
        "order_received",
        "payment_pending",
        "payment_confirmed",
        "hand_crafting",
      ]),
    admin
      .from("crm_sync_outbox")
      .select("*", { count: "exact", head: true })
      .in("status", ["pending", "failed"]),
    admin
      .from("product_variants")
      .select("*", { count: "exact", head: true })
      .lte("stock_quantity", 3)
      .eq("active", true),
    admin
      .from("orders")
      .select(
        "order_number,status,total_amount,customers(first_name,last_name)",
      )
      .order("created_at", { ascending: false })
      .limit(5),
  ]);
  const firstName = profile.display_name?.split(" ")[0] || "there";

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="BWA operations"
        title={`Good to see you, ${firstName}.`}
        description="A clear view of what needs attention in the BWA commerce record."
      />
      <div className="admin-stat-grid">
        <Link href="/admin/orders" className="admin-stat-card">
          <span className="admin-stat-icon">
            <ShoppingBag aria-hidden="true" size={18} />
          </span>
          <span>Orders to move</span>
          <strong>{orders ?? 0}</strong>
          <small>
            Open fulfilment queue <ArrowRight aria-hidden="true" size={14} />
          </small>
        </Link>
        <Link href="/admin/products" className="admin-stat-card">
          <span className="admin-stat-icon">
            <Package aria-hidden="true" size={18} />
          </span>
          <span>Low stock variants</span>
          <strong>{lowStock ?? 0}</strong>
          <small>
            Review inventory <ArrowRight aria-hidden="true" size={14} />
          </small>
        </Link>
        <Link href="/admin/sync" className="admin-stat-card">
          <span className="admin-stat-icon">
            <RefreshCw aria-hidden="true" size={18} />
          </span>
          <span>CRM sync queue</span>
          <strong>{pendingSync ?? 0}</strong>
          <small>
            Review sync work <ArrowRight aria-hidden="true" size={14} />
          </small>
        </Link>
      </div>
      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-panel-wide">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Live queue</p>
              <h2>Latest orders</h2>
            </div>
            <Link href="/admin/orders">
              All orders <ArrowRight aria-hidden="true" size={15} />
            </Link>
          </div>
          {recentOrders && recentOrders.length > 0 ? (
            <div className="admin-recent-list">
              {recentOrders.map((order: any) => (
                <Link href="/admin/orders" key={order.order_number}>
                  <span>
                    <strong>{order.order_number}</strong>
                    <small>
                      {order.customers?.first_name || "Guest"}{" "}
                      {order.customers?.last_name || ""}
                    </small>
                  </span>
                  <span className={`admin-status admin-status-${order.status}`}>
                    {order.status.replaceAll("_", " ")}
                  </span>
                  <strong>
                    KES {Number(order.total_amount).toLocaleString()}
                  </strong>
                </Link>
              ))}
            </div>
          ) : (
            <div className="admin-empty-state">
              <ShoppingBag aria-hidden="true" size={22} />
              <p>
                New website orders will appear here as soon as they are created.
              </p>
            </div>
          )}
        </section>
        <aside className="admin-panel admin-attention-panel">
          <div className="admin-panel-heading">
            <div>
              <p className="admin-kicker">Operating rule</p>
              <h2>Local first</h2>
            </div>
          </div>
          <CircleAlert aria-hidden="true" size={22} />
          <p>
            Orders, stock, and client records are secure in BWA even if the CRM
            is unavailable.
          </p>
          <Link href="/admin/sync">
            Check CRM sync <ArrowRight aria-hidden="true" size={15} />
          </Link>
        </aside>
      </div>
    </div>
  );
}
