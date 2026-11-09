import Link from "next/link";
import { randomUUID } from "crypto";
import ManualOrderForm, {
  type CatalogueOption,
} from "@/components/admin/ManualOrderForm";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import { createManualOrder } from "../actions";

export const dynamic = "force-dynamic";

/** "YYYY-MM-DDTHH:mm" for a datetime-local input, in Nairobi time. */
const nowInNairobi = () =>
  new Date(Date.now() + 3 * 3600_000).toISOString().slice(0, 16);

export default async function NewManualOrder({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const { admin } = await requireAdmin();
  const { data } = await admin
    .from("product_variants")
    .select(
      "id,title,price_adjustment,price_adjustment_kes,price_adjustment_usd,active,products!inner(title,price,price_kes,price_usd,active)",
    )
    .eq("active", true);
  const options: CatalogueOption[] = ((data || []) as any[])
    .map((v) => {
      const p = v.products;
      const kes =
        Number(p.price_kes ?? p.price ?? 0) +
        Number(v.price_adjustment_kes ?? v.price_adjustment ?? 0);
      const usd =
        p.price_usd === null || p.price_usd === undefined
          ? null
          : Number(p.price_usd) + Number(v.price_adjustment_usd ?? 0);
      return {
        variantId: v.id as string,
        label: `${p.title} · ${v.title}${p.active ? "" : " (not listed)"}`,
        priceKes: kes,
        priceUsd: usd,
      };
    })
    .sort((a, b) => a.label.localeCompare(b.label));

  return (
    <div className="admin-page">
      <Link href="/admin/orders" className="admin-back-link">
        ← All orders
      </Link>
      <PageHeader
        eyebrow="Fulfilment"
        title="Record an order"
        description="For a sale that didn't go through the website checkout: Instagram, WhatsApp, in person, a stockist. Set the date it really happened."
      />
      {error && <p className="admin-form-notice is-error">{error}</p>}
      <ManualOrderForm
        action={createManualOrder}
        catalogue={options}
        idempotencyKey={randomUUID()}
        defaultDate={nowInNairobi()}
      />
    </div>
  );
}
