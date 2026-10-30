import { DESIGN_LINK_VERSION, type DesignStone, findStone } from "@/lib/design/stones";

export type Pattern = "one" | "alt" | "accent";

/** What a design link (or a sent design) says, before stones are looked up. */
export type DesignParams = {
  stone: string;
  with: string | null;
  pattern: Pattern;
  size: "medium" | "large";
  spacers: boolean;
  letters: string | null;
  kind: "metal" | "acrylic";
  charm: boolean;
};

// The design adds this to the listed price (owner, 2026-10-28).
export const EXTRA_KES: [number, number] = [100, 500];

export function readDesignParams(q: URLSearchParams): DesignParams | null {
  const stone = q.get("stone");
  if (!stone) return null;
  const pattern = q.get("design");
  const two = pattern === "alt" || pattern === "accent";
  return {
    stone,
    with: two ? q.get("with") : null,
    pattern: two ? pattern : "one",
    size: q.get("size") === "large" ? "large" : "medium",
    spacers: q.get("spacers") === "1",
    letters: q.get("letters")?.slice(0, 30) || null,
    kind: q.get("kind") === "acrylic" ? "acrylic" : "metal",
    charm: q.get("charm") === "1",
  };
}

export function designQuery(p: DesignParams) {
  const q = new URLSearchParams({ v: String(DESIGN_LINK_VERSION), stone: p.stone, design: p.pattern, size: p.size });
  if (p.pattern !== "one" && p.with) q.set("with", p.with);
  if (p.spacers) q.set("spacers", "1");
  if (p.letters) {
    q.set("letters", p.letters);
    q.set("kind", p.kind);
  }
  if (p.charm) q.set("charm", "1");
  return q;
}

/** The design's stones, or null when one of them is no longer offered. */
export function resolveDesign(stones: DesignStone[], p: DesignParams) {
  const main = findStone(stones, p.stone);
  const second = p.pattern === "one" ? undefined : findStone(stones, p.with);
  if (!main || (p.pattern !== "one" && !second)) return null;
  return { main, second };
}

/** The likely price in KES: the higher listed price plus the design's range. */
export function priceRangeKes(main: DesignStone, second?: DesignStone): [number, number] {
  const base = Math.max(main.prices.KES, second?.prices.KES ?? 0);
  return [base + EXTRA_KES[0], base + EXTRA_KES[1]];
}
