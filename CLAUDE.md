# RoboMón (Taller de 3r) · instruccions per a Claude

- **Sempre en català**: interfície, textos, noms visibles, missatges de commit i conversa.
- **`git pull` en començar; `commit` + `push` en acabar cada canvi acabat**, sense esperar que en Pol ho demani.
- **QA abans de dir que una cosa està feta**: `node eines/construeix.mjs && node proves/proves.mjs` (han de passar totes) i mirar les captures de `proves/captures/`.
- En Pol **no copia fitxers a mà**: després de fer push, digues-li que premi **Tauler → Sessions → Actualitza des de GitHub** (puja `apps-script/` als dos projectes i actualitza els desplegaments). Si canvia el manifest de l'administrador (permisos nous), avisa'l que Google li demanarà acceptar-los.
- Disseny: **màxim Bold 700** (mai 800/900/Black), cap Impact, lletra Lexend incrustada (400/600/700), contrast ≥ 4,5:1, botons ≥ 2×2 cm, **cap scroll** a les pantalles dels alumnes, cap arrossegar, cap so, cap animació constant.
- Estil visual: l'Arxipèlag il·lustrat (mapa pictòric, sorra/boira, mar fosc, daurat per al progrés). Res de ninots infantils ni contorns gruixuts: en Pol ho va rebutjar.
- Imatges noves: generar-les amb IA en graelles (fons crema llis), retallar-les a `src/imatges/*.webp` i referenciar-les a `illustracions.js`. Els esquemes de línies, en SVG amb el mateix llenguatge (full blanc, marc fi, robot blanc).
- **Mai `//` dins dels `<script>`** (ni comentaris ni `http://`): Google (HtmlService) esborra la resta de la línia i trenca el codi. Comentaris amb `/* */`, SVG sense `xmlns`. `construeix.mjs` ho comprova i el simulador ho imita.
- SVG: res de `<pattern>` ni `url(#id)`. `[hidden]{display:none!important}` i una sola `tancaModal()`.
- Seguretat: al projecte del món, **només `api`, `doGet` i `doPost` poden ser funcions sense `_` final**. Les respostes correctes mai arriben al navegador de l'alumne. Mai dades d'un alumne a un altre. Mai noms a la projecció.
- PROGRES té dos blocs: el món només escriu el bloc de l'alumne; l'administrador només el del mestre.
- **Mai** recuperar res de residus, 3 R, reciclatge ni contenidors. El món (l'Arxipèlag) és només decoració.
- En Pol decideix si té temps per fer una cosa. No proposis versions reduïdes «per falta de temps».
- Per redactar o revisar una missió (S2–S9): skill `missio-taller`.
