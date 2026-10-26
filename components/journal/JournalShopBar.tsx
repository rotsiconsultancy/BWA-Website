"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { trackGa4Event } from "@/lib/marketing/ga4";

/** Phone-only bar that appears once the reader has passed the first product card. */
export default function JournalShopBar({
  postSlug,
  productSlug,
  productTitle,
}: {
  postSlug: string;
  productSlug: string;
  productTitle: string;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const marker = document.querySelector("[data-journal-shop-marker]");
    const end = document.querySelector("[data-journal-end]");
    if (!marker) return;
    let frame = 0;
    // A scroll check rather than IntersectionObserver: a fast fling can jump
    // past the zero-height marker without ever "crossing" it.
    const update = () => {
      frame = 0;
      const passedMarker = marker.getBoundingClientRect().top < 0;
      // Hidden again at the closing call to action, which already sells.
      const reachedEnd =
        !!end && end.getBoundingClientRect().top < window.innerHeight;
      setVisible(passedMarker && !reachedEnd);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  return (
    <div
      className={`journal-shop-bar${visible ? " is-visible" : ""}`}
      aria-hidden={!visible}
    >
      <span>{productTitle}</span>
      <Link
        href={`/product/${productSlug}`}
        tabIndex={visible ? 0 : -1}
        onClick={() =>
          trackGa4Event("journal_product_click", {
            post_slug: postSlug,
            placement: "shop_bar",
            action: "view_product",
          })
        }
      >
        Shop this bracelet
      </Link>
    </div>
  );
}
