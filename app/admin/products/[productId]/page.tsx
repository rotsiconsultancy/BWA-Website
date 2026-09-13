import { notFound } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import ProductEditForm from "@/components/admin/ProductEditForm";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminProductEdit({
  params,
}: {
  params: Promise<{ productId: string }>;
}) {
  const { productId } = await params;
  const { admin } = await requireAdmin();
  const { data: product } = await admin
    .from("products")
    .select(
      "id,title,slug,sku,subtitle,descriptor,story,details,price,price_kes,price_usd,featured,is_trending,active,seo_title,seo_description,energy_vibe,intention,stone_type,color_palette,style_tags,wrist_fits,occasion,recipient,product_images(url,alt_text,kind,sort_order),product_variants(id,title,sku,price_adjustment_kes,price_adjustment_usd,stock_quantity)",
    )
    .eq("id", productId)
    .single();
  if (!product || !product.product_variants?.length) notFound();

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Catalogue / Edit"
        title={`Edit ${product.title}`}
        description="Update the live product record, gallery, primary variant, and discovery information."
        action={{ href: "/admin/products", label: "Back to products" }}
      />
      <ProductEditForm product={product as any} />
    </div>
  );
}
