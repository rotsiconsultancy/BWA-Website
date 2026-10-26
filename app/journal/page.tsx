import type { Metadata } from "next";
import Link from "next/link";
import JournalPostCard from "@/components/journal/JournalPostCard";
import { getAllPosts } from "@/lib/journal/posts";
import { categorySlug, JOURNAL_CATEGORIES } from "@/lib/journal/categories";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";

const title = "The BWA Journal: Bracelet Stories, Stone Guides & Gift Ideas";
const description =
  "Stories from Beads World Africa: what the stones mean, how to choose and wear a bracelet, and gift ideas for the men in your life.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/journal" },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/journal"),
    siteName: SITE_NAME,
    type: "website",
    images: buildOgImages(),
  },
};

export default async function JournalPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category } = await searchParams;
  const posts = getAllPosts();
  const categories = JOURNAL_CATEGORIES.filter((name) =>
    posts.some((post) => post.category === name),
  );
  const active = categories.find((name) => categorySlug(name) === category);
  const shown = active
    ? posts.filter((post) => post.category === active)
    : posts;
  const [featured, ...rest] = shown;

  return (
    <main className="journal-page">
      <header className="container journal-intro">
        <p className="eyebrow">The BWA Journal</p>
        <h1>Stories worth wearing.</h1>
        <p>
          What the stones mean, how to choose and wear a bracelet, and the
          stories behind the pieces.
        </p>
      </header>

      {categories.length > 1 && (
        <nav className="container journal-filters" aria-label="Categories">
          <Link href="/journal" aria-current={active ? undefined : "page"}>
            All stories
          </Link>
          {categories.map((name) => (
            <Link
              key={name}
              href={`/journal?category=${categorySlug(name)}`}
              aria-current={active === name ? "page" : undefined}
            >
              {name}
            </Link>
          ))}
        </nav>
      )}

      {featured ? (
        <>
          <section className="container journal-feature">
            <JournalPostCard post={featured} featured />
          </section>
          {rest.length > 0 && (
            <section className="container journal-grid">
              {rest.map((post) => (
                <JournalPostCard key={post.slug} post={post} />
              ))}
            </section>
          )}
        </>
      ) : (
        <p className="container journal-empty">New stories are on their way.</p>
      )}

      <section className="container journal-quiz-cta">
        <div>
          <h2>Not sure where to start?</h2>
          <p>Answer a few quick questions and we will suggest a bracelet.</p>
        </div>
        <Link href="/find-your-bracelet" className="btn btn-primary">
          Find your bracelet
        </Link>
      </section>
    </main>
  );
}
