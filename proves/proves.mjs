// ============================================================
//  proves.mjs — QA de punta a punta amb Chromium (Playwright).
//  Simula una sessió sencera: 18 alumnes, el mestre, la projecció i el Pla B2.
//  Ús: node proves/proves.mjs      (desa captures a proves/captures/)
// ============================================================
import { createRequire } from 'node:module';
import { mkdirSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { engega, MESTRE } from './simulador.mjs';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAPTURES = join(ARREL, 'proves', 'captures');
rmSync(CAPTURES, { recursive: true, force: true });
mkdirSync(CAPTURES, { recursive: true });

let fallades = 0, correctes = 0;
const ok = (cond, text) => { if (cond) { correctes++; console.log('  ✓ ' + text); } else { fallades++; console.log('  ✗ ' + text); } };
const NOMS = ['Anna R.', 'Biel C.', 'Carla P.', 'Dani S.', 'Èlia V.', 'Ferran M.', 'Gal·la T.', 'Hug B.', 'Ivet L.', 'Jan F.',
  'Laia G.', 'Marc N.', 'Nora D.', 'Oriol E.', 'Paula H.', 'Quim J.', 'Rita K.', 'Sergi O.'];
const correu = i => `alumne${String(i + 1).padStart(2, '0')}@escola.cat`;

const { srv, mon, port } = await engega(8787);
const BASE = `http://localhost:${port}`;
const admin = (fn, ...args) => mon.crida('admin', 'api', [fn, args[0] || {}], MESTRE);
const alumne = (i, fn, args) => mon.crida('mon', 'api', [fn, args || {}, null], correu(i));

// ---------- Preparació del full ----------
console.log('\n1 · Instal·lació del full');
mon.crida('admin', 'installa', [], MESTRE);
mon.crida('admin', 'installa', [], MESTRE);   // dues vegades: ha de ser idempotent
const p = mon.full.getSheetByName('ALUMNES');
const fila0 = p.getLastRow() + 1;
p.getRange(fila0, 1, NOMS.length, 8).setValues(NOMS.map((n, i) => ['', correu(i), 'G2', n, n + ' (nom complet)', '', '', '']));
mon.crida('admin', 'generaIds', [], MESTRE);
const ids = p.getDataRange().getValues().slice(1).map(f => f[0]);
ok(ids.filter(x => /^A0\d\d$/.test(x)).length === 18 && ids.includes('A001') && ids.includes('A018'), 'IDs A001–A018 generats i 6 alumnes de prova A901–A906');
ok(mon.full.getSheetByName('MISSIONS').getLastRow() === 1 + 17 + 16, 'MISSIONS sembrada una sola vegada (S1 + esborranys)');
ok(mon.full.getSheetByName('CALENDARI').getLastRow() === 1 + 45, 'CALENDARI: 5 grups × 9 sessions');

console.log('\n2 · Seguretat');
ok(mon.crida('admin', 'api', ['inici', {}], correu(0)).motiu === 'identitat', 'Un alumne no pot fer servir l\'API de l\'administrador');
let error = '';
try { mon.crida('mon', 'registra_', ['A001', []], correu(0)); } catch (e) { error = e.message; }
ok(/privada/.test(error), 'Les funcions acabades en _ no es poden cridar des del navegador');
ok(alumne(0, 'estat', { simula: 'A901' }).dades.alumne.id === 'A001', 'Un alumne no pot fer-se passar per un altre amb «simula»');
ok(mon.crida('mon', 'api', ['estat', {}, 'testimoni-fals'], '').motiu === 'identitat', 'Un testimoni inventat no dona accés');

const htmlAdmin = async u => (await fetch(`${BASE}/admin${u ? '?usuari=' + encodeURIComponent(u) : ''}`)).text();
ok((await htmlAdmin(correu(0))).includes('Compte que obre la pàgina: ' + correu(0)), 'L\'administrador rebutja un alumne i diu quin compte ha vist');
ok((await htmlAdmin('')).includes('const AVIS = "sense-correu"'), 'Si Google no dona el correu, el tauler s\'obre amb l\'avís de comprovar el desplegament');
ok(!(await htmlAdmin(MESTRE)).includes('const AVIS = "sense-correu"'), 'Amb el correu del mestre, el tauler s\'obre sense avís');

console.log('\n3 · El mestre obre la sessió S1 per al grup 2');
const ini = admin('obreSessio', { grup: 'G2', sessio: 'S1' });
ok(ini.ok && ini.dades.oberta.sessio === 'S1', 'Sessió oberta');
const codi = ini.dades.calendari.find(c => c.grup === 'G2' && c.sessio === 'S1').codi;
ok(/^\d{4}$/.test(codi), 'Codi de classe de 4 xifres: ' + codi);
const equips = mon.full.getSheetByName('EQUIPS').getDataRange().getValues().slice(1).filter(f => f[3] === 'S1');
ok(equips.length === 18 && new Set(equips.map(f => f[4])).size === 6, '18 alumnes repartits en 6 robots (6 Ozobot)');
const est = alumne(0, 'estat').dades;
ok(!JSON.stringify(est).includes('"correcta"'), 'L\'alumne no rep cap resposta correcta');
ok(!JSON.stringify(est).includes('Biel'), 'L\'alumne no rep cap nom d\'un altre alumne');

// ---------- Navegador ----------
const nav = await chromium.launch();
const VP_CHROMEBOOK = { width: 1366, height: 625 };    // 1366×768 menys la barra del navegador
const clics = {};

async function revisa(pagina, nom, opcions = {}) {
  await pagina.waitForTimeout(150);
  await pagina.screenshot({ path: join(CAPTURES, nom + '.png') });
  const r = await pagina.evaluate((op) => {
    const errors = [];
    const vh = innerHeight, vw = innerWidth;
    const de = document.documentElement;
    if (op.senseScroll && (de.scrollHeight > vh + 1 || de.scrollWidth > vw + 1)) errors.push(`scroll: ${de.scrollWidth}×${de.scrollHeight}`);
    const visible = el => { const s = getComputedStyle(el); const b = el.getBoundingClientRect(); return s.display !== 'none' && s.visibility !== 'hidden' && b.width > 0 && b.height > 0 && el.offsetParent !== null; };
    const tot = [...document.querySelectorAll('body *')].filter(el => !(el instanceof SVGElement) && visible(el));
    tot.forEach(el => {
      const b = el.getBoundingClientRect();
      if (op.senseScroll && (b.bottom > vh + 1 || b.right > vw + 1)) errors.push(`fora de pantalla: ${el.tagName}.${el.className} ${el.id} (${Math.round(b.right)},${Math.round(b.bottom)})`);
      const s = getComputedStyle(el);
      if (Number(s.fontWeight) > 700) errors.push(`pes ${s.fontWeight}: ${el.tagName}#${el.id}`);
      const teText = [...el.childNodes].some(n => n.nodeType === 3 && n.textContent.trim());
      if (teText) {
        if (parseFloat(s.fontSize) < op.lletraMin) errors.push(`lletra ${s.fontSize}: «${el.textContent.trim().slice(0, 30)}»`);
        const rgb = c => (c.match(/[\d.]+/g) || []).map(Number);
        const lum = ([r, g, b]) => { const f = v => { v /= 255; return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }; return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b); };
        let fons = null, x = el;
        while (x && !fons) { const c = rgb(getComputedStyle(x).backgroundColor); if (c.length >= 3 && (c[3] === undefined || c[3] > 0.5)) fons = c; x = x.parentElement; }
        fons = fons || [255, 255, 255];
        const fg = rgb(s.color);
        const L1 = lum(fg), L2 = lum(fons);
        const ratio = (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05);
        const opac = parseFloat(getComputedStyle(el.closest('[disabled]') || el).opacity);
        if (ratio < 4.5 && opac === 1) errors.push(`contrast ${ratio.toFixed(2)}: «${el.textContent.trim().slice(0, 30)}»`);
      }
    });
    if (op.botoMin) document.querySelectorAll('button').forEach(b => {
      if (!visible(b)) return;
      const r = b.getBoundingClientRect();
      if (r.width < op.botoMin || r.height < op.botoMin) errors.push(`botó petit ${Math.round(r.width)}×${Math.round(r.height)}: «${b.textContent.trim().slice(0, 30)}»`);
    });
    return errors;
  }, { senseScroll: opcions.senseScroll !== false, lletraMin: opcions.lletraMin || 18.6, botoMin: opcions.botoMin || 0 });
  const unics = [...new Set(r)];
  ok(unics.length === 0, `${nom}: ${opcions.senseScroll === false ? '' : 'sense scroll, '}lletra ≥ 14 pt, contrast ≥ 4,5, pes ≤ 700${opcions.botoMin ? ', botons ≥ 2 cm' : ''}` + (unics.length ? '\n      ' + unics.slice(0, 8).join('\n      ') : ''));
}
const REVISA_MON = { botoMin: 75 };

async function obreAlumne(i, viewport = VP_CHROMEBOOK) {
  const ctx = await nav.newContext({ viewport });
  const pg = await ctx.newPage();
  pg.on('pageerror', e => { fallades++; console.log('  ✗ Error JS a la pàgina: ' + e.message); });
  clics[i] = 0;
  pg.clic = async (sel) => { clics[i]++; await pg.click(sel); };
  await pg.goto(`${BASE}/mon?usuari=${encodeURIComponent(correu(i))}`);
  return pg;
}
const espera = (pg, sel, ms = 20000) => pg.waitForSelector(sel, { state: 'visible', timeout: ms });

console.log('\n4 · Anna (Pla A): primer dia, camí sense entrebancs');
const anna = await obreAlumne(0);
await espera(anna, '#p-avatar');
await revisa(anna, '01-company-de-viatge', REVISA_MON);
await anna.clic('#avatar-graella .tria >> nth=0');
await espera(anna, '#p-pin');
await revisa(anna, '03-pin-crea', REVISA_MON);
for (const k of ['sol', 'peix', 'casa']) await anna.clic(`#pin-graella .tria[data-k="${k}"]`);
await espera(anna, '#p-recorda');
await revisa(anna, '04-pin-recorda', REVISA_MON);
await anna.clic('#recorda-ok');
await espera(anna, '#p-mapa');
await revisa(anna, '05-mapa-dia1', REVISA_MON);
const clicsPreparacio = clics[0];
ok(clicsPreparacio === 5, `Preparació del primer dia (company + PIN): ${clicsPreparacio} clics`);
await anna.clic('#boto-missio');
await espera(anna, '#p-missio');
await revisa(anna, '06-missio-prediccio', REVISA_MON);
await anna.clic('#m-cos .tria >> nth=0');
await anna.waitForSelector('#b-si');
await revisa(anna, '07-missio-n1', REVISA_MON);
await anna.clic('#b-si');
await anna.waitForSelector('#b-demo');
await revisa(anna, '08-missio-n2', REVISA_MON);
await anna.click('#boto-codis');
await espera(anna, '#modal-xuleta');
await revisa(anna, '08b-xuleta-codis', REVISA_MON);
ok((await anna.evaluate(() => document.querySelectorAll('#modal-xuleta .xuleta-codi').length)) === 11, 'La xuleta mostra els 11 codis de l\'Ozobot');
await anna.click('#modal-tanca');
await anna.waitForSelector('#modal-xuleta', { state: 'hidden' });
await anna.clic('#b-demo');
await anna.waitForSelector('#b-cancela');
await revisa(anna, '09-missio-espera', REVISA_MON);

console.log('\n5 · Biel: «no me n\'he sortit» → pista → ajuda');
alumne(1, 'registra', { esdeveniments: [{ t: 'avatar', v: 'c2-a3' }, { t: 'pin', v: 'lluna-arbre-flor' }] });
const biel = await obreAlumne(1);
await espera(biel, '#p-mapa');
await biel.clic('#boto-missio');
await biel.clic('#m-cos .tria >> nth=1');
await biel.waitForSelector('#b-no');
await biel.clic('#b-no');
await espera(biel, '#p-encallat');
await revisa(biel, '10-encallat', REVISA_MON);
await biel.clic('#encallat-graella .tria[data-v="perd"]');
await espera(biel, '#p-pista');
await revisa(biel, '11-pista', REVISA_MON);
await biel.clic('#pista-ajuda');
await espera(biel, '#m-banner');
await revisa(biel, '12-missio-amb-ajuda', REVISA_MON);

console.log('\n6 · Els altres 16 alumnes treballen alhora (via API, barrejats amb el mestre)');
for (let i = 2; i < 18; i++) alumne(i, 'registra', { esdeveniments: [{ t: 'avatar', v: `c${i % 8}-a${i % 8}` }, { t: 'pin', v: 'sol-lluna-estrella' }, { t: 'entrada', v: '', s: 'S1' }] });
for (let i = 2; i < 18; i++) alumne(i, 'registra', { esdeveniments: [{ t: 'prediccio', v: 'tornado', s: 'S1' }] });
for (let i = 2; i < 14; i++) alumne(i, 'registra', { esdeveniments: [{ t: 'n1', v: '', s: 'S1' }] });
for (let i = 2; i < 10; i++) alumne(i, 'registra', { esdeveniments: [{ t: 'demo', v: '2', s: 'S1' }] });
// el mestre valida mentre els alumnes continuen escrivint a la mateixa fila
for (let i = 2; i < 10; i++) {
  admin('valida', { id: 'A0' + String(i + 1).padStart(2, '0'), sessio: 'S1', que: i % 2 ? 'n2diagnostic' : 'n2funciona' });
  alumne(i, 'registra', { esdeveniments: [{ t: 'prediccio', v: 'turbo', s: 'S1' }, { t: 'encallat', v: 'torna', s: 'S1' }] });
}
alumne(14, 'registra', { esdeveniments: [{ t: 'encallat', v: 'nollegeix', s: 'S1' }, { t: 'ajuda', v: '', s: 'S1' }] });
alumne(15, 'registra', { esdeveniments: [{ t: 'n1', v: '', s: 'S1' }, { t: 'demo', v: '2', s: 'S1' }] });
admin('valida', { id: 'A016', sessio: 'S1', que: 'n1no' });     // el mestre veu que el N1 no era cert
const t1 = admin('tauler', { grup: 'G2', sessio: 'S1' }).dades;
const de = id => t1.targetes.find(x => x.id === id);
ok([3, 5, 7, 9].every(i => de('A00' + i).nivell === 2 && de('A00' + i).viaN2 === 'funciona'), 'La validació del mestre sobreviu a les escriptures posteriors de l\'alumne (blocs separats)');
ok(de('A003').prediccio === 'tornado', 'La predicció no es pot canviar un cop feta (ni després de programar)');
ok(de('A016').nivell === 0, 'Un N1 rebutjat pel mestre torna a 0');
ok(t1.cues.ajuda.map(x => x.id).join() === 'A002,A015', 'Cua d\'ajuda en ordre d\'arribada: ' + t1.cues.ajuda.map(x => x.nom).join(', '));
ok(t1.cues.demo[0].id === 'A001', 'Cua de demostracions: l\'Anna la primera');
ok(t1.fita.presents === 18, 'Fita: 18 presents');

console.log('\n6b · Proteccions (revisió de seguretat)');
const fReg = () => mon.full.getSheetByName('REGISTRE').getDataRange().getValues();
const abansReg = fReg().length;
alumne(4, 'registra', { esdeveniments: [{ t: 'pista', v: '=IMPORTDATA("https://dolent")', s: 'S1' }, { t: 'prediccio', v: '=1+1', s: 'S1' }, { t: 'encallat', v: '+SUM(1)', s: 'S1' }] });
ok(!fReg().some(f => f.some(c => /^[=+\-@]/.test(String(c)))), 'Cap valor que arriba del navegador es pot convertir en fórmula');
ok(fReg().slice(1).every(f => /^A\d{3}$/.test(String(f[1])) || f[1] === '') && fReg().slice(1).some(f => f[1] === 'A005'), 'El registre conserva sencers els identificadors dels alumnes');
alumne(5, 'registra', { esdeveniments: Array.from({ length: 60 }, () => ({ t: 'ajuda', v: '', s: 'S1' })) });
ok(fReg().length - abansReg <= 20, 'Com a molt 20 esdeveniments per enviament (' + (fReg().length - abansReg) + ')');
ok(mon.projectes.admin.estatEfectiu_({ nivell_mestre: 2 }).present === true, 'Un alumne validat pel mestre compta com a present encara que no hagi entrat');
admin('valida', { id: 'A013', sessio: 'S1', que: 'desfes' });
ok(admin('tauler', { grup: 'G2', sessio: 'S1' }).dades.targetes.find(x => x.id === 'A013').nivell === 0, '«Desfés un nivell» també treu un N1 declarat per l\'alumne');
alumne(12, 'registra', { esdeveniments: [{ t: 'n1', v: '', s: 'S1' }] });
ok(admin('tauler', { grup: 'G2', sessio: 'S1' }).dades.targetes.find(x => x.id === 'A013').nivell === 1, '…i el pot tornar a declarar després');

const PR = mon.full.getSheetByName('PROGRES');
PR.dades = PR.dades.filter((f, k) => k === 0 || f[0] !== 'A018·S1');   // un alumne nou sense fila de progrés
const rNou = alumne(17, 'registra', { esdeveniments: [{ t: 'prediccio', v: 'tornado', s: 'S1' }] });
ok(rNou.dades.avui.progres.prediccio === 'tornado' && PR.dades.filter(f => f[0] === 'A018·S1').length === 1,
  'Un alumne afegit amb la sessió ja oberta no queda en bucle: se li crea la fila i es desa el que fa');

console.log('\n7 · El mestre al tauler (PC)');
const ctxM = await nav.newContext({ viewport: { width: 1366, height: 768 } });
const mestre = await ctxM.newPage();
mestre.on('pageerror', e => { fallades++; console.log('  ✗ Error JS (admin): ' + e.message); });
await mestre.goto(`${BASE}/admin?usuari=${encodeURIComponent(MESTRE)}`);
await espera(mestre, '#aula-oberta');
await mestre.waitForSelector('.targeta');
await revisa(mestre, '20-admin-aula', { senseScroll: false, lletraMin: 14.6 });
ok(await mestre.evaluate(() => URL_ADMIN) === '/admin', 'L\'enllaç de la projecció és l\'URL de l\'administrador');
await mestre.click('.cua button[data-id="A001"]');
await espera(mestre, '#dialeg');
await revisa(mestre, '21-admin-validacio', { senseScroll: false, lletraMin: 14.6 });
await mestre.click('#dialeg button[data-q="n2funciona"]');
await mestre.waitForTimeout(400);
console.log('  … l\'Anna espera que se li encengui el nivell 2 (consulta cada 10 s)');
await anna.waitForSelector('text=Nivell 3:', { timeout: 25000 });
await revisa(anna, '13-missio-n3', REVISA_MON);
ok(true, 'El Chromebook de l\'Anna mostra el nivell 3 sense que ella faci res');

console.log('\n8 · Targeta de sortida');
await mestre.click('#b-sortida');
await espera(anna, '#p-sortida', 40000);
await revisa(anna, '14-sortida-diag', REVISA_MON);
await anna.clic('#sortida-cos .tria[data-v="a"]');
await revisa(anna, '15-sortida-eina', REVISA_MON);
await anna.clic('#sortida-cos .tria[data-v="a"]');
await espera(anna, '#p-fet');
await revisa(anna, '16-fet', REVISA_MON);
await espera(biel, '#p-sortida', 40000);
await biel.clic('#sortida-cos .tria[data-v="a"]');
await biel.clic('#sortida-cos .tria[data-v="b"]');
await espera(biel, '#p-fet');
const clicsSessio = clics[0] - clicsPreparacio;
ok(clicsSessio <= 10, `Anna, la sessió (sense la preparació del primer dia): ${clicsSessio} clics`);
ok(clics[1] <= 10, `Biel (encallat, demana ajuda): ${clics[1]} clics`);
await anna.waitForSelector('#p-mapa', { state: 'visible', timeout: 12000 });
await revisa(anna, '17-mapa-despres', REVISA_MON);

console.log('\n9 · Notes');
const n = admin('notes', { grup: 'G2' }).dades;
const nota = id => n.files.find(f => f.id === id).sessions.S1.nota;
ok(nota('A001') === 8, 'Anna: N2 «funciona i ho explica» → 8 (' + nota('A001') + ')');
ok(nota('A002') === 4, 'Biel: no arriba a N1, diu on s\'encalla i diagnostica bé → 4 (' + nota('A002') + ')');
ok(nota('A003') === 8.5, 'N2 funciona després d\'haver dit «no me n\'he sortit» → 8,5 (' + nota('A003') + ')');
ok(nota('A004') === 7.5, 'N2 «no funciona però sap per què» → 7,5 (' + nota('A004') + ')');
ok(nota('A011') === 6, 'N1 amb predicció feta → 6 (' + nota('A011') + ')');
ok(nota('A016') === 2, 'Present, N1 rebutjat, sense registre honest → 2 (' + nota('A016') + ')');
ok(nota('A015') === 3, 'Encallat honest → 3 (' + nota('A015') + ')');
admin('ajusta', { id: 'A002', sessio: 'S1', ajust: 1, observacio: 'Ha explicat molt bé on s\'encallava.' });
ok(admin('notes', { grup: 'G2' }).dades.files.find(f => f.id === 'A002').sessions.S1.nota === 5, 'Ajust del mestre +1 → 5');
const inf = admin('informe', { grup: 'G2' }).dades;
const infFiles = mon.full.getSheetByName('INFORME').getDataRange().getValues();
ok(inf.files === 18 && infFiles.length === 19, 'INFORME: 18 files (sense alumnes de prova)');
const filaAnna = infFiles.find(f => f[0] === 'A001');
ok(filaAnna[13] === 'AN' && /Ozobot/.test(filaAnna[14]), 'Informe de l\'Anna: AN i segell d\'Ozobot');

await mestre.click('.pestanya[data-p="notes"]');
await mestre.waitForSelector('#taula-notes td.cel');
await revisa(mestre, '22-admin-notes', { senseScroll: false, lletraMin: 14.6 });
await mestre.click('.pestanya[data-p="missions"]');
await mestre.waitForSelector('#taula-missio tr[data-i]');
await revisa(mestre, '23-admin-missions', { senseScroll: false, lletraMin: 13.3 });
await mestre.click('.pestanya[data-p="sessions"]');
await mestre.waitForSelector('#taula-calendari button');
await revisa(mestre, '24-admin-sessions', { senseScroll: false, lletraMin: 14.6 });

ok(admin('restauraMissio', { sessio: 'S1' }).dades.files.length === 17, 'El botó «Restaura la missió per defecte» torna a posar les 17 files de la S1');

console.log('\n10 · Mòbil del mestre');
const ctxMob = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
const mobil = await ctxMob.newPage();
await mobil.goto(`${BASE}/admin?usuari=${encodeURIComponent(MESTRE)}`);
await mobil.waitForSelector('.targeta');
await revisa(mobil, '25-admin-mobil', { senseScroll: false, lletraMin: 14.6 });
ok(await mobil.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), 'Al mòbil no hi ha scroll horitzontal');

console.log('\n11 · Projecció a la Promethean');
const ctxP = await nav.newContext({ viewport: { width: 1920, height: 1080 } });
const proj = await ctxP.newPage();
await proj.goto(`${BASE}/admin?usuari=${encodeURIComponent(MESTRE)}&vista=projeccio`);
await proj.waitForSelector('#sortida', { state: 'visible' });
await revisa(proj, '30-projeccio-sortida', { lletraMin: 18 });
admin('canviaEstat', { grup: 'G2', sessio: 'S1', estat: 'oberta' });
await proj.reload();
await proj.waitForSelector('#treball', { state: 'visible' });
await revisa(proj, '31-projeccio-treball', { lletraMin: 18 });
ok(await proj.isVisible('#panell-xuleta .xuleta'), 'La projecció mostra la xuleta de codis de la sessió');
const textProj = await proj.evaluate(() => document.body.innerText);
ok(!NOMS.some(nm => textProj.includes(nm.split(' ')[0])), 'La projecció no mostra cap nom d\'alumne');

console.log('\n12 · Pla B2 (GitHub Pages + codi + nom + dibuixos)');
const codiNou = admin('inici').dades.calendari.find(c => c.grup === 'G2' && c.sessio === 'S1').codi;
const ctxB = await nav.newContext({ viewport: VP_CHROMEBOOK });
const pb = await ctxB.newPage();
pb.on('pageerror', e => { fallades++; console.log('  ✗ Error JS (Pla B): ' + e.message); });
await pb.goto(`${BASE}/pla-b/?api=/exec-b2`);
await espera(pb, '#p-codi');
await revisa(pb, '40-plab-codi', REVISA_MON);
for (const d of '0000') await pb.click(`#teclat button[data-d="${d}"]`);
await pb.waitForSelector('text=Aquest codi no és');
ok(true, 'Codi incorrecte → missatge clar');
for (const d of codiNou) await pb.click(`#teclat button[data-d="${d}"]`);
await espera(pb, '#p-nom');
await revisa(pb, '41-plab-nom', REVISA_MON);
await pb.click('#noms .tria >> text=Anna R.');
await espera(pb, '#p-pin');
for (const k of ['sol', 'lluna', 'casa']) await pb.click(`#pin-graella .tria[data-k="${k}"]`);
await pb.waitForSelector('text=No són aquests');
ok(true, 'PIN incorrecte → «No són aquests»');
for (const k of ['sol', 'peix', 'casa']) await pb.click(`#pin-graella .tria[data-k="${k}"]`);
await espera(pb, '#p-mapa');
await revisa(pb, '42-plab-dins', REVISA_MON);
ok(true, 'L\'Anna entra pel Pla B2 amb el seu PIN i veu el seu món');

console.log('\n13 · Mode prova i noms genèrics');
const ctxT = await nav.newContext({ viewport: VP_CHROMEBOOK });
const tp = await ctxT.newPage();
await tp.goto(`${BASE}/mon?usuari=${encodeURIComponent(MESTRE)}`);
await espera(tp, '#p-prova');
await revisa(tp, '50-mode-prova', REVISA_MON);
admin('configura', { clau: 'noms_generics', valor: 'sí' });
mon.projectes.mon.oblidaCache_('config');   // al de debò triga com a molt 1 minut
await anna.reload();
await espera(anna, '#p-mapa');
const textMapa = await anna.evaluate(() => document.getElementById('mapa').innerText);
ok(textMapa.includes('Zona 1') && !textMapa.includes('Illa'), 'Amb «noms genèrics» el mapa diu Zona 1, Zona 2…');
await revisa(anna, '51-mapa-generic', REVISA_MON);
admin('configura', { clau: 'noms_generics', valor: 'no' });

console.log('\n14 · Una altra pantalla de Chromebook (1280×600)');
mon.projectes.mon.oblidaCache_('config');
const petit = await obreAlumne(2, { width: 1280, height: 600 });
await espera(petit, '#p-mapa');
await revisa(petit, '60-petit-mapa', REVISA_MON);
await petit.clic('#boto-missio');
await espera(petit, '#p-missio');
await revisa(petit, '61-petit-missio', REVISA_MON);

console.log('\n15 · Pla B: límits i revocació');
const codiAra = admin('inici').dades.calendari.find(c => c.grup === 'G2' && c.sessio === 'S1').codi;
const pinB = (id, pin) => mon.crida('mon', 'api', ['entraPin', { codi: codiAra, id: id, pin: pin }, null], '');
const tok = pinB('A001', 'sol-peix-casa');
ok(tok.ok, 'L\'Anna entra amb el seu PIN');
ok(mon.crida('mon', 'api', ['estat', {}, tok.dades.testimoni], '').ok, 'El testimoni funciona');
admin('reiniciaPin', { id: 'A001' });
ok(mon.crida('mon', 'api', ['estat', {}, tok.dades.testimoni], '').motiu === 'identitat', 'Reiniciar el PIN invalida el testimoni');
ok(pinB('A001', 'flor-poma-arbre').ok, 'Després de reiniciar-lo, l\'Anna en tria un de nou');
for (let k = 0; k < 5; k++) pinB('A005', 'nuvol-flor-poma');
ok(pinB('A005', 'sol-lluna-estrella').motiu === 'massa-intents', 'Després de 5 PIN equivocats, ni el bo entra (1 hora)');
ok(pinB('A999', 'sol-lluna-estrella').motiu === 'pin' && pinB('A005x', 'sol-lluna-estrella').motiu === 'pin', 'Alumne inexistent i PIN equivocat donen la mateixa resposta');
ok(mon.crida('mon', 'api', ['llistaNoms', { codi: codiAra }, null], '').dades.noms.every(x => !('tePin' in x)), 'La llista de noms no diu qui té PIN');

await nav.close();
srv.close();
console.log(`\n${correctes} correctes · ${fallades} fallades · captures a proves/captures/`);
process.exit(fallades ? 1 : 0);
