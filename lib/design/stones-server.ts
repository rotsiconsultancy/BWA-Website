import "server-only";

import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";
import { getSupabaseAdmin } from "@/lib/supabase/server";
import {
  type BeadShape,
  type DesignStone,
  LEGACY_DESIGN_STONES,
  type RetiredStone,
  stoneLabel,
} from "@/lib/design/stones";

type Row = {
  slug: string;
  title: string;
  active: boolean;
  price: number | string;
  price_kes: number | string;
  price_usd: number | string | null;
  energy_vibe: string[] | null;
  stone_type: string[] | null;
  color_palette: string[] | null;
  design_enabled: boolean;
  design_slug: string;
  design_name: string | null;
  design_bead_shape: BeadShape;
  design_bead_images: string[] | null;
  design_colour: string | null;
  design_aliases: string[] | null;
  product_images: { url: string; sort_order: number }[] | null;
};

/**
 * The stones the designer offers (design_enabled, whether or not the bracelet
 * itself is listed), and the ones it used to offer, so old links can say a
 * stone is gone. Before the design_* columns exist, falls back to the fixed
 * list of 28 stones matched against the live catalogue.
 */
export async function getDesignStones(): Promise<{ stones: DesignStone[]; retired: RetiredStone[] }> {
  const admin = getSupabaseAdmin();
  if (admin) {
    const { data, error } = await admin
      .from("products")
      .select(
        "slug,title,active,price,price_kes,price_usd,energy_vibe,stone_type,color_palette,design_enabled,design_slug,design_name,design_bead_shape,design_bead_images,design_colour,design_aliases,product_images(url,sort_order)",
      )
      .not("design_slug", "is", null);
    if (!error && data) {
      const rows = data as unknown as Row[];
      const stones = rows
        .filter((r) => r.design_enabled)
        .map((r): DesignStone => {
          const name = r.design_name || r.title.replace(/(Stone )?Bracelet$/i, "").trim();
          const stoneTypes = r.stone_type || [];
          return {
            slug: r.design_slug,
            name,
            stone: stoneLabel(r.title, name, stoneTypes),
            product: r.slug,
            listed: r.active,
            image: [...(r.product_images || [])].sort((a, b) => a.sort_order - b.sort_order)[0]?.url ?? null,
            prices: {
              KES: Number(r.price_kes ?? r.price),
              USD: r.price_usd === null ? null : Number(r.price_usd),
            },
            feelings: r.energy_vibe || [],
            stoneTypes,
            palettes: r.color_palette || [],
            shape: r.design_bead_shape,
            beads: r.design_bead_images || [],
            colour: r.design_colour,
            aliases: r.design_aliases || [],
          };
        })
        .sort((a, b) => a.name.localeCompare(b.name));
      const retired = rows
        .filter((r) => !r.design_enabled)
        .map((r): RetiredStone => ({
          slug: r.design_slug,
          name: r.design_name || r.title.replace(/(Stone )?Bracelet$/i, "").trim(),
          stoneTypes: r.stone_type || [],
          palettes: r.color_palette || [],
          feelings: r.energy_vibe || [],
          aliases: r.design_aliases || [],
        }));
      return { stones, retired };
    }
    // 42703: the design_* columns are not there yet.
    if (error && error.code !== "42703")
      console.error("Unable to load Design Your Own stones", error.message);
  }

  const catalogue = await getStorefrontCatalogue();
  const stones = LEGACY_DESIGN_STONES.flatMap(({ stone, product, shape }) => {
    const listed = catalogue.find((p) => p.slug === product);
    if (!listed) return [];
    const name = stone.split("-").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ");
    return [
      {
        slug: stone,
        name,
        stone: stoneLabel(listed.title, name, listed.stone_type),
        product: listed.slug,
        listed: true,
        image: listed.images[0] ?? null,
        prices: listed.prices,
        feelings: listed.energy_vibe,
        stoneTypes: listed.stone_type,
        palettes: listed.color_palette,
        shape: shape ?? "sphere",
        beads: [],
        colour: null,
        aliases: [],
      } satisfies DesignStone,
    ];
  });
  return { stones, retired: [] };
}
