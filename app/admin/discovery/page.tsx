import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { createQuizVersion, createStarterQuiz } from "./actions";

export default async function DiscoveryAdmin({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const params = await searchParams;
  const { admin } = await requireAdmin();
  const { data: versions } = await admin
    .from("quiz_versions")
    .select("id,title,status,published_at,quiz_questions(count)")
    .order("created_at", { ascending: false });
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
    </div>
  );
}
