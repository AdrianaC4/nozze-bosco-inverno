// The start card shown before every mini game.
// It shows the mini game's name, each player's instruction on their own half,
// and Mario in the middle with his tip. The game starts when someone pets Mario
// (a little swipe across him). Petting Mario is a "start button": it does not count in the gesture rule.
//
// How to use it in a mini game scene:
//   preload():  caricaMario(this);
//   create():   mostraCartaInizio(this, TESTI.slitta, () => { ...start the game... });
// The texts object needs: nome, istruzioneSilvia, istruzioneFrancesco, mario (Mario's tip).

const CARTA = {
  CAREZZA_MINIMA: 70, // how far (in pixels) the finger must slide across Mario to count as petting
};

// Loads Mario's pictures (only once for the whole game)
function caricaMario(scena) {
  if (!scena.textures.exists('mario')) scena.load.image('mario', 'assets/game/mario_sheet.png');
  if (!scena.textures.exists('mario_felice')) scena.load.image('mario_felice', 'assets/game/mario_proud.png');
}

function mostraCartaInizio(scena, testi, quandoInizia) {
  const elementi = [];
  const aggiungi = (oggetto) => {
    oggetto.setDepth(100);
    elementi.push(oggetto);
    return oggetto;
  };

  aggiungi(scena.add.rectangle(0, 0, LARGHEZZA, ALTEZZA, COLORE_NOTTE).setOrigin(0, 0));
  aggiungi(scena.add.text(LARGHEZZA / 2, 90, testi.nome, {
    fontFamily: FONT, fontSize: '60px', color: '#ffe9a8',
  }).setOrigin(0.5));

  // Each player's instruction on their own half
  const stileRiga = { fontFamily: FONT, fontSize: '32px', color: '#fdf3e1', align: 'center', wordWrap: { width: 380 } };
  aggiungi(scena.add.circle(210, 300, 34, COLORE_SILVIA));
  aggiungi(scena.add.text(210, 410, testi.istruzioneSilvia, stileRiga).setOrigin(0.5));
  aggiungi(scena.add.circle(LARGHEZZA - 210, 300, 34, COLORE_FRANCESCO));
  aggiungi(scena.add.text(LARGHEZZA - 210, 410, testi.istruzioneFrancesco, stileRiga).setOrigin(0.5));

  // Mario in the middle, breathing, with his tip in a speech bubble
  const mario = aggiungi(scena.add.image(LARGHEZZA / 2, 560, 'mario').setOrigin(0.5, 1));
  const scalaMario = 260 / mario.height;
  mario.setScale(scalaMario);
  const respiro = scena.tweens.add({
    targets: mario, scaleY: scalaMario * 1.03, duration: 1300, ease: 'Sine.InOut', yoyo: true, repeat: -1,
  });
  aggiungi(scena.add.text(LARGHEZZA / 2, 255, testi.mario, {
    fontFamily: FONT, fontSize: '28px', color: '#2a3d66', backgroundColor: '#fdf3e1', padding: { x: 14, y: 8 },
  }).setOrigin(0.5, 1));

  // "Accarezza Mario per iniziare" and a little hand showing the swipe
  const invito = aggiungi(scena.add.text(LARGHEZZA / 2, 640, TESTI.carta.accarezza, {
    fontFamily: FONT, fontSize: '34px', color: '#fdf3e1',
  }).setOrigin(0.5));
  scena.tweens.add({ targets: invito, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
  const mano = aggiungi(scena.add.text(LARGHEZZA / 2 - 70, 400, '👆', { fontSize: '48px' }).setOrigin(0.5));
  scena.tweens.add({
    targets: mano, x: LARGHEZZA / 2 + 70, duration: 900, ease: 'Sine.InOut', yoyo: true, repeat: -1, repeatDelay: 300,
  });

  // Petting: a finger that starts on Mario and slides far enough across him
  const zonaMario = new Phaser.Geom.Rectangle(LARGHEZZA / 2 - 160, 280, 320, 300);
  const carezze = new Map(); // finger id -> how far it has slid over Mario
  let accarezzato = false;

  const giu = (dito) => {
    if (!accarezzato && zonaMario.contains(dito.x, dito.y)) carezze.set(dito.id, { x: dito.x, strada: 0 });
  };
  const muove = (dito) => {
    const carezza = carezze.get(dito.id);
    if (!carezza || accarezzato) return;
    carezza.strada += Math.abs(dito.x - carezza.x);
    carezza.x = dito.x;
    if (carezza.strada >= CARTA.CAREZZA_MINIMA && zonaMario.contains(dito.x, dito.y)) {
      accarezzato = true;
      felice();
    }
  };
  const su = (dito) => carezze.delete(dito.id);
  scena.input.on('pointerdown', giu);
  scena.input.on('pointermove', muove);
  scena.input.on('pointerup', su);

  // Mario is happy: closes his eyes, little hearts, a purr, then the game starts
  function felice() {
    scena.input.off('pointerdown', giu);
    scena.input.off('pointermove', muove);
    scena.input.off('pointerup', su);
    respiro.stop();
    mario.setTexture('mario_felice');
    mario.setScale(260 / mario.height);
    mano.setVisible(false);
    suonaFusa(scena);
    for (let i = 0; i < 5; i++) {
      const cuore = aggiungi(scena.add.text(LARGHEZZA / 2 + Phaser.Math.Between(-90, 90), 330, '♥', {
        fontFamily: 'sans-serif', fontSize: '40px', color: '#e8798f',
      }).setOrigin(0.5).setAlpha(0));
      scena.tweens.add({
        targets: cuore, y: 200, alpha: { from: 1, to: 0 }, duration: 1100, delay: i * 120, ease: 'Sine.Out',
      });
    }
    scena.time.delayedCall(1200, () => {
      scena.tweens.add({
        targets: elementi,
        alpha: 0,
        duration: 350,
        onComplete: () => {
          elementi.forEach((e) => e.destroy());
          quandoInizia();
        },
      });
    });
  }
}
