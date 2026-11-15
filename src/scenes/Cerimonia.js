// Finale: La Cerimonia.
// 1. Start card: Mario must be petted three times (each time a new pose and line).
// 2. Both players press and hold their half at the same time: the lit village appears from the
//    bottom up, until the great tree is fully lit. If either lets go, the lights flicker and slip
//    down a little. You can't lose: it just takes longer. The music is loud while both hold.
// 3. The wedding: thicker snow, bells, Mario brings the rings, Silvia and Francesco come together,
//    a big heart rises.
// 4. Ending: "Appena Sposati! Silvia & Francesco - Buon Natale", total stars, "Gioca ancora".

const CERIMONIA = {
  SECONDI_PER_ACCENDERE: 8,   // seconds of holding together to light the whole tree
  SCIVOLA: 0.06,              // how much light slips down per second when they are not both holding
};

class Cerimonia extends Phaser.Scene {
  constructor() {
    super('Cerimonia');
  }

  preload() {
    carica(this, 'sfondo_titolo', 'assets/game/style_anchor.jpg');
    carica(this, 'sfondo_acceso', 'assets/game/style_anchor_lit.jpg');
    carica(this, 'silvia', 'assets/game/silvia_sheet.png');
    carica(this, 'silvia_cheer', 'assets/game/silvia_cheer.png');
    carica(this, 'francesco', 'assets/game/francesco_sheet.png');
    carica(this, 'francesco_cheer', 'assets/game/francesco_cheer.png');
    carica(this, 'mario_anelli', 'assets/game/mario_rings.png');
    carica(this, 'cartolina', 'assets/game/ending_scene.jpg');
    caricaMario(this);
  }

  create() {
    this.fase = 'carta';          // 'carta' -> 'accendi' -> 'matrimonio' -> 'fine'
    this.luce = 0;                // 0 = all dark, 1 = the whole scene is lit
    this.dita = new Map();        // finger id -> { lato, bagliore }

    // Before: the unlit village under a dark night veil.
    // After: the lit village with a warm golden glow, visible only below the "light line".
    this.add.image(LARGHEZZA / 2, ALTEZZA / 2, 'sfondo_titolo');
    this.add.rectangle(0, 0, LARGHEZZA, ALTEZZA, COLORE_NOTTE, 0.62).setOrigin(0, 0);
    this.sfondoAcceso = this.add.image(LARGHEZZA / 2, ALTEZZA / 2, 'sfondo_acceso');
    this.formaLuce = this.make.graphics({ x: 0, y: 0 }, false);
    const maschera = this.formaLuce.createGeometryMask();
    this.sfondoAcceso.setMask(maschera);
    this.calore = this.add.rectangle(0, 0, LARGHEZZA, ALTEZZA, 0xffb347, 0.16)
      .setOrigin(0, 0).setBlendMode(Phaser.BlendModes.ADD).setMask(maschera);

    this.neve = aggiungiNeve(this);

    // The bright line where the light has reached, with golden sparkles rising from it
    this.lineaLuce = this.add.image(LARGHEZZA / 2, ALTEZZA, creaBagliore(this))
      .setDisplaySize(LARGHEZZA * 1.3, 150)
      .setBlendMode(Phaser.BlendModes.ADD)
      .setDepth(15)
      .setAlpha(0);
    this.scintille = this.add.particles(0, ALTEZZA, 'fiocco', {
      x: { min: 0, max: LARGHEZZA },
      speedY: { min: -150, max: -40 },
      speedX: { min: -25, max: 25 },
      scale: { start: 1, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xffe08a, 0xffc14d, 0xfff4c2],
      blendMode: 'ADD',
      lifespan: 1400,
      frequency: 20,
      emitting: false,
    }).setDepth(16);

    this.silvia = this.creaPersonaggio('silvia', 330, 690, 280);
    this.francesco = this.creaPersonaggio('francesco', 950, 690, 298);

    this.suggerimento = this.add.text(LARGHEZZA / 2, 60, TESTI.cerimonia.tenete, {
      fontFamily: FONT, fontSize: '40px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 7,
    }).setOrigin(0.5).setDepth(40).setAlpha(0);
    this.tweens.add({ targets: this.suggerimento, scale: 1.06, duration: 700, yoyo: true, repeat: -1 });

    this.input.on('pointerdown', (dito) => this.ditoGiu(dito));
    this.input.on('pointermove', (dito) => this.ditoMuove(dito));
    this.input.on('pointerup', (dito) => this.ditoSu(dito));
    this.input.on('pointerupoutside', (dito) => this.ditoSu(dito));

    this.disegnaLuce();
    this.cameras.main.fadeIn(600, 15, 26, 46);
    // The tender ceremony music starts softly already on the card
    // (if sound is not allowed yet, the first stroke on Mario starts it: see iniziaAccensione)
    Musica.suona(this, 'cerimonia');
    Musica.volume(0.6);
    mostraCartaCarezze(this, TESTI.cerimonia.nome, [
      { posa: 'mario', frase: TESTI.cerimonia.carezza1 },
      { posa: 'mario_felice', frase: TESTI.cerimonia.carezza2 },
      { posa: 'mario_colpevole', frase: TESTI.cerimonia.carezza3 },
    ], () => this.iniziaAccensione());
  }

  creaPersonaggio(chiave, x, y, altezza) {
    const immagine = this.add.image(x, y, chiave).setOrigin(0.5, 1).setDepth(20);
    immagine.altezza = altezza;
    immagine.setScale(altezza / immagine.height);
    this.respira(immagine);
    return immagine;
  }

  respira(immagine) {
    const scala = immagine.altezza / immagine.height;
    immagine.setScale(scala);
    immagine.respiro = this.tweens.add({
      targets: immagine, scaleY: scala * 1.025, duration: 1400 + Phaser.Math.Between(0, 400),
      ease: 'Sine.InOut', yoyo: true, repeat: -1,
    });
  }

  cambiaPosa(immagine, chiave) {
    if (immagine.respiro) immagine.respiro.stop();
    immagine.setTexture(chiave);
    this.respira(immagine);
  }

  // ---------------------------------------------------------------- touch (Hold + Hold)

  ditoGiu(dito) {
    if (this.fase !== 'accendi') return;
    const lato = latoDi(dito);
    const bagliore = this.add.image(dito.x, dito.y, creaBagliore(this))
      .setTint(lato === 'silvia' ? COLORE_SILVIA : COLORE_FRANCESCO)
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(30).setScale(0.3);
    this.tweens.add({ targets: bagliore, scale: 0.9, duration: 200, ease: 'Back.Out' });
    this.dita.set(dito.id, { lato, bagliore });
  }

  ditoMuove(dito) {
    const info = this.dita.get(dito.id);
    if (info) info.bagliore.setPosition(dito.x, dito.y);
  }

  ditoSu(dito) {
    const info = this.dita.get(dito.id);
    if (!info) return;
    this.dita.delete(dito.id);
    this.tweens.add({ targets: info.bagliore, alpha: 0, duration: 250, onComplete: () => info.bagliore.destroy() });
  }

  entrambiPremono() {
    const lati = new Set([...this.dita.values()].map((info) => info.lato));
    return lati.has('silvia') && lati.has('francesco');
  }

  // ---------------------------------------------------------------- lighting the tree

  iniziaAccensione() {
    this.fase = 'accendi';
    Musica.suona(this, 'cerimonia');
    Musica.volume(0.5);
    this.suggerimento.setAlpha(1);
  }

  // Shows the lit village from the bottom of the screen up to the light line
  disegnaLuce() {
    const altezzaLuce = ALTEZZA * this.luce;
    this.formaLuce.clear();
    this.formaLuce.fillStyle(0xffffff, 1);
    this.formaLuce.fillRect(0, ALTEZZA - altezzaLuce, LARGHEZZA, altezzaLuce);
    this.lineaLuce.y = ALTEZZA - altezzaLuce;
    this.scintille.setPosition(0, ALTEZZA - altezzaLuce);
    // The characters come out of the shadow as the light reaches them
    const chiaro = Phaser.Math.Clamp(this.luce * 1.8, 0, 1);
    const colore = Phaser.Display.Color.Interpolate.ColorWithColor(
      Phaser.Display.Color.ValueToColor(0x6b7a99), Phaser.Display.Color.ValueToColor(0xffffff), 100, chiaro * 100);
    const tinta = Phaser.Display.Color.GetColor(colore.r, colore.g, colore.b);
    this.silvia.setTint(tinta);
    this.francesco.setTint(tinta);
  }

  aggiornaAccensione(secondi) {
    const insieme = this.entrambiPremono();
    if (insieme) {
      this.luce = Math.min(1, this.luce + secondi / CERIMONIA.SECONDI_PER_ACCENDERE);
      this.sfondoAcceso.setAlpha(1);
      this.calore.setAlpha(1);
      this.lineaLuce.setAlpha(1);
      this.scintille.emitting = true;
      this.suggerimento.setAlpha(0);
      Musica.volume(1);
    } else {
      // The lights flicker and slip down a little
      this.luce = Math.max(0, this.luce - CERIMONIA.SCIVOLA * secondi);
      const tremolio = 0.6 + Math.random() * 0.4;
      this.sfondoAcceso.setAlpha(tremolio);
      this.calore.setAlpha(tremolio);
      this.lineaLuce.setAlpha(this.luce > 0 ? 0.3 + Math.random() * 0.3 : 0);
      this.scintille.emitting = false;
      this.suggerimento.setAlpha(1);
      Musica.volume(0.5);
    }
    this.disegnaLuce();
    if (this.luce >= 1) this.matrimonio();
  }

  // ---------------------------------------------------------------- the wedding

  matrimonio() {
    this.fase = 'matrimonio';
    this.sfondoAcceso.setAlpha(1);
    this.lineaLuce.setVisible(false);
    this.scintille.emitting = false;
    this.suggerimento.setVisible(false);
    this.calore.setAlpha(1);
    this.silvia.clearTint();
    this.francesco.clearTint();

    // The magic moment: a golden flash, a burst of sparkles, a star on top of the tree
    this.cameras.main.flash(1100, 255, 228, 160);
    const esplosione = this.add.particles(LARGHEZZA / 2, 300, 'fiocco', {
      speed: { min: 150, max: 450 },
      angle: { min: 0, max: 360 },
      scale: { start: 1.3, end: 0 },
      alpha: { start: 1, end: 0 },
      tint: [0xffe08a, 0xffc14d, 0xfff4c2, 0xffffff],
      blendMode: 'ADD',
      lifespan: 1800,
      gravityY: 60,
      emitting: false,
    }).setDepth(45);
    esplosione.explode(90);
    const aloneAlbero = this.add.image(LARGHEZZA / 2, 320, creaBagliore(this))
      .setBlendMode(Phaser.BlendModes.ADD).setDisplaySize(720, 620).setAlpha(0).setDepth(14);
    this.tweens.add({ targets: aloneAlbero, alpha: 0.5, duration: 800 });
    this.tweens.add({ targets: aloneAlbero, alpha: 0.3, duration: 1400, delay: 800, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    const aloneStella = this.add.image(LARGHEZZA / 2, 80, creaBagliore(this))
      .setBlendMode(Phaser.BlendModes.ADD).setDepth(17).setScale(0);
    const stella = this.add.text(LARGHEZZA / 2, 80, '★', {
      fontFamily: 'sans-serif', fontSize: '72px', color: '#ffd34d',
    }).setOrigin(0.5).setDepth(18).setScale(0);
    stella.setShadow(0, 0, 'rgba(255, 230, 150, 1)', 18, true, true);
    this.tweens.add({ targets: [stella, aloneStella], scale: 1, duration: 700, delay: 300, ease: 'Back.Out' });
    this.tweens.add({ targets: aloneStella, scale: 1.25, alpha: 0.7, duration: 900, delay: 1000, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    this.tweens.add({ targets: stella, angle: { from: -6, to: 6 }, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });
    for (const info of this.dita.values()) info.bagliore.destroy();
    this.dita.clear();
    Musica.suona(this, 'festa'); // the joyful wedding waltz

    // Bells and thicker snow
    suonaCampanella(this);
    this.time.delayedCall(700, () => suonaCampanella(this));
    this.neve.setFrequency(30);

    // Mario walks in from the right with the rings, with little hops
    const mario = this.add.image(LARGHEZZA + 100, 690, 'mario_anelli').setOrigin(0.5, 1).setDepth(21);
    mario.setScale(150 / mario.height);
    this.tweens.add({ targets: mario, x: LARGHEZZA / 2, duration: 2600, ease: 'Sine.Out', delay: 600 });
    this.tweens.add({ targets: mario, y: 672, duration: 180, yoyo: true, repeat: 7, delay: 600, ease: 'Quad.Out' });

    // Silvia and Francesco come together
    this.tweens.add({ targets: this.silvia, x: 480, duration: 2200, ease: 'Sine.InOut', delay: 1800 });
    this.tweens.add({
      targets: this.francesco, x: 800, duration: 2200, ease: 'Sine.InOut', delay: 1800,
      onComplete: () => this.cuore(),
    });
  }

  cuore() {
    this.cambiaPosa(this.silvia, 'silvia_cheer');
    this.cambiaPosa(this.francesco, 'francesco_cheer');
    suonaMiao(this);

    // A big heart rises between them, with little hearts around it
    const grande = this.add.text(LARGHEZZA / 2, 430, '♥', {
      fontFamily: 'sans-serif', fontSize: '150px', color: '#e8798f',
    }).setOrigin(0.5).setDepth(25).setScale(0);
    grande.setShadow(0, 0, 'rgba(255, 220, 230, 0.9)', 20, true, true);
    this.tweens.add({ targets: grande, scale: 1, duration: 600, ease: 'Back.Out' });
    this.tweens.add({ targets: grande, y: 300, duration: 2400, ease: 'Sine.Out' });
    this.tweens.add({ targets: grande, scale: 1.12, duration: 500, yoyo: true, repeat: -1, delay: 600 });
    for (let i = 0; i < 12; i++) {
      const piccolo = this.add.text(LARGHEZZA / 2 + Phaser.Math.Between(-160, 160), 470, '♥', {
        fontFamily: 'sans-serif', fontSize: `${Phaser.Math.Between(24, 40)}px`, color: '#f2a7b6',
      }).setOrigin(0.5).setDepth(24).setAlpha(0);
      this.tweens.add({
        targets: piccolo, y: 150, alpha: { from: 1, to: 0 }, duration: 2200, delay: i * 180, ease: 'Sine.Out',
        onComplete: () => piccolo.destroy(),
      });
    }
    this.time.delayedCall(2600, () => this.schermataFinale(grande));
  }

  // ---------------------------------------------------------------- ending screen

  schermataFinale(cuore) {
    this.fase = 'fine';
    // The heart stays: it moves down between them, a bit smaller, and keeps beating gently
    this.tweens.killTweensOf(cuore);
    this.tweens.add({
      targets: cuore, y: 420, scale: 0.6, duration: 900, ease: 'Sine.InOut',
      onComplete: () => this.tweens.add({ targets: cuore, scale: 0.68, duration: 550, yoyo: true, repeat: -1, ease: 'Sine.InOut' }),
    });

    // The painted ending (Adri's Gemini picture) fades in like a postcard, under the falling snow
    // (zoomed in a little from the bottom, so the couple is bigger and the tree's star doesn't sit under the title)
    const cartolina = this.add.image(LARGHEZZA / 2, ALTEZZA, 'cartolina').setOrigin(0.5, 1).setScale(1.14).setDepth(46).setAlpha(0);
    this.tweens.add({ targets: cartolina, alpha: 1, duration: 2000, delay: 300 });

    const stileGrande = { fontFamily: FONT, fontSize: '78px', color: '#ffe9a8', stroke: '#2a3d66', strokeThickness: 9 };
    const stileMedio = { fontFamily: FONT, fontSize: '50px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 7 };
    const testi = [
      this.add.text(LARGHEZZA / 2, 80, TESTI.fine.appenaSposati, stileGrande),
      this.add.text(LARGHEZZA / 2, 160, TESTI.fine.nomi, stileMedio),
      this.add.text(LARGHEZZA / 2, 230, TESTI.fine.buonNatale, { ...stileMedio, fontSize: '42px', color: '#ffd34d' }),
    ];
    testi.forEach((testo, i) => {
      testo.setOrigin(0.5).setDepth(60).setAlpha(0);
      testo.setShadow(0, 4, 'rgba(15, 26, 46, 0.6)', 10, true, true);
      this.tweens.add({ targets: testo, alpha: 1, y: testo.y + 10, duration: 900, delay: i * 700 });
    });

    // Total stars, bottom left
    Salvataggio.segnaFinito();
    const stelle = this.add.text(40, ALTEZZA - 40, `★ ${stelleTotali()} / ${(ORDINE_GIOCHI.length - 1) * 3}`, {
      fontFamily: FONT, fontSize: '40px', color: '#ffd34d', stroke: '#2a3d66', strokeThickness: 6,
    }).setOrigin(0, 1).setDepth(60).setAlpha(0);

    // "Gioca ancora" button, bottom right
    const bottone = this.add.container(LARGHEZZA - 170, ALTEZZA - 60).setDepth(60).setAlpha(0);
    const fondo = this.add.graphics();
    fondo.fillStyle(COLORE_NOTTE, 0.6);
    fondo.fillRoundedRect(-140, -32, 280, 64, 32);
    bottone.add([fondo, this.add.text(0, 0, TESTI.fine.giocaAncora, { fontFamily: FONT, fontSize: '34px', color: '#fdf3e1' }).setOrigin(0.5)]);

    this.tweens.add({ targets: [stelle, bottone], alpha: 1, duration: 800, delay: 2400 });
    this.time.delayedCall(3000, () => {
      this.input.on('pointerup', (dito) => {
        if (dito.x > LARGHEZZA - 340 && dito.y > ALTEZZA - 130) this.giocaAncora();
      });
    });
  }

  giocaAncora() {
    if (this.fase === 'uscita') return;
    this.fase = 'uscita';
    this.cameras.main.fadeOut(900, 15, 26, 46);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.start('Titolo'));
  }

  // ---------------------------------------------------------------- every frame

  update(tempo, delta) {
    const secondi = Math.min(delta, 50) / 1000;
    if (this.fase === 'accendi') this.aggiornaAccensione(secondi);
  }
}
