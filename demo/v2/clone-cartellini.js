/* =====================================================================
   OTTICA MACRÌ · DEMO V2 · CLONE STORE // CRAFT · CARTELLINI, ETICHETTE DYMO, STAMPE PRONTE (5/11/2026)
   Come luxury/cartellinivetrina.html, cartellinipromo.html, cartelliniquadrati.html, prezzivetrina.html, etichette.html:
   - Vetrina / Promozionali: foglio A4 orizzontale, 8 cartellini 59,5 mm in griglia 4 × 2 (foglio 282 × 196 mm, margine 4 mm).
   - Quadrati: 12 cartellini 60 × 60 mm (4 × 3, spazio 3 mm), cornice oro doppia.
   - Prezzi Vetrina: A4 verticale, 24 prezzi 60,03 × 29,97 mm (3 × 8, spazio 4,91 mm), si modifica per COLONNA, Fasce Prezzo.
   - Ogni cartellino: scheda #N con casella (escluso = posto vuoto in stampa), «Modifica Cartellino #N», dal magazzino.
   - Etichette DYMO 57 × 32 mm (rotolo 11354): 6 modelli adattati all'ottica, copie, stato della stampante, stampa a misura.
   ===================================================================== */
(function () {
  'use strict';
  var C = window.CLONE_SC, u = C.u, esc = u.esc, D = window.DATI || {}, API;
  var prezzo = u.prezzo, pc = u.pc, LOGO = C.LOGO, MM = C.MM;
  function dd() { return API.S().ed[API.rotta().chiave]; }
  function arts() { return (API.S().art || []).filter(function (a) { return a.cat === 'vista' || a.cat === 'sole'; }); }
  function artDa(cod) { return (API.S().art || []).filter(function (a) { return a.cod === cod; })[0]; }

  /* =====================================================================
     CARTELLINI
     ===================================================================== */
  var TK = {
    vetrina: { titolo: 'Cartellini Vetrina', voce: 'Vetrina', n: 8, griglia: 'land', tabs: 4 },
    promo: { titolo: 'Cartellini Promozionali', voce: 'Promozionali', n: 8, griglia: 'land', tabs: 4 },
    quadrati: { titolo: 'Cartellini Quadrati', voce: 'Quadrati', n: 12, griglia: 'quad', tabs: 4 },
    prezzi: { titolo: 'Prezzi Vetrina', voce: 'Prezzi Vetrina', n: 24, griglia: 'port', tabs: 3 }
  };
  var EVENTI = ['', 'SALDI ESTATE', 'SALDI INVERNO', 'SPECIAL SALE', 'BLACK FRIDAY', 'BLACK WEEK', 'ULTIMA SETTIMANA', 'BUONE FESTE'];
  var PROMO_SUB = ['', '50% + 50%', 'FINO A -50%', 'EXTRA SCONTO', 'PREZZO OUTLET', 'PREZZO FINALE', '2° PAIO -50%'];
  function defVetrina() {
    return [['Ray-Ban', 'Wayfarer', 'doppio', '159,00', '30', '111,30'], ['Persol', 'Occhiale da sole', 'promo', '', '', '215,00', 'SPECIAL DEAL'], ['Oakley', 'Holbrook', 'promo', '', '', '129,00', 'NOVITÀ'], ['Carrera', 'Occhiale da sole', 'doppio', '129,00', '25', '96,75'],
      ['Vogue Eyewear', 'Montatura da vista', 'promo', '', '', '99,00', 'SPECIAL DEAL'], ['Giorgio Armani', 'Montatura da vista', 'doppio', '230,00', '20', '184,00'], ['Michael Kors', 'Occhiale da sole', 'promo', '', '', '119,00', 'SALDI'], ['Guess', 'Occhiale da sole', 'doppio', '99,00', '30', '69,30']]
      .map(function (x) { return { on: true, brand: x[0], logo: '', desc: x[1], modo: x[2], orig: x[3], sconto: x[4], fin: x[5], preset: x[6] || 'SPECIAL DEAL' }; });
  }
  function defPromo() { return defVetrina().map(function (t, i) { return { on: true, brand: t.brand, logo: '', modo: 'orig', conSconto: i % 2 === 0, orig: t.orig || '149,00', sconto: '50', desc: t.desc, evento: i < 4 ? 'BLACK FRIDAY' : 'SALDI INVERNO', sub: i < 4 ? '' : '50% + 50%', fin: t.fin }; }); }
  function defQuadrati() { var b = ['Ray-Ban', 'Persol', 'Oakley', 'Carrera', 'Vogue Eyewear', 'Giorgio Armani']; var o = []; for (var i = 0; i < 12; i++) o.push({ on: true, modo: i % 3 === 0 ? 'doppio' : i % 3 === 1 ? 'desc' : 'brand', brand: b[i % b.length], logo: '', desc: ['Special Deal', 'Occhiale da sole', 'Montatura'][i % 3], orig: '149,00', sconto: '30', fin: ['104,30', '79,00', '129,00'][i % 3] }); return o; }
  function nuovo(v) { if (v === 'prezzi') return { sel: 0, col: [{ on: true, prezzo: '39,90', desc: 'Special Deal' }, { on: true, prezzo: '59,90', desc: 'Special Deal' }, { on: true, prezzo: '79,90', desc: 'Special Deal' }] }; return { sel: 0, sale: false, t: v === 'vetrina' ? defVetrina() : v === 'promo' ? defPromo() : defQuadrati() }; }

  function marchioOro(t, scala) { scala = scala * 1.9; return C.pezzi.marchio({ brand: t.brand || '', logo: t.logo || '' }, '', scala, 'sc-oro'); }
  function cartVetrina(t) {
    return '<div class="sc-tk sc-tk-v' + (t.on ? '' : ' sc-off') + '"><div class="sc-tk-brand">' + marchioOro(t, 0.42) + '</div><div class="sc-tk-c"><div class="sc-tk-desc" data-fit="12">' + C.pezzi.testoDesc(t.desc) + '</div>' +
      '<div class="sc-tk-riga">' + (t.modo === 'doppio' ? '<span class="sc-tk-od"><s>' + esc(prezzo(t.orig)) + '</s> <em>' + esc(pc(t.sconto)) + '</em></span>' : '<span class="sc-tk-pre">' + esc(t.preset || '') + '</span>') + '</div>' +
      '<div class="sc-tk-fin" data-fit="24">' + esc(prezzo(t.fin)) + '</div></div><div class="sc-tk-piede"><img src="' + LOGO + '" alt=""></div></div>';
  }
  function cartPromo(t) {
    var nero = /^BLACK/.test(t.evento || ''), uno = !(t.evento && t.sub);
    return '<div class="sc-tk sc-tk-p' + (nero ? ' nero' : '') + (t.on ? '' : ' sc-off') + '"><div class="sc-tk-brand">' + C.pezzi.marchio({ brand: t.brand || '', logo: t.logo || '' }, '', 0.76, nero ? 'sc-oro' : 'sc-rosso') + '</div><div class="sc-tk-c">' +
      (t.modo === 'desc' ? '<div class="sc-tk-art">' + esc(String(t.desc || '').charAt(0).toUpperCase() + String(t.desc || '').slice(1)) + '</div>' : '<div class="sc-tk-o"><s>' + esc(prezzo(t.orig)) + '</s>' + (t.conSconto ? '<em>' + esc(pc(t.sconto)) + '</em>' : '') + '</div>') +
      ((t.evento || t.sub) ? '<div class="sc-tk-banner">' + (t.evento ? '<b data-fit="10" style="font-size:' + (uno ? 28 : 15) + 'pt">' + esc(t.evento) + '</b>' : '') + (t.sub ? '<span data-fit="10" style="font-size:' + (uno ? 28 : 22) + 'pt">' + esc(t.sub) + '</span>' : '') + '</div>' : '') +
      '<div class="sc-tk-fin" data-fit="24">' + esc(prezzo(t.fin)) + '</div></div><div class="sc-tk-piede"><img src="' + LOGO + '" alt=""></div></div>';
  }
  function cartQuadrato(t, sale) {
    var cifre = String(Math.floor(u.leggiPrezzo(t.fin) || 0)).length, fs = cifre <= 2 ? 50 : 50 * 6 / (cifre + 4);
    return '<div class="sc-tk sc-tk-q' + (t.modo === 'brand' ? ' br' : '') + (sale ? ' sale' : '') + (t.on ? '' : ' sc-off') + '">' + (sale ? '<div class="sc-q-sale">SALDI</div>' : '') +
      (t.modo === 'brand' ? '<div class="sc-q-brand">' + marchioOro(t, 0.36) + '</div>' : '<div class="sc-q-top" data-fit="8">' + (t.modo === 'doppio' ? '<s>' + esc(prezzo(t.orig)) + '</s> <em>' + esc(pc(t.sconto)) + '</em>' : C.pezzi.testoDesc(t.desc)) + '</div>') +
      '<div class="sc-q-p"><span data-fit="20" style="font-size:' + fs.toFixed(1) + 'pt">' + esc(prezzo(t.fin)) + '</span></div>' + (t.modo === 'brand' ? '' : '<div class="sc-q-piede"><img src="' + LOGO + '" alt=""></div>') + '</div>';
  }
  function cartPrezzo(c) {
    var v = u.leggiPrezzo(c.prezzo);
    return '<div class="sc-tk sc-tk-pz' + (c.on ? '' : ' sc-off') + '"><div class="sc-pz-p" data-fit="14"><span class="e">€</span>' + (isNaN(v) ? '' : u.fmt2(v)) + '</div><div class="sc-pz-d" data-fit="8">' + esc(c.desc || '') + '</div></div>';
  }
  function foglioCartellini(v, d) {
    var st = C.stileCls(), h;
    if (v === 'prezzi') {
      var celle = ''; for (var i = 0; i < 24; i++) celle += cartPrezzo(d.col[i % 3]);
      return '<div class="sc-foglio sc-a4 ' + st + '" data-modello="cartellini-prezzi" style="padding:0"><div class="sc-g-pz">' + celle + '</div></div>';
    }
    var fn = v === 'vetrina' ? cartVetrina : v === 'promo' ? cartPromo : function (t) { return cartQuadrato(t, d.sale); };
    h = '<div class="sc-foglio sc-a4l ' + st + '" data-modello="cartellini-' + v + '"><div class="sc-land"><div class="' + (v === 'quadrati' ? 'sc-g-q' : 'sc-g-v') + '">' + d.t.map(function (t) { return '<div class="sc-cella">' + fn(t) + '</div>'; }).join('') + '</div></div></div>';
    return h;
  }
  function dimFoglio(v) { return v === 'prezzi' ? { w: 210, h: 297 } : { w: 297, h: 210 }; }
  C.foglioCartellini = function (v) { var d = nuovo(v), F = dimFoglio(v); return { html: foglioCartellini(v, d), w: F.w, h: F.h }; };

  function selettoreModo(t, scelte) { return '<div class="sc-sel2' + (scelte.length > 2 ? ' tre' : '') + '" role="group">' + scelte.map(function (s) { return '<button type="button" class="' + (t.modo === s[0] ? 'on' : '') + '" data-act="scTkSet" data-k="modo" data-v="' + s[0] + '" aria-pressed="' + (t.modo === s[0]) + '">' + s[1] + '</button>'; }).join('') + '</div>'; }
  function dalMagazzino() { return '<label class="campo"><span>Dal magazzino</span><select data-f="t.art"><option value="">-- Seleziona un articolo --</option>' + arts().map(function (a) { return '<option value="' + a.cod + '">' + esc(a.marca + ' ' + a.modello) + ' · € ' + u.fmt2(a.prezzo) + '</option>'; }).join('') + '</select></label>'; }
  function brandTk(t) { return C.menuBrand({ brand: t.brand, logo: t.logo }, '', 'BRAND').replace(/data-f="c\./g, 'data-f="t.'); }
  function paginaCartellini(r) {
    var v = TK[r.v] ? r.v : 'vetrina', T = TK[v], d = API.ed(nuovo(v));
    if (v === 'prezzi' && !d.col) Object.assign(d, nuovo(v)); if (v !== 'prezzi' && !d.t) Object.assign(d, nuovo(v));
    var p = '<div class="pannello glass sc-pann"><h2>' + esc(T.titolo) + '</h2>';
    if (v === 'prezzi') {
      p += '<div class="blocco"><p class="blocco-t">Modifica Pagina</p><label class="campo"><span>Fasce Prezzo</span><select data-f="fascia"><option value="">-- Seleziona Fascia Prezzo --</option><optgroup label="Prezzi tondi">' + ['10,00', '20,00', '30,00', '40,00', '50,00', '60,00', '70,00', '80,00', '90,00', '99,00'].map(function (x) { return '<option value="' + x + '">€ ' + x + '</option>'; }).join('') + '</optgroup><optgroup label="Prezzi ,90">' + ['19,90', '29,90', '39,90', '49,90', '59,90', '69,90', '79,90', '89,90'].map(function (x) { return '<option value="' + x + '">€ ' + x + '</option>'; }).join('') + '</optgroup></select></label></div>' +
        '<div class="sc-tabs" style="grid-template-columns:repeat(3,1fr)">' + d.col.map(function (c, i) { return '<div class="sc-tab' + (i === d.sel ? ' on' : '') + '"><button type="button" data-act="scTk" data-i="' + i + '">Colonna ' + (i + 1) + '</button><input type="checkbox" data-act="scTkOn" data-i="' + i + '"' + (c.on ? ' checked' : '') + ' aria-label="Stampa la colonna ' + (i + 1) + '"></div>'; }).join('') + '</div>';
      var c = d.col[d.sel];
      p += '<div class="blocco sc-ed"><p class="blocco-t">Modifica Colonna ' + (d.sel + 1) + '</p>' + C.campoP('Prezzo', 't.prezzo', c.prezzo, '30,00') + C.testiPronti(['Promozioni Cartellini', 'Promozioni'], 't.pronto', '') + C.campoT('Testo Libero', 't.desc', c.desc, ' maxlength="24"') + '<p class="piccolo muto">Gli 8 prezzi della colonna sono uguali.</p></div>';
    } else {
      p += '<div class="sc-tabs" style="grid-template-columns:repeat(' + T.tabs + ',1fr)">' + d.t.map(function (t, i) { return '<div class="sc-tab' + (i === d.sel ? ' on' : '') + '"><button type="button" data-act="scTk" data-i="' + i + '">#' + (i + 1) + '</button><input type="checkbox" data-act="scTkOn" data-i="' + i + '"' + (t.on ? ' checked' : '') + ' aria-label="Stampa il cartellino ' + (i + 1) + '"></div>'; }).join('') + '</div>';
      var t = d.t[d.sel];
      p += '<div class="blocco sc-ed"><p class="blocco-t">Modifica Cartellino #' + (d.sel + 1) + '</p>';
      if (v === 'vetrina') p += selettoreModo(t, [['promo', 'MODALITÀ<br>PROMO'], ['doppio', 'DOPPIO<br>PREZZO']]) + brandTk(t) + dalMagazzino() + C.testiPronti(['Articoli'], 't.pronto', '') + C.campoT('Testo Libero', 't.desc', t.desc, ' maxlength="30"') +
        (t.modo === 'promo' ? '<label class="campo"><span>Promozioni</span><select data-f="t.preset">' + C.TESTI['Promozioni Cartellini'].map(function (x) { return '<option' + (x === t.preset ? ' selected' : '') + '>' + x + '</option>'; }).join('') + '</select></label>' : '') +
        '<div class="tre sc-tre">' + (t.modo === 'doppio' ? C.campoP('Prezzo Originario', 't.orig', t.orig) + C.campoS('Sconto', 't.sconto', t.sconto) : '') + C.campoP('Prezzo Finale', 't.fin', t.fin) + '</div>';
      if (v === 'promo') p += selettoreModo(t, [['orig', 'PREZZO<br>ORIGINARIO'], ['desc', 'DESCRIZIONE<br>ARTICOLO']]) + (t.modo === 'orig' ? '<button type="button" class="sc-toggle' + (t.conSconto ? ' on' : '') + '" data-act="scTkSet" data-k="conSconto" data-v="' + (t.conSconto ? '' : '1') + '">' + (t.conSconto ? 'SCONTISTICA ATTIVA' : '+ AGGIUNGI SCONTISTICA') + '</button>' : '') + brandTk(t) + dalMagazzino() +
        (t.modo === 'orig' ? '<div class="due sempre">' + C.campoP('Prezzo Originario', 't.orig', t.orig) + (t.conSconto ? C.campoS('Sconto', 't.sconto', t.sconto) : '<span></span>') + '</div>' : C.testiPronti(['Articoli'], 't.pronto', '') + C.campoT('Testo Libero', 't.desc', t.desc, ' maxlength="30"')) +
        '<label class="campo"><span>Stagionalità / Evento</span><select data-f="t.evento">' + EVENTI.map(function (x) { return '<option value="' + x + '"' + (x === t.evento ? ' selected' : '') + '>' + (x || '— LASCIA IL CAMPO VUOTO —') + '</option>'; }).join('') + '</select></label>' +
        '<label class="campo"><span>Promozione</span><select data-f="t.subp">' + PROMO_SUB.map(function (x) { return '<option value="' + x + '"' + (x === t.sub ? ' selected' : '') + '>' + (x || '—') + '</option>'; }).join('') + '</select></label>' + C.campoT('Testo Libero', 't.sub', t.sub, ' maxlength="20"') + C.campoP('Prezzo Finale', 't.fin', t.fin);
      if (v === 'quadrati') p += selettoreModo(t, [['desc', 'DESCRIZIONE'], ['doppio', 'DOPPIO<br>PREZZO'], ['brand', 'BRAND']]) + (t.modo === 'brand' ? brandTk(t) : '') + dalMagazzino() +
        (t.modo === 'desc' ? C.testiPronti(['Articoli', 'Promozioni'], 't.pronto', '') + C.campoT('Testo Libero', 't.desc', t.desc, ' maxlength="24"') : t.modo === 'doppio' ? '<div class="due sempre">' + C.campoP('Prezzo Originario', 't.orig', t.orig) + C.campoS('Sconto', 't.sconto', t.sconto) + '</div>' : '') + C.campoP('Prezzo Finale', 't.fin', t.fin) +
        '<button type="button" class="sc-toggle' + (d.sale ? ' on' : '') + '" data-act="scTkSale">' + (d.sale ? 'TEMA SALDI ATTIVO (tutto il foglio)' : '+ TEMA SALDI (tutto il foglio)') + '</button>';
      p += '</div>';
    }
    p += '<div class="blocco">' + C.strumenti('STAMPA FOGLIO A4') + '</div></div>';
    var F = dimFoglio(v);
    function pag() { return { html: foglioCartellini(v, d), w: F.w, h: F.h }; }
    function ant() { return C.vista(pag(), v === 'prezzi' ? 'a4' : 'a4l'); }
    var nOn = (v === 'prezzi' ? d.col.filter(function (c) { return c.on; }).length * 8 : d.t.filter(function (t) { return t.on; }).length);
    return {
      html: API.testa(T.titolo, 'Crea cartellini') + '<div class="strumento sc-strum">' + p + API.tavolo('Foglio A4 ' + (v === 'prezzi' ? 'verticale' : 'orizzontale') + ' · ' + nOn + ' cartellini', ant(), F.w + ' × ' + F.h + ' mm') + '</div>',
      ant: ant, dati: true, tipo: 'Cartellini', pagine: function () { return [pag()]; }, titoloStampa: function () { return T.titolo + ' · ' + nOn + ' cartellini'; },
      cambia: function (f, val) {
        if (f === 'fascia') { if (val) { d.col.forEach(function (c) { c.prezzo = val; }); var e = document.querySelector('[data-f="t.prezzo"]'); if (e) e.value = val; var s = document.querySelector('[data-f="fascia"]'); if (s) s.value = ''; } C.salvaPresto(); return; }
        var p2 = f.split('.'); if (p2[0] !== 't') return;
        var x = v === 'prezzi' ? d.col[d.sel] : d.t[d.sel], k = p2[1];
        if (k === 'pronto') { if (val) { x.desc = val; var e2 = document.querySelector('[data-f="t.desc"]'); if (e2) e2.value = val; } }
        else if (k === 'brand') { x.brand = val; x.logo = ''; }
        else if (k === 'subp') { x.sub = val; var e3 = document.querySelector('[data-f="t.sub"]'); if (e3) e3.value = val; }
        else if (k === 'evento') { x.evento = val; if (/^BLACK/.test(val)) { x.sub = ''; var e4 = document.querySelector('[data-f="t.sub"]'); if (e4) e4.value = ''; } }
        else if (k === 'art') {
          var a = artDa(val); if (a) { x.brand = (D.MARCHE || []).indexOf(a.marca) >= 0 || C.marche().indexOf(a.marca) >= 0 ? a.marca : x.brand; x.logo = ''; x.desc = a.modello.replace(/\s\d+$/, ''); var pr = u.fmt2(a.prezzo); if (x.modo === 'doppio' || x.modo === 'orig') { x.orig = pr; x.fin = u.fmt2(a.prezzo * (1 - (+x.sconto || 0) / 100)); } else x.fin = pr; setTimeout(API.render, 0); }
        }
        else x[k] = val;
        if (v === 'vetrina' && x.modo === 'doppio' && (k === 'orig' || k === 'fin')) { var o = u.leggiPrezzo(x.orig), fi = u.leggiPrezzo(x.fin); if (o > fi && fi > 0) { x.sconto = String(Math.round((o - fi) / o * 100)); var e5 = document.querySelector('[data-f="t.sconto"]'); if (e5) e5.value = x.sconto; } }
        C.salvaPresto();
      }
    };
  }
  C.PAG['creator/cartellini'] = paginaCartellini;
  C.ACT.scTk = function (el) { var d = dd(); if (!d) return; d.sel = +el.dataset.i; API.render(); };
  C.ACT.scTkOn = function (el) { var d = dd(); if (!d) return; (d.col || d.t)[+el.dataset.i].on = el.checked; C.salvaPresto(); API.render(); };
  C.ACT.scTkSet = function (el) { var d = dd(); if (!d) return; var x = d.t[d.sel], v = el.dataset.v; x[el.dataset.k] = v === '1' ? true : v === '' ? false : v; C.salvaPresto(); API.render(); };
  C.ACT.scTkSale = function () { var d = dd(); if (!d) return; d.sale = !d.sale; C.salvaPresto(); API.render(); };

  /* =====================================================================
     ETICHETTE DYMO 57 × 32 mm (etichette.html)
     ===================================================================== */
  var DY = {
    doppio: { n: 1, titolo: 'Doppio Prezzo', campi: ['brand', 'orig', 'sconto', 'fin'] },
    finale: { n: 2, titolo: 'Prezzo Finale', campi: ['brand', 'testo', 'fin'] },
    ultimi: { n: 3, titolo: 'Ultimi Pezzi', campi: ['fin'] },
    label: { n: 4, titolo: 'Ottica Macrì Label', campi: ['fin'] },
    paio: { n: 5, titolo: 'Promo 2° Paio', campi: ['orig', 'scontato', 'fin'] },
    calibro: { n: 6, titolo: 'Calibro | Doppia Cifra', campi: ['misure', 'testo', 'orig', 'sconto', 'fin'] }
  };
  C.DY = DY;
  var ALIAS = { doppioprezzo: 'doppio', outlet: 'doppio', finalprice: 'finale', final: 'finale', lastchance: 'ultimi', promo: 'ultimi', luxury: 'label', promo50: 'paio', tagliedoppiacifra: 'calibro', taglie: 'calibro' };
  function dyDef(tpl) {
    var a = (API && API.S().art || [])[tpl === 'calibro' ? 4 : 0] || {};
    return { tpl: tpl, brand: a.marca || 'Ray-Ban', logo: '', orig: '159,00', sconto: '30', scontato: '79,50', fin: tpl === 'calibro' ? '111,30' : tpl === 'paio' ? '238,50' : '111,30', testo: tpl === 'finale' ? 'PREZZO FINALE' : 'OCCHIALE DA SOLE • ' + (a.cal ? a.cal + '□' + a.ponte : 'PROMO'), cal: a.cal || 54, ponte: a.ponte || 20, asta: 145, n: 1, art: '' };
  }
  function euroCol(lab, v, fs, peso) { return '<span class="sc-dy-eu"><small>Euro</small><b style="font-size:' + fs + 'pt;font-weight:' + (peso || 400) + '">' + esc(u.norm(v)) + '</b></span>'; }
  function qrNeg() { var n = (API.S().negozio || {}).facebook || 'facebook.com/OtticaMacri'; return C.qr('https://' + n.replace(/^https?:\/\//, ''), 300); }
  function etichetta(d) {
    var t = d.tpl, h = '<div class="sc-dymo ' + C.stileCls() + '" data-modello="dymo-' + t + '"><div class="sc-dyw"><div class="sc-dy sc-dy-' + t + '">';
    var br = '<div class="sc-dy-br">' + C.pezzi.marchio({ brand: d.brand, logo: d.logo }, '', 0.34, 'sc-nero') + '</div>';
    if (t === 'doppio' || t === 'finale') {
      h += '<div class="sc-dy-alto">' + br + '<img class="sc-dy-qr" src="' + qrNeg() + '" alt=""></div><div class="sc-dy-basso">';
      if (t === 'doppio') h += euroCol('', d.orig, 13) + '<span class="sc-dy-sc">' + esc(pc(d.sconto)) + '</span>' + euroCol('', d.fin, 17, 700);
      else h += '<span class="sc-dy-tx">' + esc(d.testo) + '</span>' + euroCol('', d.fin, 18, 800);
      h += '</div>';
    } else if (t === 'ultimi' || t === 'label') {
      h += '<div class="sc-dy-logo">' + (t === 'ultimi' ? '<span class="sc-dy-lc"><b>ULTIMI</b><b>PEZZI</b></span>' : '<img src="' + LOGO + '" alt="Ottica Macrì">') + '</div>' + euroCol('', d.fin, 19, 800);
    } else if (t === 'paio') {
      h += '<div class="sc-dy-p-alto">' + euroCol('', d.orig, 13.5) + '<span class="sc-dy-sc" style="font-size:13.5pt;font-weight:400">-50%</span>' + euroCol('', d.scontato, 13.5) + '</div>' +
        '<div class="sc-dy-banda"><div class="sc-dy-bsx"><small>PROMOZIONE</small><small class="g">2° PAIO</small><b>-50%</b></div>' + euroCol('', d.fin, 23, 800) + '</div>';
    } else {
      var fin = prezzo(d.fin), L = fin.length, fs = L <= 7 ? 25 : L === 8 ? 22 : L === 9 ? 19.5 : L === 10 ? 17 : 14.5;
      h += '<div class="sc-dy-mis"><small>MISURE</small><div class="sc-dy-box"><i>CAL</i><b>' + esc(d.cal) + '</b><i>PON</i><b>' + esc(d.ponte) + '</b><i>ASTA</i><b>' + esc(d.asta) + '</b></div></div>' +
        '<div class="sc-dy-dx"><div class="sc-dy-r1"><span>' + esc(prezzo(d.orig)) + '</span><b>' + esc(pc(d.sconto)) + '</b></div><div class="sc-dy-fin" style="font-size:' + fs + 'pt">' + esc(fin) + '</div><div class="sc-dy-ft" data-fit="5">' + esc(d.testo) + '</div></div>';
    }
    return h + '</div></div></div>';
  }
  C.etichetta = function (tpl) { return { html: etichetta(dyDef(tpl)), w: 57, h: 32 }; };
  var dymoStato = { ok: null, nome: '', controllo: false };
  function cercaDymo(fatto) {
    // servizio DYMO Connect sul computer (come dymo-direct.js): se risponde, la LabelWriter è collegata
    dymoStato.controllo = true; var finito = false;
    function fine(ok, nome) { if (finito) return; finito = true; dymoStato.ok = ok; dymoStato.nome = nome || ''; dymoStato.controllo = false; if (fatto) fatto(); }
    try {
      var ctl = window.AbortController ? new AbortController() : null; setTimeout(function () { if (ctl) ctl.abort(); fine(false); }, 3000);
      fetch('https://127.0.0.1:41951/DYMO/DLS/Printing/GetPrinters', ctl ? { signal: ctl.signal } : {}).then(function (r) { return r.text(); }).then(function (t) {
        var m = /<Name>([^<]+)<\/Name>[\s\S]*?<IsConnected>True<\/IsConnected>/i.exec(t); fine(!!m, m ? m[1] : '');
      }).catch(function () { fine(false); });
    } catch (e) { fine(false); }
  }
  function statoHTML() {
    var s = dymoStato, badge = s.controllo ? 'CONTROLLO…' : s.ok ? 'CONNESSA' : s.ok === false ? 'NON TROVATA' : '—';
    return '<div class="sc-dy-stato' + (s.ok ? ' ok' : '') + '"><div><b>Stampante DYMO</b><span>' + (s.ok ? esc(s.nome) : 'Colleghi e accenda la LabelWriter 450 · si stampa anche dalla finestra di stampa scegliendo la DYMO') + '</span></div><em>' + badge + '</em></div>' +
      '<button class="btn sm wide" type="button" data-act="scDyCheck">🔄 Ricontrolla stampante DYMO</button>';
  }
  function paginaDymo(r) {
    var tpl = DY[r.v] ? r.v : (ALIAS[String(r.v || '').toLowerCase()] || 'calibro'), T = DY[tpl];
    var d = API.ed(dyDef(tpl)); d.tpl = tpl;
    if (dymoStato.ok === null && !dymoStato.controllo) cercaDymo(function () { var e = document.querySelector('[data-sc-dystato]'); if (e) e.innerHTML = statoHTML(); });
    var gal = '<div class="card glass sc-dy-gal"><a class="btn sm wide" href="#creator/cronologia/Etichette">🕘 Cronologia di Stampa</a><p class="blocco-t" style="margin:14px 0 8px">Galleria Modelli (57x32)</p>' + Object.keys(DY).map(function (k) {
      return '<a class="sc-dy-mod' + (k === tpl ? ' on' : '') + '" href="#creator/dymo/' + k + '"><b>' + DY[k].n + '. ' + esc(DY[k].titolo) + '</b>' + C.mini(C.etichetta(k)) + '</a>'; }).join('') + '</div>';
    var f = T.campi, p = '<div class="pannello glass sc-pann"><h2>Etichette DYMO</h2><p class="muto" style="margin:0 0 10px">Stampa Diretta 57×32mm (11354)</p><div class="blocco" data-sc-dystato>' + statoHTML() + '</div><div class="blocco">';
    if (!API.PB) p += '<label class="campo"><span>Dal magazzino</span><select data-f="art"><option value="">-- Seleziona un articolo --</option>' + (API.S().art || []).filter(function (a) { return a.cat !== 'lenti'; }).map(function (a) { return '<option value="' + a.cod + '"' + (a.cod === d.art ? ' selected' : '') + '>' + esc(a.marca + ' ' + a.modello) + '</option>'; }).join('') + '</select></label>';
    if (f.indexOf('brand') >= 0) p += C.menuBrand({ brand: d.brand, logo: d.logo }, '', 'Brand Ufficiale').replace(/data-f="c\./g, 'data-f="');
    if (f.indexOf('misure') >= 0) p += '<p class="blocco-t">Misure montatura (3 riquadri)</p><div class="tre sempre">' + C.campoT('Calibro', 'cal', d.cal, ' inputmode="numeric" maxlength="3"') + C.campoT('Ponte', 'ponte', d.ponte, ' inputmode="numeric" maxlength="3"') + C.campoT('Asta', 'asta', d.asta, ' inputmode="numeric" maxlength="3"') + '</div>';
    if (f.indexOf('testo') >= 0) p += C.campoT(tpl === 'finale' ? 'Testo personalizzato' : 'Frase descrittiva / Testo libero', 'testo', d.testo, ' maxlength="34" style="text-transform:uppercase"');
    if (f.indexOf('orig') >= 0) p += '<div class="' + (f.indexOf('scontato') >= 0 || f.indexOf('sconto') >= 0 ? 'due sempre' : '') + '">' + C.campoP(tpl === 'paio' ? 'Prezzo 1° paio' : 'Prezzo Originario', 'orig', d.orig) + (f.indexOf('sconto') >= 0 ? C.campoS('Sconto', 'sconto', d.sconto, '30') : '') + (f.indexOf('scontato') >= 0 ? C.campoP('2° paio a -50%', 'scontato', d.scontato) : '') + '</div>';
    p += C.campoP(tpl === 'paio' ? 'Prezzo della coppia' : (tpl === 'doppio' ? 'Prezzo Outlet / Finale' : 'Prezzo Finale'), 'fin', d.fin) +
      '<label class="campo"><span>Numero di etichette da stampare</span><input type="number" min="1" max="99" data-f="n" value="' + (d.n || 1) + '"></label></div>' +
      '<div class="blocco">' + C.strumenti('STAMPA ETICHETTA') + '</div></div>';
    function pag() { return { html: etichetta(d), w: 57, h: 32 }; }
    function ant() { return '<div class="sc-dy-ant">' + C.vista(pag(), 'dymo') + '</div>'; }
    return {
      html: API.testa('Etichette DYMO · ' + T.titolo, 'Etichette') + '<div class="sc-dy-pag">' + gal + p + API.tavolo('Anteprima etichetta 11354 (57 x 32 mm)', ant(), 'misura vera') + '</div>',
      ant: ant, dati: true, tipo: 'Etichette',
      pagine: function () { var x = pag(); x.copie = Math.max(1, Math.min(99, parseInt(d.n, 10) || 1)); return [x]; },
      titoloStampa: function () { return 'Etichetta DYMO ' + T.titolo + ' · € ' + u.norm(d.fin) + ' ×' + (d.n || 1); },
      cambia: function (k, v) {
        if (k === 'brand') { d.brand = v; d.logo = ''; } else if (k === 'testo') d.testo = String(v).toUpperCase();
        else if (k === 'art') { var a = artDa(v); d.art = v; if (a) { d.brand = a.marca; d.logo = ''; d.cal = a.cal || d.cal; d.ponte = a.ponte || d.ponte; d.orig = u.fmt2(a.prezzo); d.fin = u.fmt2(a.prezzo * (1 - (+d.sconto || 0) / 100)); d.scontato = u.fmt2(a.prezzo / 2); setTimeout(API.render, 0); } }
        else d[k] = v;
        // sconto automatico quando il prezzo originario è più alto del finale (non nel 2° paio)
        if ((k === 'orig' || k === 'fin') && tpl !== 'paio' && f.indexOf('sconto') >= 0) { var o = u.leggiPrezzo(d.orig), fi = u.leggiPrezzo(d.fin); if (o > fi && fi > 0) { d.sconto = String(Math.round((o - fi) / o * 100)); var e = document.querySelector('[data-f="sconto"]'); if (e) e.value = d.sconto; } }
        if (tpl === 'paio' && k === 'orig') { var o2 = u.leggiPrezzo(v); if (!isNaN(o2)) { d.scontato = u.fmt2(o2 / 2); d.fin = u.fmt2(o2 * 1.5); setTimeout(API.render, 0); } }
        C.salvaPresto();
      }
    };
  }
  C.PAG['creator/dymo'] = paginaDymo;
  C.ACT.scDyCheck = function () { cercaDymo(function () { var e = document.querySelector('[data-sc-dystato]'); if (e) e.innerHTML = statoHTML(); API.toast(dymoStato.ok ? 'DYMO trovata: ' + dymoStato.nome : 'DYMO non trovata: si stampa dalla finestra di stampa'); }); var e = document.querySelector('[data-sc-dystato]'); if (e) e.innerHTML = statoHTML(); };
  C.ACT.stampaDymo = function () { API.ACT.stampa(); };

  /* =====================================================================
     STAMPE PRONTE · ALLESTIMENTI PRONTI · PROMO BLACK FRIDAY (grafiche)
     ===================================================================== */
  C.STAMPE = { orari: ['Orari Apertura', '🕒'], controllo: ['Controllo Vista', '👁'], listino: ['Listino Lenti', '📄'], garanzia: ['Garanzia 2 Anni', '🛡'], pagamenti: ['Pagamenti', '💳'], cura: ['Pulizia Occhiali', '🧽'], staff: ['Staff Only', '🔒'], fumo: ['Vietato Fumare', '🚭'] };
  C.PAG['creator/stampa'] = function (r) {
    var id = C.STAMPE[r.v] ? r.v : 'orari', T = C.STAMPE[id];
    function pag() { return C.daPx(API.posterHTML(id)); }
    var p = '<div class="pannello glass"><h2>' + esc(T[0]) + '</h2><p class="muto">Foglio A4 già pronto, con i dati del negozio presi da AMMINISTRAZIONE › Dati del negozio.</p>' + (id === 'orari' ? '<p class="piccolo muto">' + esc((API.S().negozio || {}).orariNota || '') + '</p>' : '') +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="stampa">🖨 Stampa (.PDF)</button><button class="btn" type="button" data-act="aggiungiLista">＋ Aggiungi a lista stampa</button><a class="btn" href="#creator/lista">☰ Gestisci lista di stampa (<span data-sc-nlista>' + C.nLista() + '</span>)</a></div>' +
      '<p class="piccolo muto">Come in STORE // CRAFT le stampe pronte non finiscono nella cronologia dei cartelli: le trovi in «Stampe pronte».</p></div>';
    return { html: API.testa(T[0], 'Stampe pronte // Listini & Punto Vendita') + '<div class="strumento">' + p + API.tavolo('PDF · A4 · 210 × 297 mm', C.vista(pag(), 'a4')) + '</div>', tipo: 'Stampe pronte', pagine: function () { return [pag()]; }, titoloStampa: function () { return T[0] + ' · A4'; } };
  };
  var SETS = { 'set-bf': ['Set Black Friday ✦', '4 cartelli Black Friday · 8 cartellini promozionali · 6 etichette'], 'set-saldi': ['Set Saldi ✦', '2 cartelli Saldi · 1 foglio di cartellini · 1 foglio prezzi'], 'set-natale': ['Set Natale ✦', '2 Xmas Ball · 12 quadrati'], 'set-school': ['Set Back to School ✦', '2 cartelli Back to School · 8 cartellini'] };
  C.SETS = SETS;
  function fogliSet(id) {
    var BF = window.BF || {}, f = [];
    if (id === 'set-bf') {
      ['bf-cartello-1', 'bf-cartello-2', 'bf-cartello-3', 'bf-cartello-4'].forEach(function (k) { if (BF[k + '-chiaro'] || BF[k]) f.push({ html: '<img src="' + (BF[k + '-chiaro'] || BF[k]) + '" alt="" style="display:block;width:210mm;height:297mm;object-fit:contain">', w: 210, h: 297 }); });
      if (!f.length) f.push(C.paginaModello('blackfriday'));
      var p = C.foglioCartellini('promo'); f.push(p);
    } else if (id === 'set-saldi') { f.push(C.paginaModello('saldi')); f.push(C.foglioCartellini('vetrina')); f.push(C.foglioCartellini('prezzi')); }
    else if (id === 'set-natale') { f.push(C.paginaModello('natale')); f.push(C.foglioCartellini('quadrati')); }
    else { f.push(C.paginaModello('school')); f.push(C.foglioCartellini('vetrina')); }
    return f;
  }
  C.PAG['creator/set'] = function (r) {
    var id = SETS[r.v] ? r.v : 'set-bf', t = SETS[id], F = fogliSet(id);
    var p = '<div class="pannello glass"><h2>' + esc(t[0].replace(' ✦', '')) + '</h2><p class="muto">Un allestimento completo in un colpo solo: ' + esc(t[1]) + '.</p><p class="piccolo muto">Basta premere STAMPA: i fogli escono in fila, ognuno alla sua misura.</p>' +
      '<div class="pulsantiera"><button class="btn pri xl" type="button" data-act="stampa">🖨 Stampa tutto il set (' + F.length + ' fogli)</button><button class="btn" type="button" data-act="aggiungiLista">＋ Aggiungi tutto a lista stampa</button></div></div>';
    return { html: API.testa(t[0], "Allestimenti pronti // Fast 'N' Beautiful") + '<div class="strumento">' + p + '<div class="tavolo glass"><div class="eti-ant"><span>' + F.length + ' fogli</span><span>anteprima</span></div><div class="sc-fogli">' + F.map(function (x, i) { return '<div class="fl"><b>Foglio ' + (i + 1) + ' · ' + x.w + ' × ' + x.h + ' mm</b>' + C.vista(x, x.w > x.h ? 'a4l' : 'a4') + '</div>'; }).join('') + '</div></div></div>',
      tipo: 'Promo', pagine: function () { return F; }, titoloStampa: function () { return t[0].replace(' ✦', '') + ' · ' + F.length + ' fogli'; } };
  };
  // Black Friday con grafiche pronte: stessa pagina di app.js, con stampa vera
  C.dopoInstalla.push(function (api) {
    API = api;
    var vecchia = api.PAG['creator/promo-bf'];
    if (vecchia) api.PAG['creator/promo-bf'] = function (r) { var o = vecchia(r); o.tipo = 'Promo'; o.pagine = function () { var f = o.foglio(); return [C.daPx(f.html)]; }; o.titoloStampa = function () { return o.foglio().titolo; }; return o; };
  });

  /* =====================================================================
     DASHBOARD: schede e menu laterale del CREATOR (come assets/negozi/<negozio>-dashboard.js)
     ===================================================================== */
  function thumbFoglio(p, cls) { return '<div class="thumb ' + (cls || '') + '"><div class="scala" data-w="' + (p.w * MM).toFixed(2) + '"><div class="sc-carta" style="width:' + p.w + 'mm;height:' + p.h + 'mm">' + p.html + '</div></div></div>'; }
  C.sezioni = function (modo, s) {
    if (modo !== 'creator' || !API) return s;
    try {
      var M = C.MOD;
      s.forEach(function (x) {
        if (x.id === 'sec-cartelli') x.schede = C.CARTELLI.map(function (k) { return { t: M[k].voce, h: 'creator/cartello/' + k, tipo: k === 'paletto' ? 'PALETTO FERRO' : 'CARTELLO', thumb: C.thumbModello(k) }; });
        if (x.id === 'sec-promo') x.schede = C.PROMO.map(function (k) { return { t: M[k].voce + ' ✦', h: 'creator/promo/' + k, tipo: k === 'multibrand' || k === 'saldi' || k === 'school' ? 'FASCE COLORE' : k === 'blackfriday' ? 'BLACK FRIDAY' : 'CHRISTMAS', thumb: C.thumbModello(k), dorata: true, badge: k === 'blackfriday' ? 'ALTO IMPATTO' : 'MENU SPECIALE' }; })
          .concat(x.schede.filter(function (sk) { return sk.h === 'creator/promo-bf'; }).map(function (sk) { sk.t = 'Black Friday grafiche ✦'; return sk; }));
        if (x.id === 'sec-cartellini') x.schede = Object.keys(TK).map(function (k) { return { t: TK[k].voce, h: 'creator/cartellini/' + k, tipo: 'CARTELLINI', thumb: thumbFoglio(C.foglioCartellini(k), k === 'prezzi' ? 'sc-thumb-pz' : 'sc-thumb-l') }; })
          .concat(x.schede.filter(function (sk) { return /stanghetta/.test(sk.h); }));
        if (x.id === 'sec-dymo') x.schede = Object.keys(DY).map(function (k) { return { t: DY[k].titolo, h: 'creator/dymo/' + k, tipo: '57 x 32 MM', thumb: thumbFoglio(C.etichetta(k), 'dymo') }; });
        if (x.id === 'sec-set') x.schede = Object.keys(SETS).map(function (k) { var F = fogliSet(k); return { t: SETS[k][0], h: 'creator/set/' + k, tipo: 'SET', dorata: true, thumb: thumbFoglio(F[0], 'sc-thumb-a4top'), spec: [SETS[k][1]] }; });
      });
    } catch (e) { if (window.console) console.warn('clone: sezioni', e); }
    return s;
  };
  C.gruppi = function (G) {
    try {
      var M = C.MOD, v = function (t, h, extra) { var o = { t: t, h: h }; for (var k in extra) o[k] = extra[k]; return o; };
      G.forEach(function (g) {
        if (g.id === 'cartelli') { g.voci = C.CARTELLI.map(function (k) { return v(M[k].voce, 'creator/cartello/' + k); }); if (g.sub) g.sub.voci = C.PROMO.map(function (k) { return v(M[k].voce, 'creator/promo/' + k, { stella: true }); }).concat([v('Black Friday grafiche', 'creator/promo-bf', { stella: true })]); }
        if (g.id === 'cartellini') g.voci = Object.keys(TK).map(function (k) { return v(TK[k].voce, 'creator/cartellini/' + k); }).concat(g.voci.filter(function (x) { return /stanghetta/.test(x.h); }));
        if (g.id === 'etichette') g.voci = Object.keys(DY).map(function (k) { return v(DY[k].n + '. ' + DY[k].titolo, 'creator/dymo/' + k); });
        if (g.id === 'loghi') g.voci = [v('Genera Loghi', 'creator/loghi-importa'), v('Gestisci Lista', 'creator/loghi')];
      });
    } catch (e) { if (window.console) console.warn('clone: gruppi', e); }
    return G;
  };

  /* prima apertura: la cronologia ha già qualche stampa di esempio (fogli veri) */
  C.seme = function () {
    var S = API.S(); if (S.storicoSeme) return; S.storicoSeme = 1;
    try {
      var ora = Date.now(); S.storico = S.storico || [];
      var es = [[C.paginaModello('percentuale'), 'Cartello Percentuale · Fino ad esaurimento scorte', 'Cartelli', 2 * 36e5], [C.foglioCartellini('vetrina'), 'Cartellini Vetrina · 8 cartellini', 'Cartellini', 26 * 36e5], [C.etichetta('calibro'), 'Etichetta DYMO Calibro | Doppia Cifra · € 111,30 ×6', 'Etichette', 50 * 36e5], [C.paginaModello('blackfriday'), 'Black Friday · Ray-Ban', 'Promo', 74 * 36e5]];
      es.forEach(function (e, i) { var pg = C.pagineFinite([e[0]]); S.storico.push({ id: 'seme' + i, t: ora - e[3], prima: ora - e[3], titolo: e[1], tipo: e[2], pagine: pg, imp: 'seme' + i, volte: i === 2 ? 2 : 1, giorni: {} }); });
    } catch (e) { if (window.console) console.warn('clone: seme', e); }
  };
  C.dopoInstalla.push(function (api) { API = api; C.seme(); });
})();
