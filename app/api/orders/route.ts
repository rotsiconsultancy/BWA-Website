import { NextResponse } from "next/server";
import {
  calculateCheckout,
  normaliseDiscountCode,
} from "@/lib/commerce/checkout-pricing";
import { getSupabaseAdmin } from "@/lib/supabase/server";

const normalisePhone = (value: string) => {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("0")) return "254" + digits.slice(1);
  if (digits.startsWith("7") || digits.startsWith("1")) return "254" + digits;
  return digits;
};

const orderNumber = () =>
  "BWA-" +
  new Date().getFullYear() +
  "-" +
  crypto.randomUUID().slice(0, 8).toUpperCase();

export async function POST(request: Request) {
  const supabase = getSupabaseAdmin();
  if (!supabase)
    return NextResponse.json(
      {
        error:
          "Checkout is being configured. Please order through WhatsApp for now.",
      },
      { status: 503 },
    );
  try {
    const body = await request.json();
    const currency = body.currency === "USD" ? "USD" : "KES";
    const customer = body.customer ?? {};
    if (!customer.firstName?.trim() || !customer.phone?.trim())
      return NextResponse.json(
        {
          error: "Name, phone number, and at least one bracelet are required.",
        },
        { status: 400 },
      );
    const phone = normalisePhone(customer.phone);
    if (!/^254[17]\d{8}$/.test(phone))
      return NextResponse.json(
        { error: "Enter a valid Kenyan phone number." },
        { status: 400 },
      );

    const idempotencyKey =
      request.headers.get("Idempotency-Key") || crypto.randomUUID();
    const { data: existing } = await supabase
      .from("orders")
      .select(
        "order_number,subtotal,discount_amount,delivery_fee,total_amount,currency,discount_code_snapshot",
      )
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existing)
      return NextResponse.json({
        orderNumber: existing.order_number,
        subtotal: existing.subtotal,
        discountAmount: existing.discount_amount,
        deliveryFee: existing.delivery_fee,
        total: existing.total_amount,
        currency: existing.currency,
        discountCode: existing.discount_code_snapshot,
        duplicate: true,
      });

    const checkout = await calculateCheckout(supabase, currency, body.lines);
    if (!checkout.ok)
      return NextResponse.json({ error: checkout.error }, { status: 409 });
    const deliveryFee =
      body.deliveryMethod === "pickup"
        ? 0
        : currency === "USD"
          ? Number(process.env.STANDARD_DELIVERY_USD || "3")
          : 250;
    const { data: savedCustomer, error: customerError } = await supabase
      .from("customers")
      .upsert(
        {
          first_name: customer.firstName.trim(),
          last_name: customer.lastName?.trim() || null,
          email: customer.email?.trim().toLowerCase() || null,
          phone,
          whatsapp_opt_in: true,
          marketing_opt_in: Boolean(customer.marketingOptIn),
          source: "website",
        },
        { onConflict: "phone" },
      )
      .select()
      .single();
    if (customerError || !savedCustomer)
      throw customerError || new Error("Could not save customer.");

    const reference = orderNumber();
    const { data: savedOrder, error: orderError } = await (supabase as any).rpc(
      "create_checkout_order",
      {
        p_order: {
          order_number: reference,
          idempotency_key: idempotencyKey,
          customer_id: savedCustomer.id,
          delivery_method:
            body.deliveryMethod === "pickup" ? "pickup" : "standard",
          delivery_address: customer.address?.trim() || "",
          city: customer.city?.trim() || "",
          county: customer.county?.trim() || "",
          delivery_note: customer.note?.trim() || "",
          subtotal: checkout.subtotal,
          delivery_fee: deliveryFee,
          currency,
        },
        p_items: checkout.items,
        p_discount_code: normaliseDiscountCode(body.discountCode) || null,
      },
    );
    if (orderError) {
      if (String(orderError.message).includes("DISCOUNT_UNAVAILABLE"))
        return NextResponse.json(
          {
            error:
              "That discount code is no longer available. Remove it and try again.",
          },
          { status: 409 },
        );
      throw orderError;
    }
    const order = Array.isArray(savedOrder) ? savedOrder[0] : savedOrder;
    if (!order) throw new Error("Could not create order.");

    await supabase.from("order_status_history").insert({
      order_id: order.order_id,
      status: "order_received",
      note: "Order created from BWA website.",
    });
    await supabase.from("crm_sync_outbox").insert([
      {
        entity_type: "customer",
        entity_id: savedCustomer.id,
        operation: "create",
        idempotency_key: "customer-" + savedCustomer.id,
        payload: savedCustomer,
      },
      {
        entity_type: "order",
        entity_id: order.order_id,
        operation: "create",
        idempotency_key: "order-" + order.order_id,
        payload: { order, items: checkout.items },
      },
    ]);
    if (body.discoverySessionToken) {
      const { data: session } = await supabase
        .from("quiz_sessions")
        .update({ customer_id: savedCustomer.id })
        .eq("session_token", String(body.discoverySessionToken))
        .select("id")
        .maybeSingle();
      if (session)
        await supabase.from("discovery_events").insert({
          quiz_session_id: session.id,
          event_type: "order_created",
          order_id: order.order_id,
        });
    }
    return NextResponse.json({
      orderNumber: order.order_number,
      subtotal: Number(order.subtotal),
      discountAmount: Number(order.discount_amount),
      deliveryFee: Number(order.delivery_fee),
      total: Number(order.total_amount),
      currency: order.currency,
      discountCode: order.discount_code,
      phone,
    });
  } catch (error) {
    console.error("BWA order creation failed", error);
    return NextResponse.json(
      {
        error:
          "We could not create your order. Please try again or contact our WhatsApp concierge.",
      },
      { status: 500 },
    );
  }
}
