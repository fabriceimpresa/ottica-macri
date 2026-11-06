/* Ottica Macrì · note nascondibili.
   Ogni nota di spiegazione (.nota, .avviso) riceve un pulsante «✕ nascondi».
   Le note nascoste restano nascoste (memoria del browser) finché non si clicca «Mostra le note nascoste». */
(function(){
  var KEY='ottica-macri-note-nascoste:'+location.pathname.split('/').pop()+location.search;
  var nascoste={};
  try{nascoste=JSON.parse(localStorage.getItem(KEY)||'{}')||{};}catch(e){}
  function salva(){try{localStorage.setItem(KEY,JSON.stringify(nascoste));}catch(e){}}
  function firma(el){var t=(el.textContent||'').replace(/\s+/g,' ').trim().slice(0,60);var h=0;for(var i=0;i<t.length;i++){h=(h*31+t.charCodeAt(i))|0;}return 'n'+h;}

  var css=document.createElement('style');
  css.textContent='.nota-x{position:relative;padding-right:92px!important}'+
    '.btn-nascondi{position:absolute;top:6px;right:6px;border:1px solid #d9d3c8;background:#fff;color:#6b7078;border-radius:999px;padding:2px 10px;font:600 12px system-ui,sans-serif;cursor:pointer}'+
    '.btn-nascondi:hover{border-color:#a33a2b;color:#a33a2b}'+
    '.mostra-note{display:block;margin:20px auto 0;border:0;background:none;color:#1d5c8f;font:600 13px system-ui,sans-serif;cursor:pointer;text-decoration:underline}'+
    '@media print{.btn-nascondi,.mostra-note{display:none!important}}';
  document.head.appendChild(css);

  function prepara(){
    var note=document.querySelectorAll('.nota:not([data-tot]):not(.nota-x), .avviso:not(.nota-x)');
    note.forEach(function(el){
      if(el.closest('.pac')||el.closest('td')) return;
      var id=firma(el);
      el.classList.add('nota-x');
      if(getComputedStyle(el).display==='inline') el.style.display='block';
      var b=document.createElement('button');
      b.type='button';b.className='btn-nascondi';b.textContent='✕ nascondi';b.title='Ho letto: nascondi questa nota';
      b.addEventListener('click',function(){nascoste[id]=1;salva();el.style.display='none';aggiornaLink();});
      el.appendChild(b);
      if(nascoste[id]) el.style.display='none';
    });
    aggiornaLink();
  }
  var link=document.createElement('button');
  link.type='button';link.className='mostra-note';
  link.addEventListener('click',function(){nascoste={};salva();document.querySelectorAll('.nota-x').forEach(function(el){el.style.display='';});aggiornaLink();});
  function aggiornaLink(){
    var n=Object.keys(nascoste).length;
    link.textContent='Mostra le note nascoste ('+n+')';
    link.style.display=n?'block':'none';
    if(!link.parentNode){(document.querySelector('.pag')||document.body).appendChild(link);}
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',prepara);else prepara();
})();
