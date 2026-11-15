"""
Automatic play-testing helper: drives the game in a hidden Google Chrome with iPhone-style touches,
runs small checks and takes screenshots. Used by Claude; kept in the project so it survives restarts.

It needs: Google Chrome installed, the test server running on port 8000 (python3 tools/server.py),
and `websocket-client` in the tools environment (.venv/bin/pip install websocket-client).

How to run (from the project folder):
    .venv/bin/python tools/prova.py schermate <folder>   # screenshots of title, story panels and ending

Other scripts can also use it:
    from prova import Gioco
    with Gioco() as g:
        g.apri("?scena=Slitta"); g.accarezza_mario(); print(g.ev("gioco.scene.getScene('Slitta').fase"))
"""

import base64
import json
import subprocess
import sys
import tempfile
import time
import urllib.request

import websocket  # pip package: websocket-client

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
INDIRIZZO = "http://localhost:8000/"

# Sends a real TouchEvent to the game's canvas, in game coordinates (1280 x 720), like a finger on an iPhone.
# (pageX/pageY must be set: Phaser reads them.)
SCRIPT_TOCCO = """window.__tocca = (tipo, cambiati, attivi) => {
  const c = document.querySelector('canvas'); const r = c.getBoundingClientRect();
  const mk = ([id, x, y]) => { const cx = r.left + x * r.width / 1280, cy = r.top + y * r.height / 720;
    return new Touch({identifier: id, target: c, clientX: cx, clientY: cy, pageX: cx + scrollX, pageY: cy + scrollY, screenX: cx, screenY: cy}); };
  c.dispatchEvent(new TouchEvent(tipo, {bubbles: true, cancelable: true, touches: attivi.map(mk), targetTouches: attivi.map(mk), changedTouches: cambiati.map(mk)}));
};"""


class Gioco:
    def __init__(self, porta=9400, larghezza=1280, altezza=720, opzioni_chrome=()):
        self.porta = porta
        self.larghezza, self.altezza = larghezza, altezza
        self.opzioni = list(opzioni_chrome)
        self.errori = []
        self._n = 0

    def __enter__(self):
        cartella = tempfile.mkdtemp(prefix="nozze-prova-")
        self.proc = subprocess.Popen(
            [CHROME, "--headless=new", f"--remote-debugging-port={self.porta}",
             f"--remote-allow-origins=http://localhost:{self.porta}", f"--user-data-dir={cartella}",
             "--hide-scrollbars", *self.opzioni, "about:blank"],
            stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        for _ in range(60):
            try:
                pagine = json.load(urllib.request.urlopen(f"http://localhost:{self.porta}/json"))
                pagina = [p for p in pagine if p["type"] == "page"][0]
                break
            except Exception:
                time.sleep(0.2)
        self.ws = websocket.create_connection(pagina["webSocketDebuggerUrl"], timeout=30,
                                              origin=f"http://localhost:{self.porta}")
        self.cmd("Runtime.enable")
        self.cmd("Page.enable")
        self.cmd("Emulation.setDeviceMetricsOverride", width=self.larghezza, height=self.altezza,
                 deviceScaleFactor=1, mobile=True)
        self.cmd("Emulation.setTouchEmulationEnabled", enabled=True, maxTouchPoints=5)
        self.cmd("Page.addScriptToEvaluateOnNewDocument", source=SCRIPT_TOCCO)
        return self

    def __exit__(self, *_):
        self.proc.terminate()

    def cmd(self, metodo, **parametri):
        self._n += 1
        numero = self._n
        self.ws.send(json.dumps({"id": numero, "method": metodo, "params": parametri}))
        while True:
            m = json.loads(self.ws.recv())
            if m.get("method") == "Runtime.exceptionThrown":
                dettagli = m["params"]["exceptionDetails"]
                self.errori.append(dettagli.get("exception", {}).get("description", str(dettagli)))
            if m.get("method") == "Runtime.consoleAPICalled" and m["params"]["type"] == "error":
                self.errori.append("console: " + " ".join(str(a.get("value", a.get("description"))) for a in m["params"]["args"]))
            if m.get("id") == numero:
                return m.get("result", {})

    def ev(self, js):
        """Runs JavaScript in the page and returns its value."""
        return self.cmd("Runtime.evaluate", expression=js, returnByValue=True).get("result", {}).get("value")

    def apri(self, coda="", attesa=2.5):
        """Opens the game; coda is what follows the address, e.g. "?scena=Torta"."""
        self.cmd("Page.navigate", url=INDIRIZZO + coda)
        time.sleep(attesa)

    def foto(self, percorso):
        dati = self.cmd("Page.captureScreenshot", format="png")["data"]
        with open(percorso, "wb") as f:
            f.write(base64.b64decode(dati))

    def tocco(self, tipo, cambiati, attivi):
        """tipo: touchstart / touchmove / touchend. Fingers are [id, x, y] in game coordinates."""
        self.ev("window.__tocca(%s, %s, %s)" % (json.dumps(tipo), json.dumps(cambiati), json.dumps(attivi)))

    def tocca(self, x, y, dito=7):
        """One quick tap."""
        self.tocco("touchstart", [[dito, x, y]], [[dito, x, y]])
        self.tocco("touchend", [[dito, x, y]], [])

    def due_dita(self):
        """Both players touch their half together and lift (starts the game from the title)."""
        self.tocco("touchstart", [[1, 300, 450]], [[1, 300, 450]])
        self.tocco("touchstart", [[2, 980, 450]], [[1, 300, 450], [2, 980, 450]])
        time.sleep(0.2)
        self.tocco("touchend", [[1, 300, 450], [2, 980, 450]], [])

    def accarezza_mario(self, volte=1, attesa=2.2):
        """Strokes Mario on a start card."""
        for _ in range(volte):
            self.tocco("touchstart", [[5, 580, 430]], [[5, 580, 430]])
            for k in range(1, 9):
                self.tocco("touchmove", [[5, 580 + k * 15, 430]], [[5, 580 + k * 15, 430]])
                time.sleep(0.03)
            self.tocco("touchend", [[5, 700, 430]], [])
            time.sleep(1.2)
        time.sleep(attesa - 1.2)

    def scene_attive(self):
        return self.ev("JSON.stringify(gioco.scene.getScenes(true).map(s => s.scene.key))")


def schermate(cartella):
    """Screenshots of the title, the four story panels and the ending, to check texts and layout."""
    with Gioco() as g:
        g.apri("?reset=1")
        g.foto(f"{cartella}/1_titolo.png")
        g.apri("?scena=Intro", attesa=1.5)
        for pannello in range(1, 5):
            g.tocca(640, 360)          # first tap: show the whole sentence
            time.sleep(1.3)
            g.foto(f"{cartella}/2_storia_{pannello}.png")
            g.tocca(640, 360)          # second tap: next panel
            time.sleep(1.2)
        g.apri("?scena=Cerimonia", attesa=2)
        g.accarezza_mario(volte=3, attesa=2.5)
        g.ev("(() => { const s = gioco.scene.getScene('Cerimonia'); s.luce = 0.999; "
             "s.dita.set(91, {lato: 'silvia', bagliore: s.add.circle(0, 0, 1)}); "
             "s.dita.set(92, {lato: 'francesco', bagliore: s.add.circle(0, 0, 1)}); })()")
        time.sleep(13)
        g.foto(f"{cartella}/3_finale.png")
        print("scene:", g.scene_attive(), "| errori:", g.errori or "nessuno")


if __name__ == "__main__":
    if len(sys.argv) == 3 and sys.argv[1] == "schermate":
        schermate(sys.argv[2])
    else:
        print(__doc__)
