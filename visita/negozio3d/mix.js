/* MIX REALTA' - negozio 3D di Ottica Macri (5/11/2026, agente MIX REALTA')
   Un tasto rosso stile CRT mescola FOTO VERE, FILM (fotogrammi del giro video) e RENDER 3D in un'unica immagine.

   Come funziona (image-based rendering, tipo fotogrammetria, tutto nel browser, solo file://):
   1. Ogni foto vera e ogni fotogramma del giro e' un PROIETTORE: una camera calibrata (posizione, direzione, rollio, fov)
      che "spara" la foto sulla geometria 3D del negozio (projective texture mapping).
   2. Per ogni pixel del render si ricostruisce il punto 3D (dalla profondita') e lo si guarda da ogni proiettore:
      se il proiettore vedeva PROPRIO quella superficie (profondita' uguale, mappa di profondita' del proiettore fatta
      col negozio com'e' oggi) prende il colore della foto. Peso = angolo tra lo sguardo attuale e quello della foto
      (unstructured lumigraph), centralita' nell'inquadratura, angolo di incidenza, dissolvenza temporale.
      Dal punto della foto si vede la foto ESATTA; muovendosi la foto resta incollata alle superfici, piu' foto si
      miscelano, e il render riempie dove nessuna foto arriva. Gli oggetti NOSTRI (DOPO) non combaciano con le
      profondita' delle foto -> restano render, ma con lo stesso trattamento.
   3. TRASFERIMENTO DI LUCE LOCALE: a bassa risoluzione si confronta foto e render dove ci sono entrambi e il rapporto
      sfocato (guadagno locale) si applica al render vicino: il render "prende" la luce e il colore della foto accanto,
      la cucitura sparisce. Lontano dalle foto vale un guadagno globale misurato all'accensione.
   4. LOOK "FILM" unico per tutto: tone mapping, color grading caldo, morbidezza ottica, alone rosso (halation),
      leggera aberrazione cromatica, vignettatura, grana animata, micro-movimento di macchina a mano.
   5. Transizioni: muovendosi tra le viste i pesi cambiano in modo continuo (morph); arrivati su un punto foto la camera
      si aggancia alla posa calibrata. «Giro video»: la camera ripercorre il giro e i fotogrammi si proiettano in sequenza.
   Tasto ROSSO CRT nella barra comandi: accensione/spegnimento con effetto tubo catodico.
   Dati: mix-foto.js (5 foto ferme + calibrazione) e mix-giro.js (41 fotogrammi), caricati solo alla prima accensione.
   Si aggancia a window.__N3D: avvolge renderer.render (nessuna modifica al ciclo della pagina).
   Dispositivi lenti: modo LEGGERO automatico (2 proiettori, risoluzione 70%, niente MSAA).
*/
(function () {
'use strict';
var N = window.__N3D, T = window.THREE;
if (!N || !T || !N.renderer) { console.warn('mix: manca __N3D'); return; }
var renderer = N.renderer, scene = N.scene, camera = N.camera, S = N.S, G = N.G;
var CAM = N.CAM || [];
var KMAX = 6, DMAX = 40;
/* VERSIONI 5/11: versione UNIVERSALE = MIX leggero fisso (2 proiettori, risoluzione 60-70%, meno memoria) */
var PU = window.N3D_P || {};
var BASE = (function () { var s = document.currentScript && document.currentScript.src; return s ? s.replace(/mix\.js(\?.*)?$/, '') : 'negozio3d/'; })();
var origRender = renderer.render.bind(renderer);

/* ============================== stato ============================== */
var M = {
  stato: 'spento',        /* spento | carico | accensione | acceso | spegnimento */
  t0: 0, forza: 1, lite: !!PU.uni, liteAuto: !PU.uni, mano: true, K: KMAX, scala: 1,
  pj: [], dati: false, giroDati: false, gain: [1, 1, 1], gainPronto: false,
  snap: 0, snapPj: null, giro: null, fps: 60, fpsN: 0, fpsT: 0, lento: 0, inPipe: false, err: null
};

/* ============================== util ============================== */
var D2R = Math.PI / 180;
function clamp(v, a, b) { return v < a ? a : v > b ? b : v; }
function ease(k) { return k < .5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2; }
function caricaScript(src, cb) { var s = document.createElement('script'); s.src = src; s.onload = function () { cb(null); }; s.onerror = function () { cb(new Error('manca ' + src)); }; document.head.appendChild(s); }
function vistaReale(fn) { /* il negozio com'e' OGGI (le foto sono di oggi): niente DOPO, vetrine PRIMA, soffitto e fuori visibili */
  var V = window.__VETRINE || {}, sv = [];
  function set(o, v) { if (o) { sv.push([o, o.visible]); o.visible = v; } }
  set(G.sc, false); set(V.DOPO, false); set(V.PRIMA, true); set(G.soff, true); set(G.fuori, true);
  try { return fn(); } finally { for (var i = sv.length - 1; i >= 0; i--) sv[i][0].visible = sv[i][1]; }
}

/* ============================== materiali dei passaggi ============================== */
var VS_FS = 'varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position.xy,0.,1.);}';
var GLSL_TONE = [
  'uniform float uExpo;',
  'vec3 mxRRT(vec3 v){vec3 a=v*(v+0.0245786)-0.000090537;vec3 b=v*(0.983729*v+0.4329510)+0.238081;return a/b;}',
  'vec3 mxAces(vec3 c){const mat3 I=mat3(vec3(0.59719,0.07600,0.02840),vec3(0.35458,0.90834,0.13383),vec3(0.04823,0.01566,0.83777));',
  ' const mat3 O=mat3(vec3(1.60475,-0.10208,-0.00327),vec3(-0.53108,1.10813,-0.07276),vec3(-0.07367,-0.00605,1.07602));',
  ' c*=uExpo/0.6;c=I*c;c=mxRRT(c);c=O*c;return clamp(c,0.,1.);}',
  'vec3 mxSrgb(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.)),vec3(1./2.4))-.055,step(vec3(.0031308),c));}',
  'uniform float uTM;',
  'vec3 mxNeutral(vec3 c){c*=uExpo;float x=min(c.r,min(c.g,c.b));float off=x<.08?x-6.25*x*x:.04;c-=off;float pk=max(c.r,max(c.g,c.b));',
  ' if(pk<.76)return c;float d=.24;float np=1.-d*d/(pk+d-.76);c*=np/pk;float g=1.-1./(.15*(pk-np)+1.);return mix(c,vec3(np),g);}',
  'vec3 mxSchermo(vec3 lin){vec3 t=uTM<.5?mxAces(lin):uTM<1.5?mxNeutral(lin):clamp(lin*uExpo,0.,1.);return mxSrgb(clamp(t,0.,1.));}'
].join('\n');

/* profondita' lineare impacchettata in RGBA8 (funziona ovunque, anche Safari) */
var matProf = new T.ShaderMaterial({
  side: T.DoubleSide,
  vertexShader: '#include <common>\n#include <batching_pars_vertex>\nvarying float vZ;\nvoid main(){\n#include <batching_vertex>\n#include <begin_vertex>\n#include <project_vertex>\nvZ=-mvPosition.z;}',
  fragmentShader: '#include <packing>\nvarying float vZ;\nvoid main(){gl_FragColor=packDepthToRGBA(clamp(vZ/' + DMAX.toFixed(1) + ',0.,.9999));}'
});

function pjUniforms() {
  var u = { tColor: { value: null }, tDepth: { value: null }, uInvProj: { value: new T.Matrix4() }, uCamWorld: { value: new T.Matrix4() },
    uCamPos: { value: new T.Vector3() }, uAng: { value: new T.Vector2(.45, .9) }, uPV: { value: [] }, uPP: { value: [] }, uPF: { value: [] }, uPB: { value: [] }, uDpx: { value: [] } };
  for (var i = 0; i < KMAX; i++) { u['tPh' + i] = { value: null }; u['tPd' + i] = { value: null }; u.uPV.value.push(new T.Matrix4()); u.uPP.value.push(new T.Vector3()); u.uPF.value.push(0); u.uPB.value.push(0); u.uDpx.value.push(new T.Vector2()); }
  return u;
}
function fsProj() {
  var s = ['#include <packing>', 'varying vec2 vUv;', 'uniform sampler2D tColor,tDepth;', 'uniform mat4 uInvProj,uCamWorld;uniform vec3 uCamPos;uniform vec2 uAng;',
    'uniform mat4 uPV[' + KMAX + '];uniform vec3 uPP[' + KMAX + '];uniform float uPF[' + KMAX + '],uPB[' + KMAX + '];uniform vec2 uDpx[' + KMAX + '];'];
  for (var i = 0; i < KMAX; i++) s.push('uniform sampler2D tPh' + i + ',tPd' + i + ';');
  s.push(
    'float dprof(sampler2D pd,vec2 uv){return unpackRGBAToDepth(texture2D(pd,uv))*' + DMAX.toFixed(1) + ';}',
    'void proj(sampler2D ph,sampler2D pd,mat4 PV,vec3 pp,float fade,float boost,vec2 dpx,vec3 W,vec3 Nn,vec3 Vd,inout vec4 acc,inout float cInv){',
    ' if(fade<.002)return;vec4 c=PV*vec4(W,1.);if(c.w<.03)return;',
    ' vec2 uv=c.xy/c.w*.5+.5;vec2 e2=min(uv,1.-uv);float m=min(e2.x,e2.y);if(m<=0.)return;',
    ' float edge=smoothstep(0.,.07,m);',
    ' float centr=1.-2.*max(abs(uv.x-.5),abs(uv.y-.5)*.55);',
    ' float tol=.03+.03*c.w;float e0=abs(c.w-dprof(pd,uv));',
    ' e0=min(e0,min(min(abs(c.w-dprof(pd,uv+vec2(dpx.x,0.))),abs(c.w-dprof(pd,uv-vec2(dpx.x,0.)))),min(abs(c.w-dprof(pd,uv+vec2(0.,dpx.y))),abs(c.w-dprof(pd,uv-vec2(0.,dpx.y))))));',
    ' float vis=1.-smoothstep(tol*.45,tol,e0);',
    ' vec3 Pd=normalize(pp-W);float gr=mix(.2,1.,smoothstep(.06,.3,abs(dot(Nn,Pd))));',
    ' float a=dot(Vd,Pd);float ex=smoothstep(.9990,.99995,a);vis=max(vis,ex);gr=max(gr,ex);float wA=exp((a-1.)*90.);float cA=smoothstep(uAng.x,uAng.y,a);',
    ' float b=edge*vis*gr*fade;if(b<=.0005)return;',
    ' vec3 col=texture2D(ph,uv).rgb;float w=b*(wA+1e-5)*(centr*centr+.02)*(1.+boost*60.);',
    ' acc+=vec4(col*w,w);cInv*=1.-b*cA;}',
    'void main(){',
    ' float d=texture2D(tDepth,vUv).x;if(d>=.99999){gl_FragColor=vec4(0.);return;}',
    ' vec4 v=uInvProj*vec4(vUv*2.-1.,d*2.-1.,1.);v/=v.w;vec3 W=(uCamWorld*v).xyz;',
    ' vec3 Nn=normalize(cross(dFdx(W),dFdy(W)));vec3 Vd=normalize(uCamPos-W);',
    ' vec4 acc=vec4(0.);float cInv=1.;');
  for (i = 0; i < KMAX; i++) s.push(' proj(tPh' + i + ',tPd' + i + ',uPV[' + i + '],uPP[' + i + '],uPF[' + i + '],uPB[' + i + '],uDpx[' + i + '],W,Nn,Vd,acc,cInv);');
  s.push(' vec3 ph=acc.w>1e-5?acc.rgb/acc.w:vec3(0.);gl_FragColor=vec4(ph,1.-cInv);}');
  return s.join('\n');
}
var matProj = new T.ShaderMaterial({ uniforms: pjUniforms(), vertexShader: VS_FS, fragmentShader: fsProj(), depthTest: false, depthWrite: false });

/* riduzione a 1/8: L1 = (foto*cop, cop) ; L2 = (render*cop, luce forte per l'alone) */
var matDown = new T.ShaderMaterial({ uniforms: { uTM: { value: 0 }, tColor: { value: null }, tProj: { value: null }, uPx: { value: new T.Vector2() }, uMode: { value: 0 }, uExpo: { value: 1 } },
  vertexShader: VS_FS, depthTest: false, depthWrite: false,
  fragmentShader: GLSL_TONE + '\nvarying vec2 vUv;uniform sampler2D tColor,tProj;uniform vec2 uPx;uniform float uMode;\n' +
    'void tap(vec2 uv,inout vec4 a,inout vec4 b){vec4 p=texture2D(tProj,uv);vec3 r=mxSchermo(texture2D(tColor,uv).rgb);a+=vec4(p.rgb*p.a,p.a);vec3 m=mix(r,p.rgb,p.a);float l=dot(m,vec3(.2126,.7152,.0722));b+=vec4(r*p.a,max(l-.72,0.)*3.);}\n' +
    'void main(){vec4 a=vec4(0.),b=vec4(0.);vec2 o=uPx*.25;tap(vUv+vec2(-o.x,-o.y),a,b);tap(vUv+vec2(o.x,-o.y),a,b);tap(vUv+vec2(-o.x,o.y),a,b);tap(vUv+vec2(o.x,o.y),a,b);' +
    'vec3 r0=mxSchermo(texture2D(tColor,vUv).rgb);gl_FragColor=uMode<.5?a*.25:uMode<1.5?b*.25:vec4(r0,1.);}' });
var matBlur = new T.ShaderMaterial({ uniforms: { tIn: { value: null }, uDir: { value: new T.Vector2() } }, vertexShader: VS_FS, depthTest: false, depthWrite: false,
  fragmentShader: 'varying vec2 vUv;uniform sampler2D tIn;uniform vec2 uDir;void main(){vec4 s=texture2D(tIn,vUv)*.2270270;' +
    'vec2 o1=uDir*1.3846154,o2=uDir*3.2307692;s+=(texture2D(tIn,vUv+o1)+texture2D(tIn,vUv-o1))*.3162162;s+=(texture2D(tIn,vUv+o2)+texture2D(tIn,vUv-o2))*.0702703;gl_FragColor=s;}' });

/* miscela: render (in "schermo") col guadagno locale + foto proiettate */
var matMix = new T.ShaderMaterial({ uniforms: { uTM: { value: 0 }, tColor: { value: null }, tProj: { value: null }, tL1: { value: null }, tL2: { value: null }, tL3: { value: null }, uPx: { value: new T.Vector2() },
  uGain: { value: new T.Vector3(1, 1, 1) }, uForza: { value: 1 }, uExpo: { value: 1 }, uLocale: { value: 1 } }, vertexShader: VS_FS, depthTest: false, depthWrite: false,
  fragmentShader: GLSL_TONE + '\nvarying vec2 vUv;uniform sampler2D tColor,tProj,tL1,tL2,tL3;uniform vec2 uPx;uniform vec3 uGain;uniform float uForza,uLocale;\n' +
    'void main(){vec3 c=texture2D(tColor,vUv).rgb*.4;vec2 o=uPx*.8;' +
    'c+=(texture2D(tColor,vUv+vec2(o.x,o.y)).rgb+texture2D(tColor,vUv+vec2(-o.x,o.y)).rgb+texture2D(tColor,vUv+vec2(o.x,-o.y)).rgb+texture2D(tColor,vUv+vec2(-o.x,-o.y)).rgb)*.15;' +
    'vec3 R=mxSchermo(c);vec4 P=texture2D(tProj,vUv);float rad=length((vUv-.5)*vec2(1.6,1.));R=mix(R,texture2D(tL3,vUv).rgb,(1.-P.a)*(.18+.5*smoothstep(.3,.95,rad))*uForza);vec4 l1=texture2D(tL1,vUv),l2=texture2D(tL2,vUv);' +
    'vec3 gl=clamp((l1.rgb+.006)/(l2.rgb+.006),vec3(.5),vec3(1.9));float s=smoothstep(.01,.22,l1.a)*uLocale;' +
    'vec3 g=mix(uGain,gl,s*uForza);g=mix(vec3(1.),g,uForza);vec3 Rg=clamp(R*g,0.,1.);' +
    'float cov=clamp(P.a*1.08,0.,1.)*uForza;gl_FragColor=vec4(mix(Rg,P.rgb,cov),1.);}' });

/* pellicola + accensione CRT, verso lo schermo */
var matFilm = new T.ShaderMaterial({ uniforms: { uTM: { value: 0 }, tMix: { value: null }, tL2: { value: null }, tColor: { value: null }, uRes: { value: new T.Vector2(1, 1) }, uTime: { value: 0 },
  uCrt: { value: 1 }, uCrtModo: { value: 0 }, uExpo: { value: 1 }, uForza: { value: 1 } }, vertexShader: VS_FS, depthTest: false, depthWrite: false,
  fragmentShader: GLSL_TONE + '\nvarying vec2 vUv;uniform sampler2D tMix,tL2,tColor;uniform vec2 uRes;uniform float uTime,uCrt,uCrtModo,uForza;\n' +
    'float h21(vec2 p){p=fract(p*vec2(233.34,851.73));p+=dot(p,p+23.45);return fract(p.x*p.y);}\n' +
    'float vn(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.-2.*f);return mix(mix(h21(i),h21(i+vec2(1,0)),f.x),mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),f.x),f.y);}\n' +
    'vec3 film(vec2 uv){vec2 d=uv-.5;float ca=.0022*uForza;vec3 c;c.r=texture2D(tMix,uv-d*ca).r;c.g=texture2D(tMix,uv).g;c.b=texture2D(tMix,uv+d*ca*1.4).b;' +
    ' float hl=texture2D(tL2,uv).a;c+=vec3(1.,.45,.25)*hl*.55*uForza;' +   /* alone (halation) caldo */
    ' vec3 g=c*vec3(1.035,1.,.93)+vec3(.018,.010,.0)*(1.-c);g=mix(g,g*g*(3.-2.*g),.22);float L=dot(g,vec3(.2126,.7152,.0722));g=mix(vec3(L),g,.9);' +
    ' c=mix(c,g,uForza);' +
    ' float vg=smoothstep(.98,.28,length(d*vec2(uRes.x/uRes.y,1.)*.78));c*=mix(1.,.62+.38*vg,uForza);' +
    ' vec2 gp=uv*uRes/1.45+fract(uTime*vec2(17.13,29.71))*91.;float n=vn(gp)*.6+h21(uv*uRes+fract(uTime*7.31)*313.)*.4-.5;' +
    ' L=dot(c,vec3(.333));c+=n*.06*uForza*(1.-.55*L)*vec3(1.,.97,1.04);return c;}\n' +
    'void main(){vec2 uv=vUv;vec3 col;float p=uCrt;' +
    ' if(p>=1.){col=film(uv);}' +
    ' else if(uCrtModo<.5){' +   /* ACCENSIONE: riga bianca -> apertura verticale -> assestamento */
    '  float y=uv.y-.5,x=uv.x-.5;' +
    '  if(p<.16){float k=p/.16;float on=step(abs(x),k*.5)*smoothstep(.006,.0,abs(y));col=vec3(1.,.96,.9)*on*1.6+vec3(1.,.2,.1)*smoothstep(.04,.0,abs(y))*k*.25;}' +
    '  else{float k=ease((p-.16)/.34);k=clamp(k,0.,1.);float h=max(k*.5,.004);' +
    '   if(abs(y)>h){col=vec3(0.);}else{vec2 su=vec2(uv.x,.5+y*(.5/h));vec3 c=film(su);float fl=1.+1.6*(1.-k)+.08*sin(uTime*60.);c*=fl;' +
    '    float s=clamp((p-.5)/.5,0.,1.);float sc=.5+.5*sin(uv.y*uRes.y*3.14159*.5);c*=mix(.72+.28*sc,1.,s);' +
    '    vec3 mask=vec3(1.+.18*sin(uv.x*uRes.x*2.094),1.+.18*sin(uv.x*uRes.x*2.094+2.094),1.+.18*sin(uv.x*uRes.x*2.094+4.189));c*=mix(mask,vec3(1.),s);' +
    '    col=mix(c+vec3(.25,.05,.03)*(1.-s),c,s);}}}' +
    ' else{' +     /* SPEGNIMENTO: schiacciata in una riga, poi un punto, poi torna il 3D */
    '  float y=uv.y-.5,x=uv.x-.5;vec3 base=mxSchermo(texture2D(tColor,uv).rgb);' +
    '  if(p<.42){float k=1.-ease(p/.42);float h=max(k*.5,.003);if(abs(y)>h)col=vec3(0.);else{col=film(vec2(uv.x,.5+y*(.5/h)))*(1.+2.*(1.-k));}}' +
    '  else if(p<.7){float k=1.-(p-.42)/.28;col=vec3(1.,.95,.9)*step(abs(x),max(k*.5,.002))*smoothstep(.005,.0,abs(y))*1.5;}' +
    '  else{float k=(p-.7)/.3;float dot_=smoothstep(.012,.0,length(vec2(x*uRes.x/uRes.y,y)))*(1.-k*1.5);col=vec3(1.,.9,.85)*max(dot_,0.)+base*smoothstep(.35,1.,k);}' +
    ' }' +
    ' gl_FragColor=vec4(col,1.);}' });
matFilm.fragmentShader = matFilm.fragmentShader.replace('void main(){vec2 uv=vUv', 'float ease(float k){return k<.5?4.*k*k*k:1.-pow(-2.*k+2.,3.)/2.;}\nvoid main(){vec2 uv=vUv');

var matDisp = new T.ShaderMaterial({ uniforms: { uTM: { value: 0 }, tColor: { value: null }, uExpo: { value: 1 } }, vertexShader: VS_FS, depthTest: false, depthWrite: false,
  fragmentShader: GLSL_TONE + '\nvarying vec2 vUv;uniform sampler2D tColor;void main(){gl_FragColor=vec4(mxSchermo(texture2D(tColor,vUv).rgb),1.);}' });

var fsScene = new T.Scene(), fsCam = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
var fsQuad = new T.Mesh(new T.PlaneGeometry(2, 2), matDisp); fsQuad.frustumCulled = false; fsScene.add(fsQuad);
function fs(mat, rt) { fsQuad.material = mat; renderer.setRenderTarget(rt); origRender(fsScene, fsCam); }

/* ============================== render target ============================== */
var floatOK = renderer.capabilities.isWebGL2 && (renderer.extensions.has('EXT_color_buffer_float') || renderer.extensions.has('EXT_color_buffer_half_float'));
var RT = null, RTW = 0, RTH = 0, RTLITE = null;
function nuovoRT(w, h, o) { o = o || {}; var r = new T.WebGLRenderTarget(w, h, Object.assign({ depthBuffer: false, minFilter: T.LinearFilter, magFilter: T.LinearFilter, generateMipmaps: false }, o)); return r; }
function preparaRT() {
  var v = renderer.getDrawingBufferSize(new T.Vector2()), sc = M.lite ? (PU.telefono ? .6 : .7) : 1;
  var w = Math.max(16, Math.round(v.x * sc)), h = Math.max(16, Math.round(v.y * sc));
  if (RT && RTW === w && RTH === h && RTLITE === M.lite) return;
  if (RT) Object.keys(RT).forEach(function (k) { RT[k].dispose(); if (RT[k].depthTexture) RT[k].depthTexture.dispose(); });
  RTW = w; RTH = h; RTLITE = M.lite;
  var lw = Math.max(8, Math.round(w / 8)), lh = Math.max(8, Math.round(h / 8));
  var dt = new T.DepthTexture(w, h); dt.type = T.UnsignedIntType;
  RT = {
    a: nuovoRT(w, h, { type: floatOK ? T.HalfFloatType : T.UnsignedByteType, depthBuffer: true, depthTexture: dt, samples: (M.lite || !renderer.capabilities.isWebGL2) ? 0 : 4 }),
    p: nuovoRT(w, h), m: nuovoRT(w, h),
    l1: nuovoRT(lw, lh, { type: floatOK ? T.HalfFloatType : T.UnsignedByteType }), l1b: nuovoRT(lw, lh, { type: floatOK ? T.HalfFloatType : T.UnsignedByteType }),
    l2: nuovoRT(lw, lh, { type: floatOK ? T.HalfFloatType : T.UnsignedByteType }), l2b: nuovoRT(lw, lh, { type: floatOK ? T.HalfFloatType : T.UnsignedByteType }),
    l3: nuovoRT(lw * 2, lh * 2), l3b: nuovoRT(lw * 2, lh * 2)
  };
}

/* ============================== proiettori ============================== */
var TRASP = null;   /* oggetti da nascondere nelle mappe di profondita' (vetri, plexi, proxy invisibili) */
function trasparente(m) { return !m || m.visible === false || (m.transparent && (m.opacity < .6 || m.depthWrite === false)) || m.transmission > .3; }
function raccogliTrasp() { TRASP = []; scene.traverse(function (o) { if (!(o.isMesh || o.isLine || o.isPoints || o.isSprite)) return; var m = o.material;
  if (o.isSprite || (Array.isArray(m) ? m.every(trasparente) : trasparente(m))) TRASP.push(o); }); }
function renderProf(cam, rt) {
  if (!TRASP) raccogliTrasp();
  var bg = scene.background, ov = scene.overrideMaterial, au = renderer.shadowMap.autoUpdate, cc = renderer.getClearColor(new T.Color()), ca = renderer.getClearAlpha(), vis = [];
  TRASP.forEach(function (o) { vis.push(o.visible); o.visible = false; });
  scene.background = null; scene.overrideMaterial = matProf; renderer.shadowMap.autoUpdate = false; renderer.setClearColor(0xffffff, 1);
  try { vistaReale(function () { renderer.setRenderTarget(rt); renderer.clear(); origRender(scene, cam); }); }
  finally { TRASP.forEach(function (o, i) { o.visible = vis[i]; }); scene.background = bg; scene.overrideMaterial = ov; renderer.shadowMap.autoUpdate = au; renderer.setClearColor(cc, ca); }
}
function camDa(p, pos, rot, fov) { var c = p.cam || (p.cam = new T.PerspectiveCamera(fov, p.w / p.h, .05, DMAX)); c.fov = fov; c.aspect = p.w / p.h; c.position.set(pos[0], pos[1], pos[2]); c.rotation.set(rot[0], rot[1], rot[2], 'YXZ'); c.updateProjectionMatrix(); c.updateMatrixWorld(true); c.matrixWorldInverse.copy(c.matrixWorld).invert(); return c; }
function aggiornaPV(p) { p.PV = (p.PV || new T.Matrix4()).multiplyMatrices(p.cam.projectionMatrix, p.cam.matrixWorldInverse); p.dir = new T.Vector3(0, 0, -1).applyQuaternion(p.cam.quaternion); }
function posaPj(p, pose) { p.pos = pose.p.slice(); p.rot = pose.r.slice(); p.fov = pose.fov; camDa(p, p.pos, p.rot, p.fov); aggiornaPV(p); p.prof = null; p.campioni = null; }

function camNav(id) { return CAM.find(function (c) { return c.id === id; }); }
function posaDaCam(c, fov) { return { p: [c.x, c.y, c.z], r: [c.pitch, c.yaw, 0], fov: fov || c.fov }; }
/* posa di partenza dei fotogrammi del giro: interpolata tra le camere c9473_* del rilievo (n-esimo fotogramma a 1 fps = t n-1) */
function posaGiro(t) {
  var ids = [['c9473_001', 0], ['c9473_005', 4], ['c9473_008', 7], ['c9473_010', 9], ['c9473_012', 11], ['c9473_014', 13]];
  var a = ids.map(function (q) { var c = camNav(q[0]); return c ? { t: q[1], c: c } : null; }).filter(Boolean);
  if (!a.length) return null;
  var y = [a[0].c.yaw]; for (var i = 1; i < a.length; i++) { var d = a[i].c.yaw - y[i - 1]; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; y.push(y[i - 1] + d); }
  var dir = Math.sign(y[y.length - 1] - y[0]) || 1;
  a.push({ t: 19.2, c: a[0].c }); y.push(y[0] + dir * 2 * Math.PI);
  var k = 0; while (k < a.length - 2 && t > a[k + 1].t) k++;
  var u = clamp((t - a[k].t) / (a[k + 1].t - a[k].t), 0, 1.6);
  var c0 = a[0].c;
  return { p: [c0.x, c0.y, c0.z], r: [a[k].c.pitch + (a[k + 1].c.pitch - a[k].c.pitch) * clamp(u, 0, 1), y[k] + (y[k + 1] - y[k]) * u, 0], fov: c0.fov };
}

function creaPj(f, tipo) {
  var p = { id: f.id, tipo: tipo, w: f.w, h: f.h, src: f.src, t: f.t, media: f.media || null, img: null, tex: null, pronta: false, fade: 0, score: 0, uso: 0, nav: null };
  var cal = (window.MIX_FOTO && window.MIX_FOTO.cal) || {};
  var pose = cal[f.id];
  if (!pose) {
    if (tipo === 'foto') { var c = camNav(f.cam); if (!c) return null; pose = posaDaCam(c); }
    else pose = posaGiro(f.t);
    if (!pose) return null;
  }
  posaPj(p, pose);
  if (tipo === 'foto') p.nav = f.cam;
  var img = new Image(); p.img = img;
  img.onload = function () { p.pronta = true; };
  img.src = f.src;
  return p;
}
/* id di navigazione -> proiettore su cui agganciarsi */
function pjPerNav(id) {
  if (!id) return null;
  for (var i = 0; i < M.pj.length; i++) if (M.pj[i].nav === id) return M.pj[i];
  var m = /^c9473_(\d+)$/.exec(id); if (m) { var t = parseInt(m[1], 10) - 1; var best = null, bd = 1e9; M.pj.forEach(function (p) { if (p.tipo === 'giro') { var d = Math.abs(p.t - t); if (d < bd) { bd = d; best = p; } } }); return bd < .3 ? best : null; }
  return null;
}

/* texture e mappe di profondita' (pigre, con cache LRU) */
var LRU_TEX = PU.uni ? (PU.telefono ? 6 : 10) : 18, LRU_PROF = PU.uni ? (PU.telefono ? 8 : 12) : 24;
function texPronta(p) {
  if (p.tex) return true; if (!p.pronta) return false;
  var t = new T.Texture(p.img); t.colorSpace = T.NoColorSpace; t.minFilter = T.LinearMipmapLinearFilter; t.magFilter = T.LinearFilter; t.generateMipmaps = true;
  t.anisotropy = Math.min(4, renderer.capabilities.getMaxAnisotropy()); t.needsUpdate = true; renderer.initTexture(t); p.tex = t;
  var conT = M.pj.filter(function (q) { return q.tex; }).sort(function (a, b) { return a.uso - b.uso; });
  while (conT.length > LRU_TEX) { var q = conT.shift(); if (q.fade > 0 || q === p) continue; q.tex.dispose(); q.tex = null; }
  return true;
}
function profPronta(p) {
  if (p.prof) return true;
  var lw = PU.uni ? 320 : 448, w = p.w >= p.h ? lw : Math.round(lw * p.w / p.h), h = p.w >= p.h ? Math.round(lw * p.h / p.w) : lw;
  var rt = new T.WebGLRenderTarget(w, h, { depthBuffer: true, minFilter: T.NearestFilter, magFilter: T.NearestFilter, generateMipmaps: false });
  renderProf(p.cam, rt); p.prof = rt;
  var conP = M.pj.filter(function (q) { return q.prof; }).sort(function (a, b) { return a.uso - b.uso; });
  while (conP.length > LRU_PROF) { var q = conP.shift(); if (q.fade > 0 || q === p) continue; q.prof.dispose(); q.prof = null; }
  return true;
}
/* punti campione (12 per proiettore) per scegliere quali foto servono alla vista attuale */
var rtCamp = null, bufCamp = null;
function campioni(p) {
  if (p.campioni) return p.campioni;
  var cw = 8, ch = 8;
  if (!rtCamp) { rtCamp = new T.WebGLRenderTarget(cw, ch, { depthBuffer: true, minFilter: T.NearestFilter, magFilter: T.NearestFilter }); bufCamp = new Uint8Array(cw * ch * 4); }
  renderProf(p.cam, rtCamp); renderer.readRenderTargetPixels(rtCamp, 0, 0, cw, ch, bufCamp);
  var out = [], inv = new T.Matrix4().copy(p.cam.projectionMatrixInverse);
  for (var j = 0; j < ch; j++) for (var i = 0; i < cw; i++) {
    var o = (j * cw + i) * 4, d = (bufCamp[o] / 255 / 16777216 + bufCamp[o + 1] / 255 / 65536 + bufCamp[o + 2] / 255 / 256 + bufCamp[o + 3] / 255) * DMAX;
    if (d > DMAX * .98) d = 4;
    var v = new T.Vector3((i + .5) / cw * 2 - 1, (j + .5) / ch * 2 - 1, .5).applyMatrix4(inv).normalize();
    v.multiplyScalar(d / Math.max(.2, -v.z)).applyMatrix4(p.cam.matrixWorld); out.push(v);
  }
  p.campioni = out; return out;
}
var _v = new T.Vector3(), _a = new T.Vector3(), _b = new T.Vector3(), PVc = new T.Matrix4();
function punteggio(p, cp) {
  var cs = p.campioni || campioni(p), s = 0, n = cs.length;
  for (var i = 0; i < n; i++) {
    _v.copy(cs[i]).applyMatrix4(PVc);
    if (_v.z > 1 || Math.abs(_v.x) > 1.08 || Math.abs(_v.y) > 1.08) continue;
    _a.copy(cp).sub(cs[i]).normalize(); _b.fromArray(p.pos).sub(cs[i]).normalize();
    var a = _a.dot(_b); s += clamp((a - .4) / .5, 0, 1);
  }
  var dd = Math.hypot(cp.x - p.pos[0], cp.y - p.pos[1], cp.z - p.pos[2]);
  return s / n / (1 + .25 * dd);
}

/* ============================== scelta per fotogramma ============================== */
var SLOT = [];
var nuoviQuesto = 0;
function scegli(dt, cp) {
  PVc.multiplyMatrices(camera.projectionMatrix, camera.matrixWorldInverse);
  var K = M.lite ? 2 : M.K, lista = [];
  var campNuovi = 0;
  M.pj.forEach(function (p) {
    if (!p.campioni) { if (campNuovi > 6) { p.score = 0; return; } campNuovi++; }
    p.score = punteggio(p, cp);
    if (M.snapPj === p && M.snap > .5) p.score += 2;
    if (M.giro && M.giro.vicini && M.giro.vicini.indexOf(p) >= 0) p.score += 1;
    lista.push(p);
  });
  lista.sort(function (a, b) { return b.score - a.score; });
  var scelti = lista.filter(function (p) { return p.score > .03; }).slice(0, K);
  nuoviQuesto = 0;
  var vel = M.giro ? 9 : 3.2;
  M.pj.forEach(function (p) {
    var vuole = scelti.indexOf(p) >= 0;
    if (vuole && (!p.tex || !p.prof)) { if (nuoviQuesto < 2) { texPronta(p) && profPronta(p); nuoviQuesto++; } if (!p.tex || !p.prof) vuole = false; }
    p.fade = clamp(p.fade + (vuole ? 1 : -1) * dt * vel, 0, 1);
    if (p.fade > 0) p.uso = performance.now();
  });
  SLOT = M.pj.filter(function (p) { return p.fade > 0 && p.tex && p.prof; }).sort(function (a, b) { return b.fade * (1 + b.score) - a.fade * (1 + a.score); }).slice(0, K);
}

/* ============================== posa della camera: aggancio + macchina a mano + giro ============================== */
var salvata = { p: new T.Vector3(), q: new T.Quaternion(), fov: 60 };
var _q = new T.Quaternion(), _e = new T.Euler(0, 0, 0, 'YXZ'), _p = new T.Vector3();
function applicaPosa(now, dt) {
  salvata.p.copy(camera.position); salvata.q.copy(camera.quaternion); salvata.fov = camera.fov;
  var fp = S.modo === 'fp';
  /* giro video */
  if (M.giro && fp) {
    var g = M.giro, t = (now - g.t0) / 1000 * g.vel, fr = M.pj.filter(function (p) { return p.tipo === 'giro'; });
    if (!fr.length || t > fr[fr.length - 1].t) { fineGiro(true); }
    else {
      var i = 0; while (i < fr.length - 2 && fr[i + 1].t < t) i++;
      var a = fr[i], b = fr[i + 1], u = clamp((t - a.t) / (b.t - a.t), 0, 1); g.u = u;
      g.vicini = [fr[Math.max(0, i - 2)], fr[Math.max(0, i - 1)], a, b, fr[Math.min(fr.length - 1, i + 2)], fr[Math.min(fr.length - 1, i + 3)]];
      _p.fromArray(a.pos).lerp(_b.fromArray(b.pos), u); _q.copy(a.cam.quaternion).slerp(b.cam.quaternion, u);
      camera.position.copy(_p); camera.quaternion.copy(_q); camera.fov = a.fov + (b.fov - a.fov) * u; g.ultima = { p: _p.clone(), q: _q.clone(), fov: camera.fov };
      camera.updateProjectionMatrix();
    }
  }
  /* aggancio alla posa calibrata della foto */
  var pj = (!M.giro && fp && !S.tween && !S.walk) ? pjPerNav(S.camId) : null;
  if (pj && pj !== M.snapPj) { M.snapPj = pj; M.snap = 0; }
  M.snap = clamp(M.snap + (pj ? 1 : -1) * dt / .7, 0, 1);
  if (M.snapPj && M.snap > 0 && !M.giro) {
    var e = ease(M.snap), q = M.snapPj.cam.quaternion;
    camera.position.lerp(_p.fromArray(M.snapPj.pos), e); camera.quaternion.slerp(q, e); camera.fov += (M.snapPj.fov - camera.fov) * e; camera.updateProjectionMatrix();
  } else if (M.snap <= 0) M.snapPj = null;
  /* macchina a mano: respiro lento + micro tremolio */
  if (M.mano && fp) {
    var s = now / 1000, A = M.giro ? .6 : 1;
    var yaw = (.0019 * Math.sin(s * .71) + .0008 * Math.sin(s * 1.93 + 1.2) + .00025 * Math.sin(s * 7.1)) * A;
    var pit = (.0015 * Math.sin(s * .53 + .4) + .0006 * Math.sin(s * 2.37) + .0002 * Math.sin(s * 8.3 + 2)) * A;
    var rol = (.0016 * Math.sin(s * .37 + 2.1) + .0005 * Math.sin(s * 1.61)) * A;
    _e.set(pit, yaw, rol, 'YXZ'); _q.setFromEuler(_e); camera.quaternion.multiply(_q);
    camera.position.y += .0025 * Math.sin(s * .9 + .3) * A;
  }
  camera.updateMatrixWorld(true);
}
function ripristinaPosa() { camera.position.copy(salvata.p); camera.quaternion.copy(salvata.q); if (camera.fov !== salvata.fov) { camera.fov = salvata.fov; camera.updateProjectionMatrix(); } camera.updateMatrixWorld(true); }

function tmCodice() { var t = renderer.toneMapping; return t === T.ACESFilmicToneMapping ? 0 : (T.NeutralToneMapping && t === T.NeutralToneMapping) ? 1 : t === T.NoToneMapping ? 2 : 0; }
function tmUniformi() { var c = tmCodice(); [matDown, matMix, matFilm, matDisp].forEach(function (m) { m.uniforms.uTM.value = c; }); }
/* proiettore «a fuoco»: quello agganciato o il fotogramma corrente del giro -> domina dentro la sua inquadratura */
function boostDi(p) { var g = M.giro; if (g && g.vicini) return p === g.vicini[2] ? 1 - g.u : p === g.vicini[3] ? g.u : 0; return p === M.snapPj ? ease(M.snap) : 0; }
/* ============================== pipeline ============================== */
var tPrec = 0, tAcc = null;
function pipeline() {
  var now = performance.now(), dt = clamp((now - (tPrec || now)) / 1000, 0, .1); tPrec = now;
  preparaRT();
  applicaPosa(now, dt);
  var expo = renderer.toneMappingExposure || 1; tmUniformi();
  /* 1. render del 3D (HDR lineare + profondita') */
  renderer.setRenderTarget(RT.a); renderer.clear(); origRender(scene, camera);
  /* 2. quali foto */
  scegli(dt, camera.position);
  var u = matProj.uniforms;
  u.tColor.value = RT.a.texture; u.tDepth.value = RT.a.depthTexture;
  u.uInvProj.value.copy(camera.projectionMatrixInverse); u.uCamWorld.value.copy(camera.matrixWorld); u.uCamPos.value.copy(camera.position);
  if (S.modo === 'alto') u.uAng.value.set(-.3, .45); else u.uAng.value.set(.72, .95);
  for (var i = 0; i < KMAX; i++) {
    var p = SLOT[i];
    if (p) { u['tPh' + i].value = p.tex; u['tPd' + i].value = p.prof.texture; u.uPV.value[i].copy(p.PV); u.uPP.value[i].fromArray(p.pos); u.uPF.value[i] = ease(p.fade); u.uPB.value[i] = boostDi(p); u.uDpx.value[i].set(1 / p.prof.width, 1 / p.prof.height); }
    else { u['tPh' + i].value = RT.l1.texture; u['tPd' + i].value = RT.l1.texture; u.uPF.value[i] = 0; u.uPB.value[i] = 0; }
  }
  fs(matProj, RT.p);
  /* 3. bassa risoluzione: trasferimento di luce locale + alone */
  var d = matDown.uniforms; d.tColor.value = RT.a.texture; d.tProj.value = RT.p.texture; d.uPx.value.set(1 / RT.l1.width, 1 / RT.l1.height); d.uExpo.value = expo;
  d.uMode.value = 0; fs(matDown, RT.l1); d.uMode.value = 1; fs(matDown, RT.l2); d.uMode.value = 2; fs(matDown, RT.l3);
  var bl = matBlur.uniforms, px = 1 / RT.l1.width, py = 1 / RT.l1.height;
  [[RT.l1, RT.l1b, 2], [RT.l2, RT.l2b, 2], [RT.l3, RT.l3b, 1]].forEach(function (c) {
    var qx = 1 / c[0].width, qy = 1 / c[0].height;
    for (var it = 0; it < (M.lite ? 1 : c[2]); it++) {
      var r = it ? 2.2 : 1.1;
      bl.tIn.value = c[0].texture; bl.uDir.value.set(qx * r, 0); fs(matBlur, c[1]);
      bl.tIn.value = c[1].texture; bl.uDir.value.set(0, qy * r); fs(matBlur, c[0]);
    }
  });
  /* 4. miscela */
  var m = matMix.uniforms; m.tColor.value = RT.a.texture; m.tProj.value = RT.p.texture; m.tL1.value = RT.l1.texture; m.tL2.value = RT.l2.texture; m.tL3.value = RT.l3.texture;
  m.uPx.value.set(1 / RTW, 1 / RTH); m.uGain.value.fromArray(M.gain); m.uForza.value = M.forza; m.uExpo.value = expo;
  fs(matMix, RT.m);
  /* 5. pellicola + CRT, sullo schermo */
  var f = matFilm.uniforms, v = renderer.getDrawingBufferSize(new T.Vector2());
  f.tMix.value = RT.m.texture; f.tL2.value = RT.l2.texture; f.tColor.value = RT.a.texture; f.uRes.value.set(v.x, v.y); f.uTime.value = now / 1000; f.uExpo.value = expo; f.uForza.value = .35 + .65 * M.forza;
  var crt = 1;
  if (M.stato === 'accensione') { crt = clamp((now - M.t0) / 1100, 0, 1); if (crt >= 1) M.stato = 'acceso'; f.uCrtModo.value = 0; }
  else if (M.stato === 'spegnimento') { crt = clamp((now - M.t0) / 900, 0, 1); f.uCrtModo.value = 1; if (crt >= 1) { M.stato = 'spento'; aggiornaUI(); } }
  f.uCrt.value = crt;
  fs(matFilm, null);
  ripristinaPosa();
  /* prestazioni: modo leggero automatico */
  M.fpsN++; if (now - M.fpsT > 1000) { M.fps = M.fpsN * 1000 / (now - M.fpsT); M.fpsN = 0; M.fpsT = now;
    if (M.liteAuto && !M.lite && M.stato === 'acceso') { M.lento = M.fps < 26 ? M.lento + 1 : 0; if (M.lento >= 3) { M.lite = true; aggiornaUI(); } } }
}

renderer.render = function (sc, cam) {
  if (M.stato !== 'spento' && M.stato !== 'carico' && !M.inPipe && sc === scene && cam === camera && renderer.getRenderTarget() === null && !scene.overrideMaterial) {
    M.inPipe = true;
    try { pipeline(); }
    catch (e) { console.error('mix:', e); M.err = String(e && e.message || e); M.stato = 'spento'; aggiornaUI(); renderer.setRenderTarget(null); try { ripristinaPosa(); } catch (e2) { } origRender(sc, cam); }
    M.inPipe = false; return;
  }
  return origRender(sc, cam);
};
/* se la pagina usa un compositore (resa grafica), nel modo MIX lo scavalco: il mix ha il suo trattamento pellicola */
function scavalcaCompositori() {
  var R = window.__RESA; if (R && typeof R.disegna === 'function' && !R.__mix) { var d = R.disegna; R.__mix = true;
    R.disegna = function () { if (M.stato !== 'spento' && M.stato !== 'carico') return false; return d.apply(R, arguments); }; }
  var cand = [N.composer, N.resa && N.resa.composer, window.__RESA && window.__RESA.composer];
  cand.forEach(function (c) { if (c && typeof c.render === 'function' && !c.__mix) { var r = c.render.bind(c); c.__mix = true;
    c.render = function () { if (M.stato !== 'spento' && M.stato !== 'carico') return renderer.render(scene, camera); return r.apply(null, arguments); }; } });
}

/* ============================== guadagno globale (colore del render -> colore delle foto) ============================== */
var rtS = null, rtS8 = null;
function renderPiccolo(cam, w, h) {
  if (!rtS || rtS.width !== w || rtS.height !== h) { if (rtS) { rtS.dispose(); rtS8.dispose(); } rtS = nuovoRT(w, h, { type: floatOK ? T.HalfFloatType : T.UnsignedByteType, depthBuffer: true }); rtS8 = nuovoRT(w, h); }
  vistaReale(function () { renderer.setRenderTarget(rtS); renderer.clear(); origRender(scene, cam); });
  tmUniformi(); matDisp.uniforms.tColor.value = rtS.texture; matDisp.uniforms.uExpo.value = renderer.toneMappingExposure || 1; fs(matDisp, rtS8);
  var b = new Uint8Array(w * h * 4); renderer.readRenderTargetPixels(rtS8, 0, 0, w, h, b); renderer.setRenderTarget(null); return b;
}
function pixelFoto(p, w, h) { var c = document.createElement('canvas'); c.width = w; c.height = h; var x = c.getContext('2d', { willReadFrequently: true }); x.drawImage(p.img, 0, 0, w, h); var d = x.getImageData(0, 0, w, h).data;
  /* canvas: riga 0 in alto; readPixels: riga 0 in basso -> capovolgo */
  var o = new Uint8Array(w * h * 4); for (var j = 0; j < h; j++) o.set(d.subarray((h - 1 - j) * w * 4, (h - j) * w * 4), j * w * 4); return o; }
function calcolaGuadagno() {
  var usa = M.pj.filter(function (p) { return p.pronta && (p.tipo === 'foto' || (p.tipo === 'giro' && Math.round(p.t * 2) % 4 === 0)); });
  if (!usa.length) return;
  var lr = [0, 0, 0], n = 0;
  usa.forEach(function (p) {
    var w = 24, h = Math.max(8, Math.round(24 * p.h / p.w)); if (p.w > p.h) { w = 32; h = Math.round(32 * p.h / p.w); }
    var r = renderPiccolo(p.cam, w, h), sr = [0, 0, 0], sf = [0, 0, 0], i, c;
    for (i = 0; i < w * h; i++) for (c = 0; c < 3; c++) sr[c] += r[i * 4 + c];
    if (p.media) for (c = 0; c < 3; c++) sf[c] = p.media[c] * w * h;   /* media della foto calcolata da build_mix.py (Safari non legge i pixel delle immagini da file://) */
    else { var f = pixelFoto(p, w, h); for (i = 0; i < w * h; i++) for (c = 0; c < 3; c++) sf[c] += f[i * 4 + c]; }
    for (c = 0; c < 3; c++) lr[c] += Math.log((sf[c] + 1) / (sr[c] + 1)); n++;
  });
  M.gain = lr.map(function (v) { return clamp(Math.exp(v / n), .7, 1.45); });
  M.gainPronto = true;
}

/* ============================== caricamento ============================== */
function caricaDati(cb) {
  if (M.dati) return cb(null);
  caricaScript(BASE + 'mix-foto.js', function (e) {
    if (e || !window.MIX_FOTO) return cb(e || new Error('mix-foto.js vuoto'));
    window.MIX_FOTO.foto.forEach(function (f) { var p = creaPj(f, 'foto'); if (p) M.pj.push(p); });
    M.dati = true; cb(null);
    caricaScript(BASE + 'mix-giro.js', function (e2) {
      if (e2 || !window.MIX_GIRO) { console.warn('mix: giro non caricato'); return; }
      window.MIX_GIRO.foto.forEach(function (f) { var p = creaPj(f, 'giro'); if (p) M.pj.push(p); });
      M.giroDati = true; aggiornaUI();
      setTimeout(function () { attendiPronte(function () { try { calcolaGuadagno(); } catch (x) { console.warn('mix: guadagno', x); } }); }, 300);
    });
  });
}
function attendiPronte(cb, tent) { tent = tent || 0; if (M.pj.every(function (p) { return p.pronta; }) || tent > 60) return cb(); setTimeout(function () { attendiPronte(cb, tent + 1); }, 100); }

/* ============================== accensione / spegnimento ============================== */
function accendi() {
  if (M.stato === 'acceso' || M.stato === 'accensione') return;
  /* UNIVERSALE: su un telefono debole (qualita' scesa a Leggera) il MIX resta spento: si consiglia la visita con le foto */
  if (PU.uni && PU.telefono && window.__RESA && window.__RESA.stato().livello === 'leggera') {
    M.err = 'telefono lento: meglio la visita con le foto'; aggiornaUI();
    if (PU.consiglioFoto) PU.consiglioFoto(true);
    return;
  }
  M.stato = 'carico'; aggiornaUI();
  caricaDati(function (e) {
    if (e) { console.warn('mix:', e); M.stato = 'spento'; M.err = 'Dati delle foto non trovati'; aggiornaUI(); return; }
    attendiPronte(function () {
      scavalcaCompositori(); raccogliTrasp();
      if (!M.gainPronto) { try { calcolaGuadagno(); } catch (x) { console.warn('mix: guadagno', x); } }
      M.stato = 'accensione'; M.t0 = performance.now(); tPrec = 0; aggiornaUI();
    });
  });
}
function spegni() { if (M.stato !== 'acceso' && M.stato !== 'accensione') return; fineGiro(false); M.stato = 'spegnimento'; M.t0 = performance.now(); aggiornaUI(); }
function giroVideo() {
  if (!M.giroDati) return;
  if (M.giro) { fineGiro(true); return; }
  if (S.modo !== 'fp' && N.modoFP) N.modoFP();
  S.tween = null; S.walk = null; S.camId = null;
  M.giro = { t0: performance.now(), vel: 1 }; aggiornaUI();
}
function fineGiro(tieni) {
  if (!M.giro) return; var g = M.giro; M.giro = null;
  if (tieni && g.ultima) { /* la camera resta dove finisce il giro */
    S.pos.copy(g.ultima.p); _e.setFromQuaternion(g.ultima.q, 'YXZ'); S.yaw = _e.y; S.pitch = _e.x; S.fov = g.ultima.fov; S.vy = S.vp = 0; }
  aggiornaUI();
}

/* ============================== interfaccia: tasto ROSSO CRT ============================== */
var css = document.createElement('style');
css.textContent = [
  '.mx-grp{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:center}',
  '.mx-btn{position:relative;display:inline-flex;align-items:center;gap:11px;min-height:54px;padding:7px 20px 7px 14px;border-radius:12px;border:2px solid #2a0705;cursor:pointer;overflow:hidden;isolation:isolate;',
  ' background:radial-gradient(130% 150% at 50% 38%,#ff4a2e 0%,#d41d0e 38%,#8c0b05 78%,#4a0503 100%);color:#fff3ea;',
  ' font:700 18px/1 "Rajdhani","Chakra Petch",system-ui,sans-serif;letter-spacing:2.6px;text-transform:uppercase;white-space:nowrap;',
  ' text-shadow:0 0 4px #ffd2c2,0 0 12px #ff5a3a,0 0 22px #ff2a10;',
  ' box-shadow:0 0 0 2px #120302,0 0 16px 3px rgba(255,46,20,.55),0 0 42px 6px rgba(255,30,10,.22),inset 0 0 26px rgba(0,0,0,.6),inset 0 2px 0 rgba(255,220,200,.35);',
  ' animation:mxFlick 5.5s infinite;transition:transform .12s,box-shadow .25s}',
  '.mx-btn::before{content:"";position:absolute;inset:0;z-index:-1;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(0,0,0,.30) 0 1px,transparent 1px 3px);mix-blend-mode:multiply}',
  '.mx-btn::after{content:"";position:absolute;inset:0;pointer-events:none;background:radial-gradient(ellipse 90% 70% at 50% -10%,rgba(255,255,255,.38),transparent 60%),',
  ' linear-gradient(0deg,transparent 0 46%,rgba(255,200,180,.16) 50%,transparent 54%);background-size:100% 100%,100% 300%;animation:mxRoll 3.2s linear infinite}',
  '.mx-btn:hover{transform:translateY(-1px);box-shadow:0 0 0 2px #120302,0 0 22px 5px rgba(255,60,30,.7),0 0 60px 10px rgba(255,30,10,.3),inset 0 0 22px rgba(0,0,0,.5),inset 0 2px 0 rgba(255,220,200,.4)}',
  '.mx-btn:active{transform:translateY(1px) scale(.985)}',
  '.mx-btn:focus-visible{outline:3px solid #ffb199;outline-offset:3px}',
  '.mx-led{width:14px;height:14px;border-radius:50%;flex:none;background:radial-gradient(circle at 35% 35%,#5a1410,#1b0403);box-shadow:inset 0 0 3px #000,0 0 0 2px rgba(0,0,0,.45)}',
  '.mx-txt{display:flex;flex-direction:column;align-items:flex-start;gap:3px}',
  '.mx-txt small{font:600 10.5px "JetBrains Mono",Consolas,monospace;letter-spacing:1.4px;opacity:.85;text-shadow:0 0 6px #ff5a3a}',
  '.mx-btn.on{background:radial-gradient(130% 150% at 50% 38%,#ff7a52 0%,#ff2a12 36%,#a80e06 78%,#560603 100%);box-shadow:0 0 0 2px #120302,0 0 26px 6px rgba(255,60,30,.8),0 0 80px 16px rgba(255,40,10,.35),inset 0 0 18px rgba(0,0,0,.45),inset 0 2px 0 rgba(255,230,210,.45)}',
  '.mx-btn.on .mx-led{background:radial-gradient(circle at 40% 40%,#fff,#ffb3a0 35%,#ff2a12 70%);box-shadow:0 0 8px 3px #ff3b20,0 0 18px 6px rgba(255,40,20,.6);animation:mxRec 1.1s steps(2) infinite}',
  '.mx-btn.carico .mx-led{animation:mxRec .35s steps(2) infinite;background:#ff8a6a}',
  '@keyframes mxFlick{0%,100%{filter:brightness(1)}3%{filter:brightness(1.12)}4%{filter:brightness(.9)}5%{filter:brightness(1.05)}47%{filter:brightness(1)}48%{filter:brightness(1.18)}49%{filter:brightness(.96)}72%{filter:brightness(1.03)}}',
  '@keyframes mxRoll{from{background-position:0 0,0 100%}to{background-position:0 0,0 -200%}}',
  '@keyframes mxRec{0%{opacity:1}100%{opacity:.25}}',
  '.mx-opz{display:none;gap:6px;align-items:center;flex-wrap:wrap;justify-content:center}',
  '.mx-grp.attivo .mx-opz{display:flex}',
  '.mx-opz label{display:flex;gap:6px;align-items:center;font:600 12.5px "Rajdhani",system-ui,sans-serif;letter-spacing:1px;text-transform:uppercase;color:#7a1a0e}',
  '.mx-opz input[type=range]{width:120px;accent-color:#d41d0e}',
  '.mx-opz .n3-btn{min-height:36px;padding:5px 10px;font-size:13px;border-color:rgba(212,29,14,.55);color:#8c0b05}',
  '.mx-opz .n3-btn.on{background:#c3170c;border-color:#8c0b05;color:#fff4ea}',
  '@media (max-width:860px){.mx-btn{min-height:46px;font-size:15px;padding:6px 14px 6px 11px;letter-spacing:1.8px}.mx-opz input[type=range]{width:90px}}',
  '@media (prefers-reduced-motion:reduce){.mx-btn,.mx-btn::after,.mx-btn.on .mx-led{animation:none}}',
  '.mx-btn.in-header{min-height:0;padding:9px 14px;border-radius:0;border:1px solid #7a160c;gap:8px;font:700 14px var(--title,sans-serif);letter-spacing:1.2px;clip-path:polygon(0 0,calc(100% - 8px) 0,100% 8px,100% 100%,8px 100%,0 calc(100% - 8px))}',
  '.mx-btn.in-header .mx-txt small{display:none}.mx-btn.in-header .mx-led{width:9px;height:9px}',
  '.mx-btn.in-header:hover{transform:none}'
].join('\n');
document.head.appendChild(css);

var grp = document.createElement('div'); grp.className = 'mx-grp'; grp.id = 'grpMix';
grp.innerHTML = '<button class="mx-btn" id="bMix" type="button" aria-pressed="false" title="Mescola foto vere, video e 3D in un\'unica immagine">' +
  '<span class="mx-led" aria-hidden="true"></span><span class="mx-txt"><span id="mxTit">MIX REALTÀ</span><small id="mxSub">foto · film · 3D</small></span></button>' +
  '<div class="mx-opz" id="mxOpz">' +
  '<label title="Quanto pesano le foto vere">3D <input type="range" id="mxForza" min="0" max="100" value="100"> Reale</label>' +
  '<button class="n3-btn" id="mxGiro" type="button" title="La camera ripercorre il giro video: i fotogrammi veri si proiettano in sequenza">▶ Giro video</button>' +
  '<button class="n3-btn on" id="mxMano" type="button" title="Micro-movimento di macchina a mano">Mano</button>' +
  '<button class="n3-btn" id="mxLite" type="button" title="Versione leggera per dispositivi lenti">Leggera</button></div>';
var dock = document.querySelector('.n3-dock');
if (dock) dock.insertBefore(grp, dock.firstChild); else { grp.style.cssText = 'position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:12'; document.body.appendChild(grp); }
/* 6/11 (Fabrice): il tasto MIX REALTÀ va nell'HEADER, con la stessa forma di «Demo app» e «Menu»; le opzioni restano in basso */
(function () { var hdr = document.querySelector('.n3-top'), demo = hdr && hdr.querySelector('.n3-link.demo'), b = grp.querySelector('#bMix');
  if (hdr && b) { b.classList.add('in-header'); hdr.insertBefore(b, demo || null); }
  /* 6/11 Fabrice: MIX REALTÀ attivo SOLO nelle copie locali ALTE (NUC e Mac, aperte da file://).
     Online e nella versione universale il tasto resta visibile ma «fantasma» (spento, non cliccabile). */
  var locale = location.protocol === 'file:', uni = !!(window.N3D_P && window.N3D_P.uni);
  if (b && (!locale || uni)) {
    b.disabled = true; b.classList.add('mx-ghost'); b.setAttribute('aria-disabled', 'true');
    b.title = 'MIX REALTÀ è disponibile solo nella versione completa (computer del negozio)';
    var st = document.createElement('style');
    st.textContent = '.mx-btn.mx-ghost{opacity:.38;filter:grayscale(.85);cursor:not-allowed;pointer-events:none}.mx-btn.mx-ghost .mx-led{animation:none!important;box-shadow:none!important}';
    document.head.appendChild(st);
  } })();
var $ = function (s) { return document.querySelector(s); };
$('#bMix').onclick = function () { if (this.disabled) return; if (M.stato === 'acceso' || M.stato === 'accensione') spegni(); else if (M.stato === 'spento' || M.stato === 'spegnimento') accendi(); };
$('#mxForza').oninput = function (e) { M.forza = e.target.value / 100; };
$('#mxGiro').onclick = giroVideo;
$('#mxMano').onclick = function () { M.mano = !M.mano; aggiornaUI(); };
$('#mxLite').onclick = function () { M.lite = !M.lite; M.liteAuto = false; aggiornaUI(); };
function aggiornaUI() {
  var on = M.stato === 'acceso' || M.stato === 'accensione', b = $('#bMix');
  b.classList.toggle('on', on); b.classList.toggle('carico', M.stato === 'carico'); b.setAttribute('aria-pressed', on ? 'true' : 'false');
  grp.classList.toggle('attivo', on);
  $('#mxTit').textContent = on ? 'REC · REALTÀ' : M.stato === 'carico' ? 'CARICO…' : 'MIX REALTÀ';
  $('#mxSub').textContent = M.err && !on ? M.err : on ? (M.lite ? 'acceso · leggero' : 'acceso · foto+film+3D') : M.stato === 'carico' ? 'foto vere in arrivo' : 'foto · film · 3D';
  $('#mxGiro').classList.toggle('on', !!M.giro); $('#mxGiro').textContent = M.giro ? '■ Ferma giro' : '▶ Giro video'; $('#mxGiro').disabled = !M.giroDati;
  $('#mxMano').classList.toggle('on', M.mano); $('#mxLite').classList.toggle('on', M.lite);
}
aggiornaUI();
/* il trascinamento ferma il giro */
renderer.domElement.addEventListener('pointerdown', function () { if (M.giro) fineGiro(true); });

/* ============================== calibrazione (strumento di sviluppo) ==============================
   Confronta i BORDI della foto con quelli del render dalla posa del proiettore (correlazione normalizzata dei gradienti)
   e cerca la posa migliore (discesa per coordinate su yaw, pitch, rollio, fov, x, y, z). Usata da controllo/mix_calibra.py. */
function gradienti(px, w, h, sfoca) {
  var L = new Float32Array(w * h), G2 = new Float32Array(w * h), i, x, y;
  for (i = 0; i < w * h; i++) L[i] = .299 * px[i * 4] + .587 * px[i * 4 + 1] + .114 * px[i * 4 + 2];
  for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) { i = y * w + x;
    var gx = L[i + 1 - w] + 2 * L[i + 1] + L[i + 1 + w] - L[i - 1 - w] - 2 * L[i - 1] - L[i - 1 + w];
    var gy = L[i + w - 1] + 2 * L[i + w] + L[i + w + 1] - L[i - w - 1] - 2 * L[i - w] - L[i - w + 1];
    G2[i] = Math.sqrt(gx * gx + gy * gy); }
  for (var r = 0; r < sfoca; r++) { var t = new Float32Array(G2); for (y = 1; y < h - 1; y++) for (x = 1; x < w - 1; x++) { i = y * w + x; G2[i] = (t[i] * 4 + t[i - 1] + t[i + 1] + t[i - w] + t[i + w]) / 8; } }
  var m = 0; for (i = 0; i < w * h; i++) m += G2[i]; m /= w * h; var s = 0; for (i = 0; i < w * h; i++) { G2[i] -= m; s += G2[i] * G2[i]; } s = Math.sqrt(s) || 1; for (i = 0; i < w * h; i++) G2[i] /= s;
  return G2;
}
function ncc(a, b) { var s = 0; for (var i = 0; i < a.length; i++) s += a[i] * b[i]; return s; }
function calibra(id, o) {
  o = o || {}; var p = typeof id === 'string' ? M.pj.find(function (q) { return q.id === id; }) : id; if (!p) return null;
  var w = o.w || (p.w > p.h ? 160 : 108), h = Math.round(w * p.h / p.w);
  var fotoG = [gradienti(pixelFoto(p, w, h), w, h, 2), gradienti(pixelFoto(p, w, h), w, h, 0)];
  var x0 = { p: p.pos.slice(), r: p.rot.slice(), fov: p.fov };
  var cam = new T.PerspectiveCamera(p.fov, p.w / p.h, .05, DMAX), tmp = { w: p.w, h: p.h, cam: cam };
  function punti(v, liv) { camDa(tmp, [v[4], v[5], v[6]], [v[1], v[0], v[2]], v[3]); var g = gradienti(renderPiccolo(cam, w, h), w, h, liv ? 0 : 2); return ncc(g, fotoG[liv ? 1 : 0]); }
  var v = [x0.r[1], x0.r[0], x0.r[2], x0.fov, x0.p[0], x0.p[1], x0.p[2]];
  var lim = o.lim || [6 * D2R, 5 * D2R, 4 * D2R, 7, .35, .2, .35];
  if (o.blocca) o.blocca.forEach(function (k) { lim[k] = 0; });
  var passo = [1.5 * D2R, 1.2 * D2R, 1 * D2R, 2, .08, .05, .08], v0 = v.slice();
  var s0 = punti(v, 0), best = s0, valut = 1;
  for (var liv = 0; liv < 2; liv++) {
    if (liv === 1) best = punti(v, 1);
    var sc = 1;
    for (var giro = 0; giro < (o.giri || 4); giro++) {
      var mig = false;
      for (var k = 0; k < 7; k++) { if (!lim[k]) continue;
        for (var sg = -1; sg <= 1; sg += 2) { var c = v.slice(); c[k] += sg * passo[k] * sc; if (Math.abs(c[k] - v0[k]) > lim[k]) continue;
          var s = punti(c, liv); valut++; if (s > best + 1e-4) { best = s; v = c; mig = true; } } }
      if (!mig) sc *= .5;
    }
  }
  var fin = { p: [v[4], v[5], v[6]], r: [v[1], v[0], v[2]], fov: v[3] };
  var s1 = punti(v, 1), sIni = punti(v0, 1);
  if (o.applica !== false && s1 > sIni) posaPj(p, fin);
  renderer.setRenderTarget(null);
  return { id: p.id, prima: sIni, dopo: s1, valut: valut, posa: s1 > sIni ? fin : x0 };
}

N.mix = { M: M, accendi: accendi, spegni: spegni, giro: giroVideo, stato: function () { return M.stato; },
  dev: { calibra: calibra, pj: function () { return M.pj; }, posaPj: posaPj, renderPiccolo: renderPiccolo, pixelFoto: pixelFoto, calcolaGuadagno: calcolaGuadagno, caricaDati: caricaDati, attendiPronte: attendiPronte, slot: function () { return SLOT.map(function (p) { return p.id + ':' + p.fade.toFixed(2); }); } } };
})();
