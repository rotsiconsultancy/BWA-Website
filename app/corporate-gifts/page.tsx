import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import TrackedLink from "@/components/marketing/TrackedLink";
import {
  GIFT_FACTS,
  GIFT_FITS,
  GIFT_PACKS,
  GIFT_STEPS,
  packEmailUrl,
} from "@/lib/commerce/corporate-gifts";
import {
  CORPORATE_EMAIL,
  CORPORATE_EMAIL_URL,
  CORPORATE_WHATSAPP_URL,
} from "@/lib/commerce/our-story";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  SITE_NAME,
  SITE_URL,
} from "@/lib/commerce/seo";
import { storyDisplay } from "@/lib/story-font";
import styles from "./corporate.module.css";

const title =
  "Corporate Gifts in Kenya | Handmade Bracelets for Staff and Clients | Beads World Africa";
const description =
  "The Appreciation Collection: handmade Kenyan bracelets for staff appreciation, client thank-yous and events. Packs from KES 2,000. Tell us the occasion and we'll send a quote.";
const shareImage = {
  url: absoluteUrl("/images/our-story/share.jpg"),
  width: 1200,
  height: 630,
  alt: "Black lava and white speckled BWA bracelets worn on wrists in sunlight",
};

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/corporate-gifts" },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/corporate-gifts"),
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

const kes = (amount: number) => amount.toLocaleString("en-KE");

const enquiry = (method: string, pack?: string) => ({
  placement: "corporate_page",
  method,
  ...(pack ? { pack } : {}),
});

const POINTS = [
  {
    title: "Worn, not stored",
    text: "People wear it to work, so the thank-you stays visible for months, not days.",
  },
  {
    title: "Made in Kenya",
    text: "Your gift budget goes to a Kenyan small business, which supports your local-sourcing story.",
  },
  {
    title: "Personal",
    text: "Many stones carry the name of a Kenyan place. Executive sets are personalised for the person receiving them.",
  },
  {
    title: "Easy to approve",
    text: "Everyday and Signature packs sit under US$50, a common limit in gift policies. We note the value for your gifts register.",
  },
];

export default function CorporateGiftsPage() {
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${SITE_URL}/corporate-gifts#webpage`,
      url: absoluteUrl("/corporate-gifts"),
      name: title,
      description,
      inLanguage: "en-KE",
      about: { "@id": `${SITE_URL}/#organization` },
      isPartOf: { "@id": `${SITE_URL}/#website` },
      breadcrumb: { "@id": `${SITE_URL}/corporate-gifts#breadcrumbs` },
    },
    {
      ...breadcrumbJsonLd([
        { name: "Corporate Gifts", path: "/corporate-gifts" },
      ]),
      "@id": `${SITE_URL}/corporate-gifts#breadcrumbs`,
    },
  ];

  return (
    <main className={`${styles.page} ${storyDisplay.variable}`}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c"),
        }}
      />

      <section className={styles.hero} aria-labelledby="gifts-title">
        <div className={`${styles.inner} ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <nav className={styles.breadcrumb} aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span aria-hidden="true">/</span>
              <span aria-current="page">Corporate Gifts</span>
            </nav>
            <h1 id="gifts-title">
              The day they were recognised, worn every day after.
            </h1>
            <p className={styles.heroIntro}>
              The Appreciation Collection: handmade Kenyan bracelets for staff,
              clients and the people who make your year. Packs from KES 2,000.
            </p>
            <div className={styles.actions}>
              <TrackedLink
                className={styles.button}
                href={CORPORATE_EMAIL_URL}
                event="corporate_gift_enquiry_click"
                params={enquiry("email")}
              >
                Ask for a quote
              </TrackedLink>
              <TrackedLink
                className={styles.textLink}
                href={CORPORATE_WHATSAPP_URL}
                event="corporate_gift_enquiry_click"
                params={enquiry("whatsapp")}
              >
                WhatsApp us
              </TrackedLink>
            </div>
          </div>
          <figure className={styles.heroPhoto}>
            <Image
              src="/images/our-story/handed-over.webp"
              alt="One hand passing a stack of BWA bracelets to another above a sunny courtyard"
              width={1000}
              height={1333}
              sizes="(max-width: 767px) 100vw, 40vw"
              loading="eager"
              fetchPriority="high"
            />
          </figure>
        </div>
      </section>

      <section className={styles.idea} aria-labelledby="idea-title">
        <div className={`${styles.inner} ${styles.ideaGrid}`}>
          <div>
            <h2 id="idea-title">A bracelet goes where they go.</h2>
            <p className={styles.lead}>
              A hamper is eaten in a week. A mug goes into a cupboard. A
              bracelet given for a good year goes back to the office on their
              wrist, and everywhere else.
            </p>
            <p>
              It’s there in the next meeting, the next trip, the next win. And
              every time they look down, they remember who said thank you. Every
              bracelet is strung by hand in Kenya, from natural stones and
              beads.
            </p>
            <Link className={styles.textLink} href="/our-story">
              Read our story
            </Link>
          </div>
          <dl className={styles.points}>
            {POINTS.map((point) => (
              <div key={point.title}>
                <dt>{point.title}</dt>
                <dd>{point.text}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className={styles.facts} aria-labelledby="facts-title">
        <div className={styles.inner}>
          <h2 id="facts-title">
            Most corporate gifts are forgotten long before the next one.
          </h2>
          <ul className={styles.factList}>
            {GIFT_FACTS.map((fact) => (
              <li key={fact.figure}>
                <p>
                  <strong>{fact.figure}</strong> {fact.text}
                </p>
                <small>{fact.source}</small>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section
        className={styles.packs}
        id="packs"
        aria-labelledby="packs-title"
      >
        <div className={styles.inner}>
          <h2 id="packs-title">Three packs, for every kind of thank-you.</h2>
          <ul className={styles.packList}>
            {GIFT_PACKS.map((pack) => (
              <li key={pack.name} data-featured={pack.name === "Signature"}>
                <h3>{pack.name}</h3>
                <p className={styles.count}>{pack.bracelets} bracelets</p>
                <p className={styles.price}>
                  KES {pack.prices.map(kes).join(" · ")}
                </p>
                <p className={styles.options}>{pack.options}</p>
                <p className={styles.forWhom}>{pack.forWhom}</p>
                <TrackedLink
                  className={styles.textLink}
                  href={packEmailUrl(pack.name)}
                  event="corporate_gift_enquiry_click"
                  params={enquiry("email", pack.name.toLowerCase())}
                >
                  Ask about {pack.name}
                </TrackedLink>
              </li>
            ))}
          </ul>
          <p className={styles.note}>
            Prices per pack, bracelets only. Packaging (BWA pouch or box),
            personalisation, delivery and timelines are confirmed with each
            order. A pack can go to one person or be shared across a team.
          </p>
        </div>
      </section>

      <section className={styles.fits} aria-labelledby="fits-title">
        <div className={styles.inner}>
          <h2 id="fits-title">Where a bracelet fits in your year.</h2>
          <ul className={styles.fitList}>
            {GIFT_FITS.map((row) => (
              <li key={row.business}>
                <strong>{row.business}</strong>
                <span>{row.moment}</span>
                <span>{row.fit}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className={styles.steps} aria-labelledby="steps-title">
        <div className={styles.inner}>
          <h2 id="steps-title">One conversation, and we handle the rest.</h2>
          <ol className={styles.stepList}>
            {GIFT_STEPS.map((step) => (
              <li key={step.title}>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
          <p className={styles.note}>
            Every bracelet is made by hand, so earlier orders get the widest
            choice of stones and personalisation for December. Timelines and
            terms are confirmed with each quote.
          </p>
        </div>
      </section>

      <section className={styles.close} aria-labelledby="close-title">
        <div className={`${styles.inner} ${styles.closeGrid}`}>
          <div>
            <h2 id="close-title">Thank them in a way that stays.</h2>
            <p>
              Tell us the occasion, how many people and when you need the gifts.
              We’ll come back with bracelet options and a quote.
            </p>
            <div className={styles.actions}>
              <TrackedLink
                className={styles.button}
                href={CORPORATE_EMAIL_URL}
                event="corporate_gift_enquiry_click"
                params={enquiry("email_close")}
              >
                Email {CORPORATE_EMAIL}
              </TrackedLink>
              <TrackedLink
                className={styles.textLink}
                href={CORPORATE_WHATSAPP_URL}
                event="corporate_gift_enquiry_click"
                params={enquiry("whatsapp_close")}
              >
                WhatsApp +254 745 474 586
              </TrackedLink>
            </div>
          </div>
          <figure className={styles.closePhoto}>
            <Image
              src="/images/our-story/beads-in-hand.webp"
              alt="Three BWA bracelets held in a hand: porous black lava, white speckled beads and zigzag patterns"
              width={1000}
              height={1333}
              sizes="(max-width: 767px) 100vw, 32vw"
            />
          </figure>
        </div>
      </section>
    </main>
  );
}
