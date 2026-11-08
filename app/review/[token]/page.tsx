import type { Metadata } from "next";
import Link from "next/link";
import ReviewForm, { ReviewThanks } from "@/components/review/ReviewForm";
import { loadReviewRequest } from "@/lib/commerce/review-request";
import { REVIEW_REWARD } from "@/lib/commerce/review-reward";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "How did it go? | Beads World Africa",
  robots: { index: false, follow: false },
};

export default async function ReviewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const supabase = getSupabaseAdmin();
  const found = supabase ? await loadReviewRequest(supabase, token) : null;
  const view = found?.view ?? { state: "missing" as const };

  if (view.state === "open")
    return (
      <main className="review-page">
        <ReviewForm
          token={token}
          firstName={view.firstName}
          bracelets={view.bracelets}
          amountKes={REVIEW_REWARD.amountKes}
          validDays={REVIEW_REWARD.validDays}
        />
      </main>
    );

  if (view.state === "done")
    return (
      <main className="review-page">
        <ReviewThanks
          code={view.code}
          endsAt={view.endsAt}
          used={view.used}
          amountKes={REVIEW_REWARD.amountKes}
          again
        />
      </main>
    );

  return (
    <main className="review-page">
      <section className="review-card review-card-plain">
        <p className="eyebrow">Beads World Africa</p>
        <h1>
          {view.state === "expired"
            ? "This review link has expired."
            : "We couldn't find this review link."}
        </h1>
        <p>
          Message us on WhatsApp and we&apos;ll sort it out. We&apos;d still
          love to hear how your bracelet is doing.
        </p>
        <Link className="btn btn-primary" href="/bracelets">
          See the bracelets
        </Link>
      </section>
    </main>
  );
}
