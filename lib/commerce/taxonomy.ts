export type TaxonomyOption = {
  value: string;
  label: string;
};

export type TaxonomyGroup = {
  name: string;
  label: string;
  required?: boolean;
  options: TaxonomyOption[];
};

export const TAXONOMIES: TaxonomyGroup[] = [
  {
    name: "energy_vibe",
    label: "Energy",
    required: true,
    options: [
      { value: "grounding", label: "Grounding" },
      { value: "protection", label: "Protection" },
      { value: "vitality", label: "Vitality" },
      { value: "focus", label: "Focus" },
      { value: "calm", label: "Calm" },
      { value: "clarity", label: "Clarity" },
    ],
  },
  {
    name: "intention",
    label: "Intention",
    options: [
      { value: "inner_strength", label: "Inner strength" },
      { value: "wealth_abundance", label: "Wealth & abundance" },
      { value: "peace_mind", label: "Peace of mind" },
      { value: "courage", label: "Courage" },
      { value: "transformation", label: "Transformation" },
    ],
  },
  {
    name: "stone_type",
    label: "Stones",
    required: true,
    options: [
      { value: "tiger_eye", label: "Tiger Eye" },
      { value: "lava_stone", label: "Lava Stone" },
      { value: "ukalite", label: "Ukalite" },
      { value: "matte_onyx", label: "Matte Onyx" },
      { value: "lapis_lazuli", label: "Lapis Lazuli" },
      { value: "turquoise", label: "Turquoise" },
      { value: "red_jasper", label: "Red Jasper" },
      { value: "hematite", label: "Hematite" },
      { value: "non_stone", label: "Non-stone / Other material" },
    ],
  },
  {
    name: "color_palette",
    label: "Palette",
    options: [
      { value: "earth_tones", label: "Earth tones" },
      { value: "dark_monochrome", label: "Dark monochrome" },
      { value: "vibrant_gold", label: "Vibrant gold" },
      { value: "deep_blue", label: "Deep blue" },
      { value: "raw_natural", label: "Raw natural" },
    ],
  },
  {
    name: "style_tags",
    label: "Style",
    required: true,
    options: [
      { value: "everyday_minimal", label: "Everyday minimal" },
      { value: "bold_statement", label: "Bold statement" },
      { value: "stacked_layers", label: "Stacked layers" },
      { value: "raw_rugged", label: "Raw & rugged" },
    ],
  },
  {
    name: "wrist_fits",
    label: "Fits",
    required: true,
    options: [
      { value: "small_16cm", label: "Small · 16 cm" },
      { value: "medium_18cm", label: "Medium · 18 cm" },
      { value: "large_20cm", label: "Large · 20 cm" },
      { value: "adjustable", label: "Adjustable" },
    ],
  },
  {
    name: "occasion",
    label: "Occasion",
    options: [
      { value: "everyday", label: "Everyday" },
      { value: "work", label: "Work" },
      { value: "weekend", label: "Weekend" },
      { value: "evening", label: "Evening" },
      { value: "gifting", label: "Gifting" },
    ],
  },
  {
    name: "recipient",
    label: "For whom",
    options: [
      { value: "self", label: "For self" },
      { value: "gift_for_woman", label: "Gift for her" },
      { value: "gift_for_man", label: "Gift for him" },
    ],
  },
];

/**
 * Format a raw tag string into a title-cased fallback label
 * e.g., "matte_onyx" -> "Matte Onyx"
 */
export function formatTagFallback(value: string): string {
  if (!value) return "";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

/**
 * Get human-readable label for a taxonomy value.
 * Gracefully falls back to formatted value if tag is removed or unrecognized.
 */
export function getTaxonomyLabel(taxonomyName: string, value: string): string {
  const group = TAXONOMIES.find((g) => g.name === taxonomyName);
  const match = group?.options.find((o) => o.value === value);
  return match ? match.label : formatTagFallback(value);
}

/**
 * Formats tag picker groups into [value, label] tuple options for admin forms
 */
export type TagGroup = {
  name: string;
  label: string;
  required?: boolean;
  options: [string, string][];
};

export const groups: TagGroup[] = TAXONOMIES.map((group) => ({
  name: group.name,
  label: group.label,
  required: group.required,
  options: group.options.map((o) => [o.value, o.label]),
}));

/**
 * Dynamic product match tokens for Discovery quiz administration
 */
export const productMatches: [string, string][] = TAXONOMIES.flatMap((group) =>
  group.options.map(
    (option) =>
      [`${group.name}:${option.value}`, `${group.label}: ${option.label}`] as [
        string,
        string,
      ],
  ),
);

export function humanMatch(field: string, value: string): string {
  return getTaxonomyLabel(field, value);
}
