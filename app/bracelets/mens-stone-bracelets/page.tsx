import StoreImage from "@/components/commerce/StoreImage";
import FaqSection from "@/components/commerce/FaqSection";
import type { Metadata } from "next";
import Link from "next/link";
import SeoProductGrid from "@/components/commerce/SeoProductGrid";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import {
  MENS_PAGE_DESCRIPTION,
  MENS_PAGE_PATH,
  MENS_PAGE_TITLE,
  mensFaqs,
  mensStones,
  productsForMen,
} from "@/lib/commerce/mens-stone-bracelets";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";
import { getAllPosts } from "@/lib/journal/posts";

export const dynamic = "force-dynamic";

const heroImage =
  "/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.webp";
const title = `${MENS_PAGE_TITLE}: Tiger Eye, Lava Stone & Onyx | ${SITE_NAME}`;
const canonicalUrl = absoluteUrl(MENS_PAGE_PATH);
const ogImages = buildOgImages(heroImage, MENS_PAGE_TITLE);

export const metadata: Metadata = {
  title,
  description: MENS_PAGE_DESCRIPTION,
  alternates: { canonical: MENS_PAGE_PATH },
  openGraph: {
    title,
    description: MENS_PAGE_DESCRIPTION,
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: "en_US",
    type: "website",
    images: ogImages,
  },
  twitter: {
    card: "summary_large_image",
    title,
    description: MENS_PAGE_DESCRIPTION,
    images: [ogImages[0].url],
  },
};

export default async function MensStoneBraceletsPage() {
  const catalogue = await getStorefrontCatalogue();
  const products = productsForMen(catalogue);
  const stones = mensStones.filter((stone) =>
    catalogue.some((product) => product.slug === stone.productSlug),
  );
  const posts = getAllPosts().slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: MENS_PAGE_TITLE,
    description: MENS_PAGE_DESCRIPTION,
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
    <main className="seo-hub-page bracelet-hub-page mens-stone-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="bracelet-hub-hero">
        <StoreImage
          src={heroImage}
          alt="Man wearing a Beads World Africa natural stone bracelet outdoors"
          sizes="100vw"
          width={1920}
          height={1080}
          eager
        />
        <div className="bracelet-hub-hero-shade" aria-hidden="true" />
        <div className="bracelet-hub-hero-copy">
          <p>Handmade in Kenya · For him</p>
          <h1>{MENS_PAGE_TITLE}</h1>
          <div>
            <span>
              Tiger eye, lava stone, onyx and hematite bracelets, handmade in
              Kenya. Wear one with your watch or stack two or three. Ordered
              online, delivered in Nairobi and across Kenya.
            </span>
            <Link href="#collection">
              Shop men&rsquo;s bracelets <b aria-hidden="true">↓</b>
            </Link>
          </div>
        </div>
      </section>

      {stones.length > 0 && (
        <section className="container seo-hub-section mens-stone-guide">
          <div className="seo-hub-heading">
            <div>
              <p className="eyebrow">Choose by stone</p>
              <h2>The stones men reach for.</h2>
            </div>
            <p>
              Each stone has its own colour and texture. Pick the one that suits
              how you dress, or the meaning you want to carry.
            </p>
          </div>
          <div className="seo-hub-links">
            {stones.map((stone) => (
              <Link key={stone.name} href={`/product/${stone.productSlug}`}>
                <span>{stone.tradition}</span>
                <strong>{stone.name} bracelet</strong>
                <p>{stone.look}</p>
                <i>View the bracelet →</i>
              </Link>
            ))}
          </div>
        </section>
      )}

      <section
        id="collection"
        className="container catalogue-grid-section seo-hub-products bracelet-hub-products"
      >
        <div className="seo-hub-heading">
          <div>
            <p className="eyebrow">The men&rsquo;s edit</p>
            <h2>Bracelets for him.</h2>
          </div>
          <p>
            Sizes Small (16 cm), Medium (18 cm) and Large (20 cm). Not sure of
            his size? Message us on WhatsApp and we will help.
          </p>
        </div>
        <div className="catalogue-grid-meta">
          <span>{String(products.length).padStart(2, "0")} pieces</span>
          <Link href="/bracelets">View all bracelets →</Link>
        </div>
        <SeoProductGrid products={products} />
      </section>

      <section className="container seo-hub-section mens-stone-how">
        <div className="seo-hub-heading">
          <div>
            <p className="eyebrow">Ordering in Kenya</p>
            <h2>From our hands to your wrist.</h2>
          </div>
          <p>
            Order online and WhatsApp opens with your order written out. We
            confirm payment by M-Pesa or bank transfer there. In Nairobi,
            doorstep delivery costs the same as an Uber or Bolt ride to you;
            elsewhere in Kenya we confirm the cost on WhatsApp. Want something
            no one else has?{" "}
            <Link href="/bespoke">Ask for a bespoke piece</Link>.
          </p>
        </div>
      </section>

      {posts.length > 0 && (
        <section className="container seo-hub-related">
          <p className="eyebrow">From the Journal</p>
          <div>
            {posts.map((post) => (
              <Link key={post.slug} href={`/journal/${post.slug}`}>
                {post.title}
              </Link>
            ))}
          </div>
        </section>
      )}
      <FaqSection items={mensFaqs} title="Men's bracelets, answered." />
    </main>
  );
}
