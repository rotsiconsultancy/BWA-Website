import fs from "node:fs";
import path from "node:path";
import { parse } from "yaml";
import type { FaqItem } from "@/lib/commerce/faq";
import { JOURNAL_CATEGORIES, type JournalCategory } from "./categories";

export type JournalPost = {
  slug: string;
  title: string;
  description: string;
  date: string;
  updated?: string;
  category: JournalCategory;
  cover: string;
  coverAlt: string;
  featuredProduct: string;
  faq: FaqItem[];
  readingMinutes: number;
  body: string;
};

const POSTS_DIR = path.join(process.cwd(), "content/journal");
const FRONTMATTER = /^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/;

function fail(file: string, message: string): never {
  throw new Error(`Journal post content/journal/${file}: ${message}`);
}

function requireText(file: string, data: Record<string, unknown>, key: string) {
  const value = data[key];
  if (typeof value !== "string" || !value.trim())
    fail(file, `"${key}" is required`);
  return value.trim();
}

// YAML reads an unquoted 2026-11-03 as a Date; keep dates as plain strings.
function dateText(file: string, value: unknown, key: string) {
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value))
    return value;
  fail(file, `"${key}" must be a date like 2026-11-03`);
}

function readPost(file: string): JournalPost {
  const raw = fs.readFileSync(path.join(POSTS_DIR, file), "utf8");
  const match = raw.match(FRONTMATTER);
  if (!match) fail(file, "missing the --- frontmatter block");
  const data = (parse(match[1]) ?? {}) as Record<string, unknown>;
  const body = match[2];

  const category = requireText(file, data, "category");
  if (!JOURNAL_CATEGORIES.includes(category as JournalCategory))
    fail(
      file,
      `category "${category}" must be one of: ${JOURNAL_CATEGORIES.join(", ")}`,
    );
  const faq = Array.isArray(data.faq) ? data.faq : [];
  const words = body.split(/\s+/).filter(Boolean).length;

  return {
    slug: file.replace(/\.md$/, ""),
    title: requireText(file, data, "title"),
    description: requireText(file, data, "description"),
    date: dateText(file, data.date, "date"),
    updated: data.updated ? dateText(file, data.updated, "updated") : undefined,
    category: category as JournalCategory,
    cover: requireText(file, data, "cover"),
    coverAlt: requireText(file, data, "coverAlt"),
    featuredProduct: requireText(file, data, "featuredProduct"),
    faq: faq.map((item: { q?: unknown; a?: unknown }) => {
      if (typeof item?.q !== "string" || typeof item?.a !== "string")
        fail(file, "each faq entry needs q and a");
      return { question: item.q, answer: item.a };
    }),
    readingMinutes: Math.max(1, Math.round(words / 220)),
    body,
  };
}

/** Today's date in Nairobi, e.g. "2026-11-08". */
export function nairobiToday(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Africa/Nairobi" }).format(
    now,
  );
}

/** A post dated in the future stays hidden until that day in Nairobi. */
export function isReleased(post: JournalPost, today = nairobiToday()) {
  return post.date <= today;
}

/**
 * Newest first. Files starting with "_" are drafts and are not published.
 * Scheduled posts (dated in the future) appear on their date; pages that list
 * posts revalidate hourly, so a post shows up within an hour of midnight.
 * `next dev` shows them early so they can be reviewed.
 */
export function getAllPosts(): JournalPost[] {
  if (!fs.existsSync(POSTS_DIR)) return [];
  const showScheduled = process.env.NODE_ENV === "development";
  return fs
    .readdirSync(POSTS_DIR)
    .filter((file) => file.endsWith(".md") && !file.startsWith("_"))
    .map(readPost)
    .filter((post) => showScheduled || isReleased(post))
    .sort((a, b) => b.date.localeCompare(a.date));
}

export function getPost(slug: string) {
  return getAllPosts().find((post) => post.slug === slug);
}
