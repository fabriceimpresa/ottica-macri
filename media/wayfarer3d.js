/* Wayfarer «ignorante» in 3D per la home: modellato sulla foto di riferimento (frontale trapezoidale, angoli alti in fuori,
   rivetti, aste spesse). Resa MONOCROMATICA in stile CRT / quasi ologramma: shader con luce, bordo luminoso (fresnel),
   righe di scansione, sfarfallio e piccoli glitch. Script classico, richiede window.THREE (vendor/three/three-bundle.js).
   Uso: WAYFARER3D(canvas) */
(function () {
var T = window.THREE; if (!T) return;
var MM = 0.001;

function v(x, y) { return new T.Vector2(x * MM, y * MM); }
/* metà destra del frontale (mm, origine al centro del ponte, y in alto) */
var OUT_R = [[0, 16.5], [20, 18.5], [45, 20.5], [64, 22.5], [72, 24], [75.5, 22], [75, 16], [72.5, 6], [69, -6], [64, -16], [56, -23], [45, -26.5], [32, -26], [22, -21], [15.5, -12], [11, -4], [7.5, 1.5], [4, 4.5], [0, 5.5]];
var LENS_R = [[15, 12.5], [32, 13.5], [50, 14.5], [64.5, 16], [66.5, 11], [64.5, 1], [61, -9], [55, -17], [45, -20.5], [33, -20.5], [25, -16.5], [20, -9], [17, -1], [15.5, 6]];

function contornoChiuso(meta) { /* destra + specchio sinistra */
  var dx = meta.map(function (p) { return v(p[0], p[1]); });
  var sx = meta.slice(1, -1).reverse().map(function (p) { return v(-p[0], p[1]); });
  return dx.concat(sx);
}
function lente(meta, segno) { return meta.map(function (p) { return v(segno * p[0], p[1]); }); }

var RIM_R = [[9.5, 17.5], [30, 19], [50, 20.5], [64, 22.5], [72, 24], [75.5, 22], [75, 16], [72.5, 6], [69, -6], [64, -16], [56, -23], [45, -26.5], [32, -26], [22, -21], [15.5, -12], [11.5, -4], [9.5, 5]];
function cerchio(sg) { /* una metà del frontale (anello attorno alla lente), sg=1 destra, -1 sinistra */
  var s = new T.Shape(), o = RIM_R.map(function (p) { return v(p[0], p[1]); });
  if (!T.ShapeUtils.isClockWise(o)) o.reverse(); s.splineThru(o); s.closePath();
  var h = lente(LENS_R, 1); if (T.ShapeUtils.isClockWise(h)) h.reverse(); var hp = new T.Path(); hp.splineThru(h); hp.closePath(); s.holes.push(hp);
  var g = new T.ExtrudeGeometry(s, { depth: 5.5 * MM, bevelEnabled: true, bevelThickness: 1.2 * MM, bevelSize: 1.0 * MM, bevelSegments: 4, curveSegments: 48 });
  g.translate(0, 0, -2.75 * MM); if (sg < 0) g.scale(-1, 1, 1); piega(g, 1.5); g.computeVertexNormals(); return g; }
function ponte() { /* ponte basso a chiave, pieno, che unisce le due metà */
  var s = new T.Shape(); s.moveTo(-13 * MM, 18.5 * MM); s.lineTo(13 * MM, 18.5 * MM); s.lineTo(13 * MM, 9 * MM);
  s.bezierCurveTo(8 * MM, 6.5 * MM, 4 * MM, 5.5 * MM, 0, 5.5 * MM); s.bezierCurveTo(-4 * MM, 5.5 * MM, -8 * MM, 6.5 * MM, -13 * MM, 9 * MM); s.closePath();
  var g = new T.ExtrudeGeometry(s, { depth: 5.5 * MM, bevelEnabled: true, bevelThickness: 1.2 * MM, bevelSize: 1.0 * MM, bevelSegments: 4, curveSegments: 24 });
  g.translate(0, 0, -2.75 * MM); piega(g, 1.5); g.computeVertexNormals(); return g; }
function frontale() { return [cerchio(1), cerchio(-1), ponte()]; }
function lenti() {
  var gs = [1, -1].map(function (sg) { var s = new T.Shape(); var pts = lente(LENS_R, sg); if (sg < 0) pts.reverse(); s.splineThru(pts); s.closePath();
    var g = new T.ExtrudeGeometry(s, { depth: 1.2 * MM, bevelEnabled: false, curveSegments: 48 }); g.translate(0, 0, -0.6 * MM); piega(g, 1.5); g.computeVertexNormals(); return g; });
  return gs;
}
function piega(g, k) { var p = g.attributes.position; for (var i = 0; i < p.count; i++) { var x = p.getX(i); p.setZ(i, p.getZ(i) - k * x * x); } p.needsUpdate = true; }

function asta(segno) { /* asta spessa in acetato: profilo dall'alto, si assottiglia e piega in fondo */
  var L = 140, s = new T.Shape();
  s.moveTo(0, 0); s.lineTo(0, -11 * MM); s.bezierCurveTo(30 * MM, -9 * MM, 90 * MM, -6 * MM, L * MM, -4.5 * MM); s.lineTo(L * MM, 0); s.bezierCurveTo(90 * MM, 1 * MM, 30 * MM, 1.5 * MM, 0, 0);
  var g = new T.ExtrudeGeometry(s, { depth: 5 * MM, bevelEnabled: true, bevelThickness: .8 * MM, bevelSize: .8 * MM, bevelSegments: 3, curveSegments: 24 });
  /* profilo laterale: ruoto in modo che corra all'indietro (asse -z) */
  g.rotateY(segno > 0 ? Math.PI / 2 : Math.PI / 2); g.computeVertexNormals();
  var m = new T.Group(), me = new T.Mesh(g); m.add(me);
  me.position.set(segno > 0 ? 70.5 * MM : -75.5 * MM, 21 * MM, -9.5 * MM); /* attacco all'angolo alto */
  /* piega finale verso il basso */
  return m;
}
function rivetto(segno) { var g = new T.CapsuleGeometry(.75 * MM, 3.2 * MM, 4, 10); g.rotateZ(Math.PI / 2); var m = new T.Mesh(g); m.position.set(segno * 66 * MM, 18.5 * MM, 3.9 * MM - 1.5 * Math.pow(66 * MM, 2)); return m; }

/* ---------- shader monocromatico «ologramma CRT» ---------- */
function holoMat(opt) {
  return new T.ShaderMaterial({
    transparent: true, depthWrite: opt.depthWrite !== false, side: T.DoubleSide,
    uniforms: { uT: { value: 0 }, uBase: { value: new T.Color(opt.base) }, uLuce: { value: new T.Color(opt.luce) }, uBordo: { value: new T.Color(opt.bordo) },
      uAlfa: { value: opt.alfa }, uGlitch: { value: 0 }, uSpec: { value: opt.spec }, uOlo: { value: 0 } },
    vertexShader: [
      'uniform float uT; uniform float uGlitch; varying vec3 vN; varying vec3 vV; varying vec3 vW;',
      'void main(){ vec3 p = position;',
      '  float band = step(0.82, fract(sin(floor((p.y*900.0)+uT*6.0)*12.9898)*43758.5453));',
      '  p.x += uGlitch * band * 0.004;',
      '  vec4 w = modelMatrix * vec4(p,1.0); vW = w.xyz; vN = normalize(mat3(modelMatrix) * normal);',
      '  vV = normalize(cameraPosition - w.xyz); gl_Position = projectionMatrix * viewMatrix * w; }'].join('\n'),
    fragmentShader: [
      'uniform float uT; uniform vec3 uBase; uniform vec3 uLuce; uniform vec3 uBordo; uniform float uAlfa; uniform float uSpec; uniform float uOlo;',
      'varying vec3 vN; varying vec3 vV; varying vec3 vW;',
      'void main(){ vec3 n = normalize(vN); if(!gl_FrontFacing) n = -n;',
      '  vec3 L1 = normalize(vec3(0.4,0.7,0.8)); vec3 L2 = normalize(vec3(-0.7,0.3,-0.4));',
      '  float d = max(dot(n,L1),0.0)*0.55 + max(dot(n,L2),0.0)*0.25 + 0.18;',
      '  vec3 h = normalize(L1 + vV); float sp = pow(max(dot(n,h),0.0), 70.0) * uSpec;',
      '  float fr = pow(1.0 - max(dot(n,vV),0.0), 2.6);',
      '  vec3 c = uBase * d + uLuce * sp + uBordo * fr * 0.9;',
      '  float scan = 0.82 + 0.18 * step(0.5, fract(gl_FragCoord.y / 3.0));',
      '  float sweep = smoothstep(0.0, 0.06, abs(fract(vW.y*6.0 - uT*0.35) - 0.5));',
      '  float fl = 0.96 + 0.04 * sin(uT*37.0);',
      '  c *= scan * fl; c += uBordo * (1.0 - sweep) * 0.08;',
      '  vec3 blu = mix(vec3(0.12,0.31,0.47), vec3(0.56,0.86,1.0), clamp(fr*1.2 + (1.0-sweep)*0.5, 0.0, 1.0));', '  float sc2 = 0.6 + 0.4*step(0.5, fract(gl_FragCoord.y / 2.0));', '  c = mix(c, blu * sc2, uOlo);', '  float a = uAlfa * (0.85 + 0.15*fr); a = mix(a, a*0.7 + fr*0.3, uOlo);', '  gl_FragColor = vec4(c, a); }'].join('\n')
  });
}

window.WAYFARER3D = function (cv, opz) { opz = opz || {};
  var R; try { R = new T.WebGLRenderer({ canvas: cv, alpha: true, antialias: true }); } catch (e) { return null; }
  R.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
  var sc = new T.Scene(), cam = new T.PerspectiveCamera(24, 16 / 9, .01, 10); cam.position.set(0, .012, .36); cam.lookAt(0, 0, 0);
  /* palette monocromatica: inchiostro blu-notte con luci fredde */
  var mFr = holoMat({ base: 0x4a5a6c, luce: 0xffffff, bordo: 0xb8cadb, alfa: 1, spec: 1.4 });
  var mLe = holoMat({ base: 0x6f8296, luce: 0xffffff, bordo: 0xc6d4e2, alfa: .38, spec: 2.4, depthWrite: false });
  var mRi = holoMat({ base: 0xb9c6d3, luce: 0xffffff, bordo: 0xe6eef6, alfa: 1, spec: 2.0 });
  var occ = new T.Group();
  var MOD = window.MODELLI3D && window.MODELLI3D[opz.modello || 'wayfarer'];
  function b64(s, Tipo) { var bin = atob(s), u = new Uint8Array(bin.length); for (var i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return new Tipo(u.buffer); }
  if (MOD) { /* modello vero scaricato (CC-BY): geometria + nostro materiale olografico */
    var g = new T.BufferGeometry(); g.setAttribute('position', new T.BufferAttribute(b64(MOD.pos, Float32Array), 3));
    g.setAttribute('normal', new T.BufferAttribute(b64(MOD.nor, Float32Array), 3)); g.setIndex(new T.BufferAttribute(b64(MOD.idx, Uint32Array), 1));
    var mm = new T.Mesh(g, mFr); if (opz.giraZ) mm.rotation.y = Math.PI; occ.add(mm); occ.userData.mesh = mm;
  } else {
  frontale().forEach(function (g) { occ.add(new T.Mesh(g, mFr)); });
  lenti().forEach(function (g) { occ.add(new T.Mesh(g, mLe)); });
  [1, -1].forEach(function (s) { var r = rivetto(s); r.material = mRi; occ.add(r);
    var a = asta(s); a.children[0].material = mFr; occ.add(a); });
  }
  var piv = new T.Group(); piv.add(occ); sc.add(piv);
  piv.rotation.x = 0.06;
  function misura() { var w = cv.clientWidth, h = cv.clientHeight; if (!w || !h) return; R.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); }
  misura(); addEventListener('resize', misura);
  var mx = 0, my = 0; addEventListener('pointermove', function (e) { mx = e.clientX / innerWidth - .5; my = e.clientY / innerHeight - .5; });
  var rid = matchMedia('(prefers-reduced-motion: reduce)').matches, prossimo = 2500, fine = 0, oloProx = 3000, oloIni = -1e9, stato = { lievita: true, f: 1 }, sy = -0.36, sx = .08;
  function giro(t) { requestAnimationFrame(giro); if (document.hidden) return;
    var k = rid ? 0 : t / 1000; [mFr, mLe, mRi].forEach(function (m) { m.uniforms.uT.value = k; });
    if (!rid && t > prossimo) { fine = t + 120 + Math.random() * 160; prossimo = t + 3500 + Math.random() * 5000; }
    var gl = t < fine ? 1 : 0; [mFr, mLe, mRi].forEach(function (m) { m.uniforms.uGlitch.value = gl; });
    if (!rid && t > oloProx) { oloIni = t; oloProx = t + 6000 + Math.random() * 6000; }
    var oe = (t - oloIni) / 1100, ol = oe >= 0 && oe <= 1 ? Math.min(1, Math.sin(oe * Math.PI) * 1.6) : 0;
    [mFr, mLe, mRi].forEach(function (m) { m.uniforms.uOlo.value = ol; if (ol > .5 && Math.random() < .2) m.uniforms.uGlitch.value = 1; });
    /* segue il mouse; con «lievita» acceso galleggia con piccoli movimenti */
    var L = stato.lievita ? 1 : 0; stato.f += ((L) - stato.f) * .04; var f = stato.f;
    sy += ((-0.15 + f * Math.sin(k * .45) * .42 + mx * .3) - sy) * .08; sx += ((.08 + f * Math.sin(k * .6) * .05 + my * .15) - sx) * .08;
    piv.rotation.y = sy; piv.rotation.x = sx; piv.rotation.z = f * Math.sin(k * .42) * .015;
    piv.position.y = f * Math.sin(k * .9) * .004; R.render(sc, cam); }
  requestAnimationFrame(giro);
  function cambia(nome, rotY) { var M2 = window.MODELLI3D && window.MODELLI3D[nome]; if (!M2) return false;
    var g2 = new T.BufferGeometry(); g2.setAttribute('position', new T.BufferAttribute(b64(M2.pos, Float32Array), 3));
    g2.setAttribute('normal', new T.BufferAttribute(b64(M2.nor, Float32Array), 3)); g2.setIndex(new T.BufferAttribute(b64(M2.idx, Uint32Array), 1));
    while (occ.children.length) { var c = occ.children.pop(); if (c.geometry) c.geometry.dispose(); }
    var m2 = new T.Mesh(g2, mFr); m2.rotation.y = rotY || 0; occ.add(m2); oloIni = performance.now() - 300; return true; }
  return { renderer: R, scena: sc, occhiale: occ, cambia: cambia, lievita: function (on) { stato.lievita = on == null ? !stato.lievita : !!on; return stato.lievita; } };
};
})();
