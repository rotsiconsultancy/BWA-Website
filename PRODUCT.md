# Beads World Africa — Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Audience priorities confirmed by the owner on 2026-10-09:

1. Men in Kenya buying bracelets for themselves.
2. Women buying bracelets as gifts for men.
3. Women buying bracelets for themselves.

Customers want meaningful, handcrafted bracelets that match personal style and intention. International customers are a secondary audience for now; international logistics remain unresolved. Existing USD support does not imply that international expansion is a current business priority.

Staff also use the protected operations workspace to manage the catalogue, stock, orders, customers, discovery quiz, offers, and CRM sync visibility.

## Product Purpose

Help customers find and order a bracelet that feels personally meaningful, through collection browsing, guided discovery, or a bespoke request. The central commercial outcome is an order handed off to WhatsApp with the selected products, sizes, and pricing retained.

## Positioning

Beads World Africa (BWA) centres African craftsmanship, natural materials, personal identity, and the stories people choose to wear. The owner confirmed these existing brand commitments on 2026-10-09.

The storefront combines a shoppable catalogue with “Find Your Bracelet,” a recommendation flow matching product traits to a customer's style and intention, and a bespoke path for custom requests. These are product mechanisms, not claims of market exclusivity.

## Operating Context

- Customers browse the collection at `/shop` or `/bracelets`, explore discovery hubs or search, select a product and fit, add it to their bag, and proceed to checkout and WhatsApp.
- “Find Your Bracelet” offers recommendations from the catalogue using configured taxonomy signals. Recommendations can lead to a product, the bag, or a bespoke request.
- Bespoke requests start at `/bespoke`. Customers can view private order tracking after ordering.
- Staff use authenticated `/admin` routes with role-based access. Supabase owns commerce records; CRM synchronization is downstream and must not block customer ordering or tracking.
- The existing web app uses Next.js App Router, TypeScript, custom CSS, and Supabase. The development entry is `pnpm dev`; the homepage is `/`.

## Capabilities and Constraints

- Preserve WhatsApp-first checkout. Direct card payments are currently disabled.
- KES and USD prices are entered independently, not converted through an exchange rate. Preserve explicit customer currency selections and server-side order price calculation.
- Product variants, wrist fit, sellable stock, galleries, and publication state affect the shopping journey. Use the live Supabase catalogue; local seed products are a development fallback.
- Preserve the central product taxonomy in `lib/commerce/taxonomy.ts`, including energy, intention, material, colour, style, fit, occasion, and recipient. Materials include non-stone options; do not describe every product as natural stone indiscriminately.
- Discovery matches configured product tags, rather than visible answer wording. Staff can edit and publish the quiz.
- Discounts apply to merchandise, not delivery, and are validated server-side.
- Brevo supports newsletter subscriptions. Meta Pixel requires marketing consent.
- International shipping destinations, logistics, and promises remain open business decisions. Do not invent delivery commitments to support expansion.

## Brand Commitments

- Preserve the Beads World Africa name and BWA abbreviation.
- Preserve the emphasis on African craftsmanship, natural materials, meaningful designs, and personal story.
- Existing brand copy includes: "Wear what feels like you" or “Wear what means something.” and “Handmade in Africa.” The owner confirmed the current brand claims; new claims still require evidence.
- Brand marks are in `public/brand/`; existing BWA imagery is in `public/images/`. Preserve asset identity and product accuracy in future work.

## Evidence on Hand

- The owner confirmed the existing brand claims and proof assets as verified on 2026-10-09, including the James K. testimonial, 4.9/5 customer rating, and external imagery currently referenced in `components/home/SocialProof.tsx`. This records owner confirmation, not an independent audit or a transfer of ownership of external assets.
- Existing homepage imagery includes the mountain bracelet scenes, story image, and final CTA images in `public/images/`.
- Product records and galleries come from Supabase; `lib/data/products.ts` provides local seed content.
- `AGENTS.md` records architecture, commerce constraints, and implementation history. Current code takes precedence over the older foundation-only descriptions in `README.md` when identifying implemented features.
- Do not fabricate additional reviews, ratings, sourcing details, certifications, customer counts, or shipping guarantees.

## Product Principles

1. Prioritize Kenyan men and women gifting men when making audience and journey decisions.
2. Help customers choose through style, meaning, material, and fit, with clear routes from discovery to purchase.
3. Carry accurate product, stock, size, and pricing information through the WhatsApp order handoff.
4. Keep customer commerce dependable independently of downstream CRM integrations.
5. Ground brand promises and social proof in confirmed evidence, and expand international promises only when logistics support them.
