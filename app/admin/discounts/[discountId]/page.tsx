import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import DiscountCampaignForm from "@/components/admin/DiscountCampaignForm";
import { toggleDiscount, updateDiscount } from "@/app/admin/discounts/actions";
import { requireAdmin } from "@/lib/admin/auth";
import { discountStatus, formatNairobiDateTime } from "@/lib/admin/discounts";

export default async function DiscountDetail({
  params,
  searchParams,
}: {
  params: Promise<{ discountId: string }>;
  searchParams: Promise<{ error?: string; updated?: string; created?: string }>;
}) {
  const { admin, profile } = await requireAdmin();
  if (!["owner", "commerce_manager"].includes(profile.role)) redirect("/admin");
  const { discountId } = await params;
  const query = await searchParams;
  const { data: campaign } = await admin
    .from("discount_codes")
    .select("*")
    .eq("id", discountId)
    .maybeSingle();
  if (!campaign) notFound();
  const { data: redemptions } = await admin
    .from("discount_redemptions")
    .select(
      "id,code_snapshot,discount_amount,currency,qualifying_subtotal,released_at,released_reason,created_at,orders(order_number,total_amount,currency,status,payment_status)",
    )
    .eq("discount_code_id", discountId)
    .order("created_at", { ascending: false });
  const activeRedemptions = (redemptions || []).filter(
    (redemption: any) => !redemption.released_at,
  );
  const status = discountStatus(campaign, activeRedemptions.length);
  const codeLocked = (redemptions?.length || 0) > 0;
  return (
    <div className="admin-page">
      <Link href="/admin/discounts" className="admin-back-link">
        ← All offers
      </Link>
      <header className="admin-order-header">
        <div>
          <p className="admin-kicker">Offer {campaign.code}</p>
          <h1>{campaign.name}</h1>
          <p>
            Starts {formatNairobiDateTime(campaign.starts_at)} · Ends{" "}
            {formatNairobiDateTime(campaign.ends_at)}
          </p>
        </div>
        <span className={`admin-status admin-status-${status}`}>{status}</span>
      </header>
      {query.error && (
        <p className="admin-form-notice is-error">{query.error}</p>
      )}
      {(query.updated || query.created) && (
        <p className="admin-form-notice is-success">
          Offer saved. Checkout will use the new rules immediately.
        </p>
      )}
      <div className="admin-discount-metrics">
        <div>
          <span>Active redemptions</span>
          <strong>
            {activeRedemptions.length}
            {campaign.max_redemptions ? ` / ${campaign.max_redemptions}` : ""}
          </strong>
        </div>
        <div>
          <span>Total issued</span>
          <strong>{redemptions?.length || 0}</strong>
        </div>
        <div>
          <span>Currently saved</span>
          <strong>
            {activeRedemptions
              .reduce(
                (total: number, item: any) =>
                  total + Number(item.discount_amount),
                0,
              )
              .toLocaleString()}{" "}
            <small>mixed currencies</small>
          </strong>
        </div>
      </div>
      <div className="admin-discount-toggle">
        <div>
          <strong>
            {campaign.active ? "Campaign is live" : "Campaign is paused"}
          </strong>
          <span>
            Pausing stops new redemptions without changing completed orders.
          </span>
        </div>
        <form action={toggleDiscount}>
          <input type="hidden" name="discount_id" value={campaign.id} />
          <input type="hidden" name="active" value={String(!campaign.active)} />
          <button className="admin-secondary-action" type="submit">
            {campaign.active ? "Deactivate code" : "Reactivate code"}
          </button>
        </form>
      </div>
      <DiscountCampaignForm
        action={updateDiscount}
        campaign={campaign}
        codeLocked={codeLocked}
        submitLabel="Save campaign"
      />
      <section className="admin-panel admin-discount-redemptions">
        <p className="admin-kicker">Redemption ledger</p>
        <h2>Orders that used this offer</h2>
        {redemptions?.length ? (
          <div className="admin-data-list">
            {redemptions.map((redemption: any) => {
              const order: any = redemption.orders;
              return (
                <span key={redemption.id}>
                  <strong>
                    <Link href={`/admin/orders/${order?.order_number}`}>
                      {order?.order_number || "Order removed"}
                    </Link>
                    {redemption.released_at ? " · released" : " · redeemed"}
                  </strong>
                  <em>
                    {redemption.currency}{" "}
                    {Number(redemption.discount_amount).toLocaleString()} off a{" "}
                    {redemption.currency}{" "}
                    {Number(redemption.qualifying_subtotal).toLocaleString()}{" "}
                    subtotal
                  </em>
                  <small>
                    {new Date(redemption.created_at).toLocaleString("en-KE", {
                      timeZone: "Africa/Nairobi",
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                    {redemption.released_reason
                      ? ` · ${redemption.released_reason}`
                      : ""}
                  </small>
                </span>
              );
            })}
          </div>
        ) : (
          <p>No customer has redeemed this offer yet.</p>
        )}
      </section>
    </div>
  );
}
