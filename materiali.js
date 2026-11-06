/* =====================================================================
   OTTICA MACRÌ · ELENCO UNICO DI TUTTO IL MATERIALE (5/11/2026)
   Lo leggono: index.html (sezione «TUTTO IL MATERIALE», #materiali)
               preventivo-b.html = preventivo unico (galleria «Tutto incluso nel pacchetto», dal 6/11).
   Un materiale nuovo si aggiunge SOLO qui: compare da solo nel portale e nei preventivi.

   COME AGGIUNGERE UNA VOCE
   1. Trova il gruppo giusto qui sotto (chiave «gruppo») e copia una voce simile.
   2. Compila i campi:
        titolo      testo breve sulla scheda
        descr       una riga per Aldo (semplice, niente parole tecniche)
        percorso    percorso RELATIVO ALLA RADICE del progetto (es. 'visita/negozio-3d.html');
                    si possono aggiungere ?parametri e #ancore; spazi scritti normali (ci pensa la pagina)
        tipo        'pagina' | 'pdf' | 'video' | 'immagine' | 'cartella' | 'gif' | 'documento'
        miniatura   percorso di un'immagine ESISTENTE (png/jpg/svg) oppure null (si vede un'icona)
        perAldo     true = si mostra al cliente · false = solo con AREA SVILUPPO attiva
        stato       'pronto' | 'in lavorazione'   (in lavorazione = badge, il file può non esserci ancora)
        copre       (facoltativo) cartelle o file che questa voce «rappresenta», per materiali_controlla.py
   3. Lancia  python materiali_controlla.py  : dice cosa manca nell'elenco e quali percorsi non esistono.
      python materiali_controlla.py --miniature  rifà anche le miniature leggere in media/miniature/.
   ===================================================================== */
window.MATERIALI = {
  aggiornato: '6 novembre 2026',   // FASE 1: copia prima in materiali.prima-fase1.js

  gruppi: [
    { id: 'visite',    nome: 'Visite e 3D',                         ico: '🏬' },
    { id: 'app',       nome: 'App demo',                            ico: '📱' },
    { id: 'grafiche',  nome: 'Grafiche e allestimento vetrine',     ico: '🖼' },
    { id: 'logo',      nome: 'Logo e animazione',                   ico: '🐉' },
    { id: 'video',     nome: 'Video',                               ico: '🎬' },
    { id: 'pdf',       nome: 'PDF e preventivi',                    ico: '📄' },
    { id: 'lavoro',    nome: 'Ricerche e documenti di lavoro',      ico: '🗂' }
  ],

  voci: [
    /* ------------------------------------------------ VISITE E 3D */
    { gruppo: 'visite', titolo: 'Visita del negozio · si sceglie da qui', descr: 'La porta d’ingresso a tutte le visite: foto vere, Street View e 3D.',
      percorso: 'visita/index.html', tipo: 'pagina', miniatura: 'visita/visita-reale/f-vetrina-dx-l.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Il tuo negozio, oggi', descr: 'Le foto vere del tuo negozio, 16 tappe dalla facciata al bancone, con gli oggetti STORE // CRAFT al loro posto: PRIMA e DOPO.',
      percorso: 'visita/visita-reale.html', tipo: 'pagina', miniatura: 'visita/visita-reale/f-facciata-l.jpg', perAldo: true, stato: 'pronto',
      copre: ['visita/visita-reale/'] },
    { gruppo: 'visite', titolo: 'La facciata, di sera', descr: 'La prima tappa: l’insegna OTTICA e le due vetrine allestite per il Black Friday.',
      percorso: 'visita/visita-reale.html#tappa=facciata', tipo: 'pagina', miniatura: 'visita/visita-reale/f-facciata-l.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Vetrine dalla strada', descr: 'Le due vetrine di sera, misurate col foglio A4: allestimento Black Friday in grandezza vera (sinistra, destra, destra da vicino).',
      percorso: 'visita/visita-reale.html#tappa=strada-sx', tipo: 'pagina', miniatura: 'visita/visita-reale/f-strada-dx-l.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Vetrina sinistra da vicino', descr: 'I due ripiani della vetrina d’angolo: offerte sopra, catalogo Ray-Ban, Persol e Oakley sotto.',
      percorso: 'visita/visita-reale.html#tappa=vetrina-sx-vicino', tipo: 'pagina', miniatura: 'visita/visita-reale/f-vetrina-sx-vicino-l.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Dietro il bancone', descr: 'Il tuo punto di vista, con la postazione STORE // CRAFT: monitor, DYMO e lettore.',
      percorso: 'visita/visita-reale.html#tappa=dietro-bancone', tipo: 'pagina', miniatura: 'visita/visita-reale/f-dietro-bancone-l.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Passeggiata nel negozio', descr: 'Il giro video dentro il negozio: si cammina avanti e indietro trascinando. Sotto il video ci sono le altre 4 passeggiate.',
      percorso: 'visita/visita-reale.html#giro', tipo: 'video', miniatura: 'visita/visita-reale/giro-poster.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Passeggiata: dalla strada al negozio', descr: 'Dal marciapiede, attraverso il vestibolo e la porta a vetro (volti sfocati).',
      percorso: 'visita/visita-reale.html#giro=giro-ingresso', tipo: 'video', miniatura: 'visita/visita-reale/giro-ingresso-poster.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Passeggiata: sedie e parete', descr: 'Dal corridoio alle sedie, la parete Tom Ford e il bancone.',
      percorso: 'visita/visita-reale.html#giro=giro-sedie', tipo: 'video', miniatura: 'visita/visita-reale/giro-sedie-poster.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Passeggiata: dal bancone alla vetrina', descr: 'Le vetrine a muro, l’espositore Ray-Ban e la parete degli occhiali da sole.',
      percorso: 'visita/visita-reale.html#giro=giro-banco', tipo: 'video', miniatura: 'visita/visita-reale/giro-banco-poster.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Vetrina aumentata · Street View', descr: 'La tua vetrina dalla strada, con i cartelli e il tablet già al loro posto.',
      percorso: 'visita/vetrina-aumentata.html', tipo: 'pagina', miniatura: 'visita/visita-reale/f-vetrina-sx-l.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Vetrina aumentata · al bancone', descr: 'La stessa visita, già posizionata davanti al bancone.',
      percorso: 'visita/vetrina-aumentata.html#punto=banco', tipo: 'pagina', miniatura: 'visita/visita-reale/f-bancone-l.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Il negozio in 3D · versione ALTA', descr: 'Per PC potente o Mac M1. Ottica Macrì ricostruita in 3D, con le vetrine misurate col foglio A4: si parte dalla strada di sera (insegna OTTICA · Aldo Macrì) e ci si gira dentro. Con l’interruttore DOPO le vetrine diventano piene e ordinate, con le grafiche Black Friday; vista «Dietro il bancone» con la postazione STORE // CRAFT. Tasto rosso «MIX REALTÀ»: foto vere e giro video proiettati sul 3D con look da pellicola, non si capisce più cosa è vero. A destra il pannello QUALITÀ (Foto · Alta · Media · Leggera, scelta da sola in base al computer): in «Foto», stando fermi, l’immagine si pulisce come una fotografia e «Scatta foto» salva un’immagine grande 3840×2160.',
      percorso: 'visita/negozio-3d.html', tipo: 'pagina', miniatura: 'media/preventivo-v2/3d-generale-dopo.jpg', perAldo: true, stato: 'pronto',
      copre: ['visita/negozio3d/'] },
    { gruppo: 'visite', titolo: 'Il negozio in 3D · versione UNIVERSALE', descr: 'Lo stesso negozio in 3D per qualsiasi PC e per il telefono: più leggero ma sempre curato (luce calda, ombre morbide sotto i mobili), frecce grandi da toccare per camminare, punti di vista in una riga che scorre col dito, MIX REALTÀ in versione leggera. È quella da pubblicare online.',
      percorso: 'visita/negozio-3d-universale.html', tipo: 'pagina', miniatura: 'media/preventivo-v2/3d-generale-dopo.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'visite', titolo: 'Foto del negozio (originali scelti)', descr: 'Le foto scattate in negozio, prima della sfocatura per la privacy.',
      percorso: 'foto-negozio/foto/', tipo: 'cartella', miniatura: 'foto-negozio/provini/IMG_9473.jpg', perAldo: false, stato: 'pronto',
      copre: ['foto-negozio/foto/', 'foto-negozio/provini/', 'foto-negozio/fotogrammi/'] },
    { gruppo: 'visite', titolo: '3D · controllo con le foto vere', descr: 'Confronti render/foto usati per far somigliare il 3D al negozio vero.',
      percorso: 'visita/negozio3d/controllo/', tipo: 'cartella', miniatura: 'visita/negozio3d/controllo/confronto-c9476.jpg', perAldo: false, stato: 'in lavorazione' },
    { gruppo: 'visite', titolo: '3D · prova arredi', descr: 'Pagina di prova dei mobili del 3D.',
      percorso: 'visita/negozio3d/prova-arredi.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'in lavorazione' },
    { gruppo: 'visite', titolo: '3D · prova materiali', descr: 'Pagina di prova di legni, pavimenti e muri del 3D.',
      percorso: 'visita/negozio3d/prova-materiali.html', tipo: 'pagina', miniatura: 'visita/negozio3d/_anteprime_tex/radica.jpg', perAldo: false, stato: 'in lavorazione' },
    { gruppo: 'visite', titolo: '3D · prova occhiali', descr: 'Pagina di prova degli occhiali in 3D sugli espositori.',
      percorso: 'visita/negozio3d/prova-occhiali.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'in lavorazione' },
    { gruppo: 'visite', titolo: '3D · versione scura (archivio)', descr: 'Il negozio 3D col tema scuro di prima.',
      percorso: 'tema-scuro/negozio-3d.scuro.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },

    /* ------------------------------------------------ APP DEMO */
    { gruppo: 'app', titolo: 'La stretta di mano · il finale', descr: 'Tu e Fabrice dietro al bancone, come su uno schermo dell’app: inclina il telefono e l’immagine prende profondità.',
      percorso: 'finale/stretta-di-mano.html', tipo: 'pagina', miniatura: 'finale/media/finale-statica.jpg', perAldo: true, stato: 'pronto',
      copre: ['finale/'] },
    { gruppo: 'app', titolo: 'Demo app · versione STORE // CRAFT', descr: 'Clone fedele di STORE // CRAFT per Ottica Macrì (5/11 sera): cartelli A4 a due cartelli, promo stagionali, cartellini, etichette DYMO 57×32, loghi personali, stampe pronte con STAMPA VERA alla misura giusta, lista di stampa, cronologia, utilità cassa; i dati restano nel browser (RICOMINCIA azzera). Più vetrina digitale, magazzino, clienti, social.',
      percorso: 'demo/demo-app-v2.html', tipo: 'pagina', miniatura: 'media/preventivo-v2/home-pc.jpg', perAldo: true, stato: 'pronto',
      copre: ['demo/v2/'] },
    { gruppo: 'app', titolo: 'Demo STORE // CRAFT · Piano B', descr: 'La versione essenziale: cartelli, video vetrina e archivio clienti.',
      percorso: 'demo/demo-app-v2.html?piano=b', tipo: 'pagina', miniatura: 'media/preventivo-v2/home-b-pc.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'app', titolo: 'Vecchia demo v1 · Piano A (archivio)', descr: 'La prima demo scura, superata dalla v2 (6/11 FASE 1): solo archivio.',
      percorso: 'demo/demo-app.html', tipo: 'pagina', miniatura: 'media/demo/vendo-desktop.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'app', titolo: 'Vecchia demo v1 · Piano B (archivio)', descr: 'La prima demo del Piano B, superata dalla v2: solo archivio.',
      percorso: 'demo/demo-app.html?piano=b', tipo: 'pagina', miniatura: 'media/demo-b/vetrina-desktop.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'app', titolo: 'Schermate della vecchia demo v1 · Piano A (archivio)', descr: 'Le pagine dell’app fotografate: computer, tablet e telefono.',
      percorso: 'media/demo/', tipo: 'cartella', miniatura: 'media/demo/magazzino-desktop.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'app', titolo: 'Schermate della vecchia demo v1 · Piano B (archivio)', descr: 'Le pagine dell’app del Piano B fotografate.',
      percorso: 'media/demo-b/', tipo: 'cartella', miniatura: 'media/demo-b/clienti-desktop.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'app', titolo: 'Schermate per i preventivi · demo V2 e 3D', descr: 'Le pagine della demo STORE // CRAFT (tema chiaro, computer e telefono) e i render del 3D prima/dopo usati nei preventivi.',
      percorso: 'media/preventivo-v2/', tipo: 'cartella', miniatura: 'media/preventivo-v2/3d-vetrina-dx-dopo.jpg', perAldo: false, stato: 'pronto' },
    { gruppo: 'app', titolo: 'Tutte le schermate della demo', descr: 'Archivio completo delle schermate (anche prove e cornici).',
      percorso: 'demo/screenshot/', tipo: 'cartella', miniatura: 'demo/screenshot/statistiche-desktop.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'app', titolo: 'Demo app · versione scura (archivio)', descr: 'La demo col tema scuro di prima.',
      percorso: 'tema-scuro/demo-app.scuro.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },

    /* ------------------------------------------------ GRAFICHE E ALLESTIMENTO VETRINE */
    { gruppo: 'grafiche', titolo: 'Il loop del tablet in vetrina', descr: 'Le promo Black Friday che scorrono sul tablet, come le vedranno i passanti. Chiaro o scuro.',
      percorso: 'media/blackfriday/loop/anteprima.html', tipo: 'pagina', miniatura: 'media/blackfriday/loop/01-apertura-chiaro.png', perAldo: true, stato: 'pronto',
      copre: ['media/blackfriday/loop/'] },
    { gruppo: 'grafiche', titolo: 'Vetrine allestite · Black Friday', descr: 'Tutti i cartelli delle due vetrine, alla misura vera di ogni porta-prezzi e cornice.',
      percorso: 'media/blackfriday/vetrine/anteprima.html', tipo: 'pagina', miniatura: 'media/blackfriday/vetrine/anteprime/dx-a3-tutti-i-brand-chiaro.jpg', perAldo: true, stato: 'pronto',
      copre: ['media/blackfriday/vetrine/'] },
    { gruppo: 'grafiche', titolo: 'Inserto modello A5 · rifatto da zero', descr: 'Un esempio di cartello per il plexiglass A5 in vetrina, con un occhiale vero ritagliato dalle foto del negozio: 3 versioni (nero e oro, chiaro elegante, audace) e simulazione in vetrina. Prezzi d’esempio.',
      percorso: 'media/inserto-modello/index.html', tipo: 'pagina', miniatura: 'media/inserto-modello/anteprime/inserto-a5-chiaro-elegante.jpg', perAldo: false, stato: 'in lavorazione',
      copre: ['media/inserto-modello/'] },
    { gruppo: 'grafiche', titolo: 'Gli stili delle stampe', descr: 'Gli stessi cartelli, cartellini e slide in 3 stili: Bottega romana, Nero e oro, Luminoso moderno. Chiari o scuri.',
      percorso: 'demo/v2/stili-anteprima.html', tipo: 'pagina', miniatura: 'media/stili/tavola-stili.jpg', perAldo: true, stato: 'pronto',
      copre: ['media/stili/'] },
    { gruppo: 'grafiche', titolo: 'Cartello Black Friday', descr: 'Il cartello grande per la vetrina e il bancone.',
      percorso: 'media/blackfriday/bf-cartello-1-chiaro.png', tipo: 'immagine', miniatura: 'media/blackfriday/bf-cartello-1-chiaro.png', perAldo: true, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Locandina A4 Black Friday', descr: 'La locandina con la modella, da mettere in vetrina.',
      percorso: 'media/blackfriday/bf-a4-modella-chiaro.png', tipo: 'immagine', miniatura: 'media/blackfriday/bf-a4-modella-chiaro.png', perAldo: true, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Cartellino prezzo Black Friday', descr: 'Il cartellino piccolo accanto all’occhiale.',
      percorso: 'media/blackfriday/bf-cartellino-1-chiaro.png', tipo: 'immagine', miniatura: 'media/blackfriday/bf-cartellino-1-chiaro.png', perAldo: true, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Slide per lo schermo', descr: 'Una delle slide per il tablet o lo schermo in negozio.',
      percorso: 'media/blackfriday/bf-slide-1-chiaro.png', tipo: 'immagine', miniatura: 'media/blackfriday/bf-slide-1-chiaro.png', perAldo: true, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Tutte le grafiche Black Friday', descr: 'Cartelli, cartellini e slide in versione chiara e scura.',
      percorso: 'media/blackfriday/', tipo: 'cartella', miniatura: 'media/blackfriday/bf-cartello-2-chiaro.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Cartello promo STORE // CRAFT', descr: 'Un cartello promo fatto con l’app, pronto da stampare.',
      percorso: 'media/storecraft/cartello-promo.png', tipo: 'immagine', miniatura: 'media/storecraft/cartello-promo.png', perAldo: true, stato: 'pronto',
      copre: ['media/storecraft/'] },
    { gruppo: 'grafiche', titolo: 'Cartello saldi', descr: 'Il cartello dei saldi, con il prezzo pieno barrato.',
      percorso: 'media/storecraft/cartello-saldi.png', tipo: 'immagine', miniatura: 'media/storecraft/cartello-saldi.png', perAldo: true, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Cartellino prezzo', descr: 'Il cartellino classico per gli occhiali in vetrina.',
      percorso: 'media/storecraft/cartellino.png', tipo: 'immagine', miniatura: 'media/storecraft/cartellino.png', perAldo: true, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Etichetta DYMO', descr: 'L’etichetta con codice a barre per montature e astucci.',
      percorso: 'media/storecraft/dymo.png', tipo: 'immagine', miniatura: 'media/storecraft/dymo.png', perAldo: true, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Catalogo supporti e misure', descr: 'Porta-prezzi, cornici, totem e tablet: forme e misure usate da app, grafiche e 3D.',
      percorso: 'dispositivi.js', tipo: 'documento', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'grafiche', titolo: 'Piano allestimento (da confermare)', descr: 'Pianta con tutte le posizioni di cartelli, porta-prezzi, totem e schermi, in vetrina e dentro il negozio: Fabrice conferma, cambia o toglie.',
      percorso: 'allestimento/index.html', tipo: 'pagina', miniatura: 'visita/negozio3d/pianta.svg', perAldo: false, stato: 'in lavorazione' },

    /* ------------------------------------------------ LOGO E ANIMAZIONE */
    { gruppo: 'logo', titolo: 'Il marchio Ottica Macrì', descr: 'Il marchio definitivo: l’ovale da bottega con il tuo draghetto e l’icona OM, su insegna, biglietto, cartelli e app.',
      percorso: 'media/logo/index.html', tipo: 'pagina', miniatura: 'media/logo/marchi6/06-ovale/06-ovale-colori.svg', perAldo: true, stato: 'pronto',
      copre: ['media/logo/'] },
    { gruppo: 'documenti', titolo: 'Ricerca: schermi da vetrina vs tablet', descr: 'iiyama 21,5" Android, LG 21,5", monitor + chiavetta, tablet 12,4": differenze di costo (6/11).',
      percorso: 'ricerca/schermi-vetrina-2026-11.md', tipo: 'documento', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'logo', titolo: 'Scegli il logo · tutte le opzioni', descr: 'Restauro A/B/C/D, animazione, 6 marchi, 10 stili: Tieni / Forse / Elimina con «Copia le mie scelte».',
      percorso: 'media/logo/scelta.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto', copre: ['media/logo/stili10/svg/'] },
    { gruppo: 'logo', titolo: 'Il draghetto in 10 stili moderni', descr: 'Anteprima veloce: monolinea, bollino, due colori, negativo, sfumato, neon, timbro, ombra lunga, oro, stampa pop.',
      percorso: 'media/logo/stili10/index.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'in lavorazione' },
    { gruppo: 'logo', titolo: 'Il marchio: 6 concetti professionali', descr: 'Sei marchi curati come in uno studio, solo dal draghetto vero e da geometria e caratteri: tratto pieno, negativo, sigillo, monocolo OM, scritta-occhiale, ovale da bottega. Ognuno con icona 48/24 px, positivo/negativo, 1 e 2 colori, insegna di notte e biglietto.',
      percorso: 'media/logo/marchi6/index.html', tipo: 'pagina', miniatura: 'media/logo/marchi6/06-ovale/png/06-ovale-colori-1000.png', perAldo: false, stato: 'pronto',
      copre: ['media/logo/marchi6/'] },
    { gruppo: 'logo', titolo: 'Il logo storico, restaurato', descr: 'Il logo di sempre messo a confronto con la versione restaurata.',
      percorso: 'media/logo/storico/confronto.html', tipo: 'pagina', miniatura: 'media/logo/storico/png/draghetto-storico-restaurato-su-bianco.png', perAldo: true, stato: 'pronto',
      copre: ['media/logo/storico/'] },
    { gruppo: 'logo', titolo: 'Animazione d’avvio del logo', descr: 'Il logo che si accende: per il tablet in vetrina, i video e i social.',
      percorso: 'media/logo/storico/animazione/avvio.html', tipo: 'pagina', miniatura: 'media/logo/storico/animazione/poster-chiaro-1920x1080.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'logo', titolo: 'File dell’animazione (mp4, mov, avi, gif)', descr: 'I file video dell’animazione, da usare ovunque.',
      percorso: 'media/logo/storico/animazione/', tipo: 'cartella', miniatura: null, perAldo: false, stato: 'pronto' },

    /* ------------------------------------------------ VIDEO */
    { gruppo: 'video', titolo: 'Pagina video (archivio)', descr: 'I due video della vecchia demo scura (Piano A e B), prezzi vecchi: solo archivio dal 6/11.',
      percorso: 'video.html', tipo: 'pagina', miniatura: 'media/demo/home-desktop.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'video', titolo: 'Video Piano A · file (archivio)', descr: 'Il video della vecchia demo: non darlo ad Aldo.',
      percorso: 'video/Ottica Macri - Demo video.mp4', tipo: 'video', miniatura: 'media/demo/vetrina-desktop.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'video', titolo: 'Video Piano B · file (archivio)', descr: 'Il video della vecchia demo del Piano B: non darlo ad Aldo.',
      percorso: 'video/Ottica Macri - Piano B video.mp4', tipo: 'video', miniatura: 'media/demo-b/vetrina-desktop.png', perAldo: false, stato: 'pronto' },
    { gruppo: 'video', titolo: 'Passeggiate nuove (file video)', descr: 'Facciata, ingresso, sedie e bancone: 4 video leggeri (720p) con i volti sfocati.',
      percorso: 'visita/visita-reale/giro-ingresso.mp4', tipo: 'video', miniatura: 'visita/visita-reale/giro-ingresso-poster.jpg', perAldo: false, stato: 'pronto' },
    { gruppo: 'video', titolo: 'Passeggiata (file video)', descr: 'Il giro nel negozio, già sfocato per la privacy.',
      percorso: 'visita/visita-reale/giro.mp4', tipo: 'video', miniatura: 'visita/visita-reale/giro-poster.jpg', perAldo: false, stato: 'pronto' },

    /* ------------------------------------------------ PDF E PREVENTIVI */
    /* 6/11: UN SOLO preventivo (prima: Preventivo Piano A + Preventivo Piano B, vedi materiali.prima-unico.js) */
    { gruppo: 'pdf', titolo: 'Preventivo · STORE // CRAFT + Archivio Clienti', descr: 'STORE // CRAFT Essenziale: stampe, video in vetrina e archivio clienti in un pacchetto solo. In fondo i moduli extra, da aggiungere quando vuoi.',
      percorso: 'preventivo-b.html', tipo: 'pagina', miniatura: 'media/preventivo-v2/home-b-pc.jpg', perAldo: true, stato: 'pronto' },
    { gruppo: 'pdf', titolo: 'Preventivo Piano A · vecchio link', descr: 'Dal 6/11 rimanda al preventivo unico (le parti del Piano A sono i moduli extra).',
      percorso: 'preventivo-a.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'pdf', titolo: 'Presentazione Piano A · PDF (archivio)', descr: 'Diapositive con la vecchia demo e i prezzi vecchi: solo archivio dal 6/11.',
      percorso: 'presentazione/Ottica Macri - Presentazione STORE CRAFT.pdf', tipo: 'pdf', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'pdf', titolo: 'Presentazione Piano B · PDF (archivio)', descr: 'Diapositive con la vecchia demo e i prezzi vecchi: solo archivio dal 6/11.',
      percorso: 'presentazione/Ottica Macri - Piano B.pdf', tipo: 'pdf', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'pdf', titolo: 'Riepilogo per WhatsApp (PDF)', descr: 'Un PDF leggero con tutto in breve, da tenere sul telefono.',
      percorso: 'presentazione/Ottica Macri - Riepilogo.pdf', tipo: 'pdf', miniatura: null, perAldo: true, stato: 'pronto',
      copre: ['media/riepilogo/', 'media/riepilogo.prima-fase1/'] },
    { gruppo: 'pdf', titolo: 'Sorgente presentazione A (archivio)', descr: 'Pagina da cui nasce il PDF del Piano A (crea_pdf.py), superato.',
      percorso: 'presentazione/presentazione-aldo.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'pdf', titolo: 'Sorgente presentazione B (archivio)', descr: 'Pagina da cui nasce il PDF del Piano B (crea_pdf_b.py), superato.',
      percorso: 'presentazione/presentazione-piano-b.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'pdf', titolo: 'Sorgente riepilogo WhatsApp', descr: 'Pagina da cui nasce il PDF riepilogo (crea_riepilogo.py).',
      percorso: 'presentazione/riepilogo.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'pdf', titolo: 'Preventivo · bozza di lavoro', descr: 'Preventivo scalare da compilare (tariffa, difficoltà, IVA).',
      percorso: 'preventivo.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'pdf', titolo: 'Prezzi per il cliente (prezzi.js)', descr: 'Unico file dei prezzi. 6/11: preventivo unico (PREZZI.unico 2.500 / 1.500 decisi da Fabrice) + moduli extra; ancora da confermare.',
      percorso: 'prezzi.js', tipo: 'documento', miniatura: null, perAldo: false, stato: 'pronto' },

    /* ------------------------------------------------ RICERCHE E DOCUMENTI DI LAVORO */
    { gruppo: 'lavoro', titolo: 'Info azienda', descr: 'Dati di Aldo trovati online, presenza sul web, concorrenti, domande da fare.',
      percorso: 'info-azienda.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'lavoro', titolo: 'Previsione Piano A', descr: 'Le aree del progetto: ore, difficoltà, tempi, costi, confronto col mercato.',
      percorso: 'previsione-progetto.html', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'lavoro', titolo: 'Previsione Piano B', descr: 'Solo STORE // CRAFT + video vetrina economica + archivio clienti.',
      percorso: 'previsione-progetto.html?piano=b', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'lavoro', titolo: 'Ricerca · schermi vetrina', descr: 'Cornice, tablet o monitor: prezzi rilevati online.',
      percorso: 'ricerca/vetrina-hardware.md', tipo: 'documento', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'lavoro', titolo: 'Ricerca · display e cornici', descr: 'Plexiglass 10×15, 13×18, A5, A4 e cornici in legno: prezzi rilevati online.',
      percorso: 'ricerca/display-vetrina.md', tipo: 'documento', miniatura: null, perAldo: false, stato: 'pronto',
      copre: ['ricerca/display-vetrina.js', 'ricerca/display-vetrina.json'] },
    { gruppo: 'lavoro', titolo: 'Ricerca · Street View', descr: 'Note sulla vetrina aumentata con Google Street View.',
      percorso: 'ricerca/streetview.md', tipo: 'documento', miniatura: null, perAldo: false, stato: 'pronto' },
    { gruppo: 'lavoro', titolo: 'Rilievo del negozio (misure)', descr: 'Misure e pianta usate per il 3D.',
      percorso: 'visita/negozio3d/rilievo.md', tipo: 'documento', miniatura: null, perAldo: false, stato: 'in lavorazione' },
    { gruppo: 'lavoro', titolo: 'Pianta del negozio', descr: 'La pianta disegnata dal rilievo.',
      percorso: 'visita/negozio3d/pianta.svg', tipo: 'immagine', miniatura: 'visita/negozio3d/pianta.svg', perAldo: false, stato: 'in lavorazione' },
    { gruppo: 'lavoro', titolo: 'Portale · rivedi l’avvio', descr: 'Riapre il portale con l’animazione iniziale.',
      percorso: 'index.html?avvio', tipo: 'pagina', miniatura: null, perAldo: false, stato: 'pronto' }
  ]
};

/* Aiuti per le pagine (non toccare) ----------------------------------- */
(function (M) {
  /* percorso pronto per href/src da una pagina che sta in «base» ('' = radice, '../' = sottocartella) */
  M.url = function (p, base) {
    if (p == null) return '';
    var m = String(p).match(/^([^?#]*)(.*)$/);
    var parti = m[1].split('/').map(function (x) { return encodeURIComponent(decodeURIComponent(x)); });
    return (base || '') + parti.join('/') + m[2];
  };
  /* miniatura leggera creata da «python materiali_controlla.py --miniature» (se manca si usa l'originale) */
  M.mini = function (p) {
    if (!p || /\.svg$/i.test(p)) return p;
    return 'media/miniature/' + String(p).replace(/[\/\\]/g, '__').replace(/\.[a-z0-9]+$/i, '') + '.jpg';
  };
  M.gruppo = function (id) { for (var i = 0; i < M.gruppi.length; i++) if (M.gruppi[i].id === id) return M.gruppi[i]; return null; };
})(window.MATERIALI);
