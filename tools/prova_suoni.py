"""
Checks the real sound files (Mario's meow, the tree shimmer, the victory stars) and the microphone switch-off.
Used by Claude. Needs the test server on port 8000.

    .venv/bin/python tools/prova_suoni.py
"""

import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from prova import Gioco  # noqa: E402

OPZIONI = ["--autoplay-policy=no-user-gesture-required",
           "--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream"]

# Records every sound file started, with the moment it starts
SPIA = """(() => { window.__suoni = []; const m = gioco.sound; const orig = m.play.bind(m);
  m.play = (k, c) => { window.__suoni.push(k); return orig(k, c); };
  const add = m.add.bind(m); m.add = (k, c) => { const s = add(k, c); const p = s.play.bind(s);
    s.play = (c2) => { window.__suoni.push(k + '@' + (c2 && c2.seek !== undefined ? c2.seek.toFixed(1) : '0')); return p(c2); }; return s; }; })()"""

with Gioco(porta=9420, opzioni_chrome=OPZIONI) as g:
    g.apri("?scena=Cerimonia", attesa=3)
    print("file caricati:", g.ev("JSON.stringify(['miao','luce_albero','vittoria_stelle'].map(k => k + ':' + gioco.cache.audio.exists(k)))"))
    print("durata dello scintillio:", g.ev("(() => { const s = gioco.sound.add('luce_albero'); const d = s.duration; s.destroy(); return Math.round(d * 10) / 10; })()"), "s")
    g.ev(SPIA)
    g.accarezza_mario(volte=3, attesa=2.5)
    C = "gioco.scene.getScene('Cerimonia')"
    S, F = [1, 300, 450], [2, 980, 450]
    g.tocco("touchstart", [S], [S]); g.tocco("touchstart", [F], [S, F])
    time.sleep(2)
    print("tenendo 2 s: suona lo scintillio:", g.ev(f"!!({C}.scintillio && {C}.scintillio.isPlaying)"), "| luce:", g.ev(f"Math.round({C}.luce * 100) / 100"))
    g.tocco("touchend", [F], [S])
    time.sleep(0.5)
    print("Francesco lascia: suona ancora:", g.ev(f"!!({C}.scintillio && {C}.scintillio.isPlaying)"))
    g.tocco("touchstart", [F], [S, F])
    time.sleep(7)
    g.tocco("touchend", [S, F], [])
    time.sleep(1)
    print("suoni partiti nella cerimonia:", g.ev("JSON.stringify(window.__suoni)"))

    # The meow, and the microphone switched off after a won flight
    g.apri("?scena=Slitta", attesa=3)
    g.ev(SPIA)
    g.ev("suonaMiao(gioco.scene.getScene('Slitta'))")
    print("miao:", g.ev("JSON.stringify(window.__suoni)"))
    g.apri("?scena=Dirigibile", attesa=3)
    g.ev("DIRIGIBILE.ATTESA_MICROFONO = 1")
    g.accarezza_mario()
    time.sleep(1.5)
    D = "gioco.scene.getScene('Dirigibile')"
    print("dirigibile: microfono in uso:", g.ev(f"{D}.usaMicrofono"))
    g.ev(f"(() => {{ const s = {D}; s.lanterne = 12; s.anelliPassati = 16; }})()")
    time.sleep(2)
    print("dopo la vittoria: microfono spento:", g.ev("!Microfono.flusso"), "| audio:", g.ev("gioco.sound.context.state"))
    print("errori:", g.errori or "nessuno")
