import StoreImage from "@/components/commerce/StoreImage";
import FaqSection from "@/components/commerce/FaqSection";
import { shoppingFaqs } from "@/lib/commerce/faq";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import SeoProductGrid from "@/components/commerce/SeoProductGrid";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { getSeoHub, productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";

type Props = { params: Promise<{ hub: string }> };

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const hub = getSeoHub((await params).hub);
  if (!hub) return {};

  const title = `${hub.title} | ${SITE_NAME}`;
  const description = hub.description;
  const canonicalUrl = absoluteUrl(`/bracelets/${hub.slug}`);
  const ogImages = buildOgImages(
    "/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.webp",
    hub.title,
  );

  return {
    title,
    description,
    alternates: { canonical: `/bracelets/${hub.slug}` },
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
}

export default async function BraceletHubPage({ params }: Props) {
  const hub = getSeoHub((await params).hub);
  if (!hub) notFound();

  const catalogue = await getStorefrontCatalogue();
  const products = productsForSeoHub(catalogue, hub);
  const relatedHubs = seoHubs
    .filter(
      (candidate) =>
        candidate.slug !== hub.slug &&
        productsForSeoHub(catalogue, candidate).length > 0,
    )
    .slice(0, 6);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.title,
    description: hub.description,
    url: absoluteUrl(`/bracelets/${hub.slug}`),
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
    <main className="seo-hub-page bracelet-hub-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bracelet-hub-hero">
        <StoreImage
          src="/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.webp"
          alt="Man wearing a Beads World Africa natural stone bracelet outdoors"
          sizes="100vw"
          width={1920}
          height={1080}
          eager
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
        {products.length ? (
          <>
            <div className="catalogue-grid-meta">
              <span>{String(products.length).padStart(2, "0")} pieces</span>
              <Link href="/bracelets">View all bracelets →</Link>
            </div>
            <SeoProductGrid products={products} />
          </>
        ) : (
          <div className="bracelet-hub-empty">
            <p className="eyebrow">New edit in progress</p>
            <h2>Oops — this collection is still taking shape.</h2>
            <p>
              We do not have any{" "}
              {hub.title.replace(" in Kenya", "").toLowerCase()}
              available just yet. Browse the pieces currently in the collection,
              or let us help you find a bracelet that suits you.
            </p>
            <div>
              <Link className="btn btn-primary" href="/bracelets">
                Explore all bracelets
              </Link>
              <Link className="btn btn-outline" href="/find-your-bracelet">
                Find your bracelet
              </Link>
            </div>
          </div>
        )}
      </section>

      {relatedHubs.length > 0 && (
        <section className="container seo-hub-related">
          <p className="eyebrow">Other collections to explore</p>
          <div>
            {relatedHubs.map((relatedHub) => (
              <Link
                key={relatedHub.slug}
                href={`/bracelets/${relatedHub.slug}`}
              >
                {relatedHub.title.replace(" in Kenya", "")}
              </Link>
            ))}
          </div>
        </section>
      )}
      <FaqSection items={shoppingFaqs} />
    </main>
  );
}
