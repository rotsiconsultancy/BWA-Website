import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import PricingCalculator from "@/components/admin/PricingCalculator";
import { requireAdmin } from "@/lib/admin/auth";
import {
  canManagePricing,
  loadPricingSettings,
  toCostRecipe,
  unitsSoldSince,
} from "@/lib/admin/pricing";

const savedMessages: Record<string, string> = {
  recipe: "Costs saved.",
  price: "Store price updated. Customers see the new price now.",
};

export default async function AdminProductPricing({
  params,
  searchParams,
}: {
  params: Promise<{ productId: string }>;
  searchParams: Promise<{ saved?: string; error?: string }>;
}) {
  const { productId } = await params;
  const query = await searchParams;
  const { admin, profile } = await requireAdmin();
  if (!canManagePricing(profile.role)) redirect("/admin");

  const { data: product } = await admin
    .from("products")
    .select("id,title,sku,price,price_kes")
    .eq("id", productId)
    .maybeSingle();
  if (!product) notFound();
  const { data: row } = await admin
    .from("product_cost_recipes")
    .select("*")
    .eq("product_id", productId)
    .maybeSingle();
  const settings = await loadPricingSettings(admin);
  const unitsSold = await unitsSoldSince(admin, settings.stand_bought_on);

  return (
    <div className="admin-page">
      <Link href="/admin/pricing" className="admin-back-link">
        ← All bracelets
      </Link>
      <header className="admin-order-header">
        <div>
          <p className="admin-kicker">Pricing / {product.sku}</p>
          <h1>{product.title}</h1>
          <p>
            Enter what this bracelet uses. The prices and money split update as
            you type.
          </p>
        </div>
      </header>
      {query.saved && savedMessages[query.saved] && (
        <p className="admin-form-notice is-success">
          {savedMessages[query.saved]}
        </p>
      )}
      {query.error && (
        <p className="admin-form-notice is-error">{query.error}</p>
      )}
      <PricingCalculator
        productId={product.id}
        storePrice={Number(product.price_kes ?? product.price) || 0}
        initialRecipe={toCostRecipe(row)}
        initialNotes={row?.notes || ""}
        hasRecipe={Boolean(row)}
        settings={settings}
        unitsSold={unitsSold}
      />
    </div>
  );
}
