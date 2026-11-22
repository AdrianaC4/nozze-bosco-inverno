// Mini game 4: Il Dirigibile delle Lanterne (the lantern airship). PROTOTYPE with plain shapes.
//
// 1. Start card: instructions, Mario in the middle; pet Mario to begin.
// 2. Night sky, seen from the side. Rings of light with a lantern inside appear all over the sky,
//    one after another, each far from the previous one sideways; each stays about 4 seconds.
//    - Francesco controls the HEIGHT by BLOWING into the microphone (src/microfono.js): the harder he
//      blows, the faster the propeller spins and the higher the airship climbs; if he stops, it sinks.
//      Fallback: if the microphone isn't available or allowed, he draws circles on his half instead
//      (circles always work too, so the game can never get stuck).
//    - Silvia controls LEFT/RIGHT: dragging moves the airship across the sky. While Francesco blows she can
//      drag anywhere on the screen; in the circles fallback only on her left half.
//    - Reaching a ring in time collects its lantern; otherwise the ring fades and the lantern is lost.
//      Neither player can reach the rings alone.
//    - Rings get smaller; gusts of wind push the airship; dark snow clouds drift across the sky
//      and make a lantern fall out.
// 3. 16 rings. At least 10 lanterns to win (stars: 10-12 = 1, 13-14 = 2, 15-16 = 3).
// 4. Mario rides in the gondola, but he can't sit still: every 9-13 seconds he leans out to bat at a
//    snowflake and his weight makes the airship dip ("Mario, stai fermo!").

// --- Tuning numbers (change these to make the game easier or harder) ---
const DIRIGIBILE = {
  ANELLI: 16,
  LANTERNE_PER_VINCERE: 10,
  STELLE_2: 13,
  STELLE_3: 15,
  OGNI: 3.0,                 // seconds between one ring appearing and the next
  DURATA_ANELLO: 5.5,        // seconds a ring stays before fading away
  TOLLERANZA: 55,            // how far sideways (pixels) from a ring's middle the airship can be and still collect it
  DISTANZA_ORIZZONTALE: 380, // a new ring is at least this far sideways from the previous one
  VELOCITA_NUVOLE: 140,      // how fast the dark clouds drift across the sky
  ALTEZZA_ANELLO_INIZIO: 190,
  ALTEZZA_ANELLO_FINE: 115,  // rings get smaller towards the end
  SALTO_MASSIMO: 260,        // max height difference between one ring and the next
  CADUTA: 90,                // how fast the airship sinks when Francesco doesn't crank (pixels per second)
  SPINTA_ELICA: 18,          // climbing speed for each unit of cranking speed
  ATTESA_MICROFONO: 12,      // seconds to wait for the microphone's answer before starting with circles
  GIRI_SOFFIO: 14,           // propeller speed when Francesco blows as hard as possible (hovering needs 5)
  STERZO: 1.3,               // how far the airship moves for each pixel Silvia's finger moves
  NUVOLE: 8,
  TUFFO_MARIO: 280,          // how fast the airship drops for a moment when Mario leans out (pixels per second)
  RAFFICA: 130,              // how hard a gust pushes the airship sideways (pixels per second)
};

const ALTO = 110;    // highest the airship can fly
const BASSO = 620;   // lowest (the treetops)

class Dirigibile extends Phaser.Scene {
  constructor() {
    super('Dirigibile');
  }

  init(dati) {
    this.ritenta = Boolean(dati && dati.ritenta);
  }

  preload() {
    caricaMario(this);
    carica(this, 'sfondo_dirigibile', 'assets/game/bg_dirigibile.jpg');
    carica(this, 'nave_corpo', 'assets/game/airship_corpo.png');
    carica(this, 'nave_elica', 'assets/game/airship_elica.png');
    carica(this, 'coppia', 'assets/game/coppia_gondola.png');
    carica(this, 'lanterna', 'assets/game/lantern.png');
    carica(this, 'nuvola', 'assets/game/dark_cloud.png');
  }

  create() {
    this.fase = 'carta';       // 'carta' -> 'volo' -> 'fine'
    this.lanterne = 0;
    this.anelliPassati = 0;
    this.anelli = [];
    this.nuvole = [];
    this.tempoVolo = 0;
    this.velocitaVerticale = 0;
    this.giri = 0;             // Francesco's cranking speed (radians per second, smoothed)
    this.angoloManovella = 0;
    this.vento = 0;            // sideways push of a gust right now
    this.invulnerabile = false;
    this.ditaSilvia = new Map();   // finger id -> previous x
    this.ditoFrancesco = null;     // { id, punti: [recent positions], angolo }
    this.usaMicrofono = false;     // true when Francesco blows into the microphone
    this.carica = 0;               // how much Francesco has turned since the last frame

    this.creaCielo();
    this.creaDirigibile();
    this.creaInterfaccia();
    this.preparaPercorso();

    this.input.on('pointerdown', (dito) => this.ditoGiu(dito));
    this.input.on('pointermove', (dito) => this.ditoMuove(dito));
    this.input.on('pointerup', (dito) => this.ditoSu(dito));
    this.input.on('pointerupoutside', (dito) => this.ditoSu(dito));

    aggiungiSalta(this, 'Cerimonia');
    this.cameras.main.fadeIn(400, 15, 26, 46);
    if (this.ritenta) {
      this.inizia();
    } else {
      mostraCartaInizio(this, TESTI.dirigibile, () => this.inizia());
    }
  }

  // ---------------------------------------------------------------- the scene

  creaCielo() {
    // The night sky over the snowy forest (Adri's Gemini background), with falling snow on top
    this.add.image(LARGHEZZA / 2, ALTEZZA / 2, 'sfondo_dirigibile');
    aggiungiNeve(this);
  }

  creaDirigibile() {
    // Adri's Gemini airship, split in two: the body, and the propeller that spins in code.
    // Both pictures are the same size (677 x 587); the group's centre is the middle of the balloon.
    const LARGO = 677;
    const ALTO_IMG = 587;
    const CENTRO_PALLONE = { x: 357, y: 197 };   // middle of the balloon, in the picture
    const CENTRO_ELICA = { x: 28.5, y: 219 };     // middle of the propeller, in the picture
    const scala = 240 / LARGO;                    // the airship is 240 pixels wide on screen
    this.scalaNave = scala;
    this.nave = this.add.container(400, 360).setDepth(10);
    const corpo = this.add.image(0, 0, 'nave_corpo')
      .setOrigin(CENTRO_PALLONE.x / LARGO, CENTRO_PALLONE.y / ALTO_IMG).setScale(scala);
    this.elica = this.add.image((CENTRO_ELICA.x - CENTRO_PALLONE.x) * scala, (CENTRO_ELICA.y - CENTRO_PALLONE.y) * scala, 'nave_elica')
      .setOrigin(CENTRO_ELICA.x / LARGO, CENTRO_ELICA.y / ALTO_IMG).setScale(scala);
    // Mario sits at the front of the gondola
    const mario = this.add.image((445 - CENTRO_PALLONE.x) * scala, (492 - CENTRO_PALLONE.y) * scala, 'mario').setOrigin(0.5, 1);
    mario.setScale(56 / mario.height);
    // Silvia and Francesco wave from the gondola (drawn behind the airship, so the gondola's rim hides their waists)
    const coppia = this.add.image((318 - CENTRO_PALLONE.x) * scala, (512 - CENTRO_PALLONE.y) * scala, 'coppia').setOrigin(0.5, 1);
    coppia.setScale(46 / coppia.height);
    this.tweens.add({ targets: coppia, angle: { from: -3, to: 3 }, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.marioNave = mario;
    this.nave.add([this.elica, coppia, corpo, mario]);
    // The airship faces LEFT, so its propeller is on the right, on Francesco's side, where he blows.
    // (The whole group is mirrored; the couple's picture is mirrored back so Silvia stays on the left.)
    this.nave.setScale(-1, 1);
    coppia.setFlipX(true);
  }

  creaInterfaccia() {
    const icona = this.add.image(46, 40, 'lanterna').setDepth(40);
    icona.setScale(48 / icona.height);
    this.testoLanterne = this.add.text(78, 40, '', {
      fontFamily: FONT, fontSize: '36px', color: '#ffe9a8',
    }).setOrigin(0, 0.5).setDepth(40);
    this.aggiornaLanterne();
    this.add.rectangle(LARGHEZZA / 2, 40, 400, 12, 0xfdf3e1, 0.25).setDepth(40);
    this.barraVolo = this.add.rectangle(LARGHEZZA / 2 - 200, 40, 0, 12, 0xffd34d).setOrigin(0, 0.5).setDepth(40);

    // Francesco's crank wheel in the corner (it turns with his circles; he can circle anywhere on his half)
    this.manovella = this.add.container(1170, 590).setDepth(30).setAlpha(0.35);
    this.manovella.add([
      this.add.circle(0, 0, 60, 0x000000, 0).setStrokeStyle(5, 0xfdf3e1, 0.7),
      this.add.rectangle(0, 0, 120, 5, 0xfdf3e1, 0.7),
      this.add.rectangle(0, 0, 5, 120, 0xfdf3e1, 0.7),
      this.add.circle(0, -60, 11, COLORE_FRANCESCO),
    ]);
    this.manovella.setVisible(false);

    // Francesco's wind gauge (when he blows into the microphone): a tube that fills with his breath
    this.indicatoreSoffio = this.add.container(1200, 520).setDepth(30).setVisible(false);
    this.barraSoffio = this.add.rectangle(0, 98, 26, 196, 0x9fd8f5).setOrigin(0.5, 1).setScale(1, 0);
    this.indicatoreSoffio.add([
      this.add.rectangle(0, 0, 34, 204, COLORE_NOTTE, 0.55).setStrokeStyle(3, 0xfdf3e1, 0.8),
      this.barraSoffio,
      this.add.text(0, -128, '💨', { fontSize: '34px' }).setOrigin(0.5),
    ]);

    // Fixed arrows that show each player's job: up/down for Francesco (next to his gauge or crank),
    // left/right for Silvia (bottom middle)
    // (its place is set when we know if Francesco blows or draws circles: see inizia)
    this.frecciaSu = creaFreccia(this, 1135, 520, 170, true).setDepth(30);
    creaFreccia(this, LARGHEZZA / 2, 688, 220, false).setDepth(30);

    this.testoVento = this.add.text(LARGHEZZA / 2, 100, '', {
      fontFamily: FONT, fontSize: '34px', color: '#fdf3e1',
    }).setOrigin(0.5).setDepth(40);
  }

  aggiornaLanterne() {
    this.testoLanterne.setText(`${this.lanterne} / ${DIRIGIBILE.LANTERNE_PER_VINCERE}`);
    this.testoLanterne.setColor(this.lanterne >= DIRIGIBILE.LANTERNE_PER_VINCERE ? '#9be39b' : '#ffe9a8');
  }

  // Plans where the rings and clouds will be (all at the start, so the flight is fair)
  preparaPercorso() {
    this.piano = [];
    let x = 640;
    let y = 360;
    for (let i = 0; i < DIRIGIBILE.ANELLI; i++) {
      // Far from the previous ring sideways, not too far in height, not under the crank wheel
      let nx;
      let ny;
      let tentativi = 0;
      do {
        nx = Phaser.Math.Between(150, LARGHEZZA - 150);
        ny = Phaser.Math.Clamp(y + Phaser.Math.Between(-DIRIGIBILE.SALTO_MASSIMO, DIRIGIBILE.SALTO_MASSIMO), ALTO + 70, BASSO - 60);
        tentativi += 1;
      } while (tentativi < 50 && (Math.abs(nx - x) < DIRIGIBILE.DISTANZA_ORIZZONTALE || (nx > 1060 && ny > 500)));
      x = nx;
      y = ny;
      const progresso = i / (DIRIGIBILE.ANELLI - 1);
      const altezza = Phaser.Math.Linear(DIRIGIBILE.ALTEZZA_ANELLO_INIZIO, DIRIGIBILE.ALTEZZA_ANELLO_FINE, progresso);
      this.piano.push({ tipo: 'anello', tempo: 1.5 + i * DIRIGIBILE.OGNI, x, y, altezza });
    }
    // Clouds drifting across the sky, from either side
    for (let i = 0; i < DIRIGIBILE.NUVOLE; i++) {
      this.piano.push({
        tipo: 'nuvola',
        tempo: 3 + i * ((DIRIGIBILE.ANELLI * DIRIGIBILE.OGNI - 4) / DIRIGIBILE.NUVOLE),
        y: Phaser.Math.Between(ALTO + 40, BASSO - 40),
        verso: Math.random() < 0.5 ? 1 : -1,
      });
    }
    this.piano.sort((a, b) => a.tempo - b.tempo);
    this.durata = 1.5 + (DIRIGIBILE.ANELLI - 1) * DIRIGIBILE.OGNI + DIRIGIBILE.DURATA_ANELLO;
  }

  // ---------------------------------------------------------------- touch

  ditoGiu(dito) {
    // When Francesco blows into the microphone he doesn't need the screen, so Silvia can steer from
    // ANYWHERE on it (she naturally follows the airship with her finger, also onto the right half).
    // In the circles fallback, the right half is Francesco's.
    if (this.usaMicrofono || latoDi(dito) === 'silvia') {
      this.ditaSilvia.set(dito.id, dito.x);
    } else if (!this.ditoFrancesco) {
      this.ditoFrancesco = { id: dito.id, punti: [{ x: dito.x, y: dito.y }], angolo: null };
    }
  }

  ditoMuove(dito) {
    // A finger that was already on the screen when the flight (re)started: count it from now
    if (dito.isDown && !this.ditaSilvia.has(dito.id) && !(this.ditoFrancesco && this.ditoFrancesco.id === dito.id)) {
      this.ditoGiu(dito);
    }
    if (this.ditaSilvia.has(dito.id)) {
      const spostamento = dito.x - this.ditaSilvia.get(dito.id);
      this.ditaSilvia.set(dito.id, dito.x);
      if (this.fase === 'volo') {
        this.nave.x = Phaser.Math.Clamp(this.nave.x + spostamento * DIRIGIBILE.STERZO, 120, LARGHEZZA - 120);
      }
      return;
    }
    const f = this.ditoFrancesco;
    if (!f || f.id !== dito.id) return;
    // Circles: measure how fast the finger turns around the middle of its recent path
    f.punti.push({ x: dito.x, y: dito.y });
    if (f.punti.length > 24) f.punti.shift();
    const centro = f.punti.reduce((c, p) => ({ x: c.x + p.x / f.punti.length, y: c.y + p.y / f.punti.length }), { x: 0, y: 0 });
    const distanza = Phaser.Math.Distance.Between(centro.x, centro.y, dito.x, dito.y);
    const angolo = Math.atan2(dito.y - centro.y, dito.x - centro.x);
    if (f.angolo !== null && distanza > 25 && f.punti.length > 6) {
      const giro = Math.abs(Phaser.Math.Angle.Wrap(angolo - f.angolo));
      if (giro < 1.2) this.carica += giro; // ignore jumps
    }
    f.angolo = angolo;
  }

  ditoSu(dito) {
    this.ditaSilvia.delete(dito.id);
    if (this.ditoFrancesco && this.ditoFrancesco.id === dito.id) this.ditoFrancesco = null;
  }

  // ---------------------------------------------------------------- the flight

  // Before the flight: turn the microphone on (iPhone asks for permission). The flight starts when
  // we know the answer; without a microphone, Francesco draws circles instead.
  inizia() {
    this.carica = 0; // how much Francesco has turned since the last frame
    const attesa = this.add.text(LARGHEZZA / 2, ALTEZZA / 2, TESTI.dirigibile.consenti, {
      fontFamily: FONT, fontSize: '40px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 7,
    }).setOrigin(0.5).setDepth(60);
    let partito = false;
    // Starts the flight (once), with the microphone or with circles
    const parti = (acceso) => {
      if (!this.scene.isActive()) return;
      this.usaMicrofono = acceso;
      this.manovella.setVisible(!acceso);
      this.indicatoreSoffio.setVisible(acceso);
      // the up/down arrow sits next to the breath gauge, or left of the crank wheel
      this.frecciaSu.setPosition(acceso ? 1135 : 1050, acceso ? 520 : 590);
      if (partito) return; // the answer arrived late: the flight is already going, just switch to blowing
      partito = true;
      attesa.destroy();
      if (!acceso) {
        const avviso = this.add.text(LARGHEZZA / 2, 160, TESTI.dirigibile.senzaMicrofono, {
          fontFamily: FONT, fontSize: '32px', color: '#2a3d66', backgroundColor: '#fdf3e1', padding: { x: 14, y: 8 },
        }).setOrigin(0.5).setDepth(60);
        this.tweens.add({ targets: avviso, alpha: 0, delay: 3500, duration: 500, onComplete: () => avviso.destroy() });
        this.bottoneMicrofono();
      }
      this.fase = 'volo';
      Musica.suona(this, 'corsa');
      this.programmaRaffica();
      this.programmaMario();
    };
    // Asked when the flight starts, as in the version that always worked on Adri's iPhone
    Microfono.accendi(this).then((acceso) => { if (acceso || !partito) parti(acceso); });
    // Safety net: if no answer arrives, don't wait forever
    this.time.delayedCall(DIRIGIBILE.ATTESA_MICROFONO * 1000, () => { if (!partito) parti(false); });
  }

  // Without the microphone: a small button to try again (a tap is a real touch, which some iPhones
  // need to show the permission question). In test mode it also shows why the microphone failed.
  bottoneMicrofono() {
    const x = 1110;
    const y = 110;
    const bottone = this.add.container(x, y).setDepth(60);
    const fondo = this.add.graphics();
    fondo.fillStyle(0xfdf3e1, 0.85);
    fondo.fillRoundedRect(-150, -26, 300, 52, 26);
    bottone.add([fondo, this.add.text(0, 0, TESTI.dirigibile.riprovaMicrofono, {
      fontFamily: FONT, fontSize: '24px', color: '#2a3d66',
    }).setOrigin(0.5)]);
    if (MODALITA_PROVA) {
      // Test mode: why the microphone didn't work, readable, so Adri can send a screenshot
      // (centred under the "Niente microfono" message, so it never runs off the screen)
      const spiegazione = this.add.text(LARGHEZZA / 2 - x, 225 - y, Microfono.diagnosi(), {
        fontFamily: 'sans-serif', fontSize: '22px', color: '#2a3d66', backgroundColor: '#fdf3e1',
        padding: { x: 10, y: 5 }, align: 'center', wordWrap: { width: 760 },
      }).setOrigin(0.5, 0);
      bottone.add(spiegazione);
      Microfono.statoPermesso().then((stato) => { if (spiegazione.active) spiegazione.setText(Microfono.diagnosi(stato)); });
    }
    const tocco = (dito) => {
      if (Math.abs(dito.x - x) > 150 || Math.abs(dito.y - y) > 30) return;
      this.input.off('pointerdown', tocco);
      Microfono.accendi(this).then((acceso) => {
        if (!this.scene.isActive()) return;
        if (acceso) {
          bottone.destroy();
          this.usaMicrofono = true;
          this.manovella.setVisible(false);
          this.indicatoreSoffio.setVisible(true);
          this.frecciaSu.setPosition(1135, 520);
        } else {
          bottone.destroy();
          this.bottoneMicrofono(); // still no: show the button (and the reason) again
        }
      });
    };
    this.input.on('pointerdown', tocco);
    this.bottoneMic = bottone;
  }

  // Mario leans out of the gondola to bat at a snowflake: the airship dips
  programmaMario() {
    this.time.delayedCall(Phaser.Math.Between(9000, 13000), () => {
      if (this.fase !== 'volo') return;
      const m = this.marioNave;
      this.tweens.add({ targets: m, x: m.x + 16, angle: 28, duration: 250, yoyo: true, hold: 450, ease: 'Sine.Out' });
      suonaMiao(this);
      this.velocitaVerticale = DIRIGIBILE.TUFFO_MARIO;
      const fumetto = this.add.text(this.nave.x, this.nave.y - 110, TESTI.dirigibile.marioFermo, {
        fontFamily: FONT, fontSize: '26px', color: '#2a3d66', backgroundColor: '#fdf3e1', padding: { x: 10, y: 5 },
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets: fumetto, alpha: 0, delay: 1100, duration: 300, onComplete: () => fumetto.destroy() });
      this.programmaMario();
    });
  }

  programmaRaffica() {
    this.time.delayedCall(Phaser.Math.Between(6000, 9000), () => {
      if (this.fase !== 'volo') return;
      const verso = Math.random() < 0.5 ? -1 : 1;
      this.vento = verso * DIRIGIBILE.RAFFICA;
      this.testoVento.setText(verso > 0 ? `${TESTI.dirigibile.vento} →` : `← ${TESTI.dirigibile.vento}`);
      suonaVento(this);
      this.time.delayedCall(1600, () => {
        this.vento = 0;
        this.testoVento.setText('');
      });
      this.programmaRaffica();
    });
  }

  creaAnello(voce) {
    const anello = this.add.container(voce.x, voce.y).setDepth(8).setScale(0);
    const alone = this.add.image(0, 0, creaBagliore(this)).setDisplaySize(120, voce.altezza + 60)
      .setBlendMode(Phaser.BlendModes.ADD).setAlpha(0.5);
    const cerchio = this.add.ellipse(0, 0, 46, voce.altezza).setStrokeStyle(6, 0xffe08a);
    const aura = this.add.ellipse(0, 0, 54, voce.altezza + 8).setStrokeStyle(16, 0xffc14d, 0.28);
    const scintille = [-1, 1].map((lato) => {
      const s = this.add.text(0, lato * voce.altezza / 2, '✦', { fontFamily: 'sans-serif', fontSize: '20px', color: '#fff4c2' }).setOrigin(0.5);
      this.tweens.add({ targets: s, alpha: 0.2, scale: 0.6, duration: 500, yoyo: true, repeat: -1, delay: lato > 0 ? 250 : 0 });
      return s;
    });
    const lanterna = this.add.image(0, 0, 'lanterna');
    lanterna.setScale(44 / lanterna.height);
    anello.add([alone, cerchio, aura, lanterna, ...scintille]); // (cerchio must stay second: it changes colour when taken or missed)
    anello.altezza = voce.altezza;
    anello.lanterna = lanterna;
    this.tweens.add({ targets: anello, scale: 1, duration: 300, ease: 'Back.Out' });
    this.tweens.add({ targets: alone, alpha: 0.25, duration: 600, yoyo: true, repeat: -1 });
    // It starts fading in its last second, then it's gone
    anello.scadenza = this.time.delayedCall((DIRIGIBILE.DURATA_ANELLO - 1) * 1000, () => {
      this.tweens.add({ targets: anello, alpha: 0.3, duration: 1000 });
    });
    anello.fineVita = this.time.delayedCall(DIRIGIBILE.DURATA_ANELLO * 1000, () => {
      if (!anello.preso) this.mancato(anello);
    });
    this.anelli.push(anello);
  }

  creaNuvola(voce) {
    // The grumpy dark snow cloud (Adri's Gemini picture), about 150 pixels tall
    const nuvola = this.add.container(voce.verso > 0 ? -120 : LARGHEZZA + 120, voce.y).setDepth(9);
    const immagine = this.add.image(0, 0, 'nuvola');
    immagine.setScale(150 / immagine.height);
    nuvola.add(immagine);
    this.tweens.add({ targets: immagine, y: 6, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    nuvola.verso = voce.verso;
    this.nuvole.push(nuvola);
  }

  aggiornaVolo(secondi) {
    this.tempoVolo += secondi;
    this.barraVolo.width = 400 * Math.min(1, this.tempoVolo / this.durata);

    // Bring in the rings and clouds that are due
    while (this.piano.length && this.piano[0].tempo <= this.tempoVolo) {
      const voce = this.piano.shift();
      if (voce.tipo === 'anello') this.creaAnello(voce);
      else this.creaNuvola(voce);
    }

    // Francesco's cranking: turning speed, smoothed, and it fades when he stops
    // (blowing into the microphone, or drawing circles: whichever is stronger)
    if (this.usaMicrofono && !Microfono.vivo()) {
      // The microphone stopped (iPhone can do that): fall back to circles straight away
      this.usaMicrofono = false;
      this.manovella.setVisible(true);
      this.indicatoreSoffio.setVisible(false);
      this.frecciaSu.setPosition(1050, 590);
    }
    const soffio = this.usaMicrofono ? Microfono.soffio() : 0;
    this.barraSoffio.scaleY = Phaser.Math.Linear(this.barraSoffio.scaleY, soffio, 0.3);
    const istantaneo = Math.max(this.carica / Math.max(secondi, 0.001), soffio * DIRIGIBILE.GIRI_SOFFIO);
    this.carica = 0;
    this.giri = Phaser.Math.Linear(this.giri, istantaneo, 1 - Math.exp(-secondi * 6));
    this.angoloManovella += this.giri * secondi;
    this.manovella.rotation = this.angoloManovella;
    this.manovella.setAlpha(this.giri > 1 ? 0.8 : 0.35);
    // The propeller spins (seen from the side: it gets thin and wide again)
    this.elica.scaleY = this.scalaNave * Math.cos(this.angoloManovella * 3);

    // Height: sinks on its own, climbs with the cranking
    const obiettivo = DIRIGIBILE.CADUTA - this.giri * DIRIGIBILE.SPINTA_ELICA;
    this.velocitaVerticale = Phaser.Math.Linear(this.velocitaVerticale, obiettivo, 1 - Math.exp(-secondi * 4));
    this.nave.y = Phaser.Math.Clamp(this.nave.y + this.velocitaVerticale * secondi, ALTO, BASSO);
    // (nose up when climbing: the airship faces left, so the sign is reversed)
    this.nave.angle = -Phaser.Math.Clamp(this.velocitaVerticale / 20, -8, 8);

    // A gust of wind pushes the airship sideways
    this.nave.x = Phaser.Math.Clamp(this.nave.x + this.vento * secondi, 120, LARGHEZZA - 120);

    // The music follows the propeller
    Musica.tempo(100 + Phaser.Math.Clamp(this.giri / 12, 0, 1) * 60);

    // The airship reaches a ring: inside its oval (the middle of the airship)
    for (const anello of this.anelli) {
      if (!anello.preso && !anello.finito
        && Math.abs(this.nave.x - anello.x) < DIRIGIBILE.TOLLERANZA && Math.abs(this.nave.y - anello.y) <= anello.altezza / 2 - 10) {
        this.prendiLanterna(anello);
      }
    }
    // Dark clouds drift across the sky
    for (const nuvola of this.nuvole) {
      nuvola.x += nuvola.verso * DIRIGIBILE.VELOCITA_NUVOLE * secondi;
      if (!nuvola.colpita && !this.invulnerabile
        && Math.abs(nuvola.x - this.nave.x) < 110 && Math.abs(nuvola.y - this.nave.y) < 65) {
        nuvola.colpita = true;
        this.colpitoDaNuvola();
      }
    }
    this.nuvole = this.nuvole.filter((nuvola) => {
      if (nuvola.x < -200 || nuvola.x > LARGHEZZA + 200) {
        nuvola.destroy();
        return false;
      }
      return true;
    });

    if (this.anelliPassati >= DIRIGIBILE.ANELLI) this.fine();
  }

  prendiLanterna(anello) {
    anello.preso = true;
    anello.finito = true;
    this.anelliPassati += 1;
    this.lanterne += 1;
    this.aggiornaLanterne();
    suonaTono(this, 1100, 1700, 0.18, 'sine', 0.15);
    anello.list[1].setStrokeStyle(8, 0x9be39b);
    // The lantern flies into the gondola
    const lanterna = anello.lanterna;
    anello.remove(lanterna);
    lanterna.setPosition(anello.x, anello.y).setDepth(20);
    this.add.existing(lanterna);
    this.tweens.add({
      targets: lanterna, x: this.nave.x, y: this.nave.y + 50, scale: lanterna.scale * 0.4, alpha: 0, duration: 400,
      onComplete: () => lanterna.destroy(),
    });
    this.togliAnello(anello);
  }

  // The ring shrinks away after it's taken or missed
  togliAnello(anello) {
    anello.scadenza.remove();
    anello.fineVita.remove();
    this.tweens.killTweensOf(anello);
    this.tweens.add({
      targets: anello, scale: 0, alpha: 0, duration: 400, delay: 200,
      onComplete: () => {
        this.anelli = this.anelli.filter((a) => a !== anello);
        anello.destroy();
      },
    });
  }

  mancato(anello) {
    if (this.fase !== 'volo') return;
    anello.finito = true;
    this.anelliPassati += 1;
    anello.list[1].setStrokeStyle(8, 0x888888);
    anello.lanterna.setAlpha(0.3);
    suonaTono(this, 400, 250, 0.2, 'triangle', 0.08);
    this.togliAnello(anello);
  }

  colpitoDaNuvola() {
    this.invulnerabile = true;
    suonaTonfo(this);
    this.cameras.main.shake(250, 0.01);
    if (this.lanterne > 0) {
      this.lanterne -= 1;
      this.aggiornaLanterne();
      const caduta = this.add.image(this.nave.x, this.nave.y + 50, 'lanterna').setDepth(20);
      caduta.setScale(36 / caduta.height);
      this.tweens.add({ targets: caduta, y: ALTEZZA + 50, angle: 180, duration: 1000, ease: 'Quad.In', onComplete: () => caduta.destroy() });
    }
    this.tweens.add({
      targets: this.nave, alpha: 0.35, duration: 120, yoyo: true, repeat: 5,
      onComplete: () => {
        this.nave.setAlpha(1);
        this.invulnerabile = false;
      },
    });
  }

  // ---------------------------------------------------------------- the end

  fine() {
    this.fase = 'fine';
    Musica.tempoNormale();
    if (this.lanterne < DIRIGIBILE.LANTERNE_PER_VINCERE) {
      suonaTonfo(this);
      this.add.text(LARGHEZZA / 2, ALTEZZA / 2, TESTI.dirigibile.poche, {
        fontFamily: FONT, fontSize: '56px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 8,
      }).setOrigin(0.5).setDepth(60);
      this.time.delayedCall(1500, () => this.scene.restart({ ritenta: true }));
      return;
    }
    let stelle = 1;
    if (this.lanterne >= DIRIGIBILE.STELLE_2) stelle = 2;
    if (this.lanterne >= DIRIGIBILE.STELLE_3) stelle = 3;
    Microfono.spegni(); // the flight is over: the microphone goes off
    mostraRisultato(this, { gioco: 'dirigibile', stelle, prossima: 'Cerimonia', frase: TESTI.dirigibile.marioVittoria });
  }

  // ---------------------------------------------------------------- every frame

  update(tempo, delta) {
    if (this.fase !== 'volo') return;
    this.aggiornaVolo(Math.min(delta, 50) / 1000);
  }
}

// A double arrow drawn in code (looks the same on every phone): soft cream with a dark outline.
// verticale = true: up/down; false: left/right. lunghezza is from tip to tip.
function creaFreccia(scena, x, y, lunghezza, verticale) {
  const g = scena.add.graphics({ x, y });
  const m = lunghezza / 2;
  const punta = 26;
  const spessore = 12;
  // points of the arrow drawn as if horizontal; turned 90 degrees if vertical
  const punti = [
    [-m, 0], [-m + punta, -punta], [-m + punta, -spessore / 2], [m - punta, -spessore / 2],
    [m - punta, -punta], [m, 0], [m - punta, punta], [m - punta, spessore / 2],
    [-m + punta, spessore / 2], [-m + punta, punta],
  ].map(([a, b]) => (verticale ? new Phaser.Geom.Point(b, a) : new Phaser.Geom.Point(a, b)));
  g.fillStyle(0xfdf3e1, 0.75);
  g.fillPoints(punti, true);
  g.lineStyle(3, 0x2a3d66, 0.6);
  g.strokePoints(punti, true);
  scena.tweens.add({ targets: g, alpha: 0.55, duration: 900, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
  return g;
}
