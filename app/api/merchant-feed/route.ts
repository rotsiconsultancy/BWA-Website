import "server-only";
import { NextResponse } from "next/server";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";

const BASE_URL = "https://beadsworldafrica.co.ke";
const BRAND = "Beads World Africa";
// Google's taxonomy ID for Bracelets
// https://www.google.com/basepages/producttype/taxonomy-with-ids.en-US.txt
const GOOGLE_CATEGORY = "188"; // Apparel & Accessories > Jewelry > Bracelets

/** Escape XML special characters */
function x(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** Resolve a potentially relative image path to an absolute URL */
function absoluteImage(url: string): string {
  if (url.startsWith("http")) return url;
  return `${BASE_URL}${url.startsWith("/") ? "" : "/"}${url}`;
}

export async function GET() {
  const products = await getStorefrontCatalogue();

  // Only active products with at least one image
  const active = products.filter((p) => p.active && p.images.length > 0);

  const items = active
    .flatMap((product) => {
      // If the product has sellable variants, emit one entry per variant.
      // If no variants (or all unavailable), emit one base entry.
      const sellableVariants = (product.variants ?? []).filter(
        (v) => v.available,
      );

      if (sellableVariants.length > 0) {
        return sellableVariants.map((variant) => {
          const kesPrice =
            product.prices.KES + (variant.priceAdjustments?.KES ?? 0);
          const usdPrice =
            product.prices.USD !== null &&
            variant.priceAdjustments?.USD !== null
              ? (product.prices.USD ?? 0) +
                (variant.priceAdjustments?.USD ?? 0)
              : null;

          return buildItem({
            id: `${product.id}-${variant.id}`,
            itemGroupId: product.id,
            title: `${product.title} — ${variant.name}`,
            description: product.descriptor,
            slug: product.slug,
            image: product.images[0],
            additionalImages: product.images.slice(1, 5),
            kesPrice,
            usdPrice,
            availability: "in_stock",
            stoneTypes: product.stone_type,
          });
        });
      }

      // No variants — single base entry
      return [
        buildItem({
          id: product.id,
          itemGroupId: null,
          title: product.title,
          description: product.descriptor,
          slug: product.slug,
          image: product.images[0],
          additionalImages: product.images.slice(1, 5),
          kesPrice: product.prices.KES,
          usdPrice: product.prices.USD,
          availability:
            product.variants && product.variants.length > 0
              ? "out_of_stock"
              : "in_stock",
          stoneTypes: product.stone_type,
        }),
      ];
    })
    .join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${x(BRAND)} Product Feed</title>
    <link>${BASE_URL}</link>
    <description>Natural stone bracelets handcrafted in Africa</description>
${items}
  </channel>
</rss>`;

  return new NextResponse(xml, {
    status: 200,
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      // Cache for 4 hours on the CDN — Merchant Center fetches daily anyway
      "Cache-Control": "public, s-maxage=14400, stale-while-revalidate=3600",
    },
  });
}

// ─── Item builder ────────────────────────────────────────────────────────────

interface ItemArgs {
  id: string;
  itemGroupId: string | null;
  title: string;
  description: string;
  slug: string;
  image: string;
  additionalImages: string[];
  kesPrice: number;
  usdPrice: number | null;
  availability: "in_stock" | "out_of_stock" | "preorder";
  stoneTypes: string[];
}

function buildItem(args: ItemArgs): string {
  const {
    id,
    itemGroupId,
    title,
    description,
    slug,
    image,
    additionalImages,
    kesPrice,
    usdPrice,
    availability,
    stoneTypes,
  } = args;

  // Material label — derive from stone_type taxonomy
  const material = stoneTypes.length
    ? stoneTypes
        .map((s) =>
          s
            .replace(/_/g, " ")
            .replace(/\b\w/g, (c) => c.toUpperCase()),
        )
        .join(", ")
    : "Natural Stone";

  const additionalImageTags = additionalImages
    .map((img) => `    <g:additional_image_link>${x(absoluteImage(img))}</g:additional_image_link>`)
    .join("\n");

  // Google requires price in "AMOUNT CURRENCY" format, e.g. "3500 KES"
  const priceTag = `    <g:price>${kesPrice.toFixed(2)} KES</g:price>`;
  // Optional: also submit USD if we have it (helps with international shopping)
  const usdTag =
    usdPrice !== null
      ? `    <g:sale_price>${usdPrice.toFixed(2)} USD</g:sale_price>`
      : "";

  return `  <item>
    <g:id>${x(id)}</g:id>${itemGroupId ? `\n    <g:item_group_id>${x(itemGroupId)}</g:item_group_id>` : ""}
    <g:title>${x(title)}</g:title>
    <g:description>${x(description)}</g:description>
    <g:link>${BASE_URL}/product/${x(slug)}</g:link>
    <g:image_link>${x(absoluteImage(image))}</g:image_link>
${additionalImageTags ? additionalImageTags + "\n" : ""}${priceTag}
${usdTag ? usdTag + "\n" : ""}    <g:availability>${availability}</g:availability>
    <g:condition>new</g:condition>
    <g:brand>${x(BRAND)}</g:brand>
    <g:google_product_category>${GOOGLE_CATEGORY}</g:google_product_category>
    <g:product_type>Jewellery &gt; Bracelets &gt; Natural Stone</g:product_type>
    <g:material>${x(material)}</g:material>
    <g:identifier_exists>no</g:identifier_exists>
    <g:shipping>
      <g:country>KE</g:country>
      <g:service>Standard</g:service>
      <g:price>250 KES</g:price>
    </g:shipping>
  </item>`;
}
