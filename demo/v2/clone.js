/* =====================================================================
   OTTICA MACRÌ · DEMO V2 · CLONE DI STORE // CRAFT (5/11/2026) · NUCLEO
   Copia fedele, adattata all'ottica, degli strumenti di STORE // CRAFT (sola lettura dell'originale):
   - STAMPA VERA: fogli in mm (A4 verticale/orizzontale, etichette 57 × 32 mm) con @page a misura, una pagina per foglio.
   - LISTA DI STAMPA (lista-stampa.js): aggiungi il foglio, riordina, elimina, svuota, «Stampa Lista», scadenza 48 ore.
   - CRONOLOGIA DI STAMPA (cronologia-stampa.js): ogni stampa registrata (stesso foglio = «N volte»), 7 giorni,
     filtri, anteprima, ristampa, aggiungi a lista, selezione multipla con copie.
   - LOGHI PERSONALI (genera_loghi.html + gestisci_lista.html): carica, toglie il fondo bianco/nero, nome, ordina,
     rinomina, elimina, esporta/importa il backup .json.
   - UTILITÀ CASSA (cassa.js): Calcola Sconto, Aliquota, Cambio Valuta, IVA, QR, Bacheca (post-it).
   I modelli dei fogli stanno in clone-cartelli.js e clone-cartellini.js (registrati in CLONE_SC.MOD).
   STILI: ogni foglio ha data-modello="<nome>" e la classe "stile-<STILI.corrente()>"; dopo ogni disegno si chiama
   STILI.applica(nome, dati, contenitore) se window.STILI esiste. Le variabili CSS --sc-* (clone.css) si possono
   ridefinire per famiglia di stile (.stile-<nome>).
   ===================================================================== */
(function () {
  'use strict';
  var API = null, D = window.DATI || {};
  var MM = 96 / 25.4;
  var LOGO = '../media/logo/marchi6/06-ovale/06-ovale-colori.svg';
  var C = window.CLONE_SC = { MOD: {}, PAG: {}, LOGO: LOGO, MM: MM };

  /* ---------- utilità ---------- */
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clona(o) { return JSON.parse(JSON.stringify(o)); }
  function due(n) { return (n < 10 ? '0' : '') + n; }
  // campi-prezzo.js: l'ultima , o . è il decimale se seguita da 1-2 cifre; tre cifre dopo il punto = migliaia
  function leggiPrezzo(s) {
    s = String(s == null ? '' : s).replace(/[^\d.,]/g, ''); if (!s) return NaN;
    var i = Math.max(s.lastIndexOf(','), s.lastIndexOf('.'));
    if (i >= 0) { var dec = s.slice(i + 1); if (dec.length >= 1 && dec.length <= 2) return parseFloat(s.slice(0, i).replace(/[.,]/g, '') + '.' + dec); }
    return parseFloat(s.replace(/[.,]/g, ''));
  }
  function fmt2(v) { v = +v; if (isNaN(v)) return ''; return v.toFixed(2).replace('.', ','); }
  function norm(s) { var x = leggiPrezzo(s); return isNaN(x) ? '' : fmt2(x); }
  function prezzo(s) { var x = leggiPrezzo(s); return isNaN(x) ? '' : '€ ' + fmt2(x); }
  function pc(s) { var x = parseInt(String(s == null ? '' : s).replace(/\D/g, ''), 10); return isNaN(x) ? '' : '-' + Math.max(0, Math.min(99, x)) + '%'; }
  function dataIt(d) { return due(d.getDate()) + '/' + due(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function oraIt(d) { return due(d.getHours()) + ':' + due(d.getMinutes()); }
  function hash(s) { var h = 0x811c9dc5; for (var i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = (h * 16777619) >>> 0; } return h.toString(16); }
  function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function S() { return API.S(); }
  C.u = { $: $, $$: $$, esc: esc, clona: clona, leggiPrezzo: leggiPrezzo, fmt2: fmt2, norm: norm, prezzo: prezzo, pc: pc, dataIt: dataIt, oraIt: oraIt, uid: uid };

  /* ---------- STILI (agente STILI GRAFICI: demo/v2/stili.js) ----------
     Nell'anteprima il foglio eredita lo stile della pagina (classe "sg sg-<id>" che stili.js mette su <body>);
     quando il foglio va in stampa, in lista o in cronologia la classe di STILI.classe() si scrive SUL foglio,
     così resta com'era anche se poi si cambia stile. Lo stile cambia solo colori e caratteri, mai le misure. */
  function stile() { try { return (window.STILI && window.STILI.attuale && window.STILI.attuale()) || 'classico'; } catch (e) { return 'classico'; } }
  function stileCls() { return ''; }
  function fissaStile(root) {
    if (!window.STILI || !window.STILI.classe) return;
    var cl; try { cl = window.STILI.classe().split(/\s+/); } catch (e) { return; }
    $$('.sc-foglio,.sc-dymo,.sc-qrpag', root).forEach(function (el) { if (!el.classList.contains('sg')) cl.forEach(function (c) { if (c) el.classList.add(c); }); });
  }
  C.stile = stile; C.stileCls = stileCls; C.fissaStile = fissaStile;

  /* ---------- adatta i testi che non entrano (fitText dell'originale) ---------- */
  function adattaTesti(root) {
    $$('[data-fit]', root).forEach(function (el) {
      var min = parseFloat(el.getAttribute('data-fit')) || 8, fs = parseFloat(el.style.fontSize) || parseFloat(getComputedStyle(el).fontSize), n = 0;
      if (!el.clientWidth) return;
      // solo la larghezza: con line-height < 1 l'altezza «sborda» sempre e farebbe rimpicciolire tutto
      while (n++ < 200 && fs > min && el.scrollWidth > el.clientWidth + 0.5) { fs -= 0.5; el.style.fontSize = fs + 'px'; }
    });
  }
  C.adattaTesti = adattaTesti;
  // dopo ogni disegno dell'app (app.js render / aggiornaAnteprima)
  C.dopo = function () { var m = $('#main'); if (!m) return; adattaTesti(m); };

  /* ---------- pagine = [{ html, w, h }] (mm) · rese «finite»: stili applicati e testi adattati ---------- */
  function pagineFinite(pagine) {
    var box = document.createElement('div');
    box.style.cssText = 'position:fixed;left:-30000px;top:0;visibility:hidden;pointer-events:none';
    document.body.appendChild(box);
    var out = pagine.map(function (p) {
      box.innerHTML = '<div class="sc-carta" style="width:' + p.w + 'mm;height:' + p.h + 'mm">' + p.html + '</div>';
      fissaStile(box); adattaTesti(box);
      var o = { html: box.firstChild.innerHTML, w: p.w, h: p.h }; if (p.copie > 1) o.copie = p.copie; return o;
    });
    box.remove();
    return out;
  }
  C.pagineFinite = pagineFinite;

  /* ---------- STAMPA VERA ---------- */
  var ultima = 0;
  function nomePag(p) { return 'sc' + String(p.w).replace('.', '_') + 'x' + String(p.h).replace('.', '_'); }
  function prepara(pagine) {
    var box = document.getElementById('sc-stampa');
    if (!box) { box = document.createElement('div'); box.id = 'sc-stampa'; box.setAttribute('aria-hidden', 'true'); document.body.appendChild(box); }
    var regole = {}, h = '';
    pagine.forEach(function (p) { var nm = nomePag(p); regole[nm] = '@page ' + nm + '{size:' + p.w + 'mm ' + p.h + 'mm;margin:0}'; h += '<div class="sc-carta" style="width:' + p.w + 'mm;height:' + p.h + 'mm;page:' + nm + '">' + p.html + '</div>'; });
    box.innerHTML = h;
    var st = document.getElementById('sc-pagina');
    if (!st) { st = document.createElement('style'); st.id = 'sc-pagina'; document.head.appendChild(st); }
    var p0 = pagine[0] || { w: 210, h: 297 };
    st.textContent = '@page{size:' + p0.w + 'mm ' + p0.h + 'mm;margin:0}' + Object.keys(regole).map(function (k) { return regole[k]; }).join('');
    document.documentElement.classList.add('sc-stampa-on');
    return box;
  }
  function spegni() { document.documentElement.classList.remove('sc-stampa-on'); }
  window.addEventListener('afterprint', function () { setTimeout(spegni, 200); });
  window.addEventListener('hashchange', spegni);
  /* stampa(pagine, titolo, tipo, {nonRegistrare, copie}) */
  function stampa(pagine, titolo, tipo, opz) {
    opz = opz || {};
    if (Date.now() - ultima < 1200) return; ultima = Date.now();
    if (!pagine || !pagine.length) { API.toast('Niente da stampare'); return; }
    var fin = opz.finite ? pagine : pagineFinite(pagine);
    if (!opz.nonRegistrare) registra(fin, titolo, tipo);
    var tutte = [];
    fin.forEach(function (p) { for (var i = 0; i < (p.copie || 1); i++) tutte.push(p); });
    var box = prepara(tutte);
    API.toast('Stampa: ' + tutte.length + (tutte.length === 1 ? ' foglio' : ' fogli') + ' · nella finestra scegli «Dimensioni effettive / 100%»');
    var imgs = $$('img', box);
    Promise.all(imgs.map(function (im) { return im.complete ? 0 : new Promise(function (ok) { im.onload = im.onerror = ok; }); }))
      .then(function () { return document.fonts && document.fonts.ready; })
      .then(function () { setTimeout(function () { try { window.print(); } catch (e) {} }, 80); });
    salvaPresto();
  }
  C.stampa = stampa;
  C.prepara = function (pagine) { return prepara(pagineFinite(pagine)); };   // per le prove automatiche (PDF)
  // cartelli.js (supporti veri): pagine .cv-pg già in mm
  C.stampaCv = function (pagineHtml, foglio, titolo) {
    var F = foglio === 'A3' ? { w: 297, h: 420 } : { w: 210, h: 297 };
    stampa(pagineHtml.map(function (h) { return { html: h, w: F.w, h: F.h }; }), titolo, 'Cartelli', {});
  };

  /* ---------- CRONOLOGIA DI STAMPA (7 giorni dall'ultima stampa) ---------- */
  var GIORNI7 = 7 * 864e5, ORE48 = 48 * 36e5;
  function storico() { var s = S(); if (!Array.isArray(s.storico)) s.storico = []; var lim = Date.now() - GIORNI7; s.storico = s.storico.filter(function (x) { return x.t > lim; }); return s.storico; }
  function registra(pagine, titolo, tipo) {
    try {
      var st = storico(), imp = hash(pagine.map(function (p) { return p.html; }).join('|'));
      var g = new Date(); var k = g.getFullYear() + '-' + due(g.getMonth() + 1) + '-' + due(g.getDate());
      var x = st.filter(function (e) { return e.imp === imp; })[0];
      if (x) { x.t = Date.now(); x.volte = (x.volte || 1) + 1; x.giorni = x.giorni || {}; x.giorni[k] = (x.giorni[k] || 0) + 1; st.splice(st.indexOf(x), 1); st.unshift(x); setTimeout(function () { API.toast('Ristampa segnata nella cronologia'); }, 2600); }
      else { st.unshift({ id: uid(), t: Date.now(), prima: Date.now(), titolo: titolo || 'Stampa', tipo: tipo || 'Cartelli', pagine: pagine.map(function (p) { return { html: p.html, w: p.w, h: p.h }; }), imp: imp, volte: 1, giorni: (function () { var o = {}; o[k] = 1; return o; })() }); setTimeout(function () { API.toast('Stampa salvata nella cronologia'); }, 2600); }
      if (st.length > 40) st.length = 40;
    } catch (e) { if (window.console) console.warn('cronologia', e); }
  }
  C.registra = registra;

  /* ---------- LISTA DI STAMPA (48 ore) ---------- */
  function lista() { var s = S(); if (!Array.isArray(s.lista)) s.lista = []; var lim = Date.now() - ORE48; s.lista = s.lista.filter(function (x) { return x && x.pag && x.t > lim; }); return s.lista; }
  function aggiungiLista(pagine, titolo, tipo) {
    if (!pagine || !pagine.length) { API.toast('Non è stato possibile aggiungere la pagina alla lista di stampa'); return; }
    var fin = pagineFinite(pagine), l = lista();
    fin.forEach(function (p) { l.push({ id: uid(), t: Date.now(), titolo: titolo || 'Foglio', tipo: tipo || 'Cartelli', pag: p }); });
    if (l.length > 40) l.splice(0, l.length - 40);
    API.toast('Pagina aggiunta alla lista di stampa (' + l.length + (l.length === 1 ? ' pagina)' : ' pagine)'));
    $$('[data-sc-nlista]').forEach(function (e) { e.textContent = l.length; });
    $$('a[href="#creator/lista"].btn').forEach(function (e) { if (!e.querySelector('[data-sc-nlista]')) e.textContent = '☰ Gestisci lista di stampa (' + l.length + ')'; });
    salvaPresto();
  }
  C.aggiungiLista = aggiungiLista;
  C.nLista = function () { return lista().length; };

  /* ---------- anteprima di una pagina in mm (scalata da app.js adatta()) ---------- */
  function vista(p, cls) { return '<div class="sc-vista ' + (cls || '') + '" style="aspect-ratio:' + p.w + '/' + p.h + '"><div class="scala" data-w="' + (p.w * MM).toFixed(2) + '"><div class="sc-carta" style="width:' + p.w + 'mm;height:' + p.h + 'mm">' + p.html + '</div></div></div>'; }
  C.vista = vista;
  function mini(p) { return '<div class="sc-mini" style="aspect-ratio:' + p.w + '/' + p.h + '"><div class="scala" data-w="' + (p.w * MM).toFixed(2) + '"><div class="sc-carta" style="width:' + p.w + 'mm;height:' + p.h + 'mm">' + p.html + '</div></div></div>'; }
  C.mini = mini;
  // pulsanti di strumenti-stampa.js sotto il pannello + STAMPA
  C.strumenti = function (lab, extra) {
    return '<div class="sc-strumenti"><button class="btn pri xl wide" type="button" data-act="stampa">🖨 ' + esc(lab || 'Stampa') + '</button>' +
      '<div class="sc-tb"><a class="btn sm" href="#creator/lista" title="Gestisci lista di stampa">☰ Gestisci lista di stampa (<span data-sc-nlista>' + lista().length + '</span>)</a>' +
      '<button class="btn sm" type="button" data-act="aggiungiLista" title="Aggiungi a lista stampa">＋ Aggiungi a lista stampa</button>' + (extra || '') + '</div></div>';
  };

  /* ---------- salvataggio tra una sessione e l'altra (app.js salva S) ---------- */
  var tSalva;
  function salvaPresto() { clearTimeout(tSalva); tSalva = setTimeout(function () { if (API && API.salva) API.salva(); }, 150); }
  C.salvaPresto = salvaPresto;

  /* =====================================================================
     PAGINA · LISTA DI STAMPA (luxury/lista-stampa.html) + riordino
     ===================================================================== */
  function paginaLista() {
    var l = lista(), d = API.ed({ sel: 0 });
    if (d.sel >= l.length) d.sel = Math.max(0, l.length - 1);
    var x = l[d.sel];
    var sx = '<div class="card glass sc-lista-sx"><h2>Lista di Stampa</h2><p class="muto">' + (l.length === 1 ? '1 pagina' : l.length + ' pagine') + ' · restano 48 ore</p>' +
      (l.length ? '<div class="sc-lista-mini">' + l.map(function (e, i) {
        return '<div class="sc-lm' + (i === d.sel ? ' on' : '') + '"><button type="button" class="sc-lm-v" data-act="scListaSel" data-i="' + i + '" aria-label="Pagina ' + (i + 1) + '">' + mini(e.pag) + '</button>' +
          '<div class="sc-lm-t"><b>' + (i + 1) + '</b> ' + esc(String(e.titolo).split(' · ')[0]) + '</div>' +
          '<div class="sc-lm-az"><button type="button" data-act="scListaSu" data-i="' + i + '" aria-label="Sposta su"' + (i ? '' : ' disabled') + '>↑</button><button type="button" data-act="scListaGiu" data-i="' + i + '" aria-label="Sposta giù"' + (i < l.length - 1 ? '' : ' disabled') + '>↓</button></div></div>'; }).join('') + '</div>'
        : '<div class="vuoto">La lista di stampa è vuota. Aggiungi i fogli dai cartelli, cartellini ed etichette con il pulsante «Aggiungi a lista stampa».</div>') + '</div>';
    var ce = '<div class="tavolo glass sc-lista-ce"><div class="eti-ant"><span>' + (x ? 'Pagina ' + (d.sel + 1) + ' di ' + l.length : 'Anteprima') + '</span><span>' + (x ? x.pag.w + ' × ' + x.pag.h + ' mm' : '') + '</span></div>' +
      (x ? vista(x.pag, 'grande') + '<p class="cv-cap">' + esc(x.titolo) + ' · aggiunta il ' + dataIt(new Date(x.t)) + ' ' + oraIt(new Date(x.t)) + '</p>' : '<div class="vuoto" style="width:100%">Nessuna pagina</div>') + '</div>';
    var dx = '<div class="card glass sc-lista-dx"><div class="pulsantiera" style="margin-top:0"><button class="btn pri xl" type="button" data-act="scListaStampa"' + (l.length ? '' : ' disabled') + '>🖨 Stampa Lista (.PDF)</button>' +
      '<button class="btn" type="button" data-act="scListaElimina"' + (l.length ? '' : ' disabled') + '>✕ Elimina Pagina</button><button class="btn" type="button" data-act="scListaSvuota"' + (l.length ? '' : ' disabled') + '>⊘ Svuota Lista</button>' +
      '<a class="btn" href="#creator/cronologia">🕘 Cronologia di Stampa</a></div><p class="piccolo muto">Si stampano tutte insieme, una pagina per foglio, alla misura vera. Nella finestra di stampa scegli «Dimensioni effettive / 100%». Per salvare il PDF scegli «Salva come PDF».</p></div>';
    return { html: API.testa('Lista di Stampa', 'Lista di stampa e cronologia') + '<div class="sc-lista">' + sx + ce + dx + '</div>' };
  }

  /* =====================================================================
     PAGINA · CRONOLOGIA DI STAMPA (luxury/cronologia-stampa.html)
     ===================================================================== */
  var TIPI = ['Cartelli', 'Cartellini', 'Promo', 'Etichette', 'Stampe pronte'];
  var GG = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  function giornoTesto(t) {
    var d = new Date(t), oggi = new Date(); oggi.setHours(0, 0, 0, 0); var g = new Date(d); g.setHours(0, 0, 0, 0);
    var diff = Math.round((oggi - g) / 864e5);
    return (diff === 0 ? 'Oggi · ' : diff === 1 ? 'Ieri · ' : '') + GG[d.getDay()] + ' ' + d.getDate() + '/' + due(d.getMonth() + 1);
  }
  function paginaCronologia(r) {
    var st = storico(), d = API.ed({ filtro: r.v || 'Tutte', multi: false, sel: {} });
    var vis = st.filter(function (x) { return d.filtro === 'Tutte' || x.tipo === d.filtro; });
    var kb = 0; try { kb = Math.round(JSON.stringify(st).length / 1024); } catch (e) {}
    var h = API.testa('Cronologia di Stampa', 'Lista di stampa e cronologia') + '<div class="card glass sc-cr">';
    h += '<div class="chips sc-filtri">' + ['Tutte'].concat(TIPI).map(function (t) { var n = t === 'Tutte' ? st.length : st.filter(function (x) { return x.tipo === t; }).length; return '<button type="button" class="chipb' + (d.filtro === t ? ' on' : '') + '" data-act="scCrFiltro" data-v="' + t + '">' + t + ' <span class="sc-n">' + n + '</span></button>'; }).join('') + '</div>';
    h += '<div class="sc-cr-barra"><span class="muto">ultimi 7 giorni · ' + st.length + (st.length === 1 ? ' stampa' : ' stampe') + ' · ' + kb + ' KB usati nel browser</span><span class="sp"></span>' +
      '<button class="btn sm" type="button" data-act="scCrMulti">' + (d.multi ? 'Fine selezione' : 'Seleziona più stampe') + '</button>' +
      (d.multi ? '<button class="btn sm" type="button" data-act="scCrTutte">' + (vis.length && vis.every(function (x) { return d.sel[x.id]; }) ? 'Deseleziona tutte' : 'Seleziona tutte') + '</button>' : '') +
      '<button class="btn sm" type="button" data-act="scCrSvuota"' + (st.length ? '' : ' disabled') + '>Svuota cronologia</button></div>';
    if (!vis.length) h += '<div class="vuoto">Nessuna stampa negli ultimi 7 giorni' + (d.filtro !== 'Tutte' ? ' per «' + esc(d.filtro) + '»' : '') + '. Ogni foglio stampato dall\'app finisce qui da solo.</div>';
    var ultimoG = '';
    vis.forEach(function (x) {
      var gt = giornoTesto(x.t); if (gt !== ultimoG) { if (ultimoG) h += '</div>'; h += '<h3 class="sc-cr-g">' + esc(gt) + '</h3><div class="sc-cr-griglia">'; ultimoG = gt; }
      var sel = d.multi && d.sel[x.id];
      h += '<div class="sc-cr-voce' + (sel ? ' on' : '') + '"><button type="button" class="sc-cr-btn" data-act="' + (d.multi ? 'scCrSel' : 'scCrApri') + '" data-id="' + x.id + '">' + mini(x.pagine[0]) +
        '<span class="sc-cr-t"><b>' + esc(String(x.titolo).split(' · ')[0]) + '</b><span>' + esc(x.tipo) + ' · ' + oraIt(new Date(x.t)) + (x.volte > 1 ? ' · ' + x.volte + ' volte' : '') + (x.pagine.length > 1 ? ' · ' + x.pagine.length + ' fogli' : '') + '</span></span></button>' +
        (sel ? '<div class="sc-copie"><span>Copie</span><button type="button" data-act="scCrCopie" data-id="' + x.id + '" data-d="-1">−</button><b>' + d.sel[x.id] + '</b><button type="button" data-act="scCrCopie" data-id="' + x.id + '" data-d="1">+</button><button type="button" data-act="scCrVia" data-id="' + x.id + '" aria-label="Elimina">✕</button></div>' : '') + '</div>';
    });
    if (ultimoG) h += '</div>';
    if (d.multi) {
      var ids = Object.keys(d.sel).filter(function (k) { return d.sel[k]; }), fogli = 0;
      ids.forEach(function (k) { var x = st.filter(function (e) { return e.id === k; })[0]; if (x) fogli += x.pagine.length * d.sel[k]; });
      h += '<div class="sc-cr-piede"><b>' + ids.length + (ids.length === 1 ? ' stampa' : ' stampe') + ' · ' + fogli + ' fogli in tutto</b><span class="sp"></span><button class="btn" type="button" data-act="scCrLista"' + (ids.length ? '' : ' disabled') + '>＋ Aggiungi a lista</button><button class="btn pri" type="button" data-act="scCrRistampa"' + (ids.length ? '' : ' disabled') + '>🖨 Ristampa (' + fogli + ')</button></div>';
    }
    return { html: h + '</div>' };
  }
  function trovaSt(id) { return storico().filter(function (x) { return x.id === id; })[0]; }
  function apriStampa(x) {
    API.finestra('<h2>' + esc(String(x.titolo).split(' · ')[0]) + '</h2><div class="sc-cr-modal">' + vista(x.pagine[0], 'grande') + '</div>' +
      '<p class="muto">' + esc(x.tipo) + ' · foglio ' + x.pagine[0].w + ' × ' + x.pagine[0].h + ' mm' + (x.pagine.length > 1 ? ' · ' + x.pagine.length + ' fogli' : '') + '<br>stampata il ' + dataIt(new Date(x.t)) + ' alle ' + oraIt(new Date(x.t)) + (x.volte > 1 ? ' · ' + x.volte + ' volte' : '') + '</p>' +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="scCrStampa" data-id="' + x.id + '">🖨 Stampa (.PDF)</button><button class="btn" type="button" data-act="scCrAggiungi" data-id="' + x.id + '">＋ Aggiungi a lista di stampa</button>' +
      '<button class="btn" type="button" data-act="scCrElimina" data-id="' + x.id + '">✕ Elimina dalla cronologia</button><button class="btn" type="button" data-act="chiudi">Chiudi</button></div>', true);
  }

  /* =====================================================================
     LOGHI PERSONALI
     ===================================================================== */
  function loghi() { var s = S(); if (!Array.isArray(s.loghi)) s.loghi = []; s.loghi.forEach(function (l, i) { if (!l.id) l.id = 'custom_' + (Date.now() + i); if (!l.data) l.data = Date.now(); l.nome = String(l.nome || 'LOGO').toUpperCase(); }); return s.loghi; }
  C.loghi = loghi;
  C.logo = function (id) { return id ? loghi().filter(function (l) { return l.id === id; })[0] || null : null; };
  // genera_loghi.html · runColorToAlpha: fondo bianco -> trasparente (>200); fondo nero -> trasparente (<60) e il resto nero
  function togliFondo(src, fatto) {
    var im = new Image();
    im.onload = function () {
      var w = im.naturalWidth, h = im.naturalHeight, k = Math.min(1, 900 / Math.max(w, h)); w = Math.max(1, Math.round(w * k)); h = Math.max(1, Math.round(h * k));
      var cv = document.createElement('canvas'); cv.width = w; cv.height = h; var g = cv.getContext('2d'); g.drawImage(im, 0, 0, w, h);
      try {
        var px = g.getImageData(0, 0, w, h), a = px.data, nero = (a[0] + a[1] + a[2]) / 3 <= 127;
        for (var i = 0; i < a.length; i += 4) { var l = (a[i] + a[i + 1] + a[i + 2]) / 3; if (nero) { if (l < 60) a[i + 3] = 0; else { a[i] = a[i + 1] = a[i + 2] = 0; } } else if (l > 200) a[i + 3] = 0; }
        g.putImageData(px, 0, 0); fatto(cv.toDataURL('image/png'), nero ? 'nero' : 'bianco');
      } catch (e) { fatto(src, '?'); }
    };
    im.onerror = function () { API.toast('Immagine non leggibile'); };
    im.src = src;
  }
  function anteprimaLogo(src) {
    return '<div class="sc-logoprova"><div class="sc-lp-cart"><div class="sc-redbox" style="width:100%;height:100%"><div class="sc-slot"><img class="sc-lp" src="' + src + '" alt=""></div></div></div>' +
      '<div class="sc-lp-tk"><img class="sc-lp sc-oro" src="' + src + '" alt=""><span>€ 129,00</span></div><div class="sc-lp-dy"><img class="sc-lp sc-nero" src="' + src + '" alt=""></div></div>';
  }
  function elencoLoghi(ordine, gestisci) {
    var L = loghi().slice(); if (ordine === 'az') L.sort(function (a, b) { return a.nome < b.nome ? -1 : 1; });
    if (!L.length) return '<div class="vuoto">Nessun logo personale salvato.</div>';
    return '<div class="lista-righe">' + L.map(function (l) {
      var i = loghi().indexOf(l);
      return '<div class="riga-art sc-logoriga"><img src="' + l.src + '" alt="" class="sc-logomini"><span class="t"><input class="inp" value="' + esc(l.nome) + '" data-sc-nome="' + l.id + '" aria-label="Nome del logo" maxlength="40"></span>' +
        '<button class="btn sm" type="button" data-act="scLogoNome" data-id="' + l.id + '">Aggiorna Nome</button>' +
        (gestisci ? '<button class="btn sm" type="button" data-act="scLogoSu" data-i="' + i + '" aria-label="Sposta su"' + (i ? '' : ' disabled') + '>↑</button><button class="btn sm" type="button" data-act="scLogoGiu" data-i="' + i + '" aria-label="Sposta giù"' + (i < loghi().length - 1 ? '' : ' disabled') + '>↓</button>' : '') +
        '<button class="btn sm" type="button" data-act="scLogoVia" data-id="' + l.id + '">✕ Elimina</button></div>'; }).join('') + '</div>';
  }
  function paginaGeneraLoghi() {
    var d = API.ed({ src: '', nome: '', ordine: 'data', fondo: '' });
    var p = '<div class="pannello glass"><h2>Genera Loghi</h2>' +
      '<label class="sc-drop" data-sc-drop><input type="file" accept="image/*" data-sc-file="logo"><b>📂 Clicca o Trascina qui l\'immagine del Logo</b><span>(Funziona con sfondi Bianchi o Neri)</span></label>' +
      (d.src ? '<p class="piccolo muto">Fondo ' + esc(d.fondo) + ' tolto: il logo ora è trasparente.</p>' : '') +
      '<label class="campo"><span>Nome del Brand:</span><input type="text" data-f="nome" value="' + esc(d.nome) + '" placeholder="Es. RAY-BAN, PERSOL, MIO BRAND" style="text-transform:uppercase" maxlength="40"></label>' +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="scLogoSalva"' + (d.src ? '' : ' disabled') + '>💾 Salva nei loghi personali</button></div></div>';
    var ant = d.src ? anteprimaLogo(d.src) : '<div class="vuoto" style="width:100%">Scegli un\'immagine: qui vedi il logo sul cartello (bianco nel riquadro rosso), sul cartellino (oro) e sull\'etichetta DYMO (nero).</div>';
    var lst = '<div class="card glass" style="margin-top:22px"><h2>La tua Lista Personale · Ottica Macrì <a class="sc-ingr" href="#creator/loghi" title="Gestisci lista">⚙</a></h2><div class="chips" style="margin-bottom:12px"><button type="button" class="chipb' + (d.ordine === 'az' ? ' on' : '') + '" data-act="scLogoOrd" data-v="az">A-Z</button><button type="button" class="chipb' + (d.ordine !== 'az' ? ' on' : '') + '" data-act="scLogoOrd" data-v="data">Data creazione</button></div>' + elencoLoghi(d.ordine, false) + '</div>';
    return { html: API.testa('Genera Loghi', 'Loghi personali') + '<div class="strumento">' + p + API.tavolo('Anteprima su Cartello', ant) + '</div>' + lst, dati: true, cambia: function (f, v) { if (f === 'nome') d.nome = String(v).toUpperCase(); } };
  }
  function paginaGestisciLoghi() {
    var h = API.testa('Gestisci Lista', 'Loghi personali') + '<div class="card glass"><h2>Backup della lista</h2><p class="muto">Una copia dei loghi in un file: si rimette su un altro computer o tablet.</p><div class="riga-btn">' +
      '<button class="btn" type="button" data-act="scLogoEsporta"' + (loghi().length ? '' : ' disabled') + '>⬇ ESPORTA LOGHI</button><label class="btn" style="cursor:pointer">⬆ IMPORTA LOGHI<input type="file" accept="application/json,.json" data-sc-file="backup" hidden></label>' +
      '<button class="btn" type="button" data-act="scLogoCancTutti"' + (loghi().length ? '' : ' disabled') + '>⊘ CANCELLA LOGHI</button></div></div>' +
      '<div class="card glass" style="margin-top:18px"><h2>I Miei Loghi (' + loghi().length + ')</h2><p class="piccolo muto">L\'ordine qui è l\'ordine nel menu «Loghi Personali» dei cartelli.</p>' + elencoLoghi('data', true) +
      '<div class="riga-btn" style="margin-top:14px"><a class="btn pri" href="#creator/loghi-importa">＋ Genera un logo</a></div></div>';
    return { html: h };
  }

  /* =====================================================================
     UTILITÀ CASSA (assets/js/cassa.js) · finestre sopra la dashboard
     ===================================================================== */
  var VALUTE = [['USD', '$', 'Dollaro USA'], ['GBP', '£', 'Sterlina'], ['RUB', '₽', 'Rublo'], ['ILS', '₪', 'Shekel'], ['CNY', '¥', 'Yuan'], ['JPY', '¥', 'Yen']];
  var TASSI = { USD: 1.08, GBP: 0.85, RUB: 98.0, ILS: 4.0, CNY: 7.8, JPY: 160.5 }, tassiVeri = false, tassiChiesti = false;
  function chiediTassi(fatto) {
    if (tassiChiesti) { fatto(); return; } tassiChiesti = true;
    try {
      var ctl = window.AbortController ? new AbortController() : null; if (ctl) setTimeout(function () { ctl.abort(); }, 4000);
      fetch('https://open.er-api.com/v6/latest/EUR', ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.json(); }).then(function (j) {
        if (j && j.rates) { VALUTE.forEach(function (v) { if (j.rates[v[0]]) TASSI[v[0]] = j.rates[v[0]]; }); tassiVeri = true; } fatto();
      }).catch(function () { fatto(); });
    } catch (e) { fatto(); }
  }
  function num(v) { var x = parseFloat(String(v == null ? '' : v).replace(/\s/g, '').replace(/\.(?=\d{3}(\D|$))/g, '').replace(',', '.')); return isNaN(x) ? NaN : x; }
  function e2(v) { return '€ ' + fmt2(v); }
  function campoE(id, lab, val, aff, dopo) { return '<label class="campo"><span>' + lab + '</span><span class="sc-affix">' + (aff ? '<i>' + aff + '</i>' : '') + '<input class="inp" id="' + id + '" inputmode="decimal" value="' + esc(val || '') + '" placeholder="0,00">' + (dopo ? '<i>' + dopo + '</i>' : '') + '</span></label>'; }
  C.widget = function (id) {
    if (id === 'bacheca') { API.vai('cassiere/bacheca'); return true; }
    var h;
    if (id === 'sconto') h = '<h2>Calcola Sconto</h2><div class="due sempre">' + campoE('w1', 'Prezzo Pieno', '', '€') + campoE('w2', 'Sconto', '', '', '%') + '</div><button class="btn pri wide" type="button" data-act="scW" data-w="sconto">Calcola Prezzo Finale</button><div class="risultato" id="wr"><b>€ 0,00</b></div>';
    else if (id === 'aliquota') h = '<h2>Calcola Aliquota Sconto</h2><div class="due sempre">' + campoE('w1', 'Prezzo Originale', '', '€') + campoE('w2', 'Prezzo Scontato', '', '€') + '</div><button class="btn pri wide" type="button" data-act="scW" data-w="aliquota">Trova % Sconto</button><div class="risultato" id="wr"><b>0%</b></div>';
    else if (id === 'valuta') h = '<h2>Cambio Valuta</h2><label class="campo"><span>Direzione</span><select class="inp" id="w0"><option value="TO_EUR">Da Valuta Estera ➔ ad EUR (€)</option><option value="FROM_EUR">Da EUR (€) ➔ a Valuta Estera</option></select></label>' +
      '<div class="due sempre"><label class="campo"><span>Importo</span><span class="sc-affix"><i id="wsym">$</i><input class="inp" id="w1" inputmode="decimal" placeholder="0,00"></span></label><label class="campo"><span>Valuta</span><select class="inp" id="w2">' + VALUTE.map(function (v) { return '<option value="' + v[0] + '">' + v[0] + ' (' + v[1] + ') ' + v[2] + '</option>'; }).join('') + '</select></label></div>' +
      '<button class="btn pri wide" type="button" data-act="scW" data-w="valuta">Calcola Cambio</button><div class="risultato" id="wr"><b>€ 0,00</b></div><p class="piccolo muto" id="wst">Caricamento tassi di cambio…</p>';
    else if (id === 'iva') h = '<h2>Calcola IVA</h2><div class="chips" id="wal">' + [4, 5, 10, 22].map(function (a) { return '<button type="button" class="chipb' + (a === 22 ? ' on' : '') + '" data-act="scIvaAl" data-v="' + a + '">' + a + '%</button>'; }).join('') + '</div>' +
      campoE('wi1', 'Imponibile <small>SENZA IVA</small>', '', '€') + campoE('wi2', 'Importo IVA <small>IVA</small>', '', '€') + campoE('wi3', 'Totale <small>CON IVA</small>', '', '€') +
      '<button class="btn wide" type="button" data-act="scIvaZero">Azzera IVA</button><p class="piccolo muto">Solo un calcolo: l\'aliquota giusta per ogni articolo la conferma il commercialista.</p>';
    else if (id === 'qr') h = '<h2>Generatore QR Code</h2><label class="campo"><span>Inserisci Link o Testo</span><input class="inp" id="w1" value="https://' + esc((S().negozio || {}).facebook || 'facebook.com/OtticaMacri') + '"></label>' +
      '<label class="campo"><span>Dimensione</span><select class="inp" id="w2"><option value="100">Piccolo (100px)</option><option value="160">Medio (160px)</option><option value="240">Grande (240px)</option></select></label><div class="qr-box" id="wr"></div>' +
      '<div class="riga-btn" style="margin-top:12px"><button class="btn" type="button" data-act="scQrScarica">⬇ Scarica QR</button><button class="btn pri" type="button" data-act="scQrStampa">🖨 Stampa QR</button></div>';
    else return false;
    API.finestra(h);
    var dentro = $('#velo');
    if (id === 'valuta') {
      var sel0 = $('#w0'), sym = $('#wsym');
      var vivo = function () { var dir = sel0.value, v = VALUTE.filter(function (x) { return x[0] === $('#w2').value; })[0]; sym.textContent = dir === 'TO_EUR' ? v[1] : '€'; calcW('valuta', true); };
      $$('select,input', dentro).forEach(function (e) { e.addEventListener('input', vivo); });
      chiediTassi(function () { var s = $('#wst'); if (s) s.textContent = tassiVeri ? 'Tassi di cambio aggiornati.' : 'Tassi di riserva in uso: aggiornamento non disponibile.'; vivo(); });
    }
    if (id === 'iva') { ivaSorgente = 'wi3'; $$('#wi1,#wi2,#wi3').forEach(function (e) { e.addEventListener('input', function () { ivaSorgente = e.id; ivaCalc(); }); }); }
    if (id === 'qr') { var f = function () { qrDisegna(); }; $$('#w1,#w2').forEach(function (e) { e.addEventListener('input', f); }); f(); }
    return true;
  };
  var ivaAl = 22, ivaSorgente = 'wi3';
  function ivaCalc() {
    var r = ivaAl / 100, v = num(($('#' + ivaSorgente) || {}).value), ids = ['wi1', 'wi2', 'wi3'], net;
    if (isNaN(v) || v < 0) { ids.forEach(function (k) { if (k !== ivaSorgente) $('#' + k).value = ''; }); return; }
    net = ivaSorgente === 'wi1' ? v : ivaSorgente === 'wi2' ? v / r : v / (1 + r);
    var val = { wi1: net, wi2: net * r, wi3: net * (1 + r) };
    ids.forEach(function (k) { if (k !== ivaSorgente) $('#' + k).value = fmt2(val[k]); });
  }
  function calcW(w, live) {
    var r = $('#wr'); if (!r) return;
    var a = num($('#w1').value), b = num($('#w2').value);
    if (w === 'sconto') { if (isNaN(a)) a = 0; if (isNaN(b)) b = 0; r.innerHTML = '<b>' + e2(a - a * b / 100) + '</b>'; }
    if (w === 'aliquota') { if (!(a > 0) || isNaN(b)) { r.innerHTML = '<b>0%</b>'; return; } r.innerHTML = '<b>-' + Math.round((a - b) / a * 100) + '%</b>'; }
    if (w === 'valuta') {
      var cod = $('#w2').value, t = TASSI[cod], v = VALUTE.filter(function (x) { return x[0] === cod; })[0]; if (isNaN(a)) a = 0;
      r.innerHTML = $('#w0').value === 'TO_EUR' ? '<b>' + e2(a / t) + '</b><span>1 € = ' + String(t).replace('.', ',') + ' ' + cod + '</span>' : '<b>' + v[1] + ' ' + fmt2(a * t) + ' (' + cod + ')</b><span>1 € = ' + String(t).replace('.', ',') + ' ' + cod + '</span>';
    }
  }
  /* QR (qrcode.js da cdnjs se c'è internet) */
  var qrCache = {};
  function qrDataURL(testo, px) {
    var k = testo + '|' + px; if (qrCache[k]) return qrCache[k];
    if (window.QRCode) {
      try {
        var div = document.createElement('div'); new window.QRCode(div, { text: testo || ' ', width: px, height: px, colorDark: '#000000', colorLight: '#ffffff', correctLevel: window.QRCode.CorrectLevel.M });
        var cv = div.querySelector('canvas'); if (cv) return (qrCache[k] = cv.toDataURL('image/png'));
      } catch (e) {}
    }
    // senza internet: un QR d'esempio (non leggibile), solo per vedere l'impaginazione
    var n = 25, h = 0, c = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ' + n + ' ' + n + '" shape-rendering="crispEdges"><rect width="' + n + '" height="' + n + '" fill="#fff"/>';
    for (var i = 0; i < testo.length; i++) h = (h * 31 + testo.charCodeAt(i)) >>> 0;
    function occhio(x, y) { c += '<rect x="' + x + '" y="' + y + '" width="7" height="7"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>'; }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue; h = (h * 1103515245 + 12345) >>> 0; if ((h >> 16) & 1) c += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; }
    occhio(0, 0); occhio(n - 7, 0); occhio(0, n - 7);
    return 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(c + '</svg>');
  }
  C.qr = qrDataURL;
  function qrDisegna() { var r = $('#wr'), px = +$('#w2').value; if (!r) return; r.innerHTML = '<img src="' + qrDataURL($('#w1').value || ' ', 480) + '" alt="QR" style="width:' + px + 'px;height:' + px + 'px;image-rendering:pixelated">' + (window.QRCode ? '' : '<div class="piccolo muto">QR d\'esempio (senza internet)</div>'); }

  /* =====================================================================
     LA TUA BACHECA (bacheca.js) · post-it
     ===================================================================== */
  var CARTE = [['Giallo', '#fff3a3'], ['Rosa', '#ffd1dc'], ['Azzurro', '#c7ecff'], ['Verdino', '#d4f5c4'], ['Arancio', '#ffd9a8'], ['Viola', '#e6d7ff'], ['Rosso', '#ffb3a8'], ['Ocra', '#ecd08c']];
  function note() {
    var s = S(); if (!Array.isArray(s.bacheca)) s.bacheca = [];
    s.bacheca.forEach(function (n, i) { if (!n.id) { n.id = 'n' + i + uid(); n.titolo = n.titolo != null ? n.titolo : n.t || ''; n.testo = n.testo || ''; n.col = n.col || CARTE[i % CARTE.length][1]; n.rot = n.rot != null ? n.rot : ((i * 37) % 7 - 3); } });
    return s.bacheca;
  }
  function nuovoColore(prima) { var pool = [0, 0, 0, 1, 2, 3, 4, 5, 6, 7], c; do { c = CARTE[pool[Math.floor(Math.random() * pool.length)]][1]; } while (c === prima); return c; }
  function paginaBacheca() {
    var N = note();
    var h = API.testa('La tua Bacheca', 'Utilità cassa') + '<div class="card glass"><div class="sc-cr-barra"><span class="muto">' + (N.length ? 'In bacheca: ' + N.length + (N.length === 1 ? ' nota' : ' note') : 'La bacheca è vuota') + ' · Post-it, Note Promemoria, Numeri Utili</span><span class="sp"></span><button class="btn pri" type="button" data-act="scNotaNuova">＋ Nuova nota</button></div>' +
      '<div class="sc-bacheca">' + N.map(function (n) {
        return '<div class="sc-postit" style="background:' + n.col + ';transform:rotate(' + n.rot + 'deg)"><i class="sc-nastro"></i><button type="button" class="sc-pi-x" data-act="scNotaVia" data-id="' + n.id + '" aria-label="Elimina nota">✕</button>' +
          '<input class="sc-pi-t" value="' + esc(n.titolo) + '" maxlength="60" placeholder="Titolo" data-sc-nota="' + n.id + '" data-k="titolo">' +
          '<textarea class="sc-pi-x2" maxlength="1500" placeholder="Scrivi qui…" data-sc-nota="' + n.id + '" data-k="testo">' + esc(n.testo) + '</textarea><span class="sc-pi-d">' + esc(n.d || '') + '</span></div>'; }).join('') + '</div></div>';
    return { html: h };
  }

  /* =====================================================================
     STAMPE PRONTE (A4 vere dai poster di app.js) e ALLESTIMENTI PRONTI
     ===================================================================== */
  function daPx(html) { return { html: '<div style="position:relative;width:210mm;height:297mm;overflow:hidden;background:#fff"><div style="position:absolute;left:0;top:0;width:595px;height:842px;transform:scale(' + (210 * MM / 595).toFixed(5) + ');transform-origin:0 0">' + html + '</div></div>', w: 210, h: 297 }; }
  C.daPx = daPx;

  /* =====================================================================
     AZIONI
     ===================================================================== */
  function corr() { return API.corrente(); }
  function titoloDi(c) { return (c.titoloStampa && c.titoloStampa()) || (c.foglio && c.foglio().titolo) || 'Stampa'; }
  var AZ = {
    stampa: function (el) {
      var c = corr(); if (!c) return;
      if (c.pagine) { stampa(c.pagine(), titoloDi(c), c.tipo || 'Cartelli'); return; }
      if (c.cvLavori && window.CARTELLI_V2) { var j = c.cvLavori(); C.stampaCv(window.CARTELLI_V2._prova.impagina(j.lavori, j.foglio), j.foglio, j.titolo); return; }
      if (c.foglio) { var f = c.foglio(); if (f.html) stampa([daPx(f.html)], f.titolo, 'Stampe pronte'); }
    },
    aggiungiLista: function () {
      var c = corr(); if (!c) return;
      if (c.pagine) { aggiungiLista(c.pagine(), titoloDi(c), c.tipo); return; }
      if (c.cvLavori && window.CARTELLI_V2) { var j = c.cvLavori(), F = j.foglio === 'A3' ? [297, 420] : [210, 297]; aggiungiLista(window.CARTELLI_V2._prova.impagina(j.lavori, j.foglio).map(function (h) { return { html: h, w: F[0], h: F[1] }; }), j.titolo, 'Cartelli'); return; }
      if (c.foglio) { var f = c.foglio(); if (f.html) aggiungiLista([daPx(f.html)], f.titolo, 'Stampe pronte'); }
    },
    stampaLista: function () { AZ.scListaStampa(); },
    scListaSel: function (el) { API.ed().sel = +el.dataset.i; API.render(); },
    scListaSu: function (el) { var l = lista(), i = +el.dataset.i; if (i > 0) { l.splice(i - 1, 0, l.splice(i, 1)[0]); API.ed().sel = i - 1; salvaPresto(); API.render(); } },
    scListaGiu: function (el) { var l = lista(), i = +el.dataset.i; if (i < l.length - 1) { l.splice(i + 1, 0, l.splice(i, 1)[0]); API.ed().sel = i + 1; salvaPresto(); API.render(); } },
    scListaStampa: function () { var l = lista(); if (!l.length) return; stampa(l.map(function (x) { return x.pag; }), 'Lista di stampa · ' + l.length + ' pagine', l.length === 1 ? l[0].tipo : 'Cartelli', { finite: true, nonRegistrare: false }); },
    scListaElimina: function () {
      var l = lista(), d = API.ed(); if (!l.length) return;
      API.finestra('<h2>Pagina da eliminare</h2><label class="campo"><span>Pagina</span><select class="inp" id="scEl">' + l.map(function (x, i) { return '<option value="' + i + '"' + (i === d.sel ? ' selected' : '') + '>Pagina ' + (i + 1) + ' · ' + esc(String(x.titolo).split(' · ')[0]) + '</option>'; }).join('') + '</select></label><div class="riga-btn"><button class="btn pri" type="button" data-act="scListaEliminaOk">Elimina</button><button class="btn" type="button" data-act="chiudi">Annulla</button></div>');
    },
    scListaEliminaOk: function () { var i = +$('#scEl').value; lista().splice(i, 1); API.chiudi(); salvaPresto(); API.render(); API.toast('Pagina ' + (i + 1) + ' eliminata.'); },
    scListaSvuota: function () { if (!confirm('Svuotare la lista di stampa? Tutte le pagine verranno eliminate.')) return; S().lista = []; salvaPresto(); API.render(); API.toast('Lista svuotata.'); },
    togliLista: function (el) { lista().splice(+el.dataset.i, 1); salvaPresto(); API.render(); },
    /* cronologia */
    scCrFiltro: function (el) { API.ed().filtro = el.dataset.v; API.render(); },
    scCrMulti: function () { var d = API.ed(); d.multi = !d.multi; d.sel = {}; API.render(); },
    scCrTutte: function () { var d = API.ed(), vis = storico().filter(function (x) { return d.filtro === 'Tutte' || x.tipo === d.filtro; }), tutte = vis.every(function (x) { return d.sel[x.id]; }); d.sel = {}; if (!tutte) vis.forEach(function (x) { d.sel[x.id] = 1; }); API.render(); },
    scCrSel: function (el) { var d = API.ed(); d.sel[el.dataset.id] = d.sel[el.dataset.id] ? 0 : 1; API.render(); },
    scCrCopie: function (el) { var d = API.ed(); d.sel[el.dataset.id] = Math.max(1, Math.min(99, (d.sel[el.dataset.id] || 1) + +el.dataset.d)); API.render(); },
    scCrVia: function (el) { if (!confirm('Eliminare questa stampa dalla cronologia?')) return; var st = storico(), x = trovaSt(el.dataset.id); if (x) st.splice(st.indexOf(x), 1); delete API.ed().sel[el.dataset.id]; salvaPresto(); API.render(); },
    scCrSvuota: function () { if (!confirm('Svuotare la cronologia di stampa?')) return; S().storico = []; salvaPresto(); API.render(); },
    scCrApri: function (el) { var x = trovaSt(el.dataset.id); if (x) apriStampa(x); },
    scCrStampa: function (el) { var x = trovaSt(el.dataset.id); if (!x) return; API.chiudi(); stampa(x.pagine, x.titolo, x.tipo, { finite: true }); },
    scCrAggiungi: function (el) { var x = trovaSt(el.dataset.id); if (!x) return; var l = lista(); x.pagine.forEach(function (p) { l.push({ id: uid(), t: Date.now(), titolo: x.titolo, tipo: x.tipo, pag: p }); }); API.chiudi(); API.toast('Pagina aggiunta alla lista di stampa (' + l.length + ')'); salvaPresto(); },
    scCrElimina: function (el) { if (!confirm('Eliminare questa stampa dalla cronologia?')) return; var st = storico(), x = trovaSt(el.dataset.id); if (x) st.splice(st.indexOf(x), 1); API.chiudi(); salvaPresto(); API.render(); },
    scCrLista: function () { var d = API.ed(), l = lista(), n = 0; Object.keys(d.sel).forEach(function (k) { var x = trovaSt(k); if (!x || !d.sel[k]) return; x.pagine.forEach(function (p) { l.push({ id: uid(), t: Date.now(), titolo: x.titolo, tipo: x.tipo, pag: p }); n++; }); }); API.toast(n + ' pagine aggiunte alla lista di stampa'); salvaPresto(); },
    scCrRistampa: function () {
      var d = API.ed(), pag = [], ids = Object.keys(d.sel).filter(function (k) { return d.sel[k]; });
      ids.forEach(function (k) { var x = trovaSt(k); if (x) x.pagine.forEach(function (p) { pag.push({ html: p.html, w: p.w, h: p.h, copie: d.sel[k] }); }); });
      ids.forEach(function (k) { var x = trovaSt(k); if (x) { x.volte = (x.volte || 1) + 1; x.t = Date.now(); } });
      stampa(pag, 'Ristampa dalla cronologia', 'Cartelli', { finite: true, nonRegistrare: true });
    },
    /* loghi */
    scLogoSalva: function () {
      var d = API.ed(); if (!d.src) return; if (!String(d.nome).trim()) { alert('Inserisci un nome per il brand prima di salvare!'); return; }
      loghi().push({ id: 'custom_' + Date.now(), nome: String(d.nome).trim().toUpperCase(), src: d.src, data: Date.now() });
      d.src = ''; d.nome = ''; salvaPresto(); API.toast('Logo salvato nei loghi personali'); API.render();
    },
    scLogoOrd: function (el) { API.ed().ordine = el.dataset.v; API.render(); },
    scLogoNome: function (el) { var l = C.logo(el.dataset.id), i = $('[data-sc-nome="' + el.dataset.id + '"]'); if (l && i && i.value.trim()) { l.nome = i.value.trim().toUpperCase(); salvaPresto(); API.toast('Nome aggiornato'); API.render(); } },
    scLogoVia: function (el) { if (!confirm('Eliminare questo logo?')) return; var L = loghi(), l = C.logo(el.dataset.id); if (l) L.splice(L.indexOf(l), 1); salvaPresto(); API.render(); },
    scLogoSu: function (el) { var L = loghi(), i = +el.dataset.i; if (i > 0) { L.splice(i - 1, 0, L.splice(i, 1)[0]); salvaPresto(); API.render(); } },
    scLogoGiu: function (el) { var L = loghi(), i = +el.dataset.i; if (i < L.length - 1) { L.splice(i + 1, 0, L.splice(i, 1)[0]); salvaPresto(); API.render(); } },
    scLogoEsporta: function () {
      var j = JSON.stringify({ version: 1, negozio: 'ottica-macri', exportedAt: new Date().toISOString(), logos: loghi().map(function (l) { return { id: l.id, name: l.nome, data: l.src }; }) });
      try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([j], { type: 'application/json' })); a.download = 'storecraft-loghi-personali-ottica-macri.json'; document.body.appendChild(a); a.click(); a.remove(); API.toast('Backup scaricato'); } catch (e) { API.toast('Download non disponibile qui'); }
    },
    scLogoCancTutti: function () { API.finestra('<h2>Cancella loghi</h2><p>Tutti i loghi personali verranno cancellati. Vuoi prima scaricare il backup?</p><div class="riga-btn"><button class="btn" type="button" data-act="chiudi">Annulla</button><button class="btn" type="button" data-act="scLogoEsporta">⬇ Backup</button><button class="btn pri" type="button" data-act="scLogoCancOk">Cancella Loghi</button></div>'); },
    scLogoCancOk: function () { S().loghi = []; API.chiudi(); salvaPresto(); API.render(); API.toast('Loghi cancellati'); },
    scImpUnisci: function () { var L = loghi(), ids = L.map(function (l) { return l.id; }); (C._imp || []).forEach(function (l) { if (ids.indexOf(l.id) < 0) L.push(l); }); API.chiudi(); salvaPresto(); API.render(); API.toast('Loghi uniti'); },
    scImpSost: function () { S().loghi = (C._imp || []).slice(); API.chiudi(); salvaPresto(); API.render(); API.toast('Lista sostituita'); },
    /* cassa */
    widget: function (el) { if (!C.widget(el.dataset.w) && API.widgetVecchio) API.widgetVecchio(el.dataset.w); },
    scW: function (el) { calcW(el.dataset.w); },
    scIvaAl: function (el) { ivaAl = +el.dataset.v; $$('#wal .chipb').forEach(function (b) { b.classList.toggle('on', b === el); }); ivaCalc(); },
    scIvaZero: function () { $$('#wi1,#wi2,#wi3').forEach(function (e) { e.value = ''; }); },
    scQrScarica: function () { var src = qrDataURL($('#w1').value || ' ', +$('#w2').value * 2); try { var a = document.createElement('a'); a.href = src; a.download = 'qrcode.png'; document.body.appendChild(a); a.click(); a.remove(); } catch (e) {} },
    scQrStampa: function () {
      var t = $('#w1').value || ' ', px = +$('#w2').value, mm = (px / MM).toFixed(2);
      var html = '<div class="sc-qrpag" data-modello="qr"><img src="' + qrDataURL(t, 600) + '" style="width:' + mm + 'mm;height:' + mm + 'mm" alt=""><p>' + esc(t) + '</p><img class="sc-qrlogo" src="' + LOGO + '" alt=""></div>';
      API.chiudi(); stampa([{ html: html, w: 210, h: 297 }], 'Codice QR · ' + t, 'Stampe pronte');
    },
    /* bacheca */
    scNotaNuova: function () { var N = note(); N.unshift({ id: uid(), titolo: '', testo: '', col: nuovoColore(N[0] && N[0].col), rot: Math.round(Math.random() * 6 - 3), d: dataIt(new Date()), t: '' }); salvaPresto(); API.render(); setTimeout(function () { var e = $('.sc-pi-t'); if (e) e.focus(); }, 50); },
    scNotaVia: function (el) { var N = note(); N.splice(N.indexOf(N.filter(function (n) { return n.id === el.dataset.id; })[0]), 1); salvaPresto(); API.render(); }
  };

  /* input dei post-it, nomi dei loghi, file */
  document.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.dataset && el.dataset.scNota) { var n = note().filter(function (x) { return x.id === el.dataset.scNota; })[0]; if (n) { n[el.dataset.k] = el.value; n.t = n.titolo; salvaPresto(); } }
  });
  document.addEventListener('focusout', function (ev) {
    var el = ev.target;
    if (el.dataset && el.dataset.scNota) { var N = note(), n = N.filter(function (x) { return x.id === el.dataset.scNota; })[0]; if (n && !n.titolo.trim() && !n.testo.trim()) { setTimeout(function () { var box = el.closest('.sc-postit'); if (box && box.contains(document.activeElement)) return; N.splice(N.indexOf(n), 1); salvaPresto(); API.render(); }, 150); } }
  });
  function leggiFile(file, cb, testo) { var rd = new FileReader(); rd.onload = function () { cb(rd.result); }; if (testo) rd.readAsText(file); else rd.readAsDataURL(file); }
  function fileLogo(file) {
    if (!file || !/^image\//.test(file.type)) { API.toast('Scegli un\'immagine (PNG, JPG, SVG)'); return; }
    var d = API.S().ed[API.rotta().chiave]; if (!d) return;
    leggiFile(file, function (src) { togliFondo(src, function (png, fondo) { d.src = png; d.fondo = fondo; if (!d.nome) d.nome = file.name.replace(/\.[^.]+$/, '').toUpperCase(); API.render(); }); });
  }
  document.addEventListener('change', function (ev) {
    var el = ev.target; if (!el.dataset || !el.dataset.scFile) return;
    var file = el.files && el.files[0]; if (!file) return;
    if (el.dataset.scFile === 'logo') fileLogo(file);
    if (el.dataset.scFile === 'backup') leggiFile(file, function (t) {
      try {
        var j = JSON.parse(t); if (j.version !== 1 || !Array.isArray(j.logos)) throw 0;
        C._imp = j.logos.filter(function (l) { return l && /^data:image\//.test(l.data || ''); }).map(function (l) { return { id: l.id || 'custom_' + uid(), nome: String(l.name || l.nome || 'LOGO').toUpperCase(), src: l.data, data: Date.now() }; });
        API.finestra('<h2>Importa loghi</h2><p>Nel file ci sono <b>' + C._imp.length + '</b> loghi.' + (j.negozio && j.negozio !== 'ottica-macri' ? ' <b>Attenzione:</b> il backup viene da un altro negozio (' + esc(j.negozio) + ').' : '') + '</p><div class="riga-btn"><button class="btn" type="button" data-act="chiudi">Annulla</button><button class="btn" type="button" data-act="scImpUnisci">Unisci</button><button class="btn pri" type="button" data-act="scImpSost">Sostituisci Lista</button></div>');
      } catch (e) { API.toast('File di backup non valido'); }
    }, true);
    el.value = '';
  });
  document.addEventListener('dragover', function (ev) { if (ev.target.closest && ev.target.closest('[data-sc-drop]')) { ev.preventDefault(); ev.target.closest('[data-sc-drop]').classList.add('sopra'); } });
  document.addEventListener('dragleave', function (ev) { var z = ev.target.closest && ev.target.closest('[data-sc-drop]'); if (z) z.classList.remove('sopra'); });
  document.addEventListener('drop', function (ev) { var z = ev.target.closest && ev.target.closest('[data-sc-drop]'); if (!z) return; ev.preventDefault(); z.classList.remove('sopra'); fileLogo(ev.dataTransfer.files && ev.dataTransfer.files[0]); });
  // campi prezzo (campi-prezzo.js): all'uscita sempre 2 decimali
  document.addEventListener('focusout', function (ev) {
    var el = ev.target; if (!el.matches || !el.matches('input[data-prezzo]')) return;
    var v = norm(el.value); if (v === el.value) return; el.value = v; el.dispatchEvent(new Event('input', { bubbles: true }));
  });
  // sconto: solo cifre, al massimo 2 (data-percentuale)
  document.addEventListener('input', function (ev) { var el = ev.target; if (el.matches && el.matches('input[data-percentuale]')) { var v = el.value.replace(/\D/g, '').slice(0, 2); if (v !== el.value) el.value = v; } }, true);

  /* =====================================================================
     INSTALLAZIONE (chiamata da app.js)
     ===================================================================== */
  C.installa = function (api) {
    API = api;
    var P = api.PAG;
    P['creator/lista'] = paginaLista;
    P['creator/cronologia'] = paginaCronologia;
    P['creator/loghi-importa'] = paginaGeneraLoghi;
    P['creator/loghi'] = paginaGestisciLoghi;
    P['cassiere/bacheca'] = paginaBacheca;
    Object.keys(C.PAG).forEach(function (k) { P[k] = C.PAG[k]; });
    Object.keys(AZ).forEach(function (k) { api.ACT[k] = AZ[k]; });
    Object.keys(C.ACT || {}).forEach(function (k) { api.ACT[k] = C.ACT[k]; });
    if (C.dopoInstalla) C.dopoInstalla.forEach(function (f) { try { f(api); } catch (e) { if (window.console) console.warn('clone', e); } });
  };
  C.api = function () { return API; };
  C.ACT = {}; C.dopoInstalla = [];
})();
