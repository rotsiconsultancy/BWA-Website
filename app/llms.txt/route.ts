import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";
import { SITE_URL } from "@/lib/commerce/seo";
import { stockists } from "@/lib/commerce/stockists";

// Regenerated hourly so the product list follows the live catalogue.
export const revalidate = 3600;

/** Plain-language site summary for AI assistants (https://llmstxt.org). */
export async function GET() {
  const products = await getStorefrontCatalogue();
  const hubs = seoHubs.filter(
    (hub) => productsForSeoHub(products, hub).length > 0,
  );
  const price = (amount: number) => `KES ${amount.toLocaleString("en-KE")}`;

  const body = `# Beads World Africa

> Beads World Africa (BWA) makes handmade bracelets in Kenya from natural stones and other materials, designed around personal style, intention and the stories people choose to wear. Most customers are men in Kenya buying for themselves and women buying gifts for men.

## How to buy

- Online: choose a bracelet and size at ${SITE_URL}/bracelets, add it to the bag, and place the order. The order is then confirmed with BWA on WhatsApp, where payment (M-Pesa or bank transfer) and delivery are arranged.
- Delivery in Kenya: doorstep delivery costs KES 250, or collect free from BWA.
- In store: BWA bracelets are sold at ${stockists.map((s) => `${s.partner} (${s.location}, ${s.area})`).join("; ")}. Directions: ${SITE_URL}/stockists
- Not sure which bracelet? The Find Your Bracelet quiz recommends one: ${SITE_URL}/find-your-bracelet
- Custom pieces: ${SITE_URL}/bespoke
- Returns and exchanges within 7 days of delivery: ${SITE_URL}/returns

## Collections

- [All bracelets](${SITE_URL}/bracelets)
${hubs.map((hub) => `- [${hub.title}](${SITE_URL}/bracelets/${hub.slug}): ${hub.description}`).join("\n")}

## Bracelets

${products
  .map(
    (product) =>
      `- [${product.title}](${SITE_URL}/product/${product.slug}): ${product.subtitle}. From ${price(product.prices.KES)}.`,
  )
  .join("\n")}

## Policies

- [Returns and exchanges](${SITE_URL}/returns)
- [Terms](${SITE_URL}/terms)

## Contact

- WhatsApp: +254745474586
- Instagram: https://instagram.com/beadsworldafrica
- TikTok: https://tiktok.com/@beadsworldafrica
- Facebook: https://facebook.com/beadsworldafrica
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
