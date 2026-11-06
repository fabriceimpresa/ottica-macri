/* =====================================================================
   OTTICA MACRÌ · DEMO APP V2 · CARTELLI SUI SUPPORTI VERI (5/11/2026)
   - Crea cartelli: si sceglie il SUPPORTO (plexiglass, cornicetta, cubo, totem, cartello appeso, vetrofania),
     si scrive, si vede l'inserto in scala (rapporto esatto) e il foglio A4 con le linee di taglio, si stampa.
   - Allestimento vetrine · Black Friday: ripiano per ripiano, con «Stampa tutto il ripiano».
   - Prezzi da stanghetta: bandierina, cartellino con filo, clip (anche DYMO per la bandierina).
   MISURE: solo da ../dispositivi.js (window.DISPOSITIVI). Qui non si ripete nessuna misura dei supporti.
   Si aggancia ad app.js con window.CARTELLI_V2.installa(api) / .sezioni() / .gruppi().
   Brand: scritte in stile, non loghi ufficiali. Prezzi: ESEMPI da confermare con Aldo.
   ===================================================================== */
(function () {
  'use strict';
  var DISP = window.DISPOSITIVI || { supporti: [], allestimento: {}, trova: function () { return null; } };
  var MM = 96 / 25.4;            // px CSS per mm
  var FOGLI = { A4: { w: 210, h: 297, nome: 'A4' }, A3: { w: 297, h: 420, nome: 'A3' } };
  var MARG = { x: 5, top: 5, bottom: 14 };   // margini del foglio (mm): in basso c'è la riga con il righello
  var STAMPABILI = ['plexiL', 'plexiT', 'cornice', 'cubo', 'totem', 'appeso', 'vetrofania'];
  var API = null;

  function sup(id) { return DISP.trova(id); }
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function n(v) { var x = parseFloat(String(v == null ? '' : v).replace(',', '.')); return isNaN(x) ? 0 : x; }
  function euro(v) { v = n(v); var s = (Math.round(v) === v ? String(v) : v.toFixed(2).replace('.', ',')); return '€ ' + s.replace(/\B(?=(\d{3})+(?!\d))/g, '.'); }
  function scontato(p, sc) { return Math.round(n(p) * (1 - n(sc) / 100)); }
  /* prezzi d'esempio: UNICA fonte in dati.js (DATI.PREZZI_ESEMPIO) · esempi da confermare con Aldo */
  var PE = (window.DATI && window.DATI.PREZZI_ESEMPIO) || {};
  function prezzoBF(cod, pieno, sc) { var e = PE[cod]; return e && n(pieno) === e.pieno && n(sc) === e.sconto ? e.bf : scontato(pieno, sc); }
  function misura(s) { return s.stampa ? s.stampa[0] + ' × ' + s.stampa[1] + ' mm' : (s.schermo ? s.schermo[0] + ' × ' + s.schermo[1] + ' mm (schermo)' : ''); }
  function luogo(k) {
    var p = String(k).split(':');
    var a = { 'vetrina-sx': 'Vetrina sinistra', 'vetrina-dx': 'Vetrina destra', ingresso: 'Ingresso', bancone: 'Bancone', vestibolo: 'Vestibolo' }[p[0]] || p[0];
    var b = { sopra: 'sopra', sotto: 'sotto', vetro: 'sul vetro', 'appena-entrati': 'appena entrati' }[p[1]] || p[1] || '';
    return a + (b ? ' ' + b : '');
  }

  /* ---------------------------------------------------------------
     BRAND e PRODOTTI d'esempio (prezzi = ESEMPI, non listini ufficiali; allineati alle grafiche di media/blackfriday/vetrine)
     --------------------------------------------------------------- */
  var BRAND = ['Ray-Ban', 'Persol', 'Oakley', 'Carrera', 'Vogue Eyewear', 'Giorgio Armani', 'Michael Kors', 'Guess'];
  var WM = { 'Ray-Ban': 'rb', 'Persol': 'po', 'Oakley': 'oo', 'Carrera': 'ca', 'Vogue Eyewear': 'vo', 'Giorgio Armani': 'ar', 'Michael Kors': 'mk', 'Guess': 'gu' };
  var PROD = [
    { id: 'rb2140', brand: 'Ray-Ban', cod: 'RB2140', nome: 'Wayfarer', cat: 'Da sole', pieno: 109, varianti: ['nero lucido', 'tartaruga'] },
    { id: 'rb3025', brand: 'Ray-Ban', cod: 'RB3025', nome: 'Aviator', cat: 'Da sole', pieno: 149, varianti: ['oro · verde G-15', 'argento · specchio'] },
    { id: 'rb5154', brand: 'Ray-Ban', cod: 'RB5154', nome: 'Clubmaster', cat: 'Da vista', pieno: 139 },
    { id: 'po0649', brand: 'Persol', cod: 'PO0649', nome: '649', cat: 'Da sole', pieno: 320, varianti: ['havana', 'nero'] },
    { id: 'po3092', brand: 'Persol', cod: 'PO3092V', nome: '3092V', cat: 'Da vista', pieno: 215 },
    { id: 'oo9102', brand: 'Oakley', cod: 'OO9102', nome: 'Holbrook', cat: 'Da sole', pieno: 150, varianti: ['matte black', 'prizm'] },
    { id: 'ca1007', brand: 'Carrera', cod: '1007/S', nome: '1007/S', cat: 'Da sole', pieno: 129 },
    { id: 'vo5211', brand: 'Vogue Eyewear', cod: 'VO5211S', nome: 'Cat-eye', cat: 'Da sole', pieno: 105 },
    { id: 'ar8165', brand: 'Giorgio Armani', cod: 'AR8165', nome: 'Rotondo', cat: 'Da sole', pieno: 230 },
    { id: 'mk2024', brand: 'Michael Kors', cod: 'MK2024', nome: 'Adrianna', cat: 'Da sole', pieno: 135 },
    { id: 'gu-sole', brand: 'Guess', cod: 'GU-SOLE', nome: 'Donna', cat: 'Da sole', pieno: 99 }
  ];
  PROD.forEach(function (p) { var e = PE[p.cod]; if (e) { p.pieno = e.pieno; p.sconto = e.sconto; } });
  function prod(id) { for (var i = 0; i < PROD.length; i++) if (PROD[i].id === id) return PROD[i]; return PROD[0]; }
  function prodDi(brand) { return PROD.filter(function (p) { return p.brand === brand; }); }
  function wordmark(b, cls) {
    if (!b || b === 'Ottica Macrì') return '<span class="cv-wm cv-wm-om ' + (cls || '') + '"><b>OTTICA MACRÌ</b><i>ROMA</i></span>';
    var t = { 'Vogue Eyewear': 'VOGUE<small>EYEWEAR</small>', 'Giorgio Armani': 'GIORGIO ARMANI', 'Michael Kors': 'MICHAEL KORS', 'Oakley': 'OAKLEY', 'Guess': 'GUESS', 'Carrera': 'CARRERA' }[b] || esc(b);
    return '<span class="cv-wm cv-wm-' + (WM[b] || 'x') + ' ' + (cls || '') + '">' + t + '</span>';
  }
  var OCCHIALI = '<svg class="cv-occ" viewBox="0 0 200 64" aria-hidden="true"><path d="M6 13 L31 18 M194 13 L169 18 M92 24 Q100 14 108 24"/><path d="M31 18 Q29 58 62 58 Q93 58 92 24 Q92 16 61 16 Q31 16 31 18Z"/><path d="M169 18 Q171 58 138 58 Q107 58 108 24 Q108 16 139 16 Q169 16 169 18Z"/></svg>';

  /* ---------------------------------------------------------------
     DISEGNINO DEL SUPPORTO (SVG): l'inserto ha il rapporto vero
     --------------------------------------------------------------- */
  function supSVG(s, px) {
    var w = s.stampa ? s.stampa[0] : (s.schermo || [16, 10])[0], h = s.stampa ? s.stampa[1] : (s.schermo || [16, 10])[1];
    var r = w / h, A = s.tipo === 'totem' ? 34 : (s.tipo === 'cubo' ? 40 : 56);
    var iw = r >= 1 ? A : A * r, ih = r >= 1 ? A / r : A, cx = 50, g = '';
    var B = '#1f4e79', R = '#b5462c', ins = function (x, y, ww, hh) { return '<rect x="' + x + '" y="' + y + '" width="' + ww + '" height="' + hh + '" fill="#fffdf9" stroke="' + R + '" stroke-width="1.6"/><line x1="' + (x + ww * .2) + '" y1="' + (y + hh * .35) + '" x2="' + (x + ww * .8) + '" y2="' + (y + hh * .35) + '" stroke="' + R + '" stroke-width="1.2" opacity=".5"/><line x1="' + (x + ww * .3) + '" y1="' + (y + hh * .6) + '" x2="' + (x + ww * .7) + '" y2="' + (y + hh * .6) + '" stroke="#333" stroke-width="2.4" opacity=".45"/>'; };
    var x, y;
    if (s.tipo === 'plexiL') { x = cx - iw / 2; y = 82 - ih; g = '<polygon points="' + (x - 9) + ',92 ' + (x + iw + 9) + ',92 ' + (x + iw + 3) + ',84 ' + (x - 3) + ',84" fill="rgba(140,190,225,.35)" stroke="' + B + '" stroke-width="1.2"/><rect x="' + (x - 3) + '" y="' + (y - 3) + '" width="' + (iw + 6) + '" height="' + (ih + 5) + '" fill="rgba(140,190,225,.3)" stroke="' + B + '" stroke-width="1.4"/>' + ins(x, y, iw, ih); }
    else if (s.tipo === 'plexiT') { iw *= .85; ih *= .85; x = cx - iw / 2; y = 78 - ih; g = '<rect x="' + (cx - 2) + '" y="' + (y + ih) + '" width="4" height="12" fill="rgba(140,190,225,.5)" stroke="' + B + '"/><rect x="' + (cx - 18) + '" y="89" width="36" height="4" fill="rgba(140,190,225,.5)" stroke="' + B + '"/><rect x="' + (x - 3) + '" y="' + (y - 3) + '" width="' + (iw + 6) + '" height="' + (ih + 6) + '" fill="rgba(140,190,225,.3)" stroke="' + B + '" stroke-width="1.4"/>' + ins(x, y, iw, ih); }
    else if (s.tipo === 'cornice') { iw *= .8; ih *= .8; x = cx - iw / 2; y = 50 - ih / 2; g = '<line x1="' + cx + '" y1="' + (y + ih * .5) + '" x2="' + (cx + iw * .45) + '" y2="' + (y + ih + 12) + '" stroke="#7a5233" stroke-width="2.5"/><rect x="' + (x - 7) + '" y="' + (y - 7) + '" width="' + (iw + 14) + '" height="' + (ih + 14) + '" fill="#a8774c" stroke="#6b4428" stroke-width="1.4"/><rect x="' + (x - 2) + '" y="' + (y - 2) + '" width="' + (iw + 4) + '" height="' + (ih + 4) + '" fill="#e9dcc6"/>' + ins(x, y, iw, ih); }
    else if (s.tipo === 'cubo') { x = 26; y = 40; var L = 40, d = 14; g = '<polygon points="' + x + ',' + y + ' ' + (x + d) + ',' + (y - d) + ' ' + (x + L + d) + ',' + (y - d) + ' ' + (x + L) + ',' + y + '" fill="rgba(140,190,225,.35)" stroke="' + B + '" stroke-width="1.2"/><polygon points="' + (x + L) + ',' + y + ' ' + (x + L + d) + ',' + (y - d) + ' ' + (x + L + d) + ',' + (y + L - d) + ' ' + (x + L) + ',' + (y + L) + '" fill="rgba(140,190,225,.5)" stroke="' + B + '" stroke-width="1.2"/><rect x="' + x + '" y="' + y + '" width="' + L + '" height="' + L + '" fill="rgba(140,190,225,.25)" stroke="' + B + '" stroke-width="1.4"/>' + ins(x + 3, y + 3, L - 6, L - 6); }
    else if (s.tipo === 'totem') { x = cx - iw / 2; y = 6; g = '<ellipse cx="' + cx + '" cy="94" rx="16" ry="3.5" fill="#555"/><rect x="' + (cx - 1.4) + '" y="' + (y + ih) + '" width="2.8" height="' + (92 - y - ih) + '" fill="#777"/><rect x="' + (x - 2) + '" y="' + (y - 2) + '" width="' + (iw + 4) + '" height="' + (ih + 4) + '" fill="#444"/>' + ins(x, y, iw, ih); }
    else if (s.tipo === 'appeso') { x = cx - iw / 2; y = 34; g = '<line x1="4" y1="6" x2="96" y2="6" stroke="#999" stroke-width="2"/><line x1="' + (x + 6) + '" y1="6" x2="' + (x + 6) + '" y2="' + y + '" stroke="#666" stroke-width=".8"/><line x1="' + (x + iw - 6) + '" y1="6" x2="' + (x + iw - 6) + '" y2="' + y + '" stroke="#666" stroke-width=".8"/>' + ins(x, y, iw, ih); }
    else if (s.tipo === 'vetrofania') { iw *= .9; ih *= .9; x = cx - iw / 2; y = 50 - ih / 2; g = '<rect x="6" y="8" width="88" height="84" fill="rgba(140,190,225,.28)" stroke="' + B + '" stroke-width="1.6"/><line x1="14" y1="16" x2="30" y2="30" stroke="#fff" stroke-width="2" opacity=".8"/>' + ins(x, y, iw, ih); }
    else if (s.tipo === 'tablet') { x = cx - iw / 2; y = 50 - ih / 2; g = '<rect x="' + (x - 4) + '" y="' + (y - 4) + '" width="' + (iw + 8) + '" height="' + (ih + 8) + '" rx="4" fill="#222"/><rect x="' + x + '" y="' + y + '" width="' + iw + '" height="' + ih + '" fill="#14110e" stroke="#c99a63" stroke-width="1"/>'; }
    else if (s.tipo === 'stanghetta') {
      g = '<path d="M4 40 L84 36 Q94 36 95 46" fill="none" stroke="#3a2d22" stroke-width="4" stroke-linecap="round"/>';
      if (s.id === 'stanga-bandierina') g += '<path d="M38 38 Q36 46 44 47 L44 60" fill="none" stroke="#bbb" stroke-width="3"/>' + ins(30, 60, 30, 16);
      else if (s.id === 'stanga-cartellino') g += '<path d="M46 38 Q40 52 36 58 M46 38 Q52 52 44 58" fill="none" stroke="#b5462c" stroke-width="1"/>' + ins(26, 58, 36, 24) + '<circle cx="31" cy="64" r="2.2" fill="#fff" stroke="#999"/>';
      else g += '<rect x="40" y="31" width="34" height="22" rx="3" fill="rgba(140,190,225,.35)" stroke="' + B + '" stroke-width="1.2"/>' + ins(43, 34, 28, 16);
    }
    else if (s.tipo === 'dymo') { x = cx - iw / 2; y = 50 - ih / 2; g = '<rect x="4" y="' + (y - 6) + '" width="92" height="' + (ih + 12) + '" rx="3" fill="#efe9de" stroke="#bbb"/>' + ins(x, y, iw, ih); }
    return '<svg class="cv-supsvg" viewBox="0 0 100 100" width="' + (px || 90) + '" height="' + (px || 90) + '" aria-hidden="true">' + g + '</svg>';
  }

  /* ---------------------------------------------------------------
     INSERTO (misure in mm; testi in unità del contenitore: scala da solo)
     d.mod = modello; d.stile = 'chiaro' | 'bf' | 'bfc' (Black Friday chiaro, meno inchiostro)
     --------------------------------------------------------------- */
  function firma(d) { return wordmark(d.brand); }
  function piede(d) { return d.data ? '<div class="cv-f">' + esc(d.data) + ' · ' + "VIA POGGI D'ORO 23 · ROMA</div>" : '<div class="cv-f">' + "Via Poggi D'Oro 23 · Roma · 06 78346705</div>"; }
  function claim(d) { return (d.claimSx || d.claimDx) ? '<div class="cv-k"><span>' + esc(d.claimSx || '') + '</span><span>' + esc(d.claimDx || '') + '</span></div>' : ''; }
  function corpo(d) {
    var m = d.mod, h = '';
    if (m === 'semplice' || m === 'paletto' || m === 'natale') h = claim(d) + '<div class="cv-c"><div class="cv-desc">' + esc(d.desc) + '</div><div class="cv-big cv-oro">' + euro(d.prezzo) + '</div></div><div class="cv-firma">' + firma(d) + '</div>' + piede(d);
    else if (m === 'outlet' || m === 'school') h = claim(d) + '<div class="cv-c"><div class="cv-desc">' + esc(d.desc) + '</div><div class="cv-bar"><s>' + euro(d.pieno) + '</s><em>−' + n(d.sconto) + '%</em></div><div class="cv-big cv-oro">' + euro(prezzoBF(d.cod, d.pieno, d.sconto)) + '</div></div><div class="cv-firma">' + firma(d) + '</div>' + piede(d);
    else if (m === 'paio') h = claim(d) + '<div class="cv-c"><div class="cv-desc">' + esc(d.desc) + '</div><div class="cv-big cv-oro">' + esc(d.valore) + '</div><div class="cv-banda">' + esc(d.sotto) + '</div></div><div class="cv-firma">' + firma(d) + '</div>' + piede(d);
    else if (m === 'multi') h = claim(d) + '<div class="cv-c"><div class="cv-lista">' + (d.articoli || []).filter(function (a) { return a[0] || a[1]; }).map(function (a) { return '<div><span>' + esc(a[0]) + '</span><b class="cv-oro">' + euro(a[1]) + '</b></div>'; }).join('') + '</div></div><div class="cv-firma">' + firma(d) + '</div>' + piede(d);
    else if (m === 'percentuale' || m === 'saldi') h = claim(d) + '<div class="cv-c"><div class="cv-big cv-oro cv-pc">−' + n(d.sconto) + '%</div><div class="cv-desc">' + esc(d.desc) + '</div></div><div class="cv-firma">' + firma(d) + '</div>' + piede(d);
    else if (m === 'ultimi') h = '<div class="cv-banda cv-top">ULTIMI PEZZI</div><div class="cv-c"><div class="cv-desc">' + esc(d.desc) + '</div><div class="cv-big cv-oro">' + euro(d.prezzo) + '</div></div><div class="cv-firma">' + firma(d) + '</div>' + piede(d);
    else if (m === 'indicazioni') h = '<div class="cv-k"><span>' + esc(d.claimSx || 'REPARTO') + '</span><span></span></div><div class="cv-c"><div class="cv-freccia">' + esc(d.freccia || '→') + '</div><div class="cv-titolo">' + esc(d.reparto) + '</div></div><div class="cv-firma">' + wordmark('Ottica Macrì') + '</div>';
    /* --- modelli Black Friday dell'allestimento --- */
    else if (m === 'bf-reclame') h = '<div class="cv-firma cv-su">' + wordmark('Ottica Macrì') + '</div><div class="cv-titolo">' + esc(d.titolo || 'BLACK FRIDAY') + '</div><div class="cv-c"><div class="cv-big cv-oro cv-pc">' + esc(d.valore) + '</div><div class="cv-desc">' + esc(d.desc) + '</div>' + (d.banda ? '<div class="cv-banda">' + esc(d.banda) + '</div>' : '') + '</div>' + piede(d);
    else if (m === 'bf-brand') h = '<div class="cv-kbf">BLACK FRIDAY</div><div class="cv-c"><div class="cv-brandbig">' + wordmark(d.brand) + '</div><div class="cv-banda">−' + n(d.sconto) + '% SU TUTTO ' + esc(String(d.brand).toUpperCase()) + '</div><div class="cv-da">da <s>' + euro(d.pieno) + '</s></div><div class="cv-big cv-oro">' + euro(prezzoBF(d.cod, d.pieno, d.sconto)) + '</div></div>' + piede(d);
    else if (m === 'bf-singolo') h = '<div class="cv-kbf">BLACK FRIDAY −' + n(d.sconto) + '%</div><div class="cv-c"><div class="cv-brandmid">' + wordmark(d.brand) + '</div><div class="cv-mod">' + esc(d.nome) + (d.variante ? '<small>' + esc(d.variante) + '</small>' : '') + '</div><div class="cv-bar"><s>' + euro(d.pieno) + '</s></div><div class="cv-big cv-oro">' + euro(prezzoBF(d.cod, d.pieno, d.sconto)) + '</div></div><div class="cv-cod">' + esc(d.cod) + '</div>';
    else if (m === 'bf-tutti') h = '<div class="cv-firma cv-su">' + wordmark('Ottica Macrì') + '</div><div class="cv-titolo">BLACK<br>FRIDAY</div><div class="cv-c"><div class="cv-big cv-oro cv-pc cv-enorme">−' + n(d.sconto) + '%</div><div class="cv-banda">TUTTI I BRAND</div><div class="cv-griglia">' + BRAND.map(function (b) { return wordmark(b); }).join('') + '</div></div>' + piede(d);
    else if (m === 'bf-scritta' || m === 'bf-vetrofania') h = '<div class="cv-c"><div class="cv-titolo">BLACK FRIDAY</div><div class="cv-riga"><span class="cv-oro cv-pcm">−' + n(d.sconto) + '%</span><span class="cv-banda">TUTTI I BRAND</span></div>' + (m === 'bf-vetrofania' ? '<div class="cv-desc">' + esc(d.data || '') + '</div>' : '') + '</div>';
    else if (m === 'bf-focus') h = '<div class="cv-kbf">FOCUS · IL PREZZO DELLA SETTIMANA</div><div class="cv-c"><div class="cv-brandbig">' + wordmark(d.brand) + '</div><div class="cv-mod">' + esc(d.nome) + '</div>' + OCCHIALI + '<div class="cv-bar"><s>' + euro(d.pieno) + '</s><em>−' + n(d.sconto) + '%</em></div><div class="cv-big cv-oro">' + euro(prezzoBF(d.cod, d.pieno, d.sconto)) + '</div></div>' + piede(d);
    else if (m === 'bf-cubo') {
      var f = +d.faccia || 1;
      if (f === 1) h = '<div class="cv-c"><div class="cv-brandbig">' + wordmark(d.brand) + '</div><div class="cv-mod">' + esc(d.nome) + '</div></div>';
      else if (f === 2) h = '<div class="cv-c"><div class="cv-kbf">BLACK FRIDAY</div><div class="cv-big cv-oro cv-pc">−' + n(d.sconto) + '%</div></div>';
      else if (f === 3) h = '<div class="cv-c"><div class="cv-bar"><s>' + euro(d.pieno) + '</s></div><div class="cv-big cv-oro">' + euro(prezzoBF(d.cod, d.pieno, d.sconto)) + '</div><div class="cv-cod">' + esc(d.cod) + '</div></div>';
      else h = '<div class="cv-c">' + OCCHIALI + '<div class="cv-firma">' + wordmark('Ottica Macrì') + '</div></div>';
    }
    else if (m === 'bf-totem') h = '<div class="cv-firma cv-su">' + wordmark('Ottica Macrì') + '</div><div class="cv-kbf">BENVENUTI</div><div class="cv-titolo">BLACK<br>FRIDAY</div><div class="cv-c">' + OCCHIALI + '<div class="cv-big cv-oro cv-pc cv-enorme">−' + n(d.sconto) + '%</div><div class="cv-banda">SU TUTTI I BRAND</div><div class="cv-desc">' + esc(d.desc || 'Chieda a noi: le facciamo provare tutto') + '</div></div>' + piede(d);
    return h;
  }
  function inserto(d, s) {
    var w = s.stampa[0], h = s.stampa[1], forma = w / h > 1.55 ? ' cv-oriz' : (w / h > 1.05 ? ' cv-largo' : (h / w > 1.3 ? ' cv-alto' : ''));
    var stile = window.STILI ? ' ' + window.STILI.classe(d.stile, d) : (d.stile === 'bf' ? ' cv-bf' : (d.stile === 'bfc' ? ' cv-bf cv-bfc' : ' cv-chiaro'));   // aggancio stili.js (3 famiglie di stile)
    return '<div class="cv-ins cv-m-' + esc(d.mod) + stile + forma + (d.tema ? ' cv-t-' + esc(d.tema) : '') + '" style="width:' + w + 'mm;height:' + h + 'mm"><div class="cv-cornice"></div>' + corpo(d) + '</div>';
  }

  /* ---------------------------------------------------------------
     PREZZI DA STANGHETTA (misure da dispositivi.js)
     --------------------------------------------------------------- */
  function stanga(s, r, d) {
    var w = s.stampa[0], h = s.stampa[1], sc = r.sc != null && r.sc !== '' ? r.sc : d.sconto, fin = prezzoBF(r.cod, r.pieno, sc);
    var ev = d.evento ? '<span class="sg-ev">' + esc(d.evento) + '</span>' : '';
    if (s.id === 'stanga-bandierina') {
      var coda = s.coda || 0;
      return '<div class="cv-sg cv-sg-band" style="width:' + (w + coda) + 'mm;height:' + h + 'mm"><div class="sg-fac" style="width:' + w + 'mm;height:' + h + 'mm"><span class="sg-bar"><s>' + euro(r.pieno) + '</s> −' + n(sc) + '%</span><b class="sg-pf">' + euro(fin) + '</b><span class="sg-cod">' + esc(r.cod) + '</span></div>' +
        '<div class="sg-coda" style="width:' + coda + 'mm"><span>↺ attorno alla stanghetta · si incolla dietro</span></div></div>';
    }
    if (s.id === 'stanga-cartellino') return '<div class="cv-sg cv-sg-cart" style="width:' + w + 'mm;height:' + h + 'mm"><i class="sg-foro"></i>' + ev + '<span class="sg-brand">' + wordmark(r.brand) + '</span><span class="sg-bar"><s>' + euro(r.pieno) + '</s></span><b class="sg-pf">' + euro(fin) + '</b><span class="sg-cod">' + esc(r.cod) + '</span></div>';
    return '<div class="cv-sg cv-sg-clip" style="width:' + w + 'mm;height:' + h + 'mm">' + ev + '<span class="sg-bar"><s>' + euro(r.pieno) + '</s></span><b class="sg-pf">' + euro(fin) + '</b><span class="sg-cod">' + esc(r.cod) + '</span></div>';
  }
  function dimStanga(s) { return s.id === 'stanga-bandierina' ? [s.stampa[0] + (s.coda || 0), s.stampa[1]] : s.stampa; }

  /* ---------------------------------------------------------------
     IMPAGINAZIONE su foglio (A4 o A3), linee e segni di taglio, righello 5 cm
     --------------------------------------------------------------- */
  function layout(dim, foglio) {
    var F = FOGLI[foglio] || FOGLI.A4, w = dim[0], h = dim[1];
    if (Math.abs(w - F.w) <= 1 && Math.abs(h - F.h) <= 1) return { modo: 'pieno', per: 1, rot: false, F: F, iw: w, ih: h };
    if (Math.abs(h - F.w) <= 1 && Math.abs(w - F.h) <= 1) return { modo: 'pieno', per: 1, rot: true, F: F, iw: h, ih: w };
    var uw = F.w - 2 * MARG.x, uh = F.h - MARG.top - MARG.bottom, best = null;
    [false, true].forEach(function (rot) {
      var iw = rot ? h : w, ih = rot ? w : h, c = Math.floor(uw / iw), rr = Math.floor(uh / ih), k = c * rr;
      // si gira di lato solo se ci stanno parecchi inserti in più (i testi restano dritti più spesso)
      if (k > 0 && (!best || k > best.per * (rot ? 1.25 : 1))) best = { modo: 'griglia', per: k, rot: rot, cols: c, rows: rr, iw: iw, ih: ih, F: F };
    });
    if (best) return best;
    [false, true].forEach(function (rot) {
      var iw = rot ? h : w, ih = rot ? w : h, c = Math.ceil(iw / uw), rr = Math.ceil(ih / uh);
      if (!best || c * rr < best.pezzi) best = { modo: 'pezzi', per: 1, pezzi: c * rr, rot: rot, cols: c, rows: rr, iw: iw, ih: ih, tw: iw / c, th: ih / rr, F: F };
    });
    return best;
  }
  function ruota(html, w, h, rot) {   // w,h = misure originali dell'inserto
    if (!rot) return html;
    return '<div style="position:absolute;left:0;top:0;width:' + w + 'mm;height:' + h + 'mm;transform-origin:0 0;transform:translateY(' + w + 'mm) rotate(-90deg)">' + html + '</div>';
  }
  function segni(x0, y0, xs, ys, F) {   // segni di taglio nei margini, allineati alle linee di taglio
    var h = '', x1 = xs[xs.length - 1], y1 = ys[ys.length - 1];
    function seg(l, t, w, hh) { return '<i class="cv-segno" style="left:' + l + 'mm;top:' + t + 'mm;width:' + w + 'mm;height:' + hh + 'mm"></i>'; }
    xs.forEach(function (x) { var a = Math.min(6, y0 - 1); if (a > 1) h += seg(x - .1, y0 - 1 - a, .2, a); var b = Math.min(6, F.h - y1 - 9); if (b > 1) h += seg(x - .1, y1 + 1, .2, b); });
    ys.forEach(function (y) { var a = Math.min(6, x0 - 1); if (a > 1) h += seg(x0 - 1 - a, y - .1, a, .2); var b = Math.min(6, F.w - x1 - 1); if (b > 1) h += seg(x1 + 1, y - .1, b, .2); });
    return h;
  }
  function rigaPiede(testo, F) {
    return '<div class="cv-piedefoglio" style="top:' + (F.h - 10) + 'mm;width:' + (F.w - 2 * MARG.x) + 'mm;left:' + MARG.x + 'mm"><span>✂ ' + esc(testo) + ' · stampare al 100% (dimensioni effettive)</span><span class="cv-righello" style="width:50mm"><b>5 cm</b></span></div>';
  }
  /* lavori = [{ dim:[w,h], html: '<inserto…>', copie, nome }] -> pagine HTML (stringhe) */
  function impagina(lavori, foglio) {
    var pagine = [], gruppi = [], per = {};
    lavori.forEach(function (l) {
      var k = l.dim[0] + 'x' + l.dim[1];
      if (!per[k]) { per[k] = { dim: l.dim, nome: l.nome, pezzi: [] }; gruppi.push(per[k]); }
      for (var i = 0; i < Math.max(0, Math.round(n(l.copie))); i++) per[k].pezzi.push(l.html);
    });
    gruppi.forEach(function (g) {
      var L = layout(g.dim, foglio), F = L.F, w = g.dim[0], h = g.dim[1];
      if (!g.pezzi.length) return;
      if (L.modo === 'pieno') { g.pezzi.forEach(function (p) { pagine.push('<div class="cv-pg" style="width:' + F.w + 'mm;height:' + F.h + 'mm"><div class="cv-cel" style="left:0;top:0;width:' + L.iw + 'mm;height:' + L.ih + 'mm">' + ruota(p, w, h, L.rot) + '</div></div>'); }); return; }
      if (L.modo === 'griglia') {
        var gw = L.cols * L.iw, gh = L.rows * L.ih, x0 = (F.w - gw) / 2, y0 = MARG.top + (F.h - MARG.top - MARG.bottom - gh) / 2;
        for (var i = 0; i < g.pezzi.length; i += L.per) {
          var celle = g.pezzi.slice(i, i + L.per), hh = '', xs = [], ys = [], c, r;
          for (c = 0; c <= L.cols; c++) xs.push(+(x0 + c * L.iw).toFixed(2));
          for (r = 0; r <= L.rows; r++) ys.push(+(y0 + r * L.ih).toFixed(2));
          celle.forEach(function (p, j) { var cc = j % L.cols, rr = Math.floor(j / L.cols); hh += '<div class="cv-cel" style="left:' + (x0 + cc * L.iw) + 'mm;top:' + (y0 + rr * L.ih) + 'mm;width:' + L.iw + 'mm;height:' + L.ih + 'mm">' + ruota(p, w, h, L.rot) + '</div>'; });
          hh += '<div class="cv-linee" style="left:' + x0 + 'mm;top:' + y0 + 'mm;width:' + gw + 'mm;height:' + gh + 'mm;background-size:' + L.iw + 'mm ' + L.ih + 'mm"></div>';
          pagine.push('<div class="cv-pg" style="width:' + F.w + 'mm;height:' + F.h + 'mm">' + hh + segni(x0, y0, xs, ys, F) + rigaPiede(g.nome + ' · ' + w + ' × ' + h + ' mm · ' + L.per + ' per foglio', F) + '</div>');
        }
        return;
      }
      /* pezzi: l'inserto è più grande del foglio -> fogli da unire */
      g.pezzi.forEach(function (p) {
        for (var r = 0; r < L.rows; r++) for (var c = 0; c < L.cols; c++) {
          var x0 = (F.w - L.tw) / 2, y0 = MARG.top + (F.h - MARG.top - MARG.bottom - L.th) / 2;
          var dentro = '<div style="position:absolute;left:' + (-c * L.tw) + 'mm;top:' + (-r * L.th) + 'mm;width:' + L.iw + 'mm;height:' + L.ih + 'mm">' + ruota(p, w, h, L.rot) + '</div>';
          pagine.push('<div class="cv-pg" style="width:' + F.w + 'mm;height:' + F.h + 'mm"><div class="cv-cel" style="left:' + x0 + 'mm;top:' + y0 + 'mm;width:' + L.tw + 'mm;height:' + L.th + 'mm">' + dentro + '</div><div class="cv-linee solo" style="left:' + x0 + 'mm;top:' + y0 + 'mm;width:' + L.tw + 'mm;height:' + L.th + 'mm"></div>' +
            segni(x0, y0, [x0, x0 + L.tw], [y0, y0 + L.th], F) + rigaPiede(g.nome + ' · pezzo ' + (r * L.cols + c + 1) + ' di ' + L.pezzi + ' (riga ' + (r + 1) + ', colonna ' + (c + 1) + ') · unire a filo con nastro sul retro', F) + '</div>');
        }
      });
    });
    return pagine;
  }
  function spiegaLayout(L, nomeF) {
    if (L.modo === 'pieno') return '1 per foglio ' + nomeF + ' (a tutta pagina)';
    if (L.modo === 'griglia') return L.per + ' per foglio ' + nomeF + (L.rot ? ' (girati di lato)' : '');
    return 'più grande del foglio: ' + L.pezzi + ' fogli ' + nomeF + ' da unire';
  }

  /* ---------------------------------------------------------------
     ANTEPRIME (scalate con .scala[data-w] di app.js: rapporto esatto)
     --------------------------------------------------------------- */
  function vistaIns(html, w, h, maxPx, zoom) {
    var px = w * MM, r = w / h;
    var larg = zoom ? 'width:min(100%,' + (w * zoom).toFixed(2) + 'mm)' : 'width:min(100%,' + Math.round(Math.min(maxPx || 420, (maxPx || 420) * r * 1.1)) + 'px)';
    return '<div class="cv-insv" style="' + larg + ';aspect-ratio:' + w + '/' + h + '"><div class="scala" data-w="' + px.toFixed(3) + '">' + html + '</div></div>';
  }
  function vistaFoglio(pagina, foglio) {
    var F = FOGLI[foglio] || FOGLI.A4;
    return '<div class="cv-fogliov" style="aspect-ratio:' + F.w + '/' + F.h + '"><div class="scala" data-w="' + (F.w * MM).toFixed(3) + '">' + (pagina || '<div class="cv-pg" style="width:' + F.w + 'mm;height:' + F.h + 'mm"></div>') + '</div></div>';
  }
  function thumbIns(html, w, h) { return '<div class="thumb cv-thumb"><div class="cv-tb" style="aspect-ratio:' + w + '/' + h + '"><div class="scala" data-w="' + (w * MM).toFixed(3) + '">' + html + '</div></div></div>'; }

  /* ---------------------------------------------------------------
     STAMPA VERA (finestra di stampa del browser, scala 1:1)
     --------------------------------------------------------------- */
  var ultimaStampa = 0;
  function stampaVera(pagine, foglio, titolo) {
    if (window.CLONE_SC && window.CLONE_SC.stampaCv) { window.CLONE_SC.stampaCv(pagine, foglio, titolo); return; }   // clone: stessa stampa vera + cronologia
    if (Date.now() - ultimaStampa < 1200) return;   // un solo invio anche col doppio tocco
    ultimaStampa = Date.now();
    if (!pagine.length) { API.toast('Niente da stampare: metti almeno 1 copia'); return; }
    var F = FOGLI[foglio] || FOGLI.A4;
    var box = document.getElementById('cv-stampa');
    if (!box) { box = document.createElement('div'); box.id = 'cv-stampa'; box.setAttribute('aria-hidden', 'true'); document.body.appendChild(box); }
    box.innerHTML = pagine.join('');
    var st = document.getElementById('cv-pagina');
    if (!st) { st = document.createElement('style'); st.id = 'cv-pagina'; document.head.appendChild(st); }
    st.textContent = '@page{size:' + F.w + 'mm ' + F.h + 'mm;margin:0}';
    document.documentElement.classList.add('cv-stampa-on');
    var cr = API.S().cronologia; if (Array.isArray(cr)) try { cr.unshift({ g: 0, t: titolo, n: pagine.length }); } catch (e) {}
    API.toast('Stampa: ' + pagine.length + (pagine.length === 1 ? ' foglio ' : ' fogli ') + F.nome + ' · scelga «Dimensioni effettive / 100%»');
    // si aspetta che le grafiche (PNG alla misura vera) siano caricate, poi si apre la stampa
    var imgs = Array.prototype.slice.call(box.querySelectorAll('img'));
    Promise.all(imgs.map(function (im) { return im.complete ? 0 : new Promise(function (ok) { im.onload = im.onerror = ok; }); })).then(function () { setTimeout(function () { try { window.print(); } catch (e) {} }, 60); });
  }
  function spegniStampa() {
    document.documentElement.classList.remove('cv-stampa-on');
    var st = document.getElementById('cv-pagina'); if (st) st.textContent = '';
  }
  window.addEventListener('hashchange', spegniStampa);

  /* ---------------------------------------------------------------
     PAGINA · CREA CARTELLI (sostituisce creator/cartello: stesso indirizzo)
     --------------------------------------------------------------- */
  var SUP_DEF = { semplice: 'plexi-10x15', outlet: 'plexi-13x18', paio: 'plexi-a5', multi: 'plexi-a4', percentuale: 'plexi-a5', ultimi: 'plexi-a7', paletto: 'cornice-10x15', indicazioni: 'plexi-a4', saldi: 'plexi-a4', school: 'plexi-13x18', natale: 'cornice-13x18' };
  function supportiStampabili() { return DISP.supporti.filter(function (s) { return STAMPABILI.indexOf(s.tipo) >= 0 && s.stampa; }); }
  function sceltaSupporti(selId, act) {
    return '<div class="cv-supporti">' + supportiStampabili().map(function (s) {
      return '<button type="button" class="cv-sup' + (s.id === selId ? ' on' : '') + '" data-act="' + (act || 'cvSup') + '" data-val="' + s.id + '" aria-pressed="' + (s.id === selId) + '">' + supSVG(s, 64) +
        '<span class="t"><b>' + esc(s.nome) + '</b><span class="mis">' + misura(s) + '</span><span class="dv">' + esc((s.dove || []).map(luogo).join(' · ')) + '</span></span></button>';
    }).join('') + '</div>';
  }
  function copieAuto(s, foglio) { var L = layout(s.stampa, foglio); return s.facce || (L.modo === 'griglia' ? L.per : 1); }
  function paginaCartello(r) {
    var C = API.CARTELLI, k = C[r.v] ? r.v : 'semplice', base = C[k];
    var d = API.ed(Object.assign({}, base, { mod: k === 'percentuale' || k === 'saldi' ? (k === 'saldi' ? 'saldi' : 'percentuale') : (base.tema || k), sup: SUP_DEF[k] || 'plexi-a5', stile: 'chiaro', brand: base.brand || 'Ottica Macrì', foglio: 'A4', copie: '' }));
    if (k === 'paletto') d.mod = 'paletto';
    var s = sup(d.sup) || sup('plexi-a5'), grande = s.stampa[0] > 210 || s.stampa[1] > 297;
    if (!grande && d.foglio === 'A3') d.foglio = 'A4';
    var titolo = base.titolo.replace(' ✦', '');
    function campi() {
      var c = API.campo, p = '';
      if (k !== 'indicazioni') p += c('Brand', 'brand', API.opzioni(['Ottica Macrì'].concat(BRAND), d.brand), 'select');
      if (k !== 'indicazioni' && k !== 'ultimi') p += '<div class="due">' + c('Scritta a sinistra', 'claimSx', d.claimSx) + c('Scritta a destra', 'claimDx', d.claimDx) + '</div>';
      if (k === 'multi') d.articoli.forEach(function (a, i) { p += '<div class="due">' + c('Articolo ' + (i + 1), 'art' + i + 'd', a[0]) + c('Prezzo €', 'art' + i + 'p', a[1], 'number') + '</div>'; });
      else if (k === 'indicazioni') p += c('Reparto', 'reparto', d.reparto) + '<div class="campo"><span>Freccia</span><div class="chips">' + ['←', '↑', '→', '↓'].map(function (f) { return '<button type="button" class="chipb' + (d.freccia === f ? ' on' : '') + '" data-act="setf" data-f="freccia" data-val="' + f + '" style="font-size:24px;min-width:60px">' + f + '</button>'; }).join('') + '</div></div>';
      else {
        p += c('Descrizione', 'desc', d.desc);
        if (k === 'paio') p += '<div class="due">' + c('Sconto (grande)', 'valore', d.valore) + c('Riga sotto', 'sotto', d.sotto) + '</div>';
        else if (k === 'outlet' || k === 'school') p += '<div class="due">' + c('Prezzo pieno €', 'pieno', d.pieno, 'number') + c('Sconto %', 'sconto', d.sconto, 'number') + '</div>';
        else if (k === 'percentuale' || k === 'saldi') p += c('Sconto %', 'sconto', d.sconto, 'number');
        else p += c('Prezzo €', 'prezzo', d.prezzo, 'number');
      }
      return p;
    }
    function lavori() { return [{ dim: s.stampa, html: inserto(d, s), copie: d.copie === '' ? copieAuto(s, d.foglio) : d.copie, nome: s.nome }]; }
    function ant() {
      var L = layout(s.stampa, d.foglio), pag = impagina(lavori(), d.foglio);
      return '<div class="cv-ant"><div class="cv-ant-sup">' + supSVG(s, 84) + '<div><b>' + esc(s.nome) + '</b><span>Inserto <b>' + misura(s) + '</b> · ' + esc(s.uso || '') + '</span></div></div>' +
        vistaIns(inserto(d, s), s.stampa[0], s.stampa[1], 380) +
        '<p class="cv-cap">Anteprima dell\'inserto · <b>rapporto esatto ' + s.stampa[0] + ':' + s.stampa[1] + '</b>' + (s.facce ? ' · ' + s.facce + ' facce' : '') + '</p>' +
        vistaFoglio(pag[0], d.foglio) +
        '<p class="cv-cap">Foglio ' + d.foglio + ' · <b>' + spiegaLayout(L, d.foglio) + '</b> · ' + pag.length + (pag.length === 1 ? ' foglio' : ' fogli') + ' da stampare · ✂ tagliare sulle linee</p></div>';
    }
    var nCopie = d.copie === '' ? copieAuto(s, d.foglio) : d.copie, nFogli = impagina(lavori(), d.foglio).length;
    var p = '<div class="pannello glass cv-pann"><h2>Cartello ' + esc(titolo) + '</h2>' +
      '<div class="blocco"><p class="blocco-t cv-passo"><b>1</b> Su quale supporto va?</p>' + sceltaSupporti(d.sup) + '</div>' +
      '<div class="blocco"><p class="blocco-t cv-passo"><b>2</b> Scrivi</p>' + campi() +
      (window.STILI ? window.STILI.selettore(d.stile, { setf: true }) : '<div class="campo"><span>Stile</span><div class="chips">' + [['chiaro', 'Chiaro'], ['bf', 'Nero e oro (Black Friday)'], ['bfc', 'Black Friday chiaro']].map(function (x) { return '<button type="button" class="chipb' + (d.stile === x[0] ? ' on' : '') + '" data-act="setf" data-f="stile" data-val="' + x[0] + '">' + x[1] + '</button>'; }).join('') + '</div></div>') + '</div>' +   // aggancio stili.js
      '<div class="blocco"><p class="blocco-t cv-passo"><b>3</b> Guarda l\'anteprima <span class="cv-freccia-giu">→</span></p><p class="piccolo muto">A destra (sul telefono: qui sotto) l\'inserto come uscirà e il foglio con le linee di taglio.</p></div>' +
      '<div class="blocco"><p class="blocco-t cv-passo"><b>4</b> Stampa</p>' +
      (grande ? '<div class="campo"><span>Foglio</span><div class="chips"><button type="button" class="chipb' + (d.foglio === 'A4' ? ' on' : '') + '" data-act="setf" data-f="foglio" data-val="A4" data-rr>A4 · stampante del negozio (fogli da unire)</button><button type="button" class="chipb' + (d.foglio === 'A3' ? ' on' : '') + '" data-act="setf" data-f="foglio" data-val="A3" data-rr>A3 · copisteria</button></div></div>' : '') +
      API.campo('Quanti ' + (s.facce ? 'inserti (facce del cubo)' : 'inserti') + '?', 'copie', nCopie, 'number', ' data-rr min="1"') +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="cvStampa">🖨 Stampa ' + nFogli + (nFogli === 1 ? ' foglio ' : ' fogli ') + d.foglio + '</button>' +
      '</div>' + // 6/11: tolto il collegamento all'allestimento vetrine
      '<p class="piccolo muto">Nella finestra di stampa scegli <b>Dimensioni effettive / 100%</b>, non «Adatta». Sul foglio c\'è un righello: deve misurare 5 cm.' + (s.tipo === 'vetrofania' ? ' La vetrofania vera si fa stampare su vinile adesivo: questa è la prova su carta.' : '') + '</p></div></div>';
    return {
      html: API.testa('Cartello ' + titolo, base.promo ? 'Promo stagionali · sul supporto vero' : 'Crea cartelli · sul supporto vero') + '<div class="strumento cv-strum">' + p + API.tavolo(s.nome + ' · ' + misura(s), ant(), 'anteprima in scala') + '</div>',
      ant: ant,
      cvLavori: function () { return { lavori: lavori(), foglio: d.foglio, titolo: 'Cartello ' + titolo + ' · ' + s.nome }; },
      foglio: function () { return { titolo: 'Cartello ' + titolo + ' · ' + s.nome, html: '', tipo: 'a4', n: nFogli }; },
      cambia: function (f, v) { var m = /^art(\d)([dp])$/.exec(f); if (m && d.articoli && d.articoli[+m[1]]) d.articoli[+m[1]][m[2] === 'd' ? 0 : 1] = m[2] === 'p' ? n(v) : v; if (f === 'copie') d.copie = v === '' ? '' : Math.max(1, Math.round(n(v))); }
    };
  }

  /* ---------------------------------------------------------------
     PAGINA · ALLESTIMENTO VETRINE · BLACK FRIDAY
     --------------------------------------------------------------- */
  var RIP = [
    { id: 'vetrina-sx-sopra', vetrina: 'vetrina-sx', piano: 'sopra', t: 'Vetrina sinistra · SOPRA', breve: 'Offerte speciali' },
    { id: 'vetrina-sx-sotto', vetrina: 'vetrina-sx', piano: 'sotto', t: 'Vetrina sinistra · SOTTO', breve: 'Catalogo 3 brand' },
    { id: 'vetrina-dx-sopra', vetrina: 'vetrina-dx', piano: 'sopra', t: 'Vetrina destra · SOPRA', breve: 'Pubblicità grande' },
    { id: 'vetrina-dx-sotto', vetrina: 'vetrina-dx', piano: 'sotto', t: 'Vetrina destra · SOTTO', breve: 'Operazione focus' },
    { id: 'ingresso', vetrina: 'ingresso', piano: '', t: 'Appena entrati', breve: 'Totem da terra' }
  ];
  function rip(id) { for (var i = 0; i < RIP.length; i++) if (RIP[i].id === id) return RIP[i]; return null; }
  function infoRip(R) { var a = DISP.allestimento[R.vetrina] || {}; return R.piano ? (a[R.piano] || {}) : a; }
  function bfDati() {
    var st = API.S();
    if (!st.cvBF) st.cvBF = { sconto: 30, grande: 40, data: '24 — 30 NOVEMBRE', b1: 'Ray-Ban', b2: 'Persol', b3: 'Oakley', focus: 'rb2140', stile: 'bf', foglio: 'A4', fonte: '' };   // fonte '' = automatica: grafiche pronte se ci sono
    st.cvBF.usaGrafiche = !!window.BF_VETRINE && st.cvBF.fonte !== 'app' && (st.cvBF.stile === 'bf' || st.cvBF.stile === 'bfc');   // grafiche pronte solo in «Nero e oro» (stili.js)
    return st.cvBF;
  }
  /* elenco degli inserti di un ripiano (ognuno sul suo supporto del catalogo) */
  /* grafiche pronte dello studio (media/blackfriday/vetrine, window.BF_VETRINE): stesse misure di dispositivi.js */
  var DIR_VETRINE = '../media/blackfriday/vetrine/';
  function insertiGrafiche(R, b) {
    var V = window.BF_VETRINE || {}, chiave = R.vetrina + ':' + (R.piano || 'appena-entrati'), tema = b.stile === 'bfc' ? 'chiaro' : 'scuro';
    return Object.keys(V).filter(function (k) { var v = V[k]; return v.ripiano === chiave && (v.tema || 'scuro') === tema; }).map(function (k) {
      var v = V[k], s = sup(v.supporto); if (!s) return null;
      if (s.tipo === 'tablet' || !s.stampa) return { video: true, s: s, titolo: v.titolo || 'Tablet', nota: 'non si stampa: va col loop Black Friday' };
      return { s: s, titolo: v.titolo || k, img: v.png || (DIR_VETRINE + (v.anteprima || v.file)), file: DIR_VETRINE + v.file, copie: 1, nota: (v.faccia ? 'faccia ' + v.faccia + ' · ' : '') + 'grafica pronta' };
    }).filter(Boolean);
  }
  function htmlVoce(x, perStampa) {
    if (!x.img) return inserto(x.d, x.s);
    return '<img class="cv-imgins" alt="" src="' + esc(perStampa ? x.file : x.img) + '" style="width:' + x.s.stampa[0] + 'mm;height:' + x.s.stampa[1] + 'mm">';
  }
  function inserti(R, b) {
    if (b.usaGrafiche) { var G = insertiGrafiche(R, b); if (G.length) return G; }
    var base = { stile: b.stile, sconto: b.sconto, data: b.data }, L = [];
    function add(supId, titolo, d, copie, nota) { var s = sup(supId); if (s) L.push({ s: s, titolo: titolo, d: Object.assign({}, base, d), copie: copie || 1, nota: nota || '' }); }
    if (R.id === 'vetrina-sx-sopra') {
      add('plexi-a5', 'Reclame principale', { mod: 'bf-reclame', valore: '−' + b.sconto + '%', desc: 'OCCHIALI DA SOLE', banda: 'SU TUTTA LA COLLEZIONE' });
      add('plexi-13x18', 'Secondo paio', { mod: 'bf-reclame', titolo: '2° PAIO', valore: '−50%', desc: 'sul secondo occhiale da vista', banda: 'SOLO BLACK FRIDAY' });
      add('cornice-13x18', 'Controllo della vista', { mod: 'bf-reclame', titolo: 'IN OMAGGIO', valore: 'CONTROLLO VISTA', desc: 'su appuntamento · 06 78346705', banda: '' }, 1, 'in cornice, stile tradizionale');
      L.push({ video: true, s: sup('tablet-13'), titolo: 'Tablet · video vetrina', nota: 'non si stampa: va col loop Black Friday' });
    } else if (R.id === 'vetrina-sx-sotto') {
      [b.b1, b.b2, b.b3].forEach(function (br) { var p = prodDi(br).sort(function (x, y) { return x.pieno - y.pieno; })[0] || PROD[0]; add('plexi-10x15', br + ' · gruppo', { mod: 'bf-brand', brand: br, pieno: p.pieno }, 1, 'davanti al gruppo di occhiali ' + br); });
      var singoli = [];
      [b.b1, b.b2, b.b3].forEach(function (br) { prodDi(br).forEach(function (p) { if (singoli.length < 4 && singoli.indexOf(p) < 0 && (singoli.length < 3 ? singoli.every(function (q) { return q.brand !== br; }) : true)) singoli.push(p); }); });
      prodDi(b.b1).forEach(function (p) { if (singoli.length < 4 && singoli.indexOf(p) < 0) singoli.push(p); });
      singoli.forEach(function (p) { add('plexi-a7', p.brand + ' ' + p.nome, { mod: 'bf-singolo', brand: p.brand, nome: p.nome, cod: p.cod, pieno: p.pieno, sconto: p.sconto || b.sconto }, 1, 'accanto al singolo occhiale'); });
    } else if (R.id === 'vetrina-dx-sopra') {
      add('plexi-a3', 'Pubblicità grande · tutti i brand', { mod: 'bf-tutti', sconto: b.grande }, 1, 'si vede dalla strada');
      add('appeso-a3', 'Scritta sospesa', { mod: 'bf-scritta', sconto: b.grande }, 1, 'appesa con i cavetti');
      add('vetrofania', 'Fascia sul vetro', { mod: 'bf-vetrofania', sconto: b.grande }, 1, 'vinile adesivo: in copisteria');
    } else if (R.id === 'vetrina-dx-sotto') {
      var f = prod(b.focus), dd = { brand: f.brand, nome: f.nome, cod: f.cod, pieno: f.pieno, sconto: f.sconto || b.sconto };
      add('cubo-10', 'Cubo · 4 facce', Object.assign({ mod: 'bf-cubo', faccia: 1 }, dd), 1, 'faccia 1: brand e modello');
      add('cubo-10', 'Cubo · faccia 2', Object.assign({ mod: 'bf-cubo', faccia: 2 }, dd), 1, 'lo sconto');
      add('cubo-10', 'Cubo · faccia 3', Object.assign({ mod: 'bf-cubo', faccia: 3 }, dd), 1, 'il prezzo');
      add('cubo-10', 'Cubo · faccia 4', Object.assign({ mod: 'bf-cubo', faccia: 4 }, dd), 1, 'il negozio');
      add('plexi-13x18', 'Focus · ' + f.brand + ' ' + f.nome, Object.assign({ mod: 'bf-focus' }, dd), 1, 'cartello principale del ripiano');
      (f.varianti || ['', '']).forEach(function (v) { add('plexi-a7', f.nome + (v ? ' · ' + v : ''), Object.assign({ mod: 'bf-singolo', variante: v }, dd), 1, 'davanti a ogni pezzo uguale'); });
    } else if (R.id === 'ingresso') {
      add('totem-a3', 'Totem da terra · benvenuti', { mod: 'bf-totem', sconto: b.grande }, 1, 'proposta: oggi in negozio non c\'è');
    }
    return L;
  }
  function lavoriDi(lista, anteprima) { return lista.filter(function (x) { return !x.video; }).map(function (x) { return { dim: x.s.stampa, html: htmlVoce(x, !anteprima), copie: x.copie, nome: x.s.nome }; }); }
  function grafica(R) {
    var V = window.BF_VETRINE; if (!V) return '';
    var k = [R.id, R.vetrina + ':' + R.piano, R.vetrina + '-' + R.piano, R.vetrina], v = null;
    for (var i = 0; i < k.length && !v; i++) v = V[k[i]] || (V.ripiani && V.ripiani[k[i]]);
    if (v && typeof v === 'object' && !Array.isArray(v)) v = v.anteprima || v.src || v.img || v.immagine || null;
    if (Array.isArray(v)) v = v[0] && (v[0].src || v[0].img || v[0]);
    return typeof v === 'string' && /^(data:|\.|\/|https?:|[\w-]+\/)/.test(v) ? '<figure class="cv-grafica"><img src="' + esc(v) + '" alt="Grafica del ripiano"><figcaption>Grafica del ripiano (studio grafico)</figcaption></figure>' : '';
  }
  function schemaNegozio(sel, statico) {
    function bt(id, cls, testo) { var R = rip(id), tag = statico ? 'span' : 'a'; return '<' + tag + ' class="cv-np ' + cls + (sel === id ? ' on' : '') + '"' + (statico ? '' : ' href="#creator/allestimento/' + id + '"') + '><b>' + esc(testo) + '</b><span>' + esc(R.breve) + '</span></' + tag + '>'; }
    return '<div class="cv-negozio" aria-label="Schema delle vetrine"><div class="cv-vt"><span class="cv-vn">VETRINA SINISTRA</span>' + bt('vetrina-sx-sopra', 'su', 'Sopra') + bt('vetrina-sx-sotto', 'giu', 'Sotto') + '</div>' +
      '<div class="cv-porta">' + bt('ingresso', 'in', 'Ingresso') + '</div>' +
      '<div class="cv-vt"><span class="cv-vn">VETRINA DESTRA</span>' + bt('vetrina-dx-sopra', 'su', 'Sopra') + bt('vetrina-dx-sotto', 'giu', 'Sotto') + '</div></div>';
  }
  function paginaAllestimento(r) {
    var b = bfDati(), R = rip(r.v), st = API.S();
    st.ed[API.rotta().chiave] = b;    // i campi scrivono direttamente nei dati Black Friday comuni a tutti i ripiani
    var c = API.campo;
    var impost = '<div class="blocco"><p class="blocco-t">Black Friday · per tutte le vetrine</p><div class="due">' + c('Sconto sui cartelli %', 'sconto', b.sconto, 'number', ' data-rr') + c('Sconto «tutti i brand» %', 'grande', b.grande, 'number', ' data-rr') + '</div>' + c('Date', 'data', b.data, 'text', ' data-rr') +
      (window.STILI ? window.STILI.selettore(b.stile, { setf: true, nota: 'Le grafiche pronte dello studio ci sono solo in «Nero e oro»: con gli altri stili si usano i modelli dell\'app.' }) : '<div class="campo"><span>Stile</span><div class="chips">' + [['bf', 'Nero e oro'], ['bfc', 'Chiaro (meno inchiostro)']].map(function (x) { return '<button type="button" class="chipb' + (b.stile === x[0] ? ' on' : '') + '" data-act="setf" data-f="stile" data-val="' + x[0] + '" data-rr>' + x[1] + '</button>'; }).join('') + '</div></div>') +   // aggancio stili.js
      (window.BF_VETRINE ? '<div class="campo"><span>Modelli</span><div class="chips">' + [['grafiche', 'Grafiche pronte dello studio'], ['app', 'Modelli dell\'app (modificabili)']].map(function (x) { return '<button type="button" class="chipb' + ((x[0] === 'grafiche') === b.usaGrafiche ? ' on' : '') + '" data-act="setf" data-f="fonte" data-val="' + x[0] + '" data-rr>' + x[1] + '</button>'; }).join('') + '</div></div>' : '') +
      '<div class="campo"><span>Fogli</span><div class="chips">' + [['A4', 'A4 · stampante del negozio'], ['A3', 'A3 · copisteria']].map(function (x) { return '<button type="button" class="chipb' + (b.foglio === x[0] ? ' on' : '') + '" data-act="setf" data-f="foglio" data-val="' + x[0] + '" data-rr>' + x[1] + '</button>'; }).join('') + '</div></div>' +
      '<p class="piccolo muto">Con l\'A4 i formati grandi (A3, vetrofania) escono a pezzi da unire: per quelli conviene la copisteria. Prezzi e percentuali sono <b>esempi</b> da confermare con Aldo. I brand sono scritte in stile, non loghi ufficiali.</p></div>';
    if (!R) {   /* panoramica */
      var tutti = [], righe = RIP.map(function (Rr) { var L = inserti(Rr, b); tutti = tutti.concat(L); var fo = impagina(lavoriDi(L, true), b.foglio).length; return '<a class="cv-riprow" href="#creator/allestimento/' + Rr.id + '"><b>' + esc(Rr.t) + '</b><span>' + esc(infoRip(Rr).ruolo || (DISP.allestimento.ingresso || {}).nome || '') + '</span><em>' + L.filter(function (x) { return !x.video; }).length + ' inserti · ' + fo + ' fogli ' + b.foglio + '</em><i>›</i></a>'; }).join('');
      var foT = impagina(lavoriDi(tutti, true), b.foglio).length;
      var p = '<div class="pannello glass cv-pann"><h2>Allestimento vetrine</h2><p class="muto">Tocca un ripiano: vedi cosa va messo, su quale supporto, e stampi tutto in una volta.</p>' + impost +
        '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="cvStampa" data-tutto="1">🖨 Stampa tutto l\'allestimento (' + foT + ' fogli ' + b.foglio + ')</button></div></div>';
      return { html: API.testa('Allestimento vetrine · Black Friday', 'Crea cartelli · sui supporti veri del negozio') + API.nota('cv-all', 'Le vetrine di Aldo, <b>ripiano per ripiano</b>: ogni inserto ha la forma e la misura del supporto vero (plexiglass, cornicette, cubo, totem…), le stesse del negozio in 3D.') +
          '<div class="strumento cv-strum">' + p + '<div class="tavolo glass"><div class="eti-ant"><span>Il negozio visto da fuori</span><span>scegli il ripiano</span></div>' + schemaNegozio('') + '<div class="cv-ripiani">' + righe + '</div></div></div>',
        cvLavori: function () { var T = []; RIP.forEach(function (Rr) { T = T.concat(inserti(Rr, bfDati())); }); return { lavori: lavoriDi(T), foglio: bfDati().foglio, titolo: 'Allestimento Black Friday · tutte le vetrine' }; } };
    }
    var info = infoRip(R), L = inserti(R, b), lav = lavoriDi(L, true), fogli = impagina(lav, b.foglio);
    var scelte = '';
    if (R.id === 'vetrina-sx-sotto') scelte = '<div class="blocco"><p class="blocco-t">I 3 brand del ripiano</p><div class="tre">' + ['b1', 'b2', 'b3'].map(function (f, i) { return c('Brand ' + (i + 1), f, API.opzioni(BRAND, b[f]), 'select', ' data-rr'); }).join('') + '</div></div>';
    if (R.id === 'vetrina-dx-sotto') scelte = '<div class="blocco"><p class="blocco-t">Il prodotto da spingere</p>' + c('Prodotto focus', 'focus', API.opzioni(PROD.map(function (p) { return [p.id, p.brand + ' ' + p.nome + ' (' + p.cod + ') · ' + euro(p.pieno)]; }), b.focus), 'select', ' data-rr') + '</div>';
    var lista = L.map(function (x, i) {
      var s = x.s;
      if (x.video) return '<div class="cv-voce video">' + supSVG(s, 70) + '<div class="cv-vt-t"><b>' + esc(x.titolo) + '</b><span>' + esc(s.nome) + ' · ' + misura(s) + '</span><span class="muto">' + esc(x.nota) + '</span><a class="btn sm" href="#creator/vetrina-bf">▶ Loop Black Friday</a></div></div>';
      return '<div class="cv-voce"><div class="cv-voce-ant">' + vistaIns(htmlVoce(x, false), s.stampa[0], s.stampa[1], 150) + '</div><div class="cv-vt-t"><b>' + esc(x.titolo) + '</b><span>' + esc(s.nome) + '</span><span class="mis">' + misura(s) + '</span><span class="muto">' + esc(x.nota) + ' · ' + x.copie + ' pz</span></div>' +
        '<button class="btn sm" type="button" data-act="cvStampa" data-i="' + i + '">🖨 Stampa solo questo</button></div>';
    }).join('');
    var idx = RIP.indexOf(R), prima = RIP[idx - 1], dopo = RIP[idx + 1];
    var p = '<div class="pannello glass cv-pann"><h2>' + esc(R.t) + '</h2><p class="cv-ruolo">' + esc(info.ruolo || (DISP.allestimento.ingresso || {}).nome || '') + '</p>' + (info.nota || (R.vetrina === 'ingresso' && DISP.allestimento.ingresso.nota) ? '<p class="piccolo muto">' + esc(info.nota || DISP.allestimento.ingresso.nota) + '</p>' : '') +
      (b.usaGrafiche ? '' : scelte) + impost +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="cvStampa" data-tutto="1">🖨 Stampa tutto il ripiano (' + fogli.length + ' fogli ' + b.foglio + ')</button>' +
      '<div class="riga-btn">' + (prima ? '<a class="btn" href="#creator/allestimento/' + prima.id + '">‹ ' + esc(prima.t) + '</a>' : '<a class="btn" href="#creator/allestimento">‹ Tutte le vetrine</a>') + (dopo ? '<a class="btn" href="#creator/allestimento/' + dopo.id + '">' + esc(dopo.t) + ' ›</a>' : '<a class="btn" href="#creator/allestimento">Tutte le vetrine ›</a>') + '</div></div></div>';
    var tav = '<div class="tavolo glass cv-tav-rip"><div class="eti-ant"><span>Cosa mettere su questo ripiano</span><span>' + L.filter(function (x) { return !x.video; }).length + ' inserti</span></div>' + schemaNegozio(R.id) + '<div class="cv-voci">' + lista + '</div>' +
      '<div class="eti-ant"><span>Primo foglio ' + b.foglio + ' da stampare</span><span>' + fogli.length + ' fogli</span></div>' + vistaFoglio(fogli[0], b.foglio) + '</div>';
    return { html: API.testa('Allestimento · ' + R.t, 'Allestimento vetrine · Black Friday', 'creator/allestimento') + '<div class="strumento cv-strum">' + p + tav + '</div>',
      cvLavori: function (el) { var LL = inserti(R, bfDati()); if (el && el.dataset.i != null && el.dataset.i !== '') LL = [LL[+el.dataset.i]]; return { lavori: lavoriDi(LL), foglio: bfDati().foglio, titolo: 'Allestimento Black Friday · ' + R.t }; } };
  }

  /* ---------------------------------------------------------------
     PAGINA · PREZZI DA STANGHETTA (bandierina / cartellino / clip)
     --------------------------------------------------------------- */
  var STANGHE = { bandierina: 'stanga-bandierina', cartellino: 'stanga-cartellino', clip: 'stanga-clip' };
  function righeDef() { return ['rb2140', 'rb3025', 'po0649', 'oo9102', 'ca1007', 'mk2024', 'gu-sole', 'vo5211'].map(function (id) { var p = prod(id); return { brand: p.brand, cod: p.cod, pieno: p.pieno, sc: p.sconto || '', q: 1 }; }); }
  function paginaStanghetta(r) {
    var v = STANGHE[r.v] ? r.v : 'bandierina', s = sup(STANGHE[v]);
    var d = API.ed({ sconto: 30, evento: 'BLACK FRIDAY', righe: righeDef(), uscita: 'adesivo', riempi: '', zoom: 4 });
    if (v !== 'bandierina' && d.uscita === 'dymo') d.uscita = 'cartoncino';
    var dim = dimStanga(s);
    function elenco() { var L = []; d.righe.forEach(function (rr) { for (var i = 0; i < Math.max(0, Math.round(n(rr.q))); i++) L.push(rr); }); if (d.riempi && L.length) { var per = layout(dim, 'A4').per, k = 0; while (L.length % per) L.push(L[k++ % L.length]); } return L; }
    function lavori() { return elenco().map(function (rr) { return { dim: dim, html: stanga(s, rr, d), copie: 1, nome: s.nome }; }); }
    function ant() {
      var r0 = d.righe[0] || righeDef()[0], one = stanga(s, r0, d), L = layout(dim, 'A4'), pag = impagina(lavori(), 'A4');
      var h = '<div class="cv-ant"><div class="cv-ant-sup">' + supSVG(s, 84) + '<div><b>' + esc(s.nome) + '</b><span>Stampa <b>' + misura(s) + '</b>' + (s.coda ? ' + coda ' + s.coda + ' mm' : '') + ' · ' + esc(s.uso) + '</span></div></div>' +
        '<div class="cv-zoom">' + vistaIns(one, dim[0], dim[1], 0, d.zoom) + '</div><p class="cv-cap">Ingrandita <b>×' + d.zoom + '</b> · rapporto esatto ' + dim[0] + ':' + dim[1] + '</p>' +
        '<div class="cv-vero"><span>Grandezza vera (circa, dipende dallo schermo):</span>' + one + '</div>';
      if (d.uscita === 'dymo') {
        h += '<div class="cv-rotolo">' + [0, 1, 2].map(function (i) { var rr = d.righe[i] || r0; return '<div class="cv-rot-et">' + vistaIns(stanga(s, rr, d), dim[0], dim[1], 0, 2) + '</div>'; }).join('') + '</div><p class="cv-cap">Rotolo DYMO a bandierina (per gioielleria/occhiali) · ' + elenco().length + ' etichette · modello del rotolo da verificare all\'ordine</p>';
      } else h += vistaFoglio(pag[0], 'A4') + '<p class="cv-cap">Foglio A4 ' + (d.uscita === 'adesivo' ? 'adesivo' : 'cartoncino') + ' · <b>' + spiegaLayout(L, 'A4') + '</b> · ' + pag.length + (pag.length === 1 ? ' foglio' : ' fogli') + '</p>';
      return h + '</div>';
    }
    var c = API.campo;
    var tab = '<div class="cv-righe"><div class="cv-riga cv-rtesta"><span>Brand</span><span>Codice breve</span><span>Prezzo pieno €</span><span>Sconto %</span><span>Quanti</span></div>' + d.righe.map(function (rr, i) {
      return '<div class="cv-riga"><select data-f="r' + i + 'b" aria-label="Brand">' + API.opzioni(BRAND, rr.brand) + '</select><input data-f="r' + i + 'c" value="' + esc(rr.cod) + '" aria-label="Codice breve"><input type="number" inputmode="decimal" data-f="r' + i + 'p" value="' + esc(rr.pieno) + '" aria-label="Prezzo pieno"><input type="number" inputmode="decimal" data-f="r' + i + 's" value="' + esc(rr.sc) + '" placeholder="' + esc(d.sconto) + '" aria-label="Sconto %"><input type="number" inputmode="numeric" min="0" data-f="r' + i + 'q" value="' + esc(rr.q) + '" aria-label="Quanti" data-rr></div>'; }).join('') + '</div>';
    var tot = elenco().length, nF = impagina(lavori(), 'A4').length;
    var p = '<div class="pannello glass cv-pann"><h2>Prezzi da stanghetta</h2>' +
      '<div class="blocco"><p class="blocco-t cv-passo"><b>1</b> Che tipo?</p><div class="cv-supporti tre">' + Object.keys(STANGHE).map(function (k) { var ss = sup(STANGHE[k]); return '<a class="cv-sup' + (k === v ? ' on' : '') + '" href="#creator/stanghetta/' + k + '">' + supSVG(ss, 64) + '<span class="t"><b>' + esc(ss.nome) + '</b><span class="mis">' + misura(ss) + '</span><span class="dv">' + esc(ss.uso) + '</span></span></a>'; }).join('') + '</div></div>' +
      '<div class="blocco"><p class="blocco-t cv-passo"><b>2</b> Scrivi</p><div class="due">' + c('Sconto % (righe senza sconto)', 'sconto', d.sconto, 'number') + c('Scritta (piccola)', 'evento', d.evento) + '</div>' + tab +
      '<p class="piccolo muto">Su ogni etichetta: prezzo pieno barrato, prezzo Black Friday, codice breve. Prezzi e sconti dei modelli noti vengono da un unico elenco (esempi da confermare con Aldo).</p></div>' +
      '<div class="blocco"><p class="blocco-t cv-passo"><b>3</b> Su cosa stampi?</p><div class="chips">' + [['adesivo', 'Foglio A4 adesivo'], ['cartoncino', 'Cartoncino A4']].concat(v === 'bandierina' ? [['dymo', 'DYMO (rotolo)']] : []).map(function (x) { return '<button type="button" class="chipb' + (d.uscita === x[0] ? ' on' : '') + '" data-act="setf" data-f="uscita" data-val="' + x[0] + '" data-rr>' + x[1] + '</button>'; }).join('') +
      (d.uscita !== 'dymo' ? '<button type="button" class="chipb' + (d.riempi ? ' on' : '') + '" data-act="setf" data-f="riempi" data-val="' + (d.riempi ? '' : '1') + '" data-rr>Riempi il foglio</button>' : '') + '</div>' +
      '<div class="campo" style="margin-top:12px"><span>Ingrandimento anteprima</span><div class="chips">' + [2, 4, 6].map(function (z) { return '<button type="button" class="chipb' + (+d.zoom === z ? ' on' : '') + '" data-act="setf" data-f="zoom" data-val="' + z + '" data-rr>×' + z + '</button>'; }).join('') + '</div></div></div>' +
      '<div class="blocco"><p class="blocco-t cv-passo"><b>4</b> Stampa</p><div class="pulsantiera">' + (d.uscita === 'dymo' ? '<button class="btn pri xl" type="button" data-act="cvDymo" data-n="' + tot + '">🏷 Stampa ' + tot + ' etichette DYMO</button>' : '<button class="btn pri xl" type="button" data-act="cvStampa">🖨 Stampa ' + nF + (nF === 1 ? ' foglio' : ' fogli') + ' A4 (' + tot + ' etichette)</button>') +
      '<a class="btn" href="#creator/dymo/doppio">🏷 Etichette DYMO per scatole e astucci</a></div>' +
      (v === 'bandierina' && d.uscita !== 'dymo' ? '<p class="piccolo muto">Col foglio adesivo si ritaglia la sagoma: più comodo il rotolo DYMO a bandierina, già fustellato.</p>' : '') + (v === 'cartellino' ? '<p class="piccolo muto">Il pallino è il foro per il filo elastico: si fa con la fustella a mano.</p>' : '') + '</div></div>';
    return {
      html: API.testa('Prezzi da stanghetta · ' + v, 'Cartellini · sulla stanghetta degli occhiali') + '<div class="strumento cv-strum">' + p + API.tavolo(s.nome + ' · ' + misura(s), ant(), 'anteprima') + '</div>',
      ant: ant,
      cvLavori: function () { return { lavori: lavori(), foglio: 'A4', titolo: 'Prezzi da stanghetta · ' + s.nome }; },
      cambia: function (f, val) { var m = /^r(\d+)([bcpqs])$/.exec(f); if (!m) return; var rr = d.righe[+m[1]]; if (!rr) return; if (m[2] === 'b') rr.brand = val; else if (m[2] === 'c') rr.cod = val; else if (m[2] === 'p') rr.pieno = n(val); else if (m[2] === 's') rr.sc = val === '' ? '' : n(val); else rr.q = Math.max(0, Math.round(n(val))); }
    };
  }

  /* ---------------------------------------------------------------
     AGGANCI per app.js
     --------------------------------------------------------------- */
  function installa(api) {
    API = api;
    API.tavolo = function (eti, dentro, dx) { return '<div class="tavolo glass cv-tavolo"><div class="eti-ant"><span>' + esc(eti) + '</span><span>' + esc(dx || 'anteprima') + '</span></div><div id="ant" style="width:100%;display:grid;justify-items:center">' + dentro + '</div></div>'; };
    api.PAG['creator/cartello'] = paginaCartello;
    api.PAG['creator/allestimento'] = paginaAllestimento;
    api.PAG['creator/stanghetta'] = paginaStanghetta;
    api.ACT.cvSup = function (el) { var d = API.S().ed[API.rotta().chiave]; if (!d) return; d.sup = el.dataset.val; d.copie = ''; d.foglio = 'A4'; API.render(); };
    api.ACT.cvStampa = function (el) { var c = API.corrente(); if (!c || !c.cvLavori) return; var j = c.cvLavori(el); stampaVera(impagina(j.lavori, j.foglio), j.foglio, j.titolo); };
    api.ACT.cvDymo = function (el) { API.stampaSim('Prezzi a bandierina', +el.dataset.n || 1, 'DYMO LabelWriter 450'); };
  }
  function schedaThumb(s, d) { return thumbIns(inserto(d, s), s.stampa[0], s.stampa[1]); }
  function estSezioni(modo, s) {
    if (modo !== 'creator' || !API) return s;
    try {
      var b = bfDati(), i = -1;
      s.forEach(function (x, k) { if (x.id === 'sec-promo') i = k; });
      var schede = false && [{ t: 'Tutte le vetrine ✦', h: 'creator/allestimento', tipo: 'BLACK FRIDAY', dorata: true, badge: 'SUPPORTI VERI', thumb: '<div class="thumb cv-thumb cv-thumb-neg">' + schemaNegozio('', true) + '</div>' }].concat(RIP.map(function (R) {
        var L = inserti(R, b).filter(function (x) { return !x.video; }), x = L[0];
        if (x && x.img) return { t: R.t.replace(' · ', ' '), h: 'creator/allestimento/' + R.id, tipo: x.s.stampa[0] + '×' + x.s.stampa[1] + ' MM', dorata: true, thumb: thumbIns(htmlVoce(x, false), x.s.stampa[0], x.s.stampa[1]) };
        return { t: R.t.replace(' · ', ' '), h: 'creator/allestimento/' + R.id, tipo: (x ? x.s.stampa[0] + '×' + x.s.stampa[1] + ' MM' : 'RIPIANO'), dorata: true, thumb: x ? schedaThumb(x.s, x.d) : '' };
      }));
      // 6/11/2026 (Fabrice): la zona ALLESTIMENTO VETRINE è tolta dal corpo della home (la pagina resta nel file, non raggiungibile)
      void schede; void i;
      s.forEach(function (x) {
        if (x.id !== 'sec-cartellini') return;
        Object.keys(STANGHE).forEach(function (k) { var ss = sup(STANGHE[k]); var r0 = righeDef()[0], dim = dimStanga(ss); x.schede.push({ t: 'Stanghetta · ' + k, h: 'creator/stanghetta/' + k, tipo: ss.stampa[0] + '×' + ss.stampa[1] + ' MM', thumb: '<div class="thumb cv-thumb cv-thumb-sg">' + supSVG(ss, 70) + '<div class="cv-tb" style="aspect-ratio:' + dim[0] + '/' + dim[1] + ';height:auto;width:' + (k === 'bandierina' ? 90 : 50) + '%"><div class="scala" data-w="' + (dim[0] * MM).toFixed(3) + '">' + stanga(ss, r0, { sconto: 30, evento: 'BLACK FRIDAY' }) + '</div></div></div>' }); });
      });
      s.forEach(function (x) {
        if (x.id !== 'sec-cartelli' && x.id !== 'sec-promo') return;
        x.schede.forEach(function (sk) { var m = /^creator\/cartello\/(\w+)$/.exec(sk.h); if (!m) return; var ss = sup(SUP_DEF[m[1]]); if (ss) sk.tipo = ss.nome.replace(/ \(.*\)/, '').replace('Porta-prezzi plexiglass', 'PLEXI').replace('Porta-cartello plexiglass', 'PLEXI').replace('Cornicetta in legno', 'CORNICE').replace('Cavalierino plexiglass', 'CAVALIERINO').toUpperCase(); });
      });
    } catch (e) { if (window.console) console.warn('cartelli: sezioni', e); }
    return s;
  }
  function estGruppi(G) {
    try {
      var v = function (t, h, extra) { var o = { t: t, h: h }; for (var k in extra) o[k] = extra[k]; return o; };
      var i = -1; G.forEach(function (g, k) { if (g.id === 'cartelli') i = k; });
      // 6/11/2026 (Fabrice): ALLESTIMENTO VETRINE tolto anche dal menu di sinistra
      void i;
      G.forEach(function (g) { if (g.id === 'cartellini') Object.keys(STANGHE).forEach(function (k) { g.voci.push(v('Stanghetta · ' + k, 'creator/stanghetta/' + k)); }); });
    } catch (e) { if (window.console) console.warn('cartelli: gruppi', e); }
    return G;
  }

  /* grafiche dei ripiani dell'altro agente (se il file c'è): caricate senza bloccare */
  (function () {
    if (window.BF_VETRINE) return;
    var sc = document.createElement('script'); sc.src = '../media/blackfriday/vetrine/bf-vetrine-data.js'; sc.async = true;
    sc.onload = function () { var h = location.hash || '#creator'; if (API && (/allestimento/.test(h) || /^#creator\/?$/.test(h))) API.render(); };
    sc.onerror = function () { sc.remove(); };
    (document.head || document.documentElement).appendChild(sc);
  })();

  window.CARTELLI_V2 = { installa: installa, sezioni: estSezioni, gruppi: estGruppi,
    // per le prove automatiche
    _prova: { layout: layout, impagina: impagina, inserto: inserto, stanga: stanga, sup: sup, inserti: function (id) { return inserti(rip(id), bfDati()); }, RIP: RIP } };
})();
