import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import {
  IMPROVEMENT_OPTIONS,
  improvementLabel,
  reviewTagLabel,
} from "@/lib/commerce/review-reward";
import { toWhatsAppNumber, whatsAppLink } from "@/lib/commerce/whatsapp";
import { setFeedbackStatus, setReviewStatus } from "./actions";

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-KE", {
    day: "numeric",
    month: "short",
    timeZone: "Africa/Nairobi",
  }).format(new Date(iso));

const PUBLISH_LABELS: Record<string, string> = {
  pending: "Waiting for you",
  published: "On the website",
  rejected: "Hidden",
};
const FEEDBACK_LABELS: Record<string, string> = {
  new: "New",
  replied: "Replied",
  done: "Done",
};

export default async function AdminReviews({
  searchParams,
}: {
  searchParams: Promise<{ show?: string }>;
}) {
  const { show = "pending" } = await searchParams;
  const { admin } = await requireAdmin();

  let reviewQuery = admin
    .from("reviews")
    .select(
      "id,rating,body,tags,display_name,town,publication_consent,publish_status,created_at,products(title),orders(order_number)",
    )
    .order("created_at", { ascending: false })
    .limit(60);
  if (show !== "all") reviewQuery = reviewQuery.eq("publish_status", show);
  const [reviews, feedback, requests] = await Promise.all([
    reviewQuery,
    admin
      .from("review_feedback")
      .select(
        "id,improvements,note,status,created_at,orders(order_number,customers(first_name,phone))",
      )
      .order("created_at", { ascending: false })
      .limit(200),
    admin
      .from("review_requests")
      .select("id,completed_at,opened_at", { count: "exact" }),
  ]);
  const missing = ["42P01", "PGRST205", "42703"].includes(
    (feedback.error || requests.error || reviews.error)?.code || "",
  );

  const allFeedback: any[] = feedback.data || [];
  const counts = new Map<string, number>();
  for (const item of allFeedback)
    for (const id of item.improvements || [])
      counts.set(id, (counts.get(id) || 0) + 1);
  const ranked = IMPROVEMENT_OPTIONS.map((o) => ({
    ...o,
    count: counts.get(o.id) || 0,
  }))
    .filter((o) => o.count > 0)
    .sort((a, b) => b.count - a.count);
  const sent = requests.count || 0;
  const done = (requests.data || []).filter((r: any) => r.completed_at).length;
  const opened = (requests.data || []).filter((r: any) => r.opened_at).length;

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Review & reward"
        title="Reviews"
        description="Reviews from the review link on delivered orders. Nothing shows on the website until you put it there. What clients say we could do better stays here."
      />
      {missing ? (
        <p className="admin-table-empty">
          Run Website-data/review-rewards-2026-11-08/1-add-review-rewards.sql in
          the Supabase SQL editor to switch on review links.
        </p>
      ) : (
        <>
          <div className="admin-stat-grid">
            <div className="admin-panel">
              <p className="admin-kicker">Links made</p>
              <h2>{sent}</h2>
            </div>
            <div className="admin-panel">
              <p className="admin-kicker">Opened</p>
              <h2>{opened}</h2>
            </div>
            <div className="admin-panel">
              <p className="admin-kicker">Reviewed</p>
              <h2>
                {done}
                {sent > 0 && (
                  <small> ({Math.round((done / sent) * 100)}%)</small>
                )}
              </h2>
            </div>
          </div>

          <section className="admin-panel admin-review-section">
            <p className="admin-kicker">What we could do better (private)</p>
            {ranked.length ? (
              <ol className="admin-improvement-bars">
                {ranked.map((o) => (
                  <li key={o.id}>
                    <span>{o.label}</span>
                    <span
                      className="admin-improvement-bar"
                      style={{
                        width: `${(o.count / ranked[0].count) * 100}%`,
                      }}
                    />
                    <strong>{o.count}</strong>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="admin-field-help">No answers yet.</p>
            )}
            {allFeedback.filter((f) => f.status !== "done").length > 0 && (
              <div className="admin-table admin-feedback-table">
                {allFeedback
                  .filter((f) => f.status !== "done")
                  .slice(0, 30)
                  .map((f) => {
                    const customer = f.orders?.customers;
                    const number = toWhatsAppNumber(customer?.phone);
                    const unhappy =
                      (f.improvements || []).some(
                        (i: string) => i !== "nothing",
                      ) || f.note;
                    return (
                      <div key={f.id}>
                        <span>
                          <strong>
                            <Link
                              href={`/admin/orders/${f.orders?.order_number}#review`}
                            >
                              {f.orders?.order_number}
                            </Link>
                          </strong>
                          <br />
                          <small>
                            {customer?.first_name || "—"} · {when(f.created_at)}
                          </small>
                        </span>
                        <span>
                          {(f.improvements || [])
                            .map(improvementLabel)
                            .join(", ") || "—"}
                          {f.note && (
                            <>
                              <br />
                              <small>“{f.note}”</small>
                            </>
                          )}
                        </span>
                        <span>
                          {number && unhappy && (
                            <a
                              href={whatsAppLink(
                                number,
                                `Hello ${customer?.first_name || "there"}, this is Beads World Africa. Thank you for your review and for telling us what we could do better. `,
                              )}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              Reply on WhatsApp
                            </a>
                          )}
                        </span>
                        <form
                          action={setFeedbackStatus}
                          className="admin-designs-status"
                        >
                          <input type="hidden" name="id" value={f.id} />
                          <select
                            name="status"
                            defaultValue={f.status}
                            aria-label="Follow-up status"
                          >
                            {Object.entries(FEEDBACK_LABELS).map(([v, l]) => (
                              <option key={v} value={v}>
                                {l}
                              </option>
                            ))}
                          </select>
                          <button type="submit">Save</button>
                        </form>
                      </div>
                    );
                  })}
              </div>
            )}
          </section>

          <nav className="admin-review-filter" aria-label="Show reviews">
            {["pending", "published", "rejected", "all"].map((key) => (
              <Link
                key={key}
                href={`/admin/reviews?show=${key}`}
                aria-current={show === key ? "page" : undefined}
              >
                {key === "all" ? "All" : PUBLISH_LABELS[key]}
              </Link>
            ))}
          </nav>
          <div className="admin-table admin-reviews-table">
            <div className="admin-table-head">
              <span>Review</span>
              <span>What they said</span>
              <span>Shown as</span>
              <span>On the website</span>
            </div>
            {(reviews.data || []).length ? (
              (reviews.data as any[]).map((r) => (
                <div key={r.id}>
                  <span>
                    <strong>
                      {"★".repeat(r.rating)}
                      {"☆".repeat(5 - r.rating)}
                    </strong>
                    <br />
                    <small>
                      {r.products?.title || "Bracelet"} ·{" "}
                      <Link
                        href={`/admin/orders/${r.orders?.order_number}#review`}
                      >
                        {r.orders?.order_number}
                      </Link>{" "}
                      · {when(r.created_at)}
                    </small>
                  </span>
                  <span>
                    {[...(r.tags || []).map(reviewTagLabel), r.body]
                      .filter(Boolean)
                      .join(" · ") || "—"}
                  </span>
                  <span>
                    {r.publication_consent
                      ? [r.display_name || "Verified buyer", r.town]
                          .filter(Boolean)
                          .join(", ")
                      : "Not allowed to show"}
                  </span>
                  <form
                    action={setReviewStatus}
                    className="admin-designs-status"
                  >
                    <input type="hidden" name="id" value={r.id} />
                    <select
                      name="status"
                      defaultValue={r.publish_status}
                      aria-label="Review status"
                      disabled={!r.publication_consent}
                    >
                      {Object.entries(PUBLISH_LABELS).map(([v, l]) => (
                        <option key={v} value={v}>
                          {l}
                        </option>
                      ))}
                    </select>
                    {r.publication_consent && (
                      <button type="submit">Save</button>
                    )}
                  </form>
                </div>
              ))
            ) : (
              <p className="admin-table-empty">No reviews here yet.</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
