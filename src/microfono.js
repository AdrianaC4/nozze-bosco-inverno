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

  // Asks for the microphone. Several calls at the same time share the same question.
  // Best called from inside a touch (some iPhones only show the permission question then).
  accendi(scena) {
    if (this.flusso && this.vivo()) return Promise.resolve(true);
    if (this.richiesta) return this.richiesta;
    this.richiesta = this.chiedi(scena).then((acceso) => {
      this.richiesta = null;
      return acceso;
    });
    return this.richiesta;
  },

  async chiedi(scena) {
    if (this.flusso) this.spegni(); // iPhone had stopped it: start again
    const contesto = contestoAudio(scena);
    this.contesto = contesto;
    this.ultimoErrore = '';
    // The opposite of ripristinaVolume: tell the phone we now also record (else the microphone may be refused)
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'play-and-record';
    } catch (errore) {
      // not supported here
    }
    if (!this.disponibile()) { this.ultimoErrore = 'no-api'; return false; }
    if (!contesto) { this.ultimoErrore = 'no-audio'; return false; }
    try {
      try {
        // We want the raw sound: the phone's "improvements" would remove exactly the noise of blowing
        this.flusso = await navigator.mediaDevices.getUserMedia({
          audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false },
        });
      } catch (errore) {
        // Some phones refuse those details: ask again for a plain microphone
        if (errore && (errore.name === 'OverconstrainedError' || errore.name === 'TypeError')) {
          this.flusso = await navigator.mediaDevices.getUserMedia({ audio: true });
        } else {
          throw errore;
        }
      }
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
      // Remember why, so the game can show it (e.g. NotAllowedError = permission refused or blocked)
      this.ultimoErrore = (errore && errore.name) || 'errore';
      this.spegni();
      return false;
    }
  },

  // A short explanation of the last failure, for the test-mode note: the reason, the address,
  // whether the game runs in the browser or as a Home Screen app, and the permission state.
  diagnosi(statoPermesso) {
    const app = window.matchMedia('(display-mode: standalone)').matches
      || window.matchMedia('(display-mode: fullscreen)').matches || window.navigator.standalone ? 'app' : 'browser';
    const parti = [this.ultimoErrore || 'nessun errore', window.location.host, app,
      window.isSecureContext ? 'sicuro' : 'NON sicuro'];
    if (statoPermesso) parti.push(`permesso: ${statoPermesso}`);
    return parti.join(' · ');
  },

  // The microphone permission as the phone sees it ('granted', 'denied', 'prompt'), if the phone says
  statoPermesso() {
    try {
      return navigator.permissions.query({ name: 'microphone' }).then((r) => r.state).catch(() => '?');
    } catch (errore) {
      return Promise.resolve('?');
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
    const eraAcceso = Boolean(this.flusso);
    if (this.flusso) this.flusso.getTracks().forEach((traccia) => traccia.stop());
    if (this.sorgente) this.sorgente.disconnect();
    this.flusso = null;
    this.sorgente = null;
    this.analizzatore = null;
    if (eraAcceso) this.ripristinaVolume();
  },

  // With the microphone on, iPhone switches its sound to "call mode", which is quieter, and it doesn't
  // switch back by itself afterwards. Newer iPhones (and some Android browsers) let the page say
  // "only playing sound now"; then the sound is briefly paused and resumed so it takes the new, louder route.
  ripristinaVolume() {
    try {
      if (navigator.audioSession) navigator.audioSession.type = 'playback';
    } catch (errore) {
      // not supported here
    }
    const contesto = this.contesto;
    if (contesto && contesto.state === 'running') {
      contesto.suspend().then(() => contesto.resume()).catch(() => {});
    }
  },
};
