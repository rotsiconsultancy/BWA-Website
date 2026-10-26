// Fixed so the Journal filter stays tidy; add a category here before using it.
export const JOURNAL_CATEGORIES = [
  "Stone guides",
  "Gift guides",
  "Style",
  "Care & sizing",
  "Behind the craft",
] as const;

export type JournalCategory = (typeof JOURNAL_CATEGORIES)[number];

export function categorySlug(category: string) {
  return category
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}
