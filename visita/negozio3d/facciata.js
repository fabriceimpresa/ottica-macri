/* =====================================================================
   OTTICA MACRÌ · FACCIATA SU STRADA (agente 3D, giro 2, 5/11/2026)
   Dalla foto IMG_9485 (di notte) e dai fotogrammi IMG_9484: cassonetto luminoso bianco con le lettere OTTICA
   effetto marmo bruno-ruggine e la targa gialla «Aldo Macrì», fascia scura sopra il vano, profili in bronzo scuro,
   pilastri in travertino, due bacheche ai lati, gradino di cubetti, marciapiede con la lamiera striata, strada di sera.
   Misure in RILIEVO.stanza.facciata (rilievo.js). La pagina chiama window.FACCIATA3D(ctx) dentro costruisciZone().
   Coordinate della scena: x come il rilievo, z scena = -z rilievo (la strada è verso +z), y su.
   Solo canvas e colori (nessuna immagine esterna): funziona con file://.
   ===================================================================== */
(function () {
'use strict';
function rnd(s) { return function () { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }

window.FACCIATA3D = function (c) {
  var T = c.T, G = c.G, F = c.ST.facciata, Z = c.Z, zf = Z(F.z), PI = Math.PI;
  var V = F.vano, x0 = V.x0, x1 = V.x1, hV = V.h;
  function tex(w, h, f, rep) { var t = c.cTex(w, h, f); if (rep) { t.wrapS = t.wrapT = T.RepeatWrapping; t.repeat.set(rep[0], rep[1]); } return t; }
  function box(w, h, d, m, x, y, z) { var me = new T.Mesh(new T.BoxGeometry(w, h, d), m); me.position.set(x, y, z); me.castShadow = false; me.receiveShadow = true; G.fuori.add(me); return me; }

  /* ---------- materiali ---------- */
  var travTex = tex(512, 512, function (g, w, h) { var r = rnd(17); g.fillStyle = '#8a857b'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 40; i++) { var y = r() * h, hh = 1 + r() * 3; g.fillStyle = 'rgba(' + (r() < .5 ? '70,64,55' : '170,165,150') + ',' + (.04 + r() * .07) + ')'; g.fillRect(r() * w * .5, y, w * (.3 + r() * .7), hh); }
    for (i = 0; i < 30; i++) { g.fillStyle = 'rgba(60,55,48,' + (.05 + r() * .08) + ')'; g.beginPath(); g.ellipse(r() * w, r() * h, 10 + r() * 50, 4 + r() * 12, 0, 0, 7); g.fill(); }
    for (i = 0; i < 700; i++) { g.fillStyle = 'rgba(40,34,26,' + (.15 + r() * .35) + ')'; g.fillRect(r() * w, r() * h, 1 + r() * 4, 1 + r() * 2); }
    g.strokeStyle = 'rgba(30,26,20,.55)'; g.lineWidth = 2; for (i = 0; i <= 2; i++) { g.beginPath(); g.moveTo(0, i * h / 2); g.lineTo(w, i * h / 2); g.stroke(); } }, [1, 1]);
  function trav(rx, ry) { var t = travTex.clone(); t.needsUpdate = true; t.repeat.set(rx, ry); return new T.MeshStandardMaterial({ map: t, roughness: .92, color: 0x86868a }); }
  var bronzo = c.matCol('#3e3320', .4, .7), bronzoChiaro = c.matCol('#5a4a2c', .35, .75), nero = c.matCol('#15120e', .6, .1);

  /* ---------- muro di facciata con i fori (vano + bacheche) ---------- */
  var sh = new T.Shape([new T.Vector2(-3, 0), new T.Vector2(8, 0), new T.Vector2(8, 7.5), new T.Vector2(-3, 7.5)]);
  function foro(a, b, y0, y1) { sh.holes.push(new T.Path([new T.Vector2(a, y0), new T.Vector2(a, y1), new T.Vector2(b, y1), new T.Vector2(b, y0)])); }
  foro(x0, x1, .001, hV); (F.bacheche || []).forEach(function (q) { foro(q.x0, q.x1, q.y0, q.y1); });
  var gm = new T.ShapeGeometry(sh), uv = gm.attributes.uv; for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.2, uv.getY(i) / 1.2);
  var tm = travTex.clone(); tm.needsUpdate = true; tm.repeat.set(1, 1);
  var muro = new T.Mesh(gm, new T.MeshStandardMaterial({ map: tm, roughness: .93, color: 0x55565a })); muro.position.z = zf + .001; muro.receiveShadow = true; G.fuori.add(muro);
  /* zoccolo scuro del palazzo e marcapiano */
  [[-3, x0 - .26], [x1 + .35, 8]].forEach(function (q) { box(q[1] - q[0], .32, .03, c.matCol('#4d463b', .9), (q[0] + q[1]) / 2, .16, zf + .016); });

  /* ---------- pilastri in travertino con profilo bronzo verso il vano ---------- */
  (F.pilastri || []).forEach(function (p) { var w = p.x1 - p.x0; box(w, hV + .02, .05, trav(w / 1.2, hV / 1.2), (p.x0 + p.x1) / 2, (hV + .02) / 2, zf + .025); });
  [[x0, 1], [x1, -1]].forEach(function (q) { box(.045, hV, .1, bronzo, q[0] + q[1] * .0225, hV / 2, zf - .02); box(.012, hV, .1, bronzoChiaro, q[0] + q[1] * .05, hV / 2, zf - .02); });
  box(x1 - x0, .05, .1, bronzo, (x0 + x1) / 2, hV + .005, zf - .02);

  /* ---------- fascia scura sopra il vano + telecamera ---------- */
  var fa = F.fascia || { y0: hV, y1: hV + .64 }, ins = F.insegna;
  box(ins.x1 - ins.x0 + .1, fa.y1 - fa.y0, .07, c.matCol(fa.colore || '#17130f', .55, .2), (ins.x0 + ins.x1) / 2, (fa.y0 + fa.y1) / 2, zf + .035);
  var cam = new T.Group(), cb = new T.Mesh(new T.BoxGeometry(.07, .07, .16), c.matCol('#2a2a2c', .5)); cb.position.z = .08; cam.add(cb);
  cam.position.set(x0 + .2, hV - .18, zf - .06); cam.rotation.set(-.35, .4, 0); G.fuori.add(cam);

  /* ---------- INSEGNA luminosa: OTTICA in marmo bruno + targa gialla Aldo Macrì ---------- */
  var IW = ins.x1 - ins.x0, IH = ins.y1 - ins.y0, CW = 2048, CH = Math.round(CW * IH / IW);
  var marmo = document.createElement('canvas'); marmo.width = CW; marmo.height = CH;
  (function (g) { var r = rnd(29); var gr = g.createLinearGradient(0, 0, CW, CH); gr.addColorStop(0, '#5a2612'); gr.addColorStop(.5, '#7a3a1c'); gr.addColorStop(1, '#4a1d0d'); g.fillStyle = gr; g.fillRect(0, 0, CW, CH);
    for (var k = 0; k < 260; k++) { var x = r() * CW, y = r() * CH, L = 60 + r() * 260, a = r() * PI * 2;
      g.strokeStyle = ['rgba(232,205,175,', 'rgba(170,86,40,', 'rgba(40,14,6,', 'rgba(205,140,90,'][k % 4] + (.25 + r() * .5) + ')'; g.lineWidth = 2 + r() * (k % 4 === 0 ? 14 : 9);
      g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + Math.cos(a) * L, y + Math.sin(a) * L * .6, x + Math.cos(a + 1.6) * L, y + Math.sin(a + 2) * L, x + Math.cos(a + .7) * L * 1.3, y + Math.sin(a + .4) * L); g.stroke(); } })(marmo.getContext('2d'));
  var insTex = c.cTex(CW, CH, function (g, w, h) {
    var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#f6f8fb'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(1, '#eef1f4'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
    var fs = Math.round(h * .74); g.font = '900 ' + fs + 'px "Arial Black","Segoe UI Black",Arial,sans-serif'; g.textBaseline = 'alphabetic';
    var txt = ins.testo || 'OTTICA', yb = h * .95, n = txt.length, cell = w * .96 / n, xs = w * .02;
    /* ombra/rilievo delle lettere */
    var tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h; var q = tmp.getContext('2d'); q.font = g.font; q.textAlign = 'center'; q.textBaseline = 'alphabetic';
    for (var k = 0; k < n; k++) { var cx = xs + cell * (k + .5), mw = q.measureText(txt[k]).width, sx = Math.min(1.7, cell * .97 / mw); q.save(); q.translate(cx, yb); q.scale(sx, 1); q.fillText(txt[k], 0, 0); q.restore(); }
    g.save(); g.globalAlpha = .45; g.filter = 'blur(6px)'; g.drawImage(tmp, 10, 12); g.restore(); g.filter = 'none';
    var lt = document.createElement('canvas'); lt.width = w; lt.height = h; var l = lt.getContext('2d'); l.drawImage(marmo, 0, 0); l.globalCompositeOperation = 'destination-in'; l.drawImage(tmp, 0, 0);
    g.drawImage(lt, 0, 0);
    g.strokeStyle = 'rgba(40,16,6,.85)'; g.lineWidth = 5; g.textAlign = 'center';
    for (k = 0; k < n; k++) { cx = xs + cell * (k + .5); mw = g.measureText(txt[k]).width; sx = Math.min(1.7, cell * .97 / mw); g.save(); g.translate(cx, yb); g.scale(sx, 1); g.strokeText(txt[k], 0, 0); g.restore(); }
    /* targa gialla */
    if (F.targa) { var tg = F.targa, px = (tg.x0 - ins.x0) / IW * w, pw = (tg.x1 - tg.x0) / IW * w, py = (ins.y1 - tg.y1) / IH * h, ph = (tg.y1 - tg.y0) / IH * h;
      g.fillStyle = '#111'; g.fillRect(px - 6, py - 6, pw + 12, ph + 12); g.fillStyle = '#f3e23a'; g.fillRect(px, py, pw, ph);
      g.fillStyle = '#3a3a36'; g.font = '700 ' + Math.round(ph * .8) + 'px Arial,Helvetica,sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(tg.testo, px + pw / 2, py + ph * .55); }
  });
  insTex.anisotropy = 8;
  var cass = new T.Group(); cass.position.set((ins.x0 + ins.x1) / 2, (ins.y0 + ins.y1) / 2, zf + .11); G.fuori.add(cass);
  var corpo = new T.Mesh(new T.BoxGeometry(IW, IH, .16), c.matCol('#8c8f93', .35, .7)); corpo.position.z = -.0; cass.add(corpo);
  var fronte = new T.Mesh(new T.PlaneGeometry(IW - .03, IH - .03), new T.MeshBasicMaterial({ map: insTex, toneMapped: false, color: new T.Color(1.0, 1.0, 1.0) })); fronte.position.z = .081; cass.add(fronte);
  /* alone di luce dell'insegna sul muro e sul marciapiede */
  var alone = new T.PointLight(0xf2f4ff, 5, 7, 1.6); alone.position.set((ins.x0 + ins.x1) / 2, ins.y0 - .25, zf + 1.1); G.fuori.add(alone);
  var aT = c.cTex(256, 128, function (g, w, h) { var gr = g.createRadialGradient(w / 2, h / 2, 4, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(255,255,255,.55)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  var al = new T.Mesh(new T.PlaneGeometry(IW * 1.5, IH * 2.4), new T.MeshBasicMaterial({ map: aT, transparent: true, depthWrite: false, blending: T.AdditiveBlending, opacity: .35, toneMapped: false })); al.position.set(cass.position.x, cass.position.y, zf + .04); G.fuori.add(al);

  /* ---------- bacheche ai lati ---------- */
  (F.bacheche || []).forEach(function (q, j) { var w = q.x1 - q.x0, h = q.y1 - q.y0, cx = (q.x0 + q.x1) / 2, cy = (q.y0 + q.y1) / 2;
    var pt = c.cTex(256, Math.round(256 * h / w), function (g, W, H) { var gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#2a2420'); gr.addColorStop(1, '#0d0b0a'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
      if (q.poster === 'CARRERA') { g.fillStyle = '#3c3530'; g.fillRect(W * .06, H * .06, W * .88, H * .62); g.fillStyle = '#d0141c'; g.font = 'italic 900 ' + Math.round(W * .2) + 'px Arial Black,Arial'; g.textAlign = 'center'; g.fillText('CARRERA', W / 2, H * .14);
        g.fillStyle = '#0a0a0a'; g.beginPath(); g.ellipse(W * .36, H * .32, W * .14, H * .045, 0, 0, 7); g.ellipse(W * .66, H * .32, W * .14, H * .045, 0, 0, 7); g.fill(); }
      else { g.fillStyle = '#4a4440'; g.fillRect(W * .1, H * .08, W * .8, H * .55); g.fillStyle = '#7d7468'; g.fillRect(W * .15, H * .7, W * .7, H * .2); } });
    var fondo = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshStandardMaterial({ map: pt, roughness: .6, color: 0x9a9a9a })); fondo.position.set(cx, cy, zf - .18); G.fuori.add(fondo);
    [[cx, q.y1, w + .04, .04], [cx, q.y0, w + .04, .04]].forEach(function (b) { box(b[2], b[3], .06, bronzo, b[0], b[1], zf - .01); });
    [[q.x0, h], [q.x1, h]].forEach(function (b) { box(.04, b[1], .06, bronzo, b[0], cy, zf - .01); });
    var vt = new T.Mesh(new T.PlaneGeometry(w, h), new T.MeshPhysicalMaterial({ color: 0xffffff, roughness: .04, transparent: true, opacity: .14, depthWrite: false })); vt.position.set(cx, cy, zf - .005); G.fuori.add(vt);
    /* fianchi scuri della nicchia */
    box(w, .01, .18, nero, cx, q.y0 + .005, zf - .09); box(w, .01, .18, nero, cx, q.y1 - .005, zf - .09); });

  /* ---------- gradino di cubetti sul filo strada ---------- */
  var gr = F.gradino || { h: .03, prof: .16 };
  var cub = tex(256, 64, function (g, w, h) { g.fillStyle = '#6d665c'; g.fillRect(0, 0, w, h); var r = rnd(5); for (var i = 0; i < 16; i++) for (var j = 0; j < 4; j++) { var l = 196 + r() * 40; g.fillStyle = 'rgb(' + l + ',' + (l - 6) + ',' + (l - 18) + ')'; g.fillRect(i * 16 + 1, j * 16 + 1, 14, 14); } }, [(x1 - x0) / 2.6, 1]);
  var gs = new T.Mesh(new T.BoxGeometry(x1 - x0, gr.h, gr.prof), new T.MeshStandardMaterial({ map: cub, roughness: .8 })); gs.position.set((x0 + x1) / 2, gr.h / 2 - .028, zf + gr.prof / 2); gs.receiveShadow = true; G.fuori.add(gs);

  /* ---------- marciapiede (con la lamiera striata davanti all'ingresso), cordolo e strada ---------- */
  var mp = F.marciapiede || { prof: 2.6 }, zm = zf + mp.prof;
  var mt = tex(512, 512, function (g, w, h) { var r = rnd(41); g.fillStyle = '#5f5c57'; g.fillRect(0, 0, w, h);
    for (var i = 0; i < 2600; i++) { var l = 70 + r() * 60; g.fillStyle = 'rgba(' + l + ',' + l + ',' + (l - 4) + ',.5)'; g.fillRect(r() * w, r() * h, 2, 2); }
    for (i = 0; i < 14; i++) { g.fillStyle = 'rgba(30,28,26,' + (.08 + r() * .12) + ')'; g.beginPath(); g.ellipse(r() * w, r() * h, 20 + r() * 70, 10 + r() * 40, r() * 3, 0, 7); g.fill(); } }, [6, 1.4]);
  var mm = new T.MeshStandardMaterial({ map: mt, roughness: .95, color: 0x8a8782 });
  var MP = [[-4, zf], [9, zf], [9, zm], [-4, zm]];
  var mesh = c.pavimento(MP.map(function (p) { return [p[0], p[1]]; }), mm, -.028); c.uvMetri(mesh.geometry, 13, mp.prof); mesh.parent.remove(mesh); G.fuori.add(mesh); c.CALP.push(MP);
  var lam = tex(256, 256, function (g, w, h) { g.fillStyle = '#7d7b77'; g.fillRect(0, 0, w, h); g.fillStyle = '#9b9893';
    for (var i = 0; i < 16; i++) for (var j = 0; j < 16; j++) { g.save(); g.translate(i * 16 + 8 + (j % 2) * 8, j * 16 + 8); g.rotate((i + j) % 2 ? .78 : -.78); g.fillRect(-6, -1.5, 12, 3); g.restore(); } }, [5, 3]);
  var pl = new T.Mesh(new T.PlaneGeometry(2.7, 1.05), new T.MeshStandardMaterial({ map: lam, roughness: .55, metalness: .55, color: 0x9a9893 })); pl.rotation.x = -PI / 2; pl.position.set((x0 + x1) / 2 + .1, -.026, zf + .75); pl.receiveShadow = true; G.fuori.add(pl);
  box(13, .14, .14, c.matCol('#8d8a83', .85), 2.5, -.07, zm + .07);
  var st = tex(512, 512, function (g, w, h) { var r = rnd(77); g.fillStyle = '#26272b'; g.fillRect(0, 0, w, h); for (var i = 0; i < 4000; i++) { var l = 30 + r() * 30; g.fillStyle = 'rgba(' + l + ',' + l + ',' + (l + 4) + ',.6)'; g.fillRect(r() * w, r() * h, 2, 2); } }, [10, 4]);
  var strada = new T.Mesh(new T.PlaneGeometry(40, 16), new T.MeshStandardMaterial({ map: st, roughness: .9 })); strada.rotation.x = -PI / 2; strada.position.set(2.5, -.14, zm + .14 + 8); G.fuori.add(strada);
  for (i = 0; i < 6; i++) { var li = new T.Mesh(new T.PlaneGeometry(1.6, .12), c.matCol('#c9c6bc', .8)); li.rotation.x = -PI / 2; li.position.set(-6 + i * 3.4, -.138, zm + 4.2); G.fuori.add(li); }
  /* auto parcheggiate (sagome scure) lungo il marciapiede di fronte, come nella foto di sera */
  [[-1.8, 0x7a1418], [3.6, 0xcfd2d6], [8.4, 0x23262b]].forEach(function (q) { var a = new T.Group(), m = c.matCol('#' + q[1].toString(16).padStart(6, '0'), .35, .5);
    var b1 = new T.Mesh(new T.BoxGeometry(4.1, .62, 1.75), m); b1.position.y = .48; a.add(b1); var b2 = new T.Mesh(new T.BoxGeometry(2.2, .5, 1.6), m); b2.position.set(-.2, 1.02, 0); a.add(b2);
    var vt2 = new T.Mesh(new T.BoxGeometry(2.24, .36, 1.62), c.matCol('#101418', .1, .6)); vt2.position.set(-.2, 1.04, 0); a.add(vt2);
    a.position.set(q[0], -.14, zm + 7.6); G.fuori.add(a); });
  /* palazzo di fronte appena accennato con qualche finestra accesa */
  var pal = tex(512, 256, function (g, w, h) { g.fillStyle = '#16181d'; g.fillRect(0, 0, w, h); var r = rnd(9); for (var i = 0; i < 10; i++) for (var j = 0; j < 3; j++) { g.fillStyle = r() < .3 ? '#d9b874' : '#22252b'; g.fillRect(14 + i * 50, 30 + j * 72, 26, 40); } });
  var pp = new T.Mesh(new T.PlaneGeometry(26, 13), new T.MeshBasicMaterial({ map: pal, color: 0x777777 })); pp.position.set(2.5, 5.5, zm + 13); pp.rotation.y = PI; G.fuori.add(pp);
  /* (niente lampione: ogni luce in più costa su tutta la scena; basta l'alone dell'insegna) */
};
})();
