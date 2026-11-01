import StoreImage from "@/components/commerce/StoreImage";
import FaqSection from "@/components/commerce/FaqSection";
import { shoppingFaqs } from "@/lib/commerce/faq";
import type { Metadata } from "next";
import Link from "next/link";
import SeoProductGrid from "@/components/commerce/SeoProductGrid";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import {
  MENS_PAGE_PATH,
  MENS_PAGE_TITLE,
} from "@/lib/commerce/mens-stone-bracelets";
import { productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildOgImages,
  DELIVERY_SNIPPET,
  SITE_NAME,
} from "@/lib/commerce/seo";

export const dynamic = "force-dynamic";

// "stone bracelets" is the site's biggest search (Search Console, Oct 2026),
// so the title leads with it.
const title = "Stone Bracelets in Kenya, Handmade | Beads World Africa";
const description =
  "Shop handmade natural stone bracelets in Kenya: tiger eye, lava stone, malachite, lapis lazuli and more, for men and women.";
const canonicalUrl = absoluteUrl("/bracelets");
const ogImages = buildOgImages(
  "/images/hero-image-mountain-woman-wearing-beads-world-africa-bracelet.webp",
  "Beads World Africa natural stone bracelets collection",
);

// No "from KES" here: the cheapest pieces in the full list are patterned
// beads, not stone, so the lowest price would mislead a stone search.
const snippet = `${description} ${DELIVERY_SNIPPET}`;

export const metadata: Metadata = {
  title,
  description: snippet,
  alternates: { canonical: "/bracelets" },
  openGraph: {
    title,
    description: snippet,
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: snippet,
    images: [ogImages[0].url],
  },
};

export default async function BraceletsPage() {
  const products = await getStorefrontCatalogue();
  const liveHubs = seoHubs.filter(
    (hub) => productsForSeoHub(products, hub).length > 0,
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: title,
    description,
    url: canonicalUrl,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: absoluteUrl(`/product/${product.slug}`),
        name: product.title,
      })),
    },
  };

  return (
    <main className="seo-hub-page bracelet-collection-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            jsonLd,
            breadcrumbJsonLd([{ name: "Bracelets", path: "/bracelets" }]),
          ]),
        }}
      />
      <section className="bracelet-collection-hero">
        <StoreImage
          src="/images/hero-image-mountain-woman-wearing-beads-world-africa-bracelet.webp"
          alt="Woman wearing a Beads World Africa natural stone bracelet outdoors"
          sizes="100vw"
          width={1920}
          height={1080}
          eager
        />
        <div className="bracelet-collection-hero-shade" aria-hidden="true" />
        <div className="bracelet-collection-hero-copy">
          <p>Beads World Africa · The bracelet collection</p>
          <h1>Stone bracelets that move with you.</h1>
          <div>
            <span>
              Natural stone bracelets for every day, every intention, and every
              stack.
            </span>
            <Link href="#collection">
              Shop the collection <b aria-hidden="true">↓</b>
            </Link>
          </div>
        </div>
      </section>

      <section className="container bracelet-collection-intro">
        <div className="bracelet-collection-intro-head">
          <div>
            <p className="eyebrow">Choose your starting point</p>
            <h2>Find the piece that feels like yours.</h2>
          </div>
          <p>
            Choose by the stone you’re drawn to, the feeling you want to carry,
            or the way you wear your bracelets.
          </p>
        </div>
        <div className="seo-hub-links">
          <Link href={MENS_PAGE_PATH}>
            <span>Discover by wearer / For him</span>
            <strong>{MENS_PAGE_TITLE.replace(" in Kenya", "")}</strong>
            <i>Explore →</i>
          </Link>
          {liveHubs.map((hub) => (
            <Link key={hub.slug} href={`/bracelets/${hub.slug}`}>
              <span>{hub.eyebrow.replace("Discover by ", "")}</span>
              <strong>{hub.title.replace(" in Kenya", "")}</strong>
              <i>Explore →</i>
            </Link>
          ))}
        </div>
      </section>

      <section
        id="collection"
        className="container catalogue-grid-section seo-hub-products bracelet-collection-products"
      >
        <div className="bracelet-collection-products-head">
          <div>
            <h2>The collection</h2>
          </div>
          <div className="catalogue-grid-meta">
            <span>{String(products.length).padStart(2, "0")} pieces</span>
            <Link href="/find-your-bracelet">
              Need a little guidance? <b>Find yours</b>
            </Link>
          </div>
        </div>
        <SeoProductGrid products={products} />
      </section>
      <FaqSection items={shoppingFaqs} />
    </main>
  );
}
