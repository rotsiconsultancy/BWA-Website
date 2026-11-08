// Review & reward: a delivered order gets one review link; the client rates
// their bracelets in under a minute and gets a one-time thank-you code that
// only works with the phone number on that order. The code is given whatever
// the rating, so reviews stay honest (and are marked as such on the site).

/** Owner's terms (2026-11-08): KES 200 off the next order, valid 60 days. */
export const REVIEW_REWARD = {
  amountKes: 200,
  amountUsd: 2,
  validDays: 60,
  linkValidDays: 30,
} as const;

/** The reward in both currencies, e.g. "KES 200 (USD 2)". */
export const REWARD_LABEL = `KES ${REVIEW_REWARD.amountKes} (USD ${REVIEW_REWARD.amountUsd})`;

/** What the client can tap about their bracelet (shown publicly). */
export const REVIEW_TAGS = [
  { id: "like_photos", label: "Looks like the photos" },
  { id: "gift_hit", label: "The gift was a hit" },
  { id: "wear_daily", label: "I wear it every day" },
  { id: "packaging", label: "Nice packaging" },
  { id: "easy_order", label: "Easy to order" },
  { id: "good_fit", label: "Fits well" },
] as const;

/** "One thing we could do better next time?" (private, admin only). */
export const IMPROVEMENT_OPTIONS = [
  { id: "faster_delivery", label: "We should improve delivery" },
  { id: "easier_ordering", label: "We should make ordering easier" },
  { id: "more_sizes", label: "Add more bead size variations" },
  { id: "better_packaging", label: "We should improve packaging" },
  { id: "more_stones", label: "We should add more stone choices" },
  { id: "nothing", label: "Nothing, we're doing great!" },
] as const;

export const reviewTagLabel = (id: string) =>
  REVIEW_TAGS.find((tag) => tag.id === id)?.label ?? id;
export const improvementLabel = (id: string) =>
  IMPROVEMENT_OPTIONS.find((option) => option.id === id)?.label ?? id;

const TAG_IDS = new Set<string>(REVIEW_TAGS.map((tag) => tag.id));
const IMPROVEMENT_IDS = new Set<string>(
  IMPROVEMENT_OPTIONS.map((option) => option.id),
);

export const REVIEW_TOKEN = /^[A-Za-z0-9_-]{20,64}$/;

/** 128 random bits, URL-safe. */
export function newReviewToken() {
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  return Buffer.from(bytes).toString("base64url");
}

// No 0/O, 1/I/L: the code gets read out and typed on phones.
const CODE_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";
export function newThanksCode() {
  const bytes = crypto.getRandomValues(new Uint8Array(6));
  return (
    "THANKS-" +
    Array.from(bytes, (b) => CODE_ALPHABET[b % CODE_ALPHABET.length]).join("")
  );
}

export type ReviewSubmission = {
  reviews: {
    product_id: string;
    rating: number;
    body: string;
    tags: string[];
  }[];
  feedback: { improvements: string[]; note: string };
  displayName: string;
  town: string;
  consent: boolean;
};

/** Validate the client's answers against the products on their order. */
export function parseReviewSubmission(
  body: any,
  orderProductIds: string[],
): ReviewSubmission | null {
  const allowed = new Set(orderProductIds);
  const ratings =
    body?.ratings && typeof body.ratings === "object" ? body.ratings : {};
  const tags = Array.isArray(body?.tags)
    ? [...new Set<string>(body.tags.map(String))].filter((t) => TAG_IDS.has(t))
    : [];
  const comment = String(body?.comment ?? "")
    .trim()
    .slice(0, 500);
  const reviews = Object.entries(ratings)
    .filter(([id]) => allowed.has(id))
    .map(([id, value]) => ({
      product_id: id,
      rating: Number(value),
      body: comment,
      tags,
    }))
    .filter(
      (r) => Number.isInteger(r.rating) && r.rating >= 1 && r.rating <= 5,
    );
  // Every bracelet on the order needs its stars.
  if (!reviews.length || reviews.length !== allowed.size) return null;
  const improvements = Array.isArray(body?.improvements)
    ? [...new Set<string>(body.improvements.map(String))].filter((i) =>
        IMPROVEMENT_IDS.has(i),
      )
    : [];
  return {
    reviews,
    feedback: {
      improvements,
      note: String(body?.note ?? "")
        .trim()
        .slice(0, 500),
    },
    displayName: String(body?.displayName ?? "")
      .trim()
      .slice(0, 40),
    town: String(body?.town ?? "")
      .trim()
      .slice(0, 40),
    consent: body?.consent === true,
  };
}

export function reviewLinkMessage(firstName: string | null, link: string) {
  return [
    `Hello ${firstName || "there"}, this is Beads World Africa.`,
    "We hope your bracelet arrived well and you're enjoying it.",
    "",
    `Would you tell us how it went? It takes under a minute, and as a thank-you you'll get ${REWARD_LABEL} off your next order:`,
    link,
  ].join("\n");
}
