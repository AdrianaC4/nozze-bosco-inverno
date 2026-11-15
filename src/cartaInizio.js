// Start cards with Mario. The game starts when someone pets Mario (a little swipe across him).
// Petting Mario is a "start button": it does not count in the gesture rule.
//
// 1. mostraCartaInizio: the card before every mini game. It shows the mini game's name,
//    each player's instruction on their own half, and Mario in the middle with his tip.
//      preload():  caricaMario(this);
//      create():   mostraCartaInizio(this, TESTI.slitta, () => { ...start the game... });
//    The texts object needs: nome, istruzioneSilvia, istruzioneFrancesco, mario (Mario's tip).
//
// 2. mostraCartaCarezze: a card with only the title and Mario, who must be petted several times.
//    Each stroke: hearts and a purr, then Mario changes pose and says the next line.
//      mostraCartaCarezze(this, 'La Cerimonia', [
//        { posa: 'mario', frase: '...' }, { posa: 'mario_felice', frase: '...' }, ...
//      ], () => { ...start... });

const CARTA = {
  CAREZZA_MINIMA: 70, // how far (in pixels) the finger must slide across Mario to count as petting
  ALTEZZA_MARIO: 260,
};

// Loads Mario's pictures (only once for the whole game)
function caricaMario(scena) {
  carica(scena, 'mario', 'assets/game/mario_sheet.png');
  carica(scena, 'mario_felice', 'assets/game/mario_proud.png');
  carica(scena, 'mario_colpevole', 'assets/game/mario_guilty.png');
}

function mostraCartaInizio(scena, testi, quandoInizia) {
  creaCartaMario(scena, {
    titolo: testi.nome,
    istruzioni: [testi.istruzioneSilvia, testi.istruzioneFrancesco],
    invito: TESTI.carta.accarezza,
    tappe: [{ posa: 'mario', frase: testi.mario }],
  }, quandoInizia);
}

function mostraCartaCarezze(scena, titolo, tappe, quandoFinito) {
  creaCartaMario(scena, { titolo, istruzioni: null, invito: null, tappe }, quandoFinito);
}

// The card itself. opzioni: titolo, istruzioni ([Silvia, Francesco] or null), invito (bottom text or null),
// tappe: list of { posa, frase } - one stroke is needed for each.
function creaCartaMario(scena, opzioni, quandoFinito) {
  const elementi = [];
  const aggiungi = (oggetto) => {
    oggetto.setDepth(100);
    elementi.push(oggetto);
    return oggetto;
  };

  aggiungi(scena.add.rectangle(0, 0, LARGHEZZA, ALTEZZA, COLORE_NOTTE).setOrigin(0, 0));
  aggiungi(scena.add.text(LARGHEZZA / 2, 90, opzioni.titolo, {
    fontFamily: FONT, fontSize: '60px', color: '#ffe9a8',
  }).setOrigin(0.5));

  // Each player's instruction on their own half (only on the mini game cards)
  if (opzioni.istruzioni) {
    const stileRiga = { fontFamily: FONT, fontSize: '32px', color: '#fdf3e1', align: 'center', wordWrap: { width: 380 } };
    aggiungi(scena.add.circle(210, 300, 34, COLORE_SILVIA));
    aggiungi(scena.add.text(210, 410, opzioni.istruzioni[0], stileRiga).setOrigin(0.5));
    aggiungi(scena.add.circle(LARGHEZZA - 210, 300, 34, COLORE_FRANCESCO));
    aggiungi(scena.add.text(LARGHEZZA - 210, 410, opzioni.istruzioni[1], stileRiga).setOrigin(0.5));
  }

  // Mario in the middle, breathing, with his line in a speech bubble
  let tappa = 0;
  const mario = aggiungi(scena.add.image(LARGHEZZA / 2, 560, opzioni.tappe[0].posa).setOrigin(0.5, 1));
  let respiro = null;
  const respira = () => {
    const scala = CARTA.ALTEZZA_MARIO / mario.height;
    mario.setScale(scala);
    if (respiro) respiro.stop();
    respiro = scena.tweens.add({
      targets: mario, scaleY: scala * 1.03, duration: 1300, ease: 'Sine.InOut', yoyo: true, repeat: -1,
    });
  };
  respira();
  const fumetto = aggiungi(scena.add.text(LARGHEZZA / 2, 255, opzioni.tappe[0].frase, {
    fontFamily: FONT, fontSize: '28px', color: '#2a3d66', backgroundColor: '#fdf3e1', padding: { x: 14, y: 8 },
  }).setOrigin(0.5, 1));

  // Bottom text (only on the mini game cards) and a little hand showing the swipe
  if (opzioni.invito) {
    const invito = aggiungi(scena.add.text(LARGHEZZA / 2, 640, opzioni.invito, {
      fontFamily: FONT, fontSize: '34px', color: '#fdf3e1',
    }).setOrigin(0.5));
    scena.tweens.add({ targets: invito, alpha: 0.45, duration: 900, yoyo: true, repeat: -1 });
  }
  const mano = aggiungi(scena.add.text(LARGHEZZA / 2 - 70, 400, '👆', { fontSize: '48px' }).setOrigin(0.5));
  scena.tweens.add({
    targets: mano, x: LARGHEZZA / 2 + 70, duration: 900, ease: 'Sine.InOut', yoyo: true, repeat: -1, repeatDelay: 300,
  });

  // Petting: a finger that starts on Mario and slides far enough across him
  const zonaMario = new Phaser.Geom.Rectangle(LARGHEZZA / 2 - 160, 280, 320, 300);
  const carezze = new Map(); // finger id -> how far it has slid over Mario
  let inAttesa = false;      // true while Mario reacts to a stroke (no new strokes counted)

  const giu = (dito) => {
    if (!inAttesa && zonaMario.contains(dito.x, dito.y)) carezze.set(dito.id, { x: dito.x, strada: 0 });
  };
  const muove = (dito) => {
    const carezza = carezze.get(dito.id);
    if (!carezza || inAttesa) return;
    carezza.strada += Math.abs(dito.x - carezza.x);
    carezza.x = dito.x;
    if (carezza.strada >= CARTA.CAREZZA_MINIMA && zonaMario.contains(dito.x, dito.y)) {
      carezze.clear();
      accarezzato();
    }
  };
  const su = (dito) => carezze.delete(dito.id);
  scena.input.on('pointerdown', giu);
  scena.input.on('pointermove', muove);
  scena.input.on('pointerup', su);

  // Mario enjoys the stroke: hearts and a purr. Then the next pose and line, or the end of the card.
  function accarezzato() {
    inAttesa = true;
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

    tappa += 1;
    if (tappa < opzioni.tappe.length) {
      // Next pose and line, with a little hop
      scena.time.delayedCall(700, () => {
        mario.setTexture(opzioni.tappe[tappa].posa);
        respira();
        scena.tweens.add({ targets: mario, y: { from: 560, to: 535 }, duration: 160, ease: 'Quad.Out', yoyo: true });
        fumetto.setText(opzioni.tappe[tappa].frase);
        mano.setVisible(true);
        inAttesa = false;
      });
      return;
    }

    // Last stroke: Mario closes his eyes happily, then the card fades away
    scena.input.off('pointerdown', giu);
    scena.input.off('pointermove', muove);
    scena.input.off('pointerup', su);
    mario.setTexture('mario_felice');
    respiro.stop();
    mario.setScale(CARTA.ALTEZZA_MARIO / mario.height);
    scena.time.delayedCall(1200, () => {
      scena.tweens.add({
        targets: elementi,
        alpha: 0,
        duration: 350,
        onComplete: () => {
          elementi.forEach((e) => e.destroy());
          quandoFinito();
        },
      });
    });
  }
}
