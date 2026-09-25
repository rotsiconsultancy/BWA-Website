import PageHeader from "@/components/admin/PageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import { updateProductPrices } from "@/app/admin/products/actions";
import { requireAdmin } from "@/lib/admin/auth";
import Link from "next/link";

const PAGE_SIZE = 10;

export default async function AdminProducts({
  searchParams,
}: {
  searchParams: Promise<{ created?: string; error?: string; page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { admin } = await requireAdmin();
  const { data: products, count: totalCount } = await admin
    .from("products")
    .select(
      "id,title,sku,active,price,price_kes,price_usd,product_variants(title,stock_quantity,reserved_quantity)",
      { count: "exact" },
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Catalogue"
        title="Products & stock"
        description="Manage live BWA storefront products, prices, stock, and variants."
        action={{ href: "/admin/products/new", label: "Create product" }}
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
      <div className="admin-list-toolbar">
        <p>
          {totalCount || 0} product{totalCount === 1 ? "" : "s"}
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
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount || 0}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
}
