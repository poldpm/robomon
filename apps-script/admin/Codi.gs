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
    ['S1', 'abans',   'pla',       4, 'Abans de pintar: quin d\'aquests és el codi de la teva missió? Mira la xuleta («Codis»).', '',
      'tornado|Vermell · Verd · Vermell · Verd|codi:RGRG;zigazaga|Blau · Negre · Verd · Vermell|codi:BKGR;turbo|Blau · Verd · Blau|codi:BGB', '', P],
    ['S1', 'nivell',  'n1',        5, 'Calibra l\'Ozobot al cercle negre. Pinta el codi LENT a la casella 1 i posa l\'Ozobot a SORTIDA.', 'ozo-casella1', '', '', P],
    ['S1', 'control', 'n1',        6, 'Després de la casella 1, l\'Ozobot va més a poc a poc?', 'ozo-casella1', '', '', P],
    ['S1', 'nivell',  'n2',        7, 'Pinta el codi de la teva missió a la casella 2. Ensenya-ho al mestre i explica com l\'has triat.', 'mestre', '', '', P],
    ['S1', 'nivell',  'n3',        8, 'Agafa una carta de repte i pinta la casella 3.', 'carta', '', '', P],
    ['S1', 'encallat', 'nollegeix', 9, 'No fa cas del codi', 'codi-forat',
      'Mira el codi: els colors en l\'ordre de la xuleta, en el sentit de la fletxa, enganxats i sense blanc entremig.', 'codi-be', P],
    ['S1', 'encallat', 'torna',   10, 'Torna enrere', 'ozo-buit',
      'És normal: quan la casella següent és buida, l\'Ozobot hi arriba i fa mitja volta. Pinta-la quan toqui.', 'ozo-buit', P],
    ['S1', 'encallat', 'perd',    11, 'Es perd a la línia', 'e-perd',
      'Torna a calibrar-lo: al cercle negre, mantén el botó premut fins que faci llum blanca.', 'ozo-calibra', P],
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
  ORDRE_SESSIONS.slice(1).forEach(function (s) {
    f[s] = [[s, 'missio', 'titol', 1, SESSIONS[s].nom, '', '', '', E],
            [s, 'missio', 'frase', 2, 'Pendent de redactar a partir del fitxer ACTIVITAT.', '', '', '', E]];
  });
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
           config: { noms_generics: cfg.noms_generics, mostra_codi: cfg.mostra_codi, fita_pct: cfg.fita_pct, url_mon: String(cfg.url_mon || '') } };
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
  if (!unitats) {
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
  var permeses = ['noms_generics', 'mostra_codi', 'fita_pct', 'url_mon'];
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
