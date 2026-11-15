// The microphone, used to feel Francesco BLOWING (Il Dirigibile).
// Nothing is recorded or sent anywhere: the game only reads, live, how strong the low rumble
// of the air hitting the microphone is. Blowing makes a strong rumble below about 250 Hz;
// voices and the game's own music (from the phone's little speaker) have much less down there.
//
// The microphone only works on a secure address (https, or localhost on the Mac). If it isn't
// available, or the player says no, accendi() answers false and the game uses its fallback.
//
// How to use:
//   const ok = await Microfono.accendi(scena);   // asks permission the first time
//   const forza = Microfono.soffio();            // 0 (nothing) to 1 (blowing hard), every frame
//   Microfono.spegni();                          // turn it off when the mini game is over

const MICROFONO = {
  SOGLIA: 0.30,      // rumble below this counts as silence (0 to 1)
  PIENO: 0.75,       // rumble at or above this counts as blowing as hard as possible
  HZ_MASSIMI: 250,   // only listen below this frequency
};

const Microfono = {
  flusso: null,
  sorgente: null,
  analizzatore: null,
  dati: null,
  bande: 0,

  disponibile() {
    return Boolean(navigator.mediaDevices && navigator.mediaDevices.getUserMedia);
  },

  async accendi(scena) {
    // Already on? Only if iPhone hasn't stopped it in the meantime (phone locked, a call, the page hidden)
    if (this.flusso) {
      if (this.vivo()) return true;
      this.spegni();
    }
    const contesto = contestoAudio(scena);
    if (!this.disponibile() || !contesto) return false;
    try {
      this.flusso = await navigator.mediaDevices.getUserMedia({
        // We want the raw sound: the phone's "improvements" would remove exactly the noise of blowing
        audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
      });
      // If iPhone ends the stream later, forget it, so the next flight asks again
      this.flusso.getAudioTracks().forEach((traccia) => { traccia.onended = () => this.spegni(); });
      this.sorgente = contesto.createMediaStreamSource(this.flusso);
      this.analizzatore = contesto.createAnalyser();
      this.analizzatore.fftSize = 2048;
      this.analizzatore.smoothingTimeConstant = 0.6;
      this.sorgente.connect(this.analizzatore); // only measured, never sent to the speaker
      this.dati = new Uint8Array(this.analizzatore.frequencyBinCount);
      const hzPerBanda = contesto.sampleRate / this.analizzatore.fftSize;
      this.bande = Math.max(2, Math.round(MICROFONO.HZ_MASSIMI / hzPerBanda));
      if (contesto.state !== 'running') contesto.resume();
      return true;
    } catch (errore) {
      this.spegni();
      return false;
    }
  },

  // Is the microphone still really listening?
  vivo() {
    if (!this.flusso) return false;
    const traccia = this.flusso.getAudioTracks()[0];
    return Boolean(traccia) && traccia.readyState === 'live' && traccia.enabled;
  },

  // How hard someone is blowing right now: 0 to 1
  soffio() {
    if (!this.analizzatore) return 0;
    this.analizzatore.getByteFrequencyData(this.dati);
    let somma = 0;
    for (let i = 1; i <= this.bande; i++) somma += this.dati[i];
    const rombo = somma / this.bande / 255;
    return Math.min(1, Math.max(0, (rombo - MICROFONO.SOGLIA) / (MICROFONO.PIENO - MICROFONO.SOGLIA)));
  },

  spegni() {
    if (this.flusso) this.flusso.getTracks().forEach((traccia) => traccia.stop());
    if (this.sorgente) this.sorgente.disconnect();
    this.flusso = null;
    this.sorgente = null;
    this.analizzatore = null;
  },
};
