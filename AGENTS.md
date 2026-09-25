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
