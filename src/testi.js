// All Italian text shown in the game lives in this one file.
// To change a word in the game, change it here only.

const TESTI = {
  // Shown when the phone is held upright (portrait)
  ruotaTelefono: 'Ruota il telefono in orizzontale',

  // Title screen
  titolo: {
    nome: "Nozze nel Bosco d'Inverno",
    // Both players must touch together to start, but the text doesn't say so: they find out together
    toccaPerIniziare: 'Tocca per iniziare',
    insieme: 'Insieme!',
    silvia: 'Silvia',
    francesco: 'Francesco',
  },

  // Words used in many places
  comuni: {
    bravissimi: 'Bravissimi!',
    toccaPerContinuare: 'Tocca per continuare',
  },

  // Story intro (4 scenes)
  intro: {
    pannello1: "È un bellissimo giorno d'inverno. Tra non molto Silvia e Francesco si sposano sotto il grande albero del paese.",
    pannello2: "Ma un ventaccio improvviso ha portato via tutto: i regali, la torta, gli anelli e le luci!",
    pannello3: 'Miao! Prometto che non è colpa mia…',
    pannello4: 'Miao! Seguitemi, vi aiuto io!',
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
    mario: 'Attenti agli alberi!',
    via: 'Via!',
    traguardo: 'Traguardo',
    miao: 'Miao!',
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
    caduto: 'Oh no, è caduto!',
    crollo: 'Attenzione! La torta pende troppo!',
    marioVittoria: 'Che torta meravigliosa… ora posso assaggiarla?',
    unDito: 'Un dito solo!',
    ohNo: 'Oh no! Riproviamo!',
  },

  // Mini game 3: Gli Anelli Perduti
  anelli: {
    nome: 'Gli Anelli Perduti',
    istruzioneSilvia: 'Silvia: Scegli una tessera di ghiaccio, poi tocca le due uguali',
    istruzioneFrancesco: 'Francesco: Rompi il ghiaccio unendo i punti senza staccare il dito!',
    mario: "Ehm… forse ci ho giocato un po' io…",
    scegli: 'Silvia, scegli una tessera!',
    nonStaccare: 'Non staccare il dito!',
    massimoDue: 'Massimo due tessere alla volta!',
    uguali: 'Uguali! Silvia, toccale!',
    anelli: 'Gli anelli!',
    marioVittoria: 'Visto? Li avete trovati! Non era poi colpa mia…',
    tempoScaduto: 'Tempo scaduto! Riproviamo!',
  },

  // Mini game 4: Il Dirigibile delle Lanterne
  dirigibile: {
    nome: 'Il Dirigibile delle Lanterne',
    istruzioneSilvia: 'Silvia: Trascina per guidare il dirigibile',
    istruzioneFrancesco: "Francesco: Disegna cerchi per far girare l'elica",
    mario: 'Che vista da quassù!',
    vento: 'Vento!',
    poche: 'Poche lanterne… Riproviamo!',
    marioVittoria: 'Le lanterne sono tornate! Che luce!',
  },

  // Finale: La Cerimonia
  cerimonia: {
    nome: 'La Cerimonia',
    // The start card: Mario wants three strokes, each with a new pose and line
    carezza1: 'Accarezzami per continuare',
    carezza2: "Un'altra carezza, già che ci siamo, dai!",
    carezza3: "L'ultima coccola, lo prometto!",
    tenete: 'Tenete premuto insieme!',
  },

  // Ending screen
  fine: {
    appenaSposati: 'Appena Sposati!',
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
