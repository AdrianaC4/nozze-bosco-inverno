// Title screen.
// Shows the snowy village, the title and falling snow.
// The game starts only when Silvia (left half) and Francesco (right half) touch together:
// once both are touching, lifting the fingers plays a chime and moves on.
// (Starting on lift, not on touch, is on purpose: iPhone only allows sound to start when a finger is lifted.)

class Titolo extends Phaser.Scene {
  constructor() {
    super('Titolo');
  }

  preload() {
    this.load.image('sfondo_titolo', 'assets/game/style_anchor.jpg');
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

    // One glowing circle per player, bottom left and bottom right
    this.cerchioSilvia = this.creaCerchio(170, 600, COLORE_SILVIA, TESTI.titolo.silvia);
    this.cerchioFrancesco = this.creaCerchio(LARGHEZZA - 170, 600, COLORE_FRANCESCO, TESTI.titolo.francesco);

    // "Tocca per iniziare", gently pulsing (both players must still touch together to start)
    this.invito = this.add.text(LARGHEZZA / 2, 640, TESTI.titolo.toccaPerIniziare, {
      fontFamily: FONT,
      fontSize: '40px',
      color: '#fdf3e1',
      stroke: '#2a3d66',
      strokeThickness: 6,
    }).setOrigin(0.5);
    this.tweens.add({
      targets: this.invito,
      alpha: 0.45,
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

  // A soft circle with the player's name, dim until that player touches their half
  creaCerchio(x, y, colore, nome) {
    const gruppo = this.add.container(x, y);
    const alone = this.add.circle(0, 0, 78, colore, 0.25);
    const cerchio = this.add.circle(0, 0, 58, colore, 0.9);
    cerchio.setStrokeStyle(5, COLORE_CREMA, 0.9);
    const testo = this.add.text(0, 0, nome, {
      fontFamily: FONT,
      fontSize: '22px',
      color: '#fdf3e1',
      stroke: '#0f1a2e',
      strokeThickness: 4,
    }).setOrigin(0.5);
    gruppo.add([alone, cerchio, testo]);
    gruppo.setAlpha(0.45);
    gruppo.setDepth(20);
    gruppo.alone = alone;
    return gruppo;
  }

  ditoGiu(dito) {
    if (this.iniziato) return;
    this.dita.set(dito.id, latoDi(dito));
    this.aggiornaCerchi();
  }

  ditoSu(dito) {
    if (this.iniziato) return;
    this.dita.delete(dito.id);
    // Both players touched together, and now a finger is lifted: start!
    if (this.pronti) {
      this.inizia();
      return;
    }
    this.aggiornaCerchi();
  }

  // Light up each player's circle while they touch; remember when both touch together
  aggiornaCerchi() {
    const lati = new Set(this.dita.values());
    const silvia = lati.has('silvia');
    const francesco = lati.has('francesco');
    this.illumina(this.cerchioSilvia, silvia);
    this.illumina(this.cerchioFrancesco, francesco);
    if (silvia && francesco && !this.pronti) {
      this.pronti = true;
      this.invito.setText(TESTI.titolo.insieme);
    }
  }

  illumina(cerchio, acceso) {
    this.tweens.killTweensOf(cerchio);
    this.tweens.add({
      targets: cerchio,
      alpha: acceso ? 1 : 0.45,
      scale: acceso ? 1.15 : 1,
      duration: 150,
      ease: 'Back.Out',
    });
  }

  inizia() {
    this.iniziato = true;
    suonaCampanella(this);
    this.illumina(this.cerchioSilvia, true);
    this.illumina(this.cerchioFrancesco, true);
    this.cameras.main.fadeOut(900, 15, 26, 46);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // For now the next screen is the touch test; later it will be the intro
      this.scene.start('ProvaTocco');
    });
  }
}
