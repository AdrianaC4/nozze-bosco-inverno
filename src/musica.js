// Background music, composed and played in code (original melodies, no files).
// Instruments: a music box, soft warm "pad" chords and a gentle bass.
// Because the notes are played one by one by the code, the speed (tempo) can change at any
// moment without the pitch changing: in La Slitta the music follows the sled's speed.
//
// How to use:
//   Musica.suona(scena, 'neve')    start a track (fades from the current one)
//   Musica.tempo(130)              change the speed (beats per minute)
//   Musica.tempoNormale()          back to the track's own speed
//   Musica.volume(0.3)             make the track softer (0 to 1 of its normal volume), smoothly
//   Musica.ferma()                 fade out and stop
//
// Tracks:
//   'neve'  - slow, dreamy music-box waltz (title, story, start cards)
//   'corsa' - bouncy and cheerful (mini games); its speed can follow the game
//   'cerimonia' - tender and warm (the finale); its volume follows the players holding together
//   'festa' - joyful wedding waltz with little bells (the wedding and the ending screen)

const BRANI = {
  // A gentle waltz in F major, 3/4. Each bar has 6 steps (eighth notes).
  neve: {
    bpm: 80,
    passiPerBattuta: 6,
    volume: 0.5,
    battute: [
      // accordo: [bass note, pad notes]; melodia: [step, note, length in steps]
      { basso: 41, accordo: [57, 60, 64], melodia: [[0, 81, 3], [3, 79, 1], [4, 77, 2]] },       // Fmaj7
      { basso: 45, accordo: [55, 60, 64], melodia: [[0, 76, 2], [2, 79, 2], [4, 84, 2]] },       // Am7
      { basso: 46, accordo: [57, 62, 65], melodia: [[0, 86, 3], [3, 84, 1], [4, 81, 2]] },       // Bbmaj7
      { basso: 48, accordo: [55, 60, 64], melodia: [[0, 79, 4], [4, 76, 2]] },                  // C
      { basso: 50, accordo: [53, 57, 60], melodia: [[0, 77, 2], [2, 81, 2], [4, 86, 2]] },       // Dm7
      { basso: 46, accordo: [57, 62, 65], melodia: [[0, 84, 3], [3, 82, 1], [4, 81, 2]] },       // Bbmaj7
      { basso: 43, accordo: [53, 58, 62], melodia: [[0, 79, 2], [2, 82, 2], [4, 86, 2]] },       // Gm7
      { basso: 48, accordo: [53, 55, 60], melodia: [[0, 84, 6]] },                               // Csus4
    ],
    // Waltz accompaniment: bass on beat 1, soft chord plucks on beats 2 and 3
    accompagnamento: { basso: [0], pizzico: [2, 4] },
  },

  // Bouncy and cheerful in C major, 4/4. Each bar has 8 steps (eighth notes).
  corsa: {
    bpm: 112,
    passiPerBattuta: 8,
    volume: 0.45,
    battute: [
      { basso: 48, quinta: 55, accordo: [60, 64, 67], melodia: [[0, 76, 2], [2, 79, 2], [4, 84, 2], [6, 79, 2]] }, // C
      { basso: 45, quinta: 52, accordo: [57, 60, 64], melodia: [[0, 81, 3], [3, 79, 1], [4, 76, 4]] },            // Am
      { basso: 41, quinta: 48, accordo: [57, 60, 65], melodia: [[0, 77, 2], [2, 81, 2], [4, 84, 2], [6, 86, 2]] }, // F
      { basso: 43, quinta: 50, accordo: [55, 59, 62], melodia: [[0, 83, 2], [2, 86, 2], [4, 79, 4]] },            // G
    ],
    // Bouncy accompaniment: bass root and fifth, a little music-box arpeggio on every eighth
    accompagnamento: { basso: [0], quinta: [4], arpeggio: true },
  },

  // Tender and warm in G major, 4/4, slow. Each bar has 8 steps (eighth notes).
  cerimonia: {
    bpm: 72,
    passiPerBattuta: 8,
    volume: 0.5,
    battute: [
      { basso: 43, accordo: [59, 62, 66], melodia: [[0, 83, 4], [4, 86, 2], [6, 88, 2]] },   // Gmaj7
      { basso: 40, accordo: [55, 59, 62], melodia: [[0, 86, 6], [6, 83, 2]] },              // Em7
      { basso: 48, accordo: [55, 59, 64], melodia: [[0, 84, 4], [4, 83, 2], [6, 81, 2]] },   // Cmaj7
      { basso: 50, accordo: [54, 57, 62], melodia: [[0, 81, 8]] },                          // D
      { basso: 47, accordo: [54, 57, 62], melodia: [[0, 78, 4], [4, 81, 2], [6, 86, 2]] },   // Bm7
      { basso: 40, accordo: [55, 59, 62], melodia: [[0, 83, 6], [6, 79, 2]] },              // Em7
      { basso: 45, accordo: [55, 60, 64], melodia: [[0, 81, 4], [4, 84, 2], [6, 83, 2]] },   // Am7
      { basso: 50, accordo: [55, 57, 62], melodia: [[0, 79, 8]] },                          // Dsus4
    ],
    // Slow accompaniment: bass on beat 1, a soft music-box arpeggio every quarter note
    accompagnamento: { basso: [0], arpeggioOgni: 2 },
  },

  // Joyful wedding waltz in D major, 3/4. Each bar has 6 steps (eighth notes).
  festa: {
    bpm: 92,
    passiPerBattuta: 6,
    volume: 0.55,
    battute: [
      { basso: 38, accordo: [57, 62, 66], melodia: [[0, 78, 2], [2, 81, 2], [4, 86, 2]] },   // D
      { basso: 43, accordo: [59, 62, 67], melodia: [[0, 83, 3], [3, 81, 1], [4, 79, 2]] },   // G
      { basso: 45, accordo: [57, 61, 64], melodia: [[0, 76, 2], [2, 81, 2], [4, 85, 2]] },   // A
      { basso: 38, accordo: [57, 62, 66], melodia: [[0, 86, 6]] },                          // D
      { basso: 47, accordo: [54, 59, 62], melodia: [[0, 83, 2], [2, 86, 2], [4, 90, 2]] },   // Bm
      { basso: 43, accordo: [55, 59, 62], melodia: [[0, 88, 3], [3, 86, 1], [4, 83, 2]] },   // G
      { basso: 40, accordo: [55, 59, 64], melodia: [[0, 79, 2], [2, 83, 2], [4, 88, 2]] },   // Em
      { basso: 45, accordo: [55, 61, 64], melodia: [[0, 85, 3], [3, 88, 1], [4, 86, 2]] },   // A7
    ],
    // Waltz accompaniment, and the melody doubled an octave higher like little bells
    accompagnamento: { basso: [0], pizzico: [2, 4], ottava: true },
  },
};

const Musica = {
  contesto: null,
  uscita: null,      // the volume control of the track playing now
  brano: null,       // name of the track playing now
  bpm: 80,
  passo: 0,          // which step of the track comes next
  prossimoTempo: 0,  // when (in audio time) the next step must sound
  timer: null,
  giri: 0,           // how many times the track has looped (used for small variations)

  suona(scena, nome) {
    const contesto = contestoAudio(scena);
    if (!contesto || !BRANI[nome]) return;
    if (this.brano === nome) return; // already playing
    this.contesto = contesto;
    this.sfuma(this.uscita, 1.2);

    const brano = BRANI[nome];
    this.brano = nome;
    this.bpm = brano.bpm;
    this.frazioneVolume = 1;
    this.passo = 0;
    this.giri = 0;
    this.uscita = contesto.createGain();
    this.uscita.gain.setValueAtTime(0.0001, contesto.currentTime);
    this.uscita.gain.exponentialRampToValueAtTime(brano.volume, contesto.currentTime + 1.5);
    this.uscita.connect(contesto.destination);
    this.prossimoTempo = contesto.currentTime + 0.1;

    if (!this.timer) this.timer = setInterval(() => this.programma(), 25);
  },

  tempo(bpm) {
    this.bpm = bpm;
  },

  tempoNormale() {
    if (this.brano) this.bpm = BRANI[this.brano].bpm;
  },

  volume(frazione) {
    if (!this.uscita || !this.contesto || this.frazioneVolume === frazione) return;
    this.frazioneVolume = frazione;
    const t = this.contesto.currentTime;
    const obiettivo = Math.max(BRANI[this.brano].volume * frazione, 0.0001);
    this.uscita.gain.cancelScheduledValues(t);
    this.uscita.gain.setValueAtTime(Math.max(this.uscita.gain.value, 0.0001), t);
    this.uscita.gain.exponentialRampToValueAtTime(obiettivo, t + 0.6);
  },

  ferma() {
    this.sfuma(this.uscita, 1.5);
    this.uscita = null;
    this.brano = null;
    clearInterval(this.timer);
    this.timer = null;
  },

  // Fades out a track's volume and then disconnects it
  sfuma(uscita, secondi) {
    if (!uscita || !this.contesto) return;
    const t = this.contesto.currentTime;
    uscita.gain.cancelScheduledValues(t);
    uscita.gain.setValueAtTime(Math.max(uscita.gain.value, 0.0001), t);
    uscita.gain.exponentialRampToValueAtTime(0.0001, t + secondi);
    setTimeout(() => uscita.disconnect(), secondi * 1000 + 200);
  },

  // Called every 25 ms: prepares the notes of the next ~0.12 seconds.
  // Each step is prepared with the CURRENT speed, so tempo changes are smooth.
  programma() {
    if (!this.brano || !this.contesto) return;
    // After a pause (phone locked, page hidden) don't play all the missed notes at once: just carry on from now
    if (this.prossimoTempo < this.contesto.currentTime - 0.3) this.prossimoTempo = this.contesto.currentTime + 0.05;
    while (this.prossimoTempo < this.contesto.currentTime + 0.12) {
      this.suonaPasso(this.passo, this.prossimoTempo);
      this.prossimoTempo += 60 / this.bpm / 2; // one step = one eighth note
      this.passo += 1;
    }
  },

  suonaPasso(passo, t) {
    const brano = BRANI[this.brano];
    const passiTotali = brano.passiPerBattuta * brano.battute.length;
    const nelBrano = passo % passiTotali;
    if (nelBrano === 0 && passo > 0) this.giri += 1;
    const battuta = brano.battute[Math.floor(nelBrano / brano.passiPerBattuta)];
    const nellaBattuta = nelBrano % brano.passiPerBattuta;
    const durataPasso = 60 / this.bpm / 2;
    const acc = brano.accompagnamento;
    const out = this.uscita;

    // Soft pad chord held for the whole bar
    if (nellaBattuta === 0) {
      battuta.accordo.forEach((nota) => strumentoPad(this.contesto, out, t, nota, durataPasso * brano.passiPerBattuta));
    }
    if (acc.basso && acc.basso.includes(nellaBattuta)) strumentoBasso(this.contesto, out, t, battuta.basso, durataPasso * 3);
    if (acc.quinta && acc.quinta.includes(nellaBattuta)) strumentoBasso(this.contesto, out, t, battuta.quinta, durataPasso * 3);
    if (acc.pizzico && acc.pizzico.includes(nellaBattuta)) {
      battuta.accordo.forEach((nota) => strumentoCarillon(this.contesto, out, t, nota + 12, durataPasso * 2, 0.035));
    }
    if (acc.arpeggio) {
      const nota = battuta.accordo[nellaBattuta % battuta.accordo.length] + 12;
      strumentoCarillon(this.contesto, out, t, nota, durataPasso, 0.03);
    }
    if (acc.arpeggioOgni && nellaBattuta % acc.arpeggioOgni === 0) {
      const nota = battuta.accordo[(nellaBattuta / acc.arpeggioOgni) % battuta.accordo.length] + 12;
      strumentoCarillon(this.contesto, out, t, nota, durataPasso * acc.arpeggioOgni, 0.035);
    }

    // The melody. In 'corsa' every other loop is only accompaniment, so it doesn't get repetitive.
    if (this.brano === 'corsa' && this.giri % 2 === 1) return;
    battuta.melodia.forEach(([inizio, nota, lunghezza]) => {
      if (inizio !== nellaBattuta) return;
      strumentoCarillon(this.contesto, out, t, nota, durataPasso * lunghezza, 0.11);
      if (acc.ottava) strumentoCarillon(this.contesto, out, t, nota + 12, durataPasso * lunghezza, 0.04);
    });
  },
};

// ---------------------------------------------------------------- instruments

function frequenzaDi(nota) {
  return 440 * Math.pow(2, (nota - 69) / 12); // note numbers: 60 = middle C
}

// Music box: a pure tone plus a quiet high "ting", quick start and a long soft fade
function strumentoCarillon(contesto, uscita, t, nota, durata, volume) {
  const f = frequenzaDi(nota);
  const coda = Math.min(Math.max(durata * 1.6, 0.5), 2.2);
  const g = contesto.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(volume, t + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, t + coda);
  g.connect(uscita);
  [[f, 1], [f * 4, 0.18]].forEach(([frequenza, livello]) => {
    const o = contesto.createOscillator();
    const lg = contesto.createGain();
    o.type = 'sine';
    o.frequency.value = frequenza;
    lg.gain.value = livello;
    o.connect(lg);
    lg.connect(g);
    o.start(t);
    o.stop(t + coda + 0.05);
  });
}

// Soft warm pad: two slightly detuned gentle tones, slow to appear and to fade
function strumentoPad(contesto, uscita, t, nota, durata) {
  const f = frequenzaDi(nota);
  const filtro = contesto.createBiquadFilter();
  filtro.type = 'lowpass';
  filtro.frequency.value = 1100;
  const g = contesto.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.022, t + Math.min(0.4, durata / 3));
  g.gain.setValueAtTime(0.022, t + durata * 0.8);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durata + 0.5);
  filtro.connect(g);
  g.connect(uscita);
  [-5, 5].forEach((centesimi) => {
    const o = contesto.createOscillator();
    o.type = 'triangle';
    o.frequency.value = f;
    o.detune.value = centesimi;
    o.connect(filtro);
    o.start(t);
    o.stop(t + durata + 0.6);
  });
}

// Gentle bass: a round low tone that fades
function strumentoBasso(contesto, uscita, t, nota, durata) {
  const o = contesto.createOscillator();
  const g = contesto.createGain();
  o.type = 'sine';
  o.frequency.value = frequenzaDi(nota);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(0.13, t + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t + durata);
  o.connect(g);
  g.connect(uscita);
  o.start(t);
  o.stop(t + durata + 0.05);
}
