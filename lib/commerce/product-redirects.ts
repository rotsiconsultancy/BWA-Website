/**
 * Old product addresses that moved, mapped to the current slug.
 *
 * The product page checks this list only when a slug is not in the catalogue,
 * so a rename works whichever goes live first: the database change or this file.
 * Never remove an entry: old links live on in Google, Instagram and WhatsApp.
 */
export const PRODUCT_REDIRECTS: Record<string, string> = {
  // 2026-10-28: the new stone bracelets gained "stone" in their address.
  "watamu-deep-lapis-lazuli-bracelet": "watamu-deep-lapis-lazuli-stone-bracelet",
  "simba-gold-tigers-eye-bracelet": "simba-gold-tigers-eye-stone-bracelet",
  "aberdare-pine-fancy-jasper-bracelet": "aberdare-pine-fancy-jasper-stone-bracelet",
  "anga-blue-sodalite-bracelet": "anga-blue-sodalite-stone-bracelet",
  "bogoria-blush-pink-opal-bracelet": "bogoria-blush-pink-opal-stone-bracelet",
  "chalbi-map-picture-jasper-bracelet": "chalbi-map-picture-jasper-stone-bracelet",
  "chuma-link-hematite-bracelet": "chuma-link-hematite-stone-bracelet",
  "diani-denim-sodalite-bracelet": "diani-denim-sodalite-stone-bracelet",
  "kerio-earth-fancy-jasper-bracelet": "kerio-earth-fancy-jasper-stone-bracelet",
  "kirinyaga-cloud-white-howlite-bracelet": "kirinyaga-cloud-white-howlite-stone-bracelet",
  "lenana-crackle-howlite-bracelet": "lenana-crackle-howlite-stone-bracelet",
  "magadi-dust-pink-zebra-jasper-bracelet": "magadi-dust-pink-zebra-jasper-stone-bracelet",
  "malindi-sunset-carnelian-agate-bracelet": "malindi-sunset-carnelian-agate-stone-bracelet",
  "mau-evergreen-moss-agate-bracelet": "mau-evergreen-moss-agate-stone-bracelet",
  "mvua-slate-picasso-jasper-bracelet": "mvua-slate-picasso-jasper-stone-bracelet",
  "njorowa-ember-mahogany-obsidian-bracelet": "njorowa-ember-mahogany-obsidian-stone-bracelet",
  "pwani-sand-unakite-bracelet": "pwani-sand-unakite-stone-bracelet",
  "rose-murram-rhodonite-bracelet": "rose-murram-rhodonite-stone-bracelet",
  "samburu-map-picture-jasper-bracelet": "samburu-map-picture-jasper-stone-bracelet",
  "tsavo-clay-red-jasper-bracelet": "tsavo-clay-red-jasper-stone-bracelet",
  "waridi-shadow-rhodonite-bracelet": "waridi-shadow-rhodonite-stone-bracelet",

  // 2026-10-28: older stone bracelets renamed onto the same pattern.
  "black-lava-stone-bracelet": "longonot-black-lava-stone-bracelet",
  "black-onyx-chipped": "usiku-black-onyx-stone-chip-bracelet",
  "clear-quartz-bracelet": "maji-clear-quartz-stone-bracelet",
  "cracked-quartz-bracelet": "barafu-crackle-quartz-stone-bracelet",
  "dalmatian-jasper-bracelet": "chui-spots-dalmatian-jasper-stone-chip-bracelet",
  "grey-howlite-calm-bracelet": "ukungu-grey-howlite-stone-bracelet",
  "mahogany-obsidian-bracelet": "kahawa-ember-mahogany-obsidian-stone-bracelet",
  "malachite-bracelet": "msitu-malachite-stone-bracelet",
  "matrix-jasper-bracelet": "utando-matrix-jasper-stone-bracelet",
  "plain-diagonal-hermatitie": "chuma-facet-hematite-stone-bracelet",
  "red-tiger-eye-bracelet": "mara-dusk-red-tigers-eye-stone-bracelet",
  "snowflake-obsidian-bracelet-800": "nelion-snow-snowflake-obsidian-stone-bracelet",
  "snowflake-obsidian-chipped-bracelet": "kinangop-frost-snowflake-obsidian-stone-chip-bracelet",
  "white-howlite-bracelet": "batian-white-howlite-stone-bracelet",
  "white-chipped-howlite-bracelet": "sirimon-white-howlite-stone-chip-bracelet",
  "savannah-mosaic-bracelet": "savannah-mosaic-unakite-stone-chip-bracelet",
  "blue-goldstone-bracelet": "kimondo-blue-goldstone-chip-bracelet",
};

/** True when a catalogue slug is `wanted`, or an old address that now moves to it. */
export function isProductSlug(catalogueSlug: string, wanted: string): boolean {
  return catalogueSlug === wanted || PRODUCT_REDIRECTS[catalogueSlug] === wanted;
}
