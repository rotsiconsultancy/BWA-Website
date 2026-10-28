import type { Metadata } from "next";
import DesignYourOwn, {
  type DesignStone,
} from "@/components/design/DesignYourOwn";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";
import { DESIGN_STONES } from "@/lib/design/stones";

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
  const catalogue = await getStorefrontCatalogue();
  // Every stone borrows its listed bracelet's photo, name, price and
  // feelings, so the page never disagrees with the shop.
  const stones: DesignStone[] = DESIGN_STONES.flatMap(({ stone, product }) => {
    const listed = catalogue.find((p) => p.slug === product);
    if (!listed) return [];
    const name = listed.title.split(" ").slice(0, 2).join(" ");
    const kind = listed.title
      .slice(name.length)
      .replace(/(Stone )?Bracelet$/, "")
      .trim();
    return [
      {
        slug: stone,
        name,
        stone: kind,
        product: listed.slug,
        image: listed.images[0],
        prices: listed.prices,
        feelings: listed.energy_vibe,
      },
    ];
  });
  return <DesignYourOwn stones={stones} />;
}
