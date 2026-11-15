// Saving progress on the phone (localStorage).
// Remembers how far Silvia and Francesco have got and their best stars in each mini game,
// so closing Safari or locking the phone loses nothing.
// Every read and write is protected (try/catch): if the phone blocks saving (e.g. private browsing),
// the game still works and simply keeps the progress in memory until the page is closed.
//
// To start completely fresh (e.g. before giving the gift): open the game with ?reset=1 in the address.

const CHIAVE_SALVATAGGIO = 'nozzeBoscoInverno_v1';

// The mini games in order, then the finale (scene names)
const ORDINE_GIOCHI = ['Slitta', 'Torta', 'Anelli', 'Dirigibile', 'Cerimonia'];

const Salvataggio = {
  dati: null,

  vuoto() {
    return { stelle: {}, raggiunto: null, finito: false };
  },

  carica() {
    if (this.dati) return this.dati;
    try {
      const testo = window.localStorage.getItem(CHIAVE_SALVATAGGIO);
      this.dati = testo ? { ...this.vuoto(), ...JSON.parse(testo) } : this.vuoto();
    } catch (errore) {
      this.dati = this.vuoto();
    }
    return this.dati;
  },

  salva() {
    try {
      window.localStorage.setItem(CHIAVE_SALVATAGGIO, JSON.stringify(this.dati));
    } catch (errore) {
      // Saving not allowed: keep going with the progress in memory
    }
  },

  azzera() {
    this.dati = this.vuoto();
    try {
      window.localStorage.removeItem(CHIAVE_SALVATAGGIO);
    } catch (errore) {
      // nothing to do
    }
  },

  // Is there anything saved (so we can offer "Continua")?
  haProgressi() {
    const d = this.carica();
    return d.raggiunto !== null || Object.keys(d.stelle).length > 0;
  },

  // Remember the furthest scene reached (never goes backwards)
  segnaRaggiunto(nomeScena) {
    const d = this.carica();
    const prima = d.raggiunto ? ORDINE_GIOCHI.indexOf(d.raggiunto) : -1;
    if (ORDINE_GIOCHI.indexOf(nomeScena) > prima) d.raggiunto = nomeScena;
    this.salva();
  },

  segnaFinito() {
    this.carica().finito = true;
    this.salva();
  },
};

// Best stars in a mini game. Returns the previous best (so the result card can show the record).
function salvaStelle(scena, nomeGioco, stelle) {
  const d = Salvataggio.carica();
  const prima = d.stelle[nomeGioco] || 0;
  d.stelle[nomeGioco] = Math.max(prima, stelle);
  Salvataggio.salva();
  return prima;
}

function stelleTotali() {
  const d = Salvataggio.carica();
  return Object.values(d.stelle).reduce((somma, n) => somma + n, 0);
}
