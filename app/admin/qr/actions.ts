"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";
import { isQrChannel, newQrSlug, QR_DEFAULTS } from "@/lib/commerce/qr-welcome";

const UUID = /^[0-9a-f-]{36}$/i;

const intBetween = (
  value: FormDataEntryValue | null,
  min: number,
  max: number,
  fallback: number,
) => {
  const n = Math.round(Number(value));
  return Number.isFinite(n) && n >= min && n <= max ? n : fallback;
};

export async function createQrLink(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const name = String(formData.get("name") || "")
    .trim()
    .slice(0, 80);
  const channel = String(formData.get("channel") || "");
  if (name.length < 2 || !isQrChannel(channel))
    redirect("/admin/qr?error=fields");
  const minimum = Number(formData.get("minimum_kes") || 0);
  const row = {
    name,
    channel,
    reward_percent: intBetween(
      formData.get("reward_percent"),
      1,
      50,
      QR_DEFAULTS.rewardPercent,
    ),
    reward_valid_days: intBetween(
      formData.get("valid_days"),
      7,
      365,
      QR_DEFAULTS.validDays,
    ),
    minimum_subtotal_kes:
      Number.isFinite(minimum) && minimum > 0 ? Math.round(minimum) : null,
    created_by: user.id,
  };
  let created: { id: string } | null = null;
  // A slug clash is rare (31^4 per channel); try again with a new one.
  for (let attempt = 0; attempt < 4 && !created; attempt++) {
    const { data, error } = await admin
      .from("qr_links")
      .insert({ ...row, slug: newQrSlug(channel) })
      .select("id")
      .single();
    if (data) created = data;
    else if (error?.code !== "23505") break;
  }
  if (!created) redirect("/admin/qr?error=save");
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "qr_link",
    entity_id: created.id,
    action: "create_qr_link",
    after_value: row,
  });
  revalidatePath("/admin/qr");
  redirect(`/admin/qr/${created.id}`);
}

export async function setQrLinkActive(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const active = formData.get("active") === "true";
  if (!UUID.test(id)) return;
  const { error } = await admin
    .from("qr_links")
    .update({ active })
    .eq("id", id);
  if (!error)
    await admin.from("admin_audit_log").insert({
      actor_id: user.id,
      entity_type: "qr_link",
      entity_id: id,
      action: active ? "resume_qr_link" : "pause_qr_link",
      after_value: { active },
    });
  revalidatePath("/admin/qr");
  revalidatePath(`/admin/qr/${id}`);
}
