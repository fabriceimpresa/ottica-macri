/* =====================================================================
   OTTICA MACRÌ · PREZZI PER IL CLIENTE (unico file da modificare)
   Li leggono: preventivo-a.html, preventivo-b.html e il PDF riepilogo.
   Valori PROPOSTI da Claude il 5/11/2026 dalla previsione
   (30 €/h, 15% imprevisti, ore medie): FABRICE LI DEVE CONFERMARE.
   Dopo una modifica: rilancia presentazione/crea_riepilogo.py per il PDF.
   5/11 sera: RIBASSO chiesto da Fabrice (Aldo non ha grandi disponibilità). Valori di prima: prezzi.prima-ribasso.js
   (A 11.500 -> 7.600 pieno; B 3.250 -> 2.300 pieno). Motivo: la base STORE // CRAFT è riusata: si vende un prodotto, non ore.
   ===================================================================== */
window.PREZZI = {
  confermati: false,            // metti true quando Fabrice ha deciso
  valuta: '€',
  iva: 'IVA esclusa',
  validita: '30 giorni',
  data: '5 novembre 2026',

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

  /* Schermo per la vetrina: prezzi indicativi rilevati online a novembre 2026 (ricerca/vetrina-hardware.md) */
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
