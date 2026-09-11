export type Product = {
  id: string;
  slug: string;
  name: string;
  materials: string;
  price: number;
  collection: string;
  descriptor: string;
  story: string;
  palette: string;
  style: string;
  images: string[];
};
export const products: Product[] = [
  {
    id: "1",
    slug: "the-grounded",
    name: "THE GROUNDED",
    materials: "Black Onyx + Lava Stone",
    price: 3800,
    collection: "Dark & Deep",
    descriptor: "Understated. Natural. Quietly confident.",
    story:
      "A grounded combination of deep stone and tactile texture, made for everyday presence without noise.",
    palette: "dark",
    style: "quiet",
    images: [],
  },
  {
    id: "2",
    slug: "the-bold",
    name: "THE BOLD",
    materials: "Tiger Eye + Black Stone",
    price: 4200,
    collection: "Dark & Deep",
    descriptor: "Strong presence. Clear intent.",
    story:
      "Warm movement and dark contrast for the person who does not need to announce themselves.",
    palette: "earth",
    style: "bold",
    images: [],
  },
  {
    id: "3",
    slug: "the-calm",
    name: "THE CALM",
    materials: "Sodalite + Natural Stone",
    price: 3900,
    collection: "Light & Neutral",
    descriptor: "Balanced. Considered. Easy.",
    story:
      "A quieter palette designed for balance, clarity and effortless daily wear.",
    palette: "light",
    style: "clean",
    images: [],
  },
  {
    id: "4",
    slug: "the-explorer",
    name: "THE EXPLORER",
    materials: "Natural Stone + Lava Stone",
    price: 4100,
    collection: "Earth & Warm",
    descriptor: "Free. Organic. Always moving.",
    story:
      "Textured natural materials for a relaxed spirit and a life that keeps moving.",
    palette: "earth",
    style: "free",
    images: [],
  },
];

export const allShopProducts = [
  {
    id: "the-grounded",
    slug: "the-grounded",
    name: "THE GROUNDED",
    feeling: "Quiet · Grounded",
    materials: "Black Onyx · Lava Stone",
    price: "KES 4,500",
    filterGroup: "dark",
    image: "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
    badge: "Bestseller",
  },
  {
    id: "the-bold",
    slug: "the-bold",
    name: "THE BOLD",
    feeling: "Strong · Confident",
    materials: "Tiger's Eye · Onyx",
    price: "KES 4,200",
    filterGroup: "earth",
    image: "https://aurumbrothers.com/cdn/shop/files/square1-SodaliteBraceletVII_12mm_2.webp?v=1746155632&width=2048",
    badge: "Popular",
  },
  {
    id: "the-calm",
    slug: "the-calm",
    name: "THE CALM",
    feeling: "Clean · Minimal",
    materials: "Howlite · Matte Agate",
    price: "KES 4,000",
    filterGroup: "clean",
    image: "https://www.artoftibet.com/cdn/shop/files/blue-tiger-eye-with-dragon-vein-stone-divider-radiance-bracelet-6377513.png?v=1776133778",
  },
  {
    id: "the-explorer-1",
    slug: "the-explorer",
    name: "THE EXPLORER",
    feeling: "Rich · Expressive",
    materials: "African Turquoise · Lava Stone",
    price: "KES 4,800",
    filterGroup: "bold",
    image: "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  },
  {
    id: "the-explorer-2",
    slug: "the-explorer",
    name: "THE EXPLORER",
    feeling: "Rich · Expressive",
    materials: "African Turquoise · Lava Stone",
    price: "KES 4,800",
    filterGroup: "bold",
    image: "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  },{
    id: "the-explorer-4",
    slug: "the-explorer",
    name: "THE EXPLORER",
    feeling: "Rich · Expressive",
    materials: "African Turquoise · Lava Stone",
    price: "KES 4,800",
    filterGroup: "bold",
    image: "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  },{
    id: "the-explorer-5",
    slug: "the-explorer",
    name: "THE EXPLORER",
    feeling: "Rich · Expressive",
    materials: "African Turquoise · Lava Stone",
    price: "KES 4,800",
    filterGroup: "bold",
    image: "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  },{
    id: "the-explorer-6",
    slug: "the-explorer",
    name: "THE EXPLORER",
    feeling: "Rich · Expressive",
    materials: "African Turquoise · Lava Stone",
    price: "KES 4,800",
    filterGroup: "bold",
    image: "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  },
];


export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);
