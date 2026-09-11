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
export const getProduct = (slug: string) =>
  products.find((p) => p.slug === slug);
