"use client";

import Link from "next/link";
import StoreImage from "@/components/commerce/StoreImage";
import Money from "@/components/commerce/Money";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { trackGa4Event } from "@/lib/marketing/ga4";
import type { CommerceProduct } from "@/lib/commerce/types";

export default function JournalProductCard({
  product,
  postSlug,
  placement,
}: {
  product: CommerceProduct;
  postSlug: string;
  /** "inline" inside the story, "closing" in the final call to action. */
  placement: "inline" | "closing";
}) {
  const { addToCart } = useCart();
  const { currency } = useCurrency();
  const variant = product.variants.find((item) => item.available);
  const prices = variant && {
    KES: product.prices.KES + variant.priceAdjustments.KES,
    USD:
      product.prices.USD === null || variant.priceAdjustments.USD === null
        ? null
        : product.prices.USD + variant.priceAdjustments.USD,
  };
  const track = (action: "add_to_bag" | "view_product") =>
    trackGa4Event("journal_product_click", {
      post_slug: postSlug,
      item_id: product.id,
      item_name: product.title,
      placement,
      action,
    });

  return (
    <aside className={`journal-product journal-product--${placement}`}>
      <Link
        href={`/product/${product.slug}`}
        className="journal-product-media"
        onClick={() => track("view_product")}
        tabIndex={-1}
      >
        <StoreImage
          src={product.images[0]}
          alt={product.title}
          sizes="(max-width: 760px) 40vw, 240px"
        />
      </Link>
      <div className="journal-product-copy">
        <p className="eyebrow">
          {placement === "closing"
            ? "The piece in this story"
            : "Shop the story"}
        </p>
        <h3>{product.title}</h3>
        <strong>
          <Money prices={product.prices} />
        </strong>
        <div className="journal-product-actions">
          <button
            type="button"
            className="btn btn-primary"
            disabled={!variant || !prices || prices[currency] === null}
            onClick={() => {
              if (!variant || !prices) return;
              track("add_to_bag");
              addToCart({
                productId: product.id,
                variantId: variant.id,
                slug: product.slug,
                title: product.title,
                subtitle: product.subtitle,
                image: product.images[0],
                unitPrices: prices,
                variantName: variant.name,
              });
            }}
          >
            {variant ? "Add to bag" : "Sold out"}
          </button>
          <Link
            href={`/product/${product.slug}`}
            onClick={() => track("view_product")}
          >
            View bracelet →
          </Link>
        </div>
      </div>
    </aside>
  );
}
