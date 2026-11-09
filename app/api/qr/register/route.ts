import { NextResponse } from "next/server";
import {
  CONSENT_TEXT,
  newWelcomeCode,
  parseQrRegistration,
} from "@/lib/commerce/qr-welcome";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase)
    return NextResponse.json(
      { error: "This is being set up. Please message us on WhatsApp." },
      { status: 503 },
    );
  try {
    const body = await request.json();
    // Hidden field only bots fill in: answer as if it worked, save nothing.
    if (String(body?.company ?? "").trim())
      return NextResponse.json({ code: null, paused: true });
    const parsed = parseQrRegistration(body);
    if (!parsed.ok)
      return NextResponse.json({ error: parsed.error }, { status: 400 });
    const r = parsed.value;
    // A code clash is one in ~900 million; try a second code just in case.
    for (let attempt = 0; attempt < 2; attempt++) {
      const { data, error } = await (supabase as any).rpc(
        "register_qr_welcome",
        {
          p_slug: r.slug,
          p_first_name: r.firstName,
          p_phone: r.phone,
          p_product_id: r.productId,
          p_consent: r.consent,
          p_consent_text: CONSENT_TEXT,
          p_visitor_id: r.visitorId,
          p_code: newWelcomeCode(),
        },
      );
      if (error?.code === "23505" && attempt === 0) continue;
      if (error) {
        const message = String(error.message);
        if (message.includes("QR_NOT_FOUND"))
          return NextResponse.json(
            { error: "This link isn't valid." },
            { status: 404 },
          );
        if (message.includes("QR_TOO_MANY"))
          return NextResponse.json(
            {
              error:
                "That's a lot of registrations in a short time. Message us on WhatsApp and we'll help.",
            },
            { status: 429 },
          );
        if (message.includes("QR_INVALID"))
          return NextResponse.json(
            { error: "Check your name and number, then try again." },
            { status: 400 },
          );
        throw error;
      }
      const row = Array.isArray(data) ? data[0] : data;
      return NextResponse.json({
        code: row.code,
        endsAt: row.ends_at,
        percent: row.percent,
        minimumKes: row.minimum_kes ? Number(row.minimum_kes) : null,
        already: row.already,
        used: row.used,
        paused: row.paused,
        firstName: r.firstName,
      });
    }
    throw new Error("Could not create a code.");
  } catch (error) {
    console.error("BWA QR register failed", error);
    return NextResponse.json(
      { error: "We couldn't save that. Please try again." },
      { status: 500 },
    );
  }
}
