/* Ottica Macrì · proposta per lo schermo in vetrina (6/11/2026)
   Usata dalle schede del tablet in visita/visita-reale.html, visita/vetrina-aumentata.html e nel 3D (negozio3d/allestimento.js).
   Legge window.DISPOSITIVI.schermiVetrina (dispositivi.js): mostra il prodotto «scelto» e, sotto «Alternative ▾», tutti gli altri.
   Prezzi: solo quelli scritti in dispositivi.js (indicativi). Uso: el.innerHTML += PropostaSchermo.html(); PropostaSchermo.aggancia(el); */
(function () {
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function stile() {
    if (document.getElementById('ps-stile')) return;
    var st = document.createElement('style'); st.id = 'ps-stile';
    st.textContent =
      '.ps{margin-top:10px;font-size:15px;line-height:1.35}' +
      '.ps-scelto{padding:9px 11px;background:rgba(31,78,121,.08);border-left:3px solid #1f4e79}' +
      '.ps-tag{display:block;font:700 11px var(--h-mono,var(--mono,monospace));letter-spacing:1.5px;text-transform:uppercase;color:#b5462c;margin-bottom:2px}' +
      '.ps-scelto b.n{font-size:16px}' +
      '.ps-r{opacity:.8;font-size:14px}' +
      '.ps-p{margin-top:3px}.ps-p b,.ps-lista .pz{font-family:var(--h-mono,var(--mono,monospace));font-size:14px}' +
      '.ps-alt{margin-top:8px;padding:7px 12px;font:700 13px var(--h-mono,var(--mono,monospace));letter-spacing:1px;text-transform:uppercase;cursor:pointer;' +
        'background:transparent;color:#1f4e79;border:1.5px solid #1f4e79;border-radius:2px;min-height:36px}' +
      '.ps-alt:hover,.ps-alt[aria-expanded="true"]{background:#1f4e79;color:#fff}' +
      '.ps-lista{list-style:none;margin:8px 0 0;padding:0}' +
      '.ps-lista li{padding:7px 0 7px 10px;border-left:2px solid rgba(181,70,44,.5);margin-bottom:6px}' +
      '.ps-lista li b{display:block}.ps-lista .r{opacity:.8;font-size:13.5px}' +
      '.ps-nota{display:block;margin-top:6px;font-size:12px;opacity:.7}';
    document.head.appendChild(st);
  }
  function html() {
    var L = (window.DISPOSITIVI && window.DISPOSITIVI.schermiVetrina) || [];
    if (!L.length) return '';
    stile();
    var sc = L.filter(function (x) { return x.scelto; })[0] || L[0], alt = L.filter(function (x) { return x !== sc; });
    var h = '<div class="ps"><div class="ps-scelto"><span class="ps-tag">Il tablet che ti proponiamo</span><b class="n">' + esc(sc.nome) + '</b>' +
      '<div class="ps-r">' + esc(sc.diagonale) + (sc.note ? ' · ' + esc(sc.note) : '') + '</div>' +
      '<div class="ps-p">Prezzo indicativo: <b>' + esc(sc.prezzo) + '</b></div></div>';
    if (alt.length) h += '<button type="button" class="ps-alt" aria-expanded="false">Alternative ▾</button>' +
      '<ul class="ps-lista" hidden><li style="border:0;padding-left:0;opacity:.85">Se preferisci uno schermo più grande, puoi scegliere tra:</li>' + alt.map(function (a) {
        return '<li><b>' + esc(a.nome) + '</b><span class="r">' + esc(a.diagonale) + (a.tipo ? ' · ' + esc(a.tipo) : '') + '</span>' +
          (a.note ? '<div>' + esc(a.note) + '</div>' : '') + '<div>Prezzo indicativo: <span class="pz">' + esc(a.prezzo) + '</span></div></li>';
      }).join('') + '</ul>';
    return h + '<small class="ps-nota">prezzi indicativi da verificare all’acquisto</small></div>';
  }
  function aggancia(el) {
    var b = el && el.querySelector('.ps-alt'); if (!b) return;
    b.addEventListener('click', function (e) {
      e.stopPropagation(); var l = el.querySelector('.ps-lista'), ap = l.hidden;
      l.hidden = !ap; b.setAttribute('aria-expanded', ap ? 'true' : 'false'); b.textContent = ap ? 'Alternative ▴' : 'Alternative ▾';
    });
  }
  window.PropostaSchermo = { html: html, aggancia: aggancia };
})();
