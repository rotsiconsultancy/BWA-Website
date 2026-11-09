import { NextResponse } from "next/server";
import { QR_SLUG, VISITOR_ID } from "@/lib/commerce/qr-welcome";
import { getSupabaseAdmin } from "@/lib/supabase/server";

// The welcome page calls this once it has loaded in a real browser, so link
// previews (WhatsApp, Facebook) that never run scripts aren't counted. A
// reload by the same phone within 10 minutes counts once.
export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase) return new NextResponse(null, { status: 204 });
  try {
    const body = await request.json();
    const slug = String(body?.slug ?? "");
    const visitorId = String(body?.visitorId ?? "");
    if (!QR_SLUG.test(slug) || !VISITOR_ID.test(visitorId))
      return new NextResponse(null, { status: 204 });
    const { data: link } = await supabase
      .from("qr_links")
      .select("id")
      .eq("slug", slug)
      .maybeSingle();
    if (!link) return new NextResponse(null, { status: 204 });
    const since = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count } = await supabase
      .from("qr_scans")
      .select("id", { count: "exact", head: true })
      .eq("link_id", link.id)
      .eq("visitor_id", visitorId)
      .gte("scanned_at", since);
    if (!count) {
      const ua = request.headers.get("user-agent") || "";
      await supabase.from("qr_scans").insert({
        link_id: link.id,
        visitor_id: visitorId,
        device: /Mobi|Android|iPhone|iPad/i.test(ua) ? "mobile" : "desktop",
      });
    }
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("BWA QR scan log failed", error);
    return new NextResponse(null, { status: 204 });
  }
}
