import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { discountStatus } from "@/lib/admin/discounts";

export default async function AdminDiscounts() {
  const { admin, profile } = await requireAdmin();
  if (!["owner", "commerce_manager"].includes(profile.role)) redirect("/admin");
  const { data: campaigns } = await admin
    .from("discount_codes")
    .select(
      "id,code,name,discount_type,percentage_basis_points,fixed_amount_kes,fixed_amount_usd,max_redemptions,starts_at,ends_at,active,created_at",
    )
    .order("created_at", { ascending: false });
  const ids = campaigns?.map((campaign: any) => campaign.id) || [];
  const { data: redemptions } = ids.length
    ? await admin
        .from("discount_redemptions")
        .select("discount_code_id,discount_amount,released_at")
        .in("discount_code_id", ids)
    : { data: [] as any[] };
  const performance = new Map<string, { uses: number; savings: number }>();
  for (const redemption of redemptions || []) {
    if (redemption.released_at) continue;
    const current = performance.get(redemption.discount_code_id) || {
      uses: 0,
      savings: 0,
    };
    performance.set(redemption.discount_code_id, {
      uses: current.uses + 1,
      savings: current.savings + Number(redemption.discount_amount),
    });
  }
  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Campaigns"
        title="Offers"
        description="Build a considered reason to buy, then keep every redemption in BWA’s own ledger."
        action={{ href: "/admin/discounts/new", label: "New offer" }}
      />
      <div className="admin-list-toolbar">
        <p>
          {campaigns?.length || 0} campaign{campaigns?.length === 1 ? "" : "s"}
        </p>
        <span className="admin-toolbar-note">
          Discounts apply to bracelet subtotal, never delivery.
        </span>
      </div>
      <div className="admin-table admin-discounts-table">
        <div className="admin-table-head">
          <span>Campaign</span>
          <span>Offer</span>
          <span>Use</span>
          <span>Status</span>
          <span>Open</span>
        </div>
        {campaigns?.map((campaign: any) => {
          const stats = performance.get(campaign.id) || { uses: 0, savings: 0 };
          const status = discountStatus(campaign, stats.uses);
          const offer =
            campaign.discount_type === "percentage"
              ? `${Number(campaign.percentage_basis_points) / 100}% off`
              : `KES ${Number(campaign.fixed_amount_kes).toLocaleString()} / USD ${Number(campaign.fixed_amount_usd).toLocaleString()} off`;
          return (
            <div key={campaign.id}>
              <span>
                <strong>{campaign.code}</strong>
                <small>{campaign.name}</small>
              </span>
              <span>{offer}</span>
              <span>
                {stats.uses}
                {campaign.max_redemptions
                  ? ` / ${campaign.max_redemptions}`
                  : ""}
                <small>
                  Saved {stats.savings.toLocaleString()} in mixed currencies
                </small>
              </span>
              <span className={`admin-status admin-status-${status}`}>
                {status}
              </span>
              <Link
                className="admin-table-action"
                href={`/admin/discounts/${campaign.id}`}
              >
                Manage →
              </Link>
            </div>
          );
        }) || (
          <p className="admin-table-empty">
            Create your first offer when you are ready.
          </p>
        )}
      </div>
    </div>
  );
}
