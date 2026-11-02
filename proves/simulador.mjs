// ============================================================
//  simulador.mjs — Un Apps Script de mentida per provar-ho tot sense Google.
//  Carrega els .gs de debò dins d'un entorn que imita SpreadsheetApp, LockService, etc.
//  Ús: node proves/simulador.mjs  → http://localhost:8787
// ============================================================
import { readFileSync, existsSync } from 'node:fs';
import { createServer } from 'node:http';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';
import crypto from 'node:crypto';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..');
export const MESTRE = 'mestre@escola.cat';

// ---------------- Full de càlcul en memòria ----------------
function esNumeric(v) { return typeof v === 'string' && /^-?\d+(\.\d+)?$/.test(v); }
class Pestanya {
  constructor(nom) { this.nom = nom; this.dades = []; this.text = new Set(); }
  getName() { return this.nom; }
  getLastRow() { for (let r = this.dades.length - 1; r >= 0; r--) if ((this.dades[r] || []).some(v => v !== '' && v != null)) return r + 1; return 0; }
  getLastColumn() { let m = 0; this.dades.forEach(f => { for (let c = f.length - 1; c >= 0; c--) if (f[c] !== '' && f[c] != null) { m = Math.max(m, c + 1); break; } }); return m; }
  getRange(a, b, c, d) {
    if (typeof a === 'string') {
      const m = /^([A-Z]+):([A-Z]+)$/.exec(a);
      const col = s => s.split('').reduce((x, ch) => x * 26 + ch.charCodeAt(0) - 64, 0);
      return new Rang(this, 1, col(m[1]), 1000, col(m[2]) - col(m[1]) + 1);
    }
    return new Rang(this, a, b, c || 1, d || 1);
  }
  getDataRange() { return new Rang(this, 1, 1, Math.max(this.getLastRow(), 1), Math.max(this.getLastColumn(), 1)); }
  setFrozenRows() { return this; }
  appendRow(f) { this.getRange(this.getLastRow() + 1, 1, 1, f.length).setValues([f]); return this; }
}
class Rang {
  constructor(p, r, c, nr, nc) { Object.assign(this, { p, r, c, nr, nc }); }
  getValues() {
    const out = [];
    for (let i = 0; i < this.nr; i++) {
      const f = this.p.dades[this.r - 1 + i] || [];
      const fila = [];
      for (let j = 0; j < this.nc; j++) { const v = f[this.c - 1 + j]; fila.push(v === undefined || v === null ? '' : v); }
      out.push(fila);
    }
    return out;
  }
  setValues(v) {
    if (v.length !== this.nr || v.some(f => f.length !== this.nc)) throw new Error(`setValues: mida incorrecta (${v.length}x${v[0] && v[0].length} vs ${this.nr}x${this.nc})`);
    v.forEach((fila, i) => {
      const r = this.r - 1 + i;
      while (this.p.dades.length <= r) this.p.dades.push([]);
      fila.forEach((x, j) => {
        const c = this.c - 1 + j;
        if (x !== null && typeof x === 'object' && !(x instanceof Date) && !(x.constructor && x.constructor.name === 'Date')) throw new Error('setValues: objecte no vàlid a la cel·la');
        this.p.dades[r][c] = this.p.text.has(c) ? (x === '' ? '' : String(x)) : (esNumeric(x) ? Number(x) : x);
      });
    });
    return this;
  }
  setValue(x) { return this.setValues([[x]]); }
  clearContent() { for (let i = 0; i < this.nr; i++) { const f = this.p.dades[this.r - 1 + i]; if (f) for (let j = 0; j < this.nc; j++) f[this.c - 1 + j] = ''; } return this; }
  setFontWeight() { return this; }
  setNumberFormat(f) { if (f === '@') for (let j = 0; j < this.nc; j++) this.p.text.add(this.c - 1 + j); return this; }
}
class Full {
  constructor() { this.pestanyes = new Map(); }
  getSheetByName(n) { return this.pestanyes.get(n) || null; }
  insertSheet(n) { const p = new Pestanya(n); this.pestanyes.set(n, p); return p; }
  getId() { return 'FULL-SIMULAT'; }
}

/**
 * Imita una manía real de HtmlService (comprovada l'1/11/2026 amb un error al Chromebook del mestre):
 * dins dels <script>, Google esborra el que hi ha després de «//» (com si fos un comentari) quan el «//» no forma
 * part de dades base64. Si el nostre codi en tingués, aquí també es trencaria i les proves ho detectarien.
 */
export function comGoogle(html) {
  return html.replace(/<script>([\s\S]*?)<\/script>/g, (m, js) => '<script>' + js.replace(/(?<![A-Za-z0-9+/=])\/\/[^\n]*/g, '') + '</script>');
}

// ---------------- Entorn Apps Script ----------------
export function creaMon() {
  const full = new Full();
  const projectes = {};
  let usuariActiu = '';
  const creaCache = () => {
    const m = new Map();
    return {
      get: k => { const e = m.get(k); if (!e) return null; if (e.fins < Date.now()) { m.delete(k); return null; } return e.v; },
      put: (k, v, s = 600) => { m.set(k, { v: String(v), fins: Date.now() + s * 1000 }); },
      remove: k => m.delete(k)
    };
  };
  function context(nom, vinculat, propietats) {
    const cache = creaCache();
    const ctx = {
      console,
      SpreadsheetApp: {
        getActiveSpreadsheet: () => vinculat ? full : null,
        openById: id => { if (id !== 'FULL-SIMULAT') throw new Error('Full inexistent'); return full; },
        flush: () => {},
        getUi: () => ({ alert: () => {}, createMenu: () => ({ addItem() { return this; }, addSeparator() { return this; }, addToUi() {} }), ButtonSet: {}, Button: {} })
      },
      LockService: { getScriptLock: () => ({ waitLock: () => {}, releaseLock: () => {} }) },
      CacheService: { getScriptCache: () => cache },
      PropertiesService: { getScriptProperties: () => ({ getProperty: k => propietats[k] || null }) },
      Session: {
        getActiveUser: () => ({ getEmail: () => usuariActiu }),
        getEffectiveUser: () => ({ getEmail: () => MESTRE })
      },
      Utilities: {
        formatDate: (d, tz, f) => {
          const p = new Intl.DateTimeFormat('ca', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false }).formatToParts(d);
          const g = t => p.find(x => x.type === t).value;
          return f.replace('yyyy', g('year')).replace('MM', g('month')).replace('dd', g('day')).replace('HH', g('hour')).replace('mm', g('minute')).replace('ss', g('second'));
        },
        getUuid: () => crypto.randomUUID(),
        computeDigest: (alg, text) => Array.from(crypto.createHash('sha256').update(text, 'utf8').digest()).map(b => b > 127 ? b - 256 : b),
        DigestAlgorithm: { SHA_256: 'sha256' }, Charset: { UTF_8: 'utf8' }
      },
      HtmlService: {
        createTemplateFromFile: f => {
          const t = { _fitxer: f };
          t.evaluate = () => {
            let html = readFileSync(join(ARREL, 'apps-script', nom, f + '.html'), 'utf8');
            html = html.replace(/<\?(!?=)\s*([\w.]+)\s*\?>/g, (_, tipus, expr) => {
              const v = String(t[expr]);
              return tipus === '!=' ? v : v.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
            });
            html = comGoogle(html);
            const sortida = { contingut: html, setTitle() { return this; }, setFaviconUrl() { return this; }, addMetaTag() { return this; }, getContent() { return this.contingut; } };
            return sortida;
          };
          return t;
        },
        createHtmlOutput: h => ({ contingut: h, setTitle() { return this; }, setFaviconUrl() { return this; }, addMetaTag() { return this; }, getContent() { return this.contingut; } })
      },
      ContentService: { createTextOutput: t => ({ text: t, setMimeType() { return this; } }), MimeType: { JSON: 'json' } },
      ScriptApp: { getService: () => ({ getUrl: () => `/${nom}` }), getOAuthToken: () => 'testimoni-oauth', getScriptId: () => 'SCRIPT-' + nom.toUpperCase() },
      UrlFetchApp: { fetch: (url, op) => urlFetch(url, op || {}) },
      Logger: { log: () => {} }
    };
    vm.createContext(ctx);
    const codi = ['Comu.gs', 'Codi.gs'].map(f => readFileSync(join(ARREL, 'apps-script', nom, f), 'utf8')).join('\n');
    vm.runInContext(codi, ctx, { filename: nom + '.gs' });
    return ctx;
  }
  // GitHub i l'API d'Apps Script simulats (per provar «Actualitza des de GitHub»)
  const apiScript = { crides: [], versions: {}, desplegaments: { 'SCRIPT-ADMIN': [{ deploymentId: 'HEAD', deploymentConfig: {} }, { deploymentId: 'D-ADM', deploymentConfig: { versionNumber: 3, description: 'Admin' } }],
    'SCRIPT-MON': [{ deploymentId: 'HEAD', deploymentConfig: {} }, { deploymentId: 'D-MON', deploymentConfig: { versionNumber: 5 } }, { deploymentId: 'D-MON-B2', deploymentConfig: { versionNumber: 5 } }] } };
  function urlFetch(url, op) {
    const resp = (codi, cos) => ({ getResponseCode: () => codi, getContentText: () => typeof cos === 'string' ? cos : JSON.stringify(cos) });
    if (url.indexOf('https://api.github.com/repos/poldpm/robomon/commits/main') === 0) return resp(200, { sha: 'abcdef1234567890' });
    let m = /^https:\/\/raw\.githubusercontent\.com\/poldpm\/robomon\/[^/]+\/(.+)$/.exec(url);
    if (m) { const f = join(ARREL, m[1]); return existsSync(f) ? resp(200, readFileSync(f, 'utf8')) : resp(404, 'no'); }
    m = /^https:\/\/script\.googleapis\.com\/v1\/projects\/([^/]+)\/(content|versions|deployments)(?:\/([^/]+))?$/.exec(url);
    if (m) {
      const [, id, recurs, dep] = m, metode = (op.method || 'get').toUpperCase(), cos = op.payload ? JSON.parse(op.payload) : null;
      apiScript.crides.push({ id, recurs, dep, metode, cos });
      if (recurs === 'content') return resp(200, { scriptId: id, files: cos.files });
      if (recurs === 'versions') { apiScript.versions[id] = (apiScript.versions[id] || 10) + 1; return resp(200, { versionNumber: apiScript.versions[id] }); }
      if (recurs === 'deployments' && metode === 'GET') return resp(200, { deployments: apiScript.desplegaments[id] || [] });
      if (recurs === 'deployments' && metode === 'PUT') return resp(200, { deploymentId: dep, deploymentConfig: cos.deploymentConfig });
    }
    return resp(404, 'desconegut: ' + url);
  }
  projectes.admin = context('admin', true, {});
  projectes.mon = context('mon', false, { ID_FULL: 'FULL-SIMULAT' });

  // Crida una funció com ho faria google.script.run (amb comprovació de valors legals)
  function crida(projecte, funcio, args, usuari) {
    usuariActiu = usuari || '';
    const ctx = projectes[projecte];
    ctx._full = null;   // cada execució d'Apps Script comença de zero
    if (typeof ctx[funcio] !== 'function') throw new Error('Funció inexistent: ' + funcio);
    if (/_$/.test(funcio)) throw new Error('Funció privada: Apps Script no deixa cridar ' + funcio);
    const r = ctx[funcio](...(args || []));
    comprovaRetorn(r, funcio);
    return JSON.parse(JSON.stringify(r === undefined ? null : r));
  }
  function comprovaRetorn(v, on, cami = '') {
    if (v instanceof Date || (v && v.constructor && v.constructor.name === 'Date')) throw new Error(`${on}: retorna un Date a ${cami} (google.script.run no ho permet)`);
    if (v && typeof v === 'object') Object.keys(v).forEach(k => comprovaRetorn(v[k], on, cami + '.' + k));
  }
  return { full, projectes, crida, apiScript, set usuari(u) { usuariActiu = u; } };
}

// ---------------- Servidor web ----------------
const SHIM = (projecte, usuari) => `<script>
(function(){
  const USUARI = ${JSON.stringify(usuari)};
  function runner(ok, ko) {
    return new Proxy({}, { get(_, prop) {
      if (prop === 'withSuccessHandler') return f => runner(f, ko);
      if (prop === 'withFailureHandler') return f => runner(ok, f);
      return (...args) => {
        fetch('/rpc/${projecte}', { method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Usuari': USUARI }, body: JSON.stringify({ fn: prop, args }) })
          .then(r => r.json()).then(r => { if (r.error) { if (ko) ko(new Error(r.error)); } else if (ok) ok(r.valor); })
          .catch(e => { if (ko) ko(e); });
      };
    }});
  }
  window.google = { script: { run: runner(null, null) } };
})();
</script>`;

export function engega(port = 8787) {
  const m = creaMon();
  const srv = createServer(async (req, res) => {
    const url = new URL(req.url, 'http://x');
    const cos = await new Promise(ok => { let d = ''; req.on('data', c => d += c); req.on('end', () => ok(d)); });
    try {
      if (req.method === 'POST' && url.pathname.startsWith('/rpc/')) {
        const projecte = url.pathname.split('/')[2];
        const { fn, args } = JSON.parse(cos);
        let valor;
        try { valor = m.crida(projecte, fn, args, req.headers['x-usuari'] || ''); }
        catch (e) { res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ error: String(e.message) })); }
        res.writeHead(200, { 'Content-Type': 'application/json' }); return res.end(JSON.stringify({ valor }));
      }
      if (req.method === 'POST' && url.pathname === '/exec-b2') {   // desplegament anònim del Pla B2
        m.usuari = '';
        const ctx = m.projectes.mon; ctx._full = null;
        const out = ctx.doPost({ postData: { contents: cos } });
        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' }); return res.end(out.text);
      }
      if (url.pathname === '/mon' || url.pathname === '/admin') {
        const projecte = url.pathname.slice(1);
        const usuari = url.searchParams.get('usuari') || '';
        m.usuari = usuari;
        const ctx = m.projectes[projecte]; ctx._full = null;
        const sortida = ctx.doGet({ parameter: Object.fromEntries(url.searchParams) });
        const html = sortida.getContent().replace('<head>', '<head>' + SHIM(projecte, usuari));
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(html);
      }
      if (url.pathname.startsWith('/pla-b')) {
        const f = join(ARREL, 'pla-b', 'index.html');
        res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end(readFileSync(f));
      }
      if (url.pathname.startsWith('/materials/')) {
        const f = join(ARREL, decodeURIComponent(url.pathname));
        if (existsSync(f)) { res.writeHead(200, { 'Content-Type': f.endsWith('.html') ? 'text/html; charset=utf-8' : 'application/octet-stream' }); return res.end(readFileSync(f)); }
      }
      res.writeHead(404); res.end('no');
    } catch (e) {
      console.error(e); res.writeHead(500); res.end(String(e.stack));
    }
  });
  return new Promise(ok => srv.listen(port, () => ok({ srv, mon: m, port })));
}

if (process.argv[1] && process.argv[1].endsWith('simulador.mjs')) {
  engega().then(({ mon, port }) => {
    mon.crida('admin', 'installa', [], MESTRE);
    console.log(`Simulador a http://localhost:${port}  ·  /admin?usuari=${MESTRE}  ·  /mon?usuari=${MESTRE}`);
  });
}
