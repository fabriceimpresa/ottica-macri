/* Ottica Macrì · demo app v2 · DATI FINTI (credibili) per la prova. Nessun dato reale di clienti.
   Prezzi e quantità sono esempi: non sono listini ufficiali dei marchi. */
window.DATI = (function () {
  var NEGOZIO = {
    nome: 'Ottica Macrì', titolare: 'Aldo Macrì', ragione: 'MACRÌ ALDO (Ottica Macrì)',
    via: "Via Poggi D'Oro 23", cap: '00179', citta: 'Roma', tel: '06 78346705', piva: '08516310581', ateco: '47.74.01',
    email: 'info@otticamacri.it (esempio)', facebook: 'facebook.com/OtticaMacri', instagram: '— da collegare —',
    orari: [['Lunedì', 'chiuso la mattina · 16:00–19:30'], ['Martedì – Venerdì', '9:30–13:00 · 16:00–19:30'], ['Sabato', '9:30–13:00 · 16:00–19:30'], ['Domenica', 'chiuso']],
    orariNota: 'orari di esempio: da confermare con Aldo'
  };

  var MARCHE = ['Ray-Ban', 'Persol', 'Oakley', 'Carrera', 'Giorgio Armani', 'Vogue Eyewear', 'Michael Kors', 'Essilor', 'Unika', 'Ottica Macrì'];
  var CAT = { vista: 'Montature da vista', sole: 'Occhiali da sole', lenti: 'Lenti oftalmiche', lac: 'Lenti a contatto', acc: 'Liquidi e accessori' };
  var FORNITORI = ['EssilorLuxottica (Ray-Ban, Persol, Oakley, Vogue, Armani, Michael Kors)', 'Safilo (Carrera)', 'Essilor Italia (lenti)', 'Unika · distributore liquidi', 'Grossista accessori'];

  /* PREZZI_ESEMPIO: unico posto per i prezzi dei modelli in vetrina (usati da magazzino, cartelli, stanghette e
     dalle grafiche di media/blackfriday/vetrine). ESEMPI DA CONFERMARE CON ALDO, non listini ufficiali.
     pieno = prezzo di cartellino · sconto = % Black Friday · bf = prezzo Black Friday (arrotondato) */
  var PE = {
    RB2140: { nome: 'Ray-Ban Wayfarer', pieno: 109, sconto: 30, bf: 76 },
    RB3025: { nome: 'Ray-Ban Aviator', pieno: 149, sconto: 25, bf: 112 },
    RB5154: { nome: 'Ray-Ban Clubmaster', pieno: 139, sconto: 30, bf: 97 },
    PO0649: { nome: 'Persol 649', pieno: 320, sconto: 20, bf: 256 },
    OO9102: { nome: 'Oakley Holbrook', pieno: 150, sconto: 20, bf: 120 }
  };

  // codice, marca, modello, categoria, prezzo, costo, giacenza, scorta minima, calibro, ponte, venduti 12 mesi
  function A(cod, marca, modello, cat, prezzo, costo, giac, min, cal, ponte, v12) {
    return { cod: cod, marca: marca, modello: modello, cat: cat, prezzo: prezzo, costo: costo, giac: giac, min: min, cal: cal || '', ponte: ponte || '', v12: v12 || 0 };
  }
  var ARTICOLI = [
    A('8056597112403', 'Ray-Ban', 'RB2140 Wayfarer 50', 'sole', PE.RB2140.pieno, 55, 4, 2, 50, 22, 31),
    A('8056597101247', 'Ray-Ban', 'RB3025 Aviator 58', 'sole', PE.RB3025.pieno, 75, 3, 2, 58, 14, 27),
    A('8056597130186', 'Ray-Ban', 'RB5154 Clubmaster 51', 'vista', PE.RB5154.pieno, 68, 2, 1, 51, 21, 12),
    A('8056597141472', 'Ray-Ban', 'RB7047 rettangolare 54', 'vista', 125, 60, 1, 2, 54, 17, 9),
    A('8056597208834', 'Persol', 'PO0649 54', 'sole', PE.PO0649.pieno, 158, 2, 1, 54, 20, 8),
    A('8056597211056', 'Persol', 'PO3092V 50', 'vista', 215, 104, 2, 1, 50, 19, 6),
    A('8056597305120', 'Oakley', 'Holbrook OO9102 55', 'sole', PE.OO9102.pieno, 74, 3, 1, 55, 18, 11),
    A('8056597307742', 'Oakley', 'Pitchman OX8050 55', 'vista', 159, 79, 0, 1, 55, 18, 4),
    A('8059632401159', 'Carrera', '1007/S 61', 'sole', 129, 61, 5, 2, 61, 18, 14),
    A('8059632403320', 'Carrera', '8862 54', 'vista', 119, 57, 3, 1, 54, 18, 7),
    A('8056597402218', 'Giorgio Armani', 'AR7231 52', 'vista', 189, 92, 2, 1, 52, 18, 5),
    A('8056597404809', 'Giorgio Armani', 'AR8165 rotondo 50', 'sole', 230, 112, 1, 1, 50, 21, 3),
    A('8056597501133', 'Vogue Eyewear', 'VO5286 51', 'vista', 95, 45, 6, 2, 51, 17, 18),
    A('8056597503694', 'Vogue Eyewear', 'VO5211S cat-eye 54', 'sole', 105, 50, 2, 1, 54, 17, 9),
    A('8056597601239', 'Michael Kors', 'MK2024 Adrianna 59', 'sole', 135, 65, 2, 1, 59, 16, 10),
    A('8056597603035', 'Michael Kors', 'MK4067U 53', 'vista', 125, 60, 1, 1, 53, 17, 4),
    A('3549890112456', 'Essilor', 'Varilux Comfort Max 1.6 (coppia)', 'lenti', 480, 205, 0, 0, '', '', 22),
    A('3549890223159', 'Essilor', 'Crizal Sapphire monofocali 1.5 (coppia)', 'lenti', 180, 70, 0, 0, '', '', 41),
    A('3549890331816', 'Essilor', 'Eyezen Start 1.6 (coppia)', 'lenti', 210, 86, 0, 0, '', '', 15),
    A('8017780055012', 'Unika', 'Soluzione unica 360 ml', 'acc', 12.5, 5.2, 14, 6, '', '', 96),
    A('8017780055029', 'Unika', 'Soluzione unica 100 ml da viaggio', 'acc', 6.9, 2.6, 3, 5, '', '', 44),
    A('8017780061112', 'Unika', 'Lacrime artificiali 10 ml', 'acc', 9.9, 3.9, 8, 4, '', '', 37),
    A('8000000101016', 'Essilor', 'Lenti a contatto mensili (6 pz)', 'lac', 29, 12, 10, 5, '', '', 52),
    A('8000000101023', 'Essilor', 'Lenti a contatto giornaliere (30 pz)', 'lac', 24.9, 10, 7, 5, '', '', 61),
    A('8000000200016', 'Ottica Macrì', 'Panno in microfibra', 'acc', 3, 0.6, 40, 10, '', '', 120),
    A('8000000200023', 'Ottica Macrì', 'Astuccio rigido', 'acc', 8, 2.1, 22, 8, '', '', 58),
    A('8000000200030', 'Ottica Macrì', 'Cordino per occhiali', 'acc', 6, 1.4, 4, 6, '', '', 19)
  ];

  // codici "nuovi" che il lettore simulato può leggere al CARICO (articolo non ancora in magazzino)
  var NUOVI = [
    { cod: '8056597189740', marca: 'Ray-Ban', modello: 'RB4171 Erika 54', cat: 'sole', prezzo: 145, costo: 71, cal: 54, ponte: 18 },
    { cod: '8056597219561', marca: 'Persol', modello: 'PO3166S 51', cat: 'sole', prezzo: 255, costo: 124, cal: 51, ponte: 22 },
    { cod: '8059632407779', marca: 'Carrera', modello: 'Victory C 01/S 99', cat: 'sole', prezzo: 159, costo: 75, cal: 99, ponte: '' }
  ];

  var CLIENTI = [
    { id: 1, nome: 'Maria Rossi', tel: '333 412 7781', email: 'maria.rossi@esempio.it', comp: '14 marzo', privacy: '12/03/2026', mkt: true, cliente: 'dal 2019' },
    { id: 2, nome: 'Giuseppe Bianchi', tel: '347 220 1945', email: 'g.bianchi@esempio.it', comp: '2 luglio', privacy: '03/05/2024', mkt: true, cliente: 'dal 2015' },
    { id: 3, nome: 'Anna Ferri', tel: '339 870 5512', email: '', comp: '21 novembre', privacy: '18/09/2025', mkt: false, cliente: 'dal 2022' },
    { id: 4, nome: 'Luca Marchetti', tel: '328 190 3307', email: 'luca.marchetti@esempio.it', comp: '9 gennaio', privacy: '27/06/2026', mkt: true, cliente: 'dal 2026' },
    { id: 5, nome: 'Carla Romano', tel: '320 556 0918', email: 'carla.romano@esempio.it', comp: '30 aprile', privacy: '11/11/2023', mkt: true, cliente: 'dal 2011' },
    { id: 6, nome: 'Franco De Santis', tel: '06 7815 223', email: '', comp: '5 agosto', privacy: '02/02/2021', mkt: false, cliente: 'dal 2008' },
    { id: 7, nome: 'Silvia Greco', tel: '331 774 0821', email: 'silvia.greco@esempio.it', comp: '17 dicembre', privacy: '08/10/2026', mkt: true, cliente: 'dal 2024' },
    { id: 8, nome: 'Marco Colombo', tel: '349 663 2150', email: 'marco.colombo@esempio.it', comp: '26 maggio', privacy: '15/01/2026', mkt: true, cliente: 'dal 2020' }
  ];
  var ACQUISTI = {
    1: [['02/11/2026', 'Ray-Ban RB5154 Clubmaster + Varilux Comfort Max', 619], ['14/04/2026', 'Soluzione unica Unika 360 ml', 12.5]],
    2: [['30/10/2026', 'Carrera 8862 + Crizal Sapphire monofocali', 299], ['10/01/2026', 'Soluzione unica Unika 360 ml', 12.5]],
    3: [['05/09/2026', 'Vogue VO5211S cat-eye', 105]],
    4: [['25/10/2026', 'Lenti a contatto giornaliere (30 pz) ×2', 49.8]],
    5: [['22/07/2026', 'Michael Kors MK2024 Adrianna', 135], ['03/03/2026', 'Riparazione aste (gratuita)', 0]],
    6: [['12/02/2026', 'Persol PO3092V + Eyezen Start', 425]],
    7: [['08/10/2026', 'Oakley Holbrook', 150]],
    8: [['25/10/2026', 'Lenti a contatto mensili (6 pz)', 29], ['18/06/2026', 'Ray-Ban RB2140 Wayfarer', 109]]
  };
  var NOTE = {
    1: [['02/11/2026', 'Occhiali con progressive consegnati: contenta. Ricordare pulizia tra 6 mesi.'], ['20/10/2026', 'Ordinate le lenti, pronte in 10 giorni.']],
    2: [['30/10/2026', 'Preferisce montature leggere. Chiamare per controllo viti a gennaio.']],
    5: [['22/07/2026', 'Ama il cat-eye. Avvisare quando arrivano i nuovi Vogue.']],
    6: [['12/02/2026', 'Non usa il telefonino: chiamare sul fisso.']]
  };

  var UTENTI = [
    { nome: 'Aldo Macrì', ruolo: 'Titolare', pin: '••••', aree: { creator: true, cassiere: true, gestionale: true, amministrazione: true, promoter: true } },
    { nome: 'Collaboratrice (esempio)', ruolo: 'Banco', pin: '••••', aree: { creator: true, cassiere: true, gestionale: true, amministrazione: false, promoter: false } }
  ];

  var POST = [
    { g: -6, t: 'Novità autunno: arrivati i nuovi Persol', st: 'pub', ig: true, fb: true },
    { g: -3, t: 'Controllo della vista: chiami per l\'appuntamento', st: 'pub', ig: true, fb: true },
    { g: 1, t: 'Black Friday: Ray-Ban e Carrera in promozione', st: 'prog', ig: true, fb: true },
    { g: 4, t: 'Lenti a contatto: la scorta per l\'inverno', st: 'prog', ig: false, fb: true }
  ];
  var NEWSLETTER = [
    { d: '15/10/2026', t: 'Novità autunno in negozio', n: 5, ap: 64 },
    { d: '15/09/2026', t: 'Controllo vista per il rientro a scuola', n: 5, ap: 71 },
    { d: '20/06/2026', t: 'Occhiali da sole: la collezione estate', n: 4, ap: 58 }
  ];

  // vendite degli ultimi 12 mesi (finte), per le statistiche
  var MESI = ['dic', 'gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov'];
  var VENDITE_MESE = [9800, 6100, 5400, 6900, 7700, 9200, 11400, 10900, 4300, 8600, 8900, 2650];

  var CRONOLOGIA = [
    { g: 0, t: 'Cartello Percentuale · -30% occhiali da sole', n: 1 },
    { g: -1, t: 'Etichette DYMO · Doppio prezzo ×6', n: 6 },
    { g: -2, t: 'Cartellini Vetrina · 8 cartellini', n: 1 },
    { g: -4, t: 'Orari Apertura · A4', n: 1 }
  ];

  return { PREZZI_ESEMPIO: PE, NEGOZIO: NEGOZIO, MARCHE: MARCHE, CAT: CAT, FORNITORI: FORNITORI, ARTICOLI: ARTICOLI, NUOVI: NUOVI, CLIENTI: CLIENTI, ACQUISTI: ACQUISTI, NOTE: NOTE,
    UTENTI: UTENTI, POST: POST, NEWSLETTER: NEWSLETTER, MESI: MESI, VENDITE_MESE: VENDITE_MESE, CRONOLOGIA: CRONOLOGIA };
})();
