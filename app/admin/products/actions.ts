"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/auth";

const taxonomies = [
  "energy_vibe",
  "intention",
  "stone_type",
  "color_palette",
  "style_tags",
  "wrist_fits",
  "occasion",
  "recipient",
] as const;

const parseTags = (value: FormDataEntryValue | null) =>
  String(value || "")
    .split(",")
    .map((tag) => tag.trim().toLowerCase().replaceAll(" ", "_"))
    .filter(Boolean);

const parseLines = (value: FormDataEntryValue | null) =>
  String(value || "")
    .split(/\n|,/)
    .map((line) => line.trim())
    .filter(Boolean);

const value = (data: FormData, key: string) =>
  String(data.get(key) || "").trim();

export type ProductActionState = { error?: string; fields?: string[] };

export async function createProduct(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const { admin, profile, user } = await requireAdmin();
  if (!["owner", "commerce_manager"].includes(profile.role))
    return { error: "You do not have permission to create products." };

  const title = value(formData, "title");
  const slug = value(formData, "slug").toLowerCase();
  const sku = value(formData, "sku").toUpperCase();
  const imageUrl = value(formData, "image_url");
  const imageAlt = value(formData, "image_alt");
  const price = Number(value(formData, "price"));
  const stock = Number(value(formData, "stock"));
  const publish = formData.get("publish") === "on";
  const tags = Object.fromEntries(
    taxonomies.map((taxonomy) => [taxonomy, parseTags(formData.get(taxonomy))]),
  );

  const slugIsValid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
  const hasDiscoveryData =
    tags.energy_vibe.length &&
    tags.stone_type.length &&
    tags.style_tags.length &&
    tags.wrist_fits.length;
  if (
    !title ||
    !slugIsValid ||
    !sku ||
    !Number.isFinite(price) ||
    price < 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !imageUrl ||
    !imageAlt ||
    (publish && (!hasDiscoveryData || stock < 1))
  ) {
    return {
      error:
        "Complete the required fields before publishing: name, public URL, SKU, price, stock, image, and the four required discovery traits.",
      fields: [
        "title",
        "slug",
        "sku",
        "price",
        "stock",
        "image_url",
        "image_alt",
        "energy_vibe",
        "stone_type",
        "style_tags",
        "wrist_fits",
      ],
    };
  }

  const productPayload = {
    slug,
    sku,
    title,
    subtitle: value(formData, "subtitle") || null,
    descriptor: value(formData, "descriptor") || null,
    category: "Bracelets",
    price,
    currency: "KES",
    story: value(formData, "story") || null,
    details: parseLines(formData.get("details")),
    featured: formData.get("featured") === "on",
    is_trending: formData.get("trending") === "on",
    active: publish,
    availability: stock > 0 ? "in_stock" : "unavailable",
    seo_title: value(formData, "seo_title") || title,
    seo_description:
      value(formData, "seo_description") ||
      value(formData, "descriptor") ||
      value(formData, "story"),
    ...tags,
  };
  const { data: product, error: productError } = await admin
    .from("products")
    .insert(productPayload)
    .select("id")
    .single();
  if (productError || !product)
    return {
      error:
        productError?.code === "23505"
          ? "That product SKU or public URL already exists. Change one and try again."
          : "We could not save the product. Your draft is still here—please try again.",
    };

  const variantSku =
    value(formData, "variant_sku").toUpperCase() || `${sku}-STD`;
  const variantTitle = value(formData, "variant_title") || "Standard fit";
  const { data: variant, error: variantError } = await admin
    .from("product_variants")
    .insert({
      product_id: product.id,
      sku: variantSku,
      title: variantTitle,
      stock_quantity: stock,
      active: true,
    })
    .select("id")
    .single();
  const { error: imageError } = await admin.from("product_images").insert({
    product_id: product.id,
    url: imageUrl,
    alt_text: imageAlt,
    kind: "hero",
    sort_order: 0,
  });
  if (variantError || imageError || !variant) {
    await admin.from("products").delete().eq("id", product.id);
    return {
      error:
        "The image or first size could not be saved. Nothing was published; your draft is still here.",
    };
  }
  if (stock > 0)
    await admin.from("inventory_movements").insert({
      variant_id: variant.id,
      quantity_delta: stock,
      reason: "initial",
      actor_id: user.id,
      note: "Initial product publish stock",
    });
  await admin.from("crm_sync_outbox").insert({
    entity_type: "product",
    entity_id: product.id,
    operation: "create",
    idempotency_key: randomUUID(),
    payload: productPayload,
  });
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "product",
    entity_id: product.id,
    action: publish ? "published" : "created_draft",
    after_value: productPayload,
  });

  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/sitemap.xml");
  redirect(`/admin/products?created=${slug}`);
}
