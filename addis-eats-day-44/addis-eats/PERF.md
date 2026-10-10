# Performance Changes

Browser Lighthouse measurements were intentionally skipped, as requested. No
before/after LCP, CLS, or INP values are available; recording values without
those runs would be misleading.

| Metric | Before | After |
| --- | --- | --- |
| LCP | Not measured | Not measured |
| CLS | Not measured | Not measured |
| INP | Not measured | Not measured |

## Changes and expected effect

- The home hero now uses `next/image` for the local 1024 × 732 Doro Wot image,
  provides responsive `sizes`, and is the sole prioritized image. Other menu
  images retain lazy loading and declare their actual source dimensions and
  responsive display sizes. These changes let Next.js serve appropriate
  optimized image variants and reserve the intended layout space.
- The root layout uses `next/font/local` with the self-hosted Geist font. It
  removes reliance on a runtime font request to a third-party provider and
  uses `display: swap`. The font's bundled MPL-2.0 license is included beside
  the font source.
- No third-party scripts or remote images are currently used. Therefore there
  is no script to move to `next/script`, and `next.config.mjs` does not need
  remote image host entries.

To capture the omitted measurements, run a production build and start, then
use Lighthouse with the same throttling and device settings before and after.
