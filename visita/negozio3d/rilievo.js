/* Rilievo del negozio Ottica Macrì (Via Poggi d'Oro 23, Roma) — ricavato dalle foto del 5/11/2026.
   Spiegazione completa, metodo e incertezze: rilievo.md. Pianta: pianta.svg.
   Sistema: metri. Origine = angolo interno SINISTRO della parete d'ingresso (guardando da fuori verso dentro).
   x verso destra, z verso l'interno (z<0 = vestibolo e vetrine verso la strada), y in su, pavimento y=0.
   Ogni elemento: (x,z) = CENTRO dell'ingombro a terra, y = quota della BASE, w = larghezza (lungo il fronte),
   h = altezza, d = profondità. rotY in gradi: 0 = il fronte guarda -z (verso l'ingresso);
   90 = guarda -x (mobili sulla parete destra); -90 = guarda +x (mobili sulla parete sinistra); 180 = guarda +z.
   Versione 2 (raffinata). Ritoccato dall'agente CONTROLLO il 5/11 dopo il confronto foto/render (vedi controllo/esito.md). */
window.RILIEVO = {
  versione: 2,
  unita: 'm',
  stanza: {
    larghezza: 4.5,          // parete sinistra x=0 -> parete destra x=4.5
    profondita: 4.4,         // parete d'ingresso z=0 -> parete di fondo z=4.4 (sala vendita)
    altezza: 3.25,           // soffitto bianco della sala (CONTROLLO: 3.0 -> 3.25, il poster Versace sta sopra la vetrina Armani, IMG_9479)
    // sala + imbocco del corridoio verso il retro (il retro/laboratorio non è stato fotografato)
    // GIRO 2 (foglio A4): sulla destra la sala arriva fino al retro della vetrina destra (z -1.08): la vetrina dx è un cassone
    // poco profondo (42 cm) sul filo facciata e dal suo vetro posteriore si vede la sala (Missoni, sedie). Vedi rilievo.md «Misure col foglio A4».
    poligono: [[0,0],[0,4.4],[1.75,4.4],[1.75,6.2],[2.6,6.2],[2.6,4.4],[4.5,4.4],[4.5,-1.08],[2.5,-1.08],[2.75,0]],
    corridoio: { x0: 1.75, x1: 2.6, z0: 4.4, z1: 6.2, altezza: 2.7, note: 'corridoio verso il retro (laboratorio), controsoffitto più basso con tubo LED; lunghezza oltre 6.2 non nota' },
    vestibolo: {
      note: 'ingresso rientrato aperto sulla strada: pavimento a piastrelle bianche irregolari + rosone a mosaico; soffitto a gradoni ocra/dorato lucido con 3 plafoniere tonde',
      filoFacciata: -1.5,    // GIRO 2: z del filo strada (prima -1.3). La porta interna è 1,5 m dietro la facciata (9484/9485)
      poligono: [[0.93,-1.5],[2.5,-1.5],[2.5,-1.08],[2.75,0],[1.85,0],[1.85,-0.25],[1.72,-0.38],[0.93,-0.38]],
      altezzaSoffitto: 2.72,
      retroVetrinaSx: { x0: 0.48, x1: 1.85, z: 0, y0: 0.55, y1: 2.38 }  // vetro posteriore della vetrina sx (visto dalla sala)
    },
    /* GIRO 2: FACCIATA su strada (IMG_9485 notte, fotogrammi IMG_9484). Scala: vetrina destra misurata col foglio A4. */
    facciata: {
      z: -1.5,
      vano: { x0: 0.93, x1: 3.52, h: 2.68 },               // apertura del vestibolo: 2,59 m x 2,68 m
      telaio: { colore: '#4a3d24', note: 'profili e cornici in bronzo scuro / ottone brunito (non oro acceso)' },
      fascia: { y0: 2.68, y1: 3.32, colore: '#17130f', note: 'fascia scura sopra il vano, con la telecamera a sinistra' },
      insegna: { x0: 0.83, x1: 3.64, y0: 3.32, y1: 4.08, testo: 'OTTICA', note: 'cassonetto luminoso bianco, lettere OTTICA in rilievo effetto marmo bruno-ruggine' },
      targa: { x0: 2.17, x1: 3.59, y0: 3.86, y1: 4.06, testo: 'Aldo Macrì', note: 'targa gialla con bordo nero in alto a destra dell insegna' },
      pilastri: [{ x0: 0.67, x1: 0.93 }, { x0: 3.52, x1: 3.87 }],
      bacheche: [{ x0: 0.22, x1: 0.67, y0: 1.06, y1: 2.87, poster: 'CARRERA', note: 'bacheca a sinistra del vano (poster Carrera, IMG_9486_003)' },
                 { x0: 3.87, x1: 4.36, y0: 1.06, y1: 2.87, poster: 'scuro', note: 'bacheca a destra del vano' }],
      rivestimento: { colore: '#8d8473', note: 'travertino grigio-beige, di notte appare bruno' },
      gradino: { h: 0.03, prof: 0.16, note: 'fila di cubetti chiari sul filo strada' },
      marciapiede: { prof: 2.6, colore: '#6f6c66' }, strada: { colore: '#2c2d31' }
    },
    pavimento: { materiale: 'parquet laminato a listoni', colore: '#7a4a2a' },
    pareti: { basso: { materiale: 'stucco spugnato giallo ocra', colore: '#d4ac4f', fino_a: 1.25 },
              alto: { materiale: 'pittura', colore: '#f4f2ee' },
              pannelli: { materiale: 'radica scura lucida', colore: '#2a1c14' } },
    soffitto: { colore: '#f6f5f2' }
  },

  aperture: [
    { id: 'porta-ingresso', tipo: 'porta', x: 2.3, z: 0, w: 0.9, h: 2.2, verso: 'apre verso l\'interno, SEMPRE APERTA (dato di Fabrice)',
      note: 'PORTA INTERNA a vetro tra il vestibolo-vetrine e la sala: vetro intero con cornice ottone/bronzo, pomolo tondo in legno scuro, vetrofania draghetto rosso + colonna di montature colorate, adesivo Scalapay. Vedi elemento porta-interna-vetro',
      foto: ['IMG_9476.jpg', 'IMG_9473_019.jpg', 'IMG_9473_001.jpg'] },
    { id: 'vetrata-vestibolo-dx', tipo: 'vetrata', x0: 2.5, z0: -1.08, x1: 2.75, z1: 0, y0: 0, y1: 2.6, vetro: true,
      note: 'GIRO 2: lato destro del vestibolo, vetrata tra il retro della vetrina destra e lo stipite della porta (si vede la sala)', foto: ['IMG_9493.jpg', 'IMG_9486_007.jpg'] },
    { id: 'retro-vetrina-dx', tipo: 'vetrina-retro', x0: 2.53, z0: -1.08, x1: 3.47, z1: -1.08, y0: 0.55, y1: 2.35, vetro: true,
      note: 'GIRO 2: vetro posteriore della vetrina destra: dalla strada si vede la sala, dalla sala si vede la vetrina (era «vetrina-dx-interna»)', foto: ['IMG_9494.jpg', 'IMG_9488_011.jpg'] },
    { id: 'vano-vestibolo', tipo: 'vanoStrada', x: 2.225, z: -1.5, w: 2.59, h: 2.68,
      note: 'apertura sulla strada del vestibolo tra il pilastro sinistro (ottotipo) e la vetrina destra', foto: ['IMG_9476.jpg'] },
    { id: 'vano-corridoio', tipo: 'vano', x: 2.175, z: 4.4, w: 0.85, h: 2.4,
      note: 'imbocco del corridoio verso il retro, a sinistra del blocco Versace/Luxottica, stipite metallico', foto: ['IMG_9479.jpg', 'IMG_9473_009.jpg'] }
  ],

  elementi: [
    /* ---------------- VESTIBOLO E VETRINE SU STRADA ---------------- */
    /* Percorso (dato di Fabrice): strada -> soglia -> ZONA VETRINA (vestibolo aperto tra le due vetrine)
       -> PORTA INTERNA A VETRO sempre aperta -> sala: il BANCONE è subito a SINISTRA. */
    { id: 'soglia-strada', tipo: 'altro', descrizione: 'soglia sul filo strada (marmo chiaro), ingresso libero al vestibolo-vetrine',
      x: 2.225, z: -1.5, y: 0, rotY: 0, w: 2.59, h: 0.03, d: 0.16, materiale: 'marmo', colore: '#ddd6c8', foto: ['IMG_9476.jpg', 'IMG_9485.jpg'] },
    { id: 'porta-interna-vetro', tipo: 'porta', stato: 'aperta', aperta: true, angoloApertura: 90,
      x: 2.3, z: 0, y: 0, rotY: 0, w: 0.9, h: 2.2, d: 0.04,
      cerniera: [2.75, 0], ante: 1, posizioneAperta: { x: 2.72, z: 0.46, rotY: 90 }, /* GIRO 2: si apre VERSO LA SALA (Aldo la tiene aperta da dentro, IMG_9486_010-012): anta lungo x=2.72 da z 0 a 0.9 */ apertura: 'verso l\'interno, anta ruotata di 90° e appoggiata lungo x=2.75 (da z=0 a z=0.9), davanti al lato interno della vetrina destra. CONTROLLO 5/11: anta aperta di 90° VERSO IL VESTIBOLO, appoggiata al fianco della vetrina destra (x=2.77, z da -0.92 a 0): nelle foto 9478 e 9474_002/003 la vetrofania del draghetto si vede proprio lì, e nelle foto interne 9480 e 9473_012-016 la porta non compare. Verso di apertura da confermare con Fabrice',
      materiale: 'vetro temperato trasparente con cornice ottone/bronzo, pomolo tondo in legno scuro (sul lato sinistro visto da fuori)', colore: '#b8c8c8',
      note: 'porta INTERNA tra vestibolo e sala, SEMPRE APERTA (dato di Fabrice). Lato cerniera dedotto dal pomolo: incerto',
      foto: ['IMG_9476.jpg', 'IMG_9473_019.jpg', 'IMG_9473_001.jpg'] },
    /* GIRO 2 — VETRINA SINISTRA misurata col foglio A4 (IMG_9492) e con la facciata (9484/9485): è AD ANGOLO (a L):
       braccio lungo il fianco sinistro del vestibolo (vetro che guarda +x, fondo ocra coi poster MK) + braccio di fondo
       (vetro verso la strada a 1,12 m dalla facciata, smusso verso la porta, retro a vetri verso la sala).
       Zoccolo bronzo 0,55; DUE piani: la base sullo zoccolo e UN ripiano ad angolo a 1,28; vetri fino a 2,38. */
    { id: 'vetrina-sx', tipo: 'vetrinaEsterna', allestimento: true, ripianoPieno: true,
      x: 1.17, z: -0.61, y: 0, rotY: 0, w: 1.37, h: 2.38, d: 1.22, zoccolo: 0.55,
      poligono: [[0.48,-1.22],[0.93,-1.22],[0.93,-0.38],[1.72,-0.38],[1.85,-0.25],[1.85,0],[0.48,0]],
      lati: ['muro', 'vetro', 'vetro', 'vetro', 'radica', 'aperto', 'muro'],
      luci: [[0.7, -0.95], [0.7, -0.5], [1.15, -0.2], [1.55, -0.2]],
      materiale: 'vetro + profili bronzo scuro; zoccolo bronzo-oliva a doghe orizzontali h 0.55; fondo ocra sul braccio sinistro, retro a vetri; 2 piani: base sullo zoccolo e un ripiano ad angolo (1.28) con bordo nero',
      colore: '#6b6136', note: 'vetrina d\'angolo a L; dentro poster Michael Kors/Gucci, pannello David Beckham, Marciano Guess, Carrera',
      foto: ['IMG_9492.jpg', 'IMG_9485.jpg', 'IMG_9490_006.jpg', 'IMG_9490_012.jpg', 'IMG_9476.jpg', 'IMG_9477.jpg'] },
    { id: 'pilastro-ottotipo', tipo: 'altro', descrizione: 'fianco del pilastro sinistro del vestibolo (muratura rivestita), con poster ottotipo "Occhio a Pinocchio", orologio tondo e faretto/telecamera sopra',
      x: 0.8, z: -1.36, y: 0, rotY: -90, w: 0.28, h: 2.68, d: 0.26, materiale: 'pannello bronzo + poster', colore: '#5a4c30',
      foto: ['IMG_9476.jpg', 'IMG_9477.jpg', 'IMG_9475_001.jpg'] },
    { id: 'poster-ottotipo', tipo: 'poster', soggetto: 'ottotipo Occhio a Pinocchio - Controllo della vista pediatrico GRATUITO', x: 0.935, z: -1.36, y: 0.95, rotY: -90, w: 0.24, h: 0.95, d: 0.01,
      materiale: 'carta', colore: '#ffffff', foto: ['IMG_9477.jpg'] },
    { id: 'orologio-vestibolo', tipo: 'altro', descrizione: 'orologio tondo da parete, cassa argento', x: 0.94, z: -1.36, y: 2.08, rotY: -90, w: 0.15, h: 0.15, d: 0.05,
      materiale: 'metallo', colore: '#c0c0c0', foto: ['IMG_9477.jpg'] },
    { id: 'pilastro-radica-porta', tipo: 'altro', descrizione: 'montante/pilastro rivestito in radica scura tra vetrina sinistra e porta (visto da dentro)',
      x: 1.83, z: -0.12, y: 0, rotY: -90, w: 0.25, h: 2.68, d: 0.06, materiale: 'radica scura', colore: '#2a1c14', foto: ['IMG_9473_020.jpg', 'IMG_9473_003.jpg'] },
    /* GIRO 2 — VETRINA DESTRA misurata col FOGLIO A4 appeso sul vetro posteriore (IMG_9493, IMG_9494):
       cassone REGOLARE sul filo facciata, largo 1,00 m e profondo SOLO 0,42 m (prima 1,65 x 1,30: troppo profonda).
       Zoccolo bronzo a doghe 0,55; vetri da 0,55 a 2,35; un ripiano nero a 1,22 (fascia nera 8 cm) = due piani.
       Fianco sinistro a vetro sul vestibolo, fianco destro contro il pilastro, retro a vetri verso la sala con montanti in radica. */
    { id: 'vetrina-dx', tipo: 'vetrinaEsterna', allestimento: true, ripianoPieno: true,
      x: 3.0, z: -1.29, y: 0, rotY: 0, w: 1.0, h: 2.35, d: 0.42, zoccolo: 0.55,
      poligono: [[2.5,-1.5],[3.5,-1.5],[3.5,-1.08],[2.5,-1.08]],
      lati: ['vetro', 'muro', 'aperto', 'vetro'],
      luci: [[2.75, -1.3], [3.25, -1.3]],
      materiale: 'cassone in vetro con cornice bronzo scuro, zoccolo h 0.55; ripiano nero (1.22) con fascia nera spessa; retro a vetri con montanti in radica',
      colore: '#111111', note: 'oggi: Nuance Audio, casco Ferrari rosso, Ray-Ban Polarized, sotto angolo bambini (Minion, Occhio a Pinocchio, carica dei 101)',
      foto: ['IMG_9493.jpg', 'IMG_9494.jpg', 'IMG_9485.jpg', 'IMG_9478.jpg'] },
    { id: 'vetrina-angolo-dx-sala', tipo: 'vetrinaParete', x: 4.0, z: -0.95, y: 0.25, rotY: 180, w: 0.95, h: 2.1, d: 0.26,
      materiale: 'radica scura con ante in vetro, fondo stucco ocra', colore: '#2a1c14',
      note: 'GIRO 2: vetrina in radica nell\'angolo davanti a destra della sala (IMG_9488_011), dietro il pilastro e la bacheca destra della facciata. Sostituisce la vecchia «vetrina-dx-interna», che era in realtà il retro della vetrina su strada',
      foto: ['IMG_9488_011.jpg', 'IMG_9473_017.jpg'] },
    { id: 'tappeto-mezzaluna', tipo: 'tappeto', x: 2.3, z: -0.3, y: 0, rotY: 0, w: 0.75, h: 0.01, d: 0.4,
      materiale: 'gomma', colore: '#c0282d', note: 'zerbino a mezzaluna rosso con bordo greca nero davanti alla porta', foto: ['IMG_9476.jpg', 'IMG_9477.jpg'] },
    { id: 'rosone-mosaico', tipo: 'altro', descrizione: 'rosone a mosaico (cerchi concentrici bianco/rosso/verde) nel pavimento del vestibolo a piastrelle bianche irregolari',
      x: 1.72, z: -0.95, y: 0, rotY: 45, w: 0.9, h: 0.005, d: 0.9, materiale: 'mosaico', colore: '#b8553a', foto: ['IMG_9476.jpg', 'IMG_9473_019.jpg'] },
    { id: 'plafoniera-vest-1', tipo: 'plafoniera', x: 1.35, z: -0.85, y: 2.66, rotY: 0, w: 0.25, h: 0.08, d: 0.25, materiale: 'vetro opale', colore: '#fff6e0', foto: ['IMG_9476.jpg'] },
    { id: 'plafoniera-vest-2', tipo: 'plafoniera', x: 2.15, z: -0.85, y: 2.66, rotY: 0, w: 0.25, h: 0.08, d: 0.25, materiale: 'vetro opale', colore: '#fff6e0', foto: ['IMG_9476.jpg'] },
    { id: 'plafoniera-vest-3', tipo: 'plafoniera', x: 1.75, z: -0.45, y: 2.66, rotY: 0, w: 0.22, h: 0.08, d: 0.22, materiale: 'vetro opale', colore: '#fff6e0', foto: ['IMG_9476.jpg'] },
    { id: 'telecamera-vestibolo', tipo: 'telecamera', x: 0.96, z: -1.4, y: 2.5, rotY: -90, w: 0.12, h: 0.12, d: 0.2, materiale: 'plastica', colore: '#333333', foto: ['IMG_9476.jpg', 'IMG_9477.jpg'] },

    /* ---------------- PARETE SINISTRA (dietro il bancone) ---------------- */
    { id: 'base-sx', tipo: 'mobileBasso', x: 0.28, z: 2.1, y: 0, rotY: -90, w: 3.75, h: 0.9, d: 0.55,
      materiale: 'radica scura lucida, piano stucco giallo ocra', colore: '#2a1c14',
      note: 'cassettiera continua lungo la parete sinistra, colonne di cassetti con pomelli tondi in ottone; gira a 90° nell\'angolo di fondo (vedi base-fondo-sx)',
      foto: ['IMG_9480.jpg', 'IMG_9473_005.jpg', 'IMG_9473_008.jpg'] },
    { id: 'libreria-sx', tipo: 'scaffaleLibreria', x: 0.18, z: 0.65, y: 0.9, rotY: -90, w: 1.15, h: 1.45, d: 0.35,
      materiale: 'radica scura', colore: '#2a1c14', note: 'scaffale a giorno 4x3 caselle: raccoglitori Oakley, Ray-Ban, Essilor blu, cataloghi, foto bambini (cornici verde/arancio), Juventus',
      foto: ['IMG_9480.jpg', 'IMG_9473_005.jpg', 'IMG_9473_021.jpg'] },
    { id: 'vetrina-unika', tipo: 'vetrinaParete', x: 0.2, z: 1.6, y: 1.05, rotY: -90, w: 0.75, h: 1.25, d: 0.35,
      materiale: 'radica scura, ante in vetro, fondo ocra, 2 ripiani in vetro', colore: '#2a1c14',
      note: 'scatole blu UNIKA e scatolette bianche (lenti a contatto)', foto: ['IMG_9480.jpg', 'IMG_9473_006.jpg'] },
    { id: 'vetrina-modellini', tipo: 'vetrinaParete', x: 0.2, z: 2.55, y: 1.05, rotY: -90, w: 1.15, h: 1.25, d: 0.35,
      materiale: 'radica scura, ante in vetro, fondo ocra, 3 ripiani in vetro, faretti in alto', colore: '#2a1c14',
      note: 'modellini auto Ferrari rosse/blu, occhiali, Prada, Gucci, Ray-Ban', foto: ['IMG_9480.jpg', 'IMG_9473_007.jpg'] },
    { id: 'vetrina-angolo-sx', tipo: 'vetrinaParete', x: 0.45, z: 3.9, y: 1.05, rotY: -45, w: 0.95, h: 1.25, d: 0.35,
      materiale: 'radica scura, ante in vetro, fondo ocra', colore: '#2a1c14',
      note: 'vetrine d\'angolo in fondo a sinistra (occhiali da vista e da sole, Oakley); la fila di vetrine gira sulla parete di fondo',
      foto: ['IMG_9473_008.jpg', 'IMG_9480.jpg'] },
    { id: 'base-fondo-sx', tipo: 'mobileBasso', x: 0.85, z: 4.15, y: 0, rotY: 0, w: 1.15, h: 0.9, d: 0.5,
      materiale: 'radica scura, piano ocra', colore: '#2a1c14', note: 'ritorno della cassettiera sulla parete di fondo (angolo a L)', foto: ['IMG_9473_008.jpg'] },
    { id: 'registratore-cassa', tipo: 'registratoreCassa', x: 0.32, z: 1.25, y: 0.9, rotY: -90, w: 0.32, h: 0.15, d: 0.35, materiale: 'plastica', colore: '#111111',
      note: 'cassa nera con calcolatrice e orologio accanto', foto: ['IMG_9480.jpg', 'IMG_9473_005.jpg'] },
    { id: 'apparecchio-bianco', tipo: 'altro', descrizione: 'strumento bianco squadrato sul piano (probabile frontifocometro/strumento ottico) con schermo inclinato',
      x: 0.35, z: 1.85, y: 0.9, rotY: -90, w: 0.35, h: 0.45, d: 0.4, materiale: 'plastica', colore: '#eeeeee', foto: ['IMG_9480.jpg', 'IMG_9473_006.jpg'] },
    { id: 'maglia-juve', tipo: 'quadro', soggetto: 'maglia Juventus DEL PIERO 10 incorniciata', x: 0.04, z: 0.75, y: 2.3, rotY: -90, w: 0.55, h: 0.65, d: 0.04,
      materiale: 'cornice', colore: '#e8e8e8', foto: ['IMG_9480.jpg'] },
    { id: 'trofei-juve', tipo: 'altro', descrizione: 'sopra le vetrine: attestato incorniciato, targa Juventus, cartello giallo VIETATO FUMARE, coppa dorata, pallone, sciarpa giallorossa, cappellino, cassa audio',
      x: 0.2, z: 1.4, y: 2.35, rotY: -90, w: 1.4, h: 0.45, d: 0.3, materiale: 'vari', colore: '#c9a227', foto: ['IMG_9480.jpg'] },
    { id: 'poster-never-hide', tipo: 'poster', soggetto: 'pannelli Ray-Ban NEVER HIDE (4-5, foto b/n) + MaxMara', x: 0.15, z: 2.95, y: 2.3, rotY: -90, w: 1.7, h: 0.6, d: 0.1,
      materiale: 'forex', colore: '#222222', foto: ['IMG_9480.jpg', 'IMG_9473_007.jpg', 'IMG_9473_008.jpg'] },

    /* ---------------- BANCONE A L ---------------- */
    { id: 'bancone', tipo: 'bancone', x: 1.5, z: 1.925, y: 0, rotY: -90, w: 2.45, h: 0.97, d: 0.6,
      materiale: 'radica scura lucida con cassetti e pomelli ottone, piano stucco giallo ocra (sporgente 3 cm)', colore: '#2a1c14',
      note: 'braccio lungo parallelo alla parete sinistra; dietro c\'è il passaggio di Aldo (~0.65 m) davanti alla cassettiera',
      foto: ['IMG_9480.jpg', 'IMG_9479.jpg', 'IMG_9473_007.jpg', 'IMG_9473_008.jpg'] },
    { id: 'bancone-braccio', tipo: 'bancone', x: 1.85, z: 3.15, y: 0, rotY: 0, w: 1.0, h: 0.97, d: 0.4,
      materiale: 'radica scura, piano ocra', colore: '#2a1c14',
      note: 'braccio corto della L in fondo, sporge verso il centro con angolo smussato; sopra la colonna girevole Oakley',
      foto: ['IMG_9479.jpg', 'IMG_9473_008.jpg', 'IMG_9473_009.jpg'] },
    { id: 'colonna-bancone', tipo: 'colonnaRotante', x: 2.15, z: 3.15, y: 0.97, rotY: 0, w: 0.38, h: 0.85, d: 0.38,
      materiale: 'piatto tondo grigio, colonna argento', colore: '#9a9a9a', note: 'occhiali sportivi Oakley colorati in cima (azzurro, rosso, viola, giallo fluo)',
      foto: ['IMG_9479.jpg', 'IMG_9473_008.jpg'] },
    { id: 'specchio-bancone', tipo: 'specchioOvale', x: 1.6, z: 1.95, y: 0.97, rotY: -90, w: 0.3, h: 0.72, d: 0.15,
      materiale: 'specchio su forcella bianca e piede blu', colore: '#dddddd', foto: ['IMG_9480.jpg', 'IMG_9473_007.jpg'] },
    { id: 'tappetino-promolens', tipo: 'altro', descrizione: 'tappetino grigio PROMOLENS sul piano del bancone', x: 1.55, z: 2.5, y: 0.97, rotY: -90, w: 0.6, h: 0.005, d: 0.32,
      materiale: 'gomma stampata', colore: '#9a9a9a', foto: ['IMG_9480.jpg', 'IMG_9473_008.jpg'] },
    { id: 'specchietto-bancone', tipo: 'altro', descrizione: 'specchietto rettangolare con manico bianco', x: 1.6, z: 2.75, y: 0.97, rotY: -90, w: 0.25, h: 0.01, d: 0.18,
      materiale: 'specchio', colore: '#dddddd', foto: ['IMG_9473_008.jpg', 'IMG_9479.jpg'] },
    { id: 'espositore-catenelle', tipo: 'altro', descrizione: 'espositore bianco sagomato con catenelle per occhiali (nere, verdi, perle)', x: 1.55, z: 0.95, y: 0.97, rotY: -90, w: 0.22, h: 0.55, d: 0.06,
      materiale: 'plexiglas bianco', colore: '#f2f2f2', foto: ['IMG_9480.jpg', 'IMG_9473_021.jpg'] },
    { id: 'cartello-essilor', tipo: 'poster', soggetto: 'cartello da banco Essilor Eyezen', x: 1.6, z: 1.3, y: 0.97, rotY: -90, w: 0.25, h: 0.35, d: 0.05,
      materiale: 'cartoncino', colore: '#1f2b6e', foto: ['IMG_9480.jpg', 'IMG_9473_006.jpg'] },

    /* ---------------- PARETE DI FONDO ---------------- */
    { id: 'climatizzatore', tipo: 'climatizzatore', x: 0.95, z: 4.3, y: 2.55, rotY: 0, w: 0.8, h: 0.28, d: 0.2, materiale: 'plastica', colore: '#f4f4f4',
      note: 'split bianco sulla parete di fondo, sopra la cassettiera d\'angolo (visto in 9480 alto dx e 9479 alto sx: probabilmente lo stesso)',
      foto: ['IMG_9479.jpg', 'IMG_9480.jpg', 'IMG_9473_008.jpg'] },
    { id: 'telecamera-fondo', tipo: 'telecamera', x: 1.55, z: 4.35, y: 2.3, rotY: 20, w: 0.1, h: 0.1, d: 0.2, materiale: 'plastica', colore: '#e8e8e8',
      foto: ['IMG_9479.jpg', 'IMG_9473_008.jpg'] },
    { id: 'insegna-rayban-corridoio', tipo: 'poster', soggetto: 'insegna rossa Ray-Ban Genuine since 1937 + poster Never Hide', x: 2.15, z: 5.6, y: 1.95, rotY: 0, w: 0.6, h: 0.3, d: 0.03,
      materiale: 'forex', colore: '#d0141c', note: 'in alto nel corridoio', foto: ['IMG_9479.jpg'] },
    { id: 'poster-corridoio', tipo: 'poster', soggetto: 'poster verticale occhiali (Giuliani/Gucci) sulla parete sinistra del corridoio', x: 1.76, z: 4.75, y: 1.0, rotY: -90, w: 0.5, h: 1.1, d: 0.01,
      materiale: 'carta', colore: '#444444', foto: ['IMG_9479.jpg'] },
    { id: 'blocco-luxottica', tipo: 'altro', descrizione: 'blocco a muro in stucco giallo ocra con nicchia in basso (h 1.25) che contiene lo schermo Luxottica; battiscopa dorato',
      x: 3.18, z: 4.22, y: 0, rotY: 0, w: 1.15, h: 1.18, d: 0.36, materiale: 'stucco spugnato ocra', colore: '#d4ac4f', foto: ['IMG_9479.jpg', 'IMG_9473_009.jpg', 'IMG_9473_010.jpg'] },
    { id: 'schermo-luxottica', tipo: 'schermoVerticale', x: 3.12, z: 4.12, y: 0.05, rotY: 0, w: 0.55, h: 0.9, d: 0.08,
      materiale: 'monitor nero su cavalletto', colore: '#111111', note: 'logo LUXOTTICA bianco su fondo blu', foto: ['IMG_9479.jpg', 'IMG_9473_010.jpg'] },
    { id: 'vetrina-armani', tipo: 'vetrinaParete', x: 3.18, z: 4.22, y: 1.18, rotY: 0, w: 1.0, h: 1.28, d: 0.36,
      materiale: 'radica scura con vetri, piano di base in radica, 2 ripiani in vetro, faretto', colore: '#2a1c14',
      note: 'insegne GIORGIO ARMANI / ARMANI, occhiali da vista', foto: ['IMG_9479.jpg', 'IMG_9473_009.jpg'] },
    { id: 'poster-versace', tipo: 'poster', soggetto: 'VERSACE Occhiali, foto b/n di uomini nudi con occhiali da sole, cornice crema', x: 3.12, z: 4.38, y: 2.5, rotY: 0, w: 0.82, h: 0.72, d: 0.03,
      materiale: 'stampa incorniciata', colore: '#e8dcb0', foto: ['IMG_9479.jpg'] },
    { id: 'pannello-radica-fondo-dx', tipo: 'altro', descrizione: 'rivestimento in radica scura della parete di fondo destra, da 1.25 a 2.15 m',
      x: 4.12, z: 4.39, y: 1.25, rotY: 0, w: 0.75, h: 0.9, d: 0.02, materiale: 'radica scura', colore: '#2a1c14', foto: ['IMG_9479.jpg'] },
    { id: 'quadro-aereo', tipo: 'quadro', soggetto: 'foto aerea in bianco e nero, cornice bianca', x: 4.05, z: 4.38, y: 1.75, rotY: 0, w: 0.6, h: 0.45, d: 0.03,
      materiale: 'stampa incorniciata', colore: '#ffffff', foto: ['IMG_9479.jpg'] },
    { id: 'totem-rayban', tipo: 'totemRayBan', x: 4.05, z: 4.05, y: 0, rotY: 10, w: 0.7, h: 2.05, d: 0.45,
      materiale: 'struttura grigio argento, pannelli crema', colore: '#b8b8b8',
      note: 'logo rosso Ray-Ban in alto, pannello DEFINITELY RAY-BAN + pannello NEW, 2 colonne x 6 occhiali, base tonda argento, scatola Ray-Ban ai piedi',
      foto: ['IMG_9479.jpg', 'IMG_9473_011.jpg'] },

    /* ---------------- PARETE DESTRA ---------------- */
    { id: 'sedia-1', tipo: 'sedia', x: 4.2, z: 3.05, y: 0, rotY: 90, w: 0.5, h: 0.82, d: 0.52, materiale: 'imbottitura in tessuto blu, telaio cromato', colore: '#2a46b0',
      note: 'seduta a 0.45', foto: ['IMG_9479.jpg', 'IMG_9473_011.jpg', 'IMG_9473_012.jpg'] },
    { id: 'sedia-2', tipo: 'sedia', x: 4.2, z: 3.6, y: 0, rotY: 90, w: 0.5, h: 0.82, d: 0.52, materiale: 'imbottitura in tessuto blu, telaio cromato', colore: '#2a46b0',
      foto: ['IMG_9479.jpg', 'IMG_9473_011.jpg', 'IMG_9473_012.jpg'] },
    { id: 'specchio-parete-dx', tipo: 'specchioParete', x: 4.48, z: 3.3, y: 1.05, rotY: 90, w: 1.9, h: 1.15, d: 0.02,
      materiale: 'specchio con cornice radica', colore: '#cfd8dc', note: 'sopra le sedie; sopra ancora insegna MISSONI', foto: ['IMG_9473_012.jpg', 'IMG_9479.jpg'] },
    { id: 'insegna-missoni', tipo: 'poster', soggetto: 'scritta MISSONI blu su bianco', x: 4.47, z: 2.9, y: 2.4, rotY: 90, w: 0.9, h: 0.3, d: 0.02, materiale: 'forex', colore: '#ffffff',
      foto: ['IMG_9473_012.jpg'] },
    { id: 'colonna-guess', tipo: 'colonnaRotante', x: 4.15, z: 2.55, y: 0, rotY: 90, w: 0.32, h: 1.95, d: 0.32,
      materiale: 'colonna bianca a pavimento', colore: '#f0f0f0', note: 'colonna alta a pavimento con occhiali da sole, triangolo GUESS in cima', foto: ['IMG_9473_012.jpg', 'IMG_9473_013.jpg'] },
    { id: 'mensole-occhiali-dx', tipo: 'mensoleOcchialiParete', mensole: 5, x: 4.35, z: 1.45, y: 0, rotY: 90, w: 1.8, h: 2.25, d: 0.3,
      materiale: 'parete bianca con 5 mensole di vetro, zoccolo/base in radica h 0.45 con piano, cornice radica', colore: '#ffffff',
      note: 'circa 6-7 occhiali da sole per mensola; espositori Carrera, Versace, Ferragamo sulla base', foto: ['IMG_9473_013.jpg', 'IMG_9473_014.jpg', 'IMG_9473_015.jpg', 'IMG_9473_016.jpg'] },
    { id: 'poster-carrera', tipo: 'poster', soggetto: 'CARRERA uomo con occhiali', x: 4.48, z: 2.2, y: 1.66, rotY: 90, w: 0.29, h: 0.5, d: 0.01, materiale: 'carta', colore: '#cc2a2a', foto: ['IMG_9473_013.jpg'] },
    { id: 'poster-armani', tipo: 'poster', soggetto: 'GIORGIO ARMANI uomo con occhiali da sole', x: 4.48, z: 1.845, y: 1.66, rotY: 90, w: 0.43, h: 0.5, d: 0.01, materiale: 'carta', colore: '#cccccc', foto: ['IMG_9473_014.jpg'] },
    { id: 'poster-marciano', tipo: 'poster', soggetto: 'MARCIANO GUESS donna con occhiali da sole', x: 4.48, z: 1.43, y: 1.66, rotY: 90, w: 0.4, h: 0.5, d: 0.01, materiale: 'carta', colore: '#dddddd', foto: ['IMG_9473_015.jpg'] },
    { id: 'poster-mk', tipo: 'poster', soggetto: 'MICHAEL KORS donne con occhiali (2 poster)', x: 4.48, z: 0.88, y: 1.66, rotY: 90, w: 0.7, h: 0.5, d: 0.01, materiale: 'carta', colore: '#e7c0c8', foto: ['IMG_9473_016.jpg'] },

    /* ---------------- LUCI ---------------- */
    { id: 'led-1', tipo: 'tubo LED', x: 1.9, z: 2.2, y: 2.97, rotY: 90, w: 1.5, h: 0.03, d: 0.05, materiale: 'LED lineare', colore: '#ffffff', note: 'tubo LED lineare a soffitto (in 9479/SV corre fronte-fondo)', foto: ['IMG_9479.jpg'] },
    { id: 'led-corridoio', tipo: 'tubo LED', x: 2.17, z: 5.2, y: 2.68, rotY: 90, w: 1.2, h: 0.03, d: 0.05, materiale: 'LED lineare', colore: '#ffffff', foto: ['IMG_9479.jpg'] },
    { id: 'binario-faretti-dx', tipo: 'faretto', x: 3.9, z: 2.6, y: 2.75, rotY: 90, w: 2.5, h: 0.25, d: 0.1, materiale: 'sistema a cavi tesi con 4-5 faretti', colore: '#d0d0d0',
      note: 'faretti su cavi tesi sopra la parete destra', foto: ['IMG_9479.jpg', 'IMG_9473_011.jpg', 'IMG_9473_012.jpg'] },

    /* ---------------- OPERA DEL DRAGHETTO (esterno) ---------------- */
    { id: 'graffito-draghetto', tipo: 'quadro', soggetto: 'cabina telefonica rossa dipinta con il draghetto giallo con occhiali, scritta COLORIZE e firma Ray-Ban (sul muro esterno; posizione esatta non nota, qui come quadro)',
      x: 0.02, z: 1.8, y: 1.3, rotY: -90, w: 0.5, h: 0.9, d: 0.02, materiale: 'pittura su muro', colore: '#8a3a32',
      note: 'POSIZIONE INVENTATA: nelle foto è su un muro esterno; se non si vuole all\'interno, togliere', foto: ['IMG_9482.jpg', 'IMG_9481_001.jpg'] }
  ],

  /* Punti di vista per riprodurre le foto. fov = angolo VERTICALE (three.js).
     Foto iPhone 3:4 verticali (1500x2000, 26 mm eq.): fov verticale ~67°, aspetto 0.75. Foto orizzontale 9480: fov ~53°, aspetto 1.333.
     Fotogrammi video 9:16 verticali (stabilizzati): fov verticale ~64°, aspetto 0.5625. */
  camere: [
    /* GIRO 2: nuove foto (facciata di notte, vetrine col foglio A4) e la vista di Aldo da dietro il bancone */
    { id: 'c9485', nome: 'Facciata di notte (insegna OTTICA · Aldo Macrì)', x: 2.2, y: 1.45, z: -5.6, guarda: [2.25, 1.75, -1.0], fov: 60, aspetto: 0.75, foto: 'IMG_9485.jpg' },
    { id: 'c9492', nome: 'Vetrina sinistra dal vestibolo (foglio A4)', x: 2.45, y: 1.45, z: -1.45, guarda: [0.9, 1.15, -0.4], fov: 67, aspetto: 0.75, foto: 'IMG_9492.jpg' },
    { id: 'c9493', nome: 'Vetrina destra dal marciapiede (foglio A4)', x: 2.75, y: 1.43, z: -3.5, guarda: [3.0, 1.35, -1.1], fov: 66, aspetto: 0.75, foto: 'IMG_9493.jpg' },
    { id: 'c9494', nome: 'Vetrina destra da vicino (foglio A4)', x: 3.0, y: 1.5, z: -2.45, guarda: [3.0, 1.35, -1.1], fov: 66, aspetto: 0.75, foto: 'IMG_9494.jpg' },
    { id: 'dietro-bancone', nome: 'Dietro il bancone · la postazione di Aldo', breve: 'Dietro il bancone', gruppo: 'interno', x: 0.8, y: 1.6, z: 3.35, guarda: [1.85, 1.0, 1.85], fov: 66, aspetto: 0.5625, foto: 'IMG_9487_001.jpg' },
    { id: 'c9476', nome: 'Vestibolo: vetrina sinistra e porta', x: 1.75, y: 1.45, z: -2.6, guarda: [1.85, 1.3, 0.0], fov: 67, aspetto: 0.75, foto: 'IMG_9476.jpg' },
    { id: 'c9477', nome: 'Vetrina sinistra da destra', x: 2.3, y: 1.45, z: -1.6, guarda: [0.5, 1.2, -0.45], fov: 67, aspetto: 0.75, foto: 'IMG_9477.jpg' },
    { id: 'c9478', nome: 'Vetrina destra', x: 2.2, y: 1.4, z: -2.8, guarda: [3.0, 1.2, -1.3], fov: 67, aspetto: 0.75, foto: 'IMG_9478.jpg' },
    { id: 'c9479', nome: 'Fondo: corridoio, Versace/Luxottica, totem Ray-Ban', x: 2.9, y: 1.45, z: 0.75, guarda: [3.0, 1.3, 4.4], fov: 67, aspetto: 0.75, foto: 'IMG_9479.jpg' },
    { id: 'c9480', nome: 'Parete sinistra e bancone', x: 3.7, y: 1.45, z: 0.95, guarda: [0.2, 1.3, 2.05], fov: 53, aspetto: 1.333, foto: 'IMG_9480.jpg' },
    { id: 'entrata', nome: 'Entrando: dalla zona vetrina, oltre la porta interna aperta (bancone subito a sinistra)', x: 2.3, y: 1.6, z: -0.9, guarda: [1.7, 1.1, 2.2], fov: 67, aspetto: 0.75, foto: null },
    { id: 'c9473_001', nome: 'Giro: porta vista da dentro', x: 2.3, y: 1.45, z: 1.2, guarda: [2.2, 1.3, -1.0], fov: 64, aspetto: 0.5625, foto: 'IMG_9473_001.jpg' },
    { id: 'c9473_005', nome: 'Giro: libreria e cassa', x: 2.3, y: 1.45, z: 1.2, guarda: [0.1, 1.4, 0.9], fov: 64, aspetto: 0.5625, foto: 'IMG_9473_005.jpg' },
    { id: 'c9473_008', nome: 'Giro: angolo di fondo a sinistra', x: 2.3, y: 1.45, z: 1.2, guarda: [0.6, 1.2, 4.0], fov: 64, aspetto: 0.5625, foto: 'IMG_9473_008.jpg' },
    { id: 'c9473_010', nome: 'Giro: corridoio e blocco Luxottica', x: 2.3, y: 1.45, z: 1.2, guarda: [2.7, 1.3, 4.4], fov: 64, aspetto: 0.5625, foto: 'IMG_9473_010.jpg' },
    { id: 'c9473_012', nome: 'Giro: sedie e colonna Guess', x: 2.3, y: 1.45, z: 1.2, guarda: [4.5, 1.1, 3.0], fov: 64, aspetto: 0.5625, foto: 'IMG_9473_012.jpg' },
    { id: 'c9473_014', nome: 'Giro: parete mensole occhiali', x: 2.3, y: 1.45, z: 1.2, guarda: [4.5, 1.3, 1.5], fov: 64, aspetto: 0.5625, foto: 'IMG_9473_014.jpg' }
  ]
};
