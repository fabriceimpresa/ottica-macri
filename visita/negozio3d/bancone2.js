/* =====================================================================
   OTTICA MACRÌ · DIETRO IL BANCONE (agente 3D, giro 2, 5/11/2026)
   Dettagli visti dal posto di Aldo nel video IMG_9487 (e in 9488/9489): frontifocometro automatico bianco Essilor
   sul bancone, portapenne e calcolatrice blu, sgabello blu a rotelle, cestino, espositore nero Transitions con i
   dischi delle lenti sul piano della cassettiera, agenda e altoparlante tondo accanto alla cassa.
   window.BANCONE2(N) è chiamato da allestimento.js (dopo la costruzione della pagina).
   Coordinate: quelle del RILIEVO convertite in scena (z scena = -z rilievo).
   ===================================================================== */
(function () {
'use strict';
window.BANCONE2 = function (N) {
  var T = window.THREE, O = window.OCCHIALI, PI = Math.PI, g = new T.Group(); g.name = 'bancone2'; N.scene.add(g);
  function Z(v) { return -v; }
  function M(c, r, m) { return new T.MeshStandardMaterial({ color: c, roughness: r == null ? .5 : r, metalness: m || 0 }); }
  function rb(w, h, d, r, m) { return O && O.rbox ? O.rbox(w, h, d, r, m) : new T.Mesh(new T.BoxGeometry(w, h, d), m); }
  function add(o, x, y, z, ry) { o.position.set(x, y, Z(z)); o.rotation.y = ry || 0; o.traverse(function (q) { if (q.isMesh) { q.castShadow = true; q.receiveShadow = true; } }); g.add(o); return o; }
  var bianco = M(0xf2f1ec, .35), grigio = M(0x9ea3a8, .4, .3), nero = M(0x111214, .45), blu = M(0x1f2f6b, .7);
  var yB = 0.97, yC = 0.9;

  /* frontifocometro automatico Essilor (bianco con schermo inclinato) */
  var ff = new T.Group();
  var base = rb(.24, .05, .3, .02, bianco); base.position.y = .025; ff.add(base);
  var col = rb(.12, .3, .14, .02, bianco); col.position.set(0, .2, -.07); ff.add(col);
  var testa = rb(.2, .12, .2, .03, bianco); testa.position.set(0, .38, -.02); ff.add(testa);
  var sch = rb(.18, .13, .03, .01, grigio); sch.position.set(0, .5, -.08); sch.rotation.x = -.35; ff.add(sch);
  var vid = new T.Mesh(new T.PlaneGeometry(.15, .1), new T.MeshBasicMaterial({ color: 0x2d3b4a })); vid.position.set(0, .5, -.063); vid.rotation.x = -.35; vid.rotation.y = 0; ff.add(vid);
  var lente = new T.Mesh(new T.CylinderGeometry(.025, .03, .05, 20), grigio); lente.position.set(0, .29, .05); ff.add(lente);
  add(ff, 1.5, yB, 1.2, -PI / 2);  /* schermo verso il passaggio di Aldo (-x) */

  /* portapenne a fiori + penne, calcolatrice blu */
  var pp = new T.Group(), cil = new T.Mesh(new T.CylinderGeometry(.04, .04, .1, 18), M(0x6f8a6a, .6)); cil.position.y = .05; pp.add(cil);
  [0x1d3fa0, 0xc0392b, 0x111111, 0xf1c40f, 0x16a085].forEach(function (c, i) { var p = new T.Mesh(new T.CylinderGeometry(.004, .004, .15, 6), M(c, .4)); p.position.set(Math.cos(i * 1.3) * .02, .12, Math.sin(i * 1.3) * .02); p.rotation.z = (i - 2) * .12; pp.add(p); });
  add(pp, 1.45, yB, 1.55);
  var calc = rb(.08, .012, .14, .008, M(0x3046c8, .35)); add(calc, 1.35, yB + .006, 1.7, .3);

  /* sgabello blu a rotelle (IMG_9487_004-006) e cestino */
  var sg = new T.Group(), sed = new T.Mesh(new T.CylinderGeometry(.19, .19, .08, 28), blu); sed.position.y = .58; sg.add(sed);
  var ast = new T.Mesh(new T.CylinderGeometry(.025, .025, .45, 12), M(0x2a2a2c, .3, .8)); ast.position.y = .32; sg.add(ast);
  for (var i = 0; i < 5; i++) { var a = i / 5 * PI * 2, gamba = new T.Mesh(new T.BoxGeometry(.28, .03, .04), M(0xc9ccd0, .25, .9)); gamba.position.set(Math.cos(a) * .13, .06, Math.sin(a) * .13); gamba.rotation.y = -a; sg.add(gamba);
    var ru = new T.Mesh(new T.SphereGeometry(.025, 10, 8), nero); ru.position.set(Math.cos(a) * .26, .025, Math.sin(a) * .26); sg.add(ru); }
  add(sg, .88, 0, 2.35);
  var ce = new T.Mesh(new T.CylinderGeometry(.15, .12, .32, 24, 1, true), M(0x8ab0e0, .6)); ce.material.side = T.DoubleSide; ce.position.y = .16;
  var cg = new T.Group(); cg.add(ce); var fon = new T.Mesh(new T.CircleGeometry(.12, 20), M(0x6a8fc0, .7)); fon.rotation.x = -PI / 2; fon.position.y = .01; cg.add(fon); add(cg, 1.0, 0, 3.0);

  /* espositore nero Transitions GEN 8 con i dischi delle lenti, sul piano della cassettiera (IMG_9487_011-012) */
  var tr = O.cTex(512, 384, function (q, w, h) { q.fillStyle = '#121216'; q.fillRect(0, 0, w, h); q.fillStyle = '#fff'; q.font = 'italic 700 46px Arial'; q.fillText('Transitions', 24, 62); q.font = '400 24px Arial'; q.fillText('Signature GEN 8', 26, 96);
    var cols = ['#7b4a2a', '#5a3f8f', '#3c5d6e', '#6b6b6b', '#2d4a3a', '#8a6a3a', '#4a3f6e', '#2f2f35', '#5f7a8a'];
    for (var k = 0; k < 9; k++) { var x = 70 + (k % 3) * 120, y = 160 + Math.floor(k / 3) * 74; q.fillStyle = '#e8e8ea'; q.beginPath(); q.arc(x, y, 30, 0, 7); q.fill(); q.fillStyle = cols[k]; q.beginPath(); q.arc(x, y, 30, -PI / 2, PI / 2); q.fill(); } });
  var tp = new T.Group(), pan = rb(.42, .31, .02, .005, nero); pan.position.set(0, .16, 0); pan.rotation.x = -.35; tp.add(pan);
  var pf = new T.Mesh(new T.PlaneGeometry(.4, .3), new T.MeshStandardMaterial({ map: tr, roughness: .5 })); pf.position.set(0, .16, .012); pf.rotation.x = -.35; tp.add(pf);
  add(tp, .32, yC, 3.0, PI / 2);

  /* agenda grigia e altoparlante tondo accanto alla cassa (IMG_9487_008) */
  add(rb(.17, .025, .24, .006, M(0x5b5f66, .6)), .32, yC + .012, .95, PI / 2 + .2);
  var alt = new T.Mesh(new T.CylinderGeometry(.05, .05, .045, 24), M(0x2b2d31, .5)); alt.position.y = .022; var ag = new T.Group(); ag.add(alt); add(ag, .3, yC, 1.55);

  return g;
};
})();
