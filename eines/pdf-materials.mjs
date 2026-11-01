// Genera el PDF i captures de comprovació d'un material imprimible.
// Ús: node eines/pdf-materials.mjs materials/S1-primer-cami-RECURS
import { createRequire } from 'node:module';
import { join, resolve } from 'node:path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = resolve(process.argv[2]);
const nav = await chromium.launch();
const pg = await nav.newPage({ viewport: { width: 900, height: 1200 } });
await pg.goto('file://' + join(dir, 'index.html'));
await pg.evaluate(() => document.fonts.ready);
const pdf = join(dir, 'imprimir.pdf');
await pg.pdf({ path: pdf, format: 'A4', printBackground: true, preferCSSPageSize: true });
await pg.emulateMedia({ media: 'print' });
const fulls = await pg.$$('.full');
for (let i = 0; i < fulls.length; i++) await fulls[i].screenshot({ path: `/tmp/mat-${i + 1}.png` });
console.log(`✓ ${pdf} · ${fulls.length} fulls · captures a /tmp/mat-N.png`);
await nav.close();
