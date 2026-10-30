import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import { DESIGN_ID } from "@/lib/design/design-id";
import { designQuery, priceRangeKes, readDesignParams, resolveDesign } from "@/lib/design/design-link";
import { absoluteUrl } from "@/lib/commerce/seo";
import { getDesignStones } from "@/lib/design/stones-server";

// Keeps a copy of each design sent to WhatsApp, under the id the message
// carries. Called with sendBeacon as WhatsApp opens, so it never holds the
// customer up; it answers 204 whatever happens and only logs failures.
export async function POST(request: Request) {
  const done = new NextResponse(null, { status: 204 });
  try {
    const raw = await request.text();
    if (raw.length > 2000) return done;
    const body = JSON.parse(raw) as { id?: string; link?: string; wrist?: number | null; gift?: boolean; placement?: string; from?: string };
    if (!body.id || !DESIGN_ID.test(body.id) || !body.link) return done;
    const params = readDesignParams(new URLSearchParams(body.link));
    if (!params) return done;
    const { stones } = await getDesignStones();
    const resolved = resolveDesign(stones, params);
    if (!resolved) return done;
    const { main, second } = resolved;
    const [from, to] = priceRangeKes(main, second);
    const wrist = Number.isInteger(body.wrist) && body.wrist! >= 10 && body.wrist! <= 30 ? body.wrist : null;
    const admin = getSupabaseAdmin();
    if (!admin) return done;
    const { error } = await admin.from("design_leads").insert({
      id: body.id,
      main_stone: main.slug,
      main_name: main.name,
      second_stone: second?.slug ?? null,
      second_name: second?.name ?? null,
      pattern: params.pattern,
      bead_size: params.size,
      spacers: params.spacers,
      letters: params.letters,
      letter_kind: params.letters ? params.kind : null,
      charm: params.charm,
      wrist_cm: wrist,
      gift: !!body.gift,
      price_kes_from: from,
      price_kes_to: to,
      link: absoluteUrl(`/design-your-own?${designQuery({ ...params, stone: main.slug, with: second?.slug ?? null })}`),
      placement: body.placement === "bar" ? "bar" : "summary",
      from_design: body.from && DESIGN_ID.test(body.from) ? body.from : null,
    });
    // 42P01: the table is not there yet (3-add-design-leads.sql); 23505: a repeat send.
    if (error && error.code !== "42P01" && error.code !== "23505")
      console.error("Unable to save a sent design", error.message);
  } catch {
    // A malformed body is not worth an error page.
  }
  return done;
}
