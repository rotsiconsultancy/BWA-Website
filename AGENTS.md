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

| Field Name      | Type     | Options / Enum Examples                                                                                | Quiz Mapping Purpose                     |
| :-------------- | :------- | :----------------------------------------------------------------------------------------------------- | :--------------------------------------- |
| `energy_vibe`   | `text[]` | `'grounding'`, `'protection'`, `'vitality'`, `'focus'`, `'calm'`, `'clarity'`                          | Matches user's desired mood/energy state |
| `intention`     | `text[]` | `'inner_strength'`, `'wealth_abundance'`, `'peace_mind'`, `'courage'`, `'transformation'`              | Matches user's personal goals/intentions |
| `stone_type`    | `text[]` | `'tiger_eye'`, `'lava_stone'`, `'matte_onyx'`, `'lapis_lazuli'`, `'african_turquoise'`, `'red_jasper'` | Stone material preference & properties   |
| `color_palette` | `text[]` | `'earth_tones'`, `'dark_monochrome'`, `'vibrant_gold'`, `'deep_blue'`, `'raw_natural'`                 | Aesthetic & wardrobe compatibility       |
| `style_tags`    | `text[]` | `'everyday_minimal'`, `'bold_statement'`, `'stacked_layers'`, `'raw_rugged'`                           | Lifestyle & style density preference     |
| `wrist_fits`    | `text[]` | `'small_16cm'`, `'medium_18cm'`, `'large_20cm'`, `'adjustable'`                                        | Sizing & fit compatibility               |

---

## 📝 Change Log

### [2026-09-11 10:37] — Hero Background Image Fix

- **Agent**: Antigravity
- **Changes**: Fixed `app/globals.css` where `background-image` was overridden by shorthand `background`. Fixed public image URL path from `/public/images/` to `/images/`.

### [2026-09-11 11:42] — Story Section Layering Fix

- **Agent**: Antigravity
- **Changes**: Fixed `.story-image` background layer order in `app/globals.css` where opaque solid gradient was blocking `url(/images/wear-sth-that-story-section.png)`. Swapped layers and used semi-transparent `rgba()` overlay.

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
