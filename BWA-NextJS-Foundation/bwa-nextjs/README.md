# Beads World Africa — Next.js Foundation

This is the first real Next.js foundation for BWA. It converts the approved HTML direction into a reusable application architecture.

## Run

```bash
npm install
npm run dev
```

Open http://localhost:3000

## Routes

- `/` — Homepage
- `/shop` — Shop / collections
- `/product/[slug]` — Dynamic product page
- `/find-your-bracelet` — Identity-led bracelet discovery
- `/cart` — Cart foundation
- `/checkout` — Checkout foundation

## Architecture

- `app/` — routes and global layout
- `components/` — reusable visual/interaction components
- `data/` — initial BWA product, collection and quiz data
- `lib/` — recommendation/business logic
- `types/` — reserved for shared domain types as the commerce layer grows
- `public/` — production image/icon home

The current product imagery is intentionally represented by neutral visual placeholders. Replace these with the approved BWA photography without changing the page architecture.

Payment, persistent cart, inventory, customer accounts, real delivery pricing, CMS/database and production commerce integration are intentionally left as the next development layer.
