export type Stockist = {
  partner: string;
  branch: string;
  /** As the partner describes it, e.g. floor and building. */
  location: string;
  area: string;
};

// Confirmed by the owner on 2026-10-26. Hours and the products each branch
// carries are not confirmed yet, so the page does not state them.
export const stockists: Stockist[] = [
  {
    partner: "ManCave",
    branch: "Nairobi Street Kitchen",
    location: "Nairobi Street Kitchen (NSK)",
    area: "Nairobi",
  },
  {
    partner: "ManCave",
    branch: "Mwanzi Market",
    location: "Mwanzi Market, 1st floor",
    area: "Nairobi",
  },
  {
    partner: "ManCave",
    branch: "Kitengela",
    location: "Danka Plaza, 2nd floor",
    area: "Kitengela",
  },
];

export function stockistMapLink(stockist: Stockist) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${stockist.partner} ${stockist.location} ${stockist.area} Kenya`,
  )}`;
}
