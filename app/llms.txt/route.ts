import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import {
  MENS_PAGE_DESCRIPTION,
  MENS_PAGE_PATH,
  MENS_PAGE_TITLE,
} from "@/lib/commerce/mens-stone-bracelets";
import { productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";
import { SITE_URL } from "@/lib/commerce/seo";
import { stockists } from "@/lib/commerce/stockists";
import { getAllPosts } from "@/lib/journal/posts";

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

## About BWA

- [Our Story](${SITE_URL}/our-story): handmade bracelets in Kenya, materials, personal style and the Kenyan landscapes behind our bracelet names.
- [Corporate gifts](${SITE_URL}/corporate-gifts): the Appreciation Collection, handmade bracelet packs for staff, clients and events (Everyday, Signature, Executive), quoted per order.

## How to buy

- Online: choose a bracelet and size at ${SITE_URL}/bracelets, add it to the bag, and place the order. The order is then confirmed with BWA on WhatsApp, where payment (M-Pesa or bank transfer) and delivery are arranged.
- Delivery: within Nairobi, doorstep delivery costs the same as an Uber or Bolt ride to the customer. Outside Nairobi, the cost is confirmed on WhatsApp after the order, based on the location given. Collection from BWA is free.
- In store: the BWA display is at ${stockists
    .filter((s) => s.onDisplay)
    .map((s) => `${s.partner} (${s.location}, ${s.area})`)
    .join(
      "; ",
    )}, where customers can try bracelets on. They can also get BWA bracelets through ${stockists
    .filter((s) => !s.onDisplay)
    .map((s) => `${s.partner} ${s.branch} (${s.location}, ${s.area})`)
    .join(" and ")}. Directions: ${SITE_URL}/stockists
- Not sure which bracelet? The Find Your Bracelet quiz recommends one: ${SITE_URL}/find-your-bracelet
- Design your own bracelet (stones, pattern, spacers, letters or a charm, bead size), sent to us on WhatsApp: ${SITE_URL}/design-your-own
- No refunds; exchanges for another piece within 7 days of delivery, delivery paid by the customer: ${SITE_URL}/returns

## Collections

- [All bracelets](${SITE_URL}/bracelets)
- [${MENS_PAGE_TITLE}](${SITE_URL}${MENS_PAGE_PATH}): ${MENS_PAGE_DESCRIPTION}
${hubs.map((hub) => `- [${hub.title}](${SITE_URL}/bracelets/${hub.slug}): ${hub.description}`).join("\n")}

## Bracelets

${products
  .map(
    (product) =>
      `- [${product.title}](${SITE_URL}/product/${product.slug}): ${product.subtitle}. From ${price(product.prices.KES)}.`,
  )
  .join("\n")}

## Journal

${getAllPosts()
  .map(
    (post) =>
      `- [${post.title}](${SITE_URL}/journal/${post.slug}): ${post.description}`,
  )
  .join("\n")}

## Policies

- [Exchange policy](${SITE_URL}/returns)
- [Terms](${SITE_URL}/terms)

## Contact

- WhatsApp: +254745474586
- Instagram: https://instagram.com/beadsworldafrica
- TikTok: https://tiktok.com/@beadsworldafrica
- Facebook: https://facebook.com/beadsworldafrica
- LinkedIn: https://www.linkedin.com/company/beadsworldafrica
`;

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
