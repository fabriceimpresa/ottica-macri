/* =====================================================================
   PERCORSO GUIDATO PER ALDO (6/11/2026) · una sola barra uguale in tutte le pagine:
   «‹ Indietro» e «Avanti ›», nient'altro.
   Si include con <script src="(../)percorso.js"></script> in ogni pagina del percorso.
   Di base (data-pos="fondo") la barra NON è fissa: sta in fondo alla pagina, dopo tutto il contenuto, e non copre nulla.
   Solo per le pagine a tutto schermo senza scorrimento (negozio 3D, loop del tablet) si usa una barra fissa:
   data-pos="alto-dx" (in alto a destra, data-alto="84" = px dall'alto) oppure "basso" / "basso-dx" / "basso-sx" (data-alza = px dal fondo).
   Sul telefono (larghezza <= 700 px) si può cambiare posto: data-pos-tel="alto-sx|alto-dx" + data-alto-tel="104".
   Ordine unico qui sotto (percorsi dalla radice del progetto). Script classico: va con file:// e online.
   ===================================================================== */
(function () {
  'use strict';

  var PORTALE = 'index.html';
  /* le fasi, in ordine */
  var FASI = [
    'visita/index.html',                          // FASE 1 · Visita del tuo negozio (menu delle 3 visite)
    'media/logo/index.html',                      // FASE 2 · Restauro logo e rebranding marchio
    'media/blackfriday/vetrine/anteprima.html',   // FASE 3 · Le vetrine del Black Friday
    'demo/demo-app-v2.html',                      // FASE 4 · La demo
    'preventivo-b.html',                          // FASE 5 · Il preventivo
    'finale/stretta-di-mano.html'                 // FASE 6 · La stretta di mano
  ];
  /* sotto-pagine: Indietro -> la pagina «madre», Avanti -> la fase dopo la madre */
  var SOTTO = {
    'visita/visita-reale.html': 'visita/index.html',
    'visita/negozio-3d.html': 'visita/index.html',
    'visita/negozio-3d-universale.html': 'visita/index.html',
    'visita/vetrina-aumentata.html': 'visita/index.html',
    'media/blackfriday/loop/anteprima.html': 'media/blackfriday/vetrine/anteprima.html',
    'preventivo-a.html': 'preventivo-b.html'
  };

  /* dentro un iframe (es. la demo nel preventivo) la barra non serve */
  try { if (window.top !== window.self) return; } catch (e) { return; }

  var tag = document.currentScript;
  if (!tag) return;
  var radice = tag.src.replace(/[?#].*$/, '').replace(/[^\/]*$/, '');   // cartella di percorso.js = radice
  var qui = location.href.replace(/[?#].*$/, '');
  if (qui.indexOf(radice) !== 0) {
    /* file:// su Windows: lettere maiuscole/minuscole o %20 diversi */
    var a = decodeURIComponent(radice).toLowerCase(), b = decodeURIComponent(qui).toLowerCase();
    if (b.indexOf(a) !== 0) return;
    qui = decodeURIComponent(qui).slice(decodeURIComponent(radice).length);
  } else qui = qui.slice(radice.length);
  qui = decodeURIComponent(qui).replace(/\\/g, '/');
  if (qui === '' || /\/$/.test(qui)) qui += 'index.html';

  var prima, dopo, i = FASI.indexOf(qui);
  if (i >= 0) {
    prima = i === 0 ? PORTALE : FASI[i - 1];
    dopo = i === FASI.length - 1 ? PORTALE : FASI[i + 1];
  } else if (SOTTO[qui]) {
    var m = FASI.indexOf(SOTTO[qui]);
    prima = SOTTO[qui];
    dopo = m === FASI.length - 1 ? PORTALE : FASI[m + 1];
  } else return;

  /* percorso relativo dalla cartella della pagina */
  var su = qui.split('/').length - 1, pre = '';
  for (var k = 0; k < su; k++) pre += '../';
  function rel(p) { return pre + p; }

  var pos = (tag.getAttribute('data-pos') || 'fondo').toLowerCase();
  var alza = parseInt(tag.getAttribute('data-alza') || '0', 10) || 0;
  var alto = parseInt(tag.getAttribute('data-alto') || '12', 10) || 12;
  var posTel = (tag.getAttribute('data-pos-tel') || '').toLowerCase();
  var altoTel = parseInt(tag.getAttribute('data-alto-tel') || String(alto), 10) || alto;

  var css =
    '.om-perc{position:fixed;z-index:2147483000;display:flex;gap:10px;pointer-events:none;' +
    'bottom:calc(' + (12 + alza) + 'px + env(safe-area-inset-bottom,0px))}' +
    '.om-perc.basso{left:50%;transform:translateX(-50%)}' +
    '.om-perc.basso-dx{right:14px}' +
    '.om-perc.basso-sx{left:14px}' +
    '.om-perc.alto-dx{bottom:auto;top:calc(' + alto + 'px + env(safe-area-inset-top,0px));right:14px}' +
    '.om-perc.fondo{position:relative;left:auto;right:auto;bottom:auto;transform:none;justify-content:center;flex:0 0 auto;' +
    'width:100%;box-sizing:border-box;margin:28px 0 0;padding:0 16px calc(18px + env(safe-area-inset-bottom,0px));clear:both}' +
    '.om-perc a{pointer-events:auto;display:inline-flex;align-items:center;justify-content:center;min-height:44px;min-width:112px;' +
    'padding:0 18px;box-sizing:border-box;font:600 15px/1 "Rajdhani","Barlow Condensed","Segoe UI",system-ui,sans-serif;' +
    'letter-spacing:1.4px;text-transform:uppercase;text-decoration:none;white-space:nowrap;-webkit-tap-highlight-color:transparent;' +
    'border:1px solid #1f4e79;color:#1f4e79;background:rgba(255,253,249,.94);box-shadow:0 2px 10px rgba(60,40,20,.16);' +
    '-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);transition:background .15s,color .15s}' +
    '.om-perc a:hover,.om-perc a:focus-visible{background:#1f4e79;color:#fff;outline:none}' +
    '.om-perc a.av{border-color:#b5462c;background:#b5462c;color:#fff}' +
    '.om-perc a.av:hover,.om-perc a.av:focus-visible{background:#933620;border-color:#933620}' +
    '@media (max-width:520px){.om-perc{gap:8px}.om-perc a{min-width:104px;padding:0 14px;font-size:14px}}' +
    (posTel ? '@media (max-width:700px){#omPerc{bottom:auto;transform:none;top:calc(' + altoTel + 'px + env(safe-area-inset-top,0px));' +
      (posTel === 'alto-sx' ? 'left:12px;right:auto' : 'right:12px;left:auto') + '}}' : '') +
    '@media print{.om-perc{display:none!important}}';

  function metti() {
    if (document.getElementById('omPerc')) return;
    var st = document.createElement('style');
    st.textContent = css;
    document.head.appendChild(st);
    var nav = document.createElement('nav');
    nav.id = 'omPerc';
    nav.className = 'om-perc ' + pos;
    nav.setAttribute('aria-label', 'Percorso');
    nav.innerHTML = '<a class="in" href="' + rel(prima) + '" rel="prev">‹ Indietro</a>' +
                    '<a class="av" href="' + rel(dopo) + '" rel="next">Avanti ›</a>';
    document.body.appendChild(nav);
  }
  if (document.body) metti();
  else document.addEventListener('DOMContentLoaded', metti);
})();
