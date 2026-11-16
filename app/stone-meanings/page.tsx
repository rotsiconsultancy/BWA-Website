import type { Metadata } from "next";
import Link from "next/link";
import StoreImage from "@/components/commerce/StoreImage";
import Money from "@/components/commerce/Money";
import SeoProductGrid from "@/components/commerce/SeoProductGrid";
import FaqSection from "@/components/commerce/FaqSection";
import FollowBwa from "@/components/marketing/FollowBwa";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildOgImages,
  SITE_NAME,
} from "@/lib/commerce/seo";
import {
  feelingGroups,
  findStoneProducts,
  getStoneMeaning,
  notStone,
  STONE_DISCLAIMER,
  STONE_MEANINGS_PATH,
  stoneMeaningPath,
  stoneMeanings,
  stoneTitle,
} from "@/lib/commerce/stone-meanings";
import type { FaqItem } from "@/lib/commerce/faq";

export const dynamic = "force-dynamic";

const heroImage = "/journal/tigers-eye-the-stone-with-light-inside/cover.webp";
const pageTitle = "Stone Meanings";
const title = `Stone Meanings: What Tiger's Eye, Lava, Lapis & More Mean | ${SITE_NAME}`;
const description =
  "What each stone in our bracelets means: the beliefs people have held about tiger's eye, lava stone, lapis lazuli, obsidian and 15 more, and how to wear them. Handmade in Kenya.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: STONE_MEANINGS_PATH },
  openGraph: {
    title,
    description,
    url: absoluteUrl(STONE_MEANINGS_PATH),
    siteName: SITE_NAME,
    locale: "en_US",
    type: "article",
    images: buildOgImages(heroImage, pageTitle),
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [buildOgImages(heroImage, pageTitle)[0].url],
  },
};

const faqs: FaqItem[] = [
  {
    question: "What does tiger's eye mean?",
    answer: "Tiger's eye is a golden-brown quartz with a band of light that moves across it. Many people wear it against the evil eye, and today it is called the stone of courage, focus and confidence.",
  },
  {
    question: "What does lava stone mean?",
    answer: "Lava stone is volcanic rock full of tiny gas bubbles. Today people wear it as a grounding stone, to feel steady when life moves fast. Its pores also hold a drop of perfume or oil.",
  },
  {
    question: "Which stone is for protection?",
    answer: "Obsidian, malachite and lapis lazuli are the stones most linked with protection. Malachite was worn in ancient Rome to guard children, and lapis scarabs were carved in Egypt to protect the wearer.",
  },
  {
    question: "Do stones have healing powers?",
    answer: "We share stone meanings as history and culture: what people have believed, where and when. They are not medical advice, and no stone treats or cures any condition. Wear a stone for its story, or simply because it looks good.",
  },
  {
    question: "Are your bracelets genuine stone?",
    answer: "Yes. Each stone bracelet is named for the stone it is made from. Two pieces are not stone and we say so: Maziwa Glow is mother of pearl (shell) and Nyota Night is blue goldstone (glass).",
  },
];

export default async function StoneMeaningsPage() {
  const catalogue = await getStorefrontCatalogue();
  const stones = stoneMeanings
    .map((stone) => ({ stone, products: findStoneProducts(catalogue, stone.products) }))
    .filter((entry) => entry.products.length > 0);
  const shown = new Set(stones.map(({ stone }) => stone.id));
  const others = notStone.flatMap((item) => {
    const [product] = findStoneProducts(catalogue, [item.product]);
    return product ? [{ ...item, product }] : [];
  });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: "Stone Meanings: what people have believed for thousands of years",
    description,
    image: absoluteUrl(heroImage),
    url: absoluteUrl(STONE_MEANINGS_PATH),
    author: { "@type": "Organization", name: SITE_NAME },
    publisher: { "@type": "Organization", name: SITE_NAME },
    about: stones.map(({ stone }) => stone.name),
    hasPart: stones.map(({ stone }) => ({
      "@type": "Article",
      name: `${stoneTitle(stone.name)} meaning`,
      url: absoluteUrl(stoneMeaningPath(stone.id)),
    })),
  };

  return (
    <main className="seo-hub-page bracelet-hub-page stone-meanings-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            jsonLd,
            breadcrumbJsonLd([{ name: pageTitle, path: STONE_MEANINGS_PATH }]),
          ]),
        }}
      />
      <section className="bracelet-hub-hero">
        <StoreImage
          src={heroImage}
          alt="A tiger's eye bracelet catching a band of golden light"
          sizes="100vw"
          width={1920}
          height={1080}
          eager
        />
        <div className="bracelet-hub-hero-shade" aria-hidden="true" />
        <div className="bracelet-hub-hero-copy">
          <p>Stone guide · Handmade in Kenya</p>
          <h1>{pageTitle}</h1>
          <div>
            <span>
              People have worn stones for what they mean for thousands of
              years. Here is what each stone in our bracelets is, what people
              have believed about it, and how to wear it.
            </span>
            <Link href="#feelings">
              Find your stone <b aria-hidden="true">↓</b>
            </Link>
          </div>
        </div>
      </section>

      <section id="feelings" className="container seo-hub-section">
        <div className="seo-hub-heading">
          <div>
            <p className="eyebrow">Start here</p>
            <h2>What do you want to carry?</h2>
          </div>
          <p>
            Pick a feeling, then tap a stone to read its meaning. Or wear one simply
            because it looks good. That&rsquo;s a perfectly good reason too.
          </p>
        </div>
        <div className="stone-feelings">
          {feelingGroups.map((group) => {
            const members = group.stones.filter((id) => shown.has(id));
            if (members.length === 0) return null;
            return (
              <div key={group.title} className="stone-feeling">
                <strong>{group.title}</strong>
                <p>
                  {members.map((id, index) => (
                    <span key={id}>
                      {index > 0 && " · "}
                      <Link href={stoneMeaningPath(id)}>
                        {getStoneMeaning(id)?.name}
                      </Link>
                    </span>
                  ))}
                </p>
              </div>
            );
          })}
        </div>
      </section>

      <div className="container stone-meanings-list">
        <section className="stone-index">
          <div className="seo-hub-heading">
            <div>
              <p className="eyebrow">The stones</p>
              <h2>Every stone, and what it means</h2>
            </div>
            <p>
              Tap a stone for its full story: what people have believed, how
              to wear it, and the bracelets made from it.
            </p>
          </div>
          <div className="stone-cards">
            {stones.map(({ stone, products }) => (
              <Link
                key={stone.id}
                id={stone.id}
                href={stoneMeaningPath(stone.id)}
                className="stone-card"
              >
                <div className="stone-card-media">
                  <StoreImage
                    src={products[0].images[0]}
                    alt={`${products[0].title}, a ${stone.name.toLowerCase()} bracelet`}
                    sizes="(max-width: 560px) 100vw, (max-width: 900px) 50vw, 33vw"
                    width={800}
                    height={800}
                  />
                </div>
                <div className="stone-card-copy">
                  <small>{stone.material}</small>
                  <strong>{stoneTitle(stone.name)}</strong>
                  <span>{stone.headline}</span>
                  <em>
                    From <Money prices={products[0].prices} /> · Read its
                    meaning →
                  </em>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {others.length > 0 && (
          <section id="not-stone" className="stone-meaning">
            <header>
              <p className="eyebrow">Also in the collection</p>
              <h2>Shell &amp; starlight</h2>
              <p className="stone-meaning-headline">
                Two favourites that aren&rsquo;t stone, and we&rsquo;ll always
                tell you so.
              </p>
            </header>
            <div className="stone-meaning-body">
              {others.map((item) => (
                <p key={item.name}>
                  <b>
                    <Link href={`/product/${item.product.slug}`}>
                      {item.name}
                    </Link>{" "}
                    · {item.label}.
                  </b>{" "}
                  {item.text} Today, {item.today}
                </p>
              ))}
            </div>
            <SeoProductGrid products={others.map((item) => item.product)} />
          </section>
        )}

        <p className="stone-meanings-disclaimer">{STONE_DISCLAIMER}</p>

        <FollowBwa placement="stone_meanings" page={STONE_MEANINGS_PATH} />

        <p className="stone-meanings-design">
          Want two stones on one bracelet?{" "}
          <Link href="/design-your-own">Design your own</Link>, or read the
          stories behind the stones in the <Link href="/journal">Journal</Link>.
        </p>
      </div>

      <FaqSection items={faqs} title="Stone meanings, answered." />
    </main>
  );
}
