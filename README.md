# Plateful Consulting — Website

A coded replacement for the WordPress site at platefulconsulting.com. Next.js 15,
TypeScript, Tailwind v4, React Three Fiber, Prisma. All 32 existing articles are
migrated at their original URLs, and the team publishes new ones through a
built-in Blog Studio.

---

## Quick start

```bash
npm install
cp .env.example .env      # then edit it — see "Environment" below
npx prisma db push        # create the database
npm run db:seed           # load categories, authors and the 32 migrated articles
npm run dev               # http://localhost:3000
```

Blog Studio: <http://localhost:3000/studio> — sign in with `STUDIO_EMAIL` /
`STUDIO_PASSWORD` from your `.env`.

---

## Environment

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | yes | Public origin, no trailing slash. Drives canonical URLs, the sitemap and OG tags. |
| `DATABASE_URL` | yes | `file:./dev.db` for SQLite; a Postgres URL if you switch provider. |
| `AUTH_SECRET` | yes | Signs the Studio session cookie. 64 hex chars. |
| `STUDIO_EMAIL` / `STUDIO_PASSWORD` | yes | Seeded Studio login. **Change the password before going live.** |
| `UPLOAD_DIR` | no | Where Studio images are written. Defaults to `./storage/uploads`. |
| `RESEND_API_KEY` | no | If set, contact-form enquiries are emailed. Without it they are still saved and visible in the Studio. |
| `ENQUIRY_TO_EMAIL` | no | Where those emails go. |

Generate a secret:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Publishing a blog post

No git, no markdown, no developer needed.

1. Go to `/studio` and sign in.
2. **New article**.
3. Write. The toolbar covers headings, lists, links, images, tables, and a
   one-click **Direct Answer** box — the format every Plateful article opens with.
4. Fill in the sidebar: category, author, tags, cover image (optional — without
   one the article gets a generated cover in its category colour), and the SEO
   title/description with live character counters.
5. **Save draft** while you work, **Publish** when it is ready.

The URL is generated from the title and can be edited before publishing. Changing
it after publishing breaks existing links, and the editor says so.

The Studio also holds:

- **Enquiries** — every contact-form submission, with a handled/reopen toggle.
- **Subscribers** — the newsletter list, exportable as CSV.

---

## Architecture

```
src/
  app/
    (site)/            Public pages — header/footer chrome
      page.tsx           Home
      services/          Services
      about-us/          About
      contact-us/        Contact + FAQ + map
      blogs/             Blog index: search, categories, pagination
      [slug]/            Article pages (root-level URLs)
      privacy-policy/, terms-and-condition/, thank-you/
    studio/            Blog Studio (auth-gated)
    api/               contact, subscribe, studio upload + CSV export
    uploads/[...path]/ Serves Studio-uploaded media at runtime
    sitemap.ts, robots.ts, not-found.tsx
  components/
    three/             WebGL: SceneCanvas, LazyScene, 3 scenes
    site/              Header, Footer, PostCard, CTABand, forms
    blog/              Reading progress, table of contents, share
    studio/            Editor, login
    ui/                Reveal, TiltCard, Counter, PostCover
  lib/
    site.ts            All marketing copy, services, stats — single source of truth
    posts.ts, db.ts, auth.ts, sanitize.ts, seo.ts, uploads.ts, rate-limit.ts
prisma/                Schema + seed
scripts/scrape-legacy.ts   The WordPress migration
```

**`src/lib/site.ts` is the file to edit** for copy changes: the phone number,
services, stats, testimonials, client logos, platforms, cities and FAQs. Pages read from it, so one edit
updates the homepage, the services page, the footer and the structured data
together.

### Brand & platform identity

- **One phone number** — `+91 81300 32195` — lives in `contact.primaryPhone` in
  `src/lib/site.ts` and is used by the header, footer, every CTA, the WhatsApp
  link and the LocalBusiness schema. Change it in one place.
- **Deepak leads.** `founders[0]` is flagged `lead: true`; the About page gives
  him the larger card with a direct call button, and every migrated article
  carries his byline (`DEFAULT_AUTHOR` in `prisma/seed.ts`).
- **Swiggy & Zomato** are first-class: their brand colours are design tokens
  (`--color-swiggy`, `--color-zomato`), `PlatformChips` badges the hero, and
  `PlatformBand` gives each platform its own panel on the home and about pages.
  Names and colours are used nominatively; no platform logos are reproduced and
  the footer carries a non-affiliation line.
- **Client logos** (`public/clients/`, 10 brands) render through `ClientWall` —
  a marquee under the hero and a full grid in the "brands we have scaled"
  section. Full colour, not faded: they are the strongest proof on the page.

### Light and dark

A sun/moon button in the header switches the whole site, and the choice is
remembered. With no choice stored it follows the visitor's operating system.

**The palette flips; it is not duplicated.** `ink` is always the ground and
`cream` is always what is printed on it, so in light mode `ink` becomes warm
paper and `cream` becomes near-black. Every Tailwind utility compiles to
`var(--color-…)`, so redefining those variables under `[data-theme=light]` in
`globals.css` re-themes the marketing pages, the article bodies and the Studio
at once — without touching a single component.

Three things deliberately do **not** flip:

- **Absolute brand tokens** (`--color-carbon`, `--color-paper`,
  `--color-brand-gold…`). Text printed on a gold or ember button has to stay
  legible in both themes, so those surfaces use these instead of the scales.
- **Generated post covers**, which are artwork — like a photograph, the cover
  stays dark on a light card.
- **Accent hues** keep their identity but darken on paper so they still pass
  contrast as text (`gold-400` becomes a deep bronze rather than a bright gold).

**No flash on load.** A tiny blocking script (`lib/theme.ts`) sets `data-theme`
on `<html>` before the first paint, so the page never renders a frame of the
wrong theme. The toggle renders both icons and lets CSS choose, so it cannot
mismatch during hydration either.

**The 3D stage is themed too** (`PALETTES` in `ChapterWorld.tsx`). Additive
blending is invisible on white, so in light mode the glows switch to normal
blending with their opacity scaled up, the chart panel becomes white, and the
line darkens to hold contrast. The readability scrim is a theme variable
(`--stage-scrim`) that lightens the scene on paper instead of darkening it.

### The 3D — chapters that crossfade as you scroll

Home, About and Services share a **single fixed WebGL canvas behind the page**
(`components/three/ScrollStage.tsx`). The scene
(`components/three/world/ChapterWorld.tsx`) is a set of **chapters** — distinct
set pieces, each tied to a run of page sections, that crossfade as the content
changes:

| Chapter | What it shows | Home | About | Services |
| --- | --- | --- | --- | --- |
| `chart` | A revenue chart drawing itself on a dashboard card; a delivery rider rides the tip, Swiggy/Zomato order tickets pop off it | Hero, stats | | |
| `engines` | Swiggy and Zomato engines streaming order tickets onto a growing stack of coins | Platforms, problem | Platforms | |
| `menu` | A carousel of service cards (image + name) that turns as you scroll | Services, process | | Hero, index |
| `bars` | Revenue bars rising, a growth arrow drawn over them | Clients, results | Principles | Process |
| `orbit` | The PFC mark with the food and service imagery orbiting it | Closing CTA | Hero | |

**To move a chapter:** set `chapter="…"` on a `<StageSection>` in the page. A
section with no chapter leaves the stage calm — deliberately the case for the
blog grid and the long service-detail block, where people are reading.

How it avoids the problems of the earlier "flying along a line" version:

- **Nothing gets cut off.** The camera never moves. Every set piece is authored
  inside a ±2.3-unit box, and `computeLayout` fits that box to the free space
  beside the copy and below the header, for the current viewport. Pieces for
  sections whose lower half is full-width content (cards, logo grids) are
  authored in the upper half of the box.
- **Nothing trails the scroll.** Lenis runs in `lerp` mode and is the *only*
  smoothing between the wheel and the scene. The previous version stacked three
  eases (Lenis duration, an eased line, a lerped camera), which is what read as
  lag. Chapter presence has a 0.1s damp purely to soften the crossfade.
- **Presence comes from screen share.** A chapter's strength is how much of the
  viewport its sections fill (`chapterVisibility` in `lib/scroll.ts`), passed
  through a 35–65% window — so at a seam the outgoing and incoming chapters sit
  at half strength each, rather than stacking.

Food is the brand's own studio-rendered assets (`public/icons3d/`). Service
cards are painted to a canvas — frame, image and title in one texture — so each
card is a single plane and sorts correctly as the carousel turns.

**Scroll driver:** Lenis (`components/scroll/SmoothScroll.tsx`), mounted once in
`SiteFrame` so every page glides. Scroll state lives in a module singleton
(`lib/scroll.ts`) read directly on each animation frame. Section positions are
**measured once and re-measured only on reflow** (resize, fonts, a
`ResizeObserver` on the body); every scroll frame is pure arithmetic, with no
layout reads.

**Main-thread budget.** The stage shares the main thread with the page, so:

- `Prewarm` compiles every chapter's shaders and uploads every texture at load,
  instead of the first time each chapter scrolls into view (a mid-scroll hitch);
- `Reveal` toggles a `data-shown` attribute directly — no React state, and no
  `will-change`, which had been promoting dozens of elements to permanent
  compositor layers;
- `Counter` writes its digits straight into the text node rather than
  re-rendering React every frame of the count-up.

Measured on Intel UHD 630 (headless Chrome, D3D11) while wheel-scrolling the
homepage: **53.8 → 57.3 fps average, frames over 50ms 9 → 4–6**.

**Guard rails**, because a full-page 3D backdrop fails in exactly two ways —
it fights the copy, or it melts a phone:

- A **readability scrim** sits between the world and the content and takes about
  half the contrast out of it. Cards are translucent rather than opaque, so the
  world glows through without ever competing with a headline.
- `prefers-reduced-motion` renders **one frame and freezes** — the composition
  is there, nothing moves, and Lenis hands back to native scrolling.
- Touch devices keep **native momentum scrolling**; hijacking it on a phone
  always feels worse than the OS default.
- A **device tier** (memory, cores, screen size) scales particle counts and
  pixel ratio; rendering stops entirely when the tab is hidden.
- No WebGL means **no canvas at all** — the CSS gradient ground stays and the
  page is unchanged otherwise.

Blog and article pages deliberately **do not** carry the stage. They are the SEO
engine and long-form reading surface; a moving backdrop behind 2,000 words of
body copy costs more than it earns. Contact and Blogs keep small self-contained
accent scenes (`ReachNetwork`, `SignalOrb`).

three.js stays out of every page's first-load JavaScript — it is dynamically
imported and arrives only once the stage mounts. First-load JS is ~127 kB on the
homepage.

---

## SEO notes

This was the main risk in moving off WordPress, so:

- **All 32 articles keep their exact original URLs.** They live at the site root
  (`/how-to-increase-swiggy-orders`), not under `/blog/`.
- `next.config.ts` holds 301s for the legacy artefacts (`/1169-2` → a real slug,
  `/elementor-1422`, `/maintenance-page`) plus common aliases.
- `dynamicParams = true` on `app/(site)/[slug]`. The 32 migrated slugs are
  prerendered; anything published later in the Studio is rendered on demand, so
  a new article is live the moment it is published rather than at the next
  deploy. Unmatched paths fall through to `notFound()`.
- Structured data: `ProfessionalService`, `WebSite`, `Article`, `BreadcrumbList`
  and `FAQPage`, emitted from `src/lib/seo.ts`.
- `sitemap.xml` and `robots.txt` are generated; the Studio and API are excluded.

**Two articles shared one title** on the old site (`/how-to-increase-swiggy-orders`
and `/how-to-increase-swiggy-orders-in-30-days`), which had them competing for the
same query. Both URLs are kept; the second was retitled. See `TITLE_OVERRIDES` in
`prisma/seed.ts` to change or revert that.

---

## Deployment

> **Going live: follow [DEPLOY.md](DEPLOY.md).** It is the exact copy-paste
> runbook for the production server — VPS setup, the DNS cutover (including the
> IPv6 record that is easy to miss, and how to avoid breaking email), rollback,
> backups and day-to-day operation. The notes below are background.

Production runs as two containers: the Next.js app, and Caddy in front of it
handling HTTPS automatically. Everything that matters lives in two bind-mounted
folders on the host, `./data` (database) and `./uploads` (Studio images) — back
those up and the rest can be rebuilt from source.

| File | Purpose |
| --- | --- |
| `Dockerfile` | Builds the app; seeds a database inside the image so all 32 articles pre-render at build time |
| `scripts/docker-entrypoint.sh` | On boot: installs the seeded database if the volume is empty, applies the schema, applies the Studio password from `.env` |
| `docker-compose.yml` | The two services and their volumes |
| `Caddyfile` | HTTPS, www to non-www redirect, security headers |
| `prisma/ensure-admin.ts` | Sets the Studio login from `STUDIO_EMAIL` / `STUDIO_PASSWORD` |


### VPS / Docker (recommended — everything works as built)

```bash
npm ci
npx prisma db push
npm run db:seed        # first deploy only
npm run build
npm start              # put nginx or Caddy in front
```

Persist two paths across deploys: the SQLite file (`prisma/dev.db`) and
`storage/uploads`. In Docker, mount both as volumes and set `UPLOAD_DIR`.

### Vercel / Netlify

Two things need changing, because serverless filesystems are read-only and
ephemeral:

1. **Database** — switch `provider` in `prisma/schema.prisma` to `postgresql`,
   point `DATABASE_URL` at Neon or Supabase, run `npx prisma db push`.
2. **Uploads** — replace the write in `src/app/api/studio/upload/route.ts` with an
   S3/R2/Vercel Blob upload that returns a public URL. Nothing else changes; the
   rest of the app only consumes the returned `url`.

---

## Re-running the migration

`npm run scrape` re-pulls all 32 articles from the live WordPress site into
`content/legacy-posts.json`; `npm run db:seed` loads them.

The seed is idempotent and **will not overwrite an article that has been saved in
the Studio** — those carry an `editedInStudio` flag. Set `PRESERVE_EDITS` to
`false` in `prisma/seed.ts` to force a full re-import.

---

## Before going live — please review

These need a decision from you, not from me:

1. **Studio password.** `.env` currently has a placeholder. Change it.
2. **Legal pages.** The old Terms said the agreement was *governed by the laws of
   the Netherlands* — a leftover from a template. It now says India, New Delhi
   jurisdiction. Both policies are standard boilerplate and should be read by
   someone qualified before launch.
3. **Marketing copy.** Service descriptions, deliverables and the "how we operate"
   principles were written to be substantive rather than one-line summaries. They
   are plausible descriptions of the work, but they are my words — read them and
   correct anything that misstates what you actually do.
4. **Testimonials** are reproduced from the current site, including the "10 lakhs
   to 50 lakhs in two months" figure. A results disclaimer sits under them.
5. **The logo** now uses your gold PFC monogram (`public/brand/PFC-LOGO.webp`,
   transparent background) paired with a typographic "Plateful Consulting"
   wordmark. If you have the mark as vector/SVG, drop it in and update
   `src/components/site/Logo.tsx` for perfect crispness at every size.
6. **Analytics** are not installed. Add GA4 / GTM / Meta Pixel in
   `src/app/layout.tsx` when you have the IDs.

---

## Commands

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm start` | Serve the build |
| `npm run typecheck` | TypeScript, no emit |
| `npm run lint` | ESLint |
| `npm run db:push` | Apply the schema |
| `npm run db:seed` | Seed / refresh content |
| `npm run db:studio` | Prisma's database browser |
| `npm run scrape` | Re-pull the legacy articles |
