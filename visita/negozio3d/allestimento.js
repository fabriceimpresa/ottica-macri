/* =====================================================================
   OTTICA MACRÌ · ALLESTIMENTO DELLE DUE VETRINE SU STRADA + TOTEM D'INGRESSO (agente VETRINE, 5/11/2026)
   Caricato da negozio-3d.html DOPO lo script principale: usa window.__N3D (scena, camera, gruppi, punti di vista).
   Legge: window.DISPOSITIVI (../dispositivi.js: supporti e misure ESATTE, allestimento deciso da Fabrice),
          window.BF_VETRINE (../media/blackfriday/vetrine/bf-vetrine-data.js: grafiche per ogni supporto; riserva: window.BF),
          window.BF_LOOP (loop del tablet), window.DISPLAY_PREZZI (../ricerca/display-vetrina.js: prezzi indicativi),
          window.VETRINE_TEX (negozio3d/vetrine-tex.js: poster e cartelli VERI di oggi), window.OCCHIALI (negozio3d/occhiali.js).
   GIRO 2 (5/11 sera): riscritto sulle misure prese col FOGLIO A4 (vetrina sx ad angolo a L, vetrina dx 1,00 x 0,42),
   DOPO molto più ricco (file fitte e ritmate, alzatine, torri piene, simmetrie e punti focali), grafiche più grandi e illuminate,
   cartello A3 appeso nel vestibolo davanti alla porta, dettagli dietro il bancone (bancone2.js). Copia del giro 1: allestimento.js.bak-giro2.
   PRIMA = la vetrina com'è oggi (merce più sparsa, cartelli di oggi). DOPO · con STORE // CRAFT = merce in ordine + i NOSTRI supporti
   (grafiche Black Friday, tablet, totem): tutto ciò che è nostro sta in G.sc, che la pagina accende e spegne.
   Coordinate: quelle della scena (x a destra guardando da fuori, z verso la STRADA = +z, y su). Un oggetto con fronte +z
   guarda la strada; per farlo guardare verso (dx,dz) si usa ry = atan2(dx,dz).
   ===================================================================== */
(function () {
'use strict';
var N = window.__N3D, T = window.THREE, O = window.OCCHIALI;
if (!N || !T || !O) { console.warn('allestimento: manca', !N ? '__N3D' : !O ? 'OCCHIALI' : 'THREE'); return; }
var E = O.espositori, PI = Math.PI, D2R = PI / 180;
var DISP = window.DISPOSITIVI || null, PREZZI = window.DISPLAY_PREZZI || {}, VT = window.VETRINE_TEX || {}, BF = window.BF || {}, LOOP = window.BF_LOOP || null;
var scene = N.scene, G = N.G, camera = N.camera, renderer = N.renderer;
var ANISO = Math.min(8, renderer.capabilities.getMaxAnisotropy());

/* ---------------- gruppi ---------------- */
var SEMPRE = new T.Group(); SEMPRE.name = 'vetrine:sempre'; scene.add(SEMPRE);   /* sfondi veri, luci, ripiano */
var PRIMA = new T.Group(); PRIMA.name = 'vetrine:prima'; scene.add(PRIMA);        /* merce e cartelli di oggi */
var DOPO = new T.Group(); DOPO.name = 'vetrine:dopo'; G.sc.add(DOPO);              /* merce in ordine + nostri supporti */
var CLIC = [];  /* {obj, scheda} */

/* ---------------- supporti (misure da dispositivi.js) ---------------- */
var RISERVA_MM = { 'plexi-a7': [74, 105], 'plexi-10x15': [100, 150], 'plexi-13x18': [130, 180], 'plexi-a5': [148, 210], 'plexi-a4': [210, 297], 'plexi-a3': [297, 420],
  'cornice-10x15': [100, 150], 'cornice-13x18': [130, 180], 'cubo-10': [100, 100], 'totem-a3': [297, 420], 'appeso-a3': [420, 297], 'vetrofania': [600, 300], 'tablet-13': [267, 167] };
function sup(id) { var s = DISP && DISP.trova ? DISP.trova(id) : null; var mm = s ? (s.stampa || s.schermo) : null; mm = mm || RISERVA_MM[id] || [100, 150];
  return { id: id, nome: s ? s.nome : id, mm: mm, w: mm[0] / 1000, h: mm[1] / 1000, uso: s ? s.uso : '', altezza: s && s.altezza ? s.altezza / 1000 : null, pixel: s && s.pixel }; }
var CHIAVE_PREZZO = { 'plexi-10x15': '10x15', 'plexi-13x18': '13x18', 'plexi-a5': 'A5', 'plexi-a4': 'A4', 'cornice-10x15': 'cornice-legno-10x15', 'cornice-13x18': 'cornice-legno-13x18' };
function prezzo(id) { var k = CHIAVE_PREZZO[id]; return k && PREZZI[k] ? PREZZI[k] : null; }

/* ---------------- grafiche ---------------- */
var TEXS = [];
function sorgente(chiave) { var V = window.BF_VETRINE || {}; var v = V[chiave];
  if (v) return typeof v === 'string' ? v : (v.png || v.src || v.data || null);
  return BF[chiave] || null; }
/* texture con le proporzioni esatte del supporto (cover), disegno di riserva finché l'immagine non c'è */
function grafica(chiavi, wmm, hmm, riserva) {
  var lato = 640, cw = wmm >= hmm ? lato : Math.round(lato * wmm / hmm), ch = wmm >= hmm ? Math.round(lato * hmm / wmm) : lato;
  var c = document.createElement('canvas'); c.width = cw; c.height = ch; var g = c.getContext('2d');
  var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = ANISO;
  var src = null; (Array.isArray(chiavi) ? chiavi : [chiavi]).some(function (k) { src = sorgente(k); return !!src; });
  (riserva || disegnoBF)(g, cw, ch);
  if (src) { var im = new Image(); im.onload = function () { var r = Math.max(cw / im.naturalWidth, ch / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r;
    g.drawImage(im, (cw - w) / 2, (ch - h) / 2, w, h); t.needsUpdate = true; }; im.src = src; }
  TEXS.push(t); return t; }
function testoSpaziato(g, s, x, y, sp) { var w = 0, i; for (i = 0; i < s.length; i++) w += g.measureText(s[i]).width + sp; w -= sp; var al = g.textAlign; g.textAlign = 'left';
  var cx = al === 'center' ? x - w / 2 : x; for (i = 0; i < s.length; i++) { g.fillText(s[i], cx, y); cx += g.measureText(s[i]).width + sp; } g.textAlign = al; }
function fondoBF(g, w, h) { var gr = g.createRadialGradient(w / 2, h * .35, 10, w / 2, h / 2, Math.max(w, h) * .8); gr.addColorStop(0, '#231a14'); gr.addColorStop(1, '#0b0908'); g.fillStyle = gr; g.fillRect(0, 0, w, h);
  g.strokeStyle = 'rgba(201,164,106,.55)'; g.lineWidth = Math.max(2, w * .006); g.strokeRect(w * .04, h * .03, w * .92, h * .94); }
function disegnoBF(g, w, h, righe) { fondoBF(g, w, h); g.fillStyle = '#c9a46a'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.font = '600 ' + Math.round(w * .1) + 'px Georgia,serif'; testoSpaziato(g, 'BLACK', w / 2, h * .3, w * .02); testoSpaziato(g, 'FRIDAY', w / 2, h * .42, w * .02);
  g.font = '300 ' + Math.round(w * .22) + 'px "Segoe UI Light","Segoe UI",sans-serif'; g.fillText((righe && righe[0]) || '−30%', w / 2, h * .62);
  g.fillStyle = '#b3261e'; g.fillRect(w * .2, h * .8, w * .6, h * .06); g.fillStyle = '#fff'; g.font = '600 ' + Math.round(w * .045) + 'px Georgia,serif'; g.fillText((righe && righe[1]) || 'OTTICA MACRÌ', w / 2, h * .83); }
function logoTex(testo, stile, w, h) { return O.cTex(w || 512, h || 160, function (g, W, H) {
  g.textAlign = 'center'; g.textBaseline = 'middle';
  if (stile === 'rayban') { g.fillStyle = '#c8102e'; g.fillRect(0, 0, W, H); g.fillStyle = '#fff'; g.font = 'italic 700 ' + Math.round(H * .62) + 'px "Kaushan Script","Brush Script MT","Segoe Script",cursive'; g.fillText(testo, W / 2, H * .55); }
  else if (stile === 'oakley') { g.fillStyle = '#111'; g.fillRect(0, 0, W, H); g.strokeStyle = '#fff'; g.lineWidth = H * .07; g.beginPath(); g.ellipse(W * .18, H / 2, H * .3, H * .2, 0, 0, 7); g.stroke(); g.fillStyle = '#fff'; g.fillRect(W * .18 - H * .3, H / 2 - H * .035, H * .6, H * .07);
    g.font = '800 ' + Math.round(H * .46) + 'px "Bahnschrift","Arial Black",sans-serif'; g.fillText(testo, W * .6, H * .55); }
  else if (stile === 'persol') { g.fillStyle = '#f3eee5'; g.fillRect(0, 0, W, H); g.fillStyle = '#1d1d1b'; g.font = '700 ' + Math.round(H * .5) + 'px "Bodoni MT",Didot,Georgia,serif'; g.fillText(testo, W / 2, H * .55); }
  else if (stile === 'nero') { g.fillStyle = '#0f0f10'; g.fillRect(0, 0, W, H); g.fillStyle = '#e8e2d6'; g.font = '600 ' + Math.round(H * .42) + 'px Georgia,serif'; testoSpaziato(g, testo, W / 2, H * .55, H * .06); }
  else { g.fillStyle = 'rgba(0,0,0,0)'; g.clearRect(0, 0, W, H); g.fillStyle = stile || '#1d1d1b'; g.font = '500 ' + Math.round(H * .42) + 'px Georgia,serif'; testoSpaziato(g, testo, W / 2, H * .55, H * .08); } }); }

/* ---------------- materiali dei supporti ---------------- */
var MS = {
  graf: function (t) { return new T.MeshStandardMaterial({ map: t, roughness: .5, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: .22 }); }, /* GIRO 2: luce sui cartelli, leggibili da fuori */
  legno: new T.MeshStandardMaterial({ color: 0x6b4426, roughness: .45 }),
  allu: new T.MeshStandardMaterial({ color: 0xc9ccd0, metalness: 1, roughness: .3 }),
  alluScuro: new T.MeshStandardMaterial({ color: 0x3d3f43, metalness: 1, roughness: .35 }),
  nero: new T.MeshStandardMaterial({ color: 0x121214, roughness: .5 }),
  vetroNero: new T.MeshPhysicalMaterial({ color: 0x07080a, roughness: .06, clearcoat: 1 }),
  cavo: new T.LineBasicMaterial({ color: 0x9aa0a6, transparent: true, opacity: .8 })
};
function piastra(w, h, d, m) { var me = new T.Mesh(new T.BoxGeometry(w, h, d), m); return me; }

/* porta-cartello in plexiglass a L (A7, 10×15, 13×18, A5, A4): lastra inclinata, base, inserto tra le due lastre */
function plexiL(id, tex) { var s = sup(id), w = s.w, h = s.h, g = new T.Group(), pan = new T.Group(); pan.rotation.x = -10 * D2R; g.add(pan);
  var la = O.lastraPlexi(w + .01, h + .01, .003); la.position.set(0, (h + .01) / 2 + .003, .004); pan.add(la);
  var st = new T.Mesh(new T.PlaneGeometry(w, h), MS.graf(tex)); st.position.set(0, h / 2 + .008, .0018); pan.add(st);
  var dorso = new T.Mesh(new T.PlaneGeometry(w, h), O.em('biancoOpaco')); dorso.rotation.y = PI; dorso.position.set(0, h / 2 + .008, .0016); pan.add(dorso);
  var base = O.lastraPlexi(w + .01, .003, Math.max(.05, h * .35)); base.position.set(0, .0015, -Math.max(.05, h * .35) / 2 + .006); g.add(base);
  return segna(g, s); }
/* porta-poster A3 a T: piede + lastra verticale con l'inserto (fronte e retro) */
function plexiT(id, tex) { var s = sup(id), w = s.w, h = s.h, g = new T.Group();
  var piede = O.lastraPlexi(w * .7, .012, .13); piede.position.y = .006; g.add(piede);
  var la = O.lastraPlexi(w + .012, h + .012, .006); la.position.set(0, .012 + (h + .012) / 2, 0); g.add(la);
  var st = new T.Mesh(new T.PlaneGeometry(w, h), MS.graf(tex)); st.position.set(0, .018 + h / 2, .0032); g.add(st);
  var r = new T.Mesh(new T.PlaneGeometry(w, h), MS.graf(tex)); r.rotation.y = PI; r.position.set(0, .018 + h / 2, -.0032); g.add(r);
  return segna(g, s); }
/* cornicetta in legno con cavalletto */
function cornice(id, tex) { var s = sup(id), w = s.w, h = s.h, p = .018, g = new T.Group(), fr = new T.Group(); fr.rotation.x = -9 * D2R; g.add(fr); var W = w + 2 * p, H = h + 2 * p;
  [[0, H - p / 2, W, p], [0, p / 2, W, p]].forEach(function (a) { var b = O.rbox(a[2], a[3], .014, .003, MS.legno); b.position.set(a[0], a[1], 0); fr.add(b); });
  [[-W / 2 + p / 2], [W / 2 - p / 2]].forEach(function (a) { var b = O.rbox(p, H - 2 * p, .014, .003, MS.legno); b.position.set(a[0], H / 2, 0); fr.add(b); });
  var st = new T.Mesh(new T.PlaneGeometry(w, h), MS.graf(tex)); st.position.set(0, H / 2, .002); fr.add(st);
  var re = piastra(W - .004, H - .004, .003, MS.legno); re.position.set(0, H / 2, -.006); fr.add(re);
  var cav = piastra(.02, H * .7, .004, MS.legno); cav.position.set(0, H * .33, -.055); cav.rotation.x = .4; g.add(cav);
  return segna(g, s); }
/* cubo plexi 10 cm con 4 facce stampate */
function cubo(id, texs) { var s = sup(id), l = s.w, g = new T.Group(); var c = O.lastraPlexi(l, l, l); c.position.y = l / 2; g.add(c);
  for (var i = 0; i < 4; i++) { var f = new T.Mesh(new T.PlaneGeometry(l - .004, l - .004), MS.graf(texs[i % texs.length])); var a = i * PI / 2;
    f.position.set(Math.sin(a) * (l / 2 - .0025), l / 2, Math.cos(a) * (l / 2 - .0025)); f.rotation.y = a; g.add(f); }
  return segna(g, s); }
/* cartello appeso con cavetti */
function appeso(id, tex, yCielo, yCentro) { var s = sup(id), w = s.w, h = s.h, g = new T.Group();
  var tela = piastra(w + .01, h + .01, .004, MS.alluScuro); tela.position.y = yCentro; g.add(tela);
  var st = new T.Mesh(new T.PlaneGeometry(w, h), MS.graf(tex)); st.position.set(0, yCentro, .0025); g.add(st);
  var pos = []; [-1, 1].forEach(function (k) { pos.push(k * w * .4, yCentro + h / 2 + .005, 0, k * w * .4, yCielo, 0); });
  var cg = new T.BufferGeometry(); cg.setAttribute('position', new T.Float32BufferAttribute(pos, 3)); g.add(new T.LineSegments(cg, MS.cavo));
  return segna(g, s); }
/* vetrofania: sticker sul lato interno del vetro, leggibile dalla strada */
function vetrofania(id, tex) { var s = sup(id), g = new T.Group();
  var m = new T.MeshStandardMaterial({ map: tex, roughness: .35, transparent: true, side: T.DoubleSide, polygonOffset: true, polygonOffsetFactor: -2 });
  var p = new T.Mesh(new T.PlaneGeometry(s.w, s.h), m); p.renderOrder = 3; g.add(p); return segna(g, s); }
/* totem da terra su asta con cartello A3 */
function totem(id, tex) { var s = sup(id), w = s.w, h = s.h, H = s.altezza || 1.2, g = new T.Group();
  var base = new T.Mesh(new T.CylinderGeometry(.17, .18, .014, 40), MS.alluScuro); base.position.y = .007; g.add(base);
  var asta = new T.Mesh(new T.CylinderGeometry(.011, .011, H - h * .6, 16), MS.allu); asta.position.y = (H - h * .6) / 2; g.add(asta);
  var tes = new T.Group(); tes.position.y = H - h / 2 - .012; tes.rotation.x = -6 * D2R; g.add(tes);
  var cor = O.rbox(w + .024, h + .024, .012, .004, MS.allu); tes.add(cor);
  var st = new T.Mesh(new T.PlaneGeometry(w, h), MS.graf(tex)); st.position.z = .0065; tes.add(st);
  var pl = O.lastraPlexi(w + .004, h + .004, .002, false); pl.position.z = .0085; tes.add(pl);
  return segna(g, s); }
/* tablet 12,4"–13" (schermo 267×167 mm, ingombro ~285×185×6,5 mm) su supporto, schermo col loop Black Friday animato */
var SCHERMI = [];
function tablet(id) { var s = sup(id), w = s.w + .016, h = s.h + .016, d = .0065, g = new T.Group(), tb = new T.Group(); tb.position.set(0, .03, .018); tb.rotation.x = -14 * D2R; g.add(tb);
  var corpo = O.rbox(w, h, d, .004, MS.alluScuro); corpo.position.y = h / 2; tb.add(corpo);
  var vetro = O.rbox(w - .002, h - .002, .0012, .0035, MS.vetroNero); vetro.position.set(0, h / 2, d / 2); tb.add(vetro);
  var c = document.createElement('canvas'); c.width = 768; c.height = 480; var t = new T.CanvasTexture(c); t.colorSpace = T.SRGBColorSpace; t.anisotropy = ANISO;
  var sc = new T.Mesh(new T.PlaneGeometry(s.w, s.h), new T.MeshBasicMaterial({ map: t, toneMapped: false, color: new T.Color(.9, .9, .9) })); sc.position.set(0, h / 2, d / 2 + .0008); tb.add(sc);
  var piede = O.rbox(.12, .008, .1, .003, MS.allu); piede.position.y = .004; g.add(piede);
  var asta = O.rbox(.05, .11, .008, .003, MS.allu); asta.position.set(0, .06, -.025); asta.rotation.x = -.42; g.add(asta);
  var lista = (LOOP && (LOOP.scure || LOOP.chiare)) || []; if (!lista.length) ['bf-slide-1', 'bf-slide-2', 'bf-slide-3', 'bf-slide-4', 'bf-slide-5', 'bf-slide-6'].forEach(function (k) { if (BF[k]) lista.push(BF[k]); });
  var cop = sorgente('sx-tablet'); if (cop) lista = [cop].concat(lista);
  SCHERMI.push({ c: c, g: c.getContext('2d'), t: t, imgs: lista.map(function (u) { var im = new Image(); im.src = u; return im; }), i: 0, t0: performance.now(), ultimo: 0 });
  return segna(g, s); }
function aggiornaSchermi(now) { SCHERMI.forEach(function (s) { if (!s.imgs.length) return; var dur = 4200, fade = 900, el = now - s.t0;
  if (el > dur + fade) { s.i = (s.i + 1) % s.imgs.length; s.t0 = now; el = 0; }
  var inFade = el > dur; if (!inFade && s.disegnato === s.i) return; if (now - s.ultimo < 50) return; s.ultimo = now;
  var g = s.g, W = s.c.width, H = s.c.height, a = s.imgs[s.i], b = s.imgs[(s.i + 1) % s.imgs.length]; g.globalAlpha = 1; g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
  if (a.complete && a.naturalWidth) { copri(g, a, W, H, 1); if (!inFade) s.disegnato = s.i; }
  if (inFade && b.complete && b.naturalWidth) copri(g, b, W, H, Math.min(1, (el - dur) / fade)); s.t.needsUpdate = true; }); }
function copri(g, im, W, H, al) { var r = Math.max(W / im.naturalWidth, H / im.naturalHeight), w = im.naturalWidth * r, h = im.naturalHeight * r; g.globalAlpha = al; g.drawImage(im, (W - w) / 2, (H - h) / 2, w, h); g.globalAlpha = 1; }

/* scheda cliccabile */
function segna(g, s) { g.userData.scheda = s; g.traverse(function (o) { if (o.isMesh) { o.castShadow = !(o.material && o.material.transparent); o.receiveShadow = true; } }); return g; }

/* ---------------- sfondi veri (poster di marca e cartelli di oggi) ---------------- */
function fotoPiano(k, w, h, opz) { var uri = VT[k]; if (!uri) return null; opz = opz || {};
  var t = new T.Texture(); t.colorSpace = T.SRGBColorSpace; t.anisotropy = ANISO; var im = new Image(); im.onload = function () { t.image = im; t.needsUpdate = true; }; im.src = uri;
  var m = new T.MeshStandardMaterial({ map: t, roughness: opz.lucido ? .25 : .6, color: 0xeeeeee });
  var g = new T.Group(), p = new T.Mesh(new T.PlaneGeometry(w, h), m); p.position.y = h / 2; g.add(p);
  if (opz.spessore) { var b = piastra(w, h, opz.spessore, opz.bordo || O.em('biancoOpaco')); b.position.set(0, h / 2, -opz.spessore / 2 - .0005); g.add(b); }
  if (opz.piede) { var c = piastra(.015, h * .6, .004, O.em('biancoOpaco')); c.position.set(0, h * .3, -.05); c.rotation.x = .35; g.add(c); }
  p.receiveShadow = true; return g; }
function metti(gr, o, x, y, z, ry, rx) { if (!o) return null; o.position.set(x, y, z); o.rotation.set(rx || 0, ry || 0, 0, 'YXZ'); gr.add(o); return o; }
function clic(o) { if (o && o.userData.scheda) CLIC.push(o); return o; }

/* ---------------- ombre morbide (macchie) sotto i pezzi ---------------- */
var MACCHIE = [], FARI = [];
var texMacchia = O.cTex(64, 64, function (g, w, h) { var gr = g.createRadialGradient(w / 2, h / 2, 2, w / 2, h / 2, w / 2); gr.addColorStop(0, 'rgba(0,0,0,.9)'); gr.addColorStop(.5, 'rgba(0,0,0,.45)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
function macchia(gr, x, y, z, w, d, ry, forza) { (MACCHIE[gr.uuid] = MACCHIE[gr.uuid] || { gr: gr, l: [] }).l.push([x, y + .0012, z, w, d, ry || 0, forza == null ? .5 : forza]); }
function costruisciMacchie() { Object.keys(MACCHIE).forEach(function (k) { var q = MACCHIE[k];
  var m = new T.MeshBasicMaterial({ color: 0x000000, alphaMap: texMacchia, transparent: true, opacity: .42, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 });
  var geo = new T.PlaneGeometry(1, 1); geo.rotateX(-PI / 2); var im = new T.InstancedMesh(geo, m, q.l.length), o = new T.Object3D();
  q.l.forEach(function (a, i) { o.position.set(a[0], a[1], a[2]); o.rotation.set(0, a[5], 0); o.scale.set(a[3], 1, a[4]); o.updateMatrix(); im.setMatrixAt(i, o.matrix); });
  im.renderOrder = 1; q.gr.add(im); }); }

/* ---------------- occhiali: lotti ---------------- */
/* stili ricorrenti */
var ST = {
  wf901: { finitura: 'nero', lente: 'g15' }, wf902: { finitura: 'tartaruga', lente: 'marrone' }, wfPolar: { finitura: 'nero', lente: 'verdePolar' },
  av: { finitura: 'oro', lente: 'g15', punta: 'nero' }, avArg: { finitura: 'argento', lente: 'specchioArg', punta: 'nero' }, avBlu: { finitura: 'oro', lente: 'specchioBlu', punta: 'tartaruga' },
  cm: { finitura: 'nero', metallo: 'oro', lente: 'g15' }, cmTart: { finitura: 'tartaruga', metallo: 'oro', lente: 'verdePolar' },
  po649: { finitura: 'tartaruga', lente: 'marrone' }, poMiele: { finitura: 'havanaMiele', lente: 'sfumataMarr' }, poNero: { finitura: 'nero', lente: 'verdePolar' }, poRot: { finitura: 'tartaruga', lente: 'sfumata' },
  hol: { finitura: 'neroOpaco', lente: 'specchioViola' }, holBlu: { finitura: 'neroOpaco', lente: 'specchioBlu' }, holOro: { finitura: 'blu', lente: 'specchioOro' }, shield: { finitura: 'bianco', lente: 'specchioBlu' }
};
function occhiale(L, mod, st, x, y, z, ry, rx, rz) { L.aggiungi(mod, st, O.posa(x, y - O.base(mod), z, ry || 0, rx || 0, rz || 0)); }
function occhialeSu(L, mod, st, p, ox, oy, oz, ry, extraRx) { /* p = punto di un espositore (in coordinate mondo già calcolate) */
  L.aggiungi(mod, st, O.posa(p.x + (ox || 0), p.y + (oy || 0), p.z + (oz || 0), ry || 0, (p.rx || 0) + (extraRx || 0), 0)); }
/* punto di un espositore posato in (x,y,z,ry) -> mondo */
function puntiMondo(esp, x, y, z, ry) { var c = Math.cos(ry), s = Math.sin(ry); return esp.punti.map(function (p) { var lx = p.x || 0, lz = p.z || 0; return { x: x + lx * c + lz * s, y: y + p.y, z: z - lx * s + lz * c, rx: p.rx || 0, riga: p.riga }; }); }
function posaEsp(gr, esp, x, y, z, ry) { metti(gr, esp.g, x, y, z, ry); esp.g.traverse(function (o) { if (o.isMesh) { o.castShadow = !(o.material && o.material.transparent); o.receiveShadow = true; } }); return puntiMondo(esp, x, y, z, ry); }
/* occhiale appeso a un perno/traversino: il ponte poggia sul punto */
function appendi(L, mod, st, p, ry) { L.aggiungi(mod, st, O.posa(p.x, p.y - .006, p.z, ry || 0, (p.rx || 0) - .1, 0)); }
/* occhiale in piedi, chiuso, su un gradino */
function chiuso(L, mod, st, x, y, z, ry) { var s = Object.assign({ piegate: true }, st); L.aggiungi(mod, s, O.posa(x, y - O.base(mod) - .002, z, ry || 0, -.18, 0)); }

/* ================= GEOMETRIA DELLE VETRINE (dal rilievo, GIRO 2: misure col foglio A4) ================= */
function elem(id) { return (window.RILIEVO && window.RILIEVO.elementi || []).find(function (e) { return e.id === id; }) || {}; }
function ripiani(el, def) { var mt = el.materiale || '', mr = mt.match(/ripian[^(]*\(([^)]*)\)/); return mr ? (mr[1].match(/\d+\.\d+/g) || []).map(Number) : def; }
var eSX = elem('vetrina-sx'), eDX = elem('vetrina-dx');
/* SX: vetrina AD ANGOLO a L (scena: z = -z rilievo). Braccio sinistro: x 0.48..0.93 (vetro a x=0.93 che guarda +x), z 0.38..1.22.
   Braccio di fondo: x 0.48..1.85 (vetro a z=0.38 che guarda la strada, +z), z 0..0.38. */
var SX = { y0: (eSX.zoccolo || .55) + .03, y1: ripiani(eSX, [1.28])[0], top: eSX.h || 2.38, xv: .93, zv: .38, xm: .48, xr: 1.85 };
/* DX: cassone regolare largo 1,00 e profondo 0,42 sul filo facciata */
var DX = { y0: (eDX.zoccolo || .55) + .03, y1: ripiani(eDX, [1.22])[0], top: eDX.h || 2.35,
  x0: (eDX.x || 3.0) - (eDX.w || 1) / 2, x1: (eDX.x || 3.0) + (eDX.w || 1) / 2, zb: -((eDX.z || -1.29) + (eDX.d || .42) / 2), zf: -((eDX.z || -1.29) - (eDX.d || .42) / 2) };
DX.cx = (DX.x0 + DX.x1) / 2; DX.zc = (DX.zb + DX.zf) / 2;
var PSX = (eSX.poligono || [[0.48, -1.22], [0.93, -1.22], [0.93, -0.38], [1.72, -0.38], [1.85, -0.25], [1.85, 0], [0.48, 0]]).map(function (p) { return [p[0], -p[1]]; });
var R90 = PI / 2, R45 = PI / 4;

/* piano dei vetrinali: nelle foto è legno/stucco chiaro */
function pianoChiaro(P, y) { var m = (window.TEX && TEX.ocra) ? TEX.ocra({ dim: [1.5, 1.5] }) : new T.MeshStandardMaterial({ color: 0xd7b45c, roughness: .6 });
  if (m && m.isTexture) m = new T.MeshStandardMaterial({ map: m, roughness: .6 }); if (!m || !m.isMaterial) m = new T.MeshStandardMaterial({ color: 0xd7b45c, roughness: .6 });
  var c = P.reduce(function (s, p) { return [s[0] + p[0] / P.length, s[1] + p[1] / P.length]; }, [0, 0]);
  var sh = new T.Shape(P.map(function (p) { return new T.Vector2(c[0] + (p[0] - c[0]) * .99, -(c[1] + (p[1] - c[1]) * .99)); }));
  var geo = new T.ShapeGeometry(sh); geo.rotateX(-PI / 2); var uv = geo.attributes.uv; for (var i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 1.5, uv.getY(i) / 1.5);
  var me = new T.Mesh(geo, m); me.position.y = y + .0015; me.receiveShadow = true; SEMPRE.add(me); return me; }

/* --- aiuti per comporre file ordinate --- */
/* fila di n occhiali chiusi su un gradino/punto p, lungo la direzione del fronte ry, larghezza w */
function fila(L, p, n, w, ry, scelta) { var c = Math.cos(ry), s = Math.sin(ry);
  for (var i = 0; i < n; i++) { var k = (i + .5) / n - .5, m = scelta(i); chiuso(L, m[0], m[1], p.x + k * w * c, p.y, p.z - k * w * s, ry); } }
/* alzatina a gradini con file fitte: ritorna i punti */
function alzatina(gr, L, x, y, z, ry, n, w, perFila, scelta, mat, dg, hg) { var e = E.gradini(n, w, dg || .07, hg || .055, mat); var p = posaEsp(gr, e, x, y, z, ry);
  p.forEach(function (q, r) { fila(L, q, perFila, w * .92, ry, function (i) { return scelta(r, i); }); }); macchia(gr, x, y, z, w + .06, (dg || .07) * n + .06, ry, .35); return p; }
function torre(gr, L, x, y, z, ry, n, h, mod, stili, mat) { var e = E.torretta(n, h, mat); var p = posaEsp(gr, e, x, y, z, ry); p.forEach(function (q, i) { appendi(L, Array.isArray(mod) ? mod[i % mod.length] : mod, stili[i % stili.length], q, ry); }); macchia(gr, x, y, z, .2, .14, ry); return p; }
function zoccoletto(gr, w, h, d, x, y, z, ry, m) { var b = O.rbox(w, h, d, .004, O.em(m || 'neroLucido')); b.position.set(x, y + h / 2, z); b.rotation.y = ry || 0; gr.add(b); return y + h; }

/* ================= VETRINA SINISTRA (ad angolo) ================= */
function vetrinaSinistra() {
  var y0 = SX.y0, y1 = SX.y1, top = SX.top;
  var Ld = new O.Lotto('sx-dopo'), Lp = new O.Lotto('sx-prima');
  pianoChiaro(PSX, y0);
  /* --- sfondi veri sempre presenti: poster Michael Kors e Gucci sul fondo ocra del braccio sinistro (x=0.48, guardano +x) --- */
  metti(SEMPRE, fotoPiano('sx-mk-alto', .2, .45, { spessore: .006 }), .49, y1 + .45, .62, R90);
  metti(SEMPRE, fotoPiano('sx-mk-scuro', .16, .43, { spessore: .006 }), .49, y1 + .45, .88, R90);
  metti(SEMPRE, fotoPiano('sx-mk-basso', .3, .23, { spessore: .006 }), .49, y1 + .2, 1.08, R90);
  metti(SEMPRE, fotoPiano('sx-gucci', .46, .34, { spessore: .008 }), .5, y1 + .6, .22, R90 - .12);

  /* ================= DOPO · SOPRA = OFFERTE SPECIALI (tutte le reclame) ================= */
  /* braccio di fondo (guarda la strada): busto al centro su zoccolo bianco, le due A5 ai lati, alzatina lunga dietro con 2 file da 6 */
  var ycz = zoccoletto(DOPO, .16, .12, .14, 1.32, y1, .22, 0, 'biancoLucido');
  var bu = E.busto(1.12); var pb = posaEsp(DOPO, bu, 1.32, ycz, .22, 0); Ld.aggiungi('aviator', ST.av, O.posa(pb[0].x, pb[0].y - .004, pb[0].z + .015, 0, 0, 0)); macchia(DOPO, 1.32, y1, .22, .2, .18);
  clic(metti(DOPO, plexiL('plexi-a5', grafica(['sx-a5-sole', 'bf-cartello-1'], 148, 210)), 1.07, y1, .29, .12));
  clic(metti(DOPO, plexiL('plexi-a5', grafica(['sx-a5-seconda', 'bf-cartello-2'], 148, 210)), 1.57, y1, .29, -.12));
  var occA = [['wayfarer', ST.wf901], ['clubmaster', ST.cm], ['aviator', ST.av], ['pantos', ST.po649], ['rotondo', ST.poRot], ['wayfarer', ST.wf902]];
  alzatina(DOPO, Ld, 1.32, y1, .07, 0, 2, .78, 6, function (r, i) { return occA[(i + r * 3) % occA.length]; }, 'biancoLucido', .06, .07);
  /* fila bassa davanti al vetro: 3 T trasparenti con occhiali "eroe" tra i cartelli */
  [[.98, 'wayfarer', ST.wfPolar], [1.2, 'clubmaster', ST.cmTart], [1.45, 'aviator', ST.avBlu], [1.68, 'pantos', ST.poMiele]].forEach(function (q) { var tt = E.T(.07); var pT = posaEsp(DOPO, tt, q[0], y1, .345, 0); appendi(Ld, q[1], q[2], pT[0], 0); macchia(DOPO, q[0], y1, .345, .1, .05); });
  /* angolo: torre alta piena (5) girata a 45°, visibile dai due vetri */
  torre(DOPO, Ld, .74, y1, .2, R45, 5, .5, ['aviator', 'wayfarer', 'clubmaster', 'wayfarer', 'aviator'], [ST.av, ST.wf901, ST.cm, ST.wf902, ST.avArg]);
  /* tablet di Aldo nel tratto più interno (lo smusso verso la porta), girato verso il vestibolo */
  /* fascia BLACK FRIDAY anche sul vetro della sinistra, in alto (dispositivi.js: vetrofania «vetrina-sx:vetro») */
  clic(metti(DOPO, vetrofania('vetrofania', grafica(['dx-vetrofania', 'bf-slide-4'], 600, 300)), 1.33, top - .2, SX.zv - .004, 0));
  clic(metti(DOPO, tablet('tablet-13'), 1.72, y1, .19, .62)); macchia(DOPO, 1.72, y1, .19, .3, .17, .62);
  /* braccio sinistro (guarda +x, verso chi è nel vestibolo): 13×18 vista gratis + cornice 13×18 con le date, alzatina tra i due */
  clic(metti(DOPO, plexiL('plexi-13x18', grafica(['sx-13x18-vista', 'bf-cartello-3'], 130, 180)), .83, y1, .58, R90 + .08));
  clic(metti(DOPO, cornice('cornice-13x18', grafica(['sx-cornice-13x18-date', 'bf-cartello-4'], 130, 180)), .8, y1, 1.07, R90 - .1));
  var occB = [['cateye', { finitura: 'nero', lente: 'sfumata' }], ['rettangolare', { finitura: 'tartaruga', lente: 'marrone' }], ['cateye', { finitura: 'havanaMiele', lente: 'sfumataMarr' }], ['pantos', ST.poNero]];
  alzatina(DOPO, Ld, .66, y1, .83, R90, 3, .3, 2, function (r, i) { return occB[(r * 2 + i) % occB.length]; }, null, .06, .055);

  /* ================= DOPO · SOTTO = CATALOGO (Ray-Ban · Persol · Clubmaster · Oakley) ================= */
  /* RAY-BAN sul braccio sinistro: torretta piena + gradini con file, brand 10×15 e due A7 */
  torre(DOPO, Ld, .6, y0, 1.05, R90, 4, .36, ['wayfarer', 'aviator', 'clubmaster', 'wayfarer'], [ST.wf901, ST.av, ST.cm, ST.wf902]);
  alzatina(DOPO, Ld, .68, y0, .72, R90, 2, .34, 3, function (r, i) { return [['aviator', ST.avArg], ['wayfarer', ST.wfPolar], ['aviator', ST.avBlu]][(i + r) % 3]; }, null, .07, .05);
  clic(metti(DOPO, plexiL('plexi-10x15', grafica('sx-brand-rayban', 100, 150)), .84, y0, 1.06, R90 + .1));
  clic(metti(DOPO, plexiL('plexi-a7', grafica('sx-a7-wayfarer', 74, 105)), .87, y0, .86, R90));
  clic(metti(DOPO, plexiL('plexi-a7', grafica('sx-a7-aviator', 74, 105)), .87, y0, .55, R90));
  /* PERSOL nell'angolo (45°): blocco col logo + gradini bianchi con sei 649 + cornicetta 10×15 + A7 */
  var bl = E.blocco(.22, .045, .07, logoTex('PERSOL', 'persol', 512, 140), 'biancoLucido'); posaEsp(DOPO, bl, .78, y0, .3, R45);
  alzatina(DOPO, Ld, .66, y0, .17, R45, 3, .27, 2, function (r, i) { return [['pantos', ST.po649], ['pantos', ST.poMiele], ['rotondo', ST.poRot]][(r + i) % 3]; }, 'biancoLucido', .055, .06);
  clic(metti(DOPO, cornice('cornice-10x15', grafica('sx-brand-persol', 100, 150)), .55, y0, .5, R90 - .3));
  clic(metti(DOPO, plexiL('plexi-a7', grafica('sx-a7-persol649', 74, 105)), .9, y0, .34, R45));
  /* CLUBMASTER al centro del braccio di fondo: gradini con due file da 4 + A7 */
  alzatina(DOPO, Ld, 1.15, y0, .12, 0, 2, .34, 4, function (r, i) { return r ? ['clubmaster', i % 2 ? ST.cmTart : ST.cm] : ['clubmaster', i % 2 ? ST.cm : ST.cmTart]; }, null, .075, .06);
  clic(metti(DOPO, plexiL('plexi-a7', grafica('sx-a7-clubmaster', 74, 105)), 1.15, y0, .31, 0));
  /* OAKLEY verso lo smusso: cubi neri lucidi a scala con Holbrook e mascherina, brand 10×15 e A7 */
  [[1.45, .15, .12], [1.6, .1, .2], [1.72, .06, .14]].forEach(function (q, i) { var cb = E.cubo(q[1], 'neroLucido'); var pc = posaEsp(DOPO, cb, q[0], y0, q[2], 0);
    var m = i === 0 ? ['sport', ST.shield] : ['sportRett', i === 1 ? ST.hol : ST.holBlu]; chiuso(Ld, m[0], m[1], pc[0].x, pc[0].y, pc[0].z, -.15); macchia(DOPO, q[0], y0, q[2], q[1] * 1.3, q[1] * 1.3, 0, .4); });
  occhiale(Ld, 'sportRett', ST.holOro, 1.52, y0, .32, -.2);
  clic(metti(DOPO, plexiL('plexi-10x15', grafica('sx-brand-oakley', 100, 150)), 1.36, y0, .3, .15));
  clic(metti(DOPO, plexiL('plexi-a7', grafica('sx-a7-holbrook', 74, 105)), 1.7, y0, .3, -.3));

  /* ================= PRIMA: com'è oggi (IMG_9492, 9485, 9490) ================= */
  /* sopra, braccio sinistro: espositore bianco Michael Kors a gradini, blocco Armani, Miu Miu, zucche */
  var mk = E.gradini(3, .3, .07, .06, 'biancoLucido'); var pm = posaEsp(PRIMA, mk, .64, y1, .98, R90);
  var vari = [['rettangolare', { finitura: 'nero', lente: 'chiara' }], ['cateye', { finitura: 'nero', lente: 'chiara' }], ['pantos', { finitura: 'tartaruga', lente: 'chiara' }], ['rettangolare', { finitura: 'bordeaux', lente: 'chiara' }], ['cateye', { finitura: 'tartaruga', lente: 'sfumata' }], ['rotondoMet', { finitura: 'oro', lente: 'chiara' }]];
  pm.forEach(function (p, i) { [-1, 1].forEach(function (k, j) { var m = vari[(i * 2 + j) % vari.length]; chiuso(Lp, m[0], m[1], p.x, p.y, p.z - k * .07, R90 + k * .05); }); });
  var ar = E.blocco(.24, .03, .08, logoTex('GIORGIO ARMANI', 'nero', 512, 120), 'biancoLucido'); posaEsp(PRIMA, ar, .82, y1, .6, R90 + .2);
  occhiale(Lp, 'rettangolare', { finitura: 'canna', lente: 'chiara' }, .84, y1 + .03, .66, R90 + .3); occhiale(Lp, 'cateye', { finitura: 'cristallo', lente: 'chiara' }, .82, y1 + .03, .52, R90 - .2);
  /* sopra, fondo: torretta nera (Gucci), gradini Etro, colonna David Beckham con il suo pannello, legno con occhiali sparsi */
  var nb = E.torretta(3, .2, 'neroLucido'); var pn = posaEsp(PRIMA, nb, .8, y1, .15, R45); pn.forEach(function (p, i) { appendi(Lp, ['cateye', 'rettangolare', 'pantos'][i], [{ finitura: 'nero', lente: 'chiara' }, { finitura: 'tartaruga', lente: 'chiara' }, { finitura: 'bordeaux', lente: 'chiara' }][i], p, R45); });
  var st3 = E.gradini(2, .24, .07, .05); var ps3 = posaEsp(PRIMA, st3, 1.1, y1, .18, .1); ps3.forEach(function (p, i) { chiuso(Lp, 'rettangolare', { finitura: i ? 'tartaruga' : 'nero', lente: 'chiara' }, p.x - .05, p.y, p.z, .1); chiuso(Lp, 'pantos', { finitura: 'cristallo', lente: 'chiara' }, p.x + .06, p.y, p.z - .03, .1); });
  var db = E.colonnaBarre(5, .36, .1); var pd = posaEsp(PRIMA, db, 1.45, y1, .12, -.1); pd.forEach(function (p, i) { appendi(Lp, i % 2 ? 'pantos' : 'rettangolare', { finitura: ['tartaruga', 'havanaMiele', 'nero', 'cristallo', 'tartaruga'][i], lente: i === 2 ? 'g15' : 'chiara' }, p, -.1); });
  metti(PRIMA, fotoPiano('sx-beckham', .36, .5, { spessore: .012, bordo: new T.MeshStandardMaterial({ color: 0x5a3b2a, roughness: .5 }) }), 1.66, y1, .1, -.3);
  metti(PRIMA, fotoPiano('sx-ritratto', .1, .32, { spessore: .004 }), 1.8, y1 + .55, .06, -R45);
  [[1.0, .33, .4], [1.25, .34, -.6], [1.42, .3, 2.2], [1.58, .33, 1.2], [.84, .3, .5]].forEach(function (q, i) { occhiale(Lp, ['rettangolare', 'cateye', 'pantos', 'rotondoMet', 'rettangolare'][i], { finitura: ['nero', 'tartaruga', 'cristallo', 'oro', 'bordeaux'][i], lente: 'chiara' }, q[0], y1, q[1], q[2]); macchia(PRIMA, q[0], y1, q[1], .14, .05, q[2], .3); });
  var legno = new T.Mesh(new T.CylinderGeometry(.018, .025, .34, 7), new T.MeshStandardMaterial({ color: 0xc8b08a, roughness: .9 })); legno.rotation.z = R90; legno.rotation.y = .2; legno.position.set(1.42, y1 + .02, .26); PRIMA.add(legno);
  metti(PRIMA, O.nidoDape('zucca', 0xd8542a, 1.1), .78, y1, .78, 0); metti(PRIMA, O.nidoDape('zucca', 0xc0392b, .9), 1.2, y1, .3, 0);
  /* sotto: poster Marciano e foto di Roma, torre bianca Guess, Carrera, alzate nere con gli sportivi, piatto Marciano, colonna di montature rosse */
  metti(PRIMA, fotoPiano('sx-marciano', .32, .4, { spessore: .006 }), 1.05, y0 + .02, .03, 0);
  metti(PRIMA, fotoPiano('sx-roma', .36, .15, { spessore: .004 }), 1.5, y0 + .3, .03, 0);
  metti(PRIMA, fotoPiano('sx-guess-ragazzo', .3, .21, { spessore: .006 }), .49, y0 + .2, .9, R90);
  var gu = E.torretta(4, .32, 'biancoLucido'); var pgu = posaEsp(PRIMA, gu, .62, y0, .95, R90); pgu.forEach(function (p, i) { appendi(Lp, ['wayfarer', 'cateye', 'aviator', 'wayfarer'][i], [ST.wf902, { finitura: 'nero', lente: 'sfumata' }, ST.av, ST.wf901][i], p, R90); });
  var ca = E.blocco(.18, .04, .06, logoTex('CARRERA', '#c8102e', 512, 140), 'biancoLucido'); posaEsp(PRIMA, ca, .84, y0, 1.15, R90 + .5); occhiale(Lp, 'aviator', ST.avArg, .85, y0 + .04, 1.12, R90 + .4);
  var tn = E.torretta(3, .2, 'neroLucido'); var ptn = posaEsp(PRIMA, tn, .66, y0, .55, R90); ptn.forEach(function (p, i) { appendi(Lp, i === 2 ? 'sport' : 'sportRett', [ST.hol, ST.holBlu, ST.shield][i], p, R90); });
  var ma = E.vassoio(.16, .16, 'biancoLucido'); var pma = posaEsp(PRIMA, ma, 1.25, y0, .25, .1); occhiale(Lp, 'cateye', { finitura: 'bianco', lente: 'sfumata' }, pma[0].x - .03, pma[0].y, pma[0].z, .2); occhiale(Lp, 'cateye', { finitura: 'nero', lente: 'sfumata' }, pma[0].x + .03, pma[0].y + .012, pma[0].z - .03, 0, .1);
  var cr = E.colonnaBarre(5, .3, .1, 'nero'); var pcr = posaEsp(PRIMA, cr, 1.62, y0, .1, -.3); pcr.forEach(function (p) { appendi(Lp, 'cateye', { finitura: 'bordeaux', lente: 'chiara' }, p, -.3); });
  [[.8, .75, 1.3], [1.0, .3, .8], [1.45, .3, 2]].forEach(function (q, i) { occhiale(Lp, ['wayfarer', 'rettangolare', 'aviator'][i], [ST.wf901, { finitura: 'nero', lente: 'chiara' }, ST.avBlu][i], q[0], y0, q[1], q[2]); macchia(PRIMA, q[0], y0, q[1], .14, .05, q[2], .3); });
  metti(PRIMA, O.nidoDape('fungo', 0xd2452c, 1.1), .82, y0, .4, 0); metti(PRIMA, O.nidoDape('fungo', 0xd2452c, .9), 1.38, y0, .32, 0); metti(PRIMA, O.nidoDape('pera', 0x26402c, 1), 1.75, y0, .2, 0);
  DOPO.add(Ld.costruisci({ dist: 2.1 })); PRIMA.add(Lp.costruisci({ dist: 2.3 })); /* GIRO 2: dettaglio pieno solo da vicino (prestazioni) */
}

/* ================= VETRINA DESTRA (cassone 1,00 x 0,42) ================= */
function vetrinaDestra() {
  var y0 = DX.y0, y1 = DX.y1, top = DX.top, cx = DX.cx, zf = DX.zf, zb = DX.zb;
  var Ld = new O.Lotto('dx-dopo'), Lp = new O.Lotto('dx-prima');
  pianoChiaro([[DX.x0, zb], [DX.x1, zb], [DX.x1, zf], [DX.x0, zf]], y0);

  /* ================= DOPO · SOPRA = PUBBLICITÀ GRANDE ================= */
  /* A3 a T «TUTTI I BRAND» al centro su zoccolo nero, alzatine simmetriche ai lati, fila bassa davanti; vetrofania in alto sul vetro */
  var yz = zoccoletto(DOPO, .34, .07, .12, cx, y1, zb + .1, 0);
  clic(metti(DOPO, plexiT('plexi-a3', grafica(['dx-a3-tutti-i-brand', 'bf-cartello-1'], 297, 420)), cx, yz, zb + .1, 0));
  macchia(DOPO, cx, y1, zb + .1, .4, .16);
  var occC = [['wayfarer', ST.wf901], ['aviator', ST.av], ['clubmaster', ST.cm], ['wayfarer', ST.wf902], ['aviator', ST.avBlu], ['clubmaster', ST.cmTart]];
  [[DX.x0 + .16, 1], [DX.x1 - .16, -1]].forEach(function (q, s) { alzatina(DOPO, Ld, q[0], y1, zb + .13, q[1] * .06, 3, .3, 2, function (r, i) { return occC[(r * 2 + i + s * 3) % occC.length]; }, 'biancoLucido', .065, .07); });
  var barra = O.lastraPlexi(.88, .03, .05); barra.position.set(cx, y1 + .015, zf - .07); DOPO.add(barra);
  fila(Ld, { x: cx, y: y1 + .03, z: zf - .07 }, 6, .9, 0, function (i) { return [['wayfarer', ST.wf901], ['aviator', ST.av], ['wayfarer', ST.wf902], ['wayfarer', ST.wfPolar], ['aviator', ST.avArg], ['wayfarer', ST.wf901]][i]; });
  clic(metti(DOPO, vetrofania('vetrofania', grafica(['dx-vetrofania', 'bf-slide-4'], 600, 300)), cx, top - .2, zf - .004, 0));

  /* ================= DOPO · SOTTO = OPERAZIONE FOCUS (Ray-Ban Wayfarer) ================= */
  var colori = [[ST.wf901, ST.wf902, ST.wf901, ST.wf902], [ST.wf902, ST.wfPolar, ST.wf902, ST.wfPolar], [ST.wfPolar, { finitura: 'cristallo', lente: 'sfumata' }, ST.wfPolar, { finitura: 'cristallo', lente: 'sfumata' }]];
  alzatina(DOPO, Ld, cx, y0, zb + .14, 0, 3, .56, 4, function (r, i) { return ['wayfarer', colori[2 - r][i]]; }, 'biancoLucido', .07, .065);
  torre(DOPO, Ld, DX.x0 + .1, y0, zb + .1, .15, 4, .36, 'wayfarer', [ST.wf901, ST.wf902, ST.wfPolar, ST.wf901]);
  torre(DOPO, Ld, DX.x1 - .1, y0, zb + .1, -.15, 4, .36, 'wayfarer', [ST.wf902, ST.wf901, ST.wfPolar, ST.wf902]);
  clic(metti(DOPO, cubo('cubo-10', ['dx-cubo-1', 'dx-cubo-2', 'dx-cubo-3', 'dx-cubo-4'].map(function (k) { return grafica(k, 100, 100); })), DX.x0 + .14, y0, zf - .1, .5));
  macchia(DOPO, DX.x0 + .14, y0, zf - .1, .14, .14, .5);
  clic(metti(DOPO, plexiL('plexi-a7', grafica('dx-a7-wayfarer-901', 74, 105)), cx - .09, y0, zf - .07, 0));
  clic(metti(DOPO, plexiL('plexi-a7', grafica('dx-a7-wayfarer-902', 74, 105)), cx + .09, y0, zf - .07, 0));
  occhiale(Ld, 'wayfarer', ST.wf901, cx - .24, y0, zf - .08, .2); occhiale(Ld, 'wayfarer', ST.wf902, cx + .24, y0, zf - .08, -.2);
  clic(metti(DOPO, plexiL('plexi-13x18', grafica(['dx-13x18-focus', 'bf-cartellino-1'], 130, 180)), DX.x1 - .14, y0, zf - .1, -.3));

  /* ================= PRIMA: com'è oggi (IMG_9493, 9494) ================= */
  /* sfondi: Ray-Ban Polarized e Nuance sul vetro posteriore a sinistra, Ferrari a destra, ragazzo sul fianco destro */
  metti(PRIMA, fotoPiano('dx-polarized', .26, .32, { spessore: .003 }), DX.x0 + .17, y1 + .62, zb + .01, 0);
  metti(PRIMA, fotoPiano('dx-nuance-bianco', .2, .26, { spessore: .003 }), DX.x0 + .17, y1 + .3, zb + .01, 0);
  metti(PRIMA, fotoPiano('dx-ferrari', .24, .35, { spessore: .008 }), DX.x1 - .2, y1 + .3, zb + .03, -.05);
  metti(PRIMA, fotoPiano('dx-ragazza', .16, .5, { spessore: .01 }), DX.x1 - .03, y1 + .04, zb + .2, -R90 + .3);
  /* sopra: Nuance Audio (nero), casco e scatola Ferrari, gradini con gli sportivi, monoposto, palla di carta */
  metti(PRIMA, fotoPiano('dx-nuance-nero', .2, .24, { spessore: .012, bordo: O.em('neroLucido') }), DX.x0 + .16, y1, zb + .12, .1);
  var nw = E.gradini(1, .2, .1, .05, 'biancoLucido'); var pnw = posaEsp(PRIMA, nw, DX.x0 + .38, y1, zb + .14, -.05); chiuso(Lp, 'wayfarer', { finitura: 'nero', lente: 'chiara' }, pnw[0].x, pnw[0].y, pnw[0].z, 0);
  metti(PRIMA, fotoPiano('dx-nuance-piccolo', .2, .1, { spessore: .006, piede: true }), DX.x0 + .38, y1 + .05, zb + .1, -.05);
  var fb = E.blocco(.26, .06, .12, logoTex('Ferrari', 'nero', 512, 120), 'neroLucido'); posaEsp(PRIMA, fb, cx + .27, y1, zb + .14, -.1);
  var casco = new T.Mesh(new T.SphereGeometry(.1, 28, 18, 0, PI * 2, 0, PI * .62), new T.MeshPhysicalMaterial({ color: 0xc8161d, roughness: .25, clearcoat: 1 })); casco.position.set(cx + .27, y1 + .07, zb + .14); casco.castShadow = true; PRIMA.add(casco);
  var visiera = new T.Mesh(new T.SphereGeometry(.102, 24, 8, -.9, 1.8, PI * .36, PI * .14), new T.MeshPhysicalMaterial({ color: 0xff9a3a, metalness: .9, roughness: .1, iridescence: 1 })); visiera.position.copy(casco.position); PRIMA.add(visiera);
  var gs = E.gradini(2, .26, .07, .045); var pgs = posaEsp(PRIMA, gs, cx + .12, y1, zf - .14, -.1); chiuso(Lp, 'sport', ST.holBlu, pgs[1].x, pgs[1].y, pgs[1].z, -.1); chiuso(Lp, 'sportRett', ST.holOro, pgs[0].x - .07, pgs[0].y, pgs[0].z, -.1); chiuso(Lp, 'sportRett', ST.hol, pgs[0].x + .08, pgs[0].y, pgs[0].z, -.1);
  var f1 = new T.Group(), rosso = new T.MeshPhysicalMaterial({ color: 0xc8161d, roughness: .3, clearcoat: 1 }); var sc1 = O.rbox(.22, .028, .055, .012, rosso); sc1.position.y = .028; f1.add(sc1);
  [[-.08, -.035], [-.08, .035], [.08, -.04], [.08, .04]].forEach(function (q) { var r = new T.Mesh(new T.CylinderGeometry(.02, .02, .02, 16), MS.nero); r.rotation.x = PI / 2; r.position.set(q[0], .02, q[1]); f1.add(r); }); metti(PRIMA, f1, cx - .2, y1, zf - .08, .15);
  [[cx - .38, zf - .1, .3, 'wayfarer', { finitura: 'rossoSport', lente: 'g15' }], [cx + .02, zf - .07, -.2, 'rettangolare', { finitura: 'bordeaux', lente: 'chiara' }], [cx - .34, zf - .22, .1, 'sportRett', { finitura: 'neroOpaco', lente: 'chiara' }], [cx + .4, zf - .1, -.5, 'sport', ST.hol]].forEach(function (q) { occhiale(Lp, q[3], q[4], q[0], y1, q[1], q[2]); macchia(PRIMA, q[0], y1, q[1], .15, .05, q[2], .3); });
  metti(PRIMA, O.nidoDape('palla', 0xb3201c, 1.2), cx + .02, y1, zb + .16, 0);
  /* sotto: angolo bambini (Controlla gratis a sinistra, Occhio a Pinocchio a destra, torre al centro, vassoio Vogue, Minion, cagnolini, astuccio) */
  metti(PRIMA, fotoPiano('dx-bambino', .22, .26, { spessore: .008, piede: true, bordo: new T.MeshStandardMaterial({ color: 0x1e7a3a }) }), DX.x0 + .2, y0, zb + .1, .08);
  metti(PRIMA, fotoPiano('dx-pinocchio', .18, .38, { spessore: .006, piede: true }), DX.x1 - .14, y0, zb + .14, -.2);
  var tk = E.torretta(5, .38); var ptk = posaEsp(PRIMA, tk, cx + .08, y0, zb + .1, -.05); ptk.forEach(function (p, i) { appendi(Lp, i === 2 ? 'sportRett' : 'wayfarer', [{ finitura: 'cristallo', lente: 'sfumata' }, { finitura: 'tartaruga', lente: 'marrone' }, ST.holOro, { finitura: 'rosa', lente: 'rosa' }, { finitura: 'blu', lente: 'sfumata' }][i] || ST.wf901, p, -.05); });
  var vg = E.blocco(.2, .05, .12, logoTex('VOGUE', 'nero', 512, 120), 'biancoLucido'); posaEsp(PRIMA, vg, cx + .28, y0, zf - .12, -.2);
  [[cx + .26, zf - .12, -.3, 'rotondo', { finitura: 'bordeaux', lente: 'chiara' }, .05], [cx + .32, zf - .1, -.2, 'rettangolare', { finitura: 'blu', lente: 'chiara' }, .05], [cx - .36, zf - .1, .2, 'rotondo', { finitura: 'blu', lente: 'chiara' }, 0], [cx - .05, zf - .08, -.4, 'rettangolare', { finitura: 'rossoSport', lente: 'chiara' }, 0], [cx - .18, zf - .22, .1, 'pantos', { finitura: 'blu', lente: 'chiara' }, 0]].forEach(function (q) {
    occhiale(Lp, q[3], q[4], q[0], y0 + q[5], q[1], q[2]); macchia(PRIMA, q[0], y0, q[1], .13, .05, q[2], .3); });
  var ast = O.rbox(.2, .035, .09, .01, new T.MeshStandardMaterial({ color: 0xb3201c, roughness: .6 })); ast.position.set(cx - .12, y0 + .018, zf - .1); ast.rotation.y = .1; PRIMA.add(ast);
  [[DX.x0 + .1, zf - .08], [DX.x1 - .08, zf - .08]].forEach(function (q) { var mi = new T.Group(), gi = new T.MeshPhysicalMaterial({ color: 0xf2c418, roughness: .35, clearcoat: .6 });
    var c = new T.Mesh(new T.CapsuleGeometry(.03, .055, 6, 16), gi); c.position.y = .06; mi.add(c); var gm = new T.Mesh(new T.TorusGeometry(.015, .006, 8, 20), O.em('cromo')); gm.position.set(0, .078, .029); mi.add(gm);
    var pa = new T.Mesh(new T.CylinderGeometry(.031, .031, .028, 16), new T.MeshStandardMaterial({ color: 0x2c4f9e, roughness: .6 })); pa.position.y = .028; mi.add(pa); metti(PRIMA, mi, q[0], y0, q[1], .3); mi.traverse(function (o) { if (o.isMesh) o.castShadow = true; }); });
  [[DX.x0 + .3, zb + .22], [cx - .1, zb + .2]].forEach(function (q) { var cn = new T.Group(), bm = new T.MeshStandardMaterial({ color: 0xf4f2ee, roughness: .5 }); var co = O.rbox(.05, .04, .08, .015, bm); co.position.y = .045; cn.add(co); var te = O.rbox(.04, .04, .045, .015, bm); te.position.set(0, .08, .035); cn.add(te); metti(PRIMA, cn, q[0], y0, q[1], .3); });
  DOPO.add(Ld.costruisci({ dist: 2.1 })); PRIMA.add(Lp.costruisci({ dist: 2.3 }));
}

/* ================= INGRESSO (solo DOPO, proposte) ================= */
function ingresso() {
  /* cartello A3 appeso coi cavetti nel vestibolo, davanti alla porta, rivolto alla strada (dispositivi.js: appeso-a3 «vestibolo») */
  var hv = (window.RILIEVO && RILIEVO.stanza && RILIEVO.stanza.vestibolo && RILIEVO.stanza.vestibolo.altezzaSoffitto) || 2.72;
  clic(metti(DOPO, appeso('appeso-a3', grafica(['dx-appeso-a3', 'bf-slide-1'], 420, 297), hv - .2, hv - .55), 2.25, 0, .42, 0));
  /* totem da terra appena entrati, a destra oltre la porta, girato verso chi entra */
  var t = totem('totem-a3', grafica(['in-totem-a3', 'bf-a4-modella'], 297, 420)); clic(metti(DOPO, t, 3.25, 0, -.4, -.55));
  macchia(DOPO, 3.25, 0, -.4, .45, .45, 0, .45);
}

/* ================= luci delle vetrine ================= */
function luci() {
  function faretto(x, y, z, tx, ty, tz, int, ang, ombre) { var s = new T.SpotLight(0xffe2b4, int, 2.6, ang, .75, 1.3); s.position.set(x, y, z); s.target.position.set(tx, ty, tz);
    if (ombre) { s.castShadow = true; s.shadow.mapSize.set(512, 512); s.shadow.radius = 6; s.shadow.bias = -.0006; s.shadow.normalBias = .01; s.shadow.camera.near = .2; s.shadow.camera.far = 2.6; }
    SEMPRE.add(s); SEMPRE.add(s.target); if (ombre) { s.shadow.autoUpdate = false; s.shadow.needsUpdate = true; FARI.push(s); } return s; }
  /* sinistra: un faretto con ombre puntato sull'angolo del ripiano (copre i due bracci), luce calda sotto il ripiano */
  faretto(1.05, SX.top - .06, .55, 1.0, SX.y1, .35, 5.5, 1.05, true);
  var p1 = new T.PointLight(0xffdcb0, 1.8, 1.7, 1.4); p1.position.set(1.0, SX.y1 - .08, .45); SEMPRE.add(p1);
  /* destra */
  faretto(DX.cx, DX.top - .06, DX.zc + .05, DX.cx, DX.y1, DX.zc - .02, 5.5, .95, true);
  var p2 = new T.PointLight(0xffdcb0, 2.2, 1.5, 1.4); p2.position.set(DX.cx, DX.y1 - .1, DX.zc + .05); SEMPRE.add(p2);
  /* riflesso sul vetro: striscia chiara obliqua leggerissima sui fronti verso la strada */
  var tr = O.cTex(256, 256, function (g, w, h) { g.clearRect(0, 0, w, h); var gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(.28, 'rgba(255,255,255,0)'); gr.addColorStop(.36, 'rgba(255,255,255,.55)'); gr.addColorStop(.42, 'rgba(255,255,255,0)'); gr.addColorStop(.55, 'rgba(255,255,255,0)'); gr.addColorStop(.6, 'rgba(255,255,255,.3)'); gr.addColorStop(.64, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, w, h); });
  var mr = new T.MeshBasicMaterial({ map: tr, transparent: true, opacity: .14, depthWrite: false, blending: T.AdditiveBlending, side: T.DoubleSide });
  var a = new T.Mesh(new T.PlaneGeometry(SX.xr - SX.xv - .15, SX.top - SX.y0), mr); a.position.set((SX.xv + SX.xr - .13) / 2, (SX.top + SX.y0) / 2, SX.zv + .004); a.renderOrder = 4; SEMPRE.add(a);
  var b = new T.Mesh(new T.PlaneGeometry(DX.x1 - DX.x0 - .06, DX.top - DX.y0), mr); b.position.set(DX.cx, (DX.top + DX.y0) / 2, DX.zf + .004); b.renderOrder = 4; SEMPRE.add(b);
}

/* ================= punti di vista e schede ================= */
function viste() {
  var V = [
    { id: 'v-sx', nome: 'Vetrina sinistra', breve: 'Vetrina sx', p: [1.45, 1.5, 2.55], g: [1.2, 1.38, .2], fov: 52 },
    { id: 'v-sx-vicino', nome: 'Vetrina sinistra · da vicino (dal vestibolo)', breve: 'Sx da vicino', p: [1.9, 1.45, 1.3], g: [.95, 1.2, .45], fov: 64 },
    { id: 'v-dx', nome: 'Vetrina destra', breve: 'Vetrina dx', p: [2.85, 1.5, 3.6], g: [3.0, 1.35, 1.3], fov: 50 },
    { id: 'v-dx-vicino', nome: 'Vetrina destra · da vicino', breve: 'Dx da vicino', p: [3.0, 1.45, 2.45], g: [3.0, 1.2, 1.25], fov: 60 }
  ];
  var nv = document.getElementById('viste');
  V.forEach(function (v) { var dx = v.g[0] - v.p[0], dz = v.g[2] - v.p[2], dy = v.g[1] - v.p[1];
    N.CAM.push({ id: v.id, nome: v.nome, breve: v.breve, gruppo: 'vetrine', x: v.p[0], y: v.p[1], z: v.p[2], yaw: Math.atan2(-dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)), fov: v.fov, foto: null });
    if (nv) { var b = document.createElement('button'); b.className = 'n3-btn'; b.dataset.cam = v.id; b.textContent = v.breve; b.title = v.nome; b.onclick = function () { N.vaiCam(v.id); }; nv.appendChild(b); } });
}

var scheda = null;
function mostraScheda(s, x, y) {
  if (!scheda) { scheda = document.createElement('div'); scheda.className = 'n3-glass'; scheda.id = 'schedaVetrina';
    scheda.style.cssText = 'position:fixed;z-index:14;max-width:300px;padding:12px 16px 12px 14px;font:500 13px var(--font);color:var(--text);display:none;--cut:12px';
    document.body.appendChild(scheda); scheda.addEventListener('click', function () { scheda.style.display = 'none'; }); }
  var mm = s.mm, misura = s.id === 'tablet-13' ? 'schermo ' + (mm[0] / 10).toString().replace('.', ',') + ' × ' + (mm[1] / 10).toString().replace('.', ',') + ' cm' + (s.pixel ? ' · ' + s.pixel.join('×') + ' px' : '') : (mm[0] / 10).toString().replace('.', ',') + ' × ' + (mm[1] / 10).toString().replace('.', ',') + ' cm' + (s.altezza ? ' · altezza ' + Math.round(s.altezza * 100) + ' cm' : '');
  var pr = prezzo(s.id);
  scheda.innerHTML = '<div style="font:700 15px var(--title);letter-spacing:1px;text-transform:uppercase;color:var(--ice);margin-bottom:4px">' + s.nome + '</div>' +
    '<div><b>Misura:</b> ' + misura + '</div>' + (s.uso ? '<div><b>Uso:</b> ' + s.uso + '</div>' : '') +
    (s.id === 'tablet-13' && window.PropostaSchermo ? PropostaSchermo.html() : '<div><b>Prezzo indicativo:</b> ' + (pr || 'da verificare') + '</div>') +
    '<div style="margin-top:6px;font:500 11px var(--mono);color:var(--mut)">STORE // CRAFT · tocca per chiudere</div>';
  if (s.id === 'tablet-13' && window.PropostaSchermo) PropostaSchermo.aggancia(scheda);
  scheda.style.maxWidth = s.id === 'tablet-13' ? '340px' : '300px'; scheda.style.overflowY = 'auto';
  scheda.style.display = 'block'; var W = innerWidth, H = innerHeight, sw = s.id === 'tablet-13' ? 356 : 316; scheda.style.left = Math.max(8, Math.min(W - sw, x + 14)) + 'px'; var tp = Math.max(70, Math.min(H - (s.id === 'tablet-13' ? 360 : 200), y - 20)); scheda.style.top = tp + 'px'; scheda.style.maxHeight = (H - tp - 12) + 'px'; }
function attivaClic() {
  var cv = renderer.domElement, giu = null, ray = new T.Raycaster(), v = new T.Vector2();
  cv.addEventListener('pointerdown', function (e) { giu = { x: e.clientX, y: e.clientY, t: performance.now() }; });
  cv.addEventListener('pointerup', function (e) { if (!giu || !G.sc.visible) return; var mosso = Math.abs(e.clientX - giu.x) + Math.abs(e.clientY - giu.y) > 5 || performance.now() - giu.t > 450; giu = null; if (mosso) return;
    var r = cv.getBoundingClientRect(); v.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(v, camera);
    var h = ray.intersectObjects(CLIC, true)[0]; if (!h) { if (scheda) scheda.style.display = 'none'; return; }
    var o = h.object; while (o && !o.userData.scheda) o = o.parent; if (!o) return;
    N.S.walk = null; /* il clic sul supporto non deve far camminare */
    mostraScheda(o.userData.scheda, e.clientX, e.clientY); });
}

/* ================= prestazioni: unione delle mesh fisse per materiale ================= */
/* tante piccole mesh (lastre, cornici, cubi, poster) -> una mesh per materiale: molte meno chiamate di disegno.
   Le schede cliccabili restano su "scatole" invisibili con l'ingombro del supporto. */
function proxyClic() { scene.updateMatrixWorld(true); var m = new T.MeshBasicMaterial({ visible: false }), out = [];
  CLIC.forEach(function (o) { var b = new T.Box3().setFromObject(o); if (b.isEmpty()) return; var s = b.getSize(new T.Vector3()), c = b.getCenter(new T.Vector3());
    var p = new T.Mesh(new T.BoxGeometry(Math.max(s.x, .02), Math.max(s.y, .02), Math.max(s.z, .02)), m); p.position.copy(c); p.userData.scheda = o.userData.scheda;
    (o.parent || scene).add(p); out.push(p); }); CLIC.length = 0; out.forEach(function (p) { CLIC.push(p); }); }
function unisciStatici(root) {
  root.updateMatrixWorld(true); var inv = new T.Matrix4().copy(root.matrixWorld).invert(), gruppi = {}, via = [];
  root.traverse(function (o) { if (o.isInstancedMesh || o.isLight || o.userData.noMerge) return; if (!(o.isMesh || o.isLineSegments) || !o.visible || !o.material || Array.isArray(o.material)) return;
    if (o.material.visible === false) return; var k = (o.isLineSegments ? 'L' : 'M') + o.material.uuid + (o.castShadow ? 's' : '') + '|' + o.renderOrder;
    (gruppi[k] = gruppi[k] || { mat: o.material, linee: o.isLineSegments, ombra: o.castShadow, ro: o.renderOrder, l: [] }).l.push(o); via.push(o); });
  Object.keys(gruppi).forEach(function (k) { var q = gruppi[k]; if (q.l.length < 2) return;
    var parti = q.l.map(function (o) { var g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld)); return g; });
    var n = 0; parti.forEach(function (g) { n += g.attributes.position.count; });
    var pos = new Float32Array(n * 3), nor = q.linee ? null : new Float32Array(n * 3), uv = q.linee ? null : new Float32Array(n * 2), off = 0;
    parti.forEach(function (g) { var c = g.attributes.position.count; pos.set(g.attributes.position.array, off * 3);
      if (nor) { if (!g.attributes.normal) g.computeVertexNormals(); nor.set(g.attributes.normal.array, off * 3); if (g.attributes.uv) uv.set(g.attributes.uv.array, off * 2); } off += c; g.dispose(); });
    var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3)); if (nor) { geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); geo.setAttribute('uv', new T.BufferAttribute(uv, 2)); }
    geo.computeBoundingSphere(); var me = q.linee ? new T.LineSegments(geo, q.mat) : new T.Mesh(geo, q.mat); me.castShadow = q.ombra; me.receiveShadow = true; me.renderOrder = q.ro; root.add(me);
    q.l.forEach(function (o) { o.visible = false; o.userData.unito = true; }); });
}

/* ================= costruzione e ciclo ================= */
try { vetrinaSinistra(); } catch (e) { console.warn('allestimento: vetrina sinistra', e); }
try { vetrinaDestra(); } catch (e) { console.warn('allestimento: vetrina destra', e); }
try { ingresso(); } catch (e) { console.warn('allestimento: totem', e); }
try { if (window.BANCONE2) window.BANCONE2(N); } catch (e) { console.warn('allestimento: bancone2', e); }
try { luci(); costruisciMacchie(); } catch (e) { console.warn('allestimento: luci', e); }
try { viste(); attivaClic(); } catch (e) { console.warn('allestimento: viste', e); }
try { proxyClic(); [DOPO, PRIMA, SEMPRE].forEach(unisciStatici); } catch (e) { console.warn('allestimento: unione', e); }
[DOPO, PRIMA, SEMPRE].forEach(function (gr) { gr.traverse(function (o) { if (o.isMesh && !o.isInstancedMesh) { o.receiveShadow = true; if (o.material && o.material.transparent) o.castShadow = false; } }); });
function ciclo(t) { requestAnimationFrame(ciclo); if (document.hidden) return;
  var dopo = G.sc.visible; if (PRIMA.visible === dopo) { PRIMA.visible = !dopo; FARI.forEach(function (s) { s.shadow.needsUpdate = true; }); } if (dopo) aggiornaSchermi(t);
  O.aggiornaLOD(camera); }
requestAnimationFrame(ciclo);
window.__VETRINE = { DOPO: DOPO, PRIMA: PRIMA, SEMPRE: SEMPRE, CLIC: CLIC, SX: SX, DX: DX, mostraScheda: mostraScheda };
})();
