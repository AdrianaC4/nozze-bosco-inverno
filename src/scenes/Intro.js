// Story intro: 4 short scenes between the title and mini game 1.
// 1. The village with the lanterns lit: Silvia and Francesco are getting married soon.
// 2. A sudden gust of wind: the lanterns go out, the gifts, cake, rings and lights fly away. "Oops" poses.
// 3. Mario appears as a glowing forest spirit, looking guilty: "Miao! Prometto che non è colpa mia"
// 4. Mario cheers up: "Miao! Seguitemi, vi aiuto io!"
// The text is written letter by letter. A tap (either player) shows the whole sentence;
// the next tap moves on. These taps are like a menu, so they don't count in the gesture rule.

class Intro extends Phaser.Scene {
  constructor() {
    super('Intro');
  }

  preload() {
    carica(this, 'sfondo_titolo', 'assets/game/style_anchor.jpg');
    carica(this, 'sfondo_acceso', 'assets/game/style_anchor_lit.jpg');
    carica(this, 'silvia', 'assets/game/silvia_sheet.png');
    carica(this, 'silvia_oops', 'assets/game/silvia_oops.png');
    carica(this, 'francesco', 'assets/game/francesco_sheet.png');
    carica(this, 'francesco_oops', 'assets/game/francesco_oops.png');
    caricaMario(this);
  }

  create() {
    this.pannello = 0;        // which of the 3 scenes we are on
    this.occupato = true;     // true during transitions, so quick taps don't skip anything
    this.scrittura = null;    // the letter-by-letter writing in progress

    // Two backgrounds on top of each other: lit (on top) and unlit (below).
    // In scene 2 the lit one fades away, so the lanterns "go out".
    this.add.image(LARGHEZZA / 2, ALTEZZA / 2, 'sfondo_titolo');
    this.sfondoAcceso = this.add.image(LARGHEZZA / 2, ALTEZZA / 2, 'sfondo_acceso');

    this.silvia = this.creaPersonaggio('silvia', 430, 595, 280);
    this.francesco = this.creaPersonaggio('francesco', 850, 595, 298);

    // Text band at the bottom
    this.add.rectangle(LARGHEZZA / 2, 655, LARGHEZZA - 80, 112, COLORE_NOTTE, 0.72).setDepth(40);
    this.testo = this.add.text(LARGHEZZA / 2, 655, '', {
      fontFamily: FONT, fontSize: '32px', color: '#fdf3e1', align: 'center', wordWrap: { width: LARGHEZZA - 160 },
    }).setOrigin(0.5).setDepth(41);
    this.continua = this.add.text(LARGHEZZA - 60, 700, TESTI.comuni.toccaPerContinuare + ' ›', {
      fontFamily: FONT, fontSize: '20px', color: '#ffe9a8',
    }).setOrigin(1, 1).setDepth(41).setAlpha(0);
    this.tweens.add({ targets: this.continua, scale: 1.05, duration: 700, yoyo: true, repeat: -1 });

    aggiungiNeve(this);

    this.input.on('pointerup', () => this.tocco());
    this.cameras.main.fadeIn(700, 15, 26, 46);
    this.mostraPannello1();
  }

  creaPersonaggio(chiave, x, y, altezza) {
    const immagine = this.add.image(x, y, chiave).setOrigin(0.5, 1).setDepth(20);
    immagine.altezza = altezza;
    immagine.setScale(altezza / immagine.height);
    this.tweens.add({
      targets: immagine,
      scaleY: immagine.scaleY * 1.025,
      duration: 1400 + Phaser.Math.Between(0, 400),
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });
    return immagine;
  }

  // Changes a character's picture (e.g. to the "oops" pose) keeping the same height
  cambiaPosa(personaggio, chiave) {
    this.tweens.killTweensOf(personaggio);
    personaggio.setTexture(chiave);
    const scala = personaggio.altezza / personaggio.height;
    personaggio.setScale(scala);
    this.tweens.add({ targets: personaggio, scaleY: scala * 1.025, duration: 1400, ease: 'Sine.InOut', yoyo: true, repeat: -1 });
  }

  // ---------------------------------------------------------------- the 3 scenes

  mostraPannello1() {
    this.pannello = 1;
    // Little hearts floating up between the two of them
    this.cuori = this.time.addEvent({
      delay: 650,
      loop: true,
      callback: () => {
        const cuore = this.add.text(640 + Phaser.Math.Between(-40, 40), 360, '♥', {
          fontFamily: 'sans-serif', fontSize: `${Phaser.Math.Between(26, 40)}px`, color: '#e8798f',
        }).setOrigin(0.5).setDepth(25);
        this.tweens.add({
          targets: cuore, y: 200, x: cuore.x + Phaser.Math.Between(-30, 30), alpha: { from: 1, to: 0 },
          duration: 1800, onComplete: () => cuore.destroy(),
        });
      },
    });
    this.scrivi(TESTI.intro.pannello1);
  }

  mostraPannello2() {
    this.pannello = 2;
    this.cuori.remove();
    suonaVento(this);
    this.cameras.main.shake(500, 0.006);

    // The lanterns go out
    this.tweens.add({ targets: this.sfondoAcceso, alpha: 0, duration: 900, delay: 300 });

    // A gust of snow blowing sideways
    const raffica = this.add.particles(0, 0, 'fiocco', {
      x: -20,
      y: { min: 0, max: ALTEZZA },
      speedX: { min: 500, max: 900 },
      speedY: { min: -40, max: 80 },
      scale: { min: 0.3, max: 1 },
      alpha: { min: 0.5, max: 0.9 },
      lifespan: 2500,
      frequency: 12,
    }).setDepth(45);
    this.time.delayedCall(1800, () => raffica.stop());

    // Everything for the wedding flies away to the right
    this.volaVia(this.creaRegalo(560, 470), 0);
    this.volaVia(this.creaTorta(700, 480), 150);
    this.volaVia(this.creaAnelli(620, 400), 300);
    for (let i = 0; i < 5; i++) {
      this.volaVia(this.add.circle(500 + i * 60, 300 + (i % 2) * 40, 12, 0xffd34d).setDepth(30), 200 + i * 80);
    }

    this.cambiaPosa(this.silvia, 'silvia_oops');
    this.cambiaPosa(this.francesco, 'francesco_oops');
    this.scrivi(TESTI.intro.pannello2);
  }

  mostraPannello3() {
    this.pannello = 3;
    this.cambiaPosa(this.silvia, 'silvia');
    this.cambiaPosa(this.francesco, 'francesco');

    // Mario appears between them as a glowing forest spirit
    // Warm golden glow behind him, soft at the edges ("ADD" makes it look like light)
    const alone = this.add.image(640, 515, creaBagliore(this)).setDepth(21).setScale(0)
      .setBlendMode(Phaser.BlendModes.ADD);
    // He starts with his guilty face (he may have played with the rings...)
    const mario = this.add.image(640, 600, 'mario_colpevole').setOrigin(0.5, 1).setDepth(22);
    this.mario = mario;
    const scala = 170 / mario.height;
    mario.setScale(0);
    this.tweens.add({ targets: mario, scale: scala, duration: 500, ease: 'Back.Out' });
    this.tweens.add({ targets: alone, scale: 1.3, duration: 500, ease: 'Back.Out' });
    this.tweens.add({ targets: alone, alpha: 0.6, scale: 1.45, duration: 1200, delay: 500, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    // A few sparkles
    for (let i = 0; i < 10; i++) {
      const scintilla = this.add.text(640, 510, '✦', { fontFamily: 'sans-serif', fontSize: '22px', color: '#ffe9a8' })
        .setOrigin(0.5).setDepth(23);
      const angolo = (Math.PI * 2 * i) / 10;
      this.tweens.add({
        targets: scintilla, x: 640 + Math.cos(angolo) * 150, y: 510 + Math.sin(angolo) * 110, alpha: 0,
        duration: 900, ease: 'Quad.Out', onComplete: () => scintilla.destroy(),
      });
    }
    suonaMiao(this);
    this.scrivi(TESTI.intro.pannello3);
  }

  mostraPannello4() {
    this.pannello = 4;
    // Mario cheers up: back to his normal face, with a little happy hop
    this.mario.setTexture('mario');
    const scala = 170 / this.mario.height;
    this.mario.setScale(scala);
    this.tweens.add({ targets: this.mario, y: { from: 600, to: 575 }, duration: 160, ease: 'Quad.Out', yoyo: true });
    suonaMiao(this);
    this.scrivi(TESTI.intro.pannello4);
  }

  // Simple shapes for the things blown away (placeholders until the real art)
  creaRegalo(x, y) {
    const c = this.add.container(x, y).setDepth(30);
    c.add([this.add.rectangle(0, 0, 50, 50, 0xc0392b), this.add.rectangle(0, 0, 10, 50, 0xffe9a8), this.add.rectangle(0, 0, 50, 10, 0xffe9a8)]);
    return c;
  }

  creaTorta(x, y) {
    const c = this.add.container(x, y).setDepth(30);
    c.add([
      this.add.rectangle(0, 20, 80, 26, 0xfdf3e1).setStrokeStyle(3, 0xe8c4c4),
      this.add.rectangle(0, -4, 60, 24, 0xfdf3e1).setStrokeStyle(3, 0xe8c4c4),
      this.add.rectangle(0, -26, 40, 22, 0xfdf3e1).setStrokeStyle(3, 0xe8c4c4),
    ]);
    return c;
  }

  creaAnelli(x, y) {
    const c = this.add.container(x, y).setDepth(30);
    c.add([
      this.add.circle(-10, 0, 16).setStrokeStyle(5, 0xffc94d),
      this.add.circle(10, 0, 16).setStrokeStyle(5, 0xffc94d),
    ]);
    return c;
  }

  volaVia(oggetto, ritardo) {
    this.tweens.add({
      targets: oggetto,
      x: LARGHEZZA + 150,
      y: oggetto.y - Phaser.Math.Between(80, 250),
      angle: Phaser.Math.Between(180, 540),
      duration: 1400,
      delay: ritardo,
      ease: 'Quad.In',
      onComplete: () => oggetto.destroy(),
    });
  }

  // ---------------------------------------------------------------- text and taps

  // Writes a sentence letter by letter
  scrivi(frase) {
    this.occupato = true;
    this.continua.setAlpha(0);
    const lettere = Array.from(frase);
    let quante = 0;
    this.testo.setText('');
    this.fraseCompleta = frase;
    this.scrittura = this.time.addEvent({
      delay: 35,
      repeat: lettere.length - 1,
      callback: () => {
        quante += 1;
        this.testo.setText(lettere.slice(0, quante).join(''));
        if (quante === lettere.length) this.fineScrittura();
      },
    });
    // Ignore taps for a moment so a tap from the previous scene doesn't skip this one
    this.time.delayedCall(400, () => { this.occupato = false; });
  }

  fineScrittura() {
    this.scrittura = null;
    this.testo.setText(this.fraseCompleta);
    this.continua.setAlpha(1);
  }

  tocco() {
    Musica.suona(this, 'neve'); // already playing if we came from the title; starts it otherwise
    if (this.occupato) return;
    // First tap: show the whole sentence at once
    if (this.scrittura) {
      this.scrittura.remove();
      this.fineScrittura();
      return;
    }
    // Next tap: next scene
    if (this.pannello === 1) this.mostraPannello2();
    else if (this.pannello === 2) this.mostraPannello3();
    else if (this.pannello === 3) this.mostraPannello4();
    else if (this.pannello === 4) this.fine();
  }

  fine() {
    this.occupato = true;
    this.pannello = 0;
    // The adventure begins: bell chime (it plays only here, at the title start, and when a mini game is won)
    suonaCampanella(this);
    Salvataggio.segnaRaggiunto('Slitta');
    this.cameras.main.fadeOut(700, 15, 26, 46);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Slitta'));
  }
}
