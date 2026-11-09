import Link from "next/link";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { requireAdmin } from "@/lib/admin/auth";
import {
  formatQrDate,
  qrChannelLabel,
  qrKes,
  qrPercent,
  scansPerDay,
  welcomeUrl,
} from "@/lib/commerce/qr-welcome";
import { toWhatsAppNumber, whatsAppLink } from "@/lib/commerce/whatsapp";
import { setQrLinkActive } from "../actions";

const UUID = /^[0-9a-f-]{36}$/i;
const DAYS = 30;

type Registration = {
  id: string;
  created_at: string;
  first_name: string;
  phone: string;
  marketing_consent: boolean;
  issued_code: boolean;
  customer_id: string;
  discount_code_id: string | null;
  products: { title: string } | null;
  discount_codes: { code: string; ends_at: string | null } | null;
};
type Order = {
  order_number: string;
  customer_id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
};

export default async function QrLinkDetail({
  params,
}: {
  params: Promise<{ linkId: string }>;
}) {
  const { linkId } = await params;
  if (!UUID.test(linkId)) notFound();
  const { admin } = await requireAdmin();
  const { data: link } = await admin
    .from("qr_links")
    .select("*")
    .eq("id", linkId)
    .maybeSingle();
  if (!link) notFound();

  const since = new Date(Date.now() - DAYS * 86_400_000).toISOString();
  const [{ data: stats }, { data: scans }, { data: regData }] =
    await Promise.all([
      admin
        .from("qr_link_stats")
        .select("*")
        .eq("link_id", linkId)
        .maybeSingle(),
      admin
        .from("qr_scans")
        .select("scanned_at")
        .eq("link_id", linkId)
        .gte("scanned_at", since)
        .limit(10000),
      admin
        .from("qr_registrations")
        .select(
          "id,created_at,first_name,phone,marketing_consent,issued_code,customer_id,discount_code_id,products(title),discount_codes(code,ends_at)",
        )
        .eq("link_id", linkId)
        .order("created_at", { ascending: false })
        .limit(300),
    ]);
  const registrations = (regData || []) as unknown as Registration[];
  const customerIds = [...new Set(registrations.map((r) => r.customer_id))];
  const codeIds = [
    ...new Set(registrations.map((r) => r.discount_code_id).filter(Boolean)),
  ] as string[];
  const [{ data: orderData }, { data: redemptions }] = await Promise.all([
    customerIds.length
      ? admin
          .from("orders")
          .select(
            "order_number,customer_id,total_amount,currency,status,created_at",
          )
          .in("customer_id", customerIds)
      : Promise.resolve({ data: [] }),
    codeIds.length
      ? admin
          .from("discount_redemptions")
          .select("discount_code_id")
          .in("discount_code_id", codeIds)
          .is("released_at", null)
      : Promise.resolve({ data: [] }),
  ]);
  const orders = (orderData || []) as Order[];
  const usedCodes = new Set(
    ((redemptions || []) as { discount_code_id: string }[]).map(
      (r) => r.discount_code_id,
    ),
  );
  const ordersAfter = (r: Registration) =>
    orders.filter(
      (o) =>
        o.customer_id === r.customer_id &&
        o.created_at > r.created_at &&
        !["cancelled", "refunded"].includes(o.status),
    );

  const url = welcomeUrl(link.slug);
  const qrOptions = {
    errorCorrectionLevel: "M" as const,
    margin: 2,
    color: { dark: "#171716", light: "#ffffff" },
  };
  const [svg, png] = await Promise.all([
    QRCode.toString(url, { ...qrOptions, type: "svg" }),
    QRCode.toDataURL(url, { ...qrOptions, width: 1200 }),
  ]);
  const svgHref = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;

  const days = scansPerDay(
    ((scans || []) as { scanned_at: string }[]).map((s) => s.scanned_at),
    DAYS,
  );
  const peak = Math.max(1, ...days.map((d) => d.count));
  const s = {
    scans: Number(stats?.scans || 0),
    visitors: Number(stats?.visitors || 0),
    people: Number(stats?.people || 0),
    codesIssued: Number(stats?.codes_issued || 0),
    codesUsed: Number(stats?.codes_used || 0),
    orders: Number(stats?.orders || 0),
    revenueKes: Number(stats?.revenue_kes || 0),
    revenueUsd: Number(stats?.revenue_usd || 0),
  };
  const funnel = [
    { label: "Scans", value: s.scans, note: `${s.visitors} different phones` },
    {
      label: "Registered",
      value: s.people,
      note: `${qrPercent(s.people, s.visitors)} of phones`,
    },
    {
      label: "Codes used",
      value: s.codesUsed,
      note: `${qrPercent(s.codesUsed, s.codesIssued)} of ${s.codesIssued} given`,
    },
    {
      label: "Orders after",
      value: s.orders,
      note: `${qrKes(s.revenueKes)}${s.revenueUsd ? ` · USD ${s.revenueUsd}` : ""}`,
    },
  ];

  return (
    <div className="admin-page">
      <Link href="/admin/qr" className="admin-back-link">
        ← All QR links
      </Link>
      <header className="admin-order-header">
        <div>
          <p className="admin-kicker">
            {qrChannelLabel(link.channel)} · made{" "}
            {formatQrDate(link.created_at)}
          </p>
          <h1>{link.name}</h1>
          <p>
            <a href={url} target="_blank" rel="noopener noreferrer">
              {url.replace(/^https:\/\//, "")}
            </a>{" "}
            · {link.reward_percent}% off, valid {link.reward_valid_days} days
            {link.minimum_subtotal_kes
              ? `, orders from ${qrKes(link.minimum_subtotal_kes)}`
              : ""}
          </p>
        </div>
        <form action={setQrLinkActive}>
          <input type="hidden" name="id" value={link.id} />
          <input
            type="hidden"
            name="active"
            value={link.active ? "false" : "true"}
          />
          <span
            className={`admin-status ${link.active ? "admin-status-live" : ""}`}
          >
            {link.active ? "Live" : "Paused"}
          </span>{" "}
          <button type="submit" className="admin-secondary-action">
            {link.active ? "Pause" : "Resume"}
          </button>
        </form>
      </header>

      <div className="admin-qr-top">
        <section className="admin-panel admin-qr-code">
          <p className="admin-kicker">QR code</p>
          <div
            className="admin-qr-image"
            role="img"
            aria-label={`QR code for ${url}`}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <div className="admin-qr-downloads">
            <a href={svgHref} download={`bwa-qr-${link.slug}.svg`}>
              Download SVG (for print)
            </a>
            <a href={png} download={`bwa-qr-${link.slug}.png`}>
              Download PNG
            </a>
          </div>
        </section>

        <section className="admin-panel">
          <p className="admin-kicker">How it&apos;s doing</p>
          <ol className="admin-qr-funnel">
            {funnel.map((step) => (
              <li key={step.label}>
                <span>{step.label}</span>
                <strong>{step.value}</strong>
                <small>{step.note}</small>
              </li>
            ))}
          </ol>
          <p className="admin-kicker admin-qr-days-title">
            Scans, last {DAYS} days
          </p>
          <div
            className="admin-qr-days"
            aria-label={`Scans per day, last ${DAYS} days`}
          >
            {days.map((d) => (
              <span
                key={d.day}
                title={`${d.day}: ${d.count}`}
                style={{ height: `${Math.max(4, (d.count / peak) * 100)}%` }}
                className={d.count ? "has-scans" : undefined}
              />
            ))}
          </div>
          <small className="admin-field-help">
            Orders count for the link a customer first registered through, when
            placed on the website after registering. The shop sale that came
            with the card isn&apos;t visible here.
          </small>
        </section>
      </div>

      <section className="admin-panel">
        <p className="admin-kicker">
          Registered through this link ({registrations.length})
        </p>
        <div className="admin-table admin-qr-people">
          <div className="admin-table-head">
            <span>Customer</span>
            <span>Bracelet</span>
            <span>Code</span>
            <span>Orders after</span>
            <span />
          </div>
          {registrations.length ? (
            registrations.map((r) => {
              const after = ordersAfter(r);
              const code = r.discount_codes;
              const used =
                r.discount_code_id && usedCodes.has(r.discount_code_id);
              const expired =
                code?.ends_at && new Date(code.ends_at) <= new Date();
              const wa = toWhatsAppNumber(r.phone);
              return (
                <div key={r.id}>
                  <span>
                    <Link href={`/admin/customers/${r.customer_id}`}>
                      <strong>{r.first_name}</strong>
                    </Link>
                    <small>
                      +{r.phone} · {formatQrDate(r.created_at)}
                      {r.marketing_consent ? " · wants new collections" : ""}
                    </small>
                  </span>
                  <span>{r.products?.title || <small>Not given</small>}</span>
                  <span>
                    {code ? code.code : "None (paused)"}
                    <small>
                      {!code
                        ? ""
                        : used
                          ? "Used"
                          : expired
                            ? "Expired"
                            : r.issued_code
                              ? `Unused · until ${formatQrDate(code.ends_at)}`
                              : "Given earlier"}
                    </small>
                  </span>
                  <span>
                    {after.length ? (
                      after.map((o) => (
                        <Link
                          key={o.order_number}
                          href={`/admin/orders/${o.order_number}`}
                        >
                          {o.order_number}
                          <small>
                            {o.currency}{" "}
                            {Number(o.total_amount).toLocaleString("en-KE")}
                          </small>
                        </Link>
                      ))
                    ) : (
                      <small>None yet</small>
                    )}
                  </span>
                  {wa ? (
                    <a
                      className="admin-table-action"
                      href={whatsAppLink(
                        wa,
                        `Hi ${r.first_name}, this is BWA.`,
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      WhatsApp
                    </a>
                  ) : (
                    <span />
                  )}
                </div>
              );
            })
          ) : (
            <p className="admin-table-empty">Nobody has registered yet.</p>
          )}
        </div>
      </section>
    </div>
  );
}
