import type { CommerceProduct } from "@/lib/commerce/types";

export const SITE_URL = "https://beadsworldafrica.co.ke";
export const SITE_NAME = "Beads World Africa";

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function buildOgImages(imageUrl?: string, altText?: string) {
  const url = absoluteUrl(
    imageUrl ||
      "/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.webp",
  );
  return [
    {
      url,
      width: 1200,
      height: 630,
      alt: altText || "Beads World Africa natural stone bracelet",
    },
  ];
}

// Lowest listed KES price, e.g. "KES 1,500", for search titles and snippets.
// A price in the result is what earns the click (Search Console, Oct 2026).
export function fromPriceKes(products: CommerceProduct[]): string | null {
  const prices = products.map((p) => p.prices.KES).filter((n) => n > 0);
  if (prices.length === 0) return null;
  return `KES ${Math.min(...prices).toLocaleString("en-KE")}`;
}

export const DELIVERY_SNIPPET = "Delivered in Nairobi and across Kenya.";

// Breadcrumb trail for search results: Home › … › page.
export function breadcrumbJsonLd(trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [{ name: "Home", path: "/" }, ...trail].map(
      (crumb, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: crumb.name,
        item: absoluteUrl(crumb.path),
      }),
    ),
  };
}
