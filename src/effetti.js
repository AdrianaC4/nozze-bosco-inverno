// Shared effects that many scenes use: falling snow and a soft bell chime.

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
