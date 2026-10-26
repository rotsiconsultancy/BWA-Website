export type Stockist = {
  partner: string;
  branch: string;
  /** As the partner describes it, e.g. floor and building. */
  location: string;
  area: string;
  /** BWA's display is here; other branches get pieces on request. */
  onDisplay: boolean;
};

// Confirmed by the owner on 2026-10-26: the BWA display is at Mwanzi Market,
// and customers can get BWA through every ManCave branch. Naming ManCave and
// sending customers there is welcome; only social collabs and tags need
// their written approval. Hours are not confirmed, so the page omits them.
export const stockists: Stockist[] = [
  {
    partner: "ManCave",
    branch: "Mwanzi Market",
    location: "Mwanzi Market, 1st floor",
    area: "Nairobi",
    onDisplay: true,
  },
  {
    partner: "ManCave",
    branch: "Nairobi Street Kitchen",
    location: "Nairobi Street Kitchen (NSK)",
    area: "Nairobi",
    onDisplay: false,
  },

  {
    partner: "ManCave",
    branch: "Kitengela",
    location: "Danka Plaza, 2nd floor",
    area: "Kitengela",
    onDisplay: false,
  },
];

export function stockistMapLink(stockist: Stockist) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${stockist.partner} ${stockist.location} ${stockist.area} Kenya`,
  )}`;
}
