/* =====================================================================
   OTTICA MACRÌ · PREZZI PER IL CLIENTE (unico file da modificare)
   Li leggono: preventivo-a.html, preventivo-b.html e il PDF riepilogo.
   Valori PROPOSTI da Claude il 5/11/2026 dalla previsione
   (30 €/h, 15% imprevisti, ore medie): FABRICE LI DEVE CONFERMARE.
   Dopo una modifica: rilancia presentazione/crea_riepilogo.py per il PDF.
   5/11 sera: RIBASSO chiesto da Fabrice (Aldo non ha grandi disponibilità). Valori di prima: prezzi.prima-ribasso.js
   (A 11.500 -> 7.600 pieno; B 3.250 -> 2.300 pieno). Motivo: la base STORE // CRAFT è riusata: si vende un prodotto, non ore.
   6/11/2026 · PREVENTIVO UNICO (decisione Fabrice): non più due piani A/B ma UN SOLO preventivo
   «STORE // CRAFT + Archivio Clienti» (STORE // CRAFT ESSENZIALE) = PREZZI.unico, letto da preventivo-b.html
   (preventivo-a.html ora rimanda lì). In fondo al preventivo le ESTENSIONI come MODULI EXTRA singoli = PREZZI.moduliExtra,
   con le SOLE cifre già presenti nei blocchi del pianoA (nessuna cifra nuova). L'Amministrazione di base è INCLUSA nel pacchetto
   (decisione Fabrice): «Amministrazione completa» resta come extra con prezzo DA DEFINIRE (null).
   Totali del pacchetto 2.500 € pieno / 1.800 € scontato DECISI DA FABRICE il 6/11 (prima 1.500, alzato su sua richiesta; copia prezzi.prima-1800.js) (cifre esplicite, non calcolate dallo sconto %).
   Ripartizione dei 3 blocchi DECISA DA FABRICE 6/11: Base grafica 1.175 · Video vetrina 1.025 · Archivio clienti 300 (somma 2.500)
   (prima proposta di Claude 1.050/900/550, corretta da Fabrice). Totali 2.500/1.500 decisi da Fabrice. Tempi di consegna del pacchetto: 3–4 settimane (Fabrice).
   confermati resta FALSE: li conferma Fabrice alla fine. PDF riepilogo NON rigenerato. Copia di prima: prezzi.prima-unico.js.
   pianoA / pianoB restano qui sotto SOLO come archivio (li leggono ancora il PDF riepilogo e la previsione).
   ===================================================================== */
window.PREZZI = {
  confermati: false,            // metti true quando Fabrice ha deciso
  valuta: '€',
  iva: 'IVA esclusa',
  validita: '30 giorni',
  data: '6 novembre 2026',

  pianoA: {
    nome: 'Piano A · STORE // CRAFT Completo',
    slogan: 'Tutto il negozio in un\'unica app: grafica, magazzino, clienti, social e vetrina digitale.',
    blocchi: [
      { id: 'base',      nome: 'BASE · Grafica STORE // CRAFT', cosa: 'Cartelli, cartellini, etichette DYMO e promo per la vetrina e il bancone, già pronti per l\'ottica.', prezzo: 950, tempi: '2–4 settimane' },
      { id: 'gestione',  nome: 'GESTIONE · Magazzino', cosa: 'Arriva merce, vendo, cerco, inventario e statistiche con il lettore di codici e le etichette DYMO.', prezzo: 2200, tempi: '6–10 settimane' },
      { id: 'admin',     nome: 'AMMINISTRAZIONE · Clienti e negozio', cosa: 'Schede clienti con acquisti e note, privacy in regola, dati del negozio, utenti e impostazioni.', prezzo: 1100, tempi: '3–5 settimane' },
      { id: 'social',    nome: 'SOCIAL + NEWSLETTER', cosa: 'L\'app prepara grafica e testo e pubblica per lei su Instagram e Facebook; newsletter e avviso WhatsApp «occhiali pronti».', prezzo: 2400, tempi: '6–11 settimane' },
      { id: 'vetrina',   nome: 'VETRINA DIGITALE', cosa: 'Tablet in vetrina con grafiche animate, comandato dal PC del negozio o dal telefono.', prezzo: 950, tempi: '3–5 settimane' }
    ],
    scontoPacchetto: 10,         // % se prende tutto il Piano A insieme
    canone: '25–40 € al mese (database con copie di sicurezza, aggiornamenti e assistenza)'
  },

  pianoB: {
    nome: 'Piano B · STORE // CRAFT Essenziale',
    slogan: 'Poca spesa, niente complicazioni: si comincia subito e si cresce quando vuole.',
    blocchi: [
      { id: 'base',     nome: 'BASE · Grafica STORE // CRAFT', cosa: 'Cartelli, cartellini, etichette DYMO e promo, già pronti per l\'ottica.', prezzo: 950, tempi: '2–4 settimane' },
      { id: 'vetrina',  nome: 'VIDEO VETRINA economica', cosa: 'Grafiche animate in vetrina su cornice digitale o tablet economico.', prezzo: 850, tempi: '2–4 settimane' },
      { id: 'clienti',  nome: 'ARCHIVIO CLIENTI con note', cosa: 'Schede clienti con le note in ordine di data: lo storico di ogni cliente, semplice come una rubrica.', prezzo: 500, tempi: '1–3 settimane' }
    ],
    scontoPacchetto: 10,
    canone: 'Nessun canone obbligatorio (i dati restano sul PC del negozio con copia di sicurezza)'
  },

  /* ===== 6/11 · IL PREVENTIVO UNICO ===== */
  unico: {
    nome: 'STORE // CRAFT + Archivio Clienti',
    enfasi: 'STORE // CRAFT ESSENZIALE',
    slogan: 'Tutto quello che serve al negozio ogni giorno, in un pacchetto solo: stampe, video in vetrina e archivio clienti. Il resto si aggiunge quando vuoi, un modulo alla volta.',
    tempi: '3–4 settimane',
    totalePieno: 2500,            // deciso da Fabrice 6/11
    totaleScontato: 1800,         // deciso da Fabrice 6/11 sera (sconto risultante: −700 € · −28%)
    blocchi: [                    // ripartizione decisa da Fabrice 6/11 (somma 2.500)
      { id: 'base',    nome: 'STAMPE · Grafica STORE // CRAFT', cosa: 'Cartelli in vari formati, cartellini, etichette adesive DYMO e set di stampe pronte per il punto vendita: promozioni e operazioni in pochi clic, Lista di stampa e Cronologia, utilità di Cassa.', prezzo: 1175 },
      { id: 'vetrina', nome: 'VETRINA DIGITALE completa · video vetrina', cosa: 'Grafiche animate, loop e video in vetrina su tablet, schermo o cornice digitale. Tutte le funzioni comprese: comandi dal PC del negozio o dal telefono, «Manda in vetrina», playlist e orari programmati.', prezzo: 1025 },
      { id: 'clienti', nome: 'ARCHIVIO CLIENTI · Amministrazione inclusa', cosa: 'Schede clienti con note e storico in ordine di data, semplice come una rubrica; dati del negozio e impostazioni: l’amministrazione che serve ogni giorno è già compresa.', prezzo: 300 }
    ],
    canone: 'Nessun canone obbligatorio (i dati restano sul PC del negozio con copia di sicurezza)'
  },

  /* ===== 6/11 · ESTENSIONI acquistabili come SINGOLI MODULI EXTRA. 6/11 mattina Fabrice: tolta «Vetrina digitale completa» (è già inclusa nel pacchetto);
     Gestione 2.200 / 4–5 sett., Social 2.500 / 5–6 sett. (decisi da Fabrice); Amministrazione invariata + «corrispettivi». Copia: prezzi.prima-moduli.js ===== */
  moduliExtra: [
    { id: 'gestione', nome: 'GESTIONE · Magazzino', cosa: 'Arriva merce, vendo, cerco, inventario e statistiche con il lettore di codici e le etichette DYMO.', prezzo: 2200, tempi: '4–5 settimane', da: 'Fabrice 6/11' },
    { id: 'social', nome: 'SOCIAL + NEWSLETTER', cosa: 'L’app prepara grafica e testo e pubblica per te su Instagram e Facebook; newsletter e avviso WhatsApp «occhiali pronti».', prezzo: 2500, tempi: '5–6 settimane', da: 'Fabrice 6/11' },
    { id: 'admin-plus', nome: 'AMMINISTRAZIONE completa', cosa: 'Oltre all’archivio clienti già incluso: acquisti collegati alle schede, privacy in regola, utenti e permessi, corrispettivi.', prezzo: null, tempi: 'da definire', da: 'prezzo da definire (Fabrice)' }
  ],

  /* ===== 6/11 · HARDWARE per il video vetrina: SPESE EXTRA DA VERIFICARE, non comprese nel prezzo del software.
     Prezzi indicativi rilevati online (fonti in ricerca/schermi-vetrina-2026-11.md). ===== */
  hardwareVetrina: {
    proposte: [
      { fascia: 'TABLET · fascia media', prodotto: 'Samsung Galaxy Tab S10 FE+ 13,1"', dettagli: 'Wi-Fi 8/128 GB · schermo grande e luminoso · foto, video e la pagina Vetrina a tutto schermo', prezzo: '~550–750 € (listino 749 €, in offerta da ~549 €)' },
      { fascia: 'SCHERMO DA VETRINA · fascia media', prodotto: 'Philips 32BDL4050Q (Q-Line 32")', dettagli: 'Android 10 integrato · altoparlanti 2×10 W · 400 nit · acceso 24/7 · anche in verticale · audio, foto e video', prezzo: '~400–540 € + supporto da terra/tavolo' }
    ],
    altre: [
      { tipo: 'cornice', prodotto: 'Cornice digitale Frameo 10"', prezzo: '60–90 €', nota: 'foto e brevi video dal telefono; niente pagine animate' },
      { tipo: 'cornice', prodotto: 'Cornice digitale Frameo 15,6" (Denver / Arzopa)', prezzo: '130–180 €', nota: 'più grande, sempre solo foto e video' },
      { tipo: 'tablet', prodotto: 'Samsung Galaxy Tab A9+ 11" + supporto e timer', prezzo: '180–255 €', nota: 'il più economico che apre la pagina Vetrina' },
      { tipo: 'monitor', prodotto: 'Samsung Smart Monitor M5 32" in verticale', prezzo: '220–270 €', nota: 'grande, si vede dalla strada; luminosità bassa' },
      { tipo: 'display', prodotto: 'Barcelona LED DDT21.5 Android 21,5"', prezzo: '~230 € l’uno (in coppia) + supporto', nota: 'da parete, Wi-Fi' },
      { tipo: 'display', prodotto: 'Samsung Smart Signage QB24C 24"', prezzo: '~340 €', nota: 'fatto per i negozi, 16 ore al giorno' }
    ]
  },

  /* Schermo per la vetrina: prezzi indicativi rilevati online a novembre 2026 (ricerca/vetrina-hardware.md) — archivio, ora vedi hardwareVetrina */
  schermiVetrina: [
    { fascia: 'ECONOMICO', prodotto: 'Cornice digitale Frameo 10"', prezzo: '60–90 €', nota: 'foto e brevi video caricati dal telefono' },
    { fascia: 'MEDIO · consigliato', prodotto: 'Tablet Samsung Galaxy Tab A9+ 11" + supporto e timer', prezzo: '180–255 €', nota: 'si accende da solo, comandato dal PC o dal telefono' },
    { fascia: 'ALTO', prodotto: 'Schermo Samsung Smart Monitor 32" in verticale', prezzo: '220–270 €', nota: 'più grande, si vede dalla strada' }
  ],

  totale: function (piano) {
    var t = 0; piano.blocchi.forEach(function (b) { t += b.prezzo; });
    var s = Math.round(t * (1 - piano.scontoPacchetto / 100) / 50) * 50;
    return { pieno: t, scontato: s };
  },
  euro: function (n) { return String(Math.round(n)).replace(/\B(?=(\d{3})+(?!\d))/g, '.') + ' €'; }
};
