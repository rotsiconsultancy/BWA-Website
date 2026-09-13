import Link from "next/link";
import type { CommerceProduct } from "@/lib/commerce/types";
import Money from "@/components/commerce/Money";

export default function SeoProductGrid({
  products,
}: {
  products: CommerceProduct[];
}) {
  return (
    <div className="catalogue-grid">
      {products.map((product) => (
        <Link
          key={product.id}
          href={`/product/${product.slug}`}
          className="catalogue-product-card"
        >
          <div className="catalogue-product-media">
            <img
              src={product.images[0]}
              alt={`${product.title} natural stone bracelet`}
            />
            {product.trending && <span>In focus</span>}
          </div>
          <div className="catalogue-product-copy">
            <p>{product.collection}</p>
            <h2>{product.title}</h2>
            <span>{product.subtitle}</span>
            <strong>
              <Money prices={product.prices} />
            </strong>
          </div>
        </Link>
      ))}
    </div>
  );
}
