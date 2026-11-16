import { MetadataRoute } from "next";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { productsForSeoHub, seoHubs } from "@/lib/commerce/seo-hubs";
import { MENS_PAGE_PATH } from "@/lib/commerce/mens-stone-bracelets";
import { getAllPosts } from "@/lib/journal/posts";
import {
  findStoneProducts,
  stoneMeaningPath,
  stoneMeanings,
} from "@/lib/commerce/stone-meanings";

// Rebuild hourly so products added straight in Supabase (not via admin) still appear.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://beadsworldafrica.co.ke";

  const products = await getStorefrontCatalogue();
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/our-story`,
      lastModified: new Date("2026-11-07T00:00:00+03:00"),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/corporate-gifts`,
      lastModified: new Date("2026-11-07T00:00:00+03:00"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    // /shop is noindex (/bracelets is the page meant to rank), so it stays out.
    {
      url: `${baseUrl}/bracelets`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}${MENS_PAGE_PATH}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.85,
    },
    {
      url: `${baseUrl}/journal`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.7,
    },
    ...getAllPosts().map((post) => ({
      url: `${baseUrl}/journal/${post.slug}`,
      lastModified: new Date(post.updated ?? post.date),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    })),
    {
      url: `${baseUrl}/stockists`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/find-your-bracelet`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/design-your-own`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/stone-meanings`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...stoneMeanings
      .filter((stone) => findStoneProducts(products, stone.products).length > 0)
      .map((stone) => ({
        url: `${baseUrl}${stoneMeaningPath(stone.id)}`,
        lastModified: new Date("2026-11-16T00:00:00+03:00"),
        changeFrequency: "monthly" as const,
        priority: 0.75,
      })),
    {
      url: `${baseUrl}/returns`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.4,
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
