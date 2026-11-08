import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";
import ProductReviews from "@/components/product/ProductReviews";
import {
  getStorefrontCatalogue,
  getStorefrontProduct,
} from "@/lib/commerce/catalogue-server";
import { PRODUCT_REDIRECTS } from "@/lib/commerce/product-redirects";
import {
  absoluteUrl,
  breadcrumbJsonLd,
  buildOgImages,
  SITE_NAME,
  SITE_URL,
} from "@/lib/commerce/seo";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getStorefrontProduct((await params).slug);
  if (!product) return {};

  const title =
    product.seoTitle || `${product.title} — ${product.subtitle} | ${SITE_NAME}`;
  const description =
    product.descriptor ||
    product.story ||
    `Shop ${product.title}, a ${product.subtitle.toLowerCase()} natural stone bracelet by Beads World Africa.`;
  const canonicalUrl = absoluteUrl(`/product/${product.slug}`);
  const ogImages = buildOgImages(
    product.images[0],
    `${product.title} natural stone bracelet by Beads World Africa`,
  );

  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
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
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getStorefrontProduct(slug);
  if (!product) {
    // Renamed product: send old links on, permanently (308).
    const moved = PRODUCT_REDIRECTS[slug];
    if (moved) permanentRedirect(`/product/${moved}`);
    notFound();
  }
  const related = (await getStorefrontCatalogue())
    .filter((item) => item.id !== product.id)
    .slice(0, 3);

  // Shared by both offers. No shippingDetails: delivery is the Uber/Bolt fare
  // in Nairobi and quoted on WhatsApp elsewhere, so there is no fixed rate to
  // state; shipping is set in Merchant Center instead.
  const offerExtras = {
    itemCondition: "https://schema.org/NewCondition",
    url: absoluteUrl(`/product/${product.slug}`),
    seller: { "@id": `${SITE_URL}/#organization` },
    hasMerchantReturnPolicy: {
      "@type": "MerchantReturnPolicy",
      applicableCountry: "KE",
      returnPolicyCategory:
        "https://schema.org/MerchantReturnFiniteReturnWindow",
      merchantReturnDays: 7,
      refundType: "https://schema.org/ExchangeRefund",
      returnFees: "https://schema.org/ReturnShippingFees",
      returnMethod: "https://schema.org/ReturnByMail",
      merchantReturnLink: absoluteUrl("/returns"),
    },
  };
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.story || product.descriptor,
    image: product.images.map((img) => absoluteUrl(img)),
    sku: product.variants[0]?.sku || product.slug,
    brand: { "@type": "Brand", name: SITE_NAME },
    category: "Bracelets",
    material: product.stone_type.map((s) => s.replaceAll("_", " ")).join(", "),
    color: product.color_palette.map((c) => c.replaceAll("_", " ")).join(", "),
    offers: [
      {
        "@type": "Offer",
        priceCurrency: "KES",
        price: product.prices.KES,
        availability: product.variants.some((v) => v.available && v.stock > 0)
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
        ...offerExtras,
      },
      ...(product.prices.USD !== null
        ? [
            {
              "@type": "Offer",
              priceCurrency: "USD",
              price: product.prices.USD,
              availability: product.variants.some(
                (v) => v.available && v.stock > 0,
              )
                ? "https://schema.org/InStock"
                : "https://schema.org/OutOfStock",
              ...offerExtras,
            },
          ]
        : []),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            jsonLd,
            breadcrumbJsonLd([
              { name: "Bracelets", path: "/bracelets" },
              { name: product.title, path: `/product/${product.slug}` },
            ]),
          ]),
        }}
      />
      <ProductDetail product={product} related={related} />
      <ProductReviews productId={product.id} />
    </>
  );
}
