import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Fragment } from "react";
import StoreImage from "@/components/commerce/StoreImage";
import FaqSection from "@/components/commerce/FaqSection";
import JournalPostCard, {
  formatPostDate,
} from "@/components/journal/JournalPostCard";
import JournalProductCard from "@/components/journal/JournalProductCard";
import JournalShopBar from "@/components/journal/JournalShopBar";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import {
  absoluteUrl,
  buildOgImages,
  SITE_NAME,
  SITE_URL,
} from "@/lib/commerce/seo";
import { renderPostBody } from "@/lib/journal/markdown";
import { getAllPosts, getPost } from "@/lib/journal/posts";

// Posts are files; product cards refresh hourly with live prices and stock.
export const revalidate = 3600;

export function generateStaticParams() {
  return getAllPosts().map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const post = getPost((await params).slug);
  if (!post) return {};
  return {
    title: `${post.title} | ${SITE_NAME}`,
    description: post.description,
    alternates: { canonical: `/journal/${post.slug}` },
    openGraph: {
      title: post.title,
      description: post.description,
      url: absoluteUrl(`/journal/${post.slug}`),
      siteName: SITE_NAME,
      type: "article",
      publishedTime: post.date,
      modifiedTime: post.updated ?? post.date,
      images: buildOgImages(post.cover, post.coverAlt),
    },
    twitter: { card: "summary_large_image" },
  };
}

export default async function JournalPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const post = getPost((await params).slug);
  if (!post) notFound();
  const catalogue = await getStorefrontCatalogue();
  const bySlug = new Map(catalogue.map((product) => [product.slug, product]));
  const featured = bySlug.get(post.featuredProduct);
  const segments = renderPostBody(post.body);
  const firstCard = segments.findIndex(
    (segment) => segment.type === "product" && bySlug.has(segment.slug),
  );
  const morePosts = getAllPosts()
    .filter((other) => other.slug !== post.slug)
    .sort(
      (a, b) =>
        Number(b.category === post.category) -
        Number(a.category === post.category),
    )
    .slice(0, 3);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    image: absoluteUrl(post.cover),
    datePublished: post.date,
    dateModified: post.updated ?? post.date,
    mainEntityOfPage: absoluteUrl(`/journal/${post.slug}`),
    author: { "@id": `${SITE_URL}/#organization` },
    publisher: { "@id": `${SITE_URL}/#organization` },
    articleSection: post.category,
    ...(featured && {
      about: {
        "@type": "Product",
        name: featured.title,
        url: absoluteUrl(`/product/${featured.slug}`),
      },
    }),
  };

  return (
    <main className="journal-post">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="journal-post-cover">
        <StoreImage
          src={post.cover}
          alt={post.coverAlt}
          sizes="100vw"
          width={1600}
          height={900}
          eager
        />
      </div>
      <article className="journal-article">
        <header className="journal-post-header">
          <p className="eyebrow">
            <Link href="/journal">Journal</Link> · {post.category}
          </p>
          <h1>{post.title}</h1>
          <p className="journal-post-lead">{post.description}</p>
          <p className="journal-post-meta">
            {formatPostDate(post.date)} · {post.readingMinutes} min read
          </p>
        </header>

        <div className="journal-prose">
          {segments.map((segment, index) => {
            if (segment.type === "html")
              return (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{ __html: segment.html }}
                />
              );
            const product = bySlug.get(segment.slug);
            // An unpublished or renamed product simply drops out of the story.
            if (!product) return null;
            return (
              <Fragment key={index}>
                <JournalProductCard
                  product={product}
                  postSlug={post.slug}
                  placement="inline"
                />
                {index === firstCard && <span data-journal-shop-marker />}
              </Fragment>
            );
          })}
        </div>

        <section className="journal-closing" data-journal-end>
          {featured && (
            <JournalProductCard
              product={featured}
              postSlug={post.slug}
              placement="closing"
            />
          )}
          <p>
            Still deciding?{" "}
            <Link href="/find-your-bracelet">Find your bracelet</Link> in a few
            questions, or <Link href="/stockists">try one on at ManCave</Link>.
          </p>
        </section>
      </article>

      {post.faq.length > 0 && <FaqSection items={post.faq} />}

      {morePosts.length > 0 && (
        <section className="container journal-more">
          <p className="eyebrow">Keep reading</p>
          <div className="journal-grid">
            {morePosts.map((other) => (
              <JournalPostCard key={other.slug} post={other} />
            ))}
          </div>
        </section>
      )}

      {featured && firstCard !== -1 && (
        <JournalShopBar
          postSlug={post.slug}
          productSlug={featured.slug}
          productTitle={featured.title}
        />
      )}
    </main>
  );
}
