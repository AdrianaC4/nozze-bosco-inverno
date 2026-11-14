"""
Cut out character images: remove the background, trim the empty space, resize,
and save as transparent PNGs for the game.

Originals in assets/raw/ are only read, never changed.

How to run (from the project folder):
    .venv/bin/python tools/ritaglia.py                    # all character images
    .venv/bin/python tools/ritaglia.py silvia_sheet       # just one (name without .jpg)
    .venv/bin/python tools/ritaglia.py --modello u2net mario_rings   # try another AI model

Default model is birefnet-general: isnet-general-use made Mario's white chest see-through.

Results go to assets/game/<name>.png
"""

import argparse
import sys
from pathlib import Path

from PIL import Image
from rembg import new_session, remove

CARTELLA_PROGETTO = Path(__file__).resolve().parent.parent
CARTELLA_RAW = CARTELLA_PROGETTO / "assets" / "raw"
CARTELLA_GAME = CARTELLA_PROGETTO / "assets" / "game"

# Character images to cut out (backgrounds like style_anchor are NOT cut out)
PERSONAGGI = [
    "silvia_sheet", "silvia_cheer", "silvia_oops",
    "francesco_sheet", "francesco_cheer", "francesco_oops",
    "mario_sheet", "mario_proud", "mario_guilty", "mario_rings",
]

ALTEZZA_MASSIMA = 600  # pixels; the game screen is 720 tall, characters are shown smaller
MARGINE = 6            # empty pixels kept around the character after trimming


def ritaglia(nome, sessione):
    sorgente = CARTELLA_RAW / f"{nome}.jpg"
    if not sorgente.exists():
        print(f"  !! missing: {sorgente.name}")
        return
    immagine = Image.open(sorgente).convert("RGB")

    # 1. Remove the background (the AI model decides what is "character")
    ritagliata = remove(immagine, session=sessione)

    # 2. Trim the empty transparent space around the character
    alfa = ritagliata.getchannel("A")
    riquadro = alfa.point(lambda v: 255 if v > 12 else 0).getbbox()
    if riquadro is None:
        print(f"  !! nothing found in {nome}")
        return
    sx, su, dx, giu = riquadro
    sx, su = max(sx - MARGINE, 0), max(su - MARGINE, 0)
    dx, giu = min(dx + MARGINE, ritagliata.width), min(giu + MARGINE, ritagliata.height)
    ritagliata = ritagliata.crop((sx, su, dx, giu))

    # 3. Resize so it is never taller than ALTEZZA_MASSIMA (never enlarged)
    if ritagliata.height > ALTEZZA_MASSIMA:
        scala = ALTEZZA_MASSIMA / ritagliata.height
        ritagliata = ritagliata.resize(
            (round(ritagliata.width * scala), ALTEZZA_MASSIMA), Image.LANCZOS
        )

    destinazione = CARTELLA_GAME / f"{nome}.png"
    ritagliata.save(destinazione, optimize=True)
    print(f"  ok {destinazione.relative_to(CARTELLA_PROGETTO)}  ({ritagliata.width}x{ritagliata.height})")


def main():
    parser = argparse.ArgumentParser(description="Cut out character images for the game.")
    parser.add_argument("nomi", nargs="*", help="image names without .jpg (default: all characters)")
    parser.add_argument("--modello", default="birefnet-general",
                        help="rembg AI model: birefnet-general (default, best on white fur), isnet-general-use, u2net...")
    argomenti = parser.parse_args()

    nomi = argomenti.nomi or PERSONAGGI
    CARTELLA_GAME.mkdir(parents=True, exist_ok=True)
    print(f"Model: {argomenti.modello}")
    sessione = new_session(argomenti.modello)
    for nome in nomi:
        ritaglia(nome, sessione)


if __name__ == "__main__":
    sys.exit(main())
