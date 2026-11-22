"""
Checks for the changes of 22 November 2026 (Adri's list after publishing). Used by Claude.

    .venv/bin/python tools/prova_modifiche.py <folder for screenshots> [android]

With "android" the page pretends to be an Android phone (Chrome on a Pixel, 915 x 412 landscape).
Needs the test server on port 8000 (python3 tools/server.py).
"""

import json
import sys
import time

sys.path.insert(0, __file__.rsplit("/", 1)[0])
from prova import Gioco  # noqa: E402

cartella = sys.argv[1]
android = len(sys.argv) > 2 and sys.argv[2] == "android"
UA_ANDROID = ("Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) "
              "Chrome/131.0.0.0 Mobile Safari/537.36")

with Gioco(porta=9410 if android else 9411) as g:
    if android:
        g.cmd("Emulation.setUserAgentOverride", userAgent=UA_ANDROID, platform="Linux armv8l")
        g.cmd("Emulation.setDeviceMetricsOverride", width=915, height=412, deviceScaleFactor=2.6, mobile=True,
              screenOrientation={"type": "landscapePrimary", "angle": 90})
    pre = "android_" if android else ""

    # ---- Title
    g.apri("?reset=1")
    print("titolo:", g.ev("gioco.scene.getScene('Titolo').invito.text"))
    print("manifest:", g.ev("document.querySelector('link[rel=manifest]') && document.querySelector('link[rel=manifest]').href"))
    g.due_dita()
    time.sleep(1.5)
    print("dopo il via:", g.scene_attive())

    # ---- La Slitta: Francesco's box pushes, elsewhere doesn't; Silvia's band steers, elsewhere doesn't
    g.apri("?scena=Slitta")
    g.accarezza_mario()
    S = "gioco.scene.getScene('Slitta')"
    g.ev(f"{S}.velocita = 300")
    g.tocca(1125, 215)
    v1 = g.ev(f"{S}.velocita")
    g.tocca(1125, 400)                      # right half but outside the snowball: must NOT push
    v2 = g.ev(f"{S}.velocita")
    print(f"slitta: tocco nel riquadro {300}->{round(v1)} (deve salire), fuori dal riquadro {round(v1)}->{round(v2)} (non deve salire)")
    def trascina(x, y, verso):
        g.tocco("touchstart", [[9, x, y]], [[9, x, y]])
        for k in range(1, 8):
            g.tocco("touchmove", [[9, x + verso * k * 20, y]], [[9, x + verso * k * 20, y]])
            time.sleep(0.03)
        g.tocco("touchend", [[9, x + verso * 140, y]], [])
    x0 = g.ev(f"Math.round({S}.slitta.x)"); trascina(900, 650, -1); x1 = g.ev(f"Math.round({S}.slitta.x)")
    trascina(300, 350, 1); x2 = g.ev(f"Math.round({S}.slitta.x)")
    trascina(300, 250, 1); x3 = g.ev(f"Math.round({S}.slitta.x)")
    print(f"slitta: trascina in basso a destra {x0}->{x1} (deve muoversi), a meta' schermo {x1}->{x2} (deve muoversi), in alto {x2}->{x3} (non deve)")
    time.sleep(0.5)
    g.foto(f"{cartella}/{pre}slitta.png")

    # ---- La Torta: no push at drops; the hint stays until Mario is tapped
    g.apri("?scena=Torta")
    g.accarezza_mario()
    T = "gioco.scene.getScene('Torta')"
    g.ev(f"(() => {{ const s = {T}; s.velocitaInclinazione = 0; s.inclinazione = 0; s.deriva = 0; }})()")
    g.ev(f"{T}.mobile.x = {T}.cima.x + 60")
    g.tocca(300, 300)
    time.sleep(0.3)
    print("torta: spinta dopo una caduta storta (deve essere ~0):", g.ev(f"Math.round({T}.velocitaInclinazione * 100) / 100"))
    g.ev(f"{T}.marioSalta()")
    time.sleep(8)
    print("torta: dopo 8 s Mario e' ancora sul tavolo:", g.ev(f"{T}.marioSulTavolo"), "| scritta ancora visibile:",
          g.ev(f"!!({T}.testoScaccia && {T}.testoScaccia.active)"))
    g.foto(f"{cartella}/{pre}torta.png")
    g.tocca(400, 480)
    time.sleep(0.6)
    print("torta: dopo il tocco su Mario, sul tavolo:", g.ev(f"{T}.marioSulTavolo"), "| scritta:",
          g.ev(f"!!({T}.testoScaccia && {T}.testoScaccia.active)"))

    # ---- Gli Anelli: a matching pair turns green by itself; a wrong pair hides after about 1 second
    g.apri("?scena=Anelli")
    g.accarezza_mario()
    A = "gioco.scene.getScene('Anelli')"
    apri = f"""(i) => {{ const s = {A}; const c = s.celle[i]; s.inRottura = c; c.stato = 'rompendo'; s.punti = []; s.ghiaccioRotto(); }}"""
    g.ev(f"window.__apri = {apri}")
    indici = json.loads(g.ev(f"""(() => {{ const s = {A}; const a = s.celle.findIndex(c => c.tipo === 'stella');
        const b = s.celle.findIndex((c, i) => i !== a && c.tipo === 'stella'); const x = s.celle.findIndex(c => c.tipo === 'guanto');
        const y = s.celle.findIndex(c => c.tipo === 'campana'); return JSON.stringify([a, b, x, y]); }})()"""))
    g.ev(f"__apri({indici[0]}); __apri({indici[1]})")
    print("anelli: coppia uguale ->", g.ev(f"JSON.stringify([{A}.celle[{indici[0]}].stato, {A}.celle[{indici[1]}].stato, {A}.trovate])"), "(deve essere trovata, trovata, 1)")
    g.ev(f"__apri({indici[2]}); __apri({indici[3]})")
    time.sleep(0.6)
    meta = g.ev(f"{A}.celle[{indici[2]}].stato")
    time.sleep(0.8)
    dopo = g.ev(f"{A}.celle[{indici[2]}].stato")
    print(f"anelli: coppia diversa dopo 0.6 s: {meta} (scoperta), dopo 1.4 s: {dopo} (ghiaccio)")
    g.foto(f"{cartella}/{pre}anelli.png")

    # ---- Il Dirigibile: faces left (propeller on the right), arrows, nose up when climbing
    g.apri("?scena=Dirigibile")
    g.ev("DIRIGIBILE.ATTESA_MICROFONO = 1")
    g.accarezza_mario()
    time.sleep(1.5)
    D = "gioco.scene.getScene('Dirigibile')"
    print("dirigibile: elica a destra del centro:", g.ev(f"(() => {{ const s = {D}; return s.elica.getWorldTransformMatrix().tx > s.nave.x; }})()"))
    g.ev(f"{D}.carica = 0")
    for _ in range(20):
        g.ev(f"{D}.carica += 0.6")   # pretend Francesco cranks fast: the airship climbs
        time.sleep(0.05)
    print("dirigibile: mentre sale, angolo (deve essere positivo = muso in su verso sinistra):", g.ev(f"Math.round({D}.nave.angle * 10) / 10"))
    time.sleep(0.5)
    g.foto(f"{cartella}/{pre}dirigibile.png")

    # ---- The microphone: asked during the stroke; without a microphone, the retry button with the reason
    g.apri("?scena=Dirigibile")
    g.ev("DIRIGIBILE.ATTESA_MICROFONO = 1")
    g.ev("window.__chiesto = 0; const o = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices); "
         "navigator.mediaDevices.getUserMedia = (c) => { window.__chiesto += 1; if (window.__chiesto === 1) window.__durante = !!gioco.scene.getScene('Dirigibile').children.list.find(x => x.depth === 100); return o(c); };")
    g.accarezza_mario()
    time.sleep(1.5)
    print("microfono: chiesto", g.ev("window.__chiesto"), "volta/e, durante la carta:", g.ev("window.__durante"),
          "| in uso:", g.ev(f"{D}.usaMicrofono"), "| motivo:", g.ev("Microfono.ultimoErrore"),
          "| bottone riprova:", g.ev(f"!!({D}.bottoneMic && {D}.bottoneMic.active)"))
    g.tocca(1110, 110)
    time.sleep(1)
    print("microfono: dopo il tocco su 'Prova il microfono', chiesto", g.ev("window.__chiesto"), "volte")
    g.foto(f"{cartella}/{pre}dirigibile_senza_mic.png")

    print("errori:", g.errori or "nessuno")
