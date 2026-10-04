# 🔍 Beads World Africa — SEO Optimisation Plan

> **Goal**: Rank for high-intent bracelet & natural stone jewelry searches in Kenya and internationally.
> **Baseline**: GA4 is now tracking. A sitemap, robots.txt, OG/Twitter metadata, and Product JSON-LD structured data are already in place.

---

## 🏆 Priority Matrix

| Priority | Area | Effort | Impact |
|----------|------|--------|--------|
| 🔴 P0 | Core Web Vitals / Page Speed | Medium | Very High |
| 🔴 P0 | Structured Data completeness | Low | Very High |
| 🔴 P0 | Target keyword clustering | Low | Very High |
| 🟡 P1 | Internal linking strategy | Low | High |
| 🟡 P1 | Image SEO & alt text | Low | High |
| 🟡 P1 | Blog / Journal content | High | Very High |
| 🟠 P2 | Local SEO (Google Business Profile) | Low | High (KE) |
| 🟠 P2 | Backlink building | High | High |
| 🟢 P3 | Schema breadcrumbs | Low | Medium |
| 🟢 P3 | FAQ schema on product pages | Low | Medium |

---

## 🔴 P0 — Must-Do Now

### 1. Core Web Vitals & LCP Fix
The hero carousel is the biggest LCP risk. Each carousel image should use:
- `<Image priority />` on the **first** hero image (Next.js Image component, not `<img>`)
- `fetchPriority="high"` + `loading="eager"` on hero slot 0
- `loading="lazy"` on all other gallery/product images
- Convert all `.webp` images to serve from Next.js `/_next/image` via `next/image` for automatic size optimisation

**Files to update**: `components/home/Hero.tsx`, `components/ui/ProductCard.tsx`, `components/product/ProductDetail.tsx`

### 2. Structured Data Completeness

**Currently missing / weak:**
- `BreadcrumbList` on product and collection pages
- `Organization` schema on the homepage (brand, logo, contactPoint, sameAs social links)
- `FAQPage` schema on product pages (e.g. "What stone is this?", "How do I clean it?")
- `CollectionPage` itemListElement product count is empty on some hubs

**Action**: Add an `<OrganizationSchema />` component and inject into `layout.tsx`. Add `<BreadcrumbSchema />` into product + hub pages.

### 3. Keyword Cluster Targeting

**Primary clusters to own:**
| Cluster | Target Keywords |
|---------|----------------|
| Tiger Eye | "tiger eye bracelet Kenya", "tiger eye stone bracelet men" |
| Lava Stone | "lava stone bracelet meaning", "lava stone diffuser bracelet" |
| Natural Stone | "natural stone bracelet men Nairobi", "semi precious stone bracelet Africa" |
| Gift | "unique gift bracelets Nairobi", "handmade bracelet gift Kenya" |
| Grounding | "grounding bracelet men", "grounding energy bracelet Africa" |

**Action**: Each SEO hub page (`/bracelets/[hub]`) needs an H1 that contains the exact long-tail phrase, plus a 150–250 word introduction paragraph that uses natural variations. These currently have thin copy.

---

## 🟡 P1 — High Impact, Low Effort

### 4. Internal Linking Strategy

Currently product pages don't cross-link to relevant hub pages. Implement:
- "Also worn with" related-product links on every product page
- Hub page sidebar: "Shop related vibes" links to 2–3 other hubs
- Homepage → `/bracelets` → hub pages → product pages (3-click depth for all products)
- Footer: add "Stone Guides" section with links to all hubs

### 5. Image SEO

- Every `<img>` in product cards should have a descriptive `alt` tag using the format: `"{Product Name} — natural {stone} bracelet, {color}, handmade in Africa"`
- Hero images: add `title` attribute describing the scene
- Add `<meta name="thumbnail" content="...">` to product pages for WhatsApp preview

### 6. Journal / Blog Content (Highest Long-Term ROI)

Create `/journal` as a real content section with posts:

| Post Title | Target Keyword | Estimated Traffic |
|------------|---------------|-------------------|
| "What Does Tiger Eye Stone Mean?" | "tiger eye meaning" | High |
| "How to Stack Bracelets: A Men's Guide" | "how to stack bracelets men" | High |
| "Natural Stone Bracelet Care Guide" | "how to clean stone bracelet" | Medium |
| "5 Grounding Crystals for Stress Relief" | "grounding stones meaning" | Medium |
| "Gift Guide: Bracelets for Him Under KES 5,000" | "bracelets gift for him Kenya" | High (local) |

Each post should link to 2–3 relevant products and 1 hub page.

---

## 🟠 P2 — Steady Wins

### 7. Google Business Profile (Local SEO)

- Claim / update the GBP listing for "Beads World Africa" in Nairobi
- Add product photos, category = "Jewelry store"
- Request reviews from existing WhatsApp customers
- Link GBP to `beadsworldafrica.co.ke`
- Add `LocalBusiness` JSON-LD to the homepage:
  ```json
  {
    "@type": "JewelryStore",
    "name": "Beads World Africa",
    "address": { "@type": "PostalAddress", "addressLocality": "Nairobi", "addressCountry": "KE" },
    "url": "https://beadsworldafrica.co.ke"
  }
  ```

### 8. Backlink Building

- **Stone blogs**: Guest posts / product features on crystal/spiritual lifestyle blogs
- **Nairobi lifestyle press**: Reach out to Nairobi Now, Pulse Kenya, Standard Digital Style section
- **Instagram → website**: Ensure every Instagram bio/reel description links to the site
- **Pinterest**: Pin every product with keyword-rich descriptions linking to product pages
- **WhatsApp Business catalogue**: Link each product to its `/product/[slug]` page

---

## 🟢 P3 — Polish

### 9. Breadcrumb Schema

Add to product pages:
```
Home > Bracelets > Tiger Eye > [Product Name]
```
Renders as a `BreadcrumbList` JSON-LD and also as a visible breadcrumb nav for UX.

### 10. FAQ Schema on Product Pages

Add 2–3 FAQs per product:
- "What stone is this bracelet made from?"
- "What wrist size does this fit?"
- "Can I wear this every day?"

These appear as rich results in Google and increase click-through rate.

---

## 📐 Technical Quick-Wins (1–2 hrs each)

| Fix | File | Why |
|-----|------|-----|
| Add `<link rel="canonical">` to hub pages | `app/bracelets/[hub]/page.tsx` | Prevents duplicate content |
| Add `hreflang="en-KE"` + `hreflang="en"` | `app/layout.tsx` | Signals geo-targeting to Google |
| Set `robots` meta to `noindex` on `/checkout`, `/cart`, `/order` | Route-level metadata | Prevents crawl waste |
| Add `next/font` for Google Fonts instead of `@import` | `globals.css` | Eliminates render-blocking font requests |
| Verify `metadataBase` is set correctly in all pages | All `page.tsx` files | Fixes relative OG image URLs |

---

## 📊 Measurement & Tracking

Now that GA4 is live, set up:

1. **GA4 Goals / Conversions**:
   - WhatsApp button click (fire a `begin_checkout` event + custom `whatsapp_checkout` event)
   - Newsletter signup → `generate_lead`
   - "Find Your Bracelet" quiz completion → `quiz_complete`
   - Product page view → `view_item`

2. **Google Search Console**: Verify `beadsworldafrica.co.ke` and submit `sitemap.xml`

3. **Core Web Vitals monitoring**: Use GSC's "Core Web Vitals" report + Vercel Analytics

4. **Rank tracking**: Use a free tool (Ubersuggest, Google Search Console queries report) to track the 10 target keyword clusters weekly

---

## 🗓️ Suggested Rollout

| Week | Focus |
|------|-------|
| Week 1 | P0: Schema, LCP fix, keyword copy on hub pages |
| Week 2 | P1: Internal linking, image alt text, journal setup |
| Week 3 | P2: GBP setup, first 2 blog posts live |
| Week 4 | P3: Breadcrumbs, FAQ schema, GSC verification |
| Ongoing | 1 journal post/week, backlink outreach |
