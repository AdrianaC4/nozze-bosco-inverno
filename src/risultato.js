// The result card shown after winning a mini game.
// "Bravissimi!", the stars popping in one by one, Mario (proud) with his line for this game,
// the couple's record if they did better before, and two buttons:
//   "Riprova" - play this mini game again (straight in, no start card) to get more stars
//   "Avanti"  - go on to the next scene
// Either player can tap the buttons (menu taps don't count in the gesture rule).
//
// How to use, when a mini game is won:
//   mostraRisultato(this, { gioco: 'slitta', stelle: 2, prossima: 'Torta', frase: TESTI.slitta.marioVittoria });

function mostraRisultato(scena, opzioni) {
  const recordPrima = salvaStelle(scena, opzioni.gioco, opzioni.stelle);
  Salvataggio.segnaRaggiunto(opzioni.prossima);
  suonaCampanella(scena);
  Musica.suona(scena, 'neve');
  Musica.tempoNormale();

  const P = 200; // above everything in the scene (start cards use 100)
  scena.add.rectangle(0, 0, LARGHEZZA, ALTEZZA, COLORE_NOTTE, 0.94).setOrigin(0, 0).setDepth(P);
  const titolo = scena.add.text(LARGHEZZA / 2, 120, TESTI.comuni.bravissimi, {
    fontFamily: FONT, fontSize: '80px', color: '#ffe9a8',
  }).setOrigin(0.5).setDepth(P + 1).setScale(0.6).setAlpha(0);
  scena.tweens.add({ targets: titolo, scale: 1, alpha: 1, duration: 450, ease: 'Back.Out' });

  // The stars pop in one by one
  for (let i = 0; i < 3; i++) {
    const piena = i < opzioni.stelle;
    const stella = scena.add.text(LARGHEZZA / 2 - 110 + i * 110, 260, piena ? '★' : '☆', {
      fontFamily: 'sans-serif', fontSize: '100px', color: piena ? '#ffd34d' : '#6b7a99',
    }).setOrigin(0.5).setDepth(P + 1).setScale(0);
    scena.tweens.add({
      targets: stella, scale: 1, duration: 350, delay: 500 + i * 350, ease: 'Back.Out',
      onStart: () => { if (piena) suonaTono(scena, 1100 + i * 250, 1500 + i * 250, 0.15, 'sine', 0.15); },
    });
  }

  // The record, if they did better before
  if (recordPrima > opzioni.stelle) {
    scena.add.text(LARGHEZZA / 2, 345, `${TESTI.risultato.record} ${'★'.repeat(recordPrima)}`, {
      fontFamily: FONT, fontSize: '28px', color: '#ffd34d',
    }).setOrigin(0.5).setDepth(P + 1);
  }

  // Mario (proud) with his line
  const mario = scena.add.image(LARGHEZZA / 2 - 250, 520, 'mario_felice').setOrigin(0.5, 1).setDepth(P + 1);
  mario.setScale(140 / mario.height);
  scena.add.text(LARGHEZZA / 2 - 160, 430, opzioni.frase, {
    fontFamily: FONT, fontSize: '28px', color: '#2a3d66', backgroundColor: '#fdf3e1', padding: { x: 14, y: 8 },
    wordWrap: { width: 520 },
  }).setOrigin(0, 0.5).setDepth(P + 1);

  // The two buttons
  const bottoni = [
    { testo: TESTI.risultato.riprova, x: LARGHEZZA / 2 - 170, azione: () => scena.scene.restart({ ritenta: true }) },
    { testo: TESTI.risultato.avanti, x: LARGHEZZA / 2 + 170, azione: () => vaiA(scena, opzioni.prossima) },
  ];
  bottoni.forEach((b, i) => {
    const contenitore = scena.add.container(b.x, 620).setDepth(P + 1).setAlpha(0);
    const fondo = scena.add.graphics();
    fondo.fillStyle(i === 1 ? 0xd4a537 : 0x2a3d66, 1);
    fondo.fillRoundedRect(-140, -36, 280, 72, 36);
    contenitore.add([fondo, scena.add.text(0, 0, b.testo, { fontFamily: FONT, fontSize: '36px', color: '#fdf3e1' }).setOrigin(0.5)]);
    scena.tweens.add({ targets: contenitore, alpha: 1, duration: 400, delay: 1700 });
  });

  // Wait a moment so a tap in progress doesn't press a button by mistake
  let scelto = false;
  scena.time.delayedCall(1800, () => {
    scena.input.on('pointerup', (dito) => {
      if (scelto) return;
      const premuto = bottoni.find((b) => Math.abs(dito.x - b.x) <= 140 && Math.abs(dito.y - 620) <= 40);
      if (premuto) {
        scelto = true;
        premuto.azione();
      }
    });
  });
}

// Fade out and go to another scene
function vaiA(scena, nomeScena) {
  scena.cameras.main.fadeOut(600, 15, 26, 46);
  scena.cameras.main.once('camerafadeoutcomplete', () => scena.scene.start(nomeScena));
}
