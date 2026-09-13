import Link from "next/link";
import { getStorefrontCatalogue } from "@/lib/commerce/catalogue-server";

export default async function FeaturedCollections() {
  const products = await getStorefrontCatalogue();
  const featuredProducts = (
    products.some((product) => product.featured || product.trending)
      ? products.filter((product) => product.featured || product.trending)
      : products
  ).slice(0, 4);
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
          {featuredProducts.map((product) => (
            <Link
              key={product.id}
              href={`/product/${product.slug}`}
              className="product-card"
            >
              <div className="product-image">
                <img
                  src={product.images[0]}
                  alt={product.title}
                  loading="lazy"
                />
              </div>
              <div className="product-info">
                <div className="product-name">{product.title}</div>
                <div className="product-meta">{product.subtitle}</div>
                <div className="product-price">
                  KES {product.price.toLocaleString()}{" "}
                  <span className="product-arrow">→</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
