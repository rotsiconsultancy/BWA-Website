import Link from "next/link";
import { redirect } from "next/navigation";
import DiscountCampaignForm from "@/components/admin/DiscountCampaignForm";
import { createDiscount } from "@/app/admin/discounts/actions";
import { requireAdmin } from "@/lib/admin/auth";

export default async function NewDiscount({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { profile } = await requireAdmin();
  if (!["owner", "commerce_manager"].includes(profile.role)) redirect("/admin");
  const { error } = await searchParams;
  return (
    <div className="admin-page">
      <Link href="/admin/discounts" className="admin-back-link">
        ← All offers
      </Link>
      <header className="admin-page-header">
        <div>
          <p className="admin-kicker">New campaign</p>
          <h1>Make an offer worth sharing.</h1>
          <p>
            Every code is verified against live pricing at the moment of
            checkout.
          </p>
        </div>
      </header>
      {error && <p className="admin-form-notice is-error">{error}</p>}
      <DiscountCampaignForm
        action={createDiscount}
        submitLabel="Create offer"
      />
    </div>
  );
}
