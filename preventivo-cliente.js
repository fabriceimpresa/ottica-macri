/* =====================================================================
   OTTICA MACRÌ · IL PREVENTIVO UNICO per il cliente, come ESPERIENZA VISIVA (6/11/2026)
   «STORE // CRAFT + Archivio Clienti» · STORE // CRAFT ESSENZIALE  (preventivo-b.html; preventivo-a.html rimanda qui)
   Tutte le cifre arrivano da prezzi.js (window.PREZZI.unico, .moduliExtra, .hardwareVetrina): qui non c'è nessun prezzo scritto a mano.
   Immagini e materiali: materiali.js (galleria «Tutto incluso nel pacchetto») e dispositivi.js (misure dei supporti, schermi).
   Versioni di prima: preventivo-cliente.prima-unico.js (piani A/B), .prima-esperienza.js (solo testo).
   In stampa: versione pulita, senza animazioni né anteprime dal vivo (preventivo-esperienza.css).
   ===================================================================== */
(function(){
  var P=window.PREZZI,root=document.getElementById('pv'),MAT=window.MATERIALI,DISP=window.DISPOSITIVI;
  if(!root)return;
  if(!P||!P.unico){root.innerHTML='<p class="pv-errore">Non trovo il file prezzi.js (con PREZZI.unico): deve stare nella stessa cartella di questa pagina.</p>';return;}
  var U=P.unico,EXTRA=P.moduliExtra||[],HW=P.hardwareVetrina||{proposte:[],altre:[]};
  var E=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  var euro=function(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' '+(P.valuta||'€');};  // 1.250 € uguale su Chrome e Safari
  var cifra=function(n,cls){return '<span class="pv-cifra mono '+(cls||'')+'" data-conta="'+n+'" data-formato="euro">'+E(euro(n))+'</span>';};
  var sigla=function(b){return String(b.nome).split(' · ')[0];};
  var resto=function(b){var p=String(b.nome).split(' · ');return p.length>1?p.slice(1).join(' · '):'';};
  var pieno=U.totalePieno,sconto=U.totaleScontato,risp=pieno-sconto,perc=Math.round(risp/pieno*100);
  var DA_CONCORDARE='<span class="pv-concordare">Misure e layout da concordare</span>';

  /* ---------- immagini: miniatura leggera (media/miniature) con ripiego sull'originale ---------- */
  var url=function(p){return MAT&&MAT.url?MAT.url(p,''):encodeURI(p);};
  var mini=function(p){return MAT&&MAT.mini?url(MAT.mini(p)):url(p);};
  function img(p,o){
    o=o||{};
    var src=o.piena?url(p):mini(p);
    return '<img src="'+E(src)+'" data-orig="'+E(url(p))+'" alt="'+E(o.alt||'')+'"'+(o.cls?' class="'+o.cls+'"':'')+(o.eager?'':' loading="lazy"')+' decoding="async"'+
      ' onerror="if(this.dataset.orig&&this.src.indexOf(this.dataset.orig)<0){this.src=this.dataset.orig}else{this.style.visibility=\'hidden\'}">';
  }
  function stato(percorso){
    if(!MAT)return null;
    for(var i=0;i<MAT.voci.length;i++)if(MAT.voci[i].percorso===percorso)return MAT.voci[i].stato;
    return null;
  }
  function link(percorso,testo,cls){
    var lav=stato(percorso)==='in lavorazione';
    return '<a class="pv-link solo-schermo'+(cls?' '+cls:'')+'" href="'+E(url(percorso))+'">'+E(testo)+(lav?' <i class="pv-arrivo">in arrivo</i>':'')+' ›</a>';
  }

  /* ---------- immagini per ogni blocco ---------- */
  var LOOP=['media/blackfriday/loop/01-apertura-chiaro.png','media/blackfriday/loop/02-wayfarer-chiaro.png','media/blackfriday/loop/03-aviator-chiaro.png',
            'media/blackfriday/loop/05-persol-chiaro.png','media/blackfriday/loop/07-holbrook-chiaro.png','media/blackfriday/loop/09-controllo-vista-chiaro.png'];
  var MISURE={'plexi-a3':'Poster A3','plexi-a4':'Cartello A4','plexi-a5':'Cartello A5','plexi-13x18':'13×18','plexi-10x15':'10×15','plexi-a7':'A7','cubo-10':'Cubo','stanga-cartellino':'Stanghetta','dymo-11355':'DYMO'};
  var DEMO='demo/demo-app-v2.html?embed&piano=b';
  var SCHERMI={  // demo dal vivo: si accende solo al clic (pagina leggera)
    base:{pc:'media/preventivo-v2/base-pc.jpg',tel:'media/preventivo-v2/base-tel.jpg',vivo:DEMO+'#creator',dida:'Cartelli, cartellini ed etichette sui supporti veri del negozio'},
    clienti:{pc:'media/preventivo-v2/clienti-b-pc.jpg',tel:'media/preventivo-v2/clienti-b-tel.jpg',vivo:DEMO+'#amministrazione/clienti',dida:'Lo storico di ogni cliente, semplice come una rubrica'}
  };
  var aTutto=function(s){return s.replace('?embed&','?').replace('?embed','');};

  /* computer + telefono con la demo V2; «Prova dal vivo» accende la demo nella rotta giusta */
  function scenaApp(id){
    var s=SCHERMI[id];
    return '<div class="pv-app-scena"><div class="pv-pc"><div class="pv-pc-schermo" data-vivo="'+E(url(s.vivo))+'">'+img(s.pc,{alt:s.dida})+
      '<button type="button" class="pv-accendi solo-schermo" aria-label="Prova dal vivo">▶ Prova dal vivo</button></div><span class="pv-pc-base"></span></div>'+
      '<div class="pv-tel">'+img(s.tel,{alt:''})+'</div></div>';
  }

  /* --- SEZIONE 1 · STAMPE: tre riquadri (cartelli nell'app · misure vere · etichette DYMO) --- */
  function barre(seme,w,h){  // codice a barre disegnato (finto, solo per il layout)
    var x=0,s='',n=seme;
    while(x<w-2){n=(n*9301+49297)%233280;var bw=1+(n%3),gap=1+((n>>3)%2);s+='<rect x="'+x+'" y="0" width="'+bw+'" height="'+h+'"/>';x+=bw+gap;}
    return '<svg class="dy-bar" viewBox="0 0 '+w+' '+h+'" preserveAspectRatio="none" aria-hidden="true">'+s+'</svg>';
  }
  function etichetta(cod,mm,cls,dentro,uso){
    var k=1.9,w=mm[0],h=mm[1];
    return '<figure class="dy"><div class="dy-rotolo"><div class="dy-eti '+cls+'" style="width:'+Math.round(w*k)+'px;height:'+Math.round(h*k)+'px">'+dentro+'</div></div>'+
      '<figcaption><b class="mono">'+E(cod)+'</b> '+w+'×'+h+' mm<em>'+E(uso)+'</em></figcaption></figure>';
  }
  function visDymo(){
    var h='<div class="pv-riq pv-riq-dymo"><div class="pv-k">Etichette adesive DYMO · vari layout</div><div class="dy-fila">'+
      etichetta('11354',[57,32],'l-prezzo','<b class="dy-marca">RAY-BAN</b><span class="dy-mod">RB2140 · 50□22</span>'+barre(7,90,16)+'<span class="dy-pz">€ 000,00</span>','prezzo + codice')+
      etichetta('99012',[89,36],'l-magazzino','<span class="dy-tit">CARICO MERCE · 00/00</span><b class="dy-marca">PERSOL PO3019S</b><span class="dy-mod">Col. 24/31 · Cal. 52</span>'+barre(3,150,18)+'<span class="dy-cod mono">8056597 000000</span>','magazzino')+
      etichetta('11355',[51,19],'l-astuccio','<b class="dy-marca">OAKLEY · € 000</b>'+barre(11,80,10),'astucci e cassetti')+
      etichetta('99010',[89,28],'l-busta','<span class="dy-tit">OTTICA MACRÌ · OCCHIALI PRONTI</span><b class="dy-marca">Sig. Mario Rossi</b><span class="dy-mod">ritiro dal 00/00 · busta n. 000</span>','busta cliente')+
      '</div><p>Prezzo, codice a barre, magazzino, astucci, buste dei clienti: ogni etichetta ha il suo layout, pronto da stampare.</p>'+
      '<p class="pv-escluso">Costo della stampante DYMO escluso · modello compatibile LabelWriter 450 / 450 Turbo</p>'+DA_CONCORDARE+'</div>';
    return h;
  }
  function visMisure(){
    if(!(DISP&&DISP.trova))return '';
    var k=.3,h='<div class="pv-riq pv-misure"><div class="pv-k">Le misure vere dei tuoi supporti · in scala</div><div class="pv-misure-fila">';
    Object.keys(MISURE).forEach(function(id){
      var s=DISP.trova(id);if(!s||!s.stampa)return;
      var w=s.stampa[0],hh=s.stampa[1];
      h+='<div class="pv-mis" title="'+E(s.nome+' · '+s.uso)+'"><span class="pv-mis-r t-'+E(s.tipo)+'" style="width:'+Math.max(6,Math.round(w*k))+'px;height:'+Math.max(5,Math.round(hh*k))+'px"></span>'+
         '<b>'+E(MISURE[id])+'</b><em class="mono">'+w+'×'+hh+'</em></div>';
    });
    return h+'</div><p>Ogni grafica nasce già della misura giusta per il tuo porta-prezzi, la cornice o l’etichetta (mm).</p>'+DA_CONCORDARE+'</div>';
  }
  function visStampe(){
    return '<div class="pv-vis pv-vis-stampe">'+
      '<div class="pv-riq pv-riq-app"><div class="pv-k">Cartelli in vari formati · dall’app</div>'+scenaApp('base')+
        '<div class="pv-vis-dida">'+E(SCHERMI.base.dida)+' · anche dal telefono.</div>'+
        '<div class="pv-vis-link">'+link('media/blackfriday/vetrine/anteprima.html','Le vetrine allestite')+link(aTutto(DEMO)+'#creator/cartello','Prova a fare un cartello')+'</div>'+DA_CONCORDARE+'</div>'+
      visMisure()+visDymo()+'</div>';
  }

  /* --- SEZIONE 2 · VIDEO VETRINA: tablet col loop + due proposte + tutte le alternative --- */
  function visVetrina(){
    var h='<div class="pv-vis pv-vis-vetrina"><div class="pv-app-scena pv-tab-scena"><div class="pv-tablet" data-loop><div class="pv-tablet-schermo">';
    LOOP.forEach(function(p,i){h+='<div class="pv-slide'+(i===0?' on':'')+'">'+img(p,{alt:i===0?'Il loop Black Friday in vetrina':'',eager:i===0})+'</div>';});
    h+='</div><span class="pv-tablet-cam"></span><span class="pv-live solo-schermo"><i></i>IN VETRINA</span></div></div>';
    return h+'<div class="pv-vis-dida">Le promo scorrono da sole in vetrina, giorno e notte.</div><div class="pv-vis-link">'+
      link('media/blackfriday/loop/anteprima.html','Guardalo a tutto schermo')+link('visita/vetrina-aumentata.html','Come si vede dalla strada')+'</div></div>';
  }
  function hardware(){
    var h='<div class="pv-hw"><div class="pv-hw-testa"><span class="pv-k">Lo schermo per la vetrina · due proposte di fascia media</span>'+
      '<span class="pv-extra-hw">Spese extra da verificare · non comprese nel prezzo del software</span></div><div class="pv-hw-griglia">';
    (HW.proposte||[]).forEach(function(s){
      h+='<article class="pv-hw-card"><div class="pv-eti">'+E(s.fascia)+'</div><h4>'+E(s.prodotto)+'</h4><p>'+E(s.dettagli)+'</p>'+
         '<div class="pv-hw-prezzo"><span class="pv-k">Prezzo indicativo</span><b class="mono">'+E(s.prezzo)+'</b></div></article>';
    });
    h+='</div>';
    // tutte le alternative già trovate: dispositivi.js (schermiVetrina) + prezzi.js (hardwareVetrina.altre)
    var alt=[];
    ((DISP&&DISP.schermiVetrina)||[]).forEach(function(x){alt.push({tipo:x.tipo,prodotto:x.nome,det:x.diagonale+(x.note&&x.note!=='quello scelto'?' · '+x.note:''),prezzo:x.prezzo});});
    (HW.altre||[]).forEach(function(x){alt.push({tipo:x.tipo,prodotto:x.prodotto,det:x.nota,prezzo:x.prezzo});});
    if(alt.length){
      h+='<button type="button" class="pv-alt-apri" aria-expanded="false" aria-controls="pv-alt-lista">Vedi tutte le alternative già trovate · tablet, monitor, display e cornici ('+alt.length+') ▾</button>'+
         '<ul class="pv-alt-lista" id="pv-alt-lista" hidden>'+alt.map(function(a){
           return '<li><span class="pv-alt-tipo">'+E(a.tipo)+'</span><b>'+E(a.prodotto)+'</b><span class="pv-alt-det">'+E(a.det||'')+'</span><span class="pv-alt-pz mono">'+E(a.prezzo)+'</span></li>';
         }).join('')+'</ul>';
    }
    return h+'<p class="pv-nota">Prezzi indicativi rilevati online a novembre 2026, da verificare all’acquisto. Lo schermo lo compra il negozio: non è compreso nel preventivo.</p></div>';
  }

  function visSchermi(id){
    return '<div class="pv-vis pv-vis-app">'+scenaApp(id)+'<div class="pv-vis-dida">'+E(SCHERMI[id].dida)+' · anche dal telefono.</div></div>';
  }
  function visuale(b){
    if(b.id==='base')return visStampe();
    if(b.id==='vetrina')return visVetrina();
    if(SCHERMI[b.id])return visSchermi(b.id);
    return '';
  }

  document.title='Ottica Macrì · Preventivo · '+U.nome;
  var h='';
  var bozza=P.confermati?'':'<span class="bollino-bozza solo-schermo" title="I prezzi non sono ancora confermati">● BOZZA</span>';

  /* --- intestazione del documento + totale in evidenza --- */
  h+='<section class="pv-testa pv-unico glass hud-entra" data-zoom>'+bozza+
     '<div class="pv-titolo"><div class="pv-eti">// Il tuo preventivo · un pacchetto solo</div>'+
     '<div class="pv-enfasi">'+E(U.enfasi)+'</div>'+
     '<h2 data-crt>'+E(U.nome)+'</h2><p class="hud-lead">'+E(U.slogan)+'</p>'+
     '<div class="pv-totale-hero"><div><span class="pv-k">Tutto il pacchetto · prezzo scontato</span>'+
       cifra(sconto,'enorme oro')+
       '<span class="pv-pieno">invece di <s class="mono">'+E(euro(pieno))+'</s> · <b class="pv-sconto-tag">−'+E(euro(risp))+' · −'+perc+'%</b> · '+E(P.iva)+'</span></div>'+
       '<div class="pv-tth"><span class="pv-k">Consegna</span><b class="mono">'+E(String(U.tempi).replace(/\s*settimane?/,''))+'</b><span>settimane</span></div>'+
       '<a class="hbtn pri solo-schermo" href="#cosa-ottiene">Guarda cosa ottieni ↓</a></div>'+
     '</div>'+
     '<dl class="pv-dati">'+
       '<div><dt>Per</dt><dd><b>Ottica Macrì</b> · Aldo Macrì<br>Via Poggi D’Oro 23 · 00179 Roma</dd></div>'+
       '<div><dt>Da</dt><dd><b>Fabrice</b> · STORE // CRAFT</dd></div>'+
       '<div><dt>Data</dt><dd>'+E(P.data)+'</dd></div>'+
       '<div><dt>Validità</dt><dd>'+E(P.validita)+' · '+E(P.iva)+'</dd></div>'+
     '</dl></section>';

  /* --- striscia d'apertura --- */
  h+='<div class="pv-striscia solo-schermo hud-entra" aria-hidden="true">'+
     '<figure>'+img('visita/visita-reale/f-vetrina-sx-l.jpg',{eager:true})+'<figcaption>Il tuo negozio</figcaption></figure>'+
     '<figure>'+img('media/blackfriday/loop/02-wayfarer-chiaro.png',{eager:true})+'<figcaption>La vetrina che si muove</figcaption></figure>'+
     '<figure>'+img('media/preventivo-v2/home-b-pc.jpg',{eager:true})+'<figcaption>L’app del negozio</figcaption></figure>'+
     '<figure class="chiaro">'+img('media/logo/marchi6/06-ovale/png/06-ovale-colori-1000.png',{eager:true})+'<figcaption>Il tuo marchio</figcaption></figure></div>';

  /* --- come funziona --- */
  var passi=[
    ['Confermi','Il pacchetto STORE // CRAFT + Archivio Clienti. I moduli extra si aggiungono quando vuoi.'],
    ['Prepariamo','Stampe, app e vetrina fatte su Ottica Macrì: il tuo logo, i tuoi marchi, le tue misure.'],
    ['Installiamo','In negozio, sul tuo computer, tablet e telefono. Proviamo tutto insieme.'],
    ['Si parte','Tu usi l’app ogni giorno; noi restiamo a disposizione per dubbi e novità.']
  ];
  h+='<h2 class="hud-sect">Come funziona <span class="cod">· 4 passi</span></h2><ol class="pv-passi">';
  passi.forEach(function(p,i){h+='<li class="glass hud-entra"><span class="pv-passo-n mono">0'+(i+1)+'</span><b>'+E(p[0])+'</b><span>'+E(p[1])+'</span></li>';});
  h+='</ol>';

  /* --- cosa c'è nel pacchetto: un blocco = una scena --- */
  h+='<h2 class="hud-sect" id="cosa-ottiene">Cosa c’è nel pacchetto <span class="cod">· '+U.blocchi.length+' parti · tutte incluse</span></h2><div class="pv-scene">';
  U.blocchi.forEach(function(b,i){
    var vis=visuale(b),largo=b.id==='base'||b.id==='vetrina';
    h+='<article class="pv-scena glass hud-entra'+(largo?' larga':(i%2?' giro':''))+(vis?'':' senza-vis')+'">'+
       '<div class="pv-scena-testo"><span class="pv-n mono">0'+(i+1)+'</span>'+
       '<div class="pv-cosa"><h3>'+E(sigla(b))+(resto(b)?' <small>'+E(resto(b))+'</small>':'')+'</h3><p>'+E(b.cosa)+'</p></div>'+
       '<div class="pv-scena-cifre"><div class="pv-tempi"><span class="pv-k">Nel pacchetto</span><span class="mono">✓ incluso</span></div>'+
       '<div class="pv-prezzo"><span class="pv-k">Valore</span>'+cifra(b.prezzo)+'</div></div></div>'+
       vis+(b.id==='vetrina'?hardware():'')+'</article>';
  });
  h+='</div>';

  /* --- il tuo negozio, oggi e domani --- */
  h+='<h2 class="hud-sect">Il tuo negozio · oggi e con STORE // CRAFT <span class="cod">· foto vere e 3D</span></h2>'+
     '<section class="pv-primadopo glass hud-entra">'+
     '<figure class="pv-pd prima">'+img('visita/visita-reale/f-vetrina-dx-l.jpg',{alt:'La vetrina di Ottica Macrì oggi'})+'<figcaption><b>OGGI</b> La tua vetrina, foto vera</figcaption></figure>'+
     '<span class="pv-pd-freccia" aria-hidden="true">›</span>'+
     '<figure class="pv-pd dopo">'+img('media/blackfriday/vetrine/anteprime/dx-a3-tutti-i-brand-chiaro.jpg',{alt:'Il cartello grande Black Friday',cls:'intera'})+'<figcaption><b>LA GRAFICA</b> Pronta per la vetrina destra</figcaption></figure>'+
     '<figure class="pv-pd dopo">'+img('media/preventivo-v2/3d-vetrina-dx-dopo.jpg',{alt:'La vetrina destra allestita, nel negozio in 3D'})+'<figcaption><b>IN 3D · DOPO</b> La vetrina destra allestita</figcaption></figure>'+
     '<div class="pv-pd-tit"><span class="pv-k">Il negozio ricostruito in 3D · prima e dopo</span></div>'+
     '<figure class="pv-pd prima">'+img('media/preventivo-v2/3d-generale-prima.jpg',{alt:'Il negozio in 3D com’è oggi'})+'<figcaption><b>IN 3D · PRIMA</b> Le vetrine come sono oggi</figcaption></figure>'+
     '<span class="pv-pd-freccia" aria-hidden="true">›</span>'+
     '<figure class="pv-pd dopo">'+img('media/preventivo-v2/3d-generale-dopo.jpg',{alt:'Il negozio in 3D con le vetrine allestite'})+'<figcaption><b>IN 3D · DOPO</b> Con STORE // CRAFT</figcaption></figure>'+
     '<figure class="pv-pd dopo">'+img('media/preventivo-v2/3d-vetrina-sx-dopo.jpg',{alt:'La vetrina sinistra allestita, in 3D'})+'<figcaption><b>IN 3D · DOPO</b> La vetrina sinistra</figcaption></figure>'+
     '<div class="pv-pd-link">'+link('visita/visita-reale.html','PRIMA / DOPO sulle foto vere')+link('visita/vetrina-aumentata.html','La vetrina su Street View')+link('visita/negozio-3d.html','Il negozio in 3D · ci si gira dentro')+'</div></section>';

  /* --- marchio: tutte le prove recenti (non le scartate: draghi10 e proposta nuova restano in archivio) --- */
  var PROVE=[
    ['media/logo/index.html','Il tuo marchio'],
    ['media/logo/scelta.html','Tutte le prove a confronto'],
    ['media/logo/marchi6/index.html','6 concetti di marchio'],
    ['media/logo/stili10/index.html','Il draghetto in 10 stili'],
    ['media/logo/storico/confronto.html','Logo storico restaurato'],
    ['media/logo/storico/animazione/avvio.html','Animazione d’avvio']
  ];
  h+='<section class="pv-marchio glass hud-entra"><div class="pv-marchio-img">'+img('media/logo/marchi6/06-ovale/png/06-ovale-colori-1000.png',{alt:'Il marchio di Ottica Macrì',cls:'intera'})+'</div>'+
     '<div><div class="pv-eti">// Il tuo marchio</div><h3>Il tuo marchio, dal draghetto storico</h3>'+
     '<p>Il draghetto della vetrofania di Ottica Macrì, restaurato: da qui nascono marchio, icona per app e social, animazione d’avvio. Qui sotto trovi tutte le prove fatte finora.</p>'+
     '<p class="pv-rebrand">Stile grafico del rebranding da concordare con il cliente</p>'+
     '<div class="pv-vis-link">'+PROVE.map(function(p){return link(p[0],p[1]);}).join('')+'</div></div></section>';

  /* --- TUTTO INCLUSO NEL PACCHETTO: schede di materiali.js (solo perAldo), senza visite e finale (tutto fino alla stretta di mano) --- */
  if(MAT&&window.MaterialiVista){
    var voci=MAT.voci.filter(function(v){return v.perAldo&&!/^preventivo(-[ab])?\.html$/.test(v.percorso)&&v.tipo!=='pdf';});
    var fino=-1;voci.forEach(function(v,i){if(v.percorso==='finale/stretta-di-mano.html')fino=i;});
    voci=voci.slice(fino+1).filter(function(v){return !/^demo\/demo-app-v2\.html\?piano=b/.test(v.percorso);}).map(function(v){
      if(v.percorso!=='demo/demo-app-v2.html')return v;
      var c={};for(var k in v)c[k]=v[k];
      c.titolo='App · versione STORE // CRAFT';   // il widget STORE // CRAFT: versione vera, senza la parola «demo»
      c.descr='Software di gestione stampa: cartelli in vari formati, cartellini, etichette adesive per stampanti DYMO, set di stampe pronte per la gestione del punto vendita, comodità per promozioni e operazioni, funzione Lista di stampa e Cronologia, utilità di Cassa, modulo Archivio Clienti.';
      c.percorso='demo/demo-app-v2.html?piano=b';
      return c;
    });
    h+='<section class="pv-galleria solo-schermo"><h2 class="hud-sect oro">Tutto incluso nel pacchetto <span class="cod">· '+voci.length+' elementi</span></h2>'+
       '<div class="mat-griglia">'+MaterialiVista.schede(voci)+'</div><p class="pv-nota">Visite, 3D e tutto il resto del materiale sono nel portale, sezione «Tutto il materiale».</p></section>';
  }

  /* --- FINALE OLOGRAFICO + totale --- */
  var finaleOk=!!window.FINALE_DATA;
  if(finaleOk)h+='<div class="pv-finale-zona">'+
     '<section class="pv-finale hud-entra" aria-label="Ottica Macrì e STORE // CRAFT, insieme">'+
     '<h2 class="hud-sect oro">Insieme <span class="cod">· Ottica Macrì × STORE // CRAFT</span></h2>'+
     '<div data-ologramma data-ologramma-testo="Benvenuto in STORE // CRAFT, Aldo." data-ologramma-firma="Fabrice"></div>'+
     '<a class="pv-finale-apri solo-schermo" href="finale/stretta-di-mano.html">Guarda a tutto schermo ›</a></section>';
  h+='<section class="pv-totale glass hud-entra">'+
     '<div>'+bozza+'<span class="pv-k">Il pacchetto · '+E(U.enfasi)+'</span><div class="pv-totale-nome">'+E(U.nome)+'</div>'+
     '<ul class="pv-totale-blocchi">'+U.blocchi.map(function(b){return '<li>'+E(sigla(b))+'</li>';}).join('')+'<li>Consegna '+E(U.tempi)+'</li></ul></div>'+
     '<div class="pv-totale-cifra"><span class="pv-pieno">invece di <s class="mono">'+E(euro(pieno))+'</s></span>'+
       cifra(sconto,'enorme oro')+
       '<span class="pv-k">'+E(P.iva)+' · risparmi '+E(euro(risp))+' (−'+perc+'%)</span></div></section>';
  if(finaleOk)h+='</div>';

  /* --- canone --- */
  h+='<section class="pv-canone glass hud-entra"><div class="pv-k">Dopo la consegna · canone</div><p>'+E(U.canone)+'</p></section>';

  /* --- ESTENSIONI: moduli extra singoli, scalari (cifre da prezzi.js · moduliExtra) --- */
  if(EXTRA.length){
    h+='<h2 class="hud-sect oro" id="moduli-extra">Le estensioni · moduli extra <span class="cod">· si aggiungono uno alla volta, quando vuoi</span></h2>'+
       '<p class="pv-nota pv-extra-intro">Per arrivare piano piano a STORE // CRAFT completo. Tocca un modulo per vedere come cambia il totale.</p><div class="pv-extra">';
    EXTRA.forEach(function(m){
      var ok=typeof m.prezzo==='number';
      h+='<label class="pv-mod glass hud-entra'+(ok?'':' da-definire')+'">'+
         (ok?'<input type="checkbox" class="pv-mod-cb solo-schermo" data-prezzo="'+m.prezzo+'">':'')+
         '<span class="pv-eti">Modulo extra</span><h3>'+E(sigla(m))+(resto(m)?' <small>'+E(resto(m))+'</small>':'')+'</h3><p>'+E(m.cosa)+'</p>'+
         '<span class="pv-mod-piede"><span><span class="pv-k">Tempi</span><span class="mono">'+E(m.tempi)+'</span></span>'+
         '<span class="pv-prezzo"><span class="pv-k">Prezzo</span>'+(ok?'<span class="pv-cifra mono">+ '+E(euro(m.prezzo))+'</span>':'<span class="pv-dadef">prezzo da definire</span>')+'</span></span></label>';
    });
    h+='</div><div class="pv-scala solo-schermo"><span class="pv-k">Pacchetto + moduli scelti</span><b class="mono" data-scala>'+E(euro(sconto))+'</b><span class="pv-scala-n" data-scala-n>solo il pacchetto</span></div>'+
       '<p class="pv-nota">I moduli extra non hanno lo sconto del pacchetto. Ogni modulo funziona anche da solo, sopra al pacchetto base.</p>';
  }

  /* --- condizioni e firma --- */
  h+='<section class="pv-condizioni glass hud-entra"><h2 class="hud-sect">Condizioni</h2><ul>'+
     '<li>Prezzi <b>'+E(P.iva)+'</b>.</li>'+
     '<li>Preventivo valido <b>'+E(P.validita)+'</b> dal '+E(P.data)+'.</li>'+
     '<li>Consegna del pacchetto in circa <b>'+E(U.tempi)+'</b> dall’avvio del lavoro.</li>'+
     '<li>I moduli extra si aggiungono quando vuoi, uno alla volta: ognuno ha il suo prezzo e i suoi tempi.</li>'+
     '<li>Hardware escluso: schermo o tablet per la vetrina e stampante DYMO sono spese extra da verificare.</li>'+
     '<li>Scontrini, cassa e fatture restano quelli che usi già: l’app non li sostituisce.</li>'+
     '<li>Le immagini mostrano lavori di esempio: misure, layout, prezzi e offerte sulle grafiche si decidono insieme.</li>'+
     '</ul><div class="pv-firme">'+
     '<div class="pv-firma"><div class="pv-k">Il preventivo è di</div><div class="nome">Fabrice · <span class="oro">STORE // CRAFT</span></div><div class="motto">COOL · EASY · SMART</div></div>'+
     '<div class="pv-firma"><div class="pv-k">Per accettazione</div><div class="riga"></div><div class="motto">Aldo Macrì · Ottica Macrì</div></div>'+
     '</div></section>';

  h+='<div class="pv-comandi solo-schermo"><a class="hbtn" href="index.html">‹ Portale</a><a class="hbtn" href="index.html#materiali">☰ Tutto il materiale</a><button class="hbtn pri" type="button" onclick="window.print()">Stampa · salva in PDF</button></div>';
  root.innerHTML=h;

  /* ---------- vita: loop del tablet, demo dal vivo, alternative, moduli extra ---------- */
  var fermo=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  [].forEach.call(root.querySelectorAll('[data-loop]'),function(t){
    var sl=t.querySelectorAll('.pv-slide'),i=0,timer=null;
    if(fermo||sl.length<2)return;
    function passo(){sl[i].classList.remove('on');i=(i+1)%sl.length;sl[i].classList.add('on');}
    function via(){if(!timer)timer=setInterval(passo,3200);}
    function stop(){clearInterval(timer);timer=null;}
    if('IntersectionObserver' in window)new IntersectionObserver(function(v){v.forEach(function(x){x.isIntersecting?via():stop();});},{threshold:.2}).observe(t);else via();
    document.addEventListener('visibilitychange',function(){document.hidden?stop():null;});
  });
  root.addEventListener('click',function(e){
    var a=e.target.closest('.pv-alt-apri');
    if(a){var l=document.getElementById('pv-alt-lista'),ap=l.hidden;l.hidden=!ap;a.setAttribute('aria-expanded',ap?'true':'false');a.textContent=a.textContent.replace(ap?'▾':'▴',ap?'▴':'▾');return;}
    var b=e.target.closest('.pv-accendi');if(!b)return;
    var box=b.parentNode,src=box.getAttribute('data-vivo');
    box.classList.add('vivo');
    box.innerHTML='<iframe src="'+E(src)+'" title="Demo dal vivo" loading="lazy"></iframe><a class="pv-apri solo-schermo" href="'+E(aTutto(src))+'">Apri a tutto schermo ›</a>';
  });
  var scala=root.querySelector('[data-scala]'),scalaN=root.querySelector('[data-scala-n]');
  root.addEventListener('change',function(e){
    if(!e.target.classList.contains('pv-mod-cb'))return;
    var t=sconto,n=0;
    [].forEach.call(root.querySelectorAll('.pv-mod-cb'),function(c){c.closest('.pv-mod').classList.toggle('scelto',c.checked);if(c.checked){t+=+c.getAttribute('data-prezzo');n++;}});
    if(scala)scala.textContent=euro(t);
    if(scalaN)scalaN.textContent=n?('pacchetto + '+n+(n>1?' moduli':' modulo')):'solo il pacchetto';
  });
})();
