import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const eventTypes = new Set(["added_to_bag", "bespoke_started"]);

export async function POST(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) return NextResponse.json({ ok: true });
  try {
    const body = await request.json();
    if (!eventTypes.has(body.eventType) || !body.sessionToken)
      return NextResponse.json({ error: "Invalid event." }, { status: 400 });
    const { data: session } = await admin
      .from("quiz_sessions")
      .select("id")
      .eq("session_token", String(body.sessionToken))
      .maybeSingle();
    if (session)
      await admin.from("discovery_events").insert({
        quiz_session_id: session.id,
        event_type: body.eventType,
        product_id: body.productId || null,
      });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
