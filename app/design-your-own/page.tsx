import type { Metadata } from "next";
import DesignYourOwn from "@/components/design/DesignYourOwn";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";
import { getDesignStones } from "@/lib/design/stones-server";
import { designQuery, readDesignParams, resolveDesign } from "@/lib/design/design-link";

export const dynamic = "force-dynamic";

const title = "Design Your Own Stone Bracelet | Beads World Africa";
const description =
  "Design your own natural stone bracelet: pick the stones, the pattern, spacers, letters or a charm, and the bead size. Handmade in Kenya and confirmed with you on WhatsApp.";
const canonicalUrl = absoluteUrl("/design-your-own");
const ogImages = buildOgImages(
  "/images/wear-sth-that-story-section.webp",
  "Design your own natural stone bracelet with Beads World Africa",
);

const base: Metadata = {
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

type Search = Promise<Record<string, string | string[] | undefined>>;
const query = (search: Awaited<Search>) =>
  new URLSearchParams(Object.entries(search).flatMap(([k, v]) => (typeof v === "string" ? [[k, v]] : [])));

// A shared design link previews as that bracelet (app/api/design-image);
// the canonical address stays the plain page, so links are never indexed apart.
export async function generateMetadata({ searchParams }: { searchParams: Search }): Promise<Metadata> {
  const params = readDesignParams(query(await searchParams));
  if (!params) return base;
  const { stones } = await getDesignStones();
  const resolved = resolveDesign(stones, params);
  if (!resolved) return base;
  const { main, second } = resolved;
  const name = second ? `${main.name} + ${second.name}` : main.name;
  const shareTitle = `${name}, designed on Beads World Africa`;
  // Not "natural stone": a design may use glass (Nyota Night) or shell (Maziwa Glow).
  const shareText = `A handmade bracelet: ${[main.stone, second?.stone].filter(Boolean).join(" with ")}. Open it to see it or make it yours.`;
  const image = { url: absoluteUrl(`/api/design-image?${designQuery({ ...params, stone: main.slug, with: second?.slug ?? null })}`), width: 1200, height: 630, alt: `${name} bracelet design` };
  return {
    ...base,
    openGraph: { ...base.openGraph, title: shareTitle, description: shareText, images: [image] },
    twitter: { ...base.twitter, title: shareTitle, description: shareText, images: [image.url] },
  };
}

export default async function DesignYourOwnPage() {
  // Each stone's photo, price and feelings come from its product, so the page
  // never disagrees with the shop; which stones show is set per product in admin.
  const { stones, retired } = await getDesignStones();
  return <DesignYourOwn stones={stones} retired={retired} />;
}
