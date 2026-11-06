/* =====================================================================
   OTTICA MACRÌ · DEMO APP V2 · «APP VIVA» (5/11/2026)
   Lo spirito dell'app CASA (interfaccia che respira, luci che corrono sui bordi, titoli CRT, ritmi mai uguali)
   portato sulla carta chiara e calda del negozio: high-tech gentile che accoglie e accompagna.
   - accoglienza in cima alle dashboard: «Buongiorno, Aldo» + stato vero del negozio (orari, vetrina, DYMO, magazzino, lista)
     + un consiglio gentile che cambia secondo la modalità; il draghetto respira e gli brillano gli occhiali
   - cambio pagina/modalità: linea di scansione, sezioni e schede che entrano morbide, numeri che scorrono
   - vita di fondo (solo «piene»): una scia di luce sul bordo di un pannello, angoli HUD che si accendono,
     un titolo che sfarfalla come un tubo catodico, un'onda di luce sugli angoli delle schede. Tempi casuali.
   - conferme calde: ✓ che si disegna, «passo dopo» suggerito, barra di lavoro viva
   - IMPOSTAZIONI › ANIMAZIONI: piene / leggere / spente (localStorage 'om-v2-animazioni').
     Senza scelta: «spente» con riduci-movimento, «leggere» se il dispositivo è lento (pochi core/memoria,
     prova di calcolo o meno di 40 fps nei primi 2 s), altrimenti «piene».
   PRESTAZIONI: solo transform/opacity, niente canvas, niente filter/blur animati, nessun ciclo rAF fisso;
   tutto fermo con la scheda nascosta, con una finestra aperta o mentre si scorre.
   Non tocca la logica di app.js: osserva #main, #sysmenu e #velo e usa window.demo2.stato() in sola lettura.
   ===================================================================== */
(function () {
  'use strict';
  var H = document.documentElement, KEY = 'om-v2-animazioni', LIVELLI = ['piene', 'leggere', 'spente'];
  var RIDOTTO = !!(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
  var PB = H.classList.contains('pianob');
  var DRAGO = '../media/logo/marchi6/04-monocolo/04-monocolo-icona-colori.svg';
  function $(s, el) { return (el || document).querySelector(s); }
  function $$(s, el) { return Array.prototype.slice.call((el || document).querySelectorAll(s)); }
  function caso(a, b) { return a + Math.random() * (b - a); }
  function scegli(a) { return a[Math.floor(Math.random() * a.length)]; }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function stato() { try { return window.demo2 && window.demo2.stato(); } catch (e) { return null; } }

  /* ---------- livello delle animazioni ---------- */
  function letto() { try { var v = localStorage.getItem(KEY); return LIVELLI.indexOf(v) >= 0 ? v : null; } catch (e) { return null; } }
  var scelto = letto(), misura = { auto: !scelto, motivo: '' };
  function stimaHW() {
    var hc = navigator.hardwareConcurrency || 8, mem = navigator.deviceMemory;   // deviceMemory non c'è su Safari/iPad: non penalizza
    if (hc <= 4 || (mem && mem <= 4)) { misura.motivo = 'dispositivo semplice (' + hc + ' core' + (mem ? ' · ' + mem + ' GB' : '') + ')'; return 'leggere'; }
    // piccola prova di calcolo (~1 ms su un PC normale, molto di più su un tablet economico)
    // (il migliore di due giri; ~1 ms sul NUC di Fabrice, oltre 2,5 ms = macchina ~3-4 volte più lenta)
    var x = 0, best = 1e9;
    for (var g = 0; g < 2; g++) { var t0 = performance.now(); for (var i = 0; i < 300000; i++) x += Math.sqrt(i); best = Math.min(best, performance.now() - t0); }
    misura.prova = +best.toFixed(1); window.__vivoX = x;
    if (misura.prova > 2.5) { misura.motivo = 'dispositivo lento (prova di calcolo ' + misura.prova + ' ms)'; return 'leggere'; }
    return 'piene';
  }
  var livello = scelto || (RIDOTTO ? 'spente' : stimaHW());
  if (!scelto && RIDOTTO) misura.motivo = 'riduci movimento attivo nel sistema';
  H.dataset.anim = livello;
  function pieno() { return livello === 'piene'; }
  function vivo() { return livello !== 'spente'; }
  function imposta(v, salva) {
    if (LIVELLI.indexOf(v) < 0) return;
    livello = v; H.dataset.anim = v;
    if (salva) { scelto = v; misura.auto = false; try { localStorage.setItem(KEY, v); } catch (e) {} }
    var f = document.getElementById('devframe');
    if (f && f.contentWindow) try { f.contentWindow.postMessage({ type: 'vivo-livello', v: v }, '*'); } catch (e) {}
    rigaImpostazioni();
  }
  addEventListener('message', function (e) { var m = e.data || {}; if (m.type === 'vivo-livello') imposta(m.v, false); if (m.type === 'vivo-tema') impostaTema(m.v, false); });

  /* ---------- tema CHIARO (predefinito) / SCURO caldo: html[data-tema], ricordato in 'om-v2-tema' ---------- */
  var KEYT = 'om-v2-tema';
  function tema() { return H.dataset.tema === 'scuro' ? 'scuro' : 'chiaro'; }
  function impostaTema(v, salva) {
    if (v !== 'scuro' && v !== 'chiaro') return;
    var prima = tema(); H.dataset.tema = v;
    if (salva) try { localStorage.setItem(KEYT, v); } catch (e) {}
    var f = document.getElementById('devframe');
    if (f && f.contentWindow) try { f.contentWindow.postMessage({ type: 'vivo-tema', v: v }, '*'); } catch (e) {}
    if (salva && window.parent !== window) try { parent.postMessage({ type: 'vivo-tema', v: v }, '*'); } catch (e) {}
    $$('.tema-btn').forEach(aggiornaTemaBtn);
    rigaImpostazioni();
    if (prima !== v && vivo()) scansione();
  }
  function aggiornaTemaBtn(b) {
    var s = tema() === 'scuro';
    b.setAttribute('aria-pressed', String(s));
    b.setAttribute('aria-label', s ? 'Tema scuro attivo: passa al chiaro' : 'Tema chiaro attivo: passa allo scuro');
    b.title = s ? 'Tema: SCURO (tocca per il chiaro)' : 'Tema: CHIARO (tocca per lo scuro)';
  }
  var SOLE_LUNA = '<svg class="sole" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="4.2"/><path d="M12 2.5v2.2M12 19.3v2.2M2.5 12h2.2M19.3 12h2.2M5.3 5.3l1.6 1.6M17.1 17.1l1.6 1.6M5.3 18.7l1.6-1.6M17.1 6.9l1.6-1.6"/></svg>' +
    '<svg class="luna" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 14.6A8.2 8.2 0 0 1 9.4 4a8.2 8.2 0 1 0 10.6 10.6z"/><path d="M16.5 3.5v2.4M15.3 4.7h2.4" stroke-width="1.4"/></svg>';
  addEventListener('storage', function (e) {
    if (e.key === KEYT && e.newValue) impostaTema(e.newValue, false);
    if (e.key === KEY && e.newValue) imposta(e.newValue, false);
  });

  // fps nei primi 2 s (solo se nessuno ha scelto): sotto i 40 fps si passa a «leggere»
  function misuraFps() {
    if (scelto || RIDOTTO || livello !== 'piene') return;
    var n = 0, t0 = 0;
    function f(t) {
      if (!t0) t0 = t;
      n++;
      if (t - t0 < 2000) requestAnimationFrame(f);
      else {
        misura.fps = Math.round(n * 1000 / (t - t0));
        if (misura.fps < 40 && !document.hidden && !scelto) { misura.motivo = misura.fps + ' fps all\'avvio'; imposta('leggere', false); }
      }
    }
    setTimeout(function () { if (!document.hidden) requestAnimationFrame(f); }, 300);
  }

  /* ---------- pausa: scheda nascosta, finestra aperta, scorrimento ---------- */
  function pausa() { H.classList.toggle('vivo-pausa', document.hidden); }
  document.addEventListener('visibilitychange', pausa);
  var scorre = 0, tScorre;
  addEventListener('scroll', function () { scorre = 1; clearTimeout(tScorre); tScorre = setTimeout(function () { scorre = 0; }, 250); }, { passive: true });
  function libero() {
    if (!pieno() || document.hidden || scorre) return false;
    var app = document.getElementById('app'); if (!app || !app.offsetParent) return false;   // nella barra demo con tablet/telefono lavora l'iframe
    var v = document.getElementById('velo'), sm = document.getElementById('sysmenu');
    return !(v && !v.hidden) && !(sm && !sm.hidden) && !document.body.classList.contains('menu-aperto');
  }
  function inVista(e) { var r = e.getBoundingClientRect(); return r.width > 0 && r.bottom > 60 && r.top < innerHeight - 20 && r.right > 0 && r.left < innerWidth; }

  /* ---------- accoglienza ---------- */
  var GIORNI = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
  var MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
  // orari di esempio, gli stessi di dati.js (NEGOZIO.orari): lun solo pomeriggio, mar-sab 9:30-13 e 16-19:30, dom chiuso
  function fasce(g) { return g === 0 ? [] : g === 1 ? [[960, 1170]] : [[570, 780], [960, 1170]]; }
  function hm(m) { return Math.floor(m / 60) + ':' + ('0' + m % 60).slice(-2); }
  function negozioOra(d) {
    var g = d.getDay(), m = d.getHours() * 60 + d.getMinutes(), F = fasce(g);
    for (var i = 0; i < F.length; i++) {
      if (m >= F[i][0] && m < F[i][1]) return { aperto: true, t: 'Negozio aperto · chiude alle ' + hm(F[i][1]) };
      if (m < F[i][0]) return { aperto: false, t: (i ? 'Pausa pranzo · riapre alle ' : 'Si apre alle ') + hm(F[i][0]) };
    }
    for (var k = 1; k < 8; k++) { var g2 = (g + k) % 7, F2 = fasce(g2); if (F2.length) return { aperto: false, t: 'Negozio chiuso · riapre ' + (k === 1 ? 'domani' : GIORNI[g2]) + ' alle ' + hm(F2[0][0]) }; }
    return { aperto: false, t: 'Negozio chiuso' };
  }
  function saluto(d) { var h = d.getHours(); return h < 5 ? 'Buonasera' : h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera'; }
  var CONSIGLI = {
    creator: ['Tocca un riquadro: scrivi il testo e l\'anteprima si aggiorna da sola.', 'Con «＋ Aggiungi a lista stampa» prepari più fogli e li stampi tutti insieme.', 'La vetrina digitale gira da sola: scegli le slide e il tablet le manda in onda.', 'Le promo stagionali sono già pronte: basta cambiare il prezzo.'],
    cassiere: ['Calcola Sconto: scrivi il prezzo pieno e tocca 20%. Al resto pensa l\'app.', 'Il QR della pagina Facebook si stampa e si lascia sul banco.', 'La bacheca è il foglietto per chi è al banco: si legge appena si apre.'],
    gestionale: ['Col lettore di codici basta un «bip» per caricare un paio.', 'Gli articoli in rosso sono da riordinare: l\'app se lo ricorda per te.', 'Le etichette DYMO escono già col prezzo giusto dal magazzino.'],
    amministrazione: ['Per un cliente nuovo bastano nome e telefono.', 'Il consenso alle novità serve per la newsletter: l\'app lo tiene in ordine.', 'Il profilo «Collaboratrice» vede solo le parti del banco.'],
    promoter: ['Scegli un modello, scrivi due righe: l\'app pubblica su Instagram e Facebook.', 'Un post si può programmare: esce da solo, anche a negozio chiuso.', 'La newsletter parte solo a chi ha dato il consenso.']
  };
  var salutato = false;
  try { salutato = sessionStorage.getItem('om-v2-salutato') === '1'; } catch (e) {}
  function modo() { var h = (location.hash || '#creator').slice(1).split('/')[0]; return CONSIGLI[h] ? h : 'creator'; }
  function benvenutoHTML() {
    var S = stato(), d = new Date(), u = S ? S.utenti[S.sistema.utente] : null, nome = u && S.sistema.utente === 0 ? u.nome.split(' ')[0] : '';
    var ng = negozioOra(d), V = S && S.vetrina, it = [];
    if (V) it.push('<a class="vb-st ' + (V.inOnda ? 'onda' : 'spento') + '" href="#creator/vetrina-playlist"><i class="pall"></i><b>Vetrina</b><span>' + (V.inOnda ? 'in onda · ' + V.playlist.length + ' slide' : 'spenta') + '</span></a>');
    it.push('<span class="vb-st ok"><i class="pall"></i><b>Stampante</b><span>pronta · A4</span></span>');
    if (!PB) it.push('<span class="vb-st ok"><i class="pall"></i><b>DYMO 450</b><span>pronta</span></span>');
    if (S && !PB) {
      var ss = S.art.filter(function (a) { return a.giac <= a.min && a.cat !== 'lenti'; }).length;
      it.push('<a class="vb-st ' + (ss ? 'warn' : 'ok') + '" href="#gestionale/magazzino/scorta"><i class="pall"></i><b>Magazzino</b><span>' + (ss ? ss + ' da riordinare' : 'tutto in ordine') + '</span></a>');
    }
    if (S && S.lista.length) it.push('<a class="vb-st info" href="#creator/lista"><i class="pall"></i><b>Lista stampa</b><span>' + S.lista.length + (S.lista.length === 1 ? ' foglio' : ' fogli') + ' pronti</span></a>');
    var cons = CONSIGLI[modo()];
    return '<section class="vivo-benvenuto glass" aria-label="Benvenuto">' +
      '<div class="vb-drago" aria-hidden="true"><i class="alone"></i><span class="lente"><img src="' + DRAGO + '" alt=""></span></div>' +
      '<div class="vb-testo"><b class="vb-saluto" data-testo="' + esc(saluto(d) + (nome ? ', ' + nome : '') + '.') + '">' + esc(saluto(d) + (nome ? ', ' + nome : '') + '.') + '</b>' +
      '<span class="vb-sotto"><span class="vb-data">' + GIORNI[d.getDay()] + ' ' + d.getDate() + ' ' + MESI[d.getMonth()] + '</span><span class="vb-neg ' + (ng.aperto ? 'aperto' : '') + '">' + esc(ng.t) + '</span></span>' +
      '<span class="vb-cons"><em>Lo sai che…</em> <span class="vb-ct">' + esc(cons[Math.floor(Math.random() * cons.length)]) + '</span></span></div>' +
      '<div class="vb-stato" role="list">' + it.map(function (x) { return x.replace(/^<(a|span) /, '<$1 role="listitem" '); }).join('') + '</div></section>';
  }
  function scriviSaluto(b) {
    var t = b.getAttribute('data-testo') || b.textContent, k = 0;
    b.textContent = ''; b.classList.add('scrive');
    (function passo() { k++; b.textContent = t.slice(0, k); if (k < t.length) setTimeout(passo, 38); else b.classList.remove('scrive'); })();
  }
  var tCons;
  function giraConsigli() {
    clearTimeout(tCons);
    tCons = setTimeout(function () {
      var c = $('.vivo-benvenuto .vb-ct');
      if (c && !document.hidden) {
        var L = CONSIGLI[modo()], v = c.textContent, n = v, g = 0;
        while (n === v && g++ < 6) n = scegli(L);
        if (vivo()) { c.classList.add('via'); setTimeout(function () { c.textContent = n; c.classList.remove('via'); }, 320); } else c.textContent = n;
      }
      giraConsigli();
    }, caso(11000, 16000));
  }

  /* ---------- numeri che scorrono ---------- */
  function formatta(v, euro) { var s = String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.'); return euro ? '€ ' + s : s; }
  function contaNumeri(root) {
    var E = $$('.thumb.widget > div > div:nth-child(2), .kpi b', root).filter(inVista), lav = [];
    E.forEach(function (e) {
      if (e.children.length) return;
      var m = /^(€\s?)?(\d{1,3}(?:\.\d{3})*|\d+)$/.exec(e.textContent.trim()); if (!m) return;
      var fine = parseInt(m[2].replace(/\./g, ''), 10); if (!(fine >= 3)) return;
      lav.push({ e: e, fine: fine, euro: !!m[1], testo: e.textContent });
      e.style.minWidth = e.offsetWidth + 'px';   // niente salti di impaginazione mentre scorre
    });
    if (!lav.length) return;
    var t0 = 0, dur = pieno() ? 900 : 600;
    (function f(t) {
      if (!t0) t0 = t;
      var p = Math.min(1, (t - t0) / dur), k = 1 - Math.pow(1 - p, 3);
      lav.forEach(function (x) { if (!x.e.isConnected) return; x.e.textContent = p >= 1 ? x.testo : formatta(x.fine * k, x.euro); });
      if (p < 1) requestAnimationFrame(f);
    })(performance.now());
  }

  /* ---------- entrata morbida a ogni pagina nuova ---------- */
  var ultimaPagina = null, ultimoModo = null;
  function scansione() {
    var sw = $('.hud-sweep'); if (!sw || !vivo()) return;
    sw.classList.remove('go'); void sw.offsetWidth; sw.classList.add('go');
  }
  function entrata(main) {
    if (!vivo()) return;
    if (!pieno()) { main.classList.remove('vivo-in1'); void main.offsetWidth; main.classList.add('vivo-in1'); setTimeout(function () { main.classList.remove('vivo-in1'); }, 400); return; }
    var i = 0;
    Array.prototype.forEach.call(main.children, function (c) {
      if (c.classList.contains('testata') || c.classList.contains('mobile-footer') || !inVista(c)) return;
      if (c.classList.contains('section')) {
        var tit = $('.section-title', c); if (tit) { tit.style.setProperty('--i', i++); tit.classList.add('vivo-in'); }
        $$('.scheda, .widget, .in-onda', c).filter(inVista).slice(0, 8).forEach(function (s, j) { s.style.setProperty('--i', i + j * 0.6); s.classList.add('vivo-in'); });
        i += 1;
      } else { c.style.setProperty('--i', i++); c.classList.add('vivo-in'); }
    });
    setTimeout(function () { $$('.vivo-in', main).forEach(function (e) { e.classList.remove('vivo-in'); }); }, 1800);
  }
  function dopoRender() {
    var main = document.getElementById('main'); if (!main) return;
    var oro = $('.testata .orologio', main);
    if (oro && !$('.tema-btn', main)) {
      oro.insertAdjacentHTML('afterend', '<button class="tema-btn" type="button" data-vivo-tema="cambia">' + SOLE_LUNA + '</button>');
      aggiornaTemaBtn($('.tema-btn', main));
    }
    var hero = $('.store-hero', main);
    if (hero && !$('.vivo-benvenuto', main)) {
      hero.insertAdjacentHTML('afterend', benvenutoHTML());
      var b = $('.vivo-benvenuto .vb-saluto', main);
      if (!salutato && vivo() && b) { salutato = true; try { sessionStorage.setItem('om-v2-salutato', '1'); } catch (e) {} scriviSaluto(b); }
    }
    // schermi digitali: velo CRT con ritmo proprio per ognuno
    $$('.thumb.slide, .in-onda .mini, .cornice-tablet .foglio', main).forEach(function (t) {
      if (t.classList.contains('crt')) return; t.classList.add('crt'); t.style.setProperty('--cd', (-caso(0, 9)).toFixed(1) + 's'); t.style.setProperty('--cp', caso(7, 12).toFixed(1) + 's');
    });
    var pag = location.hash || '#creator', m = modo();
    if (pag !== ultimaPagina) {
      var cambioModo = ultimoModo !== null && m !== ultimoModo;
      ultimaPagina = pag; ultimoModo = m;
      if (vivo()) {
        scansione(); entrata(main);
        setTimeout(function () { contaNumeri(main); }, pieno() ? 160 : 0);
        if (cambioModo) { var ab = $('.mode-btn.active', main); if (ab) { ab.classList.add('acceso'); setTimeout(function () { ab.classList.remove('acceso'); }, 900); } }
      }
    }
  }

  /* ---------- conferme calde ---------- */
  var DOPO = [
    [/stampat/i, 'Lo ritrovi in «Cronologia di Stampa», pronto da ristampare con un tocco.'],
    [/pubblicat/i, 'Fra qualche ora guarda come va nel Calendario del Promoter.'],
    [/programmat/i, 'Esce da solo all\'ora giusta: puoi chiudere l\'app tranquillo.'],
    [/newsletter/i, 'Le aperture arrivano da sole in «Storico invii».'],
    [/vetrina|in onda/i, 'Il tablet in vetrina lo mostra già: puoi guardarlo dal marciapiede.'],
    [/vendita/i, 'Il magazzino si è aggiornato da solo: un pezzo in meno.'],
    [/inventario/i, 'Le differenze sono salvate: il magazzino adesso è giusto.'],
    [/proposte|grafica/i, 'Scegline una: si può sempre cambiare il testo dopo.']
  ];
  function velo() {
    var e = $('#velo .esito'); if (!e || $('.vivo-dopo', e)) return;
    var t = ($('b', e) || {}).textContent || '', s = 'Tutto salvato: puoi continuare da dove eri.';
    for (var i = 0; i < DOPO.length; i++) if (DOPO[i][0].test(t)) { s = DOPO[i][1]; break; }
    var p = document.createElement('p'); p.className = 'vivo-dopo'; p.innerHTML = '<span>Passo dopo</span>' + esc(s);
    var btn = $('.btn', e); if (btn) e.insertBefore(p, btn); else e.appendChild(p);
  }

  /* ---------- IMPOSTAZIONI › ANIMAZIONI ---------- */
  function rigaImpostazioni() {
    var sm = document.getElementById('sysmenu'); if (!sm || sm.hidden) return;
    var h4 = $('h4', sm); if (!h4 || !/impostazioni/i.test(h4.textContent)) return;
    // riga TEMA di app.js: CHIARO / SCURO diventano veri
    $$('.riga', sm).forEach(function (rg) {
      var b = $('b', rg); if (!b || b.textContent.trim().toUpperCase() !== 'TEMA') return;
      var sc = $('.scelte', rg); if (!sc) return;
      sc.innerHTML = ['chiaro', 'scuro'].map(function (v) { return '<button type="button" data-vivo-tema="' + v + '" class="' + (tema() === v ? 'on' : '') + '" aria-pressed="' + (tema() === v) + '">' + (v === 'chiaro' ? '☀ CHIARO' : '☾ SCURO') + '</button>'; }).join('');
    });
    var r = $('.vivo-riga', sm);
    var info = misura.auto ? 'Scelta in automatico' + (misura.motivo ? ': ' + esc(misura.motivo) : misura.fps ? ' (' + misura.fps + ' fps)' : '') + '.' : 'Scelta da te. «Leggere» va bene sui tablet più semplici.';
    var html = '<b>ANIMAZIONI</b><div class="scelte">' + LIVELLI.map(function (v) { return '<button type="button" data-vivo="' + v + '" class="' + (v === livello ? 'on' : '') + '" aria-pressed="' + (v === livello) + '">' + v.toUpperCase() + '</button>'; }).join('') + '</div><p class="vivo-info">' + info + '</p>';
    if (r) { r.innerHTML = html; return; }
    r = document.createElement('div'); r.className = 'riga vivo-riga'; r.innerHTML = html;
    var prima = $('.riga', sm); if (prima && prima.nextSibling) sm.insertBefore(r, prima.nextSibling); else sm.insertBefore(r, $('.indietro', sm));
  }
  document.addEventListener('click', function (ev) {
    var t = ev.target.closest && ev.target.closest('[data-vivo-tema]');
    if (t) { ev.preventDefault(); var v = t.dataset.vivoTema; impostaTema(v === 'cambia' ? (tema() === 'scuro' ? 'chiaro' : 'scuro') : v, true); return; }
    var b = ev.target.closest && ev.target.closest('[data-vivo]'); if (!b) return;
    ev.preventDefault(); imposta(b.dataset.vivo, true);
  });

  /* ---------- vita di fondo (solo «piene»): eventi brevi a tempi casuali ---------- */
  function pannelli() { return $$('#main .glass').filter(function (p) { var r = p.getBoundingClientRect(); return r.width > 140 && r.height > 70 && inVista(p); }); }
  function sovrapponi(p, cls) {
    var r = p.getBoundingClientRect(), g = document.createElement('div');
    g.className = 'vivo-fx ' + cls; g.setAttribute('aria-hidden', 'true');
    g.style.cssText = 'left:' + r.left + 'px;top:' + r.top + 'px;width:' + r.width + 'px;height:' + r.height + 'px';
    document.body.appendChild(g); return g;
  }
  var COL = ['#1f4e79', '#2c6aa0', '#b5462c', '#c39a4e'];
  function scia() {   // una luce corre lungo il bordo alto o basso di un pannello
    var P = pannelli(); if (!P.length) return;
    var p = scegli(P), g = sovrapponi(p, 'scia'), s = document.createElement('i'), giu = Math.random() < .35, dx = Math.random() < .5;
    g.style.setProperty('--c', scegli(COL)); s.style[giu ? 'bottom' : 'top'] = '0';
    g.appendChild(s);
    var w = g.offsetWidth, a = dx ? -90 : w, b = dx ? w : -90;
    s.animate([{ transform: 'translateX(' + a + 'px)', opacity: 0 }, { opacity: 1, offset: .15 }, { opacity: 1, offset: .82 }, { transform: 'translateX(' + b + 'px)', opacity: 0 }],
      { duration: caso(900, 1400), easing: 'cubic-bezier(.5,0,.3,1)' }).onfinish = function () { g.remove(); };
  }
  function angoli() {   // due angoli da HUD che si accendono e sfarfallano
    var P = pannelli(); if (!P.length) return;
    var g = sovrapponi(scegli(P), 'angoli'); g.style.setProperty('--c', scegli(COL));
    ['tl', 'tr', 'bl', 'br'].sort(function () { return Math.random() - .5; }).slice(0, Math.random() < .5 ? 1 : 2).forEach(function (a, i) {
      var c = document.createElement('i'); c.className = a; c.style.animationDelay = (i * 130) + 'ms'; g.appendChild(c);
    });
    setTimeout(function () { g.remove(); }, 900);
  }
  function crt() {   // un titolo sfarfalla come su un tubo catodico
    var T = $$('#main .section-title, #main .pag-testa h1, #main .vb-saluto, #main .modo-chip .v, #main .kpi b').filter(inVista); if (!T.length) return;
    var e = scegli(T); e.classList.remove('vivo-crt'); void e.offsetWidth; e.classList.add('vivo-crt'); setTimeout(function () { e.classList.remove('vivo-crt'); }, 650);
  }
  function onda() {   // onda di luce sugli angoli delle schede, partendo dal draghetto (o dall'alto a sinistra)
    var P = $$('#main .scheda, #main .widget, #main .kpi>div').filter(inVista); if (P.length < 2) return;
    var o = $('#main .vb-drago') || $('#main .store-hero'), r0 = o ? o.getBoundingClientRect() : { left: 0, top: 0, width: 0, height: 0 };
    var x0 = r0.left + r0.width / 2, y0 = r0.top + r0.height / 2;
    P.map(function (p) { var r = p.getBoundingClientRect(); return [p, Math.hypot(r.left + r.width / 2 - x0, r.top + r.height / 2 - y0)]; })
      .forEach(function (x) { setTimeout(function () { var p = x[0]; if (!p.isConnected) return; p.classList.remove('vivo-onda'); void p.offsetWidth; p.classList.add('vivo-onda'); setTimeout(function () { p.classList.remove('vivo-onda'); }, 1300); }, x[1] * .45); });
  }
  function ciclo(fn, a, b) { (function g() { setTimeout(function () { try { if (libero()) fn(); } catch (e) {} g(); }, caso(a, b)); })(); }

  /* ---------- avvio ---------- */
  function parti() {
    var main = document.getElementById('main');
    if (main) { new MutationObserver(dopoRender).observe(main, { childList: true }); dopoRender(); }
    var sm = document.getElementById('sysmenu'); if (sm) new MutationObserver(rigaImpostazioni).observe(sm, { childList: true, attributes: true, attributeFilter: ['hidden'] });
    var v = document.getElementById('velo'); if (v) new MutationObserver(velo).observe(v, { childList: true, subtree: true });
    pausa(); misuraFps(); giraConsigli();
    ciclo(scia, 3200, 7600);
    ciclo(angoli, 4200, 9000);
    ciclo(crt, 3800, 8200);
    ciclo(onda, 15000, 24000);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', parti); else parti();
  window.vivo = { livello: function () { return livello; }, imposta: imposta, misura: misura, scia: scia, angoli: angoli, crt: crt, onda: onda };
})();
