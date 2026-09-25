import type { Metadata } from "next";
import FindYourBracelet, {
  fallbackQuestions,
} from "@/components/discovery/FindYourBracelet";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { getPublishedQuiz } from "@/lib/commerce/quiz-server";
import { absoluteUrl, buildOgImages, SITE_NAME } from "@/lib/commerce/seo";

export const dynamic = "force-dynamic";

const title = "Find Your Bracelet — Quiz & Recommendation | Beads World Africa";
const description =
  "Take the interactive Beads World Africa bracelet discovery quiz. Answer 4 quick questions to find the natural stone bracelet that matches your energy, intention, style, and fit.";
const canonicalUrl = absoluteUrl("/find-your-bracelet");
const ogImages = buildOgImages(
  "/images/hero-find-your-vibe.webp",
  "Find Your Bracelet interactive discovery quiz",
);

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/find-your-bracelet" },
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

export default async function FindYourBraceletPage() {
  const [quiz, products] = await Promise.all([
    getPublishedQuiz(),
    getStorefrontCatalogue(),
  ]);
  return (
    <FindYourBracelet
      products={products}
      questions={quiz?.questions || fallbackQuestions}
      quizVersionId={quiz?.id}
    />
  );
}
