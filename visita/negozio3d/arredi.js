/* arredi.js - Ottica Macri, arredi VERI del negozio (dalle foto foto-negozio/, 5/11/2026).
 * Script classico (niente moduli): funziona col doppio clic (file://) su Windows e Safari Mac.
 * Richiede window.THREE (vendor/three/three-bundle.js). Usa window.TEX (tex.js) se c'e', altrimenti materiali di ripiego.
 *
 * window.ARREDI = { nomeTipo: function(opts){ return THREE.Group } }
 * Convenzioni: metri; origine del gruppo = centro della base a terra, sul RETRO del mobile; il FRONTE guarda verso -z.
 *   opts.w / opts.h / opts.d sovrascrivono le misure di default.
 *   Oggetti appesi al soffitto (faretto, tuboLed): origine = punto di attacco, pendono verso -y.
 *   Oggetti a muro (quadro, poster, climatizzatore, telecamera, vetrinaParete): origine = base, appoggiati al muro (z=0).
 *   vetrinaParete: opts.quota = altezza da terra del fondo della vetrina (default 0).
 * Extra: ARREDI.mat(nome) materiali condivisi; ARREDI.raccoltaOcchiali() per riempire ripiani con InstancedMesh.
 */
(function () {
  'use strict';
  var THREE = window.THREE;
  if (!THREE) { console.error('arredi.js: manca window.THREE (carica prima vendor/three/three-bundle.js)'); return; }

  // ---------------------------------------------------------------- utilita'
  function rng(seme) { // mulberry32 deterministico
    var a = (seme >>> 0) || 12345;
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      var t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  function O(opts) { return opts || {}; }
  function val(v, def) { return (v === undefined || v === null) ? def : v; }

  function canvasTex(w, h, disegna, rip) {
    var c = document.createElement('canvas'); c.width = w; c.height = h;
    disegna(c.getContext('2d'), w, h);
    var t = new THREE.CanvasTexture(c);
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    if (rip) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(rip[0], rip[1]); }
    return t;
  }

  // ---------------------------------------------------------------- materiali (condivisi)
  var cacheMat = {};
  function macchie(g, w, h, r, base, colori, n, aMin, aMax, raggio) {
    g.fillStyle = base; g.fillRect(0, 0, w, h);
    for (var i = 0; i < n; i++) {
      var x = r() * w, y = r() * h, rr = raggio * (0.3 + r());
      var col = colori[Math.floor(r() * colori.length)];
      var gr = g.createRadialGradient(x, y, 0, x, y, rr);
      var a = aMin + r() * (aMax - aMin);
      gr.addColorStop(0, col.replace('A', a.toFixed(3)));
      gr.addColorStop(1, col.replace('A', '0'));
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rr, 0, 7); g.fill();
    }
  }
  var ripiego = {
    radica: function () { // laccato nero con macchie oro/bruno (come le foto)
      var t = canvasTex(512, 512, function (g, w, h) {
        var r = rng(7);
        macchie(g, w, h, r, '#1a110b', ['rgba(120,80,35,A)', 'rgba(70,45,22,A)', 'rgba(150,110,50,A)', 'rgba(20,12,8,A)'], 220, 0.15, 0.55, 40);
        g.lineWidth = 1.2;
        for (var i = 0; i < 70; i++) { // venature dorate a ricciolo
          g.strokeStyle = 'rgba(' + (170 + r() * 50 | 0) + ',' + (120 + r() * 40 | 0) + ',50,' + (0.15 + r() * 0.35).toFixed(2) + ')';
          g.beginPath(); var x = r() * w, y = r() * h; g.moveTo(x, y);
          for (var k = 0; k < 6; k++) { x += (r() - 0.5) * 40; y += (r() - 0.5) * 40; g.lineTo(x, y); }
          g.stroke();
        }
      }, [1, 1]);
      return new THREE.MeshPhysicalMaterial({ map: t, color: 0xffffff, roughness: 0.32, metalness: 0.0, clearcoat: 0.8, clearcoatRoughness: 0.15 });
    },
    ocra: function () { // intonaco spatolato giallo ocra dei fondi vetrina
      var t = canvasTex(256, 256, function (g, w, h) {
        macchie(g, w, h, rng(3), '#d6a93c', ['rgba(240,200,90,A)', 'rgba(185,135,40,A)', 'rgba(225,185,80,A)'], 160, 0.2, 0.5, 30);
      }, [2, 2]);
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.75 });
    },
    bancone: function () { // piano giallo dei banchi (piu' chiaro, laminato)
      var t = canvasTex(256, 256, function (g, w, h) {
        macchie(g, w, h, rng(5), '#ddb94e', ['rgba(240,210,110,A)', 'rgba(200,160,60,A)'], 120, 0.15, 0.35, 26);
      }, [1, 1]);
      return new THREE.MeshStandardMaterial({ map: t, roughness: 0.45 });
    },
    ottone: function () { return new THREE.MeshStandardMaterial({ color: 0xc8a24e, metalness: 0.9, roughness: 0.3 }); },
    vetro: function () {
      return new THREE.MeshStandardMaterial({ color: 0xd8ece8, transparent: true, opacity: 0.14, roughness: 0.05, metalness: 0.2, depthWrite: false });
    },
    vetroScaffale: function () { // ripiani: bordo verdino visibile
      return new THREE.MeshStandardMaterial({ color: 0xbfe3d6, transparent: true, opacity: 0.32, roughness: 0.05, metalness: 0.1, depthWrite: false });
    },
    plasticaBlu: function () { return new THREE.MeshStandardMaterial({ color: 0x2d4fb8, roughness: 0.85 }); },
    metalloTotem: function () { return new THREE.MeshStandardMaterial({ color: 0xa9adb3, metalness: 0.55, roughness: 0.4 }); },
    // altri (solo interni a questo file)
    nero: function () { return new THREE.MeshStandardMaterial({ color: 0x0d0d0f, roughness: 0.35, metalness: 0.1 }); },
    neroOpaco: function () { return new THREE.MeshStandardMaterial({ color: 0x18181a, roughness: 0.8 }); },
    bianco: function () { return new THREE.MeshStandardMaterial({ color: 0xf2f0ea, roughness: 0.55 }); },
    crema: function () { return new THREE.MeshStandardMaterial({ color: 0xece4cc, roughness: 0.8 }); },
    rosso: function () { return new THREE.MeshStandardMaterial({ color: 0xd2232a, roughness: 0.5 }); },
    cromo: function () { return new THREE.MeshStandardMaterial({ color: 0xe8eaee, metalness: 1.0, roughness: 0.18 }); },
    grigio: function () { return new THREE.MeshStandardMaterial({ color: 0x9a9da3, metalness: 0.3, roughness: 0.45 }); },
    specchio: function () { return new THREE.MeshStandardMaterial({ color: 0xdfe6ea, metalness: 1.0, roughness: 0.04 }); },
    luce: function () { return new THREE.MeshStandardMaterial({ color: 0xfff6dd, emissive: 0xfff1cc, emissiveIntensity: 2.2 }); },
    legnoPomello: function () { return new THREE.MeshStandardMaterial({ color: 0x5a3220, roughness: 0.45 }); },
    tessutoBlu: function () { return new THREE.MeshStandardMaterial({ color: 0x2d4fb8, roughness: 0.9 }); },
    blu: function () { return new THREE.MeshStandardMaterial({ color: 0x1d2c6b, roughness: 0.4 }); }
  };
  function mat(nome) {
    if (cacheMat[nome]) return cacheMat[nome];
    var m = null, T = window.TEX;
    if (T && typeof T[nome] === 'function') {
      try {
        var r = T[nome]();
        if (r && r.isMaterial) m = r;
        else if (r && r.isTexture) m = new THREE.MeshStandardMaterial({ map: r });
      } catch (e) { console.warn('arredi.js: TEX.' + nome + '() errore, uso ripiego', e); }
    }
    if (!m) m = (ripiego[nome] || ripiego.grigio)();
    cacheMat[nome] = m;
    return m;
  }
  var cacheColori = {};
  function matColore(c, rough, metal) {
    var k = c + '|' + rough + '|' + metal;
    if (!cacheColori[k]) cacheColori[k] = new THREE.MeshStandardMaterial({ color: new THREE.Color(c), roughness: val(rough, 0.6), metalness: val(metal, 0) });
    return cacheColori[k];
  }
  function matImmagine(dataUri, rip) {
    var T = window.TEX;
    if (T && typeof T.da === 'function') { try { var m = T.da(dataUri, rip); if (m && m.isMaterial) return m; } catch (e) { } }
    var tx = new THREE.TextureLoader().load(dataUri);
    tx.colorSpace = THREE.SRGBColorSpace;
    return new THREE.MeshStandardMaterial({ map: tx, roughness: 0.6 });
  }

  // ---------------------------------------------------------------- geometrie (cache)
  var cacheGeo = {};
  function gBox(w, h, d) {
    var k = 'b' + w.toFixed(4) + '|' + h.toFixed(4) + '|' + d.toFixed(4);
    return cacheGeo[k] || (cacheGeo[k] = new THREE.BoxGeometry(w, h, d));
  }
  function gRBox(w, h, d, r, s) {
    r = Math.min(r, Math.min(w, h, d) / 2 - 0.0005);
    if (r <= 0.0005) return gBox(w, h, d);
    var k = 'r' + w.toFixed(4) + '|' + h.toFixed(4) + '|' + d.toFixed(4) + '|' + r.toFixed(4);
    return cacheGeo[k] || (cacheGeo[k] = new THREE.RoundedBoxGeometry(w, h, d, s || 2, r));
  }
  function gCil(rt, rb, h, seg) {
    var k = 'c' + rt + '|' + rb + '|' + h + '|' + seg;
    return cacheGeo[k] || (cacheGeo[k] = new THREE.CylinderGeometry(rt, rb, h, seg || 20));
  }
  function mesh(geo, m, x, y, z, parent) {
    var me = new THREE.Mesh(geo, m);
    me.position.set(x || 0, y || 0, z || 0);
    me.castShadow = true; me.receiveShadow = true;
    if (parent) parent.add(me);
    return me;
  }
  // box con centro (x,y,z)
  function box(p, w, h, d, m, x, y, z) { return mesh(gBox(w, h, d), m, x, y, z, p); }
  function rbox(p, w, h, d, r, m, x, y, z) { return mesh(gRBox(w, h, d, r), m, x, y, z, p); }
  function cil(p, rt, rb, h, m, x, y, z, seg) { return mesh(gCil(rt, rb, h, seg), m, x, y, z, p); }
  // tubo tra due punti
  var _su = new THREE.Vector3(0, 1, 0);
  function tubo(p, a, b, r, m) {
    var A = new THREE.Vector3(a[0], a[1], a[2]), B = new THREE.Vector3(b[0], b[1], b[2]);
    var dir = B.clone().sub(A), L = dir.length();
    var me = mesh(gCil(r, r, 1, 10), m, 0, 0, 0, p);
    me.scale.set(1, L, 1);
    me.position.copy(A).add(B).multiplyScalar(0.5);
    me.quaternion.setFromUnitVectors(_su, dir.normalize());
    return me;
  }
  function piano(p, w, h, m, x, y, z) { // piano verticale che guarda -z
    var me = mesh(new THREE.PlaneGeometry(w, h), m, x, y, z, p);
    me.rotation.y = Math.PI; me.castShadow = false;
    return me;
  }
  function ombre(g) {
    g.traverse(function (o) { if (o.isMesh && o.castShadow !== false && o.userData.noOmbra !== true) { o.receiveShadow = true; } });
    return g;
  }
  // unisce geometrie (non indicizzate) con posizione+normale(+uv)
  function unisci(lista) {
    var pos = [], nor = [], uv = [], conUv = lista.every(function (g) { return !!g.attributes.uv; });
    lista.forEach(function (g) {
      var n = g.index ? g.toNonIndexed() : g;
      if (!n.attributes.normal) n.computeVertexNormals();
      Array.prototype.push.apply(pos, n.attributes.position.array);
      Array.prototype.push.apply(nor, n.attributes.normal.array);
      if (conUv) Array.prototype.push.apply(uv, n.attributes.uv.array);
    });
    var out = new THREE.BufferGeometry();
    out.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
    out.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
    if (conUv) out.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
    out.computeBoundingSphere();
    return out;
  }
  // testo/etichetta su canvas
  function texTesto(testo, opz) {
    opz = opz || {};
    var W = opz.W || 512, H = opz.H || 160;
    return canvasTex(W, H, function (g, w, h) {
      g.fillStyle = opz.sfondo || '#d2232a'; g.fillRect(0, 0, w, h);
      if (opz.bordo) { g.strokeStyle = opz.bordo; g.lineWidth = h * 0.06; g.strokeRect(0, 0, w, h); }
      g.fillStyle = opz.colore || '#fff';
      g.font = (opz.stile || 'italic bold') + ' ' + Math.round(h * (opz.scala || 0.55)) + 'px ' + (opz.font || 'Georgia, serif');
      g.textAlign = 'center'; g.textBaseline = 'middle';
      g.fillText(testo, w / 2, h / 2 + (opz.dy || 0));
    });
  }

  // ---------------------------------------------------------------- OCCHIALI
  // stili: 0 rettangolare, 1 tondo/panto, 2 cat-eye, 3 aviator (metallo), 4 oversize donna, 5 sportivo a mascherina
  var STILI = [
    { a: 0.026, b: 0.019, n: 4.2, t: 0.0045, ponte: 0.018 },
    { a: 0.024, b: 0.022, n: 2.3, t: 0.0045, ponte: 0.017 },
    { a: 0.027, b: 0.020, n: 3.0, t: 0.0055, ponte: 0.017, cat: true },
    { a: 0.028, b: 0.025, n: 2.2, t: 0.0016, ponte: 0.016, avi: true, metallo: true },
    { a: 0.031, b: 0.027, n: 3.4, t: 0.0065, ponte: 0.016 },
    { a: 0.072, b: 0.024, n: 2.6, t: 0.0035, sport: true }
  ];
  function puntiLente(S, a, b, lato) { // lato +1 lente destra (verso +x), -1 sinistra
    var pts = [], N = 40;
    for (var i = 0; i < N; i++) {
      var th = (i / N) * Math.PI * 2, c = Math.cos(th), s = Math.sin(th);
      var x = a * Math.sign(c) * Math.pow(Math.abs(c), 2 / S.n);
      var y = b * Math.sign(s) * Math.pow(Math.abs(s), 2 / S.n);
      var u = x / a; // -1 interno (naso) ... +1 esterno, per lente destra
      if (S.cat && y > 0) y *= 1 + 0.35 * Math.max(0, u) * Math.max(0, u);
      if (S.cat && y < 0) y *= 1 - 0.18 * Math.max(0, u);
      if (S.avi && y < 0) y *= 1 + 0.30 * (1 - u) / 2 - 0.15 * (1 + u) / 2;
      if (S.sport && y < 0) y *= 1 - 0.55 * Math.exp(-Math.pow(x / 0.016, 2));
      if (S.sport && y > 0) y *= 1 - 0.12 * Math.abs(u);
      pts.push(new THREE.Vector2(x * lato, y));
    }
    if (lato < 0) pts.reverse();
    return pts;
  }
  var geoOcchiali = null;
  function costruisciGeoOcchiali() {
    geoOcchiali = STILI.map(function (S) {
      var montatura = [], lenti = [], prof = S.metallo ? 0.002 : 0.005;
      var lati = S.sport ? [0] : [-1, 1];
      var mezzaLarg = 0;
      lati.forEach(function (lato) {
        var cx = S.sport ? 0 : lato * (S.a + S.t + S.ponte / 2);
        var cy = S.b + S.t + 0.002;
        var est = puntiLente(S, S.a + S.t, S.b + S.t, lato || 1);
        var int = puntiLente(S, S.a, S.b, lato || 1);
        var sh = new THREE.Shape(est);
        sh.holes.push(new THREE.Path(int.slice().reverse()));
        var gR = new THREE.ExtrudeGeometry(sh, { depth: prof, bevelEnabled: false, curveSegments: 4 });
        gR.translate(cx, cy, -prof);
        montatura.push(gR);
        var gL = new THREE.ShapeGeometry(new THREE.Shape(int));
        gL.translate(cx, cy, -prof * 0.5);
        lenti.push(gL);
        mezzaLarg = Math.max(mezzaLarg, Math.abs(cx) + S.a + S.t);
      });
      var hy = (S.b + S.t) * (S.sport ? 1.75 : 1.55) + 0.002;
      if (!S.sport) { // ponte
        var gp = new THREE.BoxGeometry(S.ponte + 0.004, S.metallo ? 0.0018 : 0.004, prof);
        gp.translate(0, hy - (S.metallo ? 0.004 : 0.003), -prof / 2); montatura.push(gp);
        if (S.avi) { var gp2 = new THREE.BoxGeometry(S.ponte + 0.006, 0.0016, 0.0016); gp2.translate(0, hy + 0.001, -0.001); montatura.push(gp2); }
      } else { // barra superiore della mascherina
        var gb = new THREE.BoxGeometry(mezzaLarg * 2, 0.005, 0.006); gb.translate(0, hy + 0.001, -0.003); montatura.push(gb);
      }
      // aste aperte verso +z: tratto dritto quasi orizzontale + terminale che scende fino al ripiano
      var L1 = 0.112, cadu = 0.012, yEnd = hy - cadu;
      [-1, 1].forEach(function (lato) {
        var spess = S.metallo ? 0.0018 : 0.0035, alt = S.metallo ? 0.0022 : 0.0065, xa = lato * (mezzaLarg - 0.001);
        var l1 = Math.hypot(L1, cadu), ga = new THREE.BoxGeometry(spess, alt, l1);
        ga.translate(0, 0, l1 / 2); ga.rotateX(Math.atan2(cadu, L1)); ga.translate(xa, hy, -0.001);
        montatura.push(ga);
        var dz2 = 0.032, dy2 = yEnd - 0.004, l2 = Math.hypot(dz2, dy2), gt = new THREE.BoxGeometry(spess * 1.1, alt * 0.8, l2);
        gt.translate(0, 0, l2 / 2); gt.rotateX(Math.atan2(dy2, dz2)); gt.translate(xa, yEnd, L1 - 0.001);
        montatura.push(gt);
        var gc = new THREE.BoxGeometry(0.006, 0.007, 0.006); // cerniera
        gc.translate(lato * (mezzaLarg - 0.002), hy, -0.002); montatura.push(gc);
      });
      return { montatura: unisci(montatura), lenti: unisci(lenti), larg: mezzaLarg * 2, alt: hy };
    });
  }
  var PALETTE = {
    sole: { mont: ['#111111', '#161616', '#3b2314', '#6b3a1e', '#c9a24a', '#b8bcc2', '#7a1f2b', '#efefef', '#2b3a67', '#8a6b4a', '#4a4a4a', '#5b3b2a'],
      lenti: ['#15191c', '#23292d', '#3a2a1e', '#2f3b2a', '#26324f', '#4b2c4f', '#5a3a24', '#2a2f3a'] },
    sport: { mont: ['#efefef', '#111111', '#c8ff2e', '#1e1e1e', '#d0d0d0'], lenti: ['#1e6fff', '#ff5a1e', '#7b2cff', '#c01e3c', '#1e8f6f'] },
    vista: { mont: ['#111111', '#3b2314', '#7a4a2a', '#c9a24a', '#9aa0a6', '#7a1f2b', '#2b3a67', '#e8e0d0', '#5b2a5e', '#2f5d50', '#1c1c1c', '#a0522d'],
      lenti: ['#e6eef2'] },
    bimbi: { mont: ['#2d6bd8', '#e8336b', '#f28c28', '#2bb673', '#8e44ad', '#e74c3c', '#1abc9c', '#ff9ff3'], lenti: ['#e6eef2'] }
  };
  var matMont = null, matLenteSole = null, matLenteVista = null;
  function materialiOcchiali() {
    if (matMont) return;
    matMont = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.3, metalness: 0.25 });
    matLenteSole = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.08, metalness: 0.6, transparent: true, opacity: 0.88, side: THREE.DoubleSide });
    matLenteVista = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 0.02, metalness: 0.3, transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false });
  }
  // raccolta: si aggiungono occhiali (posizione, rotazione, scala, colori) e poi build() crea pochi InstancedMesh
  function raccoltaOcchiali(seme) {
    if (!geoOcchiali) costruisciGeoOcchiali();
    materialiOcchiali();
    var R = rng(seme || 99), voci = [];
    var api = {
      rnd: R,
      // o: {x,y,z, ry, rx, rz, s, stile, tipo:'sole'|'vista'|'sport'|'bimbi', mont, lente}
      add: function (o) {
        var tipo = o.tipo || 'sole', P = PALETTE[tipo] || PALETTE.sole;
        var stile = (o.stile !== undefined) ? o.stile : (tipo === 'sport' ? 5 : tipo === 'sole' ? [0, 1, 2, 3, 4, 4, 3, 0][Math.floor(R() * 8)] : [0, 0, 1, 2, 1, 0, 4][Math.floor(R() * 7)]);
        voci.push({ o: o, stile: stile, vista: (tipo === 'vista' || tipo === 'bimbi'),
          mont: o.mont || P.mont[Math.floor(R() * P.mont.length)],
          lente: o.lente || P.lenti[Math.floor(R() * P.lenti.length)] });
        return api;
      },
      build: function () {
        var g = new THREE.Group(); g.name = 'occhiali';
        var m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), p = new THREE.Vector3(), sc = new THREE.Vector3(), col = new THREE.Color();
        for (var s = 0; s < STILI.length; s++) {
          var vs = voci.filter(function (v) { return v.stile === s; });
          if (!vs.length) continue;
          var im = new THREE.InstancedMesh(geoOcchiali[s].montatura, matMont, vs.length);
          var gruppiLente = { sole: vs.filter(function (v) { return !v.vista; }), vista: vs.filter(function (v) { return v.vista; }) };
          vs.forEach(function (v, i) {
            var o = v.o;
            e.set(o.rx || 0, o.ry || 0, o.rz || 0); q.setFromEuler(e);
            p.set(o.x || 0, o.y || 0, o.z || 0); var k = o.s || 1; sc.set(k, k, k);
            m4.compose(p, q, sc); im.setMatrixAt(i, m4);
            im.setColorAt(i, col.set(v.mont));
            v._m = m4.clone();
          });
          im.castShadow = false; im.receiveShadow = false; g.add(im);
          ['sole', 'vista'].forEach(function (t) {
            var lista = gruppiLente[t]; if (!lista.length) return;
            var il = new THREE.InstancedMesh(geoOcchiali[s].lenti, t === 'sole' ? matLenteSole : matLenteVista, lista.length);
            lista.forEach(function (v, i) { il.setMatrixAt(i, v._m); il.setColorAt(i, col.set(v.lente)); });
            il.castShadow = false; il.renderOrder = 2; g.add(il);
          });
        }
        return g;
      },
      conta: function () { return voci.length; }
    };
    return api;
  }
  function larghezzaOcchiale(stile) { if (!geoOcchiali) costruisciGeoOcchiali(); return geoOcchiali[stile].larg; }

  // riempie un ripiano (fila lungo x) di occhiali: lenti verso -z (verso il cliente), aste verso il fondo
  function filaOcchiali(R, x0, x1, y, z, tipo, opz) {
    opz = opz || {};
    var passo = opz.passo || (tipo === 'vista' ? 0.155 : 0.175), n = Math.max(1, Math.floor((x1 - x0) / passo));
    var off = ((x1 - x0) - (n - 1) * passo) / 2;
    for (var i = 0; i < n; i++) {
      if (opz.vuoti && R.rnd() < opz.vuoti) continue;
      R.add({ x: x0 + off + i * passo + (R.rnd() - 0.5) * 0.012, y: y, z: z + (R.rnd() - 0.5) * 0.012,
        ry: (R.rnd() - 0.5) * (opz.ruota === undefined ? 0.18 : opz.ruota), tipo: tipo, s: opz.s || 1, stile: opz.stile });
    }
  }


  // espositore acrilico a torre (occhiali impilati) - dettaglio tipico delle vetrine di Aldo
  function torreAcrilico(p, R, x, y, z, n, tipo) {
    var h = 0.05 + n * 0.055;
    box(p, 0.012, h, 0.08, mat('vetro'), x, y + h / 2, z + 0.03);
    box(p, 0.09, 0.008, 0.11, mat('vetro'), x, y + 0.004, z + 0.02);
    for (var i = 0; i < n; i++) R.add({ x: x, y: y + 0.03 + i * 0.055, z: z - 0.005, rx: -0.12, tipo: tipo, s: 0.92 });
  }

  // ---------------------------------------------------------------- ARREDI
  var A = {};

  // Vetrina a muro in radica: ante in vetro, fondo ocra, ripiani in vetro, faretti (foto IMG_9479, IMG_9480, IMG_9473_017)
  A.vetrinaParete = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 1.1), h = val(opts.h, 1.15), d = val(opts.d, 0.38), q = val(opts.quota, 0);
    var nr = val(opts.ripiani, 2), t = 0.045, tb = 0.06, tipo = opts.tipo || 'vista';
    var g = new THREE.Group(); g.name = 'vetrinaParete';
    var rad = mat('radica'), ocr = mat('ocra');
    rbox(g, w, t, d, 0.008, rad, 0, q + h - t / 2, -d / 2);              // cielo
    rbox(g, w, tb, d + 0.01, 0.01, rad, 0, q + tb / 2, -d / 2 - 0.005);  // fondo, sporge un filo
    rbox(g, t, h - t - tb, d, 0.006, rad, -w / 2 + t / 2, q + tb + (h - t - tb) / 2, -d / 2);
    rbox(g, t, h - t - tb, d, 0.006, rad, w / 2 - t / 2, q + tb + (h - t - tb) / 2, -d / 2);
    box(g, w - 2 * t, h - t - tb, 0.012, ocr, 0, q + tb + (h - t - tb) / 2, -0.006); // schiena ocra
    box(g, w - 2 * t, 0.004, d - 0.03, ocr, 0, q + tb + 0.002, -d / 2 - 0.01);      // piano interno ocra
    var R = raccoltaOcchiali(opts.seme || 11);
    var ix0 = -w / 2 + t + 0.03, ix1 = w / 2 - t - 0.03, hInt = h - t - tb, yb = q + tb + 0.004;
    var livelli = [yb];
    for (var i = 1; i <= nr; i++) {
      var y = q + tb + hInt * i / (nr + 1);
      box(g, w - 2 * t - 0.01, 0.008, d - 0.05, mat('vetroScaffale'), 0, y, -d / 2 + 0.005).castShadow = false;
      [-1, 1].forEach(function (s) { cil(g, 0.006, 0.006, 0.012, mat('ottone'), s * (w / 2 - t - 0.01), y - 0.008, -0.08, 8); });
      livelli.push(y + 0.004);
    }
    if (opts.occhiali !== false) {
      livelli.forEach(function (y, li) {
        filaOcchiali(R, ix0, ix1, y, -d * 0.5, tipo, { vuoti: 0.08 });
        if (li === 0 && hInt / (nr + 1) > 0.3) torreAcrilico(g, R, ix1 - 0.06, y, -d * 0.25, Math.min(5, Math.floor((hInt / (nr + 1) - 0.08) / 0.055)), tipo);
      });
      g.add(R.build());
    }
    // ante in vetro + profilo centrale
    var hv = h - t - tb, za = -d + 0.006;
    box(g, (w - 2 * t) / 2 - 0.004, hv, 0.006, mat('vetro'), -(w - 2 * t) / 4, q + tb + hv / 2, za).castShadow = false;
    box(g, (w - 2 * t) / 2 - 0.004, hv, 0.006, mat('vetro'), (w - 2 * t) / 4, q + tb + hv / 2, za - 0.007).castShadow = false;
    [-1, 1].forEach(function (s) { box(g, 0.012, 0.03, 0.01, mat('ottone'), s * 0.03, q + tb + 0.06, za - 0.012); }); // serrature
    // faretti a disco sotto il cielo
    var nf = Math.max(1, Math.round(w / 0.55));
    for (var f = 0; f < nf; f++) {
      var fx = -w / 2 + w * (f + 0.5) / nf;
      cil(g, 0.035, 0.035, 0.012, mat('cromo'), fx, q + h - t - 0.006, -d * 0.5, 16);
      cil(g, 0.026, 0.026, 0.002, mat('luce'), fx, q + h - t - 0.013, -d * 0.5, 16).castShadow = false;
    }
    if (opts.luce) { var pl = new THREE.PointLight(0xffe2b0, 1.2, 1.6, 2); pl.position.set(0, q + h - t - 0.08, -d * 0.5); g.add(pl); }
    g.userData = { tipo: 'vetrinaParete', w: w, h: h, d: d, quota: q };
    return g;
  };

  // Mobile basso in radica con cassetti e anelli in ottone, piano giallo (foto IMG_9480, IMG_9473_005)
  A.mobileBasso = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 1.6), h = val(opts.h, 0.9), d = val(opts.d, 0.5);
    var tp = 0.03, zoc = 0.07;
    var g = new THREE.Group(); g.name = 'mobileBasso';
    var rad = mat('radica');
    box(g, w - 0.01, zoc, d - 0.06, mat('neroOpaco'), 0, zoc / 2, -(d - 0.06) / 2);              // zoccolo arretrato
    box(g, w - 0.01, h - tp - zoc, d - 0.02, rad, 0, zoc + (h - tp - zoc) / 2, -(d - 0.02) / 2);
    rbox(g, w + 0.02, tp, d + 0.015, 0.006, mat('bancone'), 0, h - tp / 2, -(d + 0.015) / 2);  // piano giallo
    var nc = val(opts.colonne, Math.max(1, Math.round(w / 0.55))), nrw = val(opts.cassetti, 5);
    var lc = (w - 0.03) / nc, hc = (h - tp - zoc - 0.02) / nrw, zf = -(d - 0.02) - 0.006;
    var anelli = [], fori = [];
    for (var c = 0; c < nc; c++) for (var r = 0; r < nrw; r++) {
      var cx = -w / 2 + 0.015 + lc * (c + 0.5), cy = zoc + 0.01 + hc * (r + 0.5);
      rbox(g, lc - 0.008, hc - 0.008, 0.014, 0.003, rad, cx, cy, zf);
      anelli.push([cx - lc * 0.22, cy, zf - 0.008]);
    }
    // anelli in ottone (InstancedMesh: possono essere tanti)
    var gA = new THREE.TorusGeometry(0.017, 0.0045, 8, 20), gF = new THREE.CircleGeometry(0.013, 16);
    var iA = new THREE.InstancedMesh(gA, mat('ottone'), anelli.length), iF = new THREE.InstancedMesh(gF, mat('nero'), anelli.length);
    var m4 = new THREE.Matrix4(), rotF = new THREE.Matrix4().makeRotationY(Math.PI);
    anelli.forEach(function (a, i) {
      m4.makeTranslation(a[0], a[1], a[2]); iA.setMatrixAt(i, m4);
      var mf = new THREE.Matrix4().makeTranslation(a[0], a[1], a[2] + 0.002).multiply(rotF); iF.setMatrixAt(i, mf);
    });
    iA.castShadow = true; g.add(iA); g.add(iF);
    g.userData = { tipo: 'mobileBasso', w: w, h: h, d: d };
    return g;
  };

  // poligono: offset (miter) verso l'interno di dist
  function offsetPoli(pts, dist) {
    var n = pts.length, area = 0, out = [];
    for (var i = 0; i < n; i++) { var a = pts[i], b = pts[(i + 1) % n]; area += a.x * b.y - b.x * a.y; }
    var s = area > 0 ? 1 : -1; // CCW -> interno a sinistra
    for (var j = 0; j < n; j++) {
      var p0 = pts[(j - 1 + n) % n], p1 = pts[j], p2 = pts[(j + 1) % n];
      var e1 = new THREE.Vector2(p1.x - p0.x, p1.y - p0.y).normalize(), e2 = new THREE.Vector2(p2.x - p1.x, p2.y - p1.y).normalize();
      var n1 = new THREE.Vector2(-e1.y * s, e1.x * s), n2 = new THREE.Vector2(-e2.y * s, e2.x * s);
      var m = n1.clone().add(n2), k = 1 + n1.dot(n2);
      m.multiplyScalar(dist / Math.max(k, 0.2));
      out.push(new THREE.Vector2(p1.x + m.x, p1.y + m.y));
    }
    return out;
  }
  function estrudiPianta(pts, alt, m, y0, bevel) { // pts: (x, avanti) -> mesh orizzontale
    var geo = new THREE.ExtrudeGeometry(new THREE.Shape(pts), bevel ?
      { depth: alt - 2 * bevel, bevelEnabled: true, bevelThickness: bevel, bevelSize: bevel, bevelSegments: 2, curveSegments: 6 } :
      { depth: alt, bevelEnabled: false });
    geo.rotateX(-Math.PI / 2); // (x,y)->(x, z=-y); estrusione verso +y
    geo.translate(0, y0 + (bevel || 0), 0);
    var me = new THREE.Mesh(geo, m); me.castShadow = true; me.receiveShadow = true;
    return me;
  }

  // Bancone: piano giallo ocra con bordo, fronte in radica lucida, angoli smussati, zoccolo in ottone (foto IMG_9473_009, IMG_9479)
  // opts.l2 = lunghezza del ritorno a L (verso il cliente, lato destro; opts.lato='sinistra' per specchiarlo), opts.smusso
  A.bancone = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 2.0), h = val(opts.h, 0.95), d = val(opts.d, 0.6), l2 = val(opts.l2, 0), c = val(opts.smusso, 0.18);
    var g = new THREE.Group(); g.name = 'bancone';
    var P = [];
    var V = function (x, y) { P.push(new THREE.Vector2(x, y)); };
    if (l2 > 0) {
      V(-w / 2, 0); V(w / 2, 0); V(w / 2, d + l2 - c); V(w / 2 - c, d + l2); V(w / 2 - d, d + l2); V(w / 2 - d, d); V(-w / 2 + c, d); V(-w / 2, d - c);
    } else {
      V(-w / 2, 0); V(w / 2, 0); V(w / 2, d - c); V(w / 2 - c, d); V(-w / 2 + c, d); V(-w / 2, d - c);
    }
    if (opts.lato === 'sinistra') { P = P.map(function (p) { return new THREE.Vector2(-p.x, p.y); }).reverse(); }
    var tp = 0.04;
    g.add(estrudiPianta(P, tp, mat('bancone'), h - tp, 0.008));                       // piano con bordo arrotondato
    g.add(estrudiPianta(offsetPoli(P, 0.03), h - tp - 0.08, mat('radica'), 0.08));     // corpo in radica
    g.add(estrudiPianta(offsetPoli(P, 0.05), 0.08, mat('ottone'), 0));                 // zoccolo ottone
    g.add(estrudiPianta(offsetPoli(P, 0.045), 0.012, mat('radica'), h - tp - 0.012));  // filo scuro sotto il piano
    if (opts.cassa !== false && opts.cassa) { var rc = A.registratoreCassa(); rc.position.set(-w / 4, h, -0.1); rc.rotation.y = Math.PI; g.add(rc); }
    g.userData = { tipo: 'bancone', w: w, h: h, d: d, l2: l2 };
    return g;
  };

  // Scaffale a giorno in radica a caselle con raccoglitori e libri (foto IMG_9480, IMG_9473_005)
  A.scaffaleLibreria = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 1.0), h = val(opts.h, 1.05), d = val(opts.d, 0.3);
    var nc = val(opts.colonne, 4), nr = val(opts.righe, 3), t = 0.025;
    var g = new THREE.Group(); g.name = 'scaffaleLibreria';
    var rad = mat('radica'), R = rng(opts.seme || 21);
    box(g, w, h, 0.012, rad, 0, h / 2, -0.006);
    for (var i = 0; i <= nr; i++) box(g, w, t, d, rad, 0, t / 2 + (h - t) * i / nr, -d / 2);
    for (var j = 0; j <= nc; j++) box(g, t, h, d, rad, -w / 2 + t / 2 + (w - t) * j / nc, h / 2, -d / 2);
    var lc = (w - t) / nc - t, hc = (h - t) / nr - t;
    var colori = ['#2a3fb0', '#111111', '#3b2ad0', '#1c1c1c', '#5a3fd8', '#8a5a2a', '#2c2c34', '#c9c9c9', '#3355cc', '#702020'];
    for (var rr = 0; rr < nr; rr++) for (var cc = 0; cc < nc; cc++) {
      var x0 = -w / 2 + t + cc * (lc + t), y0 = t + rr * (hc + t), cas = R();
      if (rr === nr - 1 || cas < 0.45) { // raccoglitori e libri in piedi
        var x = x0 + 0.005;
        while (x < x0 + lc - 0.02) {
          var sp = 0.015 + R() * 0.05, hh = hc * (0.62 + R() * 0.33);
          if (x + sp > x0 + lc) break;
          var lib = rbox(g, sp, hh, d * (0.7 + R() * 0.2), 0.002, matColore(colori[Math.floor(R() * colori.length)], 0.6), x + sp / 2, y0 + hh / 2, -d * 0.45);
          if (R() < 0.15) lib.rotation.z = -0.12;
          x += sp + 0.002 + (R() < 0.1 ? 0.04 : 0);
        }
      } else if (cas < 0.75) { // cornice/cartoncino appoggiato (senza foto)
        var fw = lc * 0.75, fh = hc * 0.75;
        var fr = rbox(g, fw, fh, 0.015, 0.003, matColore(['#f0f0f0', '#ff9a2e', '#7fd14a', '#dddddd'][Math.floor(R() * 4)], 0.5), x0 + lc / 2, y0 + fh / 2, -d * 0.5);
        fr.rotation.x = -0.15;
        box(g, fw * 0.8, fh * 0.8, 0.002, matColore(['#c9d6e8', '#e9e1cf', '#d8e8d0'][Math.floor(R() * 3)], 0.8), x0 + lc / 2, y0 + fh / 2, -d * 0.5 - 0.0085).rotation.x = -0.15;
      } else { // oggettini
        for (var k = 0; k < 3; k++) rbox(g, 0.04 + R() * 0.03, 0.03 + R() * 0.06, 0.04, 0.005, matColore(['#d8d8d8', '#c03030', '#e8d8a0', '#333'][k % 4], 0.5), x0 + 0.04 + k * lc / 3, y0 + 0.03, -d * 0.4);
      }
    }
    g.userData = { tipo: 'scaffaleLibreria', w: w, h: h, d: d };
    return g;
  };

  // Totem Ray-Ban grigio con due pannelli crema/rossi pieni di occhiali da sole (foto IMG_9479)
  var texRB = null, texDef = null;
  A.totemRayBan = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.62), h = val(opts.h, 1.95), d = val(opts.d, 0.32);
    var g = new THREE.Group(); g.name = 'totemRayBan';
    var met = mat('metalloTotem');
    // base tonda/ovale
    var base = cil(g, 1, 1, 0.05, met, 0, 0.025, -d / 2, 40); base.scale.set(w * 0.62, 1, d * 0.85);
    rbox(g, w, h - 0.05, d, 0.03, met, 0, 0.05 + (h - 0.05) / 2, -d / 2);
    rbox(g, 0.05, h - 0.05, d + 0.01, 0.02, mat('grigio'), -w / 2 + 0.02, 0.05 + (h - 0.05) / 2, -d / 2); // montante
    if (!texRB) {
      texRB = texTesto('Ray-Ban', { sfondo: '#d2232a', colore: '#fff', scala: 0.62 });
      texDef = texTesto('DEFINITELY RAY-BAN', { sfondo: '#d2232a', colore: '#fff', stile: 'bold', font: 'Arial, sans-serif', scala: 0.4, W: 512, H: 64 });
    }
    var logo = rbox(g, w * 0.55, 0.13, 0.03, 0.005, mat('rosso'), w * 0.12, h - 0.2, -d - 0.012);
    piano(g, w * 0.52, 0.11, new THREE.MeshStandardMaterial({ map: texRB, roughness: 0.5 }), w * 0.12, h - 0.2, -d - 0.028);
    var R = raccoltaOcchiali(opts.seme || 31);
    var pw = w - 0.12, ph = 0.56, mDef = new THREE.MeshStandardMaterial({ map: texDef, roughness: 0.6 });
    [h - 0.92, h - 1.55].forEach(function (yc, pi) {
      var zp = -d - 0.02;
      box(g, pw + 0.03, ph + 0.03, 0.03, mat('rosso'), 0.02, yc, zp + 0.012);        // cornice rossa
      box(g, pw, ph - 0.04, 0.012, mat('crema'), 0.02, yc - 0.02, zp - 0.006);       // fondo crema
      piano(g, pw, 0.035, mDef, 0.02, yc + ph / 2 - 0.02, zp - 0.004);              // fascia rossa scritta
      for (var r = 0; r < 6; r++) for (var c = 0; c < 2; c++) {
        var px = 0.02 + (c - 0.5) * pw * 0.5, py = yc + ph / 2 - 0.09 - r * 0.08;
        cil(g, 0.006, 0.006, 0.05, mat('bianco'), px, py, zp - 0.03, 8).rotation.x = Math.PI / 2; // pioli bianchi
        R.add({ x: px, y: py - 0.035, z: zp - 0.055, rx: -0.25, tipo: 'sole', stile: pi === 0 ? 3 : [0, 4, 0, 1][(r + c) % 4], s: 0.95 });
      }
    });
    g.add(R.build());
    g.userData = { tipo: 'totemRayBan', w: w, h: h, d: d };
    return g;
  };

  // Espositore girevole occhiali da sole su base tonda grigia (foto IMG_9473_009, IMG_9479) - sta sul bancone
  A.colonnaRotante = function (opts) {
    // corretto dal CONTROLLO (5/11): colonna a specchio/metallo con file fitte di occhiali da sole su 4 lati,
    // in basso sul fronte occhiali sportivi colorati (azzurro, rosso, viola, giallo fluo) come in IMG_9479
    opts = O(opts);
    var w = val(opts.w, 0.2), h = val(opts.h, 0.8);
    var g = new THREE.Group(); g.name = 'colonnaRotante';
    var rb = val(opts.raggioBase, Math.max(0.16, w * 0.75));
    var bse = new THREE.Mesh(new THREE.CylinderGeometry(rb * 0.92, rb, 0.03, 40), mat('grigio')); bse.position.set(0, 0.015, -rb); bse.castShadow = bse.receiveShadow = true; g.add(bse);
    cil(g, 0.02, 0.02, 0.06, mat('cromo'), 0, 0.06, -rb, 12);
    var giro = new THREE.Group(); giro.position.set(0, 0, -rb); g.add(giro);
    var y0c = 0.09, hc = h - y0c, lato = Math.min(w, 0.26);
    var mSpec = new THREE.MeshStandardMaterial({ color: 0xc9cfd4, metalness: 0.85, roughness: 0.18 });
    box(giro, lato, hc, lato, mSpec, 0, y0c + hc / 2, 0);
    // spigoli in alluminio
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(function (q) { box(giro, 0.012, hc, 0.012, mat('cromo'), q[0] * lato / 2, y0c + hc / 2, q[1] * lato / 2); });
    box(giro, lato + 0.02, 0.02, lato + 0.02, mat('cromo'), 0, h - 0.01, 0);
    var R = raccoltaOcchiali(opts.seme || 41), passo = 0.062, n = Math.floor((hc - 0.05) / passo);
    var sportMont = ['#f4f4f4', '#d8f53a', '#1a1a1a', '#f4f4f4', '#e8e8e8'], sportLente = ['#2a8cff', '#d23a1c', '#6a2ab8', '#2a8cff', '#c8d8ff'];
    for (var f = 0; f < 4; f++) {
      var ang = f * Math.PI / 2, sp = Math.sin(ang), cp = Math.cos(ang);
      for (var i = 0; i < n; i++) {
        var y = y0c + 0.03 + i * passo, rr = lato / 2 + 0.06;
        var sport = (f === 0 && i < 5) || (f === 1 && i < 2);
        var o = { x: -sp * rr, y: y, z: -cp * rr, ry: ang, rx: -0.12, tipo: sport ? 'sport' : 'sole', s: sport ? 1.0 : 0.85 };
        if (sport) { o.mont = sportMont[i % 5]; o.lente = sportLente[i % 5]; }
        R.add(o);
        if (i % 2 === 0) { var bst = cil(giro, 0.002, 0.002, 0.06, mat('cromo'), -sp * (lato / 2 + 0.03), y + 0.02, -cp * (lato / 2 + 0.03), 6);
          bst.rotation.set(Math.PI / 2 * cp, 0, -Math.PI / 2 * sp); bst.castShadow = false; }
      }
    }
    giro.add(R.build());
    g.userData = { tipo: 'colonnaRotante', parteRotante: giro, w: w, h: h };
    return g;
  };

  // Parete bianca con mensole di vetro piene di occhiali da sole, cornice radica, poster sopra (foto IMG_9473_014)
  A.mensoleOcchialiParete = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 1.3), h = val(opts.h, 2.3), d = val(opts.d, 0.3), nm = val(opts.mensole, 6);
    var g = new THREE.Group(); g.name = 'mensoleOcchialiParete';
    var rad = mat('radica'), hb = 0.42, ht = 0.08, fs = 0.06;
    box(g, w, hb, d, rad, 0, hb / 2, -d / 2);                              // base in radica
    rbox(g, w, ht, d, 0.006, rad, 0, h - ht / 2, -d / 2);                  // cielo
    rbox(g, fs, h, d, 0.006, rad, -w / 2 + fs / 2, h / 2, -d / 2);
    rbox(g, fs, h, d, 0.006, rad, w / 2 - fs / 2, h / 2, -d / 2);
    box(g, w - 2 * fs, h - hb - ht, 0.01, mat('bianco'), 0, hb + (h - hb - ht) / 2, -0.005); // fondo bianco
    // luci sotto il cielo
    for (var f = 0; f < 3; f++) cil(g, 0.02, 0.02, 0.004, mat('luce'), -w / 2 + w * (f + 0.5) / 3, h - ht - 0.002, -d * 0.5, 12).castShadow = false;
    // poster in alto
    var yTop = h - ht, yPost = yTop - 0.42;
    var mPost = opts.poster ? matImmagine(opts.poster) : null;
    var nP = opts.senzaPoster ? 0 : (mPost ? 1 : 2);
    for (var p = 0; p < nP; p++) {
      var pw = mPost ? (w - 2 * fs) * 0.8 : (w - 2 * fs) * 0.36, px = mPost ? 0 : (p ? 0.18 : -0.24) * w;
      piano(g, pw, 0.38, mPost || posterGenerico(p), px, yPost + 0.19, -0.012);
    }
    var R = raccoltaOcchiali(opts.seme || 51);
    var y0 = hb + 0.06, y1 = yPost - 0.06;
    for (var m = 0; m < nm; m++) {
      var y = y0 + (y1 - y0) * m / Math.max(1, nm - 1);
      box(g, w - 2 * fs - 0.01, 0.008, d - 0.05, mat('vetroScaffale'), 0, y, -d / 2 + 0.01).castShadow = false;
      [-1, 1].forEach(function (s) { cil(g, 0.012, 0.012, 0.004, mat('cromo'), s * (w / 2 - fs - 0.02), y - 0.006, -d * 0.45, 12); });
      filaOcchiali(R, -w / 2 + fs + 0.02, w / 2 - fs - 0.02, y + 0.004, -d * 0.52, 'sole', { passo: 0.215, ruota: 0.12, s: 1.3 });
    }
    // blocchetti brand sul ripiano di base
    var nb = Math.max(2, Math.floor((w - 2 * fs) / 0.3));
    for (var b = 0; b < nb; b++) {
      var bx = -w / 2 + fs + (w - 2 * fs) * (b + 0.5) / nb;
      var bl = box(g, 0.18, 0.08, 0.06, matColore(['#f4f2ee', '#111111', '#e9e6df', '#6b4a2a'][b % 4], 0.4), bx, hb + 0.04, -d * 0.5);
      bl.rotation.y = (b % 2 ? 0.08 : -0.06);
    }
    g.add(R.build());
    g.userData = { tipo: 'mensoleOcchialiParete', w: w, h: h, d: d };
    return g;
  };
  var cachePoster = {};
  function posterGenerico(i, colore) { // poster "da marchio" senza volti: sfondo + occhiale disegnato
    var k = i + '|' + (colore || '');
    if (cachePoster[k]) return cachePoster[k];
    var fondi = [['#d9d9d9', '#8e8e8e'], ['#e8e2d4', '#a99c80'], ['#cfd6de', '#59687a'], ['#2a2a2a', '#555']];
    var f = fondi[i % fondi.length];
    var t = canvasTex(256, 320, function (g, w, h) {
      var gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, colore || f[0]); gr.addColorStop(1, f[1]);
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.fillStyle = 'rgba(0,0,0,0.75)'; g.strokeStyle = 'rgba(0,0,0,0.85)'; g.lineWidth = 7;
      var cy = h * 0.45;
      [-1, 1].forEach(function (s) { g.beginPath(); g.ellipse(w / 2 + s * 52, cy, 42, 32, 0, 0, 7); g.fill(); g.stroke(); });
      g.beginPath(); g.moveTo(w / 2 - 12, cy - 10); g.quadraticCurveTo(w / 2, cy - 22, w / 2 + 12, cy - 10); g.stroke();
      g.fillStyle = 'rgba(255,255,255,0.85)'; g.fillRect(w * 0.2, h * 0.8, w * 0.6, 6);
    });
    return (cachePoster[k] = new THREE.MeshStandardMaterial({ map: t, roughness: 0.7 }));
  }

  // Sedia blu imbottita con telaio a tubo cromato (sedia tipo ISO, foto IMG_9479, IMG_9473_012)
  A.sedia = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.5), h = val(opts.h, 0.82), d = val(opts.d, 0.52);
    var g = new THREE.Group(); g.name = 'sedia';
    var hs = 0.46, cr = mat('cromo'), r = 0.011;
    var zf = -d + 0.03, zb = -0.06;
    // seduta: bordo nero + imbottitura blu
    rbox(g, w - 0.02, 0.05, d - 0.08, 0.02, mat('nero'), 0, hs + 0.02, (zf + zb) / 2 - 0.01);
    rbox(g, w - 0.03, 0.05, d - 0.09, 0.024, mat('tessutoBlu'), 0, hs + 0.035, (zf + zb) / 2 - 0.01);
    // schienale
    var sch = new THREE.Group(); sch.position.set(0, hs + 0.3, zb + 0.01); sch.rotation.x = 0.12; g.add(sch);
    rbox(sch, w - 0.02, 0.33, 0.045, 0.02, mat('nero'), 0, 0, 0.005);
    rbox(sch, w - 0.03, 0.32, 0.04, 0.02, mat('tessutoBlu'), 0, 0, -0.004);
    // telaio cromato
    [-1, 1].forEach(function (s) {
      var x = s * (w / 2 - 0.03);
      tubo(g, [x, 0.01, zf - 0.02], [x, hs, zf + 0.02], r, cr);        // gamba anteriore
      tubo(g, [x, 0.01, zb + 0.05], [x, hs, zb - 0.02], r, cr);        // gamba posteriore
      tubo(g, [x, hs, zf + 0.02], [x, hs, zb - 0.02], r, cr);          // longherone sotto la seduta
      tubo(g, [x * 0.8, hs + 0.02, zb], [x * 0.8, hs + 0.2, zb + 0.03], r * 0.9, cr); // attacco schienale
      tubo(g, [x, 0.012, zf - 0.02], [x, 0.012, zb + 0.05], r * 0.8, cr); // pattino
    });
    tubo(g, [-(w / 2 - 0.03), hs - 0.02, zb - 0.01], [w / 2 - 0.03, hs - 0.02, zb - 0.01], r * 0.8, cr);
    g.userData = { tipo: 'sedia', w: w, h: h, d: d };
    return g;
  };

  // Specchio ovale da banco su asta (foto IMG_9480)
  A.specchioOvale = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.26), h = val(opts.h, 0.6);
    var g = new THREE.Group(); g.name = 'specchioOvale';
    var zc = -0.1;
    cil(g, 0.09, 0.1, 0.02, mat('bianco'), 0, 0.01, zc, 32);
    var ha = h * 0.2;
    cil(g, 0.012, 0.012, ha, mat('blu'), 0, 0.02 + ha / 2, zc, 12);
    var hm = h - ha - 0.04, cy = 0.02 + ha + hm / 2;
    // forcella a U bianca
    var u = new THREE.Mesh(new THREE.TorusGeometry(w / 2 + 0.02, 0.008, 8, 24, Math.PI), mat('bianco'));
    u.rotation.z = Math.PI; u.position.set(0, cy + 0.02, zc); u.scale.set(1, 0.75, 1); u.castShadow = true; g.add(u);
    var sp = new THREE.Group(); sp.position.set(0, cy, zc); sp.rotation.x = 0.12; g.add(sp);
    var cor = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 0.012, 40), mat('bianco')); cor.rotation.x = Math.PI / 2; cor.scale.set(w / 2 + 0.008, 1, hm / 2 + 0.008); sp.add(cor);
    var vt = new THREE.Mesh(new THREE.CircleGeometry(1, 40), new THREE.MeshStandardMaterial({ color: 0xaeb8c0, metalness: 0.6, roughness: 0.12 })); vt.scale.set(w / 2, hm / 2, 1); vt.rotation.y = Math.PI; vt.position.z = -0.0065; sp.add(vt);
    g.userData = { tipo: 'specchioOvale' };
    return g;
  };

  // Schermo verticale su cavalletto nero, spot blu (foto IMG_9479, IMG_9473_009)
  var texSchermo = null;
  A.schermoVerticale = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.62), h = val(opts.h, 1.2);
    var g = new THREE.Group(); g.name = 'schermoVerticale';
    var hs = h - 0.12, zs = -0.12;
    rbox(g, w, hs, 0.05, 0.01, mat('nero'), 0, 0.12 + hs / 2, zs);
    if (!texSchermo) texSchermo = canvasTex(256, 448, function (c, W, H) {
      c.fillStyle = '#05060a'; c.fillRect(0, 0, W, H);
      var gr = c.createLinearGradient(0, H * 0.38, W, H * 0.62); gr.addColorStop(0, '#1b3fd6'); gr.addColorStop(1, '#3a6bff');
      c.fillStyle = gr; c.fillRect(0, H * 0.36, W, H * 0.27);
      c.strokeStyle = 'rgba(10,20,80,0.7)'; c.lineWidth = 10;
      [-1, 1].forEach(function (s) { c.beginPath(); c.ellipse(W * 0.72 + s * 32, H * 0.5, 26, 20, 0, 0, 7); c.stroke(); });
      c.fillStyle = '#fff'; c.font = 'bold 26px Arial'; c.fillText('OTTICA MACRI', 14, H * 0.51);
    });
    var schermo = piano(g, w - 0.05, hs - 0.06, new THREE.MeshStandardMaterial({ map: opts.dataUri ? null : texSchermo, color: 0xffffff, emissive: 0xffffff, emissiveMap: texSchermo, emissiveIntensity: 0.9, roughness: 0.3 }), 0, 0.12 + hs / 2, zs - 0.026);
    if (opts.dataUri) { var m2 = matImmagine(opts.dataUri); m2.emissive = new THREE.Color(0xffffff); m2.emissiveMap = m2.map; m2.emissiveIntensity = 0.9; schermo.material = m2; }
    // cavalletto
    [-1, 1].forEach(function (s) {
      tubo(g, [s * w * 0.3, 0, zs - 0.05], [s * w * 0.3, 0.2, zs], 0.008, mat('nero'));
      tubo(g, [s * w * 0.3, 0, zs + 0.22], [s * w * 0.3, 0.6, zs + 0.03], 0.008, mat('nero'));
      box(g, 0.03, 0.01, 0.05, mat('nero'), s * w * 0.3, 0.005, zs - 0.05);
    });
    g.userData = { tipo: 'schermoVerticale', schermo: schermo };
    return g;
  };

  // Climatizzatore split a muro (foto IMG_9479, IMG_9473_009)
  A.climatizzatore = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.85), h = val(opts.h, 0.29), d = val(opts.d, 0.21);
    var g = new THREE.Group(); g.name = 'climatizzatore';
    rbox(g, w, h, d, 0.04, mat('bianco'), 0, h / 2, -d / 2);
    box(g, w - 0.08, 0.012, 0.01, matColore('#c9c9c9', 0.5), 0, 0.045, -d + 0.003);  // feritoia
    box(g, w * 0.92, 0.003, 0.004, matColore('#d8d8d8', 0.5), 0, h - 0.06, -d - 0.001);
    if (opts.tubo !== false) box(g, 0.06, 0.6, 0.05, mat('bianco'), w / 2 - 0.12, -0.3, -0.03); // canalina
    g.userData = { tipo: 'climatizzatore' };
    return g;
  };

  // Faretto a disco a soffitto (origine = attacco al soffitto). opts.luce=true aggiunge una SpotLight
  A.faretto = function (opts) {
    opts = O(opts);
    var r = val(opts.r, 0.075);
    var g = new THREE.Group(); g.name = 'faretto';
    cil(g, r, r * 0.95, 0.035, mat('bianco'), 0, -0.0175, 0, 24);
    cil(g, r * 0.72, r * 0.72, 0.003, mat('luce'), 0, -0.036, 0, 24).castShadow = false;
    if (opts.luce) {
      var sl = new THREE.SpotLight(0xffe6c0, val(opts.intensita, 6), 5, 0.75, 0.6, 1.6);
      sl.position.set(0, -0.05, 0); sl.target.position.set(0, -3, 0); g.add(sl); g.add(sl.target);
      sl.castShadow = !!opts.ombra;
    }
    g.userData = { tipo: 'faretto' };
    return g;
  };

  // Tubo LED a soffitto (origine = attacco, lungo x)
  A.tuboLed = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 1.2);
    var g = new THREE.Group(); g.name = 'tuboLed';
    var t = cil(g, 0.013, 0.013, w, mat('luce'), 0, -0.02, 0, 12); t.rotation.z = Math.PI / 2; t.castShadow = false;
    box(g, w + 0.03, 0.012, 0.03, mat('bianco'), 0, -0.006, 0);
    if (opts.luce) { var rl = new THREE.PointLight(0xf4f7ff, val(opts.intensita, 2), 4, 2); rl.position.set(0, -0.1, 0); g.add(rl); }
    g.userData = { tipo: 'tuboLed' };
    return g;
  };

  // Telecamera di sorveglianza a muro (foto IMG_9479, IMG_9480)
  A.telecamera = function (opts) {
    opts = O(opts);
    var g = new THREE.Group(); g.name = 'telecamera';
    cil(g, 0.035, 0.035, 0.012, mat('bianco'), 0, 0.04, -0.006, 16).rotation.x = Math.PI / 2;
    tubo(g, [0, 0.04, -0.01], [0, 0.06, -0.09], 0.008, mat('bianco'));
    var corpo = new THREE.Group(); corpo.position.set(0, 0.06, -0.12); corpo.rotation.x = 0.35; g.add(corpo);
    var c = cil(corpo, 0.03, 0.03, 0.13, mat('bianco'), 0, 0, -0.03, 16); c.rotation.x = Math.PI / 2;
    var l = cil(corpo, 0.022, 0.022, 0.004, mat('nero'), 0, 0, -0.096, 16); l.rotation.x = Math.PI / 2;
    if (opts.blu) { var b = cil(corpo, 0.031, 0.031, 0.03, mat('blu'), 0, 0, -0.08, 16); b.rotation.x = Math.PI / 2; }
    g.userData = { tipo: 'telecamera' };
    return g;
  };

  // Registratore di cassa nero (foto IMG_9480)
  A.registratoreCassa = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.3), d = val(opts.d, 0.34);
    var g = new THREE.Group(); g.name = 'registratoreCassa';
    rbox(g, w, 0.07, d, 0.02, mat('nero'), 0, 0.035, -d / 2);
    var tast = new THREE.Group(); tast.position.set(0, 0.075, -d * 0.6); tast.rotation.x = 0.18; g.add(tast);
    rbox(tast, w * 0.85, 0.012, d * 0.5, 0.004, matColore('#d8d8d8', 0.5), 0, 0, 0);
    var tg = gRBox(0.026, 0.01, 0.022, 0.003), mt = matColore('#222', 0.5), mtB = matColore('#f0f0f0', 0.5);
    for (var r = 0; r < 5; r++) for (var c = 0; c < 7; c++) mesh(tg, (c > 4 && r > 2) ? mtB : mt, -w * 0.36 + c * 0.036, 0.009, -d * 0.2 + r * 0.032, tast).castShadow = false;
    rbox(g, w * 0.7, 0.06, 0.05, 0.01, mat('nero'), 0, 0.1, -0.04); // alzata display
    box(g, w * 0.55, 0.025, 0.002, new THREE.MeshStandardMaterial({ color: 0x9fd8ff, emissive: 0x335577, emissiveIntensity: 0.6 }), 0, 0.105, -0.066);
    box(g, 0.08, 0.02, 0.01, matColore('#b8001c', 0.5), w * 0.3, 0.1, -0.065);
    g.userData = { tipo: 'registratoreCassa' };
    return g;
  };

  // Quadro con cornice (opts: w,h, dataUri | colore, cornice). Origine = centro del lato basso, appoggiato al muro
  A.quadro = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.5), h = val(opts.h, 0.65), cr = val(opts.spessoreCornice, 0.03);
    var g = new THREE.Group(); g.name = 'quadro';
    var mc = opts.cornice === 'oro' ? mat('ottone') : opts.cornice === 'radica' ? mat('radica') : matColore(opts.cornice || '#f3f1ea', 0.4, 0);
    box(g, w, cr, 0.025, mc, 0, cr / 2, -0.0125); box(g, w, cr, 0.025, mc, 0, h - cr / 2, -0.0125);
    box(g, cr, h - 2 * cr, 0.025, mc, -w / 2 + cr / 2, h / 2, -0.0125); box(g, cr, h - 2 * cr, 0.025, mc, w / 2 - cr / 2, h / 2, -0.0125);
    var mi = opts.dataUri ? matImmagine(opts.dataUri) : (opts.colore ? matColore(opts.colore, 0.8) : posterGenerico(1));
    piano(g, w - 2 * cr, h - 2 * cr, mi, 0, h / 2, -0.01);
    if (opts.vetro !== false) piano(g, w - 2 * cr, h - 2 * cr, mat('vetro'), 0, h / 2, -0.02);
    g.userData = { tipo: 'quadro' };
    return g;
  };

  // Poster su pannello sottile (opts: w,h, dataUri | colore). Origine = centro del lato basso, al muro
  A.poster = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.6), h = val(opts.h, 0.85), d = val(opts.d, 0.006);
    var g = new THREE.Group(); g.name = 'poster';
    box(g, w, h, d, mat('bianco'), 0, h / 2, -d / 2);
    var mi = opts.dataUri ? matImmagine(opts.dataUri) : (opts.colore ? matColore(opts.colore, 0.8) : posterGenerico(val(opts.variante, 0)));
    piano(g, w, h, mi, 0, h / 2, -d - 0.001);
    g.userData = { tipo: 'poster' };
    return g;
  };

  // Porta d'ingresso in vetro con telaio bronzo e pomello tondo in legno (foto IMG_9476, IMG_9474)
  A.porta = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.9), h = val(opts.h, 2.2), t = 0.045;
    var g = new THREE.Group(); g.name = 'porta';
    var br = matColore('#7a6338', 0.35, 0.7);
    box(g, t, h, 0.05, br, -w / 2 + t / 2, h / 2, -0.025); box(g, t, h, 0.05, br, w / 2 - t / 2, h / 2, -0.025);
    box(g, w, t, 0.05, br, 0, h - t / 2, -0.025); box(g, w, 0.06, 0.05, br, 0, 0.03, -0.025);
    box(g, w - 2 * t, h - t - 0.06, 0.01, mat('vetro'), 0, 0.06 + (h - t - 0.06) / 2, -0.025).castShadow = false;
    var yk = 1.05, xk = w / 2 - 0.12;
    box(g, 0.09, 0.06, 0.012, mat('ottone'), xk, yk, -0.036);                        // piastra serratura
    [-1, 1].forEach(function (s) {
      var k = cil(g, 0.085, 0.07, 0.03, mat('legnoPomello'), xk - 0.05, yk + 0.02, s < 0 ? -0.075 : 0.025, 32); k.rotation.x = Math.PI / 2;
      var k2 = cil(g, 0.02, 0.02, 0.04, mat('legnoPomello'), xk - 0.05, yk + 0.02, s < 0 ? -0.05 : 0, 12); k2.rotation.x = Math.PI / 2;
    });
    g.userData = { tipo: 'porta', w: w, h: h };
    return g;
  };

  // Zerbino a mezzaluna rosso con bordo nero (foto IMG_9476). opts.forma 'mezzaluna'|'rett'
  A.tappeto = function (opts) {
    opts = O(opts);
    var w = val(opts.w, 0.9), d = val(opts.d, 0.5);
    var g = new THREE.Group(); g.name = 'tappeto';
    var geoB, geoI;
    if (opts.forma === 'rett') { geoB = new THREE.PlaneGeometry(w, d); geoI = new THREE.PlaneGeometry(w - 0.08, d - 0.08); }
    else {
      geoB = new THREE.CircleGeometry(1, 40, 0, Math.PI); geoI = new THREE.CircleGeometry(1, 40, 0, Math.PI);
    }
    var b = new THREE.Mesh(geoB, matColore('#151515', 0.95)), i = new THREE.Mesh(geoI, matColore('#b3262a', 0.95));
    b.rotation.x = i.rotation.x = -Math.PI / 2;
    if (opts.forma === 'rett') { b.position.set(0, 0.006, -d / 2); i.position.set(0, 0.008, -d / 2); }
    else { b.scale.set(w / 2, d, 1); i.scale.set(w / 2 - 0.05, d - 0.05, 1); b.position.set(0, 0.006, 0); i.position.set(0, 0.008, -0.0); }
    b.receiveShadow = i.receiveShadow = true;
    g.add(b); g.add(i);
    g.userData = { tipo: 'tappeto' };
    return g;
  };

  // Singolo occhiale (riusabile). opts: stile 0..5, tipo 'sole'|'vista'|'sport'|'bimbi', mont, lente (colori), s (scala)
  // Lenti verso -z, aste verso +z, poggia a terra (y=0).
  A.occhiale = function (opts) {
    opts = O(opts);
    var R = raccoltaOcchiali(opts.seme || 7);
    R.add({ x: 0, y: 0, z: 0, stile: opts.stile, tipo: opts.tipo || 'sole', mont: opts.mont, lente: opts.lente, s: opts.s || 1 });
    var g = R.build(); g.name = 'occhiale';
    return g;
  };

  // extra per chi monta il negozio
  A.mat = mat;
  A.raccoltaOcchiali = raccoltaOcchiali;
  A.filaOcchiali = filaOcchiali;
  A.larghezzaOcchiale = larghezzaOcchiale;
  A.TIPI = ['vetrinaParete', 'mobileBasso', 'bancone', 'scaffaleLibreria', 'totemRayBan', 'colonnaRotante', 'mensoleOcchialiParete',
    'sedia', 'specchioOvale', 'schermoVerticale', 'climatizzatore', 'faretto', 'tuboLed', 'telecamera', 'registratoreCassa',
    'quadro', 'poster', 'porta', 'tappeto', 'occhiale'];
  A.versione = '1.0 (5/11/2026)';
  window.ARREDI = A;
})();
