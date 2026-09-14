import type { Metadata } from "next";
import Link from "next/link";
import SeoProductGrid from "@/components/commerce/SeoProductGrid";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Natural Stone Bracelets in Kenya | Beads World Africa",
  description:
    "Discover handcrafted natural stone bracelets by Beads World Africa. Shop meaningful everyday pieces, explore stones, or find your bracelet.",
  alternates: { canonical: "/bracelets" },
};

export default async function BraceletsPage() {
  const products = await getStorefrontCatalogue();
  const liveHubs = seoHubs.filter(
    (hub) => productsForSeoHub(products, hub).length > 0,
  );
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Natural Stone Bracelets in Kenya",
    description: metadata.description,
    url: "https://beadsworldafrica.co.ke/bracelets",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: products.map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `https://beadsworldafrica.co.ke/product/${product.slug}`,
        name: product.title,
      })),
    },
  };

  return (
    <main className="seo-hub-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="seo-hub-hero">
        <div className="container">
          <p className="eyebrow">BWA / The bracelet collection</p>
          <h1>Natural stone bracelets, made for your rhythm.</h1>
          <p>
            Discover handcrafted BWA bracelets for daily wear, meaningful gifts,
            and a stack that feels unmistakably yours.
          </p>
          <Link href="/find-your-bracelet" className="btn btn-primary">
            Find your bracelet
          </Link>
        </div>
      </section>

      <section className="container seo-hub-section">
        <div className="seo-hub-heading">
          <div>
            <p className="eyebrow">Explore the collection</p>
            <h2>Choose by stone, feeling, or how you wear it.</h2>
          </div>
          <p>
            Each edit is built from live BWA pieces, so what you see is ready to
            explore now.
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

      <section className="container catalogue-grid-section seo-hub-products">
        <div className="catalogue-grid-meta">
          <span>{String(products.length).padStart(2, "0")} pieces</span>
          <Link href="/find-your-bracelet">Not sure? Find yours →</Link>
        </div>
        <SeoProductGrid products={products} />
      </section>
    </main>
  );
}
