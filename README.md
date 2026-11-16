# NoTrophy.com

Live tellers die laten zien hoe lang een club of land al zonder prijs zit. Gemaakt om door te sturen: elke club heeft een eigen link (`notrophy.com/ajax`) met een WhatsApp-preview, en derby's hebben een vergelijkingspagina (`notrophy.com/ajax-vs-feyenoord`).

## Wat zit erin

- **96 teams**: Eredivisie en bekende NL-clubs, Premier League-top, top van Spanje, Italië, Duitsland, Frankrijk, Schotland en 12 landenteams.
- **Teller per team** in jaren, dagen, uren, minuten en seconden, met vier modi: alle prijzen, zonder supercups, alleen landstitel, alleen Europees.
- **Vergelijken**: twee teams naast elkaar, met een uitspraak wie het langst wacht. 20 vaste derby's hebben een eigen link en preview.
- **Hall of Shame**, "nog nooit iets gewonnen" en "net gewonnen" op de homepage.
- **Delen**: WhatsApp (grote knop), X, Telegram, Facebook, link kopiëren en de deelfunctie van de telefoon. De deeltekst rekent het aantal dagen uit op het moment van delen.
- **Preview-afbeeldingen** (1200×630) per team en per derby. Er staat alleen de datum van de laatste prijs op, dus ze verouderen niet.
- NL en EN, licht en donker thema, werkt op mobiel.

## Commando's

```bash
npm run validate          # data controleren (faalt bij fouten)
node scripts/validate.mjs --todo   # lijst van prijzen die nog een tweede bron nodig hebben
npm test                  # rekenlogica testen
npm run build:fast        # site bouwen naar dist/ (zonder preview-afbeeldingen)
npm run build             # validate + build + preview-afbeeldingen (Playwright nodig)
npm run dev               # bouwen en serveren op http://localhost:8080
PREVIEW=1 npm run build:fast   # links naar .../index.html, om dist/ zonder server te openen
```

Preview-afbeeldingen maken vereist Playwright met Chromium (`npm i -D playwright && npx playwright install chromium`).

## Live zetten

Het is een statische site. Netlify werkt direct met `netlify.toml`; Cloudflare Pages of Vercel kan ook (build: `npm run build`, output: `dist`).

Voor livegang in `scripts/config.mjs`:
1. `SITE_URL` op het echte domein zetten (de deellinks en previews gebruiken dit).
2. `REPORT_EMAIL` op een mailadres zetten dat je echt leest.

## Data correct houden

Zie [DATA.md](DATA.md). Kort: alle prijzen staan in `data/teams.json`, `npm run validate` vangt fouten, en `data/upcoming.json` zegt wanneer er een finale gespeeld is die verwerkt moet worden. De CI draait dat dagelijks.
