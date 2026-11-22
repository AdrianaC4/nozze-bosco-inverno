// Shared effects that many scenes use: falling snow and a soft bell chime.

// Loads an image only if it isn't loaded yet (images are shared by all scenes)
function carica(scena, chiave, percorso) {
  if (!scena.textures.exists(chiave)) scena.load.image(chiave, percorso);
}

// A soft round glow (bright in the middle, fading to nothing at the edge), drawn once and reused.
// Use it with: scena.add.image(x, y, creaBagliore(scena)).setBlendMode(Phaser.BlendModes.ADD)
function creaBagliore(scena) {
  if (!scena.textures.exists('bagliore')) {
    const tela = scena.textures.createCanvas('bagliore', 256, 256);
    const ctx = tela.getContext();
    const sfumatura = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    sfumatura.addColorStop(0, 'rgba(255, 226, 150, 0.95)');
    sfumatura.addColorStop(0.4, 'rgba(255, 196, 90, 0.45)');
    sfumatura.addColorStop(1, 'rgba(255, 180, 60, 0)');
    ctx.fillStyle = sfumatura;
    ctx.fillRect(0, 0, 256, 256);
    tela.refresh();
  }
  return 'bagliore';
}

// Gentle falling snow over the whole screen.
// Call it at the end of a scene's create() so the snow is drawn on top.
function aggiungiNeve(scena) {
  // Draw one small soft snowflake once, and reuse it for every flake
  if (!scena.textures.exists('fiocco')) {
    const g = scena.make.graphics({ x: 0, y: 0 }, false);
    g.fillStyle(0xffffff, 0.35);
    g.fillCircle(8, 8, 8);
    g.fillStyle(0xffffff, 1);
    g.fillCircle(8, 8, 4);
    g.generateTexture('fiocco', 16, 16);
    g.destroy();
  }

  const neve = scena.add.particles(0, -20, 'fiocco', {
    x: { min: -100, max: LARGHEZZA + 100 },
    lifespan: 14000,
    speedY: { min: 35, max: 80 },
    speedX: { min: -20, max: 20 },
    scale: { min: 0.3, max: 1 },
    alpha: { min: 0.5, max: 0.95 },
    frequency: 90,
    quantity: 1,
  });
  // Start with snow already on screen instead of an empty sky
  neve.fastForward(12000);
  neve.setDepth(50);
  return neve;
}

// The Web Audio "sound card" of the game, ready to play (or null if this browser has none)
function contestoAudio(scena) {
  const contesto = scena.sound && scena.sound.context;
  if (!contesto) return null;
  if (contesto.state !== 'running') contesto.resume();
  return contesto;
}

// One simple sound made in code: a tone that slides from frequenzaDa to frequenzaA.
// tipo: 'sine' (soft), 'triangle' (a bit brighter), 'square' (buzzy). volume: 0 to 1.
function suonaTono(scena, frequenzaDa, frequenzaA, durata, tipo, volume) {
  const contesto = contestoAudio(scena);
  if (!contesto) return;
  const t = contesto.currentTime + 0.01;
  const oscillatore = contesto.createOscillator();
  const guadagno = contesto.createGain();
  oscillatore.type = tipo;
  oscillatore.frequency.setValueAtTime(frequenzaDa, t);
  oscillatore.frequency.exponentialRampToValueAtTime(frequenzaA, t + durata);
  guadagno.gain.setValueAtTime(0.0001, t);
  guadagno.gain.exponentialRampToValueAtTime(volume, t + 0.01);
  guadagno.gain.exponentialRampToValueAtTime(0.0001, t + durata);
  oscillatore.connect(guadagno);
  guadagno.connect(contesto.destination);
  oscillatore.start(t);
  oscillatore.stop(t + durata + 0.05);
}

// A soft thud, for mistakes (placeholder until the sound pass)
function suonaTonfo(scena) {
  suonaTono(scena, 160, 55, 0.35, 'sine', 0.5);
}

// The real sound files (Adri's choices from Pixabay, in assets/audio/). The audio cache is shared by
// all scenes, so each file is loaded only once; every scene calls this in its preload (so a scene
// opened directly with ?scena=... has them too).
const SUONI = {
  miao: 'assets/audio/miao.mp3',                    // Mario's meow
  luce_albero: 'assets/audio/luce_albero.m4a',      // shimmer while the tree lights up (stretched to 8 s)
  vittoria_stelle: 'assets/audio/vittoria_stelle.mp3', // when the tree is fully lit
};

function caricaSuoni(scena) {
  Object.entries(SUONI).forEach(([chiave, percorso]) => {
    if (!scena.cache.audio.exists(chiave)) scena.load.audio(chiave, percorso);
  });
}

// Plays one of the sound files (quietly does nothing if it isn't loaded or sound isn't allowed yet)
function suonaFile(scena, chiave, volume) {
  try {
    if (scena.cache.audio.exists(chiave)) {
      contestoAudio(scena);
      scena.sound.play(chiave, { volume: volume === undefined ? 1 : volume });
      return true;
    }
  } catch (errore) {
    // no sound this time
  }
  return false;
}

// Mario's meow: the real recording (with the old made-up meow only if the file is missing)
function suonaMiao(scena) {
  if (suonaFile(scena, 'miao', 0.8)) return;
  suonaTono(scena, 650, 900, 0.12, 'triangle', 0.12);
  setTimeout(() => suonaTono(scena, 900, 520, 0.3, 'triangle', 0.12), 110);
}

// A gust of wind: soft noise that swells and fades (placeholder until the sound pass)
function suonaVento(scena) {
  const contesto = contestoAudio(scena);
  if (!contesto) return;
  const durata = 1.8;
  const campioni = Math.floor(contesto.sampleRate * durata);
  const buffer = contesto.createBuffer(1, campioni, contesto.sampleRate);
  const dati = buffer.getChannelData(0);
  for (let i = 0; i < campioni; i++) dati[i] = Math.random() * 2 - 1;
  const rumore = contesto.createBufferSource();
  rumore.buffer = buffer;
  const filtro = contesto.createBiquadFilter();
  filtro.type = 'bandpass';
  filtro.Q.value = 0.8;
  const t = contesto.currentTime + 0.01;
  filtro.frequency.setValueAtTime(300, t);
  filtro.frequency.exponentialRampToValueAtTime(1200, t + 0.7);
  filtro.frequency.exponentialRampToValueAtTime(400, t + durata);
  const volume = contesto.createGain();
  volume.gain.setValueAtTime(0.0001, t);
  volume.gain.exponentialRampToValueAtTime(0.35, t + 0.5);
  volume.gain.exponentialRampToValueAtTime(0.0001, t + durata);
  rumore.connect(filtro);
  filtro.connect(volume);
  volume.connect(contesto.destination);
  rumore.start(t);
  rumore.stop(t + durata);
}

// Mario purring: a few soft low rumbles (placeholder until the sound pass)
function suonaFusa(scena) {
  for (let i = 0; i < 4; i++) {
    setTimeout(() => suonaTono(scena, 70, 55, 0.22, 'triangle', 0.35), i * 230);
  }
}

// A short tick, for the last seconds of a countdown
function suonaTic(scena) {
  suonaTono(scena, 1500, 1400, 0.05, 'square', 0.04);
}

// A soft, music-box style bell chime, made in code (no sound file needed).
// Must be called from inside a touch handler the first time, so iPhone allows sound.
function suonaCampanella(scena) {
  const contesto = scena.sound && scena.sound.context;
  if (!contesto) return; // this browser has no Web Audio: just stay silent
  if (contesto.state !== 'running') {
    contesto.resume();
  }

  const note = [1318.5, 1568.0, 1975.5, 2637.0]; // E6, G6, B6, E7: a bright, happy chord played one note at a time
  const inizio = contesto.currentTime + 0.05;

  note.forEach((frequenza, i) => {
    const t = inizio + i * 0.09;
    const oscillatore = contesto.createOscillator();
    const volume = contesto.createGain();
    oscillatore.type = 'sine';
    oscillatore.frequency.value = frequenza;
    // Quick start, long soft fade: that's what makes it sound like a bell
    volume.gain.setValueAtTime(0.0001, t);
    volume.gain.exponentialRampToValueAtTime(0.25, t + 0.01);
    volume.gain.exponentialRampToValueAtTime(0.0001, t + 1.6);
    oscillatore.connect(volume);
    volume.connect(contesto.destination);
    oscillatore.start(t);
    oscillatore.stop(t + 1.7);
  });
}

// Full screen and landscape lock, on phones that allow it (Android Chrome and most other browsers).
// iPhone Safari doesn't allow either inside a web page: there, adding the game to the Home Screen gives full screen.
// Must be called from a touch (the browser only allows it then). Does nothing if it isn't allowed.
function schermoIntero() {
  try {
    const pagina = document.documentElement;
    const giaIntero = document.fullscreenElement || window.matchMedia('(display-mode: fullscreen)').matches
      || window.matchMedia('(display-mode: standalone)').matches;
    const blocca = () => {
      if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
    };
    if (!giaIntero && pagina.requestFullscreen) {
      pagina.requestFullscreen({ navigationUI: 'hide' }).then(blocca).catch(() => {});
    } else {
      blocca();
    }
  } catch (errore) {
    // not allowed here: keep playing as it is
  }
}
