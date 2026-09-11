"use client";
import { useState } from "react";
import ShopHero from "@/components/shop/ShopHero";
import ProductCard from "@/components/ui/ProductCard";
import { products } from "@/data/products";
import { collections } from "@/data/collections";
export default function Shop() {
  const [filter, setFilter] = useState("All Bracelets");
  const visible =
    filter === "All Bracelets"
      ? products
      : products.filter((p) => p.collection === filter);
  return (
    <>
      <ShopHero />
      <main className="section">
        <div className="container">
          <div className="filters">
            {collections.map((c) => (
              <button
                key={c}
                className={"filter " + (filter === c ? "active" : "")}
                onClick={() => setFilter(c)}
              >
                {c}
              </button>
            ))}
          </div>
          <div className="grid4">
            {visible.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </main>
    </>
  );
}
