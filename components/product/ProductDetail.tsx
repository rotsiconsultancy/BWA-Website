"use client";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import type { CommerceProduct } from "@/lib/commerce/types";
import { useCart } from "@/context/CartContext";

export default function ProductDetail({
  product,
  related,
}: {
  product: CommerceProduct;
  related: CommerceProduct[];
}) {
  const { addToCart } = useCart();
  const [imageIndex, setImageIndex] = useState(0);
  const [variantId, setVariantId] = useState(
    product.variants.find((v) => v.available)?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const price = product.price + variant.priceAdjustment;
  return (
    <main className="product-page">
      <div className="container product-breadcrumb">
        <Link href="/shop">Collection</Link>
        <span>/</span>
        <span>{product.title}</span>
      </div>
      <section className="container product-layout">
        <div className="product-gallery">
          <div className="product-thumbnails">
            {product.images.map((image, index) => (
              <button
                key={image}
                onClick={() => setImageIndex(index)}
                className={imageIndex === index ? "is-active" : ""}
              >
                <img
                  src={image}
                  alt={`View ${index + 1} of ${product.title}`}
                />
              </button>
            ))}
          </div>
          <div className="product-main-image">
            <img
              src={product.images[imageIndex]}
              alt={`${product.title} natural stone bracelet`}
            />
            <span>Zoom to inspect the stone</span>
          </div>
        </div>
        <aside className="product-buy-panel">
          <p className="eyebrow">{product.collection}</p>
          <h1>{product.title}</h1>
          <p className="product-descriptor">{product.descriptor}</p>
          <p className="product-price">KES {price.toLocaleString()}</p>
          <p className="product-story">{product.story}</p>
          <div className="product-rule" />
          <fieldset>
            <legend>Choose your fit</legend>
            <div className="variant-list">
              {product.variants.map((item) => (
                <button
                  key={item.id}
                  disabled={!item.available}
                  onClick={() => setVariantId(item.id)}
                  className={variantId === item.id ? "is-selected" : ""}
                >
                  {item.name}
                  <small>
                    {item.available
                      ? item.stock <= 3
                        ? `Only ${item.stock} remaining`
                        : "Available"
                      : "Sold out"}
                  </small>
                </button>
              ))}
            </div>
          </fieldset>
          <div className="product-order-row">
            <div className="product-quantity">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                aria-label="Reduce quantity"
              >
                <Minus size={16} />
              </button>
              <span>{quantity}</span>
              <button
                onClick={() =>
                  setQuantity(Math.min(variant.stock, quantity + 1))
                }
                aria-label="Increase quantity"
              >
                <Plus size={16} />
              </button>
            </div>
            <button
              className="btn btn-primary"
              disabled={!variant.available}
              onClick={() =>
                addToCart({
                  productId: product.id,
                  variantId: variant.id,
                  slug: product.slug,
                  title: product.title,
                  subtitle: product.subtitle,
                  image: product.images[0],
                  unitPrice: price,
                  variantName: variant.name,
                  quantity,
                })
              }
            >
              Add to bag
            </button>
          </div>
          <div className="product-assurances">
            <span>
              <ShieldCheck size={17} /> Handmade in Africa
            </span>
            <span>
              <Truck size={17} /> Delivery confirmed with you
            </span>
          </div>
        </aside>
      </section>
      <section className="product-editorial">
        <div className="container product-editorial-grid">
          <div>
            <p className="eyebrow">The material story</p>
            <h2>Made to become part of your rhythm.</h2>
          </div>
          <div>
            <p>{product.story}</p>
            <ul>
              {product.details.map((detail) => (
                <li key={detail}>{detail}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <section className="container product-related">
        <div className="product-related-head">
          <div>
            <p className="eyebrow">Wear & stack</p>
            <h2>Other ways to wear your story.</h2>
          </div>
          <Link href="/shop">View the collection →</Link>
        </div>
        <div className="catalogue-grid catalogue-grid--three">
          {related.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              className="catalogue-product-card"
            >
              <div className="catalogue-product-media">
                <img src={item.images[0]} alt={item.title} />
              </div>
              <div className="catalogue-product-copy">
                <p>{item.collection}</p>
                <h2>{item.title}</h2>
                <strong>KES {item.price.toLocaleString()}</strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
