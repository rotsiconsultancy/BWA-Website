import Link from "next/link";
import { products } from "@/data/products";
import ProductCard from "@/components/ui/ProductCard";
export default function FeaturedCollections() {
  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <div>
            <div className="eyebrow">Featured collection</div>
            <h2 className="display">Find your everyday.</h2>
          </div>
          <Link href="/shop" className="smallcaps">
            Shop all →
          </Link>
        </div>
        <div className="grid4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
