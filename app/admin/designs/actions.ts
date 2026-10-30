"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin/auth";
import { DESIGN_ID } from "@/lib/design/design-id";

const STATUSES = ["sent", "ordered", "no_reply", "declined"];

export async function setDesignStatus(formData: FormData) {
  const { admin, user } = await requireAdmin();
  const id = String(formData.get("id") || "");
  const status = String(formData.get("status") || "");
  if (!DESIGN_ID.test(id) || !STATUSES.includes(status)) return;
  const { error } = await admin.from("design_leads").update({ status }).eq("id", id);
  if (!error)
    await admin.from("admin_audit_log").insert({
      actor_id: user.id,
      entity_type: "design_lead",
      entity_id: null,
      action: "set_design_status",
      after_value: { id, status },
    });
  revalidatePath("/admin/designs");
}
