/* =====================================================================
   OTTICA MACRÌ · OCCHIALI 3D ED ESPOSITORI (agente VETRINE, 5/11/2026)
   window.OCCHIALI: montature realistiche (profilo con spessore, lenti con riflesso) ed espositori in plexiglass.
   Script classico (funziona da file://). Richiede window.THREE (vendor/three/three-bundle.js).
   Unità: metri. Un occhiale ha l'origine al centro del ponte, il fronte guarda +z, le aste vanno verso -z,
   y=0 = centro delle lenti; poggiato su un piano il punto più basso è a y = OCCHIALI.BASE (negativo).
   Prestazioni: geometrie in cache per modello e livello di dettaglio; tutti gli occhiali di un gruppo
   finiscono in poche InstancedMesh (una per coppia geometria+materiale) con un livello semplificato da lontano.
   ===================================================================== */
(function () {
'use strict';
var T = window.THREE; if (!T) return;
var PI = Math.PI;

/* ---------------- forme delle lenti (lente destra, centro 0,0, +x verso l'esterno) ---------------- */
function sgnp(v, e) { return (v < 0 ? -1 : 1) * Math.pow(Math.abs(v), e); }
var FORME = {
  wayfarer: function (t) { var c = Math.cos(t), s = Math.sin(t), a = .0262, b = .0200, e = s > 0 ? 2 / 4.2 : 2 / 2.3;
    var x = a * sgnp(c, e), y = b * sgnp(s, e); x *= 1 + .2 * y / b; if (y > 0) y += .004 * Math.max(0, x / a); if (y < 0) x -= .004 * (-y / b) * (x < 0 ? 1 : .3); return [x, y]; },
  clubmaster: function (t) { var c = Math.cos(t), s = Math.sin(t), a = .025, b = .0205, e = 2 / 2.5;
    var x = a * sgnp(c, e), y = b * sgnp(s, e); x *= 1 + .06 * y / b; if (y > 0) y *= .92; return [x, y]; },
  aviator: function (t) { var c = Math.cos(t), s = Math.sin(t), a = .0285, b = .0255, e = 2 / 2.2;
    var x = a * sgnp(c, e), y = b * sgnp(s, e); if (y > 0) y *= .78; else { x -= .0075 * Math.pow(-y / b, 1.4) * (1 - .4 * x / a); y *= 1.05; } return [x, y]; },
  rotondo: function (t) { var r = .0225; return [r * Math.cos(t), r * Math.sin(t) * .97]; },
  cateye: function (t) { var c = Math.cos(t), s = Math.sin(t), a = .027, b = .0175, e = 2 / 2.5;
    var x = a * sgnp(c, e), y = b * sgnp(s, e); y += .012 * Math.pow(Math.max(0, x / a), 3) * Math.max(0, y / b + .45); x *= 1 + .1 * Math.max(0, y / b); if (y < 0) x -= .005 * (-y / b); return [x, y]; },
  rettangolare: function (t) { var c = Math.cos(t), s = Math.sin(t), a = .026, b = .0165, e = 2 / 4.2;
    var x = a * sgnp(c, e), y = b * sgnp(s, e); if (y < 0) x -= .002 * (-y / b); return [x, y]; },
  pantos: function (t) { var c = Math.cos(t), s = Math.sin(t), a = .0235, b = .0215, e = 2 / 2.4;
    var x = a * sgnp(c, e), y = b * sgnp(s, e); if (y > 0) y *= .9; x *= 1 + .05 * y / b; return [x, y]; }
};
/* modelli riconoscibili */
var MODELLI = {
  wayfarer:    { forma: 'wayfarer',    tipo: 'acetato', ponte: .019, spess: [.0060, .0034], curva: 1.2, inclina: .12 },
  clubmaster:  { forma: 'clubmaster',  tipo: 'browline', ponte: .020, spess: [.0062, .0012], curva: 1.0 },
  aviator:     { forma: 'aviator',     tipo: 'metallo', ponte: .016, curva: 1.4, naselli: true, doppioPonte: true },
  rotondo:     { forma: 'rotondo',     tipo: 'acetato', ponte: .020, spess: [.0031, .0027], curva: .7 },
  rotondoMet:  { forma: 'rotondo',     tipo: 'metallo', ponte: .019, curva: .6, naselli: true },
  cateye:      { forma: 'cateye',      tipo: 'acetato', ponte: .018, spess: [.0058, .0029], curva: 1.1 },
  rettangolare:{ forma: 'rettangolare',tipo: 'acetato', ponte: .018, spess: [.0034, .0027], curva: .9 },
  pantos:      { forma: 'pantos',      tipo: 'acetato', ponte: .019, spess: [.0040, .0030], curva: .9 },
  sport:       { forma: 'sport',       tipo: 'sport',   ponte: 0,    curva: 3.4 },
  sportRett:   { forma: 'rettangolare',tipo: 'acetato', ponte: .017, spess: [.0050, .0040], curva: 2.4, sportivo: true }
};
var BASE = -.024;

/* ---------------- contorni ---------------- */
function contorno(forma, N) { var f = FORME[forma], P = []; for (var i = 0; i < N; i++) P.push(f(i / N * 2 * PI)); return P; }
function offset(P, d) { /* d: numero o funzione(punto)->spessore; contorno antiorario: normale esterna = (dy,-dx) */
  var n = P.length, Q = [];
  for (var i = 0; i < n; i++) { var a = P[(i - 1 + n) % n], b = P[(i + 1) % n], tx = b[0] - a[0], ty = b[1] - a[1], L = Math.hypot(tx, ty) || 1;
    var dd = typeof d === 'function' ? d(P[i]) : d; Q.push([P[i][0] + ty / L * dd, P[i][1] - tx / L * dd]); }
  return Q; }
function bbox(P) { var b = [1e9, 1e9, -1e9, -1e9]; P.forEach(function (p) { b[0] = Math.min(b[0], p[0]); b[1] = Math.min(b[1], p[1]); b[2] = Math.max(b[2], p[0]); b[3] = Math.max(b[3], p[1]); }); return b; }
function sposta(P, dx, dy, sx) { return P.map(function (p) { return [p[0] * (sx || 1) + dx, p[1] + dy]; }); }
function v2(P) { return P.map(function (p) { return new T.Vector2(p[0], p[1]); }); }
function piega(geo, k) { /* curvatura del frontale: z -= k*x^2, normali ruotate (niente ricalcolo: resta liscio) */
  var p = geo.attributes.position, n = geo.attributes.normal;
  for (var i = 0; i < p.count; i++) { var x = p.getX(i); p.setZ(i, p.getZ(i) - k * x * x);
    if (n) { var s = 2 * k * x, L = Math.sqrt(1 + s * s), sf = s / L, cf = 1 / L, nx = n.getX(i), nz = n.getZ(i); n.setXYZ(i, nx * cf + nz * sf, n.getY(i), -nx * sf + nz * cf); } }
  p.needsUpdate = true; if (n) n.needsUpdate = true; return geo; }
function estrudi(outer, holes, prof, lod) {
  var sh = new T.Shape(v2(outer)); (holes || []).forEach(function (h) { sh.holes.push(new T.Path(v2(h.slice().reverse()))); });
  var g = new T.ExtrudeGeometry(sh, lod ? { depth: prof, bevelEnabled: false } : { depth: prof, bevelEnabled: true, bevelThickness: .0008, bevelSize: .0007, bevelSegments: 2, curveSegments: 4 });
  g.translate(0, 0, -prof / 2); return g; }
function tubo(punti, r, chiuso, seg, rad) {
  var c = new T.CatmullRomCurve3(punti.map(function (p) { return new T.Vector3(p[0], p[1], p[2] || 0); }), !!chiuso, 'centripetal');
  return new T.TubeGeometry(c, seg, r, rad, !!chiuso); }
function unisci(list) { /* merge semplice di BufferGeometry indicizzate/non indicizzate (stessi attributi position/normal/uv) */
  var gs = list.filter(Boolean).map(function (g) { return g.index ? g.toNonIndexed() : g; });
  var n = 0; gs.forEach(function (g) { n += g.attributes.position.count; });
  var pos = new Float32Array(n * 3), nor = new Float32Array(n * 3), uv = new Float32Array(n * 2), o = 0;
  gs.forEach(function (g) { pos.set(g.attributes.position.array, o * 3); if (!g.attributes.normal) g.computeVertexNormals(); nor.set(g.attributes.normal.array, o * 3);
    if (g.attributes.uv) uv.set(g.attributes.uv.array, o * 2); o += g.attributes.position.count; });
  var r = new T.BufferGeometry(); r.setAttribute('position', new T.BufferAttribute(pos, 3)); r.setAttribute('normal', new T.BufferAttribute(nor, 3)); r.setAttribute('uv', new T.BufferAttribute(uv, 2));
  r.computeBoundingSphere(); return r; }
function specchiaX(g) { g = g.clone(); g.scale(-1, 1, 1); var p = g.attributes.position;
  if (g.index) { var ix = g.index.array; for (var i = 0; i < ix.length; i += 3) { var t = ix[i]; ix[i] = ix[i + 2]; ix[i + 2] = t; } }
  else { var a = p.array, nn = g.attributes.normal && g.attributes.normal.array, u = g.attributes.uv && g.attributes.uv.array;
    for (var j = 0; j < a.length; j += 9) { for (var k = 0; k < 3; k++) { var t2 = a[j + k]; a[j + k] = a[j + 6 + k]; a[j + 6 + k] = t2; if (nn) { t2 = nn[j + k]; nn[j + k] = nn[j + 6 + k]; nn[j + 6 + k] = t2; } }
      if (u) { var q = j / 9 * 6; for (var m = 0; m < 2; m++) { var t3 = u[q + m]; u[q + m] = u[q + 4 + m]; u[q + 4 + m] = t3; } } } }
  return g; }
function uvLente(g) { var p = g.attributes.position, b = [1e9, 1e9, -1e9, -1e9];
  for (var i = 0; i < p.count; i++) { b[0] = Math.min(b[0], p.getX(i)); b[1] = Math.min(b[1], p.getY(i)); b[2] = Math.max(b[2], p.getX(i)); b[3] = Math.max(b[3], p.getY(i)); }
  var uv = new Float32Array(p.count * 2); for (var j = 0; j < p.count; j++) { uv[j * 2] = (p.getX(j) - b[0]) / (b[2] - b[0]); uv[j * 2 + 1] = (p.getY(j) - b[1]) / (b[3] - b[1]); }
  g.setAttribute('uv', new T.BufferAttribute(uv, 2)); return g; }

/* ---------------- costruzione delle parti di un modello ---------------- */
var CACHE = {};
function parti(nome, lod) {
  var key = nome + '|' + (lod ? 1 : 0); if (CACHE[key]) return CACHE[key];
  var M = MODELLI[nome] || MODELLI.wayfarer, N = lod ? 20 : 56, out = [];
  var k = M.curva || 1, res;
  if (M.tipo === 'sport') res = sport(M, N, lod);
  else {
    var L = contorno(M.forma, N), bb = bbox(L), a = (bb[2] - bb[0]) / 2, cx = M.ponte / 2 + (-bb[0]);
    var lente = sposta(offset(L, -.0002), cx, 0), lenteS = sposta(lente, 0, 0, -1).reverse();
    var fronte = [], metallo = [], hy = bb[3] * .55, hx = cx + bb[2];
    if (M.tipo === 'acetato' || M.tipo === 'browline') {
      var sp = M.spess, sup = function (p) { var s = (p[1] - bb[1]) / (bb[3] - bb[1]); return sp[1] + (sp[0] - sp[1]) * Math.pow(s, 2.2); };
      if (M.tipo === 'acetato') {
        var est = offset(L, sup);
        var anello = estrudi(sposta(est, cx, 0), [sposta(L, cx, 0)], .0048, lod);
        fronte.push(anello, specchiaX(anello));
        /* ponte a sella */
        var pw = M.ponte / 2 + .0035, py0 = bb[3] * .25, py1 = bb[3] * .25 + Math.max(.0055, sp[0] * 1.05);
        var ponte = [[-pw, py0], [-pw * .5, py0 + .0022], [0, py0 + .0028], [pw * .5, py0 + .0022], [pw, py0], [pw, py1], [pw * .5, py1 + .0006], [0, py1 + .0008], [-pw * .5, py1 + .0006], [-pw, py1]];
        fronte.push(estrudi(ponte, null, .0048, lod));
        /* naselli in acetato (cuscinetti fusi) */
        if (!lod) [-1, 1].forEach(function (s) { var g = new T.SphereGeometry(.0042, 8, 6); g.scale(.5, 1.3, .9); g.translate(s * (M.ponte / 2 + .0012), -bb[3] * .25, -.0035); fronte.push(g); });
        /* cerniere: blocchetto all'esterno */
        [-1, 1].forEach(function (s) { var g = new T.BoxGeometry(.0055, .0085, .009); g.translate(s * (hx + sup([0, bb[3]]) * .7), hy, -.004); fronte.push(g); });
      } else { /* browline: sopracciglio in acetato + cerchio in metallo */
        var top = [], th = function (p) { return .0012 + (sp[0] - .0012) * Math.max(0, (p[1] - bb[3] * .15) / (bb[3] * .85)); };
        var est2 = offset(L, th), iL = [], iE = [];
        for (var i = 0; i < L.length; i++) if (L[i][1] > bb[3] * .12) { iL.push(L[i]); iE.push(est2[i]); }
        /* ordina per x crescente lungo l'arco superiore */
        var sel = iL.map(function (p, j) { return [p, iE[j]]; }).sort(function (u, v) { return u[0][0] - v[0][0]; });
        var ar = sel.map(function (q) { return q[1]; }).concat(sel.map(function (q) { return q[0]; }).reverse());
        var brow = estrudi(sposta(ar.reverse(), cx, 0), null, .0052, lod);
        fronte.push(brow, specchiaX(brow));
        var pw2 = M.ponte / 2 + .003; fronte.push(estrudi([[-pw2, bb[3] * .55], [pw2, bb[3] * .55], [pw2, bb[3] * .55 + .0045], [-pw2, bb[3] * .55 + .0045]], null, .005, lod));
        var rim = tubo(sposta(offset(L, .0006), cx, 0), .0008, true, lod ? 24 : 72, lod ? 4 : 6); metallo.push(rim, specchiaX(rim));
        metallo.push(tubo([[-M.ponte / 2 - .001, bb[3] * .3, 0], [0, bb[3] * .48, 0], [M.ponte / 2 + .001, bb[3] * .3, 0]], .0008, false, 10, 5));
        if (!lod) naselli(metallo, M, bb, out);
        [-1, 1].forEach(function (s) { var g = new T.BoxGeometry(.006, .009, .009); g.translate(s * (hx + .002), hy, -.004); fronte.push(g); });
      }
    } else { /* metallo pieno: aviator, tondo in metallo */
      var rim2 = tubo(sposta(offset(L, .0007), cx, 0), .00095, true, lod ? 24 : 80, lod ? 4 : 6); fronte.push(rim2, specchiaX(rim2));
      var yb = bb[3] * (M.doppioPonte ? .78 : .35);
      var bx = M.ponte / 2 + (M.doppioPonte ? .0075 : .0012); fronte.push(tubo([[-bx, yb, 0], [0, yb + .0015, 0], [bx, yb, 0]], .0009, false, 12, 5));
      if (M.doppioPonte) fronte.push(tubo([[-M.ponte / 2 - .001, bb[3] * .32, 0], [0, bb[3] * .48, 0], [M.ponte / 2 + .001, bb[3] * .32, 0]], .0008, false, 10, 5));
      [-1, 1].forEach(function (s) { var g = new T.BoxGeometry(.0045, .004, .006); g.translate(s * (hx + .0015), hy, -.002); fronte.push(g); });
      if (!lod) naselli(fronte, M, bb, out);
    }
    res = { fronte: fronte, metallo: metallo, lenti: [lente, lenteS], hx: hx + .002, hy: hy, k: k };
  }
  /* curvatura e lenti */
  var fr = unisci(res.fronte); piega(fr, res.k); out.push({ ruolo: 'fronte', geo: fr });
  if (res.metallo && res.metallo.length) { var me = unisci(res.metallo); piega(me, res.k); out.push({ ruolo: 'metallo', geo: me }); }
  var lg = []; res.lenti.forEach(function (P) { var g = new T.ShapeGeometry(new T.Shape(v2(P)), 1); g.translate(0, 0, res.lenteZ || .0004); lg.push(g); });
  var len = uvLente(unisci(lg)); piega(len, res.k); out.push({ ruolo: 'lente', geo: len });
  /* aste (destra e sinistra separate per poterle piegare) */
  var hz = -res.k * res.hx * res.hx - .004;
  [1, -1].forEach(function (s) { var a2 = asta(M, s, res.hx, res.hy, hz, lod); out.push({ ruolo: M.tipo === 'metallo' ? 'astaMet' : 'asta', geo: a2.asta, lato: s, cerniera: [s * res.hx, res.hy, hz] });
    if (a2.punta) out.push({ ruolo: 'punta', geo: a2.punta, lato: s, cerniera: [s * res.hx, res.hy, hz] }); });
  var ymin = 0; out.forEach(function (p) { p.geo.computeBoundingSphere(); p.geo.computeBoundingBox(); if (p.ruolo !== 'nasello') ymin = Math.min(ymin, p.geo.boundingBox.min.y); });
  out.base = ymin; CACHE[key] = out; return out;
}
function naselli(arr, M, bb, out) {
  [-1, 1].forEach(function (s) { var x = s * (M.ponte / 2 + .0015);
    arr.push(tubo([[s * (M.ponte / 2 + .003), bb[3] * .1, 0], [x, -bb[3] * .05, -.004], [x * .9, -bb[3] * .25, -.007]], .00045, false, 8, 4));
    var g = new T.SphereGeometry(.0045, 10, 6); g.scale(.35, 1.1, .7); g.rotateZ(-s * .35); g.translate(x * .85, -bb[3] * .3, -.0075);
    out.push({ ruolo: 'nasello', geo: g }); });
}
function sport(M, N, lod) {
  /* mascherina: lente unica avvolgente, sopracciglio in alto, naso intagliato */
  var P = [], W = .071, n2 = N * 2;
  for (var i = 0; i <= n2; i++) { var x = -W + 2 * W * i / n2, u = x / W; P.push([x, .019 + .003 * (1 - u * u) - .006 * Math.pow(Math.abs(u), 6)]); }
  for (var j = n2; j >= 0; j--) { var x2 = -W + 2 * W * j / n2, u2 = x2 / W; var y = -.022 + .005 * Math.pow(Math.abs(u2), 2) + .006 * Math.pow(Math.abs(u2), 8) + .016 * Math.exp(-Math.pow(x2 / .0105, 2)); P.push([x2, y]); }
  var lente = P.slice(); /* antiorario? sopra da sinistra a destra poi sotto da destra a sinistra = orario -> inverti */
  lente.reverse();
  var brow = [];
  for (var a = 0; a <= n2; a++) { var xa = -W - .002 + (2 * W + .004) * a / n2, ua = xa / W; brow.push([xa, .0185 + .003 * (1 - ua * ua) - .006 * Math.pow(Math.min(1, Math.abs(ua)), 6)]); }
  var br = brow.map(function (p) { return [p[0], p[1] + .0062 - .002 * Math.pow(p[0] / W, 2)]; }).reverse();
  var fronte = [estrudi(brow.concat(br).reverse(), null, .006, lod)];
  [-1, 1].forEach(function (s) { var g = new T.BoxGeometry(.006, .012, .012); g.translate(s * (W + .001), .014, -.005); fronte.push(g); });
  var g2 = new T.SphereGeometry(.005, 8, 6); g2.scale(1.6, .8, 1); g2.translate(0, .002, -.004); if (!lod) fronte.push(g2);
  return { fronte: fronte, lenti: [lente], hx: W + .003, hy: .014, k: M.curva, lenteZ: .0015 };
}
function asta(M, s, hx, hy, hz, lod) {
  var Lz = .118, piegaZ = .03, ex = s * .006; /* le aste si aprono leggermente */
  var path = function (u) { /* u 0..1 -> [x,y,z] */
    if (u < .8) { var t = u / .8; return [s * hx + ex * t, hy - .002 * t, hz - Lz * t]; }
    var t2 = (u - .8) / .2, ang = t2 * 1.05; return [s * hx + ex, hy - .002 - Math.sin(ang) * piegaZ * .9, hz - Lz - Math.sin(ang * .85) * piegaZ * .55]; };
  var n = lod ? 8 : 20, pts = []; for (var i = 0; i <= n; i++) pts.push(path(i / n));
  if (M.tipo === 'metallo' || M.tipo === 'browline' && false) {
    var a = tubo(pts, .00095, false, lod ? 12 : 30, lod ? 4 : 6);
    var pp = []; for (var j = 0; j <= 8; j++) pp.push(path(.72 + .28 * j / 8));
    return { asta: a, punta: tubo(pp, .0019, false, lod ? 6 : 14, lod ? 5 : 8) };
  }
  /* acetato: profilo laterale (piano z-y) con altezza che si assottiglia, estruso in x */
  var h0 = M.sportivo || M.tipo === 'sport' ? .0105 : (M.tipo === 'browline' ? .0065 : .0078), h1 = M.tipo === 'sport' ? .0055 : .0034, top = [], bot = [];
  for (var k = 0; k <= n; k++) { var u = k / n, p = path(u), p2 = path(Math.min(1, u + .01)), p1 = path(Math.max(0, u - .01));
    var tz = p2[2] - p1[2], ty = p2[1] - p1[1], L = Math.hypot(tz, ty) || 1, nz = -ty / L, ny = tz / L; /* normale nel piano */
    var h = (u < .25 ? h0 + (h1 - h0) * u / .25 : h1 + (u > .85 ? .0012 * (u - .85) / .15 : 0)) / 2;
    if (ny < 0) { nz = -nz; ny = -ny; }
    top.push([-(p[2] + nz * h), p[1] + ny * h]); bot.push([-(p[2] - nz * h), p[1] - ny * h]); }
  var sh = new T.Shape(v2(top.concat(bot.reverse())));
  var g = new T.ExtrudeGeometry(sh, lod ? { depth: .0032, bevelEnabled: false } : { depth: .0032, bevelEnabled: true, bevelThickness: .0005, bevelSize: .0004, bevelSegments: 1 });
  /* shape: x = -z, y = y; estrusione lungo +z -> ruota: x->-z, z->x */
  g.rotateY(PI / 2); /* (x,y,z)->(z,y,-x): ora z = -x_shape = z vero */
  g.translate(s * hx - .0016 + ex * .5, 0, 0);
  if (!g.attributes.normal) g.computeVertexNormals();
  return { asta: g, punta: null };
}

/* ---------------- materiali condivisi ---------------- */
var MAT = {};
function cTex(w, h, f) { var c = document.createElement('canvas'); c.width = w; c.height = h; f(c.getContext('2d'), w, h); var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; return t; }
function rnd(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function texTartaruga(base, scuro, chiaro, seme) {
  var t = cTex(256, 256, function (g, w, h) { var r = rnd(seme || 7); g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 120; i++) { var x = r() * w, y = r() * h, rr = 4 + r() * 16, col = r() < .6 ? scuro : chiaro;
      for (var dx = -1; dx <= 1; dx++) for (var dy = -1; dy <= 1; dy++) { var gr = g.createRadialGradient(x + dx * w, y + dy * h, 0, x + dx * w, y + dy * h, rr);
        gr.addColorStop(0, col); gr.addColorStop(.55, col + 'aa'); gr.addColorStop(1, col + '00'); g.fillStyle = gr; g.beginPath(); g.ellipse(x + dx * w, y + dy * h, rr * 1.4, rr * .8, r() * 3, 0, 7); g.fill(); } } });
  t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(34, 34); return t; }
var FINITURE = {
  nero:        function () { return new T.MeshPhysicalMaterial({ color: 0x0b0b0c, roughness: .16, clearcoat: 1, clearcoatRoughness: .05, envMapIntensity: 1.3 }); },
  neroOpaco:   function () { return new T.MeshPhysicalMaterial({ color: 0x151517, roughness: .55, clearcoat: .2 }); },
  tartaruga:   function () { return new T.MeshPhysicalMaterial({ map: texTartaruga('#3b1a0a', '#0f0402', '#a8621f', 11), roughness: .2, clearcoat: 1, clearcoatRoughness: .06, envMapIntensity: 1.2 }); },
  havanaMiele: function () { return new T.MeshPhysicalMaterial({ map: texTartaruga('#9a5f24', '#3a1606', '#d9a352', 23), roughness: .2, clearcoat: 1, transparent: true, opacity: .93 }); },
  cristallo:   function () { return new T.MeshPhysicalMaterial({ color: 0xeef3f4, roughness: .04, clearcoat: 1, transparent: true, opacity: .42, envMapIntensity: 1.6, depthWrite: false }); },
  champagne:   function () { return new T.MeshPhysicalMaterial({ color: 0xe8cfae, roughness: .06, clearcoat: 1, transparent: true, opacity: .62, envMapIntensity: 1.4 }); },
  bordeaux:    function () { return new T.MeshPhysicalMaterial({ color: 0x5a0f17, roughness: .18, clearcoat: 1, envMapIntensity: 1.2 }); },
  blu:         function () { return new T.MeshPhysicalMaterial({ color: 0x14284a, roughness: .2, clearcoat: 1 }); },
  verdeSalvia: function () { return new T.MeshPhysicalMaterial({ color: 0x5f7360, roughness: .25, clearcoat: .9 }); },
  rossoSport:  function () { return new T.MeshPhysicalMaterial({ color: 0xb3121b, roughness: .35, clearcoat: .6 }); },
  rosa:        function () { return new T.MeshPhysicalMaterial({ color: 0xe58fa6, roughness: .25, clearcoat: .9, transparent: true, opacity: .9 }); },
  bianco:      function () { return new T.MeshPhysicalMaterial({ color: 0xf1efe9, roughness: .3, clearcoat: .8 }); },
  oro:         function () { return new T.MeshStandardMaterial({ color: 0xd9b56c, metalness: 1, roughness: .22, envMapIntensity: 1.5 }); },
  oroRosa:     function () { return new T.MeshStandardMaterial({ color: 0xd9a08a, metalness: 1, roughness: .25, envMapIntensity: 1.5 }); },
  argento:     function () { return new T.MeshStandardMaterial({ color: 0xdadde0, metalness: 1, roughness: .2, envMapIntensity: 1.5 }); },
  canna:       function () { return new T.MeshStandardMaterial({ color: 0x4b4d52, metalness: 1, roughness: .3, envMapIntensity: 1.4 }); },
  silicone:    function () { return new T.MeshPhysicalMaterial({ color: 0xf4f6f6, roughness: .1, transparent: true, opacity: .55, depthWrite: false }); }
};
function texSfumata() { var t = cTex(4, 128, function (g, w, h) { var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#fff'); gr.addColorStop(.45, '#ddd'); gr.addColorStop(1, '#2a2a2a'); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); t.colorSpace = T.NoColorSpace; return t; }
var LENTI = {
  g15:        function () { return lenteMat({ color: 0x223022, opacity: .88 }); },
  marrone:    function () { return lenteMat({ color: 0x3e2414, opacity: .86 }); },
  grigia:     function () { return lenteMat({ color: 0x1a1c1f, opacity: .9 }); },
  sfumata:    function () { return lenteMat({ color: 0x1c1d22, opacity: 1, alphaMap: texSfumata() }); },
  sfumataMarr:function () { return lenteMat({ color: 0x4a2a15, opacity: 1, alphaMap: texSfumata() }); },
  specchioBlu:function () { return lenteMat({ color: 0x2f6fe0, opacity: .95, metalness: .85, roughness: .05, iridescence: .8 }); },
  specchioOro:function () { return lenteMat({ color: 0xe0902a, opacity: .95, metalness: .85, roughness: .05, iridescence: .6 }); },
  specchioViola:function () { return lenteMat({ color: 0x8a3fd0, opacity: .95, metalness: .8, roughness: .06, iridescence: 1 }); },
  specchioArg:function () { return lenteMat({ color: 0xc8ccd2, opacity: .96, metalness: .95, roughness: .04 }); },
  verdePolar: function () { return lenteMat({ color: 0x1d3b2a, opacity: .9 }); },
  chiara:     function () { return lenteMat({ color: 0xffffff, opacity: .1 }); },
  rosa:       function () { return lenteMat({ color: 0xd98a9a, opacity: .55 }); }
};
function lenteMat(o) { return new T.MeshPhysicalMaterial({ color: o.color, metalness: o.metalness || 0, roughness: o.roughness != null ? o.roughness : .03, transparent: true, opacity: o.opacity,
  alphaMap: o.alphaMap || null, clearcoat: 1, clearcoatRoughness: .02, envMapIntensity: 2.2, depthWrite: false, side: T.DoubleSide,
  iridescence: o.iridescence || 0, iridescenceIOR: 1.6, iridescenceThicknessRange: [200, 600] }); }
function mat(tab, nome) { var k = (tab === LENTI ? 'L:' : 'F:') + nome; if (!MAT[k]) { var f = tab[nome] || (tab === LENTI ? LENTI.grigia : FINITURE.nero); MAT[k] = f(); MAT[k].name = k; } return MAT[k]; }

/* stile: {finitura, metallo, lente, punta, piegate}
   ruoli: fronte -> finitura (per i modelli in metallo: metallo); metallo -> metallo; asta -> finitura; astaMet -> metallo; punta -> punta; nasello -> silicone */
function materialePer(ruolo, M, st) {
  var metalNome = st.metallo || (st.finitura && /oro|argento|canna/.test(st.finitura) ? st.finitura : 'argento');
  if (ruolo === 'lente') return mat(LENTI, st.lente || 'g15');
  if (ruolo === 'nasello') return mat(FINITURE, 'silicone');
  if (ruolo === 'metallo' || ruolo === 'astaMet') return mat(FINITURE, metalNome);
  if (ruolo === 'punta') return mat(FINITURE, st.punta || (M.tipo === 'metallo' ? 'nero' : st.finitura || 'nero'));
  if (ruolo === 'fronte' && M.tipo === 'metallo') return mat(FINITURE, metalNome);
  return mat(FINITURE, st.finitura || 'nero');
}

/* ---------------- LOTTO: tanti occhiali -> poche InstancedMesh ---------------- */
function Lotto(nome) { this.nome = nome || 'occhiali'; this.voci = []; }
Lotto.prototype.aggiungi = function (modello, stile, matrice) { this.voci.push({ m: modello, st: stile || {}, M: matrice.clone() }); return this; };
var _m = new T.Matrix4(), _r = new T.Matrix4(), _t = new T.Matrix4();
function costruisciLivello(voci, lod, unito) {
  var gruppi = {}, g = new T.Group();
  voci.forEach(function (v) { var M = MODELLI[v.m] || MODELLI.wayfarer;
    parti(v.m, lod).forEach(function (p) { if (lod && p.ruolo === 'nasello') return;
      var ma = materialePer(p.ruolo, M, v.st), k = p.geo.uuid + '|' + ma.uuid, loc = null;
      if (p.cerniera && v.st.piegate) { var h = p.cerniera, s = p.lato, ang = v.st.piegate === true ? 1.5 : v.st.piegate;
        loc = new T.Matrix4().makeTranslation(0, s * .0024, s > 0 ? -.002 : -.0055).multiply(new T.Matrix4().makeTranslation(h[0], h[1], h[2])).multiply(new T.Matrix4().makeRotationY(s * ang)).multiply(new T.Matrix4().makeTranslation(-h[0], -h[1], -h[2])); }
      (gruppi[k] = gruppi[k] || { geo: p.geo, mat: ma, ruolo: p.ruolo, mm: [] }).mm.push(loc ? v.M.clone().multiply(loc) : v.M); }); });
  if (unito) { /* occhiali fermi: una sola mesh per MATERIALE (meno chiamate di disegno delle InstancedMesh) */
    var perMat = {}; Object.keys(gruppi).forEach(function (k) { var q = gruppi[k]; (perMat[q.mat.uuid] = perMat[q.mat.uuid] || { mat: q.mat, ruolo: q.ruolo, l: [] }).l.push(q); });
    Object.keys(perMat).forEach(function (k) { var P = perMat[k], gs = [];
      P.l.forEach(function (q) { var base = q.geo.index ? q.geo.toNonIndexed() : q.geo; q.mm.forEach(function (M) { gs.push(base.clone().applyMatrix4(M)); }); });
      var me = new T.Mesh(unisci(gs), P.mat); gs.forEach(function (g) { g.dispose(); });
      me.castShadow = P.ruolo !== 'lente' && P.ruolo !== 'nasello' && !lod; me.receiveShadow = false; me.renderOrder = P.ruolo === 'lente' ? 3 : 0; me.name = 'occhiali:' + P.ruolo; g.add(me); });
    return g; }
  Object.keys(gruppi).forEach(function (k) { var q = gruppi[k], im = new T.InstancedMesh(q.geo, q.mat, q.mm.length);
    q.mm.forEach(function (M, i) { im.setMatrixAt(i, M); }); im.instanceMatrix.needsUpdate = true; im.computeBoundingSphere && im.computeBoundingSphere();
    im.castShadow = q.ruolo !== 'lente' && q.ruolo !== 'nasello' && !lod; im.receiveShadow = false; im.renderOrder = q.ruolo === 'lente' ? 3 : 0; im.name = 'occhiali:' + q.ruolo; g.add(im); });
  return g; }
Lotto.prototype.costruisci = function (opz) {
  opz = opz || {}; var root = new T.Group(); root.name = this.nome;
  /* VERSIONI 5/11: nella versione UNIVERSALE solo il livello leggero (meno triangoli e meno memoria, niente cambio di livello) */
  var uni = !!(window.N3D_P && window.N3D_P.uni);
  var un = opz.istanze ? false : true, hi = costruisciLivello(this.voci, uni ? 1 : 0, un), lo = (opz.senzaLod || uni) ? null : costruisciLivello(this.voci, 1, un);
  root.add(hi); if (lo) { lo.visible = false; root.add(lo); }
  var c = new T.Vector3(); this.voci.forEach(function (v) { c.add(new T.Vector3().setFromMatrixPosition(v.M)); }); if (this.voci.length) c.multiplyScalar(1 / this.voci.length);
  root.userData.lod = { hi: hi, lo: lo, centro: c, dist: opz.dist || 3.2 };
  LOTTI.push(root); return root; };
var LOTTI = [], _w = new T.Vector3();
function aggiornaLOD(camera) {
  LOTTI.forEach(function (r) { var L = r.userData.lod; if (!L.lo) return; _w.copy(L.centro); r.parent && r.parent.localToWorld(_w);
    var lontano = camera.position.distanceTo(_w) > L.dist * (camera.fov > 40 ? 1 : 1.8); L.hi.visible = !lontano; L.lo.visible = lontano; }); }

/* posa comoda: matrice da posizione, rotazione y (fronte verso la direzione ry), inclinazione x */
function posa(x, y, z, ry, rx, rz, s) { var o = new T.Object3D(); o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, rz || 0, 'YXZ'); if (s) o.scale.setScalar(s); o.updateMatrix(); return o.matrix.clone(); }

/* un singolo occhiale come Group (per prove e oggetti isolati) */
function crea(modello, stile, lod) { var L = new Lotto(); L.aggiungi(modello, stile, new T.Matrix4()); var g = costruisciLivello(L.voci, lod ? 1 : 0); return g; }

/* ================= ESPOSITORI ================= */
var EM = {};
function em(nome) { if (EM[nome]) return EM[nome]; var m;
  switch (nome) {
    case 'plexi': m = new T.MeshPhysicalMaterial({ color: 0xf2fbfb, roughness: .03, metalness: 0, transparent: true, opacity: .2, clearcoat: 1, envMapIntensity: 1.8, depthWrite: false, side: T.DoubleSide }); break;
    case 'plexiBordo': m = new T.LineBasicMaterial({ color: 0xdff4f2, transparent: true, opacity: .55 }); break;
    case 'plexiFumé': m = new T.MeshPhysicalMaterial({ color: 0x2a2c30, roughness: .05, transparent: true, opacity: .55, clearcoat: 1, depthWrite: false }); break;
    case 'biancoLucido': m = new T.MeshPhysicalMaterial({ color: 0xf6f4ef, roughness: .22, clearcoat: .8, clearcoatRoughness: .1 }); break;
    case 'biancoOpaco': m = new T.MeshStandardMaterial({ color: 0xf1ede6, roughness: .7 }); break;
    case 'neroLucido': m = new T.MeshPhysicalMaterial({ color: 0x0d0d0f, roughness: .15, clearcoat: 1, clearcoatRoughness: .05 }); break;
    case 'nero': m = new T.MeshStandardMaterial({ color: 0x141416, roughness: .55 }); break;
    case 'cromo': m = new T.MeshStandardMaterial({ color: 0xe6e8ea, metalness: 1, roughness: .12 }); break;
    case 'legnoNoce': m = new T.MeshStandardMaterial({ color: 0x5b3a22, roughness: .5 }); break;
    case 'velluto': m = new T.MeshStandardMaterial({ color: 0x2b2420, roughness: .95 }); break;
    case 'busto': m = new T.MeshPhysicalMaterial({ color: 0xece7df, roughness: .45, clearcoat: .3 }); break;
    default: m = new T.MeshStandardMaterial({ color: 0x999999 }); }
  return EM[nome] = m; }
function rbox(w, h, d, r, m) { var g = T.RoundedBoxGeometry ? new T.RoundedBoxGeometry(w, h, d, 2, Math.min(r, w / 2, h / 2, d / 2)) : new T.BoxGeometry(w, h, d); return new T.Mesh(g, m); }
function lastraPlexi(w, h, d, bordi) { var g = new T.Group(), b = new T.Mesh(new T.BoxGeometry(w, h, d), em('plexi')); b.renderOrder = 2; g.add(b);
  if (bordi !== false) g.add(new T.LineSegments(new T.EdgesGeometry(new T.BoxGeometry(w, h, d)), em('plexiBordo'))); return g; }
/* tutti gli espositori: origine al centro della base, fronte +z; ritornano {g, punti:[{x,y,z,ry,rx}]} = dove poggiare gli occhiali */
var ESP = {
  /* alzatina a gradini (plexi o bianco): n gradini, larghezza w, profondità per gradino dg, alzata hg */
  gradini: function (n, w, dg, hg, matNome) { var g = new T.Group(), punti = [];
    for (var i = 0; i < n; i++) { var hh = hg * (i + 1), z = (n - 1 - i) * dg - (n - 1) * dg / 2;
      var p = matNome ? rbox(w, hh, dg, .003, em(matNome)) : lastraPlexi(w, hh, dg); p.position.set(0, hh / 2, z); g.add(p);
      punti.push({ y: hh, z: z, riga: i }); } /* i=0 = gradino basso davanti */
    return { g: g, punti: punti }; },
  /* supporto a T trasparente: asta con traversino in cima dove si appoggia il ponte */
  T: function (h) { var g = new T.Group(), base = lastraPlexi(.06, .006, .05); base.position.y = .003; g.add(base);
    var asta = lastraPlexi(.012, h, .006); asta.position.y = h / 2 + .006; g.add(asta); var tr = lastraPlexi(.05, .006, .03); tr.position.set(0, h + .006, .0); g.add(tr);
    return { g: g, punti: [{ y: h + .009 + .012, z: .004 }] }; },
  /* torretta in acrilico: pannello verticale con n perni, un occhiale per perno */
  torretta: function (n, h, matNome) { var g = new T.Group(), punti = [];
    var base = matNome ? rbox(.16, .012, .1, .003, em(matNome)) : lastraPlexi(.16, .012, .1); base.position.y = .006; g.add(base);
    var pan = matNome ? rbox(.05, h, .01, .002, em(matNome)) : lastraPlexi(.05, h, .01); pan.position.set(0, h / 2 + .012, -.03); g.add(pan);
    for (var i = 0; i < n; i++) { var y = .05 + (h - .07) * i / Math.max(1, n - 1);
      var perno = new T.Mesh(new T.CylinderGeometry(.0035, .0035, .05, 10), em('plexi')); perno.rotation.x = PI / 2; perno.position.set(0, y + .012, -.005); g.add(perno);
      punti.push({ y: y + .012 + .008, z: .006, rx: .12 }); }
    return { g: g, punti: punti }; },
  /* cubo (plexi, bianco, nero) */
  cubo: function (l, matNome) { var g = new T.Group(), c = matNome ? rbox(l, l, l, .003, em(matNome)) : lastraPlexi(l, l, l); c.position.y = l / 2; g.add(c); return { g: g, punti: [{ y: l, z: 0 }] }; },
  /* vassoio basso con bordino */
  vassoio: function (w, d, matNome) { var g = new T.Group(), m = em(matNome || 'nero'); var f = rbox(w, .008, d, .003, m); f.position.y = .004; g.add(f);
    [[0, d / 2], [0, -d / 2]].forEach(function (q) { var b = rbox(w, .018, .006, .002, m); b.position.set(0, .009, q[1]); g.add(b); });
    [[-w / 2], [w / 2]].forEach(function (q) { var b = rbox(.006, .018, d, .002, m); b.position.set(q[0], .009, 0); g.add(b); });
    var vel = new T.Mesh(new T.PlaneGeometry(w - .012, d - .012), em('velluto')); vel.rotation.x = -PI / 2; vel.position.y = .0085; g.add(vel); return { g: g, punti: [{ y: .009, z: 0 }] }; },
  /* blocco brand: parallelepipedo con il logo sul fronte (tex = CanvasTexture) */
  blocco: function (w, h, d, tex, matNome) { var g = new T.Group(), m = em(matNome || 'biancoLucido'), b = rbox(w, h, d, .003, m); b.position.y = h / 2; g.add(b);
    if (tex) { var f = new T.Mesh(new T.PlaneGeometry(w * .92, h * .8), new T.MeshStandardMaterial({ map: tex, roughness: .5, transparent: true })); f.position.set(0, h / 2, d / 2 + .0007); g.add(f); }
    return { g: g, punti: [{ y: h, z: 0 }] }; },
  /* busto stilizzato bianco (testa ovale su collo) che indossa l'occhiale */
  busto: function (s) { s = s || 1; var g = new T.Group(), m = em('busto');
    var base = new T.Mesh(new T.CylinderGeometry(.045 * s, .05 * s, .02 * s, 28), em('neroLucido')); base.position.y = .01 * s; g.add(base);
    var spalle = new T.Mesh(new T.SphereGeometry(.07 * s, 24, 12, 0, PI * 2, 0, PI / 2), m); spalle.scale.set(1.25, .55, .6); spalle.position.y = .02 * s; g.add(spalle);
    var collo = new T.Mesh(new T.CylinderGeometry(.023 * s, .027 * s, .07 * s, 20), m); collo.position.y = .075 * s; g.add(collo);
    var testa = new T.Mesh(new T.SphereGeometry(.05 * s, 28, 20), m); testa.scale.set(.82, 1.12, .95); testa.position.set(0, .15 * s, .004 * s); g.add(testa);
    var naso = new T.Mesh(new T.ConeGeometry(.009 * s, .026 * s, 10), m); naso.rotation.x = PI / 2 - .35; naso.position.set(0, .148 * s, .052 * s); g.add(naso);
    return { g: g, punti: [{ y: .162 * s, z: .052 * s, faccia: true }] }; },
  /* pannello a muro con barrette (stile David Beckham): occhiali appesi in colonna */
  colonnaBarre: function (n, h, w, matNome) { var g = new T.Group(), punti = [], m = em(matNome || 'plexi');
    var pan = matNome ? rbox(w, h, .008, .002, m) : lastraPlexi(w, h, .008); pan.position.set(0, h / 2, -.02); g.add(pan);
    for (var i = 0; i < n; i++) { var y = .04 + (h - .07) * i / Math.max(1, n - 1); var bar = lastraPlexi(w * .9, .006, .03, false); bar.position.set(0, y, -.005); g.add(bar); punti.push({ y: y + .014, z: .01, rx: .2 }); }
    return { g: g, punti: punti }; }
};

/* decorazioni carta a nido d'ape (zucche, funghi, palline) come in vetrina oggi */
function nidoDape(tipo, colore, s) { s = s || 1; var g = new T.Group(), m = new T.MeshStandardMaterial({ color: colore, roughness: .85, flatShading: true });
  var prof = [];
  if (tipo === 'fungo') { prof = [[0, 0], [.01, 0], [.009, .03], [.035, .032], [.04, .045], [.03, .065], [.012, .078], [0, .08]]; }
  else if (tipo === 'pera') { prof = [[0, 0], [.012, .004], [.022, .02], [.024, .04], [.015, .065], [.006, .085], [0, .09]]; }
  else { prof = [[0, 0], [.02, .004], [.034, .02], [.038, .04], [.034, .06], [.02, .076], [0, .08]]; }
  var geo = new T.LatheGeometry(prof.map(function (p) { return new T.Vector2(p[0] * s, p[1] * s); }), 14); var me = new T.Mesh(geo, m); me.castShadow = true; g.add(me);
  if (tipo === 'zucca') { var st = new T.Mesh(new T.CylinderGeometry(.003 * s, .004 * s, .02 * s, 6), new T.MeshStandardMaterial({ color: 0x1d5a26, roughness: .8 })); st.position.y = .085 * s; g.add(st); }
  return g; }

window.OCCHIALI = { base: function (m) { return parti(m, 0).base; }, MODELLI: MODELLI, FORME: FORME, BASE: BASE, parti: parti, Lotto: Lotto, crea: crea, posa: posa, aggiornaLOD: aggiornaLOD, LOTTI: LOTTI,
  materiale: function (nome) { return mat(FINITURE, nome); }, lente: function (nome) { return mat(LENTI, nome); }, FINITURE: Object.keys(FINITURE), LENTI: Object.keys(LENTI),
  espositori: ESP, em: em, nidoDape: nidoDape, lastraPlexi: lastraPlexi, rbox: rbox, cTex: cTex };
})();
