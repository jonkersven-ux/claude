# Data: hoe NoTrophy klopt en blijft kloppen

De site staat of valt met correcte datums. Eén fout bij een grote club en het hele platform verliest geloofwaardigheid. Daarom werkt de data zo.

## Wat telt als prijs

| Telt | Telt niet |
|---|---|
| Landstitel hoogste divisie | Titels in lagere divisies |
| Nationale beker, ligabeker (ook de Oost-Duitse FDGB-Pokal voor Union Berlin) | Intertoto, Eredivisie Cup |
| Nationale supercup, UEFA Super Cup* | Jeugd, vrouwen (apart, later) |
| Champions League / Europacup I, Europa League / UEFA Cup, Conference League, Europacup II, Jaarbeursstedenbeker | Oefen- en zomertoernooien |
| WK voor clubs, Intercontinental Cup* | |

\* "bijprijs": in de modus **Zonder supercups** tellen deze niet mee. Regel: een prijs die je in één wedstrijd wint, is een bijprijs.

**Datum** = dag van de finale, of de dag waarop de titel wiskundig zeker was (ook als de club die dag niet speelde, zoals Arsenal op 19 mei 2026). Bij tweeluiken telt het tweede duel.

## Waar de data staat

`data/teams.json`, per team alleen de **laatste** winst per competitie:

```json
{ "c": "nl-cup", "d": "2026-04-19", "s": "2025/26", "m": "AZ 5-1 NEC", "v": "web" }
```

- `c`: competitie (zie `data/competitions.json`)
- `d`: datum `YYYY-MM-DD`
- `s`: seizoen (optioneel)
- `m`: wedstrijd of omschrijving, staat op de site
- `v`: bronstatus. `api` = automatisch uit API-Football; `web` = handmatig gecontroleerd tegen nieuwsbronnen; `mem` = nog tegen een tweede bron checken
- `approx: true`: alleen het seizoen bekend, de site toont dan alleen het jaartal

Teams die nooit iets wonnen hebben `"wins": []` en tellen vanaf `founded`.

## Dekking

Alle clubs van de Premier League, La Liga, Serie A, Bundesliga, Ligue 1 en Eredivisie in 2026/27 (114). Promoties en degradaties van zomer 2026 zijn via het web gecontroleerd. Afspraak bij fusieclubs: Fortuna Sittard krijgt de beker van Fortuna '54 (1964), en telt vanaf 1954.

## Stand bij oplevering (16 november 2026)

- Alle prijzen van seizoen 2025/26 en de supercups van augustus 2026 zijn via het web gecontroleerd (`v: "web"`).
- De meest gedeelde tellers zijn extra gecontroleerd: Ajax (11 mei 2022), Real Madrid (laatste prijs 18 dec 2024, 2025/26 prijsloos), Rangers (17 dec 2023), PSV, Crystal Palace, Stuttgart, Marseille (supercup jan 2026 verloren).
- Oudere prijzen, en de prijzen van de 18 nieuw toegevoegde clubs, komen grotendeels uit parate kennis en staan op `mem`. `node scripts/validate.mjs --todo` geeft de lijst. Werk die af voor livegang, te beginnen bij de **hoofdteller** (de laatste prijs in "Alle prijzen") van de grote clubs.
- 36 oude titels hebben alleen een seizoen (`approx`). De site toont daar alleen het jaartal en een teller in hele jaren.
- Clubs die nooit iets wonnen tellen vanaf het oprichtingsjaar; met alleen een jaartal toont de site ook alleen hele jaren.

## Automatische sync

Nieuwe prijzen komen binnen via `scripts/sync.mjs` (zie README). Veiligheidsregels in de code:
- League-id's worden eerst gecontroleerd op naam en land (`data/api-competitions.json`, veld `expect`).
- Een landstitel telt pas als niemand de koploper nog kan inhalen (strikt meer punten dan het maximum van de rest). Gelijk op punten wordt pas aan het eind van het seizoen beslist, met de officiële stand.
- Puntenaftrek wordt verrekend via de officiële stand. Wijkt de berekende kampioen af van de koploper, dan gebeurt er niets en komt er een issue.
- Een prijs wordt alleen vervangen door een nieuwere, nooit door een datum in de toekomst of ouder dan ~13 maanden.
- Winnaars die niet op NoTrophy staan worden genoteerd, niet toegevoegd.
- Elke wijziging komt in `data/changelog.json`.

Een team toevoegen dat de API anders noemt: zet de API-naam in `data/api-aliases.json`.

## Handmatig: werkwijze bij een nieuwe prijs

1. Pas in `data/teams.json` de regel van die competitie aan (oude winst vervangen, niet toevoegen).
2. Zet `v: "web"` alleen als je het in minstens één betrouwbare bron hebt gecheckt (bond, club, NOS, BBC, Reuters).
3. Zet `verifiedAt` in `data/meta.json` op vandaag.
4. Verwijder het item uit `data/upcoming.json` en zet de volgende finale erin.
5. `npm run build` en deployen. De preview-afbeelding van dat team wordt opnieuw gemaakt.

`data/upcoming.json` is de agenda: zodra een `check`-datum voorbij is, meldt `npm run validate` dat er iets verwerkt moet worden. De GitHub Action draait die check elke ochtend.

## Fouten van bezoekers

Onder elke pagina staat "Klopt er iets niet? Meld het" met `REPORT_EMAIL`. Fans van de club die belachelijk gemaakt wordt zijn de snelste foutzoekers die er zijn. Reageer snel en noem ze desnoods in een post ("dank aan de Spurs-fan die ons verbeterde"); dat werkt zelf ook weer als content.
