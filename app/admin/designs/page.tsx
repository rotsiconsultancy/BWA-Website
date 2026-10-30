import PageHeader from "@/components/admin/PageHeader";
import AdminPagination from "@/components/admin/AdminPagination";
import { requireAdmin } from "@/lib/admin/auth";
import { setDesignStatus } from "./actions";

const PAGE_SIZE = 15;
const STATUS_LABELS: Record<string, string> = {
  sent: "Sent",
  ordered: "Became an order",
  no_reply: "No reply",
  declined: "Declined",
};
const sentOn = new Intl.DateTimeFormat("en-KE", {
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Africa/Nairobi",
});

type Lead = {
  id: string;
  created_at: string;
  main_name: string;
  second_name: string | null;
  pattern: string;
  bead_size: string;
  spacers: boolean;
  letters: string | null;
  letter_kind: string | null;
  charm: boolean;
  wrist_cm: number | null;
  gift: boolean;
  price_kes_from: number;
  price_kes_to: number;
  link: string;
  status: string;
};

export default async function AdminDesigns({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; q?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10));
  const q = (params.q || "").trim().toUpperCase();
  const from = (page - 1) * PAGE_SIZE;

  const { admin } = await requireAdmin();
  let query = admin
    .from("design_leads")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, from + PAGE_SIZE - 1);
  // "4K7QM" or "D-4K7QM" both find D-4K7QM.
  if (q) query = query.ilike("id", `%${q.replace(/^D-/, "").replace(/[^2-9A-Z]/g, "")}%`);
  const { data, count, error } = await query;
  const leads = (data || []) as Lead[];
  const missing = error?.code === "42P01";

  return (
    <div className="admin-page">
      <PageHeader
        eyebrow="Design Your Own"
        title="Sent designs"
        description="Every design sent to WhatsApp from /design-your-own, under the id in the customer's message. Mark the ones that became orders."
      />
      <form className="admin-list-toolbar admin-designs-search" action="/admin/designs">
        <p>
          {missing ? "Not set up yet" : `${count || 0} design${count === 1 ? "" : "s"}`}
        </p>
        <input name="q" defaultValue={params.q || ""} placeholder="Find an id, e.g. D-4K7QM" aria-label="Find a design by id" />
      </form>
      {missing ? (
        <p className="admin-table-empty">
          Run Website-data/design-your-own-plan-2026-10-30/3-add-design-leads.sql in the Supabase SQL editor to start keeping sent designs.
        </p>
      ) : (
        <div className="admin-table admin-designs-table">
          <div className="admin-table-head">
            <span>Design</span>
            <span>What they chose</span>
            <span>Price</span>
            <span>Status</span>
          </div>
          {leads.length ? (
            leads.map((lead) => (
              <div key={lead.id}>
                <span>
                  <strong>
                    <a href={lead.link} target="_blank" rel="noopener noreferrer">
                      {lead.id}
                    </a>
                  </strong>
                  <br />
                  <small>{sentOn.format(new Date(lead.created_at))}</small>
                </span>
                <span>
                  <strong>
                    {lead.main_name}
                    {lead.second_name && ` + ${lead.second_name}`}
                  </strong>
                  <br />
                  <small>
                    {[
                      lead.pattern === "alt" ? "alternating" : lead.pattern === "accent" ? "accents" : null,
                      `${lead.bead_size} beads`,
                      lead.spacers && "spacers",
                      lead.letters && `letters ${lead.letters} (${lead.letter_kind})`,
                      lead.charm && "charm",
                      lead.wrist_cm ? `${lead.wrist_cm} cm wrist` : "wrist not given",
                      lead.gift && "gift",
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </small>
                </span>
                <span>
                  KES {Number(lead.price_kes_from).toLocaleString("en-KE")}–
                  {Number(lead.price_kes_to).toLocaleString("en-KE")}
                </span>
                <form action={setDesignStatus} className="admin-designs-status">
                  <input type="hidden" name="id" value={lead.id} />
                  <select name="status" defaultValue={lead.status} aria-label={`Status of ${lead.id}`}>
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                  <button type="submit">Save</button>
                </form>
              </div>
            ))
          ) : (
            <p className="admin-table-empty">
              {q ? "No design with that id." : "No designs sent yet."}
            </p>
          )}
        </div>
      )}
      {!missing && (
        <AdminPagination
          currentPage={page}
          totalPages={Math.ceil((count || 0) / PAGE_SIZE)}
          totalCount={count || 0}
          pageSize={PAGE_SIZE}
        />
      )}
    </div>
  );
}
