import { MetadataRoute } from "next";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://beadsworldafrica.com";

  const products = await getStorefrontCatalogue();
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/bracelets`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/find-your-bracelet`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bespoke`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...seoHubs
      .filter((hub) => productsForSeoHub(products, hub).length > 0)
      .map((hub) => ({
        url: `${baseUrl}/bracelets/${hub.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.75,
      })),
    ...products
      .filter((product) => product.active)
      .map((product) => ({
        url: `${baseUrl}/product/${product.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      })),
  ];
}
