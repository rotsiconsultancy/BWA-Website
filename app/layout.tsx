import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsletterPopup from "@/components/marketing/NewsletterPopup";
import { CartProvider } from "@/context/CartContext";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Beads World Africa — Natural Stone Bracelets Handmade in Africa",
  description:
    "Contemporary bracelets designed around natural materials, personal style, and the stories we choose to wear. Handcrafted with genuine semi-precious stones.",
  keywords: [
    "African bracelets",
    "natural stone jewelry",
    "handmade bracelets Africa",
    "tiger eye bracelet",
    "lava stone bracelet",
    "beads world africa",
    "men stone bracelets Nairobi",
  ],
  authors: [{ name: "Beads World Africa" }],
  metadataBase: new URL("https://beadsworldafrica.com"),
  openGraph: {
    title: "Beads World Africa — Natural Stone Bracelets Handmade in Africa",
    description:
      "Contemporary bracelets designed around natural materials, personal style, and the stories we choose to wear.",
    url: "https://beadsworldafrica.com",
    siteName: "Beads World Africa",
    images: [
      {
        url: "/images/hero-image.png",
        width: 1200,
        height: 630,
        alt: "Beads World Africa natural stone bracelets",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Beads World Africa — Natural Stone Bracelets",
    description:
      "Contemporary bracelets designed around natural materials, personal style, and stories.",
    images: ["/images/hero-image.png"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <CartProvider>
          <Header />
          {children}
          <Footer />
          <NewsletterPopup />
        </CartProvider>
      </body>
    </html>
  );
}
