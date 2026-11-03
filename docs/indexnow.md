# IndexNow notifications

`.github/workflows/indexnow.yml` runs after a successful Vercel `Production`
deployment. Failed builds, preview deployments, and superseded main commits are
skipped. A deployment event dispatches a main-branch run because GitHub cache
is unavailable on deployment-status events. That small handoff job has Actions
write permission; the submission job has only contents-read permission. It reads the public key and sitemap on `https://beadsworldafrica.co.ke`;
no Supabase or IndexNow secrets need to be configured in GitHub.

The first run submits all URLs in the live sitemap except `/shop`, which is
intentionally noindex. Later runs compare Git changes and the previous live URL
list, stored in GitHub Actions cache:

- New or removed sitemap URLs are submitted, including deleted pages.
- Changes to a released Journal article or its images submit that article, the
  Journal index, and the homepage. Future articles stay out until they appear in
  the production sitemap.
- Shared storefront code, styling, configuration, or assets can affect every
  public page, so those changes submit the full live sitemap.
- Documentation and workflow-only changes do not resubmit existing URLs.

The script deliberately ignores sitemap `lastmod` timestamps: this site's sitemap
sets many of them to its generation time, which does not prove a page changed.
GitHub may evict the cache; the next run then submits the full sitemap again.
HTTP 200 means submitted; HTTP 202 means received with key validation pending.
Neither guarantees that a search engine indexes the pages. A failed submission
fails the workflow and preserves the previous baseline for retry. Transient
network errors, rate limits and server errors receive bounded retries.

## Manual runs and edits outside Git

In GitHub → Actions → **Notify IndexNow** → **Run workflow**, select `main`.
This can notify engines about newly added/removed product URLs or released
scheduled articles after the live sitemap has refreshed (up to an hour).
It does **not** detect changed prices or descriptions on existing product URLs
when they were edited directly in Supabase. That requires an admin publish hook
or another explicit submission mechanism. There is no periodic polling job.

The Vercel project's Git integration must keep `deployment_status` events enabled.
Production is matched by environment name: this repository's Vercel deployments
use `Production` while reporting `production_environment: false`.

## Local checks

```sh
python3 -m unittest discover -s scripts -p 'test_indexnow.py'
python3 scripts/indexnow.py --dry-run
```

Dry run verifies the live key and sitemap and prints the URLs without submitting
or advancing the baseline. Running without `--dry-run` sends notifications.
