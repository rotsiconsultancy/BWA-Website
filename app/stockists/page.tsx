import type { Metadata } from "next";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { stockistMapLink, stockists } from "@/lib/commerce/stockists";
import {
  absoluteUrl,
  buildOgImages,
  SITE_NAME,
  SITE_URL,
} from "@/lib/commerce/seo";

const title = "Where to Buy BWA Bracelets in Kenya | Beads World Africa";
const description =
  "See and try on Beads World Africa bracelets in person at ManCave in Nairobi Street Kitchen, Mwanzi Market and Kitengela, or order online for delivery.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: "/stockists" },
  openGraph: {
    title,
    description,
    url: absoluteUrl("/stockists"),
    siteName: SITE_NAME,
    type: "website",
    images: buildOgImages(),
  },
};

export default function StockistsPage() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Beads World Africa stockists",
    itemListElement: stockists.map((stockist, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: {
        "@type": "Store",
        name: `${stockist.partner} ${stockist.branch}`,
        address: {
          "@type": "PostalAddress",
          streetAddress: stockist.location,
          addressLocality: stockist.area,
          addressCountry: "KE",
        },
        hasMap: stockistMapLink(stockist),
        brand: { "@id": `${SITE_URL}/#organization` },
      },
    })),
  };
  return (
    <main className="stockists-page">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="container">
        <div className="stockists-intro">
          <p className="eyebrow">Where to buy</p>
          <h1>Try it on before you take it home.</h1>
          <p>
            BWA bracelets are available at ManCave in {stockists.length}{" "}
            locations. Drop in, see the stones up close and find your fit.
          </p>
        </div>
      </header>
      <section className="container stockists-grid" aria-label="Stockists">
        {stockists.map((stockist) => (
          <article key={stockist.branch} className="stockist-card">
            <p className="eyebrow">{stockist.partner}</p>
            <h2>{stockist.branch}</h2>
            <p>
              <MapPin size={16} aria-hidden="true" /> {stockist.location},{" "}
              {stockist.area}
            </p>
            <a
              href={stockistMapLink(stockist)}
              target="_blank"
              rel="noopener noreferrer"
            >
              Get directions →
            </a>
          </article>
        ))}
      </section>
      <section className="container stockists-cta">
        <div>
          <h2>Prefer it delivered?</h2>
          <p>
            Order online and we confirm delivery with you on WhatsApp. Within
            Nairobi it costs the same as an Uber or Bolt ride to your door.
          </p>
          <Link href="/bracelets" className="btn btn-primary">
            Shop the collection
          </Link>
        </div>
        <div>
          <h2>Want BWA in your shop?</h2>
          <p>
            We partner with shops whose customers care about how they look and
            what they wear. Tell us about yours.
          </p>
          <a
            href={`https://wa.me/254745474586?text=${encodeURIComponent("Hello BWA, I would like to stock your bracelets in my shop.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-whatsapp"
          >
            <FaWhatsapp size={16} /> Talk to us about stocking BWA
          </a>
        </div>
      </section>
    </main>
  );
}
