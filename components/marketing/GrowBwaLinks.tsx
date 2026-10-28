"use client";

import { Share2, Store } from "lucide-react";
import { FaInstagram } from "react-icons/fa";
import { STOCKIST_ENQUIRY_URL } from "@/lib/commerce/stockists";
import { trackGa4Event } from "@/lib/marketing/ga4";

const INSTAGRAM_URL = "https://instagram.com/beadsworldafrica";
const SHARE_TEXT =
  "Natural stone bracelets, handmade in Kenya by Beads World Africa.";

// The three brand metrics (stockist enquiries, reach and follows, new
// regions) each get one action here. Placement is sent with every event so
// GA4 shows which surface brought it.
export default function GrowBwaLinks({
  placement,
}: {
  placement: "account" | "order_confirmation";
}) {
  const share = async () => {
    const url = window.location.origin;
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Beads World Africa",
          text: SHARE_TEXT,
          url,
        });
        trackGa4Event("share", {
          method: "native",
          content_type: "website",
          item_id: placement,
        });
      } catch {
        // Closing the share sheet is not a share.
      }
      return;
    }
    window.open(
      "https://wa.me/?text=" + encodeURIComponent(`${SHARE_TEXT} ${url}`),
      "_blank",
      "noopener,noreferrer",
    );
    trackGa4Event("share", {
      method: "whatsapp",
      content_type: "website",
      item_id: placement,
    });
  };
  return (
    <ul className={"grow-links grow-links--" + placement}>
      <li>
        <a
          href={INSTAGRAM_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGa4Event("instagram_follow_click", { placement })}
        >
          <FaInstagram size={18} aria-hidden="true" />
          <span>
            <strong>Follow @beadsworldafrica</strong>
            <small>New stones and drops, first on Instagram.</small>
          </span>
        </a>
      </li>
      <li>
        <button type="button" onClick={share}>
          <Share2 size={18} aria-hidden="true" />
          <span>
            <strong>Share BWA with a friend</strong>
            <small>Know someone who would wear one?</small>
          </span>
        </button>
      </li>
      <li>
        <a
          href={STOCKIST_ENQUIRY_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => trackGa4Event("stockist_enquiry_click", { placement })}
        >
          <Store size={18} aria-hidden="true" />
          <span>
            <strong>Own a shop? Stock BWA</strong>
            <small>Tell us about it on WhatsApp.</small>
          </span>
        </a>
      </li>
    </ul>
  );
}
