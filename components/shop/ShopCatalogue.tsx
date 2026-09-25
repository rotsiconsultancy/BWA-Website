"use client";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Search, SlidersHorizontal } from "lucide-react";
import type { CommerceProduct } from "@/lib/commerce/types";
import Money from "@/components/commerce/Money";
import { useCurrency } from "@/context/CurrencyContext";
export default function ShopCatalogue({
  catalogue,
}: {
  catalogue: CommerceProduct[];
}) {
  const [filter, setFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("featured");
  const { currency } = useCurrency();
  const products = useMemo(
    () =>
      catalogue
        .filter(
          (p) =>
            (filter === "all" || p.color_palette.includes(filter)) &&
            [
              p.title,
              p.subtitle,
              p.collection,
              ...p.stone_type,
              ...p.stone_type.map((s) => s.replaceAll("_", " ")),
              ...p.color_palette,
            ]
              .join(" ")
              .toLowerCase()
              .includes(query.toLowerCase()),
        )
        .sort((a, b) =>
          sort === "low"
            ? (a.prices[currency] ?? Number.POSITIVE_INFINITY) -
              (b.prices[currency] ?? Number.POSITIVE_INFINITY)
            : sort === "high"
              ? (b.prices[currency] ?? Number.NEGATIVE_INFINITY) -
                (a.prices[currency] ?? Number.NEGATIVE_INFINITY)
              : Number(b.featured) - Number(a.featured),
        ),
    [catalogue, filter, query, sort, currency],
  );
  return (
    <main className="catalogue-page">
      <section className="catalogue-masthead">
        <div className="container">
          <p className="eyebrow">BWA / Current collection</p>
          <div className="catalogue-masthead-row">
            <h1>Bracelets that hold their own.</h1>
            <p>
              Natural stone, considered composition, and a point of view you can
              wear daily.
            </p>
          </div>
        </div>
      </section>
      <section className="catalogue-controls">
        <div className="container">
          <div className="catalogue-filter-row">
            {[
              ["all", "All pieces"],
              ["dark_monochrome", "Dark & Deep"],
              ["earth_tones", "Earth & Warm"],
              ["deep_blue", "Blue & Clear"],
              ["raw_natural", "Raw & Natural"],
            ].map(([value, label]) => (
              <button
                key={value}
                onClick={() => setFilter(value)}
                className={filter === value ? "is-active" : ""}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="catalogue-search-row">
            <label>
              <Search size={17} />
              <span className="sr-only">Search bracelets</span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search stone, colour, or collection"
              />
            </label>
            <label className="catalogue-sort">
              <SlidersHorizontal size={16} />
              <span>Sort</span>
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="featured">Featured</option>
                <option value="low">Price: low to high</option>
                <option value="high">Price: high to low</option>
              </select>
            </label>
          </div>
        </div>
      </section>
      <section className="container catalogue-grid-section">
        <div className="catalogue-grid-meta">
          <span>{String(products.length).padStart(2, "0")} pieces</span>
          <Link href="/find-your-bracelet">
            Not sure? Find yours <span>→</span>
          </Link>
        </div>
        <div className="catalogue-grid">
          {products.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="catalogue-product-card"
            >
              <div className="catalogue-product-media">
                <img src={p.images[0]} alt={`${p.title} bracelet`} />
                {p.trending && <span>In focus</span>}
              </div>
              <div className="catalogue-product-copy">
                <p>{p.collection}</p>
                <h2>{p.title}</h2>
                <span>{p.subtitle}</span>
                <strong>
                  <Money prices={p.prices} />
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
