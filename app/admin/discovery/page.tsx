import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import { requireAdmin } from "@/lib/admin/auth";
import { createQuizVersion, createStarterQuiz } from "./actions";

const PAGE_SIZE = 10;

export default async function DiscoveryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { admin } = await requireAdmin();
  const [
    { data: versions, count: totalCount },
    { count: completions },
    { count: bagAdds },
    { count: bespokeStarts },
    { count: orders },
  ] = await Promise.all([
    admin
      .from("quiz_versions")
      .select("id,title,status,published_at,quiz_questions(count)", {
        count: "exact",
      })
      .order("created_at", { ascending: false })
      .range(from, to),
    admin
      .from("discovery_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "quiz_completed"),
    admin
      .from("discovery_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "added_to_bag"),
    admin
      .from("discovery_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "bespoke_started"),
    admin
      .from("discovery_events")
      .select("*", { count: "exact", head: true })
      .eq("event_type", "order_created"),
  ]);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Find Your Bracelet"
        title="Discovery"
        description="Published quiz versions guide customers to live BWA products. Drafts stay private until you publish."
      />
      {params.error && (
        <p className="admin-form-notice is-error">
          The quiz version could not be saved. Please check the fields and try
          again.
        </p>
      )}
      <section
        className="admin-discovery-metrics"
        aria-label="Discovery performance"
      >
        <div>
          <span>Quiz completions</span>
          <strong>{completions || 0}</strong>
        </div>
        <div>
          <span>Added to bag</span>
          <strong>{bagAdds || 0}</strong>
        </div>
        <div>
          <span>Bespoke starts</span>
          <strong>{bespokeStarts || 0}</strong>
        </div>
        <div>
          <span>Orders created</span>
          <strong>{orders || 0}</strong>
        </div>
      </section>
      <section className="admin-discovery-start">
        <div>
          <p className="admin-kicker">Start here</p>
          <h2>Use the BWA starter quiz</h2>
          <p>
            It already has four customer-friendly questions and the right
            bracelet matches. You can simply change the words, add choices, then
            publish when it feels right.
          </p>
        </div>
        <form action={createStarterQuiz}>
          <button className="admin-primary-action" type="submit">
            Start with the BWA template
          </button>
        </form>
      </section>
      <details className="admin-discovery-manual">
        <summary>Or create an empty quiz from scratch</summary>
        <form action={createQuizVersion} className="admin-discovery-create">
          <label>
            Draft name
            <input
              name="title"
              required
              placeholder="e.g. Holiday gifting discovery"
            />
          </label>
          <button className="admin-secondary-action" type="submit">
            Create blank draft
          </button>
        </form>
      </details>
      <div className="admin-table">
        <div className="admin-table-head">
          <span>Version</span>
          <span>State</span>
          <span>Questions</span>
          <span>Published</span>
        </div>
        {versions?.map((version: any) => (
          <Link key={version.id} href={`/admin/discovery/${version.id}`}>
            <strong>{version.title}</strong>
            <span className={`admin-status admin-status-${version.status}`}>
              {version.status}
            </span>
            <strong>{version.quiz_questions?.[0]?.count || 0}</strong>
            <span>
              {version.published_at
                ? new Date(version.published_at).toLocaleDateString("en-KE")
                : "—"}
            </span>
          </Link>
        )) || (
          <p className="admin-table-empty">
            No quiz version exists yet. The current public quiz remains
            available as the safe fallback.
          </p>
        )}
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
