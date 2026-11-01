/**
 * ============================================================
 *  CODI.gs — EL MÓN (aplicació dels alumnes)
 *  Desplegament: Aplicació web · Executa com: JO · Accés: qualsevol de l'organització
 *
 *  SEGURETAT: l'única funció que el navegador pot cridar és api().
 *  Totes les altres acaben amb «_» i Apps Script no les deixa cridar des de fora.
 *  Aquest projecte NO té cap funció de mestre.
 * ============================================================
 */

var ACCIONS_PUBLIQUES = ['llistaNoms', 'entraPin'];          // no cal estar identificat
var ACCIONS_ALUMNE = ['estat', 'registra'];                   // cal ser un alumne
var DIBUIXOS_PIN = ['sol', 'lluna', 'estrella', 'peix', 'arbre', 'casa', 'poma', 'nuvol', 'flor'];

function doGet(e) {
  var t = HtmlService.createTemplateFromFile('Mon');
  var inicial;
  try {
    inicial = estatInicial_();
  } catch (err) {
    registraError_('doGet', err);
    inicial = { error: true, detall: detallPerAlMestre_(err) };
  }
  t.inicial = JSON.stringify(inicial).replace(/</g, '\\u003c');
  return t.evaluate()
    .setTitle('RoboMón')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1');
}

/** Pla B2: la pàgina estàtica de GitHub Pages crida aquí amb fetch (POST text/plain). */
function doPost(e) {
  var resposta;
  try {
    var cos = JSON.parse(e.postData.contents);
    resposta = api(cos.accio, cos.args, cos.testimoni);
  } catch (err) {
    registraError_('doPost', err);
    resposta = { ok: false, motiu: 'error' };
  }
  return ContentService.createTextOutput(JSON.stringify(resposta)).setMimeType(ContentService.MimeType.JSON);
}

/** L'ÚNICA porta d'entrada des del navegador. */
function api(accio, args, testimoni) {
  args = args || {};
  try {
    if (accio === 'llistaNoms') return { ok: true, dades: llistaNoms_(args.codi) };
    if (accio === 'entraPin') return entraPin_(args);
    if (ACCIONS_ALUMNE.indexOf(accio) < 0) return { ok: false, motiu: 'accio' };
    var qui = identitat_(testimoni, args.simula);
    if (!qui || !qui.id) return { ok: false, motiu: 'identitat' };
    if (accio === 'estat') return { ok: true, dades: estatAlumne_(qui.id) };
    if (accio === 'registra') return { ok: true, dades: registra_(qui.id, args.esdeveniments || []) };
  } catch (err) {
    registraError_('api:' + accio, err);
    return { ok: false, motiu: 'error', detall: detallPerAlMestre_(err) };
  }
  return { ok: false, motiu: 'accio' };
}

// ------------------------------------------------------------
//  Identitat (Pla A: correu · Pla B: testimoni de PIN · Mode prova: només el mestre)
// ------------------------------------------------------------

/** El text tècnic d'un error només es mostra al compte del mestre (mai als alumnes). */
function detallPerAlMestre_(err) {
  try {
    var mestre = String(config_().correu_mestre || '').toLowerCase().trim();
    if (mestre && correuActiu_() === mestre) return String(err && err.message || err).slice(0, 300);
  } catch (e) { /* si ni tan sols es pot llegir la configuració */ }
  try { if (correuActiu_() && correuActiu_() === String(Session.getEffectiveUser().getEmail() || '').toLowerCase()) return String(err && err.message || err).slice(0, 300); } catch (e) { /* res */ }
  return '';
}

function correuActiu_() {
  try { return String(Session.getActiveUser().getEmail() || '').toLowerCase().trim(); } catch (e) { return ''; }
}

function identitat_(testimoni, simula) {
  if (testimoni) {
    var valor = CacheService.getScriptCache().get('t_' + String(testimoni).slice(0, 60));
    if (valor) {
      // El testimoni porta un tros del PIN: si el mestre el reinicia o dona de baixa l'alumne, deixa de valer.
      var parts = String(valor).split('|');
      var a = alumnePerId_(parts[0]);
      if (a && String(a.actiu) !== 'no' && String(a.pin || '').slice(0, 12) === parts[1]) return { id: parts[0], via: 'pin' };
    }
  }
  var correu = correuActiu_();
  if (!correu) return null;
  var cfg = config_();
  if (correu === String(cfg.correu_mestre || '').toLowerCase().trim()) {
    // Mode prova: el mestre pot fer de qualsevol alumne de prova (A9xx, grup GP). Mai d'un alumne real.
    if (simula && /^A9\d\d$/.test(String(simula)) && alumnePerId_(simula)) return { id: String(simula), via: 'prova' };
    return { mestre: true };
  }
  var a = alumnePerCorreu_(correu);
  return a ? { id: String(a.id_alumne), via: 'correu' } : { desconegut: true };
}

function alumnePerCorreu_(correu) {
  var trobat = null;
  objectes_('ALUMNES').some(function (a) {
    if (String(a.correu).toLowerCase().trim() === correu && String(a.actiu) !== 'no') { trobat = a; return true; }
    return false;
  });
  return trobat;
}

function alumnePerId_(id) {
  var trobat = null;
  objectes_('ALUMNES').some(function (a) { if (String(a.id_alumne) === String(id)) { trobat = a; return true; } return false; });
  return trobat;
}

/** El que el navegador rep en obrir la pàgina (Pla A). */
function estatInicial_() {
  var correu = correuActiu_();
  if (!correu) return { pla: 'B' };                       // no tenim correu → Pla B1
  var cfg = config_();
  if (correu === String(cfg.correu_mestre || '').toLowerCase().trim()) {
    var proves = objectes_('ALUMNES').filter(function (a) { return /^A9\d\d$/.test(String(a.id_alumne)); })
      .map(function (a) { return { id: String(a.id_alumne), nom: String(a.nom_curt) }; });
    return { pla: 'prova', proves: proves };
  }
  var a = alumnePerCorreu_(correu);
  if (!a) return { pla: 'B', avis: 'correu-desconegut' };
  return { pla: 'A', estat: estatAlumne_(String(a.id_alumne)) };
}

// ------------------------------------------------------------
//  Pla B: codi de classe + nom + 3 dibuixos
// ------------------------------------------------------------

function sessioOberta_() {
  var oberta = null;
  objectes_('CALENDARI').some(function (c) {
    var e = String(c.estat);
    if (e === 'oberta' || e === 'sortida') { oberta = c; return true; }
    return false;
  });
  return oberta;
}

var LIMIT_CODIS = 100;   // codis equivocats per codi de classe i 10 minuts (el codi té 4 xifres: 9.000 possibles)

/**
 * Comprova el codi de classe. Els intents equivocats es compten per CODI ACTUAL:
 * si algú prova codis a l'engròs, el mestre obre de nou la sessió i el codi (i el comptador) canvien.
 * Retorna la sessió oberta si el codi és bo; si no, null.
 */
function comprovaCodi_(codi) {
  var s = sessioOberta_();
  if (!s) return null;                                   // sense sessió oberta no comptem res
  var clau = 'codi_intents_' + String(s.codi_classe);
  var ok = !!codi && String(s.codi_classe) === String(codi);
  return ambBloqueig_(function () {
    var cache = CacheService.getScriptCache();
    var intents = Number(cache.get(clau) || 0);
    if (intents >= LIMIT_CODIS) return { bloquejat: true };
    if (!ok) { cache.put(clau, String(intents + 1), 600); return null; }
    return { sessio: s };
  });
}

function llistaNoms_(codi) {
  var r = comprovaCodi_(codi);
  if (r && r.bloquejat) return { bloquejat: true };
  if (!r) return { correcte: false };
  var s = r.sessio;
  var noms = objectes_('ALUMNES').filter(function (a) {
    return String(a.grup) === String(s.grup) && String(a.actiu) !== 'no' && String(a.id_alumne);
  }).map(function (a) {
    return { id: String(a.id_alumne), nom: String(a.nom_curt) };
  }).sort(function (x, y) { return x.nom.localeCompare(y.nom, 'ca'); });
  return { correcte: true, noms: noms };
}

/** Té un PIN de debò? («reiniciat» = el mestre l'ha esborrat i se'n pot triar un de nou) */
function tePin_(a) { return /^h/.test(String(a.pin || '')); }

function hashPin_(id, pin) {
  var sal = String(config_().sal || 'taller3r');
  var bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, id + ':' + pin + ':' + sal, Utilities.Charset.UTF_8);
  return 'h' + bytes.map(function (b) { return ('0' + (b & 0xff).toString(16)).slice(-2); }).join('');
}

function pinValid_(pin) {
  var p = String(pin || '').split('-');
  return p.length === 3 && p.every(function (x) { return DIBUIXOS_PIN.indexOf(x) >= 0; });
}

/**
 * Entrada pel Pla B. Un sol tipus de resposta per a alumne inexistent o PIN equivocat (no es pot endevinar qui hi ha).
 * Un PIN NOU només es pot triar a la sessió S1 o si el mestre l'ha reiniciat (pin = «reiniciat»).
 */
function entraPin_(args) {
  var id = String(args.id || '').slice(0, 10), pin = String(args.pin || '');
  var r = comprovaCodi_(args.codi);
  if (r && r.bloquejat) return { ok: false, motiu: 'massa-intents' };
  if (!r) return { ok: false, motiu: 'codi' };
  var s = r.sessio;
  if (!pinValid_(pin)) return { ok: false, motiu: 'pin' };

  return ambBloqueig_(function () {
    var cache = CacheService.getScriptCache();
    var clauIntents = 'pin_intents_' + id;
    var intents = Number(cache.get(clauIntents) || 0);           // llegit i comptat DINS del pany
    if (intents >= 5) return { ok: false, motiu: 'massa-intents' };
    var falla = function () { cache.put(clauIntents, String(intents + 1), 3600); return { ok: false, motiu: 'pin' }; };

    var d = llegeix_('ALUMNES');
    var i = -1;
    d.files.some(function (f, k) { if (String(f[d.idx.id_alumne]) === id) { i = k; return true; } return false; });
    if (i < 0) return falla();
    var fila = d.files[i];
    if (String(fila[d.idx.grup]) !== String(s.grup) || String(fila[d.idx.actiu]) === 'no') return falla();
    var desat = String(fila[d.idx.pin] || '');
    var hash = hashPin_(id, pin);
    if (!/^h/.test(desat)) {
      if (String(s.sessio) !== 'S1' && desat !== 'reiniciat') return falla();
      d.pestanya.getRange(i + 2, d.idx.pin + 1).setValue(hash);   // primer PIN
    } else if (desat !== hash) {
      return falla();
    }
    cache.remove(clauIntents);
    var testimoni = Utilities.getUuid();
    cache.put('t_' + testimoni, id + '|' + hash.slice(0, 12), 6 * 3600);
    afegeixFiles_('REGISTRE', [[new Date(), id, String(s.sessio), 'entrada-pin', '', 'alumne']]);
    return { ok: true, dades: { testimoni: testimoni, estat: estatAlumne_(id) } };
  });
}

// ------------------------------------------------------------
//  L'estat que veu un alumne (només el seu)
// ------------------------------------------------------------

function estatAlumne_(id) {
  var cfg = config_();
  var alumne = alumnePerId_(id);
  if (!alumne) throw new Error('Alumne inexistent: ' + id);
  var grup = String(alumne.grup);

  var calendari = objectes_('CALENDARI').filter(function (c) { return String(c.grup) === grup; });
  var progres = objectes_('PROGRES');
  var meus = {};
  progres.forEach(function (p) { if (String(p.id_alumne) === id) meus[String(p.sessio)] = p; });

  // Estat de cada zona al MEU mapa
  var zones = {}, carnet = {};
  ORDRE_EINES.forEach(function (e) { carnet[e] = false; });
  var estatSessio = {};
  calendari.forEach(function (c) { estatSessio[String(c.sessio)] = String(c.estat); });
  ORDRE_SESSIONS.forEach(function (s) {
    var estatCal = estatSessio[s] || 'pendent';
    var z = SESSIONS[s].zona;
    if (estatCal === 'pendent' || !estatCal) { zones[z] = 'tancada'; return; }
    var e = estatEfectiu_(meus[s]);
    zones[z] = e.nivell >= 3 ? 'n3' : e.nivell === 2 ? 'n2' : e.nivell === 1 ? 'n1' : 'oberta';
    if (e.nivell >= 2 && carnet.hasOwnProperty(SESSIONS[s].eina)) carnet[SESSIONS[s].eina] = true;
  });
  // S6 fusionada amb S5: l'illa petita pren l'estat de la seva veïna
  if (estatSessio.S6 === 'fusionada') zones.Z6 = zones.Z5;

  // La sessió d'avui (si n'hi ha una d'oberta per al meu grup)
  var avui = null, fita = null;
  var oberta = null;
  calendari.forEach(function (c) { if (String(c.estat) === 'oberta' || String(c.estat) === 'sortida') oberta = c; });
  if (oberta) {
    var s = String(oberta.sessio);
    var missio = senseCorrectes_(missioDeSessio_(s, false));
    var equip = null;
    objectes_('EQUIPS').some(function (q) {
      if (String(q.id_alumne) === id && String(q.sessio) === s) { equip = q; return true; }
      return false;
    });
    var variant = equip ? String(equip.variant) : '';
    var e = estatEfectiu_(meus[s]);
    avui = {
      sessio: s,
      zona: SESSIONS[s].zona,
      eina: SESSIONS[s].eina,
      estat: String(oberta.estat),
      missio: missio,
      equip: equip ? String(equip.equip) : '',
      variant: variant,
      textVariant: missio && variant ? (missio.variants[variant] || '') : '',
      progres: {
        nivell: e.nivell, n1Vist: e.n1Vist, c0: e.c0, prediccio: e.prediccio,
        encallatOn: e.encallatOn, espera: e.espera,
        sortida: e.sortida, sortidaFeta: missio ? missio.sortida.every(function (q) { return e.sortida[q.clau]; }) : false
      }
    };
    fita = fitaDeGrup_(progres, grup, s, cfg);
  }

  return {
    alumne: { id: id, nom: String(alumne.nom_curt), avatar: String(alumne.avatar || ''), tePin: tePin_(alumne) },
    mon: mon_(cfg),
    zones: zones,
    carnet: carnet,
    fitaAssolida: !!(fita && fita.assolida),
    avui: avui,
    hora: araMs_()
  };
}

// ------------------------------------------------------------
//  Registrar el que fa l'alumne (lot d'esdeveniments → 1 lectura + 1 escriptura)
// ------------------------------------------------------------

/**
 * Tipus d'esdeveniment acceptats:
 *  entrada · c0 · prediccio(v) · n1 · encallat(v) · pista(v) · ajuda · demo(v=2|3) · cancela
 *  sortida(v={clau,resp}) · avatar(v) · pin(v)
 */
function registra_(id, esdeveniments) {
  if (!Array.isArray(esdeveniments)) esdeveniments = [];
  esdeveniments = esdeveniments.slice(0, 20).filter(function (ev) { return ev && typeof ev.t === 'string'; });
  if (!esdeveniments.length) return estatAlumne_(id);
  return ambBloqueig_(function () {
    var alumne = alumnePerId_(id);
    var grup = String(alumne.grup);
    var oberta = null;
    objectes_('CALENDARI').forEach(function (c) {
      if (String(c.grup) === grup && (String(c.estat) === 'oberta' || String(c.estat) === 'sortida')) oberta = c;
    });
    var registre = [];
    var ara = araMs_();

    // Avatar i PIN (pestanya ALUMNES)
    esdeveniments.forEach(function (ev) {
      if (ev.t === 'avatar' && /^c\d-a\d$/.test(String(ev.v))) {
        actualitzaAlumne_(id, 'avatar', String(ev.v));
        registre.push([new Date(), id, oberta ? String(oberta.sessio) : '', 'avatar', String(ev.v), 'alumne']);
      }
      if (ev.t === 'pin' && pinValid_(ev.v) && !tePin_(alumne)) {
        actualitzaAlumne_(id, 'pin', hashPin_(id, String(ev.v)));
        registre.push([new Date(), id, oberta ? String(oberta.sessio) : '', 'pin-creat', '', 'alumne']);
      }
    });

    // Progrés de la sessió oberta
    if (oberta) {
      var s = String(oberta.sessio);
      var d = llegeix_('PROGRES');
      var clau = clauProgres_(id, s);
      var busca = function () {
        var k = -1;
        d.files.some(function (f, j) { if (String(f[d.idx.clau]) === clau) { k = j; return true; } return false; });
        return k;
      };
      var i = busca();
      if (i < 0) {
        // L'alumne no tenia fila (s'ha afegit a la llista amb la sessió ja oberta): es crea ara, amb appendRow.
        afegeixFiles_('PROGRES', [filaDe_('PROGRES', { clau: clau, id_alumne: id, grup: grup, sessio: s })]);
        d = llegeix_('PROGRES');
        i = busca();
      }
      if (i >= 0) {
        var p = objecte_(d, d.files[i], i);
        var missio = missioDeSessio_(s, false);
        var obertaPerTreballar = String(oberta.estat) === 'oberta';
        var clausAbans = missio && missio.abans ? missio.abans.opcions.map(function (o) { return o.clau; }) : [];
        var clausEncallat = missio ? missio.encallat.map(function (o) { return o.clau; }) : [];
        esdeveniments.forEach(function (ev) {
          if (ev.s && String(ev.s) !== s) return;   // esdeveniment d'una altra sessió (bústia antiga): s'ignora
          var v = ev.v === undefined || ev.v === null ? '' : ev.v;
          // Només s'accepten valors coneguts: res del navegador arriba tal qual al full
          if (ev.t === 'prediccio' && clausAbans.indexOf(String(v)) < 0) return;
          if ((ev.t === 'encallat' || ev.t === 'pista') && clausEncallat.indexOf(String(v)) < 0) return;
          if (ev.t === 'demo' && String(v) !== '2' && String(v) !== '3') return;
          if (ev.t === 'sortida' && (!v || typeof v !== 'object')) return;
          if (['entrada', 'c0', 'n1', 'ajuda', 'cancela'].indexOf(ev.t) >= 0) v = '';
          var desa = true;
          switch (ev.t) {
            case 'entrada': if (!p.present_alumne) p.present_alumne = ara; break;
            case 'c0': if (obertaPerTreballar) p.c0 = ara; else desa = false; break;
            case 'prediccio':
              // Predicció: només ABANS del primer control. Pla «pla-n2»: entre el N1 i la demostració del N2.
              var esPlaN2 = missio && missio.abans && String(missio.abans.clau).indexOf('pla-n2') === 0;
              var teN1 = Number(p.n1) > Number(p.n1_rebutjat_des_de || 0) || Number(p.nivell_mestre) >= 1;
              var permes = esPlaN2 ? (teN1 && !(Number(p.nivell_mestre) >= 2)) : (!(Number(p.n1) > 0) && !(Number(p.nivell_mestre) > 0));
              if (obertaPerTreballar && !p.prediccio && permes) p.prediccio = String(v).slice(0, 20);
              else desa = false;
              break;
            case 'n1': if (obertaPerTreballar) p.n1 = ara; else desa = false; break;
            case 'encallat': p.encallat_on = String(v).slice(0, 20); p.fallat = 'sí'; break;
            case 'pista': break;
            case 'ajuda': p.espera = 'ajuda'; p.espera_des_de = ara; break;
            case 'demo': p.espera = 'demo' + (String(v) === '3' ? '3' : '2'); p.espera_des_de = ara; break;
            case 'cancela': p.espera = ''; p.espera_des_de = ''; break;
            case 'sortida':
              if (v && missio) {
                var resp = analitzaJson_(p.sortida, {});
                var q = null;
                missio.sortida.some(function (x) { if (x.clau === String(v.clau)) { q = x; return true; } return false; });
                var clausOpcio = q ? q.opcions.map(function (o) { return o.clau; }) : [];
                if (q && !resp[q.clau] && clausOpcio.indexOf(String(v.resp)) >= 0) {
                  resp[q.clau] = String(v.resp);
                  p.sortida = JSON.stringify(resp);
                  var encerts = missio.sortida.filter(function (x) { return x.correcta && resp[x.clau] === x.correcta; })
                    .map(function (x) { return x.clau; });
                  p.sortida_encerts = encerts.join(',');
                } else desa = false;
              } else desa = false;
              break;
            default: desa = false;
          }
          if (!p.present_alumne && desa) p.present_alumne = ara;
          if (desa && ev.t !== 'avatar' && ev.t !== 'pin') {
            registre.push([new Date(), id, s, ev.t, textSegur_(typeof v === 'object' ? JSON.stringify(v) : String(v), 60), 'alumne']);
          }
        });
        p.actualitzat_alumne = ara;
        escriuBloc_(d, i + 2, BLOC_ALUMNE, p);
      }
    }
    if (registre.length) afegeixFiles_('REGISTRE', registre);
    return estatAlumne_(id);
  });
}

function actualitzaAlumne_(id, columna, valor) {
  var d = llegeix_('ALUMNES');
  d.files.some(function (f, k) {
    if (String(f[d.idx.id_alumne]) === id) { d.pestanya.getRange(k + 2, d.idx[columna] + 1).setValue(valor); return true; }
    return false;
  });
}
