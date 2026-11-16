// Centrale instellingen. Pas SITE_URL en REPORT_EMAIL aan vóór livegang.
export const SITE_URL = process.env.SITE_URL || 'https://notrophy.com';
export const REPORT_EMAIL = process.env.REPORT_EMAIL || 'fouten@notrophy.com';
// Datum van de laatste data-update. Staat in data/meta.json zodat de automatische sync hem kan bijwerken.
import { readFileSync } from 'node:fs';
export const VERIFIED_AT = JSON.parse(readFileSync(new URL('../data/meta.json', import.meta.url), 'utf8')).verifiedAt;

// Uitgelichte rivaliteiten: krijgen een eigen deelbare pagina /{a}-vs-{b}/ met preview-afbeelding.
export const RIVALRIES = [
  { a: 'ajax', b: 'feyenoord', nl: 'De Klassieker', en: 'De Klassieker' },
  { a: 'psv', b: 'ajax', nl: 'De Topper', en: 'De Topper' },
  { a: 'twente', b: 'heracles', nl: 'Twentse derby', en: 'Twente derby' },
  { a: 'feyenoord', b: 'sparta', nl: 'Rotterdamse derby', en: 'Rotterdam derby' },
  { a: 'groningen', b: 'heerenveen', nl: 'Derby van het Noorden', en: 'Derby of the North' },
  { a: 'nac', b: 'willem-ii', nl: 'Brabantse derby', en: 'Brabant derby' },
  { a: 'arsenal', b: 'tottenham', nl: 'North London derby', en: 'North London derby' },
  { a: 'man-utd', b: 'man-city', nl: 'Manchester derby', en: 'Manchester derby' },
  { a: 'liverpool', b: 'everton', nl: 'Merseyside derby', en: 'Merseyside derby' },
  { a: 'newcastle', b: 'sunderland', nl: 'Tyne-Wear derby', en: 'Tyne-Wear derby' },
  { a: 'celtic', b: 'rangers', nl: 'Old Firm', en: 'Old Firm' },
  { a: 'barcelona', b: 'real-madrid', nl: 'El Clásico', en: 'El Clásico' },
  { a: 'sevilla', b: 'betis', nl: 'El Gran Derbi', en: 'El Gran Derbi' },
  { a: 'inter', b: 'milan', nl: 'Derby della Madonnina', en: 'Derby della Madonnina' },
  { a: 'roma', b: 'lazio', nl: 'Derby della Capitale', en: 'Derby della Capitale' },
  { a: 'dortmund', b: 'schalke', nl: 'Revierderby', en: 'Revierderby' },
  { a: 'psg', b: 'marseille', nl: 'Le Classique', en: 'Le Classique' },
  { a: 'nederland', b: 'duitsland', nl: 'Oranje vs Die Mannschaft', en: 'Oranje vs Die Mannschaft' },
  { a: 'nederland', b: 'belgie', nl: 'Lage Landen-derby', en: 'Low Countries derby' },
  { a: 'engeland', b: 'schotland', nl: 'The Auld Enemy', en: 'The Auld Enemy' },
];
