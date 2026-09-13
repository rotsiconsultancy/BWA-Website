"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

const statuses = [
  "order_received",
  "payment_pending",
  "payment_confirmed",
  "hand_crafting",
  "quality_checked",
  "ready_for_dispatch",
  "dispatched",
  "delivered",
  "cancelled",
  "refunded",
];
const payments = ["pending", "paid", "failed", "refunded"];

export async function updateOrder(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  if (!["owner", "commerce_manager", "fulfilment_staff"].includes(profile.role))
    redirect("/admin/orders?error=permission");
  const orderId = String(formData.get("order_id") || "");
  const orderNumber = String(formData.get("order_number") || "");
  const status = String(formData.get("status") || "");
  const paymentStatus = String(formData.get("payment_status") || "");
  if (
    !orderId ||
    !orderNumber ||
    !statuses.includes(status) ||
    !payments.includes(paymentStatus)
  )
    redirect(`/admin/orders/${orderNumber}?error=validation`);
  const courier_name =
    String(formData.get("courier_name") || "").trim() || null;
  const tracking_reference =
    String(formData.get("tracking_reference") || "").trim() || null;
  const note = String(formData.get("note") || "").trim() || null;
  const { data: previous } = await admin
    .from("orders")
    .select("status,payment_status,courier_name,tracking_reference")
    .eq("id", orderId)
    .maybeSingle();
  const { error } = await admin
    .from("orders")
    .update({
      status,
      payment_status: paymentStatus,
      courier_name,
      tracking_reference,
    })
    .eq("id", orderId);
  if (error) redirect(`/admin/orders/${orderNumber}?error=save`);
  if (previous?.status !== status || note)
    await admin
      .from("order_status_history")
      .insert({ order_id: orderId, status, note, actor_id: user.id });
  await admin.from("crm_sync_outbox").insert({
    entity_type: "order",
    entity_id: orderId,
    operation: "update",
    idempotency_key: randomUUID(),
    payload: {
      order_number: orderNumber,
      status,
      payment_status: paymentStatus,
      courier_name,
      tracking_reference,
    },
  });
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "order",
    entity_id: orderId,
    action: "updated_fulfilment",
    before_value: previous,
    after_value: {
      status,
      payment_status: paymentStatus,
      courier_name,
      tracking_reference,
    },
    reason: note,
  });
  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${orderNumber}`);
  revalidatePath(`/order/${orderNumber}`);
  redirect(`/admin/orders/${orderNumber}?updated=1`);
}
