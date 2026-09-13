import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase)
    return NextResponse.json(
      { error: "Bespoke requests are being configured." },
      { status: 503 },
    );
  try {
    const body = await request.json();
    if (!body.firstName?.trim() || !body.phone?.trim() || !body.notes?.trim()) {
      return NextResponse.json(
        {
          error:
            "Tell us your name, phone number, and what you would like to create.",
        },
        { status: 400 },
      );
    }
    const phone = String(body.phone).replace(/\D/g, "").replace(/^0/, "254");
    const { data: customer, error: customerError } = await supabase
      .from("customers")
      .upsert(
        {
          first_name: body.firstName.trim(),
          email: body.email?.trim().toLowerCase() || null,
          phone,
          source: "bespoke_request",
          whatsapp_opt_in: true,
        },
        { onConflict: "phone" },
      )
      .select()
      .single();
    if (customerError || !customer)
      throw customerError || new Error("Customer not created");
    const requestNumber =
      "BWA-CUSTOM-" + crypto.randomUUID().slice(0, 8).toUpperCase();
    const { data: bespoke, error } = await supabase
      .from("custom_bracelet_requests")
      .insert({
        request_number: requestNumber,
        customer_id: customer.id,
        starting_product_id: body.startingProductId || null,
        intention: body.intention ?? [],
        palette: body.palette ?? [],
        stones: body.stones ?? [],
        wrist_size: body.wristSize || null,
        bead_preference: body.beadPreference || null,
        accent_preference: body.accentPreference || null,
        budget_range: body.budgetRange || null,
        desired_date: body.desiredDate || null,
        inspiration_url: body.inspirationUrl || null,
        notes: body.notes.trim(),
      })
      .select()
      .single();
    if (error || !bespoke) throw error || new Error("Request not created");
    await supabase.from("crm_sync_outbox").insert({
      entity_type: "custom_request",
      entity_id: bespoke.id,
      operation: "create",
      idempotency_key: "custom-" + bespoke.id,
      payload: bespoke,
    });
    if (body.quizSessionToken) {
      const { data: session } = await supabase
        .from("quiz_sessions")
        .update({ customer_id: customer.id })
        .eq("session_token", String(body.quizSessionToken))
        .select("id")
        .maybeSingle();
      if (session)
        await supabase.from("discovery_events").insert({
          quiz_session_id: session.id,
          event_type: "bespoke_started",
          product_id: body.startingProductId || null,
        });
    }
    return NextResponse.json({ requestNumber });
  } catch (error) {
    console.error("Bespoke request failed", error);
    return NextResponse.json(
      { error: "We could not send your request. Please try again." },
      { status: 500 },
    );
  }
}
