import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import ProductPublishForm from "@/components/admin/ProductPublishForm";
import { requireAdmin } from "@/lib/admin/auth";
import { redirect } from "next/navigation";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { profile } = await requireAdmin();

  if (!["owner", "commerce_manager"].includes(profile.role)) redirect("/admin");

  return (
    <div className="admin-page">
      <Link href="/admin/products" className="admin-back-link">
        ← All products
      </Link>
      <PageHeader
        eyebrow="Catalogue / New"
        title="Create product"
        description="Create a complete record, then publish it directly to the BWA storefront."
      />
      {params.created && (
        <p className="admin-form-notice is-success">
          {params.created} is live on the storefront and queued for CRM sync.
        </p>
      )}
      {params.error && (
        <p className="admin-form-notice is-error">
          The product could not be saved. Check required fields, tag values, and
          unique SKU/slug.
        </p>
      )}
      <ProductPublishForm reset={Boolean(params.created)} />
    </div>
  );
}
