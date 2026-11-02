/**
 * ============================================================
 *  COMU.gs — TALLER DE 3r · Vedruna Escorial Vic
 *  Aquest fitxer és IDÈNTIC als dos projectes (Món i Administrador).
 *  Si el canvies, copia'l sencer als dos llocs.
 * ============================================================
 */

var ZONA_HORARIA = 'Europe/Madrid';

/** Columnes de cada pestanya. L'ordre és el del full. */
var FULLS = {
  ALUMNES:   ['id_alumne', 'correu', 'grup', 'nom_curt', 'nom_complet', 'pin', 'avatar', 'actiu'],
  CALENDARI: ['grup', 'sessio', 'data', 'estat', 'fusionada_amb', 'codi_classe', 'obert_des_de'],
  MISSIONS:  ['sessio', 'tipus', 'clau', 'ordre', 'text', 'imatge', 'opcions', 'correcta', 'estat'],
  EQUIPS:    ['clau', 'id_alumne', 'grup', 'sessio', 'equip', 'variant'],
  REGISTRE:  ['moment', 'id_alumne', 'sessio', 'esdeveniment', 'valor', 'origen'],
  PROGRES: [
    'clau', 'id_alumne', 'grup', 'sessio',
    // --- Bloc de l'ALUMNE (només l'escriu el projecte del Món) ---
    'present_alumne', 'c0', 'n1', 'prediccio', 'encallat_on', 'fallat',
    'espera', 'espera_des_de', 'sortida', 'sortida_encerts', 'actualitzat_alumne',
    // --- Bloc del MESTRE (només l'escriu el projecte Administrador) ---
    'present_mestre', 'nivell_mestre', 'via_n2', 'n3_explica', 'n1_rebutjat_des_de',
    'atesa_des_de', 'nota_auto', 'ajust', 'nota', 'observacio', 'extra', 'actualitzat_mestre'
  ],
  INFORME:   ['id_alumne', 'nom_complet', 'grup', 'S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9',
              'mitjana', 'qualificacio', 'carnet_eines', 'comentari_suggerit', 'comentari_final'],
  MON:       ['zona', 'nom', 'color', 'dibuix'],
  CONFIG:    ['clau', 'valor', 'explicacio'],
  ERRORS:    ['moment', 'on', 'missatge', 'detall']
};

/** Els dos blocs de PROGRES: cada projecte només escriu el seu. */
var BLOC_ALUMNE = { des_de: 'present_alumne', fins_a: 'actualitzat_alumne' };
var BLOC_MESTRE = { des_de: 'present_mestre', fins_a: 'actualitzat_mestre' };

/** Les 9 sessions. Això NO canvia: és el contingut del taller. */
var SESSIONS = {
  S1: { zona: 'Z1', eina: 'ozobot',  unitats: 6, nom: 'Primers codis' },
  S2: { zona: 'Z2', eina: 'scottie', unitats: 6, nom: 'Programa amb cartes' },
  S3: { zona: 'Z3', eina: 'ozobot',  unitats: 6, nom: 'El teu circuit' },
  S4: { zona: 'Z4', eina: 'dash',    unitats: 3, nom: 'Dash Cargo' },
  S5: { zona: 'Z5', eina: 'spike',   unitats: 3, nom: 'Munta i modifica' },
  S6: { zona: 'Z6', eina: 'spike',   unitats: 3, nom: 'La parada classifica' },
  S7: { zona: 'Z7', eina: 'scratch', unitats: 0, nom: 'Circula' },
  S8: { zona: 'Z8', eina: 'scratch', unitats: 0, nom: 'El marcador' },
  S9: { zona: 'Z9', eina: 'totes',   unitats: 0, nom: 'Missió final' }
};
var ORDRE_SESSIONS = ['S1', 'S2', 'S3', 'S4', 'S5', 'S6', 'S7', 'S8', 'S9'];

var EINES = { scottie: 'Scottie Go!', ozobot: 'Ozobot', dash: 'Dash', spike: 'SPIKE', scratch: 'Scratch' };
var ORDRE_EINES = ['scottie', 'ozobot', 'dash', 'spike', 'scratch'];

/** Valors per defecte de la puntuació. Es poden canviar a CONFIG → pesos. */
var PESOS_DEFECTE = {
  nivells: {
    present: 2,             // ha vingut però no ha registrat res
    encallatHonest: 3,      // no arriba a N1, però diu on s'ha encallat
    diagnosticCorrecte: 1,  // + encerta la pregunta de diagnòstic de la targeta de sortida
    n1: 5,
    plaPrevi: 1,            // + ha fet la predicció o el pla ABANS de provar
    n2Diagnostic: 7.5,      // N2: no funciona, però sap per què
    n2Funciona: 8,          // N2: funciona i ho explica
    fallaIArregla: 0.5,     // + havia dit «no me n'he sortit» i després ho ha arreglat
    n3: 9,
    n3Explica: 1
  },
  llindars: { AS: 5, AN: 7, AE: 9 },
  pesS9: 2
};

// ------------------------------------------------------------
//  Accés al full
// ------------------------------------------------------------

var _full = null;
function full_() {
  if (_full) return _full;
  var actiu = null;
  try { actiu = SpreadsheetApp.getActiveSpreadsheet(); } catch (e) { actiu = null; }
  if (actiu) { _full = actiu; return _full; }
  var id = PropertiesService.getScriptProperties().getProperty('ID_FULL');
  if (!id) throw new Error('Falta la propietat ID_FULL a la configuració del projecte.');
  _full = SpreadsheetApp.openById(id);
  return _full;
}

function pestanya_(nom) {
  var p = full_().getSheetByName(nom);
  if (!p) throw new Error('Falta la pestanya ' + nom + '. Fes «RoboMón → Instal·la o repara el full».');
  return p;
}

/** Llegeix una pestanya sencera amb UNA sola crida. */
function llegeix_(nom) {
  var p = pestanya_(nom);
  var valors = p.getDataRange().getValues();
  var cap = valors.length ? valors[0].map(String) : FULLS[nom].slice();
  var idx = {};
  cap.forEach(function (c, i) { idx[c] = i; });
  return { pestanya: p, cap: cap, idx: idx, files: valors.slice(1) };
}

/** Converteix una fila en objecte. _fila = número de fila al full (1 = capçalera). */
function objecte_(dades, fila, i) {
  var o = { _fila: i + 2 };
  dades.cap.forEach(function (c, k) { o[c] = fila[k]; });
  return o;
}

function objectes_(nom) {
  var d = llegeix_(nom);
  return d.files.map(function (f, i) { return objecte_(d, f, i); });
}

/** Escriu un bloc contigu de columnes d'una fila amb UNA sola crida. */
function escriuBloc_(dades, numFila, bloc, obj) {
  var c1 = dades.idx[bloc.des_de], c2 = dades.idx[bloc.fins_a];
  var fila = [];
  for (var c = c1; c <= c2; c++) {
    var nomCol = dades.cap[c];
    fila.push(obj[nomCol] === undefined || obj[nomCol] === null ? '' : obj[nomCol]);
  }
  dades.pestanya.getRange(numFila, c1 + 1, 1, fila.length).setValues([fila]);
}

/**
 * Afegeix files al final.
 * REGISTRE, ERRORS i PROGRES hi escriuen els DOS projectes amb panys diferents: fem servir appendRow, que és atòmic.
 * La resta de pestanyes només les fa créixer l'administrador: una sola crida.
 */
function afegeixFiles_(nom, files) {
  if (!files.length) return;
  var p = pestanya_(nom);
  if (nom === 'REGISTRE' || nom === 'ERRORS' || nom === 'PROGRES') {
    files.forEach(function (f) { p.appendRow(f.map(function (v) { return textSegur_(v); })); });
    return;
  }
  p.getRange(p.getLastRow() + 1, 1, files.length, files[0].length).setValues(files);
}

/** Un text que arriba del navegador mai pot ser una fórmula ni ser llarg. */
function textSegur_(v, max) {
  if (v === null || v === undefined) return '';
  if (typeof v !== 'string') return v;
  var t = v.slice(0, max || 200);
  return /^[=+\-@]/.test(t) ? "'" + t : t;
}

function filaDe_(nom, obj) {
  return FULLS[nom].map(function (c) { return obj[c] === undefined || obj[c] === null ? '' : obj[c]; });
}

// ------------------------------------------------------------
//  Configuració i caché
// ------------------------------------------------------------

function config_() {
  return llegeixAmbCache_('config', 60, function () {
    var c = {};
    objectes_('CONFIG').forEach(function (r) { c[String(r.clau)] = r.valor; });
    var pesos = PESOS_DEFECTE;
    try { if (c.pesos) pesos = JSON.parse(c.pesos); } catch (e) { pesos = PESOS_DEFECTE; }
    c.pesos = pesos;
    c.fita_pct = Number(c.fita_pct) || 80;
    c.noms_generics = String(c.noms_generics) === 'sí';
    c.mostra_codi = String(c.mostra_codi) === 'sí';
    return c;
  });
}

/** Caché curta (dades que canvien poc: CONFIG, MISSIONS, MON). */
function llegeixAmbCache_(clau, segons, funcio) {
  var cache = CacheService.getScriptCache();
  var desat = cache.get('c_' + clau);
  if (desat) { try { return JSON.parse(desat); } catch (e) { /* es torna a llegir */ } }
  var valor = funcio();
  try { cache.put('c_' + clau, JSON.stringify(valor), segons); } catch (e) { /* massa gran: no es desa */ }
  return valor;
}

function oblidaCache_(clau) { CacheService.getScriptCache().remove('c_' + clau); }

// ------------------------------------------------------------
//  Utilitats
// ------------------------------------------------------------

function araMs_() { return new Date().getTime(); }

function textData_(d) { return Utilities.formatDate(d || new Date(), ZONA_HORARIA, 'yyyy-MM-dd HH:mm:ss'); }

function ambBloqueig_(funcio) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var r = funcio();
    SpreadsheetApp.flush();
    return r;
  } finally {
    lock.releaseLock();
  }
}

function registraError_(on, err) {
  try {
    afegeixFiles_('ERRORS', [[new Date(), String(on).slice(0, 60), String(err && err.message || err), String(err && err.stack || '').slice(0, 500)]]);
  } catch (e) { /* si no es pot registrar, no fem res més */ }
}

function clauProgres_(id, sessio) { return id + '·' + sessio; }

function zonaDeSessio_(sessio) { return SESSIONS[sessio] ? SESSIONS[sessio].zona : ''; }

function analitzaJson_(text, perDefecte) {
  if (!text) return perDefecte;
  try { return JSON.parse(text); } catch (e) { return perDefecte; }
}

/** opcions al full: "a|La línia té un forat|ozo-forat;b|...". La imatge pot dur «|» (bloc:cat|text). */
function analitzaOpcions_(text) {
  if (!text) return [];
  return String(text).split(';').map(function (t) {
    var p = t.split('|');
    return { clau: (p[0] || '').trim(), text: (p[1] || '').trim(), imatge: p.slice(2).join('|').trim() };
  }).filter(function (o) { return o.clau; });
}

// ------------------------------------------------------------
//  L'estat efectiu d'un alumne en una sessió (combina els dos blocs)
// ------------------------------------------------------------

function estatEfectiu_(p) {
  p = p || {};
  var presentMestre = String(p.present_mestre || '');
  var nivellMestre = Number(p.nivell_mestre) || 0;
  // Si el mestre li ha validat un nivell, hi era (encara que no hagi pogut entrar al món)
  var present = presentMestre === 'no' ? false : (presentMestre === 'sí' || !!p.present_alumne || nivellMestre > 0);
  var n1Declarat = (Number(p.n1) || 0) > (Number(p.n1_rebutjat_des_de) || 0);
  var nivell = Math.max(nivellMestre, n1Declarat ? 1 : 0);
  var esperaActiva = p.espera && (Number(p.espera_des_de) || 0) > (Number(p.atesa_des_de) || 0);
  var encerts = String(p.sortida_encerts || '').split(',').filter(String);
  return {
    present: present,
    nivell: nivell,
    n1Vist: nivellMestre >= 1,
    viaN2: String(p.via_n2 || ''),
    n3Explica: String(p.n3_explica) === 'sí',
    c0: !!p.c0,
    prediccio: String(p.prediccio || ''),
    encallatOn: String(p.encallat_on || ''),
    fallat: String(p.fallat) === 'sí',
    espera: esperaActiva ? String(p.espera) : '',
    esperaDesDe: esperaActiva ? Number(p.espera_des_de) : 0,
    sortida: analitzaJson_(p.sortida, {}),
    diagnosiCorrecta: encerts.indexOf('diag') >= 0,
    encerts: encerts
  };
}

/** NOTA de 0 a 10 d'una sessió. Conserva la lògica v3: diagnosticar ≥ encertar. */
function calculaNota_(e, pesos) {
  var P = (pesos && pesos.nivells) || PESOS_DEFECTE.nivells;
  if (!e.present) return '';
  var n;
  if (e.nivell >= 3) {
    n = P.n3 + (e.n3Explica ? P.n3Explica : 0);
  } else if (e.nivell === 2) {
    n = e.viaN2 === 'diagnostic' ? P.n2Diagnostic : P.n2Funciona + (e.fallat ? P.fallaIArregla : 0);
  } else if (e.nivell === 1) {
    n = P.n1 + (e.prediccio ? P.plaPrevi : 0);
  } else if (e.encallatOn) {
    n = P.encallatHonest + (e.diagnosiCorrecta ? P.diagnosticCorrecte : 0);
  } else {
    n = P.present + (e.diagnosiCorrecta ? P.diagnosticCorrecte : 0);
  }
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

function notaFinal_(notaAuto, ajust) {
  if (notaAuto === '' || notaAuto === null || notaAuto === undefined) return '';
  var n = Number(notaAuto) + (Number(ajust) || 0);
  return Math.max(0, Math.min(10, Math.round(n * 10) / 10));
}

function qualificacio_(nota, pesos) {
  if (nota === '' || nota === null || nota === undefined) return '';
  var L = (pesos && pesos.llindars) || PESOS_DEFECTE.llindars;
  var n = Number(nota);
  if (n >= L.AE) return 'AE';
  if (n >= L.AN) return 'AN';
  if (n >= L.AS) return 'AS';
  return 'NA';
}

/** Llegeix les missions publicades (o totes) d'una sessió i les agrupa. */
function missioDeSessio_(sessio, totes) {
  var files = llegeixAmbCache_('missions', 60, function () {
    return objectes_('MISSIONS').map(function (r) { delete r._fila; return r; });
  });
  var meves = files.filter(function (r) {
    return String(r.sessio) === sessio && (totes || String(r.estat) === 'publicada');
  }).sort(function (a, b) { return (Number(a.ordre) || 0) - (Number(b.ordre) || 0); });
  if (!meves.length) return null;
  var m = { sessio: sessio, eina: SESSIONS[sessio].eina, titol: SESSIONS[sessio].nom, frase: '', xuleta: '',
            nivells: {}, controls: {}, abans: null, encallat: [], sortida: [], variants: {} };
  meves.forEach(function (r) {
    var tipus = String(r.tipus), clau = String(r.clau);
    var el = { clau: clau, text: String(r.text || ''), imatge: String(r.imatge || ''),
               opcions: analitzaOpcions_(r.opcions), correcta: String(r.correcta || '') };
    if (tipus === 'missio') { if (clau === 'titol') m.titol = el.text; if (clau === 'frase') m.frase = el.text; if (clau === 'xuleta') m.xuleta = el.text; }
    else if (tipus === 'nivell') m.nivells[clau] = el;
    else if (tipus === 'control') m.controls[clau] = el;
    else if (tipus === 'abans') m.abans = el;
    else if (tipus === 'encallat') {
      // Encallat: text = on s'encalla · imatge = dibuix · opcions = text de la pista · correcta = dibuix de la pista
      m.encallat.push({ clau: clau, text: el.text, imatge: el.imatge, pista: String(r.opcions || ''), imatgePista: String(r.correcta || '') });
    }
    else if (tipus === 'sortida') m.sortida.push(el);
    else if (tipus === 'variant') m.variants[clau] = el.text;
  });
  return m;
}

/** Treu les respostes correctes abans d'enviar res al navegador de l'alumne. */
function senseCorrectes_(m) {
  if (!m) return null;
  var c = JSON.parse(JSON.stringify(m));
  c.sortida.forEach(function (s) { delete s.correcta; });
  Object.keys(c.controls).forEach(function (k) { delete c.controls[k].correcta; });
  Object.keys(c.nivells).forEach(function (k) { delete c.nivells[k].correcta; });
  if (c.abans) delete c.abans.correcta;
  return c;
}

/** Noms de les zones (capa de ficció). Amb «noms genèrics» → Zona 1, Zona 2… */
function mon_(cfg) {
  var files = llegeixAmbCache_('mon', 60, function () {
    return objectes_('MON').map(function (r) { return { zona: String(r.zona), nom: String(r.nom), color: String(r.color), dibuix: String(r.dibuix) }; });
  });
  return files.map(function (z) {
    return cfg.noms_generics ? { zona: z.zona, nom: 'Zona ' + z.zona.replace('Z', ''), color: z.color, dibuix: z.dibuix } : z;
  });
}

/** Fita de grup: quants alumnes presents tenen N2, i quants en calen. */
function fitaDeGrup_(progresFiles, grup, sessio, cfg) {
  var presents = 0, ambN2 = 0;
  progresFiles.forEach(function (p) {
    if (String(p.grup) !== grup || String(p.sessio) !== sessio) return;
    var e = estatEfectiu_(p);
    if (!e.present) return;
    presents++;
    if (e.nivell >= 2) ambN2++;
  });
  var objectiu = Math.max(1, Math.ceil(presents * cfg.fita_pct / 100));
  return { presents: presents, ambN2: ambN2, objectiu: objectiu, assolida: presents > 0 && ambN2 >= objectiu };
}
