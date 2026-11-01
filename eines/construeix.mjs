// ============================================================
//  construeix.mjs — genera els fitxers per enganxar a Apps Script i la pàgina del Pla B2.
//  Ús:  node eines/construeix.mjs
//  Font de veritat: src/  (no editis mai a mà els fitxers generats d'apps-script/*/ *.html ni pla-b/)
// ============================================================
import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..');
const llegeix = p => readFileSync(join(ARREL, p), 'utf8');
const escriu = (p, t) => { mkdirSync(dirname(join(ARREL, p)), { recursive: true }); writeFileSync(join(ARREL, p), t); };

const b64 = p => readFileSync(join(ARREL, p)).toString('base64');
const FONTS = `@font-face { font-family: "Andika"; font-style: normal; font-weight: 400; font-display: swap;
  src: url(data:font/woff2;base64,${b64('src/fonts/AndikaR.woff2')}) format("woff2"); }
@font-face { font-family: "Andika"; font-style: normal; font-weight: 700; font-display: swap;
  src: url(data:font/woff2;base64,${b64('src/fonts/AndikaB.woff2')}) format("woff2"); }`;
const IL = llegeix('src/comu/illustracions.js');

function munta(src, subs) {
  let t = llegeix(src);
  for (const [k, v] of Object.entries(subs)) {
    const marca = `/*@@${k}@@*/`;
    if (!t.includes(marca)) throw new Error(`Falta la marca ${marca} a ${src}`);
    t = t.split(marca).join(v);
  }
  return t;
}

const sortides = {
  'apps-script/mon/Mon.html': munta('src/mon/Mon.src.html', { FONTS, IL, INICIAL: '<?!= inicial ?>', TRANSPORT: 'gas' }),
  'pla-b/index.html': munta('src/mon/Mon.src.html', { FONTS, IL, INICIAL: '{"pla":"B"}', TRANSPORT: 'fetch' }),
  'apps-script/admin/Admin.html': munta('src/admin/Admin.src.html', { FONTS, IL: '', URL_ADMIN: '<?!= urlAdmin ?>' }),
  'apps-script/admin/Projeccio.html': munta('src/admin/Projeccio.src.html', { FONTS, IL })
};

// ---------- Comprovacions (si una falla, no es genera res) ----------
const errors = [];
for (const [nom, t] of Object.entries(sortides)) {
  const scriptlets = (t.match(/<\?/g) || []).length;
  const esperats = nom.endsWith('Mon.html') ? 1 : nom.endsWith('Admin.html') ? 1 : 0;
  if (scriptlets !== esperats) errors.push(`${nom}: hi ha ${scriptlets} «<?» i n'hi ha d'haver ${esperats} (Apps Script els interpreta).`);
  if (/font-weight\s*:\s*(800|900|bolder|black)/i.test(t) || /font-weight="(800|900)"/.test(t)) errors.push(`${nom}: pes tipogràfic > 700.`);
  if (/<pattern|url\(#/.test(t)) errors.push(`${nom}: <pattern> o url(#id) a l'SVG.`);
  if (/\bImpact\b/.test(t)) errors.push(`${nom}: Impact a la pila de lletres.`);
  if (nom.includes('Mon') || nom.startsWith('pla-b')) {
    if (/window\.(top|parent)/.test(t)) errors.push(`${nom}: window.top / window.parent a l'app dels alumnes.`);
  }
}
if (errors.length) { console.error('ERRORS:\n - ' + errors.join('\n - ')); process.exit(1); }

for (const [nom, t] of Object.entries(sortides)) escriu(nom, t);
copyFileSync(join(ARREL, 'apps-script/comu/Comu.gs'), join(ARREL, 'apps-script/mon/Comu.gs'));
copyFileSync(join(ARREL, 'apps-script/comu/Comu.gs'), join(ARREL, 'apps-script/admin/Comu.gs'));

const manifest = (webapp) => JSON.stringify({
  timeZone: 'Europe/Madrid', exceptionLogging: 'STACKDRIVER', runtimeVersion: 'V8',
  oauthScopes: [
    'https://www.googleapis.com/auth/spreadsheets',
    'https://www.googleapis.com/auth/script.container.ui',
    'https://www.googleapis.com/auth/userinfo.email'
  ],
  webapp
}, null, 2) + '\n';
escriu('apps-script/mon/appsscript.json', manifest({ executeAs: 'USER_DEPLOYING', access: 'DOMAIN' }));
escriu('apps-script/admin/appsscript.json', manifest({ executeAs: 'USER_DEPLOYING', access: 'MYSELF' }));

for (const [nom, t] of Object.entries(sortides)) console.log(`✓ ${nom}  (${Math.round(t.length / 1024)} KB)`);
console.log('✓ Comu.gs copiat a mon/ i admin/');
