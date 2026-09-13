"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, X } from "lucide-react";
import { useEffect, useRef } from "react";
import { useCart } from "@/context/CartContext";

export default function CartDrawer() {
  const {
    items,
    subtotal,
    drawerOpen,
    closeDrawer,
    updateQuantity,
    removeFromCart,
  } = useCart();
  const closeButton = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (!drawerOpen) return;
    closeButton.current?.focus();
    const keydown = (event: KeyboardEvent) =>
      event.key === "Escape" && closeDrawer();
    window.addEventListener("keydown", keydown);
    return () => window.removeEventListener("keydown", keydown);
  }, [drawerOpen, closeDrawer]);
  return (
    <div
      className={"cart-drawer-root " + (drawerOpen ? "is-open" : "")}
      aria-hidden={!drawerOpen}
    >
      <button
        className="cart-drawer-scrim"
        aria-label="Close bag"
        onClick={closeDrawer}
        tabIndex={drawerOpen ? 0 : -1}
      />
      <aside
        className="cart-drawer"
        aria-label="Your bag"
        aria-modal="true"
        role="dialog"
      >
        <div className="cart-drawer-head">
          <div>
            <span className="eyebrow">Your selection</span>
            <h2>Your Bag</h2>
          </div>
          <button
            ref={closeButton}
            className="icon-btn"
            onClick={closeDrawer}
            aria-label="Close bag"
          >
            <X size={20} />
          </button>
        </div>
        {items.length === 0 ? (
          <div className="cart-empty">
            <ShoppingBag size={28} />
            <p>Your bag is waiting for a piece with meaning.</p>
            <Link href="/bracelets" onClick={closeDrawer}>
              Explore the collection
            </Link>
          </div>
        ) : (
          <>
            <div className="cart-drawer-lines">
              {items.map((line) => (
                <article
                  className="cart-drawer-line"
                  key={line.productId + line.variantId}
                >
                  <img src={line.image} alt={line.title} />
                  <div>
                    <strong>{line.title}</strong>
                    <span>{line.variantName}</span>
                    <span>
                      KES {(line.unitPrice * line.quantity).toLocaleString()}
                    </span>
                    <div className="drawer-quantity">
                      <button
                        aria-label={"Reduce " + line.title}
                        onClick={() =>
                          updateQuantity(
                            line.productId,
                            line.variantId,
                            line.quantity - 1,
                          )
                        }
                      >
                        <Minus size={14} />
                      </button>
                      <span>{line.quantity}</span>
                      <button
                        aria-label={"Increase " + line.title}
                        onClick={() =>
                          updateQuantity(
                            line.productId,
                            line.variantId,
                            line.quantity + 1,
                          )
                        }
                      >
                        <Plus size={14} />
                      </button>
                      <button
                        className="drawer-remove"
                        onClick={() =>
                          removeFromCart(line.productId, line.variantId)
                        }
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <div className="cart-drawer-foot">
              <div>
                <span>Subtotal</span>
                <strong>KES {subtotal.toLocaleString()}</strong>
              </div>
              <p>Delivery is confirmed with your WhatsApp concierge.</p>
              <Link
                href="/checkout"
                className="btn btn-primary"
                onClick={closeDrawer}
              >
                Order via WhatsApp
              </Link>
              <Link
                href="/cart"
                className="drawer-view-bag"
                onClick={closeDrawer}
              >
                View full bag
              </Link>
            </div>
          </>
        )}
      </aside>
    </div>
  );
}
