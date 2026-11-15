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
