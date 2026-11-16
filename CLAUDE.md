# CLAUDE.md

Guidance for AI assistants working in this repository.

## Repository Overview

- **Repository**: `jonkersven-ux/claude`
- **Project**: NoTrophy.com — international (English-only) static site with live counters showing how long football clubs have gone without a trophy. Scope: every club in the 2026/27 Premier League, La Liga, Serie A, Bundesliga, Ligue 1 and Eredivisie (114). Built for sharing (WhatsApp previews per club and per derby).

## Project Structure

```
data/teams.json          # all teams + last win per competition (source of truth)
data/competitions.json   # competition ids, category (league/cup/leaguecup/super/intl/major), NL/EN names
data/upcoming.json       # fallback agenda of finals; validate warns when a date passes
data/meta.json           # verifiedAt (last data update; written by sync)
data/api-competitions.json # competition → API-Football league id, expected name, decision months
data/api-aliases.json    # extra API team names per team id
data/api-map.json        # written by sync: verified league ids and api team id → team id
data/changelog.json      # written by sync: automatic trophy updates
scripts/sync.mjs         # API-Football sync (needs API_FOOTBALL_KEY); --all, --dry-run, --only=, --today=
scripts/sync/lib.mjs     # pure sync logic (final detection, title clinch, team matching, teams.json formatter)
scripts/config.mjs       # SITE_URL, REPORT_EMAIL, featured RIVALRIES, FANBASES (homepage); reads VERIFIED_AT from data/meta.json
scripts/validate.mjs     # data checks (exit 1 on errors), --todo lists unverified entries
scripts/build.mjs        # generates dist/: home, /{id}/, /{a}-vs-{b}/, /vs/, /regels/, sitemap
scripts/og.mjs           # Playwright: 1200x630 preview images to dist/og/
src/assets/core.mjs      # pure logic shared by browser and Node (dates, modes, ranking, share text)
src/assets/i18n.mjs      # all site copy (English only)
src/assets/app.mjs       # client rendering (vanilla JS modules, no framework)
src/assets/style.css     # design tokens + styles (light + dark)
tests/*.test.mjs         # node:test unit tests (core logic + sync with fake API)
DATA.md                  # data rules and update process (read before touching data)
```

## Development Setup

- Node >= 20, no runtime dependencies. Playwright (with Chromium) only for `scripts/og.mjs`.
- No env vars required; `SITE_URL` and `REPORT_EMAIL` can override config.

## Common Commands

```bash
npm run validate      # data validation
npm test              # unit tests
npm run build:fast    # build dist/ without OG images
npm run build         # validate + build + OG images
npm run dev           # build and serve dist/ on :8080
```

## Code Conventions

- Plain ES modules, 2-space indent, single quotes. The site is English-only; some internal comments and CLI output are Dutch.
- All user-facing text goes in `src/assets/i18n.mjs`. Match notes (`m`) in data are English.
- Logic that both build and browser need belongs in `core.mjs` and must stay DOM-free.
- Dates are `YYYY-MM-DD` strings parsed as local dates via `parseDate` (never `new Date('YYYY-MM-DD')`, which is UTC).

## Data Rules

- Only the **latest** win per competition per team. Replace, don't append.
- `v: "web"` only when checked against a reliable source; otherwise `"mem"`.
- After any data change: bump `verifiedAt` in data/meta.json, run `npm run validate` and `npm test`.
- Keep data/teams.json in the `formatTeams` layout (scripts/sync/lib.mjs); the sync rewrites it that way.
- `v`: `api` (sync), `web` (checked manually), `mem` (unverified).
- Each league must have its full 2026/27 roster (validate checks counts: 20/20/20/18/18/18).
- See DATA.md for what counts as a trophy.

## CI/CD

- GitHub Actions `ci.yml`: validate, test, build on push/PR and daily.
- GitHub Actions `sync.yml`: API-Football sync twice daily (full on Mondays); commits data changes, opens an issue on anomalies. Needs secret `API_FOOTBALL_KEY`.
- Deploy: static hosting of `dist/`; `netlify.toml` included.

## AI Assistant Guidelines

- Read existing code before proposing changes; keep solutions minimal.
- Never invent trophy dates. If unsure, mark `v: "mem"` or `approx: true` and say so.
- Run `npm run validate` and `npm test` after changes.
- Update this file when tools, conventions, or architecture change.
