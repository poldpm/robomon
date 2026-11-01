# Taller de 3r · instruccions per a Claude

- **Sempre en català**: interfície, textos, noms visibles, missatges de commit i conversa.
- **`git pull` en començar; `commit` + `push` en acabar cada canvi acabat**, sense esperar que en Pol ho demani.
- **QA abans de dir que una cosa està feta**: `node eines/construeix.mjs && node proves/proves.mjs` (han de passar totes) i mirar les captures de `proves/captures/`.
- Lliura **fitxers sencers**: en Pol els enganxa a l'editor d'Apps Script. Digues sempre quins fitxers d'`apps-script/` han canviat.
- Disseny: **màxim Bold 700** (mai 800/900/Black), cap Impact, lletra Andika incrustada, contrast ≥ 4,5:1, botons ≥ 2×2 cm, **cap scroll** a les pantalles dels alumnes, cap arrossegar, cap so, cap animació constant.
- SVG: res de `<pattern>` ni `url(#id)`. `[hidden]{display:none!important}` i una sola `tancaModal()`.
- Seguretat: al projecte del món, **només `api`, `doGet` i `doPost` poden ser funcions sense `_` final**. Les respostes correctes mai arriben al navegador de l'alumne. Mai dades d'un alumne a un altre. Mai noms a la projecció.
- PROGRES té dos blocs: el món només escriu el bloc de l'alumne; l'administrador només el del mestre.
- **Mai** recuperar res de residus, 3 R, reciclatge ni contenidors. El món (l'Arxipèlag) és només decoració.
- En Pol decideix si té temps per fer una cosa. No proposis versions reduïdes «per falta de temps».
- Per redactar o revisar una missió (S2–S9): skill `missio-taller`.
