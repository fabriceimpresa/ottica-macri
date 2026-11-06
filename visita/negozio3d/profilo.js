/* profilo.js - VERSIONE UNIVERSALE del negozio 3D (5/11/2026, agente DUE VERSIONI 3D).
 *
 * La pagina e' una sola (negozio-3d.html). Il profilo lo decide lo script in testa alla pagina:
 *   ALTA        (predefinita)  -> questo file non fa niente.
 *   UNIVERSALE  (?versione=universale oppure negozio-3d-universale.html) -> qui:
 *     - FRECCE GRANDI a schermo (avanti / indietro / gira): premono gli stessi tasti della tastiera (window.__N3D.keys),
 *       quindi camminano con la stessa funzione muovi() della pagina (non toccata);
 *     - barra in basso a righe che scorrono (telefono verticale), pannello qualita' piccolo, nota COMANDI per il tocco;
 *     - sul telefono: avviso chiudibile con il link alla visita con le foto vere (piu' leggera);
 *     - OMBRE DI CONTATTO FINTE sotto i mobili (una macchia morbida per mobile, costo quasi zero, al posto del GTAO);
 *     - texture grandi ridotte (1024 px sul telefono, 2048 sul PC), vignettatura calda in CSS (gratis per la GPU).
 * Qualita', ombre statiche e riflessi piccoli: resa.js (CFG UNIVERSALE). MIX leggero: mix.js. Occhiali leggeri: occhiali.js.
 * Per tornare indietro: togliere la riga <script src="negozio3d/profilo.js"> (la universale resta usabile, senza frecce).
 */
(function () {
'use strict';
var P = window.N3D_P || {}, N = window.__N3D, T = window.THREE;
if (!P.uni || !N || !T) return;
var TEL = !!P.telefono, D = document;
var LS_CONS = 'ottica-macri-n3d-consiglio-foto';
P.tappe = [];   /* [nome, ms] per le misure (controllo/versioni_prova.py) */
function tappa(n) { P.tappe.push([n, Math.round(performance.now())]); }
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }
function el(tag, cls, html) { var e = D.createElement(tag); if (cls) e.className = cls; if (html != null) e.innerHTML = html; return e; }
D.title = 'Ottica Macrì in 3D · versione universale';
/* three.js controlla il log di ogni shader al primo uso (getProgramInfoLog): su ANGLE/telefoni ASPETTA la fine della compilazione,
   ~40 ms a programma con CPU lente. Gli shader sono gli stessi, gia' provati: in produzione il controllo si spegne. */
N.renderer.debug.checkShaderErrors = false;

/* vetri e lenti trasparenti a due facce: three.js li disegna in DUE passate e ricalcola il programma a ogni passata
   (material.needsUpdate dentro renderObject, ~75 volte a fotogramma). Una passata sola: stesso aspetto, meta' lavoro.
   Va fatto PRIMA della compilazione degli shader (avvio.js): con due facce in una passata il programma e' un altro. */
(function unaPassata() {
  var n = 0;
  N.scene.traverse(function (o) { var m = o.material; if (!m || Array.isArray(m)) return;
    if (m.transparent && m.side === T.DoubleSide && !m.forceSinglePass) { m.forceSinglePass = true; n++; } });
  P.unaPassata = n;
})();

/* ================= stile ================= */
var css = el('style');
css.textContent = [
  /* vignettatura calda: costa zero alla GPU */
  '.n3-vig{position:fixed;inset:0;z-index:2;pointer-events:none;background:radial-gradient(ellipse 75% 70% at 50% 46%,transparent 58%,rgba(46,24,8,.22) 100%)}',
  /* frecce */
  '.n3-frecce{position:fixed;left:12px;bottom:calc(var(--n3dock,120px) + 12px);z-index:11;display:grid;grid-template-columns:repeat(3,62px);grid-template-rows:62px 62px;gap:6px;touch-action:none;user-select:none;-webkit-user-select:none}',
  '.n3-frecce button{display:grid;place-items:center;width:62px;height:62px;padding:0;border:1px solid rgba(31,78,121,.55);border-radius:14px;background:rgba(255,253,249,.86);color:#1f4e79;',
  ' box-shadow:0 6px 16px -10px rgba(40,25,10,.7),inset 0 1px 0 #fff;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px);touch-action:none;-webkit-tap-highlight-color:transparent}',
  '.n3-frecce button svg{width:30px;height:30px;stroke:currentColor;fill:none;stroke-width:2.4;stroke-linecap:round;stroke-linejoin:round;pointer-events:none}',
  '.n3-frecce button.giu{background:#1f4e79;color:#fffdf9;border-color:#1f4e79;transform:scale(.96)}',
  '.n3-frecce .av{grid-column:2;grid-row:1}.n3-frecce .gs{grid-column:1;grid-row:2}.n3-frecce .in{grid-column:2;grid-row:2}.n3-frecce .gd{grid-column:3;grid-row:2}',
  '.n3-frecce .av{border-color:#b5462c;color:#9e3b25}.n3-frecce .av.giu{background:#b5462c;border-color:#b5462c;color:#fffdf9}',
  /* pannello qualita' piccolo, sopra la barra a destra */
  'html.n3-universale #resaPan{top:auto;bottom:calc(var(--n3dock,120px) + 12px);right:10px;transform:none;width:104px;padding:6px 6px 7px}',
  'html.n3-universale #resaPan .n3-btn{min-height:40px}',
  /* colonna in alto a sinistra: consiglio foto + comandi */
  '.n3-colonna{position:fixed;left:24px;top:76px;z-index:9;display:flex;flex-direction:column;gap:8px;width:min(340px,calc(100vw - 48px));pointer-events:none}',
  '.n3-colonna>*{pointer-events:auto}',
  '.n3-colonna .n3-comandi,.n3-colonna .n3-cq{position:relative;left:auto;top:auto;width:auto}',
  '.n3-colonna .n3-cq{align-self:flex-start}',
  '.n3-consiglio{position:relative;padding:10px 40px 10px 12px;background:#fff6ee;border:1px solid rgba(181,70,44,.55);border-left:4px solid #b5462c;color:#2a1d12;font:500 13.5px/1.4 var(--font);box-shadow:0 10px 26px -18px rgba(40,25,10,.6)}',
  '.n3-consiglio b{color:#9e3b25}',
  '.n3-consiglio a{display:inline-flex;align-items:center;gap:6px;margin-top:7px;padding:8px 12px;min-height:40px;background:#b5462c;color:#fffdf9;text-decoration:none;font:700 14px var(--title);letter-spacing:1px;text-transform:uppercase}',
  '.n3-consiglio[hidden]{display:none}',
  '@media (max-width:860px){',
  ' .n3-colonna{left:8px;top:58px;width:calc(100vw - 16px)}',
  ' .n3-colonna .n3-comandi{font-size:13px;max-height:calc(100vh - var(--n3dock,140px) - 230px);overflow-y:auto}',
  /* barra in basso: una riga per gruppo, che scorre di lato col dito */
  ' html.n3-universale .n3-dock{left:0;right:0;bottom:0;transform:none;width:auto;max-width:none;max-height:none;overflow:visible;gap:5px;padding:7px 0 calc(7px + env(safe-area-inset-bottom,0px));--cut:0px}',
  ' html.n3-universale .n3-dock>.n3-grp,html.n3-universale .n3-dock>.mx-grp{flex-wrap:nowrap;justify-content:flex-start;width:100%;overflow-x:auto;overflow-y:hidden;padding:0 10px;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch;scrollbar-width:none;overscroll-behavior-x:contain}',
  ' html.n3-universale .n3-dock>.n3-grp::-webkit-scrollbar,html.n3-universale .n3-dock>.mx-grp::-webkit-scrollbar{display:none}',
  ' html.n3-universale .n3-dock .n3-btn,html.n3-universale .n3-dock .n3-sel{flex:none;scroll-snap-align:start;min-height:44px}',
  ' html.n3-universale .n3-dock .n3-btn.piccolo{min-height:40px}',
  ' html.n3-universale .mx-btn{flex:none;min-height:46px}',
  ' html.n3-universale #mxLite{display:none}',
  ' .n3-scorri{flex:none;align-self:center;font:600 11px var(--title);letter-spacing:1.4px;text-transform:uppercase;color:#6b5c4c;white-space:nowrap;padding-right:2px}',
  ' .n3-frecce{left:8px;grid-template-columns:repeat(3,58px);grid-template-rows:58px 58px}',
  ' .n3-frecce button{width:58px;height:58px}',
  ' html.n3-universale #resaPan{right:8px;width:92px}',
  '}',
  '@media (min-width:861px){.n3-scorri{display:none}}',
  '@media (max-height:560px) and (orientation:landscape){.n3-frecce{grid-template-columns:repeat(3,50px);grid-template-rows:50px 50px}.n3-frecce button{width:50px;height:50px}}'
].join('\n');
D.head.appendChild(css);
D.body.insertBefore(el('div', 'n3-vig'), D.getElementById('stage').nextSibling);

/* altezza della barra in basso -> variabile CSS (frecce e pannello stanno sopra) */
var dock = D.querySelector('.n3-dock');
function misuraDock() { if (dock) D.documentElement.style.setProperty('--n3dock', Math.round(dock.getBoundingClientRect().height) + 'px'); }
misuraDock(); addEventListener('resize', misuraDock);
if (window.ResizeObserver && dock) new ResizeObserver(misuraDock).observe(dock);

/* «scorri ›» davanti alle righe che scorrono (solo schermi stretti, vedi CSS) */
var viste = D.getElementById('viste');
if (viste) viste.insertBefore(el('span', 'n3-scorri', 'Punti di vista ›'), viste.firstChild);
var altri = dock && dock.querySelectorAll('.n3-grp')[1];
if (altri) altri.insertBefore(el('span', 'n3-scorri', 'Altro ›'), altri.firstChild);

/* ================= nota COMANDI per il tocco ================= */
var com = D.getElementById('comandi'), cq = D.getElementById('comandiQ');
if (com) {
  var ul = com.querySelector('ul');
  var righe = P.tocco ? [
    ['Cammina', 'frecce grandi in basso a sinistra: ▲ avanti, ▼ indietro, ↺ ↻ gira'],
    ['Cammina fin lì', 'tocca il pavimento'],
    ['Gira lo sguardo', 'trascina col dito'],
    ['Zoom', 'due dita (pizzica)'],
    ['Vai a un punto', 'pulsanti in basso: scorri col dito di lato'],
    ['Qualità', 'a destra: Media o Leggera (se va a scatti)']
  ] : [
    ['Cammina', 'frecce della tastiera, W A S D, o le frecce grandi in basso a sinistra'],
    ['Cammina fin lì', 'clic sul pavimento'],
    ['Gira lo sguardo', 'tieni premuto il tasto sinistro e trascina'],
    ['Zoom', 'rotella del mouse'],
    ['Vai a un punto', 'pulsanti in basso («Entra nel negozio» fa il giro da solo)'],
    ['Qualità', 'a destra: Media o Leggera (se va a scatti)']
  ];
  if (ul) ul.innerHTML = righe.map(function (r) { return '<li><b>' + r[0] + '</b> · ' + r[1] + '</li>'; }).join('');
}

/* ================= colonna in alto: consiglio «visita con le foto» (telefono) + comandi ================= */
var col = el('div', 'n3-colonna');
D.body.appendChild(col);
var cons = el('div', 'n3-consiglio', '<button type="button" class="n3-cx" title="Chiudi">✕</button>' +
  '<b>Sul telefono il 3D può essere lento.</b> Per un giro fluido c’è la visita con le <b>foto vere</b> del negozio.<br>' +
  '<a href="visita-reale.html">📷 Visita con le foto ›</a>');
cons.hidden = true;
col.appendChild(cons);
if (com) col.appendChild(com);
if (cq) col.appendChild(cq);
function consiglioFoto(forza) {
  if (!TEL && !forza) return;
  if (!forza && ls(LS_CONS) === '1') return;
  cons.hidden = false;
}
cons.querySelector('.n3-cx').onclick = function () { cons.hidden = true; ls(LS_CONS, '1'); };
P.consiglioFoto = consiglioFoto;
consiglioFoto(false);
/* sul telefono, se c'e' il consiglio, i comandi partono chiusi (si riaprono con «? COMANDI»): lo schermo e' piccolo */
if (TEL && !cons.hidden && com && cq && !com.hidden) { com.hidden = true; cq.hidden = false; }

/* ================= frecce grandi ================= */
var SVG = {
  av: '<svg viewBox="0 0 24 24"><path d="M12 19V5M5.5 11.5 12 5l6.5 6.5"/></svg>',
  in: '<svg viewBox="0 0 24 24"><path d="M12 5v14M5.5 12.5 12 19l6.5-6.5"/></svg>',
  gs: '<svg viewBox="0 0 24 24"><path d="M9 6.5H15a5 5 0 0 1 0 10H8"/><path d="M12 3.5 9 6.5l3 3"/></svg>',
  gd: '<svg viewBox="0 0 24 24"><path d="M15 6.5H9a5 5 0 0 0 0 10h7"/><path d="M12 3.5l3 3-3 3"/></svg>'
};
var TASTO = { av: 'arrowup', in: 'arrowdown', gs: 'arrowleft', gd: 'arrowright' };
var NOME = { av: 'Avanti', in: 'Indietro', gs: 'Gira a sinistra', gd: 'Gira a destra' };
var fr = el('div', 'n3-frecce'); fr.setAttribute('aria-label', 'Frecce per camminare');
['av', 'gs', 'in', 'gd'].forEach(function (k) {
  var b = el('button', k, SVG[k]); b.type = 'button'; b.title = NOME[k]; b.setAttribute('aria-label', NOME[k]);
  var tasto = TASTO[k], premuti = 0;
  function giu(e) {
    e.preventDefault();
    try { b.setPointerCapture(e.pointerId); } catch (x) {}
    premuti++; b.classList.add('giu');
    var S = N.S;
    if (S.modo !== 'fp') { N.modoFP(); }
    if (N.fermaPercorso) N.fermaPercorso();
    S.tween = null; S.walk = null;
    N.keys[tasto] = true;
  }
  function su() { if (!premuti) return; premuti = 0; b.classList.remove('giu'); N.keys[tasto] = false; }
  b.addEventListener('pointerdown', giu);
  ['pointerup', 'pointercancel', 'lostpointercapture'].forEach(function (ev) { b.addEventListener(ev, su); });
  b.addEventListener('contextmenu', function (e) { e.preventDefault(); });
  fr.appendChild(b);
});
D.body.appendChild(fr);
addEventListener('blur', function () { ['arrowup', 'arrowdown', 'arrowleft', 'arrowright'].forEach(function (k) { N.keys[k] = false; }); });

/* ================= ombre di contatto finte sotto i mobili ================= */
(function ombreContatto() {
  try {
    var c = D.createElement('canvas'); c.width = c.height = 128;
    var g = c.getContext('2d');
    g.shadowColor = 'rgba(0,0,0,1)'; g.shadowBlur = 22; g.shadowOffsetX = 1000;
    g.fillStyle = '#000'; g.fillRect(28 - 1000, 28, 72, 72);
    var tex = new T.CanvasTexture(c);
    var mat = new T.MeshBasicMaterial({ color: 0x1a0f06, alphaMap: tex, transparent: true, opacity: 0.55, depthWrite: false,
      polygonOffset: true, polygonOffsetFactor: -2, polygonOffsetUnits: -2, toneMapped: false });
    mat.name = 'ombra-contatto'; mat.userData.resa = 'ok';
    var geo = new T.PlaneGeometry(1, 1); geo.rotateX(-Math.PI / 2);
    var grp = new T.Group(); grp.name = 'profilo:ombre-contatto';
    var box = new T.Box3(), cen = new T.Vector3(), siz = new T.Vector3(), n = 0;
    (N.ELEM || []).forEach(function (o) {
      var e = o.userData && o.userData.el, tipo = String(e && (e.tipo + ' ' + (e.id || '')) || '');
      if (/parete|muro|tubo|faretto|binario|plafon|soffitto|porta|insegna|quadro|specchio/i.test(tipo)) return;
      var q = o.quaternion.clone();
      o.quaternion.identity(); o.updateMatrixWorld(true);
      box.setFromObject(o);
      o.quaternion.copy(q); o.updateMatrixWorld(true);
      if (box.isEmpty()) return;
      box.getSize(siz); box.getCenter(cen);
      if (box.min.y > 0.2 || siz.y < 0.3 || siz.x < 0.12 || siz.z < 0.12 || siz.x * siz.z > 8) return;
      var off = cen.clone().sub(o.position); off.y = 0; off.applyQuaternion(q);
      var h = new T.Object3D(); h.position.set(o.position.x + off.x, box.min.y + 0.004, o.position.z + off.z); h.quaternion.copy(q);
      var m = new T.Mesh(geo, mat); m.scale.set(siz.x * 1.32 + 0.12, 1, siz.z * 1.32 + 0.12); m.renderOrder = -1; m.frustumCulled = true;
      m.userData.ombraFinta = true; h.add(m); grp.add(h); n++;
    });
    N.scene.add(grp);
    P.ombreContatto = n;
  } catch (e) { console.warn('profilo: ombre di contatto', e); }
})();

/* ================= meno lavoro per la CPU a ogni fotogramma =================
   Misura (telefono, CPU 6x): il tempo va in three.js per ~900 mesh visibili (matrici, prove di visibilita', ~300-780 disegni).
   1. UNIONE: dentro ogni mobile (ELEM) e dentro stanza/soffitto/fuori, le mesh con lo stesso materiale diventano UNA mesh.
      Le originali restano (nascoste) per il clic: il Raycaster di three.js prova anche gli oggetti nascosti -> clic sul pavimento
      e sui mobili invariati (PAV ed ELEM puntano ancora alle originali). Esclusi: vetri e trasparenti, occhiali (LOD), STORE//CRAFT.
   2. MATRICI FERME: i gruppi che non si muovono mai non ricalcolano le matrici a ogni fotogramma.
   3. vetri/lenti trasparenti a due facce in una passata sola. */
function menoCPU() {
  try {
    var G = N.G || {}, t0 = performance.now(), prima = 0, dopo = 0;
    var SKIP = /^(resa:|profilo:|occhiali|sx-|dx-)/;
    function saltare(o) { return o === G.sc || (o.userData && (o.userData.lod || o.userData.noMerge)) || SKIP.test(o.name || ''); }
    function unibile(o) {
      if (!(o.isMesh || o.isLineSegments) || o.isInstancedMesh || o.isSkinnedMesh || !o.visible || o.children.length) return false;
      var m = o.material, g = o.geometry;
      if (!m || Array.isArray(m) || m.visible === false || m.transparent || m.transmission > 0 || m.aoMap || m.lightMap || m.displacementMap) return false;
      if (o.userData.resaVetro || o.userData.fotoVera || o.userData.unito || o.userData.ombraFinta || o.morphTargetInfluences) return false;
      if (!g || !g.attributes.position) return false;   /* i «groups» (Box/RoundedBox ne hanno 6) con un solo materiale non contano */
      for (var k in g.attributes) if (k !== 'position' && k !== 'normal' && k !== 'uv') return false;
      return true;
    }
    /* firma del materiale: materiali uguali creati due volte (tex.js ne crea uno per pezzo) contano come uno solo */
    var FIRME = new Map(), PROPS = ['type', 'name', 'roughness', 'metalness', 'emissiveIntensity', 'opacity', 'side', 'envMapIntensity', 'clearcoat', 'clearcoatRoughness',
      'sheen', 'iridescence', 'specularIntensity', 'ior', 'alphaTest', 'depthWrite', 'depthTest', 'polygonOffset', 'polygonOffsetFactor', 'flatShading', 'wireframe', 'toneMapped', 'fog', 'vertexColors', 'blending'];
    var COL = ['color', 'emissive', 'specularColor', 'sheenColor'], MAPS = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'emissiveMap', 'bumpMap', 'alphaMap', 'envMap', 'clearcoatNormalMap', 'specularIntensityMap'];
    function firma(m) {
      if (FIRME.has(m)) return FIRME.get(m);
      var a = []; PROPS.forEach(function (k) { a.push(m[k]); }); COL.forEach(function (k) { a.push(m[k] && m[k].getHexString ? m[k].getHexString() : ''); });
      MAPS.forEach(function (k) { a.push(m[k] ? m[k].uuid : ''); }); if (m.normalScale) a.push(m.normalScale.x, m.normalScale.y);
      a.push(m.userData && m.userData.resa || ''); var f = a.join('|'); FIRME.set(m, f); return f;
    }
    function unisci(root) {
      root.updateMatrixWorld(true);
      var inv = new T.Matrix4().copy(root.matrixWorld).invert(), gruppi = {};
      (function giro(o) {
        if (o !== root && (saltare(o) || !o.visible)) return;
        if (unibile(o)) { var k = (o.isLineSegments ? 'L' : 'M') + firma(o.material) + (o.castShadow ? 's' : '') + (o.receiveShadow ? 'r' : '') + '|' + o.renderOrder + (o.frustumCulled ? 'f' : '');
          (gruppi[k] = gruppi[k] || { mat: o.material, l: [], o0: o }).l.push(o); }
        for (var i = 0; i < o.children.length; i++) giro(o.children[i]);
      })(root);
      Object.keys(gruppi).forEach(function (k) {
        var q = gruppi[k]; if (q.l.length < 2) return;
        var linee = q.o0.isLineSegments, haUv = q.l.some(function (o) { return o.geometry.attributes.uv; }), n = 0;
        var parti = q.l.map(function (o) { var g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone(); g.applyMatrix4(new T.Matrix4().multiplyMatrices(inv, o.matrixWorld)); if (!linee && !g.attributes.normal) g.computeVertexNormals(); n += g.attributes.position.count; return g; });
        var pos = new Float32Array(n * 3), nor = linee ? null : new Float32Array(n * 3), uv = (!linee && haUv) ? new Float32Array(n * 2) : null, off = 0;
        parti.forEach(function (g) { var c = g.attributes.position.count; pos.set(g.attributes.position.array, off * 3);
          if (nor) nor.set(g.attributes.normal.array, off * 3); if (uv && g.attributes.uv) uv.set(g.attributes.uv.array, off * 2); off += c; g.dispose(); });
        var geo = new T.BufferGeometry(); geo.setAttribute('position', new T.BufferAttribute(pos, 3));
        if (nor) geo.setAttribute('normal', new T.BufferAttribute(nor, 3)); if (uv) geo.setAttribute('uv', new T.BufferAttribute(uv, 2));
        geo.computeBoundingSphere();
        var me = linee ? new T.LineSegments(geo, q.mat) : new T.Mesh(geo, q.mat);
        me.castShadow = q.o0.castShadow; me.receiveShadow = q.o0.receiveShadow; me.renderOrder = q.o0.renderOrder; me.frustumCulled = q.o0.frustumCulled;
        me.name = 'profilo:unito'; me.userData.unitoDa = q.l.length;
        root.add(me);
        q.l.forEach(function (o) { o.visible = false; o.userData.unito = true; });
        prima += q.l.length; dopo++;
      });
    }
    /* radici: gruppi che si accendono/spengono sempre tutti insieme (mai a pezzi) */
    var radici = [G.arredi, G.stanza, G.soff, G.fuori];
    N.scene.children.forEach(function (c) { if (/^(vetrine:|bancone2)/.test(c.name || '')) radici.push(c); });
    radici.forEach(function (r) { if (r && !saltare(r)) unisci(r); });
    /* matrici ferme. In three.js r170 matrixWorldAutoUpdate=false NON ferma la visita dei figli (che ricompongono le matrici
       e si forzano a vicenda): qui il gruppo fermo salta del tutto l'aggiornamento, salvo richiesta esplicita (force=true). */
    N.scene.updateMatrixWorld(true);
    var fermi = 0, base = T.Object3D.prototype.updateMatrixWorld;
    function ferma(c, quando) { c.updateMatrixWorld = function (force) { if (force || (quando && quando())) return base.call(this, force); }; fermi++; }
    N.scene.children.forEach(function (c) {
      if (c === G.sc || c.isCamera || c.isLight || (c.isMesh && c.geometry && c.geometry.type === 'RingGeometry')) return;   /* STORE//CRAFT anima, bersaglio del clic */
      var mobile = false; c.traverse(function (o) { if (o === G.sc || o.isCamera) mobile = true; });
      if (mobile) return;
      ferma(c);
    });
    /* STORE//CRAFT (G.sc, ~450 oggetti): fermo finche' e' spento (quando si accende torna ad aggiornarsi da solo) */
    if (G.sc && G.sc.parent === N.scene) ferma(G.sc, function () { return G.sc.visible; });
    /* la scena stessa non si muove: con matrixAutoUpdate acceso three.js la segna «da rifare» a ogni fotogramma e forza TUTTI i figli */
    N.scene.matrixAutoUpdate = false; N.scene.updateMatrix(); N.scene.matrixWorldNeedsUpdate = false;
    P.unione = { mesh: prima, inUnite: dopo, gruppiFermi: fermi, ms: Math.round(performance.now() - t0) };
  } catch (e) { console.warn('profilo: unione', e); }
}
/* si fa subito DOPO la comparsa del negozio (non allunga l'avvio); vedi via() piu' sotto */

/* ================= dopo la comparsa: unione delle mesh, texture vere, riflessi (in quest'ordine, senza bloccare) =================
   RIFLESSI: senza post-processing la pagina compila solo gli shader «per lo schermo»; la cattura dei riflessi (e il MIX) disegnano in un
   render target = altri shader, che compilati di colpo bloccavano ~17 s. Qui: si chiede la compilazione in parallelo DOPO la
   comparsa del negozio (KHR_parallel_shader_compile), si aspetta che sia pronta e solo allora si cattura (256 px come la stanza neutra, 1 rimbalzo, una volta).
   Senza l'estensione resta la stanza neutra di partenza (RoomEnvironment): niente blocchi. */
(function dopoComparsa() {
  var R = N.renderer, RESA = window.__RESA && window.__RESA.catturaEnv ? window.__RESA : null;
  var parallelo = !!RESA && R.extensions.has('KHR_parallel_shader_compile');
  if (RESA) P.attendiRiflessi = true;   /* resa.js aspetta texture e riflessi prima di misurare gli fps (scelta automatica Media/Leggera) */
  function via() {
    var A = window.__AVVIO; if (A && !A.pronto) { setTimeout(via, 300); return; }
    setTimeout(function () { tappa('unione'); menoCPU(); tappa('unione-fine'); setTimeout(texture, 100); }, 300);
  }
  /* prima le texture calcolate vere (tex.js le ha fatte in bozza per partire prima), una ogni 40 ms */
  function texture() {
    var X = window.TEX, t0 = performance.now(), n = 0;
    (function una() {
      if (X && X.completa && X.daCompletare() > 0) { X.completa(); n++; setTimeout(una, 30); return; }
      P.textureCompletate = { n: n, ms: Math.round(performance.now() - t0) }; tappa('texture-fine');
      riflessiOra();
    })();
  }
  function riflessiOra() {
    if (!parallelo) { P.riflessi = 'stanza neutra'; setTimeout(function () { if (RESA && RESA.avviaAuto) RESA.avviaAuto(); }, 600); return; }
    setTimeout(function () {
      /* a pezzi (con le luci della scena intera), niente blocco lungo della pagina.
         Il pezzo e' un gruppo «finto» che elenca le mesh senza spostarle: niente luci dentro (se no three.js le conta due volte). */
      var tutte = [], rt = new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType }), t0 = 0;
      /* un oggetto per ogni combinazione materiale/tipo (gli altri usano lo stesso programma), a pezzi di 12 */
      var visti = new Set();
      N.scene.traverse(function (o) { if (!o.material || o.isLight) return; var ms = Array.isArray(o.material) ? o.material : [o.material];
        var k = ms.map(function (m) { return m.uuid; }).join(',') + (o.isInstancedMesh ? 'I' : '') + (o.receiveShadow ? 'r' : '') + (o.isLine ? 'L' : o.isPoints ? 'P' : '');
        if (!visti.has(k)) { visti.add(k); tutte.push(o); } });
      (function prossimo() {
        if (tutte.length) {
          var g = new T.Group(); g.children = tutte.splice(0, 12); tappa('compila');
          var prima = R.getRenderTarget();
          var tc = performance.now();
          try { R.setRenderTarget(rt); R.compile(g, N.camera, N.scene); } catch (e) { console.warn('profilo: compile', e); }
          if (performance.now() - tc > 150) P.tappe.push(['compila-lento', Math.round(performance.now() - tc), g.children.map(function (o) { return (o.material.name || o.material.type) + (o.isInstancedMesh ? '[I]' : ''); }).join(' ')]);
          R.setRenderTarget(prima); g.children = [];
          setTimeout(prossimo, 16); return;
        }
        rt.dispose(); t0 = performance.now(); attendi();
      })();
      function attendi() {
        var pr = (R.info && R.info.programs) || [], ok = true;
        for (var i = 0; i < pr.length; i++) if (pr[i].isReady && !pr[i].isReady()) { ok = false; break; }
        if (!ok && performance.now() - t0 < 60000) { setTimeout(attendi, 120); return; }
        var st = RESA.stato(), res = (RESA.cfg[st.livello] && RESA.cfg[st.livello].envRes) || 64, t1 = performance.now();
        tappa('cattura'); RESA.catturaEnv(res); tappa('cattura-fine');
        P.riflessi = { attesa: Math.round(t1 - t0), cattura: Math.round(performance.now() - t1), res: res };
        setTimeout(function () { if (RESA.avviaAuto) RESA.avviaAuto(); }, 600);
      }
    }, 700);
  }
  via();
})();

/* ================= texture grandi ridotte ================= */
var LIM = Math.min(TEL ? 1024 : 2048, N.renderer.capabilities.maxTextureSize || 4096), ridotte = 0;
var CHIAVI = ['map', 'normalMap', 'roughnessMap', 'metalnessMap', 'aoMap', 'emissiveMap', 'bumpMap', 'alphaMap', 'clearcoatNormalMap'];
function riduci() {
  var viste = new Set();
  N.scene.traverse(function (o) {
    var ms = o.material; if (!ms) return; if (!Array.isArray(ms)) ms = [ms];
    ms.forEach(function (m) {
      CHIAVI.forEach(function (k) {
        var t = m[k]; if (!t || viste.has(t) || t.userData.ridotta) return; viste.add(t);
        var im = t.image;
        var ok = im && ((typeof HTMLImageElement !== 'undefined' && im instanceof HTMLImageElement && im.complete && im.naturalWidth) || (typeof ImageBitmap !== 'undefined' && im instanceof ImageBitmap));
        if (!ok) return;
        var w = im.naturalWidth || im.width, h = im.naturalHeight || im.height;
        if (Math.max(w, h) <= LIM) { t.userData.ridotta = true; return; }
        var k2 = LIM / Math.max(w, h), c = D.createElement('canvas');
        c.width = Math.max(1, Math.round(w * k2)); c.height = Math.max(1, Math.round(h * k2));
        try { c.getContext('2d').drawImage(im, 0, 0, c.width, c.height); } catch (e) { return; }
        t.image = c; t.userData.ridotta = true; t.needsUpdate = true; ridotte++;
      });
    });
  });
  P.textureRidotte = ridotte;
}
riduci();
[1200, 3500, 8000].forEach(function (ms) { setTimeout(riduci, ms); });
if (TEL) N.renderer.domElement.style.touchAction = 'none';
})();
