import { products, Product } from "@/data/products";
export function recommend(answers: Record<string, string>): Product {
  const a = Object.values(answers).join(" ").toLowerCase();
  if (a.includes("bold") || a.includes("confidence")) return products[1];
  if (a.includes("clean") || a.includes("balance")) return products[2];
  if (a.includes("free") || a.includes("natural") || a.includes("earth"))
    return products[3];
  return products[0];
}
