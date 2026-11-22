// All Italian text shown in the game lives in this one file.
// To change a word in the game, change it here only.

const TESTI = {
  // Shown when the phone is held upright (portrait)
  ruotaTelefono: 'Ruota il telefono in orizzontale',

  // Title screen
  titolo: {
    nome: 'Nozze a Natale',
    // Both players must touch together to start, but the text doesn't say so: they find out together
    toccaPerIniziare: 'Tieni premuto per iniziare',
    insieme: 'Insieme!',
    silvia: 'Silvia',
    francesco: 'Francesco',
  },

  // Words used in many places
  comuni: {
    bravissimi: 'Bravissimi!',
    toccaPerContinuare: 'Tocca per continuare',
    salta: 'Salta ›',
  },

  // Story intro (4 scenes)
  intro: {
    pannello1: "È un bellissimo giorno d'inverno.\nSilvia e Francesco si stanno preparando per la cerimonia sotto il grande albero del Paese.",
    pannello2: 'Ma un ventaccio improvviso ha portato via tutto: i regali, la torta, gli anelli e le luci. OH\u00a0NO!!!', // (\u00a0 = a space that never breaks the line: OH NO stays together)
    pannello3: 'Miao! Prometto che non è stata colpa mia…',
    pannello4: 'Miao! Vi aiuterò io a recuperare tutto, siete in buone zampe!',
  },

  // Result card after winning a mini game
  risultato: {
    riprova: 'Riprova',
    avanti: 'Avanti',
    record: 'Il vostro record:',
  },

  // Title screen, coming back with saved progress
  scelta: {
    bentornati: 'Bentornati!',
    continua: 'Continua',
    dallInizio: "Dall'inizio",
  },

  // Start card shown before every mini game
  carta: {
    accarezza: 'Accarezza Mario per iniziare',
  },

  // Mini game 1: La Slitta dei Regali
  slitta: {
    nome: 'La Slitta dei Regali',
    istruzioneSilvia: 'Silvia: Trascina per guidare',
    istruzioneFrancesco: 'Francesco: Tocca veloce per spingere!',
    zonaFrancesco: 'Tocca veloce per spingere',
    zonaSilvia: 'Trascina per guidare',
    mario: 'Attenti agli alberi… e a me!',
    via: 'Via!',
    traguardo: 'Traguardo',
    miao: 'Miao!',
    miaoOffeso: 'Miaaao!!',
    ohNo: 'Oh no! Riproviamo!',
    tempoScaduto: 'Tempo scaduto! Riproviamo!',
    pochiRegali: 'Pochi regali… Riproviamo!',
    marioVittoria: 'Che corsa! I regali sono tutti salvi!',
  },

  // Mini game 2: La Torta Nuziale
  torta: {
    nome: 'La Torta Nuziale',
    istruzioneSilvia: 'Silvia: Tocca al momento giusto',
    istruzioneFrancesco: 'Francesco: Tieni la torta dritta con un dito solo, premendo ◀ o ▶ ai bordi',
    mario: 'Mmm… posso assaggiare?',
    perfetto: 'Perfetto!',
    slurp: 'Slurp!',
    marioGioca: "Gioco anch'io!",
    scaccia: 'Toccate Mario per mandarlo via!',
    caduto: 'Oh no, è caduto!',
    crollo: 'Attenzione! La torta pende troppo!',
    marioVittoria: 'Che torta meravigliosa… adesso si mangia?',
    unDito: 'Un dito solo!',
    ohNo: 'Oh no! Riproviamo!',
  },

  // Mini game 3: Gli Anelli Perduti
  anelli: {
    nome: 'Gli Anelli Perduti',
    istruzioneSilvia: 'Silvia: Scegli le tessere di ghiaccio da aprire', // (was '…, poi tocca le due uguali': pairs now turn green by themselves)
    istruzioneFrancesco: 'Francesco: Rompi il ghiaccio unendo i punti senza staccare il dito!',
    mario: 'Voglio gioc… ehm… aiutarvi anche io',
    scegli: 'Silvia, scegli una tessera!',
    nonStaccare: 'Non staccare il dito!',
    massimoDue: 'Massimo due tessere alla volta!',
    uguali: 'Uguali! Silvia, toccale!',
    scambio: 'Mario ha scambiato due tessere!',
    attentoMario: 'Attento a Mario! Ricomincia dal punto 1',
    anelli: 'Gli anelli!',
    marioVittoria: 'Visto? Li abbiamo trovati insieme!',
    tempoScaduto: 'Tempo scaduto! Riproviamo!',
  },

  // Mini game 4: Il Dirigibile delle Lanterne
  dirigibile: {
    nome: 'Il Dirigibile delle Lanterne',
    istruzioneSilvia: 'Silvia: Trascina per guidare il dirigibile',
    istruzioneFrancesco: "Francesco: Soffia per far girare l'elica!",
    consenti: 'Consentite il microfono…',
    senzaMicrofono: 'Niente microfono: Francesco, disegna cerchi!',
    mario: 'Che vista da quassù, vero Silvia?',
    vento: 'Vento!',
    marioFermo: 'Mario, stai fermo!',
    poche: 'Poche lanterne… Riproviamo!',
    marioVittoria: 'Le lanterne sono tornate! Che LUCE!',
  },

  // Finale: La Cerimonia
  cerimonia: {
    nome: 'La Cerimonia',
    // The start card: Mario wants three strokes, each with a new pose and line
    carezza1: 'Accarezzami per continuare',
    carezza2: "Un'altra carezza, dai!",
    carezza3: "L'ultima, promesso!",
    tenete: 'Tenete premuto insieme!',
  },

  // Ending screen
  fine: {
    appenaSposati: 'AUGURI', // (was 'Appena Sposati!'; the name of this entry is kept so the code doesn't change)
    nomi: 'Silvia & Francesco',
    buonNatale: 'Buon Natale',
    giocaAncora: 'Gioca ancora',
  },

  // Step 1 test screen: checks that both players can touch at the same time
  provaTocco: {
    silvia: 'Silvia',
    francesco: 'Francesco',
    toccaQui: 'Tocca qui',
    insieme: 'Insieme!',
  },
};
