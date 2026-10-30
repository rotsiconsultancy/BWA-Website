import type { BeadShape, DesignStone } from "./stones";

// Draws one bead as a small lit 3D object on a canvas, for the Design Your
// Own preview. Each stone is a material: two base colours mixed by noise,
// then pattern layers, then a finish (gloss, metal, pearl). The pattern is
// sampled on the bead's curved surface, so it wraps around like real stone.
// Browser only: it needs a canvas. Stones with bead photos (cut-beads.py)
// use those instead; a stone with neither photos nor a hand-tuned material
// here is drawn from its colour.

type LayerKind = "patch" | "vein" | "pore" | "speck" | "band";
// [kind, colour, scale (higher = finer), threshold, amount, band width]
type Layer = [LayerKind, string, number, number, number, number?];
type Material = {
  base?: [string, string];
  /** Some stones vary bead to bead: one base pair per variant. */
  multi?: [string, string][];
  /** Scale of the base colour mottling. */
  bs: number;
  layers: Layer[];
  /** 0 = matte (lava), 1 = mirror polish. */
  gloss: number;
  metal?: boolean;
  pearl?: boolean;
  /** Tiger's eye: bands brighten in a strip, like its silky sheen. */
  tiger?: boolean;
  /** Translucent stones (agate) light up a little from inside. */
  glow?: boolean;
  /** Goldstone: flecks catch the light. */
  sparkle?: boolean;
};

const MATS: Record<string, Material> = {
  "watamu-deep": { base: ["#13226e", "#2e4fcc"], bs: 3.5, layers: [["patch", "#d6cdb6", 4.2, 0.62, 0.9], ["speck", "#e3bd57", 38, 0.82, 1]], gloss: 0.8 },
  "maziwa-glow": { base: ["#e9e0d2", "#fffaf2"], bs: 3, layers: [["band", "#fffdf8", 7, 0.55, 0.5, 0.25]], gloss: 0.9, pearl: true },
  "simba-gold": { base: ["#3a230d", "#6b4318"], bs: 2.5, layers: [["band", "#9a6522", 28, 0.4, 0.6, 0.3], ["band", "#cf9a48", 28, 0.7, 0.45, 0.15]], gloss: 0.8, tiger: true },
  "aberdare-pine": { base: ["#173426", "#2f5d46"], bs: 4, layers: [["patch", "#7f9a7b", 5.5, 0.62, 0.7], ["speck", "#c0b78a", 16, 0.76, 0.6]], gloss: 0.65 },
  "anga-blue": { base: ["#6d84c4", "#a3b4e3"], bs: 3.5, layers: [["vein", "#eef1f9", 3.8, 0.92, 0.7]], gloss: 0.7 },
  "bogoria-blush": { base: ["#d9b3b5", "#f2dcdc"], bs: 3, layers: [["patch", "#c29599", 6, 0.64, 0.4]], gloss: 0.8 },
  "chalbi-map": { base: ["#b27a3e", "#e0b77a"], bs: 4, layers: [["vein", "#4a2f18", 5, 0.91, 0.75], ["band", "#efcf95", 8, 0.6, 0.4, 0.2]], gloss: 0.5 },
  "chuma-link": { base: ["#26272c", "#3a3c42"], bs: 2, layers: [], gloss: 1, metal: true },
  "chyulu-black": { base: ["#1f1f1f", "#2e2e2e"], bs: 6, layers: [["pore", "#060606", 17, 0.4, 1]], gloss: 0.08 },
  "diani-denim": { base: ["#e3e7ef", "#f7f8fb"], bs: 3, layers: [["patch", "#2847b0", 4.2, 0.57, 1], ["patch", "#1a2f80", 8, 0.7, 0.6]], gloss: 0.75 },
  "kerio-earth": { multi: [["#7f6f4f", "#a8946a"], ["#5e3326", "#8a4a35"], ["#6c7a55", "#93a07a"], ["#b39a6e", "#d4bf95"]], bs: 2.4, layers: [["patch", "#4f5b40", 5, 0.62, 0.6], ["vein", "#3a2a1a", 4, 0.93, 0.4]], gloss: 0.6 },
  "kirinyaga-cloud": { base: ["#dddad4", "#f6f4f0"], bs: 3, layers: [["vein", "#8d8a84", 4, 0.93, 0.7]], gloss: 0.55 },
  "lenana-crackle": { base: ["#e6e2db", "#f8f6f2"], bs: 3, layers: [["vein", "#2a2a2e", 4, 0.91, 0.95], ["vein", "#4a4a4e", 8, 0.94, 0.7]], gloss: 0.55 },
  "magadi-dust": { base: ["#bf9c99", "#e3cdca"], bs: 4, layers: [["vein", "#34343e", 5, 0.9, 0.75], ["speck", "#2b2b33", 22, 0.76, 0.85]], gloss: 0.5 },
  "malindi-sunset": { base: ["#a52b14", "#e0622f"], bs: 3, layers: [["band", "#f3c7aa", 16, 0.74, 0.7, 0.1], ["band", "#fff1e6", 16, 0.88, 0.75, 0.05]], gloss: 0.85, glow: true },
  "mau-evergreen": { base: ["#0d1c14", "#24412f"], bs: 4, layers: [["patch", "#3b6149", 5.5, 0.64, 0.6]], gloss: 0.8 },
  "menengai-rust": { base: ["#874537", "#ad6555"], bs: 6, layers: [["pore", "#3e1a12", 17, 0.4, 1]], gloss: 0.08 },
  "moto-lava": { base: ["#cf4722", "#ef6f45"], bs: 6, layers: [["pore", "#7a230d", 17, 0.4, 1]], gloss: 0.08 },
  "mvua-slate": { base: ["#7e8792", "#b9bfc6"], bs: 3, layers: [["patch", "#e1e2e5", 4, 0.6, 0.75], ["vein", "#1d2126", 5, 0.91, 0.85]], gloss: 0.3 },
  "njorowa-ember": { base: ["#120908", "#24110d"], bs: 3, layers: [["patch", "#80361f", 4, 0.56, 0.9]], gloss: 0.85 },
  "nyota-night": { base: ["#17154a", "#2c2870"], bs: 2, layers: [["speck", "#d6deff", 40, 0.8, 1]], gloss: 0.9, sparkle: true },
  "pwani-sand": { base: ["#cf8574", "#e8a594"], bs: 4, layers: [["patch", "#74824f", 5.5, 0.6, 0.9]], gloss: 0.6 },
  "rose-murram": { base: ["#9f6467", "#c79294"], bs: 4, layers: [["patch", "#7e474b", 5, 0.6, 0.55], ["vein", "#3a2a2b", 5, 0.94, 0.5]], gloss: 0.6 },
  "samburu-map": { base: ["#b48a5e", "#dcbd94"], bs: 4, layers: [["vein", "#56391f", 6, 0.9, 0.7], ["speck", "#4a3220", 20, 0.77, 0.7]], gloss: 0.5 },
  "suswa-rust": { base: ["#4a1612", "#702b24"], bs: 6, layers: [["pore", "#160404", 17, 0.4, 1]], gloss: 0.08 },
  "taita-spark": { base: ["#2f3b32", "#56665a"], bs: 4, layers: [["patch", "#6f7f72", 5, 0.62, 0.5], ["speck", "#b4412b", 18, 0.78, 1]], gloss: 0.8 },
  "tsavo-clay": { base: ["#a83a1f", "#d4603c"], bs: 3.5, layers: [["patch", "#b8462a", 5, 0.6, 0.4]], gloss: 0.55 },
  "waridi-shadow": { base: ["#c97884", "#eaa9b1"], bs: 4, layers: [["vein", "#251d1f", 4.5, 0.91, 0.9]], gloss: 0.7 },
};

/** A hand-tuned stone's main colour, for places that can't draw it (link pictures). */
export const materialColour = (slug: string) => {
  const m = MATS[slug];
  return m ? (m.base ?? m.multi?.[0])?.[1] ?? null : null;
};
/** Width along the cord, in bead diameters. */
export const widthOf = (shape: BeadShape) =>
  ({ sphere: 1, rondelle: 0.55, tube: 1.3 })[shape];
/** Drawn width and height, in bead diameters, before turning onto the ring. */
export const SHAPE_BOX: Record<BeadShape, [number, number]> = {
  sphere: [1, 1],
  rondelle: [1.02, 0.5],
  tube: [0.62, 1.02],
};

type RGB = [number, number, number];
const rgb = (hex: string): RGB => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255) as RGB;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

// Value noise: random numbers on a 3D grid, smoothly blended between points.
function hash(x: number, y: number, z: number, s: number) {
  let h = (x * 374761393 + y * 668265263 + z * 1274126177 + s * 144269) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
}
function noise(x: number, y: number, z: number, s: number) {
  const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
  const ease = (t: number) => t * t * (3 - 2 * t);
  const u = ease(x - xi), v = ease(y - yi), w = ease(z - zi);
  const L = (a: number, b: number, t: number) => a + (b - a) * t;
  const H = (i: number, j: number, k: number) => hash(xi + i, yi + j, zi + k, s);
  return L(
    L(L(H(0, 0, 0), H(1, 0, 0), u), L(H(0, 1, 0), H(1, 1, 0), u), v),
    L(L(H(0, 0, 1), H(1, 0, 1), u), L(H(0, 1, 1), H(1, 1, 1), u), v),
    w,
  );
}
// Several layers of noise, each finer and fainter: natural-looking texture.
function fbm(x: number, y: number, z: number, s: number, octaves = 4) {
  let amp = 0.5, freq = 1, total = 0, norm = 0;
  for (let i = 0; i < octaves; i++) {
    total += amp * noise(x * freq, y * freq, z * freq, s + i * 31);
    norm += amp;
    amp *= 0.5;
    freq *= 2.03;
  }
  return total / norm;
}

const cache = new Map<string, string>();

const hex = ([r, g, b]: RGB) =>
  "#" + [r, g, b].map((v) => Math.round(Math.min(1, Math.max(0, v)) * 255).toString(16).padStart(2, "0")).join("");

/** A plain polished stone in the bead's colour, for stones without a material above. */
function fromColour(colour: string | null): Material {
  const c = rgb(colour && /^#[0-9a-f]{6}$/i.test(colour) ? colour : "#8a8279");
  return {
    base: [hex(mix(c, [0, 0, 0], 0.3)), hex(mix(c, [1, 1, 1], 0.08))],
    bs: 3,
    layers: [["patch", hex(mix(c, [1, 1, 1], 0.25)), 5, 0.62, 0.35]],
    gloss: 0.7,
  };
}

type BeadStone = Pick<DesignStone, "slug" | "shape" | "colour">;

/**
 * A bead as a PNG data URL. `variant` (0–3) turns the pattern so neighbours
 * differ; `angleDeg` is the bead's turn on the ring, so shaped beads stay lit
 * from the top left. `px` is the image size for a plain round bead.
 */
export function beadImage(stone: BeadStone, variant: number, angleDeg: number, px: number) {
  const { slug, shape } = stone;
  const M = MATS[slug] ?? fromColour(stone.colour);
  const turned = shape === "sphere" ? 0 : Math.round(angleDeg / 3) * 3;
  const key = `${slug}|${shape}|${stone.colour}|${variant}|${turned}|${px}`;
  const hit = cache.get(key);
  if (hit) return hit;

  const [ax, ay] = SHAPE_BOX[shape];
  const W = Math.round(px * ax), H = Math.round(px * ay);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return "";
  const img = ctx.createImageData(W, H), d = img.data;

  // The light and "up" in the bead's own (turned) frame.
  const th = (-turned * Math.PI) / 180, ct = Math.cos(th), st = Math.sin(th);
  const turn = (x: number, y: number) => [x * ct - y * st, x * st + y * ct];
  let [lx, ly] = turn(-0.42, -0.62);
  const ln = Math.hypot(lx, ly, 0.66);
  lx /= ln; ly /= ln;
  const lz = 0.66 / ln;
  const [ux, uy] = turn(0, -1);
  let hx = lx, hy = ly, hz = lz + 1; // halfway between light and eye
  const hn = Math.hypot(hx, hy, hz);
  hx /= hn; hy /= hn; hz /= hn;

  // Each variant turns the pattern differently.
  const r1 = variant * 2.39 + 0.7, r2 = variant * 1.31 + 0.3;
  const c1 = Math.cos(r1), s1 = Math.sin(r1), c2 = Math.cos(r2), s2 = Math.sin(r2);
  const seed = slug.length * 13 + variant * 7;
  const base = (M.multi ? M.multi[variant % M.multi.length] : M.base!).map(rgb) as [RGB, RGB];
  const layers = M.layers.map(([k, c, ...rest]) => [k, rgb(c), ...rest] as const);
  const g = M.gloss, specPow = 30 + 260 * g, specAmt = 0.04 + 0.75 * g;
  const half = px / 2;

  for (let j = 0; j < H; j++)
    for (let i = 0; i < W; i++) {
      const X = (i + 0.5 - W / 2) / half, Y = (j + 0.5 - H / 2) / half;
      // Surface normal and distance to the outline (for a soft edge).
      let nx: number, ny: number, nz: number, edge: number;
      if (shape === "tube") {
        const qx = X / ax;
        const ey = Math.max(0, (Math.abs(Y) - (ay - 0.28)) / 0.28);
        if (Math.abs(qx) >= 1 || ey >= 1) continue;
        nx = qx;
        ny = Math.sign(Y) * ey * 0.9;
        nz = Math.sqrt(1 - qx * qx) * Math.sqrt(1 - ey * ey);
        edge = Math.min((1 - Math.abs(qx)) * half * ax, (1 - ey) * half * 0.28);
      } else {
        const q = (X / ax) ** 2 + (Y / ay) ** 2;
        if (q >= 1) continue;
        nx = X / (ax * ax);
        ny = Y / (ay * ay);
        nz = Math.sqrt(1 - q) / (shape === "rondelle" ? 0.75 : 1);
        edge = (1 - Math.sqrt(q)) * half * Math.min(ax, ay);
      }
      const nl = Math.hypot(nx, ny, nz);
      nx /= nl; ny /= nl; nz /= nl;

      // Pattern: sampled at the surface point, turned per variant.
      let px_ = nx;
      const py_ = ny * c1 - nz * s1;
      let pz_ = ny * s1 + nz * c1;
      [px_, pz_] = [px_ * c2 - pz_ * s2, px_ * s2 + pz_ * c2];
      let col = mix(base[0], base[1], smooth(0.3, 0.7, fbm(px_ * M.bs, py_ * M.bs, pz_ * M.bs, seed)));
      let pit = 0, spark = 0, band = 0;
      for (const [kind, c, sc, thr, amt, wd] of layers) {
        let a = 0;
        if (kind === "patch") a = smooth(thr, thr + 0.07, fbm(px_ * sc + 5, py_ * sc, pz_ * sc, seed + 11));
        else if (kind === "vein") {
          // veins follow the lines where the noise crosses its middle
          const v = 1 - Math.abs(fbm(px_ * sc, py_ * sc + 9, pz_ * sc, seed + 23, 5) * 2 - 1);
          a = smooth(thr, thr + (1 - thr) * 0.6, v);
        } else if (kind === "pore") {
          a = 1 - smooth(thr - 0.05, thr, fbm(px_ * sc, py_ * sc, pz_ * sc + 3, seed + 37, 2));
          pit = Math.max(pit, a);
        } else if (kind === "speck") {
          a = smooth(thr, thr + 0.04, noise(px_ * sc, py_ * sc, pz_ * sc, seed + 41));
          spark = Math.max(spark, a);
        } else {
          const wave = fbm(px_ * 1.6, py_ * 1.6, pz_ * 1.6, seed + 53) * 9 + fbm(px_ * 9, py_ * 2, pz_ * 9, seed + 59, 2) * 1.5;
          a = smooth(thr, thr + (wd ?? 0.15), 0.5 + 0.5 * Math.sin(py_ * sc + wave));
          band = Math.max(band, a);
        }
        col = mix(col, c, a * amt);
      }

      // Light: soft sky from above, a key light from the top left.
      const diff = Math.max(0, nx * lx + ny * ly + nz * lz);
      let shade = 0.36 + 0.14 * (nx * ux + ny * uy) + 0.82 * diff;
      if (M.tiger) shade *= 0.85 + 0.55 * band * Math.exp(-((nx * ct + ny * st + 0.15) ** 2) / 0.06);
      if (M.glow) shade += 0.22 * nz * nz;
      shade *= 1 - 0.5 * Math.pow(1 - nz, 3); // darker towards the edge
      shade *= 1 - 0.55 * pit; // pores sit in shadow
      let r = col[0] * shade, gg = col[1] * shade, b = col[2] * shade;

      // Reflections: the room reflected in the surface.
      const rx = 2 * nz * nx, ry = 2 * nz * ny, rz = 2 * nz * nz - 1;
      const wx = rx * ct + ry * st, wy = -rx * st + ry * ct;
      if (M.metal) {
        const e = mix([0.09, 0.095, 0.11], [0.86, 0.88, 0.92], smooth(-0.35, 0.8, -wy * 0.55 - wx * 0.75));
        r = r * 0.25 + e[0] * 0.85;
        gg = gg * 0.25 + e[1] * 0.85;
        b = b * 0.25 + e[2] * 0.85;
      }
      const spec = Math.pow(Math.max(0, nx * hx + ny * hy + nz * hz), specPow) * specAmt * (1 - pit);
      const window =
        g * 0.3 * smooth(-0.78, -0.6, wx) * (1 - smooth(-0.3, -0.15, wx)) *
        smooth(-0.9, -0.7, wy) * (1 - smooth(-0.42, -0.3, wy)) * (rz > 0 ? 1 : 0);
      const rim = 0.07 * g * Math.pow(1 - nz, 4);
      const glint = spark ? spark * (0.5 + 0.9 * hash(i, j, 7, seed)) * (0.35 + diff) * (M.sparkle ? 1 : 0.5) : 0;
      const lift = spec + window + rim + glint;
      r += lift; gg += lift; b += lift;
      if (M.pearl) {
        const t = nz * 10;
        r += 0.035 * Math.sin(t);
        gg += 0.03 * Math.sin(t + 2);
        b += 0.045 * Math.sin(t + 4);
      }
      const o = (j * W + i) * 4;
      d[o] = Math.min(255, r * 255);
      d[o + 1] = Math.min(255, gg * 255);
      d[o + 2] = Math.min(255, b * 255);
      d[o + 3] = Math.min(255, edge * 255 * 1.2);
    }
  ctx.putImageData(img, 0, 0);
  const url = canvas.toDataURL();
  cache.set(key, url);
  return url;
}
