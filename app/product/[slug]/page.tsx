import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductDetail from "@/components/product/ProductDetail";
import {
  getStorefrontCatalogue,
  getStorefrontProduct,
} from "@/lib/commerce/catalogue-server";

type Props = { params: Promise<{ slug: string }> };
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getStorefrontProduct((await params).slug);
  if (!product) return {};
  const title = `${product.title} ${product.subtitle} Bracelet | Beads World Africa`;
  const description =
    `Shop ${product.title}, a ${product.subtitle.toLowerCase()} natural stone bracelet by Beads World Africa. ${product.story}`.slice(
      0,
      160,
    );
  return {
    title,
    description,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: { title, description, images: product.images.slice(0, 1) },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = await getStorefrontProduct((await params).slug);
  if (!product) notFound();
  const related = (await getStorefrontCatalogue())
    .filter((item) => item.id !== product.id)
    .slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description: product.story,
    image: product.images,
    sku: product.variants[0]?.sku,
    brand: { "@type": "Brand", name: "Beads World Africa" },
    category: "Bracelets",
    offers: {
      "@type": "Offer",
      priceCurrency: "KES",
      price: product.prices.KES,
      availability: product.variants.some((variant) => variant.available)
        ? "https://schema.org/InStock"
        : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      url: `https://beadsworldafrica.com/product/${product.slug}`,
    },
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetail product={product} related={related} />
    </>
  );
}
