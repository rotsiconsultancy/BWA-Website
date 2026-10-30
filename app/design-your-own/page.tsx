import type { Metadata } from "next";
import DesignYourOwn from "@/components/design/DesignYourOwn";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";
import { getDesignStones } from "@/lib/design/stones-server";

export const dynamic = "force-dynamic";

const title = "Design Your Own Stone Bracelet | Beads World Africa";
const description =
  "Design your own natural stone bracelet: pick the stones, the pattern, spacers, letters or a charm, and the bead size. Handmade in Kenya and confirmed with you on WhatsApp.";
const canonicalUrl = absoluteUrl("/design-your-own");
const ogImages = buildOgImages(
  "/images/wear-sth-that-story-section.webp",
  "Design your own natural stone bracelet with Beads World Africa",
);

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/design-your-own" },
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

export default async function DesignYourOwnPage() {
  // Each stone's photo, price and feelings come from its product, so the page
  // never disagrees with the shop; which stones show is set per product in admin.
  const { stones, retired } = await getDesignStones();
  return <DesignYourOwn stones={stones} retired={retired} />;
}
