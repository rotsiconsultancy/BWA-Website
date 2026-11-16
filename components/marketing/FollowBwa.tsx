"use client";

import { FaInstagram, FaLinkedin } from "react-icons/fa";
import { trackGa4Event } from "@/lib/marketing/ga4";

const INSTAGRAM_URL = "https://instagram.com/beadsworldafrica";
const LINKEDIN_URL = "https://www.linkedin.com/company/beadsworldafrica";

/**
 * The follow ask at the end of stories and stone pages. Instagram for
 * everyone; LinkedIn only where corporate buyers read (gift pages).
 * Clicks go to GA4 with the placement and page, so we can see which
 * story brings followers.
 */
export default function FollowBwa({
  placement,
  page,
  linkedin = false,
  title = "Like the stories behind the stones?",
}: {
  placement: "stone_meanings" | "stone_page" | "journal";
  page: string;
  linkedin?: boolean;
  title?: string;
}) {
  return (
    <aside className="follow-bwa" aria-label="Follow Beads World Africa">
      <p className="follow-bwa-title">{title}</p>
      <ul className="grow-links">
        <li>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() =>
              trackGa4Event("instagram_follow_click", { placement, page })
            }
          >
            <FaInstagram size={18} aria-hidden="true" />
            <span>
              <strong>Follow @beadsworldafrica on Instagram</strong>
              <small>A new stone and its story, every week.</small>
            </span>
          </a>
        </li>
        {linkedin && (
          <li>
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() =>
                trackGa4Event("linkedin_follow_click", { placement, page })
              }
            >
              <FaLinkedin size={18} aria-hidden="true" />
              <span>
                <strong>Buying for a team? Follow BWA on LinkedIn</strong>
                <small>Corporate gifts, made by hand in Kenya.</small>
              </span>
            </a>
          </li>
        )}
      </ul>
    </aside>
  );
}
