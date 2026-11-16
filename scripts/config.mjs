// Central settings. Set SITE_URL and REPORT_EMAIL before going live.
export const SITE_URL = process.env.SITE_URL || 'https://notrophy.com';
export const REPORT_EMAIL = process.env.REPORT_EMAIL || 'hello@notrophy.com';
// Date of the last data update. Lives in data/meta.json so the automatic sync can update it.
import { readFileSync } from 'node:fs';
export const VERIFIED_AT = JSON.parse(readFileSync(new URL('../data/meta.json', import.meta.url), 'utf8')).verifiedAt;

// Featured derbies: each gets its own shareable page /{a}-vs-{b}/ with a preview image.
export const RIVALRIES = [
  { a: 'real-madrid', b: 'barcelona', name: 'El Clásico' },
  { a: 'man-utd', b: 'liverpool', name: 'North West derby' },
  { a: 'arsenal', b: 'tottenham', name: 'North London derby' },
  { a: 'man-utd', b: 'man-city', name: 'Manchester derby' },
  { a: 'inter', b: 'milan', name: 'Derby della Madonnina' },
  { a: 'bayern', b: 'dortmund', name: 'Der Klassiker' },
  { a: 'psg', b: 'marseille', name: 'Le Classique' },
  { a: 'ajax', b: 'feyenoord', name: 'De Klassieker' },
  { a: 'inter', b: 'juventus', name: "Derby d'Italia" },
  { a: 'real-madrid', b: 'atletico', name: 'Madrid derby' },
  { a: 'liverpool', b: 'everton', name: 'Merseyside derby' },
  { a: 'chelsea', b: 'arsenal', name: 'London derby' },
  { a: 'roma', b: 'lazio', name: 'Derby della Capitale' },
  { a: 'dortmund', b: 'schalke', name: 'Revierderby' },
  { a: 'sevilla', b: 'betis', name: 'El Gran Derbi' },
  { a: 'newcastle', b: 'sunderland', name: 'Tyne-Wear derby' },
  { a: 'juventus', b: 'torino', name: 'Derby della Mole' },
  { a: 'athletic', b: 'real-sociedad', name: 'Basque derby' },
  { a: 'lille', b: 'lens', name: 'Derby du Nord' },
  { a: 'psv', b: 'ajax', name: 'De Topper' },
];

// Clubs with the biggest fanbases worldwide, shown first on the homepage (curated, biggest first).
export const FANBASES = [
  'real-madrid', 'barcelona', 'man-utd', 'liverpool', 'bayern', 'psg', 'juventus', 'chelsea',
  'arsenal', 'man-city', 'milan', 'inter', 'dortmund', 'atletico', 'tottenham', 'ajax',
];
