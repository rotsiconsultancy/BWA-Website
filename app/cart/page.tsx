"use client";

import Link from "next/link";
import { Minus, Plus, Trash2 } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useCurrency } from "@/context/CurrencyContext";
import { deliveryFeeFor } from "@/lib/commerce/money";

export default function CartPage() {
  const {
    items,
    subtotal,
    updateQuantity,
    removeFromCart,
    hasUnavailableCurrencyPrice,
  } = useCart();
  const { currency, format } = useCurrency();
  const deliveryFee = deliveryFeeFor(currency);
  if (!items.length)
    return (
      <main className="empty-state">
        <h1>Your bag is waiting.</h1>
        <p>A bracelet begins with a feeling. Find the one that is yours.</p>
        <Link href="/bracelets" className="btn btn-primary">
          Explore bracelets
        </Link>
      </main>
    );
  return (
    <main className="container bag-page">
      <div>
        <p className="eyebrow">Your selection</p>
        <h1>Your Bag</h1>
        <div className="bag-lines">
          {items.map((line) => (
            <article key={line.productId + line.variantId} className="bag-line">
              <img src={line.image} alt={line.title} />
              <div className="bag-line-copy">
                <h2>{line.title}</h2>
                <p>
                  {line.subtitle}
                  <br />
                  {line.variantName}
                </p>
                <div className="bag-controls">
                  <div className="product-quantity">
                    <button
                      onClick={() =>
                        updateQuantity(
                          line.productId,
                          line.variantId,
                          line.quantity - 1,
                        )
                      }
                    >
                      <Minus size={15} />
                    </button>
                    <span>{line.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          line.productId,
                          line.variantId,
                          line.quantity + 1,
                        )
                      }
                    >
                      <Plus size={15} />
                    </button>
                  </div>
                  <button
                    onClick={() =>
                      removeFromCart(line.productId, line.variantId)
                    }
                    className="bag-remove"
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
              <strong>
                {line.unitPrices[currency] === null
                  ? "Price unavailable"
                  : format((line.unitPrices[currency] ?? 0) * line.quantity)}
              </strong>
            </article>
          ))}
        </div>
      </div>
      <aside className="bag-summary">
        <p className="eyebrow">Order summary</p>
        <div>
          <span>Subtotal</span>
          <strong>{format(subtotal)}</strong>
        </div>
        <div>
          <span>Delivery</span>
          <span>Confirmed at checkout</span>
        </div>
        <div className="bag-total">
          <span>Estimated total</span>
          <strong>{format(subtotal + deliveryFee)}</strong>
        </div>
        {hasUnavailableCurrencyPrice && (
          <p>One or more pieces do not yet have a {currency} price.</p>
        )}
        <Link
          href="/checkout"
          className="btn btn-primary"
          aria-disabled={hasUnavailableCurrencyPrice}
          onClick={(event) =>
            hasUnavailableCurrencyPrice && event.preventDefault()
          }
        >
          Continue to order
        </Link>
        <p>
          Your bracelet is reserved only once our concierge confirms payment.
        </p>
      </aside>
    </main>
  );
}
