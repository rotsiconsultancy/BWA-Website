"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { newReviewToken, REVIEW_REWARD } from "@/lib/commerce/review-reward";

/** One review link per delivered order. */
export async function createReviewLink(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const orderNumber = String(formData.get("order_number") || "");
  const { data: order } = await admin
    .from("orders")
    .select("id,status,customer_id")
    .eq("order_number", orderNumber)
    .maybeSingle();
  if (!order || order.status !== "delivered")
    redirect(`/admin/orders/${orderNumber}?error=review`);
  const expires = new Date(Date.now() + REVIEW_REWARD.linkValidDays * 864e5);
  const { error } = await admin.from("review_requests").insert({
    order_id: order.id,
    customer_id: order.customer_id,
    token: newReviewToken(),
    expires_at: expires.toISOString(),
  });
  // 23505: a link already exists for this order; just show it.
  if (error && error.code !== "23505")
    redirect(`/admin/orders/${orderNumber}?error=review`);
  if (!error)
    await admin.from("admin_audit_log").insert({
      actor_id: user.id,
      entity_type: "order",
      entity_id: order.id,
      action: "create_review_link",
      after_value: { order_number: orderNumber },
    });
  revalidatePath(`/admin/orders/${orderNumber}`);
  redirect(`/admin/orders/${orderNumber}#review`);
}

const PUBLISH = ["pending", "published", "rejected"];
export async function setReviewStatus(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!PUBLISH.includes(status) || !/^[0-9a-f-]{36}$/.test(id)) return;
  const { error } = await admin
    .from("reviews")
    .update({ publish_status: status })
    .eq("id", id);
  if (!error)
    await admin.from("admin_audit_log").insert({
      actor_id: user.id,
      entity_type: "review",
      entity_id: id,
      action: "set_review_status",
      after_value: { status },
    });
  revalidatePath("/admin/reviews");
}

const FEEDBACK = ["new", "replied", "done"];
export async function setFeedbackStatus(formData: FormData) {
  const { admin } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!FEEDBACK.includes(status) || !/^[0-9a-f-]{36}$/.test(id)) return;
  await admin.from("review_feedback").update({ status }).eq("id", id);
  revalidatePath("/admin/reviews");
}
