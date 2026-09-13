import { NextResponse } from "next/server";
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
    const customer = body.customer ?? {};
    const lines = Array.isArray(body.lines) ? body.lines : [];
    if (
      !customer.firstName?.trim() ||
      !customer.phone?.trim() ||
      !lines.length
    ) {
      return NextResponse.json(
        {
          error: "Name, phone number, and at least one bracelet are required.",
        },
        { status: 400 },
      );
    }
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
      .select("order_number,total_amount")
      .eq("idempotency_key", idempotencyKey)
      .maybeSingle();
    if (existing)
      return NextResponse.json({
        orderNumber: existing.order_number,
        total: existing.total_amount,
        duplicate: true,
      });

    const variantIds = lines.map(
      (line: { variantId: string }) => line.variantId,
    );
    const { data: variants, error: variantError } = await supabase
      .from("product_variants")
      .select(
        "id, title, sku, stock_quantity, reserved_quantity, price_adjustment, product_id, products!inner(id,title,subtitle,price,active)",
      )
      .in("id", variantIds)
      .eq("active", true);
    if (variantError || !variants || variants.length !== variantIds.length)
      return NextResponse.json(
        { error: "One or more selected sizes are no longer available." },
        { status: 409 },
      );

    const byId = new Map(variants.map((variant: any) => [variant.id, variant]));
    let subtotal = 0;
    for (const line of lines) {
      const variant: any = byId.get(line.variantId);
      const product = variant?.products;
      if (
        !variant ||
        !product?.active ||
        line.quantity < 1 ||
        variant.stock_quantity - variant.reserved_quantity < line.quantity
      ) {
        return NextResponse.json(
          {
            error:
              "A selected bracelet is no longer available in that quantity.",
          },
          { status: 409 },
        );
      }
      subtotal +=
        (Number(product.price) + Number(variant.price_adjustment)) *
        line.quantity;
    }
    const deliveryFee = body.deliveryMethod === "pickup" ? 0 : 250;
    const total = subtotal + deliveryFee;
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
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert({
        order_number: reference,
        idempotency_key: idempotencyKey,
        customer_id: savedCustomer.id,
        delivery_method:
          body.deliveryMethod === "pickup" ? "pickup" : "standard",
        delivery_address: customer.address?.trim() || null,
        city: customer.city?.trim() || null,
        county: customer.county?.trim() || null,
        delivery_note: customer.note?.trim() || null,
        subtotal,
        delivery_fee: deliveryFee,
        total_amount: total,
      })
      .select()
      .single();
    if (orderError || !order)
      throw orderError || new Error("Could not create order.");

    const items = lines.map(
      (line: { variantId: string; quantity: number; image?: string }) => {
        const variant: any = byId.get(line.variantId);
        const product = variant.products;
        const unitPrice =
          Number(product.price) + Number(variant.price_adjustment);
        return {
          order_id: order.id,
          product_id: product.id,
          variant_id: variant.id,
          product_title_snapshot: product.title,
          variant_title_snapshot: variant.title,
          image_snapshot: line.image || null,
          sku_snapshot: variant.sku,
          unit_price: unitPrice,
          quantity: line.quantity,
          line_total: unitPrice * line.quantity,
        };
      },
    );
    const { error: itemError } = await supabase
      .from("order_items")
      .insert(items);
    if (itemError) throw itemError;
    await supabase.from("order_status_history").insert({
      order_id: order.id,
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
        entity_id: order.id,
        operation: "create",
        idempotency_key: "order-" + order.id,
        payload: { order, items },
      },
    ]);
    return NextResponse.json({ orderNumber: reference, total, phone });
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
