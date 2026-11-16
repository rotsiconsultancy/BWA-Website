export interface Product {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  price: number;
  currency: string;
  description: string;
  details: string[];
  images: string[];
  featured: boolean;
  in_stock: boolean;
  stock_count: number;

  // Taxonomy tags for 'Find Your Bracelet' Recommendation Engine
  energy_vibe: string[];
  intention: string[];
  stone_type: string[];
  color_palette: string[];
  style_tags: string[];
  wrist_fits: string[];
}

export const PRODUCTS: Product[] = [
  {
    id: "bwa-001",
    slug: "the-grounded",
    title: "THE GROUNDED",
    subtitle: "Black Onyx + Matte Lava Stone",
    price: 3800,
    currency: "KES",
    description:
      "Engineered for focus and daily stability. Hand-strung with high-grade matte black onyx and porous African lava stone, designed to absorb essential oils and provide tactile grounding throughout your day.",
    details: [
      "Natural 8mm Matte Black Onyx & Lava Beads",
      "Durable elastic silicone core",
      "Raw brass spacer bead with BWA emblem",
      "Handcrafted in Nairobi, Kenya",
    ],
    images: [
      "/images/hero-find-your-vibe.webp",
      "/images/wear-sth-that-story-section.webp",
    ],
    featured: true,
    in_stock: true,
    stock_count: 12,
    energy_vibe: ["grounding", "protection", "focus"],
    intention: ["inner_strength", "peace_mind"],
    stone_type: ["lava_stone"],
    color_palette: ["dark_monochrome"],
    style_tags: ["everyday_minimal", "raw_rugged"],
    wrist_fits: ["medium_18cm", "large_20cm", "adjustable"],
  },
  {
    id: "bwa-002",
    slug: "the-visionary",
    title: "THE VISIONARY",
    subtitle: "Golden Tiger Eye + Ebony Wood",
    price: 4200,
    currency: "KES",
    description:
      "A striking combination of shimmering golden Tiger Eye and carved African ebony wood. Tiger Eye is traditionally associated with courage, mental clarity, and unshakeable confidence.",
    details: [
      "8mm AAA Grade Golden Tiger Eye beads",
      "Reclaimed African Ebony wood spacers",
      "Brushed solid brass accents",
      "Hypoallergenic and sweat-resistant string",
    ],
    images: ["/images/hero-image.png"],
    featured: true,
    in_stock: true,
    stock_count: 8,
    energy_vibe: ["vitality", "focus", "clarity"],
    intention: ["wealth_abundance", "courage"],
    stone_type: ["tiger_eye"],
    color_palette: ["vibrant", "earth_tones"],
    style_tags: ["bold_statement", "stacked_layers"],
    wrist_fits: ["small_16cm", "medium_18cm", "adjustable"],
  },
  {
    id: "bwa-003",
    slug: "the-protector",
    title: "THE PROTECTOR",
    subtitle: "Turquoise + Hematite",
    price: 3950,
    currency: "KES",
    description:
      "Known as the stone of evolution and transformation. Turquoise brings encouragement for growth and positive change, balanced by heavy metallic hematite beads.",
    details: [
      "8mm Genuine Turquoise Jasper",
      "Polished metallic Hematite focus beads",
      "Double-bonded elastic stretch cord",
      "Includes BWA linen travel pouch",
    ],
    images: [
      "/images/hero-image-mountain-woman-wearing-beads-world-africa-bracelet.webp",
    ],
    featured: true,
    in_stock: true,
    stock_count: 5,
    energy_vibe: ["calm", "protection", "clarity"],
    intention: ["transformation", "inner_strength"],
    stone_type: ["turquoise"],
    color_palette: ["raw_natural", "deep_blue"],
    style_tags: ["everyday_minimal", "stacked_layers"],
    wrist_fits: ["small_16cm", "medium_18cm", "large_20cm"],
  },
  {
    id: "bwa-004",
    slug: "the-warrior",
    title: "THE WARRIOR",
    subtitle: "Red Jasper + Bronzite",
    price: 4500,
    currency: "KES",
    description:
      "Bold red jasper stones paired with metallic bronze sheen beads. Formulated to inspire physical stamina, passion, and grounded determination.",
    details: [
      "10mm Deep Red Jasper natural stones",
      "Solid cast brass African ring beads",
      "Heavy-duty elastic filament",
      "Handmade in Nairobi",
    ],
    images: [
      "/images/hero-image-mountain-man-wearing-beads-world-africa-bracelet.webp",
    ],
    featured: false,
    in_stock: true,
    stock_count: 15,
    energy_vibe: ["vitality", "grounding"],
    intention: ["courage", "inner_strength"],
    stone_type: ["red_jasper"],
    color_palette: ["earth_tones"],
    style_tags: ["bold_statement", "raw_rugged"],
    wrist_fits: ["medium_18cm", "large_20cm"],
  },
];
