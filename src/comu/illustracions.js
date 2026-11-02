/* ============================================================
   IL·LUSTRACIONS — RoboMón · L'Arxipèlag
   · Imatges (IMG) generades amb IA, retallades i incrustades en WebP pel construeix.mjs.
   · Esquemes vectorials (línies, forats…) amb el mateix llenguatge: full blanc, marc fi, robot blanc.
   · SVG: cap patró ni referència a id (es poden clonar sense trencar-se).
   ============================================================ */
const img = (k, cls = '') => IMG[k] ? `<img class="${cls}" src="${IMG[k]}" alt="" draggable="false">` : '';
const TINTA = '#1f2328';

function esquema(contingut) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true" focusable="false">
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
  /* Escenes (imatge) */
  'ozo-cami': img('ozo-cami'), 'ozo-arriba': img('ozo-arriba'), 'mestre': img('mestre'), 'carta': img('carta'),
  'e-encen': img('e-encen'), 'e-nose': img('e-nose'), 'ozo-boto': img('ozo-boto'), 'ozo-calibra': img('ozo-calibra'),
  'pred-nose': img('e-nose'),
  /* Esquemes (vectorials) */
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
  'op-full': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
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

/* ---------- Consignes personals ----------
   Un text de missió pot dur «{teva:text general}». Al Chromebook es canvia per la variant de l'alumne
   («Pinta el codi {teva:de la teva missió}» → «Pinta el codi TORNADO»); a la projecció i al paper, pel text general. */
function personalitza(text, variant) {
  return String(text == null ? '' : text).replace(/\{teva:([^}]*)\}/g, (_, general) => variant || general);
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
/* Silueta negra de cada illa (src/imatges/silueta-N.webp), retallada del mapa: on va i quant ocupa (en % del mapa) */
const SILUETES = [{ x: 3.056, y: 41.478, w: 11.889, h: 25.189 }, { x: 13.778, y: 10.106, w: 12.333, h: 39.819 }, { x: 24.333, y: 39.517, w: 15.778, h: 24.133 }, { x: 36.333, y: 23.228, w: 11.0, h: 17.496 }, { x: 45.722, y: 17.949, w: 12.833, h: 30.468 }, { x: 57.667, y: 36.501, w: 5.722, h: 17.496 }, { x: 63.111, y: 41.478, w: 11.778, h: 22.323 }, { x: 69.333, y: 11.161, w: 11.056, h: 36.652 }, { x: 76.556, y: 0.0, w: 23.444, h: 62.745 }];
/* Cadenat gran per a les illes tancades */
const CADENAT_GRAN = `<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="32" r="30" fill="#141a20" stroke="#f5efe4" stroke-width="3"/><path d="M22 29v-6a10 10 0 0 1 20 0v6" fill="none" stroke="#f5efe4" stroke-width="5" stroke-linecap="round"/><rect x="17" y="28" width="30" height="21" rx="5" fill="#f5efe4"/><circle cx="32" cy="37" r="3.2" fill="#141a20"/><path d="M32 39v5" stroke="#141a20" stroke-width="3" stroke-linecap="round"/></svg>`;
/* Segell de passaport amb la icona de RoboMón (el món amb antena): illa feta */
const SEGELL_FET = `<svg viewBox="0 0 120 120" aria-hidden="true"><g fill="none" stroke="#17565d"><circle cx="60" cy="60" r="55" fill="rgba(255,253,248,.72)" stroke-width="5"/><circle cx="60" cy="60" r="47" stroke-width="2" stroke-dasharray="3 4"/>
  <circle cx="60" cy="58" r="22" stroke-width="5"/><ellipse cx="60" cy="58" rx="9" ry="22" stroke-width="3.4"/><path d="M38 58h44" stroke-width="3.4"/><path d="M60 36v-9" stroke-width="4" stroke-linecap="round"/></g>
  <circle cx="60" cy="24" r="5.5" fill="#d9a441"/><text x="60" y="97" text-anchor="middle" font-size="13" font-weight="700" letter-spacing="2" fill="#17565d" font-family="Lexend, Verdana, sans-serif">FET</text></svg>`;
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
    const ry = p.r * PROP_MAPA;   /* radi en % de l'alçada */
    const s = SILUETES[i];
    if (estat === 'tancada') {
      /* Tancada: la silueta negra de l'illa i un cadenat. Res més. */
      if (s && IMG['silueta-' + (i + 1)]) capes += `<img class="silueta" alt="" src="${IMG['silueta-' + (i + 1)]}" style="left:${s.x}%; top:${s.y}%; width:${s.w}%; height:${s.h}%;">`;
      capes += `<div class="cadenat-illa" style="left:${p.x}%; top:${p.y}%;" aria-label="Tancada">${CADENAT_GRAN}</div>`;
      return;
    }
    /* Feta (no és la d'avui i hi ha arribat al nivell 1 o més): segell de passaport */
    if (nivell >= 1 && opcions.destaca !== z.zona) capes += `<div class="segell-fet" style="left:${p.x + p.r * 0.35}%; top:${p.y - ry * 0.25}%;" aria-label="Feta">${SEGELL_FET}</div>`;
    if (opcions.destaca === z.zona) {
      capes += `<div class="anell" style="left:${p.x}%; top:${p.y}%; width:${p.r * 2.3}%;"></div>`;
      /* L'illa del dia es pot tocar: obre la missió (el dit hi va d'instint) */
      capes += `<button class="illa-avui" id="illa-avui" aria-label="Missió d'avui" style="left:${p.x}%; top:${p.y}%; width:${Math.max(p.r * 2.3, 7)}%;"></button>`;
    }
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
  const zoom = Math.max(2.3, 100 / (p.r * 3.4));      /* amplada del mapa respecte del requadre */
  const altMapa = zoom / PROP_MAPA;                   /* alçada del mapa (en amplades del requadre) */
  const px = p.x / 100 * zoom, py = p.y / 100 * altMapa;
  const bx = Math.max(0, Math.min(100, (0.5 - px) / (1 - zoom) * 100));
  const by = Math.max(0, Math.min(100, (0.375 - py) / (0.75 - altMapa) * 100));
  return `<div class="illa-retall ${estat === 'tancada' ? 'apagada' : ''}" style="background-image:url(${IMG.mapa}); background-size:${zoom * 100}% auto; background-position:${bx.toFixed(2)}% ${by.toFixed(2)}%;"></div>`;
}

/* ============================================================
   CODIS DE COLOR DE L'OZOBOT
   Font: Ozobot Evo · Color Code Chart (Ozo Edu, Rev 12-23). Comprovat amb la Pocket Guide (Bit/Evo).
   Lletres: K negre · R vermell · G verd · B blau. Es llegeixen en el sentit de la marxa (fletxa).
   ============================================================ */
/* Colors oficials de la guia Ozobot Evo: blau #1183C6, vermell #EC2027, verd #49B749 */
const COLORS_CODI = { K: ['#141414', 'Negre', 'Ng'], R: ['#ec2027', 'Vermell', 'Vm'], G: ['#49b749', 'Verd', 'Vd'], B: ['#1183c6', 'Blau', 'Bl'] };
/* ============================================================
   XULETES (projecció, botó «Codis» del Chromebook i paper)
   Cada element és {nom, codi} (Ozobot), {bloc, text} (Scratch) o {nom, peca} (SPIKE).
   Fonts: Ozobot Evo Color Code Chart (rev. 12-23) · Scratch scratch-l10n (ca) · LEGO SPIKE Essential.
   ============================================================ */
const XULETES = {
  ozobot: { titol: 'Codis de l\'Ozobot', grups: [
    { grup: 'Velocitat', items: [{ nom: 'Lent', codi: 'RKR' }, { nom: 'Normal', codi: 'GKG' }, { nom: 'Ràpid', codi: 'BKB' }, { nom: 'Turbo', codi: 'BGB' }, { nom: 'Nitro (3 s)', codi: 'BGR' }] },
    { grup: 'Moviments', items: [{ nom: 'Pausa (3 s)', codi: 'RBR' }, { nom: 'Mitja volta', codi: 'BRB' }, { nom: 'Tornado', codi: 'RGRG' }, { nom: 'Ziga-zaga', codi: 'BKGR' }, { nom: 'Giravolt', codi: 'GRGR' }, { nom: 'Camina enrere', codi: 'RGKB' }] }
  ], regla: 'Quadrats enganxats, sense blanc entremig. Pinta\'ls en el sentit de la fletxa.' },
  'ozobot-cruilla': { titol: 'Codis de l\'Ozobot · cruïlles', grups: [
    { grup: 'A la cruïlla', items: [{ nom: 'Gira a l\'esquerra', codi: 'GKR' }, { nom: 'Recte', codi: 'BKR' }, { nom: 'Gira a la dreta', codi: 'BRG' }] },
    { grup: 'Velocitat', items: [{ nom: 'Lent', codi: 'RKR' }, { nom: 'Normal', codi: 'GKG' }, { nom: 'Turbo', codi: 'BGB' }] },
    { grup: 'Moviments', items: [{ nom: 'Pausa (3 s)', codi: 'RBR' }, { nom: 'Mitja volta', codi: 'BRB' }, { nom: 'Giravolt', codi: 'GRGR' }] }
  ], regla: 'Pinta el codi abans de la cruïlla, a uns 3 cm, en el sentit de la fletxa. Sense codi, a la cruïlla l\'Ozobot tria a l\'atzar.' },
  scottie: { titol: 'Cartes del Scottie Go!', grups: [
    { grup: 'Començar i acabar', items: [{ nom: 'Comença', carta: 'BEGIN', tipus: 'inici' }, { nom: 'Acaba', carta: 'END', tipus: 'inici' }, { nom: 'Agafa', carta: 'PICK UP' }] },
    { grup: 'Moure\'s', items: [{ nom: 'Avança', carta: 'STEP' }, { nom: 'Gira a la dreta', carta: 'TURN TO THE RIGHT' }, { nom: 'Gira a l\'esquerra', carta: 'TURN TO THE LEFT' }] },
    { grup: 'Números i repetir', items: [{ nom: 'Quantes vegades', carta: '3', tipus: 'num' }, { nom: 'Repeteix', carta: 'REPEAT', tipus: 'control' }, { nom: 'Fi de la repetició', carta: 'END IF / REPEAT', tipus: 'control' }] }
  ], regla: 'El número va al costat de STEP o de REPEAT. La dreta del Scottie no sempre és la teva: mira cap on mira ell.' },
  dash: { titol: 'Blocs del Dash (Blockly)', grups: [
    { grup: 'Començar', items: [{ bloc: 'dash-start', text: 'When [Start]' }] },
    { grup: 'Moure\'s (cm i graus)', items: [{ bloc: 'dash-drive', text: 'Forward [50] [normal]' }, { bloc: 'dash-drive', text: 'Backward [50] [normal]' }, { bloc: 'dash-drive', text: 'Turn Left [90]' }, { bloc: 'dash-drive', text: 'Turn Right [90]' }] },
    { grup: 'Control', items: [{ bloc: 'dash-control', text: 'Repeat [2] times' }, { bloc: 'dash-control', text: 'Wait For [2] seconds' }] }
  ], regla: 'Forward 50 = avança 50 cm. Turn 90 = un quart de volta; 180 = mitja volta. Tots els blocs enganxats sota When Start.' },
  spike: { titol: 'Peces del SPIKE', grups: [
    { grup: 'Les peces', items: [{ nom: 'Hub', peca: 'hub' }, { nom: 'Motor', peca: 'motor' }, { nom: 'Sensor de color', peca: 'sensor' }, { nom: 'Cable al port A o B', peca: 'port' }] }
  ], regla: 'Encén el hub amb el botó i connecta\'l a l\'app. Acosta molt el color al sensor.' },
  'scratch-s7': { titol: 'Blocs de Scratch', grups: [
    { grup: 'Esdeveniments', items: [{ bloc: 'events', text: 'quan la {bandera} es cliqui' }, { bloc: 'events', text: 'quan la tecla [fletxa dreta] es premi' }] },
    { grup: 'Moviment', items: [{ bloc: 'motion', text: 'suma [10] a x' }, { bloc: 'motion', text: 'suma [10] a y' }, { bloc: 'motion', text: 'ves a x: [0] y: [0]' }] },
    { grup: 'Control i sensors', items: [{ bloc: 'control', text: 'per sempre' }, { bloc: 'control', text: 'si ⟨ ⟩ llavors' }, { bloc: 'sensing', text: 'tocant el color [ ]?' }] }
  ], regla: 'La condició va dins de «per sempre», i tot sota «quan la bandera es cliqui».' },
  'scratch-s8': { titol: 'Blocs de Scratch · variables', grups: [
    { grup: 'Variables', items: [{ bloc: 'variables', text: 'Crea una variable' }, { bloc: 'variables', text: 'assigna a [punts] el valor [0]' }, { bloc: 'variables', text: 'augmenta [punts] en [1]' }] },
    { grup: 'Ja els coneixes', items: [{ bloc: 'events', text: 'quan la {bandera} es cliqui' }, { bloc: 'control', text: 'si ⟨ ⟩ llavors' }, { bloc: 'sensing', text: 'tocant el color [ ]?' }] },
    { grup: 'Per al rècord', items: [{ bloc: 'operators', text: '⟨ [punts] = [5] ⟩' }, { bloc: 'looks', text: 'digues [Rècord!] durant [2] segons' }] }
  ], regla: '«assigna … el valor 0» va just sota la bandera. «augmenta … en 1» va dins del «si … llavors».' }
};
/* Compatibilitat amb el codi de la S1 */
const CODIS_OZOBOT = { ozobot: XULETES.ozobot.grups.map(g => ({ grup: g.grup, codis: g.items.map(i => [i.nom, i.codi]) })) };
/** Tira d'un codi: línia negra, quadrats de colors amb la inicial a dins, i fletxa del sentit de marxa. */
function codiSVG(seq, ambFletxa = true) {
  const n = seq.length, q = 14, marge = 16, w = marge * 2 + n * q, h = ambFletxa ? 30 : 20;
  const y = ambFletxa ? 12 : 3;
  let s = `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" class="codi">`;
  s += `<rect x="0" y="${y}" width="${w}" height="${q}" fill="#141414"/>`;
  seq.split('').forEach((c, i) => {
    const [col, , ini] = COLORS_CODI[c] || COLORS_CODI.K;
    const x = marge + i * q;
    s += `<rect x="${x}" y="${y}" width="${q}" height="${q}" fill="${col}"/>`;
    s += `<text x="${x + q / 2}" y="${y + q / 2 + 2.6}" text-anchor="middle" font-size="6.4" font-weight="600" fill="#fff" font-family="Lexend, Verdana, sans-serif">${ini}</text>`;
  });
  if (ambFletxa) s += `<path d="M${marge} 5 H${w - marge - 4}" stroke="#4b5866" stroke-width="1.4" stroke-linecap="round"/><path d="M${w - marge - 7} 2 L${w - marge - 2} 5 L${w - marge - 7} 8" fill="none" stroke="#4b5866" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/>`;
  return s + '</svg>';
}
const nomColors = seq => seq.split('').map(c => (COLORS_CODI[c] || COLORS_CODI.K)[1]).join(' · ');
/* Colors oficials de les categories de Scratch 3; text fosc perquè es llegeixi bé */
const COLORS_SCRATCH = { events: '#ffbf00', motion: '#4c97ff', control: '#ffab19', sensing: '#5cb1d6', variables: '#ff8c1a', operators: '#59c059', looks: '#9966ff',
  /* Blockly de Wonder Workshop (Dash): colors de les categories */
  'dash-start': '#2fd08c', 'dash-drive': '#20b8b0', 'dash-control': '#f3c623' };
/** Un bloc de Scratch: rectangle de color, text fosc i els [valors] en requadres blancs. */
function blocSVG(cat, text) {
  const col = COLORS_SCRATCH[cat] || '#ccc';
  const parts = text.split(/(\[[^\]]*\]|\{bandera\})/).filter(Boolean);
  let x = 10, cos = '';
  const amplada = t => t.length * 7.2 + 4;
  parts.forEach(p => {
    if (p === '{bandera}') {
      cos += `<g transform="translate(${x} 9)"><path d="M2 0 V18" stroke="#2c6e2f" stroke-width="2"/><path d="M3 1 Q9 -2 15 2 Q20 5 25 1 V11 Q20 15 15 12 Q9 8 3 11 Z" fill="#4cbf56" stroke="#2c6e2f" stroke-width="1.4"/></g>`;
      x += 30;
    } else if (p[0] === '[') {
      const t = p.slice(1, -1), w = Math.max(22, amplada(t) + 8);
      cos += `<rect x="${x}" y="7" width="${w}" height="22" rx="11" fill="#ffffff" stroke="#00000033"/>`;
      cos += `<text x="${x + w / 2}" y="22.5" text-anchor="middle" font-size="12.5" fill="#1c2733" font-family="Lexend, Verdana, sans-serif">${t}</text>`;
      x += w + 6;
    } else if (p.trim()) {
      cos += `<text x="${x}" y="22.5" font-size="13" font-weight="600" fill="#1c2733" font-family="Lexend, Verdana, sans-serif">${p.trim()}</text>`;
      x += amplada(p.trim()) + 4;
    }
  });
  const w = x + 8;
  return `<svg viewBox="0 0 ${w} 36" aria-hidden="true" class="bloc"><rect x="1" y="1" width="${w - 2}" height="34" rx="8" fill="${col}" stroke="#00000026" stroke-width="1.5"/>${cos}</svg>`;
}
/** Cartes del Scottie Go! Edu (com les impreses: text en anglès, pestanya de color). */
const COLORS_CARTA = { ordre: '#e2622b', num: '#b5452f', inici: '#6c4ea0', control: '#e98a1f' };
function cartaSVG(text, tipus) {
  tipus = tipus || 'ordre';
  const col = COLORS_CARTA[tipus] || COLORS_CARTA.ordre;
  if (tipus === 'num') {
    return `<svg viewBox="0 0 44 36" aria-hidden="true" class="carta"><rect x="1" y="1" width="42" height="34" rx="4" fill="#ffffff" stroke="#00000033" stroke-width="1.2"/><rect x="1" y="1" width="11" height="34" rx="4" fill="${col}"/><text x="28" y="26" text-anchor="middle" font-size="20" font-weight="700" fill="#1c2733" font-family="Lexend, Verdana, sans-serif">${text}</text></svg>`;
  }
  const w = Math.max(90, text.length * 8.4 + 34);
  if (tipus === 'inici') {
    return `<svg viewBox="0 0 ${w} 36" aria-hidden="true" class="carta"><path d="M1 5 Q1 1 5 1 H${w - 5} Q${w - 1} 1 ${w - 1} 5 V27 L${w / 2} 35 L1 27 Z" fill="${col}"/><text x="${w / 2}" y="21" text-anchor="middle" font-size="13" font-weight="700" fill="#ffffff" font-family="Lexend, Verdana, sans-serif">${text}</text></svg>`;
  }
  return `<svg viewBox="0 0 ${w} 36" aria-hidden="true" class="carta"><rect x="1" y="1" width="${w - 2}" height="34" rx="4" fill="#ffffff" stroke="#00000033" stroke-width="1.2"/><rect x="1" y="1" width="20" height="34" rx="4" fill="${col}"/><text x="${(w + 20) / 2}" y="22.5" text-anchor="middle" font-size="12.5" font-weight="700" fill="#1c2733" font-family="Lexend, Verdana, sans-serif">${text}</text></svg>`;
}
/** Un programa del Scottie: files de cartes, de dalt a baix. Cada fila: [[text, tipus], …]. */
function programaScottie(files, x0, y0, alt) {
  let s = '', y = y0;
  files.forEach(fila => {
    let x = x0;
    fila.forEach(([t, tipus]) => {
      const svg = cartaSVG(t, tipus);
      const vb = svg.match(/viewBox="0 0 ([\d.]+) 36"/);
      const w = alt * Number(vb ? vb[1] : 90) / 36;
      s += svg.replace('<svg ', `<svg x="${x}" y="${y}" width="${w}" height="${alt}" `);
      x += w + 1.5;
    });
    y += alt + 1.5;
  });
  return s;
}
/** Un programa curt com a dibuix: «STEP+3» (una fila) o «STEP,STEP,STEP» (files). */
function progSVG(spec) {
  const tipus = t => /^\d+$/.test(t) ? 'num' : (t === 'BEGIN' || t === 'END') ? 'inici' : /REPEAT/.test(t) ? 'control' : 'ordre';
  const files = spec.split(',').map(f => f.split('+').map(t => [t.trim(), tipus(t.trim())]));
  const amplada = files.map(f => f.reduce((a, [t, ti]) => { const m = cartaSVG(t, ti).match(/viewBox="0 0 ([\d.]+) 36"/); return a + Number(m[1]) + 1.5; }, 0));
  const w = Math.max(...amplada), h = files.length * 37.5;
  return `<svg viewBox="0 0 ${w} ${h}" aria-hidden="true" class="prog">${programaScottie(files, 0, 0, 36)}</svg>`;
}
/** Peces del SPIKE Essential en esquema (sense marca ni foto). */
function pecaSVG(tipus) {
  const v = 'stroke="#1f2328" stroke-width="2.2" stroke-linejoin="round"';
  const t = (x, y, txt) => `<text x="${x}" y="${y}" text-anchor="middle" font-size="7" font-weight="600" fill="#1f2328" font-family="Lexend, Verdana, sans-serif">${txt}</text>`;
  const peces = {
    hub: `<rect x="22" y="10" width="56" height="44" rx="8" fill="#ffffff" ${v}/><circle cx="50" cy="32" r="7" fill="#f2c94c" ${v}/><rect x="28" y="50" width="12" height="8" rx="2" fill="#5b6470"/><rect x="60" y="50" width="12" height="8" rx="2" fill="#5b6470"/>` + t(34, 67, 'A') + t(66, 67, 'B'),
    motor: `<rect x="20" y="18" width="48" height="34" rx="9" fill="#ffffff" ${v}/><circle cx="72" cy="35" r="11" fill="#e9ecef" ${v}/><path d="M66 35 H78 M72 29 V41" stroke="#1f2328" stroke-width="3" stroke-linecap="round"/><path d="M20 35 H8" stroke="#5b6470" stroke-width="3"/>`,
    sensor: `<rect x="30" y="20" width="34" height="30" rx="7" fill="#ffffff" ${v}/><circle cx="47" cy="35" r="8" fill="#1f2328"/><circle cx="47" cy="35" r="3.5" fill="#7fd1ff"/><path d="M64 35 H86" stroke="#e0302f" stroke-width="2.5" stroke-dasharray="4 3"/><rect x="86" y="27" width="8" height="16" rx="2" fill="#e0302f"/><path d="M30 35 H10" stroke="#5b6470" stroke-width="3"/>`,
    port: `<rect x="12" y="20" width="30" height="30" rx="6" fill="#ffffff" ${v}/><rect x="36" y="29" width="8" height="12" rx="2" fill="#5b6470"/><path d="M44 35 C 58 35, 58 20, 72 20" fill="none" stroke="#5b6470" stroke-width="3"/><rect x="72" y="14" width="18" height="12" rx="3" fill="#ffffff" ${v}/>` + t(27, 62, 'A · B')
  };
  return `<svg viewBox="0 0 100 70" aria-hidden="true" class="peca"><rect width="100" height="70" rx="8" fill="#f3eee4"/>${peces[tipus] || ''}</svg>`;
}
/** La xuleta sencera (projecció, Chromebook i paper). */
function xuletaHTML(id) {
  const x = XULETES[id];
  if (!x) return '';
  const item = i => {
    if (i.codi) return `<div class="xuleta-codi"><span class="xuleta-nom">${i.nom}</span>${codiSVG(i.codi)}</div>`;
    if (i.bloc) return `<div class="xuleta-codi xuleta-bloc">${blocSVG(i.bloc, i.text)}</div>`;
    if (i.carta) return `<div class="xuleta-codi"><span class="xuleta-nom">${i.nom}</span>${cartaSVG(i.carta, i.tipus)}</div>`;
    if (i.peca) return `<div class="xuleta-codi"><span class="xuleta-nom">${i.nom}</span>${pecaSVG(i.peca)}</div>`;
    return '';
  };
  return `<div class="xuleta">${x.grups.map(g => `<section class="xuleta-grup"><h3>${g.grup}</h3><div class="xuleta-codis${g.items.every(i => i.bloc) ? ' blocs' : ''}">${g.items.map(item).join('')}</div></section>`).join('')}
    <p class="xuleta-regla">${x.regla}</p></div>`;
}
function titolXuleta(id) { return (XULETES[id] || {}).titol || 'Xuleta'; }

/* Esquemes de la S1 (codis) */
function tramCodi(seq, opts = {}) {
  /* tram de línia horitzontal amb una casella de codi al mig (y = 50) */
  const q = 7, x0 = 50 - (seq.length * q) / 2;
  let s = `<rect x="22" y="${50 - q / 2}" width="${x0 - 22 - (opts.forat ? 0 : 0)}" height="${q}" fill="#141414"/>`;
  let x = x0;
  seq.split('').forEach((c, i) => {
    if (opts.forat && i === Math.floor(seq.length / 2)) x += 4;          /* blanc entremig */
    s += c === '_' ? `<rect x="${x}" y="${50 - q / 2}" width="${q}" height="${q}" fill="#fff" stroke="#b9b9b9" stroke-width="0.5"/>`
      : `<rect x="${x}" y="${50 - q / 2}" width="${q}" height="${q}" fill="${(COLORS_CODI[c] || COLORS_CODI.K)[0]}"/>`;
    x += q;
  });
  s += opts.final ? '' : `<rect x="${x}" y="${50 - q / 2}" width="${78 - x}" height="${q}" fill="#141414"/>`;
  return s;
}
Object.assign(IL, {
  'ozo-casella1': esquema(tramCodi('RKR') + robot(66, 39, 0.8) +
    `<text x="50" y="68" text-anchor="middle" font-size="7" font-weight="600" fill="#4b5866" font-family="Lexend, Verdana, sans-serif">casella 1 · Lent</text>`),
  'codi-be': esquema(tramCodi('BKGR')),
  'codi-forat': esquema(tramCodi('BKGR', { forat: true })),
  'ozo-buit': esquema(tramCodi('____', { final: false }).replace(/fill="#141414"\/>$/, 'fill="#141414"/>') + robot(30, 39, 0.8) +
    `<path d="M40 30 C 46 22, 30 18, 28 28" fill="none" stroke="#3e4a57" stroke-width="2.2" stroke-linecap="round"/><path d="M24.5 25 L28 29.5 L32 25.5" fill="none" stroke="#3e4a57" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>`)
});

/** Una il·lustració per clau: IL[clau], o una tira de codi si la clau és «codi:BGB». */
function dibuix(k) {
  if (!k) return '';
  if (k.indexOf('codi:') === 0) return codiSVG(k.slice(5));
  if (k.indexOf('eina:') === 0) return SEGELLS[k.slice(5)] ? SEGELLS[k.slice(5)][1] : '';
  if (k.indexOf('prog:') === 0) return progSVG(k.slice(5));
  if (k.indexOf('carta:') === 0) { const p = k.slice(6).split('|'); return cartaSVG(p[0], p[1] || ''); }
  if (k.indexOf('bloc:') === 0) { const p = k.slice(5).split('|'); return blocSVG(p[0], p[1] || ''); }
  if (k.indexOf('peca:') === 0) return pecaSVG(k.slice(5));
  return IL[k] || '';
}

/* ---------- Esquemes de la S3 (cruïlles), S5–S6 (SPIKE) i S7–S8 (Scratch) ---------- */
function cruilla(codi, ambMetes) {
  let s = marcador('M50 86 V44') + marcador('M24 44 H76') + marcador('M50 44 V16');
  if (codi) {
    const q = 5;
    codi.split('').forEach((c, i) => { s += `<rect x="47.5" y="${72 - i * q}" width="5" height="${q}" fill="${(COLORS_CODI[c] || COLORS_CODI.K)[0]}"/>`; });
  }
  s += robot(50, 82, 0.6);
  if (ambMetes) {
    const meta = (x, y, t) => `<g transform="translate(${x} ${y})"><path d="M0 0 V-11" stroke="${TINTA}" stroke-width="1.4"/><path d="M0 -11 L8 -8.5 L0 -6Z" fill="#d9a441" stroke="${TINTA}" stroke-width="1"/><text x="0" y="8" text-anchor="middle" font-size="6" font-weight="600" fill="${TINTA}" font-family="Lexend, Verdana, sans-serif">${t}</text></g>`;
    s += meta(22, 40, 'E') + meta(50, 14, 'R') + meta(78, 40, 'D');
  }
  return esquema(s);
}
/** El Dash vist de dalt: cos blau, dues rodes, fletxa cap on mira (angle en graus, 0 = amunt). */
function dashDalt(x, y, angle, sc) {
  return `<g transform="translate(${x} ${y}) rotate(${angle}) scale(${sc || 1})">
    <rect x="-9" y="-4" width="3.4" height="9" rx="1.2" fill="${TINTA}"/><rect x="5.6" y="-4" width="3.4" height="9" rx="1.2" fill="${TINTA}"/>
    <circle cx="0" cy="0" r="7" fill="#1aa3e8" stroke="${TINTA}" stroke-width="0.9"/><circle cx="0" cy="-1.5" r="3.4" fill="#ffffff" stroke="${TINTA}" stroke-width="0.7"/>
    <path d="M-2.4 -7.6 L0 -11 L2.4 -7.6 Z" fill="${TINTA}"/></g>`;
}
/** Terra amb cinta: línia de sortida, marca de la cinta mètrica i el Dash. */
function escenaDash(extra, dx, dy, angle) {
  let regle = '';
  for (let i = 0; i <= 6; i++) regle += `<path d="M86 ${80 - i * 10} H90" stroke="${TINTA}" stroke-width="0.6"/>`;
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <rect x="8" y="8" width="84" height="84" rx="3" fill="#e9dcc3"/>
    <path d="M14 80 H76" stroke="#ffffff" stroke-width="3"/><text x="20" y="89" font-size="5.5" font-weight="600" fill="${TINTA}" font-family="Lexend, Verdana, sans-serif">sortida</text>
    <path d="M36 40 H64" stroke="#f2c94c" stroke-width="3"/><text x="66" y="42" font-size="5.5" font-weight="600" fill="${TINTA}" font-family="Lexend, Verdana, sans-serif">marca</text>
    <rect x="86" y="18" width="4" height="64" fill="#f7e27a" stroke="${TINTA}" stroke-width="0.5"/>${regle}
    ${extra}${dashDalt(dx, dy, angle, 1)}</svg>`;
}
function escenaScratch(extra) {
  return `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <rect x="8" y="14" width="84" height="64" rx="3" fill="#ffffff" stroke="${TINTA}" stroke-width="1.4"/>
    <rect x="8" y="38" width="84" height="18" fill="#c9ced6"/><path d="M12 47 H88" stroke="#ffffff" stroke-width="1.6" stroke-dasharray="5 4"/>
    <rect x="62" y="36" width="9" height="22" fill="#ec2027"/>
    <g transform="translate(20 42)"><rect x="0" y="0" width="16" height="9" rx="2.5" fill="#4c97ff" stroke="${TINTA}" stroke-width="1"/><circle cx="4" cy="10" r="2.2" fill="${TINTA}"/><circle cx="12" cy="10" r="2.2" fill="${TINTA}"/></g>
    <g transform="translate(84 40)"><path d="M0 0 V16" stroke="${TINTA}" stroke-width="1.2"/><path d="M0 0 L7 2.5 L0 5Z" fill="#49b749"/></g>${extra || ''}</svg>`;
}
function pilaBlocs(blocs) {
  /* blocs: [[cat, text, sagnat]] → una pila de blocs, un sota l'altre */
  let y = 0, s = '';
  blocs.forEach(([cat, text, sag]) => {
    const b = blocSVG(cat, text).replace('<svg ', `<svg x="${(sag || 0) * 14}" y="${y}" width="${Math.min(100 - (sag || 0) * 14, 8 + text.length * 2.2)}" height="10" preserveAspectRatio="xMinYMid meet" `);
    s += b; y += 11;
  });
  return s;
}
Object.assign(IL, {
  'ozo-cruilla': cruilla('', true),
  'ozo-cruilla-codi': cruilla('GKR', true),
  'ozo-cruilla-revers': cruilla('RKG', false),
  'spike-parada': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <g transform="translate(6 16) scale(0.5)">${pecaSVG('hub').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
    <g transform="translate(46 16) scale(0.5)">${pecaSVG('motor').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
    <g transform="translate(26 56) scale(0.5)">${pecaSVG('sensor').replace(/^<svg[^>]*>|<\/svg>$/g, '')}</g>
    <rect x="70" y="62" width="16" height="10" rx="2" fill="#1183c6" stroke="${TINTA}" stroke-width="1"/>
    <text x="78" y="82" text-anchor="middle" font-size="6" font-weight="600" fill="${TINTA}" font-family="Lexend, Verdana, sans-serif">tiquet</text></svg>`,
  'spike-tiquet-lluny': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <g transform="translate(4 32) scale(0.55)">${pecaSVG('sensor').replace(/^<svg[^>]*>|<\/svg>$/g, '').replace(/<path d="M64 35 H86"[^>]*\/><rect x="86"[^>]*\/>/, '')}</g>
    <rect x="76" y="40" width="16" height="12" rx="2" fill="#1183c6" stroke="${TINTA}" stroke-width="1"/>
    <path d="M44 51 H72" stroke="${TINTA}" stroke-width="1" stroke-dasharray="2 2"/><text x="58" y="47" text-anchor="middle" font-size="6" fill="${TINTA}" font-family="Lexend, Verdana, sans-serif">lluny</text></svg>`,
  'scottie-programa': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    ${programaScottie([[['BEGIN', 'inici']], [['STEP'], ['3', 'num']], [['TURN TO THE RIGHT']], [['STEP'], ['2', 'num']], [['END', 'inici']]], 14, 10, 14.5)}</svg>`,
  'scottie-tauleta': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <rect x="22" y="6" width="56" height="34" rx="4" fill="#2b3440"/><rect x="25" y="9" width="50" height="28" rx="2" fill="#dfe8ef"/><circle cx="50" cy="7.6" r="0.9" fill="#9aa3ad"/>
    <path d="M30 40 L18 56 M70 40 L82 56" stroke="#5b6470" stroke-width="0.9" stroke-dasharray="2.5 2"/>
    <rect x="16" y="56" width="68" height="40" rx="2" fill="#ffffff" stroke="${TINTA}" stroke-width="1"/>
    ${programaScottie([[['BEGIN', 'inici']], [['STEP'], ['2', 'num']], [['END', 'inici']]], 30, 59, 10.5)}</svg>`,
  'scottie-curt': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    ${programaScottie([[['STEP']], [['STEP']], [['STEP']]], 6, 26, 13)}
    <text x="51" y="51" text-anchor="middle" font-size="12" font-weight="700" fill="${TINTA}" font-family="Lexend, Verdana, sans-serif">=</text>
    ${programaScottie([[['STEP'], ['3', 'num']]], 58, 39, 13)}</svg>`,
  'scottie-gira': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <rect x="16" y="9" width="68" height="82" rx="2.5" fill="#ffffff" stroke="${TINTA}" stroke-width="1.4"/>
    <path d="M16 36 H84 M16 63 H84 M38.7 9 V91 M61.3 9 V91" stroke="#c9ced6" stroke-width="0.9"/>
    <g transform="translate(50 49.5)"><circle r="9" fill="#ffffff" stroke="${TINTA}" stroke-width="1.2"/><path d="M-4 3 L0 9 L4 3 Z" fill="${TINTA}"/></g>
    <path d="M40 58 Q30 64 27 74" fill="none" stroke="#2c7650" stroke-width="2.2" stroke-linecap="round"/><path d="M23 71 L27 77 L31 71" fill="none" stroke="#2c7650" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/>
    <text x="27" y="86" text-anchor="middle" font-size="6" font-weight="700" fill="#2c7650" font-family="Lexend, Verdana, sans-serif">la seva dreta</text>
    <text x="50" y="20" text-anchor="middle" font-size="6" font-weight="600" fill="${TINTA}" font-family="Lexend, Verdana, sans-serif">mira cap a tu</text></svg>`,
  'scottie-xoca': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <rect x="16" y="9" width="68" height="82" rx="2.5" fill="#ffffff" stroke="${TINTA}" stroke-width="1.4"/>
    <path d="M16 36 H84 M16 63 H84 M38.7 9 V91 M61.3 9 V91" stroke="#c9ced6" stroke-width="0.9"/>
    <path d="M27 77 V50 H50" fill="none" stroke="#1183c6" stroke-width="2" stroke-dasharray="3 2.5"/>
    <path d="M64 41 Q66 34 72 35 Q79 34 80 41 Q81 48 74 50 Q66 51 64 45 Z" fill="#9aa3ad" stroke="${TINTA}" stroke-width="1"/>
    <g transform="translate(55 49.5)"><circle r="7" fill="#ffffff" stroke="${TINTA}" stroke-width="1.2"/><path d="M3 -3.5 L8 0 L3 3.5 Z" fill="${TINTA}"/></g>
    <text x="72" y="62" text-anchor="middle" font-size="9" font-weight="700" fill="#ec2027" font-family="Lexend, Verdana, sans-serif">!</text></svg>`,
  'dash-pista': escenaDash('', 50, 74, 0),
  'dash-connecta': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <rect x="8" y="22" width="44" height="30" rx="4" fill="#2b3440"/><rect x="11" y="25" width="38" height="24" rx="2" fill="#dfe8ef"/>
    <rect x="15" y="29" width="22" height="6" rx="2" fill="#2fd08c"/><rect x="17" y="37" width="26" height="6" rx="2" fill="#20b8b0"/>
    <path d="M56 40 Q62 34 68 40 M53 44 Q62 28 71 44" fill="none" stroke="#1183c6" stroke-width="1.6" stroke-linecap="round"/>
    ${dashDalt(78, 64, 0, 1.2)}</svg>`,
  'dash-passa': escenaDash('', 50, 30, 0),
  'dash-marca': escenaDash('', 50, 44, 0),
  'dash-volta': escenaDash(`<path d="M44 66 V38 Q44 28 50 28 Q56 28 56 38 V66" fill="none" stroke="#1183c6" stroke-width="2" stroke-dasharray="3 2.5"/><path d="M52.5 62 L56 68 L59.5 62" fill="none" stroke="#1183c6" stroke-width="2" stroke-linejoin="round"/>`, 50, 74, 0),
  'scratch-vehicle': escenaScratch(''),
  'scratch-marcador': escenaScratch(`<rect x="12" y="18" width="30" height="10" rx="2" fill="#ffffff" stroke="#9aa3ad" stroke-width="0.8"/><text x="15" y="25.5" font-size="5.5" fill="${TINTA}" font-family="Lexend, Verdana, sans-serif">punts</text><rect x="31" y="19.5" width="9" height="7" rx="2" fill="#ff8c1a"/><text x="35.5" y="25" text-anchor="middle" font-size="5.5" font-weight="600" fill="#fff" font-family="Lexend, Verdana, sans-serif">3</text>`),
  'scratch-sense-persempre': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <g transform="translate(8 26)">${pilaBlocs([['events', 'quan la {bandera} es cliqui', 0], ['control', 'si ⟨ tocant el color [vermell]? ⟩ llavors', 0], ['motion', 'ves a x: [0] y: [0]', 1]])}</g></svg>`,
  'scratch-sense-zero': `<svg viewBox="0 0 100 100" aria-hidden="true"><rect width="100" height="100" rx="6" fill="#f3eee4"/>
    <g transform="translate(8 26)">${pilaBlocs([['events', 'quan la {bandera} es cliqui', 0], ['control', 'per sempre', 0], ['control', 'si ⟨ tocant el color [verd]? ⟩ llavors', 1], ['variables', 'augmenta [punts] en [1]', 2]])}</g></svg>`
});
