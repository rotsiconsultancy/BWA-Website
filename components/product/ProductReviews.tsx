import { reviewTagLabel } from "@/lib/commerce/review-reward";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const when = (iso: string) =>
  new Intl.DateTimeFormat("en-KE", {
    month: "long",
    year: "numeric",
    timeZone: "Africa/Nairobi",
  }).format(new Date(iso));

/** Reviews the owner approved, from clients who allowed showing them. */
export default async function ProductReviews({
  productId,
}: {
  productId: string;
}) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return null;
  const { data, error } = await supabase
    .from("reviews")
    .select("id,rating,body,tags,display_name,town,incentivised,created_at")
    .eq("product_id", productId)
    .eq("publish_status", "published")
    .eq("publication_consent", true)
    .order("created_at", { ascending: false })
    .limit(12);
  if (error || !data?.length) return null;
  const average = data.reduce((sum, r) => sum + r.rating, 0) / data.length;
  return (
    <section
      className="product-reviews container"
      aria-labelledby="product-reviews-title"
    >
      <p className="eyebrow">From people wearing it</p>
      <h2 id="product-reviews-title">
        {average.toFixed(1)} out of 5{" "}
        <small>
          · {data.length} review{data.length === 1 ? "" : "s"}
        </small>
      </h2>
      <ul>
        {data.map((r) => (
          <li key={r.id}>
            <span
              className="product-review-stars"
              aria-label={`${r.rating} out of 5`}
            >
              {"★".repeat(r.rating)}
              <span aria-hidden="true">{"★".repeat(5 - r.rating)}</span>
            </span>
            {r.body && <p>“{r.body}”</p>}
            {r.tags?.length > 0 && (
              <p className="product-review-tags">
                {r.tags.map(reviewTagLabel).join(" · ")}
              </p>
            )}
            <small>
              {[r.display_name || "Verified buyer", r.town]
                .filter(Boolean)
                .join(", ")}{" "}
              · {when(r.created_at)} · Verified buyer
              {r.incentivised && " · received a thank-you code"}
            </small>
          </li>
        ))}
      </ul>
    </section>
  );
}
