/* =====================================================================
   OTTICA MACRÌ · CATALOGO UNICO DEI SUPPORTI (5/11/2026)
   Unica fonte per FORME e MISURE di tutto ciò che si stampa o si mostra in negozio.
   Lo leggono: l'app (demo/demo-app-v2.html, sezione cartelli), le grafiche (media/blackfriday/vetrine)
   e il 3D (visita/negozio-3d.html). Se cambi una misura qui, cambia ovunque.
   Misure in mm (area di STAMPA visibile dell'inserto). Prezzi e modelli esatti: da verificare all'ordine.
   ===================================================================== */
window.DISPOSITIVI = {
  versione: 1,
  supporti: [
    /* --- porta-prezzi e cornici da appoggio (vetrine e bancone) --- */
    { id: 'plexi-a7',    nome: 'Cavalierino plexiglass A7',   tipo: 'plexiL',    stampa: [74, 105],  orient: 'verticale', dove: ['vetrina-dx:sotto', 'vetrina-sx:sotto'], uso: 'brand + prezzo accanto al singolo occhiale' },
    { id: 'plexi-10x15', nome: 'Porta-prezzi plexiglass 10×15', tipo: 'plexiL', stampa: [100, 150], orient: 'verticale', dove: ['vetrina-sx:sotto', 'vetrina-dx:sotto', 'bancone'], uso: 'gruppo di occhiali di un brand, prezzo Black Friday' },
    { id: 'plexi-13x18', nome: 'Porta-prezzi plexiglass 13×18', tipo: 'plexiL', stampa: [130, 180], orient: 'verticale', dove: ['vetrina-sx:sopra', 'vetrina-dx:sotto'], uso: 'promo principale di un ripiano' },
    { id: 'plexi-a5',    nome: 'Porta-cartello plexiglass A5', tipo: 'plexiL',  stampa: [148, 210], orient: 'verticale', dove: ['vetrina-sx:sopra', 'bancone'], uso: 'reclame Black Friday' },
    { id: 'plexi-a4',    nome: 'Porta-cartello plexiglass A4', tipo: 'plexiL',  stampa: [210, 297], orient: 'verticale', dove: ['bancone', 'vetrina-dx:sopra'], uso: 'cartello grande da banco o vetrina' },
    { id: 'plexi-a3',    nome: 'Porta-poster plexiglass A3 a T', tipo: 'plexiT', stampa: [297, 420], orient: 'verticale', dove: ['vetrina-dx:sopra'], uso: 'pubblicità grande visibile dalla strada (% di sconto, TUTTI I BRAND)' },
    { id: 'cornice-10x15', nome: 'Cornicetta in legno 10×15',  tipo: 'cornice', stampa: [100, 150], orient: 'verticale', dove: ['vetrina-sx:sotto', 'bancone'], uso: 'cartellino elegante col brand' },
    { id: 'cornice-13x18', nome: 'Cornicetta in legno 13×18',  tipo: 'cornice', stampa: [130, 180], orient: 'verticale', dove: ['vetrina-sx:sopra'], uso: 'promo in stile tradizionale' },
    { id: 'cubo-10',     nome: 'Cubo espositore plexiglass 10 cm (4 facce)', tipo: 'cubo', stampa: [100, 100], facce: 4, dove: ['vetrina-dx:sotto'], uso: 'prodotto focus: una faccia per lato' },

    /* --- da terra e da parete --- */
    { id: 'totem-a3',    nome: 'Espositore da terra su asta (A3)', tipo: 'totem', stampa: [297, 420], orient: 'verticale', altezza: 1200, dove: ['ingresso:appena-entrati'], uso: 'accoglienza appena entrati: promo del momento' },
    { id: 'totem-a4',    nome: 'Espositore da terra su asta (A4)', tipo: 'totem', stampa: [210, 297], orient: 'verticale', altezza: 1200, dove: ['ingresso:appena-entrati'], uso: 'versione più piccola del totem' },
    { id: 'appeso-a3',   nome: 'Cartello appeso con cavetti (A3 orizzontale)', tipo: 'appeso', stampa: [420, 297], orient: 'orizzontale', dove: ['vetrina-dx:sopra', 'vestibolo'], uso: 'scritta grande sospesa' },
    { id: 'vetrofania',  nome: 'Vetrofania adesiva per il vetro', tipo: 'vetrofania', stampa: [600, 300], orient: 'orizzontale', dove: ['vetrina-dx:vetro', 'vetrina-sx:vetro'], uso: 'fascia "BLACK FRIDAY" sul vetro' },

    /* --- schermo --- */
    { id: 'tablet-13',   nome: 'Tablet 12,4"–13" in vetrina (es. Galaxy Tab S9 FE+)', tipo: 'tablet', pixel: [2560, 1600], schermo: [267, 167], ingombro: [285, 185, 6.5], orient: 'orizzontale', dove: ['vetrina-sx:sopra'], uso: 'video vetrina con il loop delle promo' },

    /* --- prezzi sulla stanghetta dell'occhiale --- */
    { id: 'stanga-bandierina', nome: 'Etichetta a bandierina (si chiude attorno alla stanghetta)', tipo: 'stanghetta', stampa: [22, 12], coda: 50, dove: ['tutti gli occhiali'], uso: 'prezzo + codice piccolo, la più discreta' },
    { id: 'stanga-cartellino', nome: 'Cartellino con filo elastico', tipo: 'stanghetta', stampa: [30, 20], dove: ['vetrine', 'mensole'], uso: 'prezzo pieno barrato + prezzo Black Friday' },
    { id: 'stanga-clip',     nome: 'Clip trasparente porta-prezzo da stanghetta', tipo: 'stanghetta', stampa: [25, 15], dove: ['mensole', 'colonna girevole'], uso: 'inserto rigido riutilizzabile, si cambia il cartoncino' },
    { id: 'dymo-11355',      nome: 'Etichetta DYMO 19×51 mm', tipo: 'dymo', stampa: [51, 19], dove: ['scatole', 'astucci', 'cassetti'], uso: 'codice a barre + modello + prezzo' },
    { id: 'dymo-99012',      nome: 'Etichetta DYMO 89×36 mm', tipo: 'dymo', stampa: [89, 36], dove: ['magazzino'], uso: 'etichetta grande per il carico merce' }
  ],

  /* ALLESTIMENTO BLACK FRIDAY deciso da Fabrice il 5/11 sera (vale per 3D, grafiche e app) */
  allestimento: {
    'vetrina-sx': {
      nome: 'Vetrina sinistra (ad angolo, 2 ripiani)',
      sopra: { ruolo: 'OFFERTE SPECIALI · tutte le reclame della promo Black Friday', supporti: ['plexi-a5', 'plexi-13x18', 'cornice-13x18', 'tablet-13'] },
      sotto: { ruolo: 'CATALOGO · 3 gruppi di occhiali di 3 brand veri (Ray-Ban + altri 2) sugli espositori, con logo del brand e prezzo Black Friday', supporti: ['plexi-10x15', 'cornice-10x15', 'plexi-a7'] },
      nota: 'Il tablet di Aldo fa da video vetrina sul ripiano sopra, nel tratto più interno della vetrina.'
    },
    'vetrina-dx': {
      nome: 'Vetrina destra (regolare, 2 ripiani, la più visibile dalla strada)',
      sopra: { ruolo: 'PUBBLICITÀ GRANDE · Black Friday con percentuale di sconto enorme e la scritta TUTTI I BRAND', supporti: ['plexi-a3', 'appeso-a3', 'vetrofania'] },
      sotto: { ruolo: 'OPERAZIONE FOCUS · un prodotto alla volta da spingere: più pezzi dello stesso, cartelli piccoli coi brand', supporti: ['cubo-10', 'plexi-a7', 'plexi-13x18'] }
    },
    'ingresso': {
      nome: 'Appena entrati',
      supporti: ['totem-a3'],
      nota: 'Il palo da terra col cartello: nel negozio vero oggi non c\'è, è una proposta.'
    },

    /* ===== INTERNO DEL NEGOZIO · PROPOSTA DA CONFERMARE (6/11/2026, agente piano allestimento) =====
       Fabrice conferma posizione per posizione in allestimento/index.html.
       I supporti NUOVI stanno qui dentro (interno.supporti) e NON nell'elenco 'supporti' qui sopra,
       così l'app (demo/v2/cartelli.js) non cambia finché Fabrice non conferma.
       Misure in mm come sopra; 'pianta' = punto in visita/negozio3d/pianta.svg (737×990 px). */
    interno: {
      stato: 'proposta da confermare',
      supporti: [
        { id: 'plexi-mensola',    nome: 'Cavalierino plexiglass da mensola (orizzontale)', tipo: 'plexiL', stampa: [70, 50], orient: 'orizzontale', uso: 'nome del brand su ogni mensola di vetro' },
        { id: 'parete-a4',        nome: 'Porta-cartello A4 da parete (plexi con distanziali)', tipo: 'parete', stampa: [210, 297], orient: 'verticale', uso: 'cartello fisso in zona attesa' },
        { id: 'poster-50x70',     nome: 'Cornice a scatto 50×70 da parete', tipo: 'parete', stampa: [500, 700], orient: 'verticale', uso: 'poster grande in corridoio' },
        { id: 'vetrofania-porta', nome: 'Vetrofania piccola per la porta a vetro (A5)', tipo: 'vetrofania', stampa: [148, 210], orient: 'verticale', uso: 'orari + QR Instagram/Facebook' },
        { id: 'monitor-postazione', nome: 'Monitor della postazione STORE//CRAFT (24")', tipo: 'monitor', pixel: [1920, 1080], schermo: [531, 299], orient: 'orizzontale', uso: 'l\'app di Aldo al bancone' },
        { id: 'schermo-luxottica', nome: 'Schermo verticale nella nicchia Luxottica', tipo: 'schermo', pixel: [1080, 1920], schermo: [400, 710], orient: 'verticale', daVerificare: true,
          uso: 'loop verticale con le nostre grafiche', nota: 'misura stimata (~32"); da verificare se Luxottica permette di caricare contenuti propri' },
        { id: 'stampante-dymo',   nome: 'Stampante DYMO LabelWriter', tipo: 'periferica', usa: ['dymo-11355', 'dymo-99012'], uso: 'etichette con codice a barre' },
        { id: 'lettore-barcode',  nome: 'Lettore di codici a barre USB', tipo: 'periferica', uso: 'vendita e carico merce veloci' },
        { id: 'stampante-a4',     nome: 'Stampante A4 di Aldo (da verificare che ci sia)', tipo: 'periferica', uso: 'stampa cartelli A4, A5, 10×15, A7 su cartoncino' }
      ],
      posizioni: [
        { id: 'porta',          nome: 'Porta a vetro (sempre aperta)', pianta: [372, 236], foto: 'visita/visita-reale/f-vestibolo-l.jpg',
          supporti: [['vetrofania-porta', 1]], contenuto: 'orari del negozio + QR di Instagram e Facebook (orari veri da chiedere ad Aldo)' },
        { id: 'vetrina-interna-69', nome: 'Vetrina interna «Offerta 69» (retro della vetrina destra)', pianta: [517, 262], foto: 'visita/visita-reale/f-vetrina-dentro-l.jpg',
          supporti: [['plexi-10x15', 2], ['stanga-bandierina', 12]], contenuto: 'fascia di prezzo fissa (es. «tutto a 69 €»): cifra da confermare' },
        { id: 'postazione',     nome: 'Postazione STORE//CRAFT (lato Aldo del bancone)', pianta: [258, 352], foto: 'visita/visita-reale/f-dietro-bancone-l.jpg', dopo: 'visita/negozio3d/controllo/giro2-bancone.jpg',
          supporti: [['monitor-postazione', 1], ['stampante-dymo', 1], ['lettore-barcode', 1], ['stampante-a4', 1]], contenuto: 'l\'app; la DYMO stampa le etichette 19×51 (astucci, cassetti) e 89×36 (magazzino)' },
        { id: 'bancone-promo',  nome: 'Bancone · cartello promo verso il cliente', pianta: [292, 410], foto: 'visita/visita-reale/f-bancone-l.jpg', dopo: 'visita/negozio3d/controllo/giro2-bancone.jpg',
          supporti: [['plexi-a4', 1]], alternativa: 'plexi-a5', contenuto: 'la promo del momento (Black Friday, poi stagionale)' },
        { id: 'bancone-prezzi', nome: 'Bancone · porta-prezzi accessori e servizi', pianta: [292, 510], foto: 'visita/visita-reale/f-muro-l.jpg',
          supporti: [['plexi-a7', 2], ['plexi-10x15', 1]], contenuto: 'A7: catenelle, spray, astucci con prezzo · 10×15: listino servizi (controllo vista, montaggio lenti)' },
        { id: 'colonna-oakley', nome: 'Colonna girevole Oakley (sul braccio del bancone)', pianta: [324, 592], foto: 'visita/visita-reale/f-bancone-l.jpg',
          supporti: [['stanga-clip', 20], ['plexi-a7', 1]], contenuto: 'clip col prezzo su ogni occhiale + cavalierino «Oakley da … €» sul piano' },
        { id: 'vetrine-muro',   nome: 'Vetrine a muro dietro il bancone (libreria, Unika, modellini, angolo)', pianta: [140, 500], foto: 'visita/visita-reale/f-muro-l.jpg',
          supporti: [['plexi-a7', 6], ['stanga-bandierina', 20]], contenuto: 'cavalierino col brand e «da … €» per ripiano + bandierina prezzo sugli occhiali' },
        { id: 'parete-sole',    nome: 'Parete occhiali da sole (5 mensole di vetro)', pianta: [588, 405], foto: 'visita/visita-reale/f-parete-l.jpg',
          supporti: [['stanga-bandierina', 35], ['plexi-mensola', 5]], extra: 'stanga-cartellino (solo in promo: prezzo barrato + prezzo nuovo)',
          contenuto: 'bandierina discreta sulla stanghetta per ogni occhiale + cavalierino orizzontale col brand su ogni mensola' },
        { id: 'colonna-guess',  nome: 'Colonna girevole Guess', pianta: [566, 526], foto: 'visita/visita-reale/f-sedie-l.jpg',
          supporti: [['stanga-clip', 20], ['plexi-a7', 1]], contenuto: 'come la colonna Oakley: clip prezzo + cavalierino del brand' },
        { id: 'sedie',          nome: 'Zona sedie / attesa', pianta: [574, 612], foto: 'visita/visita-reale/f-sedie-l.jpg',
          supporti: [['parete-a4', 1]], contenuto: '«Controllo della vista» (testo di Aldo) + QR per lasciare una recensione Google (oggi 0 recensioni)' },
        { id: 'totem-rayban',   nome: 'Totem Ray-Ban (fondo a destra)', pianta: [555, 690], foto: 'visita/visita-reale/f-corridoio-l.jpg',
          supporti: [['stanga-bandierina', 12]], contenuto: 'solo i prezzi sulla stanghetta: il totem è del brand e non si copre' },
        { id: 'luxottica',      nome: 'Schermo verticale Luxottica (nicchia, parete di fondo)', pianta: [453, 700], foto: 'visita/visita-reale/f-corridoio-l.jpg',
          supporti: [['schermo-luxottica', 1]], contenuto: 'versione verticale (1080×1920) del loop del tablet: promo, brand, servizi' },
        { id: 'corridoio',      nome: 'Corridoio verso il laboratorio', pianta: [349, 790], foto: 'visita/visita-reale/f-corridoio-l.jpg',
          supporti: [['poster-50x70', 1]], contenuto: 'poster di un brand o dei servizi del laboratorio (al posto del poster di oggi)' }
      ]
    }
  },

  /* SCHERMO VETRINA: tablet scelto + ALTERNATIVE (Fabrice 6/11). Prezzi INDICATIVI trovati online, da verificare all'acquisto:
     NON sono i prezzi del preventivo (quelli stanno in prezzi.js e li decide Fabrice alla fine). Fonti: ricerca/schermi-vetrina-2026-11.md */
  schermiVetrina: [
    { id: 'tab-s9fe-plus', scelto: true, nome: 'Tablet Samsung Galaxy Tab S9 FE+ 12,4"', tipo: 'tablet', diagonale: '12,4" · 31 cm', note: 'quello scelto', prezzo: '~499 € in offerta su Amazon, altrimenti 550–690 €' },
    { id: 'hikvision-ds-d6022fn-b', nome: 'Hikvision DS-D6022FN-B', tipo: 'schermo Android', diagonale: '21,5" · 55 cm', note: 'Android, Full HD, si comanda da remoto', prezzo: '~290 € (249,99 £)' },
    { id: 'ebay-android-215', nome: 'Display Android 21,5" (eBay)', tipo: 'schermo Android', diagonale: '21,5" · 55 cm', note: 'da parete', prezzo: '~298 €' },
    { id: 'iiyama-s2225as-b1p', nome: 'iiyama ProLite S2225AS-B1P', tipo: 'schermo Android', diagonale: '21,5" · 55 cm', note: 'il più professionale: Android 14, Wi-Fi, 500 nit, acceso 24 ore su 24, verticale', prezzo: '~347 € + spedizione' },
    { id: 'lg-22sm3g-b', nome: 'LG 22SM3G-B', tipo: 'schermo signage', diagonale: '21,5" · 55 cm', note: 'Wi-Fi integrato', prezzo: '~423 €' }
  ],

  trova: function (id) { for (var i = 0; i < this.supporti.length; i++) if (this.supporti[i].id === id) return this.supporti[i]; return null; }
};
