import { ImageResponse } from "next/og";
import { readDesignParams, resolveDesign } from "@/lib/design/design-link";
import { getDesignStones } from "@/lib/design/stones-server";
import type { DesignStone } from "@/lib/design/stones";
import { materialColour } from "@/lib/design/beads";

// The picture WhatsApp, Instagram and others show for a shared design link:
// the bracelet as a ring of its real bead photos, with its name. A link whose
// stones are gone gets a plain card instead.
const W = 1200, H = 630;
const RING = { cx: 330, cy: 315, r: 210 };

let serif: ArrayBuffer | null | undefined;
async function serifFont() {
  if (serif !== undefined) return serif;
  try {
    // With no browser user agent, Google Fonts answers with a TTF, which the renderer needs.
    const css = await fetch("https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500").then((r) => r.text());
    const url = css.match(/src: url\((.+?)\)/)?.[1];
    serif = url ? await fetch(url).then((r) => r.arrayBuffer()) : null;
  } catch {
    serif = null;
  }
  return serif;
}

/** A stone without bead photos: a lit sphere in its colour. */
function beadFill(stone: DesignStone) {
  return { backgroundImage: `radial-gradient(circle at 35% 30%, #ffffff66, ${stone.colour ?? materialColour(stone.slug) ?? "#8a8279"} 45%, #00000055)` };
}

// Bead photos as PNG data URLs (the .png copy cut-beads.py saves beside each
// .webp); a photo that can't be fetched falls back to the stone's colour.
const pngCache = new Map<string, string | null>();
async function beadPng(url: string) {
  if (pngCache.has(url)) return pngCache.get(url)!;
  let data: string | null = null;
  try {
    const res = await fetch(url.replace(/\.webp$/, ".png"));
    if (res.ok && res.headers.get("content-type")?.includes("png"))
      data = `data:image/png;base64,${Buffer.from(await res.arrayBuffer()).toString("base64")}`;
  } catch {
    // Leave it to the colour.
  }
  pngCache.set(url, data);
  return data;
}

export async function GET(request: Request) {
  const params = readDesignParams(new URL(request.url).searchParams);
  const { stones } = await getDesignStones();
  const resolved = params ? resolveDesign(stones, params) : null;
  const font = await serifFont();
  const fonts = font ? [{ name: "Cormorant", data: font, weight: 500 as const, style: "normal" as const }] : undefined;
  const serifFamily = font ? "Cormorant" : "serif";

  if (!params || !resolved) {
    return new ImageResponse(
      (
        <div style={{ width: W, height: H, display: "flex", flexDirection: "column", justifyContent: "center", padding: 90, background: "#f5f1e8", color: "#1f1e1c" }}>
          <div style={{ fontSize: 28, letterSpacing: 6, color: "#a88b5a" }}>BEADS WORLD AFRICA</div>
          <div style={{ fontSize: 96, fontFamily: serifFamily, marginTop: 16 }}>Design your own</div>
          <div style={{ fontSize: 34, color: "#6b655c", marginTop: 12 }}>Natural stone bracelets, handmade in Kenya.</div>
        </div>
      ),
      { width: W, height: H, fonts, headers: { "Cache-Control": "public, max-age=3600" } },
    );
  }

  const { main, second } = resolved;
  const two = params.pattern !== "one" && second;
  const count = params.size === "large" ? 16 : 20;
  const beadR = Math.round((Math.PI * RING.r) / count * 0.97);
  const beads = Array.from({ length: count }, (_, i) => {
    const isSecond = two && ((params.pattern === "alt" && i % 2 === 1) || (params.pattern === "accent" && i % 4 === 2));
    const a = -Math.PI / 2 + (i / count) * 2 * Math.PI;
    return { stone: isSecond ? second! : main, x: RING.cx + RING.r * Math.cos(a), y: RING.cy + RING.r * Math.sin(a), i };
  });
  const photos = new Map<string, string | null>();
  await Promise.all(
    [...new Set(beads.flatMap((b) => b.stone.beads))].map(async (u) => photos.set(u, await beadPng(u))),
  );
  const name = two ? `${main.name} + ${second!.name}` : main.name;
  const kinds = [main.stone, two ? second!.stone : null].filter(Boolean).join(" + ");
  const extras = [params.spacers && "spacers", params.letters && `letters ${params.letters.toUpperCase()}`, params.charm && "a charm"].filter(Boolean);

  return new ImageResponse(
    (
      <div style={{ width: W, height: H, display: "flex", background: "#f5f1e8", color: "#1f1e1c" }}>
        <div style={{ width: 660, height: H, display: "flex", position: "relative", background: "#ebe6dc" }}>
          {beads.map((b) => {
            const photo = b.stone.beads.length ? photos.get(b.stone.beads[b.i % b.stone.beads.length]) : null;
            const box = { position: "absolute", left: b.x - beadR, top: b.y - beadR, width: beadR * 2, height: beadR * 2, borderRadius: beadR, boxShadow: "0 6px 10px rgba(23,23,22,.28)" } as const;
            // eslint-disable-next-line @next/next/no-img-element
            return photo ? <img key={b.i} src={photo} alt="" width={beadR * 2} height={beadR * 2} style={box} /> : <div key={b.i} style={{ ...box, ...beadFill(b.stone) }} />;
          })}
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 56px" }}>
          <div style={{ fontSize: 22, letterSpacing: 5, color: "#a88b5a" }}>DESIGNED ON BWA</div>
          <div style={{ fontSize: two ? 64 : 80, lineHeight: 1.05, fontFamily: serifFamily, marginTop: 14 }}>{name}</div>
          {kinds && <div style={{ fontSize: 30, color: "#6b655c", marginTop: 14 }}>{kinds}</div>}
          {extras.length > 0 && <div style={{ fontSize: 26, color: "#6b655c", marginTop: 8 }}>{`With ${extras.join(", ")}`}</div>}
          <div style={{ fontSize: 26, marginTop: 40, color: "#26372f" }}>beadsworldafrica.co.ke</div>
        </div>
      </div>
    ),
    { width: W, height: H, fonts, headers: { "Cache-Control": "public, max-age=3600" } },
  );
}
