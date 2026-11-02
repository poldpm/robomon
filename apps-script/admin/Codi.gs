/**
 * ============================================================
 *  CODI.gs — ADMINISTRADOR (només el mestre)
 *  Projecte VINCULAT al full «ROBOMON-DADES» (Extensions → Apps Script).
 *  Desplegament: Aplicació web · Executa com: JO · Accés: NOMÉS JO
 * ============================================================
 */

var GRUPS = ['G1', 'G2', 'G3', 'G4', 'GP'];   // GP = grup de proves (alumnes A901–A906)

function onOpen() {
  SpreadsheetApp.getUi().createMenu('RoboMón')
    .addItem('Instal·la o repara el full', 'installa')
    .addItem('Genera els ID d\'alumnes que falten', 'generaIds')
    .addItem('Recalcula les notes', 'recalculaNotes')
    .addItem('Prepara l\'informe', 'preparaInforme')
    .addItem('Actualitza des de GitHub', 'actualitzaDesDeGitHub')
    .addSeparator()
    .addItem('Esborra les dades del curs…', 'esborraCurs')
    .addToUi();
}

function doGet(e) {
  var qui = identitatMestre_();
  if (!qui.ok) return paginaNoMestre_(qui);
  var vista = e && e.parameter && e.parameter.vista;
  var t = HtmlService.createTemplateFromFile(vista === 'projeccio' ? 'Projeccio' : 'Admin');
  t.urlAdmin = JSON.stringify(ScriptApp.getService().getUrl()).replace(/</g, '\\u003c');
  t.avis = JSON.stringify(qui.verificat ? '' : 'sense-correu');
  return t.evaluate()
    .setTitle(vista === 'projeccio' ? 'RoboMón · Projecció' : 'RoboMón · Administrador')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/**
 * Qui obre l'administrador?
 * · Si Google ens dona el correu (actiu), ha de ser el del mestre.
 * · Si NO ens el dona (passa, per exemple, amb scripts d'unitats compartides), confiem en el desplegament:
 *   amb «Qui hi té accés: Només jo», Google ja no deixa entrar ningú més. El tauler ho avisa amb una franja.
 */
function identitatMestre_() {
  var actiu = '', efectiu = '';
  try { actiu = String(Session.getActiveUser().getEmail() || '').toLowerCase().trim(); } catch (e) { actiu = ''; }
  try { efectiu = String(Session.getEffectiveUser().getEmail() || '').toLowerCase().trim(); } catch (e) { efectiu = ''; }
  var cfg = {};
  try { cfg = config_(); } catch (e) { cfg = {}; }
  var mestre = String(cfg.correu_mestre || '').toLowerCase().trim();
  if (!actiu) return { ok: true, verificat: false, actiu: '', efectiu: efectiu, mestre: mestre };
  var ok = actiu === efectiu || (!!mestre && actiu === mestre);
  return { ok: ok, verificat: ok, actiu: actiu, efectiu: efectiu, mestre: mestre };
}

function esMestre_() { return identitatMestre_().ok; }

function paginaNoMestre_(qui) {
  var esc = function (t) { return String(t || '—').replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  return HtmlService.createHtmlOutput(
    '<div style="font:20px/1.5 Verdana,sans-serif;max-width:720px;margin:40px auto;color:#1c2733">' +
    '<p><b>Aquesta pàgina és només per al mestre.</b></p>' +
    '<p>Compte que obre la pàgina: ' + esc(qui.actiu) + '<br>Compte que ha desplegat l\'script: ' + esc(qui.efectiu) +
    '<br>Mestre configurat (CONFIG → correu_mestre): ' + esc(qui.mestre) + '</p>' +
    '<p>Si el primer i el segon no coincideixen, obre l\'enllaç amb el compte que ha desplegat l\'script ' +
    '(o tanca la sessió dels altres comptes del navegador).</p></div>').setTitle('RoboMón');
}

/** L'única porta d'entrada des del navegador del mestre. */
function api(accio, args) {
  args = args || {};
  if (!esMestre_()) return { ok: false, motiu: 'identitat' };
  try {
    var r;
    switch (accio) {
      case 'inici':         r = inici_(); break;
      case 'obreSessio':    r = obreSessio_(args.grup, args.sessio); break;
      case 'canviaEstat':   r = canviaEstat_(args.grup, args.sessio, args.estat); break;
      case 'refaEquips':    r = refaEquips_(args.grup, args.sessio); break;
      case 'tauler':        r = tauler_(args.grup, args.sessio); break;
      case 'valida':        r = valida_(args.id, args.sessio, args.que); break;
      case 'notes':         r = notes_(args.grup); break;
      case 'ajusta':        r = ajusta_(args.id, args.sessio, args.ajust, args.observacio); break;
      case 'missions':      r = missionsEditor_(args.sessio); break;
      case 'desaMissions':  r = desaMissions_(args.sessio, args.files); break;
      case 'restauraMissio': r = restauraMissio_(args.sessio); break;
      case 'configura':     r = configura_(args.clau, args.valor); break;
      case 'reiniciaPin':   r = reiniciaPin_(args.id); break;
      case 'projeccio':     r = projeccio_(); break;
      case 'informe':       r = preparaInforme(args.grup); break;
      case 'actualitza':    r = actualitza_(); break;
      case 'estatVersio':   r = estatVersio_(); break;
      default: return { ok: false, motiu: 'accio' };
    }
    return { ok: true, dades: r };
  } catch (err) {
    registraError_('admin:' + accio, err);
    return { ok: false, motiu: 'error', missatge: String(err && err.message || err) };
  }
}

// ============================================================
//  INSTAL·LACIÓ (idempotent: es pot repetir sense perdre res)
// ============================================================

function installa() {
  var ss = full_();
  Object.keys(FULLS).forEach(function (nom) {
    var p = ss.getSheetByName(nom) || ss.insertSheet(nom);
    var cap = FULLS[nom];
    var actual = p.getLastColumn() ? p.getRange(1, 1, 1, Math.max(p.getLastColumn(), 1)).getValues()[0].map(String) : [];
    if (!actual.join('')) {
      p.getRange(1, 1, 1, cap.length).setValues([cap]).setFontWeight('bold');
      p.setFrozenRows(1);
    } else {
      var falten = cap.filter(function (c) { return actual.indexOf(c) < 0; });
      if (falten.length) p.getRange(1, actual.length + 1, 1, falten.length).setValues([falten]).setFontWeight('bold');
    }
  });
  // Text pla on hi ha codis que el full podria convertir en números o dates
  pestanya_('ALUMNES').getRange('A:H').setNumberFormat('@');
  pestanya_('CALENDARI').getRange('F:F').setNumberFormat('@');

  sembraConfig_();
  sembraMon_();
  sembraCalendari_();
  sembraAlumnesProva_();
  sembraMissions_();
  ['config', 'missions', 'mon'].forEach(oblidaCache_);
  try { SpreadsheetApp.getUi().alert('Full a punt. Pestanyes: ' + Object.keys(FULLS).join(', ')); } catch (e) { /* sense interfície */ }
  return true;
}

function sembraConfig_() {
  var d = llegeix_('CONFIG');
  var existents = d.files.map(function (f) { return String(f[0]); });
  var correu = '';
  try { correu = Session.getEffectiveUser().getEmail(); } catch (e) { correu = ''; }
  var defecte = [
    ['correu_mestre', correu, 'El teu correu. Només aquest compte veu el mode prova del món.'],
    ['pesos', JSON.stringify(PESOS_DEFECTE), 'Puntuació de cada nivell (docs/PLA-TALLER-3r.md, secció 7.3). Hereu de PESOS de la v3.'],
    ['fita_pct', 80, 'Fita de grup: percentatge de presents que han d\'arribar a N2.'],
    ['noms_generics', 'no', '«sí» = el mapa diu Zona 1, Zona 2… (prova que la ficció no aguanta res).'],
    ['mostra_codi', 'no', '«sí» = la projecció mostra el codi de classe (Pla B).'],
    ['url_mon', '', 'URL del desplegament del Món (per tenir-la a mà al tauler).'],
    ['sal', Utilities.getUuid(), 'No la canviïs: si la canvies, els PIN deixen de funcionar.']
  ];
  var nous = defecte.filter(function (r) { return existents.indexOf(r[0]) < 0; });
  afegeixFiles_('CONFIG', nous);
}

function sembraMon_() {
  if (llegeix_('MON').files.length) return;
  afegeixFiles_('MON', [
    ['Z1', 'Illa Rodona',        '#F6C85F', 'casa'],
    ['Z2', 'Illa dels Pins',     '#8CCB7E', 'pins'],
    ['Z3', 'Illa Llarga',        '#F4A6A6', 'barraca'],
    ['Z4', 'Illa del Pont',      '#9EC5F0', 'pont'],
    ['Z5', 'Illa de les Roques', '#C9B6E4', 'roques'],
    ['Z6', 'Illeta',             '#FFD8A8', 'flor'],
    ['Z7', 'Illa dels Estels',   '#F7E07A', 'estel'],
    ['Z8', 'Illa de la Torre',   '#A8DDD3', 'torre'],
    ['Z9', 'Illa Gran',          '#E9B98F', 'muntanya']
  ]);
}

function sembraCalendari_() {
  var d = llegeix_('CALENDARI');
  var existents = {};
  d.files.forEach(function (f) { existents[f[0] + '·' + f[1]] = true; });
  var nous = [];
  GRUPS.forEach(function (g) {
    ORDRE_SESSIONS.forEach(function (s) {
      if (!existents[g + '·' + s]) nous.push([g, s, '', 'pendent', '', '', '']);
    });
  });
  afegeixFiles_('CALENDARI', nous);
}

function sembraAlumnesProva_() {
  var d = llegeix_('ALUMNES');
  var ids = d.files.map(function (f) { return String(f[0]); });
  var noms = ['Prova Anna', 'Prova Biel', 'Prova Carla', 'Prova Dani', 'Prova Èlia', 'Prova Ferran'];
  var nous = [];
  noms.forEach(function (n, i) {
    var id = 'A90' + (i + 1);
    if (ids.indexOf(id) < 0) nous.push([id, '', 'GP', n, n, '', '', 'sí']);
  });
  afegeixFiles_('ALUMNES', nous);
}

/** Missions per defecte. Només se sembren les sessions que no tenen cap fila a MISSIONS. */
function missionsPerDefecte_() {
  var P = 'publicada', E = 'esborrany';
  var f = {};
  // sessio, tipus, clau, ordre, text, imatge, opcions, correcta, estat
  f.S1 = [
    ['S1', 'missio',  'titol',     1, 'Primers codis', '', '', '', P],
    ['S1', 'missio',  'frase',     2, 'Pinta codis de colors perquè l\'Ozobot faci el que tu vols.', '', '', '', P],
    ['S1', 'missio',  'xuleta',    3, 'ozobot', '', '', '', P],
    ['S1', 'abans',   'pla-n2',    4, 'Abans de pintar la casella 2: quin d\'aquests és el codi de la teva missió? Mira la xuleta («Codis»).', '',
      'tornado|Vermell · Verd · Vermell · Verd|codi:RGRG;zigazaga|Blau · Negre · Verd · Vermell|codi:BKGR;turbo|Blau · Verd · Blau|codi:BGB', '', P],
    ['S1', 'control', 'c0',        5, 'Calibra l\'Ozobot: al cercle negre, mantén el botó fins que faci llum blanca i deixa\'l anar. Al final fa llum verda?', 'ozo-calibra', '', '', P],
    ['S1', 'nivell',  'n1',        5, 'Pinta el codi LENT a la casella 1. Posa l\'Ozobot a SORTIDA.', 'ozo-casella1', '', '', P],
    ['S1', 'control', 'n1',        6, 'Després de la casella 1, l\'Ozobot va més a poc a poc?', 'ozo-casella1', '', '', P],
    ['S1', 'nivell',  'n2',        7, 'Pinta el codi de la teva missió a la casella 2. Ensenya-ho al mestre i explica com l\'has triat.', 'mestre', '', '', P],
    ['S1', 'nivell',  'n3',        8, 'Agafa una carta de repte i pinta la casella 3.', 'carta', '', '', P],
    ['S1', 'encallat', 'nollegeix', 9, 'No fa cas del codi', 'codi-forat',
      'Mira el codi: els colors en l\'ordre de la xuleta, en el sentit de la fletxa, enganxats i sense blanc entremig.', 'codi-be', P],
    ['S1', 'encallat', 'torna',   10, 'Torna enrere', 'ozo-buit',
      'És normal: quan la casella següent és buida, l\'Ozobot hi arriba i fa mitja volta. Pinta-la quan toqui.', 'ozo-buit', P],
    ['S1', 'encallat', 'perd',    11, 'Es perd a la línia', 'e-perd',
      'Torna a calibrar-lo: al cercle negre, mantén el botó fins que faci llum blanca. Ha d\'acabar fent llum verda. Si fa llum vermella, torna-hi.', 'ozo-calibra', P],
    ['S1', 'encallat', 'nose',    12, 'No sé quin codi és', 'e-nose',
      'Prem «Codis» i busca la teva missió. Copia els colors d\'esquerra a dreta, com diu la fletxa.', 'codi-be', P],
    ['S1', 'sortida', 'diag',     13, 'L\'Ozobot passa per aquest codi i no fa res. Per què?', 'codi-forat',
      'a|Hi ha blanc entre els colors|;b|El codi és massa curt|;c|Té massa colors|', 'a', P],
    ['S1', 'sortida', 'eina',     14, 'Quin codi fa anar l\'Ozobot a TURBO?', '',
      'a|' + 'Blau · Verd · Blau' + '|codi:BGB;b|Vermell · Negre · Vermell|codi:RKR;c|Verd · Negre · Verd|codi:GKG', 'a', P],
    ['S1', 'variant', 'A',        15, 'Tornado', '', '', '', P],
    ['S1', 'variant', 'B',        16, 'Ziga-zaga', '', '', '', P],
    ['S1', 'variant', 'C',        17, 'Turbo', '', '', '', P]
  ];
  f.S2 = [
    ['S2', 'missio',  'titol',  1, 'Programa amb cartes', '', '', '', P],
    ['S2', 'missio',  'frase',  2, 'Fes el programa amb cartes, escaneja\'l amb la tauleta i porta el Scottie on toca.', '', '', '', P],
    ['S2', 'missio',  'xuleta', 3, 'scottie', '', '', '', P],
    ['S2', 'control', 'c0',     4, 'Tens l\'app Scottie Go! oberta al repte que toca i les cartes a la taula?', 'scottie-tauleta', '', '', P],
    ['S2', 'nivell',  'n1',     5, 'Fes el programa del repte amb cartes: BEGIN a dalt i END a baix. Escaneja\'l amb la tauleta.', 'scottie-programa', '', '', P],
    ['S2', 'control', 'n1',     6, 'El Scottie arriba on havia d\'arribar?', 'scottie-programa', '', '', P],
    ['S2', 'abans',   'pla-n2', 7, 'Abans de fer el teu repte: el Scottie ha d\'avançar 3 caselles. Quin programa és el més curt?', '',
      'num|STEP i el número 3|prog:STEP+3;tres|STEP, STEP, STEP|prog:STEP,STEP,STEP;gira|TURN TO THE RIGHT i STEP|prog:TURN TO THE RIGHT,STEP', '', P],
    ['S2', 'nivell',  'n2',     8, 'Fes el teu repte amb 3 estrelles: el programa més curt, amb números en lloc de cartes repetides. Ensenya-ho i explica què fa el número.', 'scottie-curt', '', '', P],
    ['S2', 'nivell',  'n3',     9, 'Fes un repte on calgui REPEAT: repeteix un tros del programa i tanca\'l amb END IF / REPEAT.', 'carta:REPEAT|control', '', '', P],
    ['S2', 'encallat', 'escaneja', 10, 'La tauleta no llegeix les cartes', 'scottie-tauleta',
      'Cartes planes i en una columna, de BEGIN a END. Que surtin totes a la foto. Busca més llum i no facis ombra.', 'scottie-tauleta', P],
    ['S2', 'encallat', 'gira',  11, 'Gira cap a l\'altre costat', 'scottie-gira',
      'La dreta és la del Scottie. Posa\'t al seu lloc: cap on mira? Llavors, quina és la seva dreta?', 'scottie-gira', P],
    ['S2', 'encallat', 'xoca',  12, 'No arriba o xoca', 'scottie-xoca',
      'Compta les caselles amb el dit, pas a pas. Cada gir és una carta. Mira on s\'atura i canvia aquella carta.', 'scottie-xoca', P],
    ['S2', 'encallat', 'nose',  13, 'No sé què he de fer', 'e-nose',
      'BEGIN a dalt. Després una carta per cada moviment: STEP per avançar, TURN per girar. END a baix.', 'scottie-programa', P],
    ['S2', 'sortida', 'diag',   14, 'El Scottie mira cap a tu. Poses TURN TO THE RIGHT i gira cap a la teva esquerra. Per què?', 'scottie-gira',
      'a|Gira cap a la seva dreta, no cap a la teva|scottie-gira;b|La carta està mal impresa|carta:TURN TO THE RIGHT;c|La tauleta s\'ha equivocat|scottie-tauleta', 'a', P],
    ['S2', 'sortida', 'eina',   15, 'Quin programa fa el mateix que STEP, STEP, STEP, STEP?', '',
      'a|STEP i el número 4|prog:STEP+4;b|STEP i el número 3|prog:STEP+3;c|REPEAT i STEP|prog:REPEAT,STEP', 'a', P],
    ['S2', 'variant', 'A', 16, 'Tu fas el programa del 1r repte', '', '', '', P],
    ['S2', 'variant', 'B', 17, 'Tu fas el programa del 2n repte', '', '', '', P],
    ['S2', 'variant', 'C', 18, 'Tu fas el programa del 3r repte', '', '', '', P]
  ];
  f.S3 = [
    ['S3', 'missio',  'titol',  1, 'El teu circuit', '', '', '', P],
    ['S3', 'missio',  'frase',  2, 'Dibuixa un circuit amb una cruïlla. Fes que l\'Ozobot triï el camí que tu vols.', '', '', '', P],
    ['S3', 'missio',  'xuleta', 3, 'ozobot-cruilla', '', '', '', P],
    ['S3', 'control', 'c0',     4, 'Calibra l\'Ozobot al cercle negre. Al final fa llum verda?', 'ozo-calibra', '', '', P],
    ['S3', 'nivell',  'n1',     5, 'Dibuixa un circuit amb una cruïlla en forma de T. Línia de 5 mm i angles rectes.', 'ozo-cruilla', '', '', P],
    ['S3', 'control', 'n1',     6, 'L\'Ozobot arriba a la cruïlla sense perdre\'s?', 'ozo-cruilla', '', '', P],
    ['S3', 'abans',   'pla-n2', 7, 'Abans de pintar: quin codi farà anar l\'Ozobot cap a la teva meta? Mira la xuleta («Codis»).', '',
      'esquerra|Verd · Negre · Vermell|codi:GKR;recte|Blau · Negre · Vermell|codi:BKR;dreta|Blau · Vermell · Verd|codi:BRG', '', P],
    ['S3', 'nivell',  'n2',     8, 'Pinta el codi abans de la cruïlla. L\'Ozobot ha d\'anar a la teva meta 3 vegades seguides. Ensenya-ho al mestre.', 'ozo-cruilla-codi', '', '', P],
    ['S3', 'nivell',  'n3',     9, 'Agafa una carta de repte: un circuit amb dues cruïlles.', 'carta', '', '', P],
    ['S3', 'encallat', 'atzar', 10, 'A la cruïlla va on vol', 'ozo-cruilla',
      'Sense codi, a la cruïlla l\'Ozobot tria a l\'atzar. Pinta el codi de direcció abans de la cruïlla, a uns 3 cm.', 'ozo-cruilla-codi', P],
    ['S3', 'encallat', 'nollegeix', 11, 'No fa cas del codi', 'codi-forat',
      'Colors en l\'ordre de la xuleta, en el sentit de la fletxa, enganxats i sense blanc entremig.', 'codi-be', P],
    ['S3', 'encallat', 'perd',  12, 'Es perd a la cruïlla', 'e-perd',
      'Fes la cruïlla amb angles rectes, com una T. Línies de 5 mm i sense forats. Torna a calibrar-lo.', 'ozo-cruilla', P],
    ['S3', 'encallat', 'nose',  13, 'No sé què he de fer', 'e-nose',
      'Primer, una línia amb una T. Després, el codi de la teva meta just abans de la T.', 'ozo-cruilla-codi', P],
    ['S3', 'sortida', 'diag',   14, 'L\'Ozobot passa pel codi però a la cruïlla va a l\'atzar. Per què?', 'ozo-cruilla-revers',
      'a|El codi està pintat en l\'altre sentit|;b|La cruïlla és massa gran|;c|L\'Ozobot va massa a poc a poc|', 'a', P],
    ['S3', 'sortida', 'eina',   15, 'Quin codi fa girar l\'Ozobot a la dreta a la cruïlla?', '',
      'a|Blau · Vermell · Verd|codi:BRG;b|Verd · Negre · Vermell|codi:GKR;c|Blau · Negre · Vermell|codi:BKR', 'a', P],
    ['S3', 'variant', 'A', 16, 'Meta a l\'esquerra', '', '', '', P],
    ['S3', 'variant', 'B', 17, 'Meta recte', '', '', '', P],
    ['S3', 'variant', 'C', 18, 'Meta a la dreta', '', '', '', P]
  ];
  f.S4 = [
    ['S4', 'missio',  'titol',  1, 'Arriba a la marca', '', '', '', P],
    ['S4', 'missio',  'frase',  2, 'Programa el Dash perquè s\'aturi just a la teva marca.', '', '', '', P],
    ['S4', 'missio',  'xuleta', 3, 'dash', '', '', '', P],
    ['S4', 'abans',   'prediccio', 4, 'Abans de provar: amb «Forward 50», on s\'aturarà el Dash?', 'dash-pista',
      'abans|Abans de la meva marca|;marca|Just a la meva marca|;despres|Després de la meva marca|', '', P],
    ['S4', 'control', 'c0',     5, 'El Dash està encès i connectat al Blockly?', 'dash-connecta', '', '', P],
    ['S4', 'nivell',  'n1',     6, 'Posa el Dash a la sortida. Programa «When Start» i «Forward 50». Prem Start i mira on s\'atura.', 'dash-pista', '', '', P],
    ['S4', 'control', 'n1',     7, 'El Dash avança i s\'atura?', 'dash-pista', '', '', P],
    ['S4', 'nivell',  'n2',     8, 'Canvia el número perquè el Dash s\'aturi just a la teva marca. Ensenya-ho i explica quin número has posat i per què.', 'dash-marca', '', '', P],
    ['S4', 'nivell',  'n3',     9, 'Ves a la teva marca, fes mitja volta i torna a la sortida.', 'dash-volta', '', '', P],
    ['S4', 'encallat', 'connecta', 10, 'No es connecta', 'dash-connecta',
      'Encén el Dash amb el botó de dalt. Al Blockly, toca el robot i tria el teu Dash pel nom. Només una tauleta per Dash.', 'dash-connecta', P],
    ['S4', 'encallat', 'nofa',  11, 'Premo Start i no fa res', 'bloc:dash-start|When [Start]',
      'El primer bloc ha d\'anar enganxat just a sota de «When Start». Si està solt, no fa res.', 'bloc:dash-start|When [Start]', P],
    ['S4', 'encallat', 'passa', 12, 'Es passa o no arriba', 'dash-passa',
      'Mesura amb la cinta quants centímetres falten o sobren. Si es passa, posa un número més petit. Si no arriba, més gran.', 'bloc:dash-drive|Forward [50] [normal]', P],
    ['S4', 'encallat', 'nose',  13, 'No sé què he de fer', 'e-nose',
      'Primer «When Start». A sota, «Forward» amb un número: són centímetres. Prem Start.', 'dash-pista', P],
    ['S4', 'sortida', 'diag',   14, 'El Dash s\'atura 10 cm abans de la marca. Què has de canviar?', 'dash-pista',
      'a|Posar 10 més al número de Forward|bloc:dash-drive|Forward [60] [normal];b|Posar «fast» en lloc de «normal»|bloc:dash-drive|Forward [50] [fast];c|Afegir «Turn Right 90»|bloc:dash-drive|Turn Right [90]', 'a', P],
    ['S4', 'sortida', 'eina',   15, 'Quin bloc fa que el Dash faci mitja volta?', '',
      'a|Turn Right 180|bloc:dash-drive|Turn Right [180];b|Turn Right 90|bloc:dash-drive|Turn Right [90];c|Backward 50|bloc:dash-drive|Backward [50] [normal]', 'a', P],
    ['S4', 'variant', 'A', 16, 'Marca a 40 cm', '', '', '', P],
    ['S4', 'variant', 'B', 17, 'Marca a 70 cm', '', '', '', P],
    ['S4', 'variant', 'C', 18, 'Marca a 90 cm', '', '', '', P]
  ];
  f.S5 = [
    ['S5', 'missio',  'titol',  1, 'Munta i modifica', '', '', '', P],
    ['S5', 'missio',  'frase',  2, 'Munta la parada Snack Stand i fes que serveixi quan vegi el teu color.', '', '', '', P],
    ['S5', 'missio',  'xuleta', 3, 'spike', '', '', '', P],
    ['S5', 'control', 'c0',     4, 'Tens la parada muntada, el hub encès i connectat a la tauleta?', 'spike-parada', '', '', P],
    ['S5', 'nivell',  'n1',     5, 'Fes el primer repte de la lliçó Snack Stand: quan el sensor veu el tiquet blau, la parada serveix.', 'spike-parada', '', '', P],
    ['S5', 'control', 'n1',     6, 'Quan acostes el tiquet blau al sensor, el motor serveix?', 'spike-parada', '', '', P],
    ['S5', 'abans',   'pla-n2', 7, 'Abans de canviar el programa: quin bloc has de canviar perquè reaccioni al teu color?', '',
      'sensor|El del sensor de color|peca:sensor;motor|El del motor|peca:motor;hub|El del hub|peca:hub', '', P],
    ['S5', 'nivell',  'n2',     8, 'Canvia el programa perquè serveixi amb el teu color. Ensenya-ho i digues quina peça és el sensor, quina el motor i què fa el programa.', 'spike-parada', '', '', P],
    ['S5', 'nivell',  'n3',     9, 'Millora la parada (el tercer repte de l\'app): canvia el model i comprova que encara serveix.', 'carta', '', '', P],
    ['S5', 'encallat', 'muntar', 10, 'No l\'he sabut muntar', 'spike-parada',
      'Torna a les instruccions de l\'app i fes-ho pas a pas. Compara cada pas amb el dibuix: on va el motor? On va el sensor?', 'peca:port', P],
    ['S5', 'encallat', 'connecta', 11, 'No es connecta', 'peca:hub',
      'Prem el botó del hub fins que faci llum. A l\'app, prem «connectar» i acosta la tauleta al hub.', 'peca:hub', P],
    ['S5', 'encallat', 'nofa',  12, 'No fa res amb el color', 'spike-tiquet-lluny',
      'Acosta molt el tiquet al sensor, gairebé tocant. Mira que el cable del sensor estigui ben posat al port.', 'peca:sensor', P],
    ['S5', 'encallat', 'nose',  13, 'No sé què he de fer', 'e-nose',
      'Primer munta la parada amb les instruccions de l\'app. Després fes el primer repte: el tiquet blau.', 'spike-parada', P],
    ['S5', 'sortida', 'diag',   14, 'Ensenyes el tiquet lluny del sensor i la parada no serveix. Per què?', 'spike-tiquet-lluny',
      'a|El sensor no veu el color de tan lluny|peca:sensor;b|El motor és massa petit|peca:motor;c|El hub està massa ple|peca:hub', 'a', P],
    ['S5', 'sortida', 'eina',   15, 'Quina peça veu els colors?', '',
      'a|El sensor de color|peca:sensor;b|El motor|peca:motor;c|El hub|peca:hub', 'a', P],
    ['S5', 'variant', 'A', 16, 'Vermell', '', '', '', P],
    ['S5', 'variant', 'B', 17, 'Groc', '', '', '', P],
    ['S5', 'variant', 'C', 18, 'Verd', '', '', '', P]
  ];
  f.S6 = [
    ['S6', 'missio',  'titol',  1, 'La parada classifica', '', '', '', P],
    ['S6', 'missio',  'frase',  2, 'Millora la teva parada: cada color fa una cosa diferent.', '', '', '', P],
    ['S6', 'missio',  'xuleta', 3, 'spike', '', '', '', P],
    ['S6', 'control', 'c0',     4, 'Tornes a tenir la parada muntada, el hub encès i connectat?', 'spike-parada', '', '', P],
    ['S6', 'abans',   'prediccio', 5, 'Abans de provar: si ensenyes un color que NO has programat, què farà la parada?', '',
      'res|No farà res|peca:sensor;igual|Servirà igual|peca:motor;nose|No ho sé|e-nose', '', P],
    ['S6', 'nivell',  'n1',     6, 'Programa els teus dos colors: amb el primer, el motor gira cap a un costat; amb el segon, cap a l\'altre.', 'spike-parada', '', '', P],
    ['S6', 'control', 'n1',     7, 'Cada color fa girar el motor cap a un costat diferent?', 'spike-parada', '', '', P],
    ['S6', 'nivell',  'n2',     8, 'Prova un color que no has programat. Ensenya-ho al mestre i explica què passa i per què.', 'spike-parada', '', '', P],
    ['S6', 'nivell',  'n3',     9, 'Afegeix un tercer color que faci una altra cosa: un so, o el motor més ràpid.', 'carta', '', '', P],
    ['S6', 'encallat', 'sempre', 10, 'Fa sempre el mateix', 'spike-parada',
      'Cada color necessita el seu bloc del sensor. Mira que cada bloc tingui el color correcte.', 'peca:sensor', P],
    ['S6', 'encallat', 'muntar', 11, 'No l\'he sabut tornar a muntar', 'spike-parada',
      'Instruccions de l\'app, pas a pas. Compara cada pas amb el dibuix.', 'peca:port', P],
    ['S6', 'encallat', 'connecta', 12, 'No es connecta', 'peca:hub',
      'Prem el botó del hub fins que faci llum. A l\'app, prem «connectar» i acosta la tauleta.', 'peca:hub', P],
    ['S6', 'encallat', 'nose',  13, 'No sé què he de fer', 'e-nose',
      'Fes que el primer color mogui el motor cap a un costat. Després copia el bloc i canvia el color i el sentit.', 'spike-parada', P],
    ['S6', 'sortida', 'diag',   14, 'Ensenyes un tiquet lila i la parada no fa res. Per què?', '',
      'a|No hi ha cap bloc per al lila|;b|El sensor està espatllat|;c|El motor està cansat|', 'a', P],
    ['S6', 'sortida', 'eina',   15, 'Què fa que la parada triï què ha de fer?', '',
      'a|El color que veu el sensor|peca:sensor;b|La força del motor|peca:motor;c|La llum del hub|peca:hub', 'a', P],
    ['S6', 'variant', 'A', 16, 'Vermell i groc', '', '', '', P],
    ['S6', 'variant', 'B', 17, 'Groc i verd', '', '', '', P],
    ['S6', 'variant', 'C', 18, 'Verd i vermell', '', '', '', P]
  ];
  f.S7 = [
    ['S7', 'missio',  'titol',  1, 'Circula', '', '', '', P],
    ['S7', 'missio',  'frase',  2, 'Fes un vehicle que es mogui amb les fletxes i torni a la sortida si toca el teu color.', '', '', '', P],
    ['S7', 'missio',  'xuleta', 3, 'scratch-s7', '', '', '', P],
    ['S7', 'control', 'c0',     4, 'Has entrat al teu compte de Scratch i tens un projecte nou obert?', 'scratch-vehicle', '', '', P],
    ['S7', 'nivell',  'n1',     5, 'Dibuixa una carretera amb un obstacle del teu color. Fes que el vehicle es mogui amb les fletxes.', 'scratch-vehicle', '', '', P],
    ['S7', 'control', 'n1',     6, 'El vehicle es mou cap on li dius amb les fletxes?', 'scratch-vehicle', '', '', P],
    ['S7', 'abans',   'pla-n2', 7, 'Abans de programar: quin bloc farà tornar el vehicle quan toqui el teu color?', '',
      'si|si … llavors|bloc:control|si ⟨ ⟩ llavors;tecla|quan la tecla es premi|bloc:events|quan la tecla [fletxa dreta] es premi;suma|suma 10 a x|bloc:motion|suma [10] a x', '', P],
    ['S7', 'nivell',  'n2',     8, 'Si el vehicle toca el teu color, torna a la sortida. Ensenya-ho i explica què fa la tecla i què fa la condició.', 'scratch-vehicle', '', '', P],
    ['S7', 'nivell',  'n3',     9, 'Posa una meta: quan el vehicle hi arriba, diu «Has arribat!».', 'carta', '', '', P],
    ['S7', 'encallat', 'nomou', 10, 'No es mou', 'scratch-vehicle',
      'Cada fletxa necessita el seu bloc «quan la tecla … es premi» amb «suma 10 a x» (o a y) a sota.', 'bloc:motion|suma [10] a x', P],
    ['S7', 'encallat', 'notorna', 11, 'No torna a la sortida', 'scratch-sense-persempre',
      'La condició ha d\'anar dins de «per sempre», sota la bandera. Tria el color exacte amb el comptagotes.', 'bloc:control|per sempre', P],
    ['S7', 'encallat', 'compte', 12, 'No puc entrar a Scratch', 'e-nose',
      'Avisa el mestre: et dirà el teu usuari i la contrasenya.', 'mestre', P],
    ['S7', 'encallat', 'nose',  13, 'No sé què he de fer', 'e-nose',
      'Primer, que el vehicle es mogui amb una fletxa. Mira la xuleta («Codis»).', 'scratch-vehicle', P],
    ['S7', 'sortida', 'diag',   14, 'El vehicle toca el vermell i no torna. Mira el programa. Per què falla?', 'scratch-sense-persempre',
      'a|Falta «per sempre»: la condició només es mira una vegada|bloc:control|per sempre;b|El vermell és massa fosc|;c|El vehicle és massa gran|', 'a', P],
    ['S7', 'sortida', 'eina',   15, 'Quin bloc fa que passi alguna cosa quan prems una tecla?', '',
      'a|quan la tecla es premi|bloc:events|quan la tecla [espai] es premi;b|per sempre|bloc:control|per sempre;c|suma 10 a x|bloc:motion|suma [10] a x', 'a', P],
    ['S7', 'variant', 'A', 16, 'Obstacle vermell', '', '', '', P],
    ['S7', 'variant', 'B', 17, 'Obstacle blau', '', '', '', P],
    ['S7', 'variant', 'C', 18, 'Obstacle lila', '', '', '', P]
  ];
  f.S8 = [
    ['S8', 'missio',  'titol',  1, 'El marcador', '', '', '', P],
    ['S8', 'missio',  'frase',  2, 'Posa un marcador al teu vehicle: una variable que compta.', '', '', '', P],
    ['S8', 'missio',  'xuleta', 3, 'scratch-s8', '', '', '', P],
    ['S8', 'control', 'c0',     4, 'Has obert el teu projecte del vehicle de la setmana passada?', 'scratch-vehicle', '', '', P],
    ['S8', 'nivell',  'n1',     5, 'Crea la variable «punts». Fes que valgui 0 quan cliques la bandera.', 'scratch-marcador', '', '', P],
    ['S8', 'control', 'n1',     6, 'El marcador surt a la pantalla i comença a 0?', 'scratch-marcador', '', '', P],
    ['S8', 'abans',   'pla-n2', 7, 'Abans de programar: on has de posar «augmenta punts en 1»?', '',
      'dins|Dins del «si … llavors» que ho detecta|bloc:control|si ⟨ ⟩ llavors;bandera|Sota la bandera|bloc:events|quan la {bandera} es cliqui;tecla|Sota una tecla|bloc:events|quan la tecla [espai] es premi', '', P],
    ['S8', 'nivell',  'n2',     8, 'Fes que el marcador compti el que diu la teva missió. Ensenya-ho i explica què és una variable.', 'scratch-marcador', '', '', P],
    ['S8', 'nivell',  'n3',     9, 'Rècord: quan arribis a 5 punts, el vehicle diu «Rècord!».', 'carta', '', '', P],
    ['S8', 'encallat', 'nozero', 10, 'No torna a 0', 'scratch-marcador',
      'Posa «assigna a punts el valor 0» just sota la bandera.', 'bloc:variables|assigna a [punts] el valor [0]', P],
    ['S8', 'encallat', 'nocompta', 11, 'No compta', 'scratch-sense-zero',
      '«augmenta punts en 1» ha d\'anar dins del «si … llavors» que detecta la meta o el color.', 'bloc:variables|augmenta [punts] en [1]', P],
    ['S8', 'encallat', 'massa', 12, 'Compta molts cops de cop', 'scratch-sense-zero',
      'Quan sumi el punt, fes que el vehicle torni a la sortida. Si no, el compta molts cops seguits.', 'bloc:motion|ves a x: [0] y: [0]', P],
    ['S8', 'encallat', 'projecte', 13, 'No trobo el meu projecte', 'e-nose',
      'Mira a «Les Meves Coses». Si no hi és, fes un vehicle nou que es mogui amb les fletxes (5 minuts).', 'scratch-vehicle', P],
    ['S8', 'sortida', 'diag',   14, 'Tornes a començar i el marcador no torna a 0. Per què?', 'scratch-marcador',
      'a|Falta «assigna a punts el valor 0» sota la bandera|bloc:variables|assigna a [punts] el valor [0];b|La variable té un nom massa llarg|;c|El vehicle va massa ràpid|', 'a', P],
    ['S8', 'sortida', 'eina',   15, 'Què és una variable?', '',
      'a|Un lloc on el programa guarda un número que pot canviar|;b|Un personatge nou|;c|Un color del fons|', 'a', P],
    ['S8', 'variant', 'A', 16, 'Compta les arribades a la meta', '', '', '', P],
    ['S8', 'variant', 'B', 17, 'Compta els cops que toques el teu color', '', '', '', P],
    ['S8', 'variant', 'C', 18, 'Compta les arribades a la meta', '', '', '', P]
  ];
  f.S9 = [
    ['S9', 'missio',  'titol',  1, 'Missió final', '', '', '', P],
    ['S9', 'missio',  'frase',  2, 'Torna a l\'eina que encara no tens al carnet i aconsegueix-ne el segell.', '', '', '', P],
    ['S9', 'missio',  'xuleta', 3, 'variant', '', '', '', P],
    ['S9', 'control', 'c0',     4, 'Tens la teva eina a punt: encesa, connectada, calibrada o oberta?', 'eina', '', '', P],
    ['S9', 'nivell',  'n1',     5, 'Fes el primer pas de la teva missió (mira «La teva» i la xuleta, al botó «Codis»).', 'eina', '', '', P],
    ['S9', 'control', 'n1',     6, 'La teva eina fa el primer pas?', 'eina', '', '', P],
    ['S9', 'nivell',  'n2',     8, 'Acaba la teva missió. Ensenya-ho i explica com ho has fet.', 'mestre', '', '', P],
    ['S9', 'nivell',  'n3',     9, 'Fes-la més difícil: agafa una carta de repte de la teva eina.', 'carta', '', '', P],
    ['S9', 'encallat', 'eina',  10, 'No recordo com funciona', 'e-nose',
      'Obre «Codis»: hi ha la xuleta de la teva eina. Mira el primer pas.', 'e-nose', P],
    ['S9', 'encallat', 'apunt', 11, 'No s\'encén o no es connecta', 'mestre',
      'Fes-ho com el primer dia: botó d\'encendre, connectar a l\'app i provar-ho. Si no va, demana ajuda.', 'mestre', P],
    ['S9', 'encallat', 'falla', 12, 'Ho he provat i no funciona', 'e-perd',
      'Mira què fa i on s\'equivoca. Canvia una sola cosa i torna-ho a provar.', 'e-perd', P],
    ['S9', 'encallat', 'nose',  13, 'No sé què he de fer', 'e-nose',
      'Llegeix «La teva»: és la teva missió. El primer pas és fer moure l\'eina una mica.', 'mestre', P],
    ['S9', 'sortida', 'diag',   14, 'El robot no fa el que volies. Què fas primer?', '',
      'a|Miro què fa i on s\'equivoca|;b|Ho esborro tot i torno a començar|;c|Ho deixo i faig una altra cosa|', 'a', P],
    ['S9', 'sortida', 'eina',   15, 'Quin grup d\'ordres fa REPETIR en totes les eines?', '',
      'a|REPEAT, Repeat i «per sempre»|;b|STEP, Forward i «suma 10 a x»|;c|BEGIN, When Start i la bandera|', 'a', P],
    ['S9', 'variant', 'scottie', 16, 'Scottie Go! · Un repte amb 3 estrelles fent servir un número', '', '', '', P],
    ['S9', 'variant', 'ozobot',  17, 'Ozobot · A la cruïlla, l\'Ozobot gira a la dreta', '', '', '', P],
    ['S9', 'variant', 'dash',    18, 'Dash · El Dash s\'atura just a 60 cm', '', '', '', P],
    ['S9', 'variant', 'spike',   19, 'SPIKE · La parada serveix només amb el groc', '', '', '', P],
    ['S9', 'variant', 'scratch', 20, 'Scratch · El vehicle torna a la sortida si toca el vermell', '', '', '', P],
    ['S9', 'variant', 'repte',   21, 'Repte final · Fes que dues eines treballin juntes (per exemple, el Dash porta l\'Ozobot)', '', '', '', P]
  ];

  return f;
}

function sembraMissions_() {
  var d = llegeix_('MISSIONS');
  var teFiles = {};
  d.files.forEach(function (r) { teFiles[String(r[0])] = true; });
  var defecte = missionsPerDefecte_();
  var noves = [];
  ORDRE_SESSIONS.forEach(function (s) { if (!teFiles[s]) noves = noves.concat(defecte[s]); });
  afegeixFiles_('MISSIONS', noves);
}

/** Substitueix la missió d'una sessió per la de per defecte (botó de l'administrador). */
function restauraMissio_(sessio) {
  var defecte = missionsPerDefecte_()[sessio];
  if (!defecte) throw new Error('Sessió sense missió per defecte');
  return ambBloqueig_(function () {
    var d = llegeix_('MISSIONS');
    var altres = d.files.filter(function (f) { return String(f[0]) !== sessio; });
    reescriu_(d, altres.concat(defecte));
    oblidaCache_('missions');
    afegeixFiles_('REGISTRE', [[new Date(), '', sessio, 'restaura-missio', '', 'mestre']]);
    return missionsEditor_(sessio);
  });
}

function generaIds() {
  return ambBloqueig_(function () {
    var d = llegeix_('ALUMNES');
    var max = 0;
    d.files.forEach(function (f) {
      var m = /^A(\d{3})$/.exec(String(f[0]));
      if (m && Number(m[1]) < 900) max = Math.max(max, Number(m[1]));
    });
    var fets = 0;
    d.files.forEach(function (f, i) {
      if (!String(f[0]) && (String(f[1]) || String(f[3]))) {
        max++;
        d.pestanya.getRange(i + 2, 1).setValue('A' + ('00' + max).slice(-3));
        if (!String(f[7])) d.pestanya.getRange(i + 2, 8).setValue('sí');
        fets++;
      }
    });
    try { SpreadsheetApp.getUi().alert('ID generats: ' + fets); } catch (e) { /* sense interfície */ }
    return fets;
  });
}

// ============================================================
//  SESSIONS
// ============================================================

function inici_() {
  var cfg = config_();
  var calendari = objectes_('CALENDARI').map(function (c) {
    return { grup: String(c.grup), sessio: String(c.sessio), estat: String(c.estat), data: dataText_(c.data),
             codi: String(c.codi_classe || ''), fusionada: String(c.fusionada_amb || '') };
  });
  var oberta = null;
  calendari.forEach(function (c) { if (c.estat === 'oberta' || c.estat === 'sortida') oberta = c; });
  var missions = {};
  ORDRE_SESSIONS.forEach(function (s) {
    var m = missioDeSessio_(s, true);
    missions[s] = { titol: m ? m.titol : SESSIONS[s].nom, eina: SESSIONS[s].eina,
                    publicada: !!missioDeSessio_(s, false) };
  });
  var alumnes = {};
  objectes_('ALUMNES').forEach(function (a) {
    if (String(a.actiu) === 'no') return;
    var g = String(a.grup);
    alumnes[g] = (alumnes[g] || 0) + 1;
  });
  return { grups: GRUPS, sessions: SESSIONS, ordre: ORDRE_SESSIONS, eines: EINES, calendari: calendari, oberta: oberta,
           missions: missions, alumnes: alumnes, mon: mon_(cfg),
           config: { noms_generics: cfg.noms_generics, mostra_codi: cfg.mostra_codi, fita_pct: cfg.fita_pct, url_mon: String(cfg.url_mon || ''), id_script_mon: String(cfg.id_script_mon || ''),
                     projeccio_mode: String(cfg.projeccio_mode || ''), exemple_correu: String(cfg.exemple_correu || '') } };
}

function dataText_(v) {
  if (!v) return '';
  var d = (v instanceof Date || (v && typeof v.getTime === 'function')) ? v : new Date(v);
  return isNaN(d.getTime()) ? String(v) : textData_(d).slice(0, 10);
}

/** Codi de classe de 4 xifres (Pla B). Cada vegada que obres la sessió, n'hi ha un de nou. */
function nouCodi_(anterior) {
  var c;
  do { c = String(1000 + Math.floor(Math.random() * 9000)); } while (c === String(anterior));
  return c;
}

function obreSessio_(grup, sessio) {
  if (GRUPS.indexOf(grup) < 0 || !SESSIONS[sessio]) throw new Error('Grup o sessió incorrectes');
  return ambBloqueig_(function () {
    var d = llegeix_('CALENDARI');
    var files = d.files.map(function (f) {
      var r = f.slice();
      var estat = String(r[d.idx.estat]);
      if ((estat === 'oberta' || estat === 'sortida') && !(r[0] === grup && r[1] === sessio)) r[d.idx.estat] = 'tancada';
      if (String(r[0]) === grup && String(r[1]) === sessio) {
        r[d.idx.estat] = 'oberta';
        r[d.idx.codi_classe] = nouCodi_(r[d.idx.codi_classe]);
        r[d.idx.obert_des_de] = new Date();
        if (!r[d.idx.data]) r[d.idx.data] = new Date();
      }
      return r;
    });
    if (files.length) d.pestanya.getRange(2, 1, files.length, d.cap.length).setValues(files);
    creaEquipsSiCal_(grup, sessio, false);
    creaFilesProgres_(grup, sessio);
    afegeixFiles_('REGISTRE', [[new Date(), '', sessio, 'obre-sessio', grup, 'mestre']]);
    return inici_();
  });
}

function canviaEstat_(grup, sessio, estat) {
  var valids = ['pendent', 'oberta', 'sortida', 'tancada', 'fusionada'];
  if (valids.indexOf(estat) < 0) throw new Error('Estat incorrecte');
  if (estat === 'oberta') return obreSessio_(grup, sessio);
  return ambBloqueig_(function () {
    var d = llegeix_('CALENDARI');
    d.files.some(function (f, i) {
      if (String(f[0]) === grup && String(f[1]) === sessio) {
        d.pestanya.getRange(i + 2, d.idx.estat + 1).setValue(estat);
        if (estat === 'fusionada') d.pestanya.getRange(i + 2, d.idx.fusionada_amb + 1).setValue('S5');
        return true;
      }
      return false;
    });
    afegeixFiles_('REGISTRE', [[new Date(), '', sessio, 'estat-' + estat, grup, 'mestre']]);
    return inici_();
  });
}

function alumnesDelGrup_(grup) {
  return objectes_('ALUMNES').filter(function (a) { return String(a.grup) === grup && String(a.actiu) !== 'no' && String(a.id_alumne); });
}

function barreja_(llista) {
  var a = llista.slice();
  for (var i = a.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var t = a[i]; a[i] = a[j]; a[j] = t;
  }
  return a;
}

/** Equips automàtics: cada alumne té el seu robot i una variant pròpia dins l'equip. */
function creaEquipsSiCal_(grup, sessio, forca) {
  var d = llegeix_('EQUIPS');
  var existeix = d.files.some(function (f) { return String(f[d.idx.grup]) === grup && String(f[d.idx.sessio]) === sessio; });
  if (existeix && !forca) return;
  var queden = d.files.filter(function (f) { return !(String(f[d.idx.grup]) === grup && String(f[d.idx.sessio]) === sessio); });
  var alumnes = barreja_(alumnesDelGrup_(grup));
  var unitats = SESSIONS[sessio].unitats;
  var m = missioDeSessio_(sessio, true);
  var lletres = m && Object.keys(m.variants).length ? Object.keys(m.variants).sort() : ['A', 'B', 'C'];
  var files = [];
  if (sessio === 'S9') {
    /* Missió final personal: a cadascú, l'eina que encara no té al carnet */
    var progres = objectes_('PROGRES');
    alumnes.forEach(function (a) {
      var eina = einaPerMissioFinal_(carnetDe_(a.id_alumne, progres));
      files.push([clauProgres_(a.id_alumne, sessio), String(a.id_alumne), grup, sessio, EINES[eina] || 'Repte final', eina]);
    });
  } else if (!unitats) {
    alumnes.forEach(function (a, i) {
      files.push([clauProgres_(a.id_alumne, sessio), String(a.id_alumne), grup, sessio, '', lletres[i % lletres.length]]);
    });
  } else {
    var nEquips = Math.min(unitats, Math.max(1, Math.ceil(alumnes.length / 2)));
    var equips = [];
    for (var e = 0; e < nEquips; e++) equips.push([]);
    alumnes.forEach(function (a, i) { equips[i % nEquips].push(a); });
    equips.forEach(function (membres, e) {
      membres.forEach(function (a, k) {
        files.push([clauProgres_(a.id_alumne, sessio), String(a.id_alumne), grup, sessio, 'Robot ' + (e + 1), lletres[k % lletres.length]]);
      });
    });
  }
  // Una sola escriptura (els alumnes llegeixen EQUIPS: mai la deixem buida ni a mitges)
  reescriu_(d, queden.concat(files));
}

/** Reescriu les files de dades d'una pestanya amb UNA crida, omplint amb blancs si n'hi ha menys que abans. */
function reescriu_(dades, files) {
  var amplada = dades.cap.length;
  var n = Math.max(files.length, dades.files.length);
  if (!n) return;
  var buida = [];
  for (var k = 0; k < amplada; k++) buida.push('');
  var tot = [];
  for (var i = 0; i < n; i++) tot.push(i < files.length ? files[i].slice(0, amplada).concat(buida).slice(0, amplada) : buida.slice());
  dades.pestanya.getRange(2, 1, n, amplada).setValues(tot);
}

function refaEquips_(grup, sessio) {
  return ambBloqueig_(function () {
    creaEquipsSiCal_(grup, sessio, true);
    afegeixFiles_('REGISTRE', [[new Date(), '', sessio, 'refa-equips', grup, 'mestre']]);
    return tauler_(grup, sessio);
  });
}

function creaFilesProgres_(grup, sessio) {
  var d = llegeix_('PROGRES');
  var existents = {};
  d.files.forEach(function (f) { existents[String(f[d.idx.clau])] = true; });
  var nous = alumnesDelGrup_(grup).filter(function (a) { return !existents[clauProgres_(a.id_alumne, sessio)]; })
    .map(function (a) { return filaDe_('PROGRES', { clau: clauProgres_(a.id_alumne, sessio), id_alumne: String(a.id_alumne), grup: grup, sessio: sessio }); });
  afegeixFiles_('PROGRES', nous);
}

// ============================================================
//  TAULER EN DIRECTE
// ============================================================

function tauler_(grup, sessio) {
  var cfg = config_();
  var alumnes = {};
  alumnesDelGrup_(grup).forEach(function (a) { alumnes[String(a.id_alumne)] = a; });
  var equips = {};
  objectes_('EQUIPS').forEach(function (q) { if (String(q.sessio) === sessio) equips[String(q.id_alumne)] = q; });
  var d = llegeix_('PROGRES');
  var m = missioDeSessio_(sessio, true);
  var targetes = [];
  var totes = d.files.map(function (f, i) { return objecte_(d, f, i); });

  totes.forEach(function (p) {
    if (String(p.grup) !== grup || String(p.sessio) !== sessio) return;
    var a = alumnes[String(p.id_alumne)];
    if (!a) return;
    var e = estatEfectiu_(p);
    // Només llegeix: la nota es calcula al moment. (Escriure aquí podria trepitjar una validació feta mentrestant.)
    var nota = notaFinal_(calculaNota_(e, cfg.pesos), p.ajust);
    var q = equips[String(p.id_alumne)];
    var sortidaFeta = m ? m.sortida.length > 0 && m.sortida.every(function (s) { return e.sortida[s.clau]; }) : false;
    targetes.push({
      id: String(p.id_alumne), nom: String(a.nom_curt), equip: q ? String(q.equip) : '', variant: q ? String(q.variant) : '',
      present: e.present, nivell: e.nivell, n1Vist: e.n1Vist, viaN2: e.viaN2, n3Explica: e.n3Explica,
      espera: e.espera, esperaDesDe: e.esperaDesDe, encallatOn: e.encallatOn, prediccio: e.prediccio,
      fallat: e.fallat, sortidaFeta: sortidaFeta, encerts: e.encerts, nota: nota, ajust: Number(p.ajust) || 0,
      observacio: String(p.observacio || '')
    });
  });

  targetes.sort(function (x, y) { return x.nom.localeCompare(y.nom, 'ca'); });
  var cua = function (filtre) {
    return targetes.filter(filtre).sort(function (x, y) { return x.esperaDesDe - y.esperaDesDe; })
      .map(function (t) { return { id: t.id, nom: t.nom, espera: t.espera, des_de: t.esperaDesDe, equip: t.equip }; });
  };
  var cal = null;
  objectes_('CALENDARI').some(function (c) { if (String(c.grup) === grup && String(c.sessio) === sessio) { cal = c; return true; } return false; });
  var encallatTextos = {};
  if (m) m.encallat.forEach(function (x) { encallatTextos[x.clau] = x.text; });
  return {
    grup: grup, sessio: sessio, estat: cal ? String(cal.estat) : 'pendent', codi: cal ? String(cal.codi_classe || '') : '',
    titol: m ? m.titol : SESSIONS[sessio].nom, targetes: targetes,
    cues: { ajuda: cua(function (t) { return t.espera === 'ajuda'; }), demo: cua(function (t) { return t.espera.indexOf('demo') === 0; }) },
    fita: fitaDeGrup_(totes, grup, sessio, cfg), encallatTextos: encallatTextos, hora: araMs_()
  };
}

/** Un clic del mestre al tauler. */
function valida_(id, sessio, que) {
  var accepta = ['n1', 'n1no', 'n2funciona', 'n2diagnostic', 'n3', 'n3explica', 'encarano', 'atesa',
                 'presentsi', 'presentno', 'presentauto', 'desfes'];
  if (accepta.indexOf(que) < 0) throw new Error('Validació desconeguda');
  var grup = '';
  ambBloqueig_(function () {
    var cfg = config_();
    var d = llegeix_('PROGRES');
    var clau = clauProgres_(id, sessio);
    var i = -1;
    d.files.some(function (f, k) { if (String(f[d.idx.clau]) === clau) { i = k; return true; } return false; });
    if (i < 0) throw new Error('No hi ha fila de progrés per a ' + clau);
    var p = objecte_(d, d.files[i], i);
    grup = String(p.grup);
    var ara = araMs_();
    var nm = Number(p.nivell_mestre) || 0;
    switch (que) {
      case 'n1': p.nivell_mestre = Math.max(nm, 1); break;
      case 'n1no': p.nivell_mestre = 0; p.via_n2 = ''; p.n3_explica = ''; p.n1_rebutjat_des_de = ara; p.atesa_des_de = ara; break;
      case 'n2funciona': p.nivell_mestre = Math.max(nm, 2); p.via_n2 = 'funciona'; p.atesa_des_de = ara; break;
      case 'n2diagnostic': p.nivell_mestre = Math.max(nm, 2); p.via_n2 = 'diagnostic'; p.atesa_des_de = ara; break;
      case 'n3': p.nivell_mestre = 3; if (!p.via_n2) p.via_n2 = 'funciona'; p.n3_explica = 'no'; p.atesa_des_de = ara; break;
      case 'n3explica': p.nivell_mestre = 3; if (!p.via_n2) p.via_n2 = 'funciona'; p.n3_explica = 'sí'; p.atesa_des_de = ara; break;
      case 'encarano': case 'atesa': p.atesa_des_de = ara; break;
      case 'presentsi': p.present_mestre = 'sí'; break;
      case 'presentno': p.present_mestre = 'no'; break;
      case 'presentauto': p.present_mestre = ''; break;
      case 'desfes':
        if (nm >= 3) { p.nivell_mestre = 2; p.n3_explica = ''; }
        else if (nm === 2) { p.nivell_mestre = 1; p.via_n2 = ''; }
        else { p.nivell_mestre = 0; p.via_n2 = ''; p.n1_rebutjat_des_de = ara; }
        break;
    }
    var e = estatEfectiu_(p);
    p.nota_auto = calculaNota_(e, cfg.pesos);
    p.nota = notaFinal_(p.nota_auto, p.ajust);
    p.actualitzat_mestre = ara;
    escriuBloc_(d, i + 2, BLOC_MESTRE, p);
    afegeixFiles_('REGISTRE', [[new Date(), id, sessio, 'mestre-' + que, String(p.nota), 'mestre']]);
  });
  return tauler_(grup, sessio);
}

// ============================================================
//  NOTES I INFORME
// ============================================================

function notes_(grup) {
  var cfg = config_();
  var alumnes = alumnesDelGrup_(grup);
  var progres = {};
  objectes_('PROGRES').forEach(function (p) { progres[String(p.clau)] = p; });
  var files = alumnes.map(function (a) {
    var id = String(a.id_alumne);
    var sessions = {};
    ORDRE_SESSIONS.forEach(function (s) {
      var p = progres[clauProgres_(id, s)];
      if (!p) { sessions[s] = null; return; }
      var e = estatEfectiu_(p);
      var auto = calculaNota_(e, cfg.pesos);
      sessions[s] = { nota: notaFinal_(auto, p.ajust), auto: auto, ajust: Number(p.ajust) || 0,
                      observacio: String(p.observacio || ''), nivell: e.nivell, present: e.present };
    });
    var m = mitjana_(sessions, cfg.pesos);
    return { id: id, nom: String(a.nom_curt), sessions: sessions, mitjana: m, qualificacio: qualificacio_(m, cfg.pesos) };
  }).sort(function (x, y) { return x.nom.localeCompare(y.nom, 'ca'); });
  return { grup: grup, files: files };
}

function mitjana_(sessions, pesos) {
  var suma = 0, pes = 0;
  ORDRE_SESSIONS.forEach(function (s) {
    var x = sessions[s];
    if (!x || x.nota === '' || x.nota === null || x.nota === undefined) return;
    var w = s === 'S9' ? ((pesos && pesos.pesS9) || 2) : 1;
    suma += Number(x.nota) * w; pes += w;
  });
  return pes ? Math.round(suma / pes * 10) / 10 : '';
}

function ajusta_(id, sessio, ajust, observacio) {
  var grup = '';
  ambBloqueig_(function () {
    var cfg = config_();
    var d = llegeix_('PROGRES');
    var clau = clauProgres_(id, sessio);
    d.files.some(function (f, i) {
      if (String(f[d.idx.clau]) !== clau) return false;
      var p = objecte_(d, f, i);
      grup = String(p.grup);
      var aj = Math.max(-2, Math.min(2, Number(ajust) || 0));
      p.ajust = aj === 0 ? '' : aj;
      if (observacio !== undefined) p.observacio = String(observacio).slice(0, 300);
      p.nota_auto = calculaNota_(estatEfectiu_(p), cfg.pesos);
      p.nota = notaFinal_(p.nota_auto, p.ajust);
      p.actualitzat_mestre = araMs_();
      escriuBloc_(d, i + 2, BLOC_MESTRE, p);
      return true;
    });
  });
  return notes_(grup);
}

/** Recalcula nota_auto i nota de TOTES les files (menú del full). Només toca el bloc del mestre. */
function recalculaNotes() {
  return ambBloqueig_(function () { oblidaCache_('config'); return recalculaSenseBloqueig_(); });
}

function recalculaSenseBloqueig_() {
  {
    var cfg = config_();
    var d = llegeix_('PROGRES');
    if (!d.files.length) return 0;
    var c1 = d.idx[BLOC_MESTRE.des_de], c2 = d.idx[BLOC_MESTRE.fins_a];
    var bloc = d.files.map(function (f, i) {
      var p = objecte_(d, f, i);
      p.nota_auto = calculaNota_(estatEfectiu_(p), cfg.pesos);
      p.nota = notaFinal_(p.nota_auto, p.ajust);
      var r = [];
      for (var c = c1; c <= c2; c++) r.push(p[d.cap[c]] === undefined ? '' : p[d.cap[c]]);
      return r;
    });
    d.pestanya.getRange(2, c1 + 1, bloc.length, c2 - c1 + 1).setValues(bloc);
    return bloc.length;
  }
}

/** Omple la pestanya INFORME. Conserva el comentari_final que hagis escrit. */
function preparaInforme(grupTriat) {
  var grup = typeof grupTriat === 'string' ? grupTriat : '';
  return ambBloqueig_(function () {
    recalculaSenseBloqueig_();   // les notes desades al full queden al dia
    var cfg = config_();
    var inf = llegeix_('INFORME');
    var comentaris = {};
    inf.files.forEach(function (f) { comentaris[String(f[inf.idx.id_alumne])] = f[inf.idx.comentari_final]; });
    var progres = {};
    objectes_('PROGRES').forEach(function (p) { progres[String(p.clau)] = p; });
    var alumnes = objectes_('ALUMNES').filter(function (a) {
      var g = String(a.grup);
      return String(a.id_alumne) && String(a.actiu) !== 'no' && g !== 'GP' && (!grup || g === grup);
    });
    var files = alumnes.map(function (a) {
      var id = String(a.id_alumne);
      var sessions = {}, domina = {}, toca = {};
      ORDRE_SESSIONS.forEach(function (s) {
        var p = progres[clauProgres_(id, s)];
        if (!p) { sessions[s] = null; return; }
        var e = estatEfectiu_(p);
        var nota = notaFinal_(calculaNota_(e, cfg.pesos), p.ajust);
        sessions[s] = { nota: nota };
        var eina = SESSIONS[s].eina;
        if (e.present && EINES[eina]) { toca[eina] = true; if (e.nivell >= 2) domina[eina] = true; }
      });
      var m = mitjana_(sessions, cfg.pesos);
      var carnet = ORDRE_EINES.filter(function (x) { return domina[x]; }).map(function (x) { return EINES[x]; });
      var consolidar = ORDRE_EINES.filter(function (x) { return toca[x] && !domina[x]; }).map(function (x) { return EINES[x]; });
      var suggerit = '';
      if (carnet.length) suggerit += 'Fa anar amb autonomia: ' + carnet.join(', ') + '. ';
      if (consolidar.length) suggerit += 'Ha de consolidar: ' + consolidar.join(', ') + '.';
      var fila = [id, String(a.nom_complet || a.nom_curt), String(a.grup)];
      ORDRE_SESSIONS.forEach(function (s) { fila.push(sessions[s] ? sessions[s].nota : ''); });
      fila.push(m, qualificacio_(m, cfg.pesos), carnet.join(', '), suggerit.trim(), comentaris[id] || '');
      return fila;
    }).sort(function (x, y) { return (x[2] + x[1]).localeCompare(y[2] + y[1], 'ca'); });
    // Si és un sol grup, es conserven les files dels altres grups
    var altres = grup ? inf.files.filter(function (f) { return String(f[inf.idx.grup]) !== grup; }) : [];
    reescriu_(inf, altres.concat(files));
    return { files: files.length };
  });
}

function esborraCurs() {
  var ui = SpreadsheetApp.getUi();
  var r = ui.alert('Esborrar les dades del curs', 'S\'esborraran ALUMNES, CALENDARI, EQUIPS, REGISTRE, PROGRES, INFORME i ERRORS. Es conserven MISSIONS, MON i CONFIG. Segur?', ui.ButtonSet.YES_NO);
  if (r !== ui.Button.YES) return;
  ['ALUMNES', 'CALENDARI', 'EQUIPS', 'REGISTRE', 'PROGRES', 'INFORME', 'ERRORS'].forEach(function (nom) {
    var p = pestanya_(nom);
    if (p.getLastRow() > 1) p.getRange(2, 1, p.getLastRow() - 1, Math.max(p.getLastColumn(), 1)).clearContent();
  });
  installa();
}

// ============================================================
//  MISSIONS, CONFIGURACIÓ, PROJECCIÓ
// ============================================================

function missionsEditor_(sessio) {
  var files = objectes_('MISSIONS').filter(function (r) { return String(r.sessio) === sessio; })
    .map(function (r) { return { tipus: String(r.tipus), clau: String(r.clau), ordre: Number(r.ordre) || 0, text: String(r.text),
      imatge: String(r.imatge), opcions: String(r.opcions), correcta: String(r.correcta), estat: String(r.estat) }; })
    .sort(function (a, b) { return a.ordre - b.ordre; });
  return { sessio: sessio, files: files };
}

function desaMissions_(sessio, files) {
  if (!SESSIONS[sessio]) throw new Error('Sessió incorrecta');
  var tipusValids = ['missio', 'nivell', 'control', 'abans', 'encallat', 'sortida', 'variant'];
  return ambBloqueig_(function () {
    var d = llegeix_('MISSIONS');
    var altres = d.files.filter(function (f) { return String(f[0]) !== sessio; });
    var noves = (files || []).filter(function (r) { return tipusValids.indexOf(String(r.tipus)) >= 0 && String(r.clau); })
      .map(function (r, i) {
        return [sessio, String(r.tipus), String(r.clau), Number(r.ordre) || i + 1, String(r.text || ''), String(r.imatge || ''),
                String(r.opcions || ''), String(r.correcta || ''), String(r.estat) === 'publicada' ? 'publicada' : 'esborrany'];
      });
    reescriu_(d, altres.concat(noves));
    oblidaCache_('missions');
    return missionsEditor_(sessio);
  });
}

function configura_(clau, valor) {
  var permeses = ['noms_generics', 'mostra_codi', 'fita_pct', 'url_mon', 'id_script_mon', 'projeccio_mode', 'exemple_correu'];
  if (permeses.indexOf(clau) < 0) throw new Error('Paràmetre no editable');
  ambBloqueig_(function () {
    var d = llegeix_('CONFIG');
    var trobat = d.files.some(function (f, i) {
      if (String(f[0]) === clau) { d.pestanya.getRange(i + 2, 2).setValue(valor); return true; }
      return false;
    });
    if (!trobat) afegeixFiles_('CONFIG', [[clau, valor, '']]);
    oblidaCache_('config');
  });
  return inici_();
}

function reiniciaPin_(id) {
  ambBloqueig_(function () {
    var d = llegeix_('ALUMNES');
    d.files.some(function (f, i) {
      if (String(f[0]) === String(id)) { d.pestanya.getRange(i + 2, d.idx.pin + 1).setValue('reiniciat'); return true; }
      return false;
    });
  });
  return true;
}

/** Dades per a la Promethean. NOMÉS AGREGATS: cap nom, per construcció. */
function projeccio_() {
  var cfg = config_();
  if (String(cfg.projeccio_mode || '') === 'entrar') return { mode: 'entrar', exempleCorreu: String(cfg.exemple_correu || ''), hora: araMs_() };
  var oberta = null;
  objectes_('CALENDARI').forEach(function (c) { if (String(c.estat) === 'oberta' || String(c.estat) === 'sortida') oberta = c; });
  if (!oberta) return { oberta: false, hora: araMs_() };
  var s = String(oberta.sessio), g = String(oberta.grup);
  var m = missioDeSessio_(s, true);
  var zona = null;
  mon_(cfg).forEach(function (z) { if (z.zona === SESSIONS[s].zona) zona = z; });
  var fita = fitaDeGrup_(objectes_('PROGRES'), g, s, cfg);
  return {
    oberta: true, sessio: s, grup: g, estat: String(oberta.estat), eina: EINES[SESSIONS[s].eina] || 'Totes les eines',
    zona: zona ? zona.nom : '', color: zona ? zona.color : '#ddd', dibuix: zona ? zona.dibuix : '',
    titol: m ? m.titol : SESSIONS[s].nom, frase: m ? m.frase : '', xuleta: m ? m.xuleta : '',
    nivells: m ? { n1: (m.nivells.n1 || {}).text || '', n2: (m.nivells.n2 || {}).text || '', n3: (m.nivells.n3 || {}).text || '' } : {},
    imatges: m ? { n1: (m.nivells.n1 || {}).imatge || '', n2: (m.nivells.n2 || {}).imatge || '', n3: (m.nivells.n3 || {}).imatge || '' } : {},
    fita: { ambN2: fita.ambN2, objectiu: fita.objectiu, assolida: fita.assolida },
    codi: cfg.mostra_codi ? String(oberta.codi_classe || '') : '',
    hora: araMs_()
  };
}

// ============================================================
//  ACTUALITZAR DES DE GITHUB (un clic)
//  Baixa els fitxers d'apps-script/ del repositori públic poldpm/robomon, els posa als dos projectes
//  (aquest i el del món), crea una versió nova i hi apunta TOTS els desplegaments. Les URL no canvien.
//  Requisit (un sol cop): activar l'API d'Apps Script a https://script.google.com/home/usersettings
// ============================================================

var REPO = 'poldpm/robomon';
var FITXERS_PROJECTE = {
  admin: [['Codi', 'SERVER_JS', 'Codi.gs'], ['Comu', 'SERVER_JS', 'Comu.gs'], ['Admin', 'HTML', 'Admin.html'],
          ['Projeccio', 'HTML', 'Projeccio.html'], ['appsscript', 'JSON', 'appsscript.json']],
  mon:   [['Codi', 'SERVER_JS', 'Codi.gs'], ['Comu', 'SERVER_JS', 'Comu.gs'], ['Mon', 'HTML', 'Mon.html'],
          ['appsscript', 'JSON', 'appsscript.json']]
};

/** Menú del full, o «Executa» des de l'editor d'Apps Script (llavors el resultat surt al registre d'execució). */
function actualitzaDesDeGitHub() {
  var ui = null;
  try { ui = SpreadsheetApp.getUi(); } catch (e) { ui = null; }
  var avisa = function (titol, text) {
    if (ui) ui.alert(titol, text, ui.ButtonSet.OK);
    else console.log(titol + ' · ' + text);
  };
  try {
    var r = actualitza_();
    avisa('RoboMón actualitzat', 'Versió ' + r.sha.slice(0, 7) + '.\n' + r.projectes.map(function (p) {
      return (p.carpeta === 'mon' ? 'Món' : 'Administrador') + ': versió ' + p.versio + ', ' + p.desplegaments + ' desplegament(s) actualitzat(s).';
    }).join('\n'));
  } catch (err) {
    avisa('No s\'ha pogut actualitzar', String(err.message || err));
    if (!ui) throw err;
  }
}

function darrerCommit_() {
  try {
    var r = UrlFetchApp.fetch('https://api.github.com/repos/' + REPO + '/commits/main',
      { muteHttpExceptions: true, headers: { Accept: 'application/vnd.github+json' } });
    if (r.getResponseCode() === 200) return String(JSON.parse(r.getContentText()).sha);
  } catch (e) { /* sense API de GitHub: es fa servir «main» */ }
  return 'main';
}

function baixa_(sha, cami) {
  var r = UrlFetchApp.fetch('https://raw.githubusercontent.com/' + REPO + '/' + sha + '/' + cami, { muteHttpExceptions: true });
  if (r.getResponseCode() !== 200) throw new Error('No s\'ha pogut baixar ' + cami + ' (' + r.getResponseCode() + ')');
  return r.getContentText('UTF-8');
}

function apiScript_(metode, cami, cos) {
  var opcions = { method: metode, muteHttpExceptions: true, headers: { Authorization: 'Bearer ' + ScriptApp.getOAuthToken() } };
  if (cos) { opcions.contentType = 'application/json'; opcions.payload = JSON.stringify(cos); }
  var r = UrlFetchApp.fetch('https://script.googleapis.com/v1' + cami, opcions);
  var codi = r.getResponseCode(), text = r.getContentText();
  if (codi >= 300) {
    if (/has not been used|is disabled|not enabled|SERVICE_DISABLED|User has not enabled/i.test(text))
      throw new Error('Cal activar l\'API d\'Apps Script: https://script.google.com/home/usersettings → «API de Google Apps Script» → Activada (amb el compte de l\'escola). Després torna-ho a provar. Resposta de Google: ' + text.slice(0, 400));
    throw new Error('Apps Script API ' + codi + ': ' + text.slice(0, 300));
  }
  return text ? JSON.parse(text) : {};
}

function actualitzaProjecte_(scriptId, carpeta, sha) {
  var files = FITXERS_PROJECTE[carpeta].map(function (f) {
    return { name: f[0], type: f[1], source: baixa_(sha, 'apps-script/' + carpeta + '/' + f[2]) };
  });
  apiScript_('PUT', '/projects/' + scriptId + '/content', { files: files });
  var versio = apiScript_('POST', '/projects/' + scriptId + '/versions', { description: 'RoboMón ' + sha.slice(0, 7) });
  var llista = apiScript_('GET', '/projects/' + scriptId + '/deployments').deployments || [];
  var n = 0;
  llista.forEach(function (d) {
    var c = d.deploymentConfig || {};
    if (!c.versionNumber) return;                     // el desplegament «HEAD» (proves) no té versió
    apiScript_('PUT', '/projects/' + scriptId + '/deployments/' + d.deploymentId, { deploymentConfig: {
      scriptId: scriptId, versionNumber: versio.versionNumber, manifestFileName: 'appsscript', description: c.description || 'RoboMón' } });
    n++;
  });
  return { carpeta: carpeta, versio: versio.versionNumber, desplegaments: n };
}

function actualitza_() {
  oblidaCache_('config');   // l'ID es pot haver escrit fa un moment al full
  var cfg = config_();
  var idMon = String(cfg.id_script_mon || '').trim();
  if (!idMon) throw new Error('Falta l\'ID del projecte del món: Sessions → «ID del projecte del món» (Configuració del projecte del món → ID de l\'script).');
  var sha = darrerCommit_();
  // Primer el món (si falla, l'administrador continua com estava i el pots tornar a provar)
  var projectes = [actualitzaProjecte_(idMon, 'mon', sha), actualitzaProjecte_(ScriptApp.getScriptId(), 'admin', sha)];
  desaConfig_('versio_github', sha);
  afegeixFiles_('REGISTRE', [[new Date(), '', '', 'actualitza-github', sha.slice(0, 7), 'mestre']]);
  return { sha: sha, projectes: projectes };
}

function estatVersio_() {
  var cfg = config_();
  return { installada: String(cfg.versio_github || ''), github: darrerCommit_(), idMon: String(cfg.id_script_mon || '') };
}

function desaConfig_(clau, valor) {
  var d = llegeix_('CONFIG');
  var trobat = d.files.some(function (f, i) {
    if (String(f[0]) === clau) { d.pestanya.getRange(i + 2, 2).setValue(valor); return true; }
    return false;
  });
  if (!trobat) afegeixFiles_('CONFIG', [[clau, valor, '']]);
  oblidaCache_('config');
}
