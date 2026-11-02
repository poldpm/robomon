/* Capçalera oficial de l'escola. Ús: <section class="full" data-capcalera="TÍTOL"> (o data-capcalera-apaisat). */
function capcaleraEscola(titol, apaisat, curs) {
  return '<div class="cap-escola' + (apaisat ? ' apaisat' : '') + '">' +
    '<div class="cap-nom"><span>Nom i Cognoms:</span><span class="cap-data">Data:</span></div>' +
    '<div class="cap-titol"><img src="' + LOGO_ESCOLA + '" alt="Vedruna Escorial Vic"><span class="cap-t">' + titol + '</span><span class="cap-curs">' + (curs || '3r') + '</span></div>' +
    (apaisat ? '' : '<div class="segell-robomon" aria-label="RoboMón">' + SIMBOL_ROBOMON + '</div>') + '</div>';
}
function posaCapcaleres() {
  document.querySelectorAll('[data-capcalera]').forEach(function (el) {
    el.insertAdjacentHTML('afterbegin', capcaleraEscola(el.getAttribute('data-capcalera'), el.hasAttribute('data-apaisat')));
  });
}
