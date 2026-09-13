import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin)
    return NextResponse.json(
      { error: "Discovery is unavailable." },
      { status: 503 },
    );
  try {
    const body = await request.json();
    const sessionToken = String(body.sessionToken || "");
    const rankedProducts = Array.isArray(body.rankedProducts)
      ? body.rankedProducts.slice(0, 3)
      : [];
    if (!sessionToken || !rankedProducts.length)
      return NextResponse.json(
        { error: "Invalid discovery result." },
        { status: 400 },
      );
    const { data: session, error: sessionError } = await admin
      .from("quiz_sessions")
      .upsert(
        {
          quiz_version_id: body.quizVersionId || null,
          session_token: sessionToken,
          answers: body.answers || {},
          completed_at: new Date().toISOString(),
        },
        { onConflict: "session_token" },
      )
      .select("id")
      .single();
    if (sessionError || !session)
      throw sessionError || new Error("Session not created");
    await admin.from("quiz_results").delete().eq("quiz_session_id", session.id);
    await admin.from("quiz_results").insert({
      quiz_session_id: session.id,
      ranked_products: rankedProducts,
      selected_product_id: body.selectedProductId || null,
    });
    await admin.from("discovery_events").insert([
      {
        quiz_session_id: session.id,
        event_type: "quiz_completed",
        product_id: body.selectedProductId || null,
      },
      {
        quiz_session_id: session.id,
        event_type: "recommendation_viewed",
        product_id: body.selectedProductId || null,
      },
    ]);
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error("Discovery session failed", error);
    return NextResponse.json(
      { error: "Could not save discovery." },
      { status: 500 },
    );
  }
}
