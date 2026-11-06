/* =====================================================================
   OTTICA MACRÌ · DEMO V2 · CLONE STORE // CRAFT · CREA CARTELLI e PROMO STAGIONALI (5/11/2026)
   Stessa impaginazione delle pagine luxury/cartelli_*.html di STORE // CRAFT (misure in mm sul foglio A4):
   Semplice, Outlet, Outlet Multi, Multi Brand (doppia referenza), Percentuale (+ 2° Paio), Ultimi Pezzi (Last Chance),
   Paletto 15x10 (cartello da banco), Indicazioni (cartello magazzino), Promo Multibrand, Black Friday, Natale (Xmas Ball).
   Pannello come l'originale: CARTELLO SUPERIORE / INFERIORE, + AGGIUNGI 2° BRAND, BRAND + Loghi Personali, Claim,
   Testi Pronti + Testo Libero, prezzi in € a 2 decimali, temi del singolo cartello (Made in Italy, Black Friday, Natale),
   COPIA SU ALTRO CARTELLO, 2 CARTELLI (Foglio A4) / 1 CARTELLO, STAMPA CARTELLI (stampa vera) + lista di stampa.
   ===================================================================== */
(function () {
  'use strict';
  var C = window.CLONE_SC, u = C.u, esc = u.esc, D = window.DATI || {}, API;
  var prezzo = u.prezzo, pc = u.pc, LOGO = C.LOGO;
  var PRIORITARI = ['Ray-Ban', 'Persol', 'Oakley'];
  function marche() { var m = (D.MARCHE || []).filter(function (x) { return x && x !== 'Ottica Macrì'; }); PRIORITARI.forEach(function (p) { if (m.indexOf(p) < 0) m.unshift(p); }); return PRIORITARI.concat(m.filter(function (x) { return PRIORITARI.indexOf(x) < 0; }).sort()); }
  C.marche = marche;
  var TESTI = {
    Promozioni: ['Special Deal', 'Prezzo Finale', 'Saldi Estate', 'Saldi Inverno', 'Black Friday', 'Made in Italy', 'Fino ad esaurimento scorte', 'Su una selezione di modelli', 'Montatura + lenti', 'Lenti comprese'],
    Articoli: ['Occhiali da vista completi', 'Montature da vista', 'Occhiali da sole', 'Occhiali da sole polarizzati', 'Lenti progressive', 'Lenti fotocromatiche', 'Lenti a contatto mensili', 'Lenti a contatto giornaliere', 'Occhiali da vista bambino', 'Montature in titanio', 'Clip-on da sole', 'Liquido per lenti a contatto'],
    'Promozioni Cartellini': ['SPECIAL DEAL', 'PREZZO FINALE', 'SALDI', 'BLACK FRIDAY', 'ULTIMI PEZZI', 'NOVITÀ'],
    Materiali: ['Acetato', 'Titanio', 'Metallo', 'Lenti in cristallo', 'Lenti polarizzate']
  };
  C.TESTI = TESTI;
  function testiPronti(gruppi, f, val) {
    return '<label class="campo"><span>Testi Pronti</span><select data-f="' + f + '" data-pronto="1"><option value="">-- Seleziona Testo Pronto --</option>' + gruppi.map(function (g) { return '<optgroup label="' + esc(g) + '">' + TESTI[g].map(function (t) { return '<option' + (t === val ? ' selected' : '') + '>' + esc(t) + '</option>'; }).join('') + '</optgroup>'; }).join('') + '</select></label>';
  }
  C.testiPronti = testiPronti;
  function campoP(lab, f, val, ph) { return '<label class="campo"><span>' + lab + '</span><span class="sc-affix"><i>€</i><input type="text" inputmode="decimal" data-prezzo data-f="' + f + '" value="' + esc(val || '') + '" placeholder="' + (ph || '99,00') + '"></span></label>'; }
  function campoS(lab, f, val, ph) { return '<label class="campo"><span>' + lab + '</span><span class="sc-affix"><input type="text" inputmode="numeric" data-percentuale data-f="' + f + '" value="' + esc(val || '') + '" placeholder="' + (ph || '50') + '" maxlength="2"><i>%</i></span></label>'; }
  function campoT(lab, f, val, extra) { return '<label class="campo"><span>' + lab + '</span><input type="text" data-f="' + f + '" value="' + esc(val || '') + '"' + (extra || '') + '></label>'; }
  C.campoP = campoP; C.campoS = campoS; C.campoT = campoT;
  // menu BRAND + Loghi Personali (menu-brand-cartellini.js)
  function menuBrand(c, q, lab) {
    var b = c['brand' + q] || '', l = c['logo' + q] || '';
    return '<label class="campo"><span>' + (lab || 'BRAND') + '</span><select data-f="c.brand' + q + '"><option value="">-- Seleziona Brand --</option>' +
      '<option value="Ottica Macrì"' + (b === 'Ottica Macrì' && !l ? ' selected' : '') + '>OTTICA MACRÌ</option>' +
      marche().map(function (m) { return '<option value="' + esc(m) + '"' + (m === b && !l ? ' selected' : '') + (PRIORITARI.indexOf(m) >= 0 ? ' class="sc-prio"' : '') + '>' + esc(m.toUpperCase()) + '</option>'; }).join('') + '</select></label>' +
      '<label class="campo"><span>Loghi Personali' + (q ? ' ' + q : '') + '</span><select data-f="c.logo' + q + '"><option value="">-- Seleziona Logo Personale --</option>' +
      C.loghi().map(function (x) { return '<option value="' + x.id + '"' + (x.id === l ? ' selected' : '') + '>★ ' + esc(x.nome) + '</option>'; }).join('') + '</select></label>' +
      (C.loghi().length ? '' : '<p class="piccolo muto" style="margin-top:-6px">Nessun logo personale: <a href="#creator/loghi-importa">Genera un logo ›</a></p>');
  }
  C.menuBrand = menuBrand;

  /* ---------- pezzi grafici comuni ---------- */
  // marchio nel riquadro (bianco nel rosso, oro nei cartellini, nero nelle etichette)
  function marchio(c, q, scala, colore) {
    var lg = C.logo(c['logo' + q]);
    if (lg) return '<img class="sc-lp ' + (colore || '') + '" src="' + lg.src + '" alt="">';
    var b = c['brand' + q]; if (!b && !q) b = 'Ottica Macrì';
    if (!b) return '<span class="sc-wm sc-wm-vuoto">SELEZIONA<br>2° BRAND</span>';
    if (b === 'Ottica Macrì') return '<span class="sc-wm sc-wm-om" style="font-size:' + (34 * (scala || 1)).toFixed(1) + 'px"><b>OTTICA MACRÌ</b><i>ROMA</i></span>';
    var t = b.toUpperCase(), fs = Math.max(14, Math.min(64, 520 / Math.max(4, t.length))) * (scala || 1);
    return '<span class="sc-wm" data-fit="9" style="font-size:' + fs.toFixed(1) + 'px">' + esc(t) + '</span>';
  }
  C.marchio = marchio;
  function slotRosso(c, wPct, hMm) {
    return '<div class="sc-redbox' + (c.due ? ' due' : '') + '" style="width:' + wPct + '%;height:' + hMm + 'mm"><div class="sc-slot">' + marchio(c, '', c.due ? 0.55 : 1) + '</div>' + (c.due ? '<div class="sc-slot">' + marchio(c, '2', 0.55) + '</div>' : '') + '</div>';
  }
  var BF_BADGE = '<span class="sc-bfb"><b>BLACK</b><i>FRIDAY</i></span>', XM_BADGE = '<span class="sc-xmb">✦<b>BUONE</b><b>FESTE</b>✦</span>', MII = '<span class="sc-mii"><i></i><i></i><i></i></span>';
  function claim(t, c, o, lato) {
    var st = 'width:' + (o.cw || 20) + '%;font-size:' + (o.cf || 15.84) + 'px;transform:translateX(' + (lato === 'sx' ? '-' : '') + (o.ct == null ? 3.5 : o.ct) + 'mm)' + (o.cst ? ';' + o.cst : '');
    if (c.tema === 'bf') return '<div class="sc-claim sc-claim-img" style="' + st + '">' + BF_BADGE + '</div>';
    if (c.tema === 'xmas') return '<div class="sc-claim sc-claim-img" style="' + st + '">' + XM_BADGE + '</div>';
    if (c.tema === 'mii') return '<div class="sc-claim sc-claim-img" style="' + st + '">' + MII + '</div>';
    var p = String(t || '').trim().split(/\s+/);
    return '<div class="sc-claim" style="' + st + '">' + esc(p[0] || '') + (p.length > 1 ? '<br>' + esc(p.slice(1).join(' ')) : '') + '</div>';
  }
  function testata(c, o) { return '<div class="sc-testa" style="padding:0 ' + (o.px || 0) + 'mm;' + (o.hh ? 'height:' + o.hh + 'mm;' : '') + (o.mt ? 'margin-top:' + o.mt + 'mm;' : '') + '">' + claim(c.claimSx, c, o, 'sx') + slotRosso(c, o.bw || 56, o.bh || 29) + claim(c.claimDx, c, o, 'dx') + '</div>'; }
  function piede(hMm, maxW, extra) { return '<div class="sc-piede" style="height:' + hMm + 'mm;' + (extra || '') + '"><img src="' + LOGO + '" alt="Ottica Macrì" style="max-width:' + (maxW || 264) + 'px"></div>'; }
  function testoDesc(t) { return esc(t).replace(/•/g, '<span class="sc-pall">•</span>'); }
  function fsDesc(base, t, N, semplice) { var n = String(t || '').length; if (semplice) return n >= 25 ? base * Math.min(0.93, 26 / n) : base; return n > N ? base * N / n : base; }
  function fsPrezzo(base, s, n0) { var n = String(s || '').length; return n > (n0 || 7) ? base * (n0 || 7) / n : base; }
  function cls(c) { return 'sc-card' + (c.tema ? ' sc-t-' + c.tema : ''); }
  function fondo(i, c, top, h) { return c.tema === 'bf' || c.tema === 'xmas' ? '<div class="sc-fondo sc-fondo-' + c.tema + '" style="top:' + top + 'mm;height:' + h + 'mm"></div>' : ''; }
  function taglio(top, l, r, col) { return '<div class="sc-taglio" style="top:' + top + 'mm;left:' + l + 'mm;right:' + r + 'mm;border-top-color:' + (col || '#ccc') + '"></div>'; }
  C.pezzi = { marchio: marchio, slotRosso: slotRosso, claim: claim, testata: testata, piede: piede, testoDesc: testoDesc, fsDesc: fsDesc, fsPrezzo: fsPrezzo };

  // foglio A4 a due cartelli (posizioni dell'originale: il secondo sta esattamente 148,5 mm sotto il primo)
  function a4Due(m, d, o) {
    var h = '<div class="sc-foglio sc-a4 ' + C.stileCls() + ' sc-m-' + m.id + '" data-modello="cartello-' + m.id + '" style="padding:' + o.pad + ';' + (o.just ? 'justify-content:' + o.just + ';' : '') + '">';
    [0, 1].forEach(function (i) {
      if (i === 1 && d.fmt === 'single') return;
      var c = d.c[i];
      h += fondo(i, c, i ? 148.5 : 0, 148.5);
      h += '<div class="' + cls(c) + '" style="height:' + o.h + 'mm;padding:' + o.cp + ';' + (i === 1 && o.gap2 != null ? 'margin-top:' + o.gap2 + 'mm;' : '') + (i === 0 && d.fmt === 'single' && o.mbSingle ? 'margin-bottom:' + o.mbSingle + 'mm;' : '') + '">' + m.card(c, i, d) + '</div>';
    });
    if (d.fmt !== 'single') h += taglio(148.5, o.tl == null ? 12 : o.tl, o.tr == null ? 12 : o.tr, o.tc);
    return h + '</div>';
  }

  /* =====================================================================
     MODELLI (def = dati iniziali del singolo cartello)
     ===================================================================== */
  var M = {};
  function base(x) { return Object.assign({ brand: '', logo: '', brand2: '', logo2: '', due: false, claimSx: 'PROMO 2026', claimDx: 'SHOP NOW', tema: '', pronto: '' }, x); }
  // ---- Semplice
  M.semplice = { titolo: 'Cartello Semplice', voce: 'Semplice', tipo: 'Cartelli', def: base({ desc: 'Occhiali da vista completi', prezzo: '99,00' }),
    campi: function (c) { return '<div class="blocco">' + testiPronti(['Promozioni', 'Articoli'], 'c.pronto', c.pronto) + campoT('Testo Libero', 'c.desc', c.desc, ' maxlength="37" placeholder="-- Testo Libero --"') + campoP('Prezzo', 'c.prezzo', c.prezzo) + '</div>'; },
    card: function (c) {
      var p = prezzo(c.prezzo);
      return testata(c, { px: 5, cw: 20, cf: 15.84 }) + '<div class="sc-pb" style="padding-top:2mm"><div class="sc-desc" style="font-size:' + fsDesc(40, c.desc, 26, true).toFixed(2) + 'px;transform:translateY(1.35mm)">' + testoDesc(c.desc) + '</div>' +
        '<div class="sc-prezzo" style="font-size:' + fsPrezzo(149.76, p).toFixed(2) + 'px">' + esc(p) + '</div></div>' + piede(19.2, 264, 'margin-top:2mm;margin-bottom:1mm');
    },
    foglio: function (d) { return a4Due(this, d, { pad: '8mm 12mm', h: 128, cp: '4mm 0', gap2: 20.5, just: 'flex-start' }); } };
  // ---- Outlet (doppia cifra / descrizione)
  M.outlet = { titolo: 'Cartello Outlet', voce: 'Outlet', tipo: 'Cartelli', def: base({ claimSx: 'SALDI 2026', modo: 'doppia', desc: 'Montature da vista', orig: '395,00', sconto: '75', prezzo: '99,00' }),
    selettori: function (c) { return modoPrezzo(c); },
    campi: function (c) { return '<div class="blocco">' + (c.modo === 'desc' ? testiPronti(['Promozioni', 'Articoli'], 'c.pronto', c.pronto) + campoT('Testo Libero', 'c.desc', c.desc, ' maxlength="37"') : '') + '<div class="tre sc-tre">' + campoP('Prezzo Originario', 'c.orig', c.orig, '395,00') + campoS('Sconto', 'c.sconto', c.sconto, '75') + campoP('Prezzo Finale', 'c.prezzo', c.prezzo) + '</div></div>'; },
    card: function (c) {
      var ds = c.modo === 'desc', p = prezzo(c.prezzo);
      return testata(c, { px: 0, cw: 20, cf: 15.84 }) + '<div class="sc-pb sc-pb-out" style="margin:auto 0 10mm">' +
        (ds ? '<div class="sc-desc sc-desc2" style="font-size:' + fsDesc(33.6, c.desc, 31).toFixed(2) + 'px;top:5.4mm">' + testoDesc(c.desc) + '</div>' : '') +
        '<div class="sc-vecchio" style="font-size:' + (ds ? 31.2 : 35.2) + 'px;top:' + (ds ? 9.2 : 2) + 'mm"><s>' + esc(prezzo(c.orig)) + '</s><em>' + esc(pc(c.sconto)) + '</em></div>' +
        '<div class="sc-prezzo" style="font-size:' + fsPrezzo(149.76, p).toFixed(2) + 'px;' + (ds ? 'top:6mm' : '') + '">' + esc(p) + '</div></div>' + piede(19.2, 264, 'margin-bottom:1mm;' + (ds ? 'top:6mm' : ''));
    },
    foglio: function (d) { return a4Due(this, d, { pad: '8mm 0', h: 128, cp: '4mm 12mm', gap2: 20.5, just: 'flex-start', tl: 12, tr: 12 }); } };
  function modoPrezzo(c, nomi) {
    nomi = nomi || ['DOPPIA CIFRA', 'DESCRIZIONE ARTICOLO'];
    return '<div class="sc-sel2" role="group" aria-label="Modalità prezzo"><button type="button" class="' + (c.modo !== 'desc' ? 'on' : '') + '" data-act="scCard" data-k="modo" data-v="doppia" aria-pressed="' + (c.modo !== 'desc') + '">' + nomi[0] + '</button><button type="button" class="' + (c.modo === 'desc' ? 'on' : '') + '" data-act="scCard" data-k="modo" data-v="desc" aria-pressed="' + (c.modo === 'desc') + '">' + nomi[1] + '</button></div>';
  }
  function nArticoli(c) { return '<div class="sc-sel2" role="group" aria-label="Numero di articoli"><button type="button" class="' + (c.nArt !== 3 ? 'on' : '') + '" data-act="scCard" data-k="nArt" data-v="2">2 ARTICOLI</button><button type="button" class="' + (c.nArt === 3 ? 'on' : '') + '" data-act="scCard" data-k="nArt" data-v="3">3 ARTICOLI</button></div>'; }
  function tabArt(c) { var n = c.nArt === 3 ? 3 : 2, a = Math.min(c.aSel || 0, n - 1); return '<div class="sc-tabs-art">' + [0, 1, 2].slice(0, n).map(function (i) { return '<button type="button" class="' + (i === a ? 'on' : '') + '" data-act="scCard" data-k="aSel" data-v="' + i + '">ARTICOLO ' + (i + 1) + '</button>'; }).join('') + '</div>'; }
  // ---- Outlet Multi (2 o 3 articoli in colonna)
  M.outletmulti = { titolo: 'Outlet Multi', voce: 'Outlet Multi', tipo: 'Cartelli',
    def: base({ claimSx: 'SALDI 2026', modo: 'desc', nArt: 2, aSel: 0, art: [{ desc: 'Lenti monofocali', orig: '79,90', sconto: '50', prezzo: '39,90' }, { desc: 'Lenti progressive', orig: '99,90', sconto: '50', prezzo: '49,90' }, { desc: 'Lenti fotocromatiche', orig: '89,90', sconto: '50', prezzo: '44,90' }] }),
    selettori: function (c) { return nArticoli(c) + modoPrezzo(c); },
    campi: function (c) { var i = Math.min(c.aSel || 0, (c.nArt === 3 ? 3 : 2) - 1), a = c.art[i]; return '<div class="blocco">' + tabArt(c) + (c.modo === 'desc' ? testiPronti(['Articoli', 'Promozioni'], 'a.' + i + '.pronto', a.pronto) + campoT('Testo Libero', 'a.' + i + '.desc', a.desc, ' maxlength="37"') : '') + '<div class="tre sc-tre">' + campoP('Prezzo Originario', 'a.' + i + '.orig', a.orig) + campoS('Sconto', 'a.' + i + '.sconto', a.sconto) + campoP('Prezzo Finale', 'a.' + i + '.prezzo', a.prezzo) + '</div></div>'; },
    card: function (c) {
      var tre = c.nArt === 3, A = c.art.slice(0, tre ? 3 : 2), col = function (a) {
        return '<div class="sc-om-col">' + (c.modo === 'desc' ? '<div class="sc-om-t" style="font-size:' + fsDesc(tre ? 28 : 36.8, a.desc, tre ? 14 : 18).toFixed(1) + 'px">' + testoDesc(a.desc) + '</div>' : '') +
          '<div class="sc-vecchio sc-om-v" style="font-size:' + (tre ? 19.2 : 23.2) + 'px"><s>' + esc(prezzo(a.orig)) + '</s><em>' + esc(pc(a.sconto)) + '</em></div><div class="sc-prezzo sc-om-p" data-fit="20" style="font-size:' + (tre ? 60.8 : 83.2) + 'px">' + esc(prezzo(a.prezzo)) + '</div></div>'; };
      var cols = tre ? [A[0], A[2], A[1]] : A;
      return testata(c, { px: 0, cw: 20, cf: 15.84 }) + '<div class="sc-om">' + cols.map(col).join('<i class="sc-div"></i>') + '</div>' + piede(18, 250, 'top:-4mm');
    },
    foglio: function (d) { return a4Due(this, d, { pad: '0', h: 147, cp: '8mm 12mm 6mm', gap2: 1.5, just: 'flex-start' }); } };
  // ---- Multi Brand (doppia referenza: descrizione a sinistra, prezzo a destra)
  M.multi = { titolo: 'Multi Brand', voce: 'Multi Brand', tipo: 'Cartelli',
    def: base({ nArt: 2, aSel: 0, art: [{ desc: 'Occhiali da sole', prezzo: '89,00' }, { desc: 'Occhiali da vista', prezzo: '129,00' }, { desc: 'Lenti a contatto', prezzo: '29,00' }] }),
    selettori: function (c) { return nArticoli(c); },
    campi: function (c) { var i = Math.min(c.aSel || 0, (c.nArt === 3 ? 3 : 2) - 1), a = c.art[i]; return '<div class="blocco">' + tabArt(c) + testiPronti(['Articoli', 'Promozioni'], 'a.' + i + '.pronto', a.pronto) + campoT('Testo Libero', 'a.' + i + '.desc', a.desc, ' maxlength="37"') + campoP('Prezzo', 'a.' + i + '.prezzo', a.prezzo, '29,00') + '</div>'; },
    card: function (c) {
      var tre = c.nArt === 3, A = c.art.slice(0, tre ? 3 : 2);
      return testata(c, { px: 5, cw: 20, cf: 15.84 }) + '<div class="sc-mr' + (tre ? ' tre' : '') + '">' + A.map(function (a) {
        var v = u.leggiPrezzo(a.prezzo), dfs = tre ? (String(a.desc).length >= 27 ? 20 : 22.72) : 27.2;
        return '<div class="sc-mr-r"><div class="sc-mr-d" style="font-size:' + dfs + 'px;width:' + (tre ? 140 : 155) + 'px">' + testoDesc(a.desc) + '</div><div class="sc-prezzo sc-mr-p" data-fit="30" style="font-size:' + (tre ? 76.8 : 107.2) + 'px"><span>€</span>' + (isNaN(v) ? '' : u.fmt2(v)) + '</div></div>'; }).join('') + '</div>' + piede(tre ? 15.5 : 19.2, 264, 'top:' + (tre ? -5.5 : -6) + 'mm');
    },
    foglio: function (d) { return a4Due(this, d, { pad: '8mm 12mm', h: 137.5, cp: '4mm 0', gap2: 11, just: 'flex-start', tl: 0, tr: 0 }); } };
  // ---- Percentuale (e 2° Paio)
  function percentuale(id, titolo, voce, def) {
    return { titolo: titolo, voce: voce, tipo: 'Cartelli', def: base(def),
      campi: function (c) { return '<div class="blocco">' + testiPronti(['Promozioni', 'Articoli'], 'c.pronto', c.pronto) + campoT('Testo Libero', 'c.desc', c.desc, ' maxlength="37"') + campoS('Sconto', 'c.sconto', c.sconto, '50') + '</div>'; },
      card: function (c) {
        var n = String(c.desc || '').length, fs = n <= 24 ? 32 : n <= 26 ? 32 * 0.93 : 32 * 0.89 * Math.min(1, 31 / n);
        return testata(c, { px: 0, cw: 22, cf: 16.56, bw: 54, bh: 28 }) + '<div class="sc-sub" style="font-size:' + fs.toFixed(2) + 'px">' + testoDesc(c.desc) + '</div><div class="sc-giga">' + esc(pc(c.sconto)) + '</div>' + piede(17, 240, 'top:-3mm');
      },
      foglio: function (d) { return a4Due(this, d, { pad: '8mm 12mm', h: 132, cp: '2mm 0', gap2: null, just: d.fmt === 'single' ? 'flex-start' : 'space-between', mbSingle: 7, tl: 12, tr: 12 }); } };
  }
  M.percentuale = percentuale('percentuale', 'Cartello Percentuale', 'Percentuale', { claimSx: 'SALDI 2026', desc: 'Fino ad esaurimento scorte', sconto: '50' });
  M.paio = percentuale('paio', 'Promo 2° Paio', '2° Paio', { claimSx: '2° PAIO', claimDx: 'PROMO 2026', desc: 'Sul secondo paio di occhiali', sconto: '50' });
  // ---- Ultimi Pezzi (Promo Last Chance)
  M.ultimi = { titolo: 'Promo Ultimi Pezzi', voce: 'Ultimi Pezzi', tipo: 'Cartelli', temi: ['mii', 'xmas'], dueBrand: false, brandToggle: true,
    def: base({ claimSx: 'SALDI ESTATE', claimDx: 'SHOP NOW', conBrand: false, brand: 'Ray-Ban', prezzo: '69,90', desc: 'Fino ad esaurimento scorte' }),
    campi: function (c) { return '<div class="blocco">' + campoP('Prezzo', 'c.prezzo', c.prezzo, '69,90') + testiPronti(['Promozioni', 'Articoli'], 'c.pronto', c.pronto) + campoT('Testo Libero', 'c.desc', c.desc, ' maxlength="37"') + '</div>'; },
    card: function (c) {
      var p = prezzo(c.prezzo), o = { cw: 18, cf: 15.12, ct: 0, cst: 'align-self:flex-start;margin-top:15.6mm' };
      return '<div class="sc-testa sc-lc-testa">' + claim(c.claimSx, c, o, 'sx') + '<div class="sc-lc-c"><div class="sc-lc-g"><b>ULTIMI</b><b>PEZZI</b></div>' + (c.conBrand ? '<div class="sc-lc-br">' + marchio(c, '', 0.5, 'sc-nero') + '</div>' : '') + '</div>' + claim(c.claimDx, c, o, 'dx') + '</div>' +
        '<div class="sc-prezzo" style="font-size:' + fsPrezzo(c.conBrand ? 139.2 : 158.4, p).toFixed(2) + 'px;' + (c.conBrand ? '' : 'top:-4mm') + '">' + esc(p) + '</div>' +
        '<div class="sc-lc-piede" style="' + (c.conBrand ? '' : 'top:-4mm') + '">' + (c.desc ? '<div class="sc-lc-nota" style="font-size:' + (c.tema === 'mii' ? 31.68 : fsDesc(26.4, c.desc, 31)).toFixed(2) + 'px">' + testoDesc(c.desc) + '</div>' : '') + '<div class="sc-lc-banda">DISPONIBILITÀ LIMITATA</div></div>';
    },
    foglio: function (d) { var h = a4Due(this, d, { pad: '8mm 12mm', h: 128, cp: '2mm', gap2: null, just: d.fmt === 'single' ? 'flex-start' : 'space-between', tl: 12, tr: 12 }); return h; } };
  // ---- Paletto 15x10 (cartello da banco: 2 cartelli 148,4 × 104 mm)
  M.paletto = { titolo: 'Paletto 15x10', voce: 'Paletto 15x10', tipo: 'Cartelli', def: base({ claimSx: 'PROMO 2026', modo: 'doppia', desc: 'Lenti fotocromatiche', orig: '160,00', sconto: '25', prezzo: '120,00' }),
    def2: { modo: 'desc' },
    selettori: function (c) { return modoPrezzo(c); },
    campi: M.outlet.campi,
    card: function (c) {
      var ds = c.modo === 'desc', p = prezzo(c.prezzo), mii = c.tema === 'mii' && !ds;
      return testata(c, { px: 0, cw: 20, cf: 15.12, ct: 2, bw: 58, bh: 25, hh: 25, mt: 2.5 }) +
        '<div class="sc-rs' + (mii ? ' due-righe' : '') + '"><div class="sc-desc sc-desc2" style="font-size:' + fsDesc(28.8, c.desc, 31).toFixed(2) + 'px;visibility:' + (ds || mii ? 'visible' : 'hidden') + '">' + testoDesc(mii ? 'Made in Italy' : c.desc) + '</div>' +
        '<div class="sc-vecchio" style="font-size:24.8px;gap:16px;visibility:' + (ds ? 'hidden' : 'visible') + '"><s>' + esc(prezzo(c.orig)) + '</s><em>' + esc(pc(c.sconto)) + '</em></div></div>' +
        '<div class="sc-prezzo sc-pb-p" style="font-size:' + fsPrezzo(108.8, p).toFixed(2) + 'px;letter-spacing:-2px">' + esc(p) + '</div>' + piede(14, 250, 'margin-bottom:2.5mm;top:-2mm');
    },
    foglio: function (d) {
      var m = this, h = '<div class="sc-foglio sc-a4 ' + C.stileCls() + ' sc-m-paletto" data-modello="cartello-paletto" style="padding:0">';
      [0, 1].forEach(function (i) { if (i === 1 && d.fmt === 'single') return; var c = d.c[i]; h += '<div class="sc-mezzo">' + '<div class="' + cls(c) + ' sc-paletto">' + (c.tema === 'bf' || c.tema === 'xmas' ? '<div class="sc-fondo sc-fondo-' + c.tema + '" style="inset:0"></div>' : '') + m.card(c, i, d) + '</div></div>'; });
      if (d.fmt !== 'single') h += taglio(148.5, 0, 0, '#777');
      return h + '</div>';
    } };
  // ---- Indicazioni (cartello Magazzino: area testo, dimensione, freccia)
  var FRECCE = { dx: 0, giu: 90, sx: 180, su: 270 }, FRECCIA = 'M8 37 H56 V16 L94 50 L56 84 V63 H8 Z';
  M.indicazioni = { titolo: 'Cartello Indicazioni', voce: 'Indicazioni', tipo: 'Cartelli', claim: false, temi: [],
    def: base({ testo: 'LENTI A CONTATTO\nLIQUIDI E ACCESSORI', dim: 61, freccia: 'dx' }), def2: { testo: 'OCCHIALI DA SOLE\nOCCHIALI DA VISTA\nLABORATORIO', freccia: 'giu' },
    campi: function (c) {
      return '<div class="blocco"><label class="campo"><span>Area Testo (max 4 righe)</span><textarea data-f="c.testo" rows="4" style="text-transform:uppercase">' + esc(c.testo) + '</textarea></label>' +
        '<label class="campo"><span>Dimensione Testo · <b data-sc-dim>' + c.dim + '</b> px</span><input type="range" min="46" max="76" step="1" data-f="c.dim" value="' + c.dim + '"></label>' +
        '<div class="campo"><span>Freccia</span><div class="chips">' + [['dx', '➔'], ['giu', '⬇'], ['sx', '⬅'], ['su', '⬆'], ['', 'NESSUNA']].map(function (f) { return '<button type="button" class="chipb' + (c.freccia === f[0] ? ' on' : '') + '" data-act="scCard" data-k="freccia" data-v="' + f[0] + '" style="min-width:56px;font-size:' + (f[0] ? 22 : 14) + 'px">' + f[1] + '</button>'; }).join('') + '</div></div></div>';
    },
    card: function (c) {
      var righe = String(c.testo || '').toUpperCase().split('\n').slice(0, 4), fs = c.dim || 61;
      if (righe.length >= 4) fs = Math.min(fs, 52);
      var br = '<div class="sc-mg-brand' + (c.due ? ' due' : '') + '"><div>' + marchio(c, '', c.due ? 0.6 : 1.25, 'sc-nero') + '</div>' + (c.due ? '<div>' + marchio(c, '2', 0.6, 'sc-nero') + '</div>' : '') + '</div>';
      return br + '<div class="sc-mg-t" data-fit="46" style="font-size:' + fs + 'px">' + (righe.join('\n').trim() ? esc(righe.join('\n')) : 'INSERISCI TESTO') + '</div>' +
        (c.freccia ? '<svg class="sc-mg-f" viewBox="0 0 100 100" style="margin-bottom:' + (righe.length >= 4 ? 12 : 20) + 'px;transform:rotate(' + FRECCE[c.freccia] + 'deg)"><path d="' + FRECCIA + '"/></svg>' : '<div style="height:40px"></div>');
    },
    foglio: function (d) {
      var m = this, h = '<div class="sc-foglio sc-a4 ' + C.stileCls() + ' sc-m-indicazioni" data-modello="cartello-indicazioni" style="padding:0">';
      [0, 1].forEach(function (i) { if (i === 1 && d.fmt === 'single') return; h += '<div class="sc-card sc-mg' + (i ? ' sc-mg2' : '') + (d.fmt === 'single' ? ' sc-mg-solo' : '') + '">' + m.card(d.c[i], i, d) + '</div>'; });
      return h + '</div>';
    } };

  /* ---------- PROMO STAGIONALI ---------- */
  var PROMO_MB = [['50% + 50%', '#b5462c'], ['-30%', '#b5462c'], ['€ 10,00', '#b5462c'], ['€ 20,00', '#c94b13'], ['€ 30,00', '#137ec9'], ['€ 40,00', '#22a10d'], ['€ 50,00', '#b814ab'], ['€ 60,00', '#f72b78'], ['€ 70,00', '#99792e'], ['€ 80,00', '#129a78'], ['€ 90,00', '#1e5284']];
  function mbDef(x) { return base(Object.assign({ promo: '50% + 50%', colore: '#b5462c', testo: '', sec: 'Su una selezione di modelli', slot: ['Ray-Ban', 'Persol', 'Oakley', 'Carrera', 'Vogue Eyewear', 'Giorgio Armani', 'Michael Kors', 'Guess'], slotL: ['', '', '', '', '', '', '', ''] }, x)); }
  M.multibrand = { titolo: 'Promo Multibrand', voce: 'Promo Multibrand', tipo: 'Promo', claim: false, temi: [], dueBrand: false, brandMenu: false, def: mbDef({}),
    campi: function (c) {
      return '<div class="blocco"><label class="campo"><span>Promo Stagionale</span><select data-f="c.promo">' + PROMO_MB.map(function (p) { return '<option value="' + esc(p[0]) + '"' + (p[0] === c.promo ? ' selected' : '') + '>' + esc(p[0]) + '</option>'; }).join('') + '</select></label>' +
        campoT('Testo Libero (al posto della promo)', 'c.testo', c.testo, ' maxlength="20"') + testiPronti(['Promozioni'], 'c.pronto', c.pronto) + campoT('Testo Libero', 'c.sec', c.sec, ' maxlength="37"') + '</div>' +
        '<div class="blocco"><p class="blocco-t">BRANDS IN PROMOZIONE</p><div class="sc-slots">' + c.slot.map(function (b, i) {
          return '<label class="campo"><span>' + (i + 1) + '</span><select data-f="s.' + i + '"><option value="">— vuoto —</option>' + marche().map(function (m) { return '<option' + (m === b && !c.slotL[i] ? ' selected' : '') + '>' + esc(m) + '</option>'; }).join('') +
            (C.loghi().length ? '<optgroup label="Loghi Personali">' + C.loghi().map(function (l) { return '<option value="L:' + l.id + '"' + (c.slotL[i] === l.id ? ' selected' : '') + '>★ ' + esc(l.nome) + '</option>'; }).join('') + '</optgroup>' : '') + '</select></label>'; }).join('') + '</div></div>';
    },
    card: function (c) {
      var col = (PROMO_MB.filter(function (p) { return p[0] === c.promo; })[0] || PROMO_MB[0])[1];
      function lg(i, sc) { return marchio({ brand: c.slot[i] || '', logo: c.slotL[i] || '' }, '', sc, 'sc-rosso'); }
      var t = c.testo || c.promo;
      return '<div class="sc-mb" style="--mb:' + col + '"><div class="sc-mb-board">' + [0, 1, 2, 3, 4, 5].map(function (i) { return '<div class="sc-mb-l">' + (c.slot[i] || c.slotL[i] ? lg(i, 0.95) : '') + '</div>'; }).join('') + '</div>' +
        '<div class="sc-mb-banner" style="background:' + col + '"><span data-fit="40" style="font-size:' + (t.length > 9 ? 96 : 128) + 'px">' + esc(t) + '</span></div>' +
        '<div class="sc-mb-basso"><div class="sc-mb-l2">' + (c.slot[6] || c.slotL[6] ? lg(6, 0.8) : '') + '</div><div class="sc-mb-sec"><div style="font-size:' + fsDesc(17, c.sec, 30).toFixed(1) + 'px">' + testoDesc(c.sec) + '</div><span style="background:' + col + '">SU UNA SELEZIONE DI ARTICOLI</span></div><div class="sc-mb-l2">' + (c.slot[7] || c.slotL[7] ? lg(7, 0.8) : '') + '</div></div></div>';
    },
    foglio: function (d) { return a4Due(this, d, { pad: '10mm', h: 132, cp: '0', gap2: 148.5 - 132, just: 'flex-start', tl: 10, tr: 10 }); } };
  M.saldi = Object.assign({}, M.multibrand, { titolo: 'Saldi', voce: 'Saldi', def: mbDef({ promo: '-30%', sec: 'Saldi di stagione · occhiali da sole' }) });
  M.school = Object.assign({}, M.multibrand, { titolo: 'Back to School', voce: 'Back to School', def: mbDef({ promo: '€ 20,00', colore: '#c94b13', testo: 'BACK TO SCHOOL', sec: 'Occhiali da vista bambino', slot: ['Ray-Ban', 'Vogue Eyewear', 'Oakley', 'Carrera', '', '', 'Guess', 'Persol'] }) });
  // ---- Black Friday (BLACK / riquadro nero / FRIDAY)
  M.blackfriday = { titolo: 'Black Friday', voce: 'Black Friday', tipo: 'Promo', claim: false, temi: [], dueBrand: false,
    def: base({ brand: 'Ray-Ban', tema: 'bf', conDesc: false, desc: 'Occhiali da sole', conSconto: true, orig: '159,00', sconto: '30', prezzo: '111,30' }),
    selettori: function (c) { return '<button type="button" class="sc-toggle' + (c.conDesc ? ' on' : '') + '" data-act="scCard" data-k="conDesc" data-v="' + (c.conDesc ? '' : '1') + '" aria-pressed="' + !!c.conDesc + '">' + (c.conDesc ? 'DESCRIZIONE ATTIVA' : '+ AGGIUNGI DESCRIZIONE') + '</button><button type="button" class="sc-toggle' + (c.conSconto ? ' on' : '') + '" data-act="scCard" data-k="conSconto" data-v="' + (c.conSconto ? '' : '1') + '" aria-pressed="' + !!c.conSconto + '">' + (c.conSconto ? 'SCONTISTICA ATTIVA' : '+ AGGIUNGI SCONTISTICA') + '</button>'; },
    campi: function (c) { return '<div class="blocco">' + (c.conDesc ? campoT('Descrizione (max 20)', 'c.desc', c.desc, ' maxlength="20"') : '') + '<div class="tre sc-tre">' + (c.conSconto ? campoP('Prezzo Originario', 'c.orig', c.orig) + campoS('Sconto', 'c.sconto', c.sconto, '30') : '') + campoP('Prezzo Finale', 'c.prezzo', c.prezzo) + '</div></div>'; },
    card: function (c) {
      return '<div class="sc-bf"><div class="sc-bf-w sc-bf-black">BLACK</div><div class="sc-bf-box"><div class="sc-bf-sx">' + (c.conDesc ? '<span class="sc-bf-desc">' + esc(c.desc) + '</span>' : marchio(c, '', 0.62)) + '</div><div class="sc-bf-dx">' +
        (c.conSconto ? '<div class="sc-bf-v"><s>' + esc(prezzo(c.orig)) + '</s><em>' + esc(pc(c.sconto)) + '</em></div>' : '') + '<div class="sc-bf-p" data-fit="30">' + esc(prezzo(c.prezzo)) + '</div></div></div><div class="sc-bf-w sc-bf-friday">FRIDAY</div></div>';
    },
    foglio: function (d) { return a4Due(this, d, { pad: '6mm 10mm', h: 136, cp: '0', gap2: 148.5 - 136, just: 'flex-start', tl: 10, tr: 10 }); } };
  // ---- Natale (Xmas Ball: palla 92 mm con brand e prezzo)
  var PALLE = { rosso: ['Rosso', '#c0392b', '#7b1d14'], giallo: ['Giallo', '#e1b12c', '#9c7410'], verde: ['Verde', '#2e7d4f', '#14492a'], blu: ['Blu', '#1f4e79', '#0e2a45'] };
  M.natale = { titolo: 'Natale · Xmas Ball', voce: 'Natale', tipo: 'Promo', temi: [], dueBrand: false,
    def: base({ brand: 'Persol', palla: 'rosso', claimSx: 'BUONE FESTE', claimDx: 'IDEA REGALO', conSconto: false, orig: '39,90', sconto: '25', prezzo: '29,90' }),
    selettori: function (c) { return '<button type="button" class="sc-toggle' + (c.conSconto ? ' on' : '') + '" data-act="scCard" data-k="conSconto" data-v="' + (c.conSconto ? '' : '1') + '">' + (c.conSconto ? 'SCONTISTICA ATTIVA' : '+ AGGIUNGI SCONTISTICA') + '</button>'; },
    campi: function (c) { return '<div class="blocco"><div class="campo"><span>Colore Palla</span><div class="chips">' + Object.keys(PALLE).map(function (k) { return '<button type="button" class="chipb' + (c.palla === k ? ' on' : '') + '" data-act="scCard" data-k="palla" data-v="' + k + '"><i class="sc-pallino" style="background:' + PALLE[k][1] + '"></i> ' + PALLE[k][0] + '</button>'; }).join('') + '</div></div><div class="tre sc-tre">' + (c.conSconto ? campoP('Prezzo Originario', 'c.orig', c.orig) + campoS('Sconto', 'c.sconto', c.sconto, '25') : '') + campoP('Prezzo Finale', 'c.prezzo', c.prezzo, '29,90') + '</div></div>'; },
    card: function (c) {
      var P = PALLE[c.palla] || PALLE.rosso, v = u.leggiPrezzo(c.prezzo);
      return '<div class="sc-xm"><i class="sc-xm-filo"></i><i class="sc-xm-tappo"></i><div class="sc-xm-palla" style="background:radial-gradient(circle at 34% 30%,rgba(255,255,255,.45),transparent 26%),radial-gradient(circle at 50% 50%,' + P[1] + ' 55%,' + P[2] + ')">' +
        '<div class="sc-xm-brand">' + marchio(c, '', 0.5) + '</div>' + (c.conSconto ? '<div class="sc-xm-v"><s>' + esc(u.norm(c.orig)) + '</s> <em>' + esc(pc(c.sconto)) + '</em></div>' : '') +
        '<div class="sc-xm-p" data-fit="30">' + (isNaN(v) ? '' : u.fmt2(v)) + '</div><div class="sc-xm-e">EURO</div></div>' +
        '<span class="sc-xm-cl sx">' + esc(c.claimSx) + '</span><span class="sc-xm-cl dx">' + esc(c.claimDx) + '</span><span class="sc-xm-dono sx">🎁</span><span class="sc-xm-dono dx">🎁</span><div class="sc-xm-stelle"></div><img class="sc-xm-logo" src="' + LOGO + '" alt=""></div>';
    },
    foglio: function (d) { return a4Due(this, d, { pad: '0', h: 148, cp: '0', gap2: 0.5, just: 'flex-start', tl: 0, tr: 0 }); } };

  Object.keys(M).forEach(function (k) { M[k].id = k; });
  C.MOD = M;
  C.CARTELLI = ['semplice', 'outlet', 'outletmulti', 'multi', 'percentuale', 'paio', 'ultimi', 'paletto', 'indicazioni'];
  C.PROMO = ['multibrand', 'blackfriday', 'natale', 'saldi', 'school'];

  /* =====================================================================
     PAGINA GENERICA «DUE CARTELLI» (pannello come pannello.css di StoreCraft)
     ===================================================================== */
  function nuovaPagina(m) {
    var c1 = u.clona(m.def), c2 = Object.assign(u.clona(m.def), m.def2 || {});
    return { sel: 1, fmt: 'double', copia: false, backup: null, c: [c1, c2] };
  }
  function pannello(m, d) {
    var c = d.c[d.sel - 1], temi = m.temi || ['mii', 'bf', 'xmas'];
    var h = '<div class="pannello glass sc-pann"><h2>' + esc(m.titolo) + '</h2><div class="blocco">' +
      '<div class="sc-sel2" role="group" aria-label="Cartello in modifica"><button type="button" id="selectCard1" class="' + (d.sel === 1 ? 'on' : '') + '" data-act="scSel" data-v="1" aria-pressed="' + (d.sel === 1) + '">CARTELLO<br>SUPERIORE</button><button type="button" id="selectCard2" class="' + (d.sel === 2 ? 'on' : '') + '" data-act="scSel" data-v="2" aria-pressed="' + (d.sel === 2) + '"' + (d.fmt === 'single' ? ' disabled' : '') + '>CARTELLO<br>INFERIORE</button></div>' +
      (m.selettori ? m.selettori(c, d) : '') +
      (m.brandToggle ? '<button type="button" class="sc-toggle' + (c.conBrand ? ' on' : '') + '" data-act="scCard" data-k="conBrand" data-v="' + (c.conBrand ? '' : '1') + '" aria-pressed="' + !!c.conBrand + '">' + (c.conBrand ? 'BRAND ATTIVO' : '+ AGGIUNGI BRAND') + '</button>' : '') +
      (m.dueBrand === false ? '' : '<button type="button" class="sc-toggle' + (c.due ? ' on' : '') + '" data-act="scCard" data-k="due" data-v="' + (c.due ? '' : '1') + '" aria-pressed="' + !!c.due + '">' + (c.due ? '2° BRAND ATTIVO' : '+ AGGIUNGI 2° BRAND') + '</button>') + '</div>';
    var conBrand = m.brandMenu !== false && (!m.brandToggle || c.conBrand);
    if (conBrand || m.claim !== false) {
      h += '<div class="blocco">' + (conBrand ? menuBrand(c, '', c.due ? 'BRAND 1' : 'BRAND') + (c.due ? menuBrand(c, '2', 'BRAND 2') : '') : '');
      if (m.claim !== false) h += '<div class="due sempre">' + campoT('Claim Sinistro', 'c.claimSx', c.claimSx) + campoT('Claim Destro', 'c.claimDx', c.claimDx) + '</div>';
      h += '</div>';
    }
    h += m.campi(c, d);
    if (temi.length) h += '<div class="blocco"><p class="blocco-t">Tema · solo questo cartello</p><div class="chips sc-temi">' + temi.map(function (t) { var n = { mii: ['🇮🇹', 'Made in Italy'], bf: ['◼', 'Black Friday'], xmas: ['🎄', 'Natale'] }[t]; return '<button type="button" class="chipb' + (c.tema === t ? ' on' : '') + '" data-act="scTema" data-v="' + t + '" aria-pressed="' + (c.tema === t) + '">' + n[0] + ' ' + n[1] + '</button>'; }).join('') + '</div></div>';
    if (window.STILI && window.STILI.selettore) { try { h += '<div class="blocco sg-blocco">' + window.STILI.selettore(window.STILI.attuale()) + '</div>'; } catch (e) {} }   // stili.js
    h += '<div class="blocco">' + (d.fmt !== 'single' ? '<label class="interruttore sc-copia"><span>COPIA SU ALTRO CARTELLO</span><input type="checkbox" data-act="scCopia"' + (d.copia ? ' checked' : '') + '></label>' : '') +
      '<label class="campo"><span>Impostazioni di Stampa</span><select data-f="d.fmt" data-rr aria-label="Impostazioni di Stampa"><option value="double"' + (d.fmt !== 'single' ? ' selected' : '') + '>2 CARTELLI (Foglio A4)</option><option value="single"' + (d.fmt === 'single' ? ' selected' : '') + '>1 CARTELLO (Solo cartello superiore)</option></select></label>' +
      C.strumenti(d.fmt === 'single' ? 'STAMPA CARTELLO' : 'STAMPA CARTELLI') +
      (C.CARTELLI.indexOf(m.id) >= 0 && API.PAG['creator/supporto'] ? '<a class="sc-link" href="#creator/supporto/' + (m.id === 'outletmulti' ? 'outlet' : m.id) + '">Stampa su un supporto del negozio (plexiglass, cornicette, totem) ›</a>' : '') + '</div></div>';
    return h;
  }
  function paginaDue(r, gruppo) {
    var lista = gruppo === 'promo' ? C.PROMO : C.CARTELLI, k = lista.indexOf(r.v) >= 0 ? r.v : lista[0], m = M[k];
    var d = API.ed(nuovaPagina(m));
    if (!d.c || !d.c[1]) { var nd = nuovaPagina(m); Object.keys(nd).forEach(function (x) { d[x] = nd[x]; }); }
    if (d.fmt === 'single') d.sel = 1;
    function pag() { return { html: m.foglio(d), w: 210, h: 297 }; }
    function ant() { return C.vista(pag(), 'a4'); }
    function titolo() { var c = d.c[0]; return m.titolo + ' · ' + (c.desc || c.testo || prezzo(c.prezzo) || c.promo || '').toString().split('\n')[0]; }
    return {
      html: API.testa(m.titolo, gruppo === 'promo' ? 'Promo stagionali ✦' : 'Crea cartelli') + '<div class="strumento sc-strum">' + pannello(m, d) + API.tavolo('Foglio A4 · ' + (d.fmt === 'single' ? '1 cartello' : '2 cartelli') + ' · 210 × 297 mm', ant(), 'anteprima di stampa') + '</div>',
      ant: ant, dati: true, tipo: m.tipo, pagine: function () { return [pag()]; }, titoloStampa: titolo,
      foglio: function () { return { titolo: titolo(), html: '', tipo: 'a4' }; },
      cambia: function (f, v) {
        var p = f.split('.'), sel = d.sel - 1, idx = d.copia && d.fmt !== 'single' ? [0, 1] : [sel];
        if (p[0] === 'd') { d[p[1]] = v; if (p[1] === 'fmt' && v === 'single') { d.sel = 1; } return; }
        idx.forEach(function (i) {
          var c = d.c[i];
          if (p[0] === 'c') {
            var k2 = p[1];
            if (k2 === 'pronto') { c.pronto = v; if (v) { c[m.id === 'multibrand' || m.id === 'saldi' || m.id === 'school' ? 'sec' : 'desc'] = v; } }
            else if (k2 === 'brand' || k2 === 'brand2') { c[k2] = v; c['logo' + (k2 === 'brand2' ? '2' : '')] = ''; }
            else if (k2 === 'logo' || k2 === 'logo2') { c[k2] = v; }
            else if (k2 === 'dim') { c.dim = +v; var b = document.querySelector('[data-sc-dim]'); if (b) b.textContent = v; }
            else if (k2 === 'testo' && m.id === 'indicazioni') { c.testo = String(v).split('\n').slice(0, 4).join('\n'); }
            else c[k2] = v;
          } else if (p[0] === 'a') { var a = c.art[+p[1]]; if (p[2] === 'pronto') { a.pronto = v; if (v) a.desc = v; } else a[p[2]] = v; }
          else if (p[0] === 's') { var j = +p[1]; if (/^L:/.test(v)) { c.slotL[j] = v.slice(2); c.slot[j] = ''; } else { c.slot[j] = v; c.slotL[j] = ''; } }
        });
        // testi pronti: si copiano nel testo libero (che resta modificabile)
        if (/pronto$/.test(f) && v) { var t = document.querySelector(p[0] === 'a' ? '[data-f="a.' + p[1] + '.desc"]' : (m.id === 'multibrand' || m.id === 'saldi' || m.id === 'school' ? '[data-f="c.sec"]' : '[data-f="c.desc"]')); if (t) t.value = v; }
        C.salvaPresto();
      }
    };
  }
  C.paginaDue = paginaDue;
  // miniatura per la dashboard: metà superiore del foglio A4 (595 × 421 come le altre schede)
  C.thumbModello = function (k) {
    var m = M[k]; if (!m) return '';
    var d = nuovaPagina(m); d.fmt = 'single';
    return '<div class="thumb sc-thumb"><div class="scala" data-w="' + (210 * C.MM).toFixed(2) + '"><div class="sc-carta" style="width:210mm;height:297mm">' + m.foglio(d) + '</div></div></div>';
  };
  C.paginaModello = function (k, fmt) { var m = M[k], d = nuovaPagina(m); if (fmt) d.fmt = fmt; return { html: m.foglio(d), w: 210, h: 297 }; };

  C.PAG['creator/cartello'] = function (r) { return paginaDue(r, 'cartelli'); };
  C.PAG['creator/promo'] = function (r) { return paginaDue(r, 'promo'); };

  /* ---------- azioni del pannello ---------- */
  function dd() { return API.S().ed[API.rotta().chiave]; }
  C.ACT.scSel = function (el) { var d = dd(); if (!d) return; d.sel = +el.dataset.v; API.render(); };
  C.ACT.scCard = function (el) {
    var d = dd(); if (!d) return; var k = el.dataset.k, v = el.dataset.v;
    if (k === 'nArt' || k === 'aSel') v = +v; else if (v === '1') v = true; else if (v === '') v = (k === 'freccia' ? '' : false);
    (d.copia && d.fmt !== 'single' && k !== 'aSel' ? [0, 1] : [d.sel - 1]).forEach(function (i) { d.c[i][k] = v; });
    C.salvaPresto(); API.render();
  };
  C.ACT.scTema = function (el) {
    var d = dd(); if (!d) return; var t = el.dataset.v;
    (d.copia && d.fmt !== 'single' ? [0, 1] : [d.sel - 1]).forEach(function (i) {
      var c = d.c[i], on = c.tema !== t;
      if (c.tema === 'mii' && c._miiPrima) { c.desc = c._miiPrima.desc; c.modo = c._miiPrima.modo; c._miiPrima = null; }
      c.tema = on ? t : '';
      if (on && t === 'mii') { c._miiPrima = { desc: c.desc, modo: c.modo }; if ('desc' in c) c.desc = 'Made in Italy'; if (c.modo && (C.CARTELLI.indexOf(API.rotta().v) >= 0) && API.rotta().v !== 'paletto') c.modo = 'desc'; }
    });
    C.salvaPresto(); API.render();
  };
  C.ACT.scCopia = function (el) {
    var d = dd(); if (!d) return; var altro = d.sel === 1 ? 1 : 0;
    if (el.checked) { d.backup = u.clona(d.c[altro]); d.c[altro] = u.clona(d.c[d.sel - 1]); d.copia = true; API.toast('Le modifiche valgono per tutti e due i cartelli'); }
    else { if (d.backup) d.c[altro] = d.backup; d.backup = null; d.copia = false; }
    C.salvaPresto(); API.render();
  };
  C.dopoInstalla.push(function (api) { API = api; });
})();
