import type { Metadata } from "next";
import Link from "next/link";
import SeoProductGrid from "@/components/commerce/SeoProductGrid";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";

export const dynamic = "force-dynamic";

const title =
  "Natural Stone Bracelets Collection in Kenya | Beads World Africa";
const description =
  "Discover handcrafted natural stone bracelets by Beads World Africa. Shop meaningful everyday pieces, explore natural stone guides, or find your bracelet.";
const canonicalUrl = absoluteUrl("/bracelets");
const ogImages = buildOgImages(
  "/images/hero-image-mountain-woman-wearing-beads-world-africa-bracelet.png",
  "Beads World Africa natural stone bracelets collection",
);

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/bracelets" },
  openGraph: {
    title,
    description,
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
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
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bracelet-collection-hero">
        <img
          src="/images/hero-image-mountain-woman-wearing-beads-world-africa-bracelet.png"
          alt="Woman wearing a Beads World Africa natural stone bracelet outdoors"
          fetchPriority="high"
        />
        <div className="bracelet-collection-hero-shade" aria-hidden="true" />
        <div className="bracelet-collection-hero-copy">
          <p>Beads World Africa · The bracelet collection</p>
          <h1>Wear what moves with you.</h1>
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
    </main>
  );
}
