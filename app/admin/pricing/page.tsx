import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import { savePricingSettings } from "@/app/admin/pricing/actions";
import { requireAdmin } from "@/lib/admin/auth";
import {
  canManagePricing,
  loadPricingSettings,
  toCostRecipe,
  unitsSoldSince,
} from "@/lib/admin/pricing";
import {
  checkPrice,
  formatKes,
  priceGuide,
  priceStatusLabel,
  sharedCostRate,
  standChargePerBracelet,
  type PricingSettings,
} from "@/lib/commerce/cost-pricing";

const PAGE_SIZE = 15;

const savedMessages: Record<string, string> = {
  settings: "Settings saved. Every bracelet below now uses the new numbers.",
};

type Field = {
  name: keyof PricingSettings;
  label: string;
  help: string;
  step?: string;
};

const settingGroups: { title: string; intro: string; fields: Field[] }[] = [
  {
    title: "This month",
    intro:
      "Update these at the start of each month. Ads and other costs are shared across sales as a small cut of every KES sold.",
    fields: [
      {
        name: "monthly_ads_kes",
        label: "Ads budget this month (KES)",
        help: "Facebook, Instagram, TikTok boosts, etc.",
      },
      {
        name: "monthly_other_costs_kes",
        label: "Other monthly costs (KES)",
        help: "Vending fees, collabs, market stalls.",
      },
      {
        name: "expected_monthly_sales_kes",
        label: "Expected sales this month (KES)",
        help: "A realistic guess of total money from sales.",
      },
    ],
  },
  {
    title: "Display stand",
    intro:
      "Each bracelet pays back a small piece of the stand. Once enough have sold, the charge stops.",
    fields: [
      {
        name: "stand_cost_kes",
        label: "Stand cost (KES)",
        help: "Total for all stands.",
      },
      {
        name: "stand_payback_units",
        label: "Pay it back over (bracelets)",
        help: "How many sales should cover it.",
      },
    ],
  },
  {
    title: "Shared materials",
    intro: "Used by every bracelet.",
    fields: [
      {
        name: "string_roll_cost",
        label: "String roll cost (KES)",
        help: "One roll.",
      },
      {
        name: "string_roll_yield",
        label: "Bracelets per string roll",
        help: "Roughly 40–50.",
        step: "0.5",
      },
      { name: "pouch_cost", label: "Pouch cost (KES)", help: "Each." },
      { name: "box_cost", label: "Gift box cost (KES)", help: "Each." },
      {
        name: "wastage_pct",
        label: "Broken / wasted beads (%)",
        help: "Extra added to materials.",
        step: "0.5",
      },
    ],
  },
  {
    title: "Profit",
    intro:
      "What you aim to keep, and how profit is split. Whatever is left after better products and reserves is your pay.",
    fields: [
      {
        name: "target_profit_pct",
        label: "Target profit (%)",
        help: "Of the money that reaches you.",
        step: "0.5",
      },
      {
        name: "consignment_commission_pct",
        label: "Partner / consignment cut (%)",
        help: "What a shop keeps when it sells for you.",
        step: "0.5",
      },
      {
        name: "better_products_pct",
        label: "Profit to better products (%)",
        help: "New stones, upgrades.",
        step: "0.5",
      },
      {
        name: "reserves_pct",
        label: "Profit to savings (%)",
        help: "Slow months, emergencies.",
        step: "0.5",
      },
      {
        name: "round_to",
        label: "Round suggested prices up to",
        help: "e.g. 10 → KES 797 becomes 800.",
      },
    ],
  },
];

export default async function AdminPricing({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; saved?: string; error?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;

  const { admin, profile } = await requireAdmin();
  if (!canManagePricing(profile.role)) redirect("/admin");

  const settings = await loadPricingSettings(admin);
  const unitsSold = await unitsSoldSince(admin, settings.stand_bought_on);
  const { data: products, count: totalCount } = await admin
    .from("products")
    .select("id,title,sku,active,price,price_kes", { count: "exact" })
    .order("title", { ascending: true })
    .range(from, to);
  const ids = products?.map((product: any) => product.id) || [];
  const { data: recipes } = ids.length
    ? await admin.from("product_cost_recipes").select("*").in("product_id", ids)
    : { data: [] as any[] };
  const recipeFor = new Map(
    (recipes || []).map((row: any) => [row.product_id, row]),
  );
  const totalPages = Math.ceil((totalCount || 0) / PAGE_SIZE);
  const sharedPct = sharedCostRate(settings) * 100;
  const standCharge = standChargePerBracelet(settings, unitsSold);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Pricing"
        title="Pricing calculator"
        description="See what each bracelet costs to make, the lowest safe price, and a good price that leaves profit for growth, savings, and your pay."
      />
      {params.saved && savedMessages[params.saved] && (
        <p className="admin-form-notice is-success">
          {savedMessages[params.saved]}
        </p>
      )}
      {params.error && (
        <p className="admin-form-notice is-error">{params.error}</p>
      )}

      <div className="admin-pricing-summary">
        <div>
          <span>Ads &amp; monthly costs</span>
          <strong>{sharedPct.toFixed(1)}% of every sale</strong>
          <small>
            {formatKes(
              settings.monthly_ads_kes + settings.monthly_other_costs_kes,
            )}{" "}
            ÷ {formatKes(settings.expected_monthly_sales_kes)} expected
          </small>
        </div>
        <div>
          <span>Stand payback</span>
          <strong>
            {standCharge > 0
              ? `${formatKes(standCharge)} per bracelet`
              : "Paid back"}
          </strong>
          <small>
            {settings.stand_bought_on
              ? `${Math.min(unitsSold, settings.stand_payback_units)} of ${settings.stand_payback_units} sold since ${settings.stand_bought_on}`
              : "Add the date you bought it to track payback"}
          </small>
        </div>
        <div>
          <span>Target profit</span>
          <strong>{settings.target_profit_pct}%</strong>
          <small>
            Split {settings.better_products_pct}% better products ·{" "}
            {settings.reserves_pct}% savings ·{" "}
            {100 - settings.better_products_pct - settings.reserves_pct}% your
            pay
          </small>
        </div>
      </div>

      <div className="admin-list-toolbar">
        <p>
          {totalCount || 0} product{totalCount === 1 ? "" : "s"}
        </p>
        <span className="admin-toolbar-note">
          Prices shown for selling directly. Open a bracelet to see consignment
          prices.
        </span>
      </div>
      <div className="admin-table admin-pricing-table">
        <div className="admin-table-head">
          <span>Bracelet</span>
          <span>Cost to make</span>
          <span>Safe / good price</span>
          <span>Store price</span>
          <span>Status</span>
          <span>Open</span>
        </div>
        {products?.length ? (
          products.map((product: any) => {
            const row = recipeFor.get(product.id);
            const storePrice = Number(product.price_kes ?? product.price) || 0;
            if (!row)
              return (
                <div key={product.id}>
                  <strong>
                    {product.title}
                    <small>{product.sku}</small>
                  </strong>
                  <span className="admin-pricing-muted">Not set up</span>
                  <span className="admin-pricing-muted">—</span>
                  <span>{formatKes(storePrice)}</span>
                  <span className="admin-status admin-status-paused">
                    Needs costs
                  </span>
                  <Link
                    className="admin-table-action"
                    href={`/admin/pricing/${product.id}`}
                  >
                    Add costs →
                  </Link>
                </div>
              );
            const recipe = toCostRecipe(row);
            const guide = priceGuide(recipe, settings, "direct", unitsSold);
            const result = checkPrice(
              storePrice,
              recipe,
              settings,
              "direct",
              unitsSold,
            );
            return (
              <div key={product.id}>
                <strong>
                  {product.title}
                  <small>{product.sku}</small>
                </strong>
                <span>{formatKes(guide.making.total)}</span>
                <span>
                  {guide.breakEven === null || guide.goodPrice === null
                    ? "Check settings"
                    : `${formatKes(guide.breakEven)} / ${formatKes(guide.goodPrice)}`}
                </span>
                <span>
                  {formatKes(storePrice)}
                  <small>
                    {result.profit >= 0 ? "Profit" : "Loss"}{" "}
                    {formatKes(Math.abs(result.profit))}
                  </small>
                </span>
                <span
                  className={`admin-status admin-pricing-status-${result.status}`}
                >
                  {priceStatusLabel[result.status]}
                </span>
                <Link
                  className="admin-table-action"
                  href={`/admin/pricing/${product.id}`}
                >
                  Open →
                </Link>
              </div>
            );
          })
        ) : (
          <p className="admin-table-empty">
            Add products in the catalogue first.
          </p>
        )}
      </div>
      <AdminPagination
        currentPage={page}
        totalPages={totalPages}
        totalCount={totalCount || 0}
        pageSize={PAGE_SIZE}
      />

      <form
        action={savePricingSettings}
        className="admin-product-form admin-pricing-settings"
      >
        {settingGroups.map((group) => (
          <section key={group.title} className="admin-form-section">
            <div className="admin-form-heading">
              <div>
                <p className="admin-kicker">Settings</p>
                <h2>{group.title}</h2>
                <p>{group.intro}</p>
              </div>
            </div>
            <div className="admin-form-grid">
              {group.fields.map((field) => (
                <label key={field.name}>
                  {field.label}
                  <input
                    name={field.name}
                    type="number"
                    min="0"
                    step={field.step || "1"}
                    defaultValue={String(settings[field.name] ?? 0)}
                    required
                  />
                  <span className="admin-field-help">{field.help}</span>
                </label>
              ))}
              {group.title === "Display stand" && (
                <label>
                  Date you bought the stand
                  <input
                    name="stand_bought_on"
                    type="date"
                    defaultValue={settings.stand_bought_on || ""}
                  />
                  <span className="admin-field-help">
                    Sales from this date count towards paying it back.
                  </span>
                </label>
              )}
            </div>
          </section>
        ))}
        <div className="admin-form-actions">
          <button type="submit" className="admin-primary-action">
            Save settings
          </button>
        </div>
      </form>
    </div>
  );
}
