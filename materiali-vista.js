/* =====================================================================
   OTTICA MACRÌ · disegna le schede di materiali.js
   - index.html:     MaterialiVista.sezione(contenitore, { sviluppo: function(){ return true|false } })
   - preventivi:     MaterialiVista.schede(voci)  -> HTML delle schede (solo lettura)
   Nessun dato qui: tutto arriva da materiali.js (window.MATERIALI).
   ===================================================================== */
(function () {
  var M = window.MATERIALI;
  var E = function (s) { return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
  var ICO = { pagina: '▣', pdf: 'PDF', video: '▶', immagine: '◩', cartella: '🗀', gif: 'GIF', documento: '≡' };
  var TIPO = { pagina: 'pagina', pdf: 'PDF', video: 'video', immagine: 'immagine', cartella: 'cartella', gif: 'GIF', documento: 'documento' };

  function scheda(v, o) {
    o = o || {};
    var base = o.base || '';
    var lav = v.stato === 'in lavorazione', noi = !v.perAldo;
    var img = '';
    if (v.miniatura) {
      var orig = M.url(v.miniatura, base), mini = M.url(M.mini(v.miniatura), base);
      var intera = (v.gruppo === 'grafiche' || v.gruppo === 'logo' || /\.svg$/i.test(v.miniatura)) && v.tipo !== 'pagina' || /logo|draghetto/i.test(v.miniatura);
      img = '<img src="' + E(mini) + '" data-orig="' + E(orig) + '" alt="" loading="lazy" decoding="async"' + (intera ? ' class="intera"' : '') +
            ' onerror="if(this.dataset.orig&&this.src.indexOf(this.dataset.orig)<0){this.src=this.dataset.orig}else{this.remove()}">';
    }
    var nuovaScheda = v.tipo === 'pdf' || v.tipo === 'video' || v.tipo === 'immagine' || v.tipo === 'gif' || v.tipo === 'documento' || v.tipo === 'cartella';
    return '<a class="mat-card' + (lav ? ' lav' : '') + (noi ? ' noi' : '') + '" href="' + E(M.url(v.percorso, base)) + '"' +
      (nuovaScheda ? ' target="_blank" rel="noopener"' : '') + ' data-mirino="' + E((TIPO[v.tipo] || v.tipo).toUpperCase() + (lav ? ' · IN LAVORAZIONE' : '')) + '"' +
      (lav ? ' title="In lavorazione: potrebbe non essere ancora pronto"' : '') + '>' +
      '<span class="mat-img"><span class="mat-ico" aria-hidden="true"><span>' + (ICO[v.tipo] || '▣') + '</span></span>' + img +
      '<span class="mat-badge"><i>' + E(TIPO[v.tipo] || v.tipo) + '</i>' + (lav ? '<i class="lav">in lavorazione</i>' : '') + (noi ? '<i class="noi">solo noi</i>' : '') + '</span></span>' +
      '<div class="mat-txt"><h4>' + E(v.titolo) + '</h4><p>' + E(v.descr) + '</p>' +
      (o.percorso ? '<span class="mat-perc">' + E(v.percorso) + '</span>' : '') + '</div></a>';
  }

  function schede(voci, o) { return voci.map(function (v) { return scheda(v, o); }).join(''); }

  function sezione(root, o) {
    if (!root) return;
    if (!M) { root.innerHTML = '<p class="mat-vuoto">Non trovo materiali.js: deve stare nella cartella principale del progetto.</p>'; return; }
    o = o || {};
    var dev = o.sviluppo || function () { return false; };
    var filtro = 'tutti', testo = '';
    try { filtro = sessionStorage.getItem('om-materiali-filtro') || 'tutti'; } catch (e) {}
    if (filtro !== 'tutti' && !M.gruppo(filtro)) filtro = 'tutti';

    root.innerHTML =
      '<div class="mat-testa"><div><div class="pv-eti" style="font:500 13px var(--h-mono);letter-spacing:2.6px;color:var(--h-cyan);text-transform:uppercase">// Tutto in un posto · aggiornato ' + E(M.aggiornato) + '</div>' +
      '<h2 data-crt>Tutto il <span class="oro">materiale</span></h2>' +
      '<p>Ogni cosa che abbiamo preparato per Ottica Macrì: visite, app, grafiche, logo, video e documenti. Si tocca una scheda e si apre.</p></div>' +
      '<div class="mat-conta"><div><b data-mc="tot">0</b><em>Materiali</em></div><div class="lav"><b data-mc="lav">0</b><em>In lavorazione</em></div></div></div>' +
      '<div class="mat-barra"><label class="mat-cerca"><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 5 5"/></svg>' +
      '<input type="search" placeholder="Cerca: vetrina, logo, video…" aria-label="Cerca nel materiale"></label><div class="mat-filtri" role="group" aria-label="Filtra per gruppo"></div>' +
      '<p class="mat-dev-nota" hidden>Area sviluppo attiva: si vedono anche le schede «solo noi» (non per Aldo).</p></div>' +
      '<div class="mat-corpo"></div>' +
      '<p class="mat-piede">Per aggiungere un materiale: una voce in materiali.js · controllo: python materiali_controlla.py</p>';

    var filtri = root.querySelector('.mat-filtri'), corpo = root.querySelector('.mat-corpo'), input = root.querySelector('input');

    function visibili() {
      var d = dev();
      return M.voci.filter(function (v) { return d || v.perAldo; });
    }
    function cerca(v) {
      if (!testo) return true;
      var t = (v.titolo + ' ' + v.descr + ' ' + v.percorso + ' ' + v.tipo + ' ' + v.stato + ' ' + (M.gruppo(v.gruppo) || {}).nome).toLowerCase();
      return testo.split(/\s+/).every(function (p) { return t.indexOf(p) >= 0; });
    }
    function disegna() {
      var d = dev(), tutte = visibili();
      root.querySelector('.mat-dev-nota').hidden = !d;
      root.querySelector('[data-mc="tot"]').textContent = tutte.length;
      root.querySelector('[data-mc="lav"]').textContent = tutte.filter(function (v) { return v.stato === 'in lavorazione'; }).length;
      filtri.innerHTML = '<button type="button" class="chip" data-g="tutti" aria-pressed="' + (filtro === 'tutti') + '">Tutti <span class="n">' + tutte.length + '</span></button>' +
        M.gruppi.map(function (g) {
          var n = tutte.filter(function (v) { return v.gruppo === g.id; }).length;
          return n ? '<button type="button" class="chip" data-g="' + g.id + '" aria-pressed="' + (filtro === g.id) + '">' + E(g.nome) + ' <span class="n">' + n + '</span></button>' : '';
        }).join('');
      var h = '';
      M.gruppi.forEach(function (g) {
        if (filtro !== 'tutti' && filtro !== g.id) return;
        var lista = tutte.filter(function (v) { return v.gruppo === g.id && cerca(v); });
        if (!lista.length) return;
        h += '<h3 class="mat-gruppo">' + E(g.nome) + ' <span class="n">· ' + lista.length + '</span></h3><div class="mat-griglia">' + schede(lista, { percorso: d }) + '</div>';
      });
      corpo.innerHTML = h || '<p class="mat-vuoto">Nessun materiale trovato' + (testo ? ' per «' + E(testo) + '»' : '') + '.</p>';
    }
    filtri.addEventListener('click', function (e) {
      var b = e.target.closest('button[data-g]'); if (!b) return;
      filtro = b.getAttribute('data-g');
      try { sessionStorage.setItem('om-materiali-filtro', filtro); } catch (x) {}
      disegna();
    });
    input.addEventListener('input', function () { testo = input.value.trim().toLowerCase(); disegna(); });
    document.addEventListener('area-sviluppo', disegna);
    disegna();
  }

  window.MaterialiVista = { scheda: scheda, schede: schede, sezione: sezione };
})();
