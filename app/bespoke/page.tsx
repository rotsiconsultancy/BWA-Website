import type { Metadata } from "next";
import BespokeForm from "@/components/bespoke/BespokeForm";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";

const title = "Bespoke Custom Bracelets | Beads World Africa";
const description =
  "Begin with a feeling. Tell us what you want a custom natural stone bracelet to hold, and we will shape the rest with you.";
const canonicalUrl = absoluteUrl("/bespoke");
const ogImages = buildOgImages(
  "/images/wear-sth-that-story-section.png",
  "Beads World Africa bespoke custom bracelets",
);

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/bespoke" },
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

export default function BespokePage() {
  return <BespokeForm />;
}
