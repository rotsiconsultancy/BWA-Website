import type { FaqItem } from "@/lib/commerce/faq";
import { shoppingFaqs } from "@/lib/commerce/faq";
import type { CommerceProduct } from "@/lib/commerce/types";

// Landing page for "men's stone bracelets Kenya" and close searches
// (/bracelets/mens-stone-bracelets). Stone notes describe how each stone
// looks; meanings stay "traditionally associated with", never stated as fact.

export const MENS_PAGE_PATH = "/bracelets/mens-stone-bracelets";
export const MENS_PAGE_TITLE = "Men's Stone Bracelets in Kenya";
export const MENS_PAGE_DESCRIPTION =
  "Handmade natural stone bracelets for men in Kenya: tiger eye, lava stone, onyx and hematite. Order online, confirm on WhatsApp, delivered in Nairobi and across Kenya.";

export type MensStone = {
  name: string;
  /** Product to link to; the card is hidden when it is not in the catalogue. */
  productSlug: string;
  look: string;
  tradition: string;
};

export const mensStones: MensStone[] = [
  {
    name: "Tiger Eye",
    productSlug: "mara-dusk-red-tigers-eye-stone-bracelet",
    look: "Banded stone whose stripes catch and shift in the light.",
    tradition: "Traditionally associated with focus and confidence.",
  },
  {
    name: "Lava Stone",
    productSlug: "longonot-black-lava-stone-bracelet",
    look: "Matte, porous volcanic rock with a rough, textured surface.",
    tradition: "Traditionally associated with grounding.",
  },
  {
    name: "Black Onyx",
    productSlug: "usiku-black-onyx-stone-chip-bracelet",
    look: "Solid black stone that pairs with any watch or outfit.",
    tradition: "Traditionally associated with strength and protection.",
  },
  {
    name: "Hematite",
    productSlug: "chuma-facet-hematite-stone-bracelet",
    look: "Dark, metallic-looking stone with a steel-grey sheen.",
    tradition: "Traditionally associated with grounding and balance.",
  },
  {
    name: "Snowflake Obsidian",
    productSlug: "nelion-snow-snowflake-obsidian-stone-bracelet",
    look: "Black volcanic glass scattered with grey-white flecks.",
    tradition: "Said to support calm and clear thinking.",
  },
  {
    name: "Howlite",
    productSlug: "ukungu-grey-howlite-stone-bracelet",
    look: "Soft grey stone with fine darker veins.",
    tradition: "Traditionally associated with calm.",
  },
];

export function productsForMen(products: CommerceProduct[]) {
  return products.filter((product) =>
    product.recipient?.includes("gift_for_man"),
  );
}

// The shop question names a stockist; this page leaves stockists out.
export const mensFaqs: FaqItem[] = [
  {
    question: "What is the difference between tiger eye, lava stone and onyx?",
    answer:
      "It comes down to look and feel. Tiger eye has gold-brown or red-brown bands that shift as you move. Lava stone is matte, porous volcanic rock with a rough texture. Onyx is a solid black stone. All three are worn alone or stacked together.",
  },
  ...shoppingFaqs.filter((item) => item.link?.href !== "/stockists"),
];
