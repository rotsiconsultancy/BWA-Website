# Our Story

Local page added 2026-11-07 at `/our-story`, approved for implementation by the owner. Publication requires separate approval. No founder biography, portraits, invented history, workshop photographs or production-process claims.

## Images

All new assets are web-sized derivatives of the owner's real 2026-10-27 shoot. Originals are untouched. The photographer's hands were approved by the owner on 2026-10-27 in the shoot README.

| Asset in `public/images/our-story/` | Original in `../Assets/lifestyle/2026-10-27-shoot/` | Treatment                            |
| ----------------------------------- | --------------------------------------------------- | ------------------------------------ |
| `worn-together.webp`                | `IMG_3392.jpg`                                      | Resized to 1200 × 1600; faces absent |
| `beads-in-hand.webp`                | `IMG_3219.jpg`                                      | Resized to 1000 × 1333; faces absent |
| `bracelets-in-sunlight.webp`        | `IMG_3239.jpg`                                      | Resized to 1000 × 1333; faces absent |
| `share.jpg`                         | `IMG_3239.jpg`                                      | 1200 × 630 crop for social sharing   |
| `matching-pair.webp`                | `IMG_3225.jpg`                                      | 3:4 crop, 1000 × 1333; faces absent  |
| `handed-over.webp`                  | `IMG_3386.jpg`                                      | 3:4 crop, 1000 × 1333; faces absent  |

The page uses responsive `next/image`, with eager/high-priority loading only on the hero and lazy loading below it. No generated imagery was added.

## Copy sources

- `../README.md`, `../Strategy/strategy.md` and `PRODUCT.md`: handmade in Kenya, audience priorities, personal meaning, mixed materials and gifting.
- `content/journal/lava-stone-the-volcano-on-your-wrist.md`: Longonot and Chyulu names, relative bead sizes, landscape inspiration rather than stone provenance.
- `../Assets/lifestyle/2026-10-27-shoot/README.md`: photograph provenance and bead identification.

## Search and navigation

Unique title, description, canonical, Open Graph and Twitter metadata; 1200 × 630 sharing image; AboutPage JSON-LD refers to the existing organization and website entities; BreadcrumbList matches the visible breadcrumb. Added to the sitemap and existing `llms.txt`; desktop/mobile menu, homepage Story button and footer link to the new page. The old homepage `#story` section remains available for existing links.

This page introduces the brand; `/bracelets` remains the shopping destination. No rankings or rich-result appearance are promised. Making-process photographs can be added when genuine assets exist.

## Rewrite (2026-11-07, Claude Code)

The page now tells the owner's own reason for BWA: a bracelet goes where you go. Wording chosen by the owner (version C, the "Why we do this" note from version A, the team-gifts band a mix of A and C), signed "BWA" with no founder. Matching sets for couples and families: owner confirmed. Corporate contact: beadsworldafrica@outlook.com and the usual WhatsApp; no minimums, prices, lead times or personalisation are promised. Place names come from `lib/commerce/our-story.ts` and the live Design Your Own stones; the names honour places and never claim where a stone comes from (`../Assets/stones/README.md`). The materials section was removed.
