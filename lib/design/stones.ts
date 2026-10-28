// The stones on the Design Your Own page: each one's drawing material (in
// beads.ts) and the live product whose photo, name, price and feelings it
// borrows. From Website-data/stone-listings-2026-10-28 (owner-approved).
export const DESIGN_STONES = [
  { stone: "aberdare-pine", product: "aberdare-pine-fancy-jasper-stone-bracelet" },
  { stone: "anga-blue", product: "anga-blue-sodalite-stone-bracelet" },
  { stone: "bogoria-blush", product: "bogoria-blush-pink-opal-stone-bracelet" },
  { stone: "chalbi-map", product: "chalbi-map-picture-jasper-stone-bracelet" },
  { stone: "chuma-link", product: "chuma-link-hematite-stone-bracelet" },
  { stone: "chyulu-black", product: "chyulu-black-lava-stone-bracelet" },
  { stone: "diani-denim", product: "diani-denim-sodalite-stone-bracelet" },
  { stone: "kerio-earth", product: "kerio-earth-fancy-jasper-stone-bracelet" },
  { stone: "kirinyaga-cloud", product: "kirinyaga-cloud-white-howlite-stone-bracelet" },
  { stone: "lenana-crackle", product: "lenana-crackle-howlite-stone-bracelet" },
  { stone: "magadi-dust", product: "magadi-dust-pink-zebra-jasper-stone-bracelet" },
  { stone: "malindi-sunset", product: "malindi-sunset-carnelian-agate-stone-bracelet" },
  { stone: "mau-evergreen", product: "mau-evergreen-moss-agate-stone-bracelet" },
  { stone: "maziwa-glow", product: "maziwa-glow-mother-of-pearl-bracelet" },
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
] as const;

export type DesignStoneSlug = (typeof DESIGN_STONES)[number]["stone"];

const byProduct: Map<string, DesignStoneSlug> = new Map(
  DESIGN_STONES.map((s) => [s.product, s.stone]),
);

/** Link into the page with a listed bracelet's stone already picked. */
export const designLink = (productSlug?: string) => {
  const stone = productSlug && byProduct.get(productSlug);
  return stone ? `/design-your-own?stone=${stone}` : "/design-your-own";
};
