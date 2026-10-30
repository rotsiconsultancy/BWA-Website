import Link from "next/link";
import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ProductEditForm from "@/components/admin/ProductEditForm";
import { requireAdmin } from "@/lib/admin/auth";
import { DESIGN_FIELDS } from "@/lib/admin/design-fields";

export default async function AdminProductEdit({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { admin } = await requireAdmin();
  const fields =
    "id,title,slug,sku,subtitle,descriptor,story,details,price,price_kes,price_usd,featured,is_trending,active,seo_title,seo_description,energy_vibe,intention,stone_type,color_palette,style_tags,wrist_fits,occasion,recipient,product_images(url,alt_text,kind,sort_order),product_variants(id,title,sku,price_adjustment_kes,price_adjustment_usd,stock_quantity)";
  // The Design Your Own fields exist once supabase/schema.sql's 2026-10-30
  // block has been run; until then the form leaves them out.
  const withDesign = await admin
    .from("products")
    .select(`${fields},${DESIGN_FIELDS}`)
    .eq("id", productId)
    .single();
  const designReady = withDesign.error?.code !== "42703";
  const { data: product } = designReady
    ? withDesign
    : await admin.from("products").select(fields).eq("id", productId).single();
  if (!product || !product.product_variants?.length) notFound();

  return (
    <div className="admin-page">
      <Link href="/admin/products" className="admin-back-link">
        ← All products
      </Link>
      <PageHeader
        eyebrow="Catalogue / Edit"
        title={`Edit ${product.title}`}
        description="Update the live product record, gallery, primary variant, discovery information and Design Your Own stone."
      />
      <ProductEditForm product={product as any} designReady={designReady} />
    </div>
  );
}
