/**
 * Utility functions for generating adaptive SEO-friendly URL slugs and
 * standardized luxury product & variant SKUs for Beads World Africa catalogue management.
 */

/**
 * Common filler/stop words to omit when building concise BWA SKUs.
 */
const STOP_WORDS = new Set([
  "a",
  "an",
  "the",
  "and",
  "or",
  "of",
  "in",
  "on",
  "for",
  "with",
  "by",
  "from",
  "bead",
  "beads",
  "bracelet",
  "bracelets",
  "collection",
  "natural",
  "stone",
  "stones",
]);

/**
 * Generates an SEO-friendly URL slug from a product title.
 * e.g., "The Grounded" -> "the-grounded"
 * e.g., "Royal Tiger's Eye — 10mm" -> "royal-tigers-eye-10mm"
 */
export function generateSlug(title: string): string {
  if (!title) return "";
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remove accents/diacritics
    .toLowerCase()
    .replace(/&/g, "and") // Convert '&' symbol to 'and'
    .replace(/[^a-z0-9\s-]/g, "") // Strip non-alphanumeric chars
    .trim()
    .replace(/[\s_]+/g, "-") // Replace spaces/underscores with hyphens
    .replace(/-+/g, "-") // Collapse duplicate hyphens
    .replace(/^-+|-+$/g, ""); // Strip leading and trailing hyphens
}

/**
 * Generates a standardized BWA Product SKU from a product title.
 * Follows the BWA naming convention: BWA-[3-5 LETTER CODE]
 * e.g., "The Grounded" -> "BWA-GRD"
 * e.g., "Royal Tiger Eye" -> "BWA-RTE"
 * e.g., "African Turquoise" -> "BWA-ATQ"
 * e.g., "Lava Stone" -> "BWA-LVS"
 */
export function generateProductSku(title: string): string {
  if (!title) return "";

  const cleanTitle = title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9\s]/g, " ")
    .trim();

  const words = cleanTitle.split(/\s+/).filter((w) => w.length > 0);
  if (words.length === 0) return "BWA-ITEM";

  const significantWords = words.filter(
    (w) => !STOP_WORDS.has(w.toLowerCase()),
  );
  const targetWords = significantWords.length > 0 ? significantWords : words;

  let code = "";

  if (targetWords.length === 1) {
    const word = targetWords[0].toUpperCase();
    if (word.length <= 4) {
      code = word;
    } else {
      // Keep initial letter, then strip vowels to form consonant code
      const consonants = (word[0] + word.slice(1).replace(/[AEIOU]/g, "")).slice(
        0,
        3,
      );
      code = consonants.length >= 3 ? consonants : word.slice(0, 3);
    }
  } else if (targetWords.length === 2) {
    const w1 = targetWords[0].toUpperCase();
    const w2 = targetWords[1].toUpperCase();

    // Custom overrides for common BWA stone pairings
    if (w1.startsWith("AFRICAN") && w2.startsWith("TURQUOISE")) {
      code = "ATQ";
    } else if (w1.startsWith("TIGER") && w2.startsWith("EYE")) {
      code = "TGE";
    } else {
      const c1 = w1[0] + w1.slice(1).replace(/[AEIOU]/g, "");
      const c2 = w2[0] + w2.slice(1).replace(/[AEIOU]/g, "");
      code = (c1.slice(0, 2) + c2.slice(0, 1)).slice(0, 3);
      if (code.length < 3) {
        code = (w1.slice(0, 2) + w2.slice(0, 2)).slice(0, 4);
      }
    }
  } else {
    // 3+ words: Take first letter of up to 4 significant words
    code = targetWords
      .slice(0, 4)
      .map((w) => w[0].toUpperCase())
      .join("");
  }

  return `BWA-${code}`;
}

/**
 * Generates a Variant SKU by appending a size/variant identifier code to the Product SKU.
 * e.g., ("BWA-GRD", "M / 18 cm") -> "BWA-GRD-M"
 * e.g., ("BWA-RTE", "Small") -> "BWA-RTE-S"
 * e.g., ("BWA-LVS", "Large / 20cm") -> "BWA-LVS-L"
 */
export function generateVariantSku(
  productSku: string,
  variantTitle: string,
): string {
  const baseSku = productSku.trim().toUpperCase() || "BWA-ITEM";
  if (!variantTitle || !variantTitle.trim()) return baseSku;

  const titleLower = variantTitle.toLowerCase();
  let variantCode = "";

  if (titleLower.includes("small") || /\b16\s*cm\b/.test(titleLower) || titleLower === "s") {
    variantCode = "S";
  } else if (
    titleLower.includes("medium") ||
    /\b18\s*cm\b/.test(titleLower) ||
    titleLower === "m"
  ) {
    variantCode = "M";
  } else if (
    titleLower.includes("large") ||
    /\b20\s*cm\b/.test(titleLower) ||
    titleLower === "l"
  ) {
    variantCode = "L";
  } else if (titleLower.includes("xl") || /\b22\s*cm\b/.test(titleLower)) {
    variantCode = "XL";
  } else if (titleLower.includes("adjust")) {
    variantCode = "ADJ";
  } else {
    const matches = variantTitle.match(/[a-zA-Z0-9]+/g);
    if (matches) {
      variantCode = matches.join("-").toUpperCase().slice(0, 6);
    }
  }

  return variantCode ? `${baseSku}-${variantCode}` : baseSku;
}
