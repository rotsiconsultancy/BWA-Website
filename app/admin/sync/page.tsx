import PageHeader from "@/components/admin/PageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import { requireAdmin } from "@/lib/admin/auth";

const PAGE_SIZE = 15;

export default async function AdminSync({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { admin } = await requireAdmin();
  const { data: jobs, count: totalCount } = await admin
    .from("crm_sync_outbox")
    .select("id,entity_type,operation,status,retry_count,last_error", {
      count: "exact",
    })
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Downstream CRM"
        title="Sync queue"
        description="BWA remains the source of truth. CRM activity is reviewable and never blocks customer operations."
      />
      <div className="admin-list-toolbar">
        <p>
          {totalCount || 0} queued record{totalCount === 1 ? "" : "s"}
        </p>
        <span className="admin-toolbar-note">
          Manual sync controls are the next integration release.
        </span>
      </div>
      <div className="admin-table admin-sync-table">
        <div className="admin-table-head">
          <span>Record</span>
          <span>Action</span>
          <span>Status</span>
          <span>Detail</span>
        </div>
        {jobs?.map((job: any) => (
          <div key={job.id}>
            <strong>{job.entity_type}</strong>
            <span>{job.operation}</span>
            <span className={`admin-status admin-status-${job.status}`}>
              {job.status}
            </span>
            <span>{job.last_error || "Waiting for manual sync"}</span>
          </div>
        )) || <p className="admin-table-empty">No sync jobs yet.</p>}
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
