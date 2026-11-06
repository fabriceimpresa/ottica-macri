/* =====================================================================
   OTTICA MACRÌ · preventivo PER IL CLIENTE come ESPERIENZA VISIVA (usato da preventivo-a.html e preventivo-b.html)
   Tutte le cifre arrivano da prezzi.js (window.PREZZI): qui non c'è nessun prezzo scritto a mano.
   Immagini e materiali: materiali.js (galleria, stato «in lavorazione») e dispositivi.js (misure dei supporti).
   <body data-piano="A"> oppure "B"; il contenuto si disegna dentro <main id="pv">.
   La versione di prima (solo testo) è in preventivo-cliente.prima-esperienza.js.
   In stampa: versione pulita, senza animazioni né anteprime dal vivo (preventivo-esperienza.css).
   ===================================================================== */
(function(){
  var P=window.PREZZI,root=document.getElementById('pv'),MAT=window.MATERIALI,DISP=window.DISPOSITIVI;
  if(!root)return;
  if(!P){root.innerHTML='<p class="pv-errore">Non trovo il file prezzi.js: deve stare nella stessa cartella di questa pagina.</p>';return;}
  var lettera=(document.body.getAttribute('data-piano')||'A').toUpperCase();
  var piano=lettera==='B'?P.pianoB:P.pianoA;
  var E=function(s){return String(s==null?'':s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c];});};
  var euro=function(n){return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g,'.')+' '+(P.valuta||'€');};  // 1.250 € uguale su Chrome e Safari
  var cifra=function(n,cls){return '<span class="pv-cifra mono '+(cls||'')+'" data-conta="'+n+'" data-formato="euro">'+E(euro(n))+'</span>';};
  var sigla=function(b){return String(b.nome).split(' · ')[0];};
  var resto=function(b){var p=String(b.nome).split(' · ');return p.length>1?p.slice(1).join(' · '):'';};
  // tempi «2–4 settimane» -> [2,4] (servono solo per sommare i tempi dei pacchetti)
  var forchetta=function(t){var m=String(t||'').match(/(\d+)\s*[–\-]\s*(\d+)/);return m?[+m[1],+m[2]]:null;};

  /* ---------- immagini: miniatura leggera (media/miniature, da materiali_controlla.py --miniature) con ripiego sull'originale ---------- */
  var url=function(p){return MAT&&MAT.url?MAT.url(p,''):encodeURI(p);};
  var mini=function(p){return MAT&&MAT.mini?url(MAT.mini(p)):url(p);};
  function img(p,o){
    o=o||{};
    var src=o.piena?url(p):mini(p);
    return '<img src="'+E(src)+'" data-orig="'+E(url(p))+'" alt="'+E(o.alt||'')+'"'+(o.cls?' class="'+o.cls+'"':'')+(o.eager?'':' loading="lazy"')+' decoding="async"'+
      ' onerror="if(this.dataset.orig&&this.src.indexOf(this.dataset.orig)<0){this.src=this.dataset.orig}else{this.style.visibility=\'hidden\'}">';
  }
  /* stato di un materiale da materiali.js ('pronto' | 'in lavorazione' | null se non c'è) */
  function stato(percorso){
    if(!MAT)return null;
    for(var i=0;i<MAT.voci.length;i++)if(MAT.voci[i].percorso===percorso)return MAT.voci[i].stato;
    return null;
  }
  function link(percorso,testo,cls){
    var lav=stato(percorso)==='in lavorazione';
    return '<a class="pv-link solo-schermo'+(cls?' '+cls:'')+'" href="'+E(url(percorso))+'">'+E(testo)+(lav?' <i class="pv-arrivo">in arrivo</i>':'')+' ›</a>';
  }

  /* ---------- immagini per ogni blocco (percorsi relativi alla radice; tutte esistenti) ---------- */
  var LOOP=['media/blackfriday/loop/01-apertura-chiaro.png','media/blackfriday/loop/02-wayfarer-chiaro.png','media/blackfriday/loop/03-aviator-chiaro.png',
            'media/blackfriday/loop/05-persol-chiaro.png','media/blackfriday/loop/07-holbrook-chiaro.png','media/blackfriday/loop/09-controllo-vista-chiaro.png'];
  var GRAFICHE=[
    ['media/storecraft/cartello-promo.png','Cartello promo'],
    ['media/blackfriday/bf-cartello-1-chiaro.png','Black Friday'],
    ['media/storecraft/cartellino.png','Cartellino prezzo'],
    ['media/storecraft/dymo.png','Etichetta DYMO']
  ];
  var MISURE={'plexi-a3':'Poster A3','plexi-a4':'Cartello A4','plexi-a5':'Cartello A5','plexi-13x18':'13×18','plexi-10x15':'10×15','plexi-a7':'A7','cubo-10':'Cubo','stanga-cartellino':'Stanghetta','dymo-11355':'DYMO'};
  /* schermate della demo V2 (tema chiaro) e render del 3D: media/preventivo-v2/ (rifatte con Playwright il 5/11).
     Percorsi scritti per intero: materiali_controlla.py --miniature li trova e fa le miniature leggere. */
  var DEMO='demo/demo-app-v2.html?embed'+(lettera==='B'?'&piano=b':'');
  var SCHERMI={  // demo dal vivo: si accende solo al clic (pagina leggera)
    base:{pc:'media/preventivo-v2/base-pc.jpg',tel:'media/preventivo-v2/base-tel.jpg',vivo:DEMO+'#creator/allestimento',dida:'Allestimento vetrine e cartellini, sui supporti veri del negozio'},
    gestione:{pc:'media/preventivo-v2/gestione-pc.jpg',tel:'media/preventivo-v2/gestione-tel.jpg',vivo:DEMO+'#gestionale/magazzino',dida:'Magazzino, carico merce e inventario con il lettore di codici'},
    admin:{pc:'media/preventivo-v2/admin-pc.jpg',tel:'media/preventivo-v2/admin-tel.jpg',vivo:DEMO+'#amministrazione/clienti',dida:'La scheda di ogni cliente, con acquisti e note'},
    social:{pc:'media/preventivo-v2/social-pc.jpg',tel:'media/preventivo-v2/social-tel.jpg',vivo:DEMO+'#promoter/post',dida:'Il post è pronto: si controlla e si pubblica'},
    clienti:{pc:'media/preventivo-v2/clienti-b-pc.jpg',tel:'media/preventivo-v2/clienti-b-tel.jpg',vivo:DEMO+'#amministrazione/clienti',dida:'Lo storico di ogni cliente, semplice come una rubrica'}
  };
  var TEL_VETRINA=lettera==='B'?'media/preventivo-v2/vetrina-b-tel.jpg':'media/preventivo-v2/vetrina-tel.jpg';
  var aTutto=function(s){return s.replace('?embed&','?').replace('?embed','');};

  /* BASE: l'app (CREATOR · allestimento vetrine) + le misure vere dei supporti.
     Il vecchio «ventaglio» di grafiche (GRAFICHE) resta qui sotto per chi lo volesse rimettere: visVentaglio(). */
  function visVentaglio(){
    var h='<div class="pv-ventaglio">';
    GRAFICHE.forEach(function(g,i){h+='<figure style="--i:'+i+'">'+img(g[0],{alt:g[1]})+'<figcaption>'+E(g[1])+'</figcaption></figure>';});
    return h+'</div>';
  }
  function visGrafiche(){
    var h='<div class="pv-vis pv-vis-grafiche">'+scenaApp('base');
    if(DISP&&DISP.trova){
      var k=.3; // px per mm (A3 = 89×126 px)
      h+='<div class="pv-misure"><div class="pv-k">Le misure vere dei tuoi supporti · in scala</div><div class="pv-misure-fila">';
      Object.keys(MISURE).forEach(function(id){
        var s=DISP.trova(id);if(!s||!s.stampa)return;
        var w=s.stampa[0],hh=s.stampa[1];
        h+='<div class="pv-mis" title="'+E(s.nome+' · '+s.uso)+'"><span class="pv-mis-r t-'+E(s.tipo)+'" style="width:'+Math.max(6,Math.round(w*k))+'px;height:'+Math.max(5,Math.round(hh*k))+'px"></span>'+
           '<b>'+E(MISURE[id])+'</b><em class="mono">'+w+'×'+hh+'</em></div>';
      });
      h+='</div><p>Ogni grafica nasce già della misura giusta per il tuo porta-prezzi, la cornice o l’etichetta (mm).</p></div>';
    }
    return h+'<div class="pv-vis-dida">'+E(SCHERMI.base.dida)+' · anche dal telefono.</div>'+
      '<div class="pv-vis-link">'+link('media/blackfriday/vetrine/anteprima.html','Le vetrine allestite')+link(aTutto(DEMO)+'#creator/cartello','Prova a fare un cartello')+'</div></div>';
  }
  function visVetrina(){
    var h='<div class="pv-vis pv-vis-vetrina"><div class="pv-app-scena pv-tab-scena"><div class="pv-tablet" data-loop><div class="pv-tablet-schermo">';
    LOOP.forEach(function(p,i){h+='<div class="pv-slide'+(i===0?' on':'')+'">'+img(p,{alt:i===0?'Il loop Black Friday sul tablet in vetrina':'',eager:i===0})+'</div>';});
    h+='</div><span class="pv-tablet-cam"></span><span class="pv-live solo-schermo"><i></i>IN VETRINA</span></div>'+
       '<div class="pv-tel" title="La playlist della vetrina, dal telefono">'+img(TEL_VETRINA,{alt:'La playlist della vetrina nell’app'})+'</div></div>';
    return h+'<div class="pv-vis-dida">Le promo scorrono da sole sul tablet in vetrina, giorno e notte · si cambiano dall’app, anche dal telefono.</div><div class="pv-vis-link">'+
      link('media/blackfriday/loop/anteprima.html','Guardalo a tutto schermo')+link(aTutto(DEMO)+'#creator/vetrina-bf','La comandi dall’app')+link('visita/vetrina-aumentata.html','Come si vede dalla strada')+'</div></div>';
  }
  /* computer + telefono con la demo V2; «Provi dal vivo» accende la demo nella rotta giusta */
  function scenaApp(id){
    var s=SCHERMI[id];
    return '<div class="pv-app-scena"><div class="pv-pc"><div class="pv-pc-schermo" data-vivo="'+E(url(s.vivo))+'">'+img(s.pc,{alt:s.dida})+
      '<button type="button" class="pv-accendi solo-schermo" aria-label="Prova la demo dal vivo">▶ Prova dal vivo</button></div><span class="pv-pc-base"></span></div>'+
      '<div class="pv-tel">'+img(s.tel,{alt:''})+'</div></div>';
  }
  function visSchermi(id){
    return '<div class="pv-vis pv-vis-app">'+scenaApp(id)+'<div class="pv-vis-dida">'+E(SCHERMI[id].dida)+' · anche dal telefono.</div></div>';
  }
  function visuale(b){
    if(b.id==='base')return visGrafiche();
    if(b.id==='vetrina')return visVetrina();
    if(SCHERMI[b.id])return visSchermi(b.id);
    return '';
  }

  document.title='Ottica Macrì · Preventivo Piano '+lettera;
  var tot=P.totale(piano), h='';
  var tmin=0,tmax=0,tempiOk=true;
  piano.blocchi.forEach(function(b){var f=forchetta(b.tempi);if(f){tmin+=f[0];tmax+=f[1];}else tempiOk=false;});
  var bozza=P.confermati?'':'<span class="bollino-bozza solo-schermo" title="I prezzi non sono ancora confermati">● BOZZA</span>';

  /* --- intestazione del documento + totale in evidenza --- */
  h+='<section class="pv-testa glass hud-entra" data-zoom>'+bozza+
     '<div class="pv-titolo"><div class="pv-eti">// Preventivo · Piano '+lettera+'</div>'+
     '<h2 data-crt>'+E(piano.nome)+'</h2><p class="hud-lead">'+E(piano.slogan)+'</p>'+
     '<div class="pv-totale-hero"><div><span class="pv-k">Tutto il Piano '+lettera+(piano.scontoPacchetto?' · con sconto pacchetto':'')+'</span>'+
       cifra(piano.scontoPacchetto?tot.scontato:tot.pieno,'enorme oro')+
       (piano.scontoPacchetto?'<span class="pv-pieno">invece di <s class="mono">'+E(euro(tot.pieno))+'</s> · '+E(P.iva)+'</span>':'<span class="pv-pieno">'+E(P.iva)+'</span>')+'</div>'+
       (tempiOk?'<div class="pv-tth"><span class="pv-k">Consegna</span><b class="mono">'+tmin+'–'+tmax+'</b><span>settimane circa</span></div>':'')+
       '<a class="hbtn pri solo-schermo" href="#cosa-ottiene">Guarda cosa ottieni ↓</a></div>'+
     '</div>'+
     '<dl class="pv-dati">'+
       '<div><dt>Per</dt><dd><b>Ottica Macrì</b> · Aldo Macrì<br>Via Poggi D’Oro 23 · 00179 Roma</dd></div>'+
       '<div><dt>Da</dt><dd><b>Fabrice</b> · STORE // CRAFT</dd></div>'+
       '<div><dt>Data</dt><dd>'+E(P.data)+'</dd></div>'+
       '<div><dt>Validità</dt><dd>'+E(P.validita)+' · '+E(P.iva)+'</dd></div>'+
     '</dl></section>';

  /* --- striscia d'apertura: il suo negozio, la vetrina, l'app, il marchio --- */
  h+='<div class="pv-striscia solo-schermo hud-entra" aria-hidden="true">'+
     '<figure>'+img('visita/visita-reale/f-vetrina-sx-l.jpg',{eager:true})+'<figcaption>Il tuo negozio</figcaption></figure>'+
     '<figure>'+img('media/blackfriday/loop/02-wayfarer-chiaro.png',{eager:true})+'<figcaption>La vetrina che si muove</figcaption></figure>'+
     '<figure>'+img(lettera==='B'?'media/preventivo-v2/home-b-pc.jpg':'media/preventivo-v2/home-pc.jpg',{eager:true})+'<figcaption>L’app del negozio</figcaption></figure>'+
     '<figure class="chiaro">'+img('media/logo/marchi6/06-ovale/png/06-ovale-colori-1000.png',{eager:true})+'<figcaption>Il tuo marchio</figcaption></figure></div>';

  /* --- come funziona: passaggi --- */
  var passi=[
    ['Scegli','Il pacchetto che preferisci. Si può partire anche da un solo blocco.'],
    ['Prepariamo','Grafiche, app e vetrina fatte su Ottica Macrì: il tuo logo, i tuoi marchi, le tue misure.'],
    ['Installiamo','In negozio, sul tuo computer, tablet e telefono. Proviamo tutto insieme.'],
    ['Si parte','Tu usi l’app ogni giorno; noi restiamo a disposizione per dubbi e novità.']
  ];
  h+='<h2 class="hud-sect">Come funziona <span class="cod">· 4 passi</span></h2><ol class="pv-passi">';
  passi.forEach(function(p,i){h+='<li class="glass hud-entra"><span class="pv-passo-n mono">0'+(i+1)+'</span><b>'+E(p[0])+'</b><span>'+E(p[1])+'</span></li>';});
  h+='</ol>';

  /* --- blocchi come scene: cosa ottiene Aldo --- */
  h+='<h2 class="hud-sect" id="cosa-ottiene">Cosa ottieni, blocco per blocco <span class="cod">· '+piano.blocchi.length+' blocchi</span></h2><div class="pv-scene">';
  piano.blocchi.forEach(function(b,i){
    var vis=visuale(b);
    h+='<article class="pv-scena glass hud-entra'+(i%2?' giro':'')+(vis?'':' senza-vis')+'">'+
       '<div class="pv-scena-testo"><span class="pv-n mono">'+(i<9?'0':'')+(i+1)+'</span>'+
       '<div class="pv-cosa"><h3>'+E(sigla(b))+(resto(b)?' <small>'+E(resto(b))+'</small>':'')+'</h3><p>'+E(b.cosa)+'</p></div>'+
       '<div class="pv-scena-cifre"><div class="pv-tempi"><span class="pv-k">Tempi</span><span class="mono">'+E(b.tempi)+'</span></div>'+
       '<div class="pv-prezzo"><span class="pv-k">Prezzo</span>'+cifra(b.prezzo)+'</div></div></div>'+
       vis+'</article>';
  });
  h+='</div>';

  /* --- il suo negozio, oggi e domani --- */
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

  /* --- marchio: logo e animazione (stato da materiali.js) --- */
  var logoStorico=stato('media/logo/storico/confronto.html'),anim=stato('media/logo/storico/animazione/avvio.html');
  h+='<section class="pv-marchio glass hud-entra"><div class="pv-marchio-img">'+img('media/logo/marchi6/06-ovale/png/06-ovale-colori-1000.png',{alt:'Il marchio di Ottica Macrì',cls:'intera'})+'</div>'+
     '<div><div class="pv-eti">// Il tuo marchio</div><h3>Il tuo marchio, dal draghetto storico</h3>'+
     '<p>Il draghetto della vetrofania di Ottica Macrì, restaurato e messo nell’ovale da bottega: è il marchio per insegna, carta e cartelli. Per app, telefono e social c’è l’icona col monocolo OM.</p>'+
     '<ul class="pv-marchio-lista">'+
       '<li class="si">Marchio · ovale da bottega + icona OM</li>'+
       '<li class="'+(logoStorico==='pronto'?'si':'arr')+'">Logo storico restaurato · '+(logoStorico==='pronto'?'pronto':'in arrivo')+'</li>'+
       '<li class="'+(anim==='pronto'?'si':'arr')+'">Animazione d’avvio · '+(anim==='pronto'?'pronta':'in arrivo')+'</li></ul>'+
     '<div class="pv-vis-link">'+link('media/logo/index.html','Il tuo marchio')+(logoStorico?link('media/logo/storico/confronto.html','Logo storico'):'')+(anim?link('media/logo/storico/animazione/avvio.html','Animazione'):'')+'</div></div></section>';

  /* --- galleria: cosa abbiamo già preparato (solo perAldo, da materiali.js) --- */
  if(MAT&&window.MaterialiVista){
    var gia=MAT.voci.filter(function(v){return v.perAldo&&!/^preventivo-[ab]\.html$/.test(v.percorso)&&v.tipo!=='pdf';});
    h+='<section class="pv-galleria solo-schermo"><h2 class="hud-sect oro">Cosa abbiamo già preparato per te <span class="cod">· '+gia.length+' materiali</span></h2>'+
       '<div class="mat-griglia">'+MaterialiVista.schede(gia)+'</div><p class="pv-nota">Tutto il materiale è anche nel portale, sezione «Tutto il materiale».</p></section>';
  }

  /* --- pacchetti cumulativi --- */
  h+='<h2 class="hud-sect oro">I pacchetti · si parte dalla base e si aggiunge <span class="cod">· scalare</span></h2>';
  h+='<div class="pv-pacchetti" style="--n:'+piano.blocchi.length+'">';
  var somma=0,smin=0,smax=0;
  piano.blocchi.forEach(function(b,i){
    somma+=b.prezzo;var f=forchetta(b.tempi);if(f){smin+=f[0];smax+=f[1];}
    var ultimo=i===piano.blocchi.length-1;
    var nome=i===0?sigla(b):(ultimo?'Completo':'+ '+sigla(b));
    h+='<article class="pv-pac glass hud-entra'+(ultimo?' top':'')+'">'+
       (ultimo?'<span class="pv-consigliato">Il più conveniente</span>':'')+
       '<div class="pv-eti">Pacchetto '+(i+1)+'</div><h3>'+E(nome)+'</h3><ul>';
    piano.blocchi.forEach(function(x,j){h+='<li class="'+(j<=i?'si':'no')+'">'+E(sigla(x))+'</li>';});
    h+='</ul><div class="pv-tot">';
    if(ultimo&&piano.scontoPacchetto){
      h+='<div class="pv-pieno">Totale pieno <s class="mono">'+E(euro(tot.pieno))+'</s></div>'+
         '<div class="pv-k">Con sconto pacchetto −'+E(piano.scontoPacchetto)+'%</div>'+cifra(tot.scontato,'grande oro')+
         '<div class="pv-risparmio">risparmi '+E(euro(tot.pieno-tot.scontato))+'</div>';
    }else{
      h+='<div class="pv-k">Totale</div>'+cifra(somma,'grande');
    }
    h+='</div>'+(tempiOk?'<div class="pv-tempo">consegna in circa <b class="mono">'+smin+'–'+smax+'</b> settimane</div>':'')+'</article>';
  });
  h+='</div>';
  if(piano.scontoPacchetto)h+='<p class="pv-nota">Lo sconto del '+E(piano.scontoPacchetto)+'% vale per il pacchetto completo. I tempi sono indicativi e contano un blocco dopo l’altro, dall’avvio del lavoro.</p>';

  /* --- FINALE OLOGRAFICO (finale/finale.js): la stretta di mano dietro al bancone, subito accanto al totale ---
     lo schermo lo disegna finale.js dentro [data-ologramma]; se finale.js manca resta solo il totale */
  var finaleOk=!!window.FINALE_DATA;
  if(finaleOk)h+='<div class="pv-finale-zona">'+
     '<section class="pv-finale hud-entra" aria-label="Ottica Macrì e STORE // CRAFT, insieme">'+
     '<h2 class="hud-sect oro">Insieme <span class="cod">· Ottica Macrì × STORE // CRAFT</span></h2>'+
     '<div data-ologramma data-ologramma-testo="Benvenuto in STORE // CRAFT, Aldo." data-ologramma-firma="Fabrice"></div>'+
     '<a class="pv-finale-apri solo-schermo" href="finale/stretta-di-mano.html">Guarda a tutto schermo ›</a></section>';

  /* --- totale in evidenza --- */
  h+='<section class="pv-totale glass hud-entra">'+
     '<div>'+bozza+'<span class="pv-k">Il Piano '+lettera+' completo</span><div class="pv-totale-nome">'+E(piano.nome)+'</div>'+
     '<ul class="pv-totale-blocchi">'+piano.blocchi.map(function(b){return '<li>'+E(sigla(b))+'</li>';}).join('')+'</ul></div>'+
     '<div class="pv-totale-cifra">'+(piano.scontoPacchetto?'<span class="pv-pieno">invece di <s class="mono">'+E(euro(tot.pieno))+'</s></span>':'')+
       cifra(piano.scontoPacchetto?tot.scontato:tot.pieno,'enorme oro')+
       '<span class="pv-k">'+E(P.iva)+(piano.scontoPacchetto?' · risparmi '+E(euro(tot.pieno-tot.scontato)):'')+'</span></div></section>';
  if(finaleOk)h+='</div>';

  /* --- canone --- */
  h+='<section class="pv-canone glass hud-entra"><div class="pv-k">Dopo la consegna · canone</div><p>'+E(piano.canone)+'</p></section>';

  /* --- schermi vetrina (Piano B) --- */
  if(lettera==='B'&&P.schermiVetrina&&P.schermiVetrina.length){
    h+='<h2 class="hud-sect">Lo schermo per la vetrina · tre fasce <span class="cod">· acquisto a parte</span></h2><div class="pv-schermi">';
    P.schermiVetrina.forEach(function(s,i){
      var cons=/consigliat/i.test(s.fascia);
      h+='<article class="pv-schermo glass hud-entra'+(cons?' top':'')+'"><div class="pv-eti">'+E(s.fascia)+'</div><h3>'+E(s.prodotto)+'</h3>'+
         '<div class="pv-fascia mono">'+E(s.prezzo)+'</div><p>'+E(s.nota)+'</p></article>';
    });
    h+='</div><p class="pv-nota">Prezzi indicativi rilevati online, da verificare all’acquisto. Lo schermo lo compra il negozio: non è compreso nel preventivo.</p>';
  }

  /* --- condizioni e firma --- */
  h+='<section class="pv-condizioni glass hud-entra"><h2 class="hud-sect">Condizioni</h2><ul>'+
     '<li>Prezzi <b>'+E(P.iva)+'</b>.</li>'+
     '<li>Preventivo valido <b>'+E(P.validita)+'</b> dal '+E(P.data)+'.</li>'+
     '<li>Si può partire da un solo blocco e aggiungere gli altri quando vuoi: ogni blocco funziona da solo.</li>'+
     '<li>Scontrini, cassa e fatture restano quelli che usi già: l’app non li sostituisce.</li>'+
     '<li>Le immagini mostrano lavori di esempio: prezzi e offerte sulle grafiche si decidono insieme.</li>'+
     '</ul><div class="pv-firme">'+
     '<div class="pv-firma"><div class="pv-k">Il preventivo è di</div><div class="nome">Fabrice · <span class="oro">STORE // CRAFT</span></div><div class="motto">COOL · EASY · SMART</div></div>'+
     '<div class="pv-firma"><div class="pv-k">Per accettazione</div><div class="riga"></div><div class="motto">Aldo Macrì · Ottica Macrì</div></div>'+
     '</div></section>';

  /* --- collegamento all'altro piano e comandi --- */
  h+=(lettera==='A'
      ?'<a class="pv-altro glass hud-entra solo-schermo" href="preventivo-b.html" data-mirino="VAI AL PIANO B"><span class="pv-k">Vuoi spendere meno?</span><b>Guarda il Piano B ›</b><span>'+E(P.pianoB.slogan)+'</span></a>'
      :'<a class="pv-altro glass hud-entra solo-schermo" href="preventivo-a.html" data-mirino="VAI AL PIANO A"><span class="pv-k">Vuoi tutto il negozio in un’unica app?</span><b>Guarda il Piano A ›</b><span>'+E(P.pianoA.slogan)+'</span></a>');
  h+='<div class="pv-comandi solo-schermo"><a class="hbtn" href="index.html">‹ Portale</a><a class="hbtn" href="index.html#materiali">☰ Tutto il materiale</a><button class="hbtn pri" type="button" onclick="window.print()">Stampa · salva in PDF</button></div>';
  root.innerHTML=h;

  /* ---------- vita: loop del tablet (solo quando si vede) e demo dal vivo al clic ---------- */
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
    var b=e.target.closest('.pv-accendi');if(!b)return;
    var box=b.parentNode,src=box.getAttribute('data-vivo');
    box.classList.add('vivo');
    box.innerHTML='<iframe src="'+E(src)+'" title="Demo dal vivo" loading="lazy"></iframe><a class="pv-apri solo-schermo" href="'+E(src.replace('?embed&','?').replace('?embed',''))+'">Apri a tutto schermo ›</a>';
  });
})();
