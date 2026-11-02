// ============================================================
//  genera-materials.mjs — Genera el material imprimible (RECURS) de la S3 a la S9
//  a partir de les MATEIXES missions de la llavor (apps-script/admin/Codi.gs):
//  el solucionari, les pistes i la targeta de sortida sempre coincideixen amb l'app.
//  Ús: node eines/genera-materials.mjs && node eines/construeix.mjs
// ============================================================
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const ARREL = join(dirname(fileURLToPath(import.meta.url)), '..');
const llegeix = r => readFileSync(join(ARREL, r), 'utf8');
const ctx = {}; vm.createContext(ctx);
vm.runInContext(llegeix('apps-script/comu/Comu.gs') + '\n' + llegeix('apps-script/admin/Codi.gs'), ctx);
const LLAVOR = ctx.missionsPerDefecte_();
const esc = t => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/* Les files de la llavor, en un objecte còmode */
function missio(s) {
  const m = { nivells: {}, controls: {}, encallat: [], sortida: [], variants: [], abans: null };
  LLAVOR[s].forEach(([, tipus, clau, , text0, imatge, opcions, correcta]) => {
    const text = String(text0).replace(/\{teva:([^}]*)\}/g, '$1');   /* al paper, el text general */
    const ops = () => String(opcions).split(';').filter(Boolean).map(o => { const p = o.split('|'); return { clau: p[0], text: p[1], imatge: p.slice(2).join('|') }; });
    if (tipus === 'missio') m[clau] = text;
    if (tipus === 'nivell') m.nivells[clau] = text;
    if (tipus === 'control') m.controls[clau] = text;
    if (tipus === 'abans') m.abans = { clau, text, opcions: ops() };
    if (tipus === 'encallat') m.encallat.push({ text, pista: opcions });
    if (tipus === 'sortida') m.sortida.push({ clau, text, opcions: ops(), correcta });
    if (tipus === 'variant') m.variants.push({ clau, text });
  });
  return m;
}

/* ---------- Dades pròpies de cada sessió (el que no surt a l'app) ---------- */
const D = {
  S3: {
    carpeta: 'S3-el-teu-circuit-RECURS',
    intro: '<b>Eina:</b> Ozobot Evo i retoladors. <b>Equips:</b> 6 robots, equips de 3. Cadascú dibuixa el seu circuit en un full blanc (pàgina 6) i té la seva meta: esquerra, recte o dreta.',
    migdia: ['6 Ozobot carregats i provats al cercle de calibratge', 'Retoladors de l\'Ozobot per taula: negre, vermell, verd i blau (punta ampla)',
      'Fulls de circuit (pàgina 6), un per alumne + 4 de reserva. Es poden fotocopiar en B/N', 'Xuletes de cruïlles (pàgina 5) <b>en color</b>, una per taula',
      'Cartes de repte (pàgina 7) retallades, en un sobre', '<b>Prova una cruïlla:</b> dibuixa una T de 5 mm, pinta Bl·Vm·Vd a 3 cm abans i comprova que gira a la dreta 3 vegades',
      'Tauler: <b>Grup → S3 → Obre la sessió</b>. Projecció ↗: hi surt la xuleta de cruïlles'],
    demo: 'Amb la xuleta projectada: 1) dibuixo una T de 5 mm amb angles rectes; 2) sense codi, l\'Ozobot tria a l\'atzar (ho provem 3 vegades); 3) pinto el codi de la dreta a uns 3 cm abans de la cruïlla, en el sentit de la fletxa, i ara sempre gira a la dreta.',
    treball: '1) calibrar; 2) N1: circuit amb una T, l\'Ozobot hi arriba sense perdre\'s; 3) <b>pla</b>: quin codi el porta a la seva meta; 4) N2: el pinta abans de la cruïlla, 3 vegades seguides → «Ja ho puc ensenyar»; 5) N3: carta de repte (dues cruïlles).',
    recollida: 'Ozobots apagats, retoladors tapats, circuits a la safata.',
    preguntes: ['«Ensenya-me\'l: va a la teva meta 3 vegades seguides?»', '«Quin codi has pintat? Per què va abans de la cruïlla?»'],
    n2fun: 'Va a la seva meta 3 vegades seguides <b>i</b> diu quin codi ha triat a la xuleta i que es pinta abans de la cruïlla.',
    n2diag: 'No hi va sempre, però <b>assenyala la causa</b>: codi girat, massa a prop o lluny de la cruïlla, blanc entre colors, cruïlla torta.',
    n1no: 'Havia marcat que l\'Ozobot arribava a la cruïlla i no és així.',
    n3: 'Ha fet una carta de repte (dues cruïlles). <b>N3 · Fet i ho explica</b> (10) si diu quin codi va a cada cruïlla i per què.',
    solucions: [['A · Meta a l\'esquerra', 'Vd · Ng · Vm (Gira a l\'esquerra)'], ['B · Meta recte', 'Bl · Ng · Vm (Recte)'], ['C · Meta a la dreta', 'Bl · Vm · Vd (Gira a la dreta)']],
    reptes: [['Dues cruïlles', 'Dibuixa dues cruïlles seguides. A la primera, recte. A la segona, a l\'esquerra.', 'Bl·Ng·Vm abans de la 1a · Vd·Ng·Vm abans de la 2a'],
      ['Creu', 'Dibuixa una cruïlla en forma de +. Fes que l\'Ozobot giri a la dreta.', 'Bl·Vm·Vd abans de la creu'],
      ['A poc a poc', 'Abans de la cruïlla, l\'Ozobot va lent. Després gira a l\'esquerra.', 'Vm·Ng·Vm (Lent) i, més endavant, Vd·Ng·Vm'],
      ['Pausa', 'L\'Ozobot s\'atura 3 segons i després passa la cruïlla recte.', 'Vm·Bl·Vm (Pausa) i, a 5 cm, Bl·Ng·Vm'],
      ['Turbo', 'Després de girar a la dreta, l\'Ozobot va a tota velocitat.', 'Bl·Vm·Vd abans de la cruïlla · Bl·Vd·Bl després'],
      ['Laberint', 'Dues cruïlles: a la primera a la dreta i a la segona a la dreta.', 'Bl·Vm·Vd abans de cadascuna']],
    normes: '<ul><li>Línia de <b>5 mm</b>, cruïlles amb <b>angles rectes</b>. Mai codis a les corbes.</li><li>El codi de direcció, <b>abans</b> de la cruïlla: com a mínim a <b>2,5 cm</b> (guia oficial). A la missió diem «uns 3 cm».</li><li>Quadrats de 5 mm enganxats, sense blanc entremig, en el sentit de la marxa. Codis a 5 cm l\'un de l\'altre.</li><li>Sense codi, a la cruïlla l\'Ozobot tria a l\'atzar.</li></ul>',
    represa: '«Fins ara el robot seguia línies o cartes. Avui el Dash anirà on li digueu, amb centímetres.»',
    extra: 'circuit'
  },
  S4: {
    carpeta: 'S4-arriba-a-la-marca-RECURS',
    intro: '<b>Eina:</b> Dash amb l\'app <b>Blockly</b> (Chromebook: code.makewonder.com → «Play with Dash and Dot»; o tauleta). <b>Sense pinça.</b> <b>Equips:</b> 3 Dash. Cadascú té la seva marca: 40, 70 o 90 cm.',
    migdia: ['3 Dash carregats (60–90 min de càrrega). Posa\'ls nom a l\'app perquè cada equip trobi el seu', 'Blockly obert a 3 aparells, un per Dash',
      'Per a cada Dash, a terra amb cinta: <b>línia de sortida</b> i <b>marques a 40, 70 i 90 cm</b> (mesurades des de la línia)', 'Una cinta mètrica per Dash',
      '<b>Regla de mesura:</b> el <b>davant del Dash</b> toca la línia de sortida; mirem on queda el davant', 'Xuletes de blocs (pàgina 5) en color, una per equip',
      'Prova un Dash: When Start + Forward 50. Comprova on s\'atura al vostre terra', 'Tauler: <b>Grup → S4 → Obre la sessió</b>'],
    demo: 'Amb la xuleta projectada: 1) connecto el Dash; 2) When Start i, enganxat a sota, Forward 50; 3) el davant a la línia, prem Start, i mesurem: 50 cm. Pregunta: «I si la marca és a 70?»',
    treball: '1) <b>predicció</b>: on s\'aturarà amb Forward 50; 2) Dash connectat; 3) N1: Forward 50 i mirar on s\'atura; 4) N2: el número de la seva marca → «Ja ho puc ensenyar»; 5) N3: anar a la marca, mitja volta i tornar.',
    recollida: 'Dash apagats i a carregar. La cinta de terra es pot deixar per al grup següent.',
    preguntes: ['«Posa\'l a la sortida i prem Start: s\'atura a la teva marca?»', '«Quin número has posat? Com l\'has trobat?»'],
    n2fun: 'S\'atura a la seva marca (±3 cm) <b>i</b> explica que el número són centímetres i com l\'ha ajustat.',
    n2diag: 'Es passa o no arriba, però <b>sap què ha de canviar</b>: «hi falten 10 cm, posaré 10 més».',
    n1no: 'Havia marcat que el Dash avançava i s\'aturava i no és així.',
    n3: 'Va a la marca, fa mitja volta (Turn Right 180) i torna. <b>N3 · Fet i ho explica</b> (10) si diu per què 180.',
    solucions: [['Predicció amb Forward 50', 'A (40 cm): després de la marca · B i C (70 i 90 cm): abans. No puntua l\'encert.'],
      ['A · Marca a 40 cm', 'When Start · Forward 40'], ['B · Marca a 70 cm', 'When Start · Forward 70'], ['C · Marca a 90 cm', 'When Start · Forward 90'],
      ['Nivell 3 (anar i tornar)', 'Forward (la seva distància) · Turn Right 180 · Forward (la mateixa)'],
      ['Nota', 'Al vostre terra pot sortir uns centímetres diferent: el que compta és que ajusti el número mesurant.']],
    reptes: [['Quadrat', 'El Dash fa un quadrat de 30 cm i torna a la sortida.', 'Repeat 4 times: Forward 30 · Turn Right 90'],
      ['Espera', 'El Dash va a la teva marca, espera 2 segons i torna.', 'Forward · Wait For 2 seconds · Turn Right 180 · Forward'],
      ['Forma de L', 'El Dash avança 50 cm, gira a l\'esquerra i avança 30 cm.', 'Forward 50 · Turn Left 90 · Forward 30'],
      ['Triangle', 'El Dash fa un triangle de 40 cm de costat.', 'Repeat 3 times: Forward 40 · Turn Right 120'],
      ['Sense girar', 'El Dash va a la marca i torna enrere sense girar-se.', 'Forward · Backward (el mateix número)'],
      ['Ziga-zaga', 'El Dash fa ziga-zaga: 20 cm, dreta, 20 cm, esquerra… tres vegades.', 'Repeat 3 times: Forward 20 · Turn Right 90 · Forward 20 · Turn Left 90']],
    represa: '«Ara ja sabeu fer moure robots. Avui en muntareu un vosaltres: una parada que serveix quan veu un color.»'
  },
  S5: {
    carpeta: 'S5-munta-i-modifica-RECURS',
    intro: '<b>Eina:</b> LEGO SPIKE Essential, app SPIKE a la tauleta. Lliçó <b>Amazing Amusement Park → Snack Stand</b>. <b>Equips:</b> 3 kits. Cadascú té el seu color (vermell, groc o verd).',
    migdia: ['3 kits SPIKE Essential complets i hubs carregats', '3 tauletes amb l\'app SPIKE, oberta a la lliçó <b>Snack Stand</b>',
      'Tiquets de color per equip: blau, vermell, groc i verd (peces o cartolina)', 'Xuletes de peces (pàgina 5) en color, una per equip',
      'Munta una parada tu abans (o mira el vídeo de la lliçó) per saber on encalla', 'Tauler: <b>Grup → S5 → Obre la sessió</b>'],
    demo: 'Amb la xuleta projectada: 1) les quatre peces: hub, motor, sensor de color i cable al port; 2) com s\'encén el hub i es connecta a l\'app; 3) acosto molt el tiquet blau al sensor i la parada serveix.',
    treball: '1) parada muntada i hub connectat; 2) N1: primer repte (tiquet blau); 3) <b>pla</b>: quin bloc canviar; 4) N2: amb el seu color, i diu sensor, motor i programa → «Ja ho puc ensenyar»; 5) N3: millorar el model (tercer repte de l\'app).',
    recollida: 'Parades <b>muntades</b> dins la capsa (la S6 continua amb el mateix model), hubs apagats.',
    preguntes: ['«Ensenya\'m: serveix amb el teu color i no amb el blau?»', '«Quina peça és el sensor? I el motor? Què fa el programa?»'],
    n2fun: 'Serveix amb el seu color <b>i</b> assenyala sensor i motor i diu què fa el programa («quan veu el groc, el motor gira»).',
    n2diag: 'No serveix, però <b>sap per què</b>: el bloc encara diu blau, el tiquet és lluny, el cable no és al port.',
    n1no: 'Havia marcat que servia amb el blau i no és així.',
    n3: 'Ha millorat el model i encara funciona. <b>N3 · Fet i ho explica</b> (10) si diu què ha canviat i per què.',
    solucions: [['Pla', 'El bloc del <b>sensor de color</b> (on diu el color). No puntua l\'encert.'], ['A · B · C', 'Al bloc del sensor, canviar el blau pel vermell, el groc o el verd.'],
      ['Nivell 3', 'El tercer repte de l\'app: canviar el model sense instruccions i provar que encara serveix.']],
    reptes: [['Dues vegades', 'Fes que la parada serveixi dues vegades seguides.', 'Repetir el bloc del motor (o posar més voltes).'],
      ['Amb so', 'Fes que soni un so quan serveix.', 'Afegir un bloc de so després del motor.'],
      ['Espera', 'Fes que esperi 1 segon abans de servir.', 'Bloc d\'esperar abans del motor.'],
      ['Llum', 'Fes que la llum del hub canviï de color quan serveix.', 'Bloc de llum del hub.'],
      ['Dos colors', 'Fes que serveixi amb dos colors diferents.', 'Dos blocs del sensor, un per color (és la S6!).'],
      ['Cartell', 'Afegeix al model un cartell amb peces que digui què ven.', 'Construcció lliure: ha de continuar funcionant.']],
    represa: '«La setmana passada la parada servia amb un color. Avui cada color farà una cosa diferent.»'
  },
  S6: {
    carpeta: 'S6-la-parada-classifica-RECURS',
    intro: '<b>Eina:</b> la mateixa parada Snack Stand de la S5 (si s\'ha desmuntat, es torna a muntar). <b>Equips:</b> 3 kits. Cadascú té la seva parella de colors.',
    migdia: ['Parades de la S5 dins les capses. Si s\'han desmuntat: 10 min de muntatge amb l\'app', 'Hubs carregats; tauletes amb l\'app SPIKE',
      'Tiquets de color: vermell, groc, verd i <b>lila</b> (o un altre color que ningú programa)', 'Xuletes (pàgina 5) en color', 'Tauler: <b>Grup → S6 → Obre la sessió</b>'],
    demo: 'Amb la xuleta projectada: 1) un bloc del sensor per a cada color; 2) amb el vermell el motor gira cap a un costat, amb el groc cap a l\'altre; 3) pregunta: «I si li ensenyo el lila?» (no ho provem: ho diran ells a la predicció).',
    treball: '1) <b>predicció</b>: què farà amb un color no programat; 2) parada a punt; 3) N1: dos colors, dos sentits; 4) N2: provar el color no programat i explicar-ho → «Ja ho puc ensenyar»; 5) N3: un tercer color amb una altra acció.',
    recollida: 'Ara sí: parades desmuntades i peces a la capsa.',
    preguntes: ['«Ensenya\'m els dos colors: cada un gira cap a un costat?»', '«I amb un color que no has programat, què passa? Per què?»'],
    n2fun: 'Cada color fa girar cap a un costat <b>i</b> explica que amb un color no programat no fa res perquè no hi ha cap bloc per a aquell color.',
    n2diag: 'Encara fa sempre el mateix, però <b>sap per què</b>: els dos blocs tenen el mateix color, o un no està enganxat.',
    n1no: 'Havia marcat que cada color girava cap a un costat i no és així.',
    n3: 'Un tercer color fa una altra cosa (so o motor més ràpid). <b>N3 · Fet i ho explica</b> (10) si diu quin bloc ha afegit.',
    solucions: [['Predicció', 'Normalment <b>no farà res</b>: només reacciona als colors que té programats. No puntua l\'encert.'],
      ['N1', 'Un bloc del sensor per color; el motor, en un sentit amb el primer i en l\'altre amb el segon.'], ['N3', 'Un tercer bloc del sensor amb un so o el motor més ràpid.']],
    reptes: [['Tres colors', 'Afegeix un tercer color que faci sonar un so.', 'Un altre bloc del sensor + bloc de so.'],
      ['Més ràpid', 'Amb un dels colors, el motor gira més ràpid.', 'Canviar la velocitat en aquell bloc.'],
      ['Més voltes', 'Amb un color, el motor fa dues voltes.', 'Canviar el nombre de voltes o el temps.'],
      ['Llums', 'Cada color encén el hub d\'un color diferent.', 'Bloc de llum dins de cada color.'],
      ['Res de res', 'Fes que amb el lila soni un avís: «Aquest no el conec!».', 'Un bloc per al lila amb un so.'],
      ['Ordre', 'Fes que esperi 1 segon abans de girar.', 'Bloc d\'esperar abans del motor.']],
    represa: '«Fins ara heu programat robots. Avui programareu a la pantalla: un vehicle a Scratch.»'
  },
  S7: {
    carpeta: 'S7-circula-RECURS',
    intro: '<b>Eina:</b> Scratch al Chromebook, en català. <b>Avui es creen els comptes, amb tu.</b> Cadascú fa el seu projecte. Cadascú té el seu color d\'obstacle.',
    migdia: ['Decideix com seran els usuaris de Scratch (sense nom ni cognoms complets) i apunta\'ls. Si l\'escola té compte de professor, crea\'ls des d\'allà', 'Targetes del compte (pàgina 7), una per alumne, per guardar a classe',
      'Projecta la pàgina «Com entrar a Scratch» (pàgina 6) o deixa-la impresa a cada taula', 'Xuletes de blocs (pàgina 5) en color', 'Tauler: <b>Grup → S7 → Obre la sessió</b>'],
    demo: 'Amb la xuleta projectada: 1) «quan la tecla fletxa dreta es premi» + «suma 10 a x»; 2) dibuixo la carretera i l\'obstacle; 3) «quan la bandera es cliqui» → «per sempre» → «si tocant el color … llavors» → «ves a x: y:».',
    treball: '1) entrar al compte i projecte nou; 2) N1: carretera i vehicle amb fletxes; 3) <b>pla</b>: quin bloc el farà tornar; 4) N2: torna si toca el seu color → «Ja ho puc ensenyar»; 5) N3: meta amb «Has arribat!».',
    recollida: '<b>Desa ara</b> (Fitxer → Desa ara) i tancar la sessió de Scratch. La S8 continua aquest projecte.',
    preguntes: ['«Mou el vehicle i fes-lo tocar el teu color: torna a la sortida?»', '«Què fa la tecla? I què fa el «si … llavors»?»'],
    n2fun: 'Torna en tocar el seu color <b>i</b> explica que la tecla mou quan la prems i la condició es mira tota l\'estona (dins de «per sempre»).',
    n2diag: 'No torna, però <b>sap per què</b>: falta «per sempre», el color no és exacte (comptagotes), està fora de la bandera.',
    n1no: 'Havia marcat que el vehicle es movia amb les fletxes i no és així.',
    n3: 'Hi ha una meta i diu «Has arribat!». <b>N3 · Fet i ho explica</b> (10) si diu quin bloc ho detecta.',
    solucions: [['Pla', '«si … llavors» (amb «tocant el color …?» a dins). No puntua l\'encert.'],
      ['Moure\'s', '«quan la tecla fletxa dreta es premi» → «suma 10 a x» (i igual amb les altres fletxes)'],
      ['Tornar', '«quan la bandera es cliqui» → «per sempre» → «si tocant el color [el seu]? llavors» → «ves a x: (sortida) y: (sortida)»'],
      ['N3', 'Dins del mateix «per sempre»: «si tocant el color [meta]? llavors» → «digues Has arribat! durant 2 segons»']],
    reptes: [['Dos obstacles', 'Posa un segon obstacle d\'un altre color. També el fa tornar.', 'Un altre «si tocant el color … llavors» dins de «per sempre».'],
      ['Amunt i avall', 'El vehicle també es mou amb les fletxes amunt i avall.', '«quan la tecla fletxa amunt es premi» → «suma 10 a y» (avall: -10).'],
      ['Ai!', 'Quan toca l\'obstacle, diu «Ai!» abans de tornar.', '«digues Ai! durant 1 segons» abans de «ves a».'],
      ['Més ràpid', 'Fes que el vehicle vagi el doble de ràpid.', '«suma 20 a x» en lloc de 10.'],
      ['Començar bé', 'Quan cliques la bandera, el vehicle va a la sortida.', '«ves a x: y:» just sota la bandera.'],
      ['Meta', 'Quan arriba a la meta, tot s\'atura.', '«digues …» i després «atura tot».']],
    represa: '«Obriu el vehicle de la setmana passada (Les Meves Coses). Avui li posareu un marcador.»',
    extra: 'scratch'
  },
  S8: {
    carpeta: 'S8-el-marcador-RECURS',
    intro: '<b>Eina:</b> Scratch, <b>el mateix projecte del vehicle de la S7</b>. Cadascú compta una cosa diferent (variant).',
    migdia: ['Targetes del compte de Scratch (de la S7) a punt per repartir', 'Si algú no té el projecte: pot fer un vehicle nou amb fletxes en 5 minuts (xuleta de la S7)',
      'Xuletes de variables (pàgina 5) en color', 'Tauler: <b>Grup → S8 → Obre la sessió</b>'],
    demo: 'Amb la xuleta projectada: 1) Variables → «Crea una variable» → punts; 2) «assigna a punts el valor 0» just sota la bandera; 3) «augmenta punts en 1» dins del «si … llavors» que ho detecta.',
    treball: '1) projecte del vehicle obert; 2) N1: variable «punts» a 0 amb la bandera; 3) <b>pla</b>: on va «augmenta punts en 1»; 4) N2: compta el que diu la seva missió → «Ja ho puc ensenyar»; 5) N3: «Rècord!» a 5 punts.',
    recollida: '<b>Desa ara</b> i tancar la sessió de Scratch. Recollir les targetes del compte.',
    preguntes: ['«Ensenya\'m: comença a 0 i compta el que diu la teva missió?»', '«Què és una variable? On la poses a 0?»'],
    n2fun: 'Compta bé <b>i</b> explica que la variable és un lloc on el programa guarda un número que canvia.',
    n2diag: 'No compta bé, però <b>sap per què</b>: no torna a 0, l\'«augmenta» és fora del «si», compta molts cops de cop.',
    n1no: 'Havia marcat que el marcador sortia i començava a 0 i no és així.',
    n3: 'A 5 punts diu «Rècord!». <b>N3 · Fet i ho explica</b> (10) si diu quin bloc compara.',
    solucions: [['Pla', 'Dins del «si … llavors» que detecta la meta o el color. No puntua l\'encert.'],
      ['N1', '«quan la bandera es cliqui» → «assigna a punts el valor 0»'],
      ['N2', 'Dins del «si tocant el color [meta o el seu]? llavors»: «augmenta punts en 1» i «ves a x: y:» (si no, compta molts cops)'],
      ['N3', '«si ⟨punts = 5⟩ llavors» → «digues Rècord! durant 2 segons»']],
    reptes: [['Vides', 'Una variable «vides» comença a 3 i baixa 1 cada cop que toques l\'obstacle.', '«assigna a vides el valor 3» · «augmenta vides en -1»'],
      ['Fi del joc', 'Quan les vides arriben a 0, tot s\'atura.', '«si ⟨vides = 0⟩ llavors» → «atura tot»'],
      ['Deu', 'Quan arribes a 10 punts, el vehicle diu «Campió!».', '«si ⟨punts = 10⟩ llavors» → «digues …»'],
      ['Dos marcadors', 'Compta les arribades i també els cops que toques l\'obstacle.', 'Dues variables, cadascuna dins del seu «si».'],
      ['Amaga', 'El marcador només es veu quan el joc comença.', '«mostra la variable punts» sota la bandera.'],
      ['Doble', 'Arribar a la meta val 2 punts.', '«augmenta punts en 2»']],
    represa: '«Avui és la missió final: cadascú torna a l\'eina que encara no té al carnet.»'
  },
  S9: {
    carpeta: 'S9-missio-final-RECURS',
    intro: '<b>Missió personal.</b> L\'app dona a cadascú la <b>primera eina que encara no té al carnet</b> (nivell 2 en alguna sessió d\'aquella eina). Qui les té totes fa el repte final. Al tauler, cada targeta diu l\'eina de l\'alumne.',
    migdia: ['Obre la sessió <b>al migdia</b> (es reparteixen les eines) i mira al tauler quants alumnes hi ha a cada eina', 'Prepara una <b>estació per eina</b> amb el material de la seva sessió (S2–S8)',
      'Xuletes de totes les eines (pàgines 5–7) en color, a la seva estació', 'Cartes de repte (pàgina 8) a cada estació', 'Robots carregats, apps obertes, comptes de Scratch a punt'],
    demo: 'Al començament: «Mireu “La teva” al Chromebook: és la vostra eina i la vostra missió. Aneu a la seva estació. El botó “Codis” us ensenya la xuleta de la vostra eina.»',
    treball: '1) eina a punt; 2) N1: el primer pas de la missió; 3) N2: la missió acabada i explicada → «Ja ho puc ensenyar»; 4) N3: carta de repte de la seva eina.',
    recollida: 'Cada estació recull el seu material. Últim dia: tanca la sessió i fes <b>Notes → Prepara l\'informe</b>.',
    preguntes: ['«Ensenya\'m la teva missió acabada.»', '«Com ho has fet? Què vas fer malament l\'altra vegada i ara has canviat?»'],
    n2fun: 'La missió funciona <b>i</b> explica com ho ha fet. Atenció: <b>a la S9 la nota compta doble</b>.',
    n2diag: 'No funciona, però <b>sap per què</b> i diu què canviaria.',
    n1no: 'Havia marcat el primer pas i no és així.',
    n3: 'Ha fet la carta de repte de la seva eina. <b>N3 · Fet i ho explica</b> (10).',
    solucions: [['Scottie Go!', 'Repte amb 3 estrelles: cartes repetides → una carta i el número.'], ['Ozobot', 'Bl · Vm · Vd a uns 3 cm abans de la cruïlla.'],
      ['Dash', 'When Start · Forward 60 (ajustat mesurant).'], ['SPIKE', 'Al bloc del sensor, el groc.'],
      ['Scratch', '«per sempre» → «si tocant el color vermell? llavors» → «ves a x: y:».'], ['Repte final', 'Lliure: dues eines juntes (p. ex. el Dash porta l\'Ozobot fins a una línia).']],
    reptes: [['Scottie Go!', 'Fes un repte amb REPEAT.', 'REPEAT + número … END IF / REPEAT'],
      ['Ozobot', 'Dues cruïlles: dreta i després esquerra.', 'Bl·Vm·Vd i després Vd·Ng·Vm'],
      ['Dash', 'El Dash fa un quadrat de 30 cm.', 'Repeat 4 times: Forward 30 · Turn Right 90'],
      ['SPIKE', 'Amb el groc serveix, amb el verd sona un so.', 'Dos blocs del sensor'],
      ['Scratch', 'Posa un marcador que compti les arribades a la meta.', 'Variable + «augmenta … en 1»'],
      ['Repte final', 'Explica a un company com funciona la teva eina, sense tocar-la.', 'Qui ajuda parla, no toca'],],
    represa: '«Final del taller. Les notes i el carnet d\'eines són a l\'informe.»',
    totesXuletes: true
  }
};

/* ---------- Plantilla ---------- */
const S1 = llegeix('materials/S1-primers-codis-RECURS/index.src.html');
const CSS = S1.slice(S1.indexOf('<style>'), S1.indexOf('</style>'))
  .replace('.carta { border: 1px dashed #000;', 'div.carta { border: 1px dashed #000;')
  .replace('.carta .t {', 'div.carta .t {').replace('.carta p {', 'div.carta p {').replace('.carta .nota {', 'div.carta .nota {') + `
.xi svg.carta, .xi svg.bloc { width: auto; max-width: 100%; height: 11mm; }
.xi svg.peca { width: auto; max-width: 100%; height: 26mm; }
.xc.blocs { display: flex; flex-wrap: wrap; }
.xi.bloc { padding: 1.5mm 2mm; }
.xuleta-a5 { height: 128mm; }
.full[data-capcalera] .xuleta-a5 { height: auto; }
.full[data-capcalera] .xi svg.peca { height: 18mm; }
.dib svg { width: 100%; height: 100%; }
.carta .sol { font-size: 10pt; color: #333; }
.targeta-compte { border: 1px dashed #000; border-radius: 3mm; padding: 5mm 7mm; height: 50mm; display: flex; flex-direction: column; gap: 4mm; }
.targeta-compte p { font-size: 13pt; margin: 0; }
.passos li { font-size: 13pt; margin: 2.5mm 0; line-height: 1.35; }
`;

function pagina(peu, cos, classe = 'full', capcalera = '') { return `<section class="${classe}"${capcalera ? ` data-capcalera="${esc(capcalera)}"` : ''}>\n${cos}\n<div class="peu">${peu}</div>\n</section>\n`; }

function genera(s) {
  const d = D[s], m = missio(s), nom = ctx.SESSIONS[s].nom;
  const peu = n => `${s} · ${esc(nom)} · RECURS · ${n}`;
  const sortida = m.sortida.map(q => {
    const c = q.opcions.find(o => o.clau === q.correcta);
    return `<tr><td>«${esc(q.text)}»</td><td><b>${esc(c ? c.text : '')}</b>${q.clau === 'diag' ? ' · Diagnòstic: +1 a qui no arriba a N1.' : ''}</td></tr>`;
  }).join('');
  const variants = m.variants.map(v => `<li><b>${esc(v.clau)}</b> · ${esc(v.text)}</li>`).join('');
  const errors = m.encallat.map(e => `<tr><td>${esc(e.text)}</td><td>${esc(e.pista)}</td></tr>`).join('');
  let p = 1, html = '';

  html += pagina(peu(p++), `<h1>${s} · ${esc(nom)} · Guió del mestre</h1>
  <p>${d.intro}</p>
  <p><b>La missió (surt al Chromebook):</b> «${esc(m.frase)}»</p>
  <h2>Migdia (30 min)</h2>
  <ul class="check">${d.migdia.map(x => `<li>${x}</li>`).join('')}</ul>
  <h2>Minut a minut</h2>
  <table>
    <tr><th style="width:24mm">Hora</th><th>Què passa</th><th style="width:40mm">Pantalla</th></tr>
    <tr><td>14:55–15:03</td><td>Desplegament. <b>Represa</b> (una frase, a la pàgina 4 de la sessió anterior).</td><td>Projecció</td></tr>
    <tr><td>15:03–15:08</td><td>Entrar a RoboMón (codi de classe i PIN de dibuixos).</td><td>Chromebook</td></tr>
    <tr><td>15:08–15:18</td><td><b>Demostració.</b> ${d.demo}</td><td>Projecció (xuleta)</td></tr>
    <tr><td>15:18–16:12</td><td><b>Treball.</b> L'app els porta pas a pas: ${d.treball}</td><td>Robot / pantalla</td></tr>
    <tr><td>16:12–16:22</td><td>Al tauler: <b>Targeta de sortida</b>. Responen 2 preguntes.</td><td>Chromebook</td></tr>
    <tr><td>16:22–16:28</td><td>Marge. <b>Tanca la sessió</b>.</td><td>—</td></tr>
    <tr><td>16:28–16:40</td><td>Recollida. ${d.recollida}</td><td>—</td></tr>
  </table>`);

  html += pagina(peu(p++), `<h1>Targeta de demostració</h1>
  <p>Quan un nen és a «Volen ensenyar-ho»: mira-ho i fes-li <b>les dues preguntes, sempre les mateixes</b>. 30–45 segons. Un clic al mòbil.</p>
  <div class="caixa"><h2 style="margin-top:0">Nivell 2 · Les dues preguntes</h2>
    <p style="font-size:15pt; margin: 2mm 0;"><b>1.</b> ${d.preguntes[0]}</p>
    <p style="font-size:15pt; margin: 2mm 0;"><b>2.</b> ${d.preguntes[1]}</p></div>
  <table>
    <tr><th style="width:58mm">Botó al mòbil</th><th>Quan el prems</th><th style="width:30mm">Nota</th></tr>
    <tr><td><b>N2 · Funciona i ho explica</b></td><td>${d.n2fun}</td><td>8<br>(8,5 si abans havia dit «no me n'he sortit»)</td></tr>
    <tr><td><b>N2 · No funciona, però sap per què</b></td><td>${d.n2diag}</td><td>7,5</td></tr>
    <tr><td><b>Encara no</b></td><td>Ni funciona ni sap per què. Una pista i tornarà a la cua. <b>No treu punts.</b></td><td>—</td></tr>
    <tr><td><b>N1 no és cert</b></td><td>${d.n1no}</td><td>torna a 0</td></tr>
  </table>
  <div class="caixa"><h2 style="margin-top:0">Nivell 3</h2><p>${d.n3} <b>N3 · Fet</b> (9) si només funciona.</p></div>
  <h2>Les variants (cadascú la seva, la diu l'app)</h2><ul>${variants}</ul>
  <h2>Regles que cal dir en veu alta (una vegada)</h2>
  <ul><li><b>Cadascú la seva missió.</b> La del company no et serveix.</li><li><b>Qui ajuda parla, no toca.</b> Mans al darrere.</li><li><b>Dir «no me n'he sortit» està bé:</b> et dona una pista i, si cal, vinc jo.</li></ul>`);

  html += pagina(peu(p++), `<h1>Solucionari</h1>
  ${m.abans ? `<h2>${m.abans.clau === 'prediccio' ? 'Predicció (abans de provar)' : 'Pla (abans del nivell 2)'}</h2><p>«${esc(m.abans.text)}» · Opcions: ${m.abans.opcions.map(o => esc(o.text)).join(' · ')}. <b>No puntua l'encert:</b> compta haver-ho pensat abans.</p>` : ''}
  <h2>Solucions</h2>
  <table>${d.solucions.map(([a, b]) => `<tr><td style="width:50mm"><b>${a}</b></td><td>${b}</td></tr>`).join('')}</table>
  <h2>Targeta de sortida (es corregeix sola)</h2>
  <table><tr><th style="width:90mm">Pregunta</th><th>Correcta</th></tr>${sortida}</table>
  <h2>Cartes de repte: solucions</h2>
  <table>${d.reptes.map(([t, , sol]) => `<tr><td style="width:40mm">${esc(t)}</td><td>${esc(sol)}</td></tr>`).join('')}</table>`);

  html += pagina(peu(p++), `<h1>Errors típics, escala i represa</h1>
  <h2>«No me n'he sortit»: on s'encallen i la pista que els dona l'app</h2>
  <table><tr><th style="width:52mm">El nen tria…</th><th>Pista</th></tr>${errors}</table>
  ${d.normes ? `<h2>Normes oficials</h2>${d.normes}` : ''}
  <h2>Escala de nota de la sessió${s === 'S9' ? ' (a la S9 compta doble a la mitjana)' : ''}</h2>
  <table>
    <tr><td>Present, sense cap registre · encallat honest (+1 diagnòstic encertat)</td><td style="width:22mm">2 · 3 · 4</td></tr>
    <tr><td>${m.abans ? 'N1 (+1 si ha fet ' + (m.abans.clau === 'prediccio' ? 'la predicció' : 'el pla') + ')' : 'N1'}</td><td>${m.abans ? '5 · 6' : '5'}</td></tr>
    <tr><td>N2 · no funciona però sap per què · funciona i ho explica · ha fallat i ho ha arreglat</td><td>7,5 · 8 · 8,5</td></tr>
    <tr><td>N3 · fet · fet i explicat</td><td>9 · 10</td></tr>
  </table>
  <p class="caixa" style="font-size:12pt;"><b>Represa de la sessió següent:</b> ${d.represa}</p>`);

  /* Xuletes en color */
  if (d.totesXuletes) {
    const ids = ['scottie', 'ozobot-cruilla', 'dash', 'spike', 'scratch-s7', 'scratch-s8'];
    for (let i = 0; i < ids.length; i += 2) html += pagina(peu(p++) + ' · imprimir EN COLOR', `<div data-xuleta="${ids[i]}"></div><div data-xuleta="${ids[i + 1]}"></div>`, 'full', 'Xuletes de les eines');
  } else {
    const x = { S3: 'ozobot-cruilla', S4: 'dash', S5: 'spike', S6: 'spike', S7: 'scratch-s7', S8: 'scratch-s8' }[s];
    html += pagina(peu(p++) + ' · imprimir EN COLOR', `<div data-xuleta="${x}"></div><div data-xuleta="${x}"></div>`, 'full', { S3: 'Codis de l\'Ozobot', S4: 'Blocs del Dash', S5: 'Peces del SPIKE', S6: 'Peces del SPIKE', S7: 'Blocs de Scratch', S8: 'Blocs de Scratch' }[s]);
  }

  /* Pàgines pròpies */
  if (d.extra === 'circuit') {
    html += `<section class="full apaisat" data-capcalera="El teu circuit" data-apaisat><svg viewBox="0 0 297 210" width="297mm" height="210mm" font-family="Nunito, Verdana, sans-serif">
      <circle cx="34" cy="46" r="20" fill="#000"/><text x="34" y="72" font-size="3.6" text-anchor="middle">Calibra aquí</text>
      <path d="M220 34 H270" stroke="#000" stroke-width="5"/><text x="245" y="44" font-size="3.4" text-anchor="middle">Així de gruixuda: 5 mm</text>
      <g font-size="3.6"><text x="14" y="195">1 · Dibuixa un circuit amb una cruïlla en forma de T: línia de 5 mm, angles rectes, sense forats.</text>
      <text x="14" y="200">2 · Posa la teva meta al final d'un dels camins. 3 · Pinta el codi de direcció a uns 3 cm ABANS de la cruïlla, en el sentit de la marxa.</text>
      <text x="14" y="205">Sense codi, a la cruïlla l'Ozobot tria a l'atzar. Codis lluny de les corbes.</text></g></svg></section>\n`;
    p++;
  }
  if (d.extra === 'scratch') {
    html += pagina(peu(p++), `<ol class="passos">
        <li>Obre el navegador i escriu <b>scratch.mit.edu</b>.</li>
        <li>A dalt a la dreta, prem <b>«Inicia la sessió»</b>.</li>
        <li>Escriu el teu <b>usuari</b> i la teva <b>contrasenya</b> (són a la teva targeta). La <b>@</b> no cal: l'usuari no en porta.</li>
        <li>Prem <b>«Crea»</b> per fer un projecte nou.</li>
        <li>Per tornar-lo a trobar: <b>«Les Meves Coses»</b> (a dalt).</li>
        <li>En acabar: <b>Fitxer → «Desa ara»</b>.</li>
      </ol>
      <div class="caixa"><p><b>Per al mestre:</b> els comptes es creen el primer dia, amb tu («Uneix-te a l'Scratch» o des d'un compte de professor si l'escola en té). Usuari sense nom ni cognoms complets. Les targetes es queden a classe.</p></div>`, 'full', 'Com entrar a Scratch');
    html += pagina(peu(p++), `<div style="display:grid; grid-template-columns:1fr 1fr; gap:6mm;">${Array.from({ length: 8 }, () => `<div class="targeta-compte"><p><b>El meu compte de Scratch</b></p><p>Usuari: ______________________</p><p>Contrasenya: _________________</p><p style="font-size:10pt">Es queda a classe. No la deixis a ningú.</p></div>`).join('')}</div>`, 'full', 'El meu compte de Scratch');
  }

  /* Cartes de repte */
  html += `<section class="full" style="padding: 14mm 15mm;" data-capcalera="Cartes de repte"><div class="cartes">${d.reptes.map(([t, enunciat]) =>
    `<div class="carta"><span class="t">Repte extra · ${esc(t)}</span><p>${esc(enunciat)}</p><p class="nota">Mira la xuleta. Quan funcioni, ensenya-ho.</p></div>`).join('')}</div><div class="peu">${peu(p++)}</div></section>\n`;

  const font = `<!DOCTYPE html>
<html lang="ca">
<head>
<meta charset="utf-8">
<title>${s} · ${esc(nom)} · RECURS (mestre)</title>
<!-- RECURS generat per eines/genera-materials.mjs a partir de la llavor de missions. No l'editis a mà: canvia el generador. -->
${CSS}</style>
</head>
<body>
<button class="boto-imprimir no-imprimir" onclick="window.print()">Imprimeix (mida real, 100 %)</button>
${html}
<script>
/*@@IL@@*/
</script>
<script>
/*@@ESCOLA@@*/
</script>
<script>
/* Xuletes en color amb els mateixos dibuixos que l'app */
function itemSVG(i) {
  if (i.codi) return codiSVG(i.codi);
  if (i.bloc) return blocSVG(i.bloc, i.text);
  if (i.peca) return pecaSVG(i.peca);
  if (i.carta) return cartaSVG(i.carta, i.tipus);
  return '';
}
document.querySelectorAll('[data-xuleta]').forEach(el => {
  const x = XULETES[el.dataset.xuleta];
  el.outerHTML = '<div class="xuleta-a5"><h2>' + x.titol + '</h2>' + x.grups.map(g => {
    const blocs = g.items.every(i => i.bloc);
    return '<div class="xg"><h3>' + g.grup + '</h3><div class="xc' + (blocs ? ' blocs' : '') + '">' +
      g.items.map(i => '<div class="xi' + (i.bloc ? ' bloc' : '') + '">' + (i.nom ? '<span>' + i.nom + '</span>' : '') + itemSVG(i) + '</div>').join('') + '</div></div>';
  }).join('') + '<p class="regla"><b>' + x.regla + '</b></p></div>';
});
posaCapcaleres();
</script>
</body>
</html>
`;
  mkdirSync(join(ARREL, 'materials', d.carpeta), { recursive: true });
  writeFileSync(join(ARREL, 'materials', d.carpeta, 'index.src.html'), font);
  console.log('✓ materials/' + d.carpeta);
}
Object.keys(D).forEach(genera);
