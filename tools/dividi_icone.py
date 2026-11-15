"""
Cut ONE image with several objects in a row into separate transparent pictures.

It removes the background (like ritaglia.py), finds the empty columns between the objects,
and saves each object, trimmed and resized, as its own PNG in assets/game/.
The original in assets/raw/ is only read, never changed.

How to run (from the project folder):
    .venv/bin/python tools/dividi_icone.py icone_anelli tile_campana tile_stella tile_pallina tile_bastoncino tile_guanto tile_anelli

The first name is the image in assets/raw/ (without .jpg); the others are the names for the
objects, from left to right. The number of names must match the number of objects found.
"""

import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

CARTELLA_PROGETTO = Path(__file__).resolve().parent.parent
CARTELLA_RAW = CARTELLA_PROGETTO / "assets" / "raw"
CARTELLA_GAME = CARTELLA_PROGETTO / "assets" / "game"

LATO_MASSIMO = 220   # pixels: the biggest side of each saved object
SPAZIO_MINIMO = 8    # empty columns needed between two objects
MARGINE = 6


def main():
    if len(sys.argv) < 3:
        print(__doc__)
        return 1
    sorgente, nomi = sys.argv[1], sys.argv[2:]
    immagine = Image.open(CARTELLA_RAW / f"{sorgente}.jpg").convert("RGB")
    ritagliata = remove(immagine, session=new_session("birefnet-general"))
    alfa = ritagliata.getchannel("A").point(lambda v: 255 if v > 30 else 0)
    larghezza, altezza = ritagliata.size

    # Find groups of columns that contain something, separated by empty columns
    piene = [alfa.crop((x, 0, x + 1, altezza)).getbbox() is not None for x in range(larghezza)]
    gruppi = []
    inizio = None
    vuote = 0
    for x, piena in enumerate(piene + [False] * SPAZIO_MINIMO):
        if piena:
            if inizio is None:
                inizio = x
            vuote = 0
            fine = x
        elif inizio is not None:
            vuote += 1
            if vuote >= SPAZIO_MINIMO:
                gruppi.append((inizio, fine + 1))
                inizio = None
    # Ignore tiny specks (smaller than 15 pixels wide)
    gruppi = [g for g in gruppi if g[1] - g[0] >= 15]

    print(f"Found {len(gruppi)} objects")
    if len(gruppi) != len(nomi):
        print(f"!! expected {len(nomi)} names, found {len(gruppi)} objects: nothing saved")
        return 1

    CARTELLA_GAME.mkdir(parents=True, exist_ok=True)
    for (sx, dx), nome in zip(gruppi, nomi):
        pezzo = ritagliata.crop((sx, 0, dx, altezza))
        riquadro = pezzo.getchannel("A").point(lambda v: 255 if v > 30 else 0).getbbox()
        a, b, c, d = riquadro
        pezzo = pezzo.crop((max(a - MARGINE, 0), max(b - MARGINE, 0), min(c + MARGINE, pezzo.width), min(d + MARGINE, pezzo.height)))
        scala = min(1, LATO_MASSIMO / max(pezzo.size))
        if scala < 1:
            pezzo = pezzo.resize((round(pezzo.width * scala), round(pezzo.height * scala)), Image.LANCZOS)
        destinazione = CARTELLA_GAME / f"{nome}.png"
        pezzo.save(destinazione, optimize=True)
        print(f"  ok {destinazione.relative_to(CARTELLA_PROGETTO)}  ({pezzo.width}x{pezzo.height})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
