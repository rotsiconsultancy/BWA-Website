import type { CommerceProduct, ProductTaxonomy } from "@/lib/commerce/types";

/**
 * `field` must match a `name` in TAXONOMIES (lib/commerce/taxonomy.ts).
 * `value` must match an option `value` within that taxonomy group.
 * Using `string` instead of a strict union so removing a taxonomy option
 * never causes a TypeScript build error — it simply yields an empty hub.
 */
export type SeoHub = {
  slug: string;
  /** Taxonomy group name — see lib/commerce/taxonomy.ts TAXONOMIES */
  field: string;
  /** Taxonomy option value — see lib/commerce/taxonomy.ts TAXONOMIES */
  value: string;
  title: string;
  eyebrow: string;
  description: string;
  intro: string;
};

/**
 * Old hub addresses that moved, mapped to the current slug.
 * Never remove an entry: old links live on in Google.
 */
export const SEO_HUB_REDIRECTS: Record<string, string> = {
  // 2026-11-16: "Ukalite" was a misspelling of unakite.
  "ukalite-bracelets": "unakite-bracelets",
  // 2026-11-16: the "matte onyx" bracelet is chipped black obsidian (owner).
  "matte-onyx-bracelets": "obsidian-bracelets",
};

export const seoHubs: SeoHub[] = [
  {
    slug: "tiger-eye-bracelets",
    field: "stone_type",
    value: "tiger_eye",
    title: "Tiger Eye Bracelets in Kenya",
    eyebrow: "Stone guide / Tiger Eye",
    description:
      "Natural tiger eye stone bracelets for men and women, handmade in Kenya, with a warm gold-brown grain that shifts in the light.",
    intro:
      "Tiger Eye brings a warm, grounded visual rhythm to the wrist. Explore BWA pieces selected for its rich gold-brown grain and considered everyday presence.",
  },
  {
    slug: "lava-stone-bracelets",
    field: "stone_type",
    value: "lava_stone",
    title: "Lava Stone Bracelets in Kenya",
    eyebrow: "Stone guide / Lava Stone",
    description:
      "Shop BWA Lava Stone bracelets in Kenya. Discover textured, natural stone bracelets designed to be worn alone or stacked.",
    intro:
      "Lava Stone has a tactile, raw surface that makes a quiet statement. These BWA bracelets are made for a more rugged, layered way of wearing natural stone.",
  },
  {
    slug: "unakite-bracelets",
    field: "stone_type",
    value: "unakite",
    title: "Unakite Bracelets in Kenya",
    eyebrow: "Stone guide / Unakite",
    description:
      "Natural unakite stone bracelets by Beads World Africa, mottled moss green and salmon pink, handmade in Kenya for everyday wear.",
    intro:
      "Unakite mixes moss green and salmon pink in one stone, so no two beads look alike. Explore BWA bracelets that bring a soft, earthy colour to the wrist.",
  },
  {
    slug: "lapis-lazuli-bracelets",
    field: "stone_type",
    value: "lapis_lazuli",
    title: "Lapis Lazuli Bracelets in Kenya",
    eyebrow: "Stone guide / Lapis Lazuli",
    description:
      "Explore Lapis Lazuli bracelets from Beads World Africa, with deep blue natural stone and handmade finishing.",
    intro:
      "Lapis Lazuli brings depth and a saturated blue note to a bracelet stack. Discover BWA pieces chosen for people drawn to colour with calm confidence.",
  },
  {
    slug: "turquoise-bracelets",
    field: "stone_type",
    value: "turquoise",
    title: "Turquoise Bracelets in Kenya",
    eyebrow: "Stone guide / Turquoise",
    description:
      "Shop Turquoise bracelets by Beads World Africa: natural stone, expressive colour, and handcrafted Kenyan style.",
    intro:
      "Turquoise has an expressive, earth-led character. Explore BWA bracelets that let its pattern and colour do the talking.",
  },
  {
    slug: "red-jasper-bracelets",
    field: "stone_type",
    value: "red_jasper",
    title: "Red Jasper Bracelets in Kenya",
    eyebrow: "Stone guide / Red Jasper",
    description:
      "Discover Red Jasper bracelets from Beads World Africa: handcrafted natural stone bracelets with an earthy red palette.",
    intro:
      "Red Jasper brings an earthy, energetic colour note. These BWA pieces are for people drawn to warm natural materials and a bolder wrist presence.",
  },
  {
    slug: "howlite-bracelets",
    field: "stone_type",
    value: "howlite",
    title: "Howlite Bracelets in Kenya",
    eyebrow: "Stone guide / Howlite",
    description:
      "Natural howlite stone bracelets by Beads World Africa: clean white stone with fine grey and black veins, handmade in Kenya.",
    intro:
      "White stone traced with fine grey and black veins, like cracks in fresh snow. Explore BWA howlite bracelets for a calm, clean look.",
  },
  {
    slug: "sodalite-bracelets",
    field: "stone_type",
    value: "sodalite",
    title: "Sodalite Bracelets in Kenya",
    eyebrow: "Stone guide / Sodalite",
    description:
      "Natural sodalite stone bracelets by Beads World Africa: rich blue stone with white veins like clouds, handmade in Kenya.",
    intro:
      "Lapis lazuli's cousin: a rich blue stone with white veins like clouds. The easiest blue to wear, from jeans to white linen.",
  },
  {
    slug: "obsidian-bracelets",
    field: "stone_type",
    value: "obsidian",
    title: "Obsidian Bracelets in Kenya",
    eyebrow: "Stone guide / Obsidian",
    description:
      "Black, mahogany and snowflake obsidian bracelets by Beads World Africa: natural volcanic glass, polished beads and chips, handmade in Kenya.",
    intro:
      "Obsidian is natural volcanic glass, and Kenya's Rift Valley is one of the richest obsidian landscapes on Earth. Glossy black chips, warm mahogany or flecked with snow.",
  },
  {
    slug: "hematite-bracelets",
    field: "stone_type",
    value: "hematite",
    title: "Hematite Bracelets in Kenya",
    eyebrow: "Stone guide / Hematite",
    description:
      "Hematite bracelets by Beads World Africa: heavy, cool iron oxide polished to a mirror shine, handmade in Kenya.",
    intro:
      "Heavy, cool and shining like polished steel. Hematite sits naturally beside a silver watch and a grey or black suit.",
  },
  {
    slug: "rhodonite-bracelets",
    field: "stone_type",
    value: "rhodonite",
    title: "Rhodonite Bracelets in Kenya",
    eyebrow: "Stone guide / Rhodonite",
    description:
      "Natural rhodonite stone bracelets by Beads World Africa: rose pink with bold black veins, handmade in Kenya. A gift that says love.",
    intro:
      "Rose pink with bold black veins, and a stone Russia's tsars prized. Gorgeous with white, navy and black.",
  },
  {
    slug: "jasper-bracelets",
    field: "stone_type",
    value: "jasper",
    title: "Jasper Bracelets in Kenya",
    eyebrow: "Stone guide / Jasper",
    description:
      "Natural jasper stone bracelets by Beads World Africa: picture, fancy, Picasso and pink zebra jasper, each bead patterned like the land. Handmade in Kenya.",
    intro:
      "Every jasper bead carries its own pattern: little maps, forest greens, brush strokes and soft pink stripes. Explore BWA's jasper bracelets.",
  },
  {
    slug: "agate-bracelets",
    field: "stone_type",
    value: "agate",
    title: "Agate Bracelets in Kenya",
    eyebrow: "Stone guide / Agate",
    description:
      "Carnelian and moss agate bracelets by Beads World Africa: a sunset or a forest in every bead, handmade in Kenya.",
    intro:
      "Agate holds a sunset or a forest inside: warm banded carnelian, or soft green moss threads in clear stone.",
  },
  {
    slug: "bracelets-for-grounding",
    field: "energy_vibe",
    value: "grounding",
    title: "Grounding Bracelets in Kenya",
    eyebrow: "Discover by feeling / Grounded",
    description:
      "Explore BWA’s grounding bracelet edit: natural stone pieces chosen for a quiet, earth-led everyday look.",
    intro:
      "For days that call for a quieter, more earth-led feeling. This edit brings together BWA bracelets with grounded materials, dark notes, and an easy daily rhythm.",
  },
  {
    slug: "bracelets-for-protection",
    field: "energy_vibe",
    value: "protection",
    title: "Protection Bracelets in Kenya",
    eyebrow: "Discover by feeling / Protective",
    description:
      "Explore BWA’s protective bracelet edit: handcrafted natural stone pieces with a strong, considered presence.",
    intro:
      "This edit is for people drawn to a stronger, more protective feeling in what they wear. Explore BWA bracelets with dark, steady, considered character.",
  },
  {
    slug: "bracelets-for-calm",
    field: "energy_vibe",
    value: "calm",
    title: "Calm Bracelets in Kenya",
    eyebrow: "Discover by feeling / Calm",
    description:
      "Discover BWA calm bracelet styles, a considered natural stone edit for a clear and understated everyday look.",
    intro:
      "A calmer visual rhythm, made wearable. Discover natural stone BWA bracelets for people who prefer considered colour, texture, and presence.",
  },
  {
    slug: "bracelets-for-courage",
    field: "intention",
    value: "courage",
    title: "Courage Bracelets in Kenya",
    eyebrow: "Discover by intention / Courage",
    description:
      "Explore BWA bracelets for a courageous, expressive look: handcrafted natural stone pieces for everyday self-expression.",
    intro:
      "For choosing a piece with a little more intention behind it. This BWA edit brings together bracelets made for a confident, expressive personal style.",
  },
  {
    slug: "everyday-bracelets",
    field: "occasion",
    value: "everyday",
    title: "Everyday Natural Stone Bracelets in Kenya",
    eyebrow: "Discover by occasion / Everyday",
    description:
      "Shop everyday natural stone bracelets by Beads World Africa, handcrafted pieces designed to fit into your daily rhythm.",
    intro:
      "The pieces you reach for without thinking twice. Explore BWA’s everyday bracelet edit: natural stone, adaptable styling, and a comfortable rhythm for daily wear.",
  },
];

export function getSeoHub(slug: string) {
  return seoHubs.find((hub) => hub.slug === slug);
}

function taxonomyValues(product: CommerceProduct, field: string) {
  if (!(field in product)) return undefined;

  const value = product[field as keyof ProductTaxonomy];
  return Array.isArray(value) ? value : undefined;
}

export function productsForSeoHub(products: CommerceProduct[], hub: SeoHub) {
  return products.filter((product) =>
    taxonomyValues(product, hub.field)?.includes(hub.value),
  );
}

export function hubsForProduct(product: CommerceProduct) {
  return seoHubs.filter((hub) =>
    taxonomyValues(product, hub.field)?.includes(hub.value),
  );
}
