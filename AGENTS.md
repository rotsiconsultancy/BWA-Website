# AGENTS.md — Project Logbook & Architectural Context

> **Note for AI Agents & Developers**: This file is an append-only logbook and context registry for the Beads World Africa (BWA) E-Commerce project. Always read this file before making major changes, and **append a log entry** whenever completing significant additions, refactors, or schema changes.

---

## 🏛️ Project Architecture & Stack

- **Framework**: Next.js (App Router, React 18, TypeScript)
- **Styling**: Custom CSS in `app/globals.css`, Cormorant Garamond & Manrope typography
- **Database / Backend**: Supabase (`@supabase/supabase-js`)
- **Email Marketing**: Brevo API (`https://api.brevo.com/v3/contacts`)
- **Checkout Model**: WhatsApp direct order routing (Direct Card Payments currently disabled)
- **Icons**: `lucide-react`

---

## 🏷️ Product Taxonomy & Tagging System ("Find Your Bracelet" Engine Foundation)

To support the future automated **"Find Your Bracelet"** quiz recommendation engine, all product data in Supabase (`products` table) and local seed files must include the following attributes:

| Field Name      | Type     | Options / Enum Examples                                                                   | Quiz Mapping Purpose                                            |
| :-------------- | :------- | :---------------------------------------------------------------------------------------- | :-------------------------------------------------------------- |
| `energy_vibe`   | `text[]` | `'grounding'`, `'protection'`, `'vitality'`, `'focus'`, `'calm'`, `'clarity'`             | Matches user's desired mood/energy state                        |
| `intention`     | `text[]` | `'inner_strength'`, `'wealth_abundance'`, `'peace_mind'`, `'courage'`, `'transformation'` | Matches user's personal goals/intentions                        |
| `stone_type`    | `text[]` | `'tiger_eye'`, `'lava_stone'`, `'ukalite'`                                                | `'matte_onyx'`, `'lapis_lazuli'`, `'turquoise'`, `'red_jasper'` | Stone material preference & properties |
| `color_palette` | `text[]` | `'earth_tones'`, `'dark_monochrome'`, `'vibrant'`, `'deep_blue'`, `'raw_natural'`         | Aesthetic & wardrobe compatibility                              |
| `style_tags`    | `text[]` | `'everyday_minimal'`, `'bold_statement'`, `'stacked_layers'`, `'raw_rugged'`              | Lifestyle & style density preference                            |
| `wrist_fits`    | `text[]` | `'small_16cm'`, `'medium_18cm'`, `'large_20cm'`, `'adjustable'`                           | Sizing & fit compatibility                                      |

---

## 📝 Change Log

### [2026-10-28 14:00] — Older Listings Renamed; Product Redirects

- **Agent**: Claude Code
- **Code** (pushed by owner): `lib/commerce/product-redirects.ts` maps old product slugs to current ones; `app/product/[slug]/page.tsx` sends a permanent redirect (308) only when a slug is missing from the catalogue, so renames work in either order. The men's stone bracelets page and Journal product cards match either slug. **When renaming a product, add its old slug here; never remove an entry.**
- **Data (live Supabase, owner approved)**: 17 older products renamed to `<Name> <Stone> Stone [Chip] Bracelet` with matching slugs, stone wording, `wrist_fits` medium only; prices per owner (Longonot Black 800, Chyulu Black 1,200, round stone 1,500, chips 300); 9 variant titles "M/18CM" → "M / 18 cm". Files and undo: `../Website-data/older-listings-2026-10-28/` (`build.py`, `payload.json`, `changes.md`, `apply.mjs`, `live-before.json`).

### [2026-10-28 11:00] — 28 Stone Bracelets Added; Product Pages Use seo_title

- **Agent**: Claude Code
- **Data (live Supabase, owner approved)**: 28 new products from the owner's stone library (`../Assets/stones/`), slug `<bracelet-name>-<stone>-bracelet`, SKU `BWA-<NAME>`. Each has one hero image in Storage `product-images/products/` (1600 px WebP, AI-made product render with the BWA mark), one variant `M / 18 cm` with stock 200 (owner: always available), `wrist_fits` medium only, KES 1,500 / USD 13 (Watamu Deep lapis KES 1,800 / USD 16), `featured` and `is_trending` false, plus an `inventory_movements` initial row and a `crm_sync_outbox` create row, as the admin form does. Files: `../Website-data/stone-listings-2026-10-28/` (`listings.py` → `payload.json`, `review.md`, `upload.mjs create|remove`, `live-before.json`).
- **Code**: `lib/commerce/taxonomy.ts` gained stone options `sodalite`, `rhodonite`, `agate`, `bloodstone`, `unakite`, `opal`, `mother_of_pearl` (be45ae7). Product pages now use `products.seo_title` for `<title>` when set, falling back to "name — subtitle" (0ccc7e9); before this, `seo_title` was stored but never used. Both commits await the owner's push. Later the same day: 21 slugs moved to `-stone-bracelet` (owner asked to emphasise stone), and `app/sitemap.ts` got `revalidate = 3600` because it was only built at deploy and missed products added straight in Supabase (c332955).
- **Image note**: the gallery and shop cards show photos in a ~5:6 frame with `object-fit: cover`, which crops about 8% off each side of a square photo. Keep logos and text inside the centre 84% of the width (`../Assets/stones/_product-photo-kit/add-mark.py` does this).

### [2026-10-28 10:00] — Ahrefs Web Analytics Added

- **Agent**: Claude Code
- **Code**: `app/layout.tsx` loads `https://analytics.ahrefs.com/analytics.js` (owner's site key) on every page via `next/script`, `afterInteractive`, next to GA4. It is not gated by the cookie consent banner, unlike GA4 consent mode; Ahrefs says its analytics is cookieless.

### [2026-10-27 21:30] — Product Catalogue Copy Rewritten in Supabase

- **Agent**: Claude Code
- **Data (live Supabase, owner approved)**: All 26 products now have a subtitle, a one-line descriptor under 160 characters (used as the meta description and in the Merchant feed), a story that describes the product photo, a clean details list (the old lists had been split at every comma), corrected `stone_type` tags, fixed `seo_title`/`seo_description` and image `alt_text`. The old copy had other products' descriptions on at least 13 pieces and health/spiritual claims as fact ("past life recall", chakras, "clear you of toxicities"); stone meanings are now "traditionally associated with" only. Title fixes only: Plain Diagonal Hematite Bracelet, Forest Forge Bracelet, Black Onyx Chipped Bracelet, Snowflake Obsidian Chipped Bracelet. Prices, stock, sizes, slugs and quiz tags untouched.
- **Code**: `lib/commerce/taxonomy.ts` gained stone options `obsidian`, `howlite`, `jasper`, `quartz`, `malachite`, `goldstone` (commit 53f82a1). Push it so the admin product form keeps these tags when a product is edited.
- **Effect**: the tiger-eye and lava-stone hubs now list Red Tiger Eye and Black Lava Stone; Product JSON-LD `material` is correct.
- **Audit files** (outside git): `../Website-data/catalogue-audit-2026-10-27/`: `review.md` (before/after), `backup-before.json`, `payload.json`, `apply.mjs` (`apply` or `revert`, run from `BWA-Website/`).

### [2026-10-27 15:00] — Men's Stone Bracelets Landing Page

- **Agent**: Claude Code
- **Page**: `/bracelets/mens-stone-bracelets` (static route beside `/bracelets/[hub]`) targets "men's stone bracelets Kenya", "men's bracelets Nairobi", "tiger eye / lava stone bracelet Kenya". Hero, "Choose by stone" cards (Tiger Eye, Lava Stone, Black Onyx, Hematite, Snowflake Obsidian, Howlite; each links to its product and hides if the product leaves the catalogue), product grid of everything tagged `recipient: gift_for_man`, an ordering/delivery block (facts from `faq.ts`), Journal links and an FAQ. Data and copy in `lib/commerce/mens-stone-bracelets.ts`.
- **SEO**: CollectionPage + ItemList and FAQPage JSON-LD; listed in the sitemap (priority 0.85), `/llms.txt` collections, and as the first card on `/bracelets`. FAQ reuses `shoppingFaqs` minus the stockist question (no ManCave on this page) plus a tiger eye / lava / onyx comparison. Stone meanings are "traditionally associated with" only.
- **Data note**: Supabase `stone_type` tags are unreliable (Black Lava Stone is `non_stone`, Red Tiger Eye is `red_jasper`, howlite/jasper pieces are `tiger_eye`), so the existing tiger-eye hub shows the wrong pieces and the lava-stone hub is empty. This page filters by `recipient` and links stones to products by slug instead.

### [2026-10-26 16:30] — Stockists: Display at Mwanzi, On Request Elsewhere

- **Agent**: Claude Code
- **Changes**: Owner confirmed the BWA display is only at ManCave Mwanzi Market; customers can get BWA through the NSK and Kitengela branches on request. `Stockist.onDisplay` added in `lib/commerce/stockists.ts` (Mwanzi listed first); `/stockists` shows "BWA display · try them on" vs "Available on request · ask the team" badges and new intro copy; the product-page line, site FAQ, two Journal FAQs and `/llms.txt` say the same. Naming ManCave on the site is approved by the owner; Collabs, tags and logo use need ManCave's written approval (see the root `Partnerships/partners/mancave/profile.md`).

### [2026-10-26 10:15] — No Fixed Delivery Fee at Checkout

- **Agent**: Claude Code
- **Pricing**: `deliveryFeeFor` is removed; `/api/orders` always saves `delivery_fee = 0`, so website totals are merchandise minus discount. Delivery is arranged on WhatsApp: the Uber/Bolt fare within Nairobi, a quoted cost elsewhere (`DELIVERY_NOTE` in `lib/commerce/money.ts`).
- **UI**: Checkout doorstep option, summary ("Confirmed on WhatsApp", "Total before delivery"), confirmation screen and the bag page reflect this; the WhatsApp message says the total is before delivery and asks to confirm the delivery cost. Admin order view shows "Arranged on WhatsApp" or "Collection (free)" when no fee is stored.
- **Feed**: removed the fixed `<g:shipping>` (250 KES) from `/api/merchant-feed`; shipping must be configured in Merchant Center.

### [2026-10-26 09:30] — The BWA Journal (Markdown Blog) & Delivery Wording

- **Agent**: Claude Code
- **Journal**: Posts are Markdown files in `content/journal/<slug>.md` with YAML frontmatter (title, description, date, category, cover, coverAlt, featuredProduct, faq). `lib/journal/posts.ts` validates them (bad fields fail the build), `lib/journal/markdown.ts` renders with `marked` (captioned figures, external links in new tabs) and splits out `{{product: slug}}` lines into live product cards. Files prefixed `_` are drafts. Categories are fixed in `lib/journal/categories.ts`.
- **Pages**: `/journal` (featured post, category filter via `?category=`, quiz CTA) and `/journal/[slug]` (cover, prose column with full-bleed images, inline `JournalProductCard`s with Add to bag, closing product CTA, post FAQ with FAQPage markup, more posts, phone-only "Shop this bracelet" bar). BlogPosting JSON-LD; sitemap, `llms.txt` and the header nav include the Journal. `outputFileTracingIncludes` ships `content/journal` with the routes that read it. GA4: `journal_product_click` (post_slug, placement inline/closing/shop_bar, action).
- **First post**: "What to Get Him When He Says He Wants Nothing" (gift guide) featuring Forest Forge, Midnight Rhythm and Spotted Contrast, chosen because their catalogue descriptions are accurate.
- **Dependencies**: added `marked` and `yaml`; pinned `next`, `react`, `react-dom` and their types to the versions already in the lockfile, because the `latest` specifiers made any install upgrade the framework.
- **Delivery copy**: FAQ, `llms.txt` and `/stockists` now say Nairobi doorstep delivery costs the Uber/Bolt fare and outside Nairobi is confirmed on WhatsApp after ordering. Checkout and the order total still use the fixed KES 250 fee in `lib/commerce/money.ts`.

### [2026-10-26 07:30] — Stockists Page (ManCave)

- **Agent**: Claude Code
- **Changes**: Added `/stockists` with the three owner-confirmed ManCave branches (Nairobi Street Kitchen; Mwanzi Market 1st floor; Danka Plaza 2nd floor, Kitengela), Google Maps direction links, `Store` ItemList JSON-LD, a delivery CTA and a WhatsApp "stock BWA" CTA. Branch data lives in `lib/commerce/stockists.ts`; opening hours and per-branch products are not confirmed, so they are not shown. Linked from the product assurances ("Try it on at ManCave"), footer, FAQ, `llms.txt` and the sitemap.

### [2026-10-26 06:45] — Roadmap Batch: AI/SEO Basics, Images, Consent, Order Follow-up

- **Agent**: Claude Code
- **AI & SEO**: `/llms.txt` route (live catalogue + hubs, hourly). `OnlineStore` JSON-LD in the root layout (socials, WhatsApp contact, 7-day return policy). Shared `FaqSection` (+ `FAQPage` JSON-LD) on product pages, `/bracelets` and every hub; answers live in `lib/commerce/faq.ts` and only restate existing site promises.
- **Currency**: `proxy.ts` now sets a `bwa_country` cookie from the edge header (Cloudflare `cf-ipcountry` first, since Cloudflare fronts Vercel) and no longer writes a USD cookie when the country is unknown. `CurrencyContext` reads that cookie; ipapi.co (rate-limited) is removed, ipwho.is is the fallback only when no header exists.
- **Images**: `components/commerce/StoreImage.tsx` wraps `next/image` for local and Supabase Storage images (other hosts fall back to `<img>`). Used for hero banners, product grids, gallery and quiz results. `images.dangerouslyAllowLocalIP` is enabled in development only, for NAT64 networks.
- **Consent**: one choice (`lib/marketing/consent.ts`) now drives Meta Pixel and Google Consent Mode v2. GA4 defaults to denied (cookieless pings) until Accept; the prompt shows even without a Meta Pixel ID.
- **Admin**: order detail has a "Message customer on WhatsApp" button with a prefilled follow-up (`lib/commerce/whatsapp.ts`, tested phone normalisation).
- **Nav**: header Journal link removed until `/journal` ships (docs/ROADMAP.md step 13).

### [2026-10-25 22:30] — GA4 Ecommerce Funnel & WhatsApp Send Step

- **Agent**: Claude Code
- **Analytics**: Added `lib/marketing/ga4.ts` (typed `trackGa4Event`, item mappers, self-bootstrapping `gtag` so early events queue behind `config`) and `components/marketing/GoogleAnalytics.tsx`, replacing the inline layout snippet. Events: `view_item`, `add_to_cart`, `remove_from_cart` (incl. quantity changes), `view_cart` (bag page + drawer open), `begin_checkout`, `add_shipping_info`, `purchase` (transaction_id = order number, on order creation), custom `whatsapp_order_open` (auto/button), `search`, `quiz_complete`, `generate_lead` (bespoke), `sign_up` (newsletter footer/popup). `item_id` is the variant id, matching the Merchant feed.
- **Checkout**: Confirmation screen now states the order is not confirmed until the customer sends the WhatsApp message, with one primary send button (auto-open is often blocked on mobile after the async request). The prefilled message now lists items, sizes, total, delivery and name. A hint above the submit button explains the Send step. Compare `purchase` vs `whatsapp_order_open` in GA4 to see orders that were never sent.

### [2026-10-22 03:30] — Pricing Calculator Workspace (KES)

- **Agent**: Claude Code
- **Logic**: Added `lib/commerce/cost-pricing.ts` (pure, tested). Making cost = pack/strand ÷ yield + string roll ÷ yield + charms + extras + wastage % + packaging + labour. Full cost adds a display-stand charge that stops once `stand_payback_units` bracelets have sold since `stand_bought_on`. Monthly ads + other costs are applied as a % of every sale (budget ÷ expected monthly sales), not a flat per-bracelet amount, so cheap bracelets are not overloaded. Break-even = full cost ÷ (1 − shared % − commission %); good price = break-even ÷ (1 − target profit %), rounded up. Positive profit splits into better products / savings / owner pay.
- **Admin**: New `/admin/pricing` (owner and commerce manager only) with status per product (Too cheap / OK / Good price), plus monthly settings. `/admin/pricing/[productId]` has a live cost-recipe calculator for direct and consignment sales, and can apply a price to `products.price_kes`. Saving a recipe also writes `products.cost_price`.
- **Schema**: Added `product_cost_recipes` (staff-only, RLS on with no public policies). Settings are stored in `site_settings` under key `pricing`; RLS is now enabled on `site_settings`. Apply the updated `supabase/schema.sql` before use.

### [2026-10-05 11:45] — Currency Auto-Detection & Flag Resolution Fix

- **Agent**: Antigravity
- **Changes**:
  1. **CurrencyContext**: Separated automatic IP-geolocation detection from explicit user manual selections using `bwa_store_currency_manual` key. Auto-detection now always executes on initial load unless the user previously explicitly chose a currency manually.
  2. **Header flag resolution**: Visitors without a manual currency preference now see their actual detected country flag (e.g., 🇨🇦 `CA` for Canada VPN, 🇰🇪 `KE` for Kenya). Switching currency manually updates the flag to the chosen currency's primary flag (`KES` -> 🇰🇪 `KE`, `USD` -> 🇺🇸 `US`).

### [2026-10-04 07:57] — GA4 Tracking, ipapi Currency Detection & FlagCDN Flag Picker

- **Agent**: Antigravity
- **Changes**:
  1. **GA4**: Added Google Analytics 4 tag (`G-4HNRWEMRVY`) in `app/layout.tsx` via `next/script` with `strategy="afterInteractive"` — non-blocking, fires after page hydration.
  2. **CurrencyContext**: Replaced timezone-based detection with `ipapi.co/json` geolocation API (4s timeout, graceful fallback to KES). Exposes new `detectedCountry` (ISO 3166-1 alpha-2) to consumers. localStorage and middleware cookie priority is preserved.
  3. **Header flag**: Both desktop and mobile currency pickers now display the visitor's country flag via `flagcdn.com` (20×15px PNG + 2× srcSet). Flag appears only after the ipapi response resolves. Added `.currency-flag`, `.currency-switcher-label`, and updated `.currency-switcher` base flex rules in `globals.css`.

### [2026-09-28 14:48] — Featured Collections 3x4 Grid & Mobile Pill Action Button

- **Agent**: Antigravity
- **Changes**: Updated [FeaturedCollections.tsx](file:///home/alvin/Desktop/Projects/BeadsWorldAfrica-Ecommerce/components/home/FeaturedCollections.tsx) to fetch 12 items (`slice(0, 12)`) and render a responsive 3×4 product grid across mobile and desktop. Added centered, rounded pill CTA button (`Shop all →`) visible at the bottom of the collection grid with mobile-optimized product typography and layout spacing.

### [2026-09-25 09:20] — Bracelet Hub Empty-State Experience

- **Agent**: Codex
- **Changes**: Empty bracelet category hubs now remain accessible with a clear collection-in-progress message, direct links to the live collection and bracelet finder, and only related category links that currently contain products.

### [2026-09-25 09:05] — Discovery Alternative Product Previews

- **Agent**: Codex
- **Changes**: Added linked product image previews to the Find Your Bracelet “Also considered” results. Each alternative is now a compact horizontal image-and-copy row that stays usable across viewport sizes.

### [2026-09-25 08:55] — SEO Hub Type-Safe Taxonomy Lookup

- **Agent**: Codex
- **Changes**: Kept SEO hub field names flexible for taxonomy evolution while safely resolving only array-based product taxonomy fields at runtime, fixing the production TypeScript build failure without reintroducing strict hub-field unions.

### [2026-09-11 10:37] — Hero Background Image Fix

- **Agent**: Antigravity
- **Changes**: Fixed `app/globals.css` where `background-image` was overridden by shorthand `background`. Fixed public image URL path from `/public/images/` to `/images/`.

### [2026-09-11 11:42] — Story Section Layering Fix

- **Agent**: Antigravity
- **Changes**: Fixed `.story-image` background layer order in `app/globals.css` where opaque solid gradient was blocking `url(/images/wear-sth-that-story-section.webp)`. Swapped layers and used semi-transparent `rgba()` overlay.

### [2026-09-11 12:19] — Proof Section & Final CTA Syntax Fix

- **Agent**: Antigravity
- **Changes**: Fixed invalid CSS background syntax in `.proof` and `.final-cta` in `app/globals.css` where solid color variables was placed as standalone comma-separated layers, causing browser to discard the entire property rule.

### [2026-09-11 14:10] — Header Icon Modernization

- **Agent**: Antigravity
- **Changes**: Updated `components/layout/Header.tsx` to replace raw text characters (`⌕`, `♙`, `▢`, `☰`, `×`) with Lucide React icons (`Search`, `User`, `ShoppingBag`, `Menu`, `X`).

### [2026-09-11 17:06] — Adaptive Hero Carousel & Multi-Image Support

- **Agent**: Antigravity
- **Changes**: Updated `components/home/Hero.tsx` and `app/globals.css` to support multiple hero images with crossfade animation, auto-rotation every 6s, and interactive indicator dots.

### [2026-09-11 17:08] — Mobile Drawer Navigation Fix & Accessibility

- **Agent**: Antigravity
- **Changes**: Added body scroll locking when mobile drawer is open, route change listener auto-close, and keyboard `Escape` handler in `Header.tsx`.

### [2026-09-11 17:28] — Supabase Schema, WhatsApp Checkout, Brevo Popup & AGENTS.md Logbook Setup

- **Agent**: Antigravity
- **Changes**:
  1. Created `AGENTS.md` project logbook & product taxonomy specification.
  2. Created Supabase schema (`supabase/schema.sql`), client helpers (`lib/supabase/client.ts`), `.env.local.example`, and seed data (`lib/data/products.ts`).
  3. Integrated WhatsApp order generation on `checkout/page.tsx` (payments disabled).
  4. Added Brevo non-intrusive scroll popup (`NewsletterPopup.tsx`) with `sessionStorage` tracking and `/api/newsletter/subscribe` route.
  5. Enhanced SEO metadata and created `sitemap.ts` and `robots.txt`.

### [2026-09-11 17:30] — Package Dependencies Update

- **Agent**: Antigravity
- **Changes**: Added `@supabase/supabase-js` (`^2.48.1`) and `@supabase/ssr` (`^0.5.2`) to `package.json`.

### [2026-09-11 17:46] — Cart Context Engine, 7-Day Storage & Alert Elimination

- **Agent**: Antigravity
- **Changes**:
  1. Created global `CartContext` (`context/CartContext.tsx`) with `localStorage` persistence, live header count badge, and luxury toast notifications.
  2. Eliminated browser `alert()` popups across product, cart, and checkout pages.
  3. Updated `NewsletterPopup.tsx` to use 7-day expiration timestamp in `localStorage`.
  4. Dynamic multi-item WhatsApp checkout message generation.

### [2026-09-12 09:20] — Supabase-Owned Commerce Domain Foundation

- **Agent**: Codex
- **Changes**:
  1. Established a typed BWA-owned catalogue model with product variants, sellable stock, editorial content, and the full bracelet-discovery taxonomy.
  2. Added a deterministic weighted recommendation utility that scores available products using taxonomy tags instead of matching answer copy text.
  3. Added a server-only Supabase admin-client boundary to support secure order, customer, inventory, and CRM-sync operations in subsequent routes.

### [2026-09-12 10:05] — Premium Commerce Storefront, WhatsApp Orders & Discovery

- **Agent**: Codex
- **Changes**:
  1. Replaced the prototype schema with a Supabase-owned commerce schema covering product variants, inventory movements, customers, orders, order snapshots, bespoke requests, editable quiz data, editorial/drops, CRM sync outbox/logging, and audit records.
  2. Rebuilt catalogue, product, bag, checkout, and Find Your Bracelet routes around a consistent typed product model, size-aware cart lines, inventory-aware variants, and taxonomy-weighted recommendations.
  3. Added a right-side quick-cart drawer, WhatsApp-first local order creation endpoint, private order tracking endpoint, bespoke-request endpoint, public bespoke/tracking pages, and search-indexable product sitemap entries.
  4. Kept CRM integration downstream by recording sync outbox jobs only; customer-facing checkout and tracking do not depend on CRM availability.

### [2026-09-12 10:35] — Protected BWA Operations Dashboard Foundation

- **Agent**: Codex
- **Changes**:
  1. Added Supabase Auth-based staff access scaffolding and role profiles for owner, commerce, content, fulfilment, and support roles.
  2. Added protected operations routes for overview, orders, products/stock, and downstream CRM sync visibility.
  3. Extended the schema with `admin_profiles` and self-profile RLS so operational access can be explicitly granted to individual Supabase users.

### [2026-09-12 10:50] — Supabase Publishable/Secret Key Migration

- **Agent**: Codex
- **Changes**: Replaced legacy anon/service-role environment variable usage with Supabase publishable keys for browser and Auth clients, plus a server-only secret key for privileged backend operations.

### [2026-09-12 11:05] — Admin Login Redirect-Cycle Fix

- **Agent**: Codex
- **Changes**: Removed the authentication guard from the shared admin layout so `/admin/login` can render for unauthenticated visitors; each protected operations page retains its own server-side `requireAdmin` check.

### [2026-09-12 11:15] — Prettier Tooling & Code Formatting

- **Agent**: Codex
- **Changes**: Added Prettier as a development dependency, formatted application source/configuration files, and added `pnpm format` plus `pnpm format:check` scripts for repeatable formatting.

### [2026-09-12 11:25] — Dynamic Admin Route Boundary

- **Agent**: Codex
- **Changes**: Marked the authenticated admin route tree as dynamic so cookie/session evaluation occurs per request rather than during static-page generation.

### [2026-09-12 11:45] — Operations Dashboard Interface Upgrade

- **Agent**: Codex
- **Changes**:
  1. Replaced the storefront-like admin presentation with a dedicated operations workbench: active sidebar navigation, responsive workspace shell, compact headers, KPI action cards, queue panels, and table-first data views.
  2. Kept the login screen outside the authenticated dashboard frame while preserving existing route-level access checks.
  3. Added loading feedback and clear roadmap messaging on read-only areas; product creation, order-status mutations, and manual CRM sync actions remain intentionally unshipped until their safe server operations are implemented.

### [2026-09-12 12:10] — Product Publish Pipeline & Storefront SEO

- **Agent**: Codex
- **Changes**:
  1. Added a protected product publish workflow that creates product, hero image, initial variant, opening inventory movement, audit entry, and downstream CRM outbox record in BWA Supabase.
  2. Moved shop listings, product pages, canonical metadata, Product JSON-LD, and sitemap records to the Supabase-owned storefront catalogue reader, with local seed data retained only as a development fallback.
  3. Enforced publication prerequisites for an image, accessible image description, valid commerce data, in-stock sellable variant, and core discovery tags.

### [2026-09-12 12:25] — Guided Product Entry Experience

- **Agent**: Codex
- **Changes**: Replaced raw taxonomy text inputs in the product-entry workflow with guided multi-select pickers, removable selected tags, plain-language labels, staged sections, draft/publish state, and collapsed advanced SEO fields.

### [2026-09-12 12:35] — Product Entry Starter Guide

- **Agent**: Codex
- **Changes**: Added a practical in-form example product and SKU explanation so staff can follow a real BWA naming, variant, stock, and stock-code convention while entering their first catalogue record.

### [2026-09-12 12:50] — Persistent Adaptive Product Drafts

- **Agent**: Codex
- **Changes**: Added Zustand-backed local product drafts and non-redirecting server-action validation. Failed save/publish attempts now retain text, toggles, and selected taxonomy traits, show a contextual inline error, and restore the saved draft after a refresh; only successful saves redirect.

### [2026-09-13 09:15] — Order Fulfilment & Customer Operations

- **Agent**: Codex
- **Changes**: Added protected per-order fulfilment operations with customer contact/consent details, delivery information, item snapshots, status history, payment/status updates, courier and tracking reference fields, local audit records, CRM sync queue entries, and customer-facing tracking timeline updates.

### [2026-09-13 09:35] — Customer Profile Workspace

- **Agent**: Codex
- **Changes**: Added BWA-owned customer list and profile workspaces covering contact details, operational/marketing consent, saved delivery addresses, order history, and bespoke-request context.

### [2026-09-13 10:00] — Discovery Workspace Foundation

- **Agent**: Codex
- **Changes**: Added the protected Discovery workspace and navigation entry, reading Supabase quiz versions with separate draft/published states as the basis for editable Find Your Bracelet operations.

### [2026-09-13 10:25] — Editable Find Your Bracelet Publishing

- **Agent**: Codex
- **Changes**: Added draft quiz-version creation, editable questions and answers, ordering/active controls, managed hidden taxonomy-weight signals (including removal), publishing checks, archival of the former live version, and audit entries for discovery operations.
- **Storefront**: Find Your Bracelet now reads the published Supabase quiz and live Supabase product catalogue at request time; it retains the original four-question configuration only until a valid version is published, and recommendations are scored from configured product tags rather than visible copy.

### [2026-09-13 10:45] — Guided Discovery Editor

- **Agent**: Codex
- **Changes**: Reworked Discovery into a staff-friendly guided workflow. Staff can create a complete BWA four-question starter template in one click, use plain-language product matches such as “Grounded feeling” and “Tiger Eye,” and add customer-facing questions/answers without entering internal taxonomy keys or answer order values.

### [2026-09-13 11:05] — Discovery Step Wizard

- **Agent**: Codex
- **Changes**: Added a keyboard-accessible three-step editor: Set up, Build, and Review. Each step isolates its task, the publish control is available only in Review, and server actions return staff to the relevant Build step after saving questions, answers, or bracelet matches.

### [2026-09-13 11:30] — Discovery Completion & Customer Journey Attribution

- **Agent**: Codex
- **Changes**: Added persistent BWA-owned quiz sessions/results, event attribution for quiz completion, recommendation views, add-to-bag, bespoke starts, and orders, plus direct add-to-bag and bespoke handoffs from a recommendation.
- **Operations**: Discovery context is retained through checkout/bespoke submission, then linked to the local customer record. Customer profiles show saved quiz outcomes and Discovery shows aggregate conversion counts.
- **Schema**: Added `quiz_sessions.customer_id` and the `discovery_events` table/indexes. Apply the updated `supabase/schema.sql` before using Discovery analytics in production.

### [2026-09-13 12:00] — Storefront Discovery, Search & Brand Basics

- **Agent**: Codex
- **Changes**: Replaced Popular Picks’ unauthorised external placeholders with the BWA-owned storefront catalogue and each product’s approved image, adding a safe catalogue fallback when no product is marked featured.
- **Experience**: Added a header search overlay with Cmd/Ctrl+K, Escape, live product/stone/mood suggestions, and a bespoke no-result route. Footer subscription now submits through the Brevo API route with visible success/error feedback.
- **Brand/SEO**: Registered the BWA emblem SVG as the favicon and fixed social-card metadata to use an available owned image.

### [2026-09-13 12:35] — Product SEO & Bracelet Discovery Hubs

- **Agent**: Codex
- **Changes**:
  1. Added the canonical, indexable `/bracelets` collection page and BWA-owned discovery hubs for live stone, feeling, intention, and everyday bracelet edits.
  2. Each hub uses current Supabase catalogue data, has unique page metadata and `CollectionPage`/`ItemList` structured data, excludes empty collections, and is included in the dynamic sitemap only when matching live products exist.
  3. Enriched product metadata and Product structured data with natural-stone context, brand, category, and condition; product pages now link to relevant discovery hubs for stronger internal discovery.
  4. Made `/bracelets` the primary shop destination and canonical target; `/shop` remains available for filtering but is intentionally non-indexed to avoid competing duplicate catalogue pages.

### [2026-09-13 13:50] — Mobile Sticky Header Stability

- **Agent**: Codex
- **Changes**: Made the storefront header consistently sticky on mobile, including the home page where it was previously absolutely positioned and scrolled away. The mobile header now has an explicit viewport width, compact action spacing, and a constrained navigation drawer to prevent side-to-side drift.

### [2026-09-13 14:10] — Mobile Header Touch Hardening

- **Agent**: Codex
- **Changes**: Raised and isolated the mobile header stacking layer above storefront media and added direct touch-action handling to its controls, protecting search, bag, and menu taps from overlapping visual layers on mobile Safari.

### [2026-09-13 14:35] — Explicit KES/USD Pricing & Consent-Gated Meta Pixel

- **Agent**: Codex
- **Pricing**: Added independently entered KES and USD prices for products and variant adjustments. Customer currency preference now carries through catalogue, search, product, quiz, bag, cart, checkout, WhatsApp handoff, server-side order recalculation, and saved order currency—without exchange-rate conversion.
- **Operations**: Product publishing requires both currencies; existing KES prices are preserved through the schema migration while USD values are intentionally left for staff to enter. Order views now display the currency captured on each order.
- **Marketing**: Added an optional Meta Pixel integration using `META_PIXEL_ID`, a remembered accept/decline marketing-consent prompt, and PageView, ViewContent, AddToCart, InitiateCheckout, and Lead events. The Pixel does not load in admin routes or before consent.

### [2026-09-13 14:45] — Legacy Cart Price Compatibility

- **Agent**: Codex
- **Changes**: Added safe cart restoration for visitors with the prior KES-only `unitPrice` local-storage format. Existing bags now retain their KES amount; USD remains unavailable for that line until a deliberate USD product price is entered.

### [2026-09-13 14:50] — Marketing Consent Interaction Hardening

- **Agent**: Codex
- **Changes**: Rendered the Meta consent prompt directly at the document body layer and isolated its touch targets above storefront drawers, headers, and overlays, ensuring its accept/decline buttons receive mouse and mobile-tap events.

### [2026-09-13 14:55] — Meta Pixel Loader Deduplication

- **Agent**: Codex
- **Changes**: Added guards for existing `fbq`, `_fbq`, and the BWA Pixel script ID so a host-level snippet or tag manager bootstrap cannot be initialized a second time by the storefront.

### [2026-09-13 17:20] — Product Gallery & Catalogue Editing

- **Agent**: Codex
- **Catalogue**: Product creation now supports an ordered gallery of up to ten described image URLs. The first image becomes the storefront cover; later images can be marked as gallery, detail, or lifestyle imagery and are delivered to the existing product gallery in order.
- **Operations**: Added protected per-product editing from the catalogue table. Staff can modify commerce copy, KES/USD prices, primary variant details, stock, storefront state, discovery tags, SEO fields, and the full gallery without recreating the product.
- **Integrity**: Stock edits write an inventory adjustment movement; product edits write an audit record, queue a downstream CRM update, and revalidate storefront, discovery, product, and sitemap paths.
- **Configuration**: Corrected Supabase clients to read `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, matching the project environment template. The browser placeholder error is resolved after valid values are supplied and the app is restarted/redeployed.

### [2026-09-15] — Bracelet Collection Sales-Page Redesign

- **Agent**: Codex
- **Changes**: Reworked `/bracelets` from a sparse text-first hero into a centered, owned-photography collection introduction with a direct “Shop the collection” handoff. The page now brings shop-by discovery routes and live products into a more deliberate sales-led sequence, while retaining live Supabase catalogue data, SEO metadata, and structured data.
- **Follow-up**: Applied the matching image-led hero treatment to every `/bracelets/[hub]` discovery page, preserving each hub’s live SEO content while directing visitors straight to its filtered product collection.

### [2026-09-16] — Supabase-Owned Discount Campaigns & Checkout Pricing

- **Checkout**: Added one-code-per-order checkout discounts with percentage or exact KES/USD fixed reductions, minimum merchandise subtotals, optional campaign dates, active controls, and redemption caps. Discounts never reduce delivery.
- **Integrity**: Live product prices are recalculated server-side for quote and final order creation. A transactional Supabase RPC locks campaign capacity, saves the order/item/discount snapshots and redemption together, and keeps idempotent retries safe.
- **Operations**: Added the protected Offers workspace for owners and commerce managers to create, edit, pause/reactivate, inspect campaign status and redemption value, and follow linked orders. Codes become immutable after their first redemption.
- **Fulfilment**: Cancelling an order or marking payment as failed releases its unused redemption exactly once; original order pricing remains historically intact.

### [2026-09-25 07:32] — Separate Product Pages, Non-Stone Materials & Admin Table Pagination

- **Agent**: Antigravity
- **Product Admin**: Separated product creation into `/admin/products/new`, leaving `/admin/products` as a clean catalogue listing page and `/admin/products/[productId]` for editing.
- **Product Materials**: Added `"non_stone"` ("Non-stone / Other material") option under `stone_type` tags in ProductPublishForm, ProductEditForm, Discovery matches, storefront catalogue filtering, and search endpoint.
- **Customer Table**: Fixed broken table grid layout by extending `.admin-table` CSS rules to anchor rows (`.admin-table > a`), added an explicit column grid template (`.admin-customers-table`), added row hover feedback, and added a `Manage` column with `View profile →` links.
- **Admin Pagination**: Created reusable `<AdminPagination>` component and added pagination (`10`/`15` items per page) to Products, Customers, Orders, Offers, Discovery, and Sync Queue admin listing pages.

### [2026-09-25 08:01] — Location-Aware Currency Auto-Detection

- **Agent**: Antigravity
- **Edge Middleware**: Created `middleware.ts` to inspect incoming edge geolocation country headers (`x-vercel-ip-country`, `cf-ipcountry`, etc.) and automatically inject a `bwa_store_currency` cookie set to `KES` for Kenya or `USD` for international visitors.
- **Currency Context**: Updated `CurrencyProvider` in [CurrencyContext.tsx](file:///home/alvin/Desktop/Projects/BeadsWorldAfrica-Ecommerce/context/CurrencyContext.tsx) with a 3-tier resolution strategy: (1) explicit user `localStorage` selection, (2) edge location cookie, and (3) browser timezone fallback (`Africa/Nairobi`).

### [2026-09-25 08:10] — Link Previews & OpenGraph Social Sharing Optimization

- **Agent**: Antigravity
- **SEO Helper**: Created `lib/commerce/seo.ts` with `absoluteUrl()` and `buildOgImages()` to format high-resolution 1200x630 OpenGraph images and canonical URLs across social preview platforms.
- **Product Link Previews**: Enhanced [product/[slug]/page.tsx](file:///home/alvin/Desktop/Projects/BeadsWorldAfrica-Ecommerce/app/product/%5Bslug%5D/page.tsx) with explicit `openGraph` (title, short descriptor/story, absolute image URL, canonical link, siteName) and `twitter:card` (`summary_large_image`) for WhatsApp, iMessage, Facebook, and Twitter link sharing.
- **Rich Structured Data**: Expanded Schema.org `Product` JSON-LD in product pages with stone materials, color palette, absolute image gallery, and multi-currency (KES & USD) offer specifications.
- **Hub & Landing Previews**: Added OpenGraph and Twitter card metadata to `/bracelets`, `/bracelets/[hub]`, `/find-your-bracelet`, `/bespoke`, and root layout.

### [2026-09-25 08:25] — Centralized Taxonomy Registry & Non-Strict Fallbacks

- **Agent**: Antigravity
- **Central Taxonomy**: Created [lib/commerce/taxonomy.ts](file:///home/alvin/Desktop/Projects/BeadsWorldAfrica-Ecommerce/lib/commerce/taxonomy.ts) as the single source of truth for all product traits (`energy_vibe`, `intention`, `stone_type`, `color_palette`, `style_tags`, `wrist_fits`, `occasion`, `recipient`).
- **Non-Strict UI Fallback**: Added `getTaxonomyLabel(field, value)` and `formatTagFallback(value)` to gracefully title-case and render any tag value (e.g. `matte_onyx` $\rightarrow$ `Matte Onyx`) if an option is modified or removed from the registry, guaranteeing zero UI breakage.
- **Admin Integration**: Connected Product Creation, Product Editing, Product Actions, and Discovery Quiz Admin to the centralized taxonomy registry.

### [2026-09-25 08:40] — SEO Hubs Taxonomy Alignment

- **Agent**: Antigravity
- **Non-Strict Typing**: Removed strict `HubField` union type from `lib/commerce/seo-hubs.ts`; `field` and `value` are now typed as `string`. Removing or renaming a taxonomy value no longer causes a TypeScript build error — the hub simply returns no products.
- **Turquoise Fix**: Corrected `value: "turquoise"` → `value: "turquoise"` on the African Turquoise hub to match the registered value in `taxonomy.ts`.
- **Ukalite Addition**: Added `{ value: "ukalite", label: "Ukalite" }` to `stone_type` in `taxonomy.ts` to back the existing Ukalite SEO hub.
- **Cross-reference Comments**: Added JSDoc comments on `SeoHub.field` and `SeoHub.value` pointing directly to `lib/commerce/taxonomy.ts TAXONOMIES` as the authoritative list of valid values.

### [2026-09-30 09:38] — Supabase Storage Image Uploads & Next.js Domain Config

- **Agent**: Antigravity
- **Supabase Storage Support**: Enhanced [ProductPublishForm.tsx](file:///home/alvin/Desktop/Projects/BeadsWorldAfrica-Ecommerce/components/admin/ProductPublishForm.tsx) (`GalleryFields`) with direct browser file upload to the Supabase Storage `product-images` bucket. Added single-file upload per row, multi-file batch upload in gallery header, automatic file sanitization, auto-generated alt descriptors, loading indicators (`Loader2`), image thumbnail previews, and error handling.
- **Next.js Image Configuration**: Updated [next.config.ts](file:///home/alvin/Desktop/Projects/BeadsWorldAfrica-Ecommerce/next.config.ts) `images.remotePatterns` to allow loading images hosted on Supabase Storage subdomains (`*.supabase.co`, `*.supabase.in`, `*.supabase.net`).
- **SQL Setup Script**: Created [supabase/storage.sql](file:///home/alvin/Desktop/Projects/BeadsWorldAfrica-Ecommerce/supabase/storage.sql) to initialize the `product-images` storage bucket (10MB limit, image MIME types) and set up Row Level Security (RLS) policies for SELECT, INSERT, UPDATE, and DELETE operations.
- **Styling**: Added `.admin-gallery-thumbnail`, `.admin-gallery-input-group`, `.admin-gallery-row-upload`, `.admin-gallery-error-banner`, and CSS spin animation in [app/globals.css](file:///home/alvin/Desktop/Projects/BeadsWorldAfrica-Ecommerce/app/globals.css).

### [2026-10-09] — Impeccable Product Context Initialization

- **Agent**: Codex
- **Context**: Added `PRODUCT.md` with owner-confirmed audience priorities (Kenyan men, women gifting men, then women buying for themselves), brand commitments, verified existing proof assets, and current commerce constraints. International expansion remains secondary pending logistics.
- **Workflow**: Selected comp-first for future new surfaces under the owner's delegated choice and recorded it in `.impeccable/config.json`. Configured the Next.js App Router entry for future live mode after the CSP detector found no policy; no storefront UI or CSP changes were made.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

### [2026-10-26] — Journal Photography

- **Agent**: Codex
- **Assets**: Added 13 generated editorial WebP photos in `public/journal/<slug>/`, using the prompts in `docs/journal-image-brief.md` and the supplied product photos as references for Forest Forge, Midnight Rhythm and Spotted Contrast. Covers are 1600×900; inline images are 1600×1067; all files are below 180 KB.
- **Posts**: Updated only the three posts' cover paths/alt text and requested inline photos/captions, preserving body copy, headings and product embeds. Every new asset has exactly one source reference, with paragraph separation from product cards.
- **Validation**: 22 tests pass; TypeScript and production build pass. Reviewed the journal listing and all three article layouts at desktop and 375px phone width. Named-product scenes retain the reference designs; real product photography remains the catalogue source of truth.
