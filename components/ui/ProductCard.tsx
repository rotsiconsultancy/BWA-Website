import Link from "next/link";
import { Product } from "@/data/products";
export default function ProductCard({ product }: { product: Product }) {
  return (
    <Link href={`/product/${product.slug}`}>
      <div className="card-img">
        <div className="ring" />
      </div>
      <div className="smallcaps muted" style={{ marginTop: 12 }}>
        {product.collection}
      </div>
      <div className="display" style={{ fontSize: 25, marginTop: 4 }}>
        {product.name}
      </div>
      <div className="muted" style={{ fontSize: 11 }}>
        {product.materials}
      </div>
      <div className="price">KES {product.price.toLocaleString()}</div>
    </Link>
  );
}
