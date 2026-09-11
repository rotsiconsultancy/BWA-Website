"use client";

import { useState } from "react";
import Link from "next/link";

const allProducts = [
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
    id: "the-explorer",
    slug: "the-explorer",
    name: "THE EXPLORER",
    feeling: "Rich · Expressive",
    materials: "African Turquoise · Lava Stone",
    price: "KES 4,800",
    filterGroup: "bold",
    image: "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  },
];

export default function ShopPage() {
  const [activeFilter, setActiveFilter] = useState("all");
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [sortBy, setSortBy] = useState("featured");

  const filtered = activeFilter === "all"
    ? allProducts
    : allProducts.filter((p) => p.filterGroup === activeFilter);

  return (
    <main>
      <section className="shop-intro container">
        <p className="eyebrow">The BWA Bracelet Collection</p>
        <h1>Find the one that feels like you.</h1>
        <div className="intro-row">
          <p className="intro-copy">
            Handmade natural-stone bracelets, designed around feeling, style and meaning. Explore the collection your way — or let us help you discover your match.
          </p>
          <div className="shop-count">
            {String(filtered.length).padStart(2, "0")} BRACELETS
          </div>
        </div>
      </section>

      <section className="container">
        <div className="collections-grid">
          <article className="collection-card" onClick={() => setActiveFilter("all")}>
            <img
              src="https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840"
              alt="Natural stone bracelet"
            />
            <div className="collection-content">
              <small>Explore the full collection</small>
              <h2>All Bracelets</h2>
              <p>Every story. Every feeling.</p>
            </div>
          </article>
          <article className="collection-card" onClick={() => setActiveFilter("dark")}>
            <img
              src="https://aurumbrothers.com/cdn/shop/files/square1-SodaliteBraceletVII_12mm_2.webp?v=1746155632&width=2048"
              alt="Dark natural stone bracelet"
            />
            <div className="collection-content">
              <small>Palette</small>
              <h2>Dark &amp; Deep</h2>
              <p>Quiet. Grounded. Strong.</p>
            </div>
          </article>
          <article className="collection-card" onClick={() => setActiveFilter("earth")}>
            <img
              src="https://www.artoftibet.com/cdn/shop/files/blue-tiger-eye-with-dragon-vein-stone-divider-radiance-bracelet-6377513.png?v=1776133778"
              alt="Earth-toned natural stone bracelet"
            />
            <div className="collection-content">
              <small>Palette</small>
              <h2>Earth &amp; Warm</h2>
              <p>Natural. Rich. Expressive.</p>
            </div>
          </article>
        </div>
      </section>

      <section className="container">
        <div className="shop-toolbar">
          <div className="toolbar-right">
            <button
              className="filter-toggle"
              onClick={() => setAdvancedOpen(!advancedOpen)}
            >
              Filters {advancedOpen ? "-" : "+"}
            </button>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="featured">Featured</option>
              <option value="low">Price: Low to high</option>
              <option value="high">Price: High to low</option>
              <option value="az">Name: A–Z</option>
            </select>
          </div>
          <div className="filter-scroll">
            <button
              className={`filter-btn ${activeFilter === "all" ? "active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              All
            </button>
            <button
              className={`filter-btn ${activeFilter === "dark" ? "active" : ""}`}
              onClick={() => setActiveFilter("dark")}
            >
              Dark &amp; Deep
            </button>
            <button
              className={`filter-btn ${activeFilter === "earth" ? "active" : ""}`}
              onClick={() => setActiveFilter("earth")}
            >
              Earth &amp; Warm
            </button>
            <button
              className={`filter-btn ${activeFilter === "clean" ? "active" : ""}`}
              onClick={() => setActiveFilter("clean")}
            >
              Clean &amp; Minimal
            </button>
            <button
              className={`filter-btn ${activeFilter === "bold" ? "active" : ""}`}
              onClick={() => setActiveFilter("bold")}
            >
              Rich &amp; Expressive
            </button>
          </div>
        </div>

        <div className={`advanced-filters ${advancedOpen ? "open" : ""}`}>
          <div>
            <h3>Style</h3>
            <label className="filter-option">
              <input type="checkbox" /> Quiet &amp; Grounded
            </label>
            <label className="filter-option">
              <input type="checkbox" /> Bold &amp; Confident
            </label>
            <label className="filter-option">
              <input type="checkbox" /> Clean &amp; Refined
            </label>
            <label className="filter-option">
              <input type="checkbox" /> Free &amp; Natural
            </label>
          </div>
          <div>
            <h3>Palette</h3>
            <label className="filter-option">
              <input type="checkbox" /> Dark &amp; Deep
            </label>
            <label className="filter-option">
              <input type="checkbox" /> Earth &amp; Warm
            </label>
            <label className="filter-option">
              <input type="checkbox" /> Light &amp; Neutral
            </label>
          </div>
          <div>
            <h3>Expression</h3>
            <label className="filter-option">
              <input type="checkbox" /> Grounding
            </label>
            <label className="filter-option">
              <input type="checkbox" /> Confidence
            </label>
            <label className="filter-option">
              <input type="checkbox" /> Balance
            </label>
            <label className="filter-option">
              <input type="checkbox" /> Individuality
            </label>
          </div>
          <div>
            <h3>Reset</h3>
            <button className="filter-btn" onClick={() => setActiveFilter("all")}>
              Clear all filters
            </button>
          </div>
        </div>

        <div className="product-grid" style={{ paddingTop: "32px", paddingBottom: "100px" }}>
          {filtered.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="product-card"
            >
              <div className="product-image">
                {product.badge && <span className="image-note">{product.badge}</span>}
                <img src={product.image} alt={product.name} />
              </div>
              <div className="product-info">
                <div className="eyebrow" style={{ fontSize: "9px", margin: 0 }}>
                  {product.feeling}
                </div>
                <div className="product-name">{product.name}</div>
                <div className="product-meta">{product.materials}</div>
                <div className="product-price">{product.price}</div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
