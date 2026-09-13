import PageHeader from "@/components/admin/PageHeader";
import ProductPublishForm from "@/components/admin/ProductPublishForm";
import { updateProductPrices } from "@/app/admin/products/actions";
import { requireAdmin } from "@/lib/admin/auth";
import Link from "next/link";

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
      "id,title,sku,active,price,price_kes,price_usd,product_variants(title,stock_quantity,reserved_quantity)",
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
          Select Edit to manage product copy, imagery, tags, pricing, and stock.
        </span>
      </div>
      <div className="admin-table admin-products-table">
        <div className="admin-table-head">
          <span>Product</span>
          <span>State</span>
          <span>Store prices</span>
          <span>Variants</span>
          <span>Manage</span>
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
            <form action={updateProductPrices} className="admin-price-editor">
              <input type="hidden" name="product_id" value={product.id} />
              <label>
                <span>KES</span>
                <input
                  name="price_kes"
                  type="number"
                  min="0"
                  step="1"
                  defaultValue={product.price_kes ?? product.price}
                />
              </label>
              <label>
                <span>USD</span>
                <input
                  name="price_usd"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={product.price_usd ?? ""}
                  required
                />
              </label>
              <button type="submit">Save</button>
            </form>
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
            <Link
              className="admin-table-action"
              href={`/admin/products/${product.id}`}
            >
              Edit product →
            </Link>
          </div>
        )) || <p className="admin-table-empty">No products yet.</p>}
      </div>
    </div>
  );
}
