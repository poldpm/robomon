# PLA · Nova aplicació del Taller de 3r

> **Validat per en Pol l'1 de novembre de 2026**: totes les recomanacions de la secció 9 acceptades. Mòbil + PC per validar. Repo públic `poldpm/robomon`. Sense compte d'alumne de prova. Inici: dimecres 11 de novembre (grup 2). Il·lustracions: SVG fetes per Claude.
>
> Escala afegida en construir: **present sense cap registre = 2**.
> Encara no he vist cap fitxer existent: a la carpeta de treball no hi ha res. Per a les fases 5 i 7 em cal que me'ls passis (llista a la secció 8).

---

## 1 · ARQUITECTURA

### 1.1 · Tres peces, un sol Sheet

```
┌────────────────────────┐      ┌──────────────────────────┐
│ B · EL MÓN (alumne)    │      │ A · ADMINISTRADOR (tu)   │
│ Projecte Apps Script 1 │      │ Projecte Apps Script 2   │
│ Accés: tota l'org.     │      │ Accés: NOMÉS TU          │
│ Executa com: tu        │      │ Executa com: tu          │
└──────────┬─────────────┘      └────────────┬─────────────┘
           │ google.script.run               │ google.script.run
           ▼                                 ▼
      ┌─────────────────────────────────────────────┐
      │ Google Sheet «ROBOMON-DADES»              │
      │ Unitat compartida del centre                │
      │ Només el mestre hi té accés                 │
      └─────────────────────────────────────────────┘

   GitHub Pages (BiblioWeb): NOMÉS pòsters per imprimir/projectar
   i la còpia estàtica del Pla B2. Cap dada d'alumne.
```

**Per què dos projectes i no un amb `?vista=admin`:** a Apps Script, **qualsevol funció global
d'un projecte es pot cridar des de la consola del navegador** amb `google.script.run.nomFuncio()`.
Si l'administrador i el món comparteixen projecte, un nen amb curiositat i F12 pot cridar
`posaNota()`. Amb dos projectes, el del món **no conté cap funció de mestre**: no hi és ni amagada.
És la mateixa regla de BiblioWeb (activitat / recurs), aplicada al servidor.

### 1.2 · Regles de seguretat del projecte del món

- La identitat **sempre** la resol el servidor (`Session.getActiveUser()` o testimoni del Pla B).
  El client **mai** envia «soc l'A017».
- Cada funció només llegeix i escriu **la fila d'aquest alumne**. Cap funció retorna dades d'un altre.
- Les respostes correctes de les preguntes **viuen al Sheet**, mai a l'HTML (Ctrl+U no serveix de res).
- Les pistes sí que poden anar a l'HTML: no puntuen.

### 1.3 · El camí d'una dada (del clic a la nota)

| # | Qui | Què passa | Temps |
|---|---|---|---|
| 1 | Nen | Clica «Ho he fet ✓». La pantalla canvia **a l'instant** (estat local) | 0 s |
| 2 | Món | Envia el lot d'esdeveniments: `registra([...])` | <2 s |
| 3 | Servidor | `LockService` → 1 `appendRow` a `REGISTRE` + 1 `setValues` a la fila de `PROGRES` | <1 s |
| 4 | Admin | El teu tauler consulta el grup cada **10 s** (1 sola lectura) i hi veus el canvi | ≤10 s |
| 5 | Tu | Valides el nivell 2 amb un clic → `PROGRES` es posa al dia → `nota_auto` es recalcula | <2 s |
| 6 | Món | El Chromebook del nen consulta el seu estat cada **30 s** i encén la llum | ≤30 s |
| 7 | Tu | Al final del trimestre: menú **RoboMón → Prepara l'informe** → pestanya `INFORME` | 1 clic |

**Si falla la xarxa:** el client guarda els esdeveniments pendents en una «bústia de sortida» a
`localStorage` i els reenvia sols. `localStorage` només fa de bústia, **mai** de magatzem de notes:
la nota existeix només quan el Sheet ha confirmat.

**Càrrega:** 18 nens × ~7 enviaments per sessió + consultes cada 30 s ≈ 40 crides/minut.
Molt lluny de qualsevol quota. El que importa és que **cap clic esperi el servidor**.

### 1.4 · Identitat: Pla A, Pla B, Pla C

| Pla | Com entra el nen | Quan s'usa |
|---|---|---|
| **A** | Obre el marcador del Chromebook. Ja és ell. 0 clics | Per defecte |
| **B1** | Mateixa URL. Si el servidor no rep correu: tria el seu nom (nom + inicial) → 3 imatges | Si `getActiveUser()` torna buit |
| **B2** | Còpia estàtica del món a GitHub Pages («Alumnes») que parla amb un desplegament anònim via `fetch` POST `text/plain` (la teva lliçó de CORS). Codi de classe + nom + 3 imatges | Si el domini bloqueja l'script per als alumnes |
| **C** | Ningú toca el Chromebook. Tu marques els nivells des del tauler | Si tot cau |

Clau de disseny: **el mateix HTML del món** funciona amb A, B1 i B2. Només canvia una capa
`envia(accio, dades)` que parla amb `google.script.run` o amb `fetch`. Així el Pla B no és un
segon programa que es podreix: és el mateix provat per un altre cable.

I la idea més important de totes: **la sessió no depèn del Chromebook del nen.** La nota surt de
la teva validació. Si el món no carrega, la sessió es fa igual (Pla C) i tu ho omples des del tauler.

Pla B: el PIN de 3 imatges (de 9) es crea a la sessió 1. Límit de 5 intents per alumne i hora.
La llista de noms només es mostra amb la sessió oberta i el codi de classe del dia. **El B2
(punt anònim) cal comentar-lo amb el DPD** abans de fer-lo servir.

---

## 2 · ESTRUCTURA DEL GOOGLE SHEET

Clau de tot: **`id_alumne`** (A001…A073). El correu és l'enllaç amb Google; el nom complet
només surt a l'informe.

| Pestanya | Una fila és… | Files | Columnes |
|---|---|---|---|
| `ALUMNES` | un alumne | 73 | `id_alumne` · `correu` · `grup` (G1–G4) · `nom_curt` (nom + inicial) · `nom_complet` (només per a l'informe) · `pin_hash` · `avatar` (codi curt, p. ex. `c3-p2-a5`) · `actiu` |
| `CALENDARI` | grup × sessió | 36 | `grup` · `sessio` (S1–S9) · `data` · `estat` (pendent / oberta / tancada / fusionada) · `fusionada_amb` (per a la S6 elàstica) |
| `MISSIONS` | un element d'una missió | ~200 | `sessio` · `tipus` (nivell / control / pista / pregunta / variant / represa) · `ordre` · `text` · `imatge` · `opcions` · `correcta` · `estat` (esborrany / publicada) |
| `EQUIPS` | alumne × sessió | ≤657 | `id_alumne` · `sessio` · `equip` · `variant` (A/B/C…) · `rol` |
| `REGISTRE` | un esdeveniment | ~7.000 | `moment` · `id_alumne` · `sessio` · `esdeveniment` · `valor` · `origen` (alumne / mestre) |
| `PROGRES` | alumne × sessió | ≤657 | `clau` (`A017·S4`) · `id_alumne` · `grup` · `sessio` · `present` · `nivell` (0–3) · `via_n2` (funciona / diagnòstic) · `ha_fallat_i_arreglat` · `pla_previ` · `encallat_on` · `sortida_encerts` · `espera` (ajuda / demo / —) · `espera_des_de` · `nota_auto` · `ajust` · `nota` · `observacio` |
| `INFORME` | un alumne | 73 | `nom_complet` · `grup` · S1…S9 · `mitjana` · `qualificacio` (NA/AS/AN/AE) · `carnet_eines` · `comentari_suggerit` · `comentari_final` |
| `MON` | una zona | 9 | `zona` (Z1–Z9) · `nom` · `color` · `dibuix` ← **la capa de ficció, sencera aquí** |
| `CONFIG` | un paràmetre | ~15 | correu mestre, codi de classe, `PESOS`, llindars NA/AS/AN/AE, fita de grup |
| `ERRORS` | un error | — | com ara |

- `REGISTRE` és **només afegir** (mai s'esborra ni s'edita): és la traça si cal revisar una nota.
- `PROGRES` és l'estat actual, i es pot **reconstruir sencer** des de `REGISTRE`
  (menú **RoboMón → Recalcula notes**, hereu del teu `recalcularNotes()`).
- Les 36 files de `CALENDARI` i les files de `PROGRES` d'un grup es creen quan **obres la sessió**:
  així cap escriptura d'alumne ha de buscar ni inserir files, només sobreescriure la seva.
- **Les pestanyes v3 (`RESPOSTES`, `DETALL`, `PLANS`, `DEPURACIO`) es jubilen.** La seva lògica
  de puntuació passa a la funció `calculaNota()` (secció 7.3).
- Final de curs: menú **RoboMón → Esborra les dades del curs** (buida tot menys `MISSIONS`,
  `MON` i `CONFIG`, que són teus i es reaprofiten l'any vinent).

---

## 3 · L'ESTRUCTURA DEL MÓN

### 3.1 · L'esquelet (no depèn de cap ficció)

```
Z1 ── Z2 ── Z3 ── Z4 ── Z5 ── Z6 ── Z7 ── Z8 ── Z9
S1    S2    S3    S4    S5    S6    S7    S8    S9
Ozo   Scot  Ozo   Dash  SPIKE SPIKE Scr   Scr   Totes
```

**Dues regles de desbloqueig, i és important que siguin dues:**

| | Qui obre | Per a qui |
|---|---|---|
| **La zona** (la porta) | **Tu**, des de l'administrador, el dia de la sessió | **Tot el grup** |
| **Els nivells** (dins la zona) | En cadena: N2 només després de N1, N3 només després de N2 | **Cada nen** |

Per què la porta no és personal: si un nen no arriba a N1 a la S3 i això li tanqués la S4,
es quedaria sense tocar el Dash. Això trencaria el principi 4 (tothom toca totes les eines).
La sensació de «fins que no passes la prova no s'obre la següent» es manté **dins** de cada
sessió, que és on té sentit pedagògic.

**Com es veu una zona al mapa de cada nen:**

| Estat | Aspecte |
|---|---|
| Tancada | Gris clar, amb cadenat etiquetat «Aviat» |
| Oberta, sense fer | Color suau amb contorn |
| N1 | Color ple |
| N2 | Color ple + apareix l'element de la zona (casa, arbre, torre…) |
| N3 | + un detall petit (bandera, llum). **Discret a propòsit** (vegeu 7.1) |
| Absent | Igual que «oberta». Mai marcat en vermell ni amb creu |

Una sola animació: quan una zona canvia d'estat, **un fos d'1 segon, sense so**. Res més.

### 3.2 · Què col·lecciona l'avatar

1. **El carnet d'eines** (el col·leccionable important): 5 segells, un per eina
   (Scottie · Ozobot · Dash · SPIKE · Scratch). Un segell s'encén quan el nen té **un N2 amb
   aquella eina**. És el principi 4 fet visible: el nen veu quines eines domina, i tu també.
2. **Una peça d'avatar per zona** amb N1 (barret, motxilla, color, mascota…). Te la dona el món,
   sense triar: zero clics.
3. **La fita de grup** (cooperativa): una peça compartida del mapa que s'encén quan el grup
   arriba a una xifra conjunta (p. ex. «15 de 18 amb N2»). Només es veu el **total**, mai noms.

### 3.3 · La capa de ficció

El codi només coneix `Z1…Z9`. Els noms, colors i dibuixos són a la pestanya `MON`.
L'administrador tindrà un interruptor **«Noms genèrics»** que substitueix tot per «Zona 1, Zona 2…»:
és la prova de la secció 3.2 del teu document, feta botó. Si amb l'interruptor encès alguna cosa
deixa de funcionar, és un error meu.

### 3.4 · Tres propostes de món

**A · L'Arxipèlag** *(la que recomano)*
- Mar blau clar, 9 illes de formes i colors diferents, unides per una ruta de punts.
- L'avatar va en una barqueta que s'atura a l'última illa on has estat.
- Zones: Illa Rodona · Illa dels Pins · Illa Llarga · Illa del Pont · Illa de les Roques · Illeta · Illa dels Estels · Illa de la Torre · Illa Gran.
- Fita de grup: el far del mig del mar s'encén.
- Per què la recomano: és horitzontal (cap a la pantalla apaïsada sense scroll) i l'**Illeta** (S6) pot quedar enganxada a la seva veïna si la sessió es fusiona.

**B · La Muntanya**
- Un camí en ziga-zaga de la vall al cim, amb 9 parades.
- L'avatar porta motxilla i puja una parada a cada sessió.
- Zones: El Prat · La Font · El Bosc · El Pont Penjat · Les Roques · El Mirador · El Refugi · El Llac · El Cim.
- Fita de grup: una bandera al cim.
- Pega: és vertical; cal ziga-zaga ampla perquè hi càpiga.

**C · El Planeta Rodó**
- Un planeta petit vist de dalt, amb 9 regions de colors com un pastís.
- L'avatar porta escafandre i el seu coet aparcat a la darrera regió.
- Zones: Vall Blava · Turó Groc · Prats Verds · Dunes · Cràters · Racó Petit · Boscos Lila · Gelera · Pol Nord.
- Fita de grup: una estrella nova al cel.
- Pega: costa més de dibuixar sense que sembli un gràfic de formatges.

Les tres passen la prova: cap nom diu què s'hi fa, cap zona demana recordar res, no hi ha
personatges ni trama, ni residus, ni guerra, ni competició.

---

## 4 · UNA SESSIÓ, PANTALLA PER PANTALLA

### 4.1 · L'horari real (dimecres)

| Hora | Què | Min | Pantalla |
|---|---|---|---|
| 14:50–14:55 | Trasllat | 5 | — |
| 14:55–15:03 | Desplegament (ells) | 8 | — |
| 15:03–15:07 | **Represa** a la Promethean: 1 frase + la missió del dia | 4 | Projector |
| 15:07–16:15 | **Treball**: N1 → N2 → N3 | 68 | Chromebook ~4 min |
| 16:15–16:22 | **Targeta de sortida** + fita de grup projectada | 7 | Chromebook ~4 min |
| 16:22–16:28 | Marge (imprevistos) | 6 | — |
| 16:28–16:40 | Recollida | 12 | — |
| 16:40–16:45 | Tornada | 5 | — |

Temps de pantalla per nen: **8–10 minuts**. Per sota dels 15.

### 4.2 · Les pantalles del món (camí sense entrebancs)

| # | Pantalla | Què hi veu | Clic |
|---|---|---|---|
| 0 | — | Obre el marcador «RoboMón» | **1** |
| 1 | **El meu món** | Mapa, avatar, la zona d'avui oberta i brillant, botó gran «Missió d'avui» | **2** |
| 2 | **Missió** | Una frase. «Ets al **robot 2**. La teva variant: **B**». Dibuix del N1. *(Només a les sessions amb predicció: una pregunta de 3 opcions amb dibuix, ABANS de tocar el robot)* | (**3**) |
| — | *El nen treballa amb el robot. La pantalla queda quieta.* | | |
| 3 | **Control N1** | «L'Ozobot ha arribat a la teva casella?» `Sí ✓` · `No me n'he sortit` | **4** |
| 4 | **Nivell 2** | «Ensenya-ho al mestre i explica-li-ho.» `Ja ho puc ensenyar` | **5** |
| — | *Entra a la cua del teu tauler. Tu vens, mira, valides. La llum s'encén sola.* | | |
| 5 | **Nivell 3** | «Agafa la carta de repte extra.» `Ja ho puc ensenyar` | (**6**) |
| 6 | **Targeta de sortida** | P1: què t'ha fallat avui (4 dibuixos) · P2: una pregunta de l'eina (3 dibuixos) · Com t'ha anat (3 cares) | **7·8·9** |
| 7 | **Fet** | La zona canvia de color. Es tanca sola en 5 s | — |

**Total: 7 clics** (sense predicció ni N3) · **9 clics** (amb predicció i N3).

### 4.3 · El camí de «no me n'he sortit»

| # | Pantalla | Clic |
|---|---|---|
| 3b | `No me n'he sortit` | +1 |
| 3c | **On t'has encallat?** 4 dibuixos: `No l'he sabut muntar` · `No s'encén / no connecta` · `Fa una altra cosa` · `No sé què he de fer` | +1 |
| 3d | **Pista** amb dibuix (la de la teva tria) + `Ho torno a provar` · `Necessito ajuda` | +1 |

Encara que passi pel camí llarg dues vegades, **un nen encallat no passa de 10 clics**,
perquè no fa N2 ni N3. `Necessito ajuda` el posa a la cua d'ajuda (que al teu tauler va
**davant** de la de demostracions).

### 4.4 · El que no hi ha

- Cap pantalla de «benvinguda», ni «llegeix les instruccions», ni «escull equip»: l'app ja sap
  qui és, quin equip té, quin robot i quina variant (ho crea `EQUIPS` quan obres la sessió).
- Cap navegació lliure pel mapa: es mira, no es fa servir. Tocar una zona antiga només ensenya
  què hi vas aconseguir (1 clic, i torna sol).
- Cap scroll, cap arrossegar. Botons de **2 × 2 cm** com a mínim, lletra de **22 px** de base
  (més que els 14 pt mínims), màxim **Bold 700**, contrast ≥ 4,5:1.

### 4.5 · El teu tauler (administrador) durant la sessió

```
┌───────────────────────────────────────────────┬──────────────────┐
│  G2 · S4 Dash Cargo · 15:42                   │  🆘 AJUDA (2)    │
│                                               │  Martí M. · 3 min│
│  [Anna R ●●○]  [Biel C ●○○]  [Carla P ●●●]   │  Júlia F. · 1 min│
│  [Dani S ○○○]  [Èlia V ●●○]  [Ferran ●○○]    │──────────────────│
│  …18 targetes, cap scroll…                   │  👁 DEMOSTRAR (3) │
│                                               │  Biel C · N2     │
│  Fita del grup: 9 / 15 amb N2                 │  Ferran · N2     │
└───────────────────────────────────────────────┴──────────────────┘
```

Toques un nom de la cua → tres botons grans:
`Funciona i ho explica` · `No funciona, però sap per què` · `Encara no`.
**Un clic per validar.** Una versió del mateix tauler adaptada al mòbil et permet fer-ho
caminant entre taules (decisió 4).

### 4.6 · La finestra de projecció

Finestra separada (`?vista=projeccio`) que **no pot mostrar noms per construcció**: el servidor
li dona només dades agregades. Hi ha: la frase de represa, la missió del dia, el rellotge de la
sessió i la fita de grup. Així no hi ha risc de projectar el tauler per error.

---

## 5 · ELS PROBLEMES DE LA SECCIÓ 4, UN PER UN

| § | Problema | Com es resol |
|---|---|---|
| **4.2** | **Predicció absurda** | Regla al model de dades: una pregunta de predicció té `moment = abans` i **l'app la tanca quan el nen marca el primer control**. No es pot preguntar «què passarà» després de programar: l'app no ho permet. I només n'hi ha on hi ha una variable que el nen no controla: **S1** (agafarà aquesta corba?), **S4** (quantes caselles fins a la marca?), **S6** (què farà amb el cas imprevist?), **S8** (quin resultat sortirà de les dades del grup?). A S2, S3, S5 i S7 no hi ha predicció: hi ha **pla previ** (planificar abans de provar), que és una altra cosa |
| **4.2** | Preguntes que ni tu entenies | Filtre de 4 preguntes obligatori per a cada pregunta de `MISSIONS`: (1) un nen de 8 anys la respon en 10 s? (2) l'app no ho sap ja? (3) canvia la nota o una decisió teva? (4) es pot respondre amb el que té a la taula ara mateix? Si una falla, la pregunta no entra. I **pressupost: màxim 3 preguntes per nen i sessió** (predicció si n'hi ha + 2 de sortida) |
| **4.3** | Preguntes ja respostes | L'app **mai** demana: nom, grup, equip, robot, sessió, variant, ni res ja contestat. Ho té tot a `EQUIPS` i `PROGRES` abans que el nen obri el Chromebook |
| **4.4** | Massa passos | Màxim 10 clics per sessió (secció 4). Cap pantalla sense acció. La pantalla es queda quieta mentre el nen treballa |
| **4.5** | Massa suposicions | Cap pantalla diu «ara que ja has…». Cada control és una pregunta amb sortida. A les sessions de SPIKE hi ha un **control 0**: «Tens el robot muntat i encès?» abans de res |
| **4.6** | **Faltava «no me n'he sortit»** | És a **cada** control, amb la mateixa mida que el «Sí», mai en gris ni petit. Porta a pista + ajuda. **Puntua**: dir on t'has encallat dona 3 punts (4 si a la sortida diagnostica bé). El «Sí» del N1 és declarat pel nen: al tauler surt com a punt buit fins que el veus, i a la demostració el pots marcar «N1 no és cert» → torna a 2 punts. **Mentir (2) puntua menys que dir la veritat (3–4)** |
| **4.7** | Comprovacions inviables | Tot control ha de ser **visible amb els ulls en 10 segons amb el material de la taula** («ha arribat a la casella?», «el motor gira?»). Res de «comprova que funciona en tots els casos». A la fase 5 provo cada control **amb el robot de veritat** amb tu, sense alumnes |
| **4.8** | Projecte acumulatiu oblidat | Cada sessió tanca sola: N1/N2/N3 del dia, i prou. El que s'acumula és **el mapa i el carnet**, que es miren, no es recorden. Cada sessió es reprèn amb **una frase** projectada |
| **4.9** | **Passatgers** | Quatre peces: (1) **variant personal**: l'equip comparteix robot, però cada nen té la seva casella, la seva distància o el seu nivell; la resposta del veí no li serveix. (2) **Demostració individual a tu** per a N2 i N3: és el moment que no havia existit mai en vuit setmanes. (3) **Targeta de sortida individual**, corregida al servidor. (4) Regla de l'ajudant: **qui ajuda parla, no toca** (mans al darrere). L'app no té cap control d'equip: només de nen |
| **4.10** | Nota per sessió | `nota_auto` es calcula sola a cada validació. Dimecres a les 16:50 ja tens la nota dels 18 nens, i la pots ajustar |
| **4.11** | **Eix temàtic abstracte** | Desaparegut. El món és decoració (3.3), i l'interruptor «Noms genèrics» demostra que no aguanta res |

### 5.1 · Esbós de cada sessió (provisional fins que llegeixi els fitxers ACTIVITAT)

| S | Eina | Variant personal | N1 (es veu) | N2 (es demostra) | Predicció / pla |
|---|---|---|---|---|---|
| 1 | Ozobot (línia lliure) | El teu camí, dibuixat per tu | Recorre el teu camí de punta a punta | Ho ensenya i diu què ha canviat quan ha fallat | Predicció: agafarà aquesta corba? |
| 2 | Scottie Go! | Nivell diferent per nen | Resol un nivell | Resol el seu nivell amb un pla previ i explica la repetició | Pla |
| 3 | Ozobot (codis) | Casella d'arribada diferent (1–4) | Arriba a la seva casella | Diu quin codi ha fallat i com ho ha arreglat | Pla (quins codis a cada buit) |
| 4 | Dash | Distància diferent | El Dash arriba a la marca | S'atura exactament a la seva distància i explica l'ajust (sense pinça) | Predicció: quantes caselles? |
| 5 | SPIKE 1 | Funció diferent | Control 0 (muntat) + el programa fa una cosa | Assenyala sensor, actuador, programa | — |
| 6 | SPIKE 2 *(elàstica)* | Color diferent | La condició funciona | Explica el cas imprevist | Predicció: què farà amb el color que no has programat? |
| 7 | Scratch | Tecla / personatge diferent | L'esdeveniment funciona | La condició funciona i ho explica | Pla |
| 8 | Scratch | Dada diferent a comptar | El marcador compta | Explica la variable | Predicció: quin resultat sortirà? |
| 9 | Totes | **Personal**: les eines on no té segell | Una eina | Totes les que li falten | — |

**S8, dades noves (decisió 8):** dades del grup que **no comparen nens**. Proposta: llançaments de
dau, o el color preferit del grup, o quantes voltes fa l'Ozobot en un minut. Mai alçades, notes ni res personal.

**S9 personalitzada:** el teu tauler té el **carnet d'eines** dels 18 nens. La missió final de
cada nen són exactament les eines on encara no té segell. Qui ja els té tots, fa repte extra.
Això és el principi 4 convertit en una sessió: és la segona oportunitat de qui va fallar.

**S6 elàstica:** a `CALENDARI` la marques `fusionada amb S5`. Al mapa, l'Illeta s'obre amb la seva
veïna i el N1/N2 de S6 passen a ser el N3 de S5. Tu no has de tocar res més.

---

## 6 · SESSIÓ 1 NOVA: «El primer camí»

> **Substituïda el 2 de novembre de 2026** per «Primers codis» (decisió d'en Pol): sense codis de color l'Ozobot perdia la gràcia i la consigna no s'entenia.
> S1 actual: full amb línia impresa i 3 caselles; N1 = codi LENT a la casella 1; N2 = codi de la missió personal (Tornado, Ziga-zaga o Turbo) a la casella 2; N3 = carta de repte a la casella 3. Xuleta de codis oficial (Ozobot Evo, rev. 12-23) projectada, al Chromebook (botó «Codis») i en paper. Material: `materials/S1-primers-codis-RECURS/`.


**Eina proposada: Ozobot Evo, només seguint una línia negra dibuixada a mà** (sense codis de color).
No trepitja la S3 (que és codis) i la prepara: a la S3 ja sabran encendre'l, calibrar-lo i que
el gruix de la línia importa. Hi ha 6 robots: equips de 3, però **cada nen dibuixa el seu propi camí
al seu full**. Individual des del primer minut.

| Hora | Què | Min |
|---|---|---|
| 14:55–15:03 | Desplegament (primer dia: el fas tu amb ells, i aprenen la rutina de les capses) | 8 |
| 15:03–15:13 | **Entrar al món**: obren el marcador, creen l'avatar (4 tries amb dibuix: cos, color, cosa al cap, mascota) i el PIN de 3 imatges | 10 |
| 15:13–15:18 | Demostració projectada: l'Ozobot seguint una línia. Una sola consigna: «fes un camí que el robot pugui fer sencer» | 5 |
| 15:18–16:12 | **Treball**: dibuixar → predir («agafarà aquesta corba?») → provar → arreglar → demostrar | 54 |
| 16:12–16:22 | Targeta de sortida + primer canvi de color de la zona + la fita de grup | 10 |
| 16:22–16:40 | Marge + recollida | 18 |

- **N1:** l'Ozobot fa el teu camí de punta a punta.
- **N2:** ho ensenyes i dius què has canviat quan ha fallat (gruix, corba massa tancada, línia trencada).
- **N3:** un camí amb una corba molt tancada o un encreuament que el robot superi.
- La S1 serveix també per **aprendre el sistema**: el control, el «no me n'he sortit», la cua de
  demostració. Ho practiquen el dia que menys en depèn.

Alternativa (decisió 2): Scottie Go!, si vols que el primer dia ensenyi la rutina d'entrada.

---

## 7 · NIVELL 3, QUI NO ARRIBA A N1, I LA NOTA

### 7.1 · Nivell 3 sense cursa

- **Hi pot arribar tothom que tingui N2.** No hi ha places ni hora límit pròpia.
- **És una carta de paper a la taula**, no a la pantalla (Ctrl+U no la revela, i no es veu qui la té).
- **No és «més del mateix més ràpid»**: és un problema diferent (una corba impossible, un cas rar).
  Anar ràpid no hi ajuda; pensar sí.
- **No cal per a la nota alta:** N2 ja és AN. El N3 dona el pas a AE.
- **Al mapa, el N3 és un detall petit** (una bandereta), no un trofeu. Ningú veu el mapa d'un altre
  des del servidor, i el detall és prou discret perquè el del costat no ho noti.
- **Qui té N2 i no vol N3 pot ser ajudant** (parla, no toca). Ajudar és la part cooperativa;
  el repte contra el problema és la part competitiva. **Ningú competeix contra ningú.**

### 7.2 · Qui no arriba a N1: tancament digne

1. **Sempre té on dir-ho** (`No me n'he sortit`), i dir-ho **ja puntua**.
2. **Té ajuda prioritària**: la cua d'ajuda va davant de la de demostracions.
3. **Té la targeta de sortida igual que tothom**: la P1 («què t'ha fallat?») és exactament el
   diagnòstic, i és la seva via cap als punts. Un diagnòstic correcte és evidència (el teu criteri clau).
4. **La seva zona canvia igualment** a «oberta i treballada». Mai una creu ni un vermell.
5. **Té segona oportunitat** a la S9 (missió personal per les eines que li falten).

### 7.3 · Escala de nota per sessió (a validar, decisió 6)

| Situació | Nota |
|---|---|
| Absent | *(buit: no compta, no és un 0)* |
| Present, sense cap registre (o N1 rebutjat) | 2 |
| Ha treballat, no arriba a N1, i diu honestament on s'ha encallat | 3 |
| + diagnòstic correcte a la targeta de sortida | 4 |
| **N1** | 5 |
| N1 + pla previ o predicció feta | 6 |
| **N2** · «No funciona, però sap per què» | 7,5 |
| **N2** · «Funciona i ho explica» | 8 |
| **N2** · ha fallat, ho ha diagnosticat i ho ha arreglat | 8,5 |
| **N3** | 9 |
| **N3** + explicat | 10 |
| Ajust teu | ±1, amb observació |

- **Es conserva la lògica de la v3:** diagnosticar puntua gairebé com encertar (7,5 vs 8), i
  **fallar-diagnosticar-arreglar puntua més que encertar a la primera** (8,5 vs 8). Els valors viuen
  a `CONFIG` dins `PESOS`, on la clau `vies` passa a dir-se `nivells`. Quan vegi el teu backend,
  hi encaixo les claus `plans` i `depuracio` tal com són.
- L'app ja sap si «ha fallat i arreglat» perquè el nen va marcar `No me n'he sortit` abans:
  **tu no hi has de fer cap clic de més**.
- Llindars de l'informe: **NA < 5 · AS 5–6,9 · AN 7–8,9 · AE ≥ 9** (editables a `CONFIG`).

---

## 8 · ORDRE DE CONSTRUCCIÓ

| Fase | Què | Es pot provar sense alumnes? |
|---|---|---|
| **0** | Em passes els fitxers existents (llista a sota) i em respons la secció 9 | — |
| **1** | **Prova d'identitat**: un «hola, qui ets?» de 20 línies desplegat des de la unitat compartida | ❌ **Cal un compte real d'alumne en un Chromebook.** És la primera cosa perquè ho decideix tot |
| **2** | Sheet + servidor: `ALUMNES`, `CALENDARI`, `PROGRES`, `calculaNota()`, bloquejos. Banc de proves que simula 20 nens escrivint alhora | ✅ Ho provo jo i t'ensenyo el resultat |
| **3** | Administrador: tauler, cues, validació, notes, informe, projecció | ✅ Tu sol |
| **4** | El món: mapa amb el món triat, avatar, missió, controls, «no me n'he sortit», targeta de sortida, Pla B1 | ✅ Amb el teu compte i un mode de prova que simula un alumne (només al desplegament de proves) |
| **5** | Contingut: S1 nova + missions S2–S9 reescrites amb el filtre de la secció 5 | ✅ Però **cal que provis cada control amb el robot de veritat** (sense alumnes) |
| **6** | Pla B2 (GitHub Pages + punt anònim) | ✅ Tècnicament; ❌ cal saber què bloqueja la xarxa de l'escola |
| **7** | **Assaig general**: 2–3 comptes d'alumne alhora, Promethean, xarxa de l'escola, Pla B i Pla C en fred | ❌ Chromebooks i comptes reals |
| **8** | Materials: retirar el que és de residus. **Abans de tocar cap RECURS t'ho dic**: com a mínim S1 (jubilat), S3 (missions «cap a la via E») i S8 (dades de residus) en necessitaran canvis | ✅ |

**Fitxers que em calen:** els 16 `S2…S9-ACTIVITAT/RECURS`, el backend v3 (`.gs`),
`MATERIALS-IMPRIMIR`, `CARTELLS` i `TALLER-3r-PENDENTS.md`. La `GRAELLA-OBSERVACIO` (73 noms)
**no me la passis**: no cal per construir, i el llistat d'alumnes ja el carregaràs tu al Sheet.

---

## 9 · DECISIONS QUE HAS DE PRENDRE TU

| # | Decisió | Recomano | Per què |
|---|---|---|---|
| 1 | Quin món | **A · L'Arxipèlag** | Horitzontal, sense scroll, i l'Illeta resol la S6 elàstica |
| 2 | Eina de la S1 | **Ozobot amb línia a mà** | Robot a les mans, individual, prepara la S3 sense trepitjar-la |
| 3 | Qui valida N2 i N3 | **Tu, per demostració (1 clic)** | És l'única evidència individual de veritat. ~18 demos × 45 s ≈ 14 min repartits en 68 |
| 4 | Amb què valides a l'aula | **El mòbil (tauler adaptat)** i el PC de reserva | Així no et quedes clavat a la taula. Si no vols fer servir el mòbil, tot funciona igual des del PC |
| 5 | La porta de la zona | **L'obres tu per a tot el grup**; els nivells, en cadena per nen | Ningú es queda sense tocar un robot per haver fallat la setmana anterior |
| 6 | Escala de nota (7.3) | **La de la taula** | Conserva «diagnosticar ≥ encertar» i fa que dir la veritat puntuï |
| 7 | Nota final del taller | **Mitjana de les sessions presents; la S9 compta doble** | La S9 és la demostració de totes les eines |
| 8 | Dades de la S8 | **Llançaments de dau** | Dades reals, de la classe, i no comparen ningú |
| 9 | Equips | **Automàtics en obrir la sessió, nous cada setmana** | Trenca els passatgers fixos; tu els pots canviar amb un clic |
| 10 | Pla B | **B1 sempre + B2 provat** (comentant el B2 amb el DPD) | El B1 costa poc; el B2 és el que salva el dia si l'script està bloquejat |
| 11 | Il·lustracions de les preguntes | **Dibuixos SVG fets per mi, dins l'HTML** | Autocontingut, sense xarxa. Si prefereixes fotos teves dels robots, et dic quines calen (unes 20) |
| 12 | Repositori | **Un repo nou privat**, p. ex. `poldpm/robomon` | Ara la carpeta de treball no és cap repo: no puc fer `pull` ni `push` fins que en tinguem un |
| 13 | Compte d'alumne de prova | **Demanar-lo al coordinador TIC aquesta setmana** | La fase 1 no es pot fer sense |
| 14 | Data | **Quin dimecres comença el grup 2?** | Marca quan ha d'estar llesta la S1 i quines fases han d'anar abans |

Tipografia (no cal decidir-la, però que ho sàpigues): **Andika**, incrustada dins l'HTML,
amb la pila `"Andika", "Atkinson Hyperlegible", Verdana, "Segoe UI", Arial, sans-serif`.
Màxim Bold 700. Sense Impact.
