import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
export default async function AdminSync() {
  const { admin } = await requireAdmin();
  const { data: jobs } = await admin
    .from("crm_sync_outbox")
    .select("id,entity_type,operation,status,retry_count,last_error")
    .limit(40);
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Downstream CRM"
        title="Sync queue"
        description="BWA remains the source of truth. CRM activity is reviewable and never blocks customer operations."
      />
      <div className="admin-list-toolbar">
        <p>
          {jobs?.length || 0} queued record{jobs?.length === 1 ? "" : "s"}
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
    </div>
  );
}
