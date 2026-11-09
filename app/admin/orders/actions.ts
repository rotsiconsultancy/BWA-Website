"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import {
  manualOrderTotals,
  orderSourceLabel,
  parseManualOrder,
} from "@/lib/commerce/manual-order";

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
    .select(
      "status,payment_status,courier_name,tracking_reference,discount_code_snapshot",
    )
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
  const shouldReleaseDiscount =
    (status === "cancelled" && previous?.status !== "cancelled") ||
    (paymentStatus === "failed" && previous?.payment_status !== "failed");
  if (shouldReleaseDiscount) {
    const { data: releasedCodeId } = await (admin as any).rpc(
      "release_discount_redemption",
      {
        p_order_id: orderId,
        p_reason:
          status === "cancelled"
            ? "Order cancelled by BWA staff."
            : "Payment marked as failed by BWA staff.",
      },
    );
    if (releasedCodeId)
      await admin.from("admin_audit_log").insert({
        actor_id: user.id,
        entity_type: "discount_code",
        entity_id: releasedCodeId,
        action: "released_discount_redemption",
        after_value: {
          order_number: orderNumber,
          reason: status === "cancelled" ? "cancelled" : "payment_failed",
        },
      });
  }
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

/** Record an order that happened outside the website (can be backdated). */
export async function createManualOrder(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  if (!["owner", "commerce_manager"].includes(profile.role))
    redirect(
      "/admin/orders/new?error=" +
        encodeURIComponent(
          "Only the owner or a commerce manager can record orders.",
        ),
    );
  const get = (name: string) => String(formData.get(name) ?? "");
  const back = (error: string) =>
    redirect("/admin/orders/new?error=" + encodeURIComponent(error));
  const parsed = parseManualOrder(get);
  if (!parsed.ok) return back(parsed.error);
  const order = parsed.order;

  // A double-click on Save must not record the order twice.
  const idempotencyKey = "manual-" + (get("idempotency_key") || randomUUID());
  const { data: existing } = await admin
    .from("orders")
    .select("order_number")
    .eq("idempotency_key", idempotencyKey)
    .maybeSingle();
  if (existing) redirect(`/admin/orders/${existing.order_number}?created=1`);

  // Catalogue lines: titles, SKU and photo come from the catalogue, the price
  // is what the customer actually paid.
  const variantIds = [
    ...new Set(order.lines.map((l) => l.variantId).filter(Boolean)),
  ] as string[];
  const { data: variants } = variantIds.length
    ? await admin
        .from("product_variants")
        .select(
          "id,title,sku,product_id,products(title,product_images(url,sort_order))",
        )
        .in("id", variantIds)
    : { data: [] as any[] };
  const byId = new Map((variants || []).map((v: any) => [v.id, v]));
  if (byId.size !== variantIds.length)
    return back("One of the bracelets is no longer in the catalogue.");
  const items = order.lines.map((line) => {
    const variant: any = line.variantId ? byId.get(line.variantId) : null;
    const image = variant
      ? [...(variant.products?.product_images || [])].sort(
          (a: any, b: any) => a.sort_order - b.sort_order,
        )[0]?.url || null
      : null;
    return {
      product_id: variant?.product_id ?? null,
      variant_id: variant?.id ?? null,
      product_title_snapshot: variant?.products?.title ?? line.title,
      variant_title_snapshot: variant?.title ?? "Custom piece",
      image_snapshot: image,
      sku_snapshot: variant?.sku ?? null,
      unit_price: line.unitPrice,
      quantity: line.quantity,
      line_total: Math.round(line.unitPrice * line.quantity * 100) / 100,
    };
  });
  const { subtotal, total } = manualOrderTotals(order);

  // Existing customers keep their details; only blanks are filled in.
  const { data: known } = await admin
    .from("customers")
    .select("id,email,last_name")
    .eq("phone", order.customer.phone)
    .maybeSingle();
  let customerId = known?.id as string | undefined;
  if (known) {
    const fill: Record<string, string> = {};
    if (!known.email && order.customer.email) fill.email = order.customer.email;
    if (!known.last_name && order.customer.lastName)
      fill.last_name = order.customer.lastName;
    if (Object.keys(fill).length)
      await admin.from("customers").update(fill).eq("id", known.id);
  } else {
    const { data: created, error } = await admin
      .from("customers")
      .insert({
        first_name: order.customer.firstName,
        last_name: order.customer.lastName || null,
        email: order.customer.email || null,
        phone: order.customer.phone,
        whatsapp_opt_in: true,
        marketing_opt_in: false,
        source: order.channel,
        created_at: order.orderedAt,
      })
      .select("id")
      .single();
    if (error || !created) return back("Could not save the customer.");
    customerId = created.id;
  }

  const orderNumber =
    "BWA-" +
    new Date(order.orderedAt).getFullYear() +
    "-" +
    randomUUID().slice(0, 8).toUpperCase();
  const { data: saved, error: orderError } = await admin
    .from("orders")
    .insert({
      order_number: orderNumber,
      idempotency_key: idempotencyKey,
      customer_id: customerId,
      status: order.status,
      payment_status: order.paymentStatus,
      delivery_method: order.deliveryMethod,
      delivery_address: order.address || null,
      city: order.city || null,
      subtotal,
      delivery_fee: order.deliveryFee,
      discount_amount: order.discount,
      total_amount: total,
      currency: order.currency,
      source: order.channel,
      created_at: order.orderedAt,
    })
    .select("id,order_number")
    .single();
  if (orderError || !saved) return back("Could not save the order.");
  const { error: itemsError } = await admin
    .from("order_items")
    .insert(items.map((item) => ({ ...item, order_id: saved.id })));
  if (itemsError) {
    await admin.from("orders").delete().eq("id", saved.id);
    return back("Could not save the bracelets on the order.");
  }

  const channel = orderSourceLabel(order.channel);
  await admin.from("order_status_history").insert({
    order_id: saved.id,
    status: order.status,
    note: [`Recorded in admin (ordered via ${channel}).`, order.note]
      .filter(Boolean)
      .join(" "),
    actor_id: user.id,
    created_at: order.orderedAt,
  });
  await admin.from("crm_sync_outbox").insert({
    entity_type: "order",
    entity_id: saved.id,
    operation: "create",
    idempotency_key: "order-" + saved.id,
    payload: { order_number: saved.order_number, source: order.channel, items },
  });
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "order",
    entity_id: saved.id,
    action: "created_manual_order",
    after_value: {
      order_number: saved.order_number,
      ordered_at: order.orderedAt,
      channel: order.channel,
      total,
      currency: order.currency,
    },
    reason: order.note || null,
  });
  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${saved.order_number}?created=1`);
}
