"use client";

import Link from "next/link";
import StoreImage from "@/components/commerce/StoreImage";
import { designLink } from "@/lib/design/stones";
import { trackGa4Event } from "@/lib/marketing/ga4";
import type { CommerceProduct } from "@/lib/commerce/types";

/** "Chyulu Black Lava Stone Bracelet" → "Chyulu Black Lava". */
const stoneName = (title: string) =>
  title.replace(/\s+(Stone\s+)?Bracelet$/i, "");

/** Mid-story invitation to Design Your Own, with this bracelet's stone picked. */
export default function JournalDesignCard({
  product,
  postSlug,
}: {
  product: CommerceProduct;
  postSlug: string;
}) {
  const href = designLink(product.slug);
  const name = stoneName(product.title);
  const track = () =>
    trackGa4Event("journal_design_click", {
      post_slug: postSlug,
      item_id: product.id,
      item_name: product.title,
      placement: "inline",
    });

  return (
    <aside className="journal-product journal-product--design">
      <Link
        href={href}
        className="journal-product-media"
        onClick={track}
        tabIndex={-1}
      >
        <StoreImage
          src={product.images[0]}
          alt={product.title}
          sizes="(max-width: 760px) 40vw, 240px"
        />
      </Link>
      <div className="journal-product-copy">
        <p className="eyebrow">Design your own</p>
        <h3>Make it yours with {name}</h3>
        <p className="journal-design-note">
          Pair it with a second stone, add spacers or letters, and see it come
          together before you send it to us on WhatsApp.
        </p>
        <div className="journal-product-actions">
          <Link href={href} className="btn btn-primary" onClick={track}>
            Start with {name}
          </Link>
        </div>
      </div>
    </aside>
  );
}
