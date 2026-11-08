import { NextResponse } from "next/server";
import {
  calculateCheckout,
  loadDiscountQuote,
} from "@/lib/commerce/checkout-pricing";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase)
    return NextResponse.json(
      { error: "Checkout is being configured." },
      { status: 503 },
    );
  try {
    const body = await request.json();
    const currency = body.currency === "USD" ? "USD" : "KES";
    const checkout = await calculateCheckout(supabase, currency, body.lines);
    if (!checkout.ok)
      return NextResponse.json({ error: checkout.error }, { status: 409 });
    const quote = await loadDiscountQuote(
      supabase,
      body.code,
      checkout.subtotal,
      currency,
      body.phone,
    );
    return NextResponse.json({ subtotal: checkout.subtotal, ...quote });
  } catch {
    return NextResponse.json(
      { error: "We could not check that discount code. Please try again." },
      { status: 400 },
    );
  }
}
