"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Share2, Shuffle, TriangleAlert } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import StoreImage from "@/components/commerce/StoreImage";
import Money from "@/components/commerce/Money";
import { useCurrency } from "@/context/CurrencyContext";
import type { Prices } from "@/lib/commerce/money";
import { beadImage, SHAPE_BOX, widthOf } from "@/lib/design/beads";
import { DESIGN_ID, newDesignId } from "@/lib/design/design-id";
import { designQuery, EXTRA_KES, type Pattern } from "@/lib/design/design-link";
import { saveDesign } from "@/lib/design/saved-designs";
import {
  type DesignStone,
  findStone,
  findStoneByProduct,
  type RetiredStone,
  similarStones,
} from "@/lib/design/stones";
import { trackGa4Event } from "@/lib/marketing/ga4";

type Role = "main" | "second";
type Design = {
  gift: boolean;
  feeling: string | null;
  main: string;
  pattern: Pattern;
  second: string;
  spacers: boolean;
  lettersOn: boolean;
  letters: string;
  letterKind: "metal" | "acrylic";
  charm: boolean;
  size: "medium" | "large";
  /** Wrist size in cm, or null for "not sure". */
  wrist: number | null;
  message: string;
  /** Stones a shared link asked for that the page no longer offers, by role. */
  gone: { main?: Gone; second?: Gone };
};
type Gone = { code: string; name: string; retired?: RetiredStone };

const WHATSAPP = "254745474586";
const FEELINGS = ["calm", "grounding", "focus", "clarity", "vitality", "protection"];
const PATTERNS: [Pattern, string][] = [
  ["one", "One stone"],
  ["alt", "Two, alternating"],
  ["accent", "Main + accents"],
];
const PATTERN_NAMES: Record<Pattern, string> = {
  one: "One stone",
  alt: "Two stones, alternating",
  accent: "Main stone with accents",
};
const WRISTS = [15, 16, 17, 18, 19, 20];
// Letters past this many get crowded on a bracelet (owner, 2026-10-28).
const LETTERS_COMFORT = 10;
// Starting points: pairings of stones the page offers, named for how they look
// (no "best seller" claims). One is skipped if either stone is switched off.
const IDEAS: { name: string; main: string; second: string; pattern: Pattern }[] = [
  { name: "Gold and black", main: "simba-gold", second: "chyulu-black", pattern: "alt" },
  { name: "Deep blue", main: "watamu-deep", second: "kirinyaga-cloud", pattern: "accent" },
  { name: "Forest", main: "mau-evergreen", second: "chyulu-black", pattern: "accent" },
  { name: "Earth", main: "tsavo-clay", second: "chalbi-map", pattern: "alt" },
];

// Ring geometry, in the preview's 600 × 600 drawing.
const R = 200, CX = 300, CY = 285, SPACER = 0.36, CUBE = 0.74;
// Rounded so the server and the browser draw identical numbers (trig can
// differ in the last digits, which React reports as a hydration mismatch).
const r2 = (n: number) => Math.round(n * 100) / 100;
const title = (s: string) => s[0].toUpperCase() + s.slice(1);
type Item =
  | { kind: "bead"; stone: DesignStone; role: Role; gone: boolean; w: number; idx: number }
  | { kind: "spacer"; w: number }
  | { kind: "letter"; ch: string; w: number };

function layout(d: Design, main: DesignStone, second: DesignStone) {
  const letters = d.lettersOn ? d.letters.replace(/\s+/g, "").slice(0, 14) : "";
  const target = d.size === "large" ? 16 : 21; // beads around, in diameters
  const per = widthOf(main.shape) + (d.spacers ? SPACER : 0);
  const count = Math.max(4, Math.round((target - letters.length * CUBE) / per));
  const items: Item[] = [...letters].map((ch) => ({ kind: "letter" as const, ch, w: CUBE }));
  for (let i = 0; i < count; i++) {
    const role: Role = (d.pattern === "alt" && i % 2 === 1) || (d.pattern === "accent" && i % 4 === 2) ? "second" : "main";
    const stone = role === "second" ? second : main;
    items.push({ kind: "bead", stone, role, gone: !!d.gone[role], w: widthOf(stone.shape), idx: i });
    if (d.spacers) items.push({ kind: "spacer", w: SPACER });
  }
  const unit = (2 * Math.PI * R) / items.reduce((a, b) => a + b.w, 0);
  const centres: number[] = [];
  let run = 0;
  for (const it of items) {
    centres.push(run + it.w / 2);
    run += it.w;
  }
  // Letters centred at the top, reading left to right.
  const first = letters.length ? (centres[0] + centres[letters.length - 1]) / 2 : centres[0];
  const offset = -Math.PI / 2 - (first * unit) / R;
  const placed = items.map((it, k) => {
    const a = offset + (centres[k] * unit) / R;
    return { ...it, x: r2(CX + R * Math.cos(a)), y: r2(CY + R * Math.sin(a)), deg: r2((a * 180) / Math.PI) };
  });
  // The charm hangs from the gap between beads nearest the bottom.
  let charmAt = Math.PI / 2, best = Infinity, edge = 0;
  for (const it of items) {
    edge += it.w;
    const a = offset + (edge * unit) / R;
    const off = Math.abs(Math.atan2(Math.sin(a - Math.PI / 2), Math.cos(a - Math.PI / 2)));
    if (off < best) [best, charmAt] = [off, a];
  }
  return { placed, unit: r2(unit), beadR: r2((unit / 2) * 0.97), charmAt };
}

function Ring({
  design,
  main,
  second,
  ready,
  onPick,
}: {
  design: Design;
  main: DesignStone;
  second: DesignStone;
  ready: boolean;
  onPick: (role: Role) => void;
}) {
  const { placed, unit, beadR, charmAt } = useMemo(() => layout(design, main, second), [design, main, second]);
  const charm = (() => {
    const ax = r2(CX + R * Math.cos(charmAt)), ay = r2(CY + R * Math.sin(charmAt));
    const jr = beadR * 0.34, cr = beadR * 0.78, jy = ay + beadR * 0.62, cy = jy + jr + cr * 0.95;
    return { ax, ay, jr, cr, jy, cy };
  })();
  const letterFill = design.letterKind === "metal" ? "url(#dyo-metal)" : "url(#dyo-acrylic)";
  const two = design.pattern !== "one";
  return (
    <svg viewBox="0 0 600 600" role="img" aria-label={`Preview of your bracelet: ${main.name}${two ? ` and ${second.name}` : ""}`}>
      <defs>
        <linearGradient id="dyo-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ece9e3" />
          <stop offset=".5" stopColor="#aca89f" />
          <stop offset="1" stopColor="#6f6b64" />
        </linearGradient>
        <linearGradient id="dyo-gold" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f3e2a9" />
          <stop offset=".5" stopColor="#c49a45" />
          <stop offset="1" stopColor="#7d5a1f" />
        </linearGradient>
        <linearGradient id="dyo-acrylic" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#e6e2da" />
        </linearGradient>
        <radialGradient id="dyo-charm" cx=".35" cy=".3" r=".8">
          <stop offset="0" stopColor="#f4f2ee" />
          <stop offset=".55" stopColor="#a9a59c" />
          <stop offset="1" stopColor="#5f5b55" />
        </radialGradient>
        <radialGradient id="dyo-floor" cx=".5" cy=".5" r=".5">
          <stop offset=".72" stopColor="#171716" stopOpacity="0" />
          <stop offset=".86" stopColor="#171716" stopOpacity=".09" />
          <stop offset="1" stopColor="#171716" stopOpacity="0" />
        </radialGradient>
        <filter id="dyo-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="3.5" floodColor="#171716" floodOpacity=".26" />
        </filter>
      </defs>
      {/* A soft shadow where the bracelet rests, and the cord through the beads. */}
      <ellipse cx={CX} cy={CY + 14} rx={R + beadR * 1.6} ry={R + beadR * 1.5} fill="url(#dyo-floor)" />
      <circle cx={CX} cy={CY} r={R} fill="none" stroke="#5d564c" strokeWidth="2.5" opacity=".28" />
      {design.charm && (
        <g filter="url(#dyo-drop)">
          <line x1={charm.ax} y1={charm.ay} x2={charm.ax} y2={charm.jy - charm.jr} stroke="#8d887f" strokeWidth={beadR * 0.1} />
          <circle cx={charm.ax} cy={charm.jy} r={charm.jr} fill="none" stroke="url(#dyo-metal)" strokeWidth={beadR * 0.14} />
          <circle cx={charm.ax} cy={charm.cy} r={charm.cr} fill="url(#dyo-charm)" stroke="rgba(0,0,0,.3)" />
          <circle cx={charm.ax} cy={charm.cy} r={charm.cr * 0.72} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
        </g>
      )}
      <g filter="url(#dyo-drop)">
        {placed.map((it, k) => {
          if (it.kind === "bead") {
            const { shape, beads } = it.stone;
            const [bx, by] = SHAPE_BOX[shape];
            const w = beadR * 2 * bx, h = beadR * 2 * by;
            // Tapping a bead of the second stone opens its picker.
            const pick = two ? { onClick: () => onPick(it.role), style: { cursor: "pointer" } } : {};
            // A stone a shared link asked for that is gone: an empty place to fill.
            if (it.gone)
              return <circle key={k} cx={it.x} cy={it.y} r={beadR * 0.9} fill="#efe9df" stroke="#a39a8c" strokeWidth="2" strokeDasharray="5 4" {...pick} />;
            // Photographed beads first, else the drawn material.
            const photo = beads.length ? beads[it.idx % beads.length] : null;
            return ready ? (
              <image
                key={k}
                href={photo ?? beadImage(it.stone, it.idx % 4, it.deg, Math.min(160, Math.ceil(beadR * 4.4)))}
                x={it.x - w / 2}
                y={it.y - h / 2}
                width={w}
                height={h}
                transform={shape === "sphere" ? undefined : `rotate(${it.deg} ${it.x} ${it.y})`}
                preserveAspectRatio="xMidYMid slice"
                {...pick}
              />
            ) : (
              <circle key={k} cx={it.x} cy={it.y} r={beadR} fill="#d8d0c2" />
            );
          }
          if (it.kind === "spacer") {
            // Small gold discs, so they never read as a stone.
            const r = (it.w * unit) / 2;
            return (
              <ellipse key={k} cx={it.x} cy={it.y} rx={r * 0.62} ry={beadR * 0.62} transform={`rotate(${it.deg} ${it.x} ${it.y})`} fill="url(#dyo-gold)" stroke="rgba(60,40,10,.35)" />
            );
          }
          const s = unit * CUBE * 0.96;
          return (
            <g key={k} transform={`translate(${it.x} ${it.y}) rotate(${it.deg + 90})`}>
              <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.18} fill={letterFill} stroke="rgba(0,0,0,.22)" />
              <rect x={-s / 2 + 2} y={-s / 2 + 2} width={s - 4} height={s * 0.35} rx={s * 0.14} fill="#fff" opacity=".25" />
              <text y={s * 0.2} textAnchor="middle" style={{ fontFamily: "var(--font-manrope), sans-serif" }} fontWeight="700" fontSize={s * 0.56} fill="#1f1e1c">
                {it.ch.toUpperCase()}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
  );
}

/** One bead of a stone, round: its photo, else its drawing, else its colour. */
function Bead({ stone, ready }: { stone: DesignStone; ready: boolean }) {
  const src = stone.beads[0] ?? (ready ? beadImage(stone, 0, -90, 112) : null);
  return src ? (
    // Tiny WebP bead photos (or canvas data URLs): next/image adds nothing here.
    // eslint-disable-next-line @next/next/no-img-element
    <img className="dyo-bead" src={src} alt="" width={56} height={56} loading="lazy" decoding="async" />
  ) : (
    <span className="dyo-bead" style={{ background: stone.colour ?? "#8a8279" }} />
  );
}

function PatternIcon({ pattern }: { pattern: Pattern }) {
  return (
    <svg viewBox="0 0 56 56" aria-hidden="true">
      {Array.from({ length: 10 }, (_, i) => {
        const a = (i / 10) * 2 * Math.PI;
        const second = (pattern === "alt" && i % 2) || (pattern === "accent" && i % 4 === 2);
        return <circle key={i} cx={r2(28 + 20 * Math.cos(a))} cy={r2(28 + 20 * Math.sin(a))} r="5.6" fill={second ? "#2a2a2a" : "#8a5a1e"} />;
      })}
    </svg>
  );
}

function Segmented<T extends string>({
  value,
  options,
  onChange,
  label,
}: {
  value: T;
  options: [T, string][];
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="dyo-seg" role="group" aria-label={label}>
      {options.map(([v, text]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {text}
        </button>
      ))}
    </div>
  );
}

/** The likely price: the listed price plus the design's KES 100–500. */
function PriceRange({ base }: { base: Prices }) {
  const { currency, format } = useCurrency();
  if (currency === "KES")
    return <>{format(base.KES + EXTRA_KES[0])}–{(base.KES + EXTRA_KES[1]).toLocaleString("en-KE")}</>;
  return base.USD === null ? <>Confirmed on WhatsApp</> : <>From {format(base.USD)}</>;
}

export default function DesignYourOwn({ stones, retired }: { stones: DesignStone[]; retired: RetiredStone[] }) {
  if (!stones.length) return <Resting />;
  return <Designer stones={stones} retired={retired} />;
}

// No stones to offer (the catalogue did not load, or none are switched on).
function Resting() {
  useEffect(() => {
    trackGa4Event("design_your_own_unavailable", {});
  }, []);
  return (
    <main className="dyo-page">
      <section className="dyo-intro dyo-resting">
        <p className="eyebrow">Design your own</p>
        <h1>The designer is resting.</h1>
        <p>Tell us the stones and the look you have in mind, and we&apos;ll design it with you on WhatsApp.</p>
        <a
          className="btn btn-whatsapp"
          href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hello BWA, I'd like to design my own bracelet.")}`}
          target="_blank"
          rel="noopener noreferrer"
        >
          <FaWhatsapp size={18} aria-hidden="true" /> Design it with us on WhatsApp
        </a>
      </section>
    </main>
  );
}

function Designer({ stones, retired }: { stones: DesignStone[]; retired: RetiredStone[] }) {
  const fallback = stones.find((s) => s.slug === "simba-gold") ?? stones[0];
  const otherThan = (slug: string) => (stones.find((s) => s.slug !== slug) ?? fallback).slug;
  const [d, setD] = useState<Design>(() => ({
    gift: false,
    feeling: null,
    main: fallback.slug,
    pattern: "one",
    second: (stones.find((s) => s.slug === "chyulu-black" && s.slug !== fallback.slug) ?? stones.find((s) => s.slug !== fallback.slug) ?? fallback).slug,
    spacers: false,
    lettersOn: false,
    letters: "",
    letterKind: "metal",
    charm: false,
    size: "medium",
    wrist: null,
    message: "",
    gone: {},
  }));
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  // On phones one step is open at a time; on wider screens all are.
  const [open, setOpen] = useState(1);
  // The second stone's picker, opened from its place on the ring or in Style.
  const [pickingSecond, setPickingSecond] = useState(false);
  const [summaryInView, setSummaryInView] = useState(false);
  // For the send event: how long the design took and how many choices it took.
  const startedAt = useRef(0);
  const changes = useRef(0);
  // The id of the design this page was opened from (a link from a sent design).
  const openedFrom = useRef<string | null>(null);
  const summaryRef = useRef<HTMLElement>(null);
  const stepRefs = useRef<(HTMLElement | null)[]>([]);
  const set = (patch: Partial<Design>) => setD((prev) => ({ ...prev, ...patch }));
  // A choice the customer made: apply it and count it.
  const choose = (field: string, value: string | number | boolean | null, patch: Partial<Design>) => {
    set(patch);
    changes.current += 1;
    trackGa4Event("design_your_own_change", { field, value: value === null ? "none" : String(value) });
  };
  const find = (slug: string) => stones.find((s) => s.slug === slug) ?? fallback;
  const canPair = stones.length > 1;

  // Open a shared design, then draw the beads (they need the browser's canvas).
  // Links carry v=<DESIGN_LINK_VERSION>; links from before versions are v1.
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    const patch: Partial<Design> = {};
    const gone: Design["gone"] = {};
    // A stone code from the link: offered (maybe under an old code), or gone.
    const read = (code: string | null): { stone?: DesignStone; gone?: Gone } => {
      if (!code) return {};
      const stone = findStone(stones, code);
      if (stone) return { stone };
      const was = retired.find((r) => r.slug === code || r.aliases.includes(code));
      const name = was?.name ?? code.split("-").map((w) => w && title(w)).join(" ");
      return { gone: { code, name, retired: was } };
    };
    const main = read(q.get("stone"));
    const fromProduct = findStoneByProduct(stones, q.get("product"));
    if (main.stone ?? fromProduct) patch.main = (main.stone ?? fromProduct)!.slug;
    if (main.gone) gone.main = main.gone;
    const pattern = q.get("design");
    if (canPair && (pattern === "alt" || pattern === "accent")) {
      patch.pattern = pattern;
      const second = read(q.get("with"));
      // A gone main stone holds a stand-in; keep it clear of the link's second stone.
      if (main.gone && second.stone && second.stone.slug === d.main) patch.main = otherThan(second.stone.slug);
      const mainSlug = patch.main ?? d.main;
      if (second.stone) patch.second = second.stone.slug === mainSlug ? otherThan(mainSlug) : second.stone.slug;
      else if (patch.main && patch.main === d.second) patch.second = otherThan(patch.main);
      if (second.gone) gone.second = second.gone;
    } else if (patch.main && patch.main === d.second) patch.second = otherThan(patch.main);
    if (q.get("size") === "large") patch.size = "large";
    if (q.get("spacers") === "1") patch.spacers = true;
    if (q.get("charm") === "1") patch.charm = true;
    if (q.get("letters")) {
      patch.lettersOn = true;
      patch.letters = q.get("letters")!.slice(0, 30);
      patch.letterKind = q.get("kind") === "acrylic" ? "acrylic" : "metal";
    }
    if (gone.main || gone.second) patch.gone = gone;
    if (Object.keys(patch).length) set(patch);
    // A gone second stone: open its picker right away.
    if (gone.second && !gone.main) {
      setOpen(2);
      setPickingSecond(true);
    }
    setReady(true);
    startedAt.current = Date.now();
    const from = q.get("id");
    if (from && DESIGN_ID.test(from)) openedFrom.current = from;
    trackGa4Event("design_your_own_view", { shared: q.has("stone"), link_version: Number(q.get("v") ?? 1), from_design: openedFrom.current ?? undefined });
    for (const [role, g] of Object.entries(gone))
      trackGa4Event("design_your_own_missing_stone", { stone: g.code, role, known: !!g.retired });
  }, []);

  // The phone's bottom bar steps aside once the summary (with the same button) is on screen.
  useEffect(() => {
    const el = summaryRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setSummaryInView(e.isIntersecting), { threshold: 0.2 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const main = find(d.main), second = find(d.second), two = d.pattern !== "one";
  // Places still to fill before the design can be sent.
  const goneMain = d.gone.main, goneSecond = two ? d.gone.second : undefined;
  const blocked = !!(goneMain || goneSecond);
  const shown = stones.filter((s) => !d.feeling || s.feelings.includes(d.feeling));
  const letters = d.letters.trim();
  const mainName = goneMain ? goneMain.name : main.name;
  const secondName = goneSecond ? goneSecond.name : second.name;
  const previewName = `${mainName}${two ? ` + ${secondName}` : ""}`;
  const base = (two && second.prices.KES > main.prices.KES ? second : main).prices;
  const extras = [
    d.spacers && "Spacers",
    d.lettersOn && letters && `Letters ${letters.toUpperCase()} (${d.letterKind})`,
    d.charm && "Charm",
  ].filter(Boolean) as string[];

  // The WhatsApp message keeps every line, so nothing is left to guess.
  const messageRows: [string, string][] = [
    ["Main stone", goneMain ? `${goneMain.name} (no longer available)` : `${main.name}${main.stone && ` (${main.stone})`}`],
    ...(two ? [["Second stone", goneSecond ? `${goneSecond.name} (no longer available)` : `${second.name}${second.stone && ` (${second.stone})`}`] as [string, string]] : []),
    ["Design", PATTERN_NAMES[d.pattern]],
    ["Bead size", d.size === "large" ? "Large" : "Medium"],
    ["Spacers", d.spacers ? "Yes" : "No"],
    ["Letters", d.lettersOn && letters ? `${letters} (${d.letterKind})` : "No"],
    ["Charm", d.charm ? "Yes, show me the options" : "No"],
    ["Wrist", d.wrist ? `${d.wrist} cm` : "Not sure, help me"],
    ...(d.gift ? [["Gift", d.message.trim() ? "Yes, with a message" : "Yes"] as [string, string]] : []),
  ];
  // The page's summary shows only what was chosen.
  const summaryRows: [string, string][] = [
    ["Stones", two ? `${mainName} + ${secondName}` : mainName],
    ...(two ? [["Design", PATTERN_NAMES[d.pattern]] as [string, string]] : []),
    ["Beads", d.size === "large" ? "Large" : "Medium"],
    ...(extras.length ? [["Extras", extras.join(", ")] as [string, string]] : []),
    ["Wrist", d.wrist ? `${d.wrist} cm` : "We'll help you measure"],
    ...(d.gift ? [["Gift", d.message.trim() ? "With a card message" : "Yes"] as [string, string]] : []),
  ];

  const query = () =>
    designQuery({
      stone: d.main,
      with: two ? d.second : null,
      pattern: d.pattern,
      size: d.size,
      spacers: d.spacers,
      letters: d.lettersOn && letters ? letters : null,
      kind: d.letterKind,
      charm: d.charm,
    });
  const shareUrl = (id?: string) => {
    const q = query();
    if (id) q.set("id", id);
    return `${window.location.origin}/design-your-own?${q}`;
  };
  const designEvent = (placement: string) => ({
    stone: d.main,
    second_stone: two ? d.second : undefined,
    pattern: d.pattern,
    bead_size: d.size,
    spacers: d.spacers,
    letters: d.lettersOn && !!letters,
    charm: d.charm,
    gift: d.gift,
    placement,
  });
  const send = (placement: "summary" | "bar") => {
    if (blocked) return;
    // A new id for every send, made here so WhatsApp opens at once (a popup
    // opened after waiting on the server is blocked on phones).
    const id = newDesignId();
    const lines = [
      `Hello BWA, I designed a bracelet on your website (design ${id}):`,
      ...messageRows.map(([a, b]) => `• ${a}: ${b}`),
      ...(d.gift && d.message.trim() ? [`• Gift message: ${d.message.trim()}`] : []),
      "",
      `Design link: ${shareUrl(id)}`,
    ];
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
    trackGa4Event("design_your_own_send", {
      ...designEvent(placement),
      design_id: id,
      changes: changes.current,
      seconds: Math.round((Date.now() - startedAt.current) / 1000),
      from_design: openedFrom.current ?? undefined,
    });
    // A copy for the owner's list (app/api/design-leads), sent in the background.
    const lead = JSON.stringify({ id, link: query().toString(), wrist: d.wrist, gift: d.gift, placement, from: openedFrom.current });
    if (!navigator.sendBeacon?.("/api/design-leads", new Blob([lead], { type: "application/json" })))
      fetch("/api/design-leads", { method: "POST", body: lead, keepalive: true }).catch(() => {});
    // And one on this phone, for the account panel.
    saveDesign({ id, name: previewName, query: query().toString(), bead: main.beads[0] ?? main.colour, savedAt: new Date().toISOString() });
  };
  const share = async () => {
    if (blocked) return;
    const url = shareUrl();
    if (navigator.share) {
      try {
        await navigator.share({ title: "My BWA bracelet", text: `${main.name}, designed by me`, url });
        trackGa4Event("share", { method: "native", content_type: "design", item_id: d.main });
      } catch {
        // Closing the share sheet is not a share.
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
      trackGa4Event("share", { method: "copy_link", content_type: "design", item_id: d.main });
    } catch {
      window.prompt("Copy this link", url);
    }
  };
  const pickMain = (slug: string, from: "grid" | "suggestion" = "grid") => {
    setD((prev) => ({
      ...prev,
      main: slug,
      ...(slug === prev.second ? { second: otherThan(slug) } : {}),
      gone: { ...prev.gone, main: undefined },
    }));
    changes.current += 1;
    trackGa4Event("design_your_own_stone", { stone: slug, role: "main", from });
  };
  const pickSecond = (slug: string, from: "grid" | "suggestion" = "grid") => {
    setD((prev) => ({ ...prev, second: slug, gone: { ...prev.gone, second: undefined } }));
    setPickingSecond(false);
    changes.current += 1;
    trackGa4Event("design_your_own_stone", { stone: slug, role: "second", from });
  };
  const ideas = IDEAS.flatMap((idea) => {
    const a = stones.find((s) => s.slug === idea.main), b = stones.find((s) => s.slug === idea.second);
    return a && b ? [{ ...idea, a, b }] : [];
  });
  const startFrom = (main: string, second: string, pattern: Pattern, from: string, extra: Partial<Design> = {}) => {
    set({ main, second, pattern, gone: {}, ...extra });
    setPickingSecond(false);
    changes.current += 1;
    trackGa4Event("design_your_own_idea", { idea: from, stone: main, second_stone: pattern === "one" ? undefined : second });
  };
  const surprise = () => {
    const pick = <T,>(list: T[]) => list[Math.floor(Math.random() * list.length)];
    const main = pick(stones).slug;
    const pattern = canPair ? pick<Pattern>(["one", "alt", "alt", "accent"]) : "one";
    startFrom(main, canPair ? pick(stones.filter((s) => s.slug !== main)).slug : main, pattern, "surprise", { spacers: Math.random() < 0.3 });
  };
  const goTo = (step: number) => {
    setOpen(step);
    requestAnimationFrame(() => stepRefs.current[step]?.scrollIntoView({ behavior: "smooth", block: "start" }));
  };
  const pickFromRing = (role: Role) => {
    if (role === "second") {
      setPickingSecond(true);
      goTo(2);
    } else goTo(1);
  };
  const choosePattern = (pattern: Pattern) => {
    // Going to two stones for the first time: choose the second one now.
    if (pattern !== "one" && d.pattern === "one") setPickingSecond(true);
    if (pattern === "one") setPickingSecond(false);
    choose("pattern", pattern, { pattern });
  };

  const swatches = (list: DesignStone[], role: Role) => (
    <div className="dyo-swatches" role="group" aria-label={role === "main" ? "Stones" : "Second stone"}>
      {list.map((s) => {
        const picked = role === "main" ? !goneMain && d.main === s.slug : !goneSecond && d.second === s.slug;
        return (
          <button
            key={s.slug}
            type="button"
            aria-pressed={picked}
            disabled={role === "second" && s.slug === d.main}
            title={s.stone ? `${s.name}, ${s.stone}` : s.name}
            onClick={() => (role === "main" ? pickMain(s.slug) : pickSecond(s.slug))}
          >
            <Bead stone={s} ready={ready} />
            <span>{s.name}</span>
            {picked && <Check className="dyo-tick" size={12} strokeWidth={3} aria-hidden="true" />}
          </button>
        );
      })}
    </div>
  );
  // A stone from the link is gone: say so, and offer the closest ones.
  const goneNotice = (role: Role, g: Gone) => (
    <div className="dyo-gone" role="status">
      <TriangleAlert size={18} aria-hidden="true" />
      <div>
        <p>
          <b>{g.name}</b> from this design isn&apos;t available any more. Pick a {role === "main" ? "stone" : "second stone"} to replace it:
        </p>
        <div className="dyo-gone-picks">
          {similarStones(stones.filter((s) => role === "main" || s.slug !== d.main), g.retired).map((s) => (
            <button key={s.slug} type="button" onClick={() => (role === "main" ? pickMain(s.slug, "suggestion") : pickSecond(s.slug, "suggestion"))}>
              <Bead stone={s} ready={ready} />
              <span><b>{s.name}</b>{s.stone}</span>
            </button>
          ))}
        </div>
        <small>Or choose any stone below.</small>
      </div>
    </div>
  );
  const step = (n: number, heading: string, summary: string, body: React.ReactNode, next?: string) => (
    <section className="dyo-step" data-open={open === n} ref={(el) => { stepRefs.current[n] = el; }}>
      <button type="button" className="dyo-step-head" aria-expanded={open === n} onClick={() => setOpen(open === n ? 0 : n)}>
        <span className="dyo-step-num">0{n}</span>
        <h2>{heading}</h2>
        <span className="dyo-step-sum">{summary}</span>
        <ChevronDown className="dyo-step-chev" size={18} aria-hidden="true" />
      </button>
      <div className="dyo-step-body">
        {body}
        {next && (
          <button type="button" className="btn btn-outline dyo-next" onClick={() => goTo(n + 1)}>
            Next: {next}
          </button>
        )}
      </div>
    </section>
  );

  return (
    <main className="dyo-page" data-bar={!summaryInView}>
      <section className="dyo-intro">
        <p className="eyebrow">Design your own</p>
        <h1>Make it yours.</h1>
        <p>Pick your stones, the style and the fit. We make it by hand in Kenya and confirm the details with you on WhatsApp.</p>
      </section>
      <div className="dyo-layout">
        <aside className="dyo-preview" aria-label="Your bracelet">
          <Ring design={d} main={main} second={second} ready={ready} onPick={pickFromRing} />
          <div className="dyo-preview-meta">
            <p>
              <b>{previewName}</b>
              <span>
                {[!goneMain && main.stone, two && !goneSecond && second.stone].filter(Boolean).join(" + ")}
                {" · "}
                {d.size === "large" ? "Large" : "Medium"} beads
              </span>
            </p>
            <p className="dyo-preview-price"><PriceRange base={base} /></p>
          </div>
          <p className="dyo-note">Bead photos are of the real stones. We confirm the final piece with you on WhatsApp.</p>
        </aside>

        <div className="dyo-steps">
          <div className="dyo-ideas" role="group" aria-label="Start from an idea">
            <p className="dyo-label">Start from an idea</p>
            <div>
              {ideas.map((idea) => (
                <button key={idea.name} type="button" onClick={() => startFrom(idea.a.slug, idea.b.slug, idea.pattern, idea.name)}>
                  <span className="dyo-idea-beads">
                    <Bead stone={idea.a} ready={ready} />
                    <Bead stone={idea.b} ready={ready} />
                  </span>
                  {idea.name}
                </button>
              ))}
              <button type="button" onClick={surprise}>
                <span className="dyo-idea-beads dyo-idea-shuffle"><Shuffle size={20} aria-hidden="true" /></span>
                Surprise me
              </button>
            </div>
          </div>
          {step(
            1,
            "Stones",
            mainName,
            <>
              <div className="dyo-chips" role="group" aria-label="Filter by feeling">
                {[null, ...FEELINGS].map((f) => (
                  <button
                    key={f ?? "all"}
                    type="button"
                    aria-pressed={d.feeling === f}
                    onClick={() => {
                      set({ feeling: f });
                      if (f) trackGa4Event("design_your_own_feeling", { feeling: f });
                    }}
                  >
                    {f ? title(f) : `All ${stones.length}`}
                  </button>
                ))}
              </div>
              {goneMain && goneNotice("main", goneMain)}
              {shown.length ? swatches(shown, "main") : <p className="dyo-note">No stone matches that feeling yet.</p>}
              {!goneMain && (
                <div className="dyo-stone-card">
                  {main.image && <StoreImage src={main.image} alt={`${main.name} bracelet`} sizes="88px" width={176} height={176} />}
                  <div>
                    <p className="dyo-stone-card-name"><b>{main.name}</b>{main.stone}</p>
                    {!!main.feelings.length && (
                      <p>Traditionally associated with {main.feelings.slice(0, 3).join(", ")}.</p>
                    )}
                    <p className="dyo-stone-card-price">
                      Bracelet <Money prices={main.prices} />
                      {main.listed && <Link href={`/product/${main.product}`}>See it</Link>}
                    </p>
                  </div>
                </div>
              )}
              <p className="dyo-note">Feelings are what each stone is traditionally associated with.</p>
            </>,
            "Style",
          )}

          {step(
            2,
            "Style",
            [two ? PATTERN_NAMES[d.pattern] : "One stone", ...extras].join(" · "),
            <>
              <div className="dyo-patterns" role="group" aria-label="Design">
                {PATTERNS.filter(([v]) => canPair || v === "one").map(([v, label]) => (
                  <button key={v} type="button" aria-pressed={d.pattern === v} onClick={() => choosePattern(v)}>
                    <PatternIcon pattern={v} />
                    {label}
                  </button>
                ))}
              </div>
              {two && (
                <div className="dyo-slots">
                  <button type="button" onClick={() => goTo(1)}>
                    <Bead stone={main} ready={ready} />
                    <span><small>Main stone</small>{mainName}</span>
                  </button>
                  <button type="button" aria-expanded={pickingSecond} data-gone={!!goneSecond} onClick={() => setPickingSecond(!pickingSecond)}>
                    {goneSecond ? <span className="dyo-bead dyo-bead-empty" /> : <Bead stone={second} ready={ready} />}
                    <span><small>{d.pattern === "accent" ? "Accent stone" : "Second stone"}</small>{secondName}</span>
                    <ChevronDown size={16} aria-hidden="true" />
                  </button>
                </div>
              )}
              {two && pickingSecond && (
                <div className="dyo-sub">
                  {goneSecond && goneNotice("second", goneSecond)}
                  {swatches(stones, "second")}
                </div>
              )}
              <div className="dyo-toggles">
                <label className="dyo-toggle">
                  <input type="checkbox" checked={d.spacers} onChange={(e) => choose("spacers", e.target.checked, { spacers: e.target.checked })} />
                  <span><b>Spacer beads</b><small>Small beads between the stones. We show you the colours on WhatsApp.</small></span>
                </label>
                <div className="dyo-toggle">
                  <input type="checkbox" id="dyo-letters-on" checked={d.lettersOn} onChange={(e) => choose("letters", e.target.checked, { lettersOn: e.target.checked })} />
                  <div>
                    <label htmlFor="dyo-letters-on"><b>Letters</b><small>Initials, a name or a short word.</small></label>
                    {d.lettersOn && (
                      <div className="dyo-more">
                        <label className="dyo-field">
                          Your letters
                          <input value={d.letters} autoComplete="off" placeholder="e.g. AK" maxLength={30} onChange={(e) => set({ letters: e.target.value })} />
                        </label>
                        {d.letters.replace(/\s+/g, "").length > LETTERS_COMFORT && (
                          <span className="dyo-warn">Over {LETTERS_COMFORT} letters gets crowded. Shorter reads better.</span>
                        )}
                        <Segmented label="Letter beads" value={d.letterKind} options={[["metal", "Metal"], ["acrylic", "Acrylic"]]} onChange={(letterKind) => choose("letter_kind", letterKind, { letterKind })} />
                      </div>
                    )}
                  </div>
                </div>
                <label className="dyo-toggle">
                  <input type="checkbox" checked={d.charm} onChange={(e) => choose("charm", e.target.checked, { charm: e.target.checked })} />
                  <span><b>A charm</b><small>Tell us what you&apos;d like. We show you what we have on WhatsApp.</small></span>
                </label>
              </div>
            </>,
            "Fit",
          )}

          {step(
            3,
            "Fit",
            `${d.size === "large" ? "Large" : "Medium"} beads · ${d.wrist ? `${d.wrist} cm` : "wrist not sure"}${d.gift ? " · gift" : ""}`,
            <>
              <div className="dyo-fit">
                <p className="dyo-label">Bead size</p>
                <Segmented label="Bead size" value={d.size} options={[["medium", "Medium"], ["large", "Large"]]} onChange={(size) => choose("bead_size", size, { size })} />
              </div>
              <div className="dyo-fit">
                <p className="dyo-label">Around the wrist</p>
                <div className="dyo-chips" role="group" aria-label="Wrist size">
                  <button type="button" aria-pressed={d.wrist === null} onClick={() => choose("wrist", null, { wrist: null })}>Not sure</button>
                  {WRISTS.map((w) => (
                    <button key={w} type="button" aria-pressed={d.wrist === w} onClick={() => choose("wrist", w, { wrist: w })}>{w} cm</button>
                  ))}
                </div>
                <p className="dyo-note">
                  {d.wrist === null
                    ? "No problem: we'll help you measure on WhatsApp."
                    : "Wrap a string around the wrist, mark it, and measure it on a ruler."}
                </p>
              </div>
              <label className="dyo-toggle">
                <input type="checkbox" checked={d.gift} onChange={(e) => choose("gift", e.target.checked, { gift: e.target.checked })} />
                <span><b>It&apos;s a gift</b><small>Add a message for the card.</small></span>
              </label>
              {d.gift && (
                <label className="dyo-field dyo-gift">
                  Card message (optional)
                  <textarea value={d.message} placeholder="What should the card say?" onChange={(e) => set({ message: e.target.value })} />
                </label>
              )}
            </>,
          )}

          <section className="dyo-summary" aria-label="Your design" ref={summaryRef}>
            <p className="eyebrow">Your design</p>
            <h2>{previewName}</h2>
            <ul>
              {summaryRows.map(([a, b]) => (
                <li key={a}><span>{a}</span><span>{b}</span></li>
              ))}
            </ul>
            <div className="dyo-price">
              <p className="dyo-price-range"><PriceRange base={base} /></p>
              <p>
                The listed price (<Money prices={base} />) plus KES {EXTRA_KES[0]}–{EXTRA_KES[1]} for the design. We confirm the final price and making time on WhatsApp.
              </p>
            </div>
            {blocked && <p className="dyo-warn">Replace the stone that&apos;s no longer available, then send your design.</p>}
            <button type="button" className="btn btn-whatsapp dyo-send" onClick={() => send("summary")} disabled={blocked}>
              <FaWhatsapp size={18} aria-hidden="true" /> Send my design on WhatsApp
            </button>
            <button type="button" className="btn btn-outline dyo-share" onClick={share} disabled={blocked}>
              <Share2 size={16} aria-hidden="true" /> {copied ? "Link copied" : "Share this design"}
            </button>
          </section>
        </div>
      </div>

      <div className="dyo-bar" aria-hidden={summaryInView}>
        <p>
          <small>Your design</small>
          <b><PriceRange base={base} /></b>
        </p>
        <button type="button" className="btn btn-whatsapp" onClick={() => send("bar")} disabled={blocked} tabIndex={summaryInView ? -1 : 0}>
          <FaWhatsapp size={18} aria-hidden="true" /> Send on WhatsApp
        </button>
      </div>
    </main>
  );
}
