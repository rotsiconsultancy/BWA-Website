import type { Prices } from "@/lib/commerce/money";
import { PRODUCT_REDIRECTS } from "@/lib/commerce/product-redirects";

export type BeadShape = "sphere" | "rondelle" | "tube";

/** A stone the Design Your Own page offers. */
export type DesignStone = {
  /** The stone's code in design links, e.g. "simba-gold". */
  slug: string;
  name: string;
  /** What the stone is, e.g. "Tiger's Eye". */
  stone: string;
  product: string;
  image: string | null;
  prices: Prices;
  feelings: string[];
  stoneTypes: string[];
  palettes: string[];
  shape: BeadShape;
  /** Photos of single beads; empty until cut (cut-beads.py). */
  beads: string[];
  /** The bead's colour, for drawing it when there are no bead photos. */
  colour: string | null;
  aliases: string[];
};

/** A stone the page no longer offers, kept so old design links can say so. */
export type RetiredStone = Pick<
  DesignStone,
  "slug" | "name" | "stoneTypes" | "palettes" | "feelings" | "aliases"
>;

/** Version of the design-link format; bump it when the parameters change meaning. */
export const DESIGN_LINK_VERSION = 1;

// The 28 stones from Website-data/stone-listings-2026-10-28, used only until the
// design_* columns exist in Supabase (Website-data/design-your-own-plan-2026-10-30).
export const LEGACY_DESIGN_STONES: { stone: string; product: string; shape?: BeadShape }[] = [
  { stone: "aberdare-pine", product: "aberdare-pine-fancy-jasper-stone-bracelet" },
  { stone: "anga-blue", product: "anga-blue-sodalite-stone-bracelet" },
  { stone: "bogoria-blush", product: "bogoria-blush-pink-opal-stone-bracelet" },
  { stone: "chalbi-map", product: "chalbi-map-picture-jasper-stone-bracelet" },
  { stone: "chuma-link", product: "chuma-link-hematite-stone-bracelet", shape: "tube" },
  { stone: "chyulu-black", product: "chyulu-black-lava-stone-bracelet" },
  { stone: "diani-denim", product: "diani-denim-sodalite-stone-bracelet" },
  { stone: "kerio-earth", product: "kerio-earth-fancy-jasper-stone-bracelet" },
  { stone: "kirinyaga-cloud", product: "kirinyaga-cloud-white-howlite-stone-bracelet" },
  { stone: "lenana-crackle", product: "lenana-crackle-howlite-stone-bracelet" },
  { stone: "magadi-dust", product: "magadi-dust-pink-zebra-jasper-stone-bracelet" },
  { stone: "malindi-sunset", product: "malindi-sunset-carnelian-agate-stone-bracelet" },
  { stone: "mau-evergreen", product: "mau-evergreen-moss-agate-stone-bracelet" },
  { stone: "maziwa-glow", product: "maziwa-glow-mother-of-pearl-bracelet", shape: "rondelle" },
  { stone: "menengai-rust", product: "menengai-rust-red-lava-stone-bracelet" },
  { stone: "moto-lava", product: "moto-lava-orange-lava-stone-bracelet" },
  { stone: "mvua-slate", product: "mvua-slate-picasso-jasper-stone-bracelet" },
  { stone: "njorowa-ember", product: "njorowa-ember-mahogany-obsidian-stone-bracelet" },
  { stone: "nyota-night", product: "nyota-night-blue-goldstone-bracelet" },
  { stone: "pwani-sand", product: "pwani-sand-unakite-stone-bracelet" },
  { stone: "rose-murram", product: "rose-murram-rhodonite-stone-bracelet" },
  { stone: "samburu-map", product: "samburu-map-picture-jasper-stone-bracelet" },
  { stone: "simba-gold", product: "simba-gold-tigers-eye-stone-bracelet" },
  { stone: "suswa-rust", product: "suswa-rust-red-lava-stone-bracelet" },
  { stone: "taita-spark", product: "taita-spark-bloodstone-bracelet" },
  { stone: "tsavo-clay", product: "tsavo-clay-red-jasper-stone-bracelet" },
  { stone: "waridi-shadow", product: "waridi-shadow-rhodonite-stone-bracelet" },
  { stone: "watamu-deep", product: "watamu-deep-lapis-lazuli-stone-bracelet" },
];

/** Link into the page with a listed bracelet's stone already picked. */
export const designLink = (productSlug?: string) =>
  productSlug ? `/design-your-own?product=${productSlug}` : "/design-your-own";

/** "Simba Gold Tiger's Eye Stone Bracelet" with name "Simba Gold" → "Tiger's Eye". */
export function stoneLabel(title: string, name: string, stoneTypes: string[]) {
  const rest = title.startsWith(name)
    ? title.slice(name.length).replace(/(Stone )?Bracelet$/i, "").trim()
    : "";
  if (rest) return rest;
  const type = stoneTypes.find((t) => t !== "non_stone");
  return type ? type.split("_").map((w) => w[0].toUpperCase() + w.slice(1)).join(" ") : "";
}

/** Find a stone by its link code, an old code, or (for ?product=) a product address. */
export function findStone(stones: DesignStone[], code: string | null) {
  if (!code) return undefined;
  return stones.find((s) => s.slug === code || s.aliases.includes(code));
}
export function findStoneByProduct(stones: DesignStone[], productSlug: string | null) {
  if (!productSlug) return undefined;
  const current = PRODUCT_REDIRECTS[productSlug] ?? productSlug;
  return stones.find((s) => s.product === current);
}

/** The offered stones most like one that is gone: same stone, then colour, then feeling. */
export function similarStones(stones: DesignStone[], gone: RetiredStone | undefined, count = 3) {
  if (!gone) return stones.slice(0, count);
  const overlap = (a: string[], b: string[]) => a.filter((x) => b.includes(x)).length;
  return [...stones]
    .map((s) => ({
      s,
      score:
        overlap(s.stoneTypes.filter((t) => t !== "non_stone"), gone.stoneTypes) * 4 +
        overlap(s.palettes, gone.palettes) * 2 +
        overlap(s.feelings, gone.feelings),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(({ s }) => s);
}
