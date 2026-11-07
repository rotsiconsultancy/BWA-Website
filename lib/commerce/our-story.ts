// Content for /our-story that is data rather than prose.

// Owner, 2026-11-07: business buyers write to this address or the usual
// WhatsApp number. No minimums, prices, lead times or personalisation are
// promised until the owner confirms them.
export const CORPORATE_EMAIL = "beadsworldafrica@outlook.com";

export const CORPORATE_EMAIL_URL = `mailto:${CORPORATE_EMAIL}?subject=${encodeURIComponent("Team gifts from BWA")}`;

export const CORPORATE_WHATSAPP_URL = `https://wa.me/254745474586?text=${encodeURIComponent("Hello BWA, I would like to talk about bracelets as gifts for our team.")}`;

/**
 * Bracelets named for a Kenyan place, by Design Your Own stone code. The
 * names honour the places; they never mean the stone comes from there
 * (Assets/stones/README.md). A stone that leaves the designer drops out.
 */
export const PLACE_NAMES: { stone: string; place: string }[] = [
  { stone: "chyulu-black", place: "The Chyulu Hills" },
  { stone: "menengai-rust", place: "Menengai crater" },
  { stone: "suswa-rust", place: "Mount Suswa" },
  { stone: "njorowa-ember", place: "Ol Njorowa gorge" },
  { stone: "lenana-crackle", place: "Point Lenana" },
  { stone: "kirinyaga-cloud", place: "Kirinyaga, Mount Kenya" },
  { stone: "aberdare-pine", place: "The Aberdare highlands" },
  { stone: "mau-evergreen", place: "The Mau Forest" },
  { stone: "kerio-earth", place: "The Kerio Valley" },
  { stone: "bogoria-blush", place: "Lake Bogoria's flamingos" },
  { stone: "magadi-dust", place: "Lake Magadi" },
  { stone: "samburu-map", place: "Samburu country" },
  { stone: "chalbi-map", place: "The Chalbi Desert" },
  { stone: "tsavo-clay", place: "Tsavo's red earth" },
  { stone: "taita-spark", place: "The Taita Hills" },
  { stone: "watamu-deep", place: "The reef at Watamu" },
  { stone: "diani-denim", place: "Diani's white sand" },
  { stone: "malindi-sunset", place: "Sunset over Malindi" },
];

/**
 * The week the page walks through. Each moment is coloured by one stone,
 * whose bead hangs on the page's thread (by Design Your Own stone code).
 * `field` is that stone's colour; `ink` the text colour that reads on it.
 */
export const MOMENTS: {
  day: string;
  line: string;
  stone: string;
  field: string;
  ink: "dark" | "light";
}[] = [
  {
    day: "Sunday",
    line: "It’s there when you sing on Sunday.",
    stone: "kirinyaga-cloud",
    field: "#e3e4df",
    ink: "dark",
  },
  {
    day: "Market day",
    line: "It’s there when you bargain at the market.",
    stone: "kerio-earth",
    field: "#8a5a2e",
    ink: "light",
  },
  {
    day: "The office",
    line: "It’s there the day someone raises their voice at you, and the day you prove them wrong.",
    stone: "chuma-mirror",
    field: "#33373c",
    ink: "light",
  },
  {
    day: "Friday",
    line: "It’s there when you laugh too loud with your friends.",
    stone: "malindi-sunset",
    field: "#b4461f",
    ink: "light",
  },
  {
    day: "Date night",
    line: "It’s there across the table on date night.",
    stone: "watamu-deep",
    field: "#1d2f68",
    ink: "light",
  },
  {
    day: "The big day",
    line: "It’s there when the call comes: the job, the promotion. And when you go down on one knee.",
    stone: "simba-gold",
    field: "#c99630",
    ink: "dark",
  },
];
