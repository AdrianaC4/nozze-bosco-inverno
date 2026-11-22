"""
Stretches a sound to a new length WITHOUT changing its pitch (it doesn't get lower like a slowed-down record).
Used for the shimmer while the tree lights up in La Cerimonia (4.5 s -> 8 s, the time it takes to light it).

How to run (from the project folder):
    .venv/bin/python tools/allunga_suono.py <input.mp3> <output.m4a> <seconds>

It uses macOS's own `afconvert` to read and write audio, and numpy (already in .venv) for the stretching:
the sound is cut into small overlapping slices that are spread further apart and blended back together
("overlap-add"), with each slice lined up to the previous one so the result stays smooth.
"""

import subprocess
import sys
import tempfile
import wave
from pathlib import Path

import numpy as np


def leggi(percorso):
    """Any audio file -> (samples as floats, mono, 44.1 kHz)."""
    with tempfile.TemporaryDirectory() as cartella:
        wav = Path(cartella) / "letto.wav"
        subprocess.run(["afconvert", "-f", "WAVE", "-d", "LEI16@44100", "-c", "1", str(percorso), str(wav)], check=True)
        with wave.open(str(wav)) as f:
            dati = np.frombuffer(f.readframes(f.getnframes()), dtype=np.int16).astype(np.float32) / 32768
            return dati, f.getframerate()


def scrivi(dati, frequenza, percorso):
    """Samples -> AAC in an .m4a file (plays on iPhone and Android)."""
    with tempfile.TemporaryDirectory() as cartella:
        wav = Path(cartella) / "scritto.wav"
        with wave.open(str(wav), "wb") as f:
            f.setnchannels(1)
            f.setsampwidth(2)
            f.setframerate(frequenza)
            f.writeframes((np.clip(dati, -1, 1) * 32767).astype(np.int16).tobytes())
        subprocess.run(["afconvert", "-f", "m4af", "-d", "aac", "-b", "96000", str(wav), str(percorso)], check=True)


def allunga(dati, fattore, frequenza):
    """WSOLA: slices of 60 ms, each placed `fattore` times further apart, lined up by best overlap."""
    finestra = int(0.06 * frequenza)
    passo_uscita = finestra // 2
    passo_entrata = passo_uscita / fattore
    tolleranza = finestra // 4
    hann = np.hanning(finestra).astype(np.float32)
    lunghezza = int(len(dati) * fattore) + finestra
    uscita = np.zeros(lunghezza, dtype=np.float32)
    pesi = np.zeros(lunghezza, dtype=np.float32)
    dati = np.concatenate([dati, np.zeros(finestra * 2, dtype=np.float32)])
    precedente = 0
    k = 0
    while True:
        centro = int(k * passo_entrata)
        if centro + finestra + tolleranza >= len(dati):
            break
        # line this slice up with what naturally followed the previous one
        if k > 0:
            atteso = dati[precedente + passo_uscita: precedente + passo_uscita + finestra]
            migliore, scarto_migliore = centro, -1e9
            for s in range(max(0, centro - tolleranza), centro + tolleranza, 8):
                somiglianza = float(np.dot(atteso, dati[s: s + finestra]))
                if somiglianza > scarto_migliore:
                    migliore, scarto_migliore = s, somiglianza
            centro = migliore
        pos = k * passo_uscita
        if pos + finestra > lunghezza:
            break
        uscita[pos: pos + finestra] += dati[centro: centro + finestra] * hann
        pesi[pos: pos + finestra] += hann
        precedente = centro
        k += 1
    pesi[pesi < 1e-3] = 1
    return uscita / pesi


def main():
    if len(sys.argv) != 4:
        print(__doc__)
        return 1
    entrata, uscita_file, secondi = sys.argv[1], sys.argv[2], float(sys.argv[3])
    dati, frequenza = leggi(entrata)
    fattore = secondi * frequenza / len(dati)
    risultato = allunga(dati, fattore, frequenza)[: int(secondi * frequenza)]
    # gentle fade-out in the last 0.3 s, so it never ends with a click
    coda = int(0.3 * frequenza)
    risultato[-coda:] *= np.linspace(1, 0, coda, dtype=np.float32)
    scrivi(risultato, frequenza, uscita_file)
    print(f"{len(dati) / frequenza:.2f} s -> {len(risultato) / frequenza:.2f} s (x{fattore:.2f}), saved {uscita_file}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
