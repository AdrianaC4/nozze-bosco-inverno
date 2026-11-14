// Starts the game. This file is loaded last, after Phaser, the texts and the scenes.

// Put the Italian "rotate your phone" text into the portrait screen
document.getElementById('ruota-testo').textContent = TESTI.ruotaTelefono;

// Stop iPhone Safari's pinch-zoom gesture from zooming the page while playing
document.addEventListener('gesturestart', (evento) => evento.preventDefault());

const config = {
  type: Phaser.AUTO,
  parent: 'gioco',
  backgroundColor: '#0f1a2e',
  scale: {
    mode: Phaser.Scale.FIT,            // keep the 1280×720 shape and fit it on any screen
    autoCenter: Phaser.Scale.CENTER_BOTH,
    width: 1280,
    height: 720,
  },
  input: {
    activePointers: 4,                 // allow several fingers at once (both players)
  },
  scene: [ProvaTocco],
};

const gioco = new Phaser.Game(config);
