import { Marked, type Tokens } from "marked";

/** A post body split into Markdown and `{{product: slug}}` card segments. */
export type BodySegment =
  { type: "html"; html: string } | { type: "product"; slug: string };

const PRODUCT_CARD = /^\s*\{\{\s*product:\s*([a-z0-9-]+)\s*\}\}\s*$/gm;

const escapeAttr = (value: string) =>
  value.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");

function figure({ href, title, text }: Tokens.Image) {
  const caption = title ? `<figcaption>${escapeAttr(title)}</figcaption>` : "";
  return `<figure><img src="${escapeAttr(href)}" alt="${escapeAttr(text)}" loading="lazy" decoding="async" />${caption}</figure>`;
}

const marked = new Marked({
  gfm: true,
  renderer: {
    // `![alt](src "caption")` on its own line becomes a captioned figure.
    paragraph(token) {
      const [only] = token.tokens;
      if (token.tokens.length === 1 && only.type === "image")
        return figure(only as Tokens.Image);
      return `<p>${this.parser.parseInline(token.tokens)}</p>\n`;
    },
    image(token) {
      return figure(token);
    },
    link({ href, title, tokens }) {
      const text = this.parser.parseInline(tokens);
      const external = /^https?:\/\//.test(href);
      const titleAttr = title ? ` title="${escapeAttr(title)}"` : "";
      return external
        ? `<a href="${escapeAttr(href)}"${titleAttr} target="_blank" rel="noopener noreferrer">${text}</a>`
        : `<a href="${escapeAttr(href)}"${titleAttr}>${text}</a>`;
    },
  },
});

export function renderPostBody(body: string): BodySegment[] {
  const segments: BodySegment[] = [];
  let last = 0;
  for (const match of body.matchAll(PRODUCT_CARD)) {
    const before = body.slice(last, match.index);
    if (before.trim())
      segments.push({ type: "html", html: marked.parse(before) as string });
    segments.push({ type: "product", slug: match[1] });
    last = match.index + match[0].length;
  }
  const rest = body.slice(last);
  if (rest.trim())
    segments.push({ type: "html", html: marked.parse(rest) as string });
  return segments;
}

export function productSlugsInBody(body: string) {
  return [...body.matchAll(PRODUCT_CARD)].map((match) => match[1]);
}
