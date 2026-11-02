# RoboMón

Aplicació del taller de tecnologia, programació i robòtica de 3r (Vedruna Escorial Vic).

- **El món** (Chromebook de cada alumne): avatar, mapa de l'Arxipèlag, missió del dia, «no me n'he sortit», targeta de sortida.
- **Administrador** (PC i mòbil del mestre): tauler en directe, cues d'ajuda i de demostració, validació amb un clic, notes, informe, missions, projecció per a la Promethean.

Tot viu a Google Apps Script i a un Google Sheet de la unitat compartida del centre. Cap dada d'alumne surt del Workspace de l'escola.

> El pla complet (decisions, escala de notes, sessió 1) és a [`docs/PLA-TALLER-3r.md`](docs/PLA-TALLER-3r.md).

---

## Què hi ha a cada carpeta

| Carpeta | Què és | Qui ho toca |
|---|---|---|
| `apps-script/admin/` | **Fitxers per enganxar** al projecte de l'administrador | Tu (copiar i enganxar) |
| `apps-script/mon/` | **Fitxers per enganxar** al projecte del món | Tu (copiar i enganxar) |
| `pla-b/index.html` | Còpia del món per a GitHub Pages (Pla B2) | Ningú: es genera sol |
| `materials/` | Material imprimible (RECURS). Va a «El meu material» | Tu (imprimir) |
| `src/` | Codi font de les pàgines. Els fitxers d'`apps-script/*/*.html` es generen d'aquí | Claude |
| `proves/` | Simulador d'Apps Script i proves automàtiques | Claude |
| `eines/` | `construeix.mjs` (genera els HTML) i `pdf-materials.mjs` | Claude |

---

## Instal·lació (una sola vegada · uns 30 minuts)

### 1 · El full de dades

1. A la **unitat compartida del centre** (no al teu Drive personal): Nou → Fulls de càlcul de Google. Nom: `ROBOMON-DADES`.
2. Comparteix-lo **només amb tu**.

### 2 · El projecte de l'administrador (vinculat al full)

1. Al full: **Extensions → Apps Script**. Posa-li nom: `RoboMón · Administrador`.
2. Engranatge (Configuració del projecte) → marca **«Mostra el fitxer de manifest appsscript.json a l'editor»**.
3. Crea aquests fitxers i enganxa-hi el contingut **sencer** de la carpeta `apps-script/admin/`:

   | A l'editor | Tipus | Contingut de |
   |---|---|---|
   | `Codi` | Script (.gs) | `apps-script/admin/Codi.gs` |
   | `Comu` | Script (.gs) | `apps-script/admin/Comu.gs` |
   | `Admin` | HTML | `apps-script/admin/Admin.html` |
   | `Projeccio` | HTML | `apps-script/admin/Projeccio.html` |
   | `appsscript.json` | (ja existeix) | `apps-script/admin/appsscript.json` |

4. Desa. Torna al full i **recarrega'l**. Surt el menú **RoboMón**.
5. **RoboMón → Instal·la o repara el full**. La primera vegada et demanarà permisos: accepta'ls (són teus, no dels alumnes).
6. Pestanya `ALUMNES`: enganxa-hi la llista. Només cal omplir 4 columnes: `correu` · `grup` (G1, G2, G3 o G4) · `nom_curt` (nom + inicial: «Anna R.») · `nom_complet` (només surt a l'informe).
7. **RoboMón → Genera els ID d'alumnes que falten** (A001, A002…). La clau de tot és aquest ID, mai el nom.
8. Pestanya `CALENDARI`: si vols, posa-hi les dates. No és obligatori: la data s'omple sola quan obres la sessió.
9. **Desplega:** botó blau *Desplega → Desplegament nou → Aplicació web*.
   - Executa com: **Jo**
   - Qui hi té accés: **Només jo**
10. Copia l'URL que acaba en `/exec`. Desa-la com a **marcador al PC i al mòbil**. És el teu tauler.

### 3 · El projecte del món (el dels alumnes)

1. A la mateixa unitat compartida: Nou → Més → **Google Apps Script**. Nom: `RoboMón · El món`.
2. Mostra el manifest (com al pas 2.2) i crea:

   | A l'editor | Tipus | Contingut de |
   |---|---|---|
   | `Codi` | Script (.gs) | `apps-script/mon/Codi.gs` |
   | `Comu` | Script (.gs) | `apps-script/mon/Comu.gs` |
   | `Mon` | HTML | `apps-script/mon/Mon.html` |
   | `appsscript.json` | (ja existeix) | `apps-script/mon/appsscript.json` |

3. Configuració del projecte → **Propietats de l'script** → Afegeix: `ID_FULL` = l'identificador del full (el tros de l'URL del full entre `/d/` i `/edit`).
4. **Desplega → Desplegament nou → Aplicació web**:
   - Executa com: **Jo**
   - Qui hi té accés: **Qualsevol persona de [el domini de l'escola]**
5. Copia l'URL `/exec`. Posa-la a l'administrador (Sessions → URL del món) i fes-la arribar als alumnes com a **marcador «RoboMón»** (o al Classroom).

### 4 · Comprova-ho tu sol (sense alumnes)

1. Obre l'URL del món **amb el teu compte**: surt el **Mode prova** (només el veu el teu compte).
2. Al tauler: grup **Proves** → S1 → **Obre la sessió**.
3. Al món: tria «Prova Anna» → personatge → dibuixos → mapa → Missió d'avui → fes el recorregut sencer.
4. Al tauler (al mòbil també): l'Anna apareix a la cua; valida-la. En menys de 10 segons, al món, se li encén el nivell 2.
5. Tauler → **Targeta de sortida** → al món surten les 2 preguntes.
6. **Tanca la sessió** quan acabis. Les dades de prova (grup GP) no surten a l'informe.

### 5 · Pla B2 (per si el dia 11 el món no s'obre als alumnes)

1. Al projecte del món: **Desplega → Gestiona els desplegaments → Desplegament nou → Aplicació web** amb **Qui hi té accés: Qualsevol persona** (anònim). Si aquesta opció no hi és, el domini no ho permet: llavors el Pla C (tu marques els nivells des del tauler) és el pla de reserva.
2. Copia aquesta nova URL `/exec`.
3. L'enllaç del Pla B2 per als alumnes és:
   `https://poldpm.github.io/robomon/pla-b/?api=` + la URL del pas 2
4. Prova-ho en una **finestra d'incògnit**: et demanarà el codi de 4 xifres que surt al tauler.
5. ⚠️ Abans de fer-lo servir amb alumnes, comenta'l amb el **DPD**: és un punt d'entrada anònim (protegit per codi + PIN).

### 6 · Abans del dimecres 11 de novembre

- [ ] Instal·lació feta i Mode prova provat de punta a punta (pas 4)
- [ ] Una pregunta al coordinador TIC: «Els alumnes poden obrir una aplicació web d'Apps Script d'un mestre del domini (executada com el mestre)?». Si diu que cal autoritzar-la, el camí és a la secció 6.2 del pla.
- [ ] Enllaç del Pla B2 preparat i provat en incògnit (pas 5)
- [ ] Circular a les famílies revisada per direcció/DPD i enviada (`docs/CIRCULAR-FAMILIES.md`)
- [ ] Material de la S1 imprès (`materials/S1-primers-codis-RECURS/imprimir.pdf`)

---

## El dia de la sessió

| Hora | Al tauler |
|---|---|
| Migdia | Grup → sessió → **Obre la sessió** (es creen els equips sols). Obre la **Projecció ↗** a la Promethean |
| Durant | Les cues: **Ajuda** (primer) i **Volen ensenyar-ho**. Toques un nom → un clic |
| 16:12 | **Targeta de sortida** (tots els Chromebooks canvien sols) |
| 16:22 | **Tanca la sessió** |
| Final de trimestre | Notes → **Prepara l'informe al full** → pestanya `INFORME` |
| Final de curs | Menú del full → **Esborra les dades del curs** |

## Actualitzar RoboMón (un clic)

Quan Claude puja canvis a GitHub, **no cal copiar ni enganxar res**:

> Tauler → **Sessions** → **Actualitza des de GitHub** (o, al full, menú **RoboMón → Actualitza des de GitHub**)

Posa els fitxers nous als dos projectes (administrador i món), en fa una versió i hi apunta tots els desplegaments (també el del Pla B2). **Les URL no canvien.** Fes-ho fora de l'horari de classe.

**Preparació (un sol cop):**
1. Activa l'API d'Apps Script al teu compte: https://script.google.com/home/usersettings → «API de Google Apps Script» → **Activada**.
2. Copia l'**ID de l'script** del projecte del món (Configuració del projecte → IDs) i desa'l al tauler: Sessions → «ID del projecte del món».
3. L'última vegada a mà: enganxa `Codi.gs` i `appsscript.json` de `apps-script/admin/` a l'administrador, desplega una versió nova i accepta els permisos nous que demana (gestionar projectes i desplegaments d'Apps Script, i connectar-se a GitHub).
4. **Projecte de Google Cloud propi** (el projecte «amagat» que Google posa per defecte no deixa activar l'API):
   - https://console.cloud.google.com/projectcreate → nom `RoboMon` → Crear.
   - APIs y servicios → Biblioteca → **Apps Script API** → Habilitar.
   - APIs y servicios → Pantalla de consentimiento de OAuth → **Interno** → nom `RoboMón` → desar.
   - Copia el **número** del projecte → editor de l'administrador → Configuració del projecte → Proyecto de Google Cloud Platform → Cambiar proyecto → enganxa'l.
5. Executa `actualitzaDesDeGitHub` des de l'editor (o el menú del full) i accepta els permisos.

Fet l'1 de novembre de 2026: funciona (versió 41d00a8 instal·lada).

## Per a Claude (desenvolupament)

```bash
node eines/construeix.mjs          # genera apps-script/*/*.html i pla-b/ a partir de src/
node proves/proves.mjs             # simula una sessió sencera amb 18 alumnes (≈ 2 min)
node proves/simulador.mjs          # servidor local: http://localhost:8787/admin?usuari=mestre@escola.cat
node eines/genera-materials.mjs     # material de la S3 a la S9 (a partir de les missions)
node eines/pdf-materials.mjs materials/S1-primers-codis-RECURS
```

Lletra: Lexend (SIL Open Font License, `docs/LLICENCIA-LEXEND-OFL.txt`), incrustada a cada pàgina.

Il·lustracions: generades amb IA (Gamma), retallades i incrustades en WebP des de `src/imatges/`. El mapa és `src/imatges/mapa.webp`; les coordenades de cada illa són a `src/comu/illustracions.js` (`ILLES`).

Icona i logotip de RoboMón: `src/marca/` (`robomon-icona.svg`, PNG de 512, 192 i 32 px, i `robomon-logo.svg`/`.png` amb el nom). Engranatge (robòtica) amb el món de l'Arxipèlag a dins: no representa cap robot concret.
