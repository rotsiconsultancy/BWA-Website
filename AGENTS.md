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

| Field Name | Type | Options / Enum Examples | Quiz Mapping Purpose |
| :--- | :--- | :--- | :--- |
| `energy_vibe` | `text[]` | `'grounding'`, `'protection'`, `'vitality'`, `'focus'`, `'calm'`, `'clarity'` | Matches user's desired mood/energy state |
| `intention` | `text[]` | `'inner_strength'`, `'wealth_abundance'`, `'peace_mind'`, `'courage'`, `'transformation'` | Matches user's personal goals/intentions |
| `stone_type` | `text[]` | `'tiger_eye'`, `'lava_stone'`, `'matte_onyx'`, `'lapis_lazuli'`, `'african_turquoise'`, `'red_jasper'` | Stone material preference & properties |
| `color_palette` | `text[]` | `'earth_tones'`, `'dark_monochrome'`, `'vibrant_gold'`, `'deep_blue'`, `'raw_natural'` | Aesthetic & wardrobe compatibility |
| `style_tags` | `text[]` | `'everyday_minimal'`, `'bold_statement'`, `'stacked_layers'`, `'raw_rugged'` | Lifestyle & style density preference |
| `wrist_fits` | `text[]` | `'small_16cm'`, `'medium_18cm'`, `'large_20cm'`, `'adjustable'` | Sizing & fit compatibility |

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
