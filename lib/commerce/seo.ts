export const SITE_URL = "https://beadsworldafrica.co.ke";
export const SITE_NAME = "Beads World Africa";

export function absoluteUrl(path: string): string {
  if (!path) return SITE_URL;
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

export function buildOgImages(imageUrl?: string, altText?: string) {
  const url = absoluteUrl(
    imageUrl ||
      "/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.png",
  );
  return [
    {
      url,
      width: 1200,
      height: 630,
      alt: altText || "Beads World Africa natural stone bracelet",
    },
  ];
}
