import "server-only";

import { catalogue } from "@/lib/commerce/catalogue";
import type { CommerceProduct } from "@/lib/commerce/types";
import { getSupabaseAdmin } from "@/lib/supabase/server";

type ProductRow = {
  id: string;
  slug: string;
  title: string;
  subtitle: string | null;
  descriptor: string | null;
  seo_title: string | null;
  price: number | string;
  price_kes: number | string;
  price_usd: number | string | null;
  category: string;
  story: string | null;
  details: string[] | null;
  featured: boolean;
  is_trending: boolean;
  active: boolean;
  energy_vibe: string[];
  intention: string[];
  stone_type: string[];
  color_palette: string[];
  style_tags: string[];
  wrist_fits: string[];
  occasion: string[];
  recipient: string[];
  collections: { title: string } | null;
  product_images:
    { url: string; alt_text: string; sort_order: number }[] | null;
  product_variants:
    | {
        id: string;
        title: string;
        sku: string;
        price_adjustment: number | string;
        price_adjustment_kes: number | string;
        price_adjustment_usd: number | string | null;
        stock_quantity: number;
        reserved_quantity: number;
        active: boolean;
      }[]
    | null;
};

function mapProduct(product: ProductRow): CommerceProduct {
  const variants = (product.product_variants || []).map((variant) => {
    const stock = Math.max(
      0,
      variant.stock_quantity - variant.reserved_quantity,
    );
    return {
      id: variant.id,
      name: variant.title,
      sku: variant.sku,
      priceAdjustments: {
        KES: Number(variant.price_adjustment_kes ?? variant.price_adjustment),
        USD:
          variant.price_adjustment_usd === null
            ? null
            : Number(variant.price_adjustment_usd),
      },
      stock,
      available: variant.active && stock > 0,
    };
  });

  return {
    id: product.id,
    slug: product.slug,
    title: product.title,
    subtitle: product.subtitle || "Hand-finished natural stone bracelet",
    descriptor: product.descriptor || "Made in considered small batches.",
    seoTitle: product.seo_title || null,
    prices: {
      KES: Number(product.price_kes ?? product.price),
      USD: product.price_usd === null ? null : Number(product.price_usd),
    },
    category: product.category,
    collection: product.collections?.title || "BWA Collection",
    story: product.story || "A BWA piece, made to become part of your rhythm.",
    details: product.details?.length
      ? product.details
      : ["Hand-finished in Kenya"],
    images: (product.product_images || [])
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((image) => image.url),
    featured: product.featured,
    trending: product.is_trending,
    active: product.active,
    energy_vibe: product.energy_vibe || [],
    intention: product.intention || [],
    stone_type: product.stone_type || [],
    color_palette: product.color_palette || [],
    style_tags: product.style_tags || [],
    wrist_fits: product.wrist_fits || [],
    occasion: product.occasion || [],
    recipient: product.recipient || [],
    variants,
  };
}

async function loadProducts(slug?: string): Promise<CommerceProduct[] | null> {
  const admin = getSupabaseAdmin();
  if (!admin) return null;

  let query = admin
    .from("products")
    .select(
      "id,slug,title,subtitle,descriptor,seo_title,price,price_kes,price_usd,category,story,details,featured,is_trending,active,energy_vibe,intention,stone_type,color_palette,style_tags,wrist_fits,occasion,recipient,collections(title),product_images(url,alt_text,sort_order),product_variants(id,title,sku,price_adjustment,price_adjustment_kes,price_adjustment_usd,stock_quantity,reserved_quantity,active)",
    )
    .eq("active", true)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false });

  if (slug) query = query.eq("slug", slug);
  const { data, error } = await query;
  if (error) {
    console.error("Unable to load BWA catalogue", error.message);
    return null;
  }

  return (data as unknown as ProductRow[])
    .map(mapProduct)
    .filter((product) => product.images.length > 0);
}

export async function getStorefrontCatalogue(): Promise<CommerceProduct[]> {
  const products = await loadProducts();
  return products && products.length > 0 ? products : catalogue;
}

export async function getStorefrontProduct(
  slug: string,
): Promise<CommerceProduct | undefined> {
  const products = await loadProducts(slug);
  if (products) return products[0];
  return catalogue.find((product) => product.slug === slug);
}
