/* ============================================================
   IL·LUSTRACIONS — Taller 3r
   Tot és SVG amb formes explícites: cap patró ni referència a id (es poden clonar sense trencar-se).
   ============================================================ */
const TINTA = '#2b2f3a';
const TRAÇ = `stroke="${TINTA}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round"`;

function svg(contingut, vb = '0 0 100 100') {
  return `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" aria-hidden="true" focusable="false">${contingut}</svg>`;
}

/* ---------- Peces ---------- */
function ozo(x, y, s = 1, llum = '#7fd1ff', apagat = false) {
  const cos = apagat ? '#c9ced6' : '#eef2f7';
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <ellipse cx="0" cy="17" rx="19" ry="4" fill="#00000022"/>
    <path d="M-17 12 Q-17 -14 0 -15 Q17 -14 17 12 Z" fill="${cos}" ${TRAÇ}/>
    <rect x="-19" y="9" width="38" height="8" rx="4" fill="#3b4252" ${TRAÇ}/>
    <circle cx="0" cy="-3" r="5" fill="${apagat ? '#8a919c' : llum}" ${TRAÇ}/>
  </g>`;
}
function full(x = 8, y = 10, w = 84, h = 80) {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="#ffffff" ${TRAÇ}/>`;
}
function linia(d, color = '#111', gruix = 7) {
  return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${gruix}" stroke-linecap="round" stroke-linejoin="round"/>`;
}
function check(x, y, s = 1) {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="11" fill="#1e7a3c"/><path d="M-5 0 L-1 4 L6 -4" fill="none" stroke="#fff" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/></g>`;
}
function interrogant(x, y, s = 1, color = '#3d4a8f') {
  return `<g transform="translate(${x} ${y}) scale(${s})"><circle r="12" fill="${color}"/><text x="0" y="6" text-anchor="middle" font-size="18" font-weight="700" fill="#fff" font-family="Andika, Verdana, sans-serif">?</text></g>`;
}
function persona(x, y, s = 1, color = '#f2b8a0', roba = '#5b8bd9', gran = false) {
  const h = gran ? 1.25 : 1;
  return `<g transform="translate(${x} ${y}) scale(${s * h})">
    <rect x="-11" y="2" width="22" height="26" rx="10" fill="${roba}" ${TRAÇ}/>
    <circle cx="0" cy="-8" r="10" fill="${color}" ${TRAÇ}/>
    <circle cx="-3.5" cy="-9" r="1.6" fill="${TINTA}"/><circle cx="3.5" cy="-9" r="1.6" fill="${TINTA}"/>
    <path d="M-3.5 -4 Q0 -1.5 3.5 -4" fill="none" stroke="${TINTA}" stroke-width="1.8" stroke-linecap="round"/>
  </g>`;
}
const CAMI = 'M20 72 C 30 40, 50 80, 62 50 S 78 26, 82 30';

/* ---------- Il·lustracions de les missions ---------- */
const IL = {
  'ozo-cami': svg(full() + `<circle cx="20" cy="72" r="7" fill="#111"/>` + linia(CAMI) +
    `<circle cx="82" cy="30" r="9" fill="#fff" ${TRAÇ}/><text x="82" y="35" text-anchor="middle" font-size="13" font-weight="700" fill="${TINTA}" font-family="Andika, Verdana, sans-serif">A</text>` +
    ozo(52, 60, 0.55)),
  'ozo-arriba': svg(full() + linia(CAMI) + `<circle cx="82" cy="30" r="10" fill="#fff" ${TRAÇ}/>` + ozo(80, 28, 0.55) + check(30, 30, 1.1)),
  'mestre': svg(persona(32, 50, 1.25, '#e8b796', '#4f7a5c', true) + persona(68, 60, 1, '#f2c9a8', '#d9725b') +
    ozo(68, 86, 0.4) + `<path d="M48 14 h34 a6 6 0 0 1 6 6 v12 a6 6 0 0 1 -6 6 h-20 l-6 7 v-7 h-8 a6 6 0 0 1 -6 -6 v-12 a6 6 0 0 1 6 -6z" fill="#fff" ${TRAÇ}/>` +
    `<path d="M58 26 L63 31 L73 21" fill="none" stroke="#1e7a3c" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  'carta': svg(`<rect x="24" y="12" width="52" height="76" rx="7" fill="#fff4d6" ${TRAÇ}/>` +
    `<path d="M50 28 l6 12 13 2 -9 9 2 13 -12 -6 -12 6 2 -13 -9 -9 13 -2z" fill="#f2b632" ${TRAÇ}/>` +
    `<text x="50" y="82" text-anchor="middle" font-size="12" font-weight="700" fill="${TINTA}" font-family="Andika, Verdana, sans-serif">REPTE</text>`),
  'pred-si': svg(full() + linia(CAMI) + ozo(82, 28, 0.5) + check(26, 28, 1.1)),
  'pred-perd': svg(full() + linia(CAMI) + ozo(44, 30, 0.5) + interrogant(74, 72, 1)),
  'pred-nose': svg(persona(50, 58, 1.6, '#f2c9a8', '#8a6fc4') + interrogant(76, 22, 1.2)),
  'e-encen': svg(ozo(50, 54, 1.4, '#7fd1ff', true) + `<g transform="translate(78 24)"><circle r="12" fill="#fff" ${TRAÇ}/><path d="M0 -6 v6 M-5 -3 a7 7 0 1 0 10 0" fill="none" stroke="${TINTA}" stroke-width="3" stroke-linecap="round"/></g>`),
  'e-perd': svg(full() + linia(CAMI) + ozo(40, 28, 0.5) + interrogant(74, 72, 1)),
  'e-altra': svg(full() + linia('M20 70 L80 70') + ozo(46, 58, 0.55) +
    `<path d="M40 40 C 30 22, 60 14, 64 34" fill="none" stroke="#3d4a8f" stroke-width="4" stroke-linecap="round"/><path d="M58 30 L64 36 L69 28" fill="none" stroke="#3d4a8f" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  'e-nose': svg(persona(44, 58, 1.6, '#f2c9a8', '#d98c4a') + interrogant(76, 24, 1.2)),
  'ozo-boto': svg(ozo(46, 56, 1.4) + `<circle cx="71" cy="62" r="5" fill="#f2b632" ${TRAÇ}/>` +
    `<path d="M92 52 L78 60" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/><path d="M80 54 L77 61 L84 62" fill="none" stroke="${TINTA}" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>`),
  'ozo-calibra': svg(full() + `<circle cx="50" cy="56" r="26" fill="#111"/>` + ozo(50, 54, 0.8, '#ffffff') +
    [0, 60, 120, 180, 240, 300].map(a => { const r = Math.PI * a / 180; return `<line x1="${50 + Math.cos(r) * 31}" y1="${56 + Math.sin(r) * 31}" x2="${50 + Math.cos(r) * 37}" y2="${56 + Math.sin(r) * 37}" stroke="#f2b632" stroke-width="3" stroke-linecap="round"/>`; }).join('')),
  'linia-gruixuda': svg(full(6, 22, 88, 56) + linia('M16 60 C 34 30, 56 72, 84 40', '#111', 8)),
  'linia-fina': svg(full(6, 22, 88, 56) + linia('M16 60 C 34 30, 56 72, 84 40', '#8a8f99', 1.6)),
  'linia-groga': svg(full(6, 22, 88, 56) + linia('M16 60 C 34 30, 56 72, 84 40', '#f2c94c', 8)),
  'ozo-forat': svg(full() + linia('M14 62 L42 62') + linia('M60 62 L86 62') + ozo(30, 50, 0.55)),
  'op-forat': svg(full(6, 22, 88, 56) + linia('M14 50 L42 50') + linia('M58 50 L86 50')),
  'op-llarga': svg(full(6, 14, 88, 72) + linia('M14 26 H86 V40 H14 V54 H86 V68 H20', '#111', 5)),
  'op-full': svg(`<rect x="10" y="6" width="80" height="88" rx="4" fill="#fff" ${TRAÇ}/><path d="M18 20 h40 M18 30 h56 M18 40 h30" stroke="#c6cbd3" stroke-width="3" stroke-linecap="round"/>`)
};

/* ---------- Dibuixos del PIN (sempre amb etiqueta) ---------- */
const PIN = {
  sol: ['Sol', svg(`<circle cx="50" cy="50" r="20" fill="#f6c343" ${TRAÇ}/>` + [0, 45, 90, 135, 180, 225, 270, 315].map(a => { const r = Math.PI * a / 180; return `<line x1="${50 + Math.cos(r) * 28}" y1="${50 + Math.sin(r) * 28}" x2="${50 + Math.cos(r) * 40}" y2="${50 + Math.sin(r) * 40}" stroke="${TINTA}" stroke-width="4" stroke-linecap="round"/>`; }).join(''))],
  lluna: ['Lluna', svg(`<path d="M62 14 A36 36 0 1 0 86 66 A28 28 0 1 1 62 14Z" fill="#f3e08a" ${TRAÇ}/>`)],
  estrella: ['Estrella', svg(`<path d="M50 10 l11 24 26 3 -19 18 5 26 -23 -13 -23 13 5 -26 -19 -18 26 -3z" fill="#f2b632" ${TRAÇ}/>`)],
  peix: ['Peix', svg(`<path d="M14 50 Q40 20 70 50 Q40 80 14 50Z" fill="#7cc3e8" ${TRAÇ}/><path d="M70 50 L90 34 L90 66Z" fill="#7cc3e8" ${TRAÇ}/><circle cx="30" cy="46" r="3.5" fill="${TINTA}"/>`)],
  arbre: ['Arbre', svg(`<rect x="44" y="58" width="12" height="30" fill="#a0703f" ${TRAÇ}/><circle cx="50" cy="40" r="26" fill="#6dbb6a" ${TRAÇ}/>`)],
  casa: ['Casa', svg(`<path d="M18 48 L50 18 L82 48" fill="#e86f5a" ${TRAÇ}/><rect x="26" y="46" width="48" height="40" fill="#f6e2c0" ${TRAÇ}/><rect x="43" y="62" width="14" height="24" fill="#8a5a3a" ${TRAÇ}/>`)],
  poma: ['Poma', svg(`<path d="M50 30 C 22 18, 10 52, 26 74 C 36 90, 46 84, 50 80 C 54 84, 64 90, 74 74 C 90 52, 78 18, 50 30Z" fill="#e2524a" ${TRAÇ}/><path d="M50 30 Q52 18 58 12" fill="none" ${TRAÇ}/><path d="M54 22 Q66 12 74 20 Q64 28 54 22Z" fill="#6dbb6a" ${TRAÇ}/>`)],
  nuvol: ['Núvol', svg(`<path d="M24 70 Q8 70 12 56 Q14 44 28 46 Q30 28 50 30 Q66 24 72 42 Q90 42 88 58 Q88 70 74 70Z" fill="#ffffff" ${TRAÇ}/>`)],
  flor: ['Flor', svg(`<path d="M50 62 V92" ${TRAÇ}/>` + [0, 72, 144, 216, 288].map(a => { const r = Math.PI * a / 180; return `<circle cx="${50 + Math.cos(r) * 16}" cy="${40 + Math.sin(r) * 16}" r="12" fill="#f29cc2" ${TRAÇ}/>`; }).join('') + `<circle cx="50" cy="40" r="9" fill="#f6c343" ${TRAÇ}/>`)]
};
const ORDRE_PIN = ['sol', 'lluna', 'estrella', 'peix', 'arbre', 'casa', 'poma', 'nuvol', 'flor'];

/* ---------- Avatar: personatge (color) + complement ---------- */
const COLORS_AVATAR = [
  ['Groc', '#f6c85f'], ['Taronja', '#f4a259'], ['Vermell', '#e8706a'], ['Rosa', '#f2a6c8'],
  ['Lila', '#b9a3e3'], ['Blau', '#7fb6ea'], ['Verd', '#86c77a'], ['Marró', '#c8946a']
];
const COMPLEMENTS = [
  ['Res', ''],
  ['Barret', `<path d="M26 30 h48 M34 30 V14 h32 V30" fill="#3b4252" ${TRAÇ}/><path d="M34 24 h32" stroke="#e8706a" stroke-width="4"/>`],
  ['Gorra', `<path d="M28 30 Q30 10 52 10 Q72 12 72 30Z" fill="#3d7bd9" ${TRAÇ}/><path d="M66 28 h20" stroke="${TINTA}" stroke-width="5" stroke-linecap="round"/>`],
  ['Ulleres', `<circle cx="40" cy="44" r="8" fill="#ffffff88" ${TRAÇ}/><circle cx="60" cy="44" r="8" fill="#ffffff88" ${TRAÇ}/><path d="M48 44 h4" ${TRAÇ}/>`],
  ['Flor', `<g transform="translate(70 22)">${[0, 72, 144, 216, 288].map(a => { const r = Math.PI * a / 180; return `<circle cx="${Math.cos(r) * 6}" cy="${Math.sin(r) * 6}" r="5" fill="#f29cc2" stroke="${TINTA}" stroke-width="2"/>`; }).join('')}<circle r="4" fill="#f6c343" stroke="${TINTA}" stroke-width="2"/></g>`],
  ['Auriculars', `<path d="M24 46 Q24 12 50 12 Q76 12 76 46" fill="none" stroke="${TINTA}" stroke-width="5"/><rect x="18" y="40" width="10" height="16" rx="4" fill="#e8706a" ${TRAÇ}/><rect x="72" y="40" width="10" height="16" rx="4" fill="#e8706a" ${TRAÇ}/>`],
  ['Bufanda', `<path d="M28 64 Q50 74 72 64 L72 72 Q50 82 28 72Z" fill="#e8706a" ${TRAÇ}/><path d="M60 72 L64 90 L54 90 L52 74" fill="#e8706a" ${TRAÇ}/>`],
  ['Llaç', `<g transform="translate(50 16)"><path d="M0 0 L-16 -9 L-16 9Z M0 0 L16 -9 L16 9Z" fill="#b9a3e3" ${TRAÇ}/><circle r="4" fill="#b9a3e3" ${TRAÇ}/></g>`]
];
function avatarSVG(codi) {
  const m = /^c(\d)-a(\d)$/.exec(codi || '') || [null, '5', '0'];
  const color = (COLORS_AVATAR[+m[1]] || COLORS_AVATAR[5])[1];
  const comp = (COMPLEMENTS[+m[2]] || COMPLEMENTS[0])[1];
  return svg(`<path d="M22 90 Q16 34 50 26 Q84 34 78 90Z" fill="${color}" ${TRAÇ}/>
    <circle cx="40" cy="46" r="4" fill="${TINTA}"/><circle cx="60" cy="46" r="4" fill="${TINTA}"/>
    <path d="M40 58 Q50 66 60 58" fill="none" stroke="${TINTA}" stroke-width="3" stroke-linecap="round"/>
    <circle cx="33" cy="56" r="4" fill="#ffffff55"/><circle cx="67" cy="56" r="4" fill="#ffffff55"/>${comp}`);
}

/* ---------- Segells del carnet d'eines ---------- */
const SEGELLS = {
  scottie: ['Scottie Go!', svg(`<rect x="22" y="22" width="40" height="54" rx="6" fill="#fff" ${TRAÇ} transform="rotate(-10 42 49)"/><rect x="38" y="24" width="40" height="54" rx="6" fill="#ffe8a3" ${TRAÇ} transform="rotate(8 58 51)"/><path d="M52 46 l10 6 -10 6z" fill="${TINTA}"/>`)],
  ozobot: ['Ozobot', svg(ozo(50, 52, 1.6))],
  dash: ['Dash', svg(`<circle cx="50" cy="38" r="22" fill="#5aa9e6" ${TRAÇ}/><circle cx="50" cy="36" r="9" fill="#fff" ${TRAÇ}/><circle cx="50" cy="36" r="4" fill="${TINTA}"/><circle cx="32" cy="72" r="12" fill="#5aa9e6" ${TRAÇ}/><circle cx="68" cy="72" r="12" fill="#5aa9e6" ${TRAÇ}/><circle cx="50" cy="80" r="11" fill="#5aa9e6" ${TRAÇ}/>`)],
  spike: ['SPIKE', svg(`<rect x="16" y="30" width="68" height="46" rx="6" fill="#f6c85f" ${TRAÇ}/>` + [28, 44, 60, 76].map(x => `<rect x="${x - 6}" y="20" width="12" height="10" rx="2" fill="#f6c85f" ${TRAÇ}/>`).join('') + `<rect x="34" y="42" width="32" height="22" rx="4" fill="#fff" ${TRAÇ}/>`)],
  scratch: ['Scratch', svg(`<path d="M18 22 h20 l4 4 h8 l4 -4 h28 v16 h-28 l-4 4 h-8 l-4 -4 h-20z" fill="#f2b632" ${TRAÇ}/><path d="M18 44 h20 l4 4 h8 l4 -4 h28 v16 h-28 l-4 4 h-8 l-4 -4 h-20z" fill="#7fb6ea" ${TRAÇ}/><path d="M18 66 h64 v14 h-64z" fill="#86c77a" ${TRAÇ}/>`)]
};

/* ---------- Mapa: illes, fites, barca, far ---------- */
const FITES = {
  casa: `<path d="M-14 0 L0 -14 L14 0" fill="#e86f5a" ${TRAÇ}/><rect x="-10" y="-1" width="20" height="16" fill="#f6e2c0" ${TRAÇ}/>`,
  pins: `<path d="M-14 12 L-6 -14 L2 12Z" fill="#3f8f4e" ${TRAÇ}/><path d="M0 12 L8 -8 L16 12Z" fill="#4fa35c" ${TRAÇ}/>`,
  barraca: `<rect x="-16" y="-2" width="32" height="16" fill="#f6e2c0" ${TRAÇ}/><path d="M-19 0 L0 -14 L19 0Z" fill="#c9a26b" ${TRAÇ}/>`,
  pont: `<path d="M-20 10 Q0 -16 20 10" fill="none" stroke="${TINTA}" stroke-width="5"/><path d="M-20 10 h40" stroke="${TINTA}" stroke-width="3"/>`,
  roques: `<path d="M-18 12 L-10 -6 L0 4 L8 -10 L18 12Z" fill="#9aa3ad" ${TRAÇ}/>`,
  flor: `<path d="M0 14 V0" ${TRAÇ}/><circle cx="0" cy="-5" r="7" fill="#f29cc2" ${TRAÇ}/><circle cx="0" cy="-5" r="3" fill="#f6c343"/>`,
  estel: `<path d="M0 -16 L12 0 L0 16 L-12 0Z" fill="#e8706a" ${TRAÇ}/><path d="M0 16 q6 6 0 12" fill="none" ${TRAÇ}/>`,
  torre: `<rect x="-8" y="-16" width="16" height="30" fill="#f6e2c0" ${TRAÇ}/><path d="M-10 -16 h20 v-6 h-4 v3 h-4 v-3 h-4 v3 h-4 v-3 h-4z" fill="#f6e2c0" ${TRAÇ}/>`,
  muntanya: `<path d="M-22 14 L-4 -16 L6 -2 L12 -10 L24 14Z" fill="#8f9fb0" ${TRAÇ}/><path d="M-9 -8 L-4 -16 L1 -8Z" fill="#fff"/>`
};
function bandera(x, y) {
  return `<g transform="translate(${x} ${y})"><path d="M0 0 V-26" ${TRAÇ}/><path d="M0 -26 L16 -21 L0 -16Z" fill="#e8706a" ${TRAÇ}/></g>`;
}
function cadenat(x, y) {
  return `<g transform="translate(${x} ${y})"><path d="M-7 -2 V-8 a7 7 0 0 1 14 0 V-2" fill="none" stroke="${TINTA}" stroke-width="3"/><rect x="-10" y="-3" width="20" height="16" rx="3" fill="#8a919c" ${TRAÇ}/></g>`;
}
function far(x, y, ences) {
  const raigs = ences ? `<path d="M0 -40 L-40 -54 L-40 -26Z M0 -40 L40 -54 L40 -26Z" fill="#f6d65e" opacity="0.85"/>` : '';
  return `<g transform="translate(${x} ${y})">${raigs}
    <path d="M-12 30 L-8 -30 H8 L12 30Z" fill="#fff" ${TRAÇ}/>
    <path d="M-10.5 6 H10.5 M-9.5 -12 H9.5" stroke="#e8706a" stroke-width="7"/>
    <rect x="-11" y="-46" width="22" height="16" rx="3" fill="${ences ? '#f6d65e' : '#c9ced6'}" ${TRAÇ}/>
    <path d="M-14 -46 L0 -58 L14 -46Z" fill="#e8706a" ${TRAÇ}/>
    <path d="M-22 30 H22" ${TRAÇ}/></g>`;
}
function barca(x, y, avatar) {
  return `<g transform="translate(${x} ${y})">
    <g transform="translate(-16 -44) scale(0.32)">${avatar.replace(/^<svg[^>]*>/, '').replace(/<\/svg>$/, '')}</g>
    <path d="M-30 -14 H30 L20 4 H-20Z" fill="#c8946a" ${TRAÇ}/></g>`;
}
/* Forma de cada illa (radis per fer-les diferents) */
const FORMES = [
  [1, .95, 1.05, .9, 1, 1.05, .95, 1], [1.1, .9, 1, .85, 1.1, .95, 1, .9], [1.25, .7, 1.2, .75, 1.25, .7, 1.2, .75],
  [1, 1.05, .9, 1, 1.05, .9, 1, 1.05], [.95, 1.1, .85, 1.1, .95, 1.05, .9, 1.1], [.8, .8, .8, .8, .8, .8, .8, .8],
  [1.05, .9, 1.1, .95, 1, .9, 1.1, .95], [.95, 1.05, 1, 1.1, .9, 1, 1.05, .95], [1.2, 1.05, 1.15, 1, 1.2, 1.1, 1.15, 1.05]
];
function formaIlla(cx, cy, r, factors) {
  const n = factors.length, pts = [];
  for (let i = 0; i < n; i++) {
    const a = Math.PI * 2 * i / n, rr = r * factors[i];
    pts.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * 0.62]);
  }
  let d = `M${((pts[0][0] + pts[n - 1][0]) / 2).toFixed(1)} ${((pts[0][1] + pts[n - 1][1]) / 2).toFixed(1)}`;
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n];
    d += ` Q${p[0].toFixed(1)} ${p[1].toFixed(1)} ${((p[0] + q[0]) / 2).toFixed(1)} ${((p[1] + q[1]) / 2).toFixed(1)}`;
  }
  return d + 'Z';
}
function aclareix(hex, t) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255, g = (n >> 8) & 255, b = n & 255;
  const m = v => Math.round(v + (255 - v) * t);
  return `rgb(${m(r)},${m(g)},${m(b)})`;
}
function partNom(nom) {
  if (nom.length <= 12) return [nom];
  const p = nom.split(' ');
  let millor = [nom], dif = 99;
  for (let i = 1; i < p.length; i++) {
    const a = p.slice(0, i).join(' '), b = p.slice(i).join(' ');
    if (Math.abs(a.length - b.length) < dif) { dif = Math.abs(a.length - b.length); millor = [a, b]; }
  }
  return millor;
}
const POSICIONS = [[90, 330], [215, 130], [340, 330], [470, 130], [600, 330], [730, 130], [860, 330], [985, 130], [1110, 330]];

/**
 * Dibuixa el mapa sencer.
 * mon: [{zona, nom, color, dibuix}] · zones: {Z1:'tancada'|'oberta'|'n1'|'n2'|'n3'}
 * opcions: { avatar: codi, zonaBarca: 'Z3', farEnces: bool, destaca: 'Z3' }
 */
function mapaSVG(mon, zones, opcions = {}) {
  let ruta = '';
  for (let i = 0; i < POSICIONS.length - 1; i++) {
    const [x1, y1] = POSICIONS[i], [x2, y2] = POSICIONS[i + 1];
    ruta += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="#ffffff" stroke-width="6" stroke-dasharray="2 14" stroke-linecap="round"/>`;
  }
  let illes = '';
  mon.forEach((z, i) => {
    const [x, y] = POSICIONS[i];
    const estat = zones[z.zona] || 'tancada';
    const tancada = estat === 'tancada';
    const fill = tancada ? '#c9d0d8' : estat === 'oberta' ? aclareix(z.color, 0.55) : z.color;
    const vora = estat === 'oberta' ? `stroke="${TINTA}" stroke-width="3" stroke-dasharray="8 6"` : TRAÇ;
    const destaca = opcions.destaca === z.zona ? `<path d="${formaIlla(x, y, 74, FORMES[i])}" fill="none" stroke="#ffffff" stroke-width="7"/>` : '';
    let damunt = '';
    if (tancada) damunt = cadenat(x, y + 2);
    if (estat === 'n2' || estat === 'n3') damunt = `<g transform="translate(${x} ${y - 6}) scale(1.15)">${FITES[z.dibuix] || ''}</g>`;
    if (estat === 'n3') damunt += bandera(x + 32, y + 4);
    const linies = partNom(z.nom);
    const amplada = Math.max(...linies.map(l => l.length)) * 11 + 26;
    const alt = linies.length * 24 + 12;
    const ty = y + 52;
    const etiqueta = `<rect x="${x - amplada / 2}" y="${ty}" width="${amplada}" height="${alt}" rx="12" fill="#ffffff" stroke="${TINTA}" stroke-width="2"/>` +
      linies.map((l, k) => `<text x="${x}" y="${ty + 26 + k * 24}" text-anchor="middle" font-size="20" font-weight="700" fill="${tancada ? '#4a5160' : TINTA}" font-family="Andika, Verdana, sans-serif">${l}</text>`).join('');
    illes += `<g class="illa" data-zona="${z.zona}" data-estat="${estat}">${destaca}<path d="${formaIlla(x, y, 62, FORMES[i])}" fill="${fill}" ${vora}/>${damunt}${etiqueta}</g>`;
  });
  let barcaSvg = '';
  const iz = mon.findIndex(z => z.zona === opcions.zonaBarca);
  if (iz >= 0 && opcions.avatar !== undefined) {
    const [x, y] = POSICIONS[iz];
    barcaSvg = barca(x + (y < 200 ? 0 : 0), y < 200 ? y - 52 : y - 50, avatarSVG(opcions.avatar));
  }
  return `<svg viewBox="0 0 1200 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Mapa del teu món">
    <rect x="0" y="0" width="1200" height="470" rx="24" fill="#d8eefa"/>${ruta}${far(600, 110, !!opcions.farEnces)}${illes}${barcaSvg}</svg>`;
}

/** Una sola illa gran (pantalla de «Fet» i projecció). */
function illaSVG(z, estat, i) {
  const fill = estat === 'tancada' ? '#c9d0d8' : estat === 'oberta' ? aclareix(z.color, 0.55) : z.color;
  let damunt = '';
  if (estat === 'n2' || estat === 'n3') damunt = `<g transform="translate(100 66) scale(2.2)">${FITES[z.dibuix] || ''}</g>`;
  if (estat === 'n3') damunt += `<g transform="translate(150 86) scale(1.6) translate(-0 0)">${bandera(0, 0)}</g>`;
  return `<svg viewBox="0 0 200 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><rect width="200" height="140" rx="20" fill="#d8eefa"/>
    <path d="${formaIlla(100, 78, 80, FORMES[i] || FORMES[0])}" fill="${fill}" ${TRAÇ}/>${damunt}</svg>`;
}
