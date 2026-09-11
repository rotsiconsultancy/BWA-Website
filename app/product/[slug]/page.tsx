"use client";

import { useState } from "react";
import Link from "next/link";

const galleryImages = [
  "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  "https://www.artoftibet.com/cdn/shop/files/blue-tiger-eye-with-dragon-vein-stone-divider-radiance-bracelet-6377513.png?v=1776133778",
  "https://aurumbrothers.com/cdn/shop/files/square1-SodaliteBraceletVII_12mm_2.webp?v=1746155632&width=2048",
  "https://www.artoftibet.com/cdn/shop/files/blue-tiger-eye-with-dragon-vein-stone-divider-radiance-bracelet-6377513.png?v=1776133778",
  "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
];

export default function ProductDetailPage() {
  const [selectedImg, setSelectedImg] = useState(galleryImages[0]);
  const [selectedSize, setSelectedSize] = useState("M / 18cm");
  const [qty, setQty] = useState(1);

  return (
    <main>
      <div className="container breadcrumb">
        Shop <span>/</span> Bracelets <span>/</span> The Grounded
      </div>

      <section className="container product-detail-layout">
        <div className="gallery-layout">
          <div className="gallery-thumbs">
            {galleryImages.map((img, i) => (
              <button
                key={i}
                className={`gallery-thumb ${selectedImg === img ? "active" : ""}`}
                onClick={() => setSelectedImg(img)}
              >
                <img src={img} alt={`Thumbnail ${i + 1}`} />
              </button>
            ))}
          </div>
          <div className="main-image-wrap">
            <img src={selectedImg} alt="The Grounded natural stone bracelet" />
            <span className="image-note">Natural stones · Handmade</span>
          </div>
        </div>

        <aside className="details-sidebar">
          <p className="eyebrow">BWA Signature</p>
          <h1>
            THE
            <br />
            GROUNDED
          </h1>
          <p className="product-tagline">Understated. Natural. Quietly confident.</p>
          <div className="product-price">KES 4,500</div>
          <p className="product-intro-copy">
            For the person who doesn't need to make a lot of noise. The Grounded pairs the depth of Black Onyx with the raw texture of Lava Stone for a bracelet that feels calm, considered and unmistakably itself.
          </p>

          <div className="divider-line"></div>
          <p className="eyebrow">Bracelet size</p>
          <div className="size-pill-row">
            {["S / 16cm", "M / 18cm", "L / 20cm"].map((size) => (
              <button
                key={size}
                className={`size-pill ${selectedSize === size ? "active" : ""}`}
                onClick={() => setSelectedSize(size)}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="qty-add-grid">
            <div className="qty-box">
              <button onClick={() => setQty(Math.max(1, qty - 1))}>-</button>
              <span>{qty}</span>
              <button onClick={() => setQty(qty + 1)}>+</button>
            </div>
            <button className="btn add-btn" onClick={() => alert("Added to bag!")}>
              ADD TO BAG
            </button>
          </div>
          <p style={{ textAlign: "center", fontSize: "10px", color: "var(--neutral)", marginTop: "11px" }}>
            Handmade in Africa · 3–5 business days delivery
          </p>
        </aside>
      </section>

      <section className="story-band" style={{ background: "var(--charcoal)", color: "var(--ivory)", padding: "82px 0" }}>
        <div className="container story-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "80px", alignItems: "center" }}>
          <div>
            <div className="eyebrow" style={{ color: "#aaa49a" }}>THE INSPIRATION</div>
            <h2 style={{ fontSize: "clamp(42px,5vw,62px)", margin: "12px 0 22px", fontFamily: "Cormorant Garamond, serif" }}>
              Made to feel grounded in who you are.
            </h2>
            <p style={{ fontSize: "14px", lineHeight: "1.8", color: "#c8c2b8" }}>
              Every natural stone bead carries subtle color variations and organic weight. Black Onyx is known for quiet strength, while porous Lava Stone offers raw tactile contrast.
            </p>
          </div>
          <div style={{ border: "1px solid #3b3934", padding: "30px" }}>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "31px", margin: "0 0 18px" }}>
              Crafted by Hand
            </h3>
            <p style={{ fontSize: "12px", lineHeight: "1.8", color: "#b5afa5" }}>
              Assembled with durable stretch cord designed for daily comfort and long-lasting strength.
            </p>
          </div>
        </div>
      </section>

      <section className="container materials-section">
        <p className="eyebrow">MATERIALS &amp; CRAFT</p>
        <h2 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "48px", margin: "10px 0 38px" }}>
          What makes it special.
        </h2>
        <div className="material-grid">
          <div className="material-card">
            <span className="eyebrow">01</span>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "25px 0 7px" }}>
              Black Onyx
            </h3>
            <p style={{ fontSize: "12px", color: "var(--neutral)" }}>
              Smooth, deep black finish that provides a sleek, timeless weight.
            </p>
          </div>
          <div className="material-card">
            <span className="eyebrow">02</span>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "25px 0 7px" }}>
              Lava Stone
            </h3>
            <p style={{ fontSize: "12px", color: "var(--neutral)" }}>
              Porous volcanic rock offering rich tactile texture and natural grounding energy.
            </p>
          </div>
          <div className="material-card">
            <span className="eyebrow">03</span>
            <h3 style={{ fontFamily: "Cormorant Garamond, serif", fontSize: "28px", margin: "25px 0 7px" }}>
              Stretch Core
            </h3>
            <p style={{ fontSize: "12px", color: "var(--neutral)" }}>
              Heavy-duty elastomeric cord engineered for effortless daily wear.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
