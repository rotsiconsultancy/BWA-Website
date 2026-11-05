import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import NewsletterPopup from "@/components/marketing/NewsletterPopup";
import { CartProvider } from "@/context/CartContext";
import CartDrawer from "@/components/commerce/CartDrawer";
import { CurrencyProvider } from "@/context/CurrencyContext";
import MetaPixel from "@/components/marketing/MetaPixel";
import type { Metadata } from "next";
import { Cormorant_Garamond, Manrope } from "next/font/google";
import { SITE_NAME, SITE_URL } from "@/lib/commerce/seo";

// Self-hosted by Next, so no render-blocking request to Google Fonts.
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  display: "swap",
  variable: "--font-cormorant",
});
const manrope = Manrope({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-manrope",
});

// Who BWA is, for Google and AI assistants. Stockist branches join this once
// their addresses are confirmed (roadmap step 5).
const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "OnlineStore",
  "@id": `${SITE_URL}/#organization`,
  name: SITE_NAME,
  alternateName: "BWA",
  url: SITE_URL,
  logo: `${SITE_URL}/brand/bwa-emblem.svg`,
  description:
    "Handmade bracelets from Kenya, made from natural stones and other materials and designed around personal style and intention.",
  areaServed: { "@type": "Country", name: "Kenya" },
  sameAs: [
    "https://instagram.com/beadsworldafrica",
    "https://facebook.com/beadsworldafrica",
    "https://tiktok.com/@beadsworldafrica",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer service",
    telephone: "+254745474586",
  },
  hasMerchantReturnPolicy: {
    "@type": "MerchantReturnPolicy",
    applicableCountry: "KE",
    returnPolicyCategory: "https://schema.org/MerchantReturnFiniteReturnWindow",
    merchantReturnDays: 7,
    merchantReturnLink: `${SITE_URL}/returns`,
  },
};
// Tells Google the site's name, so a search for "Beads World Africa" (or
// "beads world") shows this site under its own name.
const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: SITE_NAME,
  alternateName: ["BWA", "Beads World", "beadsworldafrica"],
  url: `${SITE_URL}/`,
  publisher: { "@id": `${SITE_URL}/#organization` },
};

// Search Console (Sep–Oct 2026): brand searches ranked ~10th and the old
// title never said Kenya. Keep "Kenya" and the brand name in both.
const HOME_TITLE =
  "Beads World Africa | Natural Stone Bracelets Handmade in Kenya";
const HOME_DESCRIPTION =
  "Handmade natural stone bracelets for men and women in Kenya: tiger eye, lava stone, malachite and more. Order online, confirm on WhatsApp, delivered in Nairobi and across Kenya.";

import GoogleAnalytics from "@/components/marketing/GoogleAnalytics";
import Script from "next/script";

export const metadata: Metadata = {
  title: HOME_TITLE,
  description: HOME_DESCRIPTION,
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
  metadataBase: new URL("https://beadsworldafrica.co.ke"),
  openGraph: {
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    url: "https://beadsworldafrica.co.ke",
    siteName: "Beads World Africa",
    images: [
      {
        url: "https://beadsworldafrica.co.ke/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.webp",
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
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    images: [
      "https://beadsworldafrica.co.ke/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.webp",
    ],
  },
  icons: {
    // Brown on light browser themes, white on dark ones (see the file's CSS).
    icon: "/brand/bwa-favicon.svg",
    apple: "/icons/apple-touch-icon.png",
  },
  appleWebApp: { title: "BWA", statusBarStyle: "default" },
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
    <html lang="en" scroll-behavior="smooth" className={`scroll-smooth ${cormorant.variable} ${manrope.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([organizationJsonLd, websiteJsonLd]),
          }}
        />
        <GoogleAnalytics />
        <Script
          src="https://analytics.ahrefs.com/analytics.js"
          data-key="ohT7pEenSWgTJf9b877jlg"
          strategy="afterInteractive"
        />
        <CurrencyProvider>
          <CartProvider>
            <Header />
            {children}
            <Footer />
            <NewsletterPopup />
            <CartDrawer />
            <MetaPixel />
          </CartProvider>
        </CurrencyProvider>
      </body>
    </html>
  );
}
