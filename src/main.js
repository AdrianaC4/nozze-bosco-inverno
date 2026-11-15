// Starts the game. This file is loaded last, after Phaser, the texts, the shared files and the scenes.

// Put the Italian "rotate your phone" text into the portrait screen
document.getElementById('ruota-testo').textContent = TESTI.ruotaTelefono;

// Stop iPhone Safari's pinch-zoom gesture from zooming the page while playing
document.addEventListener('gesturestart', (evento) => evento.preventDefault());

// All the scenes of the game. The first one in the list is the one that starts.
const scene = [Titolo, Intro, Slitta, Torta, Anelli, Cerimonia, ProvaTocco];

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
