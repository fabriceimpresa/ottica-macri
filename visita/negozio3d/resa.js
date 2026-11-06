/* resa.js - RESA GRAFICA FOTOREALISTICA del negozio 3D di Aldo (5/11/2026, agente RESA 3D).
 *
 * Si carica DOPO lo script principale di negozio-3d.html (usa window.__N3D: scene, camera, renderer, G).
 * Aggancio nella pagina: nel ciclo   if(!(window.__RESA&&window.__RESA.disegna(t)))renderer.render(scene,camera);
 *
 * Livelli di QUALITA' (scelta automatica in base a GPU e fps, selettore a destra, memoria in localStorage):
 *   Leggera  luci originali, niente ombre, niente post-processing           -> portatili modesti / telefoni vecchi
 *   Media    nuova luce (faretti veri, riflessi della stanza), 1 ombra, MSAA del browser
 *   Alta     + post-processing: GTAO (ombre di contatto), bloom sulle sole sorgenti luminose, MSAA 4x,
 *            3 ombre morbide 2048 px, ritocco fotografico (vignettatura leggera)
 *   Foto     + 6 ombre, vetri e lenti con trasmissione/IOR, e da FERMI accumula fino a 96 fotogrammi
 *            con micro-spostamenti (jitter) di camera e luci -> antialias perfetto e ombre morbide d'area.
 *            Pulsante «Scatta foto»: PNG 3840x2160 della vista.
 * Sempre (tutti i livelli): tone mapping Neutral (colori delle foto vere invariati), riflessi presi
 * dalla scena stessa (CubeCamera -> PMREM, 2 rimbalzi), vetri riflettenti, sorgenti luminose che brillano,
 * parquet piu' scuro e lucido come nelle foto, leggera foschia calda.
 *
 * Niente file esterni: usa solo window.THREE (vendor/three/three-bundle.js con i moduli postprocessing).
 * Per i test: ?qualita=leggera|media|alta|foto forza il livello (senza salvarlo).
 */
(function () {
'use strict';
var T = window.THREE, N = window.__N3D;
if (!T || !N || !N.renderer) { return; }
if (/[?&]resa=0/.test(location.search)) { return; }   /* ?resa=0: pagina com'era prima (per i confronti) */
var R = N.renderer, S = N.scene, C = N.camera, G = N.G || {};
var HA_POST = !!(T.EffectComposer && T.RenderPass && T.OutputPass);
/* VERSIONI 5/11: profilo UNIVERSALE (window.N3D_P.uni, vedi testa di negozio-3d.html): solo Media/Leggera, niente Foto
   ne' «Scatta foto», ombre statiche non morbide, riflessi a bassa risoluzione, memoria della qualita' separata dalla ALTA. */
var PROF = window.N3D_P || {}, UNI = !!PROF.uni, TEL = !!PROF.telefono;
var LS = UNI ? 'ottica-macri-n3d-resa-uni' : 'ottica-macri-n3d-resa';
var LIVELLI = UNI ? ['leggera', 'media'] : ['leggera', 'media', 'alta', 'foto'];
var NOMI = { leggera: 'Leggera', media: 'Media', alta: 'Alta', foto: 'Foto' };
var DPR = window.devicePixelRatio || 1;
var CFG = {
  leggera: { esp: 1.0, pr: 1, ombre: 0, map: 0, post: false, nuoveLuci: false, envRes: 64, lite: true, scala: 0.75 },
  media:   { esp: 0.92, pr: 1.25, ombre: 1, map: 1024, post: false, nuoveLuci: true, envRes: 128 },
  alta:    { esp: 1.0, pr: 1.5, ombre: 3, map: 2048, post: true, msaa: 4, gtao: 16, bloom: true, nuoveLuci: true, envRes: 256 },
  foto:    { esp: 1.0, pr: 2, ombre: 6, map: 2048, post: true, msaa: 4, gtao: 24, bloom: true, nuoveLuci: true, envRes: 256, accum: 96, trasm: true }
};
if (UNI) {   /* UNIVERSALE: «bella ma leggera». Pixel ratio max 1.5 sul telefono, riflessi piccoli calcolati una volta, ombre statiche */
  /* envRes 256 = stessa misura della stanza neutra iniziale (PMREM 256): con una misura diversa TUTTI gli shader si ricompilano
     (CUBEUV_* cambia) = blocco di secondi. La cattura si fa una volta sola, quindi 256 costa poco. */
  CFG.leggera = { esp: 1.0, pr: 1, ombre: 0, map: 0, post: false, nuoveLuci: false, envRes: 256, statiche: true, lite: true, scala: 0.75 };
  CFG.media = { esp: 0.92, pr: TEL ? 1.5 : 1.25, ombre: 1, map: 1024, post: false, nuoveLuci: true, envRes: 256, statiche: true };
  delete CFG.alta; delete CFG.foto;
}
var stato = { livello: null, auto: true, n: 0, fermo: false, fps: 0, msg: '' };
/* AVVIO 5/11: con la schermata d'avvio (window.__AVVIO, negozio3d/avvio.js) la cattura dei riflessi, la scelta automatica
   e il ricontrollo periodico partono DOPO la compilazione degli shader (dopoAvvio), non subito. */
var RINVIA = !!(window.__AVVIO && window.__AVVIO.attivo && !window.__AVVIO.pronto), envDaFare = 0, autoDaFare = false;
function ls(k, v) { try { if (v === undefined) return localStorage.getItem(k); localStorage.setItem(k, v); } catch (e) { return null; } }

/* ============ 1. tone mapping, foschia ============ */
R.toneMapping = T.NeutralToneMapping || T.ACESFilmicToneMapping;
R.toneMappingExposure = 1.12;
S.fog = new T.FogExp2(0xd6cbb8, 0.028);

/* ============ 2. luci: originali + nuove (faretti, tubi LED come luci d'area) ============ */
var ORIG = [];
S.traverse(function (o) { if (o.isLight) ORIG.push({ l: o, i: o.intensity, cs: o.castShadow }); });
var NUOVE = new T.Group(); NUOVE.name = 'resa:luci'; S.add(NUOVE);
var AREA = [];      /* luci che in modo Foto si spostano a caso sulla superficie della sorgente (ombre d'area) */
var CANDIDATE = []; /* luci che possono fare ombra, in ordine di importanza */
var D2R = Math.PI / 180;
function num(v, d) { return (typeof v === 'number' && isFinite(v)) ? v : d; }
var BOX = new T.Box3();
try { BOX.setFromObject(G.stanza || S); } catch (e) { BOX.set(new T.Vector3(0, 0, -5), new T.Vector3(4.6, 3, 0)); }
var HSTANZA = Math.min(3.4, Math.max(2.6, BOX.max.y || 3));
function nuovaSpot(col, int, ang, pen, pos, tgt, area) {
  var s = new T.SpotLight(col, int, 0, ang, pen, 2);
  s.position.copy(pos); s.target.position.copy(tgt);
  s.shadow.bias = -0.00025; s.shadow.normalBias = 0.018; s.shadow.camera.near = 0.08; s.shadow.camera.far = 9;
  NUOVE.add(s); NUOVE.add(s.target);
  if (area) AREA.push({ l: s, base: pos.clone(), ax: area.ax, len: area.len, rad: area.rad });
  return s;
}
(function costruisciLuci() {
  var el = (window.RILIEVO && window.RILIEVO.elementi) || [];
  el.forEach(function (e) {
    var tipo = String(e.tipo || '');
    if (!/tubo|faretto|binario|plafon/i.test(tipo)) return;
    var x = num(e.x, 2), z = -num(e.z, 2), y = num(e.y, HSTANZA - 0.05), w = num(e.w, 0.3);
    var r = Math.PI - num(e.rotY, 0) * D2R;              /* stessa convenzione di negozio-3d.html (rot3) */
    var ax = new T.Vector3(Math.cos(r), 0, -Math.sin(r));
    if (/tubo/i.test(tipo)) {
      /* tubo LED: luce d'area lineare, bianco neutro un po' freddo come in IMG_9479 */
      var s = nuovaSpot(0xf4f5f7, 26 * Math.max(0.6, w / 1.5), 1.2, 1, new T.Vector3(x, y - 0.05, z), new T.Vector3(x, 0, z), { ax: ax, len: w * 0.9, rad: 0.02 });
      s.userData.peso = 3 + w;
      CANDIDATE.push(s);
    } else if (w > 0.8) {
      /* binario/cavi con faretti: 4-5 faretti caldi orientati verso la parete piu' vicina */
      var n = Math.max(3, Math.min(5, Math.round(w / 0.55)));
      var versoX = (BOX.max.x - x < x - BOX.min.x) ? BOX.max.x - 0.05 : BOX.min.x + 0.05;
      var vicino = Math.abs(versoX - x) < 1.0;
      for (var i = 0; i < n; i++) {
        var t = (i + 0.5) / n - 0.5, p = new T.Vector3(x, y - 0.18, z).addScaledVector(ax, t * w);
        var tg = vicino ? new T.Vector3(versoX, 1.25, p.z) : new T.Vector3(p.x, 0, p.z);
        var f = nuovaSpot(0xfff0e2, 8, 0.42, 0.6, p, tg, { ax: new T.Vector3(1, 0, 0), len: 0, rad: 0.025 });
        f.userData.peso = 2 - Math.abs(t); CANDIDATE.push(f);
      }
    }
  });
  /* la luce centrale con ombre gia' presente nella pagina: prima candidata */
  ORIG.forEach(function (o) { if (o.l.isSpotLight && o.cs) { o.l.userData.peso = 10; CANDIDATE.push(o.l); AREA.push({ l: o.l, base: o.l.position.clone(), ax: new T.Vector3(1, 0, 0), len: 0.5, rad: 0.25 }); } });
  /* i faretti delle vetrine su strada (allestimento.js) hanno gia' le loro ombre: restano come sono */
  CANDIDATE.sort(function (a, b) { return (b.userData.peso || 0) - (a.userData.peso || 0); });
})();
var CANDIDATE_ORIG_OMBRA = new Map(); CANDIDATE.forEach(function (l) { CANDIDATE_ORIG_OMBRA.set(l, l.castShadow); });

function applicaLuci(cfg) {
  var nuove = cfg.nuoveLuci;
  NUOVE.visible = nuove;
  NUOVE.children.forEach(function (l) { if (l.isLight) l.visible = nuove; });
  ORIG.forEach(function (o) {
    var l = o.l, k = 1;
    if (nuove) {
      if (l.isHemisphereLight) k = cfg.post ? 0.26 : 0.36;
      else if (l.isAmbientLight) k = 0;
      else if (l.isPointLight) k = 0.55;
      else if (l.isSpotLight && o.cs) k = 0.75;
    }
    l.intensity = o.i * k;
    /* bianco piu' neutro (nelle foto le pareti sono bianche, non crema): luci della stanza verso il bianco a 4000 K */
    if (!o.c0 && l.color) o.c0 = l.color.clone();
    if (o.c0) { l.color.copy(o.c0); if (nuove && !l.isAmbientLight) l.color.lerp(new T.Color(0xfff6ec), 0.55); }
    if (o.g0 == null && l.isHemisphereLight) o.g0 = l.groundColor.clone();
    if (l.isHemisphereLight) { l.groundColor.copy(o.g0); if (nuove) l.groundColor.lerp(new T.Color(0x5a5048), 0.5); }
    if (!CANDIDATE_ORIG_OMBRA.has(l)) l.castShadow = cfg.ombre > 0 ? o.cs : false;
  });
  /* ombre: solo le N piu' importanti */
  var dispon = cfg.ombre;
  CANDIDATE.forEach(function (l) {
    var visibile = l.parent === NUOVE ? nuove : true;
    var on = visibile && dispon > 0;
    if (on) dispon--;
    l.castShadow = on;
    if (on && cfg.map && l.shadow.mapSize.x !== cfg.map) {
      l.shadow.mapSize.set(cfg.map, cfg.map);
      if (l.shadow.map) { l.shadow.map.dispose(); l.shadow.map = null; }
    }
  });
  R.shadowMap.enabled = cfg.ombre > 0;
  R.shadowMap.type = UNI ? T.PCFShadowMap : T.PCFSoftShadowMap;   /* UNIVERSALE: ombre non morbide (meno campioni) */
  R.shadowMap.autoUpdate = false;   /* negozio fermo: le mappe d'ombra si rifanno solo quando cambia qualcosa (vedi ombreDaRifare) */
  ombreDaRifare(4);
}

/* ============ 3. materiali ============ */
var VISTI = new WeakSet(), VETRI = [], SORGENTI = [], FOTO = [];
function lum(c) { return 0.2126 * c.r + 0.7152 * c.g + 0.0722 * c.b; }
function eVetro(m) {
  if (!m || !m.transparent || m.map || m.alphaMap) return false;
  if (/^vetro($|-vetrina|-scaffale)/.test(m.name || '')) return true;
  return (m.isMeshStandardMaterial || m.isMeshPhysicalMaterial) && m.opacity <= 0.3 && lum(m.color) > 0.85;
}
function aggiornaMateriali() {
  var nuovi = 0;
  S.traverse(function (o) {
    if (!o.isMesh || !o.material || Array.isArray(o.material)) return;
    var m = o.material;
    if (m.userData && m.userData.resa) { if (m.userData.resa === 'vetroA' || m.userData.resa === 'vetroT') { if (!VISTI.has(o)) { VISTI.add(o); VETRI.push(o); } } return; }
    if (VISTI.has(o)) return;
    VISTI.add(o); nuovi++;
    var nome = m.name || '';
    if (eVetro(m)) { prepVetro(o); return; }
    if (o.userData.fotoVera || (m.isMeshBasicMaterial && m.map && m.toneMapped === false)) { FOTO.push(m); m.userData.resa = 'foto'; return; }
    /* sorgenti luminose: dischi dei faretti, tubi, plafoniere -> brillano (bloom) */
    if (m.emissive && !m.emissiveMap && m.emissiveIntensity >= 1.5 && lum(m.emissive) > 0.6) {
      m.userData.resa = 'luce'; m.userData.e0 = m.emissiveIntensity; m.emissiveIntensity = m.userData.e0 * 6; SORGENTI.push(m); return;
    }
    if (m.isMeshBasicMaterial && !m.map && !m.transparent && lum(m.color) > 0.85) {
      if (!o.geometry.boundingSphere) o.geometry.computeBoundingSphere();
      if (o.geometry.boundingSphere && o.geometry.boundingSphere.radius < 0.35) { m.userData.resa = 'luce'; m.color.multiplyScalar(8); SORGENTI.push(m); return; }
    }
    if (m.emissiveMap && m.emissiveIntensity > 0.5) { m.userData.resa = 'schermo'; m.emissiveIntensity = Math.min(1.6, m.emissiveIntensity * 1.35); return; }
    m.userData.resa = 'ok';
    /* lenti da sole (metalliche, poco trasparenti): non devono specchiare la stanza bianca, restano scure */
    if (m.transparent && !m.map && m.opacity > 0.5 && m.metalness >= 0.5) { m.envMapIntensity = 0.25; m.opacity = Math.max(m.opacity, 0.95); return; }
    if (nome === 'parquet') { m.color.setRGB(0.6, 0.49, 0.43); m.roughness = 0.28; }
    else if (nome === 'intonaco') { m.color.multiplyScalar(0.97); }
    else if (/radica|bancone-fronte/.test(nome)) { m.envMapIntensity = 1.2; }
    else if (/specchio|cromo|ottone|bancone-bordo/.test(nome)) { m.envMapIntensity = 1.3; }
    if (m.isMeshStandardMaterial && m.envMapIntensity === 1 && m.metalness > 0.5) m.envMapIntensity = 1.2;
  });
  return nuovi;
}
var CACHE_VETRI = new Map();   /* un solo materiale nuovo per ogni materiale di vetro originale (meno lavoro per la CPU) */
function prepVetro(o) {
  var m = o.material;
  var c = CACHE_VETRI.get(m);
  if (c) { o.userData.resaVetro = { orig: m, A: c.A, T: c.T, op: m.opacity }; o.material = c.A; VETRI.push(o); return; }
  /* A: vetro "additivo": somma alla scena solo il riflesso (Fresnel) -> sempre corretto anche vetro dietro vetro */
  var a = new T.MeshPhysicalMaterial({
    color: 0x000000, roughness: 0.03, metalness: 0, ior: 1.5, envMapIntensity: 1.7, specularIntensity: 1,
    transparent: true, depthWrite: false, blending: T.AdditiveBlending, side: m.side, premultipliedAlpha: false
  });
  a.name = (m.name || 'vetro') + ':resa'; a.userData.resa = 'vetroA';
  /* T: vetro con trasmissione/IOR (modo Foto): rifrazione, leggera tinta verde del float */
  var t = new T.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.0, metalness: 0, transmission: 1, ior: 1.52, thickness: 0.006,
    attenuationColor: new T.Color(0xd8efe2), attenuationDistance: 0.25, specularIntensity: 1, envMapIntensity: 1.4,
    transparent: false, side: T.FrontSide
  });
  t.name = (m.name || 'vetro') + ':foto'; t.userData.resa = 'vetroT';
  CACHE_VETRI.set(m, { A: a, T: t });
  o.userData.resaVetro = { orig: m, A: a, T: t, op: m.opacity };
  o.material = a; VETRI.push(o);
}
function applicaVetri(cfg) {
  VETRI.forEach(function (o) { var v = o.userData.resaVetro; if (!v) return; o.material = cfg.trasm ? v.T : v.A; });
}
function applicaFoto(cfg) {
  /* i ritagli fotografici (MeshBasic, toneMapped:false) nel post vengono comunque compressi dal tone mapping: piccola compensazione */
  FOTO.forEach(function (m) { if (m.userData.c0 == null) m.userData.c0 = m.color.r; var k = cfg.post ? 1.06 : 1; m.color.setScalar(m.userData.c0 * k); });
}


/* ============ LEGGERA 6/11 (Fabrice: «il 3D pesa, fai la leggera ancora più leggera») ============
   In Leggera: (a) restano accese solo la luce centrale e le 2 lampade più forti, le altre si spengono e la luce
   d'ambiente le compensa (ogni luce in meno = meno calcoli su OGNI pixel); (b) i vetri (160 lastre trasparenti
   con riflessi) si nascondono; (c) si disegna al 75% della risoluzione (vedi applica). Tornando a Media/Alta si
   riaccende tutto come prima. */
var LITE_ON = false;
function applicaLite(cfg) {
  var on = !!cfg.lite;
  var luci = [];
  S.traverse(function (o) {
    if (!(o.isPointLight || o.isSpotLight) || o.parent === NUOVE) return;
    if (o.userData.liteV0 === undefined) o.userData.liteV0 = o.visible;
    luci.push(o);
  });
  if (on) {
    var tieni = luci.filter(function (l) { return l.userData.liteV0; })
      .sort(function (a, b) { return (b.castShadow || CANDIDATE_ORIG_OMBRA.get(b) ? 1e6 : 0) + b.intensity - ((a.castShadow || CANDIDATE_ORIG_OMBRA.get(a) ? 1e6 : 0) + a.intensity); })
      .slice(0, 3);
    luci.forEach(function (l) { l.visible = tieni.indexOf(l) >= 0 && l.userData.liteV0; });
    ORIG.forEach(function (o) {
      if (o.l.isHemisphereLight) o.l.intensity = o.i * 1.9;
      else if (o.l.isAmbientLight) o.l.intensity = o.i * 1.6;
    });
  } else if (LITE_ON) {
    luci.forEach(function (l) { l.visible = l.userData.liteV0; });
  }
  VETRI.forEach(function (o) {
    if (on) { if (o.userData.liteVis === undefined) o.userData.liteVis = o.visible; o.visible = false; }
    else if (o.userData.liteVis !== undefined) { o.visible = o.userData.liteVis; delete o.userData.liteVis; }
  });
  LITE_ON = on;
}

/* ============ 4. riflessi dalla scena stessa (CubeCamera -> PMREM) ============ */
var ENV = null, envRes = 0;
function catturaEnv(res) {
  try {
    var c = BOX.getCenter(new T.Vector3());
    var crt = new T.WebGLCubeRenderTarget(res, { type: T.HalfFloatType });
    var cc = new T.CubeCamera(0.05, 40, crt);
    cc.position.set(c.x, 1.5, c.z);
    var pm = new T.PMREMGenerator(R);
    /* AVVIO 5/11: niente nebbia nella cattura con densità 0 invece di fog=null: stessa immagine, ma gli stessi shader
       del disegno normale (con fog=null ogni materiale veniva compilato una seconda volta, ~200 ms l'uno) */
    var fog = S.fog, fogD = fog && fog.isFogExp2 ? fog.density : null; if (fogD != null) fog.density = 0; else S.fog = null;
    var lab = NUOVE.visible;
    var nascosti = [];
    VETRI.forEach(function (o) { if (o.visible) { o.visible = false; nascosti.push(o); } }); /* niente vetri nella cattura */
    var prev = S.environment, rimb = null;
    for (var k = 0; k < (UNI ? 1 : 2); k++) {   /* 2 rimbalzi: la seconda cattura vede gia' i riflessi della prima (UNIVERSALE: 1) */
      cc.update(R, S);
      var rt = pm.fromCubemap(crt.texture);
      if (rimb) rimb.dispose();
      rimb = rt; S.environment = rt.texture;
    }
    nascosti.forEach(function (o) { o.visible = true; });
    if (fogD != null) fog.density = fogD; S.fog = fog;
    if (ENV && ENV !== rimb) ENV.dispose();
    ENV = rimb; envRes = res;
    S.environmentIntensity = 0.6;
    crt.dispose(); pm.dispose();
    if (prev && prev !== S.environment && prev.dispose && !prev.__resaTenere) { /* la RoomEnvironment originale non serve piu' */ }
    return true;
  } catch (e) { console.warn('resa: env', e); return false; }
}

/* ============ 5. post-processing ============ */
var P = null; /* {composer, render, gtao, bloom, out, rit, w, h} */
var RitoccoShader = {
  uniforms: { tDiffuse: { value: null }, vig: { value: 0.22 }, caldo: { value: 0.008 }, grana: { value: 0.012 }, seme: { value: 0 } },
  vertexShader: 'varying vec2 vUv;void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader: [
    'uniform sampler2D tDiffuse;uniform float vig,caldo,grana,seme;varying vec2 vUv;',
    'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233))+seme)*43758.5453);}',
    'void main(){vec4 c=texture2D(tDiffuse,vUv);vec2 d=vUv-.5;float v=1.0-vig*smoothstep(.25,.85,dot(d,d)*2.2);',
    'c.rgb*=v;c.rgb+=vec3(caldo,caldo*.4,-caldo*.6)*(1.0-c.rgb);',
    'c.rgb+=(h(vUv*1000.0)-.5)*grana;gl_FragColor=c;}'
  ].join('\n')
};
var AccumShader = {
  uniforms: { tNuovo: { value: null }, tVecchio: { value: null }, w: { value: 1 } },
  vertexShader: RitoccoShader.vertexShader,
  fragmentShader: 'uniform sampler2D tNuovo,tVecchio;uniform float w;varying vec2 vUv;void main(){vec4 v=texture2D(tVecchio,vUv),n=texture2D(tNuovo,vUv);' +
    'v=min(max(v,vec4(0.0)),vec4(6.0e4));n=min(max(n,vec4(0.0)),vec4(6.0e4));gl_FragColor=mix(v,n,w);}'
};
var CopiaShader = {
  uniforms: { tDiffuse: { value: null } }, vertexShader: RitoccoShader.vertexShader,
  fragmentShader: 'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){gl_FragColor=texture2D(tDiffuse,vUv);}'
};
var PulisciShader = {
  uniforms: { tDiffuse: { value: null } }, vertexShader: RitoccoShader.vertexShader,
  fragmentShader: 'uniform sampler2D tDiffuse;varying vec2 vUv;void main(){gl_FragColor=min(max(texture2D(tDiffuse,vUv),vec4(0.0)),vec4(6.0e4));}'
};
var ACC = null; /* {a, b, quadAcc, quadCopia} */
function dimBuffer() { var v = new T.Vector2(); R.getDrawingBufferSize(v); return v; }
function creaPost(cfg) {
  distruggiPost();
  if (!HA_POST || !cfg.post) return;
  var d = dimBuffer();
  var rt = new T.WebGLRenderTarget(d.x, d.y, { type: T.HalfFloatType, samples: R.capabilities.isWebGL2 ? (cfg.msaa || 0) : 0 });
  var comp = new T.EffectComposer(R, rt);
  comp.setPixelRatio(1);
  var rp = new T.RenderPass(S, C); comp.addPass(rp);
  /* MSAA + jitter: qualche pixel NaN che il bloom e la media allargherebbero a mezzo schermo -> max(v,0) lo azzera (anche su D3D) */
  var pul = new T.ShaderPass(PulisciShader); comp.addPass(pul);
  var gtao = null;
  if (cfg.gtao && T.GTAOPass) {
    gtao = new T.GTAOPass(S, C, d.x, d.y);
    gtao.overrideVisibility = function () {          /* il vetro non deve "chiudere" l'AO di cio' che sta dietro */
      var cache = this._visibilityCache; this.scene.traverse(function (o) {
        cache.set(o, o.visible);
        if (o.isPoints || o.isLine || o.isSprite || (o.isMesh && o.material && (o.material.transparent || o.material.transmission > 0))) o.visible = false;
      }); };
    gtao.updateGtaoMaterial({ radius: 0.32, distanceExponent: 1.4, thickness: 1.2, scale: 1.25, samples: cfg.gtao, distanceFallOff: 1, screenSpaceRadius: false });
    gtao.updatePdMaterial({ lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, radiusExponent: 1, rings: 2, samples: 16 });
    var cb = BOX.clone().expandByScalar(0.6); gtao.setSceneClipBox(null); /* tutta la scena (anche la strada) */
    gtao.blendIntensity = 1.0;
    comp.addPass(gtao);
  }
  var bloom = null;
  if (cfg.bloom && T.UnrealBloomPass) { bloom = new T.UnrealBloomPass(new T.Vector2(d.x, d.y), 0.3, 0.5, 3.0); comp.addPass(bloom); }
  var out = new T.OutputPass(); comp.addPass(out);
  var rit = new T.ShaderPass(RitoccoShader); comp.addPass(rit);
  comp.renderToScreen = !cfg.accum;
  P = { composer: comp, render: rp, gtao: gtao, bloom: bloom, out: out, rit: rit, w: d.x, h: d.y };
  if (cfg.accum) creaAcc(d.x, d.y);
}
function creaAcc(w, h) {
  if (ACC) { ACC.a.dispose(); ACC.b.dispose(); }
  var o = { type: T.HalfFloatType, depthBuffer: false };
  ACC = { a: new T.WebGLRenderTarget(w, h, o), b: new T.WebGLRenderTarget(w, h, o),
    qa: ACC ? ACC.qa : new T.FullScreenQuad(new T.ShaderMaterial(AccumShader)),
    qc: ACC ? ACC.qc : new T.FullScreenQuad(new T.ShaderMaterial(CopiaShader)) };
}
function distruggiPost() {
  if (P) { try { P.composer.dispose(); P.composer.renderTarget1.dispose(); P.composer.renderTarget2.dispose(); if (P.gtao) P.gtao.dispose(); if (P.bloom) P.bloom.dispose(); } catch (e) {} }
  P = null;
  if (ACC) { ACC.a.dispose(); ACC.b.dispose(); ACC = null; }
}
function adattaPost() {
  if (!P) return;
  var d = dimBuffer();
  if (d.x === P.w && d.y === P.h) return;
  P.w = d.x; P.h = d.y; P.composer.setSize(d.x, d.y);
  if (ACC) creaAcc(d.x, d.y);
  stato.n = 0;
}

/* ============ 6. applica livello ============ */
function applica(liv, salva) {
  if (LIVELLI.indexOf(liv) < 0) liv = UNI ? 'media' : 'alta';
  var cfg = CFG[liv];
  stato.livello = liv; stato.n = 0;
  R.toneMappingExposure = cfg.esp || 1;
  if (salva) { ls(LS, liv); stato.auto = false; }
  R.setPixelRatio(Math.min(DPR, cfg.pr) * (cfg.scala || 1));   /* LEGGERA 6/11: disegna al 75% e il browser allarga (testi e pulsanti restano nitidi: sono HTML) */
  if (typeof window.dispatchEvent === 'function') window.dispatchEvent(new Event('resize')); /* la pagina rifa' setSize */
  applicaLuci(cfg);
  applicaVetri(cfg);
  applicaFoto(cfg);
  applicaLite(cfg);
  S.traverse(function (o) { if (o.isMesh && o.material && !Array.isArray(o.material)) o.material.needsUpdate = true; });
  creaPost(cfg);
  if (UNI) { if (!ENV) S.environmentIntensity = 0.5; }   /* UNIVERSALE: riflessi dalla scena UNA volta, li fa profilo.js quando gli shader sono pronti */
  else if (!ENV || envRes < cfg.envRes) { if (RINVIA) envDaFare = Math.max(envDaFare, cfg.envRes); else catturaEnv(cfg.envRes); }
  if (!cfg.trasm) ripristinaJitter();
  aggiornaPannello();
}

/* ============ 7. disegno (chiamato dal ciclo della pagina) ============ */
var ultimaFirma = '', dopoFermo = 0;
var vista = { w: 0, h: 0 };
function firma() {
  var e = C.matrixWorld.elements, p = C.projectionMatrix.elements, s = '';
  for (var i = 0; i < 16; i++) s += e[i].toFixed(4) + ',';
  return s + p[0].toFixed(4) + p[5].toFixed(4) + (G.sc && G.sc.visible ? 1 : 0) + P.w + 'x' + P.h;
}
function jitterLuci(on) {
  AREA.forEach(function (a) {
    a.l.position.copy(a.base);
    if (!on) return;
    if (a.len) a.l.position.addScaledVector(a.ax, (Math.random() - 0.5) * a.len);
    if (a.rad) { var t = Math.random() * 6.283, r = Math.sqrt(Math.random()) * a.rad; a.l.position.x += Math.cos(t) * r; a.l.position.z += Math.sin(t) * r; }
  });
}
function ripristinaJitter() { jitterLuci(false); }
var HAL = [];   /* sequenza di Halton (2,3) per il jitter sub-pixel */
(function () { function h(i, b) { var f = 1, r = 0; while (i > 0) { f /= b; r += f * (i % b); i = Math.floor(i / b); } return r; } for (var i = 1; i <= 256; i++) HAL.push([h(i, 2) - 0.5, h(i, 3) - 0.5]); })();

var ombreN = 0, ombreT = 0, scPrima = null;
function ombreDaRifare(n) { ombreN = Math.max(ombreN, n || 1); }
function gestisciOmbre(t) {
  var sc = !!(G.sc && G.sc.visible);
  if (sc !== scPrima) { scPrima = sc; ombreDaRifare(2); }
  if (UNI) { if (ombreN > 0) { R.shadowMap.needsUpdate = true; ombreN--; } return; }   /* UNIVERSALE: ombre statiche (solo quando cambia qualcosa) */
  if (sc) ombreN = Math.max(ombreN, 1);          /* con STORE//CRAFT acceso ci sono oggetti animati */
  if (t - ombreT > 3000) { ombreT = t; ombreDaRifare(1); }  /* sicurezza: ogni 3 s */
  if (ombreN > 0) { R.shadowMap.needsUpdate = true; ombreN--; }
}
function disegna(t) {
  var cfg = CFG[stato.livello];
  gestisciOmbre(t || performance.now());
  if (!cfg || !P) { return false; }
  adattaPost();
  C.updateMatrixWorld();
  if (!cfg.accum || (G.sc && G.sc.visible) || !ACC) {
    if (P.rit) P.rit.uniforms.seme.value = 0;
    P.composer.renderToScreen = true;
    P.composer.render();
    return true;
  }
  /* modo FOTO: accumulo progressivo quando la vista e' ferma */
  var f = firma();
  if (f !== ultimaFirma) { ultimaFirma = f; stato.n = 0; dopoFermo = 0; }
  else dopoFermo++;
  if (stato.n >= cfg.accum) { stato.fermo = true; return true; }     /* immagine finita: non ridisegno (resta quella) */
  var fermo = dopoFermo >= 2;
  if (!fermo) { if (stato.n > 0) R.shadowMap.needsUpdate = true; jitterLuci(false); P.composer.renderToScreen = true; P.rit.uniforms.seme.value = 0; P.composer.render(); stato.n = 0; aggiornaContatore(); return true; }
  accumula(cfg, P.w, P.h);
  copiaSuSchermo();
  aggiornaContatore();
  return true;
}
function accumula(cfg, w, h) {
  var j = HAL[stato.n % HAL.length];
  C.setViewOffset(w, h, j[0], j[1], w, h);
  jitterLuci(true);
  R.shadowMap.needsUpdate = true;   /* luci spostate: ombre d'area */
  P.rit.uniforms.seme.value = Math.random() * 100;
  P.composer.renderToScreen = false;
  P.composer.render();
  C.clearViewOffset();
  jitterLuci(false);
  var nuovo = P.composer.readBuffer.texture;
  stato.n++;
  var q = ACC.qa.material.uniforms;
  q.tNuovo.value = nuovo; q.tVecchio.value = ACC.a.texture; q.w.value = 1 / stato.n;
  R.setRenderTarget(ACC.b); ACC.qa.render(R);
  var s = ACC.a; ACC.a = ACC.b; ACC.b = s;
}
function copiaSuSchermo() {
  ACC.qc.material.uniforms.tDiffuse.value = ACC.a.texture;
  R.setRenderTarget(null); ACC.qc.render(R);
}

/* ============ 8. Scatta foto (PNG grande) ============ */
function scatta(W, H, passi) {
  W = W || 3840; H = H || 2160; passi = passi || 48;
  var prima = stato.livello;
  var max = Math.min(R.capabilities.maxTextureSize, 8192);
  if (W > max || H > max) { var k = max / Math.max(W, H); W = Math.floor(W * k); H = Math.floor(H * k); }
  var vecchioPR = R.getPixelRatio(), vs = new T.Vector2(); R.getSize(vs);
  var asp = C.aspect;
  try {
    if (prima !== 'foto') applica('foto', false);
    R.setPixelRatio(1); R.setSize(W, H, false);
    C.aspect = W / H; C.updateProjectionMatrix(); C.updateMatrixWorld();
    adattaPost();
    stato.n = 0;
    for (var i = 0; i < passi; i++) accumula(CFG.foto, P.w, P.h);
    copiaSuSchermo();
    var dataUrl = R.domElement.toDataURL('image/png');
    var a = document.createElement('a');
    var d = new Date(), z = function (n) { return (n < 10 ? '0' : '') + n; };
    a.download = 'ottica-macri-3d-' + d.getFullYear() + z(d.getMonth() + 1) + z(d.getDate()) + '-' + z(d.getHours()) + z(d.getMinutes()) + z(d.getSeconds()) + '.png';
    a.href = dataUrl; document.body.appendChild(a); a.click(); setTimeout(function () { a.remove(); }, 1000);
    stato.ultimaFoto = { w: P.w, h: P.h, kb: Math.round(dataUrl.length * 0.75 / 1024) };
  } catch (e) { console.warn('resa: scatta', e); stato.ultimaFoto = { errore: String(e) }; }
  R.setPixelRatio(vecchioPR); R.setSize(vs.x, vs.y, false);
  C.aspect = asp; C.updateProjectionMatrix();
  if (prima !== 'foto') applica(prima, false); else { adattaPost(); stato.n = 0; ultimaFirma = ''; }
  return stato.ultimaFoto;
}

/* ============ 9. pannello ============ */
var pan = null;
function creaPannello() {
  var st = document.createElement('style');
  st.textContent = '#resaPan{position:fixed;right:14px;top:50%;transform:translateY(-50%);z-index:10;display:flex;flex-direction:column;gap:5px;padding:9px 8px 10px;width:118px;--cut:10px}' +
    '#resaPan .tt{font:600 11px var(--title,sans-serif);letter-spacing:1.6px;text-transform:uppercase;color:var(--dim,#6b5c4c);text-align:center}' +
    '#resaPan .n3-btn{min-height:32px;padding:4px 8px;font-size:13px;justify-content:center;letter-spacing:.6px}' +
    '#resaPan .info{font:500 10.5px var(--mono,monospace);color:var(--mut,#5e4f41);text-align:center;min-height:14px;line-height:1.3}' +
    '#resaPan .scatta{margin-top:4px}' +
    '@media (max-width:860px){#resaPan{top:auto;bottom:calc(42vh + 14px);right:6px;width:96px;padding:6px}#resaPan .n3-btn{min-height:30px;font-size:12px}}';
  document.head.appendChild(st);
  pan = document.createElement('div');
  pan.id = 'resaPan'; pan.className = 'n3-glass'; pan.setAttribute('aria-label', 'Qualità della grafica');
  var h = '<div class="tt">Qualità</div>';
  LIVELLI.slice().reverse().forEach(function (l) { h += '<button class="n3-btn" data-liv="' + l + '" title="Grafica ' + NOMI[l] + '">' + NOMI[l] + '</button>'; });
  if (false) h += '<button class="n3-btn foto scatta" id="resaScatta" title="Salva un\'immagine 3840×2160 di questa vista">📷 Scatta foto</button>';
  h += '<div class="info" id="resaInfo"></div>';
  pan.innerHTML = h;
  document.body.appendChild(pan);
  pan.addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.dataset.liv) { applica(b.dataset.liv, true); fpsMis.stop = true; }
    else if (b.id === 'resaScatta') {
      b.disabled = true; info('preparo la foto…');
      setTimeout(function () { var r = scatta(); b.disabled = false; info(r && r.w ? 'salvata ' + r.w + '×' + r.h : 'non riuscita'); }, 60);
    }
  });
}
function info(t) { var e = document.getElementById('resaInfo'); if (e) e.textContent = t; }
function aggiornaPannello() {
  if (!pan) return;
  pan.querySelectorAll('[data-liv]').forEach(function (b) { b.classList.toggle('on', b.dataset.liv === stato.livello); });
  info((stato.auto ? 'auto · ' : '') + NOMI[stato.livello]);
}
var ultimoInfo = 0;
function aggiornaContatore() {
  var now = performance.now(); if (now - ultimoInfo < 250) return; ultimoInfo = now;
  var c = CFG.foto.accum;
  info(stato.n === 0 ? 'Foto · muoviti pure' : (stato.n >= c ? 'Foto · nitida ✓' : 'Foto · ' + Math.round(stato.n / c * 100) + '%'));
}

/* ============ 10. scelta automatica ============ */
function gpuInfo() {
  try { var gl = R.getContext(), e = gl.getExtension('WEBGL_debug_renderer_info'); return e ? String(gl.getParameter(e.UNMASKED_RENDERER_WEBGL)) : ''; } catch (e) { return ''; }
}
var GPU = gpuInfo();
function livelloIniziale() {
  var g = GPU.toLowerCase();
  var mobile = /android|iphone|ipad|mobile/i.test(navigator.userAgent) || (navigator.maxTouchPoints > 1 && Math.min(screen.width, screen.height) < 820);
  if (/swiftshader|llvmpipe|software|basic render/.test(g)) return 'leggera';
  if (UNI) {   /* UNIVERSALE: Media dove la grafica regge (telefoni recenti, PC con grafica decente), se no Leggera; poi decidono gli fps */
    if (mobile || TEL) return /adreno \(tm\) [3-5]\d\d|adreno \(tm\) 6[0-1]\d|mali-[t4]|mali-g[3-5]\d\b|powervr|sgx|videocore/.test(g) ? 'leggera' : 'media';   /* telefoni vecchi -> Leggera */
    if (/(hd|uhd) graphics [2-6]\d{2}\b|hd graphics [2-5]\d{3}|gma|mali|adreno|powervr/.test(g)) return 'leggera';
    return 'media';
  }
  /* VERSIONI 5/11: Mac (Safari «Apple GPU», Chrome «Apple M1…»): Alta, mai Foto in automatico (in movimento Foto pesa troppo sul MacBook) */
  if (/apple/.test(g) || (/mac/i.test(navigator.platform || '') && !mobile)) return 'alta';
  if (mobile) return /apple gpu|adreno \(tm\) [67]\d\d/.test(g) ? 'media' : 'leggera';
  if (/nvidia|geforce|rtx|radeon rx|radeon pro|apple m\d (pro|max|ultra)/.test(g)) return 'foto';
  if (/apple m\d|iris xe|arc|radeon/.test(g)) return 'alta';
  if (/intel/.test(g)) return 'media';
  return 'alta';
}
var fpsMis = { stop: false };
function misuraFps(ms, cb) {
  var n = 0, t0 = performance.now();
  (function f() { if (fpsMis.stop) return; n++; var d = performance.now() - t0; if (d < ms) requestAnimationFrame(f); else cb(n * 1000 / d); })();
}
function autoRegola(tentativi) {
  if (!stato.auto || fpsMis.stop || tentativi > 3) return;
  setTimeout(function () {
    misuraFps(2500, function (fps) {
      stato.fps = Math.round(fps);
      var i = LIVELLI.indexOf(stato.livello);
      /* in Foto da fermi non si ridisegna: conta poco. Si scende se < 28 fps */
      if (fps < 28 && i > 0) { applica(LIVELLI[i - 1], false); autoRegola(tentativi + 1); }
      else aggiornaPannello();
    });
  }, 900);
}

/* ============ avvio ============ */
var q = (location.search.match(/[?&]qualita=([a-z]+)/) || [])[1];
var salvato = ls(LS);
if (q && !CFG[q]) q = UNI ? 'media' : q;   /* UNIVERSALE: ?qualita=foto|alta -> Media */
aggiornaMateriali();
creaPannello();
if (q && CFG[q]) { stato.auto = false; applica(q, false); }
else if (salvato && CFG[salvato]) { stato.auto = false; applica(salvato, false); }
else { applica(livelloIniziale(), false); if (RINVIA) autoDaFare = true; else autoRegola(0); }
/* oggetti aggiunti dopo (allestimento, immagini decodificate): ricontrollo materiali e riflessi */
var giri = 0, tick = null;
function avviaTick() { if (tick) return; tick = setInterval(function () {
  giri++;
  var n = aggiornaMateriali();
  if (n) { ombreDaRifare(3); var cfg = CFG[stato.livello]; applicaVetri(cfg); applicaFoto(cfg); applicaLite(cfg); stato.n = 0; ultimaFirma = ''; }
  if (!UNI && (giri === 2 || giri === 6 || n > 20)) { catturaEnv(CFG[stato.livello].envRes); stato.n = 0; ultimaFirma = ''; }
  if (giri > 12) clearInterval(tick);
}, 700); }
if (!RINVIA) avviaTick();
/* AVVIO 5/11: chiamata da avvio.js quando gli shader sono pronti */
var autoInAttesa = false;
function avviaAuto() { if (autoInAttesa) { autoInAttesa = false; autoRegola(0); } }
function dopoAvvio() {
  if (!RINVIA) return;
  RINVIA = false;
  aggiornaMateriali();
  if (envDaFare) { catturaEnv(envDaFare); envDaFare = 0; stato.n = 0; ultimaFirma = ''; }
  /* UNIVERSALE: la misura degli fps parte dopo la cattura dei riflessi (profilo.js chiama avviaAuto), se no misura il blocco */
  if (autoDaFare) { autoDaFare = false; if (UNI && window.N3D_P && window.N3D_P.attendiRiflessi) autoInAttesa = true; else autoRegola(0); }
  avviaTick();
}

window.__RESA = {
  disegna: disegna, applica: function (l) { applica(l, true); }, scatta: scatta, catturaEnv: catturaEnv,
  stato: function () { return { livello: stato.livello, auto: stato.auto, fps: stato.fps, accumulati: stato.n, gpu: GPU, vetri: VETRI.length, sorgenti: SORGENTI.length, foto: FOTO.length, luciNuove: NUOVE.children.filter(function (l) { return l.isLight; }).length, ombre: CANDIDATE.filter(function (l) { return l.castShadow; }).length, post: !!P }; },
  cfg: CFG, P: function () { return P; }, dopoAvvio: dopoAvvio, avviaAuto: avviaAuto, profilo: UNI ? 'universale' : 'alta', livelli: LIVELLI
};
if (N) { N.resa = window.__RESA; }
})();
