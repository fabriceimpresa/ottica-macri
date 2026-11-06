/* =====================================================================
   OTTICA MACRÌ · effetti del tema HUD di giorno (5/11/2026; versione scura in tema-hud.scuro.js)
   Si carica nel <head> SENZA defer: mette subito html.hud-boot così nessun pannello
   si vede prima della sua animazione. Tutto il resto parte a DOM pronto.
   - avvio cinematografico (solo con <body data-avvio="pieno">, testi in window.HUD_AVVIO): breve, saltabile (clic, tasto, Esc),
     una volta per sessione (si riforza con ?avvio)
   - entrata dei pannelli .hud-entra, linea di scansione, banda che scende ogni 14 s
   - numeri che scorrono: [data-conta="1250"] (+ data-formato="euro")
   - mirino al passaggio del mouse: [data-mirino="TESTO"] (+ data-mirino-oro)
   - orologio e data veri: [data-ora], [data-data], saluto: [data-saluto]
   Con prefers-reduced-motion: niente animazioni, tutto compare subito.
   ===================================================================== */
(function(){
  var H=document.documentElement;
  var RIDOTTO=!!(window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
  if(!RIDOTTO) H.classList.add('hud-boot');
  setTimeout(function(){H.classList.remove('hud-boot');},9000);   // sicurezza: mai pagina invisibile

  var rnd=function(a,b){return a+Math.random()*(b-a);};
  var salta=false,svegli=[];
  function sleep(ms){
    if(salta)return Promise.resolve();
    return new Promise(function(r){
      var t,f=function(){clearTimeout(t);var i=svegli.indexOf(f);if(i>=0)svegli.splice(i,1);r();};
      t=setTimeout(f,ms);svegli.push(f);
    });
  }
  var animazioni=[];
  function anima(el,k,o){
    if(!el.animate)return {finished:Promise.resolve()};
    var a=el.animate(k,o);animazioni.push(a);
    a.finished.then(function(){var i=animazioni.indexOf(a);if(i>=0)animazioni.splice(i,1);},function(){});
    return a;
  }
  function saltaTutto(){
    salta=true;svegli.slice().forEach(function(f){f();});
    animazioni.slice().forEach(function(a){try{a.finish();}catch(e){}});
  }

  /* ---------- orologio, data, saluto (valori veri) ---------- */
  var GIORNI=['dom','lun','mar','mer','gio','ven','sab'],MESI=['gen','feb','mar','apr','mag','giu','lug','ago','set','ott','nov','dic'];
  function due(n){return (n<10?'0':'')+n;}
  function orologio(){
    var d=new Date();
    document.querySelectorAll('[data-ora]').forEach(function(e){e.textContent=due(d.getHours())+':'+due(d.getMinutes());});
    document.querySelectorAll('[data-data]').forEach(function(e){e.textContent=GIORNI[d.getDay()]+' '+due(d.getDate())+' '+MESI[d.getMonth()]+' '+d.getFullYear();});
    document.querySelectorAll('[data-saluto]').forEach(function(e){var h=d.getHours();try{h=parseInt(new Intl.DateTimeFormat('it-IT',{hour:'numeric',hourCycle:'h23',timeZone:'Europe/Rome'}).format(d),10)}catch(x){} /* ora di Roma */ e.textContent=(h>=5&&h<13)?'Buongiorno':((h>=13&&h<18)?'Buon pomeriggio':'Buonasera');});
  }

  /* ---------- numeri che scorrono ---------- */
  // euro all'italiana con il punto anche sulle migliaia (1.250 €): Chrome con it-IT scrive «1250», Safari «1.250»
  function euroIt(n){var v=(window.PREZZI&&PREZZI.valuta)||'€';return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' '+v;}
  function formato(el,n){
    if(el.getAttribute('data-formato')==='euro'){
      return euroIt(n);
    }
    return String(n);
  }
  function conta(el){
    var fine=parseFloat(el.getAttribute('data-conta'));
    if(isNaN(fine))return;
    if(RIDOTTO||el._contato){el.textContent=formato(el,fine);return;}
    el._contato=true;
    var dur=+(el.getAttribute('data-durata')||1300),t0=null;
    function passo(t){
      if(t0===null)t0=t;
      var p=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-p,3);
      var v=fine*e;v=fine>=100?Math.round(v/10)*10:Math.round(v);
      if(p>=1||salta)v=fine;
      el.textContent=formato(el,v);
      if(v!==fine)requestAnimationFrame(passo);
    }
    requestAnimationFrame(passo);
  }
  function azzeraConta(){
    document.querySelectorAll('[data-conta]').forEach(function(el){el.setAttribute('data-finale',formato(el,parseFloat(el.getAttribute('data-conta'))));el.textContent=formato(el,RIDOTTO?parseFloat(el.getAttribute('data-conta')):0);});
  }
  function preparaConta(){
    var E=[].slice.call(document.querySelectorAll('[data-conta]'));
    E.forEach(function(el){el.setAttribute('data-finale',formato(el,parseFloat(el.getAttribute('data-conta'))));});  // la stampa mostra sempre il valore finale (CSS)
    if(RIDOTTO||!('IntersectionObserver' in window)){E.forEach(conta);return;}
    var io=new IntersectionObserver(function(v){v.forEach(function(x){if(x.isIntersecting){io.unobserve(x.target);conta(x.target);}});},{threshold:.35});
    E.forEach(function(el){io.observe(el);});
    // in stampa sempre il valore finale
    addEventListener('beforeprint',function(){E.forEach(function(el){el._contato=true;el.textContent=formato(el,parseFloat(el.getAttribute('data-conta')));});});
  }
  window.HUD={conta:conta,preparaConta:preparaConta,euro:euroIt};

  /* ---------- mirino ---------- */
  function preparaMirino(){
    if(RIDOTTO||!(window.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches))return;
    var m=document.createElement('div');m.className='hud-mirino';m.setAttribute('aria-hidden','true');
    m.innerHTML='<i class="a1"></i><i class="a2"></i><i class="a3"></i><i class="a4"></i><b></b>';
    document.body.appendChild(m);
    var attuale=null,id=0;
    function posiziona(){
      if(!attuale)return;
      var r=attuale.getBoundingClientRect(),g=7;
      m.style.left=(r.left-g)+'px';m.style.top=(r.top-g)+'px';m.style.width=(r.width+2*g)+'px';m.style.height=(r.height+2*g)+'px';
      id=requestAnimationFrame(posiziona);
    }
    document.addEventListener('pointerover',function(e){
      var t=e.target.closest&&e.target.closest('[data-mirino]');
      if(!t||t===attuale)return;
      attuale=t;cancelAnimationFrame(id);
      m.classList.toggle('oro',t.hasAttribute('data-mirino-oro'));
      m.querySelector('b').textContent=t.getAttribute('data-mirino')||'';
      posiziona();m.style.opacity='1';
      if(m.animate){
        m.querySelectorAll('i').forEach(function(c,i){
          var dx=(i%2?1:-1)*18,dy=(i<2?-1:1)*18;
          c.animate([{transform:'translate('+dx+'px,'+dy+'px)',opacity:0},{offset:.55,opacity:1},{transform:'none',opacity:1}],{duration:320,easing:'cubic-bezier(.2,.8,.2,1)'});
        });
        m.querySelector('b').animate([{opacity:0,transform:'translateX(-8px)'},{opacity:1,transform:'none'}],{duration:260,delay:120,fill:'backwards'});
      }
    });
    document.addEventListener('pointerout',function(e){
      if(!attuale)return;
      var dove=e.relatedTarget&&e.relatedTarget.closest&&e.relatedTarget.closest('[data-mirino]');
      if(dove===attuale)return;
      attuale=null;cancelAnimationFrame(id);m.style.opacity='0';
    });
  }

  /* ---------- livelli di fondo, scansione ---------- */
  function preparaFondo(interno){
    if(!document.querySelector('.hud-fx')&&!interno){
      var fx=document.createElement('div');fx.className='hud-fx';fx.setAttribute('aria-hidden','true');
      fx.innerHTML='<div class="floor"></div><div class="horizon"></div><div class="vig"></div><div class="righello su"></div><div class="righello giu"></div>';
      document.body.insertBefore(fx,document.body.firstChild);
    }
    if(RIDOTTO)return null;
    var sc=document.createElement('div');sc.className='hud-scan';sc.setAttribute('aria-hidden','true');document.body.appendChild(sc);
    var sw=document.createElement('div');sw.className='hud-sweep';sw.setAttribute('aria-hidden','true');document.body.appendChild(sw);
    return sw;
  }
  function sweep(sw){if(!sw)return;sw.classList.remove('go');void sw.offsetWidth;sw.classList.add('go');}

  /* ---------- entrata dei pannelli ---------- */
  function zoomDalCentro(p,dur,del){
    var r=p.getBoundingClientRect();
    var dx=innerWidth/2-(r.left+r.width/2),dy=Math.max(-400,Math.min(400,innerHeight/2-(r.top+r.height/2)));
    return anima(p,[
      {transform:'translate('+dx+'px,'+dy+'px) scale(.06,.012)',opacity:0,filter:'brightness(1.5) saturate(0)'},
      {offset:.28,transform:'translate('+dx*.55+'px,'+dy*.55+'px) scale(.35,.05)',opacity:1,filter:'brightness(1.35) saturate(.4)'},
      {offset:.62,transform:'translate('+dx*.06+'px,'+dy*.06+'px) scale(1.02,1.015)',opacity:1,filter:'brightness(1.12) saturate(1.1)'},
      {offset:.8,transform:'scale(.997)',filter:'brightness(1.1)'},
      {transform:'none',opacity:1,filter:'none'}],{duration:dur,delay:del||0,easing:'cubic-bezier(.22,.9,.24,1)',fill:'backwards'});
  }
  function dalBasso(p,dur,del){
    return anima(p,[
      {clipPath:'inset(100% 0 0 0)',transform:'translateY(40px)',opacity:.2,filter:'brightness(1.35) saturate(.4)'},
      {offset:.55,clipPath:'inset(30% 0 0 0)',transform:'translateY(8px)',opacity:1,filter:'brightness(1.2)'},
      {offset:.85,clipPath:'inset(0 0 0 0)',transform:'translateY(-2px)',filter:'brightness(1.15)'},
      {clipPath:'inset(0 0 0 0)',transform:'none',opacity:1,filter:'none'}],{duration:dur,delay:del||0,easing:'cubic-bezier(.22,.9,.24,1)',fill:'backwards'});
  }
  function entrata(pieno){
    var P=[].slice.call(document.querySelectorAll('.hud-entra'));
    if(RIDOTTO||!document.body.animate){H.classList.remove('hud-boot');return Promise.resolve();}
    var vis=P.filter(function(p){var r=p.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0;});
    var fuori=P.filter(function(p){return vis.indexOf(p)<0;});
    var fini=[];
    vis.forEach(function(p,i){
      var del=i*(pieno?110:60)+rnd(0,pieno?120:60);
      var a=(pieno&&(i<2||p.hasAttribute('data-zoom')))?zoomDalCentro(p,pieno?1250:700,del):dalBasso(p,pieno?950:560,del);
      fini.push(a.finished);
    });
    H.classList.remove('hud-boot');
    // quelli più in basso entrano quando ci si arriva scorrendo
    if(fuori.length&&'IntersectionObserver' in window){
      fuori.forEach(function(p){p.style.opacity='0';});
      var io=new IntersectionObserver(function(v){v.forEach(function(x){if(!x.isIntersecting)return;io.unobserve(x.target);x.target.style.opacity='';dalBasso(x.target,620,rnd(0,120));});},{threshold:.12});
      fuori.forEach(function(p){io.observe(p);});
      addEventListener('beforeprint',function(){fuori.forEach(function(p){p.style.opacity='';});});
    }
    return Promise.all(fini.map(function(f){return f.catch(function(){});}));
  }

  /* ---------- avvio cinematografico (portale) ---------- */
  function avvio(righe,titolo,sotto){
    var ov=document.createElement('div');ov.className='hud-avvio';ov.setAttribute('role','presentation');
    ov.innerHTML='<div class="centro">'+
      '<svg class="lente" viewBox="0 0 200 200" aria-hidden="true">'+
        '<circle class="tr c1" cx="100" cy="100" r="92" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000"/>'+
        '<circle class="tr c2" cx="100" cy="100" r="74" pathLength="1000" stroke-dasharray="4 10" opacity="0"/>'+
        '<circle class="tg c3" cx="100" cy="100" r="60" pathLength="1000" stroke-dasharray="180 40 60 40 260 420" stroke-dashoffset="1000"/>'+
        '<circle class="tr c4" cx="100" cy="100" r="30" pathLength="1000" stroke-dasharray="1000" stroke-dashoffset="1000"/>'+
        '<path class="tr cr" d="M100 0V34M100 166V200M0 100H34M166 100H200" opacity="0"/>'+
        '<circle cx="100" cy="100" r="4" fill="#9e3b25" class="pu" opacity="0"/>'+
      '</svg>'+
      '<div class="tit">'+titolo+'</div><div class="sotto"></div>'+
      '<div class="term"></div><div class="barra"><i></i></div></div>'+
      '<div class="salta">CLIC O TASTO PER SALTARE</div>';
    document.body.appendChild(ov);
    var chiudi=function(e){if(e&&e.type==='keydown'&&e.key==='Tab')return;saltaTutto();};
    ov.addEventListener('pointerdown',chiudi);addEventListener('keydown',chiudi);
    var q=function(s){return ov.querySelector(s);};
    var term=q('.term'),bar=q('.barra i');
    var seq=(async function(){
      anima(q('.c1'),[{strokeDashoffset:1000},{strokeDashoffset:0}],{duration:900,easing:'cubic-bezier(.6,0,.2,1)',fill:'forwards'});
      q('.c3').style.transformOrigin='100px 100px';
      anima(q('.c3'),[{strokeDashoffset:1000,transform:'rotate(0deg)'},{strokeDashoffset:0,transform:'rotate(200deg)'}],{duration:1600,easing:'cubic-bezier(.6,0,.2,1)',fill:'forwards'});
      anima(bar,[{width:'0%'},{width:'100%'}],{duration:2300,easing:'cubic-bezier(.45,.1,.4,.9)',fill:'forwards'});
      await sleep(300);
      anima(q('.c4'),[{strokeDashoffset:1000},{strokeDashoffset:0}],{duration:600,easing:'cubic-bezier(.6,0,.2,1)',fill:'forwards'});
      anima(q('.c2'),[{opacity:0},{opacity:1},{opacity:.3},{opacity:.9}],{duration:500,delay:200,fill:'forwards'});
      anima(q('.cr'),[{opacity:0},{opacity:1},{opacity:.4},{opacity:1}],{duration:400,delay:500,fill:'forwards'});
      anima(q('.pu'),[{opacity:0},{opacity:1}],{duration:200,delay:700,fill:'forwards'});
      // righe del terminale, scritte carattere per carattere
      for(var i=0;i<righe.length&&!salta;i++){
        var r=righe[i],testo='> '+r[0],k=0;
        var riga=document.createElement('div');term.appendChild(riga);
        while(k<testo.length&&!salta){k+=2;riga.textContent=testo.slice(0,k);await sleep(9);}
        riga.textContent=testo;
        if(r[1]){var ok=document.createElement('span');ok.className='ok';ok.textContent='  ['+r[1]+']';riga.appendChild(ok);}
        await sleep(110);
      }
      var t=q('.tit');t.classList.add('on');
      await sleep(320);
      var s=q('.sotto'),k2=0;
      while(k2<sotto.length&&!salta){k2++;s.textContent=sotto.slice(0,k2);await sleep(16);}
      s.textContent=sotto;
      await sleep(650);
    })();
    return seq.then(function(){
      ov.classList.add('via');
      removeEventListener('keydown',chiudi);
      return sleep(salta?0:240).then(function(){setTimeout(function(){ov.remove();},salta?0:700);});
    });
  }

  /* ---------- vita: un titolo ogni tanto sfarfalla (mai a ritmo fisso) ---------- */
  function vivo(){
    if(RIDOTTO)return;
    (function giro(){setTimeout(function(){
      if(!document.hidden){
        var T=[].slice.call(document.querySelectorAll('[data-crt]')).filter(function(e){var r=e.getBoundingClientRect();return r.bottom>0&&r.top<innerHeight;});
        if(T.length){var e=T[Math.floor(Math.random()*T.length)];e.classList.remove('crt');void e.offsetWidth;e.classList.add('crt');setTimeout(function(){e.classList.remove('crt');},600);}
      }
      giro();
    },rnd(2600,6200));})();
  }

  function parti(){
    var b=document.body,interno=b.classList.contains('hud-interno');
    orologio();setInterval(orologio,15000);
    var sw=preparaFondo(interno);
    if(!interno)azzeraConta();
    if(interno){H.classList.remove('hud-boot');sweep(sw);return;}
    preparaMirino();
    var pieno=b.getAttribute('data-avvio')==='pieno';
    var fatto=false;try{fatto=sessionStorage.getItem('om-avvio-visto')==='1';}catch(e){}
    if(/[?&]avvio\b/.test(location.search))fatto=false;
    var prima=Promise.resolve();
    if(pieno&&!fatto&&!RIDOTTO){
      try{sessionStorage.setItem('om-avvio-visto','1');}catch(e){}
      var cfg=window.HUD_AVVIO||{};
      prima=avvio(cfg.righe||[],cfg.titolo||'OTTICA MACRÌ',cfg.sotto||'');
    }
    prima.then(function(){
      salta=false;
      sweep(sw);
      return entrata(pieno&&!fatto);
    }).then(function(){preparaConta();vivo();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',parti);else parti();
})();
