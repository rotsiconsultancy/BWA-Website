export type ProductTaxonomy = {
  energy_vibe: string[];
  intention: string[];
  stone_type: string[];
  color_palette: string[];
  style_tags: string[];
  wrist_fits: string[];
  occasion?: string[];
  recipient?: string[];
};

export type CommerceVariant = {
  id: string;
  name: string;
  sku: string;
  priceAdjustments: import("@/lib/commerce/money").Prices;
  stock: number;
  available: boolean;
};

export type CommerceProduct = ProductTaxonomy & {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  descriptor: string;
  /** Search-engine title from the catalogue; the page builds one when empty. */
  seoTitle?: string | null;
  prices: import("@/lib/commerce/money").Prices;
  category: string;
  collection: string;
  story: string;
  details: string[];
  images: string[];
  featured: boolean;
  trending: boolean;
  active: boolean;
  variants: CommerceVariant[];
};

export type CartLine = {
  productId: string;
  variantId: string;
  slug: string;
  title: string;
  subtitle: string;
  image: string;
  unitPrices: import("@/lib/commerce/money").Prices;
  variantName: string;
  quantity: number;
};
