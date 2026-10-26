"use client";
import Link from "next/link";
import { Minus, Plus, ShieldCheck, Truck } from "lucide-react";
import { useState } from "react";
import type { CommerceProduct } from "@/lib/commerce/types";
import { useCart } from "@/context/CartContext";
import { hubsForProduct } from "@/lib/commerce/seo-hubs";
import Money from "@/components/commerce/Money";
import { useCurrency } from "@/context/CurrencyContext";
import StoreImage from "@/components/commerce/StoreImage";
import FaqSection from "@/components/commerce/FaqSection";
import { shoppingFaqs } from "@/lib/commerce/faq";
import { trackMetaEvent } from "@/lib/marketing/meta-pixel";
import { productToGa4Item, trackGa4Event } from "@/lib/marketing/ga4";
import { useEffect, useRef } from "react";

export default function ProductDetail({
  product,
  related,
}: {
  product: CommerceProduct;
  related: CommerceProduct[];
}) {
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const [imageIndex, setImageIndex] = useState(0);
  const [variantId, setVariantId] = useState(
    product.variants.find((v) => v.available)?.id ?? "",
  );
  const [quantity, setQuantity] = useState(1);
  const variant =
    product.variants.find((v) => v.id === variantId) ?? product.variants[0];
  const prices = {
    KES: product.prices.KES + (variant.priceAdjustments.KES ?? 0),
    USD:
      product.prices.USD === null || variant.priceAdjustments.USD === null
        ? null
        : product.prices.USD + variant.priceAdjustments.USD,
  };
  const discoveryHubs = hubsForProduct(product).slice(0, 3);
  useEffect(() => {
    const price = prices[currency];
    if (price !== null)
      trackMetaEvent("ViewContent", {
        value: price,
        currency,
        content_ids: [product.id],
        contents: [{ id: product.id, item_price: price }],
      });
  }, [currency, product.id, prices.KES, prices.USD]);
  const viewedProduct = useRef<string | null>(null);
  useEffect(() => {
    // Once per product; a currency auto-switch or size change is not a new view.
    if (viewedProduct.current === product.id) return;
    viewedProduct.current = product.id;
    const price = prices[currency];
    trackGa4Event("view_item", {
      currency,
      value: price ?? undefined,
      items: [
        productToGa4Item(product, currency, {
          item_id: variant?.id ?? product.id,
          item_variant: variant?.name,
          price: price ?? undefined,
        }),
      ],
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);
  return (
    <main className="product-page">
      <div className="container product-breadcrumb">
        <Link href="/bracelets">Collection</Link>
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
                <StoreImage
                  src={image}
                  alt={`View ${index + 1} of ${product.title}`}
                  sizes="96px"
                  width={192}
                  height={192}
                />
              </button>
            ))}
          </div>
          <div className="product-main-image">
            <StoreImage
              src={product.images[imageIndex]}
              alt={`${product.title} natural stone bracelet`}
              sizes="(max-width: 900px) 100vw, 50vw"
              width={1200}
              height={1440}
              eager
            />
            <span>Zoom to inspect the stone</span>
          </div>
        </div>
        <aside className="product-buy-panel">
          <p className="eyebrow">{product.collection}</p>
          <h1>{product.title}</h1>
          <p className="product-descriptor">{product.descriptor}</p>
          <p className="product-price">
            <Money prices={prices} />
          </p>
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
              disabled={!variant.available || prices[currency] === null}
              onClick={() =>
                addToCart({
                  productId: product.id,
                  variantId: variant.id,
                  slug: product.slug,
                  title: product.title,
                  subtitle: product.subtitle,
                  image: product.images[0],
                  unitPrices: prices,
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
      {discoveryHubs.length > 0 && (
        <section className="container product-discovery-links">
          <p className="eyebrow">Explore this bracelet further</p>
          <div>
            {discoveryHubs.map((hub) => (
              <Link key={hub.slug} href={`/bracelets/${hub.slug}`}>
                {hub.title.replace(" in Kenya", "")}
              </Link>
            ))}
          </div>
        </section>
      )}
      <FaqSection items={shoppingFaqs} />
      <section className="container product-related">
        <div className="product-related-head">
          <div>
            <p className="eyebrow">Wear & stack</p>
            <h2>Other ways to wear your story.</h2>
          </div>
          <Link href="/bracelets">View the collection →</Link>
        </div>
        <div className="catalogue-grid catalogue-grid--three">
          {related.map((item) => (
            <Link
              key={item.id}
              href={`/product/${item.slug}`}
              className="catalogue-product-card"
            >
              <div className="catalogue-product-media">
                <StoreImage
                  src={item.images[0]}
                  alt={item.title}
                  sizes="(max-width: 760px) 50vw, 33vw"
                />
              </div>
              <div className="catalogue-product-copy">
                <p>{item.collection}</p>
                <h2>{item.title}</h2>
                <strong>
                  <Money prices={item.prices} />
                </strong>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
