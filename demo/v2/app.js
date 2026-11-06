/* =====================================================================
   OTTICA MACRÌ · DEMO APP V2 · versione fedele a STORE // CRAFT (5/11/2026)
   Scheletro preso dalla dashboard di STORE // CRAFT (assets/js/dashboard.js, assets/negozi/luxury-dashboard.js,
   assets/js/cassa.js): menu laterale a gruppi, intestazione data/ora · banner · selettore modalità, riga del negozio,
   sezioni con caroselli di schede, Utilità Cassa, MENU // IMPOSTAZIONI; pagine strumento = pannello + anteprima + pulsantiera.
   Novità per Ottica Macrì: sezione VETRINA DIGITALE nel CREATOR e le modalità GESTIONALE / AMMINISTRAZIONE / PROMOTER.
   Tutto finto ma cliccabile: nessun invio reale, nessuna stampa reale, niente dati fiscali né dati della vista.
   Funziona con doppio clic (file://): niente moduli, niente fetch.
   CLONE STORE // CRAFT (5/11/2026 sera): gli strumenti del CREATOR e del CASSIERE sono la copia fedele dell'originale
   in clone.js (nucleo: stampa vera, lista, cronologia, loghi, cassa), clone-cartelli.js e clone-cartellini.js.
   I dati restano tra una sessione e l'altra (localStorage 'om-v2-stato'); RICOMINCIA della barra demo li azzera.
   >>> PER L'AGENTE STILI GRAFICI (demo/v2/stili.js + stili.css) · dove agganciarsi <<<
   - I fogli del clone (clone.css) usano SOLO variabili --sc-* che leggono le vostre --sg-* (--sg-acc, --sg-oro, --sg-tx,
     --sg-bgs negli stili scuri, --sg-fn, --sg-fx, --sg-fl): lo stile arriva dalla classe "sg sg-<id>" su <body> (anteprima)
     e, in stampa/lista/cronologia, clone.js scrive STILI.classe() sul foglio stesso (CLONE_SC.fissaStile). Misure invariate.
   - Ogni foglio ha data-modello="<nome>" (cartello-semplice|outlet|outletmulti|multi|percentuale|paio|ultimi|paletto|
     indicazioni|multibrand|saldi|school|blackfriday|natale, cartellini-vetrina|promo|quadrati|prezzi, dymo-<modello>):
     per ritocchi per modello bastano selettori CSS tipo .sg-moderno [data-modello="cartello-semplice"] .sc-prezzo{...}.
   - STILI.applica() NON viene chiamata sui fogli (disegna esempi). Il selettore: clone-cartelli.js lo mette nel pannello
     di cartelli e promo con STILI.selettore(STILI.attuale()); nelle altre pagine lo inserisce stili.js (.pannello).
   - Dopo un cambio di stile basta il CSS; per ridisegnare la pagina c'è window.demo2.ridisegna().
   ===================================================================== */
(function () {
  'use strict';
  var Q = new URLSearchParams(location.search);
  var EMBED = Q.has('embed');
  // 6/11/2026 · pacchetto unico «STORE // CRAFT + Archivio Clienti»: PIANO BASE (predefinito) / MODULI EXTRA.
  // ?piano=extra (anche piano=a, piano=completo) = moduli extra; nessun parametro o ?piano=b / base = piano base.
  var PIANO_Q = String(Q.get('piano') || '').toLowerCase();
  var PB = !/^(extra|a|completo|moduli)$/.test(PIANO_Q); // PB = PIANO BASE
  if (EMBED) document.documentElement.classList.add('embed');
  if (PB) document.documentElement.classList.add('pianob');
  var D = window.DATI;
  var BF = window.BF || {};
  var LOOP = window.BF_LOOP || null;
  var LOOP_NOMI = window.BF_LOOP_NOMI || {};

  /* ---------- utilità ---------- */
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function clona(o) { return JSON.parse(JSON.stringify(o)); }
  function num(v) { var n = parseFloat(String(v == null ? '' : v).replace(/\./g, function (m, i, s) { return /,/.test(s) ? '' : m; }).replace(',', '.')); return isNaN(n) ? 0 : n; }
  function cifra(v, dec) { var p = Math.abs(v).toFixed(dec == null ? 2 : dec).split('.'); p[0] = p[0].replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return (v < 0 ? '-' : '') + p.join(','); }
  function eur(v) { return '€ ' + cifra(v); }
  function eur0(v) { return '€ ' + cifra(v, Math.round(v) === v ? 0 : 2); }
  function due(n) { return (n < 10 ? '0' : '') + n; }
  function dataIt(d) { return due(d.getDate()) + '/' + due(d.getMonth() + 1) + '/' + d.getFullYear(); }
  function giorno(off) { var d = new Date(); d.setDate(d.getDate() + off); return d; }
  function iniziali(n) { return n.split(' ').map(function (p) { return p[0]; }).join('').slice(0, 2).toUpperCase(); }
  var LOGO = '../media/logo/marchi6/06-ovale/06-ovale-colori.svg', LOGO_B = '../media/logo/marchi6/06-ovale/06-ovale-notte.svg', DRAGO = '../media/logo/marchi6/04-monocolo/04-monocolo-icona-colori.svg';
  var OCCHIALI = '<svg class="occhiali-dec" viewBox="0 0 24 24"><circle cx="6.5" cy="13.5" r="4"/><circle cx="17.5" cy="13.5" r="4"/><path d="M10.4 12.6c1-.9 2.2-.9 3.2 0M2.6 12.4 1.6 8.6M21.4 12.4l1-3.8"/></svg>';

  /* ---------- stato (solo in memoria: ogni apertura riparte pulita) ---------- */
  var S;
  function nuovoStato() {
    var pl = [];
    if (LOOP && LOOP.scure) LOOP.scure.forEach(function (src, i) { pl.push({ k: 'img', src: src, nome: 'Black Friday · ' + nomeLoop('scure', i), dur: 8 }); });
    pl.push({ k: 'html', stile: 'chiaro', kicker: 'Su appuntamento', titolo: 'Controllo della vista', testo: 'Chiami lo 06 78346705 o entri in negozio.', prezzo: 'Gratuito', nome: 'Controllo vista', dur: 8 });
    return {
      negozio: clona(D.NEGOZIO), art: clona(D.ARTICOLI), clienti: clona(D.CLIENTI), acquisti: clona(D.ACQUISTI), note: clona(D.NOTE),
      utenti: clona(D.UTENTI), post: clona(D.POST), newsletter: clona(D.NEWSLETTER), venditeMese: D.VENDITE_MESE.slice(),
      cronologia: clona(D.CRONOLOGIA), lista: [], storico: [], loghi: [], carrello: [], ed: {}, inv: null, sb: {}, noteNascoste: {},
      movimenti: [
        { d: dataIt(giorno(-1)), t: 'Carico', a: 'Unika Soluzione unica 360 ml', q: 12, chi: 'Aldo' },
        { d: dataIt(giorno(-1)), t: 'Vendita', a: 'Ray-Ban RB2140 Wayfarer 50', q: -1, chi: 'Aldo' },
        { d: dataIt(giorno(-2)), t: 'Vendita', a: 'Carrera 8862 54', q: -1, chi: 'Banco' },
        { d: dataIt(giorno(-3)), t: 'Carico', a: 'Persol PO0649 54', q: 2, chi: 'Aldo' }
      ],
      bacheca: [{ t: 'Ritirare occhiali sig.ra Rossi', d: dataIt(giorno(0)) }, { t: 'Ordinare Unika 100 ml (sotto scorta)', d: dataIt(giorno(-1)) }],
      vetrina: { inOnda: true, titolo: 'Loop Black Friday', playlist: pl, orient: 'h' },
      sistema: { testo: 'normale', utente: 0 },
      scanIdx: 0, account: { fb: true, ig: false }
    };
  }
  function nomeLoop(serie, i) {
    var n = (LOOP_NOMI[serie] || [])[i] || ('slide ' + (i + 1));
    return n.replace(/^\d+-/, '').replace(/-(scuro|chiaro)\.png$/, '').replace(/-/g, ' ');
  }
  /* ---------- salvataggio tra una sessione e l'altra (localStorage, sempre in try/catch) ---------- */
  var CHIAVE_STATO = 'om-v2-stato', VERS_STATO = 2, VISTA;
  function caricaStato() {
    try {
      var t = localStorage.getItem(CHIAVE_STATO); if (!t) return null;
      var o = JSON.parse(t); if (!o || o.v !== VERS_STATO || !o.s) return null;
      var b = nuovoStato(); for (var k in b) if (!(k in o.s)) o.s[k] = b[k];
      return o.s;
    } catch (e) { return null; }
  }
  function salvaStato() {
    if (!EMBED && VISTA && VISTA !== 'desktop') return; // in vista tablet/telefono lavora l'iframe
    var t; try { t = JSON.stringify({ v: VERS_STATO, s: S }); } catch (e) { return; }
    try { localStorage.setItem(CHIAVE_STATO, t); }
    catch (e) { // spazio finito: si tiene meno cronologia e si riprova
      try { if (S.storico && S.storico.length) { S.storico.length = Math.floor(S.storico.length / 2); localStorage.setItem(CHIAVE_STATO, JSON.stringify({ v: VERS_STATO, s: S })); } } catch (e2) {}
    }
  }
  function azzeraStato() { try { localStorage.removeItem(CHIAVE_STATO); } catch (e) {} }
  var tSalvaStato;
  function salvaPresto() { clearTimeout(tSalvaStato); tSalvaStato = setTimeout(salvaStato, 200); }
  S = caricaStato() || nuovoStato();

  /* ---------- modalità e Piano B ---------- */
  var MODI = [
    { id: 'creator', nome: 'Creator' }, { id: 'cassiere', nome: 'Cassiere' }, { id: 'gestionale', nome: 'Gestionale' },
    { id: 'amministrazione', nome: 'Amministrazione' }, { id: 'promoter', nome: 'Promoter' }
  ];
  // Piano base: CREATOR (con VETRINA DIGITALE) + AMMINISTRAZIONE completa (archivio clienti, privacy, negozio, utenti).
  // Le parti dei moduli extra (CASSIERE, GESTIONALE, PROMOTER) nel piano base NON si vedono proprio (niente lucchetti).
  function inB(modo, pagina) {
    if (!PB) return true;
    return modo === 'creator' || modo === 'cassiere' || modo === 'amministrazione';   // 6/11 Fabrice: CASSIERE (utilità di cassa) incluso nel piano base
  }
  function modoInB(modo) { return !PB || modo === 'creator' || modo === 'cassiere' || modo === 'amministrazione'; }
  function nomePiano() { return PB ? 'piano base' : 'moduli extra'; }
  function riservato(modo) { return S.sistema.utente === 1 && !S.utenti[1].aree[modo]; }

  function rotta() {
    var p = (location.hash || '#creator').slice(1).split('/');
    var modo = MODI.some(function (m) { return m.id === p[0]; }) ? p[0] : 'creator';
    // piano base: le modalità dei moduli extra e l'allestimento vetrine (tolto il 6/11) portano alla home del Creator
    if (!modoInB(modo) || (modo === 'creator' && p[1] === 'allestimento')) {
      modo = 'creator'; p = ['creator'];
      try { history.replaceState(null, '', location.pathname + location.search + '#creator'); } catch (e) {}
    }
    return { modo: modo, pagina: p[1] || '', v: decodeURIComponent(p[2] || ''), chiave: modo + '/' + (p[1] || '') + '/' + (p[2] || '') };
  }
  function vai(h) { if (location.hash === '#' + h) render(); else location.hash = h; }

  /* =====================================================================
     GRAFICHE (cartelli, cartellini, DYMO, slide, post, poster)
     ===================================================================== */
  function marchioOM(rosso) { return '<span class="marchio-om' + (rosso ? ' rosso' : '') + '"><b>OTTICA MACRÌ</b><i>ROMA</i></span>'; }
  function firmaCt(d) {
    if (d.logo) { var l = S.loghi[+d.logo - 1]; if (l) return '<img class="logo-pers" src="' + l.src + '" alt="">'; }
    if (!d.brand || d.brand === 'Ottica Macrì') return marchioOM(true);
    return '<span class="brand-ct">' + esc(d.brand) + '</span>';
  }
  var FASCE = { ultimi: 'ULTIMI PEZZI', saldi: 'SALDI', school: 'BACK TO SCHOOL', natale: 'BUONE FESTE' };
  function cartelloHTML(d) {
    var fascia = d.tipo === 'ultimi' ? FASCE.ultimi : (d.tema ? FASCE[d.tema] : '');
    var h = '<div class="ct ' + esc(d.tipo) + ' ' + esc(d.tema || '') + (fascia ? ' ultimi' : '') + '">';
    h += '<div class="alto"><span class="claim">' + esc(d.claimSx) + '</span>' + marchioOM() + '<span class="claim">' + esc(d.claimDx) + '</span></div>';
    if (fascia) h += '<div class="fascia">' + fascia + '</div>';
    var off = fascia ? 26 : 0;
    if (d.tipo === 'multi') {
      h += '<div class="multi" style="top:' + (122 + off) + 'px">' + (d.articoli || []).filter(function (a) { return a[0] || a[1]; }).map(function (a) {
        return '<div><span>' + esc(a[0]) + '</span><b>' + eur(num(a[1])) + '</b></div>'; }).join('') + '</div>';
    } else if (d.tipo === 'indicazioni') {
      var fr = d.freccia || '→';
      h += '<div class="freccia" style="top:' + (150 + off) + 'px">' + (fr === '←' ? '<span>←</span>' : '') + '<div>' + esc(d.reparto) + '</div>' + (fr !== '←' ? '<span>' + esc(fr) + '</span>' : '') + '</div>';
    } else if (d.tipo === 'paio') {
      h += '<div class="paio" style="top:' + (122 + off) + 'px"><small>' + esc(d.desc) + '</small><b>' + esc(d.valore) + '</b><em>' + esc(d.sotto) + '</em></div>';
    } else {
      h += '<div class="desc" style="top:' + (126 + off) + 'px">' + esc(d.desc) + '</div>';
      if (d.tipo === 'outlet') {
        var fin = num(d.pieno) * (1 - num(d.sconto) / 100);
        h += '<div class="barrato" style="top:' + (172 + off) + 'px"><s>' + eur(num(d.pieno)) + '</s><em>-' + cifra(num(d.sconto), 0) + '%</em></div>';
        h += '<div class="prezzo sotto" style="top:' + (214 + off) + 'px">' + eur(Math.round(fin * 100) / 100) + '</div>';
      } else if (d.tipo === 'percentuale') {
        h += '<div class="prezzo pc" style="top:' + (168 + off) + 'px">-' + cifra(num(d.sconto), 0) + '%</div>';
      } else {
        h += '<div class="prezzo" style="top:' + (172 + off) + 'px">' + eur(num(d.prezzo)) + '</div>';
      }
    }
    h += '<div class="firma-ct">' + firmaCt(d) + '</div>';
    if (d.tema === 'natale') h += '<div class="palla"></div>';
    return h + '</div>';
  }
  function a4Cartelli(d) {
    return '<div class="a4s">' + cartelloHTML(d) + (d.formato === '1' ? '' : cartelloHTML(d) + '<div class="taglio"></div>') + '</div>';
  }
  function cartellinoHTML(a, d) {
    var sc = num(d.sconto), fin = sc ? a.prezzo * (1 - sc / 100) : a.prezzo;
    return '<div class="cartellino">' + (d.evento ? '<span class="ev">' + esc(d.evento) + '</span>' : '') + (sc ? '<span class="sc">-' + cifra(sc, 0) + '%</span>' : '') +
      '<span class="bn">' + esc(a.marca) + '</span><span class="ds">' + esc(a.modello) + '</span>' + (sc ? '<span class="pp"><s>' + eur(a.prezzo) + '</s></span>' : '') +
      '<span class="pf">' + eur(Math.round(fin * 100) / 100) + '</span></div>';
  }
  function a4Cartellini(v, d, arts) {
    if (v === 'prezzi') {
      var fasce = String(d.fasce || '').split(/[;\s]+/).map(num).filter(Boolean);
      var celle = []; for (var i = 0; i < 24; i++) { var p = fasce[i % (fasce.length || 1)] || 0; celle.push('<div class="cartellino">' + (d.evento ? '<span class="pp">' + esc(d.evento) + '</span>' : '') + '<span class="pf">' + eur0(p) + '</span></div>'); }
      return '<div class="a4s prezzi">' + celle.join('') + '</div>';
    }
    var n = v === 'quadrati' ? 12 : 8, out = [];
    var dd = v === 'vetrina' ? { sconto: d.sconto } : d;
    for (var j = 0; j < n; j++) { var a = arts[j % (arts.length || 1)]; out.push(a ? cartellinoHTML(a, dd) : '<div class="cartellino"></div>'); }
    return '<div class="a4s ' + (v === 'quadrati' ? 'quadrati' : 'cartellini') + '">' + out.join('') + '</div>';
  }
  function barre(ean) {
    var s = String(ean || '8000000000000').replace(/\D/g, ''), h = '<i style="width:2px;margin-right:2px"></i><i style="width:1px;margin-right:2px"></i>';
    for (var i = 0; i < s.length; i++) { var c = +s[i]; h += '<i style="width:' + (1 + c % 3) + 'px;margin-right:' + (1 + (c >> 1) % 3) + 'px"></i><i style="width:' + (1 + (c + 1) % 2) + 'px;margin-right:' + (2 + c % 2) + 'px"></i>'; }
    return '<span class="bar">' + h + '<i style="width:1px;margin-right:2px"></i><i style="width:2px"></i></span>';
  }
  function dymoHTML(d) {
    var tpl = d.tpl || 'doppio', pieno = num(d.pieno), sc = num(d.sconto);
    var fin = d.finale !== undefined && d.finale !== '' && tpl !== 'doppio' && tpl !== 'paio' ? num(d.finale) : Math.round(pieno * (1 - sc / 100) * 100) / 100;
    var sx = (tpl === 'calibro' || tpl === 'doppio') && (d.cal || d.ponte);
    var h = '<div class="dy' + (sx ? '' : ' senza-sx') + '">';
    if (sx) h += '<div class="sx"><small>CALIBRO</small><div class="box"><span class="on">' + esc(d.cal) + '</span><span>' + esc(d.ponte || '–') + '</span></div><small>' + (d.asta ? 'ASTA ' + esc(d.asta) : '&nbsp;') + '</small></div>';
    h += '<div class="dx">';
    if (tpl === 'doppio') h += '<div class="riga1">' + eur(pieno) + '<b>-' + cifra(sc, 0) + '%</b></div>';
    else if (tpl === 'paio') h += '<div class="riga1"><span class="tag">2° PAIO</span><b>-' + cifra(sc, 0) + '%</b></div>';
    else if (tpl === 'ultimi') h += '<div class="riga1"><span class="tag">ULTIMI PEZZI</span></div>';
    else if (tpl === 'label') h += '<div class="riga1"><span class="marca-om">OTTICA MACRÌ · ROMA</span></div>';
    else h += '<div class="riga1" style="font-size:18px">' + ((window.MARCHI_DYMO || {})[d.marca] ? '<img class="dy-marchio" src="' + window.MARCHI_DYMO[d.marca] + '" alt="' + esc(d.marca) + '">' : esc(d.marca || '')) + '</div>';
    h += '<div class="finale">' + eur(tpl === 'paio' ? pieno : fin) + '</div>';
    h += '<div class="nome">' + esc(d.nome) + '</div>';
    h += '<div style="display:grid;justify-items:end;gap:2px">' + barre(d.ean) + '<span class="ean">' + esc(d.ean) + '</span></div>';
    return h + '</div></div>';
  }
  function dymoDaArt(a, tpl, sc) { return { tpl: tpl, nome: a.marca + ' ' + a.modello, marca: a.marca, pieno: a.prezzo, sconto: sc || 0, finale: a.prezzo, cal: a.cal, ponte: a.ponte, asta: a.cal ? 140 : '', ean: a.cod }; }

  function imgSrc(src) { return BF[src] || src; }
  function slideHTML(s, vert) {
    var cl = 'sl-om' + (vert ? ' v' : '');
    if (s.k === 'img') return '<div class="' + cl + '" style="background:#000"><img class="fondo" src="' + imgSrc(s.src) + '" alt="" style="object-fit:contain"></div>';
    var chiaro = s.stile === 'chiaro';
    return '<div class="' + cl + ' ' + esc(s.stile) + '">' + OCCHIALI + '<div class="contenuto">' + (s.kicker ? '<div class="k">' + esc(s.kicker) + '</div>' : '') +
      '<h2' + (String(s.titolo || '').length > 18 ? ' class="lungo"' : '') + '>' + esc(s.titolo) + '</h2>' + (s.testo ? '<p>' + esc(s.testo) + '</p>' : '') + (s.prezzo ? '<div class="prz">' + esc(s.prezzo) + '</div>' : '') +
      '</div><img class="logo-sl" src="' + (chiaro ? LOGO : LOGO_B) + '" alt=""></div>';
  }
  function slideScalata(s, vert) { return '<div class="scala" data-w="' + (vert ? 540 : 960) + '">' + slideHTML(s, vert) + '</div>'; }
  function postHTML(p) {
    if (p.k === 'img') return '<div class="po"><img src="' + imgSrc(p.src) + '" alt="" style="width:100%;height:100%;object-fit:cover"></div>';
    return '<div class="po">' + slideHTML(p, false).replace('class="sl-om ', 'class="sl-om ' + (p.centro ? 'centro ' : '')) + '</div>';
  }
  function posterHTML(id) {
    var N = S.negozio, h = '<div class="pp4">' + marchioOM();
    if (id === 'orari') h += '<h2>Orari di apertura</h2><table>' + N.orari.map(function (o) { return '<tr><td>' + esc(o[0]) + '</td><td>' + esc(o[1]) + '</td></tr>'; }).join('') + '</table><p style="margin-top:30px">' + esc(N.via) + ' · ' + esc(N.citta) + '<br>Tel. ' + esc(N.tel) + '</p>';
    else if (id === 'controllo') h += '<div class="ic">👁</div><h2>Controllo della vista</h2><p>Su appuntamento, senza impegno.</p><p>Chiami lo <b>' + esc(N.tel) + '</b><br>o chieda al banco.</p>';
    else if (id === 'listino') h += '<h2>Listino lenti</h2><table>' + S.art.filter(function (a) { return a.cat === 'lenti'; }).map(function (a) { return '<tr><td>' + esc(a.modello) + '</td><td>' + eur(a.prezzo) + '</td></tr>'; }).join('') + '</table><p style="margin-top:24px;font-size:18px">Prezzi a coppia di lenti, montaggio compreso.</p>';
    else if (id === 'garanzia') h += '<div class="ic">🛡</div><h2>Garanzia 2 anni</h2><p>Su tutti gli occhiali acquistati in negozio.</p><p>Conservi lo scontrino.</p>';
    else if (id === 'pagamenti') h += '<h2>Pagamenti</h2><div class="ic" style="font-size:80px">💳 💶 📱</div><p>Bancomat · Carte di credito · Contanti</p><p>Pagamento con il telefono</p>';
    else if (id === 'staff') h += '<div class="ic">🔒</div><h2>Staff only</h2><p>Riservato al personale</p>';
    else if (id === 'fumo') h += '<div class="ic">🚭</div><h2>Vietato fumare</h2><p>Grazie della collaborazione</p>';
    else if (id === 'cura') h += '<h2>Come pulire gli occhiali</h2><table><tr><td>1. Acqua tiepida e una goccia di sapone neutro</td><td>💧</td></tr><tr><td>2. Asciughi con il panno in microfibra</td><td>🧽</td></tr><tr><td>3. Mai la carta o i vestiti</td><td>🚫</td></tr><tr><td>4. Li riponga sempre nell\'astuccio</td><td>👓</td></tr></table>';
    return h + '<div class="piede4">' + esc(N.via) + ' · Roma · ' + esc(N.tel) + '</div></div>';
  }

  /* =====================================================================
     CONTENUTI DELLE DASHBOARD (come assets/negozi/<negozio>-dashboard.js)
     ===================================================================== */
  var CARTELLI = {
    semplice: { titolo: 'Semplice', tipo: 'semplice', claimSx: 'PROMO', claimDx: '2026', desc: 'Occhiali da vista completi', prezzo: 99, spec: ['Brand', 'I Miei Loghi', 'Claim', 'Descrizione', 'Prezzo'] },
    outlet: { titolo: 'Outlet', tipo: 'outlet', claimSx: 'SALDI', claimDx: 'ESTATE', desc: 'Montature da vista selezionate', pieno: 159, sconto: 20, spec: ['Brand', 'I Miei Loghi', 'Descrizione', 'Doppio Prezzo', 'Sconto'] },
    paio: { titolo: '2° Paio', tipo: 'paio', claimSx: '2° PAIO', claimDx: 'PROMO', desc: 'Sul secondo paio', valore: '-50%', sotto: 'OCCHIALI DA VISTA E DA SOLE', spec: ['Brand', 'Claim', 'Testo', 'Sconto'] },
    multi: { titolo: 'Multi Brand', tipo: 'multi', claimSx: 'NEW', claimDx: '2026', articoli: [['Ray-Ban Wayfarer', D.PREZZI_ESEMPIO.RB2140.pieno], ['Persol 649', D.PREZZI_ESEMPIO.PO0649.pieno], ['Carrera 1007/S', 129]], spec: ['Brand', 'I Miei Loghi', '2 o 3 Articoli', 'Prezzo'] },
    percentuale: { titolo: 'Percentuale', tipo: 'percentuale', claimSx: 'SALDI', claimDx: 'ESTATE', desc: 'Occhiali da sole selezionati', sconto: 30, spec: ['Brand', 'I Miei Loghi', 'Descrizione', 'Sconto %'] },
    ultimi: { titolo: 'Ultimi Pezzi', tipo: 'ultimi', claimSx: 'LAST', claimDx: 'CHANCE', desc: 'Ray-Ban RB3025 Aviator', prezzo: 119, brand: 'Ray-Ban', spec: ['Fascia Ultimi Pezzi', 'Brand', 'Claim', 'Prezzo'] },
    paletto: { titolo: 'Paletto 15x10', tipo: 'semplice', claimSx: 'SOLE', claimDx: '2026', desc: 'Lenti fotocromatiche', prezzo: 120, nomeTipo: 'PALETTO FERRO', spec: ['Formato 15x10', 'Brand', 'Descrizione', 'Prezzo'] },
    indicazioni: { titolo: 'Indicazioni', tipo: 'indicazioni', claimSx: 'REPARTO', claimDx: '', reparto: 'Lenti a contatto', freccia: '→', spec: ['Reparto', 'Frecce Direzionali', 'Formato Pagina'] },
    saldi: { titolo: 'Saldi Estate ✦', tipo: 'percentuale', tema: 'saldi', claimSx: 'SALDI', claimDx: 'ESTATE', desc: 'Occhiali da sole', sconto: 40, nomeTipo: 'SALDI', promo: true },
    school: { titolo: 'Back to School ✦', tipo: 'outlet', tema: 'school', claimSx: 'BACK TO', claimDx: 'SCHOOL', desc: 'Occhiali da vista bambino', pieno: 129, sconto: 25, nomeTipo: 'SCUOLA', promo: true },
    natale: { titolo: 'Natale ✦', tipo: 'semplice', tema: 'natale', claimSx: 'XMAS', claimDx: 'GIFT', desc: 'L\'idea regalo', prezzo: 99, nomeTipo: 'CHRISTMAS', promo: true }
  };
  var CARTELLINI = {
    vetrina: { titolo: 'Vetrina', spec: ['Dal Magazzino', 'Doppio Prezzo', 'Sconto'] },
    promo: { titolo: 'Promozionali', spec: ['Promozione', 'Evento', 'Doppio Prezzo', 'Sconto'] },
    quadrati: { titolo: 'Quadrati', spec: ['12 per foglio', 'Doppio Prezzo', 'Sconto'] },
    prezzi: { titolo: 'Prezzi Vetrina', spec: ['Fasce Prezzo', 'Promozione', '24 cartellini'] }
  };
  var DYMO = {
    doppio: { titolo: 'Doppio Prezzo', tpl: 'doppio' }, finale: { titolo: 'Prezzo Finale', tpl: 'finale' }, ultimi: { titolo: 'Ultimi Pezzi', tpl: 'ultimi' },
    label: { titolo: 'Ottica Macrì Label', tpl: 'label' }, paio: { titolo: 'Promo 2° Paio', tpl: 'paio' }, calibro: { titolo: 'Calibro | Ponte', tpl: 'calibro' }
  };
  var STAMPE = {
    orari: ['Orari Apertura', '🕒'], controllo: ['Controllo Vista', '👁'], listino: ['Listino Lenti', '📄'], garanzia: ['Garanzia 2 Anni', '🛡'],
    pagamenti: ['Pagamenti', '💳'], cura: ['Pulizia Occhiali', '🧽'], staff: ['Staff Only', '🔒'], fumo: ['Vietato Fumare', '🚭']
  };
  var SET = {
    'set-bf': ['Set Black Friday ✦', 'bf-cartello-1', '4 cartelli · 2 cartellini · loop vetrina'], 'set-saldi': ['Set Saldi ✦', null, '2 cartelli · 8 cartellini'],
    'set-natale': ['Set Natale ✦', null, '2 cartelli · 12 quadrati'], 'set-school': ['Set Back to School ✦', null, '2 cartelli · 8 cartellini']
  };
  var VETRINA = {
    'vetrina-slide': { titolo: 'Slide Promo', tipo: 'TABLET 13" · 16:10' },
    'vetrina-vert': { titolo: 'Slide Verticale', tipo: 'SCHERMO 21,5" · 9:16' },
    'vetrina-bf': { titolo: 'Black Friday ✦', tipo: 'LOOP PRONTO' },
    'vetrina-playlist': { titolo: 'Playlist Vetrina', tipo: 'PLAYLIST' },
    'vetrina-avviso': { titolo: 'Avvisi & Orari', tipo: 'TABLET 13" · 16:10' }
  };

  function thumbCt(d) { return '<div class="thumb"><div class="scala" data-w="595">' + cartelloHTML(d) + '</div></div>'; }
  function thumbImg(key, cls) { return '<div class="thumb ' + (cls || 'slide') + '">' + (BF[key] ? '<img class="img" src="' + BF[key] + '" alt="">' : '') + '</div>'; }
  function thumbSlide(s, vert) { return '<div class="thumb slide">' + (vert ? '<div style="position:absolute;inset:0;display:grid;place-items:center"><div style="position:relative;height:100%;aspect-ratio:9/16;overflow:hidden">' + slideScalata(s, true) + '</div></div>' : slideScalata(s)) + '</div>'; }
  function thumbDymo(d) { return '<div class="thumb dymo"><div class="scala" data-w="456">' + dymoHTML(d) + '</div></div>'; }
  function thumbPoster(id) { return '<div class="thumb"><div class="scala" data-w="595">' + posterHTML(id) + '</div></div>'; }
  function thumbWidget(big, small, ic) { return '<div class="thumb widget"><div style="text-align:center"><div style="font-size:34px">' + ic + '</div><div style="font:400 40px/1.1 var(--h-mono);color:var(--h-blu)">' + big + '</div><div style="font:600 13px var(--h-title);letter-spacing:2px;text-transform:uppercase;color:var(--h-mut)">' + small + '</div></div></div>'; }
  function thumbVetrinaHTML(id) {
    if (id === 'vetrina-slide') return thumbSlide({ k: 'html', stile: 'rosso', kicker: 'Promo', titolo: 'Occhiali da sole', testo: 'Fino a fine mese', prezzo: '-30%' });
    if (id === 'vetrina-vert') return thumbSlide({ k: 'html', stile: 'blu', kicker: 'Novità', titolo: 'Nuovi Persol', prezzo: 'da € 215' }, true);
    if (id === 'vetrina-bf') return thumbImg('bf-slide-1');
    if (id === 'vetrina-playlist') return '<div class="thumb slide" style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:3px;padding:3px">' + ['bf-slide-2', 'bf-slide-3', 'bf-slide-4'].map(function (k) { return BF[k] ? '<img src="' + BF[k] + '" style="width:100%;height:100%;object-fit:cover">' : '<span></span>'; }).join('') + '</div>';
    return thumbSlide({ k: 'html', stile: 'chiaro', kicker: 'Avviso', titolo: 'Orari di apertura', testo: 'Mar–Sab 9:30–13 · 16–19:30' });
  }

  function giacTot() { return S.art.reduce(function (s, a) { return s + a.giac; }, 0); }
  function sottoScorta() { return S.art.filter(function (a) { return a.giac <= a.min && a.cat !== 'lenti'; }); }

  // sezioni di ogni modalità: { id, titolo, coda, tipo, nuovo, schede: [{ t, h (indirizzo), tipo, thumb, spec, dorata, badge }] }
  function sezioni(modo) {
    var s = [];
    if (modo === 'creator') {
      s.push({ id: 'sec-vetrina', titolo: 'Vetrina Digitale', coda: ' // tablet e schermo in vetrina', nuovo: true, vetrina: true,
        schede: Object.keys(VETRINA).map(function (id) { return { t: VETRINA[id].titolo, h: 'creator/' + id, tipo: VETRINA[id].tipo, thumb: thumbVetrinaHTML(id), dorata: id === 'vetrina-bf', badge: id === 'vetrina-bf' ? 'ALTO IMPATTO' : '' }; }) });
      s.push({ id: 'sec-cartelli', titolo: 'Crea Cartelli', righe: 2, schede: ['semplice', 'outlet', 'paio', 'multi', 'percentuale', 'ultimi', 'paletto', 'indicazioni'].map(function (k) {
        var c = CARTELLI[k]; return { t: c.titolo, h: 'creator/cartello/' + k, tipo: c.nomeTipo || 'CARTELLO', thumb: thumbCt(c), spec: c.spec }; }) });
      s.push({ id: 'sec-promo', titolo: 'Promo Stagionali', stella: true, schede: [
        { t: 'Black Friday ✦', h: 'creator/promo-bf', tipo: 'BLACK FRIDAY', thumb: thumbImg('bf-cartello-1', 'a4x'), dorata: true, badge: 'ALTO IMPATTO' }
      ].concat(['saldi', 'school', 'natale'].map(function (k) { var c = CARTELLI[k]; return { t: c.titolo, h: 'creator/cartello/' + k, tipo: c.nomeTipo, thumb: thumbCt(c), dorata: true, badge: 'MENU SPECIALE' }; })) });
      s.push({ id: 'sec-cartellini', titolo: 'Crea Cartellini', schede: Object.keys(CARTELLINI).map(function (k) {
        return { t: CARTELLINI[k].titolo, h: 'creator/cartellini/' + k, tipo: 'CARTELLINI', thumb: '<div class="thumb"><div class="scala" data-w="595" style="top:-60px">' + a4Cartellini(k, { sconto: k === 'vetrina' ? 0 : 20, evento: k === 'promo' ? 'BLACK FRIDAY' : '', fasce: '49 59 79 99 129 149' }, S.art.filter(function (a) { return a.cat === 'sole' || a.cat === 'vista'; })) + '</div></div>', spec: CARTELLINI[k].spec }; }) });
      s.push({ id: 'sec-dymo', titolo: 'Etichette Dymo', schede: Object.keys(DYMO).map(function (k) {
        return { t: DYMO[k].titolo, h: 'creator/dymo/' + k, tipo: '57 x 32 MM', thumb: thumbDymo(dymoDaArt(S.art[k === 'calibro' ? 9 : 0], DYMO[k].tpl, k === 'paio' ? 50 : 20)) }; }) });
      s.push({ id: 'sec-stampe', titolo: 'Stampe Pronte', coda: ' // Listini & Punto Vendita', schede: Object.keys(STAMPE).map(function (k) {
        return { t: STAMPE[k][0], h: 'creator/stampa/' + k, tipo: 'PDF', thumb: thumbPoster(k) }; }) });
      s.push({ id: 'sec-set', titolo: 'Allestimenti Pronti', coda: " // Operazioni Fast 'N' Beautiful", stella: true, schede: Object.keys(SET).map(function (k) {
        var t = SET[k]; return { t: t[0], h: 'creator/set/' + k, tipo: 'SET', dorata: true, thumb: t[1] ? thumbImg(t[1], 'a4x') : thumbCt(CARTELLI[k.slice(4)]), spec: [t[2]] }; }) });
    }
    if (modo === 'gestionale') {
      var ss = sottoScorta();
      s.push({ id: 'sec-mov', titolo: 'Movimenti', coda: ' // carico e vendita', cols: 3, schede: [
        { t: 'Carico Merce', h: 'gestionale/carico', tipo: 'LETTORE CODICI', tipoB: true, thumb: thumbWidget('+' + ((S.movimenti.filter(function (m) { return m.q > 0; })[0] || { q: 0 }).q), 'ultimo carico', '📦') },
        { t: 'Vendita / Scarico', h: 'gestionale/vendita', tipo: 'BANCO', tipoB: true, thumb: thumbWidget(S.carrello.length ? S.carrello.length + ' nel carrello' : '−1 pezzo', 'scarico magazzino', '🛍') },
        { t: 'Ultimi Movimenti', h: 'gestionale/movimenti', tipo: 'REGISTRO', tipoB: true, thumb: thumbWidget(S.movimenti.length, 'movimenti recenti', '🧾') }
      ] });
      s.push({ id: 'sec-mag', titolo: 'Magazzino', cols: 3, schede: [
        { t: 'Magazzino', h: 'gestionale/magazzino', tipo: 'ARCHIVIO', tipoB: true, thumb: thumbWidget(giacTot(), 'pezzi in negozio', '🗄') },
        { t: 'Sotto Scorta', h: 'gestionale/magazzino/scorta', tipo: 'DA RIORDINARE', thumb: thumbWidget(ss.length, 'articoli da riordinare', '⚠️') },
        { t: 'Inventario', h: 'gestionale/inventario', tipo: 'CONTA', tipoB: true, thumb: thumbWidget(S.inv ? 'in corso' : 'pronto', 'conta col lettore', '📋') }
      ] });
      s.push({ id: 'sec-stat', titolo: 'Statistiche', cols: 3, schede: [
        { t: 'Statistiche', h: 'gestionale/statistiche', tipo: 'NUMERI', tipoB: true, thumb: thumbWidget(eur0(S.venditeMese[11]), 'questo mese (registrato)', '📈') },
        { t: 'I Più Venduti', h: 'gestionale/statistiche/top', tipo: 'CLASSIFICA', tipoB: true, thumb: thumbWidget('Top 5', 'ultimi 12 mesi', '🏆') },
        { t: 'Articoli Fermi', h: 'gestionale/statistiche/fermi', tipo: 'DA SPINGERE', tipoB: true, thumb: thumbWidget(S.art.filter(function (a) { return a.v12 < 6 && a.giac > 0; }).length, 'poco venduti', '💤') }
      ] });
      s.push({ id: 'sec-eti', titolo: 'Etichette', coda: ' // DYMO LabelWriter 450', cols: 3, schede: [
        { t: 'Etichette dal Magazzino', h: 'gestionale/etichette', tipo: '57 x 32 MM', thumb: thumbDymo(dymoDaArt(S.art[0], 'doppio', 20)) },
        { t: 'Etichette Calibro', h: 'gestionale/etichette/calibro', tipo: '57 x 32 MM', thumb: thumbDymo(dymoDaArt(S.art[12], 'calibro')) },
        { t: 'Etichette Prezzo', h: 'gestionale/etichette/finale', tipo: '57 x 32 MM', thumb: thumbDymo(dymoDaArt(S.art[19], 'finale')) }
      ] });
    }
    if (modo === 'amministrazione') {
      var conMkt = S.clienti.filter(function (c) { return c.mkt; }).length;
      s.push({ id: 'sec-clienti', titolo: 'Clienti', cols: 3, schede: [
        { t: 'Archivio Clienti', h: 'amministrazione/clienti', tipo: 'SCHEDE', tipoB: true, thumb: thumbWidget(S.clienti.length, 'clienti in archivio', '👥'), inB: true },
        { t: 'Nuovo Cliente', h: 'amministrazione/clienti/nuovo', tipo: 'SCHEDA', tipoB: true, thumb: thumbWidget('＋', 'nome e telefono bastano', '🙋'), inB: true },
        { t: 'Privacy & Consensi', h: 'amministrazione/privacy', tipo: 'GDPR', tipoB: true, thumb: thumbWidget(conMkt + '/' + S.clienti.length, 'consenso alle novità', '🔐') }
      ] });
      s.push({ id: 'sec-negozio', titolo: 'Negozio', cols: 3, schede: [
        { t: 'Dati del Negozio', h: 'amministrazione/negozio', tipo: 'ANAGRAFICA', tipoB: true, thumb: '<div class="thumb widget"><img src="' + LOGO + '" alt="" style="width:80%"></div>' },
        { t: 'Utenti', h: 'amministrazione/utenti', tipo: 'PERMESSI', tipoB: true, thumb: thumbWidget(S.utenti.length, 'persone abilitate', '🔑') },
        { t: 'Orari', h: 'amministrazione/negozio/orari', tipo: 'ANAGRAFICA', tipoB: true, thumb: thumbPoster('orari') }
      ] });
    }
    if (modo === 'promoter') {
      s.push({ id: 'sec-social', titolo: 'Social', coda: ' // Instagram & Facebook', cols: 3, schede: [
        { t: 'Post da Modello', h: 'promoter/post', tipo: 'GENERATORE A', thumb: '<div class="thumb quadro" style="aspect-ratio:595/421"><div style="position:absolute;inset:0;display:grid;place-items:center"><div style="position:relative;height:100%;aspect-ratio:1;overflow:hidden"><div class="scala" data-w="540">' + postHTML({ k: 'html', stile: 'rosso', kicker: 'Promo', titolo: 'Occhiali da sole', prezzo: '-30%' }) + '</div></div></div></div>' },
        { t: 'Post da Zero', h: 'promoter/post-zero', tipo: 'GENERATORE B', thumb: thumbWidget('✨', 'scrivi, l\'app disegna', '✍️') },
        { t: 'Calendario', h: 'promoter/calendario', tipo: 'PROGRAMMATI', tipoB: true, thumb: thumbWidget(S.post.filter(function (p) { return p.st === 'prog'; }).length, 'post in arrivo', '🗓') }
      ] });
      s.push({ id: 'sec-news', titolo: 'Newsletter', cols: 3, schede: [
        { t: 'Nuova Newsletter', h: 'promoter/newsletter', tipo: 'E-MAIL', thumb: thumbWidget(S.clienti.filter(function (c) { return c.mkt && c.email; }).length, 'clienti iscritti', '✉️') },
        { t: 'Storico Invii', h: 'promoter/storico', tipo: 'APERTURE', tipoB: true, thumb: thumbWidget(S.newsletter.length, 'newsletter inviate', '📬') },
        { t: 'Account Collegati', h: 'promoter/account', tipo: 'META', tipoB: true, thumb: thumbWidget((S.account.fb ? 1 : 0) + (S.account.ig ? 1 : 0) + '/2', 'Facebook · Instagram', '🔗') }
      ] });
    }
    if (window.CARTELLI_V2) s = window.CARTELLI_V2.sezioni(modo, s); // agganci cartelli.js
    return window.CLONE_SC ? window.CLONE_SC.sezioni(modo, s) : s; // clone fedele di STORE // CRAFT
  }

  /* ---------- menu laterale (gruppi come in STORE // CRAFT) ---------- */
  function gruppi(modo) {
    function v(t, h, extra) { var o = { t: t, h: h }; for (var k in extra) o[k] = extra[k]; return o; }
    if (modo === 'creator') return (window.CLONE_SC ? window.CLONE_SC.gruppi : function (g) { return g; })((window.CARTELLI_V2 ? window.CARTELLI_V2.gruppi : function (g) { return g; })([ // agganci cartelli.js
      { id: 'vetrina', t: 'Vetrina Digitale', nuovo: true, voci: Object.keys(VETRINA).map(function (id) { return v(VETRINA[id].titolo.replace(' ✦', ''), 'creator/' + id, { stella: id === 'vetrina-bf' }); }) },
      { id: 'cartelli', t: 'Crea Cartelli', voci: ['semplice', 'outlet', 'paio', 'multi', 'percentuale', 'ultimi', 'paletto', 'indicazioni'].map(function (k) { return v(CARTELLI[k].titolo, 'creator/cartello/' + k); }),
        sub: { t: 'Promo Stagionali', voci: [v('Black Friday', 'creator/promo-bf', { stella: true })].concat(['saldi', 'school', 'natale'].map(function (k) { return v(CARTELLI[k].titolo.replace(' ✦', ''), 'creator/cartello/' + k, { stella: true }); })) } },
      { id: 'cartellini', t: 'Cartellini', voci: Object.keys(CARTELLINI).map(function (k) { return v(CARTELLINI[k].titolo, 'creator/cartellini/' + k); }) },
      { id: 'etichette', t: 'Etichette', voci: [v('Etichette DYMO', 'creator/dymo/doppio')] },
      { id: 'loghi', t: 'Loghi Personali', voci: [v('Importa Loghi', 'creator/loghi-importa'), v('Gestisci Loghi', 'creator/loghi')] },
      { id: 'stampe', t: 'Stampe Pronte', voci: [v('Listini & Punto Vendita', 'creator', { scorri: 'sec-stampe' }), v("Fast 'N' Beautiful", 'creator', { scorri: 'sec-set', stella: true })] },
      { id: 'lista', t: 'Lista di Stampa e Cronologia', voci: [v('Lista di Stampa', 'creator/lista'), v('Cronologia di Stampa', 'creator/cronologia')] }
    ]));
    if (modo === 'cassiere') return [{ id: 'cassa', t: 'Utilità Cassa', voci: STRUMENTI.map(function (w) { return w.id === 'bacheca' ? v(w.t, 'cassiere/bacheca') : v(w.t, 'cassiere', { widget: w.id }); }) }];
    return sezioni(modo).map(function (sz) { return { id: sz.id, t: sz.titolo, voci: sz.schede.filter(function (sk) { return !PB || inBdaHash(sk.h); }).map(function (sk) { return v(sk.t.replace(' ✦', ''), sk.h); }) }; }).filter(function (g) { return g.voci.length; });
  }
  function sidebarHTML(r) {
    var G = gruppi(r.modo), qui = r.modo + (r.pagina ? '/' + r.pagina : '') + (r.v ? '/' + r.v : '');
    var h = '<div class="sb-head"><button class="marchio" type="button" data-act="home">STORE <i>//</i> CRAFT</button><button class="sb-chiudi" type="button" data-act="menu" aria-label="Chiudi menu">✕</button></div>';
    h += '<div class="sb-modo">// modalità ' + esc(r.modo) + ' · ' + nomePiano() + '</div><div class="sb-scorri">';
    G.forEach(function (g) {
      var dentro = g.voci.concat(g.sub ? g.sub.voci : []).some(function (x) { return !x.scorri && !x.widget && x.h === qui; });
      var aperto = S.sb[r.modo + g.id] !== undefined ? S.sb[r.modo + g.id] : dentro;
      h += '<div class="sb-gruppo' + (aperto ? ' aperto' : '') + '"><button class="sb-label" type="button" data-act="gruppo" data-g="' + esc(r.modo + g.id) + '" aria-expanded="' + aperto + '"><span>' + esc(g.t) + (g.nuovo ? '<span class="nuovo">NUOVO</span>' : '') + '</span><span class="fr">›</span></button><nav class="sb-voci">';
      function voce(x) {
        if (x.widget) return '<button type="button" data-act="widget" data-w="' + x.widget + '">' + esc(x.t) + '</button>';
        if (x.scorri) return '<button type="button" data-act="scorri" data-s="' + x.scorri + '">' + esc(x.t) + (x.stella ? ' <span class="stella">✦</span>' : '') + '</button>';
        return '<a href="#' + x.h + '"' + (x.h === qui ? ' class="on"' : '') + '>' + esc(x.t) + (x.stella ? ' <span class="stella">✦</span>' : '') + (x.lock ? ' <span class="stella">🔒</span>' : '') + '</a>';
      }
      h += g.voci.map(voce).join('');
      if (g.sub) {
        var subAperta = S.sb['sub' + g.id] || g.sub.voci.some(function (x) { return x.h === qui; });
        h += '<button type="button" class="sub" data-act="sub" data-g="' + g.id + '" aria-expanded="' + !!subAperta + '">' + esc(g.sub.t) + ' <span class="stella">✦</span> <span style="margin-left:auto">⌄</span></button><div class="subvoci"' + (subAperta ? '' : ' hidden') + '>' + g.sub.voci.map(voce).join('') + '</div>';
      }
      h += '</nav></div>';
    });
    h += '</div><div class="sb-fondo"><img src="' + DRAGO + '" alt=""><div class="firma">Crafted with StoreCraft</div>' +
      '<button class="menu-sistema-btn" type="button" data-act="sistema" aria-expanded="false">Menu // Impostazioni</button></div>';
    return h;
  }

  /* ---------- intestazione, riga del negozio, dashboard ---------- */
  var BANNER = ['Visual Merchandising Studio', "Via Poggi D'Oro 23 · Roma"];
  function testataHTML(r) {
    var h = '<header class="testata"><button class="burger" type="button" data-act="menu" aria-label="Apri menu">☰</button>' +
      '<div class="orologio" role="timer" aria-label="Data e ora"><span class="d" data-v2-data></span><span class="o" data-v2-ora></span></div>' +
      '<div class="banner" aria-hidden="true">' + BANNER.map(function (b, i) { return '<span class="' + (i ? 'sotto' : '') + '">' + esc(b) + '</span>'; }).join('') + '</div>' +
      '<div class="mode-switcher" role="group" aria-label="Modalità">';
    MODI.forEach(function (m) {
      if (!modoInB(m.id)) return; // piano base: le modalità dei moduli extra non compaiono
      h += '<button class="mode-btn' + (m.id === r.modo ? ' active' : '') + '" type="button" data-act="modo" data-m="' + m.id + '" aria-pressed="' + (m.id === r.modo) + '">' + m.nome + '</button>';
    });
    return h + '</div></header>';
  }
  var DESCR = {
    creator: 'Qui si prepara tutto quello che si <b>stampa</b> o va sullo <b>schermo in vetrina</b>: vetrina digitale, cartelli, cartellini, etichette DYMO. Tocca un riquadro, scrivi il testo, guarda l\'anteprima e stampa.',
    cassiere: 'Gli strumenti del <b>banco</b>, come in STORE // CRAFT: calcolo dello sconto, IVA, cambio valuta, codice QR e la bacheca delle note.',
    gestionale: 'Il <b>magazzino</b> del negozio: si carica la merce col lettore di codici a barre, si scarica quando si vende, si conta l\'inventario e si stampano le etichette con la DYMO LabelWriter 450.',
    amministrazione: 'I dati del negozio, l\'<b>archivio clienti</b> con acquisti, note e consensi privacy, e chi può usare l\'app.',
    promoter: 'Tu scegli la grafica e il testo, <b>l\'app pubblica per te</b> su Instagram e Facebook e manda la newsletter ai clienti che hanno dato il consenso.'
  };
  var FISCALE = {
    cassiere: 'Lo <b>scontrino fiscale</b> resta sul registratore telematico (RT) di sempre: questi sono solo strumenti di calcolo.',
    gestionale: 'Non è un registratore di cassa: <b>scontrino (RT), Tessera Sanitaria e fatture</b> restano alla cassa e al commercialista come oggi. Qui si tiene solo il conto della merce.',
    amministrazione: '' // 6/11: tolta la nota sui dati della vista (Fabrice)
  };
  function nota(id, html, cls) {
    if (S.noteNascoste[id]) return '';
    return '<div class="nota ' + (cls || '') + '">' + html + '<button class="x" type="button" data-act="nascondi" data-n="' + id + '">✕ nascondi</button></div>';
  }
  function heroHTML(r) {
    return '<section class="store-hero glass"><img class="logo" src="' + LOGO + '" alt="Ottica Macrì">' +
      '<div class="store-identity"><b>' + esc(S.negozio.via) + '</b><span>' + esc(S.negozio.cap) + ' Roma · Ottica · Tel. ' + esc(S.negozio.tel) + '</span></div>' +
      '<div class="modo-chip"><span class="k">modalità</span><span class="v">' + esc(r.modo) + '</span></div></section>';
  }
  function bandaB(cosa) {
    return '<div class="banda-b"><span class="ico">＋</span><div><b>' + esc(cosa) + ' · fa parte dei moduli extra</b><p>Il piano base comprende STORE // CRAFT (Creator), la Vetrina Digitale e l\'Amministrazione con l\'archivio clienti. Questa parte si aggiunge quando vuoi.</p></div></div>';
  }
  function schedaHTML(sk, i, sz) {
    var esclusa = PB && !inBdaHash(sk.h);
    var h = '<a class="scheda glass' + (sk.dorata ? ' dorata' : '') + (esclusa ? ' escluso' : '') + '" href="#' + sk.h + '"' + (esclusa ? ' data-act="fuoriB"' : '') + '>' +
      '<div class="sk-testa"><span class="sk-n">' + due(i + 1) + '</span><span class="sk-tipo' + (sk.tipoB ? ' tipo-b' : '') + '">' + esc(sk.tipo) + '</span></div>' + sk.thumb;
    if (sk.badge) h += '<span class="badge">' + esc(sk.badge) + '</span>';
    h += '<div class="sk-piede"><h3>' + esc(sk.t) + '</h3><span class="piu" aria-hidden="true">+</span></div>';
    if (esclusa) h += '<span class="fuori-b">NON INCLUSO NEL PIANO B</span>';
    return h + '</a>';
  }
  function inBdaHash(hh) { var p = hh.split('/'); return inB(p[0], p[1] || ''); }
  // sticker «PROVVISORIO» (6/11/2026, Fabrice): sulle sezioni Crea Cartelli e Cartellini e nelle loro pagine
  var PROVV_SEZ = { 'sec-cartelli': 1, 'sec-cartellini': 1 };
  var PROVV_PAG = { cartello: 1, promo: 1, 'promo-bf': 1, cartellini: 1, stanghetta: 1, supporto: 1 };
  function stickerProvv(cls) { return '<span class="sticker-provv' + (cls ? ' ' + cls : '') + '" title="Sezione provvisoria: grafiche e modelli ancora da confermare"><i aria-hidden="true"></i>Provvisorio</span>'; }
  function sezioneHTML(sz) {
    var cls = 'carousel' + (sz.righe === 2 ? ' two-rows' : '') + (sz.cols === 3 ? ' cols3' : '');
    var h = '<section class="section" id="' + sz.id + '"><h2 class="section-title">' + esc(sz.titolo) + (sz.coda ? '<span class="coda">' + esc(sz.coda) + '</span>' : '') + (sz.stella ? ' <span class="stella">✦</span>' : '') + (sz.nuovo ? ' <span class="nuovo">NUOVO</span>' : '') + (PROVV_SEZ[sz.id] ? stickerProvv() : '') + '</h2>';
    if (sz.vetrina) h += inOndaHTML();
    h += '<div class="carousel-wrapper"><button class="carousel-arrow prev" type="button" data-act="car" data-d="-1" aria-label="Scorri a sinistra">‹</button><div class="' + cls + '">' +
      sz.schede.filter(function (sk) { return !PB || inBdaHash(sk.h); }).map(function (sk, i) { return schedaHTML(sk, i, sz); }).join('') +
      '</div><button class="carousel-arrow next" type="button" data-act="car" data-d="1" aria-label="Scorri a destra">›</button></div></section>';
    return h;
  }
  function inOndaHTML() {
    var V = S.vetrina, prima = V.playlist[0];
    return '<div class="in-onda glass"><span class="led' + (V.inOnda ? '' : ' spento') + '"></span><div><b>' + (V.inOnda ? 'In onda in vetrina' : 'Vetrina spenta') + '</b><div class="piccolo muto">' + esc(V.titolo) + ' · ' + V.playlist.length + ' slide · schermo in vetrina</div></div>' +
      '<div class="mini" data-mini>' + (prima ? (prima.k === 'img' ? '<img src="' + imgSrc(prima.src) + '" alt="">' : slideScalata(prima)) : '') + '</div><span class="sp"></span>' +
      '<a class="btn sm" href="#creator/vetrina-playlist">Playlist</a><button class="btn sm ' + (V.inOnda ? '' : 'pri') + '" type="button" data-act="vetrinaOnOff">' + (V.inOnda ? '⏸ Spegni' : '▶ Accendi') + '</button></div>';
  }

  /* ---------- DOPPIA STRADA per mandare i loop sullo schermo in vetrina (6/11/2026) ----------
     1 = STORE // CRAFT (consigliata, «modo 3»): lo schermo apre la pagina Vetrina dell'app e si aggiorna da solo.
     2 = app dello schermo («modo 2»: Samsung/LG/Yodeck/Screenly): esporti MP4 o slide e le carichi lì.
     In fondo la riserva con la chiavetta USB. Tutto simulato. */
  function qrFinto(testo) {
    var n = 25, h = 0, c = '<svg viewBox="0 0 ' + n + ' ' + n + '" width="132" height="132" shape-rendering="crispEdges" aria-label="QR d\'esempio"><rect width="' + n + '" height="' + n + '" fill="#fff"/>';
    for (var i = 0; i < testo.length; i++) h = (h * 31 + testo.charCodeAt(i)) >>> 0;
    function occhio(x, y) { c += '<rect x="' + x + '" y="' + y + '" width="7" height="7" fill="#1b1612"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3" fill="#1b1612"/>'; }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue; h = (h * 1103515245 + 12345) >>> 0; if ((h >> 16) & 1) c += '<rect x="' + x + '" y="' + y + '" width="1" height="1" fill="#1b1612"/>'; }
    occhio(0, 0); occhio(n - 7, 0); occhio(0, n - 7);
    return c + '</svg>';
  }
  function stradeHTML() {
    var V = S.vetrina, st = V.strada === 'app' ? 'app' : 'sc', url = 'vetrina.otticamacri.it/schermo';
    var h = '<section class="strade card glass" aria-label="Come mandare il loop sullo schermo"><h2>Come arriva sullo schermo</h2><p class="muto">Scegli tu la strada. Puoi cambiarla quando vuoi.</p>' +
      '<div class="strade-scelta" role="radiogroup">' +
      '<button type="button" role="radio" aria-checked="' + (st === 'sc') + '" class="strada' + (st === 'sc' ? ' on' : '') + '" data-act="strada" data-val="sc"><span class="badge-cons">CONSIGLIATA</span><span class="ic">📡</span><b>Lancio da STORE // CRAFT</b><span>Lo schermo apre la pagina Vetrina. Premi «Manda in vetrina» e si aggiorna da solo.</span></button>' +
      '<button type="button" role="radio" aria-checked="' + (st === 'app') + '" class="strada' + (st === 'app' ? ' on' : '') + '" data-act="strada" data-val="app"><span class="ic">📺</span><b>Lancio con l\'app dello schermo</b><span>Samsung, LG, Yodeck, Screenly: prepari il video o le slide e le carichi lì.</span></button>' +
      '</div>';
    if (st === 'sc') {
      h += '<div class="strada-dett"><div class="stato-schermo"><div><span class="pallino ok"></span><b>Schermo collegato</b></div><div><span class="pallino' + (V.inOnda ? ' ok' : '') + '"></span>' + (V.inOnda ? 'In onda: ' + esc(V.titolo) : 'Vetrina spenta') + '</div><div class="muto">Ultimo aggiornamento: ' + esc(V.agg || 'oggi, 9:12') + '</div></div>' +
        '<div class="collega"><div class="qr-finto">' + qrFinto(url) + '</div><div><p class="blocco-t">Per collegare lo schermo</p><p>Sullo schermo apri questo indirizzo a tutto schermo, oppure inquadra il QR:</p><p class="url-vetrina">' + url + '</p><p class="piccolo muto">Se cade internet, lo schermo continua con l\'ultimo loop. (Indirizzo d\'esempio)</p></div></div>' +
        '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="mandaPlaylist">📡 Manda in vetrina</button></div></div>';
    } else {
      h += '<div class="strada-dett"><p class="blocco-t">1 · Prepara il pacchetto</p><div class="pulsantiera"><button class="btn pri" type="button" data-act="esportaMp4">🎬 Esporta il loop in video MP4</button><button class="btn" type="button" data-act="scaricaSlide">🖼 Scarica le slide (immagini)</button></div>' +
        '<p class="blocco-t" style="margin-top:14px">2 · Caricalo nell\'app dello schermo</p><ol class="passi-app"><li>Apri l\'app della marca (sul telefono o sul computer).</li><li>Carica il video MP4 o le slide nella sua playlist.</li><li>Scegli lo schermo della vetrina e premi «Pubblica».</li></ol>' +
        '<p class="piccolo muto">Di solito richiede un abbonamento dell\'app dello schermo.</p></div>';
    }
    h += '<div class="riserva-usb"><span class="ic">💾</span><div><b>Riserva: chiavetta USB</b><div class="piccolo muto">Esporti lo stesso video MP4, lo copi sulla chiavetta e la infili nello schermo.</div></div><button class="btn sm" type="button" data-act="esportaMp4" data-usb="1">Esporta MP4</button></div></section>';
    return h;
  }

  /* ---------- Utilità Cassa (assets/js/cassa.js) ---------- */
  var STRUMENTI = [
    { id: 'sconto', t: 'Calcola Sconto', ic: '％', d: 'Prezzo pieno e sconto: il prezzo finale e il risparmio.' },
    { id: 'aliquota', t: 'Calcola Aliquota Sconto', ic: '⇄', d: 'Dal prezzo pieno e dal finale, lo sconto in percentuale.' },
    { id: 'valuta', t: 'Cambio Valuta', ic: '💱', d: 'Euro, dollari, sterline, franchi: per il turista al banco.' },
    { id: 'iva', t: 'Calcola IVA', ic: '🧮', d: 'Imponibile, IVA e totale con l\'aliquota scelta.' },
    { id: 'qr', t: 'Generatore QR Code', ic: '▦', d: 'Un QR da stampare: pagina Facebook, telefono, recensioni.' },
    { id: 'bacheca', t: 'La tua Bacheca', ic: '📌', d: 'Post-it, Note Promemoria, Numeri Utili e Comunicazioni Ufficiali.' }
  ];
  function toolsHTML(r) {
    var escl = false;   // 6/11 Fabrice: le Utilità Cassa sono nel piano base
    var h = '<section class="section" id="sec-tools"><h2 class="section-title">Utilità Cassa</h2>' + (escl && r.modo === 'cassiere' ? '' : '') + '<div class="tools-grid">';
    STRUMENTI.forEach(function (w) {
      h += '<button class="widget glass' + (escl ? ' escluso' : '') + '" type="button" data-act="' + (escl ? 'fuoriB' : 'widget') + '" data-w="' + w.id + '"><span class="w-ic">' + w.ic + '</span><h3>' + esc(w.t) + '</h3><p>' + esc(w.id === 'bacheca' && S.bacheca[0] ? '«' + S.bacheca[0].t + '»' : w.d) + '</p><span class="w-vai">Apri</span>' + (escl ? '<span class="fuori-b">MODULI EXTRA</span>' : '') + '</button>';
    });
    return h + '</div></section>';
  }

  function dashboardHTML(r) {
    var h = heroHTML(r); // 6/11 (Fabrice): niente note di spiegazione né riquadri fiscali nelle home delle modalità
    if (riservato(r.modo)) return h + '<div class="banda-b"><span class="ico">🔑</span><div><b>Riservato al titolare</b><p>Con il profilo «Collaboratrice» questa parte è chiusa. Si cambia da MENU // IMPOSTAZIONI › PROFILO UTENTE.</p></div></div>';
    if (!modoInB(r.modo)) h += bandaB(r.modo.toUpperCase());
    if (r.modo === 'cassiere') return h + toolsHTML(r);
    h += sezioni(r.modo).map(sezioneHTML).join('');
    if (r.modo === 'creator') h += toolsHTML(r);
    return h;
  }

  function footerHTML() {
    return '<footer class="mobile-footer"><span class="marchio">STORE <i>//</i> CRAFT</span><span class="firma">Crafted with StoreCraft</span>' +
      '<div class="riga-btn"><button class="btn" type="button" data-act="crediti">Credits</button><a class="btn" href="tel:0678346705">Contatti</a><button class="btn" type="button" data-act="su" aria-label="Torna in cima">↑</button></div></footer>';
  }

  /* =====================================================================
     PAGINE STRUMENTO (pannello + anteprima + pulsantiera, come le pagine di StoreCraft)
     ===================================================================== */
  function ed(def) { var k = rotta().chiave; if (!S.ed[k]) S.ed[k] = clona(def || {}); return S.ed[k]; }
  function campo(lab, f, val, tipo, extra) {
    tipo = tipo || 'text';
    if (tipo === 'select') return '<label class="campo"><span>' + lab + '</span><select data-f="' + f + '"' + (extra || '') + '>' + val + '</select></label>';
    if (tipo === 'area') return '<label class="campo"><span>' + lab + '</span><textarea data-f="' + f + '"' + (extra || '') + '>' + esc(val) + '</textarea></label>';
    return '<label class="campo"><span>' + lab + '</span><input type="' + tipo + '" data-f="' + f + '" value="' + esc(val) + '"' + (tipo === 'number' ? ' inputmode="decimal" step="any"' : '') + (extra || '') + '></label>';
  }
  function opzioni(lista, sel) { return lista.map(function (o) { var v = Array.isArray(o) ? o[0] : o, t = Array.isArray(o) ? o[1] : o; return '<option value="' + esc(v) + '"' + (String(v) === String(sel) ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join(''); }
  function testa(titolo, eti, indietro) {
    return '<div class="pag-testa"><a class="torna" href="#' + (indietro || rotta().modo) + '">← Torna al menu</a><div><div class="eti">' + esc(eti || '') + '</div><h1>' + esc(titolo) + '</h1></div></div>';
  }
  function tavolo(eti, dentro, dx) { return '<div class="tavolo glass"><div class="eti-ant"><span>' + esc(eti) + '</span><span>' + esc(dx || 'anteprima') + '</span></div><div id="ant" style="width:100%;display:grid;justify-items:center">' + dentro + '</div></div>'; }
  function foglio(cls, w, html) { return '<div class="foglio ' + cls + '"><div class="scala" data-w="' + w + '">' + html + '</div></div>'; }
  function pulsantieraStampa(lab) {
    return '<div class="pulsantiera"><button class="btn" type="button" data-act="aggiungiLista">＋ Aggiungi a lista stampa</button><a class="btn" href="#creator/lista">☰ Gestisci lista di stampa (' + S.lista.length + ')</a>' +
      '<button class="btn pri xl" type="button" data-act="stampa">🖨 ' + esc(lab || 'Stampa') + '</button></div>';
  }
  var PAG = {}; // PAG['modo/pagina'] = function (r) -> { html, ant, foglio:{titolo, html, tipo}, dopo }

  /* ----- CREATOR · cartello ----- */
  PAG['creator/cartello'] = function (r) {
    var base = CARTELLI[r.v] || CARTELLI.semplice;
    var d = ed(Object.assign({ brand: base.brand || 'Ottica Macrì', logo: '', formato: '2' }, base));
    var testiPronti = ['Occhiali da vista completi', 'Montature da vista selezionate', 'Occhiali da sole selezionati', 'Lenti progressive', 'Lenti fotocromatiche', 'Lenti a contatto mensili', 'Occhiali da vista bambino', 'Montature in titanio'];
    var p = '<div class="pannello glass"><h2>' + esc(base.titolo.replace(' ✦', '')) + '</h2><div class="blocco"><p class="blocco-t">Brand</p>' +
      campo('Brand', 'brand', opzioni(['Ottica Macrì'].concat(D.MARCHE.filter(function (m) { return m !== 'Ottica Macrì'; })), d.brand), 'select') +
      campo('I Miei Loghi', 'logo', '<option value="">— Nessun Logo Personale —</option>' + S.loghi.map(function (l, i) { return '<option value="' + (i + 1) + '"' + (String(d.logo) === String(i + 1) ? ' selected' : '') + '>' + esc(l.nome) + '</option>'; }).join(''), 'select') + '</div>';
    p += '<div class="blocco"><p class="blocco-t">Claim</p><div class="due sempre">' + campo('Claim sinistro', 'claimSx', d.claimSx) + campo('Claim destro', 'claimDx', d.claimDx) + '</div></div><div class="blocco"><p class="blocco-t">Testi</p>';
    if (d.tipo === 'multi') {
      d.articoli.forEach(function (a, i) { p += '<div class="due">' + campo('Articolo ' + (i + 1), 'art' + i + 'd', a[0]) + campo('Prezzo €', 'art' + i + 'p', a[1], 'number') + '</div>'; });
    } else if (d.tipo === 'indicazioni') {
      p += campo('Reparto', 'reparto', d.reparto) + '<div class="campo"><span>Freccia</span><div class="chips">' + ['←', '↑', '→', '↓'].map(function (f) { return '<button type="button" class="chipb' + (d.freccia === f ? ' on' : '') + '" data-act="setf" data-f="freccia" data-val="' + f + '" style="font-size:24px;min-width:60px">' + f + '</button>'; }).join('') + '</div></div>';
    } else if (d.tipo === 'paio') {
      p += campo('Testo sopra', 'desc', d.desc) + campo('Sconto / valore', 'valore', d.valore) + campo('Testo sotto', 'sotto', d.sotto);
    } else {
      p += campo('Testi pronti', 'pronto', '<option value="">-- Seleziona Testo Pronto --</option>' + opzioni(testiPronti, ''), 'select') + campo('Testo libero', 'desc', d.desc);
      if (d.tipo === 'outlet') p += '<div class="due sempre">' + campo('Prezzo pieno €', 'pieno', d.pieno, 'number') + campo('Sconto %', 'sconto', d.sconto, 'number') + '</div>';
      else if (d.tipo === 'percentuale') p += campo('Sconto %', 'sconto', d.sconto, 'number');
      else p += campo('Prezzo €', 'prezzo', d.prezzo, 'number');
    }
    p += '</div><div class="blocco"><p class="blocco-t">Formato</p><div class="chips"><button type="button" class="chipb' + (d.formato !== '1' ? ' on' : '') + '" data-act="setf" data-f="formato" data-val="2">2 cartelli (foglio A4)</button><button type="button" class="chipb' + (d.formato === '1' ? ' on' : '') + '" data-act="setf" data-f="formato" data-val="1">1 cartello (solo superiore)</button></div></div>' + pulsantieraStampa('Stampa cartelli') + '</div>';
    return { html: testa('Cartello ' + base.titolo.replace(' ✦', ''), base.promo ? 'Promo stagionali' : 'Crea cartelli') + '<div class="strumento">' + p + tavolo('Foglio A4 · ' + (d.formato === '1' ? '1 cartello' : '2 cartelli'), foglio('a4', 595, a4Cartelli(d))) + '</div>',
      ant: function () { return foglio('a4', 595, a4Cartelli(d)); }, foglio: function () { return { titolo: 'Cartello ' + base.titolo.replace(' ✦', '') + ' · ' + (d.desc || d.reparto || ''), html: a4Cartelli(d), tipo: 'a4' }; },
      cambia: function (f, v) {
        if (f === 'pronto' && v) { d.desc = v; $('[data-f="desc"]').value = v; }
        var m = /^art(\d)([dp])$/.exec(f); if (m) d.articoli[+m[1]][m[2] === 'd' ? 0 : 1] = v;
      } };
  };
  /* ----- CREATOR · promo Black Friday (grafiche pronte) ----- */
  PAG['creator/promo-bf'] = function () {
    var d = ed({ g: 'bf-cartello-1', chiaro: false });
    var lista = ['bf-cartello-1', 'bf-cartello-2', 'bf-cartello-3', 'bf-cartello-4', 'bf-a4-modella'];
    function key() { return d.g + (d.chiaro ? '-chiaro' : ''); }
    function sheet() { return '<div class="a4s"><img class="tutta" src="' + (BF[key()] || '') + '" alt=""></div>'; }
    var p = '<div class="pannello glass"><h2>Black Friday</h2><div class="blocco"><p class="blocco-t">Scegli la grafica</p><div class="scelta-modelli a4">' +
      lista.map(function (k, i) { return '<button type="button" class="' + (d.g === k ? 'on' : '') + '" data-act="setf" data-f="g" data-val="' + k + '" data-rr><img src="' + (BF[k + (d.chiaro ? '-chiaro' : '')] || '') + '" alt=""><span class="nm">' + (k === 'bf-a4-modella' ? 'Modella' : 'Cartello ' + (i + 1)) + '</span></button>'; }).join('') +
      '</div></div><div class="blocco"><p class="blocco-t">Versione</p><div class="chips"><button type="button" class="chipb' + (!d.chiaro ? ' on' : '') + '" data-act="setf" data-f="chiaro" data-val="" data-rr>Scura</button><button type="button" class="chipb' + (d.chiaro ? ' on' : '') + '" data-act="setf" data-f="chiaro" data-val="1" data-rr>Chiara (risparmia toner)</button></div>' +
      '<p class="piccolo muto">Prezzi e marchi sulle grafiche sono esempi da confermare con Aldo.</p></div>' + pulsantieraStampa('Stampa cartello') + '</div>';
    return { html: testa('Black Friday', 'Promo stagionali ✦') + '<div class="strumento">' + p + tavolo('Foglio A4 · grafica pronta', foglio('a4', 595, sheet())) + '</div>',
      ant: function () { return foglio('a4', 595, sheet()); }, foglio: function () { return { titolo: 'Black Friday · ' + key(), html: sheet(), tipo: 'a4' }; } };
  };
  /* ----- CREATOR · cartellini ----- */
  PAG['creator/cartellini'] = function (r) {
    var v = CARTELLINI[r.v] ? r.v : 'vetrina';
    var vis = S.art.filter(function (a) { return a.cat === 'sole' || a.cat === 'vista'; });
    var d = ed({ sel: vis.slice(0, 8).map(function (a) { return a.cod; }), sconto: v === 'vetrina' ? 0 : 20, evento: v === 'promo' ? 'BLACK FRIDAY' : (v === 'prezzi' ? 'SALDI' : ''), fasce: '49 59 79 99 129 149 179 199' });
    function arts() { return S.art.filter(function (a) { return d.sel.indexOf(a.cod) >= 0; }); }
    var p = '<div class="pannello glass"><h2>Cartellini ' + esc(CARTELLINI[v].titolo) + '</h2>';
    if (v === 'prezzi') p += '<div class="blocco"><p class="blocco-t">Fasce prezzo</p>' + campo('Prezzi (separati da spazio)', 'fasce', d.fasce) + campo('Promozione', 'evento', d.evento) + '</div>';
    else {
      p += '<div class="blocco"><p class="blocco-t">Promozione</p><div class="due sempre">' + campo('Sconto %', 'sconto', d.sconto, 'number') + (v !== 'vetrina' ? campo('Evento', 'evento', d.evento) : '<span></span>') + '</div></div>';
      p += '<div class="blocco"><p class="blocco-t">Articoli ' + (PB ? '' : '(dal magazzino)') + '</p><div class="lista-righe" style="max-height:330px;overflow:auto">' + vis.map(function (a) {
        return '<label class="riga-art" style="cursor:pointer"><input type="checkbox" data-act="selArt" data-cod="' + a.cod + '"' + (d.sel.indexOf(a.cod) >= 0 ? ' checked' : '') + ' style="width:26px;height:26px"><span class="t"><b>' + esc(a.marca) + '</b><span>' + esc(a.modello) + '</span></span><span class="p">' + eur0(a.prezzo) + '</span></label>'; }).join('') + '</div></div>';
    }
    p += pulsantieraStampa('Stampa foglio A4') + '</div>';
    function sheet() { return a4Cartellini(v, d, arts()); }
    return { html: testa('Cartellini ' + CARTELLINI[v].titolo, 'Crea cartellini') + '<div class="strumento">' + p + tavolo('Foglio A4 · ' + (v === 'prezzi' ? '24' : v === 'quadrati' ? '12' : '8') + ' cartellini', foglio('a4', 595, sheet())) + '</div>',
      ant: function () { return foglio('a4', 595, sheet()); }, foglio: function () { return { titolo: 'Cartellini ' + CARTELLINI[v].titolo, html: sheet(), tipo: 'a4' }; } };
  };
  /* ----- CREATOR · etichette DYMO (etichette.html di StoreCraft) ----- */
  function stampanteHTML() {
    var ok = S.dymoOk !== false;
    return '<div class="stampante' + (ok ? '' : ' no') + '"><span class="dot"></span><div><b>DYMO LabelWriter 450</b><div class="piccolo muto">' + (ok ? 'collegata (USB) · rotolo 11354 · 57 × 32 mm' : 'non trovata: controlla il cavo e che sia accesa') + '</div></div></div>' +
      '<button class="btn sm" type="button" data-act="dymoCheck" style="margin-top:8px">🔄 Ricontrolla stampante DYMO</button>';
  }
  PAG['creator/dymo'] = function (r) {
    var v = DYMO[r.v] ? r.v : 'doppio';
    var a0 = S.art[v === 'calibro' ? 9 : 0];
    var d = ed(Object.assign(dymoDaArt(a0, DYMO[v].tpl, v === 'paio' ? 50 : 20), { n: 1, scelta: a0.cod }));
    var p = '<div class="pannello glass"><h2>Etichette DYMO</h2><div class="blocco"><p class="blocco-t">Modalità</p><div class="chips">' + Object.keys(DYMO).map(function (k) {
      return '<a class="chipb' + (k === v ? ' on' : '') + '" href="#creator/dymo/' + k + '" style="text-decoration:none;display:inline-flex;align-items:center">' + esc(DYMO[k].titolo) + '</a>'; }).join('') + '</div></div>';
    if (!PB) p += '<div class="blocco"><p class="blocco-t">Dal magazzino</p>' + campo('Scegli un articolo', 'scelta', opzioni(S.art.map(function (a) { return [a.cod, a.marca + ' ' + a.modello]; }), d.scelta), 'select', ' data-rr') + '</div>';
    p += '<div class="blocco"><p class="blocco-t">Etichetta</p>' + campo('Nome prodotto / descrizione', 'nome', d.nome) + campo('Codice articolo / barcode', 'ean', d.ean) +
      '<div class="due sempre">' + campo('Prezzo originario €', 'pieno', d.pieno, 'number') + campo('Sconto %', 'sconto', d.sconto, 'number') + '</div>' +
      (v === 'finale' || v === 'label' || v === 'ultimi' || v === 'calibro' ? campo('Prezzo finito €', 'finale', d.finale, 'number') : '') +
      '<div class="tre sempre">' + campo('Calibro', 'cal', d.cal) + campo('Ponte', 'ponte', d.ponte) + campo('Asta', 'asta', d.asta) + '</div>' +
      campo('Numero di etichette da stampare', 'n', d.n, 'number') + '</div><div class="blocco">' + stampanteHTML() + '</div>' +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="stampaDymo">🏷 Stampa etichetta</button></div></div>';
    return { html: testa('Etichette DYMO · ' + DYMO[v].titolo, 'Etichette') + '<div class="strumento">' + p + tavolo('Anteprima etichetta 11354 (57 × 32 mm)', foglio('dymo', 456, dymoHTML(d))) + '</div>',
      ant: function () { return foglio('dymo', 456, dymoHTML(d)); },
      cambia: function (f, val) { if (f === 'scelta') { var a = S.art.filter(function (x) { return x.cod === val; })[0]; if (a) { Object.assign(d, dymoDaArt(a, d.tpl, d.sconto)); } } } };
  };
  /* ----- CREATOR · stampe pronte e set ----- */
  PAG['creator/stampa'] = function (r) {
    var id = STAMPE[r.v] ? r.v : 'orari';
    var p = '<div class="pannello glass"><h2>' + esc(STAMPE[id][0]) + '</h2><p class="muto">Foglio A4 già pronto, con i dati del negozio presi da AMMINISTRAZIONE › Dati del negozio.</p>' +
      (id === 'orari' ? '<p class="piccolo muto">' + esc(S.negozio.orariNota) + '</p>' : '') + pulsantieraStampa('Apri & Stampa') + '</div>';
    return { html: testa(STAMPE[id][0], 'Stampe pronte // Listini & Punto Vendita') + '<div class="strumento">' + p + tavolo('PDF · A4', foglio('a4', 595, posterHTML(id))) + '</div>',
      foglio: function () { return { titolo: STAMPE[id][0] + ' · A4', html: posterHTML(id), tipo: 'a4' }; } };
  };
  PAG['creator/set'] = function (r) {
    var id = SET[r.v] ? r.v : 'set-bf', t = SET[id], fogli;
    if (id === 'set-bf') fogli = ['bf-cartello-1', 'bf-cartello-2', 'bf-cartello-3', 'bf-cartello-4'].map(function (k) { return '<div class="a4s"><img class="tutta" src="' + (BF[k + '-chiaro'] || '') + '" alt=""></div>'; });
    else { var c = CARTELLI[id.slice(4)]; fogli = [a4Cartelli(Object.assign({ brand: 'Ottica Macrì' }, c)), a4Cartellini(id === 'set-natale' ? 'quadrati' : 'promo', { sconto: c.sconto || 20, evento: c.nomeTipo }, S.art.filter(function (a) { return a.cat === 'sole' || a.cat === 'vista'; }))]; }
    var p = '<div class="pannello glass"><h2>' + esc(t[0].replace(' ✦', '')) + '</h2><p class="muto">Un allestimento completo in un colpo solo: ' + esc(t[2]) + '.</p><p class="piccolo muto">Basta premere STAMPA: i fogli escono in fila.</p>' +
      '<div class="pulsantiera"><button class="btn" type="button" data-act="aggiungiLista">＋ Aggiungi tutto a lista stampa</button><button class="btn pri xl" type="button" data-act="stampa" data-n="' + fogli.length + '">🖨 Stampa tutto il set (' + fogli.length + ' fogli)</button></div></div>';
    return { html: testa(t[0], "Allestimenti pronti // Fast 'N' Beautiful") + '<div class="strumento">' + p + '<div class="tavolo glass"><div class="eti-ant"><span>' + fogli.length + ' fogli A4</span><span>anteprima</span></div><div class="fogli-lista" style="width:100%">' +
      fogli.map(function (f, i) { return '<div class="fl"><b>Foglio ' + (i + 1) + '</b>' + foglio('a4', 595, f) + '</div>'; }).join('') + '</div></div></div>',
      foglio: function () { return { titolo: t[0] + ' (' + fogli.length + ' fogli)', html: fogli[0], tipo: 'a4', n: fogli.length }; } };
  };
  /* ----- CREATOR · loghi personali ----- */
  PAG['creator/loghi-importa'] = function () {
    var d = ed({ nome: '', src: '' });
    var p = '<div class="pannello glass"><h2>Importa Loghi</h2><p class="muto">Un logo di un marchio o di un\'iniziativa (PNG, JPG o SVG): finisce in «I Miei Loghi» dei cartelli.</p>' +
      '<label class="campo"><span>File del logo</span><input type="file" accept="image/*" data-act="fileLogo"></label>' + campo('Nome del logo', 'nome', d.nome) +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="salvaLogo"' + (d.src ? '' : ' disabled') + '>💾 Salva nei Miei Loghi</button><a class="btn" href="#creator/loghi">Gestisci Loghi (' + S.loghi.length + ')</a></div></div>';
    function prova() { return d.src ? '<div class="logo-prova" style="width:100%"><div style="background:#fff;border:1px solid #ddd"><img src="' + d.src + '" alt=""></div><div style="background:#111"><img src="' + d.src + '" alt=""></div></div>' : '<div class="vuoto" style="width:100%">Scegli un file: qui vedi come viene su fondo chiaro e scuro.</div>'; }
    return { html: testa('Importa Loghi', 'Loghi personali') + '<div class="strumento">' + p + tavolo('Prova su chiaro e scuro', prova()) + '</div>', ant: prova };
  };
  PAG['creator/loghi'] = function () {
    var h = testa('Gestisci Loghi', 'Loghi personali') + '<div class="card glass">';
    if (!S.loghi.length) h += '<div class="vuoto">Nessun logo ancora. <a href="#creator/loghi-importa">Importa il primo logo ›</a></div>';
    else h += '<div class="lista-righe">' + S.loghi.map(function (l, i) { return '<div class="riga-art"><img src="' + l.src + '" alt="" style="height:50px;max-width:120px;object-fit:contain;background:#fff"><span class="t"><b>' + esc(l.nome) + '</b><span>importato oggi</span></span><button class="btn sm" type="button" data-act="togliLogo" data-i="' + i + '">✕ Togli</button></div>'; }).join('') + '</div>';
    return { html: h + '<div class="riga-btn" style="margin-top:14px"><a class="btn" href="#creator/loghi-importa">＋ Importa logo</a></div></div>' };
  };
  /* ----- CREATOR · lista di stampa e cronologia ----- */
  PAG['creator/lista'] = function () {
    var h = testa('Lista di Stampa', 'Lista di stampa e cronologia') + nota('lista', 'Si mettono in lista i fogli preparati durante la giornata e si stampano <b>tutti insieme</b>: una sola volta alla stampante.');
    h += '<div class="card glass" style="margin-top:16px">';
    if (!S.lista.length) h += '<div class="vuoto">La lista è vuota. Apri un cartello e premi «＋ Aggiungi a lista stampa».</div>';
    else h += '<div class="fogli-lista">' + S.lista.map(function (f, i) { return '<div class="fl"><b>' + esc(f.titolo) + '</b>' + foglio(f.tipo === 'dymo' ? 'dymo' : 'a4', f.tipo === 'dymo' ? 456 : 595, f.html) + '<button class="btn sm" type="button" data-act="togliLista" data-i="' + i + '">✕ Togli</button></div>'; }).join('') + '</div>';
    h += '<div class="riga-btn" style="margin-top:16px"><button class="btn pri xl" type="button" data-act="stampaLista"' + (S.lista.length ? '' : ' disabled') + '>🖨 Stampa tutta la lista (' + S.lista.length + ')</button><a class="btn" href="#creator/cronologia">Cronologia di Stampa</a></div></div>';
    return { html: h };
  };
  PAG['creator/cronologia'] = function () {
    var h = testa('Cronologia di Stampa', 'Ultimi 7 giorni') + '<div class="card glass"><div class="storico">';
    h += S.cronologia.map(function (c) { return '<div><span class="d">' + dataIt(giorno(c.g)) + '</span><span>' + esc(c.t) + '</span><span class="stato ok">' + c.n + (c.n === 1 ? ' foglio' : ' fogli') + '</span></div>'; }).join('');
    return { html: h + '</div></div>' };
  };
  /* ----- CREATOR · VETRINA DIGITALE ----- */
  var MODELLI_SL = [['rosso', 'Promo rosso'], ['chiaro', 'Chiaro'], ['blu', 'Blu'], ['nero', 'Elegante']].concat(window.STILI ? window.STILI.modelliSlide() : []);   // aggancio stili.js
  function paginaSlide(vert) {
    var d = ed({ mod: vert ? 'blu' : 'rosso', kicker: vert ? 'Novità' : 'Promo', titolo: vert ? 'Nuovi Persol' : 'Occhiali da sole', testo: vert ? 'Appena arrivati in negozio' : 'Fino a fine mese, su una selezione', prezzo: vert ? 'da € 215' : '-30%', dur: 8 });
    var bf = vert ? ['bf-slide-v1', 'bf-slide-v2', 'bf-slide-v3'] : ['bf-slide-1', 'bf-slide-2', 'bf-slide-3', 'bf-slide-4', 'bf-slide-5', 'bf-slide-6'];
    function slide() { return /^bf-/.test(d.mod) ? { k: 'img', src: d.mod, nome: 'Black Friday ' + d.mod.replace('bf-slide-', '') } : { k: 'html', stile: d.mod, kicker: d.kicker, titolo: d.titolo, testo: d.testo, prezzo: d.prezzo, nome: d.titolo }; }
    var img = /^bf-/.test(d.mod);
    var p = '<div class="pannello glass"><h2>' + (vert ? 'Slide verticale' : 'Slide promo') + '</h2><div class="blocco"><p class="blocco-t">1 · Scegli il modello</p><div class="scelta-modelli' + (vert ? ' vert' : '') + '">' +
      MODELLI_SL.map(function (m) { return '<button type="button" class="' + (d.mod === m[0] ? 'on' : '') + '" data-act="setf" data-f="mod" data-val="' + m[0] + '" data-rr><div style="position:absolute;inset:0;overflow:hidden">' + slideScalata({ k: 'html', stile: m[0], kicker: 'Promo', titolo: 'Testo', prezzo: '€ 99' }, vert) + '</div><span class="nm">' + m[1] + '</span></button>'; }).join('') +
      bf.map(function (k) { return '<button type="button" class="' + (d.mod === k ? 'on' : '') + '" data-act="setf" data-f="mod" data-val="' + k + '" data-rr><img src="' + (BF[k] || '') + '" alt=""><span class="nm">Black Friday</span></button>'; }).join('') + '</div></div>';
    p += '<div class="blocco"><p class="blocco-t">2 · Testo e prezzo</p>' + (img ? '<p class="muto">Grafica Black Friday già pronta: testo e prezzi sono nell\'immagine (esempi da confermare).</p>' :
      campo('Scritta piccola in alto', 'kicker', d.kicker) + campo('Titolo', 'titolo', d.titolo) + campo('Testo', 'testo', d.testo) + campo('Prezzo o sconto', 'prezzo', d.prezzo)) +
      campo('Quanto resta sullo schermo', 'dur', opzioni([[5, '5 secondi'], [8, '8 secondi'], [12, '12 secondi']], d.dur), 'select') + '</div>';
    p += '<div class="blocco"><p class="blocco-t">3 · In vetrina</p><div class="pulsantiera"><button class="btn" type="button" data-act="slidePlaylist">＋ Aggiungi alla playlist</button><button class="btn pri xl" type="button" data-act="slideOnda">📡 Manda in vetrina ora</button></div></div></div>';
    function ant() { return '<div class="cornice-tablet' + (vert ? ' v' : '') + '">' + foglio(vert ? 'slidev' : 'slide', vert ? 540 : 960, slideHTML(slide(), vert)) + '</div>'; }
    return { html: testa(vert ? 'Slide verticale' : 'Slide promo', 'Vetrina digitale · ' + (vert ? 'schermo verticale 21,5" · 9:16 · 1080×1920' : 'tablet 12,4"–13" · 16:10 · 2560×1600')) + inOndaHTML() + '<div class="strumento">' + p + tavolo('Come la vedono dalla strada', ant(), vert ? '9:16' : '16:9') + '</div>',
      ant: ant, slide: function () { var s = slide(); s.dur = +d.dur; return s; } };
  }
  PAG['creator/vetrina-slide'] = function () { return paginaSlide(false); };
  PAG['creator/vetrina-vert'] = function () { return paginaSlide(true); };
  PAG['creator/vetrina-avviso'] = function () {
    var AVV = { orari: ['Avviso', 'Orari di apertura', 'Mar–Sab 9:30–13 · 16–19:30 (esempio)', ''], ferie: ['Avviso', 'Chiuso per ferie', 'Dal 10 al 24 agosto. Buone vacanze!', ''], controllo: ['Su appuntamento', 'Controllo della vista', 'Chiami lo 06 78346705', 'Gratuito'], pronti: ['Avviso', 'Occhiali pronti?', 'Entri pure: li abbiamo preparati per lei.', ''] };
    var d = ed({ a: 'orari', kicker: AVV.orari[0], titolo: AVV.orari[1], testo: AVV.orari[2], prezzo: '', mod: 'chiaro' });
    function slide() { return { k: 'html', stile: d.mod, kicker: d.kicker, titolo: d.titolo, testo: d.testo, prezzo: d.prezzo, nome: d.titolo, dur: 8 }; }
    var p = '<div class="pannello glass"><h2>Avvisi & Orari</h2><div class="blocco"><p class="blocco-t">Avvisi pronti</p><div class="chips">' + Object.keys(AVV).map(function (k) { return '<button type="button" class="chipb' + (d.a === k ? ' on' : '') + '" data-act="avviso" data-a="' + k + '">' + esc(AVV[k][1]) + '</button>'; }).join('') + '</div></div>' +
      '<div class="blocco"><p class="blocco-t">Testo</p>' + campo('Scritta piccola', 'kicker', d.kicker) + campo('Titolo', 'titolo', d.titolo) + campo('Testo', 'testo', d.testo) + campo('Riquadro (facoltativo)', 'prezzo', d.prezzo) +
      '<div class="chips">' + MODELLI_SL.map(function (m) { return '<button type="button" class="chipb' + (d.mod === m[0] ? ' on' : '') + '" data-act="setf" data-f="mod" data-val="' + m[0] + '">' + m[1] + '</button>'; }).join('') + '</div></div>' +
      '<div class="pulsantiera"><button class="btn" type="button" data-act="slidePlaylist">＋ Aggiungi alla playlist</button><button class="btn pri xl" type="button" data-act="slideOnda">📡 Manda in vetrina ora</button></div></div>';
    function ant() { return '<div class="cornice-tablet">' + foglio('slide', 960, slideHTML(slide())) + '</div>'; }
    PAG._avvisi = AVV;
    return { html: testa('Avvisi & Orari', 'Vetrina digitale') + inOndaHTML() + '<div class="strumento">' + p + tavolo('Schermo in vetrina', ant(), '16:10') + '</div>', ant: ant, slide: slide };
  };
  function playerHTML(lista, vert) {
    return '<div class="cornice-tablet' + (vert ? ' v' : '') + '"><div class="foglio ' + (vert ? 'slidev' : 'slide') + '" id="player" data-vert="' + (vert ? 1 : '') + '"></div></div>' +
      '<div class="piccolo muto" id="player-info" style="text-align:center"></div>';
  }
  PAG['creator/vetrina-bf'] = function () {
    var d = ed({ tema: 'scure', vert: false });
    function lista() { if (!LOOP) return []; var k = d.tema + (d.vert ? 'V' : ''); return (LOOP[k] || []).map(function (src, i) { return { k: 'img', src: src, nome: 'Black Friday · ' + nomeLoop(k, i), dur: 8 }; }); }
    var p = '<div class="pannello glass"><h2>Loop Black Friday</h2><p class="muto">Il giro di slide già pronto: Ray-Ban, Persol, Oakley e le offerte, uno dopo l\'altro, tutto il giorno.</p>' +
      '<div class="blocco"><p class="blocco-t">Versione</p><div class="chips"><button type="button" class="chipb' + (d.tema === 'scure' ? ' on' : '') + '" data-act="setf" data-f="tema" data-val="scure" data-rr>Scura</button><button type="button" class="chipb' + (d.tema === 'chiare' ? ' on' : '') + '" data-act="setf" data-f="tema" data-val="chiare" data-rr>Chiara</button></div></div>' +
      '<div class="blocco"><p class="blocco-t">Schermo</p><div class="chips"><button type="button" class="chipb' + (!d.vert ? ' on' : '') + '" data-act="setf" data-f="vert" data-val="" data-rr>Orizzontale 16:10</button><button type="button" class="chipb' + (d.vert ? ' on' : '') + '" data-act="setf" data-f="vert" data-val="1" data-rr>Verticale 9:16</button></div></div>' +
      '<p class="piccolo muto">Prezzi d\'esempio, da confermare.</p><div class="pulsantiera"><button class="btn pri xl" type="button" data-act="usaLoop">📡 Usa questo loop in vetrina</button><a class="btn" href="../media/blackfriday/loop/anteprima.html" target="_blank" rel="noopener">⛶ Apri a tutto schermo</a></div></div>';
    return { html: testa('Black Friday ✦', 'Vetrina digitale · loop pronto') + inOndaHTML() + '<div class="strumento">' + p + tavolo('Anteprima del loop', playerHTML(lista(), d.vert), lista().length + ' slide') + '</div>' + stradeHTML(),
      player: lista, vert: d.vert, loop: lista };
  };
  PAG['creator/vetrina-playlist'] = function () {
    var V = S.vetrina;
    var p = '<div class="card glass"><h2>Playlist della vetrina</h2>' + (V.playlist.length ? '<div class="playlist">' + V.playlist.map(function (s, i) {
      return '<div class="pl-riga"><span class="n">' + (i + 1) + '</span><div class="mini">' + (s.k === 'img' ? '<img src="' + imgSrc(s.src) + '" alt="">' : slideScalata(s)) + '</div><div class="t"><b>' + esc(s.nome) + '</b><span>' + (s.dur || 8) + ' secondi</span></div>' +
        '<div class="az"><button type="button" data-act="plSu" data-i="' + i + '" aria-label="Sposta su">↑</button><button type="button" data-act="plGiu" data-i="' + i + '" aria-label="Sposta giù">↓</button><button type="button" data-act="plVia" data-i="' + i + '" aria-label="Togli">✕</button></div></div>'; }).join('') + '</div>' : '<div class="vuoto">La playlist è vuota.</div>') +
      '<div class="riga-btn" style="margin-top:14px"><a class="btn" href="#creator/vetrina-slide">＋ Nuova slide</a><a class="btn" href="#creator/vetrina-bf">Loop Black Friday</a><button class="btn pri" type="button" data-act="mandaPlaylist">📡 Manda in vetrina</button></div></div>';
    return { html: testa('Playlist Vetrina', 'Vetrina digitale') + inOndaHTML() + '<div class="strumento meta">' + p + tavolo('Anteprima del giro', playerHTML(V.playlist), V.playlist.length + ' slide') + '</div>' + stradeHTML(),
      player: function () { return V.playlist; } };
  };

  /* ----- GESTIONALE ----- */
  function trova(cod) { return S.art.filter(function (a) { return a.cod === cod; })[0]; }
  function rigaArt(a, destra) { return '<div class="riga-art"><span class="t"><b>' + esc(a.marca) + ' · ' + esc(a.modello) + '</b><span class="cod">' + esc(a.cod) + '</span> · <span>' + esc(D.CAT[a.cat]) + '</span></span>' + (destra || '') + '</div>'; }
  function lettoreHTML(act, ph) {
    return '<div class="lettore-ico"><span class="dot"></span>Lettore codici pronto</div><div class="lettore"><input class="inp" id="lettore" inputmode="numeric" autocomplete="off" placeholder="' + esc(ph || 'Passi il lettore sul codice a barre…') + '" data-enter="' + act + '"><button class="btn blu" type="button" data-act="' + act + '" data-sim="1">📷 Simula lettura</button></div>';
  }
  PAG['gestionale/carico'] = function () {
    var d = ed({ cod: '', qta: 1, forn: 0, ddt: '', nuovo: null });
    var a = d.cod ? trova(d.cod) : null;
    var p = '<div class="pannello glass"><h2>Carico merce</h2><div class="blocco"><p class="blocco-t">1 · Leggi il codice</p>' + lettoreHTML('leggiCarico') + '</div>';
    if (a || d.nuovo) {
      p += '<div class="blocco"><p class="blocco-t">2 · ' + (a ? 'Articolo trovato' : 'Articolo nuovo: lo aggiungo al magazzino') + '</p>';
      if (a) p += rigaArt(a, '<span class="giac">' + a.giac + '</span>');
      else p += campo('Marca', 'nMarca', opzioni(D.MARCHE, d.nuovo.marca), 'select') + campo('Modello', 'nModello', d.nuovo.modello) + '<div class="due sempre">' + campo('Prezzo di vendita €', 'nPrezzo', d.nuovo.prezzo, 'number') + campo('Costo €', 'nCosto', d.nuovo.costo, 'number') + '</div>' +
        campo('Categoria', 'nCat', opzioni(Object.keys(D.CAT).map(function (k) { return [k, D.CAT[k]]; }), d.nuovo.cat), 'select');
      p += '<div class="campo" style="margin-top:12px"><span>Quanti pezzi</span><div class="qty"><button type="button" data-act="qta" data-d="-1">−</button><b>' + d.qta + '</b><button type="button" data-act="qta" data-d="1">＋</button></div></div>' +
        campo('Fornitore', 'forn', opzioni(D.FORNITORI.map(function (f, i) { return [i, f]; }), d.forn), 'select') + campo('Documento di trasporto (facoltativo)', 'ddt', d.ddt) +
        '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="carica">📦 Carica ' + d.qta + (d.qta === 1 ? ' pezzo' : ' pezzi') + '</button></div></div>';
    } else p += '<p class="muto">Appena legge il codice, qui compare l\'articolo. Se è nuovo, l\'app chiede solo marca, modello e prezzo.</p>';
    p += '</div>';
    var mov = '<div class="card glass"><h2>Ultimi movimenti</h2><div class="storico">' + S.movimenti.slice(0, 8).map(function (m) { return '<div><span class="d">' + m.d + '</span><span>' + esc(m.t) + ' · ' + esc(m.a) + '</span><span class="stato ' + (m.q > 0 ? 'ok' : 'no') + '">' + (m.q > 0 ? '+' : '') + m.q + '</span></div>'; }).join('') + '</div></div>';
    return { html: testa('Carico merce', 'Gestionale · movimenti') + '<div class="strumento">' + p + '<div class="pila">' + (d.ultimo ? '<div class="card glass"><h2>Caricato ✓</h2>' + rigaArt(trova(d.ultimo.cod), '<span class="giac">' + trova(d.ultimo.cod).giac + '</span>') + '<div class="riga-btn" style="margin-top:12px"><a class="btn pri" href="#gestionale/etichette" data-act="etichettePer" data-cod="' + d.ultimo.cod + '" data-n="' + d.ultimo.q + '">🏷 Stampa ' + d.ultimo.q + ' etichette DYMO</a></div></div>' : '') + mov + '</div></div>', fuoco: '#lettore' };
  };
  PAG['gestionale/movimenti'] = function () {
    return { html: testa('Ultimi movimenti', 'Gestionale · registro') + '<div class="card glass"><div class="tab-wrap"><table class="tab"><thead><tr><th>Data</th><th>Tipo</th><th>Articolo</th><th class="num">Pezzi</th><th>Chi</th></tr></thead><tbody>' +
      S.movimenti.map(function (m) { return '<tr><td class="cod">' + m.d + '</td><td><span class="stato ' + (m.q > 0 ? 'ok' : 'no') + '">' + esc(m.t) + '</span></td><td>' + esc(m.a) + '</td><td class="num">' + (m.q > 0 ? '+' : '') + m.q + '</td><td>' + esc(m.chi) + '</td></tr>'; }).join('') + '</tbody></table></div></div>' };
  };
  PAG['gestionale/vendita'] = function () {
    var d = ed({ cerca: '', sconto: 0, cliente: '' });
    var tot = S.carrello.reduce(function (s, c) { return s + trova(c.cod).prezzo * c.q; }, 0), fin = tot * (1 - num(d.sconto) / 100);
    var trovati = d.cerca ? S.art.filter(function (a) { return (a.marca + ' ' + a.modello + ' ' + a.cod).toLowerCase().indexOf(d.cerca.toLowerCase()) >= 0; }).slice(0, 6) : [];
    var p = '<div class="pannello glass"><h2>Vendita / scarico</h2><div class="blocco"><p class="blocco-t">Leggi il codice o cerca</p>' + lettoreHTML('leggiVendita') +
      '<label class="campo" style="margin-top:12px"><span>Oppure cerca per nome</span><input class="inp" type="search" data-f="cerca" data-rr value="' + esc(d.cerca) + '" placeholder="es. Wayfarer, Unika…"></label>' +
      (trovati.length ? '<div class="lista-righe">' + trovati.map(function (a) { return rigaArt(a, '<span class="p">' + eur(a.prezzo) + '</span><button class="btn sm" type="button" data-act="metti" data-cod="' + a.cod + '">＋</button>'); }).join('') + '</div>' : '') + '</div></div>';
    var c = '<div class="card glass"><h2>Banco · ' + S.carrello.length + ' righe</h2>' + (S.carrello.length ? '<div class="lista-righe">' + S.carrello.map(function (x, i) { var a = trova(x.cod);
      return rigaArt(a, '<div class="qty"><button type="button" data-act="cq" data-i="' + i + '" data-d="-1">−</button><b>' + x.q + '</b><button type="button" data-act="cq" data-i="' + i + '" data-d="1">＋</button></div><span class="p">' + eur(a.prezzo * x.q) + '</span>'); }).join('') + '</div>' : '<div class="vuoto">Nessun articolo. Leggi un codice a barre.</div>') +
      '<div class="due" style="margin-top:12px">' + campo('Sconto %', 'sconto', d.sconto, 'number', ' data-rr') + campo('Cliente (facoltativo)', 'cliente', '<option value="">— nessuno —</option>' + opzioni(S.clienti.map(function (c) { return [c.id, c.nome]; }), d.cliente), 'select') + '</div>' +
      '<div class="totale"><span>Totale da battere in cassa</span><b>' + eur(Math.round(fin * 100) / 100) + '</b></div>' +
      '<div class="fiscale"><span>Lo <b>scontrino</b> lo fa il registratore di cassa (RT) come sempre; per gli occhiali da vista la <b>Tessera Sanitaria</b> resta al registratore. Qui si scarica solo il magazzino.</span></div>' +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="registraVendita"' + (S.carrello.length ? '' : ' disabled') + '>✓ Registra vendita (scarico)</button></div></div>';
    return { html: testa('Vendita / scarico', 'Gestionale · banco') + '<div class="strumento">' + p + c + '</div>', fuoco: '#lettore' };
  };
  PAG['gestionale/magazzino'] = function (r) {
    var d = ed({ cerca: '', cat: '', scorta: r.v === 'scorta' });
    var lista = S.art.filter(function (a) { return (!d.cat || a.cat === d.cat) && (!d.scorta || (a.giac <= a.min && a.cat !== 'lenti')) && (!d.cerca || (a.marca + ' ' + a.modello + ' ' + a.cod).toLowerCase().indexOf(d.cerca.toLowerCase()) >= 0); });
    var pezzi = S.art.reduce(function (s, a) { return s + a.giac; }, 0), valore = S.art.reduce(function (s, a) { return s + a.giac * a.prezzo; }, 0);
    var h = testa(d.scorta ? 'Sotto scorta' : 'Magazzino', 'Gestionale') + '<div class="kpi"><div class="glass"><b>' + S.art.length + '</b><em>Articoli</em></div><div class="glass"><b>' + pezzi + '</b><em>Pezzi in negozio</em></div><div class="glass oro"><b>' + sottoScorta().length + '</b><em>Sotto scorta</em></div><div class="glass"><b>' + eur0(Math.round(valore)) + '</b><em>Valore a prezzo vendita</em></div></div>';
    h += '<div class="card glass"><div class="cerca"><input class="inp" type="search" data-f="cerca" data-rr value="' + esc(d.cerca) + '" placeholder="Cerchi marca, modello o codice…"><div class="chips"><button type="button" class="chipb' + (!d.cat ? ' on' : '') + '" data-act="setf" data-f="cat" data-val="" data-rr>Tutti</button>' +
      Object.keys(D.CAT).map(function (k) { return '<button type="button" class="chipb' + (d.cat === k ? ' on' : '') + '" data-act="setf" data-f="cat" data-val="' + k + '" data-rr>' + esc(D.CAT[k].replace('Montature da vista', 'Vista').replace('Occhiali da sole', 'Sole').replace('Lenti oftalmiche', 'Lenti').replace('Lenti a contatto', 'L. contatto').replace('Liquidi e accessori', 'Accessori')) + '</button>'; }).join('') +
      '<button type="button" class="chipb' + (d.scorta ? ' on' : '') + '" data-act="setf" data-f="scorta" data-val="' + (d.scorta ? '' : '1') + '" data-rr>⚠ Sotto scorta</button></div></div>';
    h += '<div class="tab-wrap"><table class="tab"><thead><tr><th>Codice</th><th>Marca</th><th>Modello</th><th>Categoria</th><th class="num">Prezzo</th><th class="num">In negozio</th><th></th></tr></thead><tbody>' +
      lista.map(function (a) { var cls = a.cat === 'lenti' ? '' : a.giac === 0 ? ' zero' : a.giac <= a.min ? ' basso' : '';
        return '<tr><td class="cod">' + a.cod + '</td><td><b>' + esc(a.marca) + '</b></td><td>' + esc(a.modello) + '</td><td>' + esc(D.CAT[a.cat]) + '</td><td class="num">' + eur(a.prezzo) + '</td><td class="num">' + (a.cat === 'lenti' ? '<span class="stato blu">su ordine</span>' : '<span class="giac' + cls + '">' + a.giac + '</span>') + '</td><td><a class="btn sm" href="#gestionale/etichette" data-act="etichettePer" data-cod="' + a.cod + '" data-n="1" title="Stampa etichetta">🏷</a></td></tr>'; }).join('') +
      '</tbody></table></div>' + (lista.length ? '' : '<div class="vuoto">Nessun articolo trovato.</div>') + '<div class="riga-btn" style="margin-top:14px"><a class="btn" href="#gestionale/carico">📦 Carico merce</a><a class="btn" href="#gestionale/inventario">📋 Inventario</a></div></div>';
    return { html: h };
  };
  PAG['gestionale/inventario'] = function () {
    var conta = S.inv;
    var h = testa('Inventario', 'Gestionale · conta') + nota('inv', 'Si passa il lettore su ogni pezzo in negozio: l\'app conta da sola e alla fine mostra <b>cosa manca e cosa c\'è in più</b> rispetto all\'archivio.');
    if (!conta) return { html: h + '<div class="card glass" style="margin-top:16px"><div class="vuoto">Nessun inventario in corso.<div class="riga-btn" style="justify-content:center;margin-top:14px"><button class="btn pri xl" type="button" data-act="invInizia">📋 Inizia inventario</button></div></div></div>' };
    var arts = S.art.filter(function (a) { return a.cat !== 'lenti'; });
    var contati = arts.filter(function (a) { return conta[a.cod] !== undefined; }).length;
    h += '<div class="strumento" style="margin-top:16px"><div class="pannello glass"><h2>Conta</h2>' + lettoreHTML('leggiInv', 'Passi il lettore su ogni pezzo…') + '<p class="muto" style="margin-top:12px">Contati ' + contati + ' articoli su ' + arts.length + '.</p>' +
      '<div class="pulsantiera"><button class="btn" type="button" data-act="invTutti">Conta tutto come in archivio (prova)</button><button class="btn pri xl" type="button" data-act="invChiudi">✓ Chiudi inventario e allinea</button><button class="btn sm" type="button" data-act="invAnnulla">Annulla inventario</button></div></div>';
    h += '<div class="card glass"><div class="tab-wrap" style="max-height:620px"><table class="tab"><thead><tr><th>Articolo</th><th class="num">In archivio</th><th class="num">Contati</th><th class="num">Differenza</th></tr></thead><tbody>' + arts.map(function (a) {
      var c = conta[a.cod], df = c === undefined ? '' : c - a.giac;
      return '<tr' + (S.invUltimo === a.cod ? ' style="background:rgba(61,119,72,.12)"' : '') + '><td><b>' + esc(a.marca) + '</b> ' + esc(a.modello) + '</td><td class="num">' + a.giac + '</td><td class="num"><input class="inp" type="number" min="0" data-inv="' + a.cod + '" value="' + (c === undefined ? '' : c) + '" style="width:90px;min-height:44px;text-align:right"></td><td class="num">' + (df === '' ? '–' : '<span class="' + (df > 0 ? 'diff-p' : df < 0 ? 'diff-n' : '') + '">' + (df > 0 ? '+' : '') + df + '</span>') + '</td></tr>'; }).join('') + '</tbody></table></div></div></div>';
    return { html: h, fuoco: '#lettore' };
  };
  PAG['gestionale/statistiche'] = function (r) {
    var d = ed({ per: 'anno' });
    var k = d.per === 'mese' ? 1 / 12 : d.per === 'settimana' ? 1 / 52 : 1;
    var per = {}, cat = {};
    S.art.forEach(function (a) { per[a.marca] = (per[a.marca] || 0) + a.v12 * a.prezzo; cat[a.cat] = (cat[a.cat] || 0) + a.v12 * a.prezzo; });
    var tot = S.venditeMese.reduce(function (s, v) { return s + v; }, 0) * k, pezzi = Math.round(S.art.reduce(function (s, a) { return s + a.v12; }, 0) * k);
    function barreHTML(obj, m) { var arr = Object.keys(obj).map(function (x) { return [x, obj[x] * k]; }).sort(function (a, b) { return b[1] - a[1]; }).slice(0, 8), max = arr[0] ? arr[0][1] : 1;
      return '<div class="barre">' + arr.map(function (x) { return '<div class="barra' + (m ? ' m' : '') + '"><span>' + esc(D.CAT[x[0]] || x[0]) + '</span><span class="bg"><i style="width:' + (x[1] / max * 100).toFixed(1) + '%"></i></span><span class="v">' + eur0(Math.round(x[1])) + '</span></div>'; }).join('') + '</div>'; }
    var maxM = Math.max.apply(null, S.venditeMese);
    var top = S.art.slice().sort(function (a, b) { return b.v12 - a.v12; }).slice(0, 5), fermi = S.art.filter(function (a) { return a.v12 < 6 && a.giac > 0; });
    var h = testa('Statistiche', 'Gestionale · numeri (non fiscali)') + '<div class="chips" style="margin-bottom:16px">' + [['settimana', 'Settimana'], ['mese', 'Mese'], ['anno', '12 mesi']].map(function (x) { return '<button type="button" class="chipb' + (d.per === x[0] ? ' on' : '') + '" data-act="setf" data-f="per" data-val="' + x[0] + '" data-rr>' + x[1] + '</button>'; }).join('') + '</div>' +
      '<div class="kpi"><div class="glass"><b>' + eur0(Math.round(tot)) + '</b><em>Venduto registrato</em></div><div class="glass"><b>' + pezzi + '</b><em>Pezzi venduti</em></div><div class="glass"><b>' + eur0(Math.round(tot / Math.max(1, pezzi * 0.62))) + '</b><em>Scontrino medio</em></div><div class="glass oro"><b>' + sottoScorta().length + '</b><em>Da riordinare</em></div></div>';
    h += '<div class="griglia2"><div class="card glass"><h2>Per marca</h2>' + barreHTML(per) + '</div><div class="card glass"><h2>Per tipo di articolo</h2>' + barreHTML(cat, true) + '</div></div>';
    h += '<div class="card glass" style="margin-top:20px"><h2>Ultimi 12 mesi</h2><div class="colonne">' + S.venditeMese.map(function (v, i) { return '<div class="' + (i === 11 ? 'ora' : '') + '" title="' + eur0(v) + '"><i style="height:' + (v / maxM * 100).toFixed(1) + '%"></i><span>' + D.MESI[i] + '</span></div>'; }).join('') + '</div><p class="piccolo muto">Novembre è in corso. Le cifre sono quelle registrate nello scarico, non i corrispettivi fiscali.</p></div>';
    h += '<div class="griglia2" style="margin-top:20px"><div class="card glass" id="top"><h2>🏆 I più venduti</h2><div class="lista-righe">' + top.map(function (a, i) { return rigaArt(a, '<span class="p">' + a.v12 + ' pz</span>'); }).join('') + '</div></div>' +
      '<div class="card glass" id="fermi"><h2>💤 Articoli fermi</h2><div class="lista-righe">' + fermi.map(function (a) { return rigaArt(a, '<span class="giac basso">' + a.giac + '</span>'); }).join('') + '</div><p class="piccolo muto">Consiglio: un cartello «Ultimi pezzi» o un post sui social.</p><a class="btn" href="#creator/cartello/ultimi">Crea cartello Ultimi Pezzi</a></div></div>';
    return { html: h, scorri: r.v === 'top' ? 'top' : r.v === 'fermi' ? 'fermi' : '' };
  };
  PAG['gestionale/etichette'] = function (r) {
    var tpl = r.v === 'calibro' ? 'calibro' : r.v === 'finale' ? 'finale' : 'doppio';
    var d = ed({ tpl: tpl, sconto: 20, q: {}, cerca: '' });
    if (S.etichettePer) { d.q = {}; d.q[S.etichettePer.cod] = S.etichettePer.n; S.etichettePer = null; }
    var lista = S.art.filter(function (a) { return a.cat !== 'lenti' && (!d.cerca || (a.marca + ' ' + a.modello).toLowerCase().indexOf(d.cerca.toLowerCase()) >= 0); });
    var n = Object.keys(d.q).reduce(function (s, c) { return s + (d.q[c] || 0); }, 0);
    var p = '<div class="pannello glass"><h2>Etichette dal magazzino</h2><div class="blocco">' + stampanteHTML() + '</div><div class="blocco"><p class="blocco-t">Modello</p><div class="chips">' +
      [['doppio', 'Doppio prezzo'], ['finale', 'Prezzo'], ['calibro', 'Calibro | ponte'], ['label', 'Ottica Macrì']].map(function (x) { return '<button type="button" class="chipb' + (d.tpl === x[0] ? ' on' : '') + '" data-act="setf" data-f="tpl" data-val="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div>' +
      (d.tpl === 'doppio' ? campo('Sconto %', 'sconto', d.sconto, 'number') : '') + '</div><div class="blocco"><p class="blocco-t">Quali articoli · quante etichette</p><input class="inp" type="search" data-f="cerca" data-rr value="' + esc(d.cerca) + '" placeholder="Cerca…" style="margin-bottom:8px"><div class="lista-righe" style="max-height:360px;overflow:auto">' +
      lista.map(function (a) { return '<div class="riga-art"><span class="t"><b>' + esc(a.marca) + '</b><span>' + esc(a.modello) + '</span></span><div class="qty"><button type="button" data-act="eq" data-cod="' + a.cod + '" data-d="-1">−</button><b>' + (d.q[a.cod] || 0) + '</b><button type="button" data-act="eq" data-cod="' + a.cod + '" data-d="1">＋</button></div></div>'; }).join('') + '</div></div>' +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="stampaEtichette"' + (n ? '' : ' disabled') + '>🏷 Stampa ' + n + ' etichette</button></div></div>';
    function ant() { var sel = S.art.filter(function (a) { return d.q[a.cod]; }); if (!sel.length) sel = [S.art[0]];
      return '<div style="display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:12px;width:100%">' + sel.slice(0, 6).map(function (a) { return '<div>' + foglio('dymo', 456, dymoHTML(dymoDaArt(a, d.tpl, d.sconto))) + '<div class="piccolo muto" style="text-align:center">× ' + (d.q[a.cod] || 0) + '</div></div>'; }).join('') + '</div>'; }
    return { html: testa('Etichette DYMO LabelWriter 450', 'Gestionale · etichette') + '<div class="strumento">' + p + tavolo('Rotolo 11354 · 57 × 32 mm', ant(), n + ' etichette') + '</div>', ant: ant };
  };

  /* ----- AMMINISTRAZIONE ----- */
  PAG['amministrazione/negozio'] = function (r) {
    var N = S.negozio;
    var p = '<div class="pannello glass"><h2>Dati del negozio</h2><div class="blocco"><p class="blocco-t">Anagrafica</p>' + campo('Insegna', 'nome', N.nome) + campo('Ragione sociale', 'ragione', N.ragione) + campo('Indirizzo', 'via', N.via) +
      '<div class="due sempre">' + campo('CAP', 'cap', N.cap) + campo('Città', 'citta', N.citta) + '</div>' + campo('Telefono', 'tel', N.tel) + campo('Partita IVA', 'piva', N.piva) + campo('E-mail', 'email', N.email) + '</div>' +
      '<div class="blocco" id="orari"><p class="blocco-t">Orari (' + esc(N.orariNota) + ')</p>' + N.orari.map(function (o, i) { return campo(o[0], 'orario' + i, o[1]); }).join('') + '</div>' +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="salvaNegozio">💾 Salva</button></div></div>';
    function ant() { return foglio('a4', 595, posterHTML('orari')); }
    return { html: testa('Dati del negozio', 'Amministrazione') + nota('neg', 'Questi dati si scrivono <b>una volta sola</b>: finiscono da soli su cartelli, stampe pronte, vetrina digitale e newsletter.') + '<div class="strumento" style="margin-top:16px">' + p + tavolo('Esempio: la stampa pronta Orari', ant()) + '</div>',
      ant: ant, scorri: r.v === 'orari' ? 'orari' : '', cambia: function (f, v) { var m = /^orario(\d)$/.exec(f); if (m) N.orari[+m[1]][1] = v; else N[f] = v; }, dati: N };
  };
  PAG['amministrazione/clienti'] = function (r) {
    var d = ed({ cerca: '' });
    if (r.v === 'nuovo' && !d.aperto) { d.aperto = true; setTimeout(function () { finestraCliente(); }, 50); }
    var lista = S.clienti.filter(function (c) { return !d.cerca || (c.nome + ' ' + c.tel + ' ' + c.email).toLowerCase().indexOf(d.cerca.toLowerCase()) >= 0; });
    var h = testa('Archivio clienti', 'Amministrazione') +
      '<div class="card glass" style="margin-top:16px"><div class="cerca"><input class="inp" type="search" data-f="cerca" data-rr value="' + esc(d.cerca) + '" placeholder="Cerchi nome, telefono o e-mail…"><button class="btn pri" type="button" data-act="nuovoCliente">＋ Nuovo cliente</button></div><div class="lista-righe">' +
      lista.map(function (c) { var acq = S.acquisti[c.id] || [];
        return '<a class="cliente-riga" href="#amministrazione/cliente/' + c.id + '"><span class="avatar">' + iniziali(c.nome) + '</span><span class="t"><b>' + esc(c.nome) + '</b><span>' + esc(c.tel) + (c.email ? ' · ' + esc(c.email) : '') + '</span></span>' +
          (acq[0] ? '<span class="piccolo muto" style="text-align:right">ultimo acquisto<br><b>' + acq[0][0] + '</b></span>' : '') + (true ? '<span class="stato ' + (c.mkt ? 'ok' : 'att') + '">' + (c.mkt ? 'novità sì' : 'novità no') + '</span>' : '') + '</a>'; }).join('') + '</div>' + (lista.length ? '' : '<div class="vuoto">Nessun cliente trovato.</div>') + '</div>';
    return { html: h };
  };
  PAG['amministrazione/cliente'] = function (r) {
    var c = S.clienti.filter(function (x) { return String(x.id) === r.v; })[0];
    if (!c) return { html: testa('Cliente', 'Amministrazione', 'amministrazione/clienti') + '<div class="vuoto">Cliente non trovato.</div>' };
    var acq = S.acquisti[c.id] || [], note = S.note[c.id] || [];
    var tot = acq.reduce(function (s, a) { return s + a[2]; }, 0);
    var sx = '<div class="pannello glass"><div style="display:flex;gap:14px;align-items:center"><span class="avatar" style="width:64px;height:64px;font-size:24px">' + iniziali(c.nome) + '</span><div><h2>' + esc(c.nome) + '</h2><span class="muto">cliente ' + esc(c.cliente) + '</span></div></div>' +
      '<div class="blocco" style="margin-top:12px"><p class="blocco-t">Contatti</p><p style="margin:4px 0">📞 ' + esc(c.tel) + '</p>' + (c.email ? '<p style="margin:4px 0">✉️ ' + esc(c.email) + '</p>' : '') + '<p style="margin:4px 0">🎂 ' + esc(c.comp) + '</p>' +
      '<div class="riga-btn" style="margin-top:10px"><a class="btn sm" href="tel:' + esc(c.tel.replace(/\s/g, '')) + '">📞 Chiama</a><button class="btn sm pri" type="button" data-act="msgPronti" data-id="' + c.id + '">💬 Occhiali pronti</button></div></div>';
    sx += '<div class="blocco"><p class="blocco-t">Privacy</p><p style="margin:4px 0"><span class="stato ok">✓ informativa firmata</span> il ' + esc(c.privacy) + '</p>' +
      '<label class="interruttore"><span>Vuole ricevere le novità<br><span class="piccolo muto">newsletter e promozioni</span></span><input type="checkbox" data-act="mkt" data-id="' + c.id + '"' + (c.mkt ? ' checked' : '') + '></label></div>';
    sx += '<p class="piccolo muto">' + FISCALE.amministrazione.replace(/<[^>]+>/g, '') + '</p></div>';
    var dx = '<div class="pila"><div class="card glass"><h2>Acquisti · ' + eur0(tot) + '</h2>' + (acq.length ? '<div class="storico">' + acq.map(function (a) { return '<div><span class="d">' + a[0] + '</span><span>' + esc(a[1]) + '</span><span class="mono">' + eur(a[2]) + '</span></div>'; }).join('') + '</div>' : '<div class="vuoto">Nessun acquisto registrato.</div>') + '</div>' +
      '<div class="card glass"><h2>Note</h2><label class="campo"><span>Nuova nota</span><textarea id="nuovaNota" placeholder="es. Preferisce montature leggere. Richiamare a gennaio."></textarea></label><button class="btn pri" type="button" data-act="salvaNota" data-id="' + c.id + '">💾 Salva nota</button>' +
      (note.length ? '<div class="storico" style="margin-top:12px">' + note.map(function (n) { return '<div><span class="d">' + n[0] + '</span><span>' + esc(n[1]) + '</span><span></span></div>'; }).join('') + '</div>' : '') + '</div></div>';
    return { html: testa(c.nome, 'Amministrazione · scheda cliente', 'amministrazione/clienti') + '<div class="strumento">' + sx + dx + '</div>' };
  };
  PAG['amministrazione/privacy'] = function () {
    var conMkt = S.clienti.filter(function (c) { return c.mkt; }).length;
    var h = testa('Privacy & consensi', 'Amministrazione · GDPR') + '<div class="kpi"><div class="glass"><b>' + S.clienti.length + '</b><em>Clienti</em></div><div class="glass"><b>' + S.clienti.length + '</b><em>Informativa firmata</em></div><div class="glass oro"><b>' + conMkt + '</b><em>Consenso novità</em></div><div class="glass"><b>' + (S.clienti.length - conMkt) + '</b><em>Senza consenso</em></div></div>' +
      '<div class="card glass"><div class="tab-wrap"><table class="tab"><thead><tr><th>Cliente</th><th>Informativa</th><th>Novità e newsletter</th></tr></thead><tbody>' + S.clienti.map(function (c) {
        return '<tr><td><a href="#amministrazione/cliente/' + c.id + '">' + esc(c.nome) + '</a></td><td><span class="stato ok">firmata ' + esc(c.privacy) + '</span></td><td><label class="interruttore" style="justify-content:flex-start;gap:14px"><input type="checkbox" data-act="mkt" data-id="' + c.id + '"' + (c.mkt ? ' checked' : '') + '><span>' + (c.mkt ? 'sì' : 'no') + '</span></label></td></tr>'; }).join('') +
      '</tbody></table></div><div class="riga-btn" style="margin-top:14px"><button class="btn" type="button" data-act="modulo">🖨 Modulo informativa (A4)</button><button class="btn" type="button" data-act="csv">⬇ Esporta registro consensi (CSV)</button></div>' +
      '<p class="piccolo muto">I testi dell\'informativa li prepara o controlla il consulente privacy del negozio. La newsletter va solo a chi ha detto sì.</p></div>';
    return { html: h };
  };
  PAG['amministrazione/utenti'] = function () {
    var AREE = ['creator', 'cassiere', 'gestionale', 'amministrazione', 'promoter'];
    var h = testa('Utenti', 'Amministrazione · chi usa l\'app') + '<div class="card glass"><div class="tab-wrap"><table class="tab"><thead><tr><th>Nome</th><th>Ruolo</th>' + AREE.map(function (a) { return '<th>' + a + '</th>'; }).join('') + '</tr></thead><tbody>' +
      S.utenti.map(function (u, i) { return '<tr><td><b>' + esc(u.nome) + '</b></td><td>' + esc(u.ruolo) + '</td>' + AREE.map(function (a) { return '<td><label class="interruttore" style="justify-content:center"><input type="checkbox" data-act="permesso" data-i="' + i + '" data-a="' + a + '"' + (u.aree[a] ? ' checked' : '') + (i === 0 ? ' disabled' : '') + '></label></td>'; }).join('') + '</tr>'; }).join('') +
      '</tbody></table></div><div class="riga-btn" style="margin-top:14px"><button class="btn pri" type="button" data-act="nuovoUtente">＋ Aggiungi utente</button></div><p class="piccolo muto">Il titolare vede tutto. Si entra con un PIN di 4 cifre; prova a cambiare profilo da MENU // IMPOSTAZIONI › PROFILO UTENTE.</p></div>';
    return { html: h };
  };

  /* ----- PROMOTER ----- */
  var MODELLI_POST = [['rosso', 'Promo rosso'], ['chiaro', 'Chiaro'], ['blu', 'Blu'], ['nero', 'Elegante']].concat(window.STILI ? window.STILI.modelliSlide() : [], [['bf-slide-2', 'Black Friday'], ['bf-slide-5', 'Black Friday 2']]);   // aggancio stili.js
  function didascalia(d) {
    var tag = ['#otticamacri', '#roma', '#ottica'];
    var low = (d.titolo + ' ' + d.testo).toLowerCase();
    if (/sole/.test(low)) tag.push('#occhialidasole'); if (/vista|lent|controllo/.test(low)) tag.push('#salutedegliocchi'); if (/black/.test(low) || /^bf-/.test(d.mod)) tag.push('#blackfriday');
    return (d.titolo ? d.titolo + (d.prezzo ? ' · ' + d.prezzo : '') + '\n' : '') + (d.testo ? d.testo + '\n' : '') + '\n📍 ' + S.negozio.via + ', Roma · ☎ ' + S.negozio.tel + '\n' + tag.join(' ');
  }
  function postDa(d) { return /^bf-/.test(d.mod) ? { k: 'img', src: d.mod } : { k: 'html', stile: d.mod, kicker: d.kicker, titolo: d.titolo, testo: d.testo, prezzo: d.prezzo, centro: d.centro }; }
  function pubblicaHTML(d) {
    return '<div class="blocco"><p class="blocco-t">Testo del post</p>' + campo('Didascalia', 'cap', d.cap || didascalia(d), 'area', ' data-man="1" style="min-height:150px"') +
      '<label class="interruttore"><span>📷 Instagram' + (S.account.ig ? '' : ' <span class="stato att">da collegare</span>') + '</span><input type="checkbox" data-f="ig"' + (d.ig ? ' checked' : '') + '></label>' +
      '<label class="interruttore"><span>📘 Facebook · Ottica Macrì</span><input type="checkbox" data-f="fb"' + (d.fb ? ' checked' : '') + '></label>' +
      campo('Quando', 'quando', opzioni([['ora', 'Subito'], ['domani', 'Domani alle 10:00'], ['sabato', 'Sabato alle 9:30']], d.quando), 'select') +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="pubblica">📣 Pubblica</button></div></div>';
  }
  function antPost(d) { return foglio('quadro', 540, postHTML(postDa(d))) + '<div class="post-cap" id="cap-ant"><b>otticamacri</b> ' + esc(d.cap || didascalia(d)) + '</div>'; }
  PAG['promoter/post'] = function () {
    var d = ed({ mod: 'rosso', kicker: 'Promo', titolo: 'Occhiali da sole', testo: 'Fino a fine mese su una selezione di Ray-Ban e Carrera.', prezzo: '-30%', ig: true, fb: true, quando: 'ora', cap: '' });
    var p = '<div class="pannello glass"><h2>Post da modello</h2><div class="blocco"><p class="blocco-t">1 · Modello (stile STORE // CRAFT)</p><div class="scelta-modelli quadri">' + MODELLI_POST.map(function (m) {
      return '<button type="button" class="' + (d.mod === m[0] ? 'on' : '') + '" data-act="setf" data-f="mod" data-val="' + m[0] + '" data-rr>' + (/^bf-/.test(m[0]) ? '<img src="' + (BF[m[0]] || '') + '" alt="">' : '<div style="position:absolute;inset:0;overflow:hidden">' + '<div class="scala" data-w="540">' + postHTML({ k: 'html', stile: m[0], kicker: 'Promo', titolo: 'Testo', prezzo: '€ 99' }) + '</div></div>') + '<span class="nm">' + m[1] + '</span></button>'; }).join('') + '</div></div>' +
      (/^bf-/.test(d.mod) ? '' : '<div class="blocco"><p class="blocco-t">2 · Testi</p>' + campo('Scritta piccola', 'kicker', d.kicker) + campo('Titolo', 'titolo', d.titolo) + campo('Testo', 'testo', d.testo) + campo('Prezzo o sconto', 'prezzo', d.prezzo) + '</div>') + pubblicaHTML(d) + '</div>';
    return { html: testa('Post da modello', 'Promoter · generatore A') + '<div class="strumento">' + p + tavolo('Come apparirà su Instagram e Facebook', antPost(d), '1080 × 1080') + '</div>', ant: function () { return antPost(d); }, post: d };
  };
  PAG['promoter/post-zero'] = function () {
    var d = ed({ idea: 'Questo sabato controllo della vista gratuito. Chi viene riceve il 20% di sconto sugli occhiali da sole.', proposte: null, scelta: 0, ig: true, fb: true, quando: 'ora', cap: '' });
    var p = '<div class="pannello glass"><h2>Post da zero</h2><div class="blocco"><p class="blocco-t">1 · Scrivi cosa vuoi dire</p>' + campo('Come lo diresti a un cliente', 'idea', d.idea, 'area') + '<button class="btn blu wide" type="button" data-act="creaGrafica">✨ Crea la grafica</button></div>';
    if (d.proposte) {
      p += '<div class="blocco"><p class="blocco-t">2 · Scegli una delle 3 proposte</p><div class="scelta-modelli quadri">' + d.proposte.map(function (pp, i) { return '<button type="button" class="' + (d.scelta === i ? 'on' : '') + '" data-act="sceltaProposta" data-i="' + i + '"><div style="position:absolute;inset:0;overflow:hidden"><div class="scala" data-w="540">' + postHTML(pp) + '</div></div><span class="nm">Proposta ' + (i + 1) + '</span></button>'; }).join('') + '</div></div>';
      var sel = d.proposte[d.scelta]; d.mod = sel.stile; d.kicker = sel.kicker; d.titolo = sel.titolo; d.testo = sel.testo; d.prezzo = sel.prezzo; d.centro = sel.centro;
      p += pubblicaHTML(d);
    }
    p += '</div>';
    return { html: testa('Post da zero', 'Promoter · generatore B') + '<div class="strumento">' + p + tavolo('Come apparirà', d.proposte ? antPost(d) : '<div class="vuoto" style="width:100%">Scrivi la tua idea e premi «✨ Crea la grafica»: l\'app propone 3 grafiche pronte.</div>', '1080 × 1080') + '</div>',
      ant: function () { return d.proposte ? antPost(d) : ''; }, post: d };
  };
  function generaProposte(testo) {
    var t = testo.replace(/\s+/g, ' ').trim(), low = t.toLowerCase();
    var prz = (/(-?\d+\s?%)/.exec(t) || /(€\s?\d+[.,]?\d*)/.exec(t) || /(gratuit[oa])/i.exec(t) || [])[1] || '';
    var frasi = (t.match(/[^.!?]+[.!?]*/g) || [t]).map(function (x) { return x.trim(); });
    if (/^\d/.test(prz) && /%$/.test(prz)) prz = '-' + prz.replace(/\s/g, '');
    var kick = /sabato|domenica|lunedì|martedì|mercoledì|giovedì|venerdì|natale|black friday/.exec(low); kick = kick ? (/natale|black/.test(kick[0]) ? kick[0] : 'Questo ' + kick[0]) : (/promo|sconto|%/.test(low) ? 'Promo' : 'Novità');
    var tit = (frasi[0] || t).replace(/[.!?]+$/, '').replace(/^(questo|questa|da|dal|il|la)\s+(sabato|domenica|lunedì|martedì|mercoledì|giovedì|venerdì)\s*/i, '').replace(/^(controllo della vista)/i, 'Controllo vista');
    var parole = tit.split(' '), corto = '';
    for (var i = 0; i < parole.length; i++) { if ((corto + ' ' + parole[i]).trim().length > 26) { corto += '…'; break; } corto = (corto + ' ' + parole[i]).trim(); }
    tit = corto.charAt(0).toUpperCase() + corto.slice(1);
    var resto = frasi.slice(1).join(' ');
    var stile1 = /vista|controllo|lenti/.test(low) ? 'blu' : /natale|regalo|elegan/.test(low) ? 'nero' : 'rosso';
    return [
      { k: 'html', stile: stile1, kicker: kick, titolo: tit, testo: resto, prezzo: prz.replace('gratuito', 'Gratis'), centro: false },
      { k: 'html', stile: 'chiaro', kicker: kick, titolo: tit, testo: resto, prezzo: prz, centro: true },
      { k: 'html', stile: stile1 === 'rosso' ? 'nero' : 'rosso', kicker: 'Ottica Macrì', titolo: prz || tit, testo: prz ? tit : resto, prezzo: '', centro: true }
    ];
  }
  PAG['promoter/calendario'] = function () {
    var h = testa('Calendario', 'Promoter · post e newsletter') + '<div class="card glass"><div class="calendario">' + ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map(function (g) { return '<div class="tg">' + g + '</div>'; }).join('');
    var oggi = new Date(), lun = (oggi.getDay() + 6) % 7;
    for (var i = -lun - 7; i < 14 - lun; i++) {
      var g = giorno(i), ev = S.post.filter(function (p) { return p.g === i; });
      h += '<div class="g' + (i === 0 ? ' oggi' : '') + '"><span class="n">' + ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'][g.getDay()] + ' ' + g.getDate() + '</span>' + ev.map(function (p) { return '<div class="ev' + (p.st === 'pub' ? ' pub' : '') + '">' + (p.ig ? '📷' : '') + (p.fb ? '📘' : '') + ' ' + esc(p.t) + '</div>'; }).join('') + '</div>';
    }
    h += '</div><div class="riga-btn" style="margin-top:14px"><a class="btn pri" href="#promoter/post">＋ Nuovo post</a><a class="btn" href="#promoter/post-zero">✨ Post da zero</a></div></div>';
    h += '<div class="card glass" style="margin-top:20px"><h2>Elenco</h2><div class="storico">' + S.post.slice().sort(function (a, b) { return b.g - a.g; }).map(function (p) { return '<div><span class="d">' + dataIt(giorno(p.g)) + '</span><span>' + esc(p.t) + ' ' + (p.ig ? '📷' : '') + (p.fb ? '📘' : '') + '</span><span class="stato ' + (p.st === 'pub' ? 'ok' : 'blu') + '">' + (p.st === 'pub' ? 'pubblicato' : 'programmato') + '</span></div>'; }).join('') + '</div></div>';
    return { html: h };
  };
  function mailHTML(d) {
    var a = trova(d.prod);
    return '<div class="mail-c"><div class="mh"><img src="' + LOGO + '" alt="Ottica Macrì"></div><div class="mb"><h3>' + esc(d.titolo) + '</h3><p>Gentile cliente,</p><p>' + esc(d.testo).replace(/\n/g, '<br>') + '</p>' +
      (a ? '<div class="mpr"><div style="flex:1"><div style="font:700 18px Arial">' + esc(a.marca) + '</div><div>' + esc(a.modello) + '</div></div><b>' + eur0(a.prezzo) + '</b></div>' : '') +
      '<a class="cta" href="#">' + esc(d.cta) + '</a><p style="margin-top:18px">A presto,<br>Aldo · Ottica Macrì</p></div><div class="mf">' + esc(S.negozio.via) + ', ' + esc(S.negozio.cap) + ' Roma · Tel. ' + esc(S.negozio.tel) + '<br>Riceve questa e-mail perché ha dato il consenso in negozio. <u>Non voglio più riceverle</u></div></div>';
  }
  PAG['promoter/newsletter'] = function () {
    var dest = S.clienti.filter(function (c) { return c.mkt && c.email; });
    var d = ed({ oggetto: 'Black Friday da Ottica Macrì', titolo: 'Il Black Friday arriva in negozio', testo: 'Da venerdì 27 novembre sconti su una selezione di occhiali da sole Ray-Ban, Persol e Carrera.\nLa aspettiamo in Via Poggi D\'Oro 23.', prod: S.art[0].cod, cta: 'Venga a trovarci' });
    var p = '<div class="pannello glass"><h2>Nuova newsletter</h2><div class="blocco">' + campo('Oggetto', 'oggetto', d.oggetto) + campo('Titolo', 'titolo', d.titolo) + campo('Testo', 'testo', d.testo, 'area') +
      campo('Prodotto in evidenza', 'prod', '<option value="">— nessuno —</option>' + opzioni(S.art.filter(function (a) { return a.cat === 'sole' || a.cat === 'vista'; }).map(function (a) { return [a.cod, a.marca + ' ' + a.modello]; }), d.prod), 'select') + campo('Pulsante', 'cta', d.cta) + '</div>' +
      '<div class="blocco"><p class="blocco-t">Destinatari</p><p style="margin:0 0 6px"><b>' + dest.length + ' clienti</b> con e-mail e consenso alle novità.</p><p class="piccolo muto">Chi non ha dato il consenso non la riceve: lo decide l\'archivio clienti.</p></div>' +
      '<div class="pulsantiera"><button class="btn" type="button" data-act="nlProva">✉ Mandi una prova a me</button><button class="btn pri xl" type="button" data-act="nlInvia" data-n="' + dest.length + '">📨 Invia a ' + dest.length + ' clienti</button></div></div>';
    function ant() { return '<div class="mail-intest"><b>Da:</b> Ottica Macrì · <b>Oggetto:</b> ' + esc(d.oggetto) + '</div><div class="foglio mail">' + mailHTML(d) + '</div>'; }
    return { html: testa('Nuova newsletter', 'Promoter · e-mail ai clienti') + '<div class="strumento">' + p + tavolo('Anteprima e-mail', ant()) + '</div>', ant: ant, nl: d };
  };
  PAG['promoter/storico'] = function () {
    return { html: testa('Storico invii', 'Promoter · newsletter') + '<div class="card glass"><div class="tab-wrap"><table class="tab"><thead><tr><th>Data</th><th>Newsletter</th><th class="num">Inviate</th><th class="num">Aperte</th></tr></thead><tbody>' +
      S.newsletter.map(function (n) { return '<tr><td class="cod">' + n.d + '</td><td>' + esc(n.t) + '</td><td class="num">' + n.n + '</td><td class="num"><span class="stato ' + (n.ap >= 60 ? 'ok' : 'blu') + '">' + n.ap + '%</span></td></tr>'; }).join('') + '</tbody></table></div><p class="piccolo muto">Le aperture si contano da sole (servizio di invio professionale, in Europa).</p></div>' };
  };
  PAG['promoter/account'] = function () {
    function acc(id, nome, ic, chi) { var on = S.account[id];
      return '<div class="card glass"><h2>' + ic + ' ' + nome + '</h2><p>' + (on ? '<span class="stato ok">collegato</span> ' + esc(chi) : '<span class="stato att">da collegare</span>') + '</p><button class="btn ' + (on ? '' : 'pri') + '" type="button" data-act="account" data-id="' + id + '">' + (on ? 'Scollega' : 'Collega (una volta sola)') + '</button></div>'; }
    return { html: testa('Account collegati', 'Promoter') + nota('acc', 'Si collegano <b>una volta sola</b> con l\'account di Aldo (Meta): poi l\'app pubblica per lui, senza aprire Instagram o Facebook.') + '<div class="griglia2" style="margin-top:16px">' + acc('fb', 'Facebook', '📘', S.negozio.facebook) + acc('ig', 'Instagram', '📷', '@otticamacri (esempio)') + '</div>' };
  };

  /* =====================================================================
     RENDER
     ===================================================================== */
  var corrente = null, ultimaChiave = '';
  function nonIncluso(r) {
    var etichetta = (r.pagina || r.modo).replace(/-/g, ' ');
    return { html: testa(etichetta, r.modo) + bandaB(etichetta.toUpperCase()) };
  }
  function render() {
    var r = rotta();
    MODI.forEach(function (m) { document.body.classList.toggle('modo-' + m.id, m.id === r.modo); });
    fermaPlayer();
    $('#sidebar').innerHTML = sidebarHTML(r);
    var corpo;
    corrente = null;
    if (!r.pagina) corpo = dashboardHTML(r);
    else if (!inB(r.modo, r.pagina) || riservato(r.modo)) { corrente = nonIncluso(r); corpo = riservato(r.modo) ? testa('Riservato', r.modo) + dashboardHTML(r) : corrente.html; }
    else { var f = PAG[r.modo + '/' + r.pagina]; corrente = f ? f(r) : { html: testa('Pagina', r.modo) + '<div class="vuoto">Pagina non trovata.</div>' }; corpo = corrente.html; }
    if (r.modo === 'creator' && PROVV_PAG[r.pagina]) corpo = corpo.replace('<div class="pag-testa">', '<div class="pag-testa">' + stickerProvv('in-pagina'));
    $('#main').innerHTML = testataHTML(r) + corpo + footerHTML();
    orologio(); banner(); adatta(); frecce();
    if (window.CLONE_SC) { try { window.CLONE_SC.dopo(); } catch (e) { if (window.console) console.warn('clone dopo', e); } }
    if (corrente && corrente.player) avviaPlayer(corrente.player(), corrente.vert);
    var nuova = r.chiave !== ultimaChiave; ultimaChiave = r.chiave;
    if (nuova) {
      window.scrollTo(0, 0);
      if (corrente && corrente.scorri) setTimeout(function () { scorriA(corrente.scorri); }, 120);
      if (corrente && corrente.fuoco && matchMedia('(pointer:fine)').matches) setTimeout(function () { var e = $(corrente.fuoco); if (e) e.focus(); }, 60);
    }
    menu(false);
    if (EMBED && parent !== window) parent.postMessage({ type: 'v2-hash', hash: location.hash }, '*');
  }
  function scorriA(id) { var e = document.getElementById(id); if (!e) return; window.scrollTo({ top: e.getBoundingClientRect().top + window.pageYOffset - (EMBED ? 12 : 72), behavior: 'smooth' }); }
  function aggiornaAnteprima() {
    if (!corrente || !corrente.ant) return;
    var a = $('#ant'); if (a) { a.innerHTML = corrente.ant(); adatta(); if (window.CLONE_SC) window.CLONE_SC.dopo(); }
  }

  /* rimpicciolire le grafiche a misura (.scala[data-w]) */
  function adatta() {
    $$('.scala[data-w]').forEach(function (el) {
      var p = el.parentElement, w = p.clientWidth; if (!w) return;
      var s = w / +el.dataset.w; el.style.transform = 'scale(' + s + ')';
      if (!/thumb|mini/.test(p.className) && p.classList.contains('foglio') === false) return;
    });
  }
  function frecce() {
    $$('.carousel-wrapper').forEach(function (w) {
      var c = $('.carousel', w), pv = $('.prev', w), nx = $('.next', w); if (!c) return;
      var f = function () { pv.hidden = c.scrollLeft < 8; nx.hidden = c.scrollLeft + c.clientWidth >= c.scrollWidth - 8; };
      c.onscroll = f; f();
    });
  }
  var tAdatta;
  window.addEventListener('resize', function () { clearTimeout(tAdatta); tAdatta = setTimeout(function () { adatta(); frecce(); fitDevice(); }, 80); });

  /* orologio e banner (come la dashboard: data in mattone, ora con i due punti che battono) */
  var GG = ['DOM', 'LUN', 'MAR', 'MER', 'GIO', 'VEN', 'SAB'], MM = ['GEN', 'FEB', 'MAR', 'APR', 'MAG', 'GIU', 'LUG', 'AGO', 'SET', 'OTT', 'NOV', 'DIC'];
  function orologio() {
    var d = new Date();
    $$('[data-v2-data]').forEach(function (e) { e.textContent = GG[d.getDay()] + ' ' + d.getDate() + ' ' + MM[d.getMonth()]; });
    $$('[data-v2-ora]').forEach(function (e) { e.innerHTML = due(d.getHours()) + '<span class="battito">:</span>' + due(d.getMinutes()); });
  }
  setInterval(orologio, 20000);
  var bIdx = 0;
  function banner() {
    var b = $('.banner'); if (!b) return;
    var sp = $$('span', b); b.classList.toggle('nascosto', sp.some(function (s) { return s.scrollWidth > b.clientWidth + 2; }));
  }
  setInterval(function () {
    var b = $('.banner'); if (!b) return; var sp = $$('span', b); if (sp.length < 2) return;
    var a = sp[bIdx % sp.length], n = sp[(bIdx + 1) % sp.length]; bIdx++;
    a.className = 'sopra'; n.className = ''; setTimeout(function () { a.className = 'sotto'; }, 750);
  }, 10000);

  /* lettore della vetrina (anteprima del giro di slide) */
  var tPlayer = null, tMini = null, miniI = 0;
  function fermaPlayer() { clearInterval(tPlayer); tPlayer = null; }
  function avviaPlayer(lista, vert) {
    var el = $('#player'), info = $('#player-info'); if (!el) return;
    var i = 0;
    function mostra() {
      if (!lista.length) { el.innerHTML = '<div class="vuoto" style="color:#ccc;border:0">Nessuna slide</div>'; return; }
      var s = lista[i % lista.length];
      el.innerHTML = '<div class="scala" data-w="' + (vert ? 540 : 960) + '" style="animation:none">' + slideHTML(s, vert) + '</div>';
      if (info) info.textContent = (i % lista.length + 1) + ' / ' + lista.length + ' · ' + (s.nome || '');
      adatta(); i++;
    }
    mostra(); tPlayer = setInterval(mostra, 2600);
  }
  tMini = setInterval(function () {
    var m = $('[data-mini]'); var pl = S.vetrina.playlist; if (!m || !pl.length || !S.vetrina.inOnda) return;
    miniI = (miniI + 1) % pl.length; var s = pl[miniI];
    m.innerHTML = s.k === 'img' ? '<img src="' + imgSrc(s.src) + '" alt="">' : slideScalata(s); adatta();
  }, 3000);

  /* ---------- menu mobile e menu di sistema ---------- */
  function menu(apri) {
    document.body.classList.toggle('menu-aperto', !!apri);
    var v = $('#velo-menu'); if (v) v.hidden = !apri;
  }
  function sistema(vista) {
    var m = $('#sysmenu');
    if (vista === false) { m.hidden = true; return; }
    vista = vista || 'home';
    var h = '';
    if (vista === 'home') h = '<h4>Menu</h4><button class="voce" type="button" data-act="sisVista" data-v="settings"><span><span class="ic">⚙︎</span>Impostazioni</span><span>›</span></button>' +
      '<button class="voce" type="button" data-act="sisVista" data-v="profilo"><span><span class="ic">♙</span>Profilo utente</span><span class="piccolo">' + esc(S.utenti[S.sistema.utente].nome.split(' ')[0]) + '</span></button>' +
      '<button class="voce" type="button" data-act="sisVista" data-v="crediti"><span><span class="ic">✉︎</span>Contatti & Credits</span><span>›</span></button>' +
      '<a class="voce" href="../index.html"><span><span class="ic">⌂</span>Home (portale)</span><span>›</span></a>';
    else if (vista === 'settings') h = '<h4>Impostazioni</h4><div class="riga"><b>TESTO</b><div class="scelte"><button type="button" class="' + (S.sistema.testo !== 'grande' ? 'on' : '') + '" data-act="testo" data-v="normale">NORMALE</button><button type="button" class="' + (S.sistema.testo === 'grande' ? 'on' : '') + '" data-act="testo" data-v="grande">GRANDE</button></div></div>' +
      '<div class="riga"><b>TEMA</b><div class="scelte"><button type="button" class="on">CHIARO</button><button type="button" disabled title="In arrivo">SCURO</button></div></div><button class="indietro" type="button" data-act="sisVista" data-v="home">← Indietro</button>';
    else if (vista === 'profilo') h = '<h4>Profilo utente</h4>' + S.utenti.map(function (u, i) { return '<button class="voce" type="button" data-act="utente" data-i="' + i + '"><span>' + esc(u.nome) + '<br><span class="piccolo muto">' + esc(u.ruolo) + '</span></span><span>' + (S.sistema.utente === i ? '● attivo' : '›') + '</span></button>'; }).join('') + '<button class="indietro" type="button" data-act="sisVista" data-v="home">← Indietro</button>';
    else h = '<h4>Contatti & Credits</h4><p><b>STORE // CRAFT</b> per Ottica Macrì · demo V2</p><p>Developed by Fabrizio Notte</p><p>© Marchi e loghi appartengono ai rispettivi proprietari</p><p class="piccolo">Demo: dati e prezzi di esempio.</p><button class="indietro" type="button" data-act="sisVista" data-v="home">← Indietro</button>';
    m.innerHTML = h; m.hidden = false;
  }

  /* ---------- finestre, avvisi, stampa simulata ---------- */
  function finestra(html, larga) {
    var v = $('#velo'); v.innerHTML = '<div class="finestra glass' + (larga ? ' larga' : '') + '" role="dialog" aria-modal="true"><button class="chiudi" type="button" data-act="chiudi" aria-label="Chiudi">✕</button>' + html + '</div>';
    v.hidden = false; adatta();
  }
  function chiudi() { var v = $('#velo'); v.hidden = true; v.innerHTML = ''; }
  var tToast;
  function toast(t) { var e = $('#toast'); e.textContent = t; e.classList.add('on'); clearTimeout(tToast); tToast = setTimeout(function () { e.classList.remove('on'); }, 2800); }
  function lavora(titolo, passi, esito, dopo) {
    finestra('<h2>' + esc(titolo) + '</h2><p id="passo" class="muto">' + esc(passi[0]) + '</p><div class="progresso"><i id="barra"></i></div>');
    var i = 0;
    var t = setInterval(function () {
      i++; var b = $('#barra'), p = $('#passo'); if (!b) { clearInterval(t); return; }
      b.style.width = Math.min(100, i / passi.length * 100) + '%';
      if (i < passi.length) p.textContent = passi[i];
      else { clearInterval(t); setTimeout(function () { finestra('<div class="esito"><div class="v">✓</div><b>' + esc(esito[0]) + '</b><p>' + esito[1] + '</p><button class="btn pri" type="button" data-act="chiudi">OK</button></div>'); if (dopo) dopo(); }, 300); }
    }, 520);
  }
  function stampaSim(titolo, n, dove) {
    lavora('Stampa in corso', ['Preparo ' + titolo + '…', 'Invio a ' + dove + '…', 'Stampa ' + n + (n === 1 ? ' foglio' : ' fogli') + '…'], ['Stampato', esc(titolo) + ' · ' + n + (dove.indexOf('DYMO') >= 0 ? ' etichette' : (n === 1 ? ' foglio' : ' fogli')) + ' su ' + esc(dove) + '.<br><span class="piccolo">(demo: nessuna stampa reale)</span>'],
      function () { S.cronologia.unshift({ g: 0, t: titolo, n: n }); });
  }

  /* ---------- strumenti della cassa (popup) ---------- */
  var TASSI = { USD: 1.08, GBP: 0.85, CHF: 0.94, JPY: 160.5, CNY: 7.8 };
  function widget(id) {
    var w = STRUMENTI.filter(function (x) { return x.id === id; })[0]; if (!w) return;
    var h = '<h2>' + esc(w.t) + '</h2>';
    if (id === 'sconto') h += '<div class="due sempre"><label class="campo"><span>Prezzo pieno €</span><input class="inp" id="w1" inputmode="decimal" value="109"></label><label class="campo"><span>Sconto %</span><input class="inp" id="w2" inputmode="decimal" value="20"></label></div><div class="chips">' + [10, 15, 20, 30, 50].map(function (x) { return '<button type="button" class="chipb" data-act="wset" data-id="w2" data-val="' + x + '">' + x + '%</button>'; }).join('') + '</div><div class="risultato" id="wr"></div>';
    if (id === 'aliquota') h += '<div class="due sempre"><label class="campo"><span>Prezzo pieno €</span><input class="inp" id="w1" inputmode="decimal" value="240"></label><label class="campo"><span>Prezzo finale €</span><input class="inp" id="w2" inputmode="decimal" value="180"></label></div><div class="risultato" id="wr"></div>';
    if (id === 'valuta') h += '<div class="due sempre"><label class="campo"><span>Euro €</span><input class="inp" id="w1" inputmode="decimal" value="109"></label><label class="campo"><span>Valuta</span><select class="inp" id="w2">' + Object.keys(TASSI).map(function (k) { return '<option>' + k + '</option>'; }).join('') + '</select></label></div><div class="risultato" id="wr"></div><p class="piccolo muto">Tassi di riserva (demo): nell\'app vera si aggiornano da soli.</p>';
    if (id === 'iva') h += '<div class="due sempre"><label class="campo"><span>Totale (IVA compresa) €</span><input class="inp" id="w1" inputmode="decimal" value="109"></label><label class="campo"><span>Aliquota</span><select class="inp" id="w2"><option>22</option><option>10</option><option>5</option><option>4</option></select></label></div><div class="risultato" id="wr"></div><p class="piccolo muto">Solo un calcolo: l\'aliquota giusta per ogni articolo la conferma il commercialista.</p>';
    if (id === 'qr') h += '<label class="campo"><span>Collegamento o testo</span><input class="inp" id="w1" value="https://' + esc(S.negozio.facebook) + '"></label><div class="qr-box" id="wr"></div><div class="riga-btn" style="margin-top:12px"><button class="btn pri" type="button" data-act="stampaQr">🖨 Stampa QR</button></div>';
    if (id === 'bacheca') h += '<div id="wr"></div><label class="campo"><span>Nuova nota</span><input class="inp" id="w1" placeholder="es. Chiamare il fornitore Unika"></label><button class="btn pri" type="button" data-act="notaBacheca">📌 Appendi</button>';
    finestra(h);
    var calc = function () {
      var a = num(($('#w1') || {}).value), b = ($('#w2') || {}).value, r = $('#wr'); if (!r) return;
      if (id === 'sconto') { var f = a * (1 - num(b) / 100); r.innerHTML = '<b>' + eur(f) + '</b><span>risparmio ' + eur(a - f) + '</span>'; }
      if (id === 'aliquota') { var s = a ? (1 - num(b) / a) * 100 : 0; r.innerHTML = '<b>-' + cifra(s, 1) + '%</b><span>sconto di ' + eur(a - num(b)) + '</span>'; }
      if (id === 'valuta') r.innerHTML = '<b>' + cifra(a * TASSI[b]) + ' ' + b + '</b><span>1 € = ' + TASSI[b] + ' ' + b + '</span>';
      if (id === 'iva') { var al = num(b), imp = a / (1 + al / 100); r.innerHTML = '<b>' + eur(imp) + '</b><span>imponibile · IVA ' + al + '% ' + eur(a - imp) + ' · totale ' + eur(a) + '</span>'; }
      if (id === 'qr') disegnaQR(r, ($('#w1') || {}).value || '');
      if (id === 'bacheca') r.innerHTML = S.bacheca.map(function (n) { return '<div class="bacheca-nota"><b>' + esc(n.t) + '</b><span>' + n.d + '</span></div>'; }).join('') || '<div class="vuoto">Nessuna nota.</div>';
    };
    $$('#velo input, #velo select').forEach(function (e) { e.addEventListener('input', calc); });
    calc();
  }
  function disegnaQR(box, testo) {
    box.innerHTML = '';
    if (window.QRCode) { try { new window.QRCode(box, { text: testo || ' ', width: 200, height: 200 }); return; } catch (e) { box.innerHTML = ''; } }
    // senza connessione: un QR d'esempio (non leggibile), solo per vedere come viene
    var n = 25, h = 0, c = '<svg viewBox="0 0 ' + n + ' ' + n + '" width="200" height="200" shape-rendering="crispEdges"><rect width="' + n + '" height="' + n + '" fill="#fff"/>';
    for (var i = 0; i < testo.length; i++) h = (h * 31 + testo.charCodeAt(i)) >>> 0;
    function occhio(x, y) { c += '<rect x="' + x + '" y="' + y + '" width="7" height="7"/><rect x="' + (x + 1) + '" y="' + (y + 1) + '" width="5" height="5" fill="#fff"/><rect x="' + (x + 2) + '" y="' + (y + 2) + '" width="3" height="3"/>'; }
    for (var y = 0; y < n; y++) for (var x = 0; x < n; x++) { if ((x < 8 && y < 8) || (x > n - 9 && y < 8) || (x < 8 && y > n - 9)) continue; h = (h * 1103515245 + 12345) >>> 0; if ((h >> 16) & 1) c += '<rect x="' + x + '" y="' + y + '" width="1" height="1"/>'; }
    occhio(0, 0); occhio(n - 7, 0); occhio(0, n - 7);
    box.innerHTML = c + '</svg><div class="piccolo muto">QR d\'esempio (senza internet)</div>';
  }
  function finestraCliente() {
    finestra('<h2>Nuovo cliente</h2><label class="campo"><span>Nome e cognome</span><input class="inp" id="nc1"></label><label class="campo"><span>Telefono</span><input class="inp" id="nc2" inputmode="tel"></label><label class="campo"><span>E-mail (facoltativa)</span><input class="inp" id="nc3" inputmode="email"></label>' +
      ('<label class="interruttore"><span>Ha firmato l\'informativa privacy</span><input type="checkbox" id="nc4" checked></label><label class="interruttore"><span>Vuole ricevere le novità</span><input type="checkbox" id="nc5"></label>') +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="salvaCliente">💾 Salva cliente</button></div>');
    setTimeout(function () { var e = $('#nc1'); if (e) e.focus(); }, 30);
  }

  /* ---------- azioni (data-act) ---------- */
  var scanNuovi = 0;
  function codiceSimulato(soloNoti) {
    S.scanIdx++;
    if (!soloNoti && S.scanIdx % 3 === 0 && scanNuovi < D.NUOVI.length) return D.NUOVI[scanNuovi++].cod;
    var noti = S.art.filter(function (a) { return a.cat !== 'lenti'; });
    return noti[(S.scanIdx * 7) % noti.length].cod;
  }
  function leggi(act, sim) {
    var inp = $('#lettore'); var cod = sim ? codiceSimulato(act !== 'leggiCarico') : (inp ? inp.value.replace(/\D/g, '') : '');
    if (!cod) { toast('Leggi un codice a barre'); return; }
    if (inp) inp.value = cod;
    var a = trova(cod), d = S.ed[rotta().chiave];
    if (act === 'leggiCarico') {
      d.cod = cod; d.qta = 1; d.ultimo = null;
      if (!a) { var nn = D.NUOVI.filter(function (x) { return x.cod === cod; })[0] || { cod: cod, marca: 'Ray-Ban', modello: '', cat: 'vista', prezzo: 0, costo: 0 }; d.nuovo = clona(nn); toast('Codice nuovo: completa i dati'); }
      else { d.nuovo = null; toast('Trovato: ' + a.marca + ' ' + a.modello); }
    } else if (act === 'leggiVendita') {
      if (!a) { toast('Codice non in magazzino'); return; }
      mettiCarrello(cod);
    } else if (act === 'leggiInv') {
      if (!a) { toast('Codice non in archivio'); return; }
      S.inv[cod] = (S.inv[cod] || 0) + 1; S.invUltimo = cod; toast('+1 · ' + a.marca + ' ' + a.modello + ' (' + S.inv[cod] + ')');
    }
    render();
  }
  function mettiCarrello(cod) {
    var x = S.carrello.filter(function (c) { return c.cod === cod; })[0];
    if (x) x.q++; else S.carrello.push({ cod: cod, q: 1 });
    var a = trova(cod); toast('Al banco: ' + a.marca + ' ' + a.modello);
  }
  function aggiungiLista() {
    if (!corrente || !corrente.foglio) return;
    var f = corrente.foglio(); S.lista.push(f); toast('Aggiunto alla lista di stampa (' + S.lista.length + ')');
    $$('a[href="#creator/lista"].btn').forEach(function (e) { e.textContent = '☰ Gestisci lista di stampa (' + S.lista.length + ')'; });
  }
  function scaricaCSV() {
    var righe = [['Cliente', 'Telefono', 'E-mail', 'Informativa firmata', 'Consenso novità']].concat(S.clienti.map(function (c) { return [c.nome, c.tel, c.email, c.privacy, c.mkt ? 'sì' : 'no']; }));
    var csv = '﻿' + righe.map(function (r) { return r.map(function (x) { return '"' + String(x).replace(/"/g, '""') + '"'; }).join(';'); }).join('\r\n');
    try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'registro-consensi-ottica-macri.csv'; document.body.appendChild(a); a.click(); a.remove(); toast('Registro scaricato (CSV)'); } catch (e) { toast('Download non disponibile qui'); }
  }

  var ACT = {
    home: function () { vai('creator'); },
    menu: function () { menu(!document.body.classList.contains('menu-aperto')); },
    gruppo: function (el) { var g = el.dataset.g, r = rotta(); var aperto = el.parentElement.classList.toggle('aperto'); S.sb[g] = aperto; el.setAttribute('aria-expanded', aperto); },
    sub: function (el) { var s = el.nextElementSibling; s.hidden = !s.hidden; S.sb['sub' + el.dataset.g] = !s.hidden; el.setAttribute('aria-expanded', !s.hidden); },
    scorri: function (el) { var id = el.dataset.s; if (rotta().pagina || rotta().modo !== 'creator') { location.hash = 'creator'; setTimeout(function () { scorriA(id); }, 150); } else scorriA(id); menu(false); },
    modo: function (el) { vai(el.dataset.m); },
    sistema: function (el) { var m = $('#sysmenu'); if (m.hidden) { sistema('home'); el.setAttribute('aria-expanded', 'true'); } else { sistema(false); el.setAttribute('aria-expanded', 'false'); } },
    sisVista: function (el) { sistema(el.dataset.v); },
    testo: function (el) { S.sistema.testo = el.dataset.v; document.documentElement.classList.toggle('testo-grande', S.sistema.testo === 'grande'); sistema('settings'); adatta(); },
    utente: function (el) { S.sistema.utente = +el.dataset.i; sistema('profilo'); render(); toast('Profilo: ' + S.utenti[S.sistema.utente].nome); },
    crediti: function () { finestra('<h2>Credits</h2><p><b>STORE // CRAFT</b> · Developed by Fabrizio Notte</p><p>© Marchi e loghi appartengono ai rispettivi proprietari</p><p class="muto">Demo per Ottica Macrì: dati e prezzi di esempio.</p><button class="btn pri" type="button" data-act="chiudi">Chiudi</button>'); },
    su: function () { window.scrollTo({ top: 0, behavior: 'smooth' }); },
    nascondi: function (el) { S.noteNascoste[el.dataset.n] = 1; el.parentElement.remove(); },
    car: function (el) { var c = $('.carousel', el.parentElement); c.scrollBy({ left: +el.dataset.d * c.clientWidth * 0.9, behavior: 'smooth' }); },
    fuoriB: function (el, ev) { ev.preventDefault(); toast('Fa parte dei moduli extra: si aggiunge quando vuoi'); },
    widget: function (el) { widget(el.dataset.w); menu(false); },
    wset: function (el) { var i = $('#' + el.dataset.id); i.value = el.dataset.val; i.dispatchEvent(new Event('input')); },
    stampaQr: function () { stampaSim('Codice QR', 1, 'stampante dell\'ufficio'); },
    notaBacheca: function () { var i = $('#w1'); if (!i.value.trim()) return; S.bacheca.unshift({ t: i.value.trim(), d: dataIt(new Date()) }); widget('bacheca'); toast('Nota appesa in bacheca'); },
    chiudi: function () { chiudi(); if (!rotta().pagina) render(); },
    vetrinaOnOff: function () { S.vetrina.inOnda = !S.vetrina.inOnda; toast(S.vetrina.inOnda ? 'Vetrina accesa' : 'Vetrina spenta'); render(); },
    setf: function (el) { var d = S.ed[rotta().chiave]; if (!d) return; d[el.dataset.f] = el.dataset.val; if (el.hasAttribute('data-rr')) { render(); return; }
      $$('[data-act="setf"][data-f="' + el.dataset.f + '"]').forEach(function (b) { b.classList.toggle('on', b === el); }); aggiornaAnteprima(); },
    avviso: function (el) { var d = S.ed[rotta().chiave], a = PAG._avvisi[el.dataset.a]; d.a = el.dataset.a; d.kicker = a[0]; d.titolo = a[1]; d.testo = a[2]; d.prezzo = a[3]; render(); },
    selArt: function (el) { var d = S.ed[rotta().chiave], c = el.dataset.cod, i = d.sel.indexOf(c); if (el.checked && i < 0) d.sel.push(c); if (!el.checked && i >= 0) d.sel.splice(i, 1); aggiornaAnteprima(); },
    aggiungiLista: function () { aggiungiLista(); },
    stampa: function (el) { if (!corrente || !corrente.foglio) return; var f = corrente.foglio(); stampaSim(f.titolo, +(el.dataset.n || f.n || 1), 'stampante dell\'ufficio (A4)'); },
    stampaLista: function () { var n = S.lista.reduce(function (s, f) { return s + (f.n || 1); }, 0); stampaSim('Lista di stampa', n, 'stampante dell\'ufficio (A4)'); S.lista = []; setTimeout(render, 2400); },
    togliLista: function (el) { S.lista.splice(+el.dataset.i, 1); render(); },
    dymoCheck: function () { S.dymoOk = true; toast('DYMO LabelWriter 450 trovata · pronta'); },
    stampaDymo: function () { var d = S.ed[rotta().chiave]; stampaSim('Etichetta DYMO · ' + (d.nome || ''), Math.max(1, Math.round(num(d.n))), 'DYMO LabelWriter 450'); },
    fileLogo: function () {},
    salvaLogo: function () { var d = S.ed[rotta().chiave]; if (!d.src) return; S.loghi.push({ nome: d.nome || 'Logo ' + (S.loghi.length + 1), src: d.src }); S.ed[rotta().chiave] = null; toast('Logo salvato in «I Miei Loghi»'); vai('creator/loghi'); },
    togliLogo: function (el) { S.loghi.splice(+el.dataset.i, 1); render(); },
    slidePlaylist: function () { if (!corrente || !corrente.slide) return; S.vetrina.playlist.push(corrente.slide()); toast('Aggiunta alla playlist (' + S.vetrina.playlist.length + ' slide)'); render(); },
    slideOnda: function () { if (!corrente || !corrente.slide) return; var s = corrente.slide(); S.vetrina.playlist.unshift(s);
      lavora('Mando in vetrina', ['Preparo la slide…', 'Invio allo schermo in vetrina…', 'Lo schermo conferma…'], ['In vetrina!', 'La slide «' + esc(s.nome || '') + '» è in onda adesso e poi riparte il giro.'], function () { S.vetrina.inOnda = true; S.vetrina.titolo = 'Playlist di Aldo'; setTimeout(render, 50); }); },
    usaLoop: function () { var l = corrente.loop(); S.vetrina.playlist = l.slice(); S.vetrina.titolo = 'Loop Black Friday';
      lavora('Mando in vetrina', ['Carico ' + l.length + ' slide…', 'Invio allo schermo in vetrina…', 'Avvio il giro…'], ['Loop in onda', l.length + ' slide Black Friday in vetrina, a giro continuo.'], function () { S.vetrina.inOnda = true; setTimeout(render, 50); }); },
    strada: function (el) { S.vetrina.strada = el.dataset.val === 'app' ? 'app' : 'sc'; render(); },
    esportaMp4: function (el) { var n = S.vetrina.playlist.length, usb = el && el.dataset.usb;
      lavora('Esporto il video', ['Preparo ' + n + ' slide…', 'Monto il video (' + (n * 8) + ' secondi)…', 'Salvo il file MP4…'], ['Video pronto', 'loop-vetrina.mp4 · ' + n + ' slide.<br>' + (usb ? 'Copialo sulla chiavetta USB e infilala nello schermo.' : 'Ora caricalo nell\'app dello schermo.') + '<br><span class="piccolo">(demo: nessun file scaricato)</span>']); },
    scaricaSlide: function () { var n = S.vetrina.playlist.length;
      lavora('Preparo le slide', ['Salvo ' + n + ' immagini…', 'Le metto in una cartella…'], ['Slide pronte', n + ' immagini nella cartella «vetrina».<br>Caricale nell\'app dello schermo.<br><span class="piccolo">(demo: nessun file scaricato)</span>']); },
    mandaPlaylist: function () { lavora('Mando in vetrina', ['Preparo ' + S.vetrina.playlist.length + ' slide…', 'Invio allo schermo in vetrina…'], ['Playlist in onda', 'Lo schermo in vetrina si aggiorna da solo.'], function () { var o = new Date(); S.vetrina.agg = 'oggi, ' + o.getHours() + ':' + ('0' + o.getMinutes()).slice(-2); S.vetrina.inOnda = true; S.vetrina.titolo = 'Playlist di Aldo'; setTimeout(render, 50); }); },
    plSu: function (el) { var i = +el.dataset.i, p = S.vetrina.playlist; if (i > 0) { p.splice(i - 1, 0, p.splice(i, 1)[0]); render(); } },
    plGiu: function (el) { var i = +el.dataset.i, p = S.vetrina.playlist; if (i < p.length - 1) { p.splice(i + 1, 0, p.splice(i, 1)[0]); render(); } },
    plVia: function (el) { S.vetrina.playlist.splice(+el.dataset.i, 1); render(); },
    leggiCarico: function (el) { leggi('leggiCarico', el && el.dataset.sim); },
    leggiVendita: function (el) { leggi('leggiVendita', el && el.dataset.sim); },
    leggiInv: function (el) { leggi('leggiInv', el && el.dataset.sim); },
    qta: function (el) { var d = S.ed[rotta().chiave]; d.qta = Math.max(1, d.qta + +el.dataset.d); render(); },
    carica: function () {
      var d = S.ed[rotta().chiave], a = trova(d.cod);
      if (!a && d.nuovo) { if (!d.nuovo.modello) { toast('Scrivi il modello'); return; } a = { cod: d.cod, marca: d.nuovo.marca, modello: d.nuovo.modello, cat: d.nuovo.cat, prezzo: num(d.nuovo.prezzo), costo: num(d.nuovo.costo), giac: 0, min: 1, cal: d.nuovo.cal || '', ponte: d.nuovo.ponte || '', v12: 0 }; S.art.unshift(a); }
      if (!a) return;
      a.giac += d.qta; S.movimenti.unshift({ d: dataIt(new Date()), t: 'Carico', a: a.marca + ' ' + a.modello, q: d.qta, chi: 'Aldo' });
      d.ultimo = { cod: a.cod, q: d.qta }; d.cod = ''; d.nuovo = null; d.qta = 1;
      toast('Caricati ' + d.ultimo.q + ' pezzi · ora in negozio: ' + a.giac); render();
    },
    etichettePer: function (el) { S.etichettePer = { cod: el.dataset.cod, n: +el.dataset.n }; delete S.ed['gestionale/etichette/']; },
    metti: function (el) { mettiCarrello(el.dataset.cod); render(); },
    cq: function (el) { var x = S.carrello[+el.dataset.i]; x.q += +el.dataset.d; if (x.q <= 0) S.carrello.splice(+el.dataset.i, 1); render(); },
    registraVendita: function () {
      var d = S.ed[rotta().chiave], tot = 0, righe = [];
      S.carrello.forEach(function (x) { var a = trova(x.cod); a.giac = Math.max(0, a.giac - x.q); a.v12 += x.q; tot += a.prezzo * x.q; righe.push(a.marca + ' ' + a.modello + (x.q > 1 ? ' ×' + x.q : ''));
        S.movimenti.unshift({ d: dataIt(new Date()), t: 'Vendita', a: a.marca + ' ' + a.modello, q: -x.q, chi: S.utenti[S.sistema.utente].nome.split(' ')[0] }); });
      tot = Math.round(tot * (1 - num(d.sconto) / 100) * 100) / 100; S.venditeMese[11] += tot;
      if (d.cliente) { (S.acquisti[d.cliente] = S.acquisti[d.cliente] || []).unshift([dataIt(new Date()), righe.join(', '), tot]); }
      S.carrello = []; d.sconto = 0; d.cliente = '';
      finestra('<div class="esito"><div class="v">✓</div><b>Vendita registrata</b><p>Magazzino aggiornato' + (righe.length ? ': ' + esc(righe.join(', ')) : '') + '.</p><div class="fiscale" style="text-align:left"><span>Ora batta lo <b>scontrino</b> sul registratore di cassa come sempre: <b>' + eur(tot) + '</b>.</span></div><button class="btn pri" type="button" data-act="chiudi" style="margin-top:14px">OK</button></div>');
      render();
    },
    invInizia: function () { S.inv = {}; render(); },
    invTutti: function () { S.art.forEach(function (a) { if (a.cat !== 'lenti') S.inv[a.cod] = a.giac; }); var x = S.art[3]; S.inv[x.cod] = Math.max(0, x.giac - 1); render(); toast('Conta di prova: un pezzo manca'); },
    invAnnulla: function () { S.inv = null; render(); },
    invChiudi: function () {
      var diff = 0, n = 0; S.art.forEach(function (a) { var c = S.inv[a.cod]; if (c === undefined) return; n++; if (c !== a.giac) { diff++; S.movimenti.unshift({ d: dataIt(new Date()), t: 'Inventario', a: a.marca + ' ' + a.modello, q: c - a.giac, chi: 'Aldo' }); a.giac = c; } });
      S.inv = null; finestra('<div class="esito"><div class="v">✓</div><b>Inventario chiuso</b><p>' + n + ' articoli contati, ' + diff + ' giacenze corrette.</p><button class="btn pri" type="button" data-act="chiudi">OK</button></div>'); render();
    },
    eq: function (el) { var d = S.ed[rotta().chiave]; d.q[el.dataset.cod] = Math.max(0, (d.q[el.dataset.cod] || 0) + +el.dataset.d); render(); },
    stampaEtichette: function () { var d = S.ed[rotta().chiave], n = Object.keys(d.q).reduce(function (s, c) { return s + d.q[c]; }, 0); stampaSim('Etichette dal magazzino', n, 'DYMO LabelWriter 450'); d.q = {}; setTimeout(render, 2200); },
    salvaNegozio: function () { toast('Dati del negozio salvati'); },
    nuovoCliente: function () { finestraCliente(); },
    salvaCliente: function () {
      var n = $('#nc1').value.trim(); if (!n) { toast('Scrivi il nome'); return; }
      var id = Math.max.apply(null, S.clienti.map(function (c) { return c.id; })) + 1;
      S.clienti.unshift({ id: id, nome: n, tel: $('#nc2').value || '—', email: $('#nc3').value, comp: '—', privacy: $('#nc4') && !$('#nc4').checked ? '—' : dataIt(new Date()), mkt: !!($('#nc5') && $('#nc5').checked), cliente: 'da oggi' });
      chiudi(); toast('Cliente salvato'); vai('amministrazione/cliente/' + id);
    },
    msgPronti: function (el) { var c = S.clienti.filter(function (x) { return x.id === +el.dataset.id; })[0];
      var t = 'Buongiorno ' + c.nome.split(' ')[0] + ', i suoi occhiali sono pronti! La aspettiamo in negozio. Ottica Macrì · ' + S.negozio.tel;
      finestra('<h2>Occhiali pronti</h2><label class="campo"><span>Messaggio per ' + esc(c.nome) + '</span><textarea class="inp" id="msgt" style="min-height:120px">' + esc(t) + '</textarea></label><div class="pulsantiera"><button class="btn pri xl" type="button" data-act="inviaMsg" data-id="' + c.id + '">💬 Invia (WhatsApp / SMS)</button></div><p class="piccolo muto">Demo: non parte nessun messaggio.</p>'); },
    inviaMsg: function (el) { var id = +el.dataset.id; (S.note[id] = S.note[id] || []).unshift([dataIt(new Date()), 'Avvisato: occhiali pronti.']); chiudi(); toast('Messaggio inviato (demo)'); render(); },
    mkt: function (el) { var c = S.clienti.filter(function (x) { return x.id === +el.dataset.id; })[0]; c.mkt = el.checked; toast(c.nome + ': novità ' + (c.mkt ? 'sì' : 'no')); if (rotta().pagina === 'privacy') render(); },
    salvaNota: function (el) { var t = $('#nuovaNota').value.trim(); if (!t) return; var id = +el.dataset.id; (S.note[id] = S.note[id] || []).unshift([dataIt(new Date()), t]); toast('Nota salvata'); render(); },
    modulo: function () { finestra('<h2>Modulo informativa</h2>' + foglio('a4', 595, '<div class="pp4">' + marchioOM() + '<h2 style="font-size:30px">Informativa privacy</h2><p style="font-size:17px;text-align:left">Titolare: ' + esc(S.negozio.ragione) + ', ' + esc(S.negozio.via) + ', Roma. I suoi dati (nome, telefono, e-mail, acquisti) servono per assisterla e, solo se lo desidera, per mandarle le novità del negozio.<br><br>[Testo completo da far preparare al consulente privacy]</p><table style="font-size:17px"><tr><td>☐ Ho letto l\'informativa</td><td></td></tr><tr><td>☐ Voglio ricevere le novità</td><td></td></tr><tr><td>Nome e firma</td><td>______________</td></tr></table></div>') + '<div class="pulsantiera"><button class="btn pri" type="button" data-act="stampaModulo">🖨 Stampa</button></div>', true); },
    stampaModulo: function () { stampaSim('Modulo informativa privacy', 1, 'stampante dell\'ufficio (A4)'); },
    csv: scaricaCSV,
    permesso: function (el) { S.utenti[+el.dataset.i].aree[el.dataset.a] = el.checked; toast('Permesso aggiornato'); },
    nuovoUtente: function () { finestra('<h2>Nuovo utente</h2><label class="campo"><span>Nome</span><input class="inp" id="nu1"></label><label class="campo"><span>PIN (4 cifre)</span><input class="inp" id="nu2" inputmode="numeric" maxlength="4"></label><div class="pulsantiera"><button class="btn pri" type="button" data-act="salvaUtente">💾 Salva</button></div>'); },
    salvaUtente: function () { var n = $('#nu1').value.trim(); if (!n) return; S.utenti.push({ nome: n, ruolo: 'Banco', pin: '••••', aree: { creator: true, cassiere: true, gestionale: false, amministrazione: false, promoter: false } }); chiudi(); render(); toast('Utente aggiunto'); },
    creaGrafica: function () { var d = S.ed[rotta().chiave]; lavora('Creo la grafica', ['Leggo il tuo testo…', 'Scelgo colori e impaginazione…', 'Preparo 3 proposte…'], ['Ecco 3 proposte', 'Scegli quella che ti piace di più.'], function () { d.proposte = generaProposte(d.idea || ''); d.scelta = 0; d.cap = ''; setTimeout(function () { chiudi(); render(); }, 700); }); },
    sceltaProposta: function (el) { var d = S.ed[rotta().chiave]; d.scelta = +el.dataset.i; d.cap = ''; render(); },
    pubblica: function () {
      var d = corrente.post; if (!d.ig && !d.fb) { toast('Scegli Instagram o Facebook'); return; }
      var dove = [d.ig ? 'Instagram' : '', d.fb ? 'Facebook' : ''].filter(Boolean).join(' e ');
      var titolo = d.titolo || 'Black Friday';
      if (d.quando !== 'ora') { S.post.push({ g: d.quando === 'domani' ? 1 : (6 - new Date().getDay() + 7) % 7 || 7, t: titolo, st: 'prog', ig: d.ig, fb: d.fb }); finestra('<div class="esito"><div class="v">🗓</div><b>Programmato</b><p>«' + esc(titolo) + '» uscirà ' + (d.quando === 'domani' ? 'domani alle 10:00' : 'sabato alle 9:30') + ' su ' + dove + '.</p><a class="btn pri" href="#promoter/calendario" data-act="chiudi">Vedi calendario</a></div>'); return; }
      lavora('Pubblico il post', ['Preparo l\'immagine 1080 × 1080…', d.ig ? 'Pubblico su Instagram…' : 'Pubblico su Facebook…', d.fb && d.ig ? 'Pubblico su Facebook…' : 'Controllo…'], ['Pubblicato', '«' + esc(titolo) + '» è online su ' + dove + '.<br><span class="piccolo">(demo: nessuna pubblicazione reale)</span>'], function () { S.post.push({ g: 0, t: titolo, st: 'pub', ig: d.ig, fb: d.fb }); });
    },
    nlProva: function () { toast('Prova inviata a info@otticamacri.it (demo)'); },
    nlInvia: function (el) { var d = corrente.nl, n = +el.dataset.n; lavora('Invio newsletter', ['Preparo l\'e-mail…', 'Controllo i consensi…', 'Invio a ' + n + ' clienti…'], ['Newsletter inviata', '«' + esc(d.oggetto) + '» a ' + n + ' clienti. Le aperture si vedono in Storico invii.'], function () { S.newsletter.unshift({ d: dataIt(new Date()), t: d.oggetto, n: n, ap: 0 }); }); },
    account: function (el) { S.account[el.dataset.id] = !S.account[el.dataset.id]; toast(S.account[el.dataset.id] ? 'Collegato (demo)' : 'Scollegato'); render(); }
  };

  document.addEventListener('click', function (ev) {
    var el = ev.target.closest('[data-act]');
    var sm = $('#sysmenu');
    if (sm && !sm.hidden && !ev.target.closest('#sysmenu') && !ev.target.closest('[data-act="sistema"]') && !ev.target.closest('.fab')) sistema(false);
    if (ev.target.id === 'velo') { chiudi(); return; }
    if (ev.target.id === 'velo-menu') { menu(false); return; }
    if (!el) return;
    var f = ACT[el.dataset.act]; if (!f) return;
    if (el.tagName === 'BUTTON' || el.dataset.act === 'fuoriB') ev.preventDefault();
    if (el.tagName === 'A' && el.dataset.act === 'chiudi') { chiudi(); return; }
    f(el, ev);
    salvaPresto();
  });
  document.addEventListener('change', function (ev) {
    var el = ev.target;
    if (el.matches('input[type=checkbox][data-act]')) { var f = ACT[el.dataset.act]; if (f) f(el, ev); return; }
    if (el.matches('input[type=file][data-act="fileLogo"]')) {
      var file = el.files && el.files[0]; if (!file) return; var rd = new FileReader(); var d = S.ed[rotta().chiave];
      rd.onload = function () { d.src = rd.result; if (!d.nome) d.nome = file.name.replace(/\.[^.]+$/, ''); render(); }; rd.readAsDataURL(file); return;
    }
    if (el.matches('[data-f][data-rr]') && el.tagName === 'SELECT') { campoCambia(el); render(); }
    salvaPresto();
  });
  function campoCambia(el) {
    var r = rotta(), d = S.ed[r.chiave]; var f = el.dataset.f, v = el.type === 'checkbox' ? el.checked : el.value;
    if (corrente && corrente.dati) { if (corrente.cambia) corrente.cambia(f, v); return; }
    if (d && f.charAt(0) === 'n' && d.nuovo && /^n[A-Z]/.test(f)) { var k = f.charAt(1).toLowerCase() + f.slice(2); d.nuovo[k] = v; return; }
    if (d) d[f] = v;
    if (corrente && corrente.cambia) corrente.cambia(f, v);
    if (f === 'cap') { d.cap = v; } else if (d && 'cap' in d && f !== 'quando' && f !== 'ig' && f !== 'fb' && !el.dataset.man) { d.cap = ''; var ta = $('[data-f="cap"]'); if (ta) ta.value = didascalia(d); }
  }
  var tRr;
  document.addEventListener('input', function (ev) {
    var el = ev.target;
    if (el.matches('[data-inv]')) {
      var v = el.value === '' ? undefined : Math.max(0, parseInt(el.value, 10) || 0); if (v === undefined) delete S.inv[el.dataset.inv]; else S.inv[el.dataset.inv] = v;
      var a = trova(el.dataset.inv), cella = el.closest('tr').lastElementChild, df = v === undefined ? '' : v - a.giac;
      cella.innerHTML = df === '' ? '–' : '<span class="' + (df > 0 ? 'diff-p' : df < 0 ? 'diff-n' : '') + '">' + (df > 0 ? '+' : '') + df + '</span>';
      return;
    }
    if (!el.matches('[data-f]')) return;
    if (el.tagName === 'SELECT' && el.hasAttribute('data-rr')) return;
    campoCambia(el); salvaPresto();
    if (el.hasAttribute('data-rr')) { clearTimeout(tRr); tRr = setTimeout(function () { var pos = el.selectionStart; render(); var n = $('[data-f="' + el.dataset.f + '"]'); if (n) { n.focus(); try { n.setSelectionRange(pos, pos); } catch (e) {} } }, 250); return; }
    aggiornaAnteprima();
  });
  document.addEventListener('keydown', function (ev) {
    if (ev.key === 'Escape') { chiudi(); sistema(false); menu(false); }
    if (ev.key === 'Enter' && ev.target.dataset && ev.target.dataset.enter) { ev.preventDefault(); leggi(ev.target.dataset.enter, false); }
  });

  /* =====================================================================
     BARRA DEMO: viste desktop / tablet / telefono e Piano base / Moduli extra
     ===================================================================== */
  VISTA = 'desktop'; var ORIZ = false;
  function setVista(v) {
    VISTA = v;
    $$('#demobar [data-v]').forEach(function (b) { b.classList.toggle('on', b.dataset.v === v); });
    $('#ruota').style.display = v === 'tablet' ? '' : 'none';
    document.body.classList.toggle('devmode', v !== 'desktop');
    if (v === 'desktop') { $('#stage').innerHTML = ''; S = caricaStato() || S; render(); return; }
    var w = v === 'phone' ? 390 : (ORIZ ? 1180 : 820), h = v === 'phone' ? 844 : (ORIZ ? 820 : 1180);
    $('#stage').innerHTML = '<div class="devwrap"><div class="device ' + (v === 'phone' ? 'phone' : 'tablet') + '"><iframe id="devframe" title="Anteprima app" width="' + w + '" height="' + h + '" src="demo-app-v2.html?embed' + (PB ? '' : '&piano=extra') + (location.hash || '#creator') + '"></iframe></div><div class="devlabel">' + (v === 'phone' ? 'TELEFONO · 390×844' : 'TABLET · ' + w + '×' + h) + '</div></div>';
    fitDevice();
  }
  function fitDevice() {
    var d = $('.device'); if (!d) return; var st = $('#stage');
    var s = Math.min((st.clientWidth - 40) / d.offsetWidth, (st.clientHeight - 70) / d.offsetHeight, 1);
    d.style.transform = 'scale(' + s + ')'; var wr = $('.devwrap'); wr.style.width = d.offsetWidth * s + 'px'; wr.style.height = d.offsetHeight * s + 'px';
  }
  window.addEventListener('message', function (e) {
    var m = e.data || {};
    if (m.type === 'v2-hash' && !EMBED && m.hash && m.hash !== location.hash) history.replaceState(null, '', m.hash);
    if (m.type === 'v2-vai' && EMBED && m.hash !== location.hash) location.hash = m.hash;
  });
  window.addEventListener('hashchange', function () {
    if (!EMBED && VISTA !== 'desktop') { var f = $('#devframe'); if (f && f.contentWindow) f.contentWindow.postMessage({ type: 'v2-vai', hash: location.hash }, '*'); return; }
    render();
  });
  if (!EMBED) {
    $$('#demobar [data-v]').forEach(function (b) { b.onclick = function () { setVista(b.dataset.v); }; });
    $('#ruota').onclick = function () { ORIZ = !ORIZ; setVista('tablet'); };
    $$('#demobar [data-p]').forEach(function (b) {
      b.classList.toggle('on', (b.dataset.p === 'base') === PB);
      b.onclick = function () {
        var u = new URLSearchParams(); if (b.dataset.p === 'extra') u.set('piano', 'extra');
        if (VISTA !== 'desktop') u.set('vista', VISTA === 'phone' ? 'telefono' : 'tablet'); if (VISTA === 'tablet' && ORIZ) u.set('orizzontale', '1');
        var qs = u.toString(); location.href = location.pathname + (qs ? '?' + qs : '') + (location.hash || '');
      };
    });
    $('#ricomincia').onclick = function () { azzeraStato(); S = nuovoStato(); ultimaChiave = ''; if (window.CLONE_SC && window.CLONE_SC.seme) window.CLONE_SC.seme(); salvaStato(); if (VISTA === 'desktop') vai('creator'); else { location.hash = 'creator'; setVista(VISTA); } toast('Demo ricominciata'); };
    var tb = $('#tuttoBtn'), tp = $('#tutto');
    var tutto = function (o) { tp.hidden = !o; tb.setAttribute('aria-expanded', String(o)); };
    tb.onclick = function () { tutto(tp.hidden); };
    tp.onclick = function (e) { if (e.target === tp || e.target.classList.contains('tx')) tutto(false); };
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') tutto(false); });
  }
  $('.fab').onclick = function (e) { e.stopPropagation(); var m = $('#sysmenu'); if (m.hidden) sistema('home'); else sistema(false); };

  // per le prove automatiche e la barra demo
  window.demo2 = { vai: vai, stato: function () { return S; }, vista: function (v) { setVista(v === 'telefono' ? 'phone' : v); }, ridisegna: function () { render(); }, salva: salvaStato };

  // agganci cartelli.js (supporti veri, allestimento vetrine, prezzi da stanghetta)
  var API_V2 = { PAG: PAG, ACT: ACT, CARTELLI: CARTELLI, S: function () { return S; }, corrente: function () { return corrente; }, ed: ed, campo: campo, opzioni: opzioni, testa: testa, nota: nota, rotta: rotta, render: render, toast: toast, stampaSim: stampaSim,
    tavolo: tavolo, finestra: finestra, chiudi: chiudi, vai: vai, salva: salvaStato, posterHTML: posterHTML, widgetVecchio: widget, PB: PB };
  if (window.CARTELLI_V2) window.CARTELLI_V2.installa(API_V2);
  // clone fedele di STORE // CRAFT (dopo cartelli.js: «creator/supporto» = la pagina dei supporti veri di cartelli.js)
  if (window.CLONE_SC) { if (PAG['creator/cartello']) PAG['creator/supporto'] = PAG['creator/cartello']; window.CLONE_SC.installa(API_V2); }
  render(); salvaStato();
  window.addEventListener('pagehide', salvaStato);
  if (!EMBED) { var vq = Q.get('vista'); if (vq) { ORIZ = Q.has('orizzontale'); setVista(vq === 'telefono' ? 'phone' : 'tablet'); } else setVista('desktop'); }
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function () { adatta(); banner(); });
})();
