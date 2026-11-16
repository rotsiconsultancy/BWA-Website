import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import StoreImage from "@/components/commerce/StoreImage";
import Money from "@/components/commerce/Money";
import SeoProductGrid from "@/components/commerce/SeoProductGrid";
import FaqSection from "@/components/commerce/FaqSection";
import FollowBwa from "@/components/marketing/FollowBwa";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildOgImages,
  fromPriceKes,
  SITE_NAME,
} from "@/lib/commerce/seo";
import {
  findStoneProducts,
  getStoneMeaning,
  STONE_DISCLAIMER,
  STONE_MEANINGS_PATH,
  stoneFeelings,
  stoneMeaningPath,
  stoneStories,
  stoneTitle,
} from "@/lib/commerce/stone-meanings";
import { getPost } from "@/lib/journal/posts";
import type { FaqItem } from "@/lib/commerce/faq";

type Props = { params: Promise<{ stone: string }> };

export const dynamic = "force-dynamic";

async function load(id: string) {
  const stone = getStoneMeaning(id);
  if (!stone) return null;
  const catalogue = await getStorefrontCatalogue();
  const products = findStoneProducts(catalogue, stone.products);
  if (products.length === 0) return null;
  return { stone, products, catalogue };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const data = await load((await params).stone);
  if (!data) return {};
  const { stone, products } = data;
  const name = stoneTitle(stone.name);
  const path = stoneMeaningPath(stone.id);
  const from = fromPriceKes(products);
  const title = `${name} Meaning: Beliefs, Style & Bracelets${from ? `, from ${from}` : ""} | ${SITE_NAME}`;
  const description = `What ${stone.name.toLowerCase()} means: ${stone.headline} What people have believed about it, how to wear it, and our ${stone.name.toLowerCase()} bracelets, handmade in Kenya.`;
  const image = products[0].images[0];

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      title,
      description,
      url: absoluteUrl(path),
      siteName: SITE_NAME,
      locale: "en_US",
      type: "article",
      images: buildOgImages(image, `${name} meaning`),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [buildOgImages(image, `${name} meaning`)[0].url],
    },
  };
}

export default async function StoneMeaningPage({ params }: Props) {
  const data = await load((await params).stone);
  if (!data) notFound();
  const { stone, products, catalogue } = data;

  const name = stoneTitle(stone.name);
  const lower = stone.name.toLowerCase();
  const path = stoneMeaningPath(stone.id);
  const lead = products[0];
  const hub = seoHubs.find(
    (item) =>
      item.field === "stone_type" &&
      item.value === stone.stoneType &&
      productsForSeoHub(catalogue, item).length > 0,
  );
  const stories = (stoneStories[stone.id] ?? []).flatMap((slug) => {
    const post = getPost(slug);
    return post ? [post] : [];
  });
  const related = stoneFeelings(stone.id).flatMap((group) =>
    group.stones
      .filter((id) => id !== stone.id)
      .flatMap((id) => {
        const other = getStoneMeaning(id);
        if (!other) return [];
        const [product] = findStoneProducts(catalogue, other.products);
        return product ? [{ group: group.title, stone: other, product }] : [];
      }),
  );
  const feeling = stoneFeelings(stone.id)[0]?.title;

  const faqs: FaqItem[] = [
    {
      question: `What does ${lower} mean?`,
      answer: `${stone.headline} Today, ${stone.today}`,
    },
    ...stone.beliefs.slice(0, 1).map((belief) => ({
      question: `What did people believe about ${lower}?`,
      answer: `${belief.where}: ${belief.what}`,
    })),
    {
      question: `How do you wear a ${lower} bracelet?`,
      answer: stone.wear,
    },
    {
      question: `Does ${lower} have healing powers?`,
      answer: `We share what people have believed about ${lower} as history and culture. It is not medical advice, and no stone treats or cures any condition. Wear it for its story, or simply because it looks good.`,
    },
  ];

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${name} meaning: ${stone.headline}`,
    description: stone.pitch,
    image: lead.images[0].startsWith("http")
      ? lead.images[0]
      : absoluteUrl(lead.images[0]),
    url: absoluteUrl(path),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    about: name,
  };

  return (
    <main className="stone-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            jsonLd,
            breadcrumbJsonLd([
              { name: "Stone Meanings", path: STONE_MEANINGS_PATH },
              { name: `${name} meaning`, path },
            ]),
          ]),
        }}
      />

      <section className="container stone-page-hero">
        <div className="stone-page-media">
          <StoreImage
            src={lead.images[0]}
            alt={`${lead.title}, a ${lower} bracelet`}
            sizes="(max-width: 860px) 100vw, 50vw"
            width={1200}
            height={1200}
            eager
          />
        </div>
        <div className="stone-page-intro">
          <nav className="stone-page-crumbs" aria-label="Breadcrumb">
            <Link href={STONE_MEANINGS_PATH}>Stone meanings</Link>
            <span aria-hidden="true"> / </span>
            <span>{name}</span>
          </nav>
          <p className="eyebrow">
            {stone.material}
            {feeling ? ` · ${feeling}` : ""}
          </p>
          <h1>{name} meaning</h1>
          <p className="stone-meaning-headline">{stone.headline}</p>
          <p className="stone-page-pitch">{stone.pitch}</p>
          <div className="stone-page-actions">
            <Link className="btn btn-primary" href={`/product/${lead.slug}`}>
              Shop {lead.title.replace(/ Stone Bracelet$| Bracelet$/, "")} ·{" "}
              <Money prices={lead.prices} />
            </Link>
            <Link className="btn btn-outline" href="#beliefs">
              What people believe
            </Link>
          </div>
        </div>
      </section>

      <div className="container stone-page-body">
        <section id="beliefs" className="stone-page-section">
          <p className="eyebrow">History &amp; belief</p>
          <h2>What people have believed about {lower}</h2>
          <ul className="stone-page-beliefs">
            {stone.beliefs.map((belief) => (
              <li key={belief.where}>
                <b>{belief.where}</b>
                <span>{belief.what}</span>
              </li>
            ))}
            <li>
              <b>Today</b>
              <span>{stone.today}</span>
            </li>
          </ul>
          <p className="stone-meanings-disclaimer">{STONE_DISCLAIMER}</p>
        </section>

        <section className="stone-page-section">
          <p className="eyebrow">Style</p>
          <h2>How to wear {lower}</h2>
          <p className="stone-page-wear">{stone.wear}</p>
        </section>

        <section className="stone-page-story">
          <p className="eyebrow">Wear the story</p>
          <p className="stone-meaning-close">
            {stone.close}{" "}
            <Link href={`/product/${lead.slug}`}>{lead.title}</Link>,{" "}
            <Money prices={lead.prices} />.
          </p>
        </section>

        <section className="stone-page-section">
          <div className="stone-page-heading">
            <h2>
              Our {lower} bracelet{products.length > 1 ? "s" : ""}
            </h2>
            {hub && (
              <Link href={`/bracelets/${hub.slug}`}>
                All {hub.title.replace(" in Kenya", "").toLowerCase()} →
              </Link>
            )}
          </div>
          <SeoProductGrid products={products} />
          <p className="stone-meanings-design">
            Want {lower} with a second stone?{" "}
            <Link href="/design-your-own">Design your own</Link>.
          </p>
        </section>

        {stories.length > 0 && (
          <section className="stone-page-section">
            <p className="eyebrow">From the Journal</p>
            <h2>Read the full story</h2>
            <div className="stone-page-stories">
              {stories.map((post) => (
                <Link key={post.slug} href={`/journal/${post.slug}`}>
                  <strong>{post.title}</strong>
                  <span>{post.description}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        {related.length > 0 && (
          <section className="stone-page-section">
            <p className="eyebrow">{feeling ?? "More stones"}</p>
            <h2>Stones with a similar meaning</h2>
            <div className="stone-cards">
              {related.map(({ stone: other, product }) => (
                <Link
                  key={other.id}
                  href={stoneMeaningPath(other.id)}
                  className="stone-card"
                >
                  <div className="stone-card-media">
                    <StoreImage
                      src={product.images[0]}
                      alt={`${product.title}, a ${other.name.toLowerCase()} bracelet`}
                      sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                      width={800}
                      height={800}
                    />
                  </div>
                  <div className="stone-card-copy">
                    <strong>{stoneTitle(other.name)}</strong>
                    <span>{other.headline}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="stone-meanings-design">
          <Link href={STONE_MEANINGS_PATH}>← All stone meanings</Link>
        </p>

        <FollowBwa placement="stone_meanings" page={path} />
      </div>

      <FaqSection items={faqs} title={`${name}, answered.`} />
    </main>
  );
}
