// Title screen.
// Shows the snowy village with Silvia (left), Francesco (right) and Mario by the tree,
// the title and falling snow.
// The game starts only when Silvia (left half) and Francesco (right half) touch together:
// each character lights up while their player touches; once both are touching,
// lifting the fingers plays a chime and moves on.
// (Starting on lift, not on touch, is on purpose: iPhone only allows sound to start when a finger is lifted.)

class Titolo extends Phaser.Scene {
  constructor() {
    super('Titolo');
  }

  preload() {
    this.load.image('sfondo_titolo', 'assets/game/style_anchor.jpg');
    this.load.image('silvia', 'assets/game/silvia_sheet.png');
    this.load.image('francesco', 'assets/game/francesco_sheet.png');
    this.load.image('mario', 'assets/game/mario_sheet.png');
  }

  create() {
    this.iniziato = false; // becomes true once the game is starting, so it only starts once
    this.pronti = false;   // becomes true once both players have touched at the same time
    this.dita = new Map(); // fingers currently on the screen: finger id -> 'silvia' or 'francesco'

    // Background: the snowy village
    this.add.image(LARGHEZZA / 2, ALTEZZA / 2, 'sfondo_titolo');

    // Title in the calm sky, gently floating
    const titolo = this.add.text(LARGHEZZA / 2, 105, TESTI.titolo.nome, {
      fontFamily: FONT,
      fontSize: '76px',
      color: '#fdf3e1',
      stroke: '#2a3d66',
      strokeThickness: 8,
    }).setOrigin(0.5);
    titolo.setShadow(0, 4, 'rgba(15, 26, 46, 0.6)', 12, true, true);
    this.tweens.add({
      targets: titolo,
      y: 115,
      duration: 2500,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });

    // The characters, standing in the snow
    // (x, y = where their feet are; altezza = how tall they look on screen)
    this.mario = this.creaPersonaggio('mario', 790, 612, 130, null);
    // Heights agreed with Adri on the iPhone: Silvia 310 / Francesco 330 (350 for Silvia looked too tall)
    this.silvia = this.creaPersonaggio('silvia', 290, 705, 310, COLORE_SILVIA);
    this.francesco = this.creaPersonaggio('francesco', 990, 705, 330, COLORE_FRANCESCO);

    // "Tocca per iniziare" on a soft dark band so it's easy to read on the white snow
    const banda = this.add.graphics();
    banda.fillStyle(COLORE_NOTTE, 0.45);
    banda.fillRoundedRect(LARGHEZZA / 2 - 230, 638, 460, 60, 30);
    banda.setDepth(30);
    this.invito = this.add.text(LARGHEZZA / 2, 668, TESTI.titolo.toccaPerIniziare, {
      fontFamily: FONT,
      fontSize: '38px',
      color: '#fdf3e1',
    }).setOrigin(0.5).setDepth(31);
    this.tweens.add({
      targets: this.invito,
      alpha: 0.4,
      duration: 900,
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });

    aggiungiNeve(this);

    this.input.on('pointerdown', (dito) => this.ditoGiu(dito));
    this.input.on('pointerup', (dito) => this.ditoSu(dito));
    this.input.on('pointerupoutside', (dito) => this.ditoSu(dito));

    // Gentle fade in
    this.cameras.main.fadeIn(600, 15, 26, 46);
  }

  // Places a character with their feet at (x, y), a soft shadow under them,
  // an optional coloured glow (shown while their player touches), and a slow "breathing" animation.
  creaPersonaggio(chiave, x, y, altezza, coloreAlone) {
    const immagine = this.add.image(x, y, chiave).setOrigin(0.5, 1);
    const scala = altezza / immagine.height;
    immagine.setScale(scala);
    immagine.setDepth(20);
    immagine.scalaBase = scala;

    // Soft shadow on the snow
    this.add.ellipse(x, y - 4, immagine.displayWidth * 0.7, 22, COLORE_NOTTE, 0.22).setDepth(19);

    // Coloured glow under the feet, invisible until the player touches
    if (coloreAlone !== null) {
      immagine.alone = this.add.ellipse(x, y - 6, immagine.displayWidth * 1.1, 50, coloreAlone, 1)
        .setAlpha(0)
        .setDepth(18);
    }

    // Breathing: a tiny slow stretch, slightly different speed for each character
    this.tweens.add({
      targets: immagine,
      scaleY: scala * 1.025,
      duration: 1400 + Phaser.Math.Between(0, 500),
      ease: 'Sine.InOut',
      yoyo: true,
      repeat: -1,
    });
    return immagine;
  }

  ditoGiu(dito) {
    if (this.iniziato) return;
    this.dita.set(dito.id, latoDi(dito));
    this.aggiornaPersonaggi();
  }

  ditoSu(dito) {
    if (this.iniziato) return;
    this.dita.delete(dito.id);
    // Both players touched together, and now a finger is lifted: start!
    if (this.pronti) {
      this.inizia();
      return;
    }
    this.aggiornaPersonaggi();
  }

  // Light up each character while their player touches; remember when both touch together
  aggiornaPersonaggi() {
    const lati = new Set(this.dita.values());
    const silvia = lati.has('silvia');
    const francesco = lati.has('francesco');
    this.illumina(this.silvia, silvia);
    this.illumina(this.francesco, francesco);
    if (silvia && francesco && !this.pronti) {
      this.pronti = true;
      this.invito.setText(TESTI.titolo.insieme);
      this.saltello(this.mario); // Mario is happy too
    }
  }

  illumina(personaggio, acceso) {
    if (personaggio.acceso === acceso) return;
    personaggio.acceso = acceso;
    this.tweens.add({
      targets: personaggio.alone,
      alpha: acceso ? 0.65 : 0,
      duration: 150,
    });
    if (acceso) {
      this.saltello(personaggio);
    }
  }

  // A small happy hop (always from the feet position, so quick repeated hops never drift upwards)
  saltello(personaggio) {
    if (personaggio.yBase === undefined) personaggio.yBase = personaggio.y;
    this.tweens.add({
      targets: personaggio,
      y: { from: personaggio.yBase, to: personaggio.yBase - 18 },
      duration: 140,
      ease: 'Quad.Out',
      yoyo: true,
    });
  }

  inizia() {
    this.iniziato = true;
    suonaCampanella(this);
    this.illumina(this.silvia, true);
    this.illumina(this.francesco, true);
    this.cameras.main.fadeOut(900, 15, 26, 46);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // For now the next screen is the touch test; later it will be the intro
      this.scene.start('ProvaTocco');
    });
  }
}
