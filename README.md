# NoTrophy.com

Internationale site (Engelstalig) met live tellers die laten zien hoe lang een club al zonder prijs zit. Gemaakt om door te sturen: elke club heeft een eigen link (`notrophy.com/tottenham`) met een WhatsApp-preview, en derby's hebben een vergelijkingspagina (`notrophy.com/real-madrid-vs-barcelona`).

## Wat zit erin

- **114 clubs**: alle clubs uit de Premier League, La Liga, Serie A, Bundesliga, Ligue 1 en Eredivisie van seizoen 2026/27. `npm run validate` controleert dat elke competitie compleet is.
- **Homepage** opent met de clubs met de grootste aanhang wereldwijd (lijst in `scripts/config.mjs`, `FANBASES`).
- **Teller per team** in jaren, dagen, uren, minuten en seconden, met vier modi: alle prijzen, zonder supercups, alleen landstitel, alleen Europees.
- **Vergelijken**: twee clubs naast elkaar, met een uitspraak wie het langst wacht. 20 vaste derby's (El Clásico, North London derby, De Klassieker, ...) hebben een eigen link en preview.
- **Hall of Shame**, "nog nooit iets gewonnen" en "net gewonnen" op de homepage.
- **Delen**: WhatsApp (grote knop), X, Telegram, Facebook, link kopiëren en de deelfunctie van de telefoon. De deeltekst rekent het aantal dagen uit op het moment van delen.
- **Preview-afbeeldingen** (1200×630) per team en per derby. Er staat alleen de datum van de laatste prijs op, dus ze verouderen niet.
- Alle teksten in het Engels (`src/assets/i18n.mjs`), licht en donker thema, werkt op mobiel.

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
2. `REPORT_EMAIL` op een mailadres zetten dat je echt leest (nu `hello@notrophy.com`).

## Automatisch bijwerken

Nieuwe prijzen komen er vanzelf in via [API-Football](https://www.api-football.com) (`scripts/sync.mjs`, workflow `.github/workflows/sync.yml`):

1. Twee keer per dag checkt de sync de competities die op dat moment beslist kunnen worden (bekerfinales in het voorjaar, supercups in de zomer, enz.). Op maandag checkt hij alles.
2. Is er een finale gespeeld of een titel wiskundig zeker, dan zoekt hij de winnaar op en past `data/teams.json` aan (`v: "api"`).
3. Daarna draaien de data-controle en de tests. Pas als die slagen wordt er gecommit.
4. De commit zet een nieuwe build in gang bij de hosting. De teampagina, derbypagina's en preview-afbeelding zijn dan bijgewerkt.
5. Ziet de sync iets vreemds (onbekende competitie, berekende kampioen ≠ koploper, rare datum), dan past hij niets aan en maakt hij een GitHub-issue.

Instellen (eenmalig):
1. Account aanmaken op api-football.com (gratis: 100 calls per dag, de sync gebruikt er ruim minder).
2. In GitHub: Settings → Secrets and variables → Actions → `API_FOOTBALL_KEY` toevoegen.
3. Netlify koppelen aan de standaardbranch, zodat elke commit live gaat.
4. Eén keer de workflow "Prijzen-sync" handmatig starten met "Alle competities". Die controleert de league-id's en legt de koppeling met de teams vast in `data/api-map.json`.

Lokaal: `API_FOOTBALL_KEY=... npm run sync -- --dry-run --all` laat zien wat er zou veranderen.

## Data correct houden

Zie [DATA.md](DATA.md). Kort: alle prijzen staan in `data/teams.json`, `npm run validate` vangt fouten, en `data/upcoming.json` is de reserve-agenda als de API iets mist.

## Nieuw seizoen

Na elke zomer wisselen er clubs van competitie. Pas dan `data/teams.json` aan (gedegradeerde clubs eruit, gepromoveerde erin) en draai `npm run validate`: die controleert of elke competitie het juiste aantal clubs heeft.
