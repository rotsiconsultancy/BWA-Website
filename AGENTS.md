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
| `stone_type`    | `text[]` | `'tiger_eye'`, `'lava_stone'`, `'unakite'`                                                | `'matte_onyx'`, `'lapis_lazuli'`, `'turquoise'`, `'red_jasper'` | Stone material preference & properties |
| `color_palette` | `text[]` | `'earth_tones'`, `'dark_monochrome'`, `'vibrant'`, `'deep_blue'`, `'raw_natural'`         | Aesthetic & wardrobe compatibility                              |
| `style_tags`    | `text[]` | `'everyday_minimal'`, `'bold_statement'`, `'stacked_layers'`, `'raw_rugged'`              | Lifestyle & style density preference                            |
| `wrist_fits`    | `text[]` | `'small_16cm'`, `'medium_18cm'`, `'large_20cm'`, `'adjustable'`                           | Sizing & fit compatibility                                      |

---

## 📝 Change Log

### [2026-11-16] — Stone Pages: "Ukalite" Renamed to Unakite; Empty Stone Pages 404

- **Why**: Search Console (owner's export 2026-11-16) listed `/bracelets/ukalite-bracelets` as crawled, not indexed. "Ukalite" was a misspelling of unakite; the page was live, indexable, out of the sitemap and showed no bracelets. `/bracelets/turquoise-bracelets` was the same (no bracelet carries the tag).
- **What**: `ukalite-bracelets` hub replaced by `unakite-bracelets` (Pwani Sand, Savannah Mosaic); the old address 308-redirects there via `SEO_HUB_REDIRECTS` in `lib/commerce/seo-hubs.ts` (never remove entries). A stone/feeling page with no bracelets now answers 404, matching the sitemap, which already skipped empty hubs. "Ukalite" option removed from `taxonomy.ts` and from the fallback seed products.
- **Checked**: tsc, 40 tests; local server against live data: ukalite 308 → unakite 200 (2 bracelets), turquoise 404, lava 200, sitemap now lists unakite.

### [2026-11-14] — Journal: Malachite Belief Corrected

- Removed "malachite was believed to warn its wearer of danger by breaking" from `content/journal/malachite-africas-copper-green.md` (releases 2026-11-15). Research found no source for malachite; that lore belongs to coral. Replaced it with a sourced belief: in ancient Rome malachite was worn as an amulet to guard children (Pliny, Natural History 37). Sources file updated in `../Website-data/stone-stories-2026-11-01/`.

### [2026-11-09] — Admin: Record an Order by Hand (Backdated)

- **Why**: owner sells outside the website checkout (Instagram, WhatsApp, in person, stockists) and wants those sales in the system, dated when they happened.
- **What**: `/admin/orders/new` ("Record an order" button on Orders, owner and commerce_manager only). Customer (phone required; an existing phone joins that customer and only fills blanks), date and time in Nairobi (no future dates), channel, KES/USD, any number of lines, each a catalogue bracelet (price prefilled, editable) or a named custom piece, with its own quantity; delivery fee, discount, status (default Delivered) and payment (default Paid), note. Saves `orders.created_at`, the customer's `created_at` (new customers) and the first status-history row at the order date; `orders.source` = channel. No SQL needed (existing columns). No order email alert, no stock change (the website checkout doesn't decrement stock either), no discount-code redemption. Double submits are caught by an idempotency key. Review links work as usual once Delivered.
- **Files**: `lib/commerce/manual-order.ts` (+ test), `components/admin/ManualOrderForm.tsx`, `app/admin/orders/new/page.tsx`, `createManualOrder` in `app/admin/orders/actions.ts`; order list and detail now show date and channel.
- **Checked**: 3 new tests (40 pass), type-check, build; the form in the browser (desktop and phone) via a temporary preview route, since admin needs the owner's login. Saving a real order not tested (would write to live Supabase).

### [2026-11-09] — QR Links: Packaging-Card Welcome Page, One-Time Welcome Codes, Admin Dashboard

- **Agent**: Claude Code
- **What**: the packaging card's QR opens `/welcome/<slug>` (noindex). Admin → **QR links** (`/admin/qr`) creates one link per channel or print run; the slug is made on the server (channel + 4 random characters, e.g. `mancave-7k2p`), with reward per link (default 10% off, 60 days, optional minimum in KES). List shows scans, phones, registered, orders after and revenue per link; **View** (`/admin/qr/[id]`) has the QR as SVG (print) and PNG downloads, a funnel (scans → registered → codes used → orders after), scans per day for 30 days, and everyone who registered (bracelet, code status, later orders, WhatsApp button). Links can be paused (page still opens, no new codes), not deleted.
- **Customer side**: one screen (first name, WhatsApp number, optional bracelet, unticked "new collections" consent, hidden honeypot). Success shows `WELCOME-XXXXXX`, rules, "Save it on WhatsApp" (opens a chat with BWA's number) and "Request resizing" (WhatsApp). The device remembers the code (localStorage) and shows it on the next scan. Unknown slug → friendly page with WhatsApp, never a dead end.
- **Rules (in `register_qr_welcome`, one transaction)**: customer saved by phone in `customers` (source `qr`, name never overwritten, marketing consent only ever switched on); one welcome code per phone number ever (re-registering returns the same code); code is percentage, 1 use, tied to `customer_id`, so checkout's existing `DISCOUNT_NOT_YOURS` and redemption cap stop reuse; at most 5 registrations per device per hour and per phone per day. Consent wording stored with every yes (`CONSENT_TEXT`).
- **Scans**: logged by the page in the browser (`/api/qr/scan`), so link previews aren't counted; same device within 10 minutes counts once; random device id, no IP stored.
- **Attribution**: `qr_link_stats` view; an order counts for the link a customer first registered through, if placed on the site after registering, not cancelled/refunded. The shop sale itself isn't visible.
- **Also**: welcome codes hidden from Offers (`/admin/discounts`); customer profile gets a "Packaging card (QR)" panel; new dependency `qrcode` 1.5.4 (pnpm).
- **Files**: `lib/commerce/qr-welcome.ts` (+ tests), `app/welcome/[slug]/page.tsx`, `components/welcome/WelcomeForm.tsx`, `app/api/qr/{scan,register}/route.ts`, `app/admin/qr/`; SQL appended to `supabase/schema.sql`.
- **Checks**: tsc, 37 tests, production build. SQL tested on a throwaway Postgres 16 with the full schema: runs twice cleanly; new code, same code on re-register, bad phone, unknown link, paused link, 10% at checkout (KES 1,500 → 1,350), reuse refused, other phone refused, stats correct, anon denied, spam limit. Customer screens checked at 375 px with a temporary preview (deleted). Admin pages not viewed (needs login and the SQL live).
- **Live test (owner OK, same day)**: owner ran the SQL. Created "Test – delete me" (`/welcome/mancave-qdu7`) from the admin form, registered with 0700 000 001: got `WELCOME-MT9ZRX`; registering again returned the same code ("Given earlier"); link page showed the right funnel, people list and QR. Fixed two things found: one phone counted as 2 scans (effect ran twice in dev; now one scan per page load), and the site's email pop-up covered the welcome page (now hidden on `/welcome`, `/review` and `/admin`). Test link paused; `Website-data/qr-links-2026-11-09/2-delete-test-link.sql` removes it.
- **Needs**: run `2-delete-test-link.sql` when done looking; push.

### [2026-11-08] — Exchange Policy: No Refunds, Customer Pays Delivery

- **Owner, 2026-11-08**: BWA does not give money back; customers can switch for another piece and still pay the delivery costs.
- **Changes**: `/returns` is now the "Exchange Policy" (same URL): exchanges only within 7 days of delivery, for another size, stone or bracelet subject to stock; customer pays delivery both ways; pays the difference if the new piece costs more; no cash/M-Pesa/card refunds or delivery refunds; a paid order BWA cancels is still refunded in full (Terms §5). Terms §9 renamed "Exchanges (No Refunds)", bespoke clause says exchange only on defect. FAQ answer, `llms.txt`, footer link label updated. `MerchantReturnPolicy` JSON-LD (layout + products) gains `refundType: ExchangeRefund`, `returnFees: ReturnShippingFees`, `returnMethod: ReturnByMail`.
- **Update (owner, same day)**: BWA doesn't send damaged or wrong items, so exchanges are only for a wrong size or poor fit. Removed damaged/defective/not-as-described reasons and the "Damaged in Transit" section; custom orders (Design Your Own) cannot be exchanged (Terms §10 too).
- **Cheaper piece (owner)**: the balance is kept as credit for the next order, claimed on WhatsApp, not paid out in cash. Valid 7 days from when the new piece is sent (owner, 2026-11-08).
- **Review flow verified live (read-only)**: owner ran the review SQL and tested one review on BWA-2026-1FEDF0D5; request, review (pending), feedback and personal code THANKS-6SQRP8 (customer-bound, 1 use, KES 200 / USD 2, 60 days) all saved as designed.

### [2026-11-08] — Review & Reward: Review Link After Delivery, One-Time Thank-You Code

- **What**: a delivered order gets one review link (`/review/<token>`, valid 30 days, noindex). Three steps, "Takes under a minute": stars per bracelet (with its photo), chips + one optional line + permission to show (name, town), then a private "One thing we could do better next time?" (chips + note). On send the client gets `THANKS-XXXXXX`: KES 200 / USD 2 off (shown as "KES 200 (USD 2)" on the page and in messages, `REWARD_LABEL`), one use, 60 days, given whatever the rating. Opening the link again shows the same code (used/expired state).
- **Code tied to the client**: `discount_codes.customer_id`; `/api/discounts/quote` now takes the checkout phone and `create_checkout_order` raises `DISCOUNT_NOT_YOURS` for anyone else. Quote falls back if the column doesn't exist yet.
- **Admin**: order page → "Review & reward" panel (Create review link once Delivered; Send on WhatsApp with a ready message; status, code, stars, private feedback). New `/admin/reviews`: links made/opened/reviewed, ranked "could do better" bars, feedback list with Reply on WhatsApp and New/Replied/Done, reviews with Waiting/On the website/Hidden (only when the client allowed showing).
- **Site**: approved reviews show under the product (`components/product/ProductReviews.tsx`) marked "Verified buyer · received a thank-you code". No rating structured data yet. Optional `NEXT_PUBLIC_GOOGLE_REVIEW_URL` adds an unrewarded "Review us on Google" link on the thank-you screen (Google bans rewarded reviews).
- **Files**: `lib/commerce/review-reward.ts` (terms, chips, parsing; tests in `review-reward.test.ts`), `lib/commerce/review-request.ts`, `app/review/[token]/page.tsx`, `components/review/ReviewForm.tsx`, `app/api/reviews/route.ts` (calls `submit_order_review`, one transaction), `app/admin/reviews/`, `components/admin/OrderReviewPanel.tsx`; SQL appended to `supabase/schema.sql`.
- **Needs**: run `Website-data/review-rewards-2026-11-08/1-add-review-rewards.sql` in Supabase (until then admin shows the instruction and checkout is unchanged). Only website orders get links; WhatsApp-only sales aren't in `orders`.

### [2026-11-07] — Corporate Gifts Page (The Appreciation Collection)

- **Agent**: Claude Code
- **Source**: the owner's `BWA Corporate Gifting Proposal.pdf` (Downloads, 13 slides). Owner chose to turn it into a web page.
- **Page**: `/corporate-gifts` (`app/corporate-gifts/`), same world as Our Story (lava, bone, evergreen, gold; Bricolage now shared via `lib/story-font.ts`). Sections: opening ("Ask for a quote" email + WhatsApp, packs from KES 2,000), the idea and four reasons, three outside figures with sources, the three packs with prices and an "Ask about <pack>" email each, where a bracelet fits by industry, four steps, close. Data in `lib/commerce/corporate-gifts.ts`.
- **Left out of the deck**: "a handwritten card in every order" (not recorded anywhere) and the 4.9/5 rating; "each stone has a name and a place" softened to "many stones". The three figures are the deck's; their sources weren't reachable from this machine, so the owner should check them before pushing.
- **Links**: Our Story team section ("See the packs and prices"), footer "Corporate gifts", sitemap (0.7), `llms.txt`. GA4 `corporate_gift_enquiry_click` {placement: corporate_page, method, pack}.
- **Checks**: tsc, Prettier, 24 tests, detector clean; viewed at 1440 and ~700px. Not committed.

### [2026-11-07] — Our Story: a Real Story, Team Gifts Up Front, Scaled Down

- **Agent**: Claude Code
- **Owner feedback**: "no story, just pretty"; corporate angle missed; scale it down.
- **Story**: new bone section after the opening, "It started with a bracelet on someone's wrist.", in prose from the owner's own why (approved note as the lead, then handmade in Kenya, the everywhere-you-go idea, matching pairs, families, gifts), signed "— BWA", with a sticky photo. The separate "Why we do this" section is folded into it. "Here's a week of it." now introduces the coloured week.
- **Team gifts**: hero link "Buying for a team? See team gifts" (`our_story_click` `hero_team_gifts`, jumps to `#team-gifts`); the section lists three occasions (staff appreciation, client thank-yous, events) and how to start ("Tell us the occasion, how many people and when… we'll come back with bracelet options"). Still no minimums, prices or lead times.
- **Scale**: headings, beads (168 → 112px), moment fields, photos (now square) and spacing reduced; desktop page height ~11,000 → ~7,160px. Checks: tsc, 24 tests, detector clean; viewed at 1440 and 375.

### [2026-11-07] — Our Story Redesigned: A Week on the Wrist

- **Agent**: Claude Code
- **Why**: owner disliked the layout and the seal; asked for a fresh design, free of the other pages' style.
- **Design**: the page has its own world. Lava-black opening (Bricolage Grotesque display, loaded in the page via `next/font`, `--font-story`; body stays Manrope), gold "Find Your Bracelet". The six moments are full-width fields, each in one stone's colour (`MOMENTS` in `lib/commerce/our-story.ts`: Kirinyaga Cloud, Kerio Earth, Chuma Mirror, Malindi Sunset, Watamu Deep, Simba Gold), with that stone's real bead photo strung on one thread running down the page; the bead slides down the thread as its field arrives (CSS scroll-driven animation, off under reduced motion, visible without support) and the stone name links to its bracelet. Then the note on lava, matching/gift photos staggered on bone, the 18 place names as a tray of real beads on lava, team gifts on evergreen, a big closing. `KenyaSeal.tsx` removed.
- **Checks**: tsc, Prettier, 24 tests, Impeccable detector (no findings); viewed at 1440 and 375 (no sideways scroll, no console errors). Copy, GA4 events, metadata and JSON-LD unchanged. Not committed or pushed.

### [2026-11-07] — Our Story Rewritten: "It Goes Where You Go"; Team Gifts

- **Agent**: Claude Code
- **Concept**: built on the owner's own why: a bracelet goes everywhere with you, through ordinary and big days; matching sets and gifts carry people with them. Wording chosen by the owner (version C, "why" note from A, corporate a mix of A and C). Signed "BWA" only: no founder name or face (owner).
- **Page** (`app/our-story/page.tsx`, `story.module.css`): opening "With you for all of it."; six "It's there…" moments beside a sticky photo (hidden on phones); "Why we do this" note on forest; matching sets (owner confirmed couples and families buy them) and gifting cards; "Every name is a piece of home": 18 place-named stones from `getDesignStones()` with bead photos, linking to the product (or Design Your Own if unlisted), list in `lib/commerce/our-story.ts` `PLACE_NAMES`, plus the "names honour the places" note; `#team-gifts` band ("The day they were recognised, worn every day after.") with email `beadsworldafrica@outlook.com` and WhatsApp; closing "Where will it take you?" with ManCave Mwanzi and Stock BWA. `revalidate = 3600`. The old materials section is gone (footer link now "Team gifts").
- **Photos**: two more web copies from the 2026-10-27 shoot, no faces: `matching-pair.webp` (IMG_3225), `handed-over.webp` (IMG_3386).
- **GA4**: new `components/marketing/TrackedLink.tsx`; events `our_story_click` {placement, link}, `corporate_gift_enquiry_click` {placement, method: email/whatsapp}, `stockist_enquiry_click` {placement: our_story}.
- **Seal**: `app/our-story/KenyaSeal.tsx`, BWA's own "Handmade in Kenya" seal (ring of beads in forest/clay/ink, text turning once every 48 s, still under reduced motion) stamped on the opening photo's corner. The owner's `public/images/made-in-kenya.png` was not used: it looks like the official Made in Kenya certification mark, which BWA isn't confirmed to hold, and its flag colours clash with the site.
- **Corporate band promises nothing**: no minimums, prices, lead times or personalisation until the owner confirms them.
- **Checks**: tsc, Prettier and 24 tests pass; checked at 1024px and 375px in dev (no console errors, no sideways scroll). Not committed or pushed.

### [2026-11-07] — Brand-led Our Story Page

- **Agent**: Codex
- **What**: Added static `/our-story` (`app/our-story/page.tsx`, scoped `story.module.css`) with BWA's existing palette/type, real wrist and bead photographs, Kenyan-name explanations, materials, gifting and discovery links. Owner requested minimal personal involvement: no founder biography or faces; making-process content deferred until genuine photographs exist. Image sources and copy evidence: `docs/our-story.md`; web-sized derivatives in `public/images/our-story/`, originals untouched.
- **Navigation / SEO**: Desktop and mobile Our Story links, footer and homepage button now open the page; active-page semantics added. Unique title/description, canonical, Open Graph/Twitter image, AboutPage and BreadcrumbList JSON-LD, sitemap and existing `llms.txt` entry. Existing homepage `#story` remains valid.
- **Validation**: 24 existing tests, TypeScript and production build pass. Build needed network access for existing Google fonts. Verified rendered metadata and built HTML, sitemap and llms.txt; desktop/mobile visual checks and widths 320/375/414/768/1280/1920 show no horizontal overflow. Mobile menu opens the page and closes; all three photographs load. No live-data changes, commit or push. Pre-existing `public/images/made-in-kenya.png` and generated-file changes are outside this task.
- **Needs the owner**: Review the local page; publication needs separate approval.

### [2026-11-05] — Homepage Speed; /shop Out of the Sitemap

- **Why**: the new weekly SEO check (`../Website-data/seo/`) found the homepage's largest paint (the hero photo) at 6–9 s on phones, and `/shop` listed in the sitemap while marked noindex.
- **Hero**: `components/home/Hero.tsx` slides are now `next/image` (`fill`, `sizes="100vw"`); the first is preloaded with `fetchPriority="high"`. Phones get a ~28 KB 750 px WebP instead of the 100 KB 1671 px original, found in the HTML head instead of after hydration. `.hero-bg-layer` uses `object-fit: cover` instead of a background image.
- **Fonts**: Cormorant Garamond and Manrope now load through `next/font/google` in `app/layout.tsx` (self-hosted, preloaded) instead of an `@import` of Google Fonts in `globals.css`, which blocked rendering. CSS uses `var(--font-cormorant)` / `var(--font-manrope)`; `--font-display` is still undefined as before (left alone).
- **Sitemap**: `/shop` removed from `app/sitemap.ts` (`/bracelets` is the page meant to rank).
- **Measured** (Lighthouse mobile, devtools throttling): live homepage LCP 7.6 s before; local production build 2.7 s; live after push (2026-11-05, 4b15c11) 3.5–4.1 s, FCP ~3.4 s. Next limit is first paint (server response ~0.7 s, GA4 and app JS).

### [2026-11-03] — IndexNow After Production Deployments

- **Agent**: Codex
- **What**: `.github/workflows/indexnow.yml` runs after successful Vercel `Production` deployments, with a manual main-branch trigger. `scripts/indexnow.py` verifies the live key, reads the live sitemap (excluding noindex `/shop`), compares Git changes and cached sitemap URLs, and submits new/changed/removed URLs. Shared storefront changes notify all public URLs; Journal-only changes target released articles plus indexes. Documentation-only changes skip existing URLs. No credentials beyond the read-only checkout token are needed.
- **Reliability**: Serial runs, superseded-deployment guard, bounded network retries, 10,000-URL batches, 200/202 reporting, and baseline saved only after successful submission. Cache eviction causes a full submission. Verified actual deployment metadata: environment `Production`, production flag false.
- **Deployment verification**: The first production run submitted 79 URLs (HTTP 202); the manual run returned HTTP 200. GitHub refuses caching on `deployment_status`, so that event now dispatches the submission on main with the deployed SHA; only the handoff job has Actions-write permission.
- **Checks**: Six Python tests cover noindex filtering, foreign hosts, future articles, deleted articles, shared changes, and preserving the baseline on failure; workflow YAML parses. Operational details and limits in `docs/indexnow.md`: existing product content edited in Supabase and scheduled releases without deployments need separate triggers/manual handling.

### [2026-11-03] — IndexNow Verification File

- **Agent**: Codex
- **Fix**: Moved the owner's `5e0b51cbe8264cc28a4b68f83e625e5f.txt` from the repository root into `public/` so Next.js serves it at `/5e0b51cbe8264cc28a4b68f83e625e5f.txt`. The live URL previously returned 404.
- **Validation**: Verified the filename matches the exact UTF-8 contents and the key meets IndexNow's format. Owner authorized pushing this fix on 2026-11-03; live verification follows deployment.

### [2026-11-03 05:20] — Favicon Visible on Dark Browser Tabs

- **Why**: the favicon was `public/brand/bwa-emblem.svg` (dark brown #302014), which disappears on dark browser themes.
- **What**: new `public/brand/bwa-favicon.svg`, built from the emblem's two visible paths only (the hidden working layers dropped, 302 KB → 114 KB) and cropped square to the emblem so it's bigger in the tab. Its CSS uses `prefers-color-scheme`: brown with cream bead dots on light tabs, white with brown bead dots on dark tabs, so the bead details stay. `app/layout.tsx` `icons.icon` points to it. `bwa-emblem.svg` is unchanged (still the schema logo and the CSS mask in `globals.css`). Safari ignores SVG favicons and uses the apple-touch icon.

### [2026-11-01 23:00] — Journal: Scheduled Release Dates; Five Stone Stories Queued

- **Scheduling**: `lib/journal/posts.ts` hides a post until its `date` in Nairobi (`nairobiToday()`, `isReleased()`, tests in `posts.test.ts`). `getAllPosts()` (index, sitemap, llms.txt, men's page, more posts) and `getPost()` both filter, so a future post 404s until its day; post pages and the sitemap revalidate hourly, so it appears within an hour of midnight. `next dev` shows scheduled posts for review. To schedule: set `date` to the release day.
- **Queued** (owner asked to write the series in one go and release weekly): genuine stone, `genuine-stone-how-to-know-what-youre-wearing.md` (2026-11-08; replaced the real-or-fake draft 2026-11-02: owner said it made the products read as fake), tiger's eye (11-15), obsidian (11-22), malachite (11-29), lapis lazuli (12-06), all "Stone guides" with product cards under each named bracelet and one design card. Sources per post in `../Website-data/stone-stories-2026-11-01/<slug>-sources.md`. Images: shoot crops where BWA has them, otherwise crops of the product renders (AI-made) or catalogue photo.
- **Dates (owner, 2026-11-02)**: series dated weekly from 2026-10-18: lava 10-18, genuine stone 10-25, tiger's eye 11-01, obsidian 11-08, malachite 11-15, lapis 11-22. The dates in the Queued line above are superseded.
- **Lava story**: owner confirmed 2026-11-01 that BWA's red/orange lava is not dyed; the "Why some lava is red" section and FAQ now explain natural iron oxidation.

### [2026-11-01 21:00] — Journal: Stone Stories Start (Lava Stone); Design Card

- **Post**: `content/journal/lava-stone-the-volcano-on-your-wrist.md` (Stone guides): what lava stone is, the four volcanoes behind our lava names (Longonot, Chyulu, Suswa, Menengai), why red/orange lava is dyed, obsidian (Njorowa Ember), how to wear it, 4 FAQs. Photos are the owner's 2026-10-27 shoot (`public/journal/lava-stone-the-volcano-on-your-wrist/cover.webp` from IMG_3237, `pores.webp` from IMG_3220). Sources: `../Website-data/stone-stories-2026-11-01/lava-sources.md`; series plan: `plan.md` there.
- **Design card**: `{{design: <product-slug>}}` in a post renders `components/journal/JournalDesignCard.tsx` (dashed card, "Make it yours with <stone>", button to `/design-your-own?product=<slug>`). Owner (2026-11-01): a bracelet card under every section that names one; the lava story has six (Longonot, Chyulu, Suswa, Menengai, Moto Lava, Njorowa Ember) and its design card uses Longonot Black. GA4 `journal_design_click` {post_slug, item_id, item_name, placement}. Parsing in `lib/journal/markdown.ts` (`CARD` regex now matches product and design).
- **Dev server**: the root `.claude/launch.json` "website" config ran `next dev BWA-Website` from the root, so `process.cwd()` missed `content/journal` and every post 404'd locally. It now runs `cd BWA-Website && next dev`. A stale `.next/dev` cache then 404'd every route; it was moved aside.

### [2026-11-01 20:00] — Search Titles, Brand Name, Breadcrumbs, Return Policy

From the Search Console export (13 Sep–30 Oct 2026, `../beadsworldafrica.co.ke-Performance-on-Search-2026-11-01.xlsx`): 257 impressions, 13 clicks, avg position ~15; "beads world africa" ranked ~10th, "tiger eye bracelet" ~1.6 with 0 clicks, "stone bracelets" 19th.

- **Homepage**: title "Beads World Africa | Natural Stone Bracelets Handmade in Kenya", new description (stones, men and women, WhatsApp, Nairobi and Kenya delivery), canonical `/` (`app/page.tsx`). New `WebSite` JSON-LD in the layout (name + alternateName BWA, Beads World, beadsworldafrica) so Google uses the brand as the site name.
- **Stone/feeling hubs**: title adds ", from KES <lowest price in the hub>" (`fromPriceKes()` in `lib/commerce/seo.ts`); description adds `DELIVERY_SNIPPET`. Tiger eye snippet rewritten around "tiger eye stone bracelets for men and women".
- **/bracelets**: title "Stone Bracelets in Kenya, Handmade | Beads World Africa", H1 "Stone bracelets that move with you.", new description. No "from KES" here: the cheapest pieces (KES 200) are patterned beads, not stone.
- **Breadcrumbs**: `breadcrumbJsonLd()` on /bracelets, hubs and products.
- **Products**: each Offer gets `seller` and the 7-day `hasMerchantReturnPolicy`. No `shippingDetails`: delivery has no fixed rate (Uber/Bolt fare, quoted outside Nairobi); set shipping in Merchant Center (roadmap A5).
- **Next check**: new export around 2026-11-29.

### [2026-10-30 21:00] — Design Your Own: Design Ids, Sent-Design List, Link Pictures, Ideas, Saved Designs

- **Design ids**: every Send makes a new id (`lib/design/design-id.ts`, `D-` + 5 of `2-9A-HJKMNP-Z`), puts it in the WhatsApp message ("design D-XXXXX") and in the message's design link (`&id=`). WhatsApp opens first; the copy is sent with `sendBeacon` (fetch keepalive fallback) to `POST /api/design-leads`, which re-reads the link with `lib/design/design-link.ts`, checks the stones, works out the KES price range and inserts into the new `design_leads` table (no name, phone or gift message; RLS on, no public policies). It always answers 204; missing table (42P01) and repeat ids (23505) are skipped quietly.
- **Admin → Designs** (`app/admin/designs`): sent designs, newest first, find by id, open the design link, set status sent / became an order / no reply / declined (`setDesignStatus`, audit-logged as `set_design_status`).
- **Link pictures**: `generateMetadata` on `/design-your-own` gives a shared design link its own title, text and picture (`/api/design-image?…`, `next/og`): a ring of the real bead photos with the stones' names, Cormorant from Google Fonts. Satori can't read WebP, so `cut-beads.py` also writes `.png` copies and `2-upload-beads.mjs` uploads them beside the `.webp` (same address, `.png`); the route fetches those as data URLs and falls back to the stone's colour (`materialColour()` in `beads.ts` for Chuma Link and Maziwa Glow). Canonical stays `/design-your-own`. Link text says "handmade bracelet", never "natural stone" (Nyota Night is glass, Maziwa Glow shell). `getDesignStones` is wrapped in React `cache`.
- **Ideas**: "Start from an idea" row above the steps (Gold and black, Deep blue, Forest, Earth; named for the look, no best-seller claims; skipped if a stone is off) and "Surprise me".
- **Saved designs**: each sent design is kept on the phone (`lib/design/saved-designs.ts`, `bwa_saved_designs`, max 10) and listed under "Your designs" in the account panel; "Forget me" clears them too.
- **GA4**: `design_your_own_change` {field, value} for every choice; `design_your_own_send` gains `design_id`, `changes`, `seconds`, `from_design`; `design_your_own_view` gains `from_design`; new `design_your_own_idea`, `design_your_own_reopen`.
- **Fix**: `.dyo-steps` gets `grid-template-columns: minmax(0, 1fr)`, or a sideways-scrolling row widens the column past the screen.
- **Needs**: `Website-data/design-your-own-plan-2026-10-30/3-add-design-leads.sql` run in Supabase before designs are kept; mark `design_your_own_send` as a key event in GA4 (Admin → Events).

### [2026-10-30 19:00] — Design Your Own: Three Steps, Bead Swatches, Phone Bar

- **Steps**: Stones → Style → Fit (was six). Stones: feeling chips as a filter, then one round bead per stone (`Bead`: photo, else drawing, else colour), then a card for the chosen stone (bracelet photo, "traditionally associated with…", price, "See it" link only when the bracelet is listed: `DesignStone.listed` from `products.active`). Style: pattern, then for two stones a slot row (main / second); the second stone's swatches open from its slot or by tapping its beads on the ring. Fit: bead size, wrist as chips (15–20 cm, "Not sure" by default), "It's a gift" with a card message. "For me / a gift" is gone as a step.
- **Phones**: one step open at a time; a closed step shows what was chosen; "Next" buttons. The pinned preview is larger (172 px ring, name, price). A bottom bar with the price range and "Send on WhatsApp" shows until the summary scrolls in (IntersectionObserver). Page height 5,087 → ~2,750–3,200 px; stone grid 1,700 → ~600 px.
- **Ring**: soft floor shadow, faint cord, spacers drawn as small gold discs so they never look like a stone; preview note now says the bead photos are of the real stones.
- **Summary**: only what was chosen (stones, design, beads, extras, wrist, gift); the price as a range, KES listed price + 100–500 (higher of the two stones' listed prices; USD shows "From <listed>"). The WhatsApp message still lists every line.
- **GA4**: `design_your_own_send` gains `placement` (summary/bar); new `design_your_own_feeling`.
- **Link state**: a link with a gone second stone opens Style with its picker. Wrist is no longer free text (`Design.wrist` number or null); links never carried it.

### [2026-10-30 17:00] — Design Your Own: Stones From Supabase, Safe Links, Bead Photos

- **Stones from Supabase**: new `products` columns `design_enabled`, `design_slug` (the stone's code in design links), `design_name`, `design_bead_shape` (sphere/rondelle/tube), `design_bead_images` (text[]), `design_colour` (#hex), `design_aliases` (old codes) at the end of `supabase/schema.sql`. `lib/design/stones-server.ts` `getDesignStones()` returns the enabled stones (whether or not the bracelet listing is active) plus retired ones for old links. Until the columns exist (PostgREST 42703) it falls back to `LEGACY_DESIGN_STONES` in `lib/design/stones.ts`, matched against the catalogue.
- **Admin**: Products → Edit has a "Design Your Own" section (only shown once the columns exist): offer toggle, stone name and code, bead shape, colour, bead photo URLs. Changing the code adds the old one to `design_aliases` (`lib/admin/design-fields.ts`), so sent links keep working. Saving revalidates `/design-your-own`.
- **Drawing**: beads use the stone's photos when it has them; else the hand-tuned material in `lib/design/beads.ts`; else a polished bead built from `design_colour` (neutral grey without one). Shapes now come from the data, not `beads.ts`.
- **Links**: `v=1` added to shared links (old links read as v1). `?stone=` and `?with=` also match old codes. `?product=<slug>` (used by `designLink()` from the quiz) opens that product's stone and follows `PRODUCT_REDIRECTS`. A stone that is gone shows as dashed empty places on the ring, with a notice offering the 3 most similar stones (same stone type, then colour, then feeling); Send and Share stay disabled until it is replaced. Fixed: when the main stone was gone, the link's second stone could be swapped out.
- **Edge cases**: no stones at all (catalogue failed or none enabled) shows a "designer is resting" screen with a WhatsApp button instead of crashing; with one stone, the two-stone patterns are hidden.
- **GA4**: `design_your_own_view` gains `link_version`; new `design_your_own_missing_stone` (stone, role, known) and `design_your_own_unavailable`; `design_your_own_stone` gains `from` (grid/suggestion) and is sent for second stones too.
- **Bead photos**: `Assets/stones/_product-photo-kit/cut-beads.py` cuts 4 beads (256 px WebP, ~9 KB) plus a colour per round stone from the clean product photo; `Website-data/design-your-own-plan-2026-10-30/2-upload-beads.mjs` uploads them to `product-images/design-beads/<code>/<hash>.webp` and sets the columns (with undo).
- **Data (2026-10-30)**: owner ran the columns in the SQL editor; the 28 stones were switched on with `1b-enable-stones.mjs on` (the SQL's update step had not applied) and 26 got bead photos with `2-upload-beads.mjs upload` (undo: `undo`; Chuma Link and Maziwa Glow keep their drawings). Live once pushed.

### [2026-10-28 18:30] — Design Your Own Replaces Bespoke

- **Page**: `/design-your-own` (`app/design-your-own/page.tsx`, `components/design/DesignYourOwn.tsx`). Six steps: for me or a gift, an optional feeling filter (the product's `energy_vibe`), main stone, pattern (one stone, two alternating, main + accents) with a second stone, extras (spacers, letters in metal or acrylic with a soft warning past 10, a charm), bead size (medium or large), wrist size or "not sure". A live preview ring sits beside the steps (pinned under the header on phones). The summary sends the design to WhatsApp (254745474586) with a link that reopens it (`?stone=&design=&with=&size=&spacers=&letters=&kind=&charm=`), and "Share this design" uses the share sheet or copies the link.
- **Stones**: `lib/design/stones.ts` maps the 28 stones to their live product (photo, name, price, feelings come from the catalogue; a missing product is skipped). `designLink(productSlug)` opens the page with that stone picked (used by the quiz result).
- **Beads**: `lib/design/beads.ts` draws each bead on a canvas as a lit 3D sphere, rondelle or tube, with noise-based stone patterns (patches, veins, pores, flecks, bands) sampled on the curved surface; cached per stone, variant and angle. Positions are rounded so server and browser HTML match.
- **Facts used (owner, 2026-10-28)**: two stones, spacers, letters and charms are all possible; bead sizes medium and large; price is the listed price plus KES 100–500 depending on the design; making time is confirmed on WhatsApp; spacer and charm options are shown on WhatsApp.
- **Links**: header, phone menu, footer, search empty state, quiz results, men's page, FAQ, two Journal FAQ answers, sitemap and `llms.txt` point here. `/bespoke` redirects here. Removed `lib/commerce/custom-piece.ts` and the old `BespokeForm`; `/api/bespoke` is unused but kept.
- **GA4**: `design_your_own_view`, `design_your_own_stone`, `design_your_own_send` (with stone, pattern, size, extras), `share` with `content_type: design`.

### [2026-10-28 16:45] — New-Order Email Alerts; Bespoke Page Hidden

- **Order alerts**: `lib/commerce/order-alert.ts` emails the owner on every new website order through Brevo's transactional API (`/v3/smtp/email`, same `BREVO_API_KEY`): order number, items, total, customer name/phone/email, delivery, a "WhatsApp the customer" button and an admin link. Called from `app/api/orders/route.ts` inside `after()`, so it runs once the response is sent and a failure is only logged. Env: `ADMIN_ALERT_EMAIL` (required, owner's Gmail), `ADMIN_ALERT_FROM` (optional, defaults to `orders@beadsworldafrica.co.ke`). Test send on 2026-10-28 got Brevo 403 "SMTP account is not yet activated": Brevo must activate transactional email on the account before alerts arrive.
- **Bespoke hidden** (owner is rethinking the page): `/bespoke` redirects to `/bracelets`; removed from header, mobile menu, footer, sitemap and llms.txt. Custom-piece links (search empty state, quiz results, men's page, FAQ, two Journal answers) now open WhatsApp via `lib/commerce/custom-piece.ts`. `BespokeForm` and `/api/bespoke` are kept for the rethink.

### [2026-10-28 16:00] — Account Icon: Details Saved on This Phone; Install Manifest

- **Agent**: Claude Code
- **Account drawer**: the header person icon (was a dead button) opens `components/layout/AccountDrawer.tsx`, reusing the bag drawer styles. It shows the name, phone, email and address from the last checkout plus up to 10 past orders (links to `/order/<number>`), all read from `localStorage` key `bwa_saved_customer` (`lib/commerce/saved-customer.ts`). No account, password or server storage; "Forget me on this phone" clears it. Checkout fills itself in from it (with a "Not you?" reset) and saves it after the order is created; the tracking page prefills the phone.
- **Brand actions** (`components/marketing/GrowBwaLinks.tsx`), in the drawer and on the order confirmation screen: Follow @beadsworldafrica, Share BWA (native share sheet, WhatsApp fallback), Own a shop? Stock BWA (same WhatsApp message as `/stockists`, now `STOCKIST_ENQUIRY_URL` in `lib/commerce/stockists.ts`). GA4 events: `account_open`, `instagram_follow_click`, `share`, `stockist_enquiry_click` (each with `placement`), `app_install_prompt`.
- **Install**: `app/manifest.ts` (standalone, forest theme) with icons in `public/icons/` rendered from `public/brand/BWA-social-profile-dark-green.svg`; Apple touch icon in the layout metadata. Android Chrome shows an "Add BWA to your home screen" row in the drawer when installable. No service worker or push.
- **Fix**: `.cart-drawer-root` z-index 100 → 210. The header (200) covered the top of the bag drawer on phones, hiding its close button.

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
