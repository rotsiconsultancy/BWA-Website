import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import StoreImage from "@/components/commerce/StoreImage";
import TrackedLink from "@/components/marketing/TrackedLink";
import {
  CORPORATE_EMAIL,
  CORPORATE_EMAIL_URL,
  CORPORATE_WHATSAPP_URL,
  MOMENTS,
  PLACE_NAMES,
} from "@/lib/commerce/our-story";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/commerce/seo";
import { STOCKIST_ENQUIRY_URL } from "@/lib/commerce/stockists";
import { designLink, type DesignStone } from "@/lib/design/stones";
import { getDesignStones } from "@/lib/design/stones-server";
import { storyDisplay } from "@/lib/story-font";
import styles from "./story.module.css";

const display = storyDisplay;

// The beads read the live stones; refresh hourly.
export const revalidate = 3600;

const title = "Our Story | Handmade Bracelets in Kenya | Beads World Africa";
const description =
  "A bracelet goes where you go. Beads World Africa makes handmade bracelets in Kenya, named for Kenyan places: for everyday wear, matching sets, gifts and team appreciation.";
const shareImage = {
  url: absoluteUrl("/images/our-story/share.jpg"),
  width: 1200,
  height: 630,
  alt: "Black lava and white speckled BWA bracelets worn on wrists in sunlight",
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/our-story" },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/our-story"),
    siteName: SITE_NAME,
    type: "website",
    locale: "en_KE",
    images: [shareImage],
  },
  twitter: {
    card: "summary_large_image",
    title,
    description,
    images: [shareImage],
  },
};

const track = (link: string) => ({ placement: "our_story", link });

const stoneHref = (stone: DesignStone) =>
  stone.listed ? `/product/${stone.product}` : designLink(stone.product);

function Bead({ stone, sizes }: { stone?: DesignStone; sizes: string }) {
  return (
    <span
      className={styles.bead}
      style={stone?.colour ? { background: stone.colour } : undefined}
    >
      {stone?.beads[0] && (
        <StoreImage
          src={stone.beads[0]}
          alt=""
          sizes={sizes}
          width={256}
          height={256}
        />
      )}
    </span>
  );
}

export default async function OurStoryPage() {
  const { stones } = await getDesignStones();
  const find = (code: string) => stones.find((s) => s.slug === code);
  const places = PLACE_NAMES.flatMap(({ stone, place }) => {
    const found = find(stone);
    return found ? [{ ...found, place }] : [];
  });

  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "AboutPage",
      "@id": `${SITE_URL}/our-story#webpage`,
      url: absoluteUrl("/our-story"),
      name: title,
      description,
      inLanguage: "en-KE",
      about: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      primaryImageOfPage: {
        "@type": "ImageObject",
        url: shareImage.url,
        width: shareImage.width,
        height: shareImage.height,
        caption: shareImage.alt,
      },
      breadcrumb: { "@id": `${SITE_URL}/our-story#breadcrumbs` },
    },
    {
      ...breadcrumbJsonLd([{ name: "Our Story", path: "/our-story" }]),
      "@id": `${SITE_URL}/our-story#breadcrumbs`,
    },
  ];

  return (
    <main className={`${styles.page} ${display.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className={styles.hero} aria-labelledby="story-title">
        <div className={`${styles.inner} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Our Story</span>
            </nav>
            <h1 id="story-title">With you for all of it.</h1>
            <p className={styles.heroIntro}>
              The ordinary days, and the ones you’ll never forget.
            </p>
            <div className={styles.actions}>
              <TrackedLink
                className={styles.button}
                href="/find-your-bracelet"
                event="our_story_click"
                params={track("hero_find_your_bracelet")}
              >
                Find Your Bracelet
              </TrackedLink>
              <TrackedLink
                className={styles.textLink}
                href="/design-your-own"
                event="our_story_click"
                params={track("hero_design_your_own")}
              >
                Design Your Own
              </TrackedLink>
            </div>
            <TrackedLink
              className={styles.teamLink}
              href="#team-gifts"
              event="our_story_click"
              params={track("hero_team_gifts")}
            >
              Buying for a team? See team gifts
            </TrackedLink>
          </div>
          <figure className={styles.heroPhoto}>
            <Image
              src="/images/our-story/worn-together.webp"
              alt="Two wrists wearing BWA bracelets: black lava, white speckled beads and dark metallic accents"
              width={1200}
              height={1600}
              sizes="(max-width: 767px) 100vw, 44vw"
              loading="eager"
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>

      <section className={styles.story} aria-labelledby="why-title">
        <div className={`${styles.inner} ${styles.storyGrid}`}>
          <figure className={styles.storyPhoto}>
            <Image
              src="/images/our-story/bracelets-in-sunlight.webp"
              alt="Black lava and white speckled BWA bracelets worn together beside another beaded wrist against a rust-red wall"
              width={1000}
              height={1333}
              sizes="(max-width: 767px) 100vw, 32vw"
            />
          </figure>
          <div className={styles.storyCopy}>
            <h2 id="why-title">
              It started with a bracelet on someone’s wrist.
            </h2>
            <p className={styles.storyLead}>
              Nothing makes us happier than seeing a BWA bracelet on someone’s
              wrist, out living their life. That’s why Beads World Africa
              exists.
            </p>
            <p>
              We make bracelets by hand in Kenya, from natural stones and beads,
              and name many of them after places we love.
            </p>
            <p>
              A bracelet isn’t like anything else you own. You put it on and
              forget it’s there. It goes to church with you, to the market, to
              the office, out with friends. It’s there on the hard days and the
              good ones. You stop noticing it. The people around you don’t.
            </p>
            <p>
              Over time it holds the days you’ve lived in it. We’ve seen couples
              wear matching pairs, families share one design, and people give
              one to someone they love. That’s the story we get to be part of.
            </p>
            <p className={styles.signature}>BWA</p>
          </div>
        </div>
      </section>

      <section aria-labelledby="week-title">
        <h2 id="week-title" className={styles.weekTitle}>
          <span className={styles.inner}>Here’s a week of it.</span>
        </h2>
        <ol className={styles.week}>
          {MOMENTS.map((moment) => {
            const stone = find(moment.stone);
            return (
              <li
                key={moment.stone}
                className={styles.moment}
                data-ink={moment.ink}
                style={{ "--field": moment.field } as CSSProperties}
              >
                <div className={`${styles.inner} ${styles.momentGrid}`}>
                  <div className={styles.strand}>
                    <Bead
                      stone={stone}
                      sizes="(max-width: 767px) 56px, 112px"
                    />
                  </div>
                  <div className={styles.momentCopy}>
                    <p className={styles.day}>
                      {moment.day}
                      {stone && (
                        <>
                          {" · "}
                          <TrackedLink
                            href={stoneHref(stone)}
                            event="our_story_click"
                            params={track(`moment_${stone.slug}`)}
                          >
                            {stone.name}
                          </TrackedLink>
                        </>
                      )}
                    </p>
                    <p className={styles.line}>{moment.line}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </section>

      <section className={styles.together} aria-label="Matching sets and gifts">
        <div className={`${styles.inner} ${styles.togetherGrid}`}>
          <article className={styles.card}>
            <figure>
              <Image
                src="/images/our-story/matching-pair.webp"
                alt="Two wrists side by side, each wearing the same black lava and white speckled BWA bracelets"
                width={1000}
                height={1333}
                sizes="(max-width: 767px) 100vw, 44vw"
              />
            </figure>
            <h2>For the ones who wear it together.</h2>
            <p>
              Couples and families choose matching bracelets so that wherever
              each of them goes, they still belong to each other.
            </p>
            <TrackedLink
              className={styles.textLink}
              href="/design-your-own"
              event="our_story_click"
              params={track("matching_pair")}
            >
              Make a matching pair
            </TrackedLink>
          </article>
          <article className={`${styles.card} ${styles.cardLow}`}>
            <figure>
              <Image
                src="/images/our-story/handed-over.webp"
                alt="One hand passing a stack of BWA bracelets to another above a sunny courtyard"
                width={1000}
                height={1333}
                sizes="(max-width: 767px) 100vw, 44vw"
              />
            </figure>
            <h2>Give them something that goes everywhere they go.</h2>
            <p>
              Every time they put it on, they’ll think of you. Most days without
              even knowing it.
            </p>
            <TrackedLink
              className={styles.textLink}
              href="/journal/what-to-get-him-when-he-says-he-wants-nothing"
              event="our_story_click"
              params={track("gift_guide")}
            >
              Find the right gift
            </TrackedLink>
          </article>
        </div>
      </section>

      {places.length > 0 && (
        <section
          className={styles.names}
          id="names"
          aria-labelledby="names-title"
        >
          <div className={styles.inner}>
            <div className={styles.namesHead}>
              <h2 id="names-title">Every name is a piece of home.</h2>
              <p>Mountains, coastlines and plains, worn close.</p>
            </div>
            <ul className={styles.tray}>
              {places.map((stone) => (
                <li key={stone.slug}>
                  <TrackedLink
                    href={stoneHref(stone)}
                    event="our_story_click"
                    params={track(`name_${stone.slug}`)}
                  >
                    <Bead stone={stone} sizes="88px" />
                    <strong>{stone.name}</strong>
                    <small>{stone.place}</small>
                  </TrackedLink>
                </li>
              ))}
            </ul>
            <p className={styles.note}>
              Our names honour these places. They don’t mean the stones come
              from there.
            </p>
          </div>
        </section>
      )}

      <section
        className={styles.team}
        id="team-gifts"
        aria-labelledby="team-title"
      >
        <div className={`${styles.inner} ${styles.teamGrid}`}>
          <div className={styles.teamCopy}>
            <h2 id="team-title">
              The day they were recognised, worn every day after.
            </h2>
            <p>
              A bracelet given for a promotion, a milestone or a year of hard
              work goes back to the office with them, and everywhere else. It’s
              on their wrist in the next meeting, the next trip, the next win.
            </p>
            <ul className={styles.occasions}>
              <li>
                <strong>Staff appreciation</strong>
                Promotions, milestones, a good year, a team that delivered.
              </li>
              <li>
                <strong>Client thank-yous</strong>
                For the clients and partners you want to remember you.
              </li>
              <li>
                <strong>Events</strong>
                Speakers, guests and the people who made the day happen.
              </li>
            </ul>
            <p>
              Tell us the occasion, how many people and when you need them.
              We’ll come back to you with bracelet options. Thank them in a way
              that stays.
            </p>
            <div className={styles.actions}>
              <TrackedLink
                className={styles.button}
                href={CORPORATE_EMAIL_URL}
                event="corporate_gift_enquiry_click"
                params={{ placement: "our_story", method: "email" }}
              >
                Email us about team gifts
              </TrackedLink>
              <TrackedLink
                className={styles.textLink}
                href={CORPORATE_WHATSAPP_URL}
                event="corporate_gift_enquiry_click"
                params={{ placement: "our_story", method: "whatsapp" }}
              >
                Or WhatsApp us
              </TrackedLink>
            </div>
            <p className={styles.email}>{CORPORATE_EMAIL}</p>
            <TrackedLink
              className={styles.teamLink}
              href="/corporate-gifts"
              event="our_story_click"
              params={track("corporate_gifts_page")}
            >
              See the packs and prices
            </TrackedLink>
          </div>
          <figure className={styles.teamPhoto}>
            <Image
              src="/images/our-story/beads-in-hand.webp"
              alt="Three BWA bracelets held in a hand: porous black lava, white speckled beads and zigzag patterns"
              width={1000}
              height={1333}
              sizes="(max-width: 767px) 100vw, 36vw"
            />
          </figure>
        </div>
      </section>

      <section className={styles.closing} aria-labelledby="closing-title">
        <div className={styles.inner}>
          <h2 id="closing-title">Where will it take you?</h2>
          <div className={styles.actions}>
            <TrackedLink
              className={styles.button}
              href="/find-your-bracelet"
              event="our_story_click"
              params={track("find_your_bracelet")}
            >
              Find Your Bracelet
            </TrackedLink>
            <TrackedLink
              className={styles.textLink}
              href="/design-your-own"
              event="our_story_click"
              params={track("design_your_own")}
            >
              Design Your Own
            </TrackedLink>
          </div>
          <p className={styles.closingLinks}>
            <TrackedLink
              href="/stockists"
              event="our_story_click"
              params={track("stockists")}
            >
              Try them on at ManCave, Mwanzi Market
            </TrackedLink>
            <TrackedLink
              href={STOCKIST_ENQUIRY_URL}
              event="stockist_enquiry_click"
              params={{ placement: "our_story" }}
            >
              Own a shop? Stock BWA
            </TrackedLink>
          </p>
        </div>
      </section>
    </main>
  );
}
