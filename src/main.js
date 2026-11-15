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
    activePointers: 6,                 // allow several fingers at once (both players, with some to spare)
  },
  scene: scene,
};

const gioco = new Phaser.Game(config);

// The Home Screen icon. iPhone fetches the icon file on its own, and on the test address (with its
// self-made certificate) that separate fetch is refused, so no icon appeared. Here the page loads the
// icon itself and hands it to iPhone ready-made. (On the real published address this isn't needed.)
fetch('assets/icone/apple-touch-icon.png')
  .then((risposta) => risposta.blob())
  .then((immagine) => {
    const lettore = new FileReader();
    lettore.onload = () => {
      const link = document.querySelector('link[rel="apple-touch-icon"]');
      if (link) link.href = lettore.result;
    };
    lettore.readAsDataURL(immagine);
  })
  .catch(() => {});

// Keep the game fitted to the screen. When opened from the Home Screen, iPhone sometimes reports the
// wrong screen size for a moment (at launch, or while rotating) and sends no second message when the
// real size arrives: the game then stayed too big, with its bottom cut off. So we measure the game's
// box ourselves: after every resize or rotation, and twice a second, and refit when it has changed.
const scatola = document.getElementById('gioco');
let ultimaMisura = '';
function adattaAlloSchermo() {
  const r = scatola.getBoundingClientRect();
  const misura = `${Math.round(r.width)}x${Math.round(r.height)}`;
  if (misura !== ultimaMisura) {
    ultimaMisura = misura;
    gioco.scale.refresh();
  }
}
['resize', 'orientationchange', 'pageshow'].forEach((evento) => {
  window.addEventListener(evento, () => {
    [0, 150, 500, 1000].forEach((attesa) => setTimeout(() => { ultimaMisura = ''; adattaAlloSchermo(); }, attesa));
  });
});
setInterval(adattaAlloSchermo, 500);

// "Lost" fingers. iPhone sometimes never tells the page that a touch has ended (for example when a
// system alert, like the microphone permission, appears while a finger is on the screen). Phaser then
// believes that finger is still down forever; after a few of these it has no free slot left and ignores
// every new touch. So at every touch event we compare Phaser's fingers with the fingers iPhone says are
// really on the screen, and release the ones that are gone (telling the scenes too).
function liberaDitaPerse(evento) {
  const veri = new Set([...evento.touches].map((tocco) => tocco.identifier));
  // touches ending right now are handled normally by Phaser
  [...evento.changedTouches].forEach((tocco) => veri.add(tocco.identifier));
  gioco.input.pointers.forEach((dito, i) => {
    if (i === 0 || !dito.active || veri.has(dito.identifier)) return; // 0 is the mouse
    dito.active = false;
    dito.isDown = false;
    dito.primaryDown = false;
    dito.buttons = 0;
    dito.wasCanceled = true;
    gioco.scene.getScenes(true).forEach((scena) => scena.input.emit('pointerupoutside', dito));
  });
}
// (capture: true = this runs before Phaser looks for a free slot for the new finger)
['touchstart', 'touchend', 'touchcancel'].forEach((tipo) => {
  window.addEventListener(tipo, liberaDitaPerse, { capture: true, passive: true });
});

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
