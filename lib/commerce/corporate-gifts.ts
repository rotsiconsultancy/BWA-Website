// The Appreciation Collection, from the owner's corporate gifting proposal
// (2026-11-07). Prices are per pack, bracelets only; packaging,
// personalisation, delivery and timelines are confirmed with each order.
// Never add minimums, lead times or delivery promises here unconfirmed.

import { CORPORATE_EMAIL } from "@/lib/commerce/our-story";

export type GiftPack = {
  name: string;
  bracelets: number;
  /** Price options in KES, lowest first. */
  prices: number[];
  options: string;
  forWhom: string;
};

export const GIFT_PACKS: GiftPack[] = [
  {
    name: "Everyday",
    bracelets: 2,
    prices: [2000, 2500],
    options: "One stone or two stones per bracelet",
    forWhom: "For whole teams, event guests and client thank-yous.",
  },
  {
    name: "Signature",
    bracelets: 4,
    prices: [4000, 4500],
    options: "One stone or two stones per bracelet",
    forWhom: "For top performers, key clients and speakers.",
  },
  {
    name: "Executive",
    bracelets: 7,
    prices: [7000, 7500, 8000],
    options: "One stone, two stones, or a personalised set",
    forWhom: "For leadership, board members and VIP clients.",
  },
];

export const packEmailUrl = (pack: string) =>
  `mailto:${CORPORATE_EMAIL}?subject=${encodeURIComponent(`Appreciation Collection: ${pack} pack`)}`;

/**
 * Outside research quoted in the proposal. Owner to confirm each source
 * before publishing changes to these figures.
 */
export const GIFT_FACTS: { figure: string; text: string; source: string }[] = [
  {
    figure: "54%",
    text: "of professionals have thrown away a corporate gift without ever using it.",
    source: "Business.com survey of 1,547 professionals, 2022",
  },
  {
    figure: "67%",
    text: "of corporate buyers count a gift a success only if people choose to wear or use it.",
    source: "Custom Ink survey of 1,000+ corporate buyers, 2025",
  },
  {
    figure: "45%",
    text: "less likely to have left after two years: employees who get high-quality recognition.",
    source: "Gallup and Workhuman, 2024",
  },
];

export const GIFT_FITS: { business: string; moment: string; fit: string }[] = [
  {
    business: "Banks and insurers",
    moment: "Year-end staff gifts; relationship clients",
    fit: "Signature for staff, Everyday for clients",
  },
  {
    business: "Audit, consulting, law",
    moment: "Staff milestones; client thank-yous within gift rules",
    fit: "Everyday for clients, Signature for your teams",
  },
  {
    business: "FMCG and manufacturing",
    moment: "Team celebrations; distributors and partners",
    fit: "A proudly Kenyan gift from a proudly Kenyan brand",
  },
  {
    business: "Real estate, car dealers",
    moment: "Handover day for a new home or car",
    fit: "A bracelet in the welcome pack, worn long after the keys",
  },
  {
    business: "Events and conferences",
    moment: "Speakers, VIPs, organisers",
    fit: "Signature or Executive, with your message on the card",
  },
];

export const GIFT_STEPS: { title: string; text: string }[] = [
  {
    title: "Tell us",
    text: "The occasion, how many people, and when you need the gifts.",
  },
  {
    title: "We propose",
    text: "Bracelet picks, packaging, card wording and a written quote.",
  },
  {
    title: "You approve",
    text: "See a sample pack and confirm before we start making.",
  },
  {
    title: "We make and deliver",
    text: "Strung by hand, packed with your card, delivered to you.",
  },
];
