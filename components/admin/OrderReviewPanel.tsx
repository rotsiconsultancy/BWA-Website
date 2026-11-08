import type { SupabaseClient } from "@supabase/supabase-js";
import Link from "next/link";
import { createReviewLink } from "@/app/admin/reviews/actions";
import {
  improvementLabel,
  reviewLinkMessage,
  reviewTagLabel,
} from "@/lib/commerce/review-reward";
import { SITE_URL } from "@/lib/commerce/seo";
import { whatsAppLink } from "@/lib/commerce/whatsapp";

const when = (iso: string) =>
  new Date(iso).toLocaleString("en-KE", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Nairobi",
  });

/** Review & reward for one order: create the link, send it, see the answers. */
export default async function OrderReviewPanel({
  admin,
  order,
  firstName,
  whatsAppNumber,
}: {
  admin: SupabaseClient;
  order: { id: string; order_number: string; status: string };
  firstName: string | null;
  whatsAppNumber: string | null;
}) {
  const { data: request, error } = await admin
    .from("review_requests")
    .select(
      "id,token,created_at,expires_at,opened_at,completed_at,discount_codes(code,ends_at),reviews(id,rating,body,tags,publish_status,product_id,products(title)),review_feedback(improvements,note,status)",
    )
    .eq("order_id", order.id)
    .maybeSingle();

  let body: React.ReactNode;
  if (error?.code === "42P01" || error?.code === "PGRST205")
    body = (
      <p className="admin-field-help">
        Run Website-data/review-rewards-2026-11-08/1-add-review-rewards.sql in
        the Supabase SQL editor to switch on review links.
      </p>
    );
  else if (!request && order.status !== "delivered")
    body = (
      <p className="admin-field-help">
        Mark the order Delivered to create its review link. The client gets a
        one-time thank-you code when they review.
      </p>
    );
  else if (!request)
    body = (
      <form action={createReviewLink}>
        <input type="hidden" name="order_number" value={order.order_number} />
        <p className="admin-field-help">
          Delivered. Create a review link to send on WhatsApp.
        </p>
        <button className="admin-primary-action" type="submit">
          Create review link
        </button>
      </form>
    );
  else {
    const link = `${SITE_URL}/review/${request.token}`;
    const code: any = request.discount_codes;
    const reviews: any[] = (request.reviews as any[]) || [];
    const feedback: any = Array.isArray(request.review_feedback)
      ? request.review_feedback[0]
      : request.review_feedback;
    let used = false;
    if (code?.code) {
      const { count } = await admin
        .from("discount_redemptions")
        .select("id", { count: "exact", head: true })
        .eq("code_snapshot", code.code)
        .is("released_at", null);
      used = (count || 0) > 0;
    }
    body = (
      <>
        <div className="admin-data-list">
          <span>
            Link
            <strong className="admin-review-link">{link}</strong>
          </span>
          <span>
            Status
            <strong>
              {request.completed_at
                ? `Reviewed ${when(request.completed_at)}`
                : request.opened_at
                  ? `Opened ${when(request.opened_at)}, not sent yet`
                  : new Date(request.expires_at) <= new Date()
                    ? "Expired"
                    : `Not opened yet (link valid until ${when(request.expires_at)})`}
            </strong>
          </span>
          {code?.code && (
            <span>
              Thank-you code
              <strong>
                {code.code} ·{" "}
                {used ? "used" : `valid until ${when(code.ends_at)}`}
              </strong>
            </span>
          )}
          {reviews.map((review) => (
            <span key={review.id}>
              {review.products?.title || "Bracelet"}
              <strong>
                {"★".repeat(review.rating)}
                {"☆".repeat(5 - review.rating)} · {review.publish_status}
              </strong>
              {(review.tags?.length > 0 || review.body) && (
                <em>
                  {[...(review.tags || []).map(reviewTagLabel), review.body]
                    .filter(Boolean)
                    .join(" · ")}
                </em>
              )}
            </span>
          ))}
          {feedback && (
            <span>
              Could do better (private)
              <strong>
                {(feedback.improvements || [])
                  .map(improvementLabel)
                  .join(", ") || "—"}
              </strong>
              {feedback.note && <em>“{feedback.note}”</em>}
            </span>
          )}
        </div>
        <div className="admin-review-actions">
          {!request.completed_at && whatsAppNumber && (
            <a
              className="admin-primary-action"
              href={whatsAppLink(
                whatsAppNumber,
                reviewLinkMessage(firstName, link),
              )}
              target="_blank"
              rel="noopener noreferrer"
            >
              Send review link on WhatsApp
            </a>
          )}
          {reviews.length > 0 && (
            <Link href="/admin/reviews">All reviews →</Link>
          )}
        </div>
      </>
    );
  }

  return (
    <section className="admin-panel" id="review">
      <p className="admin-kicker">Review & reward</p>
      {body}
    </section>
  );
}
