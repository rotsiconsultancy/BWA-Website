import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import { requireAdmin } from "@/lib/admin/auth";

const PAGE_SIZE = 10;

export default async function CustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { admin } = await requireAdmin();
  const { data: customers, count: totalCount } = await admin
    .from("customers")
    .select(
      "id,first_name,last_name,email,phone,marketing_opt_in,created_at,orders(count)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Customer care"
        title="Customers"
        description="BWA-owned customer records, purchase history, consent, and bespoke context."
      />
      <div className="admin-list-toolbar">
        <p>
          {totalCount || 0} customer{totalCount === 1 ? "" : "s"}
        </p>
      </div>
      <div className="admin-table admin-customers-table">
        <div className="admin-table-head">
          <span>Customer</span>
          <span>Contact</span>
          <span>Orders</span>
          <span>Marketing</span>
          <span>Manage</span>
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
            <span className="admin-table-action">View profile →</span>
          </Link>
        )) || <p className="admin-table-empty">No customers yet.</p>}
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
