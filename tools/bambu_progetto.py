"""
Turns the Mario ornament into a ready Bambu Studio project: Bambu Lab P2S 0.4, 0.20 mm Standard,
tree supports, and FOUR filaments (PLA Basic grey, white, red, black), each part already on its colour.

Bambu Studio itself (its command-line mode) builds the project, using its own built-in presets, so the
result is a genuine Bambu project file. Its presets build on each other ("inherits"); this tool first
combines each chain into one complete settings file, which is what the command-line mode needs.

How to run (from the project folder, after tools/mario_ornamento.py):
    .venv/bin/python tools/bambu_progetto.py
Result: assets/3d/Mario_ornamento_Bambu.3mf  (and, as a check, a sliced copy in the scratch folder)
"""

import json
import subprocess
import sys
import tempfile
from pathlib import Path

BAMBU = Path("/Applications/BambuStudio.app/Contents/MacOS/BambuStudio")
PROFILI = Path("/Applications/BambuStudio.app/Contents/Resources/profiles/BBL")
PROGETTO = Path(__file__).resolve().parent.parent
ENTRATA = PROGETTO / "assets" / "3d" / "mario_ornamento.3mf"
USCITA = PROGETTO / "assets" / "3d" / "Mario_ornamento_Bambu.3mf"

STAMPANTE = "Bambu Lab P2S 0.4 nozzle"
PROCESSO = "0.20mm Standard @BBL P2S"   # 0.12 fine: 17 h and 247 g; 0.20: 10 h and 157 g, almost the same look at this size
FILAMENTO = "Bambu PLA Basic @BBL P2S"
COLORI = [("Grigio", "#8E9089"), ("Bianco", "#FFFFFF"), ("Rosso", "#C12E1F"), ("Nero", "#000000")]


def completo(cartella, nome):
    """A preset with everything it inherits merged in (the preset's own values win)."""
    indice = {}
    for f in (PROFILI / cartella).glob("*.json"):
        try:
            indice[json.load(open(f)).get("name")] = f
        except Exception:
            pass
    catena = []
    while nome:
        dati = json.load(open(indice[nome]))
        catena.append(dati)
        nome = dati.get("inherits")
    risultato = {}
    for dati in reversed(catena):
        risultato.update(dati)
    risultato.pop("inherits", None)
    return risultato


# Settings that cut the waste of the colour changes (filament flushed at every change):
# the old colour is flushed into Mario's hidden infill and into the supports instead of only the prime tower.
RISPARMIO = {"flush_into_infill": "1", "flush_into_support": "1"}


def main(processo_nome=PROCESSO, extra=None, uscita=USCITA):
    cartella = Path(tempfile.mkdtemp(prefix="bambu-"))
    stampante = completo("machine", STAMPANTE)
    processo = completo("process", processo_nome)
    processo.update({"enable_support": "1", "support_type": "tree(auto)"})
    processo.update(extra or {})
    file_impostazioni = []
    for nome, dati in (("stampante", stampante), ("processo", processo)):
        dati["from"] = "system"
        p = cartella / f"{nome}.json"
        json.dump(dati, open(p, "w"), indent=2)
        file_impostazioni.append(str(p))
    file_filamenti = []
    for nome, colore in COLORI:
        f = completo("filament", FILAMENTO)
        f["from"] = "system"
        f["default_filament_colour"] = [colore]
        f["filament_colour"] = [colore]
        p = cartella / f"filamento_{nome}.json"
        json.dump(f, open(p, "w"), indent=2)
        file_filamenti.append(str(p))

    comune = [str(BAMBU), "--load-settings", ";".join(file_impostazioni),
              "--load-filaments", ";".join(file_filamenti), "--outputdir", str(cartella),
              "--arrange", "0", "--orient", "0"]   # keep Mario exactly as designed (no automatic turning)
    # 1. the project to open in Bambu Studio (not sliced)
    r = subprocess.run(comune + ["--export-3mf", "progetto.3mf", str(ENTRATA)], capture_output=True, text=True, timeout=600)
    print("export:", "ok" if r.returncode == 0 else f"exit {r.returncode}")
    (cartella / "progetto.3mf").replace(uscita)
    # 2. a check: slice it, to be sure it prints with all four filaments
    r = subprocess.run(comune + ["--slice", "0", "--export-3mf", "prova_affettata.3mf", str(uscita)],
                       capture_output=True, text=True, timeout=900)
    print("slice check:", "ok" if r.returncode == 0 else f"exit {r.returncode}")
    riassunto(cartella / "prova_affettata.3mf")
    return 0


def riassunto(affettato):
    """Print time, total filament and filament per colour from a sliced project."""
    import re
    import zipfile
    info = zipfile.ZipFile(affettato).read("Metadata/slice_info.config").decode()
    secondi = int(re.search(r'key="prediction" value="(\d+)"', info).group(1))
    peso = float(re.search(r'key="weight" value="([\d.]+)"', info).group(1))
    per_colore = re.findall(r'color="(#\w+)" used_m="[\d.]+" used_g="([\d.]+)"', info)
    print(f"  time {secondi // 3600} h {secondi % 3600 // 60} min | filament {peso:.0f} g | " +
          ", ".join(f"{c} {g} g" for c, g in per_colore))


if __name__ == "__main__":
    sys.exit(main())
