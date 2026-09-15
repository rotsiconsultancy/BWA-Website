import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SeoProductGrid from "@/components/commerce/SeoProductGrid";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { getSeoHub, productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";

type Props = { params: Promise<{ hub: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = getSeoHub((await params).hub);
  if (!hub) return {};

  return {
    title: `${hub.title} | Beads World Africa`,
    description: hub.description,
    alternates: { canonical: `/bracelets/${hub.slug}` },
  };
}

export default async function BraceletHubPage({ params }: Props) {
  const hub = getSeoHub((await params).hub);
  if (!hub) notFound();

  const products = productsForSeoHub(await getStorefrontCatalogue(), hub);
  if (!products.length) notFound();

  const relatedHubs = seoHubs
    .filter((candidate) => candidate.slug !== hub.slug)
    .slice(0, 6);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.title,
    description: hub.description,
    url: `https://beadsworldafrica.co.ke/bracelets/${hub.slug}`,
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
    <main className="seo-hub-page bracelet-hub-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bracelet-hub-hero">
        <img
          src="/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.png"
          alt="Man wearing a Beads World Africa natural stone bracelet outdoors"
          fetchPriority="high"
        />
        <div className="bracelet-hub-hero-shade" aria-hidden="true" />
        <div className="bracelet-hub-hero-copy">
          <p>{hub.eyebrow}</p>
          <h1>{hub.title}</h1>
          <div>
            <span>{hub.intro}</span>
            <Link href="#collection">
              Shop these pieces <b aria-hidden="true">↓</b>
            </Link>
          </div>
        </div>
      </section>

      <section
        id="collection"
        className="container catalogue-grid-section seo-hub-products bracelet-hub-products"
      >
        <div className="catalogue-grid-meta">
          <span>{String(products.length).padStart(2, "0")} pieces</span>
          <Link href="/bracelets">View all bracelets →</Link>
        </div>
        <SeoProductGrid products={products} />
      </section>

      <section className="container seo-hub-related">
        <p className="eyebrow">Keep exploring</p>
        <div>
          {relatedHubs.map((relatedHub) => (
            <Link key={relatedHub.slug} href={`/bracelets/${relatedHub.slug}`}>
              {relatedHub.title.replace(" in Kenya", "")}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
