# CLAUDE.md

Guidance for AI assistants working in this repository.

## Repository Overview

- **Repository**: `jonkersven-ux/claude`
- **Project**: NoTrophy.com — static site with live counters showing how long football clubs and national teams have gone without a trophy. Built for sharing (WhatsApp previews per club and per derby).

## Project Structure

```
data/teams.json          # all teams + last win per competition (source of truth)
data/competitions.json   # competition ids, category (league/cup/leaguecup/super/intl/major), NL/EN names
data/upcoming.json       # agenda of finals that must be processed; validate warns when a date passes
scripts/config.mjs       # SITE_URL, REPORT_EMAIL, VERIFIED_AT, featured RIVALRIES
scripts/validate.mjs     # data checks (exit 1 on errors), --todo lists unverified entries
scripts/build.mjs        # generates dist/: home, /{id}/, /{a}-vs-{b}/, /vs/, /regels/, sitemap
scripts/og.mjs           # Playwright: 1200x630 preview images to dist/og/
src/assets/core.mjs      # pure logic shared by browser and Node (dates, modes, ranking, share text)
src/assets/i18n.mjs      # all NL/EN copy
src/assets/app.mjs       # client rendering (vanilla JS modules, no framework)
src/assets/style.css     # design tokens + styles (light + dark)
tests/core.test.mjs      # node:test unit tests
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

- Plain ES modules, 2-space indent, single quotes. Comments and UI copy in Dutch; identifiers in English.
- All user-facing text goes in `src/assets/i18n.mjs` (both `nl` and `en`).
- Logic that both build and browser need belongs in `core.mjs` and must stay DOM-free.
- Dates are `YYYY-MM-DD` strings parsed as local dates via `parseDate` (never `new Date('YYYY-MM-DD')`, which is UTC).

## Data Rules

- Only the **latest** win per competition per team. Replace, don't append.
- `v: "web"` only when checked against a reliable source; otherwise `"mem"`.
- After any data change: bump `VERIFIED_AT`, run `npm run validate` and `npm test`.
- See DATA.md for what counts as a trophy.

## CI/CD

- GitHub Actions (`.github/workflows/ci.yml`): validate, test, build on push/PR and daily (the daily run surfaces finals due in `data/upcoming.json`).
- Deploy: static hosting of `dist/`; `netlify.toml` included.

## AI Assistant Guidelines

- Read existing code before proposing changes; keep solutions minimal.
- Never invent trophy dates. If unsure, mark `v: "mem"` or `approx: true` and say so.
- Run `npm run validate` and `npm test` after changes.
- Update this file when tools, conventions, or architecture change.
