import { NextResponse } from "next/server";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";

export async function GET(request: Request) {
  const query =
    new URL(request.url).searchParams.get("q")?.trim().toLowerCase() || "";
  if (query.length < 2) return NextResponse.json({ products: [] });
  const products = await getStorefrontCatalogue();
  const matches = products
    .filter((product) =>
      [
        product.title,
        product.subtitle,
        product.collection,
        product.story,
        ...product.stone_type,
        ...product.energy_vibe,
        ...product.intention,
      ]
        .join(" ")
        .toLowerCase()
        .includes(query),
    )
    .slice(0, 6)
    .map((product) => ({
      slug: product.slug,
      title: product.title,
      subtitle: product.subtitle,
      prices: product.prices,
      image: product.images[0],
    }));
  return NextResponse.json({ products: matches });
}
