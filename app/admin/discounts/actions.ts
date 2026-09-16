"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  isDiscountCodeShapeValid,
  normaliseDiscountCode,
} from "@/lib/commerce/checkout-pricing";
import { requireAdmin } from "@/lib/admin/auth";

const canManageDiscounts = (role: string) =>
  ["owner", "commerce_manager"].includes(role);

const value = (formData: FormData, key: string) =>
  String(formData.get(key) || "").trim();

const optionalAmount = (formData: FormData, key: string) => {
  const input = value(formData, key);
  if (!input) return null;
  const amount = Number(input);
  return Number.isFinite(amount) ? amount : Number.NaN;
};

const parseNairobiDateTime = (input: string) => {
  if (!input) return null;
  const parsed = new Date(`${input}:00+03:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

type CampaignInput = {
  code: string;
  name: string;
  discount_type: "percentage" | "fixed";
  percentage_basis_points: number | null;
  fixed_amount_kes: number | null;
  fixed_amount_usd: number | null;
  minimum_subtotal_kes: number | null;
  minimum_subtotal_usd: number | null;
  max_redemptions: number | null;
  starts_at: string | null;
  ends_at: string | null;
};

const parseCampaign = (
  formData: FormData,
): { input?: CampaignInput; error?: string } => {
  const code = normaliseDiscountCode(value(formData, "code"));
  const name = value(formData, "name");
  const discountType = value(formData, "discount_type");
  const percentage = optionalAmount(formData, "percentage");
  const fixedKes = optionalAmount(formData, "fixed_amount_kes");
  const fixedUsd = optionalAmount(formData, "fixed_amount_usd");
  const minimumKes = optionalAmount(formData, "minimum_subtotal_kes");
  const minimumUsd = optionalAmount(formData, "minimum_subtotal_usd");
  const cap = optionalAmount(formData, "max_redemptions");
  const startsAt = parseNairobiDateTime(value(formData, "starts_at"));
  const endsAt = parseNairobiDateTime(value(formData, "ends_at"));
  if (!name || !isDiscountCodeShapeValid(code))
    return {
      error: "Give this campaign a name and a valid code (A–Z, 0–9, - or _).",
    };
  if (discountType !== "percentage" && discountType !== "fixed")
    return { error: "Choose a percentage or fixed discount." };
  if (
    (minimumKes !== null && (!Number.isFinite(minimumKes) || minimumKes < 0)) ||
    (minimumUsd !== null && (!Number.isFinite(minimumUsd) || minimumUsd < 0)) ||
    (cap !== null && (!Number.isInteger(cap) || cap < 1))
  )
    return {
      error:
        "Minimum spends must be zero or more; the use cap must be a whole positive number.",
    };
  if (value(formData, "starts_at") && !startsAt)
    return { error: "Enter a valid Nairobi start time." };
  if (value(formData, "ends_at") && !endsAt)
    return { error: "Enter a valid Nairobi end time." };
  if (startsAt && endsAt && new Date(endsAt) <= new Date(startsAt))
    return { error: "The end time must be after the start time." };
  if (discountType === "percentage") {
    if (
      !Number.isFinite(percentage) ||
      percentage === null ||
      percentage <= 0 ||
      percentage > 100
    )
      return { error: "Enter a percentage between 0.01 and 100." };
    return {
      input: {
        code,
        name,
        discount_type: discountType,
        percentage_basis_points: Math.round(percentage * 100),
        fixed_amount_kes: null,
        fixed_amount_usd: null,
        minimum_subtotal_kes: minimumKes,
        minimum_subtotal_usd: minimumUsd,
        max_redemptions: cap,
        starts_at: startsAt,
        ends_at: endsAt,
      },
    };
  }
  if (
    !Number.isFinite(fixedKes) ||
    fixedKes === null ||
    fixedKes <= 0 ||
    !Number.isFinite(fixedUsd) ||
    fixedUsd === null ||
    fixedUsd <= 0
  )
    return {
      error: "Fixed campaigns need exact positive KES and USD amounts.",
    };
  return {
    input: {
      code,
      name,
      discount_type: discountType,
      percentage_basis_points: null,
      fixed_amount_kes: fixedKes,
      fixed_amount_usd: fixedUsd,
      minimum_subtotal_kes: minimumKes,
      minimum_subtotal_usd: minimumUsd,
      max_redemptions: cap,
      starts_at: startsAt,
      ends_at: endsAt,
    },
  };
};

const refreshDiscountPaths = (id?: string) => {
  revalidatePath("/admin/discounts");
  if (id) revalidatePath(`/admin/discounts/${id}`);
};

export async function createDiscount(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  if (!canManageDiscounts(profile.role))
    redirect("/admin/discounts?error=permission");
  const parsed = parseCampaign(formData);
  if (!parsed.input)
    redirect(
      `/admin/discounts/new?error=${encodeURIComponent(parsed.error || "validation")}`,
    );
  const { data, error } = await admin
    .from("discount_codes")
    .insert(parsed.input)
    .select("id")
    .single();
  if (error || !data)
    redirect(
      `/admin/discounts/new?error=${encodeURIComponent(error?.code === "23505" ? "That code already exists." : "We could not save this campaign.")}`,
    );
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "discount_code",
    entity_id: data.id,
    action: "created_discount_campaign",
    after_value: parsed.input,
  });
  refreshDiscountPaths(data.id);
  redirect(`/admin/discounts/${data.id}?created=1`);
}

export async function updateDiscount(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  const discountId = value(formData, "discount_id");
  if (!canManageDiscounts(profile.role))
    redirect("/admin/discounts?error=permission");
  const parsed = parseCampaign(formData);
  if (!discountId || !parsed.input)
    redirect(
      `/admin/discounts/${discountId}?error=${encodeURIComponent(parsed.error || "validation")}`,
    );
  const { data: existing } = await admin
    .from("discount_codes")
    .select("code")
    .eq("id", discountId)
    .maybeSingle();
  const { count } = await admin
    .from("discount_redemptions")
    .select("id", { count: "exact", head: true })
    .eq("discount_code_id", discountId);
  if (!existing) redirect("/admin/discounts?error=not-found");
  if (count && parsed.input.code !== existing.code)
    redirect(
      `/admin/discounts/${discountId}?error=The code cannot change after its first redemption.`,
    );
  const { error } = await admin
    .from("discount_codes")
    .update({ ...parsed.input, code: existing.code })
    .eq("id", discountId);
  if (error)
    redirect(
      `/admin/discounts/${discountId}?error=We could not save this campaign.`,
    );
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "discount_code",
    entity_id: discountId,
    action: "updated_discount_campaign",
    after_value: { ...parsed.input, code: existing.code },
  });
  refreshDiscountPaths(discountId);
  redirect(`/admin/discounts/${discountId}?updated=1`);
}

export async function toggleDiscount(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  const discountId = value(formData, "discount_id");
  const active = value(formData, "active") === "true";
  if (!canManageDiscounts(profile.role) || !discountId)
    redirect("/admin/discounts?error=permission");
  const { error } = await admin
    .from("discount_codes")
    .update({ active })
    .eq("id", discountId);
  if (error)
    redirect(
      `/admin/discounts/${discountId}?error=We could not update this campaign.`,
    );
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "discount_code",
    entity_id: discountId,
    action: active
      ? "activated_discount_campaign"
      : "deactivated_discount_campaign",
    after_value: { active },
  });
  refreshDiscountPaths(discountId);
  redirect(`/admin/discounts/${discountId}?updated=1`);
}
