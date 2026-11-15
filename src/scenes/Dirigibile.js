// Mini game 4: Il Dirigibile delle Lanterne (the lantern airship). PROTOTYPE with plain shapes.
//
// 1. Start card: instructions, Mario in the middle; pet Mario to begin.
// 2. Night sky, seen from the side. Rings of light with a lantern inside appear all over the sky,
//    one after another, each far from the previous one sideways; each stays about 4 seconds.
//    - Francesco controls the HEIGHT: drawing circles on his half turns the crank and the propeller.
//      The faster he circles, the higher the airship climbs; if he stops, it slowly sinks.
//    - Silvia controls LEFT/RIGHT: dragging on her half moves the airship across the sky.
//    - Reaching a ring in time collects its lantern; otherwise the ring fades and the lantern is lost.
//      Neither player can reach the rings alone.
//    - Rings get smaller; gusts of wind push the airship; dark snow clouds drift across the sky
//      and make a lantern fall out.
// 3. 16 rings. At least 10 lanterns to win (stars: 10-12 = 1, 13-14 = 2, 15-16 = 3).
// 4. Mario rides on the bow with his scarf blowing.

// --- Tuning numbers (change these to make the game easier or harder) ---
const DIRIGIBILE = {
  ANELLI: 16,
  LANTERNE_PER_VINCERE: 10,
  STELLE_2: 13,
  STELLE_3: 15,
  OGNI: 3.0,                 // seconds between one ring appearing and the next
  DURATA_ANELLO: 4.5,        // seconds a ring stays before fading away
  TOLLERANZA: 55,            // how far sideways (pixels) from a ring's middle the airship can be and still collect it
  DISTANZA_ORIZZONTALE: 380, // a new ring is at least this far sideways from the previous one
  VELOCITA_NUVOLE: 140,      // how fast the dark clouds drift across the sky
  ALTEZZA_ANELLO_INIZIO: 190,
  ALTEZZA_ANELLO_FINE: 115,  // rings get smaller towards the end
  SALTO_MASSIMO: 260,        // max height difference between one ring and the next
  CADUTA: 90,                // how fast the airship sinks when Francesco doesn't crank (pixels per second)
  SPINTA_ELICA: 18,          // climbing speed for each unit of cranking speed
  STERZO: 1.3,               // how far the airship moves for each pixel Silvia's finger moves
  NUVOLE: 8,
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
    this.carica = 0;               // how much Francesco has turned since the last frame

    this.creaCielo();
    this.creaDirigibile();
    this.creaInterfaccia();
    this.preparaPercorso();

    this.input.on('pointerdown', (dito) => this.ditoGiu(dito));
    this.input.on('pointermove', (dito) => this.ditoMuove(dito));
    this.input.on('pointerup', (dito) => this.ditoSu(dito));
    this.input.on('pointerupoutside', (dito) => this.ditoSu(dito));

    this.cameras.main.fadeIn(400, 15, 26, 46);
    if (this.ritenta) {
      this.inizia();
    } else {
      mostraCartaInizio(this, TESTI.dirigibile, () => this.inizia());
    }
  }

  // ---------------------------------------------------------------- the scene

  creaCielo() {
    this.add.rectangle(0, 0, LARGHEZZA, ALTEZZA, 0x1b2a4a).setOrigin(0, 0);
    this.add.rectangle(0, 400, LARGHEZZA, 320, 0x24365c, 0.6).setOrigin(0, 0);
    for (let i = 0; i < 60; i++) {
      const stella = this.add.circle(Phaser.Math.Between(0, LARGHEZZA), Phaser.Math.Between(0, 450), Phaser.Math.FloatBetween(1, 2.5), 0xfdf3e1);
      this.tweens.add({ targets: stella, alpha: 0.2, duration: Phaser.Math.Between(800, 2000), yoyo: true, repeat: -1 });
    }
    // Forest treetops that scroll slowly
    if (!this.textures.exists('foresta')) {
      const g = this.make.graphics({ x: 0, y: 0 }, false);
      g.fillStyle(0x16302b, 1);
      for (let x = -20; x < 256; x += 40) g.fillTriangle(x, 120, x + 30, 10 + (x % 80 === 0 ? 0 : 25), x + 60, 120);
      g.generateTexture('foresta', 256, 120);
      g.destroy();
    }
    this.foresta = this.add.tileSprite(0, ALTEZZA - 120, LARGHEZZA, 120, 'foresta').setOrigin(0, 0).setDepth(2);
    aggiungiNeve(this);
  }

  creaDirigibile() {
    this.nave = this.add.container(400, 360).setDepth(10);
    this.elica = this.add.rectangle(-100, 0, 8, 50, 0x8b5a2b);
    this.nave.add([
      this.add.ellipse(0, -10, 190, 80, 0xe8d2b0).setStrokeStyle(4, 0x8b5a2b),          // balloon
      this.add.rectangle(0, -10, 190, 6, 0xc0392b),                                     // red stripe
      this.add.line(0, 0, -30, 25, -20, 45, 0x8b5a2b).setLineWidth(2),
      this.add.line(0, 0, 30, 25, 20, 45, 0x8b5a2b).setLineWidth(2),
      this.add.rectangle(0, 52, 80, 26, 0x8b5a2b),                                      // gondola
      this.add.circle(-95, 0, 6, 0x5c3a1a),
      this.elica,
    ]);
    // Mario on the bow
    const mario = this.add.image(58, 66, 'mario').setOrigin(0.5, 1);
    mario.setScale(52 / mario.height);
    this.nave.add(mario);
    // His scarf blowing in the wind
    this.sciarpa = this.add.rectangle(48, 38, 22, 6, 0xc0392b).setOrigin(1, 0.5);
    this.nave.add(this.sciarpa);
    this.tweens.add({ targets: this.sciarpa, angle: { from: -10, to: 15 }, duration: 250, yoyo: true, repeat: -1 });
  }

  creaInterfaccia() {
    this.testoLanterne = this.add.text(40, 40, '', {
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
    this.testoVento = this.add.text(LARGHEZZA / 2, 100, '', {
      fontFamily: FONT, fontSize: '34px', color: '#fdf3e1',
    }).setOrigin(0.5).setDepth(40);
  }

  aggiornaLanterne() {
    this.testoLanterne.setText(`🏮 ${this.lanterne} / ${DIRIGIBILE.LANTERNE_PER_VINCERE}`);
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
    if (latoDi(dito) === 'silvia') {
      this.ditaSilvia.set(dito.id, dito.x);
    } else if (!this.ditoFrancesco) {
      this.ditoFrancesco = { id: dito.id, punti: [{ x: dito.x, y: dito.y }], angolo: null };
    }
  }

  ditoMuove(dito) {
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

  inizia() {
    this.fase = 'volo';
    this.carica = 0; // how much Francesco has turned since the last frame
    Musica.suona(this, 'corsa');
    this.programmaRaffica();
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
    const cerchio = this.add.ellipse(0, 0, 46, voce.altezza).setStrokeStyle(8, 0xffd34d);
    const lanterna = this.add.text(0, 0, '🏮', { fontSize: '30px' }).setOrigin(0.5);
    anello.add([alone, cerchio, lanterna]);
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
    const nuvola = this.add.container(voce.verso > 0 ? -120 : LARGHEZZA + 120, voce.y).setDepth(9);
    [[-45, 8, 50], [0, -10, 60], [45, 6, 48], [10, 20, 55]].forEach(([x, y, r]) => {
      nuvola.add(this.add.circle(x, y, r, 0x4a5570, 0.95));
    });
    nuvola.add(this.add.text(0, 0, '❄', { fontFamily: 'sans-serif', fontSize: '28px', color: '#aab6cc' }).setOrigin(0.5));
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
    const istantaneo = this.carica / Math.max(secondi, 0.001);
    this.carica = 0;
    this.giri = Phaser.Math.Linear(this.giri, istantaneo, 1 - Math.exp(-secondi * 6));
    this.angoloManovella += this.giri * secondi;
    this.manovella.rotation = this.angoloManovella;
    this.manovella.setAlpha(this.giri > 1 ? 0.8 : 0.35);
    this.elica.scaleY = Math.cos(this.angoloManovella * 3);

    // Height: sinks on its own, climbs with the cranking
    const obiettivo = DIRIGIBILE.CADUTA - this.giri * DIRIGIBILE.SPINTA_ELICA;
    this.velocitaVerticale = Phaser.Math.Linear(this.velocitaVerticale, obiettivo, 1 - Math.exp(-secondi * 4));
    this.nave.y = Phaser.Math.Clamp(this.nave.y + this.velocitaVerticale * secondi, ALTO, BASSO);
    this.nave.angle = Phaser.Math.Clamp(this.velocitaVerticale / 20, -8, 8);

    // A gust of wind pushes the airship sideways
    this.nave.x = Phaser.Math.Clamp(this.nave.x + this.vento * secondi, 120, LARGHEZZA - 120);

    // The music follows the propeller
    Musica.tempo(100 + Phaser.Math.Clamp(this.giri / 12, 0, 1) * 60);

    // The airship reaches a ring: inside its oval (the middle of the airship)
    this.foresta.tilePositionX += 90 * secondi;
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
      targets: lanterna, x: this.nave.x, y: this.nave.y + 50, scale: 0.4, alpha: 0, duration: 400,
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
      const caduta = this.add.text(this.nave.x, this.nave.y + 50, '🏮', { fontSize: '28px' }).setOrigin(0.5).setDepth(20);
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
    salvaStelle(this, 'dirigibile', stelle);

    suonaCampanella(this);
    Musica.suona(this, 'neve');
    this.add.rectangle(0, 0, LARGHEZZA, ALTEZZA, COLORE_NOTTE, 0.75).setOrigin(0, 0).setDepth(50);
    this.add.text(LARGHEZZA / 2, 220, TESTI.comuni.bravissimi, {
      fontFamily: FONT, fontSize: '80px', color: '#ffe9a8',
    }).setOrigin(0.5).setDepth(51);
    this.add.text(LARGHEZZA / 2, 350, '★'.repeat(stelle) + '☆'.repeat(3 - stelle), {
      fontFamily: 'sans-serif', fontSize: '90px', color: '#ffd34d',
    }).setOrigin(0.5).setDepth(51);
    const continua = this.add.text(LARGHEZZA / 2, 520, TESTI.comuni.toccaPerContinuare, {
      fontFamily: FONT, fontSize: '36px', color: '#fdf3e1',
    }).setOrigin(0.5).setDepth(51);
    this.tweens.add({ targets: continua, alpha: 0.4, duration: 800, yoyo: true, repeat: -1 });
    this.time.delayedCall(1000, () => {
      this.input.once('pointerup', () => {
        this.cameras.main.fadeOut(600, 15, 26, 46);
        this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Cerimonia'));
      });
    });
  }

  // ---------------------------------------------------------------- every frame

  update(tempo, delta) {
    if (this.fase !== 'volo') return;
    this.aggiornaVolo(Math.min(delta, 50) / 1000);
  }
}
