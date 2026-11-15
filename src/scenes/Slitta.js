// Mini game 1: La Slitta dei Regali (the sled with the gifts). PROTOTYPE with plain shapes.
//
// 1. Start card: instructions, Mario in the middle; petting Mario starts the game (src/cartaInizio.js).
// 2. Downhill (seen from above): trees and gifts come from the top of the screen.
//    - Silvia drags on her half to steer left and right (the sled follows how her finger MOVES).
//    - Francesco taps on his half to push: the sled slowly loses speed on its own.
//      Faster = reach the village sooner, but harder to dodge.
//    - Mario runs beside the sled and says "Miao!" just before a tree in the sled's path.
// 3. 40-second countdown: reach the village in time, or try again.
// 4. 3 shared snowflake lives: hitting a tree costs one. Losing all 3 restarts instantly.
// 5. Reach the village with at least 5 gifts to win (1-3 stars by gifts).

// --- Tuning numbers (change these to make the game easier or harder) ---
const SLITTA = {
  TEMPO: 35,                   // seconds to reach the village
  VELOCITA_INIZIO: 300,        // speed at the start (pixels per second)
  VELOCITA_MINIMA: 180,        // the sled never goes slower than this
  VELOCITA_MASSIMA: 650,
  SPINTA_PER_TOCCO: 35,        // speed added by each of Francesco's taps
  FRENATA: 80,                 // speed lost per second on its own
  STERZO: 1.5,                 // how far the sled moves for each pixel Silvia's finger moves
  PERCORSO: 14000,             // length of the run (pixels). Needs an average of 400/s to finish in 35 s
  OGNI: 260,                   // a new tree or gift every this many pixels travelled
  PROBABILITA_ALBERO: 0.55,    // otherwise it's a gift
  REGALI_PER_VINCERE: 5,       // 5-9 gifts = 1 star
  REGALI_2_STELLE: 10,         // 10-14 gifts = 2 stars
  REGALI_3_STELLE: 15,         // 15 or more = 3 stars
  VITE: 3,
};

const COLORI_REGALI = [0xf08a80, 0x8fbfe8, 0xc9a3e0, 0x9fd8a8, 0xffffff]; // soft tints over the white gift (white = as painted)

class Slitta extends Phaser.Scene {
  constructor() {
    super('Slitta');
  }

  init(dati) {
    // After a retry we skip the start card and go straight to the run
    this.ritenta = Boolean(dati && dati.ritenta);
  }

  preload() {
    caricaMario(this);
    carica(this, 'slitta', 'assets/game/sled.png');
    carica(this, 'regalo', 'assets/game/gift.png');
    carica(this, 'albero', 'assets/game/tree_obstacle.png');
  }

  create() {
    this.fase = 'carta';          // 'carta' -> 'discesa' -> 'fine'
    this.vite = SLITTA.VITE;
    this.regali = 0;
    this.dita = new Map();        // finger id -> { lato, xPrecedente }

    this.input.on('pointerdown', (dito) => this.ditoGiu(dito));
    this.input.on('pointermove', (dito) => this.ditoMuove(dito));
    this.input.on('pointerup', (dito) => this.dita.delete(dito.id));
    this.input.on('pointerupoutside', (dito) => this.dita.delete(dito.id));

    this.preparaDiscesa();
    this.cameras.main.fadeIn(400, 15, 26, 46);

    if (this.ritenta) {
      this.iniziaDiscesa();
    } else {
      mostraCartaInizio(this, TESTI.slitta, () => this.iniziaDiscesa());
    }
  }

  // ---------------------------------------------------------------- touch

  ditoGiu(dito) {
    const lato = latoDi(dito);
    this.dita.set(dito.id, { lato, xPrecedente: dito.x });
    // Every touch on Francesco's half is one push
    if (lato === 'francesco' && this.fase === 'discesa') this.spingi();
  }

  ditoMuove(dito) {
    const info = this.dita.get(dito.id);
    if (!info) return;
    const spostamento = dito.x - info.xPrecedente;
    info.xPrecedente = dito.x;
    // Only fingers that started on Silvia's half steer
    if (info.lato === 'silvia' && this.fase === 'discesa') {
      this.slitta.x = Phaser.Math.Clamp(this.slitta.x + spostamento * SLITTA.STERZO, 70, LARGHEZZA - 70);
    }
  }

  // ---------------------------------------------------------------- the run

  // Draws the snowy slope, the sled, Mario and the top bar (behind the start card)
  preparaDiscesa() {
    this.velocita = SLITTA.VELOCITA_INIZIO;
    this.percorso = 0;            // pixels travelled so far
    this.prossimoOggetto = 400;   // when the next tree or gift appears
    this.oggetti = [];            // trees and gifts on screen
    this.invulnerabile = false;
    this.tempoRimasto = SLITTA.TEMPO;
    this.traguardo = null;        // the finish line, created near the end (reset here because a retry reuses the scene)

    // Snowy ground that scrolls: soft watercolour snow painted in code, with blue shadows,
    // sparkles and a few sled-sized drifts so you can feel the speed. It repeats seamlessly.
    if (!this.textures.exists('suoloNeve')) {
      const L = 512;
      const tela = this.textures.createCanvas('suoloNeve', L, L);
      const ctx = tela.getContext();
      ctx.fillStyle = '#eef4fb';
      ctx.fillRect(0, 0, L, L);
      // Each blotch is drawn 9 times (shifted by one tile) so the edges match when it repeats
      const macchia = (x, y, raggio, colore) => {
        for (const dx of [-L, 0, L]) {
          for (const dy of [-L, 0, L]) {
            const sfumatura = ctx.createRadialGradient(x + dx, y + dy, 0, x + dx, y + dy, raggio);
            sfumatura.addColorStop(0, colore);
            sfumatura.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = sfumatura;
            ctx.fillRect(x + dx - raggio, y + dy - raggio, raggio * 2, raggio * 2);
          }
        }
      };
      for (let i = 0; i < 16; i++) {
        macchia(Phaser.Math.Between(0, L), Phaser.Math.Between(0, L), Phaser.Math.Between(50, 110), 'rgba(176, 201, 232, 0.38)');
      }
      for (let i = 0; i < 12; i++) {
        macchia(Phaser.Math.Between(0, L), Phaser.Math.Between(0, L), Phaser.Math.Between(40, 90), 'rgba(255, 255, 255, 0.85)');
      }
      for (let i = 0; i < 40; i++) {
        macchia(Phaser.Math.Between(0, L), Phaser.Math.Between(0, L), Phaser.Math.Between(2, 5), 'rgba(140, 170, 210, 0.55)');
      }
      tela.refresh();
    }
    this.suolo = this.add.tileSprite(0, 0, LARGHEZZA, ALTEZZA, 'suoloNeve').setOrigin(0, 0);

    // The sled full of gifts, seen from above (Adri's Gemini picture), 130 pixels long
    this.slitta = this.add.container(LARGHEZZA / 2, 470).setDepth(10);
    const slitta = this.add.image(0, 0, 'slitta');
    slitta.setScale(130 / slitta.height);
    this.slitta.add(slitta);

    // Mario running beside the sled (his position is his feet)
    this.mario = this.add.image(LARGHEZZA / 2 + 100, 530, 'mario').setOrigin(0.5, 1).setDepth(10);
    this.mario.setScale(70 / this.mario.height);
    this.miao = this.add.text(0, 0, TESTI.slitta.miao, {
      fontFamily: FONT, fontSize: '30px', color: '#2a3d66', backgroundColor: '#fdf3e1', padding: { x: 10, y: 4 },
    }).setOrigin(0.5, 1).setDepth(30).setVisible(false);

    this.creaInterfaccia();
  }

  creaInterfaccia() {
    // Lives: 3 snowflakes, top left
    this.fiocchiVita = [];
    for (let i = 0; i < SLITTA.VITE; i++) {
      this.fiocchiVita.push(this.add.text(40 + i * 50, 30, '❄', {
        fontFamily: 'sans-serif', fontSize: '40px', color: '#5b8fd1',
      }).setDepth(40));
    }
    // Gifts caught, top right
    const iconaRegalo = this.add.image(LARGHEZZA - 120, 52, 'regalo').setTint(COLORI_REGALI[0]).setDepth(40);
    iconaRegalo.setScale(44 / iconaRegalo.height);
    this.testoRegali = this.add.text(LARGHEZZA - 90, 52, '0', {
      fontFamily: FONT, fontSize: '40px', color: '#2a3d66',
    }).setOrigin(0, 0.5).setDepth(40);
    // How far to the village, top centre
    this.add.rectangle(LARGHEZZA / 2, 40, 400, 14, COLORE_NOTTE, 0.25).setDepth(40);
    this.barraPercorso = this.add.rectangle(LARGHEZZA / 2 - 200, 40, 0, 14, 0x2e86c1).setOrigin(0, 0.5).setDepth(40);
    this.add.text(LARGHEZZA / 2 + 215, 40, '🏠', { fontSize: '30px' }).setOrigin(0, 0.5).setDepth(40);
    // Countdown, under the bar
    this.testoTempo = this.add.text(LARGHEZZA / 2, 86, String(SLITTA.TEMPO), {
      fontFamily: FONT, fontSize: '40px', color: '#2a3d66',
    }).setOrigin(0.5).setDepth(40);
  }

  iniziaDiscesa() {
    this.fase = 'discesa';
    Musica.suona(this, 'corsa'); // the bouncy tune; its speed follows the sled (see aggiornaDiscesa)
    // "Via!" in big letters for a moment
    const via = this.add.text(LARGHEZZA / 2, ALTEZZA / 2 - 60, TESTI.slitta.via, {
      fontFamily: FONT, fontSize: '96px', color: '#ffe9a8', stroke: '#2a3d66', strokeThickness: 10,
    }).setOrigin(0.5).setDepth(60);
    this.tweens.add({ targets: via, scale: { from: 0.5, to: 1.2 }, alpha: { from: 1, to: 0 }, duration: 900, onComplete: () => via.destroy() });
  }

  spingi() {
    this.velocita = Math.min(SLITTA.VELOCITA_MASSIMA, this.velocita + SLITTA.SPINTA_PER_TOCCO);
  }

  aggiornaDiscesa(secondi) {
    // Countdown
    const secondiPrima = Math.ceil(this.tempoRimasto);
    this.tempoRimasto -= secondi;
    const secondiOra = Math.max(0, Math.ceil(this.tempoRimasto));
    if (secondiOra !== secondiPrima) {
      this.testoTempo.setText(String(secondiOra));
      if (secondiOra <= 10) {
        this.testoTempo.setColor('#c0392b');
        this.tweens.add({ targets: this.testoTempo, scale: { from: 1.4, to: 1 }, duration: 250 });
        suonaTic(this);
      }
    }
    if (this.tempoRimasto <= 0) {
      this.ricomincia(TESTI.slitta.tempoScaduto);
      return;
    }

    // The sled slowly loses speed; Francesco's taps keep it fast
    this.velocita = Math.max(SLITTA.VELOCITA_MINIMA, this.velocita - SLITTA.FRENATA * secondi);
    const passo = this.velocita * secondi;
    // The music follows the sled: from 100 beats per minute (slowest) to 160 (fastest)
    const quantoVeloce = (this.velocita - SLITTA.VELOCITA_MINIMA) / (SLITTA.VELOCITA_MASSIMA - SLITTA.VELOCITA_MINIMA);
    Musica.tempo(100 + quantoVeloce * 60);
    this.percorso += passo;
    this.suolo.tilePositionY -= passo;
    this.barraPercorso.width = 400 * Math.min(1, this.percorso / SLITTA.PERCORSO);

    // New trees and gifts (none in the last stretch, so the end is calm)
    if (this.percorso >= this.prossimoOggetto && this.percorso < SLITTA.PERCORSO - 700) {
      this.creaOggetto();
      this.prossimoOggetto += SLITTA.OGNI;
    }

    // The finish line appears at the top once the end is near, and reaches the sled exactly at the end
    const mancano = SLITTA.PERCORSO - this.percorso;
    if (!this.traguardo && mancano <= this.slitta.y + 120) {
      this.creaTraguardo(this.slitta.y - mancano);
    }
    if (this.traguardo) this.traguardo.y += passo;

    // Move everything down the screen and check what the sled touches
    for (const oggetto of this.oggetti) {
      oggetto.y += passo;
      const dx = Math.abs(oggetto.x - this.slitta.x);
      const dy = Math.abs(oggetto.y - this.slitta.y);
      if (!oggetto.preso && dx < 55 && dy < 75) {
        oggetto.preso = true;
        if (oggetto.tipo === 'regalo') this.prendiRegalo(oggetto);
        else this.colpisciAlbero(oggetto);
        if (this.fase !== 'discesa') return; // the last life was lost: stop here
      }
      // Mario warns about a tree coming towards the sled
      if (oggetto.tipo === 'albero' && !oggetto.avvisato && !oggetto.preso) {
        const distanza = this.slitta.y - oggetto.y;
        if (distanza > 150 && distanza < this.velocita * 1.1 && dx < 90) {
          oggetto.avvisato = true;
          this.direMario(TESTI.slitta.miao, 700);
          suonaMiao(this);
        }
      }
    }
    // Remove what has gone off the bottom of the screen
    this.oggetti = this.oggetti.filter((oggetto) => {
      if (oggetto.y > ALTEZZA + 100) {
        oggetto.destroy();
        return false;
      }
      return true;
    });

    // Mario follows the sled, on whichever side has room
    const latoMario = this.slitta.x > LARGHEZZA - 180 ? -100 : 100;
    this.mario.x = Phaser.Math.Linear(this.mario.x, this.slitta.x + latoMario, 0.12);
    this.mario.y = 530 - Math.abs(Math.sin(this.time.now / 90)) * 10; // little running hops
    this.miao.setPosition(this.mario.x, this.mario.y - 75);

    if (this.percorso >= SLITTA.PERCORSO) this.arrivo();
  }

  // A chequered finish line across the whole slope, with "Traguardo" and two little flags
  creaTraguardo(y) {
    this.traguardo = this.add.container(0, y).setDepth(4);
    const lato = 32;
    for (let riga = 0; riga < 2; riga++) {
      for (let colonna = 0; colonna < LARGHEZZA / lato; colonna++) {
        const scuro = (riga + colonna) % 2 === 0;
        this.traguardo.add(this.add.rectangle(colonna * lato, riga * lato - lato, lato, lato, scuro ? 0x2a3d66 : 0xffffff).setOrigin(0, 0));
      }
    }
    for (const x of [40, LARGHEZZA - 40]) {
      this.traguardo.add(this.add.rectangle(x, -lato - 40, 6, 80, 0x5c3a1a));
      this.traguardo.add(this.add.triangle(x + 3, -lato - 70, 0, 0, 40, 14, 0, 28, COLORE_FRANCESCO).setOrigin(0, 0));
    }
    this.traguardo.add(this.add.text(LARGHEZZA / 2, -lato - 12, TESTI.slitta.traguardo, {
      fontFamily: FONT, fontSize: '44px', color: '#2a3d66', stroke: '#fdf3e1', strokeThickness: 6,
    }).setOrigin(0.5, 1));
  }

  creaOggetto() {
    const x = Phaser.Math.Between(90, LARGHEZZA - 90);
    const oggetto = this.add.container(x, -80);
    if (Math.random() < SLITTA.PROBABILITA_ALBERO) {
      // A snowy pine tree (Adri's Gemini picture), about 100 pixels tall
      const albero = this.add.image(0, 0, 'albero');
      albero.setScale(100 / albero.height);
      oggetto.add(albero);
      oggetto.tipo = 'albero';
    } else {
      // A gift (Adri's white gift, tinted in a random colour)
      const regalo = this.add.image(0, 0, 'regalo').setTint(Phaser.Utils.Array.GetRandom(COLORI_REGALI));
      regalo.setScale(52 / regalo.height);
      oggetto.add(regalo);
      oggetto.tipo = 'regalo';
      this.tweens.add({ targets: oggetto, angle: { from: -8, to: 8 }, duration: 500, yoyo: true, repeat: -1 });
    }
    oggetto.setDepth(5);
    this.oggetti.push(oggetto);
  }

  prendiRegalo(regalo) {
    this.regali += 1;
    this.testoRegali.setText(String(this.regali));
    suonaTono(this, 900, 1400, 0.15, 'sine', 0.15);
    this.tweens.killTweensOf(regalo);
    this.tweens.add({ targets: regalo, scale: 0, alpha: 0, duration: 200 });
  }

  colpisciAlbero(albero) {
    if (this.invulnerabile) return;
    this.vite -= 1;
    this.fiocchiVita[this.vite].setAlpha(0.2);
    suonaTonfo(this);
    this.cameras.main.shake(250, 0.012);
    this.velocita = SLITTA.VELOCITA_MINIMA;
    this.tweens.add({ targets: albero, angle: 15, duration: 100, yoyo: true, repeat: 2 });

    if (this.vite <= 0) {
      this.ricomincia(TESTI.slitta.ohNo);
      return;
    }
    // A moment of safety after a crash, shown by blinking
    this.invulnerabile = true;
    this.tweens.add({
      targets: this.slitta,
      alpha: 0.3,
      duration: 120,
      yoyo: true,
      repeat: 4,
      onComplete: () => {
        this.slitta.setAlpha(1);
        this.invulnerabile = false;
      },
    });
  }

  direMario(testo, durata) {
    this.miao.setText(testo).setVisible(true);
    if (this.timerMiao) this.timerMiao.remove();
    this.timerMiao = this.time.delayedCall(durata, () => this.miao.setVisible(false));
  }

  // ---------------------------------------------------------------- the end

  arrivo() {
    this.fase = 'fine';
    if (this.regali < SLITTA.REGALI_PER_VINCERE) {
      this.ricomincia(TESTI.slitta.pochiRegali);
      return;
    }
    let stelle = 1;
    if (this.regali >= SLITTA.REGALI_2_STELLE) stelle = 2;
    if (this.regali >= SLITTA.REGALI_3_STELLE) stelle = 3;
    mostraRisultato(this, { gioco: 'slitta', stelle, prossima: 'Torta', frase: TESTI.slitta.marioVittoria });
  }

  // Forgiving game: no game over, just a short message and an instant restart
  ricomincia(messaggio) {
    this.fase = 'fine';
    Musica.tempoNormale();
    suonaTonfo(this);
    this.add.text(LARGHEZZA / 2, ALTEZZA / 2, messaggio, {
      fontFamily: FONT, fontSize: '60px', color: '#fdf3e1', stroke: '#2a3d66', strokeThickness: 8,
    }).setOrigin(0.5).setDepth(60);
    this.time.delayedCall(1300, () => this.scene.restart({ ritenta: true }));
  }

  // ---------------------------------------------------------------- every frame

  update(tempo, delta) {
    const secondi = Math.min(delta, 50) / 1000; // cap, so a hiccup doesn't make things jump
    if (this.fase === 'discesa') this.aggiornaDiscesa(secondi);
  }
}
