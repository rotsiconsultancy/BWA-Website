import Link from "next/link";
import PageHeader from "@/components/admin/PageHeader";
import { requireAdmin } from "@/lib/admin/auth";
import {
  QR_CHANNELS,
  QR_DEFAULTS,
  qrChannelLabel,
  qrKes as kes,
  qrPercent as pct,
} from "@/lib/commerce/qr-welcome";
import { createQrLink } from "./actions";

type LinkRow = {
  id: string;
  slug: string;
  name: string;
  channel: string;
  reward_percent: number;
  active: boolean;
  created_at: string;
};
type Stats = {
  link_id: string;
  scans: number;
  visitors: number;
  registrations: number;
  people: number;
  codes_used: number;
  orders: number;
  revenue_kes: number;
};

export default async function AdminQrLinks({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error: formError } = await searchParams;
  const { admin } = await requireAdmin();
  const { data, error } = await admin
    .from("qr_links")
    .select("id,slug,name,channel,reward_percent,active,created_at")
    .order("created_at", { ascending: false });
  const missing = error?.code === "42P01" || error?.code === "PGRST205";
  const links = (data || []) as LinkRow[];
  const { data: statRows } = missing
    ? { data: [] }
    : await admin.from("qr_link_stats").select("*");
  const stats = new Map(
    ((statRows || []) as Stats[]).map((s) => [s.link_id, s]),
  );
  const total = (key: keyof Stats) =>
    [...stats.values()].reduce((sum, s) => sum + Number(s[key] || 0), 0);

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Packaging card"
        title="QR links"
        description="One link per shop, channel or print run. Every scan opens /welcome/<link>, where customers register their bracelet and get a one-time welcome code."
      />

      {missing ? (
        <p className="admin-table-empty">
          Run Website-data/qr-links-2026-11-09/1-add-qr-links.sql in the
          Supabase SQL editor to switch on QR links.
        </p>
      ) : (
        <>
          <div className="admin-stat-grid admin-qr-stats">
            <div className="admin-panel">
              <p className="admin-kicker">Scans</p>
              <h2>{total("scans")}</h2>
            </div>
            <div className="admin-panel">
              <p className="admin-kicker">Registered</p>
              <h2>
                {total("people")}{" "}
                <small>({pct(total("people"), total("visitors"))})</small>
              </h2>
            </div>
            <div className="admin-panel">
              <p className="admin-kicker">Orders after</p>
              <h2>
                {total("orders")} <small>{kes(total("revenue_kes"))}</small>
              </h2>
            </div>
          </div>

          <form action={createQrLink} className="admin-panel admin-qr-create">
            <p className="admin-kicker">New QR link</p>
            {formError && (
              <p className="review-error" role="alert">
                {formError === "fields"
                  ? "Give the link a name and pick a channel."
                  : "Couldn't save the link. Try again."}
              </p>
            )}
            <div className="admin-qr-create-grid">
              <label>
                Name
                <input
                  name="name"
                  required
                  maxLength={80}
                  placeholder="ManCave Mwanzi, Nov print run"
                />
              </label>
              <label>
                Channel
                <select name="channel" defaultValue="mancave">
                  {QR_CHANNELS.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.label}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                % off next order
                <input
                  name="reward_percent"
                  type="number"
                  min={1}
                  max={50}
                  defaultValue={QR_DEFAULTS.rewardPercent}
                />
              </label>
              <label>
                Code valid (days)
                <input
                  name="valid_days"
                  type="number"
                  min={7}
                  max={365}
                  defaultValue={QR_DEFAULTS.validDays}
                />
              </label>
              <label>
                Minimum order (KES)
                <input
                  name="minimum_kes"
                  type="number"
                  min={0}
                  step={100}
                  placeholder="None"
                />
              </label>
              <button className="admin-primary-action" type="submit">
                Create link
              </button>
            </div>
            <small className="admin-field-help">
              The address is made for you, e.g. /welcome/mancave-7k2p. You can
              pause a link later; it can&apos;t be deleted once cards are
              printed.
            </small>
          </form>

          <div className="admin-table admin-qr-table">
            <div className="admin-table-head">
              <span>Link</span>
              <span>Scans</span>
              <span>Registered</span>
              <span>Orders</span>
              <span>Status</span>
              <span />
            </div>
            {links.length ? (
              links.map((link) => {
                const s = stats.get(link.id);
                return (
                  <div key={link.id}>
                    <span>
                      <strong>{link.name}</strong>
                      <small>
                        {qrChannelLabel(link.channel)} · /welcome/{link.slug}
                      </small>
                    </span>
                    <span>
                      {s?.scans ?? 0}
                      <small>{s?.visitors ?? 0} phones</small>
                    </span>
                    <span>
                      {s?.people ?? 0}
                      <small>
                        {pct(s?.people ?? 0, s?.visitors ?? 0)} of phones
                      </small>
                    </span>
                    <span>
                      {s?.orders ?? 0}
                      <small>{kes(s?.revenue_kes ?? 0)}</small>
                    </span>
                    <span>
                      <span
                        className={`admin-status ${link.active ? "admin-status-live" : ""}`}
                      >
                        {link.active ? "Live" : "Paused"}
                      </span>
                    </span>
                    <Link
                      className="admin-table-action"
                      href={`/admin/qr/${link.id}`}
                    >
                      View
                    </Link>
                  </div>
                );
              })
            ) : (
              <p className="admin-table-empty">
                No QR links yet. Create the first one above.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
