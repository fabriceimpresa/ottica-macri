/* =====================================================================
   OTTICA MACRÌ · DEMO APP V2 · STILI GRAFICI DELLE STAMPE (5/11/2026)
   Tre famiglie di stile per tutto ciò che si stampa o va sullo schermo in vetrina
   (cartelli sui supporti veri, cubo, totem, prezzi da stanghetta, cartellini A4, etichette DYMO,
   stampe pronte, slide della vetrina digitale), ognuna in versione chiara e scura:
     1. BOTTEGA ROMANA   bottega · bottega-scuro   crema/avorio, Bodoni, filetti oro, rosso mattone
     2. NERO E ORO       bf (scuro) · bfc (chiaro)  = linguaggio delle grafiche media/blackfriday/* e vetrine/
     3. LUMINOSO MODERNO moderno · moderno-scuro    bianco e blu #1f4e79, sans geometrico, numeri grandi
   COME FUNZIONA
   - Solo CSS (stili.css): la classe «sg sg-<id>» su una grafica o su un suo antenato decide i colori, i caratteri
     e le cornici; vince la più vicina (variabili CSS ereditate). Le MISURE non cambiano mai (dispositivi.js).
   - <html> porta lo stile PREDEFINITO (IMPOSTAZIONI › STILE GRAFICHE, localStorage 'om-v2-stile-grafiche');
     <body> porta lo stile della PAGINA strumento aperta (scelta col selettore, localStorage 'om-v2-stile-pagine').
   - Agganci negli altri file (minimi): cartelli.js inserto() usa STILI.classe(d.stile) e i selettori Stile usano
     STILI.selettore(...); app.js aggiunge STILI.modelliSlide() ai modelli di slide e post.
     Nelle altre pagine strumento (cartellini, stanghetta, stampe pronte, set, DYMO) il selettore lo inserisce
     questo file osservando #main, come fa vivo.js; la riga in IMPOSTAZIONI la inserisce osservando #sysmenu.
   - window.STILI.applica(modello, dati, contenitore): disegna una grafica d'esempio in uno stile
     (usata da stili-anteprima.html). Modelli: 'inserto' | 'stanghetta' | 'slide' | 'cartellino' | 'dymo' | 'mini'.
   - Font: solo di sistema con ripieghi (Windows: Bodoni MT, Garamond, Gill Sans MT, Century Gothic, Bahnschrift,
     Segoe UI Light · Mac/iPad: Bodoni 72, Didot, Gill Sans, Futura, Avenir Next). Niente download.
   - DYMO LabelWriter stampa SOLO IN NERO: lì lo stile cambia solo i caratteri.
   ===================================================================== */
(function () {
  'use strict';
  var KEY = 'om-v2-stile-grafiche', KEYP = 'om-v2-stile-pagine', DEF = 'bottega';
  var H = document.documentElement;

  var FAMIGLIE = [
    { id: 'bottega', nome: 'Bottega romana', breve: 'Classico · tutti i giorni', chiaro: 'bottega', scuro: 'bottega-scuro', consigliato: 'bottega',
      descr: 'Crema e avorio, caratteri alti e sottili, filetti oro e rosso mattone: l\'ottica di tradizione.' },
    { id: 'oro', nome: 'Nero e oro', breve: 'Promo · Black Friday', chiaro: 'bfc', scuro: 'bf', consigliato: 'bf',
      descr: 'Lo stesso stile delle grafiche Black Friday: fondo nero caldo, oro, cornice doppia con gli angoli.' },
    { id: 'moderno', nome: 'Luminoso moderno', breve: 'Vista · lenti · controllo', chiaro: 'moderno', scuro: 'moderno-scuro', consigliato: 'moderno',
      descr: 'Bianco e blu, caratteri geometrici, numeri grandi: pulito e fresco, per vista e lenti.' }
  ];
  var ELENCO = {
    'bottega': { famiglia: 'bottega', variante: 'chiaro', nome: 'Bottega romana', schermo: true, inchiostro: 'poco',
      palette: { fondo: '#f8f0e1', testo: '#2a1f17', titolo: '#2a1f17', accento: '#b5462c', oro: '#a8803f', prezzo: '#1f1712' },
      font: { titolo: 'Bodoni MT · Bodoni 72 · Didot', testo: 'Garamond corsivo', numeri: 'Bodoni MT', etichette: 'Gill Sans MT' } },
    'bottega-scuro': { famiglia: 'bottega', variante: 'scuro', nome: 'Bottega romana scura', schermo: true, inchiostro: 'molto',
      palette: { fondo: '#3a1712', testo: '#f4e9d8', titolo: '#f7eddc', accento: '#d8ad6a', oro: '#c9a464', prezzo: '#fbf3e4' },
      font: { titolo: 'Bodoni MT · Bodoni 72 · Didot', testo: 'Garamond corsivo', numeri: 'Bodoni MT', etichette: 'Gill Sans MT' } },
    'bf': { famiglia: 'oro', variante: 'scuro', nome: 'Nero e oro', schermo: true, inchiostro: 'molto',
      palette: { fondo: '#1d1612', testo: '#efe6d8', titolo: '#f6efe4', accento: '#d4a373', oro: '#d6a66a', rosso: '#b5462c' },
      font: { titolo: 'Bodoni MT', testo: 'Garamond', numeri: 'Segoe UI Light (sconti) · Garamond (prezzi)', etichette: 'Gill Sans MT' } },
    'bfc': { famiglia: 'oro', variante: 'chiaro', nome: 'Nero e oro · chiaro', schermo: false, inchiostro: 'poco',
      palette: { fondo: '#f4ebdd', testo: '#3a2e26', titolo: '#1f4e79', accento: '#b5462c', oro: '#9c6e3e', rosso: '#b5462c' },
      font: { titolo: 'Bodoni MT', testo: 'Garamond', numeri: 'Segoe UI Light (sconti) · Garamond (prezzi)', etichette: 'Gill Sans MT' } },
    'moderno': { famiglia: 'moderno', variante: 'chiaro', nome: 'Luminoso moderno', schermo: true, inchiostro: 'poco',
      palette: { fondo: '#ffffff', testo: '#1d2733', titolo: '#1f4e79', accento: '#b5462c', blu: '#1f4e79', prezzo: '#1f4e79' },
      font: { titolo: 'Century Gothic · Futura · Avenir Next', testo: 'Century Gothic', numeri: 'Century Gothic grassetto', etichette: 'Bahnschrift · DIN' } },
    'moderno-scuro': { famiglia: 'moderno', variante: 'scuro', nome: 'Luminoso moderno · blu', schermo: true, inchiostro: 'molto',
      palette: { fondo: '#1f4e79', testo: '#f3f7fb', titolo: '#ffffff', accento: '#f08a6c', blu: '#0f2a44', prezzo: '#ffffff' },
      font: { titolo: 'Century Gothic · Futura · Avenir Next', testo: 'Century Gothic', numeri: 'Century Gothic grassetto', etichette: 'Bahnschrift · DIN' } }
  };
  var IDS = Object.keys(ELENCO);

  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function leggi(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
  function scrivi(k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  function valido(id) { return Object.prototype.hasOwnProperty.call(ELENCO, id) ? id : null; }
  function famiglia(fid) { for (var i = 0; i < FAMIGLIE.length; i++) if (FAMIGLIE[i].id === fid) return FAMIGLIE[i]; return FAMIGLIE[0]; }
  function famDi(id) { return famiglia((ELENCO[id] || ELENCO[DEF]).famiglia); }
  function varDi(id) { return (ELENCO[id] || ELENCO[DEF]).variante; }

  /* ---------- predefinito (IMPOSTAZIONI) e scelta della pagina ---------- */
  function predefinito() { return valido(leggi(KEY)) || DEF; }
  function pagine() { try { return JSON.parse(leggi(KEYP) || '{}') || {}; } catch (e) { return {}; } }
  function chiavePagina() { var p = (location.hash || '#creator').slice(1).split('/'); return p.slice(0, 3).join('/'); }
  function diPagina(k) { return valido(pagine()[k || chiavePagina()]); }
  function attuale() { return diPagina() || predefinito(); }
  /* 'chiaro' (vecchio valore di cartelli.js), vuoto o sconosciuto = stile della pagina o predefinito */
  function risolvi(id) { return valido(id) || attuale(); }
  function classe(id, d) { var o = d ? occhiale(d) : ''; return 'sg sg-' + risolvi(id) + (o ? ' sg-occ-' + o : ''); }
  /* forma dell'occhiale da disegnare in alto quando la grafica parla di un modello o di un brand (SVG in stili.css) */
  var CON_OCCHIALE = { outlet: 1, semplice: 1, ultimi: 1, paletto: 1, 'bf-singolo': 1, 'bf-focus': 1, 'bf-brand': 1 };
  function occhiale(d) {
    if (!d || !(CON_OCCHIALE[d.mod] || (d.mod === 'bf-cubo' && +d.faccia === 1))) return '';
    var t = [d.nome, d.desc, d.cod, d.variante].join(' ');
    if (/wayfarer|rb2140/i.test(t)) return 'wayfarer';
    if (/aviator|rb3025/i.test(t)) return 'aviator';
    if (/clubmaster|rb5154|rb3016/i.test(t)) return 'clubmaster';
    if (/holbrook|oo9102/i.test(t)) return 'holbrook';
    if (/\b649\b|po0649/i.test(t)) return 'persol649';
    var b = d.brand || '';
    if (!b || b === 'Ottica Macrì') return /occhial|montatur/i.test(t) ? 'tondo' : '';
    return { 'Ray-Ban': 'wayfarer', 'Persol': 'persol649', 'Oakley': 'holbrook' }[b] || 'tondo';
  }

  function metti(el, id) {
    if (!el) return;
    var prima = el.getAttribute('data-sg-cl');
    if (prima) el.classList.remove(prima);
    el.classList.add('sg', 'sg-' + id);
    el.setAttribute('data-sg-cl', 'sg-' + id);
  }
  function applicaPagina() { metti(H, predefinito()); if (document.body) metti(document.body, attuale()); }
  function impostaPredefinito(id) { if (!valido(id)) return; scrivi(KEY, id); applicaPagina(); ridisegna(); }
  function scegliPagina(id, k) {
    if (!valido(id)) return;
    var m = pagine(); m[k || chiavePagina()] = id; scrivi(KEYP, JSON.stringify(m)); applicaPagina();
  }
  function ridisegna() { try { if (window.demo2 && window.demo2.vai) window.demo2.vai((location.hash || '#creator').slice(1)); } catch (e) {} }

  /* ---------- icona del marchio: monocolo OM (media/logo/marchi6/04-monocolo, 6/11/2026; il nome della funzione resta draghetto) ---------- */
  function draghettoSVG(colore) {
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><g fill="' + (colore || '#C63D2F') + '" fill-rule="evenodd">' +
      '<path d="M96 49.44C95.69 24.46 74.61 3.8 49.64 4C24.65 4.2 3.92 25.18 4 50.16C4.09 75.45 25.49 96.41 50.76 95.99C75.74 95.58 96.3 74.41 96 49.44ZM86.8 50.52C86.58 71.14 71.83 92.91 49.48 92.55C27.18 92.18 12.98 70.07 13.2 49.48C13.42 28.86 28.17 7.09 50.52 7.45C72.82 7.82 87.02 29.93 86.8 50.52Z"/>' +
      '<path d="M43.01 30.01 50.46 53.15 57.98 30.01H73.72V31.95H68.59V68.03H73.72V70H53.56V68.03H58.81V34.09L47.27 70H45.87L34.15 33.65V63.94Q34.15 66.45 34.78 67.24Q35.4 68.03 38.24 68.03H39.64V70H26.28V68.03H28.72Q31.05 68.03 31.56 67.25Q32.06 66.48 32.06 64.12V31.95H26.28V30.01Z"/></g></svg>';
  }
  function draghetto(colore) { return 'data:image/svg+xml,' + encodeURIComponent(draghettoSVG(colore)); }

  /* ---------- grafiche d'esempio (stessa struttura di cartelli.js / app.js) ---------- */
  var MM = 96 / 25.4;
  function euro(v) { var x = +v; return '€ ' + (Math.round(x) === x ? String(x) : x.toFixed(2).replace('.', ',')); }
  function wmOM() { return '<span class="cv-wm cv-wm-om"><b>OTTICA MACRÌ</b><i>ROMA</i></span>'; }
  function miniHTML(id) {
    return '<div class="cv-ins cv-m-outlet cv-alto ' + classe(id, { mod: 'outlet', desc: 'Aviator', brand: 'Ray-Ban' }) + '" style="width:74mm;height:105mm"><div class="cv-cornice"></div>' +
      '<div class="cv-k"><span>Sole</span><span>2026</span></div><div class="cv-c"><div class="cv-desc">Aviator</div>' +
      '<div class="cv-bar"><s>€ 149</s><em>−25%</em></div><div class="cv-big cv-oro">€ 112</div></div>' +
      '<div class="cv-firma"><span class="cv-wm cv-wm-rb">Ray-Ban</span></div><div class="cv-f">Via Poggi D\'Oro 23 · Roma</div></div>';
  }
  function sup(id) { var D = window.DISPOSITIVI; return D && D.trova ? D.trova(id) : null; }
  function slideHTML(d) {
    var v = !!d.vert;
    return '<div class="sl-om' + (v ? ' v' : '') + ' ' + classe(d.stile) + '"><svg class="occhiali-dec" viewBox="0 0 24 24"><circle cx="6.5" cy="13.5" r="4"/><circle cx="17.5" cy="13.5" r="4"/><path d="M10.4 12.6c1-.9 2.2-.9 3.2 0M2.6 12.4 1.6 8.6M21.4 12.4l1-3.8"/></svg>' +
      '<div class="contenuto">' + (d.kicker ? '<div class="k">' + esc(d.kicker) + '</div>' : '') + '<h2' + (String(d.titolo || '').length > 18 ? ' class="lungo"' : '') + '>' + esc(d.titolo) + '</h2>' +
      (d.testo ? '<p>' + esc(d.testo) + '</p>' : '') + (d.prezzo ? '<div class="prz">' + esc(d.prezzo) + '</div>' : '') + '</div></div>';
  }
  function cartellinoHTML(d) {
    var sc = +d.sconto || 0, fin = sc ? Math.round(d.prezzo * (1 - sc / 100) * 100) / 100 : d.prezzo;
    return '<div class="cartellino">' + (d.evento ? '<span class="ev">' + esc(d.evento) + '</span>' : '') + (sc ? '<span class="sc">-' + sc + '%</span>' : '') +
      '<span class="bn">' + esc(d.marca) + '</span><span class="ds">' + esc(d.modello) + '</span>' + (sc ? '<span class="pp"><s>' + euro(d.prezzo) + '</s></span>' : '') + '<span class="pf">' + euro(fin) + '</span></div>';
  }
  function dymoHTML(d) {
    var sc = +d.sconto || 0, fin = Math.round(d.pieno * (1 - sc / 100) * 100) / 100;
    var bar = ''; String(d.ean || '8053672000000').replace(/\D/g, '').split('').forEach(function (c) { c = +c; bar += '<i style="width:' + (1 + c % 3) + 'px;margin-right:' + (1 + (c >> 1) % 3) + 'px"></i><i style="width:' + (1 + (c + 1) % 2) + 'px;margin-right:' + (2 + c % 2) + 'px"></i>'; });
    return '<div class="dy"><div class="sx"><small>CALIBRO</small><div class="box"><span class="on">' + esc(d.cal || 50) + '</span><span>' + esc(d.ponte || 22) + '</span></div><small>ASTA 140</small></div>' +
      '<div class="dx"><div class="riga1">' + euro(d.pieno) + '<b>-' + sc + '%</b></div><div class="finale">' + euro(fin) + '</div><div class="nome">' + esc(d.nome) + '</div>' +
      '<div style="display:grid;justify-items:end;gap:2px"><span class="bar">' + bar + '</span><span class="ean">' + esc(d.ean) + '</span></div></div></div>';
  }
  /* applica(modello, dati, contenitore) -> { html, w, h } (w,h in px CSS); se c'è il contenitore la disegna scalata dentro */
  function applica(modello, dati, contenitore) {
    dati = dati || {}; var html = '', w = 0, h = 0, C = window.CARTELLI_V2 && window.CARTELLI_V2._prova;
    if (modello === 'inserto') {
      var s = sup(dati.sup || 'plexi-a5');
      if (!s || !C) return { html: '', w: 0, h: 0 };
      html = C.inserto(Object.assign({}, dati, { stile: risolvi(dati.stile) }), s); w = s.stampa[0] * MM; h = s.stampa[1] * MM;
    } else if (modello === 'stanghetta') {
      var t = sup(dati.sup || 'stanga-cartellino');
      if (!t || !C) return { html: '', w: 0, h: 0 };
      var dim = t.id === 'stanga-bandierina' ? [t.stampa[0] + (t.coda || 0), t.stampa[1]] : t.stampa;
      html = '<div class="' + classe(dati.stile) + '" style="display:inline-block">' + C.stanga(t, dati.riga || {}, { sconto: dati.sconto || 0, evento: dati.evento || '' }) + '</div>'; w = dim[0] * MM; h = dim[1] * MM;
    } else if (modello === 'slide') { html = slideHTML(dati); w = dati.vert ? 540 : 960; h = dati.vert ? 960 : 540; }
    else if (modello === 'cartellino') { html = '<div class="' + classe(dati.stile) + '" style="width:297.5px;height:210.5px;display:grid">' + cartellinoHTML(dati) + '</div>'; w = 297.5; h = 210.5; }
    else if (modello === 'dymo') { html = '<div class="' + classe(dati.stile) + '">' + dymoHTML(dati) + '</div>'; w = 456; h = 256; }
    else { html = miniHTML(risolvi(dati.stile)); w = 74 * MM; h = 105 * MM; }
    if (contenitore) {
      contenitore.innerHTML = '<div class="sg-vista" style="aspect-ratio:' + w.toFixed(2) + '/' + h.toFixed(2) + '"><div class="sg-scala" data-w="' + w.toFixed(3) + '">' + html + '</div></div>';
      adatta(contenitore);
    }
    return { html: html, w: w, h: h };
  }
  function adatta(root) {
    Array.prototype.forEach.call((root || document).querySelectorAll('.sg-scala[data-w]'), function (el) {
      var p = el.parentElement, w = p && p.clientWidth; if (!w) return;
      el.style.transform = 'scale(' + (w / +el.dataset.w) + ')';
    });
  }

  /* ---------- selettore a miniature (3 famiglie · chiaro/scuro) ---------- */
  /* opz.setf = true -> pulsanti data-act="setf" data-f="stile" (cartelli.js: lo stile resta nei dati della grafica) */
  function attr(id, opz) {
    return (opz && opz.setf ? ' data-act="setf" data-f="' + (opz.campo || 'stile') + '" data-val="' + id + '" data-rr' : '') + ' data-sg="' + id + '"';
  }
  function selettore(sel, opz) {
    opz = opz || {};
    var cur = risolvi(sel), fCur = famDi(cur), vCur = varDi(cur);
    return '<div class="sg-sel" role="group" aria-label="Stile della grafica"><div class="sg-sel-t"><span>Stile della grafica</span><a class="sg-sel-l" href="v2/stili-anteprima.html" target="_blank" rel="noopener">vedi tutti ›</a></div><div class="sg-fam">' +
      FAMIGLIE.map(function (f) {
        var on = f.id === fCur.id, id = on ? cur : f.consigliato;   // cambiando famiglia si parte dalla versione consigliata
        return '<div class="sg-card' + (on ? ' on' : '') + '"><button type="button" class="sg-card-b" aria-pressed="' + on + '"' + attr(id, opz) + ' title="' + esc(f.descr) + '">' +
          '<span class="sg-mini"><span class="sg-mini-in">' + miniHTML(id) + '</span></span><b>' + esc(f.nome) + '</b><small>' + esc(f.breve) + '</small></button>' +
          '<div class="sg-var">' + ['chiaro', 'scuro'].map(function (v) { var vid = f[v], von = on && vCur === v; return '<button type="button" class="' + (von ? 'on' : '') + '" aria-pressed="' + von + '"' + attr(vid, opz) + '>' + (v === 'chiaro' ? '☀ Chiaro' : '☾ Scuro') + '</button>'; }).join('') + '</div></div>';
      }).join('') + '</div>' + (opz.nota ? '<p class="sg-nota">' + opz.nota + '</p>' : '') + '</div>';
  }
  function modelliSlide() {
    return [['sg sg-bottega', 'Bottega romana'], ['sg sg-bottega-scuro', 'Bottega scura'], ['sg sg-bf', 'Nero e oro'], ['sg sg-moderno', 'Moderno'], ['sg sg-moderno-scuro', 'Moderno blu']];
  }

  /* ---------- pagine strumento senza selettore proprio: lo inserisce questo file ---------- */
  function rotta() { var p = (location.hash || '#creator').slice(1).split('/'); return { modo: p[0], pagina: p[1] || '', v: p[2] || '' }; }
  function notaPagina(r) {
    if (r.pagina === 'dymo' || r.pagina === 'etichette') return 'La DYMO stampa <b>solo in nero</b>: lo stile cambia i caratteri, non i colori.';
    if (r.pagina === 'stanghetta') return 'Etichette piccole: lo stile cambia fondo, bordo e caratteri; le misure restano quelle vere.';
    return '';
  }
  function serveSelettore(r) {
    if (r.modo === 'creator' && /^(cartellini|stanghetta|stampa|dymo)$/.test(r.pagina)) return true;
    if (r.modo === 'creator' && r.pagina === 'set' && r.v && r.v !== 'set-bf') return true;
    if (r.modo === 'gestionale' && r.pagina === 'etichette') return true;
    return false;
  }
  function inserisci() {
    var main = document.getElementById('main'); if (!main) return;
    var r = rotta();
    if (!serveSelettore(r) || main.querySelector('.sg-sel')) return;
    var pan = main.querySelector('.pannello'); if (!pan) return;
    var box = document.createElement('div'); box.className = 'blocco sg-blocco';
    box.innerHTML = selettore(attuale(), { nota: notaPagina(r) });
    var h2 = pan.querySelector('h2');
    var dopo = h2 && h2.nextElementSibling && /^P$/.test(h2.nextElementSibling.tagName) ? h2.nextElementSibling : h2;
    if (dopo && dopo.nextSibling) pan.insertBefore(box, dopo.nextSibling); else pan.insertBefore(box, pan.firstChild);
  }
  function rinfresca(el) {
    var box = el.closest('.sg-blocco'); if (!box) return;
    box.innerHTML = selettore(attuale(), { nota: notaPagina(rotta()) });
  }

  /* ---------- IMPOSTAZIONI › STILE GRAFICHE ---------- */
  function rigaImpostazioni() {
    var sm = document.getElementById('sysmenu'); if (!sm || sm.hidden) return;
    var h4 = sm.querySelector('h4'); if (!h4 || !/impostazioni/i.test(h4.textContent)) return;
    var p = predefinito(), f = famDi(p), v = varDi(p);
    var html = '<b>STILE GRAFICHE</b><div class="scelte">' + FAMIGLIE.map(function (x) { var on = x.id === f.id; return '<button type="button" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-sg-def="' + x[v] + '"><i class="sg-campione sg sg-' + x[v] + '"></i>' + esc(x.nome.toUpperCase()) + '</button>'; }).join('') + '</div>' +
      '<div class="scelte">' + ['chiaro', 'scuro'].map(function (x) { var on = x === v; return '<button type="button" class="' + (on ? 'on' : '') + '" aria-pressed="' + on + '" data-sg-def="' + f[x] + '">' + (x === 'chiaro' ? '☀ FONDO CHIARO' : '☾ FONDO SCURO') + '</button>'; }).join('') + '</div>' +
      '<p class="sg-info">Stile di partenza di cartelli, cartellini, stampe e slide. In ogni pagina si può cambiare.</p>';
    var r = sm.querySelector('.sg-riga');
    if (r) { r.innerHTML = html; return; }
    r = document.createElement('div'); r.className = 'riga sg-riga'; r.innerHTML = html;
    var ind = sm.querySelector('.indietro'); if (ind) sm.insertBefore(r, ind); else sm.appendChild(r);
  }

  /* ---------- clic ---------- */
  document.addEventListener('click', function (ev) {
    var t = ev.target && ev.target.closest;
    if (!t) return;
    var d = ev.target.closest('[data-sg-def]');
    if (d) { ev.preventDefault(); ev.stopPropagation(); impostaPredefinito(d.getAttribute('data-sg-def')); rigaImpostazioni(); return; }
    var b = ev.target.closest('.sg-sel [data-sg]');
    if (!b) return;
    var id = b.getAttribute('data-sg');
    scegliPagina(id);
    // con data-act="setf" ci pensa app.js a ridisegnare; altrimenti si rinfresca solo il selettore (il resto è CSS)
    if (!b.hasAttribute('data-act')) { ev.preventDefault(); rinfresca(b); }
  }, true);

  /* ---------- avvio ---------- */
  function avvio() {
    applicaPagina();
    var main = document.getElementById('main');
    if (main) new MutationObserver(function () { applicaPagina(); inserisci(); }).observe(main, { childList: true });
    var sm = document.getElementById('sysmenu');
    if (sm) new MutationObserver(rigaImpostazioni).observe(sm, { childList: true, attributes: true, attributeFilter: ['hidden'] });
    window.addEventListener('hashchange', applicaPagina);
    window.addEventListener('beforeprint', applicaPagina);
    window.addEventListener('resize', function () { adatta(); });
    inserisci(); adatta();
  }
  metti(H, predefinito());
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', avvio); else avvio();

  window.STILI = {
    famiglie: FAMIGLIE, elenco: ELENCO, ids: IDS,
    predefinito: predefinito, impostaPredefinito: impostaPredefinito,
    attuale: attuale, scegliPagina: scegliPagina, risolvi: risolvi, classe: classe, occhiale: occhiale,
    famiglia: famDi, variante: varDi,
    selettore: selettore, modelliSlide: modelliSlide,
    applica: applica, adatta: adatta, draghetto: draghetto
  };
})();
