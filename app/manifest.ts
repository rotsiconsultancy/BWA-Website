import type { MetadataRoute } from "next";

// Lets phones add BWA to the home screen with its own icon and open it
// full screen. Icons come from public/brand/BWA-social-profile-dark-green.svg.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Beads World Africa",
    short_name: "BWA",
    description:
      "Natural stone bracelets, handmade in Kenya. Order on WhatsApp.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#F4F0E6",
    theme_color: "#24321F",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
