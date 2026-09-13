import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";

export default async function CustomersPage() {
  const { admin } = await requireAdmin();
  const { data: customers } = await admin
    .from("customers")
    .select(
      "id,first_name,last_name,email,phone,marketing_opt_in,created_at,orders(count)",
    )
    .order("created_at", { ascending: false })
    .limit(80);
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Customer care"
        title="Customers"
        description="BWA-owned customer records, purchase history, consent, and bespoke context."
      />
      <div className="admin-list-toolbar">
        <p>
          {customers?.length || 0} recent customer
          {customers?.length === 1 ? "" : "s"}
        </p>
      </div>
      <div className="admin-table admin-customers-table">
        <div className="admin-table-head">
          <span>Customer</span>
          <span>Contact</span>
          <span>Orders</span>
          <span>Marketing</span>
        </div>
        {customers?.map((customer: any) => (
          <Link key={customer.id} href={`/admin/customers/${customer.id}`}>
            <strong>
              {customer.first_name} {customer.last_name || ""}
              <small>
                Joined{" "}
                {new Date(customer.created_at).toLocaleDateString("en-KE")}
              </small>
            </strong>
            <span>
              {customer.phone}
              <small>{customer.email || "No email"}</small>
            </span>
            <strong>{customer.orders?.[0]?.count || 0}</strong>
            <span
              className={`admin-status ${customer.marketing_opt_in ? "admin-status-live" : "admin-status-draft"}`}
            >
              {customer.marketing_opt_in ? "Opted in" : "Not opted in"}
            </span>
          </Link>
        )) || <p className="admin-table-empty">No customers yet.</p>}
      </div>
    </div>
  );
}
