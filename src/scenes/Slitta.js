// Mini game 1: La Slitta dei Regali (the sled with the gifts). PROTOTYPE with plain shapes.
//
// 1. Start card: instructions, Mario in the middle; petting Mario starts the game (src/cartaInizio.js).
// 2. Downhill (seen from above): trees and gifts come from the top of the screen.
//    - Silvia drags on her half to steer left and right (the sled follows how her finger MOVES).
//    - Francesco taps on his half to push: the sled slowly loses speed on its own.
//      Faster = reach the village sooner, but harder to dodge.
//    - Mario runs beside the sled. Every 8-10 seconds he dashes off, then comes zigzagging down the
//      slope from the top chasing a snowflake ("Miao!"): hitting him counts like hitting a tree.
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
  // Where each player touches (always visible on screen):
  ZONA_FRANCESCO: { x: 1010, y: 100, w: 230, h: 230 }, // a big snowball at the top right: only taps here push
  ZONA_SILVIA_Y: 340,          // Silvia: drags that start anywhere below Francesco's snowball steer (not marked on screen)
  MARIO_OGNI: [8, 10],         // seconds between Mario's dashes
  MARIO_ZIGZAG: 230,           // how fast he zigzags sideways (pixels per second)
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
    caricaSuoni(this);
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
    aggiungiSalta(this, 'Torta');
    this.cameras.main.fadeIn(400, 15, 26, 46);

    if (this.ritenta) {
      this.iniziaDiscesa();
    } else {
      mostraCartaInizio(this, TESTI.slitta, () => this.iniziaDiscesa());
    }
  }

  // ---------------------------------------------------------------- touch

  // Who a touch belongs to: Francesco's box at the top right, Silvia's band along the bottom, nobody elsewhere
  zonaDi(x, y) {
    const z = SLITTA.ZONA_FRANCESCO;
    if (x >= z.x && x <= z.x + z.w && y >= z.y && y <= z.y + z.h) return 'francesco';
    if (y >= SLITTA.ZONA_SILVIA_Y) return 'silvia';
    return null;
  }

  ditoGiu(dito) {
    const lato = this.zonaDi(dito.x, dito.y);
    this.dita.set(dito.id, { lato, xPrecedente: dito.x });
    if (lato === 'francesco') {
      this.tweens.killTweensOf(this.bottoneSpinta);
      this.bottoneSpinta.setScale(0.94);
      this.tweens.add({ targets: this.bottoneSpinta, scale: 1, duration: 120 });
    }
    // Every touch on Francesco's half is one push
    if (lato === 'francesco' && this.fase === 'discesa') this.spingi();
  }

  ditoMuove(dito) {
    // A finger that was already on the screen when the run (re)started: count it from now (without a push)
    if (dito.isDown && !this.dita.has(dito.id)) this.dita.set(dito.id, { lato: this.zonaDi(dito.x, dito.y), xPrecedente: dito.x });
    const info = this.dita.get(dito.id);
    if (!info) return;
    const spostamento = dito.x - info.xPrecedente;
    info.xPrecedente = dito.x;
    // Only fingers that started in Silvia's band steer (they can then move anywhere)
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
    this.marioStato = 'accanto';  // see aggiornaMario
    this.marioAttesa = 5;         // seconds until Mario's first dash

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
    // Francesco's button (top right): a big soft snowball; only taps here push the sled
    const z = SLITTA.ZONA_FRANCESCO;
    this.bottoneSpinta = this.add.container(z.x + z.w / 2, z.y + z.h / 2).setDepth(39);
    this.bottoneSpinta.add([
      this.add.image(0, 0, creaPallaNeve(this, z.w)),
      this.add.text(0, 4, TESTI.slitta.zonaFrancesco, {
        fontFamily: FONT, fontSize: '28px', color: '#9c4a3c', align: 'center', lineSpacing: 2,
      }).setOrigin(0.5),
    ]);
    // A gentle breathing, so it looks alive and invites tapping
    this.tweens.add({ targets: this.bottoneSpinta, angle: { from: -2, to: 2 }, duration: 1600, yoyo: true, repeat: -1, ease: 'Sine.InOut' });

    // Silvia's hint at the bottom: just the words, no arrows, no band
    this.add.text(LARGHEZZA / 2, ALTEZZA - 34, TESTI.slitta.zonaSilvia, {
      fontFamily: FONT, fontSize: '28px', color: '#5b7aa6',
    }).setOrigin(0.5).setDepth(3).setAlpha(0.8);

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
    }
    // Remove what has gone off the bottom of the screen
    this.oggetti = this.oggetti.filter((oggetto) => {
      if (oggetto.y > ALTEZZA + 100) {
        oggetto.destroy();
        return false;
      }
      return true;
    });

    this.aggiornaMario(secondi, passo);
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

  // ---------------------------------------------------------------- Mario

  // Mario's states: 'accanto' (running beside the sled) -> 'via' (dashing off the top)
  // -> 'zigzag' (coming down the slope from the top, zigzagging) -> 'accanto' again
  aggiornaMario(secondi, passo) {
    const salto = Math.abs(Math.sin(this.time.now / 90)) * 10; // little running hops
    if (this.marioStato === 'accanto') {
      // He follows the sled, on whichever side has room
      const lato = this.slitta.x > LARGHEZZA - 180 ? -100 : 100;
      this.mario.x = Phaser.Math.Linear(this.mario.x, this.slitta.x + lato, 0.12);
      this.mario.y = Phaser.Math.Linear(this.mario.y, 530, 0.12) - salto * 0.3;
      this.marioAttesa -= secondi;
      // Time for a dash (not in the last stretch before the finish line)
      if (this.marioAttesa <= 0 && this.percorso < SLITTA.PERCORSO - 2500) {
        this.marioStato = 'via';
        this.tweens.add({
          targets: this.mario, y: -120, duration: 600, ease: 'Quad.In',
          onComplete: () => this.time.delayedCall(500, () => this.marioScende()),
        });
      }
    } else if (this.marioStato === 'zigzag') {
      // Down the slope with the snow, a little faster, changing direction now and then
      this.mario.y += passo + 60 * secondi;
      this.mario.x += this.marioVerso * SLITTA.MARIO_ZIGZAG * secondi;
      this.marioCambio -= secondi;
      if (this.marioCambio <= 0 || this.mario.x < 90 || this.mario.x > LARGHEZZA - 90) {
        this.marioVerso = this.mario.x < 90 ? 1 : (this.mario.x > LARGHEZZA - 90 ? -1 : -this.marioVerso);
        this.marioCambio = Phaser.Math.FloatBetween(0.35, 0.8);
      }
      this.mario.setFlipX(this.marioVerso < 0);
      // Did the sled run into him? (his picture's position is his feet)
      const dx = Math.abs(this.mario.x - this.slitta.x);
      const dy = Math.abs(this.mario.y - 35 - this.slitta.y);
      if (dx < 55 && dy < 70 && !this.invulnerabile) {
        this.colpisciMario();
      } else if (this.mario.y > this.slitta.y + 150) {
        this.marioTorna(); // he ran past: back beside the sled
      }
    }
  }

  // Mario appears at the top of the slope and comes down zigzagging
  marioScende() {
    if (this.fase !== 'discesa') return;
    this.marioStato = 'zigzag';
    this.mario.setPosition(Phaser.Math.Between(200, LARGHEZZA - 200), -60);
    this.marioVerso = Math.random() < 0.5 ? -1 : 1;
    this.marioCambio = Phaser.Math.FloatBetween(0.35, 0.8);
    this.direMario(TESTI.slitta.miao, 900);
    suonaMiao(this);
  }

  marioTorna() {
    this.marioStato = 'accanto';
    this.mario.setFlipX(false);
    this.marioAttesa = Phaser.Math.FloatBetween(SLITTA.MARIO_OGNI[0], SLITTA.MARIO_OGNI[1]);
  }

  // The sled ran into Mario: like a tree, but he tumbles into a snowball and shakes it off
  colpisciMario() {
    this.marioStato = 'capriola';
    this.direMario(TESTI.slitta.miaoOffeso, 1200);
    suonaMiao(this);
    const scala = this.mario.scale;
    this.tweens.add({
      targets: this.mario, angle: 720, x: this.mario.x + this.marioVerso * 120, duration: 700, ease: 'Quad.Out',
      onComplete: () => {
        this.mario.setAngle(0);
        // shaking the snow off
        this.tweens.add({
          targets: this.mario, scaleX: scala * 1.15, duration: 70, yoyo: true, repeat: 4,
          onComplete: () => { this.mario.setScale(scala); this.marioTorna(); },
        });
      },
    });
    for (let i = 0; i < 10; i++) {
      const neve = this.add.circle(this.mario.x, this.mario.y - 30, Phaser.Math.Between(5, 11), 0xffffff).setDepth(11);
      this.tweens.add({
        targets: neve, x: neve.x + Phaser.Math.Between(-90, 90), y: neve.y + Phaser.Math.Between(-90, 40), alpha: 0,
        duration: 600, onComplete: () => neve.destroy(),
      });
    }
    this.urto();
  }

  colpisciAlbero(albero) {
    if (this.invulnerabile) return;
    this.tweens.add({ targets: albero, angle: 15, duration: 100, yoyo: true, repeat: 2 });
    this.urto();
  }

  // A crash (tree or Mario): lose a snowflake, slow down, a moment of safety
  urto() {
    this.vite -= 1;
    this.fiocchiVita[this.vite].setAlpha(0.2);
    suonaTonfo(this);
    this.cameras.main.shake(250, 0.012);
    this.velocita = SLITTA.VELOCITA_MINIMA;

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

// A big soft snowball painted in code (once): white with blue shadows on the lower right, a soft glow
// around it and a few sparkles. Returns the texture's name.
function creaPallaNeve(scena, diametro) {
  const nome = `pallaNeve_${diametro}`;
  if (!scena.textures.exists(nome)) {
    const margine = 26;
    const lato = diametro + margine * 2;
    const tela = scena.textures.createCanvas(nome, lato, lato);
    const ctx = tela.getContext();
    const c = lato / 2;
    const r = diametro / 2;
    ctx.shadowColor = 'rgba(255, 255, 255, 0.95)';
    ctx.shadowBlur = 24;
    const sfumatura = ctx.createRadialGradient(c - r * 0.35, c - r * 0.4, r * 0.1, c, c, r);
    sfumatura.addColorStop(0, 'rgba(255, 255, 255, 0.97)');
    sfumatura.addColorStop(0.65, 'rgba(240, 246, 253, 0.93)');
    sfumatura.addColorStop(1, 'rgba(190, 210, 236, 0.9)');
    ctx.fillStyle = sfumatura;
    ctx.beginPath();
    ctx.arc(c, c, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    // a few little lumps of snow on the edge, so it isn't a perfect circle
    ctx.fillStyle = 'rgba(244, 248, 254, 0.95)';
    [[0.2, 0.92, 0.16], [1.3, 0.9, 0.13], [2.4, 0.93, 0.15], [3.6, 0.9, 0.12], [4.8, 0.92, 0.14]].forEach(([a, d, s]) => {
      ctx.beginPath();
      ctx.arc(c + Math.cos(a) * r * d, c + Math.sin(a) * r * d, r * s, 0, Math.PI * 2);
      ctx.fill();
    });
    // sparkles
    ctx.fillStyle = 'rgba(255, 255, 255, 1)';
    [[-0.45, -0.5, 4], [0.4, -0.55, 3], [0.55, 0.35, 3], [-0.5, 0.45, 2.5]].forEach(([x, y, s]) => {
      ctx.beginPath();
      ctx.arc(c + x * r, c + y * r, s, 0, Math.PI * 2);
      ctx.fill();
    });
    tela.refresh();
  }
  return nome;
}
