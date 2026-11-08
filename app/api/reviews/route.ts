import { NextResponse } from "next/server";
import { loadReviewRequest } from "@/lib/commerce/review-request";
import {
  newThanksCode,
  parseReviewSubmission,
  REVIEW_REWARD,
} from "@/lib/commerce/review-reward";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase)
    return NextResponse.json(
      { error: "Reviews are being set up. Please try again later." },
      { status: 503 },
    );
  try {
    const body = await request.json();
    const token = String(body?.token || "");
    const found = await loadReviewRequest(supabase, token);
    if (!found)
      return NextResponse.json(
        { error: "This review link isn't valid." },
        { status: 404 },
      );
    const { view } = found;
    if (view.state === "done")
      return NextResponse.json({
        code: view.code,
        endsAt: view.endsAt,
        already: true,
      });
    if (view.state !== "open")
      return NextResponse.json(
        { error: "This review link has expired." },
        { status: 410 },
      );
    const submission = parseReviewSubmission(
      body,
      view.bracelets.map((b) => b.productId),
    );
    if (!submission)
      return NextResponse.json(
        { error: "Give each bracelet its stars, then send." },
        { status: 400 },
      );
    // A code clash is one in ~900 million; try a second code just in case.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error } = await (supabase as any).rpc(
        "submit_order_review",
        {
          p_token: token,
          p_reviews: submission.reviews,
          p_feedback: submission.feedback,
          p_display_name: submission.displayName,
          p_town: submission.town,
          p_consent: submission.consent,
          p_code: newThanksCode(),
          p_code_name: `Review thank-you · ${view.orderNumber}`,
          p_amount_kes: REVIEW_REWARD.amountKes,
          p_amount_usd: REVIEW_REWARD.amountUsd,
          p_valid_days: REVIEW_REWARD.validDays,
        },
      );
      if (error?.code === "23505" && attempt === 0) continue;
      if (error) {
        if (String(error.message).includes("REVIEW_EXPIRED"))
          return NextResponse.json(
            { error: "This review link has expired." },
            { status: 410 },
          );
        throw error;
      }
      const row = Array.isArray(data) ? data[0] : data;
      return NextResponse.json({
        code: row.code,
        endsAt: row.ends_at,
        already: row.already,
      });
    }
    throw new Error("Could not create a code.");
  } catch (error) {
    console.error("BWA review submit failed", error);
    return NextResponse.json(
      { error: "We couldn't save your review. Please try again." },
      { status: 500 },
    );
  }
}
