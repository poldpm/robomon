# Taller de 3r · El món

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

1. A la **unitat compartida del centre** (no al teu Drive personal): Nou → Fulls de càlcul de Google. Nom: `TALLER-3r-DADES`.
2. Comparteix-lo **només amb tu**.

### 2 · El projecte de l'administrador (vinculat al full)

1. Al full: **Extensions → Apps Script**. Posa-li nom: `Taller 3r · Administrador`.
2. Engranatge (Configuració del projecte) → marca **«Mostra el fitxer de manifest appsscript.json a l'editor»**.
3. Crea aquests fitxers i enganxa-hi el contingut **sencer** de la carpeta `apps-script/admin/`:

   | A l'editor | Tipus | Contingut de |
   |---|---|---|
   | `Codi` | Script (.gs) | `apps-script/admin/Codi.gs` |
   | `Comu` | Script (.gs) | `apps-script/admin/Comu.gs` |
   | `Admin` | HTML | `apps-script/admin/Admin.html` |
   | `Projeccio` | HTML | `apps-script/admin/Projeccio.html` |
   | `appsscript.json` | (ja existeix) | `apps-script/admin/appsscript.json` |

4. Desa. Torna al full i **recarrega'l**. Surt el menú **Taller 3r**.
5. **Taller 3r → Instal·la o repara el full**. La primera vegada et demanarà permisos: accepta'ls (són teus, no dels alumnes).
6. Pestanya `ALUMNES`: enganxa-hi la llista. Només cal omplir 4 columnes: `correu` · `grup` (G1, G2, G3 o G4) · `nom_curt` (nom + inicial: «Anna R.») · `nom_complet` (només surt a l'informe).
7. **Taller 3r → Genera els ID d'alumnes que falten** (A001, A002…). La clau de tot és aquest ID, mai el nom.
8. Pestanya `CALENDARI`: si vols, posa-hi les dates. No és obligatori: la data s'omple sola quan obres la sessió.
9. **Desplega:** botó blau *Desplega → Desplegament nou → Aplicació web*.
   - Executa com: **Jo**
   - Qui hi té accés: **Només jo**
10. Copia l'URL que acaba en `/exec`. Desa-la com a **marcador al PC i al mòbil**. És el teu tauler.

### 3 · El projecte del món (el dels alumnes)

1. A la mateixa unitat compartida: Nou → Més → **Google Apps Script**. Nom: `Taller 3r · El món`.
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
5. Copia l'URL `/exec`. Posa-la a l'administrador (Sessions → URL del món) i fes-la arribar als alumnes com a **marcador «El meu món»** (o al Classroom).

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
   `https://poldpm.github.io/taller-3r/pla-b/?api=` + la URL del pas 2
4. Prova-ho en una **finestra d'incògnit**: et demanarà el codi de 3 xifres que surt al tauler.
5. ⚠️ Abans de fer-lo servir amb alumnes, comenta'l amb el **DPD**: és un punt d'entrada anònim (protegit per codi + PIN).

### 6 · Abans del dimecres 11 de novembre

- [ ] Instal·lació feta i Mode prova provat de punta a punta (pas 4)
- [ ] Una pregunta al coordinador TIC: «Els alumnes poden obrir una aplicació web d'Apps Script d'un mestre del domini (executada com el mestre)?». Si diu que cal autoritzar-la, el camí és a la secció 6.2 del pla.
- [ ] Enllaç del Pla B2 preparat i provat en incògnit (pas 5)
- [ ] Circular a les famílies revisada per direcció/DPD i enviada (`docs/CIRCULAR-FAMILIES.md`)
- [ ] Material de la S1 imprès (`materials/S1-primer-cami-RECURS/imprimir.pdf`)

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

## Quan Claude canviï alguna cosa

Claude et dirà quins fitxers han canviat. Només cal tornar-los a enganxar **sencers** a l'editor i, al món o a l'administrador, fer **Desplega → Gestiona els desplegaments → editar (llapis) → Versió: nova → Desplega**. L'URL no canvia.

## Per a Claude (desenvolupament)

```bash
node eines/construeix.mjs          # genera apps-script/*/*.html i pla-b/ a partir de src/
node proves/proves.mjs             # simula una sessió sencera amb 18 alumnes (≈ 2 min)
node proves/simulador.mjs          # servidor local: http://localhost:8787/admin?usuari=mestre@escola.cat
node eines/pdf-materials.mjs materials/S1-primer-cami-RECURS
```

Lletra: Andika (SIL Open Font License, `docs/LLICENCIA-ANDIKA-OFL.txt`), incrustada a cada pàgina.
