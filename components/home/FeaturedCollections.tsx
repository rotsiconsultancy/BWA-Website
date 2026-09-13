import Link from "next/link";

const featuredProducts = [
  {
    id: "the-grounded",
    slug: "the-grounded",
    name: "The Grounded",
    meta: "Black Onyx · Lava Stone",
    price: "KES 4,500",
    image:
      "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  },
  {
    id: "the-bold",
    slug: "the-bold",
    name: "The Bold",
    meta: "Tiger's Eye · Onyx",
    price: "KES 4,200",
    image:
      "https://aurumbrothers.com/cdn/shop/files/square1-SodaliteBraceletVII_12mm_2.webp?v=1746155632&width=2048",
  },
  {
    id: "the-calm",
    slug: "the-calm",
    name: "The Calm",
    meta: "Howlite · Matte Agate",
    price: "KES 4,000",
    image:
      "https://www.artoftibet.com/cdn/shop/files/blue-tiger-eye-with-dragon-vein-stone-divider-radiance-bracelet-6377513.png?v=1776133778",
  },
  {
    id: "the-explorer",
    slug: "the-explorer",
    name: "The Explorer",
    meta: "African Turquoise · Lava Stone",
    price: "KES 4,800",
    image:
      "https://stonemart.co.in/_next/image?q=65&url=https%3A%2F%2Fstonemart-media.b76109dna.workers.dev%2Fproducts%2Fnatural-tiger-eye-bracelet-12mm-beads-stretchable-unisex-gemstone-bracelet-for-strength-confidence-protection%2Fimages%2Fae6e4ccd-3809-4730-9cbc-9cff5a6eec00.webp&w=3840",
  },
];

export default function FeaturedCollections() {
  return (
    <section className="section" id="shop">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="eyebrow">Featured collections</p>
            <h2>Popular Picks</h2>
          </div>
          <Link className="text-link" href="/shop">
            Shop all →
          </Link>
        </div>

        <div className="product-grid">
          {featuredProducts.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.slug}`}
              className="product-card"
            >
              <div className="product-image">
                <img src={p.image} alt={p.name} loading="lazy" />
              </div>
              <div className="product-info">
                <div className="product-name">{p.name}</div>
                <div className="product-meta">{p.meta}</div>
                <div className="product-price">
                  {p.price} <span className="product-arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
