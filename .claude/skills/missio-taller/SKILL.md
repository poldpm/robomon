---
name: missio-taller
description: Redactar, revisar o publicar la missió d'una sessió del Taller de 3r (S1–S9) a la pestanya MISSIONS i a la llavor de l'administrador. Fes-la servir sempre que en Pol demani preparar una sessió, passar un fitxer ACTIVITAT antic a una missió nova, afegir preguntes, pistes, variants o il·lustracions, o revisar si una pregunta té sentit.
---

# Redactar una missió del Taller de 3r

Una missió és un conjunt de files de la pestanya `MISSIONS` (columnes: `sessio, tipus, clau, ordre, text, imatge, opcions, correcta, estat`). La llavor és a `apps-script/admin/Codi.gs` → `sembraMissions_()`. En Pol també les pot editar a l'administrador (pestanya Missions).

## Els tipus de fila

| tipus | clau | text | imatge | opcions | correcta |
|---|---|---|---|---|---|
| missio | titol · frase | títol · la frase de represa del dia (una sola) | — | — | — |
| abans | prediccio | pregunta de predicció o de pla | dibuix | `clau\|text\|dibuix;…` (3 opcions) | — (no puntua l'encert) |
| control | c0 · n1 | pregunta de comprovació (sí / no me n'he sortit) | dibuix | — | — |
| nivell | n1 · n2 · n3 | objectiu del nivell | dibuix | — | — |
| encallat | clau curta | on s'encalla (4 com a màxim) | dibuix | **text de la pista** | **dibuix de la pista** |
| sortida | diag · eina · com | pregunta de la targeta de sortida | dibuix | `clau\|text\|dibuix;…` | clau correcta (diag i eina) |
| variant | A, B, C… | què té de diferent cada alumne de l'equip | — | — | — |

## Les regles (secció 4 del pla: és per això que existeix l'app)

1. **Filtre de 4 preguntes** per a cada pregunta. Si en falla una, no entra:
   - Un nen de 8 anys la respon en 10 segons?
   - L'app no ho sap ja? (nom, grup, equip, robot, variant, respostes anteriors: MAI es pregunten)
   - Canvia la nota o una decisió del mestre?
   - Es pot respondre amb el que té a la taula ara mateix?
2. **Predicció només abans de provar** i només si hi ha una variable que el nen no controla (S1, S4, S6, S8). A S2, S3, S5, S7: *pla previ*, no predicció. Mai «què creus que passarà?» després de programar.
3. **Controls observables en 10 segons amb els ulls** («ha arribat a la casella?», «el motor gira?»). Mai «comprova que funciona en tots els casos».
4. **Cap suposició**: res de «ara que ja has muntat…». A SPIKE hi ha `control c0`: «Tens el robot muntat i encès?».
5. **Variant personal** a cada sessió amb robot compartit: que la resposta del company no serveixi.
6. **Pressupost**: com a màxim 3 preguntes per nen i sessió (predicció si n'hi ha + 2 de sortida). ≤ 10 clics per sessió.
7. **Text**: frases curtes, una idea per frase, vocabulari de 3r. Cap text d'ambientació, cap personatge, cap història. El món és decoració.
8. **Zero residus, 3 R, reciclatge o contenidors.** Les sessions S3 i S8 antigues en tenien: s'han de reetiquetar (S3: caselles numerades; S8: dades que no comparin nens, p. ex. llançaments de dau).
9. La pregunta `diag` de la sortida ha de ser un **diagnòstic** (una situació de fallada i per què passa). Les opcions incorrectes han de ser plausibles, no absurdes.
10. Les respostes correctes **mai** van a l'HTML: només al full (columna `correcta`).

## Lliçons de la S1 (en Pol, 1/11/2026) — aplica-les sempre

- La consigna diu **què fan les mans i què han de veure**; s'ha d'entendre sense el material al davant.
- La missió fa servir **el que fa especial l'eina** (codis, cartes i repetició, distància i girs (Dash sense pinça), sensor i motor, esdeveniments i variables).
- Cada sessió té **xuleta** (`missio · xuleta`): projectada, botó «Codis» al Chromebook i paper a la taula. Contingut de **fonts oficials** o dels materials d'en Pol, mai de memòria.
- `control c0` per al primer pas amb el robot (calibrar, encendre, connectar, muntar).
- Si el pla és per al nivell 2, `abans` amb clau **`pla-n2`** (surt just abans del N2).
- Si la sessió demana escriure o entrar a un servei, una **projecció d'ajuda** («Com entrar»).
- Repàs complet i pendents per sessió: `docs/REPAS-MISSIONS.md`.

## Il·lustracions

- **Escenes** (robot, persones, objectes): imatges generades amb IA en una **graella sobre fons crema llis (#F3EEE4)**, totes amb el mateix estil que les de la S1. Es retallen a `src/imatges/<clau>.webp` (≈320 px d'amplada) i s'afegeixen a l'objecte `IL` de `src/comu/illustracions.js` amb `img('<clau>')`.
- **Esquemes** (línies, distàncies, connexions): SVG amb la funció `esquema()` (full blanc, marc fi, robot blanc). Res de `<pattern>` ni `url(#id)`.
- Res d'estil infantil: ni ninots amb ulls de botó ni contorns gruixuts de dibuix animat.
- Totes les opcions porten text a sota (una icona sola no s'entén).

## Abans de dir que està fet

1. Actualitza `sembraMissions_()` si és la llavor, o dona a en Pol les files per enganxar.
2. `node eines/construeix.mjs && node proves/proves.mjs` → tot verd.
3. Mira les captures de la missió nova a 1366×625 (sense scroll, botons ≥ 2 cm).
4. Fes el RECURS de la sessió a `materials/SN-…-RECURS/` (de la S3 a la S9: afegeix les dades a `eines/genera-materials.mjs` i executa'l) (guió minut a minut, targeta de demostració amb les 2 preguntes fixes, solucionari, cartes de repte extra) i el PDF amb `node eines/pdf-materials.mjs`.
5. Commit + push.
