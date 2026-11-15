// Mini game 2: La Torta Nuziale (the wedding cake). PROTOTYPE with plain shapes.
//
// 1. Start card: instructions, Mario in the middle; pet Mario to begin.
// 2. Silvia (left half) taps at the right moment to drop the piece sliding above the cake.
//    Whatever hangs over the edge is cut off, so a sloppy drop makes the cake narrower.
//    5 layers, each smaller and faster, then 2 nutcrackers on top, side by side:
//    if the second nutcracker touches the first, the first falls off (and both must be placed again).
// 3. Francesco keeps the cake balanced, with his controls on the two EDGES of the screen
//    (◀ strip on the far left, ▶ strip on the far right: awkward on purpose, agreed with Adri).
//    The cake keeps leaning to one side on its own (more as it grows); every drop pushes it towards
//    the side where the piece landed (harder when off-centre), and Mario's licks push it too.
//    ONE finger only: holding ◀ pushes the balance bubble left, ▶ right. Holding both does nothing
//    (the strips turn grey, "Un dito solo!"), so he must move his finger back and forth between the edges.
//    Outside the green zone the cake leans, pieces slide faster, and a dropped piece slides with the tilt.
//    If the bubble stays at the end of the bar for a moment (the bar flashes red as a warning),
//    the top piece falls off the cake and a life is lost. Nothing can fall while the cake is empty.
// 4. Mario sometimes tries to lick the frosting ("Slurp!"), which wobbles the cake a little.
// 5. 3 shared snowflake lives (a missed piece costs one). No timer. Stars by "Perfetto!" drops.

// --- Tuning numbers (change these to make the game easier or harder) ---
const TORTA = {
  LARGHEZZE: [340, 285, 235, 190, 150],   // width of each layer (each smaller)
  VELOCITA: [230, 280, 330, 380, 430],    // sliding speed of each layer (each faster)
  VELOCITA_SCHIACCIANOCI: [460, 510],     // sliding speed of the two nutcrackers
  ALTEZZA_STRATO: 50,
  LARGHEZZA_SCHIACCIANOCI: 36,
  PERFETTO: 8,                  // a drop this close (pixels) to the centre counts as perfect
  VICINI: 12,                   // nutcrackers this close without touching = perfect
  SENZA_EQUILIBRIO: 1.6,        // pieces slide this much faster when the cake is out of balance
  SCIVOLATA: 45,                // how far (pixels) a piece slides at full tilt when it lands
  ZONA_VERDE: 0.25,             // the bubble is "in balance" within this distance from the middle (0 to 1)
  DERIVA: 0.42,                 // how strongly the cake drifts on its own at the start...
  DERIVA_PER_PEZZO: 0.1,        // ...and how much stronger with each piece
  SPINTA: 1.8,                  // how strongly Francesco's pressing pushes the bubble back
  INSTABILE: 0.5,               // the more it leans, the more it wants to lean (makes it lively)
  COLPO: 1.1,                   // the push the cake gets at every drop...
  COLPO_PER_PEZZO: 0.18,        // ...stronger with each piece...
  COLPO_PER_PIXEL: 0.035,       // ...and stronger the further off-centre the piece lands
  AVVISO: 0.7,                  // seconds the bubble can stay at the end of the bar before the top piece falls
  STRISCIA: 110,                // width of Francesco's ◀ and ▶ strips at the screen edges
  ALTEZZA_SILVIA: 420,          // Silvia can tap anywhere above this line between the strips (and on her left half)
  STELLE_2: 2,                  // perfect drops needed for 2 stars
  STELLE_3: 4,                  // perfect drops needed for 3 stars
  VITE: 3,
};

const CENTRO_TORTA = LARGHEZZA / 2;
const PIANO_TORTA = 540;        // y of the cake stand's surface
const COLORI_STRATI = [0xfdf3e1, 0xf6c9d0, 0xfdf3e1, 0xf6c9d0, 0xfdf3e1];

class Torta extends Phaser.Scene {
  constructor() {
    super('Torta');
  }

  init(dati) {
    this.ritenta = Boolean(dati && dati.ritenta);
  }

  preload() {
    caricaMario(this);
    carica(this, 'sfondo_torta', 'assets/game/bg_torta.jpg');
    carica(this, 'tavolo', 'assets/game/table.png');
    carica(this, 'schiaccianoci_1', 'assets/game/schiaccianoci_1.png');
    carica(this, 'schiaccianoci_2', 'assets/game/schiaccianoci_2.png');
  }

  create() {
    this.fase = 'carta';     // 'carta' -> 'gioco' <-> 'cade' -> 'fine'
    this.vite = TORTA.VITE;
    this.pezzo = 0;          // 0-4 = layers, 5-6 = nutcrackers
    this.perfetti = 0;
    this.dita = new Map();   // finger id -> 'silvia' or 'francesco'
    this.oscillazione = { ampiezza: 0, tempo: 0 };
    this.cima = { x: CENTRO_TORTA, larghezza: 400, y: PIANO_TORTA }; // the top of the cake so far
    this.primoSchiaccianoci = null;
    this.inclinazione = 0;        // -1 = leaning fully left, 0 = straight, 1 = leaning fully right
    this.velocitaInclinazione = 0;
    this.deriva = 0;              // the push the cake has on its own right now (changes every few seconds)
    this.storia = [];             // the landed layers, so the top one can fall off: { oggetto, cimaPrima }
    this.tempoAlLimite = 0;       // how long the bubble has been at the end of the bar

    this.creaCucina();
    this.creaInterfaccia();

    this.input.on('pointerdown', (dito) => this.ditoGiu(dito));
    this.input.on('pointermove', (dito) => this.ditoMuove(dito));
    this.input.on('pointerup', (dito) => this.ditoSu(dito));
    this.input.on('pointerupoutside', (dito) => this.ditoSu(dito));

    this.cameras.main.fadeIn(400, 15, 26, 46);
    if (this.ritenta) {
      this.inizia();
    } else {
      mostraCartaInizio(this, TESTI.torta, () => this.inizia());
    }
  }

  // ---------------------------------------------------------------- the kitchen

  creaCucina() {
    // The cozy kitchen at night (Adri's Gemini background)
    this.add.image(LARGHEZZA / 2, ALTEZZA / 2, 'sfondo_torta');

    // The table (it jitters when Francesco isn't holding it)
    this.tavolo = this.add.container(CENTRO_TORTA, 0);
    // Adri's Gemini table, 600 pixels wide; its top surface sits under the cake stand
    const tavolo = this.add.image(0, 508, 'tavolo').setOrigin(0.5, 0);
    tavolo.setScale(600 / tavolo.width);
    this.tavolo.add(tavolo);

    // The cake (stand + layers + nutcrackers) is a group that sways around the stand's base
    this.torta = this.add.container(CENTRO_TORTA, PIANO_TORTA).setDepth(5);
    this.torta.add([
      this.add.rectangle(0, 18, 40, 28, 0xe8e0d0),
      this.add.ellipse(0, 6, 420, 16, 0xffffff).setStrokeStyle(2, 0xd8d0c0),
    ]);

    // Mario sits beside the table, breathing
    this.mario = this.add.image(250, 700, 'mario').setOrigin(0.5, 1).setDepth(8);
    const scala = 150 / this.mario.height;
    this.mario.setScale(scala);
    this.tweens.add({ targets: this.mario, scaleY: scala * 1.03, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.slurp = this.add.text(0, 0, TESTI.torta.slurp, {
      fontFamily: FONT, fontSize: '30px', color: '#2a3d66', backgroundColor: '#fdf3e1', padding: { x: 10, y: 4 },
    }).setOrigin(0.5, 1).setDepth(30).setVisible(false);
  }

  creaInterfaccia() {
    this.fiocchiVita = [];
    for (let i = 0; i < TORTA.VITE; i++) {
      this.fiocchiVita.push(this.add.text(40 + i * 50, 30, '❄', {
        fontFamily: 'sans-serif', fontSize: '40px', color: '#5b8fd1',
      }).setDepth(40));
    }
    this.testoPezzi = this.add.text(LARGHEZZA - 40, 52, '', {
      fontFamily: FONT, fontSize: '36px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 6,
    }).setOrigin(1, 0.5).setDepth(40);

    // Francesco's balance bar: a tube with a green middle zone and a bubble
    // (at the bottom in the middle, so both players can see it)
    const xLivella = CENTRO_TORTA;
    const yLivella = 680;
    this.add.rectangle(xLivella, yLivella, 400, 38, 0x2a3d66, 0.85).setDepth(40).setStrokeStyle(3, 0xfdf3e1);
    this.add.rectangle(xLivella, yLivella, 400 * TORTA.ZONA_VERDE, 30, 0x5fbf6a, 0.9).setDepth(40);
    this.bolla = this.add.circle(xLivella, yLivella, 15, 0xffe9a8).setDepth(41).setStrokeStyle(3, 0xffffff);
    this.xLivella = xLivella;

    // Francesco's two strips at the edges of the screen: ◀ pushes the bubble left, ▶ pushes it right
    const larghezzaStriscia = TORTA.STRISCIA;
    this.zone = [0, 1].map((i) => {
      const x = i === 0 ? larghezzaStriscia / 2 : LARGHEZZA - larghezzaStriscia / 2;
      const zona = this.add.container(x, 420).setDepth(39);
      zona.add([
        this.add.rectangle(0, 0, larghezzaStriscia, 600, COLORE_FRANCESCO, 0.22).setStrokeStyle(4, COLORE_FRANCESCO, 0.7),
        this.add.text(0, 0, i === 0 ? '◀' : '▶', { fontFamily: 'sans-serif', fontSize: '64px', color: '#c0392b' }).setOrigin(0.5),
      ]);
      zona.setAlpha(0.5);
      return zona;
    });
  }

  // ---------------------------------------------------------------- touch

  // Who a touch belongs to in this mini game: Francesco's strips at the two edges;
  // Silvia anywhere in the top part of the screen between the strips, and on her left half
  zonaDi(x, y) {
    if (x < TORTA.STRISCIA) return 'sinistra';
    if (x > LARGHEZZA - TORTA.STRISCIA) return 'destra';
    if (x < META || y < TORTA.ALTEZZA_SILVIA) return 'silvia';
    return null;
  }

  ditoGiu(dito) {
    const zona = this.zonaDi(dito.x, dito.y);
    this.dita.set(dito.id, zona);
    if (zona === 'silvia' && this.fase === 'gioco') this.lasciaCadere();
  }

  ditoMuove(dito) {
    // A finger sliding onto or off a strip counts where it is now (but never becomes a Silvia tap)
    if (!this.dita.has(dito.id)) return;
    const zona = this.zonaDi(dito.x, dito.y);
    this.dita.set(dito.id, zona === 'silvia' ? null : zona);
  }

  ditoSu(dito) {
    this.dita.delete(dito.id);
  }

  // Which of Francesco's strips are pressed right now
  zonePremute() {
    const zone = [...this.dita.values()];
    return { sinistra: zone.includes('sinistra'), destra: zone.includes('destra') };
  }

  inEquilibrio() {
    return Math.abs(this.inclinazione) <= TORTA.ZONA_VERDE / 2;
  }

  // A push to the cake's balance: towards a side (-1 left, 1 right), or a random side if not given
  colpo(forza, verso) {
    const lato = verso || (Math.random() < 0.5 ? -1 : 1);
    this.velocitaInclinazione += lato * forza;
  }

  cambiaDeriva() {
    const forza = TORTA.DERIVA + TORTA.DERIVA_PER_PEZZO * this.pezzo;
    this.deriva = Phaser.Math.FloatBetween(-forza, forza);
    this.time.delayedCall(Phaser.Math.Between(1500, 3000), () => this.cambiaDeriva());
  }

  // ---------------------------------------------------------------- the pieces

  inizia() {
    Musica.suona(this, 'corsa');
    this.programmaLeccata();
    this.cambiaDeriva();
    this.nuovoPezzo();
  }

  nuovoPezzo() {
    this.fase = 'gioco';
    this.testoPezzi.setText(`${Math.min(this.pezzo + 1, 7)} / 7`);
    const yMobile = Math.max(110, this.cima.y - 150);
    let mobile;
    if (this.pezzo < 5) {
      const larghezza = Math.min(TORTA.LARGHEZZE[this.pezzo], this.cima.larghezza);
      mobile = this.add.rectangle(0, yMobile, larghezza, TORTA.ALTEZZA_STRATO, COLORI_STRATI[this.pezzo])
        .setStrokeStyle(3, 0xe0b0b8);
      mobile.larghezzaPezzo = larghezza;
      mobile.altezzaPezzo = TORTA.ALTEZZA_STRATO;
      this.velocita = TORTA.VELOCITA[this.pezzo];
    } else {
      mobile = creaSchiaccianoci(this, this.pezzo - 5);
      mobile.y = yMobile + 45;
      mobile.larghezzaPezzo = TORTA.LARGHEZZA_SCHIACCIANOCI;
      mobile.altezzaPezzo = 0; // its position is its feet
      this.velocita = TORTA.VELOCITA_SCHIACCIANOCI[this.pezzo - 5];
    }
    mobile.setDepth(10);
    // Start from a random side
    this.direzione = Math.random() < 0.5 ? 1 : -1;
    mobile.x = CENTRO_TORTA - this.direzione * 360;
    this.mobile = mobile;
  }

  lasciaCadere() {
    this.fase = 'cade';
    const mobile = this.mobile;
    const yArrivo = this.pezzo < 5 ? this.cima.y - TORTA.ALTEZZA_STRATO / 2 : this.cima.y;
    this.tweens.add({
      targets: mobile,
      y: yArrivo,
      duration: 220,
      ease: 'Quad.In',
      onComplete: () => this.atterra(),
    });
  }

  atterra() {
    const dritta = this.inEquilibrio();
    // If the cake is out of balance, the piece slides in the direction of the tilt as it lands
    if (!dritta) this.mobile.x += this.inclinazione * TORTA.SCIVOLATA;
    this.dondola(dritta ? 1 : 5);
    // The drop pushes the cake towards the side where the piece landed (harder if off-centre)
    const fuoriCentro = this.mobile.x - this.cima.x;
    const forza = TORTA.COLPO + TORTA.COLPO_PER_PEZZO * this.pezzo + Math.abs(fuoriCentro) * TORTA.COLPO_PER_PIXEL;
    this.colpo(forza, Math.abs(fuoriCentro) > 2 ? Math.sign(fuoriCentro) : 0);
    if (this.pezzo < 5) this.atterraStrato();
    else this.atterraSchiaccianoci();
  }

  atterraStrato() {
    const m = this.mobile;
    const sinistra = Math.max(m.x - m.larghezzaPezzo / 2, this.cima.x - this.cima.larghezza / 2);
    const destra = Math.min(m.x + m.larghezzaPezzo / 2, this.cima.x + this.cima.larghezza / 2);
    const sovrapposto = destra - sinistra;

    if (sovrapposto <= 4) {
      this.sbagliato(m);
      return;
    }

    let x;
    let larghezza;
    if (Math.abs(m.x - this.cima.x) <= TORTA.PERFETTO) {
      // Perfect: snaps exactly on top
      x = this.cima.x;
      larghezza = Math.min(m.larghezzaPezzo, this.cima.larghezza);
      this.perfetto(this.cima.y - TORTA.ALTEZZA_STRATO);
    } else {
      x = (sinistra + destra) / 2;
      larghezza = sovrapposto;
      // The part hanging over the edge is cut off and falls
      const larghezzaTaglio = m.larghezzaPezzo - sovrapposto;
      const xTaglio = m.x < this.cima.x ? sinistra - larghezzaTaglio / 2 : destra + larghezzaTaglio / 2;
      const taglio = this.add.rectangle(xTaglio, m.y, larghezzaTaglio, TORTA.ALTEZZA_STRATO, COLORI_STRATI[this.pezzo])
        .setStrokeStyle(3, 0xe0b0b8).setDepth(9);
      this.cadeVia(taglio, m.x < this.cima.x ? -1 : 1);
      suonaTono(this, 300, 120, 0.2, 'triangle', 0.15);
    }

    // The landed layer becomes part of the cake
    const strato = this.add.rectangle(x - CENTRO_TORTA, this.cima.y - TORTA.ALTEZZA_STRATO / 2 - PIANO_TORTA,
      larghezza, TORTA.ALTEZZA_STRATO, COLORI_STRATI[this.pezzo]).setStrokeStyle(3, 0xe0b0b8);
    this.torta.add(strato);
    m.destroy();
    this.storia.push({ oggetto: strato, cimaPrima: this.cima });
    this.cima = { x, larghezza, y: this.cima.y - TORTA.ALTEZZA_STRATO };
    this.pezzo += 1;
    this.time.delayedCall(350, () => this.nuovoPezzo());
  }

  atterraSchiaccianoci() {
    const m = this.mobile;
    const metà = TORTA.LARGHEZZA_SCHIACCIANOCI / 2;
    const sulBordo = Math.abs(m.x - this.cima.x) <= this.cima.larghezza / 2 - metà + 6;
    if (!sulBordo) {
      this.sbagliato(m);
      return;
    }

    if (this.pezzo === 6) {
      const distanza = Math.abs(m.x - this.primoSchiaccianoci.xMondo);
      if (distanza < TORTA.LARGHEZZA_SCHIACCIANOCI) {
        // Touched the first one: the first falls off the cake, and both must be placed again
        this.schiaccianociCaduti(m);
        return;
      }
      if (distanza - TORTA.LARGHEZZA_SCHIACCIANOCI <= TORTA.VICINI) {
        this.perfetto(this.cima.y - 110);
        // A little heart above the two of them, gently bouncing (positions are inside the cake group)
        const xCuore = (m.x + this.primoSchiaccianoci.xMondo) / 2 - CENTRO_TORTA;
        const yCuore = this.cima.y - 125 - PIANO_TORTA;
        const cuore = this.add.text(xCuore, yCuore, '♥', {
          fontFamily: 'sans-serif', fontSize: '34px', color: '#e8798f',
        }).setOrigin(0.5);
        this.torta.add(cuore);
        this.tweens.add({ targets: cuore, y: yCuore - 12, scale: 1.3, duration: 500, yoyo: true, repeat: -1 });
      }
    }

    // The nutcracker becomes part of the cake
    this.torta.add(m);
    m.x -= CENTRO_TORTA;
    m.y -= PIANO_TORTA;
    m.xMondo = m.x + CENTRO_TORTA;
    suonaTono(this, 600, 800, 0.1, 'triangle', 0.12);

    if (this.pezzo === 5) {
      this.primoSchiaccianoci = m;
      this.pezzo = 6;
      this.time.delayedCall(350, () => this.nuovoPezzo());
    } else {
      this.vittoria();
    }
  }

  schiaccianociCaduti(secondo) {
    const primo = this.primoSchiaccianoci;
    // The first one is knocked off, away from the second; the second tumbles too
    const verso = primo.x + CENTRO_TORTA < secondo.x ? -1 : 1;
    this.torta.remove(primo);
    primo.x += CENTRO_TORTA;
    primo.y += PIANO_TORTA;
    this.add.existing(primo); // back on the screen (outside the cake group) so we can see it fall
    this.cadeVia(primo, verso);
    this.cadeVia(secondo, -verso);
    this.primoSchiaccianoci = null;
    this.pezzo = 5;
    this.mostraMessaggio(TESTI.torta.caduto);
    this.perdiVita(() => this.nuovoPezzo());
  }

  // A missed piece falls off the screen and costs a life
  sbagliato(pezzo) {
    this.cadeVia(pezzo, pezzo.x < this.cima.x ? -1 : 1);
    this.perdiVita(() => this.nuovoPezzo());
  }

  cadeVia(oggetto, verso) {
    oggetto.setDepth(9);
    this.tweens.add({
      targets: oggetto,
      x: oggetto.x + verso * 120,
      y: ALTEZZA + 150,
      angle: verso * 120,
      duration: 900,
      ease: 'Quad.In',
      onComplete: () => oggetto.destroy(),
    });
  }

  perfetto(y) {
    this.perfetti += 1;
    suonaTono(this, 1200, 1800, 0.18, 'sine', 0.15);
    const testo = this.add.text(LARGHEZZA / 2, y, TESTI.torta.perfetto, {
      fontFamily: FONT, fontSize: '40px', color: '#ffd34d', stroke: '#2a3d66', strokeThickness: 6,
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: testo, y: y - 60, alpha: 0, duration: 1000, onComplete: () => testo.destroy() });
  }

  perdiVita(poi) {
    this.fase = 'cade';
    this.vite -= 1;
    this.fiocchiVita[this.vite].setAlpha(0.2);
    suonaTonfo(this);
    this.cameras.main.shake(250, 0.01);
    if (this.vite <= 0) {
      this.ricomincia();
      return;
    }
    this.time.delayedCall(800, poi);
  }

  mostraMessaggio(testo) {
    const t = this.add.text(LARGHEZZA / 2, 200, testo, {
      fontFamily: FONT, fontSize: '44px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 7,
    }).setOrigin(0.5).setDepth(30);
    this.tweens.add({ targets: t, alpha: 0, delay: 900, duration: 400, onComplete: () => t.destroy() });
  }

  // The cake leaned too far: the top piece slides off (a nutcracker if there is one, otherwise the top layer)
  crollo() {
    const verso = Math.sign(this.inclinazione) || 1;
    this.inclinazione = 0;
    this.velocitaInclinazione = 0;
    this.tempoAlLimite = 0;
    let caduto = null;
    if (this.primoSchiaccianoci) {
      caduto = this.primoSchiaccianoci;
      this.primoSchiaccianoci = null;
      this.pezzo = 5;
    } else if (this.storia.length > 0) {
      const ultimo = this.storia.pop();
      caduto = ultimo.oggetto;
      this.cima = ultimo.cimaPrima;
      this.pezzo -= 1;
    }
    if (caduto) {
      this.torta.remove(caduto);
      caduto.x += CENTRO_TORTA;
      caduto.y += PIANO_TORTA;
      this.add.existing(caduto);
      this.cadeVia(caduto, verso);
    }
    this.mostraMessaggio(TESTI.torta.crollo);
    // Lose a life, but don't stop Silvia: a fresh piece slides in straight away
    this.vite -= 1;
    this.fiocchiVita[this.vite].setAlpha(0.2);
    suonaTonfo(this);
    this.cameras.main.shake(250, 0.01);
    if (this.vite <= 0) {
      this.ricomincia();
      return;
    }
    if (this.mobile) this.mobile.destroy();
    this.nuovoPezzo();
  }

  // Is there anything on the cake that could fall off?
  qualcosaSullaTorta() {
    return this.storia.length > 0 || this.primoSchiaccianoci !== null;
  }

  // ---------------------------------------------------------------- wobbling and Mario

  dondola(ampiezza) {
    this.oscillazione = { ampiezza: Math.max(ampiezza, this.oscillazione.ampiezza * 0.5), tempo: 0 };
  }

  programmaLeccata() {
    this.time.delayedCall(Phaser.Math.Between(7000, 11000), () => {
      if (this.fase === 'fine') return;
      this.leccata();
      this.programmaLeccata();
    });
  }

  // Mario stretches towards the cake and licks the frosting
  leccata() {
    this.tweens.add({
      targets: this.mario,
      x: 330,
      angle: 12,
      duration: 400,
      ease: 'Sine.Out',
      yoyo: true,
      hold: 700,
    });
    this.time.delayedCall(400, () => {
      this.slurp.setPosition(340, 520).setVisible(true);
      suonaMiao(this);
      this.dondola(this.inEquilibrio() ? 1 : 3);
      this.colpo(0.4);
    });
    this.time.delayedCall(1300, () => this.slurp.setVisible(false));
  }

  // ---------------------------------------------------------------- the end

  vittoria() {
    this.fase = 'fine';
    this.testoPezzi.setText('7 / 7');
    let stelle = 1;
    if (this.perfetti >= TORTA.STELLE_2) stelle = 2;
    if (this.perfetti >= TORTA.STELLE_3) stelle = 3;
    this.time.delayedCall(700, () => {
      mostraRisultato(this, { gioco: 'torta', stelle, prossima: 'Anelli', frase: TESTI.torta.marioVittoria });
    });
  }

  // Forgiving game: no game over, just a short message and an instant restart
  ricomincia() {
    this.fase = 'fine';
    Musica.tempoNormale();
    this.add.text(LARGHEZZA / 2, ALTEZZA / 2, TESTI.torta.ohNo, {
      fontFamily: FONT, fontSize: '60px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(60);
    this.time.delayedCall(1300, () => this.scene.restart({ ritenta: true }));
  }

  // ---------------------------------------------------------------- every frame

  update(tempo, delta) {
    const secondi = Math.min(delta, 50) / 1000;
    const premute = this.zonePremute();
    // One finger only: with both strips pressed, neither works (they turn grey)
    const entrambe = premute.sinistra && premute.destra;
    this.zone[0].setAlpha(premute.sinistra && !entrambe ? 1 : 0.5);
    this.zone[1].setAlpha(premute.destra && !entrambe ? 1 : 0.5);
    this.zone.forEach((zona) => zona.list[0].setFillStyle(entrambe ? 0x888888 : COLORE_FRANCESCO, entrambe ? 0.5 : 0.22));
    if (entrambe && !this.avvisoUnDito && this.fase !== 'carta') {
      this.avvisoUnDito = true;
      this.mostraMessaggio(TESTI.torta.unDito);
      this.time.delayedCall(2500, () => { this.avvisoUnDito = false; });
    }

    // Balance: the cake drifts on its own and leans more the more it leans; Francesco pushes it back
    if (this.fase === 'gioco' || this.fase === 'cade') {
      let forza = this.deriva + this.inclinazione * TORTA.INSTABILE;
      if (entrambe) {
        // both strips pressed: neither works, the cake keeps drifting
      } else if (premute.sinistra) {
        forza -= TORTA.SPINTA;
      } else if (premute.destra) {
        forza += TORTA.SPINTA;
      }
      this.velocitaInclinazione += forza * secondi;
      this.velocitaInclinazione *= 1 - 1.5 * secondi; // a little friction
      this.inclinazione = Phaser.Math.Clamp(this.inclinazione + this.velocitaInclinazione * secondi, -1, 1);
      // Leaned all the way for a moment (with a warning): the top piece falls off
      if (Math.abs(this.inclinazione) === 1 && this.fase === 'gioco' && this.qualcosaSullaTorta()) {
        this.tempoAlLimite += secondi;
        if (this.tempoAlLimite >= TORTA.AVVISO) {
          this.crollo();
          return;
        }
      } else {
        this.tempoAlLimite = 0;
      }
    }
    const dritta = this.inEquilibrio();
    this.bolla.x = this.xLivella + this.inclinazione * 185;
    // The bubble turns red out of balance, and flashes when the cake is about to lose its top piece
    const lampeggia = this.tempoAlLimite > 0 && Math.floor(this.time.now / 120) % 2 === 0;
    this.bolla.setFillStyle(dritta ? 0xffe9a8 : (lampeggia ? 0xffffff : 0xff4d3d));
    this.bolla.setScale(this.tempoAlLimite > 0 ? 1.4 : 1);

    // The cake leans with the balance, and sways after a drop
    this.oscillazione.tempo += secondi;
    const o = this.oscillazione;
    this.torta.angle = this.inclinazione * 7 + o.ampiezza * Math.sin(o.tempo * 11) * Math.exp(-o.tempo * 1.8);
    // Out of balance, the table jitters a little
    const tremolio = dritta || this.fase === 'carta' ? 0 : Phaser.Math.FloatBetween(-1.5, 1.5);
    this.tavolo.x = CENTRO_TORTA + tremolio;
    this.torta.x = CENTRO_TORTA + tremolio;
    const fermo = dritta;

    if (this.fase === 'gioco' && this.mobile) {
      // The piece slides back and forth, faster if the table isn't held
      const velocita = this.velocita * (fermo ? 1 : TORTA.SENZA_EQUILIBRIO);
      this.mobile.x += this.direzione * velocita * secondi;
      if (this.mobile.x > CENTRO_TORTA + 360) this.direzione = -1;
      if (this.mobile.x < CENTRO_TORTA - 360) this.direzione = 1;
      Musica.tempo(fermo ? 112 : 140);
    }
  }
}

// A nutcracker: Adri's Gemini pictures, based on her photo of two real ornaments.
// tipo 0: navy coat, red trousers, gold crown, gold sceptre.
// tipo 1: white coat with pink front, light blue details, tall gold hat, red-and-white lollipop.
// Its position is at its feet (the bottom of the base), and it is 100 pixels tall.
function creaSchiaccianoci(scena, tipo) {
  const c = scena.add.container(0, 0);
  const immagine = scena.add.image(0, 0, tipo === 0 ? 'schiaccianoci_1' : 'schiaccianoci_2').setOrigin(0.5, 1);
  immagine.setScale(100 / immagine.height);
  c.add(immagine);
  return c;
}
