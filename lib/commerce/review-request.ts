import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import { REVIEW_TOKEN } from "./review-reward";

export type ReviewBracelet = {
  productId: string;
  title: string;
  image: string | null;
};

export type ReviewRequestView =
  | { state: "missing" }
  | { state: "expired" }
  | {
      state: "open";
      firstName: string | null;
      orderNumber: string;
      bracelets: ReviewBracelet[];
    }
  | {
      state: "done";
      code: string | null;
      endsAt: string | null;
      used: boolean;
    };

/** Load a review link by its token: the order's bracelets, or the code if already done. */
export async function loadReviewRequest(
  supabase: SupabaseClient,
  token: string,
): Promise<{ id: string; view: ReviewRequestView } | null> {
  if (!REVIEW_TOKEN.test(token)) return null;
  const { data: request } = await supabase
    .from("review_requests")
    .select(
      "id,expires_at,completed_at,opened_at,discount_code_id,orders(order_number,customers(first_name),order_items(product_id,product_title_snapshot,image_snapshot))",
    )
    .eq("token", token)
    .maybeSingle();
  if (!request) return null;
  if (request.completed_at) {
    const { data: code } = request.discount_code_id
      ? await supabase
          .from("discount_codes")
          .select("id,code,ends_at")
          .eq("id", request.discount_code_id)
          .maybeSingle()
      : { data: null };
    const { count } = code
      ? await supabase
          .from("discount_redemptions")
          .select("id", { count: "exact", head: true })
          .eq("discount_code_id", code.id)
          .is("released_at", null)
      : { count: 0 };
    return {
      id: request.id,
      view: {
        state: "done",
        code: code?.code ?? null,
        endsAt: code?.ends_at ?? null,
        used: (count || 0) > 0,
      },
    };
  }
  if (new Date(request.expires_at) <= new Date())
    return { id: request.id, view: { state: "expired" } };
  const order: any = request.orders;
  const seen = new Set<string>();
  const bracelets: ReviewBracelet[] = [];
  for (const item of order?.order_items || []) {
    if (!item.product_id || seen.has(item.product_id)) continue;
    seen.add(item.product_id);
    bracelets.push({
      productId: item.product_id,
      title: item.product_title_snapshot,
      image: item.image_snapshot || null,
    });
  }
  if (!request.opened_at)
    await supabase
      .from("review_requests")
      .update({ opened_at: new Date().toISOString() })
      .eq("id", request.id);
  return {
    id: request.id,
    view: {
      state: "open",
      firstName: order?.customers?.first_name ?? null,
      orderNumber: order?.order_number ?? "",
      bracelets,
    },
  };
}
