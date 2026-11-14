// Step 1 test scene ("touch test").
// The screen is split in two: left half = Silvia, right half = Francesco.
// Every finger on the screen gets a glowing circle in that player's colour.
// When both halves are touched at the same time, "Insieme!" appears in the middle:
// this proves the iPhone handles both players at once (multi-touch).
// Shared numbers and colours (LARGHEZZA, META, COLORE_SILVIA...) live in src/costanti.js.

class ProvaTocco extends Phaser.Scene {
  constructor() {
    super('ProvaTocco');
  }

  create() {
    // Two background halves in slightly different snowy blues
    this.add.rectangle(0, 0, META, ALTEZZA, 0x2a3d66).setOrigin(0, 0);
    this.add.rectangle(META, 0, META, ALTEZZA, 0x24365c).setOrigin(0, 0);
    // Thin dividing line in the middle
    this.add.rectangle(META, 0, 4, ALTEZZA, COLORE_CREMA, 0.35).setOrigin(0.5, 0);

    const stileNome = { fontFamily: FONT, fontSize: '56px', color: '#fdf3e1' };
    const stileAiuto = { fontFamily: FONT, fontSize: '32px', color: '#fdf3e1' };

    // Player names and "Tocca qui" on each half
    this.add.text(META / 2, 120, TESTI.provaTocco.silvia, stileNome).setOrigin(0.5);
    this.add.text(META / 2, 600, TESTI.provaTocco.toccaQui, stileAiuto).setOrigin(0.5).setAlpha(0.7);
    this.add.text(META + META / 2, 120, TESTI.provaTocco.francesco, stileNome).setOrigin(0.5);
    this.add.text(META + META / 2, 600, TESTI.provaTocco.toccaQui, stileAiuto).setOrigin(0.5).setAlpha(0.7);

    // "Insieme!" in the middle, hidden until both players touch at once
    this.testoInsieme = this.add.text(META, ALTEZZA / 2, TESTI.provaTocco.insieme, {
      fontFamily: FONT,
      fontSize: '72px',
      color: '#ffe9a8',
      stroke: '#0f1a2e',
      strokeThickness: 8,
    }).setOrigin(0.5).setDepth(10).setVisible(false);

    // One circle per finger currently on the screen, remembered by the finger's id
    this.cerchi = new Map();

    this.input.on('pointerdown', (dito) => this.ditoGiu(dito));
    this.input.on('pointermove', (dito) => this.ditoMuove(dito));
    this.input.on('pointerup', (dito) => this.ditoSu(dito));
    this.input.on('pointerupoutside', (dito) => this.ditoSu(dito));

    this.cameras.main.fadeIn(600, 15, 26, 46);
  }

  ditoGiu(dito) {
    // The side is decided where the finger first touches, and stays the same while dragging
    const lato = latoDi(dito);
    const colore = lato === 'silvia' ? COLORE_SILVIA : COLORE_FRANCESCO;

    const cerchio = this.add.circle(dito.x, dito.y, 60, colore, 0.85);
    cerchio.setStrokeStyle(6, COLORE_CREMA, 0.9);
    cerchio.lato = lato;

    // Small "pop" animation when the finger lands
    cerchio.setScale(0.3);
    this.tweens.add({ targets: cerchio, scale: 1, duration: 180, ease: 'Back.Out' });

    this.cerchi.set(dito.id, cerchio);
    this.aggiornaInsieme();
  }

  ditoMuove(dito) {
    const cerchio = this.cerchi.get(dito.id);
    if (cerchio) {
      cerchio.setPosition(dito.x, dito.y);
    }
  }

  ditoSu(dito) {
    const cerchio = this.cerchi.get(dito.id);
    if (cerchio) {
      this.cerchi.delete(dito.id);
      // Fade out instead of disappearing suddenly
      this.tweens.add({
        targets: cerchio,
        alpha: 0,
        scale: 0.5,
        duration: 200,
        onComplete: () => cerchio.destroy(),
      });
    }
    this.aggiornaInsieme();
  }

  // Shows "Insieme!" only while at least one finger is on each half
  aggiornaInsieme() {
    let silvia = false;
    let francesco = false;
    for (const cerchio of this.cerchi.values()) {
      if (cerchio.lato === 'silvia') silvia = true;
      if (cerchio.lato === 'francesco') francesco = true;
    }
    const insieme = silvia && francesco;
    if (insieme && !this.testoInsieme.visible) {
      this.testoInsieme.setVisible(true).setScale(0.5);
      this.tweens.add({ targets: this.testoInsieme, scale: 1, duration: 250, ease: 'Back.Out' });
    } else if (!insieme) {
      this.testoInsieme.setVisible(false);
    }
  }
}
