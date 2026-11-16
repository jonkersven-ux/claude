# Data: hoe NoTrophy klopt en blijft kloppen

De site staat of valt met correcte datums. Eén fout bij een grote club en het hele platform verliest geloofwaardigheid. Daarom werkt de data zo.

## Wat telt als prijs

| Telt | Telt niet |
|---|---|
| Landstitel hoogste divisie | Titels in lagere divisies |
| Nationale beker, ligabeker | Intertoto, Eredivisie Cup |
| Nationale supercup, UEFA Super Cup* | Jeugd, vrouwen (apart, later) |
| Champions League / Europacup I, Europa League / UEFA Cup, Conference League, Europacup II, Jaarbeursstedenbeker | Oefen- en zomertoernooien |
| WK voor clubs, Intercontinental Cup* | |
| Landen: WK, EK, Copa América; Nations League*, Confed Cup*, Finalissima*, Olympisch goud* | |

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
- `v`: bronstatus. `web` = deze sessie gecontroleerd tegen nieuwsbronnen; `mem` = nog tegen een tweede bron checken
- `approx: true`: alleen het seizoen bekend, de site toont dan alleen het jaartal

Teams die nooit iets wonnen hebben `"wins": []` en tellen vanaf `founded`.

## Stand bij oplevering (16 november 2026)

- Alle prijzen van seizoen 2025/26 en de supercups van augustus 2026 zijn via het web gecontroleerd (`v: "web"`).
- De meest gedeelde tellers zijn extra gecontroleerd: Ajax (11 mei 2022), Real Madrid (laatste prijs 18 dec 2024, 2025/26 prijsloos), Rangers (17 dec 2023), PSV, Crystal Palace, Stuttgart, Marseille (supercup jan 2026 verloren).
- Oudere prijzen komen grotendeels uit parate kennis en staan op `mem`. `node scripts/validate.mjs --todo` geeft de lijst. Werk die af voor livegang, te beginnen bij de **hoofdteller** (de laatste prijs in "Alle prijzen") van de grote clubs.
- 27 oude titels hebben alleen een seizoen (`approx`).

## Werkwijze bij een nieuwe prijs

1. Pas in `data/teams.json` de regel van die competitie aan (oude winst vervangen, niet toevoegen).
2. Zet `v: "web"` alleen als je het in minstens één betrouwbare bron hebt gecheckt (bond, club, NOS, BBC, Reuters).
3. Zet `VERIFIED_AT` in `scripts/config.mjs` op vandaag.
4. Verwijder het item uit `data/upcoming.json` en zet de volgende finale erin.
5. `npm run build` en deployen. De preview-afbeelding van dat team wordt opnieuw gemaakt.

`data/upcoming.json` is de agenda: zodra een `check`-datum voorbij is, meldt `npm run validate` dat er iets verwerkt moet worden. De GitHub Action draait die check elke ochtend.

## Fouten van bezoekers

Onder elke pagina staat "Klopt er iets niet? Meld het" met `REPORT_EMAIL`. Fans van de club die belachelijk gemaakt wordt zijn de snelste foutzoekers die er zijn. Reageer snel en noem ze desnoods in een post ("dank aan de Spurs-fan die ons verbeterde"); dat werkt zelf ook weer als content.
