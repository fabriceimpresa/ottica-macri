/* =====================================================================
   OTTICA MACRÌ · FINALE OLOGRAFICO (5/11/2026)
   La stretta di mano dietro al bancone, vista attraverso uno schermo CRT dell'app STORE // CRAFT.
   - Script classico, funziona con file:// (anche su Mac/iPhone), nessuna dipendenza esterna.
   - Le immagini arrivano da finale/finale-data.js (window.FINALE_DATA, generato da finale/_script/prepara_finale.py)
     come data URI: WebGL non accetta immagini file:// come texture.
   - Uso: <div data-ologramma></div> + <script src="finale/finale-data.js"></script><script src="finale/finale.js"></script>
     (attributi facoltativi: data-ologramma-testo="Benvenuto in STORE // CRAFT, Aldo." data-ologramma-firma="Fabrice")
   - Parallasse a strati: giroscopio sul telefono (su iPhone si chiede il permesso al tocco), mouse/scroll su desktop,
     deriva lenta da sola se nessuno muove nulla. CRT: curvatura, scanline, maschera RGB, aberrazione, flicker,
     glitch occasionali, righe d'interferenza, accensione del tubo. Niente suono.
   - Movimento ridotto (prefers-reduced-motion): una sola immagine ferma. Si mette in pausa quando non si vede.
   - Senza WebGL: canvas 2D con la parallasse; in stampa: l'immagine statica (finale/media/finale-statica.jpg).
   ===================================================================== */
(function(){
  'use strict';
  var BASE=(function(){var s=document.currentScript&&document.currentScript.src;return s?s.replace(/[^\/]*$/,''):'finale/';})();
  var RIDOTTO=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  var E=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  var clamp=function(x,a,b){return x<a?a:(x>b?b:x);};
  var rnd=function(a,b){return a+Math.random()*(b-a);};

  /* ------------------------------------------------------------ shader */
  var VS='attribute vec2 p;varying vec2 v;void main(){v=p*.5+.5;v.y=1.-v.y;gl_Position=vec4(p,0.,1.);}';
  var FS=[
  'precision mediump float;',
  'varying vec2 v;',
  'uniform sampler2D uS,uP,uB;',
  'uniform vec2 uR,uTilt,uFit;',
  'uniform float uT,uOn,uG,uQ,uLines,uHasB;',
  'float h(vec2 p){return fract(sin(dot(p,vec2(12.9898,78.233)))*43758.5453);}',
  'float n1(float x){float i=floor(x),f=fract(x);return mix(h(vec2(i,1.3)),h(vec2(i+1.,1.3)),f*f*(3.-2.*f));}',
  /* coordinate dell'immagine per uno strato a profondità d (0 lontano, 1 vicino): fuoco sulle persone */
  'vec2 lay(vec2 u,float d){vec2 c=(u-.5)*uFit/(1.075+d*.03);return c+.5+uTilt*vec2(.034,.026)*(d-.6);}',
  'vec4 pers(vec2 u){return texture2D(uP,lay(u,.62));}',
  'vec3 scena(vec2 u,float fl){',
  '  vec3 c=texture2D(uS,lay(u,.12+.22*u.y)).rgb;',
  '  vec4 p=pers(u);',
  /* bande di proiezione che salgono sulle persone + ombre appena blu */
  '  float hb=.5+.5*sin(u.y*150.-uT*4.);float hb2=smoothstep(.985,1.,sin(u.y*9.-uT*1.3));',
  '  vec3 pc=p.rgb*(.95+.07*hb)+hb2*vec3(.20,.17,.12);',
  '  pc=mix(pc,pc*vec3(.86,.95,1.12),(1.-dot(pc,vec3(.33)))*.35);',
  '  c=mix(c,pc,p.a*fl);',
  '  if(uHasB>.5){vec4 b=texture2D(uB,lay(u,.9));c=mix(c,b.rgb,b.a);}',
  '  return c;}',
  'void main(){',
  '  vec2 u=v;',
  /* fluttuazione leggera */
  '  u+=vec2(sin(uT*.61)*.0016+sin(uT*1.7)*.0004,sin(uT*.47+1.)*.0022);',
  /* curvatura del tubo */
  '  vec2 cc=u*2.-1.;cc*=1.+(cc.yx*cc.yx)*vec2(.040,.052);u=cc*.5+.5;',
  '  float bordo=smoothstep(0.,.008,u.x)*smoothstep(0.,.008,u.y)*smoothstep(0.,.008,1.-u.x)*smoothstep(0.,.008,1.-u.y);',
  /* accensione: punto -> riga -> immagine */
  '  float sx=smoothstep(0.,.16,uOn),sy=smoothstep(.16,.62,uOn);',
  '  vec2 uo=u;uo.y=(u.y-.5)/max(sy,.006)+.5;',
  '  float aperto=step(abs(u.y-.5),.5*max(sy,.006)+.0015)*step(abs(u.x-.5),.5*sx+.001);',
  /* disturbi: bande orizzontali spostate (glitch) + tremolio costante appena percettibile */
  '  float alt=6.+34.*h(vec2(floor(uT*13.),3.));',
  '  float riga=floor(u.y*uR.y/alt);',
  '  float banda=step(1.-.42*uG,h(vec2(riga,floor(uT*24.))));',
  '  uo.x+=banda*(h(vec2(riga,floor(uT*31.)))-.5)*.09*uG;',
  '  uo.x+=(n1(u.y*38.+uT*2.6)-.5)*.0011;',
  /* righe d\'interferenza che attraversano lo schermo */
  '  float il=0.;',
  '  for(int i=0;i<3;i++){float fi=float(i);float y=fract(uT*(.035+.022*fi)+fi*.41);float d=abs(u.y-y);',
  '    float k=(.35+.65*n1(uT*1.7+fi*7.));il+=exp(-d*uR.y*.28)*k;uo.x+=exp(-d*uR.y*.05)*.0045*(n1(uT*8.+fi*3.)-.5)*k;}',
  /* ologramma: le persone «respirano» di trasparenza */
  '  float fl=.88+.06*sin(uT*2.1)+.05*n1(uT*17.)-.3*uG*banda;',
  /* aberrazione cromatica ai bordi */
  '  vec2 dc=u-.5;float ca=(.0016+.010*uG)*(.25+dot(dc,dc)*4.);',
  '  vec3 col=scena(uo,fl);',
  '  if(uQ>.5){col.r=scena(uo+dc*ca+vec2(ca*.3,0.),fl).r;col.b=scena(uo-dc*ca-vec2(ca*.3,0.),fl).b;}',
  /* alone olografico attorno alle persone (crema/blu) */
  '  float pa=pers(uo).a;',
  '  float ga=(pers(uo+vec2(.011,0.)).a+pers(uo-vec2(.011,0.)).a+pers(uo+vec2(0.,.009)).a+pers(uo-vec2(0.,.009)).a)*.25;',
  '  col+=max(ga-pa,0.)*vec3(.62,.80,1.)*.42;',
  /* passata di luce che scende ogni tanto */
  '  float sw=fract(uT/8.5);float sd=u.y-(sw*1.4-.2);col+=exp(-sd*sd*700.)*vec3(1.,.86,.62)*.09;',
  /* colore delle righe d\'interferenza: crema con un filo di rosso mattone */
  '  col+=il*vec3(.98,.70,.55)*.16;',
  '  col=mix(col,col*vec3(1.08,.86,.80),clamp(il,0.,1.)*.5);',
  /* barra di ronzio del tubo che rotola piano */
  '  float hum=fract(u.y*.9-uT*.075);col*=1.-.07*smoothstep(0.,.18,hum)*smoothstep(.36,.18,hum);',
  /* scanline + maschera RGB sottile */
  '  float s=sin(u.y*uLines*3.14159);col*=mix(1.,.72+.28*s*s,.6);',
  '  if(uQ>.5){float m=mod(gl_FragCoord.x,3.);vec3 mk=m<1.?vec3(1.,.93,.93):(m<2.?vec3(.93,1.,.93):vec3(.93,.93,1.));col*=mk*1.04;}',
  /* flicker morbido + rumore */
  '  col*=.972+.028*n1(uT*14.)+.012*sin(uT*120.);',
  '  col+=(h(gl_FragCoord.xy*.731+fract(uT*7.3)*91.)-.5)*(.045+.13*uG*banda+.04*uG);',
  /* vignettatura */
  '  col*=1.-.62*pow(clamp(dot(dc,dc)*1.75,0.,1.),1.35);',
  /* accensione: lampo caldo */
  '  float lampo=1.-smoothstep(.25,.95,uOn);',
  '  col=mix(col,vec3(1.,.95,.86),lampo*.85);',
  '  col*=1.+.35*(1.-smoothstep(.6,1.,uOn))*step(.3,uOn);',
  '  vec3 spento=vec3(.032,.045,.06)+vec3(.02,.025,.03)*(1.-dot(dc,dc)*3.);',
  '  gl_FragColor=vec4(mix(spento,col,aperto*bordo),1.);',
  '}'].join('\n');

  /* ------------------------------------------------------------ montaggio */
  function monta(host,opz){
    var D=window.FINALE_DATA;
    opz=opz||{};
    var testo=opz.testo||host.getAttribute('data-ologramma-testo')||'Benvenuto in STORE // CRAFT, Aldo.';
    var firma=opz.firma||host.getAttribute('data-ologramma-firma')||'Fabrice';
    var alt=(D&&D.alt?D.alt:'Aldo Macrì dietro al bancone del suo negozio')+', come in un ologramma su uno schermo dell’app STORE // CRAFT. Scritta: «'+testo+'» Firmato '+firma+'.';
    var statica=BASE+(D&&D.statica?D.statica:'media/finale-statica.jpg');
    var t2=testo.replace(/STORE \/\/ CRAFT/,'<b>STORE&nbsp;//&nbsp;CRAFT</b>');
    // «…, Aldo.» va a capo da solo, un filo più grande
    t2=t2.replace(/,\s*([^,<>]+)$/,',<br><span class="fo-nome">$1</span>');
    host.classList.add('fo');
    host.innerHTML=
      '<figure class="fo-fig" role="img" aria-label="'+E(alt)+'">'+
        '<div class="fo-cornice">'+
          '<div class="fo-eti fo-alto" aria-hidden="true"><span class="fo-brand">STORE&nbsp;//&nbsp;CRAFT</span><span class="fo-canale">CH&nbsp;01 · OTTICA MACRÌ × FABRICE</span><span class="fo-stato"><i></i>CONNESSIONE STABILITA</span></div>'+
          '<div class="fo-schermo">'+
            '<img class="fo-statica" src="'+E(statica)+'" alt="" decoding="async">'+
            '<canvas class="fo-canvas" aria-hidden="true"></canvas>'+
            '<div class="fo-css" aria-hidden="true"></div>'+
            '<div class="fo-testo" aria-hidden="true"><p class="fo-benv">'+t2+'</p><p class="fo-firma"><span>—</span> '+E(firma)+' <em>· STORE // CRAFT</em></p></div>'+
            '<div class="fo-vetro" aria-hidden="true"></div>'+
          '</div>'+
          '<div class="fo-eti fo-basso" aria-hidden="true"><span>VIA POGGI D’ORO 23 · ROMA</span><span class="fo-segnale"><i></i><i></i><i></i><i></i></span><span class="fo-data">05·11·2026</span></div>'+
          '<button type="button" class="fo-giro" hidden>Muova il telefono · attiva il 3D</button>'+
        '</div>'+
      '</figure>';
    var fig=host.querySelector('.fo-fig'),scr=host.querySelector('.fo-schermo'),cv=host.querySelector('.fo-canvas'),
        tx=host.querySelector('.fo-testo'),btn=host.querySelector('.fo-giro'),cor=host.querySelector('.fo-cornice');
    if(!D||!D.strati){host.classList.add('fo-fermo','fo-acceso');return;}

    /* ---------- stato condiviso */
    var S={tilt:[0,0],meta:[0,0],ultimoInput:-1e9,giro:false,b0:null,g0:null,t0:0,on:0,acceso:false,g:0,
           prossimo:rnd(2.2,4.5),fine:0,forza:0,visibile:false,raf:0,q:1,scala:1,dts:[],cap:0,ultimo:0,scossa:0};

    /* ---------- immagini */
    var nomi=['sfondo','persone','bancone'],img={},caricate=0,da=0;
    nomi.forEach(function(n){
      if(!D.strati[n])return;
      da++;var im=new Image();im.onload=function(){caricate++;if(caricate===da)pronto();};
      im.onerror=function(){host.classList.add('fo-fermo','fo-acceso');};
      im.src=D.strati[n];img[n]=im;
    });

    var gl=null,prog=null,U={},ctx2d=null;
    host.__fo=S;   // solo per le prove automatiche (forzare un glitch)
    function pronto(){
      if(!RIDOTTO){
        try{gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:false,stencil:false,premultipliedAlpha:false,powerPreference:'low-power'})||
                cv.getContext('experimental-webgl');}catch(e){gl=null;}
      }else{
        try{gl=cv.getContext('webgl',{alpha:false,antialias:false,depth:false,preserveDrawingBuffer:true});}catch(e){gl=null;}
      }
      if(gl&&!initGL()){gl=null;}
      if(!gl){ctx2d=cv.getContext('2d');host.classList.add('fo-2d');}
      host.classList.add('fo-pronto');
      ridimensiona();
      if(RIDOTTO){S.on=1;S.acceso=true;host.classList.add('fo-acceso','fo-fermo-mov');disegna(0);return;}
      osserva();
    }

    function sh(tipo,src){var s=gl.createShader(tipo);gl.shaderSource(s,src);gl.compileShader(s);
      if(!gl.getShaderParameter(s,gl.COMPILE_STATUS)){if(window.console)console.warn('finale.js shader:',gl.getShaderInfoLog(s));return null;}return s;}
    function initGL(){
      var vs=sh(gl.VERTEX_SHADER,VS),fs=sh(gl.FRAGMENT_SHADER,FS);if(!vs||!fs)return false;
      prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
      if(!gl.getProgramParameter(prog,gl.LINK_STATUS))return false;
      gl.useProgram(prog);
      var b=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,b);
      gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,1,-1,-1,1,1,1]),gl.STATIC_DRAW);
      var loc=gl.getAttribLocation(prog,'p');gl.enableVertexAttribArray(loc);gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
      ['uS','uP','uB','uR','uTilt','uFit','uT','uOn','uG','uQ','uLines','uHasB'].forEach(function(n){U[n]=gl.getUniformLocation(prog,n);});
      gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
      var unit=0;
      [['sfondo','uS'],['persone','uP'],['bancone','uB']].forEach(function(c){
        var t=gl.createTexture();gl.activeTexture(gl.TEXTURE0+unit);gl.bindTexture(gl.TEXTURE_2D,t);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
        var im=img[c[0]];
        if(im)gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,im);
        else gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([0,0,0,0]));
        gl.uniform1i(U[c[1]],unit);unit++;
      });
      gl.uniform1f(U.uHasB,img.bancone?1:0);
      cv.addEventListener('webglcontextlost',function(e){e.preventDefault();ferma();gl=null;ctx2d=cv.getContext('2d');host.classList.add('fo-2d');},false);
      return gl.getError()===gl.NO_ERROR||true;
    }

    /* ---------- misure */
    function ridimensiona(){
      var r=scr.getBoundingClientRect(),dpr=Math.min(window.devicePixelRatio||1,RIDOTTO?2:1.75);
      var w=Math.max(2,Math.round(r.width*dpr*S.scala)),h=Math.max(2,Math.round(r.height*dpr*S.scala));
      if(cv.width!==w||cv.height!==h){cv.width=w;cv.height=h;}
      S.cssH=r.height;
      if(gl){
        gl.viewport(0,0,w,h);
        // cover: rapporto schermo / immagine
        var as=r.width/Math.max(1,r.height),ai=D.w/D.h;
        S.fit=as>ai?[1,ai/as]:[as/ai,1];
      }
      if(!S.raf)disegna(RIDOTTO?0:performance.now()/1000);   // fermo o in pausa: si ridisegna subito (il resize svuota il canvas)
    }

    /* ---------- disegno */
    function disegna(t){
      var tl=S.tilt;
      if(gl){
        gl.uniform2f(U.uR,cv.width,cv.height);gl.uniform2f(U.uTilt,tl[0],tl[1]);gl.uniform2f(U.uFit,S.fit[0],S.fit[1]);
        gl.uniform1f(U.uT,t);gl.uniform1f(U.uOn,S.on);gl.uniform1f(U.uG,S.g);gl.uniform1f(U.uQ,S.q);
        gl.uniform1f(U.uLines,Math.max(80,S.cssH/2.6));
        gl.drawArrays(gl.TRIANGLE_STRIP,0,4);
      }else if(ctx2d){
        var w=cv.width,h=cv.height,as=w/h,ai=D.w/D.h,dw,dh;
        if(as>ai){dw=w;dh=w/ai;}else{dh=h;dw=h*ai;}
        dw*=1.08;dh*=1.08;
        ctx2d.fillStyle='#0a1219';ctx2d.fillRect(0,0,w,h);
        ctx2d.globalAlpha=S.on;
        [['sfondo',.15],['persone',.62],['bancone',.9]].forEach(function(c){
          var im=img[c[0]];if(!im)return;
          var k=(c[1]-.6);
          ctx2d.drawImage(im,(w-dw)/2+tl[0]*k*.034*w,(h-dh)/2+tl[1]*k*.026*h,dw,dh);
        });
        ctx2d.globalAlpha=1;
      }
      // testo e cornice: un filo di parallasse anche a loro (il testo è lo strato più vicino)
      tx.style.transform='translate3d('+(tl[0]*-7).toFixed(2)+'px,'+(tl[1]*-5).toFixed(2)+'px,0)';
      if(!RIDOTTO&&cor)cor.style.transform='perspective(1400px) rotateY('+(tl[0]*2.2).toFixed(3)+'deg) rotateX('+(-tl[1]*1.8).toFixed(3)+'deg)';
    }

    /* ---------- ciclo */
    function passo(ms){
      S.raf=requestAnimationFrame(passo);
      var t=ms/1000;
      if(S.cap&&ms-S.ultimo<1000/S.cap-2)return;
      var dt=S.ultimo?Math.min(.1,(ms-S.ultimo)/1000):.016;S.ultimo=ms;
      // accensione del tubo
      if(!S.acceso){
        if(!S.t0)S.t0=t;
        S.on=clamp((t-S.t0)/1.5,0,1);
        if(S.on>=1){S.acceso=true;host.classList.add('fo-acceso');}
      }
      // input: giroscopio / mouse / deriva
      var fermo=(t-S.ultimoInput)>2.6;
      var mx=S.meta[0],my=S.meta[1];
      if(fermo){mx=Math.sin(t*.23)*.55+Math.sin(t*.07)*.2;my=Math.sin(t*.31+1.2)*.35;}
      var k=1-Math.pow(.0025,dt);   // inseguimento morbido, indipendente dai fps
      S.tilt[0]+=(mx-S.tilt[0])*k*(fermo?.35:1);S.tilt[1]+=(my-S.tilt[1])*k*(fermo?.35:1);
      // glitch occasionali
      if(S.acceso){
        if(t>S.prossimo){S.fine=t+rnd(.07,.32);S.forza=Math.random()<.18?rnd(.75,1):rnd(.25,.6);
          S.prossimo=t+(Math.random()<.25?rnd(.25,.6):rnd(3,7.5));
          if(S.forza>.5){host.classList.add('fo-scossa');clearTimeout(S.scossa);S.scossa=setTimeout(function(){host.classList.remove('fo-scossa');},180);}}
        var bersaglio=t<S.fine?S.forza:0;
        S.g+=(bersaglio-S.g)*(bersaglio>S.g?.6:.25);
      }else S.g=S.on<.7?.25:0;
      disegna(t);
      // misura delle prestazioni e degrado dolce
      if(S.acceso&&S.dts.length<120){S.dts.push(dt);
        if(S.dts.length===120){var m=S.dts.slice(20).reduce(function(a,b){return a+b;},0)/100;
          if(m>.024&&S.q>0){S.q=0;S.scala=.72;ridimensiona();S.dts=[];}
          else if(m>.024){S.cap=30;S.scala=.6;ridimensiona();}
        }}
    }
    function via(){if(!S.raf&&S.visibile&&!document.hidden){S.ultimo=0;S.raf=requestAnimationFrame(passo);}}
    function ferma(){if(S.raf){cancelAnimationFrame(S.raf);S.raf=0;}}

    function osserva(){
      if('IntersectionObserver' in window){
        new IntersectionObserver(function(v){v.forEach(function(x){S.visibile=x.isIntersecting&&x.intersectionRatio>0;S.visibile?via():ferma();});},{threshold:[0,.3]}).observe(host);
      }else{S.visibile=true;via();}
      document.addEventListener('visibilitychange',function(){document.hidden?ferma():via();});
      // mouse su desktop
      window.addEventListener('pointermove',function(e){
        if(e.pointerType==='touch'||S.giro||!S.visibile)return;
        var r=host.getBoundingClientRect(),cx=r.left+r.width/2,cy=r.top+r.height/2;
        S.meta[0]=clamp((e.clientX-cx)/(innerWidth*.45),-1,1);S.meta[1]=clamp((e.clientY-cy)/(innerHeight*.45),-1,1);
        S.ultimoInput=performance.now()/1000;
      },{passive:true});
      // scroll: lo schermo «scorre» davanti agli strati
      window.addEventListener('scroll',function(){
        if(S.giro||!S.visibile)return;
        var r=host.getBoundingClientRect();
        S.meta[1]=clamp((r.top+r.height/2-innerHeight/2)/(innerHeight*.6),-1,1);
        S.ultimoInput=performance.now()/1000;
      },{passive:true});
      // giroscopio
      var DOE=window.DeviceOrientationEvent;
      if(DOE){
        ascolta();
        // iPhone/iPad: il giroscopio va chiesto con un tocco. Il pulsante compare solo sui touch e solo se i dati non arrivano già da soli.
        var touch=window.matchMedia&&matchMedia('(pointer:coarse)').matches;
        if(typeof DOE.requestPermission==='function'&&touch){
          setTimeout(function(){if(!S.giro)btn.hidden=false;},1200);
          var chiedi=function(){btn.hidden=true;DOE.requestPermission().then(function(){}).catch(function(){});};
          btn.addEventListener('click',chiedi);
          scr.addEventListener('click',function(){if(!S.giro)chiedi();});
        }
      }
      addEventListener('resize',ridimensiona);
      if(window.ResizeObserver)new ResizeObserver(ridimensiona).observe(scr);
    }
    function ascolta(){
      window.addEventListener('deviceorientation',function(e){
        if(e.beta==null||e.gamma==null)return;
        var ang=(screen.orientation&&screen.orientation.angle)||window.orientation||0,b=e.beta,g=e.gamma,x,y;
        if(ang===90){x=b;y=-g;}else if(ang===-90||ang===270){x=-b;y=g;}else{x=g;y=b;}
        if(S.b0===null){S.g0=x;S.b0=y;}
        // il «centro» segue piano piano come si tiene il telefono
        S.g0+=(x-S.g0)*.004;S.b0+=(y-S.b0)*.004;
        S.meta[0]=clamp((x-S.g0)/18,-1,1);S.meta[1]=clamp((y-S.b0)/18,-1,1);
        S.giro=true;S.ultimoInput=performance.now()/1000;
      },true);
    }
    addEventListener('beforeprint',function(){host.classList.add('fo-acceso');});
  }

  function avvia(){[].forEach.call(document.querySelectorAll('[data-ologramma]'),function(el){if(!el.classList.contains('fo'))monta(el);});}
  window.FinaleOlografico={monta:monta,avvia:avvia};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',avvia);else avvia();
})();
