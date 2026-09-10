import { notFound } from "next/navigation";
import { getProduct } from "@/data/products";
import ProductGallery from "@/components/product/ProductGallery";
import AddToCart from "@/components/commerce/AddToCart";
export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = getProduct(slug);
  if (!product) return notFound();
  return (
    <main className="container product-layout">
      <ProductGallery />
      <div className="product-info">
        <div className="eyebrow">{product.collection}</div>
        <h1 className="display">{product.name}</h1>
        <div className="muted">{product.descriptor}</div>
        <div className="product-price">
          KES {product.price.toLocaleString()}
        </div>
        <p className="product-copy">{product.story}</p>
        <select className="select">
          <option>Choose size</option>
          <option>Standard</option>
          <option>Large</option>
        </select>
        <AddToCart />
        <div className="info-block">
          <h3>Materials</h3>
          <p>{product.materials}</p>
        </div>
        <div className="info-block">
          <h3>Why it feels like you</h3>
          <p>
            Designed around identity, texture and everyday versatility — a piece
            with presence that never needs to shout.
          </p>
        </div>
        <div className="info-block">
          <h3>Delivery & care</h3>
          <p>
            Carefully packed and prepared for delivery. Keep natural stone dry
            when possible and store away from direct impact.
          </p>
        </div>
      </div>
    </main>
  );
}
