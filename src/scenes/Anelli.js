// Mini game 3: Gli Anelli Perduti (the lost rings). PROTOTYPE with plain shapes.
//
// 1. Start card: instructions, Mario (guilty!) in the middle; pet Mario to begin.
// 2. Left half: a grid of 12 ice blocks hiding 6 pairs (bell, star, ornament, candy cane, mitten, rings).
//    - Silvia taps an ice block to choose it. At most 2 pictures can be uncovered at a time.
//    - Francesco breaks the ice with the pickaxe: 3 points appear on his half, one after another,
//      in random places (different every time). He touches the first and draws his finger through
//      the others WITHOUT lifting it. If he lifts it, new points appear. At the third point the ice
//      shatters and the picture appears.
//    - Two uncovered pictures: if they match they glow, and Silvia taps both to make them green (found).
//      If they don't match, they freeze over again after 2 seconds.
// 3. Countdown. Find all 6 pairs to win. Stars by time left.
// 4. Mario looks guilty until the end, then proud. Every 9-13 seconds he gets up to mischief:
//    - he walks onto the ice and swaps two frozen blocks with his paw (so their memory is scrambled), or
//    - he wanders around Francesco's side: if Francesco's finger runs into him while joining the points,
//      Francesco has to start again from point 1.

// --- Tuning numbers (change these to make the game easier or harder) ---
const ANELLI = {
  TEMPO: 60,              // seconds
  PUNTI: 3,               // points Francesco must join to break the ice
  RAGGIO_PUNTO: 55,       // how close (pixels) his finger must get to a point
  DISTANZA_PUNTI: 200,    // minimum distance between one point and the next
  GELO_SBAGLIATE: 2,      // seconds before two different pictures freeze over again
  STELLE_3: 15,           // seconds left for 3 stars
  STELLE_2: 7,            // seconds left for 2 stars
};

const COLONNE = 4;
const RIGHE = 3;
const LATO_CELLA = 120;
const SPAZIO_CELLA = 12;
const X_GRIGLIA = (META - (COLONNE * LATO_CELLA + (COLONNE - 1) * SPAZIO_CELLA)) / 2; // centred in the left half
const Y_GRIGLIA = 170;
const TIPI = ['campana', 'stella', 'pallina', 'bastoncino', 'guanto', 'anelli'];
const COLORE_GHIACCIO = 0xbfe3f7;

class Anelli extends Phaser.Scene {
  constructor() {
    super('Anelli');
  }

  init(dati) {
    this.ritenta = Boolean(dati && dati.ritenta);
  }

  preload() {
    caricaMario(this);
    carica(this, 'sfondo_anelli', 'assets/game/bg_anelli.jpg');
    carica(this, 'francesco_piccone', 'assets/game/francesco_piccone.png');
    TIPI.forEach((tipo) => carica(this, `tile_${tipo}`, `assets/game/tile_${tipo}.png`));
  }

  create() {
    this.fase = 'carta';      // 'carta' -> 'gioco' -> 'fine'
    this.tempoRimasto = ANELLI.TEMPO;
    this.trovate = 0;         // pairs found
    this.inRottura = null;    // the ice block Silvia chose, that Francesco is breaking
    this.punti = [];          // Francesco's points for the current block
    this.prossimoPunto = 0;   // index of the next point he must reach
    this.ditoPiccone = null;  // id of Francesco's finger while he draws
    this.marioOccupato = false; // true while Mario is up to mischief
    this.marioInGiro = false;   // true while he wanders on Francesco's side
    this.marioImmune = false;   // true for a moment after Francesco ran into him
    this.prossimaMarachella = null;

    // The frozen clearing (Adri's Gemini background), with a faint line between the two halves
    this.add.image(LARGHEZZA / 2, ALTEZZA / 2, 'sfondo_anelli');
    this.add.rectangle(META, 0, 2, ALTEZZA, 0xffffff, 0.5).setOrigin(0.5, 0);

    this.creaGriglia();
    this.creaInterfaccia();

    // The crack Francesco draws, and the pickaxe that follows his finger
    this.crepa = this.add.graphics().setDepth(15);
    this.piccone = this.add.text(960, 360, '⛏️', { fontSize: '64px' }).setOrigin(0.2, 0.8).setDepth(22).setAlpha(0.5);

    // Francesco with his ice pickaxe, at the bottom of his half
    const francesco = this.add.image(740, 712, 'francesco_piccone').setOrigin(0.5, 1).setDepth(10);
    const scalaFrancesco = 175 / francesco.height;
    francesco.setScale(scalaFrancesco);
    this.tweens.add({ targets: francesco, scaleY: scalaFrancesco * 1.025, duration: 1500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // Mario (guilty) on the right
    this.mario = this.add.image(1180, 710, 'mario_colpevole').setOrigin(0.5, 1).setDepth(10);
    const scala = 130 / this.mario.height;
    this.mario.setScale(scala);
    this.tweens.add({ targets: this.mario, scaleY: scala * 1.03, duration: 1300, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    this.suggerimento = this.add.text(LARGHEZZA / 2, ALTEZZA - 40, '', {
      fontFamily: FONT, fontSize: '30px', color: '#2a3d66', backgroundColor: '#fdf3e1', padding: { x: 12, y: 6 },
    }).setOrigin(0.5).setDepth(40).setVisible(false);

    aggiungiNeve(this);

    this.input.on('pointerdown', (dito) => this.ditoGiu(dito));
    this.input.on('pointermove', (dito) => this.ditoMuove(dito));
    this.input.on('pointerup', (dito) => this.ditoSu(dito));
    this.input.on('pointerupoutside', (dito) => this.ditoSu(dito));

    aggiungiSalta(this, 'Dirigibile');
    this.cameras.main.fadeIn(400, 15, 26, 46);
    if (this.ritenta) {
      this.inizia();
    } else {
      mostraCartaInizio(this, TESTI.anelli, () => this.inizia(), 'mario_colpevole');
    }
  }

  // ---------------------------------------------------------------- the grid

  creaGriglia() {
    const tipi = Phaser.Utils.Array.Shuffle([...TIPI, ...TIPI]);
    this.celle = tipi.map((tipo, i) => {
      const colonna = i % COLONNE;
      const riga = Math.floor(i / COLONNE);
      const x = X_GRIGLIA + colonna * (LATO_CELLA + SPAZIO_CELLA) + LATO_CELLA / 2;
      const y = Y_GRIGLIA + riga * (LATO_CELLA + SPAZIO_CELLA) + LATO_CELLA / 2;
      const cella = { tipo, x, y, stato: 'ghiaccio' }; // 'ghiaccio' -> 'rompendo' -> 'scoperta' -> 'trovata'
      cella.fondo = this.add.rectangle(x, y, LATO_CELLA, LATO_CELLA, 0xfdf3e1).setStrokeStyle(3, 0xc9b28a);
      // Fixed drawing order (tile, picture, ice, shine): when Mario swaps two pictures, a picture must
      // still be drawn above its new tile
      cella.figura = this.creaFigura(tipo, x, y).setVisible(false).setDepth(1);
      cella.blocco = this.add.image(x, y, creaGhiaccio(this)).setDepth(1.2);
      cella.luce = this.add.rectangle(x - 25, y - 25, 50, 8, 0xffffff, 0.6).setAngle(-35).setDepth(1.3); // a shine on the ice
      cella.crepe = this.add.graphics().setDepth(2);
      cella.cornice = this.add.rectangle(x, y, LATO_CELLA + 10, LATO_CELLA + 10).setStrokeStyle(6, 0xffd34d).setVisible(false).setDepth(3);
      return cella;
    });
  }

  // The hidden pictures (Adri's Gemini watercolours), fitted inside the tile
  creaFigura(tipo, x, y) {
    const figura = this.add.image(x, y, `tile_${tipo}`);
    figura.scalaBase = 88 / Math.max(figura.width, figura.height);
    figura.setScale(figura.scalaBase);
    return figura;
  }

  copriConGhiaccio(cella) {
    cella.stato = 'ghiaccio';
    cella.figura.setVisible(false);
    cella.blocco.setVisible(true).setAlpha(0);
    cella.luce.setVisible(true);
    cella.crepe.clear();
    cella.fondo.setFillStyle(0xfdf3e1).setStrokeStyle(3, 0xc9b28a);
    this.tweens.killTweensOf(cella.fondo);
    cella.fondo.setScale(1);
    this.tweens.add({ targets: cella.blocco, alpha: 1, duration: 300 });
  }

  cellaSotto(x, y) {
    return this.celle.find((c) => Math.abs(x - c.x) <= LATO_CELLA / 2 && Math.abs(y - c.y) <= LATO_CELLA / 2);
  }

  scoperte() {
    return this.celle.filter((c) => c.stato === 'scoperta');
  }

  creaInterfaccia() {
    this.testoTempo = this.add.text(LARGHEZZA / 2, 50, String(ANELLI.TEMPO), {
      fontFamily: FONT, fontSize: '48px', color: '#2a3d66',
    }).setOrigin(0.5).setDepth(40);
    this.testoCoppie = this.add.text(LARGHEZZA - 40, 50, `0 / ${TIPI.length}`, {
      fontFamily: FONT, fontSize: '36px', color: '#2a3d66',
    }).setOrigin(1, 0.5).setDepth(40);
  }

  mostraSuggerimento(testo) {
    this.suggerimento.setText(testo).setVisible(true);
    if (this.timerSuggerimento) this.timerSuggerimento.remove();
    this.timerSuggerimento = this.time.delayedCall(2200, () => this.suggerimento.setVisible(false));
  }

  // ---------------------------------------------------------------- touch

  ditoGiu(dito) {
    if (this.fase !== 'gioco') return;
    if (latoDi(dito) === 'francesco') {
      this.inizioPiccone(dito);
      return;
    }
    const cella = this.cellaSotto(dito.x, dito.y);
    if (cella) this.toccaCella(cella);
  }

  ditoMuove(dito) {
    if (this.fase !== 'gioco') return;
    // A finger already down on Francesco's half that slides onto point 1 also starts the breaking
    if (this.ditoPiccone === null && latoDi(dito) === 'francesco' && dito.isDown) {
      this.inizioPiccone(dito, true);
      return;
    }
    if (dito.id !== this.ditoPiccone) return;
    // Ran into Mario while joining the points: start again from point 1
    if (this.marioInGiro && !this.marioImmune
      && Phaser.Math.Distance.Between(dito.x, dito.y, this.mario.x, this.mario.y - 60) < 65) {
      this.marioUrtato();
      return;
    }
    this.piccone.setPosition(dito.x, dito.y);
    this.disegnaCrepa(dito.x, dito.y);
    const punto = this.punti[this.prossimoPunto];
    if (punto && Phaser.Math.Distance.Between(dito.x, dito.y, punto.x, punto.y) <= ANELLI.RAGGIO_PUNTO) {
      this.puntoRaggiunto();
    }
  }

  ditoSu(dito) {
    if (dito.id !== this.ditoPiccone) return;
    this.ditoPiccone = null;
    this.piccone.setAlpha(0.5);
    // Lifted the finger before the last point: start again with new points
    if (this.fase === 'gioco' && this.inRottura && this.prossimoPunto < ANELLI.PUNTI) {
      this.mostraSuggerimento(TESTI.anelli.nonStaccare);
      suonaTonfo(this);
      this.inRottura.crepe.clear();
      this.creaPunti();
    }
  }

  // ---------------------------------------------------------------- Silvia

  toccaCella(cella) {
    if (cella.stato === 'trovata' || cella.stato === 'rompendo') return;

    // An ice block: choose it (if fewer than 2 pictures are showing)
    if (cella.stato === 'ghiaccio') {
      if (this.scoperte().length >= 2) {
        this.mostraSuggerimento(TESTI.anelli.massimoDue);
        return;
      }
      if (this.inRottura) {
        // She can change her mind only before Francesco starts breaking
        if (this.prossimoPunto > 0) return;
        this.inRottura.stato = 'ghiaccio';
        this.inRottura.cornice.setVisible(false);
      }
      this.inRottura = cella;
      cella.stato = 'rompendo';
      cella.cornice.setVisible(true);
      this.tweens.add({ targets: cella.cornice, scale: { from: 1.15, to: 1 }, duration: 200 });
      this.creaPunti();
      return;
    }

    // An uncovered picture that's part of a matching pair: tap both to confirm (they turn green)
    if (cella.stato === 'scoperta' && cella.uguale) {
      cella.confermata = true;
      cella.fondo.setFillStyle(0xd8f0d0).setStrokeStyle(4, 0x5fbf6a);
      const coppia = this.scoperte().filter((c) => c.tipo === cella.tipo);
      if (coppia.length === 2 && coppia.every((c) => c.confermata)) this.coppiaTrovata(coppia);
    }
  }

  coppiaTrovata(coppia) {
    coppia.forEach((cella) => {
      cella.stato = 'trovata';
      this.tweens.killTweensOf(cella.fondo);
      cella.fondo.setScale(1);
      const base = cella.figura.scalaBase;
      this.tweens.add({ targets: cella.figura, scale: { from: base * 1.4, to: base }, duration: 300, ease: 'Back.Out' });
    });
    this.trovate += 1;
    this.testoCoppie.setText(`${this.trovate} / ${TIPI.length}`);
    suonaTono(this, 1200, 1800, 0.18, 'sine', 0.15);
    if (coppia[0].tipo === 'anelli') {
      const testo = this.add.text((coppia[0].x + coppia[1].x) / 2, (coppia[0].y + coppia[1].y) / 2, TESTI.anelli.anelli, {
        fontFamily: FONT, fontSize: '44px', color: '#ffd34d', stroke: '#2a3d66', strokeThickness: 6,
      }).setOrigin(0.5).setDepth(30);
      this.tweens.add({ targets: testo, y: testo.y - 60, alpha: 0, delay: 600, duration: 900, onComplete: () => testo.destroy() });
    }
    if (this.trovate === TIPI.length) this.vittoria();
  }

  // Two pictures are showing: same = they glow and wait for Silvia's taps; different = they freeze again
  controllaCoppia() {
    const scoperte = this.scoperte();
    if (scoperte.length < 2) return;
    const [a, b] = scoperte;
    if (a.tipo === b.tipo) {
      [a, b].forEach((cella) => {
        cella.uguale = true;
        cella.fondo.setFillStyle(0xffe9a8).setStrokeStyle(5, 0xffd34d);
        this.tweens.add({ targets: cella.fondo, scale: 1.06, duration: 400, yoyo: true, repeat: -1 });
      });
      this.mostraSuggerimento(TESTI.anelli.uguali);
      suonaTono(this, 900, 1200, 0.12, 'sine', 0.1);
    } else {
      this.time.delayedCall(ANELLI.GELO_SBAGLIATE * 1000, () => {
        if (this.fase !== 'gioco') return;
        [a, b].forEach((cella) => this.copriConGhiaccio(cella));
        suonaTono(this, 2000, 1500, 0.15, 'sine', 0.05);
      });
    }
  }

  // ---------------------------------------------------------------- Francesco

  // New random points on Francesco's half; only the first one is visible
  // (with "stessi" = true the points stay where they were: used when Francesco must start again from point 1)
  creaPunti(stessi) {
    const vecchi = stessi ? this.punti.map((p) => ({ x: p.x, y: p.y })) : null;
    this.punti.forEach((p) => p.cerchio.destroy());
    this.punti = [];
    this.prossimoPunto = 0;
    this.crepa.clear();
    for (let i = 0; i < ANELLI.PUNTI; i++) {
      let x;
      let y;
      let tentativi = 0;
      if (vecchi) ({ x, y } = vecchi[i]);
      else do {
        x = Phaser.Math.Between(720, 1200);
        y = Phaser.Math.Between(150, 560);
        tentativi += 1;
      } while (tentativi < 80 && (
        // far from ALL the earlier points (not only the previous one), and not on Mario
        this.punti.some((p) => Phaser.Math.Distance.Between(x, y, p.x, p.y) < ANELLI.DISTANZA_PUNTI)
        || (x > 1080 && y > 480)   // not on Mario
        || (x < 850 && y > 470)    // not on Francesco
      ));
      const cerchio = this.add.container(x, y).setDepth(18).setVisible(i === 0);
      cerchio.add([
        this.add.circle(0, 0, ANELLI.RAGGIO_PUNTO, 0x7fb6dc, 0.25).setStrokeStyle(4, 0x2a3d66, 0.6),
        this.add.circle(0, 0, 14, 0x2a3d66, 0.8),
        this.add.text(0, 0, String(i + 1), { fontFamily: FONT, fontSize: '20px', color: '#ffffff' }).setOrigin(0.5),
      ]);
      this.tweens.add({ targets: cerchio, scale: 1.12, duration: 450, yoyo: true, repeat: -1 });
      this.punti.push({ x, y, cerchio });
    }
  }

  inizioPiccone(dito, scivolando) {
    if (!this.inRottura) {
      if (!scivolando) this.mostraSuggerimento(TESTI.anelli.scegli);
      return;
    }
    const primo = this.punti[0];
    if (this.prossimoPunto === 0 && Phaser.Math.Distance.Between(dito.x, dito.y, primo.x, primo.y) <= ANELLI.RAGGIO_PUNTO) {
      this.ditoPiccone = dito.id;
      this.piccone.setAlpha(1).setPosition(dito.x, dito.y);
      this.puntoRaggiunto();
    }
  }

  puntoRaggiunto() {
    const punto = this.punti[this.prossimoPunto];
    this.tweens.killTweensOf(punto.cerchio);
    punto.cerchio.setScale(1).list[0].setFillStyle(0xffffff, 0.8);
    this.prossimoPunto += 1;
    // A crack in the chosen ice block, and a "tink"
    const cella = this.inRottura;
    const angolo = Phaser.Math.FloatBetween(0, Math.PI * 2);
    cella.crepe.lineStyle(3, 0x2a3d66, 0.8);
    cella.crepe.lineBetween(cella.x, cella.y, cella.x + Math.cos(angolo) * 55, cella.y + Math.sin(angolo) * 55);
    this.tweens.add({ targets: this.piccone, angle: { from: -30, to: 0 }, duration: 120 });
    suonaTono(this, 1800 + this.prossimoPunto * 300, 1200, 0.1, 'triangle', 0.15);

    if (this.prossimoPunto < ANELLI.PUNTI) {
      this.punti[this.prossimoPunto].cerchio.setVisible(true);
      return;
    }
    this.ghiaccioRotto();
  }

  disegnaCrepa(xDito, yDito) {
    this.crepa.clear();
    this.crepa.lineStyle(6, 0x2a3d66, 0.7);
    for (let i = 1; i < this.prossimoPunto; i++) {
      this.crepa.lineBetween(this.punti[i - 1].x, this.punti[i - 1].y, this.punti[i].x, this.punti[i].y);
    }
    if (this.prossimoPunto > 0 && this.prossimoPunto < ANELLI.PUNTI) {
      const ultimo = this.punti[this.prossimoPunto - 1];
      this.crepa.lineStyle(4, 0x2a3d66, 0.4);
      this.crepa.lineBetween(ultimo.x, ultimo.y, xDito, yDito);
    }
  }

  // The ice shatters and the picture appears
  ghiaccioRotto() {
    const cella = this.inRottura;
    this.inRottura = null;
    this.ditoPiccone = null;
    this.piccone.setAlpha(0.5);
    // Remove these points a moment later. Only THESE ones: Silvia may already have chosen the next block,
    // which has its own new points.
    const vecchi = this.punti;
    this.punti = [];
    this.prossimoPunto = 0;
    this.time.delayedCall(250, () => {
      vecchi.forEach((p) => p.cerchio.destroy());
      if (this.prossimoPunto === 0) this.crepa.clear();
    });
    cella.stato = 'scoperta';
    cella.uguale = false;
    cella.confermata = false;
    cella.cornice.setVisible(false);
    cella.blocco.setVisible(false);
    cella.luce.setVisible(false);
    cella.crepe.clear();
    cella.figura.setVisible(true);
    const base = cella.figura.scalaBase;
    this.tweens.add({ targets: cella.figura, scale: { from: base * 0.4, to: base }, duration: 250, ease: 'Back.Out' });
    for (let i = 0; i < 8; i++) {
      const scheggia = this.add.rectangle(cella.x, cella.y, Phaser.Math.Between(8, 16), Phaser.Math.Between(8, 16), COLORE_GHIACCIO).setDepth(25);
      this.tweens.add({
        targets: scheggia,
        x: cella.x + Phaser.Math.Between(-90, 90),
        y: cella.y + Phaser.Math.Between(-90, 60),
        angle: Phaser.Math.Between(-180, 180),
        alpha: 0,
        duration: 500,
        onComplete: () => scheggia.destroy(),
      });
    }
    suonaTono(this, 2400, 900, 0.25, 'triangle', 0.15);
    this.controllaCoppia();
  }

  // ---------------------------------------------------------------- game flow

  inizia() {
    this.fase = 'gioco';
    Musica.suona(this, 'corsa');
    this.mostraSuggerimento(TESTI.anelli.scegli);
    this.programmaMario();
  }

  // ---------------------------------------------------------------- Mario's mischief

  programmaMario() {
    this.time.delayedCall(Phaser.Math.Between(9000, 13000), () => {
      if (this.fase !== 'gioco') return;
      if (!this.marioOccupato) {
        // Alternate: one swap, one walk on Francesco's side
        this.prossimaMarachella = this.prossimaMarachella === 'scambio' ? 'giro' : 'scambio';
        if (this.prossimaMarachella === 'scambio') this.marioScambia();
        else this.marioGira();
      }
      this.programmaMario();
    });
  }

  // Mario walks (with little hops) to a place, then does something
  marioVa(x, y, durata, poi) {
    this.mario.setFlipX(x < this.mario.x);
    this.tweens.add({ targets: this.mario, x, duration: durata, ease: 'Sine.InOut' });
    this.tweens.add({
      targets: this.mario, y, duration: durata, ease: 'Sine.InOut',
      onComplete: () => { if (this.fase === 'gioco') poi(); },
    });
  }

  marioACasa() {
    this.marioVa(1180, 710, 900, () => {
      this.mario.setFlipX(false);
      this.marioOccupato = false;
    });
  }

  // He walks onto the ice and swaps two frozen blocks with his paw
  marioScambia() {
    const ghiacciate = Phaser.Utils.Array.Shuffle(this.celle.filter((c) => c.stato === 'ghiaccio'));
    if (ghiacciate.length < 2) return;
    const [a, b] = ghiacciate;
    this.marioOccupato = true;
    this.marioVa((a.x + b.x) / 2, Math.max(a.y, b.y) + 95, 1100, () => {
      // Only if both are still frozen when he gets there
      if (a.stato !== 'ghiaccio' || b.stato !== 'ghiaccio') {
        this.marioACasa();
        return;
      }
      suonaMiao(this);
      this.mostraSuggerimento(TESTI.anelli.scambio);
      this.tweens.add({ targets: this.mario, angle: -15, duration: 120, yoyo: true, repeat: 1 });
      // What is hidden under the two blocks changes place...
      [a.tipo, b.tipo] = [b.tipo, a.tipo];
      [a.figura, b.figura] = [b.figura, a.figura];
      a.figura.setPosition(a.x, a.y);
      b.figura.setPosition(b.x, b.y);
      // ...and we see the two blocks slide across each other
      [[a, b], [b, a]].forEach(([da, verso]) => {
        da.cornice.setVisible(true);
        this.tweens.add({
          targets: da.blocco, x: verso.x, y: verso.y, duration: 600, ease: 'Sine.InOut',
          onComplete: () => {
            da.blocco.setPosition(da.x, da.y);
            if (da !== this.inRottura) da.cornice.setVisible(false);
          },
        });
      });
      this.time.delayedCall(900, () => this.marioACasa());
    });
  }

  // He wanders around Francesco's side for a while
  marioGira() {
    this.marioOccupato = true;
    this.marioInGiro = true;
    const tappe = [0, 1, 2].map(() => ({ x: Phaser.Math.Between(780, 1120), y: Phaser.Math.Between(300, 570) }));
    const prossima = () => {
      const tappa = tappe.shift();
      if (!tappa) {
        this.marioInGiro = false;
        this.marioACasa();
        return;
      }
      this.marioVa(tappa.x, tappa.y, 1300, () => this.time.delayedCall(500, () => { if (this.fase === 'gioco') prossima(); }));
    };
    prossima();
  }

  // Francesco's finger ran into Mario: the same points again, from point 1
  marioUrtato() {
    this.marioImmune = true;
    this.time.delayedCall(1200, () => { this.marioImmune = false; });
    suonaMiao(this);
    this.mostraSuggerimento(TESTI.anelli.attentoMario);
    this.tweens.add({ targets: this.mario, angle: 20, duration: 90, yoyo: true, repeat: 2 });
    this.ditoPiccone = null;
    this.piccone.setAlpha(0.5);
    if (this.inRottura) this.inRottura.crepe.clear();
    this.creaPunti(true);
  }

  vittoria() {
    this.fase = 'fine';
    let stelle = 1;
    if (this.tempoRimasto >= ANELLI.STELLE_2) stelle = 2;
    if (this.tempoRimasto >= ANELLI.STELLE_3) stelle = 3;
    Musica.tempoNormale();

    // Mario is proud now (back at his place, whatever he was up to)
    this.tweens.killTweensOf(this.mario);
    this.mario.setPosition(1180, 710).setAngle(0).setFlipX(false);
    this.mario.setTexture('mario_felice');
    this.mario.setScale(130 / this.mario.height);
    for (let i = 0; i < 6; i++) {
      const cuore = this.add.text(1180 + Phaser.Math.Between(-60, 60), 580, '♥', {
        fontFamily: 'sans-serif', fontSize: '36px', color: '#e8798f',
      }).setOrigin(0.5).setDepth(30).setAlpha(0);
      this.tweens.add({ targets: cuore, y: 440, alpha: { from: 1, to: 0 }, duration: 1100, delay: i * 120 });
    }

    this.time.delayedCall(1200, () => {
      mostraRisultato(this, { gioco: 'anelli', stelle, prossima: 'Dirigibile', frase: TESTI.anelli.marioVittoria });
    });
  }

  // Forgiving game: no game over, just a short message and an instant restart
  ricomincia(messaggio) {
    this.fase = 'fine';
    Musica.tempoNormale();
    suonaTonfo(this);
    this.add.text(LARGHEZZA / 2, ALTEZZA / 2, messaggio, {
      fontFamily: FONT, fontSize: '60px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(60);
    this.time.delayedCall(1300, () => this.scene.restart({ ritenta: true }));
  }

  // ---------------------------------------------------------------- every frame

  update(tempo, delta) {
    if (this.fase !== 'gioco') return;
    const secondi = Math.min(delta, 50) / 1000;
    const prima = Math.ceil(this.tempoRimasto);
    this.tempoRimasto -= secondi;
    const ora = Math.max(0, Math.ceil(this.tempoRimasto));
    if (ora !== prima) {
      this.testoTempo.setText(String(ora));
      if (ora <= 10) {
        this.testoTempo.setColor('#c0392b');
        this.tweens.add({ targets: this.testoTempo, scale: { from: 1.4, to: 1 }, duration: 250 });
        suonaTic(this);
      }
      // The music hurries in the last 15 seconds
      Musica.tempo(ora <= 15 ? 140 : 112);
    }
    if (this.tempoRimasto <= 0) this.ricomincia(TESTI.anelli.tempoScaduto);
  }
}

// A block of ice painted in code (once, then reused): pale blue with a soft light from the top left,
// a frosty white edge and a few sparkles. Returns the texture's name.
function creaGhiaccio(scena) {
  if (!scena.textures.exists('ghiaccio')) {
    const L = LATO_CELLA;
    const tela = scena.textures.createCanvas('ghiaccio', L, L);
    const ctx = tela.getContext();
    const arrotonda = (x, y, w, h, r) => {
      ctx.beginPath();
      ctx.moveTo(x + r, y);
      ctx.arcTo(x + w, y, x + w, y + h, r);
      ctx.arcTo(x + w, y + h, x, y + h, r);
      ctx.arcTo(x, y + h, x, y, r);
      ctx.arcTo(x, y, x + w, y, r);
      ctx.closePath();
    };
    const sfumatura = ctx.createLinearGradient(0, 0, L, L);
    sfumatura.addColorStop(0, '#eaf8ff');
    sfumatura.addColorStop(0.5, '#bfe3f7');
    sfumatura.addColorStop(1, '#8fc4e6');
    arrotonda(2, 2, L - 4, L - 4, 14);
    ctx.fillStyle = sfumatura;
    ctx.fill();
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#6fa8d0';
    ctx.stroke();
    // frosty inner edge
    arrotonda(8, 8, L - 16, L - 16, 10);
    ctx.lineWidth = 3;
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.stroke();
    // sparkles
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    [[28, 84, 3], [92, 30, 2.5], [84, 92, 2], [40, 44, 2]].forEach(([x, y, r]) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    });
    tela.refresh();
  }
  return 'ghiaccio';
}
