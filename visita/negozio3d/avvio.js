/* avvio.js - AVVIO VELOCE del negozio 3D (5/11/2026, agente AVVIO 3D).
 *
 * Problema misurato: ~35 s di schermo fermo, quasi tutti di COMPILAZIONE SHADER sincrona (~200 ms a programma con
 * 23 luci e 6 ombre su D3D11) e ogni materiale compilato 4 volte (le luci/il tone mapping/i riflessi cambiavano
 * dopo il primo disegno). Qui:
 *   1. la pagina non disegna niente finche' non ha finito (vedi la riga «AVVIO 5/11» nel ciclo di negozio-3d.html);
 *   2. si chiede a three.js di compilare TUTTI i materiali UNA volta sola, con la configurazione finale
 *      (render target del post-processing se c'e', luci di allestimento.js e resa.js gia' accese), senza aspettare:
 *      con KHR_parallel_shader_compile il browser compila in parallelo e la pagina resta viva (barra che avanza);
 *   3. quando sono pronti: riflessi (resa.js), primo fotogramma, via la schermata.
 *   4. dopo: nulla di pesante resta da fare tutto insieme (i giri di resa.js ripartono a blocchi piccoli).
 * Senza questo file la pagina funziona come prima (la schermata si toglie da sola al «load»).
 * Per tornare indietro: togliere la riga <script src="negozio3d/avvio.js"> (e le righe AVVIO nella pagina) o usare i .bak-avvio.
 */
(function () {
'use strict';
var A = window.__AVVIO, N = window.__N3D, T = window.THREE;
if (!A) return;
A.gestito = true;
if (!N || !T || !N.renderer) { A.fine(); return; }   /* errore gia' mostrato dalla pagina (resta visibile) */
var R = N.renderer, S = N.scene, C = N.camera, RESA = window.__RESA || null;
var t0 = performance.now(), MAXATTESA = 120000;
A.fase('luci', 40);

function programmi() { return (R.info && R.info.programs) || []; }
function pronti() { var p = programmi(), n = 0; for (var i = 0; i < p.length; i++) { if (!p[i].isReady || p[i].isReady()) n++; } return { n: n, tot: p.length }; }

/* materiali dei passaggi del post-processing (GTAO, bloom, uscita...): li compila insieme al resto */
function materialiPost() {
  var out = [], visti = new Set();
  function prendi(m) { if (m && m.isMaterial && !visti.has(m)) { visti.add(m); out.push(m); } }
  try {
    var P = RESA && RESA.P && RESA.P();
    if (!P || !P.composer) return out;
    P.composer.passes.forEach(function (pass) {
      Object.keys(pass).forEach(function (k) {
        var v = pass[k];
        if (!v) return;
        if (v.isMaterial) prendi(v);
        else if (Array.isArray(v)) v.forEach(function (x) { if (x && x.isMaterial) prendi(x); });
        else if (v.material && v.material.isMaterial && !v.isObject3D) prendi(v.material);   /* FullScreenQuad */
      });
    });
  } catch (e) { console.warn('avvio: post', e); }
  return out;
}

function compila() {
  var P = RESA && RESA.P && RESA.P();
  /* con il post-processing la scena si disegna in un render target (niente tone mapping nello shader): si compila cosi' */
  var rt = P ? new T.WebGLRenderTarget(4, 4, { type: T.HalfFloatType }) : null;
  var prima = R.getRenderTarget();
  try {
    R.setRenderTarget(rt);
    R.compile(S, C);                  /* avvia la compilazione di tutti i materiali (anche quelli nascosti: STORE//CRAFT) */
    var mp = materialiPost();
    if (mp.length) {
      var sc = new T.Scene(), g = new T.PlaneGeometry(1, 1);
      mp.forEach(function (m) { sc.add(new T.Mesh(g, m)); });
      try { R.compile(sc, C); } catch (e) { console.warn('avvio: post compile', e); }
    }
  } catch (e) { console.warn('avvio: compile', e); }
  R.setRenderTarget(prima);
  if (rt) rt.dispose();
}

function aspetta(fatto) {
  var tot0 = 0;
  (function giro() {
    var p = pronti(), dt = performance.now() - t0;
    if (!tot0) tot0 = p.tot;
    A.avanza(46 + 48 * (p.tot ? p.n / p.tot : 1));
    if (p.n >= p.tot || dt > MAXATTESA) { fatto(p); return; }
    setTimeout(giro, 40);
  })();
}

function attendiFrame(n, cb) { (function f() { if (n-- <= 0) cb(); else requestAnimationFrame(f); })(); }

setTimeout(function () {             /* lascia dipingere la fase «Accendo le luci» */
  A.fase('riflessi', 44);
  var tc = performance.now();
  compila();
  A.tempi.compilaAvviata = Math.round(performance.now() - tc);
  aspetta(function (p) {
    A.tempi.shaderPronti = Math.round(performance.now() - t0);
    A.tempi.programmi = p.tot;
    A.avanza(95);
    setTimeout(function () {
      var te = performance.now();
      try { if (RESA && RESA.dopoAvvio) RESA.dopoAvvio(); } catch (e) { console.warn('avvio: riflessi', e); }
      A.tempi.catturaRiflessi = Math.round(performance.now() - te);
      A.avanza(98);
      A.pronto = true;               /* da qui il ciclo della pagina disegna */
      attendiFrame(2, function () { A.fine(); });
    }, 30);
  });
}, 30);
})();
