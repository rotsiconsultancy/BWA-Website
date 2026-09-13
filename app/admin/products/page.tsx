import PageHeader from "@/components/admin/PageHeader";
import ProductPublishForm from "@/components/admin/ProductPublishForm";
import { requireAdmin } from "@/lib/admin/auth";

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string }>;
}) {
  const params = await searchParams;
  const { admin } = await requireAdmin();
  const { data: products } = await admin
    .from("products")
    .select(
      "title,sku,active,price,product_variants(title,stock_quantity,reserved_quantity)",
    )
    .limit(40);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Catalogue"
        title="Products & stock"
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
      <div className="admin-list-toolbar">
        <p>
          {products?.length || 0} product{products?.length === 1 ? "" : "s"}
        </p>
        <span className="admin-toolbar-note">
          Product creation is the next operational release.
        </span>
      </div>
      <div className="admin-table admin-products-table">
        <div className="admin-table-head">
          <span>Product</span>
          <span>State</span>
          <span>Price</span>
          <span>Variants</span>
        </div>
        {products?.map((product: any) => (
          <div key={product.sku}>
            <strong>
              {product.title}
              <small>{product.sku}</small>
            </strong>
            <span
              className={`admin-status ${product.active ? "admin-status-live" : "admin-status-draft"}`}
            >
              {product.active ? "Live" : "Draft"}
            </span>
            <strong>KES {Number(product.price).toLocaleString()}</strong>
            <span>
              {product.product_variants
                ?.map(
                  (variant: any) =>
                    variant.title +
                    ": " +
                    (variant.stock_quantity - variant.reserved_quantity),
                )
                .join(" · ")}
            </span>
          </div>
        )) || <p className="admin-table-empty">No products yet.</p>}
      </div>
    </div>
  );
}
