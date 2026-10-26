# BWA Growth Roadmap

Work moves from smallest to largest, **one step at a time**: build → check in the browser → commit → tick off here → next step.

Not in scope for now: Instagram API feed, stock per partner location.

Status: ⬜ not started · 🟡 in progress · ✅ done · ⏭️ skipped

---

## Your account tasks (no code; do them whenever, I'll give step-by-step instructions)

| # | Task | Status |
|---|------|--------|
| A1 | GA4: mark key events (`whatsapp_order_open`, `generate_lead`, `sign_up`), build the checkout funnel, filter internal traffic, link Merchant Center and Ads | ⬜ |
| A2 | Submit the sitemap to Google Search Console and Bing Webmaster Tools (Bing feeds ChatGPT search) | ⬜ |
| A3 | Check Cloudflare/Vercel bot settings are not blocking AI crawlers | ⬜ |
| A4 | Google Business Profile, with ManCave branches listed as places to buy | ⬜ |
| A5 | Merchant Center: set shipping in account settings (the feed no longer sends a fixed KES 250), e.g. a delivery cost range or "Collect" option | ⬜ |

---

## Build steps

### Quick

| # | Step | What "done" looks like | Status |
|---|------|------------------------|--------|
| 1 | `llms.txt` | `/llms.txt` summarises BWA, collections, stockists and key pages for AI tools | ✅ |
| 2 | Currency lookup fix | Country comes from the server-side header cookie; the rate-limited ipapi.co call is only a fallback or removed | ✅ |
| 3 | Journal link | Header link hidden until the Journal ships (step 13), then points to `/journal` | ✅ |

### Small

| # | Step | What "done" looks like | Needs from you | Status |
|---|------|------------------------|----------------|--------|
| 4 | Business details for search engines | Organization + Store structured data with socials, WhatsApp, and stockists | Business address (if any), opening hours | ✅ |
| 5 | `/stockists` page | ManCave's 3 branches with map, hours, directions; "Also at ManCave" badge on stocked products | Branch names, addresses, Google Maps links, hours, which products they carry | ✅ |
| 6 | "Message customer" in admin orders | One tap opens WhatsApp to the customer with a prefilled message, for orders never sent | — | ✅ |
| 7 | Partner codes + QR | One discount code per partner branch, printable QR card linking to the site with the code and tracking applied | Commission % / discount per partner | ⏭️ skipped |

### Medium

| # | Step | What "done" looks like | Needs from you | Status |
|---|------|------------------------|----------------|--------|
| 8 | FAQ sections | FAQs on product and collection pages, marked up for Google | Approve the answers I draft (delivery, sizing, payment, stone care) | ✅ |
| 9 | Faster images | Storefront images use Next.js image optimisation; layouts unchanged | — | ✅ |
| 10 | GA4 consent | GA4 respects the same consent choice as Meta (Google Consent Mode) | — | ✅ |
| 11 | "Become a stockist" form | Public form → lead in admin; short partner terms page | Consignment vs wholesale terms | ⬜ |
| 12 | Reviews | Review request after WhatsApp orders, reviews on product pages, star markup for Google | — | ⬜ |

### Larger

| # | Step | What "done" looks like | Needs from you | Status |
|---|------|------------------------|----------------|--------|
| 13 | Journal (blog) | `/journal` listing + post pages built from Markdown files I write; product CTAs inside the story; in sitemap and search markup; first 3 posts live | Agree the format below; photos for each post | 🟡 |

---

## Journal format (as built)

### Where posts live

```
content/journal/<slug>.md          the post
public/journal/<slug>/cover.webp   cover image (1600×900)
public/journal/<slug>/1.webp …     images inside the story
```

No admin editor: I write each post as a Markdown file and it ships with a commit. Existing site photos in `/images/` can be reused. A file whose name starts with `_` is a draft and is not published. A post with a missing field or an unknown category stops the build with a message saying what to fix.

### Post file

Product slugs below are examples; real posts use slugs from the live catalogue.

```markdown
---
title: "The Bracelet He Never Takes Off"
description: "Why tiger eye became the stone for steady men, and how to choose one that fits his wrist and his week." # 140–160 chars, used by Google
date: 2026-11-03
category: Stone guides        # Stone guides · Gift guides · Style · Care & sizing · Behind the craft
cover: /journal/the-bracelet-he-never-takes-off/cover.webp
coverAlt: "Man in a Nairobi café wearing a tiger eye bracelet"
featuredProduct: tiger-eye-bracelet          # product slug: the main CTA
faq:
  - q: "Can tiger eye get wet?"
    a: "Short splashes are fine; take it off to swim or shower."
---

Opening scene…

![Hands threading tiger eye beads](/journal/the-bracelet-he-never-takes-off/1.webp "Every bead is matched by hand in Nairobi.")

…story continues…

{{product: tiger-eye-bracelet}}

…
```

- Images: standard Markdown image; the quoted text becomes the caption. Alt text is required.
- `{{product: slug}}` drops in a live product card (photo, name, current KES/USD price, **Add to bag**, **View bracelet**). Price and stock always come from the live catalogue, so posts never go stale.

### Storyline shape (every post)

1. **The scene**: a real moment, a person, a place in Kenya. No "In this article…".
2. **The stone or idea**: what it is, where it comes from, what it is said to mean.
3. **The turn**: how it fits into his/her life: work, gifting, a milestone.
4. **First product card**, placed where the reader first wants it (around the middle).
5. **How to choose / wear it**: size, stacking, care. Practical and short.
6. **Close**: back to the opening scene, then the featured product as the final CTA plus a "Not sure? Find your bracelet" quiz link.
7. **FAQ**: 2–4 questions people actually search.

Length: 700–1,200 words, 3–5 images.

### Journal page (`/journal`)

- Top: the newest post as a large feature (cover, category, title, one-line description).
- Below: a grid of post cards (cover, category, title, read time), with category chips to filter.
- Bottom: "Not sure where to start?" link to the quiz (the footer newsletter sign-up sits right below).

### Post page (`/journal/<slug>`)

- Full-width cover, then title, date, read time, category.
- Single readable text column with full-width images and captions.
- Inline product cards where the post places them.
- On phones, a slim bar appears after the first product card: "Shop the {product}" → product page.
- End: featured product CTA, quiz and stockists links, the post's FAQ, then 3 more posts (same category first).
- Search: BlogPosting + FAQ structured data, social share image from the cover, listed in the sitemap.
- Tracking: `journal_product_click` (which post, which product) so we know which stories sell.

### First three posts (proposed)

1. **Stone guide:** "The Bracelet He Never Takes Off": tiger eye, for men. Blocked until the tiger eye product data is fixed (see below).
2. **Gift guide:** "What to Get Him When He Says He Wants Nothing" ✅ written (sample post)
3. **Behind the craft / partner story:** "Now at ManCave": why grooming and bracelets belong together, with the branches.

### Catalogue data to fix before stone guides

Several live products have copied descriptions or wrong stone tags, which also affects the stone collection pages and the quiz:

- Black Lava Stone, Matrix Jasper, White Howlite, Cracked Quartz, Snowflake Obsidian: descriptions start with another stone's "spiritual meaning" text.
- Red Tiger Eye and Mahogany Obsidian: both use the Mahogany Jasper description and are tagged Red Jasper.
- Malachite: tagged Red Jasper.
- Black Lava Stone, Cracked Quartz, White Howlite, Snowflake Obsidian, Clear Quartz: tagged "non stone".
