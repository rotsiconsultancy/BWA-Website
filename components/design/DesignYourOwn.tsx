"use client";

import { useEffect, useMemo, useState } from "react";
import { Check, Share2, TriangleAlert } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import StoreImage from "@/components/commerce/StoreImage";
import Money from "@/components/commerce/Money";
import { beadImage, SHAPE_BOX, widthOf } from "@/lib/design/beads";
import {
  DESIGN_LINK_VERSION,
  type DesignStone,
  findStone,
  findStoneByProduct,
  type RetiredStone,
  similarStones,
} from "@/lib/design/stones";
import { trackGa4Event } from "@/lib/marketing/ga4";

type Pattern = "one" | "alt" | "accent";
type Design = {
  forWhom: "me" | "gift";
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
  wrist: string;
  notSure: boolean;
  gift: string;
  /** Stones a shared link asked for that the page no longer offers, by role. */
  gone: { main?: Gone; second?: Gone };
};
type Gone = { code: string; name: string; retired?: RetiredStone };

const WHATSAPP = "254745474586";
const FEELINGS = ["calm", "grounding", "focus", "clarity", "vitality", "protection"];
const PATTERNS: [Pattern, string][] = [
  ["one", "One stone"],
  ["alt", "Two stones, alternating"],
  ["accent", "Main + accents"],
];
const PATTERN_NAMES: Record<Pattern, string> = {
  one: "One stone",
  alt: "Two stones, alternating",
  accent: "Main stone with accents",
};
// Letters past this many get crowded on a bracelet (owner, 2026-10-28).
const LETTERS_COMFORT = 10;

// Ring geometry, in the preview's 600 × 600 drawing.
const R = 200, CX = 300, CY = 280, SPACER = 0.38, CUBE = 0.74;
// Rounded so the server and the browser draw identical numbers (trig can
// differ in the last digits, which React reports as a hydration mismatch).
const r2 = (n: number) => Math.round(n * 100) / 100;
type Item =
  | { kind: "bead"; stone: DesignStone; gone: boolean; w: number; idx: number }
  | { kind: "spacer"; w: number }
  | { kind: "letter"; ch: string; w: number };

function layout(d: Design, main: DesignStone, second: DesignStone) {
  const letters = d.lettersOn ? d.letters.replace(/\s+/g, "").slice(0, 14) : "";
  const target = d.size === "large" ? 16 : 21; // beads around, in diameters
  const per = widthOf(main.shape) + (d.spacers ? SPACER : 0);
  const count = Math.max(4, Math.round((target - letters.length * CUBE) / per));
  const items: Item[] = [...letters].map((ch) => ({ kind: "letter" as const, ch, w: CUBE }));
  for (let i = 0; i < count; i++) {
    const isSecond = (d.pattern === "alt" && i % 2 === 1) || (d.pattern === "accent" && i % 4 === 2);
    const stone = isSecond ? second : main;
    const gone = !!(isSecond ? d.gone.second : d.gone.main);
    items.push({ kind: "bead", stone, gone, w: widthOf(stone.shape), idx: i });
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

function Ring({ design, main, second, ready }: { design: Design; main: DesignStone; second: DesignStone; ready: boolean }) {
  const { placed, unit, beadR, charmAt } = useMemo(() => layout(design, main, second), [design, main, second]);
  const charm = (() => {
    const ax = r2(CX + R * Math.cos(charmAt)), ay = r2(CY + R * Math.sin(charmAt));
    const jr = beadR * 0.34, cr = beadR * 0.78, jy = ay + beadR * 0.62, cy = jy + jr + cr * 0.95;
    return { ax, ay, jr, cr, jy, cy };
  })();
  const metalFill = design.letterKind === "metal" ? "url(#dyo-metal)" : "url(#dyo-acrylic)";
  return (
    <svg viewBox="0 0 600 600" role="img" aria-label="Preview of your bracelet">
      <defs>
        <linearGradient id="dyo-metal" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e9e6e0" />
          <stop offset=".5" stopColor="#a9a59c" />
          <stop offset="1" stopColor="#6f6b64" />
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
        <filter id="dyo-drop" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="5" stdDeviation="5" floodColor="#171716" floodOpacity=".22" />
        </filter>
      </defs>
      {design.charm && (
        <g filter="url(#dyo-drop)">
          <line x1={charm.ax} y1={charm.ay} x2={charm.ax} y2={charm.jy - charm.jr} stroke="#8d887f" strokeWidth={beadR * 0.1} />
          <circle cx={charm.ax} cy={charm.jy} r={charm.jr} fill="none" stroke="url(#dyo-metal)" strokeWidth={beadR * 0.14} />
          <circle cx={charm.ax} cy={charm.cy} r={charm.cr} fill="url(#dyo-charm)" stroke="rgba(0,0,0,.3)" />
          <circle cx={charm.ax} cy={charm.cy} r={charm.cr * 0.72} fill="none" stroke="rgba(255,255,255,.4)" strokeWidth="1.5" />
        </g>
      )}
      <g filter="url(#dyo-drop)">
        <circle cx={CX} cy={CY} r={R} fill="none" stroke="#3a3833" strokeWidth="2" opacity=".5" />
        {placed.map((it, k) => {
          if (it.kind === "bead") {
            const { shape, beads } = it.stone;
            const [bx, by] = SHAPE_BOX[shape];
            const w = beadR * 2 * bx, h = beadR * 2 * by;
            // A stone a shared link asked for that is gone: an empty place to fill.
            if (it.gone)
              return <circle key={k} cx={it.x} cy={it.y} r={beadR * 0.9} fill="#efe9df" stroke="#a39a8c" strokeWidth="2" strokeDasharray="5 4" />;
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
              />
            ) : (
              <circle key={k} cx={it.x} cy={it.y} r={beadR} fill="#d8d0c2" />
            );
          }
          if (it.kind === "spacer") {
            const r = (it.w * unit) / 2;
            return (
              <ellipse key={k} cx={it.x} cy={it.y} rx={r * 0.55} ry={r * 1.25} transform={`rotate(${it.deg} ${it.x} ${it.y})`} fill="url(#dyo-metal)" stroke="rgba(0,0,0,.25)" />
            );
          }
          const s = unit * CUBE * 0.96;
          return (
            <g key={k} transform={`translate(${it.x} ${it.y}) rotate(${it.deg + 90})`}>
              <rect x={-s / 2} y={-s / 2} width={s} height={s} rx={s * 0.18} fill={metalFill} stroke="rgba(0,0,0,.22)" />
              <rect x={-s / 2 + 2} y={-s / 2 + 2} width={s - 4} height={s * 0.35} rx={s * 0.14} fill="#fff" opacity=".25" />
              <text y={s * 0.2} textAnchor="middle" fontFamily="Manrope, sans-serif" fontWeight="700" fontSize={s * 0.56} fill="#1f1e1c">
                {it.ch.toUpperCase()}
              </text>
            </g>
          );
        })}
      </g>
    </svg>
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
    forWhom: "me",
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
    wrist: "",
    notSure: false,
    gift: "",
    gone: {},
  }));
  const [ready, setReady] = useState(false);
  const [copied, setCopied] = useState(false);
  const set = (patch: Partial<Design>) => setD((prev) => ({ ...prev, ...patch }));
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
      const name = was?.name ?? code.split("-").map((w) => w && w[0].toUpperCase() + w.slice(1)).join(" ");
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
    setReady(true);
    trackGa4Event("design_your_own_view", { shared: q.has("stone"), link_version: Number(q.get("v") ?? 1) });
    for (const [role, g] of Object.entries(gone))
      trackGa4Event("design_your_own_missing_stone", { stone: g.code, role, known: !!g.retired });
  }, []);

  const main = find(d.main), second = find(d.second), two = d.pattern !== "one";
  // Places still to fill before the design can be sent.
  const goneMain = d.gone.main, goneSecond = two ? d.gone.second : undefined;
  const blocked = !!(goneMain || goneSecond);
  const shown = stones.filter((s) => !d.feeling || s.feelings.includes(d.feeling));
  const letters = d.letters.trim();
  const rows: [string, string][] = [
    ["Main stone", goneMain ? `${goneMain.name} (no longer available)` : `${main.name}${main.stone && ` (${main.stone})`}`],
    ...(two ? [["Second stone", goneSecond ? `${goneSecond.name} (no longer available)` : `${second.name}${second.stone && ` (${second.stone})`}`] as [string, string]] : []),
    ["Design", PATTERN_NAMES[d.pattern]],
    ["Bead size", d.size === "large" ? "Large" : "Medium"],
    ["Spacers", d.spacers ? "Yes" : "No"],
    ["Letters", d.lettersOn && letters ? `${letters} (${d.letterKind})` : "No"],
    ["Charm", d.charm ? "Yes, show me the options" : "No"],
    ["Wrist", d.notSure ? "Not sure, help me" : d.wrist ? `${d.wrist} cm` : "Not given yet"],
    ...(d.forWhom === "gift" ? [["Gift", d.gift.trim() ? "Yes, with a message" : "Yes"] as [string, string]] : []),
  ];

  const shareUrl = () => {
    const p = new URLSearchParams({ v: String(DESIGN_LINK_VERSION), stone: d.main, design: d.pattern, size: d.size });
    if (two) p.set("with", d.second);
    if (d.spacers) p.set("spacers", "1");
    if (d.lettersOn && letters) {
      p.set("letters", letters);
      p.set("kind", d.letterKind);
    }
    if (d.charm) p.set("charm", "1");
    return `${window.location.origin}/design-your-own?${p}`;
  };
  const designEvent = () => ({
    stone: d.main,
    second_stone: two ? d.second : undefined,
    pattern: d.pattern,
    bead_size: d.size,
    spacers: d.spacers,
    letters: d.lettersOn && !!letters,
    charm: d.charm,
    gift: d.forWhom === "gift",
  });
  const send = () => {
    if (blocked) return;
    const lines = [
      "Hello BWA, I designed a bracelet on your website:",
      ...rows.map(([a, b]) => `• ${a}: ${b}`),
      ...(d.forWhom === "gift" && d.gift.trim() ? [`• Gift message: ${d.gift.trim()}`] : []),
      "",
      `Design link: ${shareUrl()}`,
    ];
    trackGa4Event("design_your_own_send", designEvent());
    window.open(`https://wa.me/${WHATSAPP}?text=${encodeURIComponent(lines.join("\n"))}`, "_blank", "noopener,noreferrer");
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
    trackGa4Event("design_your_own_stone", { stone: slug, role: "main", from });
  };
  const pickSecond = (slug: string, from: "grid" | "suggestion" = "grid") => {
    setD((prev) => ({ ...prev, second: slug, gone: { ...prev.gone, second: undefined } }));
    trackGa4Event("design_your_own_stone", { stone: slug, role: "second", from });
  };
  const stoneButton = (s: DesignStone, role: "main" | "second") => {
    const picked = role === "main" ? !goneMain && d.main === s.slug : !goneSecond && d.second === s.slug;
    return (
      <button
        key={s.slug}
        type="button"
        aria-pressed={picked}
        disabled={role === "second" && s.slug === d.main}
        onClick={() => (role === "main" ? pickMain(s.slug) : pickSecond(s.slug))}
      >
        {s.image ? (
          <StoreImage src={s.image} alt="" sizes="(max-width: 860px) 30vw, 140px" width={300} height={300} />
        ) : (
          <span className="dyo-swatch" style={{ background: s.colour ?? "#8a8279" }} aria-hidden="true" />
        )}
        <span>
          <b>{s.name}</b>
          {s.stone}
        </span>
        {picked && <Check className="dyo-tick" size={14} aria-hidden="true" />}
      </button>
    );
  };
  // A stone from the link is gone: say so, and offer the closest ones.
  const goneNotice = (role: "main" | "second", g: Gone) => (
    <div className="dyo-gone" role="status">
      <TriangleAlert size={18} aria-hidden="true" />
      <div>
        <p>
          <b>{g.name}</b> from this design isn&apos;t available any more. Pick a {role === "main" ? "stone" : "second stone"} to replace it:
        </p>
        <div className="dyo-gone-picks">
          {similarStones(stones.filter((s) => role === "main" || s.slug !== d.main), g.retired).map((s) => (
            <button key={s.slug} type="button" onClick={() => (role === "main" ? pickMain(s.slug, "suggestion") : pickSecond(s.slug, "suggestion"))}>
              {s.image && <StoreImage src={s.image} alt="" sizes="48px" width={96} height={96} />}
              <span><b>{s.name}</b>{s.stone}</span>
            </button>
          ))}
        </div>
        <small>Or choose any stone below.</small>
      </div>
    </div>
  );
  const from = (two && (second.prices.KES > main.prices.KES) ? second : main).prices;
  const previewName = `${goneMain ? goneMain.name : main.name}${two ? ` + ${goneSecond ? goneSecond.name : second.name}` : ""}`;

  return (
    <main className="dyo-page">
      <section className="dyo-intro">
        <p className="eyebrow">Design your own</p>
        <h1>Make it yours.</h1>
        <p>
          Pick your stones, the design and the size. We make it by hand in
          Kenya and confirm the details with you on WhatsApp.
        </p>
      </section>
      <div className="dyo-layout">
        <aside className="dyo-preview" aria-label="Your bracelet">
          <Ring design={d} main={main} second={second} ready={ready} />
          <div className="dyo-preview-meta">
            {main.image && !goneMain && <StoreImage src={main.image} alt={`${main.name} ${main.stone} bracelet`} sizes="64px" width={128} height={128} />}
            <p>
              <b>{previewName}</b>
              {!goneMain && main.stone}{two && !goneSecond && ` with ${second.stone}`} · {d.size === "large" ? "Large" : "Medium"} beads
            </p>
          </div>
          <p className="dyo-note">The ring is a drawing to show the design. The photos are the real stones.</p>
        </aside>

        <div className="dyo-steps">
          <section className="dyo-step">
            <header><span>01</span><h2>Who is it for?</h2></header>
            <Segmented label="Who is it for" value={d.forWhom} options={[["me", "For me"], ["gift", "A gift"]]} onChange={(forWhom) => set({ forWhom })} />
          </section>

          <section className="dyo-step">
            <header><span>02</span><h2>Pick a feeling</h2><small>Optional</small></header>
            <div className="dyo-chips">
              {[null, ...FEELINGS].map((f) => (
                <button
                  key={f ?? "all"}
                  type="button"
                  aria-pressed={d.feeling === f}
                  onClick={() => {
                    const list = stones.filter((s) => !f || s.feelings.includes(f));
                    set({ feeling: f, ...(list.some((s) => s.slug === d.main) || !list[0] ? {} : { main: list[0].slug }) });
                  }}
                >
                  {f ? f[0].toUpperCase() + f.slice(1) : "All"}
                </button>
              ))}
            </div>
            <p className="dyo-note">Shows stones traditionally associated with that feeling.</p>
          </section>

          <section className="dyo-step">
            <header><span>03</span><h2>Choose your stone</h2><small>{shown.length} stones</small></header>
            {goneMain && goneNotice("main", goneMain)}
            <div className="dyo-stones">{shown.map((s) => stoneButton(s, "main"))}</div>
          </section>

          <section className="dyo-step">
            <header><span>04</span><h2>Choose the design</h2></header>
            <div className="dyo-patterns" role="group" aria-label="Design">
              {PATTERNS.filter(([v]) => canPair || v === "one").map(([v, label]) => (
                <button key={v} type="button" aria-pressed={d.pattern === v} onClick={() => set({ pattern: v })}>
                  <PatternIcon pattern={v} />
                  {label}
                </button>
              ))}
            </div>
            {two && (
              <div className="dyo-sub">
                <p>Pick your second stone</p>
                {goneSecond && goneNotice("second", goneSecond)}
                <div className="dyo-stones">{stones.map((s) => stoneButton(s, "second"))}</div>
              </div>
            )}
            <div className="dyo-toggles">
              <label className="dyo-toggle">
                <input type="checkbox" checked={d.spacers} onChange={(e) => set({ spacers: e.target.checked })} />
                <span><b>Add spacer beads</b><small>Small beads between the stones. We show you the colours on WhatsApp.</small></span>
              </label>
              <div className="dyo-toggle">
                <input type="checkbox" id="dyo-letters-on" checked={d.lettersOn} onChange={(e) => set({ lettersOn: e.target.checked })} />
                <div>
                  <label htmlFor="dyo-letters-on"><b>Add letters</b><small>Initials, a name or a short word.</small></label>
                  {d.lettersOn && (
                    <div className="dyo-more">
                      <label className="dyo-field">
                        Your letters
                        <input value={d.letters} autoComplete="off" placeholder="e.g. AK" maxLength={30} onChange={(e) => set({ letters: e.target.value })} />
                      </label>
                      {d.letters.replace(/\s+/g, "").length > LETTERS_COMFORT && (
                        <span className="dyo-warn">Over {LETTERS_COMFORT} letters gets crowded. Shorter reads better.</span>
                      )}
                      <Segmented label="Letter beads" value={d.letterKind} options={[["metal", "Metal"], ["acrylic", "Acrylic"]]} onChange={(letterKind) => set({ letterKind })} />
                    </div>
                  )}
                </div>
              </div>
              <label className="dyo-toggle">
                <input type="checkbox" checked={d.charm} onChange={(e) => set({ charm: e.target.checked })} />
                <span><b>Add a charm</b><small>Tell us what you&apos;d like. We show you what we have on WhatsApp.</small></span>
              </label>
            </div>
          </section>

          <section className="dyo-step">
            <header><span>05</span><h2>Bead size</h2></header>
            <Segmented label="Bead size" value={d.size} options={[["medium", "Medium"], ["large", "Large"]]} onChange={(size) => set({ size })} />
          </section>

          <section className="dyo-step">
            <header><span>06</span><h2>Wrist size</h2></header>
            <div className="dyo-row">
              <label className="dyo-field">
                Around the wrist, in cm
                <input inputMode="decimal" placeholder="e.g. 17" value={d.wrist} disabled={d.notSure} onChange={(e) => set({ wrist: e.target.value.trim() })} />
              </label>
              <label className="dyo-toggle">
                <input type="checkbox" checked={d.notSure} onChange={(e) => set({ notSure: e.target.checked })} />
                <span><b>Not sure</b><small>We&apos;ll help you on WhatsApp.</small></span>
              </label>
            </div>
            <p className="dyo-note">Wrap a string around the wrist, mark it, and measure it on a ruler.</p>
            {d.forWhom === "gift" && (
              <label className="dyo-field dyo-gift">
                Gift message (optional)
                <textarea value={d.gift} placeholder="What should the card say?" onChange={(e) => set({ gift: e.target.value })} />
              </label>
            )}
          </section>

          <section className="dyo-summary" aria-label="Your design">
            <p className="eyebrow">Your design</p>
            <h2>{previewName}</h2>
            <ul>
              {rows.map(([a, b]) => (
                <li key={a}><span>{a}</span><span>{b}</span></li>
              ))}
            </ul>
            <p className="dyo-price">
              <b>Price depends on your design.</b> Usually the listed price (from <Money prices={from} />) plus KES 100–500. Making time and the final price are confirmed on WhatsApp.
            </p>
            {blocked && <p className="dyo-warn">Replace the stone that&apos;s no longer available, then send your design.</p>}
            <button type="button" className="btn btn-whatsapp dyo-send" onClick={send} disabled={blocked}>
              <FaWhatsapp size={18} aria-hidden="true" /> Send my design on WhatsApp
            </button>
            <button type="button" className="btn btn-outline dyo-share" onClick={share} disabled={blocked}>
              <Share2 size={16} aria-hidden="true" /> {copied ? "Link copied" : "Share this design"}
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}
