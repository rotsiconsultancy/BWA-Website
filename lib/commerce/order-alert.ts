import type { CheckoutItemSnapshot } from "./checkout-pricing";
import { SITE_URL } from "./seo";

// Emails the owner when a website order comes in, through Brevo's
// transactional API (same key as the newsletter). The sender must be on the
// domain verified in Brevo. A failed alert is logged and never fails an order.
export type OrderAlert = {
  orderNumber: string;
  currency: string;
  total: number;
  discountCode: string | null;
  items: CheckoutItemSnapshot[];
  customer: { name: string; phone: string; email: string | null };
  delivery: {
    method: "standard" | "pickup";
    address: string;
    city: string;
    county: string;
    note: string;
  };
};

const escape = (value: string) =>
  value.replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ]!,
  );

export async function sendOrderAlert(alert: OrderAlert) {
  const apiKey = process.env.BREVO_API_KEY;
  const to = process.env.ADMIN_ALERT_EMAIL;
  if (!apiKey || !to) return;
  const money = (amount: number) =>
    `${alert.currency} ${amount.toLocaleString("en-KE")}`;
  const where =
    alert.delivery.method === "pickup"
      ? "Pickup"
      : [alert.delivery.address, alert.delivery.city, alert.delivery.county]
          .filter(Boolean)
          .join(", ") || "Delivery (no address given)";
  const whatsapp = `https://wa.me/${alert.customer.phone}?text=${encodeURIComponent(
    `Hello ${alert.customer.name.split(" ")[0]}, this is Beads World Africa about your order ${alert.orderNumber}.`,
  )}`;
  const rows = alert.items
    .map(
      (item) =>
        `<tr><td>${item.quantity} × ${escape(item.product_title_snapshot)} (${escape(item.variant_title_snapshot)})</td><td align="right">${money(item.line_total)}</td></tr>`,
    )
    .join("");
  const html = `<div style="font-family:Arial,sans-serif;font-size:15px;color:#24321F">
<h2 style="margin:0 0 4px">New order ${escape(alert.orderNumber)}</h2>
<p style="margin:0 0 16px">${money(alert.total)}${alert.discountCode ? ` · code ${escape(alert.discountCode)}` : ""}</p>
<table cellpadding="4" style="border-collapse:collapse;margin-bottom:16px">${rows}</table>
<p style="margin:0 0 4px"><strong>${escape(alert.customer.name)}</strong></p>
<p style="margin:0 0 4px">+${escape(alert.customer.phone)}${alert.customer.email ? ` · ${escape(alert.customer.email)}` : ""}</p>
<p style="margin:0 0 4px">${escape(where)}</p>
${alert.delivery.note ? `<p style="margin:0 0 4px">Note: ${escape(alert.delivery.note)}</p>` : ""}
<p style="margin:20px 0">
<a href="${whatsapp}" style="background:#24321F;color:#F4F0E6;padding:10px 16px;border-radius:6px;text-decoration:none">WhatsApp the customer</a>
&nbsp;
<a href="${SITE_URL}/admin/orders/${encodeURIComponent(alert.orderNumber)}">Open in admin</a>
</p>
<p style="color:#6b6b6b;font-size:13px">If they didn't press Send on WhatsApp, their order message never reached you. Message them first.</p>
</div>`;
  try {
    const response = await fetch("https://api.brevo.com/v3/smtp/email", {
      method: "POST",
      headers: { "api-key": apiKey, "content-type": "application/json" },
      body: JSON.stringify({
        sender: {
          name: "BWA Orders",
          email:
            process.env.ADMIN_ALERT_FROM || "orders@beadsworldafrica.co.ke",
        },
        to: [{ email: to }],
        ...(alert.customer.email && {
          replyTo: { email: alert.customer.email, name: alert.customer.name },
        }),
        subject: `New order ${alert.orderNumber}: ${money(alert.total)} from ${alert.customer.name}`,
        htmlContent: html,
      }),
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok)
      console.error(
        "BWA order alert email failed",
        response.status,
        await response.text(),
      );
  } catch (error) {
    console.error("BWA order alert email failed", error);
  }
}
