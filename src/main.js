// Starts the game. This file is loaded last, after Phaser, the texts, the shared files and the scenes.

// Put the Italian "rotate your phone" text into the portrait screen
document.getElementById('ruota-testo').textContent = TESTI.ruotaTelefono;

// Stop iPhone Safari's pinch-zoom gesture from zooming the page while playing
document.addEventListener('gesturestart', (evento) => evento.preventDefault());

// ?reset=1 in the address clears all saved progress (e.g. before giving the gift)
if (new URLSearchParams(window.location.search).get('reset') === '1') Salvataggio.azzera();

// All the scenes of the game. The first one in the list is the one that starts.
const scene = [Titolo, Intro, Slitta, Torta, Anelli, Dirigibile, Cerimonia, ProvaTocco];

// Testing shortcut: add ?scena=Slitta to the address to start straight from that scene
// (for example http://192.168.0.174:8000/?scena=Slitta). Without it, the game starts from the title.
const scenaRichiesta = new URLSearchParams(window.location.search).get('scena');
const indiceRichiesto = scene.findIndex((s) => s.name === scenaRichiesta);
if (indiceRichiesto > 0) {
  scene.unshift(scene.splice(indiceRichiesto, 1)[0]); // move it to the front of the list
}

const config = {
  type: Phaser.AUTO,
  parent: 'gioco',
  backgroundColor: '#0f1a2e',
  scale: {
    mode: Phaser.Scale.FIT,            // keep the 1280×720 shape and fit it on any screen
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: LARGHEZZA,
    height: ALTEZZA,
  },
  input: {
    activePointers: 4,                 // allow several fingers at once (both players)
  },
  scene: scene,
};

const gioco = new Phaser.Game(config);

// iPhone can put the sound to sleep (phone locked, a call, switching app): wake it at the next touch
document.addEventListener('touchend', () => {
  const contesto = gioco.sound && gioco.sound.context;
  if (contesto && contesto.state !== 'running' && !gioco.isPaused) contesto.resume();
});

// While the phone is held upright ("Ruota il telefono"), pause the game and the music,
// so countdowns don't run behind the rotate screen
const verticale = window.matchMedia('(orientation: portrait)');
function aggiornaOrientamento() {
  const contesto = gioco.sound && gioco.sound.context;
  if (verticale.matches) {
    gioco.pause();
    if (contesto && contesto.state === 'running') contesto.suspend();
  } else {
    gioco.resume();
    if (contesto && contesto.state === 'suspended' && Musica.brano) contesto.resume();
  }
}
verticale.addEventListener('change', aggiornaOrientamento);
gioco.events.once('ready', aggiornaOrientamento);
