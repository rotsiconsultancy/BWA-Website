import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase)
    return NextResponse.json(
      { error: "Order tracking is being configured." },
      { status: 503 },
    );
  const { orderNumber, phone } = await request.json();
  const normalised = String(phone || "")
    .replace(/\D/g, "")
    .replace(/^0/, "254");
  if (!orderNumber || !normalised)
    return NextResponse.json(
      { error: "Enter your order number and phone number." },
      { status: 400 },
    );
  const { data: order } = await supabase
    .from("orders")
    .select(
      "order_number,status,payment_status,delivery_method,courier_name,tracking_reference,created_at,customers!inner(phone),order_items(product_title_snapshot,variant_title_snapshot,quantity,image_snapshot),order_status_history(status,note,created_at)",
    )
    .eq("order_number", String(orderNumber).toUpperCase())
    .eq("customers.phone", normalised);
  return NextResponse.json({ order: order?.[0] ?? null });
}
