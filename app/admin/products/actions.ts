"use server";

import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { TAXONOMIES } from "@/lib/commerce/taxonomy";
import { requireAdmin } from "@/lib/admin/auth";
import { DESIGN_FIELDS, readDesignFields } from "@/lib/admin/design-fields";

const taxonomies = TAXONOMIES.map((t) => t.name);

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

type ProductImageInput = {
  url: string;
  alt: string;
  kind: "hero" | "gallery" | "detail" | "lifestyle";
};

const parseImages = (formData: FormData): ProductImageInput[] => {
  try {
    const parsed = JSON.parse(value(formData, "images"));
    if (!Array.isArray(parsed)) return [];
    const seen = new Set<string>();
    return parsed
      .map((image) => ({
        url: String(image?.url || "").trim(),
        alt: String(image?.alt || "").trim(),
        kind: ["hero", "gallery", "detail", "lifestyle"].includes(image?.kind)
          ? image.kind
          : "gallery",
      }))
      .filter((image) => image.url && image.alt && !seen.has(image.url))
      .filter((image) => (seen.add(image.url), true))
      .slice(0, 10);
  } catch {
    return [];
  }
};

const canManageProducts = (role: string) =>
  ["owner", "commerce_manager"].includes(role);

const revalidateProduct = (slug: string) => {
  revalidatePath("/");
  revalidatePath("/bracelets");
  revalidatePath("/shop");
  revalidatePath(`/product/${slug}`);
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/products");
};

export type ProductActionState = {
  error?: string;
  fields?: string[];
  success?: string;
};

export async function createProduct(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const { admin, profile, user } = await requireAdmin();
  if (!canManageProducts(profile.role))
    return { error: "You do not have permission to create products." };

  const title = value(formData, "title");
  const slug = value(formData, "slug").toLowerCase();
  const sku = value(formData, "sku").toUpperCase();
  const images = parseImages(formData);
  const priceKes = Number(value(formData, "price_kes"));
  const priceUsd = Number(value(formData, "price_usd"));
  const variantPriceAdjustmentKes = Number(
    value(formData, "variant_price_adjustment_kes") || "0",
  );
  const variantPriceAdjustmentUsd = Number(
    value(formData, "variant_price_adjustment_usd") || "0",
  );
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
    !Number.isFinite(priceKes) ||
    priceKes < 0 ||
    !Number.isFinite(priceUsd) ||
    priceUsd < 0 ||
    !Number.isFinite(variantPriceAdjustmentKes) ||
    variantPriceAdjustmentKes < 0 ||
    !Number.isFinite(variantPriceAdjustmentUsd) ||
    variantPriceAdjustmentUsd < 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !images.length ||
    (publish && (!hasDiscoveryData || stock < 1))
  ) {
    return {
      error:
        "Complete the required fields before publishing: name, public URL, SKU, KES and USD prices, stock, one described image, and the four required discovery traits.",
      fields: [
        "title",
        "slug",
        "sku",
        "price_kes",
        "price_usd",
        "stock",
        "images",
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
    // `price` remains the legacy KES value for compatibility with existing data.
    price: priceKes,
    price_kes: priceKes,
    price_usd: priceUsd,
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
      price_adjustment: variantPriceAdjustmentKes,
      price_adjustment_kes: variantPriceAdjustmentKes,
      price_adjustment_usd: variantPriceAdjustmentUsd,
      stock_quantity: stock,
      active: true,
    })
    .select("id")
    .single();
  const { error: imageError } = await admin.from("product_images").insert(
    images.map((image, index) => ({
      product_id: product.id,
      url: image.url,
      alt_text: image.alt,
      kind: index === 0 ? "hero" : image.kind,
      sort_order: index,
    })),
  );
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

  revalidateProduct(slug);
  redirect(`/admin/products?created=${slug}`);
}

export async function updateProduct(
  _previousState: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const { admin, profile, user } = await requireAdmin();
  if (!canManageProducts(profile.role))
    return { error: "You do not have permission to edit products." };

  const productId = value(formData, "product_id");
  const variantId = value(formData, "variant_id");
  const title = value(formData, "title");
  const slug = value(formData, "slug").toLowerCase();
  const sku = value(formData, "sku").toUpperCase();
  const priceKes = Number(value(formData, "price_kes"));
  const priceUsd = Number(value(formData, "price_usd"));
  const stock = Number(value(formData, "stock"));
  const publish = formData.get("publish") === "on";
  const images = parseImages(formData);
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
    !productId ||
    !variantId ||
    !title ||
    !sku ||
    !slugIsValid ||
    !Number.isFinite(priceKes) ||
    priceKes < 0 ||
    !Number.isFinite(priceUsd) ||
    priceUsd < 0 ||
    !Number.isInteger(stock) ||
    stock < 0 ||
    !images.length ||
    (publish && !hasDiscoveryData)
  ) {
    return {
      error:
        "Keep a name, valid URL, SKU, both prices, non-negative stock, one described image, and the required discovery traits before publishing.",
    };
  }

  // The form has the Design Your Own fields only once those columns exist.
  const withDesign = formData.has("design_fields");
  const { data: previous, error: previousError } = await admin
    .from("products")
    .select(`slug,title,price_kes,price_usd,active${withDesign ? `,${DESIGN_FIELDS}` : ""}`)
    .eq("id", productId)
    .single<Record<string, any>>();
  const { data: previousVariant, error: previousVariantError } = await admin
    .from("product_variants")
    .select("stock_quantity,reserved_quantity")
    .eq("id", variantId)
    .eq("product_id", productId)
    .single();
  if (previousError || previousVariantError || !previous || !previousVariant)
    return { error: "This product could not be found. Refresh and try again." };
  const design = withDesign
    ? readDesignFields(formData, previous as { design_slug: string | null; design_aliases: string[] | null })
    : { fields: {} };
  if ("error" in design) return { error: design.error };

  const productPayload = {
    slug,
    sku,
    title,
    subtitle: value(formData, "subtitle") || null,
    descriptor: value(formData, "descriptor") || null,
    price: priceKes,
    price_kes: priceKes,
    price_usd: priceUsd,
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
    ...design.fields,
  };
  const { error: productError } = await admin
    .from("products")
    .update(productPayload)
    .eq("id", productId);
  if (productError)
    return {
      error:
        productError.code === "23505"
          ? productError.message.includes("design_slug")
            ? "That Design Your Own stone code belongs to another product."
            : "That SKU or public URL belongs to another product."
          : "The product details could not be saved. Nothing has been cleared.",
    };

  const variantPayload = {
    title: value(formData, "variant_title") || "Standard fit",
    sku: value(formData, "variant_sku").toUpperCase() || `${sku}-STD`,
    price_adjustment: Number(
      value(formData, "variant_price_adjustment_kes") || "0",
    ),
    price_adjustment_kes: Number(
      value(formData, "variant_price_adjustment_kes") || "0",
    ),
    price_adjustment_usd: Number(
      value(formData, "variant_price_adjustment_usd") || "0",
    ),
    stock_quantity: stock,
  };
  if (
    !Number.isFinite(variantPayload.price_adjustment_kes) ||
    variantPayload.price_adjustment_kes < 0 ||
    !Number.isFinite(variantPayload.price_adjustment_usd) ||
    variantPayload.price_adjustment_usd < 0
  )
    return { error: "Variant price adjustments must be zero or more." };
  const { error: variantError } = await admin
    .from("product_variants")
    .update(variantPayload)
    .eq("id", variantId)
    .eq("product_id", productId);
  if (variantError)
    return {
      error: "Product details saved, but its variant could not be updated.",
    };

  const { error: clearImagesError } = await admin
    .from("product_images")
    .delete()
    .eq("product_id", productId);
  const { error: imagesError } = clearImagesError
    ? { error: clearImagesError }
    : await admin.from("product_images").insert(
        images.map((image, index) => ({
          product_id: productId,
          url: image.url,
          alt_text: image.alt,
          kind: index === 0 ? "hero" : image.kind,
          sort_order: index,
        })),
      );
  if (imagesError)
    return {
      error:
        "Product details saved, but the gallery could not be updated. Please retry the gallery once.",
    };

  const stockChange = stock - previousVariant.stock_quantity;
  if (stockChange !== 0)
    await admin.from("inventory_movements").insert({
      variant_id: variantId,
      quantity_delta: stockChange,
      reason: "adjustment",
      actor_id: user.id,
      note: "Stock adjusted while editing product",
    });

  await admin.from("crm_sync_outbox").insert({
    entity_type: "product",
    entity_id: productId,
    operation: "update",
    idempotency_key: randomUUID(),
    payload: { ...productPayload, images, variant: variantPayload },
  });
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "product",
    entity_id: productId,
    action: "updated_product_and_gallery",
    before_value: previous,
    after_value: { ...productPayload, image_count: images.length },
  });
  revalidateProduct(previous.slug);
  if (previous.slug !== slug) revalidateProduct(slug);
  revalidatePath("/design-your-own");
  return { success: "Product, gallery, and primary variant saved." };
}

export async function updateProductPrices(formData: FormData) {
  const { admin, profile, user } = await requireAdmin();
  if (!["owner", "commerce_manager"].includes(profile.role)) return;
  const productId = value(formData, "product_id");
  const priceKes = Number(value(formData, "price_kes"));
  const priceUsd = Number(value(formData, "price_usd"));
  if (
    !productId ||
    !Number.isFinite(priceKes) ||
    priceKes < 0 ||
    !Number.isFinite(priceUsd) ||
    priceUsd < 0
  )
    return;
  const { data: previous } = await admin
    .from("products")
    .select("price,price_kes,price_usd")
    .eq("id", productId)
    .maybeSingle();
  const { error } = await admin
    .from("products")
    .update({ price: priceKes, price_kes: priceKes, price_usd: priceUsd })
    .eq("id", productId);
  if (error) return;
  await admin.from("admin_audit_log").insert({
    actor_id: user.id,
    entity_type: "product",
    entity_id: productId,
    action: "updated_currency_prices",
    before_value: previous,
    after_value: { price_kes: priceKes, price_usd: priceUsd },
  });
  revalidatePath("/");
  revalidatePath("/bracelets");
  revalidatePath("/shop");
  revalidatePath("/admin/products");
}
