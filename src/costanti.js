// Shared numbers and colours used by every scene.

const LARGHEZZA = 1280;     // design width of the game
const ALTEZZA = 720;        // design height of the game
const META = LARGHEZZA / 2; // the middle line: x < META is Silvia, x >= META is Francesco

const COLORE_SILVIA = 0xe0a93b;    // mustard, like her coat
const COLORE_FRANCESCO = 0xc0392b; // red, like his sweater
const COLORE_CREMA = 0xfdf3e1;     // warm cream for text and outlines
const COLORE_NOTTE = 0x0f1a2e;     // dark winter blue

const FONT = 'Georgia, "Times New Roman", serif';

// Which player owns a touch: decided by which half of the screen it lands on
function latoDi(dito) {
  return dito.x < META ? 'silvia' : 'francesco';
}

// (Stars and saving progress live in src/salvataggio.js)
