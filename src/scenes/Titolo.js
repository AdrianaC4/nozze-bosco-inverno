// Title screen.
// Shows the snowy village, the title and falling snow (no characters: they appear in the story intro).
// The game starts only when Silvia (left half) and Francesco (right half) touch together:
// each finger makes a soft glow in that player's colour; once both are touching,
// lifting the fingers plays a chime and moves on.
// (Starting on lift, not on touch, is on purpose: iPhone only allows sound to start when a finger is lifted.)

class Titolo extends Phaser.Scene {
  constructor() {
    super('Titolo');
  }

  preload() {
    carica(this, 'sfondo_titolo', 'assets/game/style_anchor.jpg');
  }

  create() {
    this.iniziato = false; // becomes true once the game is starting, so it only starts once
    this.pronti = false;   // becomes true once both players have touched at the same time
    this.dita = new Map(); // fingers on the screen: finger id -> { lato, bagliore }

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
    this.input.on('pointermove', (dito) => this.ditoMuove(dito));
    this.input.on('pointerup', (dito) => this.ditoSu(dito));
    this.input.on('pointerupoutside', (dito) => this.ditoSu(dito));

    // Coming back after the ending ("Gioca ancora"): back to the dreamy waltz
    if (Musica.brano) Musica.suona(this, 'neve');

    // Gentle fade in
    this.cameras.main.fadeIn(600, 15, 26, 46);
  }

  ditoGiu(dito) {
    if (this.iniziato) return;
    const lato = latoDi(dito);
    // A soft glow under the finger, in that player's colour
    const bagliore = this.add.image(dito.x, dito.y, creaBagliore(this))
      .setTint(lato === 'silvia' ? COLORE_SILVIA : COLORE_FRANCESCO)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(20)
      .setScale(0.3);
    this.tweens.add({ targets: bagliore, scale: 1, duration: 200, ease: 'Back.Out' });
    this.dita.set(dito.id, { lato, bagliore });
    this.controllaInsieme();
  }

  ditoMuove(dito) {
    const info = this.dita.get(dito.id);
    if (info) info.bagliore.setPosition(dito.x, dito.y);
  }

  ditoSu(dito) {
    if (this.iniziato) return;
    const info = this.dita.get(dito.id);
    if (info) {
      this.dita.delete(dito.id);
      this.tweens.add({ targets: info.bagliore, alpha: 0, duration: 250, onComplete: () => info.bagliore.destroy() });
    }
    // Both players touched together, and now a finger is lifted: start!
    if (this.pronti) this.inizia();
  }

  // Remember when both players touch at the same time
  controllaInsieme() {
    const lati = new Set([...this.dita.values()].map((info) => info.lato));
    if (lati.has('silvia') && lati.has('francesco') && !this.pronti) {
      this.pronti = true;
      this.invito.setText(TESTI.titolo.insieme);
    }
  }

  inizia() {
    this.iniziato = true;
    suonaCampanella(this);
    Musica.suona(this, 'neve'); // the dreamy waltz starts here (sound is allowed now, after the touch)
    this.cameras.main.fadeOut(900, 15, 26, 46);
    this.cameras.main.once('camerafadeoutcomplete', () => {
      // Next: the story intro, which then leads to mini game 1
      this.scene.start('Intro');
    });
  }
}
