/* ============================================================
   IL·LUSTRACIONS — RoboMón · L'Arxipèlag
   · Imatges (IMG) generades amb IA, retallades i incrustades en WebP pel construeix.mjs.
   · Esquemes vectorials (línies, forats…) amb el mateix llenguatge: full blanc, marc fi, robot blanc.
   · SVG: cap patró ni referència a id (es poden clonar sense trencar-se).
   ============================================================ */
const img = (k, cls = '') => IMG[k] ? `<img class="${cls}" src="${IMG[k]}" alt="" draggable="false">` : '';
const TINTA = '#1f2328';

function esquema(contingut) {
  return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">
    <rect x="0" y="0" width="100" height="100" rx="6" fill="#f3eee4"/>
    <rect x="16" y="9" width="68" height="82" rx="2.5" fill="#ffffff" stroke="${TINTA}" stroke-width="1.6"/>${contingut}</svg>`;
}
const marcador = (d, color = '#141414', gruix = 5) =>
  `<path d="${d}" fill="none" stroke="${color}" stroke-width="${gruix}" stroke-linecap="round" stroke-linejoin="round"/>`;
/* El mateix robot blanc de les escenes: cúpula, franja grisa i llum blava */
function robot(x, y, s = 1, llum = '#5ec3f2') {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="7.5" rx="9.5" ry="2" fill="#00000018"/>
    <path d="M-9 4 Q-9 -9 0 -9.5 Q9 -9 9 4 Z" fill="#ffffff" stroke="${TINTA}" stroke-width="1.2"/>
    <rect x="-9.6" y="2" width="19.2" height="5" rx="2.4" fill="#e9ecef" stroke="${TINTA}" stroke-width="1.2"/>
    <circle cx="0" cy="-3" r="3.4" fill="${llum}" stroke="${TINTA}" stroke-width="0.9"/>
    <circle cx="0" cy="4.6" r="0.9" fill="${TINTA}"/></g>`;
}
const marcaOk = (x, y) => `<g transform="translate(${x} ${y})"><circle r="7" fill="#2f7a55"/><path d="M-3.2 0 L-0.8 2.6 L3.6 -2.6" fill="none" stroke="#fff" stroke-width="2.1" stroke-linecap="round" stroke-linejoin="round"/></g>`;
const marcaDubte = (x, y) => `<g transform="translate(${x} ${y})"><circle r="7" fill="#3e4a57"/><text x="0" y="3.6" text-anchor="middle" font-size="10" font-weight="700" fill="#fff" font-family="Lexend, Verdana, sans-serif">?</text></g>`;
const CAMI = 'M28 78 C 34 54, 52 74, 58 52 S 70 26, 74 24';

const IL = {
  // Escenes (imatge)
  'ozo-cami': img('ozo-cami'), 'ozo-arriba': img('ozo-arriba'), 'mestre': img('mestre'), 'carta': img('carta'),
  'e-encen': img('e-encen'), 'e-nose': img('e-nose'), 'ozo-boto': img('ozo-boto'), 'ozo-calibra': img('ozo-calibra'),
  'pred-nose': img('e-nose'),
  // Esquemes (vectorials)
  'pred-si': esquema(marcador(CAMI) + robot(73, 25, 0.9) + marcaOk(30, 22)),
  'pred-perd': esquema(marcador(CAMI) + robot(42, 38, 0.9) + marcaDubte(70, 78)),
  'e-perd': esquema(marcador(CAMI) + robot(42, 38, 0.9) + marcaDubte(70, 78)),
  'e-altra': esquema(marcador('M24 70 L76 70') + robot(48, 62, 0.95) +
    `<path d="M40 44 C 36 30, 58 24, 62 38" fill="none" stroke="#3e4a57" stroke-width="2.6" stroke-linecap="round"/><path d="M57.5 35 L62.5 39.5 L66 33.5" fill="none" stroke="#3e4a57" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/>`),
  'linia-gruixuda': esquema(marcador('M26 74 C 36 40, 58 80, 74 30', '#141414', 6.5)),
  'linia-fina': esquema(marcador('M26 74 C 36 40, 58 80, 74 30', '#8b9097', 1.3)),
  'linia-groga': esquema(marcador('M26 74 C 36 40, 58 80, 74 30', '#f2cf4a', 6.5)),
  'ozo-forat': esquema(marcador('M24 58 L45 58') + marcador('M57 58 L76 58') + robot(33, 50, 0.95)),
  'op-forat': esquema(marcador('M24 50 L45 50') + marcador('M57 50 L76 50')),
  'op-llarga': esquema(marcador('M26 20 H74 V34 H26 V48 H74 V62 H26 V76 H70', '#141414', 4)),
  'op-full': `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <rect x="9" y="6" width="82" height="88" rx="2.5" fill="#fff" stroke="${TINTA}" stroke-width="1.6"/></svg>`
};

/* ---------- PIN de 3 dibuixos (sempre amb etiqueta) ---------- */
const PIN = {
  sol: ['Sol', img('pin-sol')], lluna: ['Lluna', img('pin-lluna')], estrella: ['Estrella', img('pin-estrella')],
  peix: ['Peix', img('pin-peix')], arbre: ['Arbre', img('pin-arbre')], casa: ['Casa', img('pin-casa')],
  poma: ['Poma', img('pin-poma')], nuvol: ['Núvol', img('pin-nuvol')], flor: ['Flor', img('pin-flor')]
};
const ORDRE_PIN = ['sol', 'lluna', 'estrella', 'peix', 'arbre', 'casa', 'poma', 'nuvol', 'flor'];

/* ---------- Companys de viatge (avatar). El codi és «cN-a0» (compatible amb el servidor) ---------- */
const COMPANYS = ['Guineu', 'Òliba', 'Tortuga', 'Orca', 'Agró', 'Llúdriga', 'Ós', 'Cabra'];
function avatarHTML(codi) {
  const m = /^c(\d)-a\d$/.exec(codi || '');
  return img('avatar-' + (m ? Math.min(7, +m[1]) : 0), 'avatar-img');
}

/* ---------- Carnet d'eines ---------- */
const SEGELLS = {
  scottie: ['Scottie Go!', img('eina-scottie')], ozobot: ['Ozobot', img('eina-ozobot')], dash: ['Dash', img('eina-dash')],
  spike: ['SPIKE', img('eina-spike')], scratch: ['Scratch', img('eina-scratch')]
};

/* ---------- El mapa ----------
   Coordenades en % de la imatge retallada (2752×1014, proporció 2,714).
   r = radi de l'illa en % de l'amplada. etiqueta: 'sota' o 'sobre' l'illa. */
const PROP_MAPA = 2752 / 1014;
const ILLES = [
  { x: 8.9, y: 53.5, r: 6.2, etiqueta: 'sota' },
  { x: 20.0, y: 33.0, r: 6.6, etiqueta: 'sota' },
  { x: 32.3, y: 49.5, r: 7.4, etiqueta: 'sota' },
  { x: 41.8, y: 31.0, r: 6.4, etiqueta: 'sota' },
  { x: 52.0, y: 33.0, r: 6.6, etiqueta: 'sobre' },
  { x: 60.5, y: 45.5, r: 3.4, etiqueta: 'sobre' },
  { x: 68.7, y: 52.0, r: 5.4, etiqueta: 'sota' },
  { x: 74.1, y: 30.0, r: 4.8, etiqueta: 'sobre' },
  { x: 92.0, y: 38.0, r: 9.5, etiqueta: 'sota' }
];
const FAR = { x: 59.0, y: 80.0 };
const CADENAT = `<svg viewBox="0 0 16 16" aria-hidden="true" class="cadenat"><path d="M4.5 7V5.2a3.5 3.5 0 0 1 7 0V7" fill="none" stroke="currentColor" stroke-width="1.6"/><rect x="3" y="7" width="10" height="7.5" rx="1.8" fill="currentColor"/></svg>`;

/**
 * mon: [{zona, nom}] · zones: {Z1:'tancada'|'oberta'|'n1'|'n2'|'n3'}
 * opcions: { avatar, zonaAvatar, farEnces, destaca }
 */
function mapaHTML(mon, zones, opcions = {}) {
  let capes = '';
  mon.forEach((z, i) => {
    const p = ILLES[i]; if (!p) return;
    const estat = zones[z.zona] || 'tancada';
    const nivell = estat === 'n3' ? 3 : estat === 'n2' ? 2 : estat === 'n1' ? 1 : 0;
    const ry = p.r * PROP_MAPA;   // radi en % de l'alçada
    const amplBoira = Math.min(p.r * 2.6, 2 * (100 - p.x) - 0.5, 2 * p.x - 0.5);
    if (estat === 'tancada') capes += `<div class="boira" style="left:${p.x}%; top:${p.y}%; width:${amplBoira}%;"></div>`;
    if (opcions.destaca === z.zona) capes += `<div class="anell" style="left:${p.x}%; top:${p.y}%; width:${p.r * 2.3}%;"></div>`;
    const punts = estat === 'tancada' ? `<span class="aviat">${CADENAT}Aviat</span>`
      : `<span class="llums" aria-label="Nivell ${nivell}">${[1, 2, 3].map(n => `<i class="${nivell >= n ? 'on' : ''}"></i>`).join('')}</span>`;
    const yEtiq = p.etiqueta === 'sobre' ? `bottom:${100 - p.y + ry * 0.62}%` : `top:${p.y + ry * 0.5}%`;
    capes += `<div class="etiqueta-illa ${estat}" data-zona="${z.zona}" data-estat="${estat}" style="left:${p.x}%; ${yEtiq};">
      <span class="nom-illa">${z.nom}</span>${punts}</div>`;
  });
  if (opcions.farEnces) capes += `<div class="llum-far" style="left:${FAR.x}%; top:${FAR.y}%;"></div>`;
  const iz = mon.findIndex(z => z.zona === opcions.zonaAvatar);
  if (iz >= 0 && opcions.avatar !== undefined) {
    const p = ILLES[iz];
    const dalt = p.etiqueta === 'sobre';
    const y = dalt ? p.y + p.r * PROP_MAPA * 0.55 : p.y - p.r * PROP_MAPA * 0.62;
    capes += `<div class="ets-aqui" style="left:${p.x - p.r * 0.35}%; top:${y}%;">${avatarHTML(opcions.avatar)}</div>`;
  }
  return `<div class="mapa-img" role="img" aria-label="Mapa del teu món">${img('mapa', 'fons-mapa')}${capes}</div>`;
}

/** Una illa retallada del mapa (pantalla de «Fet» i projecció), en un requadre 4:3. */
function illaHTML(i, estat) {
  const p = ILLES[i] || ILLES[0];
  const zoom = Math.max(2.3, 100 / (p.r * 3.4));      // amplada del mapa respecte del requadre
  const altMapa = zoom / PROP_MAPA;                   // alçada del mapa (en amplades del requadre)
  const px = p.x / 100 * zoom, py = p.y / 100 * altMapa;
  const bx = Math.max(0, Math.min(100, (0.5 - px) / (1 - zoom) * 100));
  const by = Math.max(0, Math.min(100, (0.375 - py) / (0.75 - altMapa) * 100));
  return `<div class="illa-retall ${estat === 'tancada' ? 'apagada' : ''}" style="background-image:url(${IMG.mapa}); background-size:${zoom * 100}% auto; background-position:${bx.toFixed(2)}% ${by.toFixed(2)}%;"></div>`;
}
