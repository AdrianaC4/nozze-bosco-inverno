"""
Mario as a Christmas ornament, built from scratch in code, for a multicolour 3D print (Bambu Lab P2S + AMS).

He sits, with his red scarf and his SHORT STUB TAIL, a hanging loop on his head, and a round recess under
the base for the 25 mm NFC tag (open at the bottom: press the tag in, a drop of glue keeps it there).

How to run (from the project folder):
    .venv/bin/python tools/mario_ornamento.py              # tag 1.2 mm thick (default)
    .venv/bin/python tools/mario_ornamento.py 2.0          # tag thickness in mm, if different

It writes four files in assets/3d/, one per colour, which Bambu Studio loads as ONE object with four parts:
    mario_1_grigio.stl, mario_2_bianco.stl, mario_3_rosso.stl, mario_4_nero.stl
plus a preview picture assets/3d/anteprima.png.

All sizes are in millimetres. z = up, the front of Mario looks towards -y.
"""

import sys
from pathlib import Path

import numpy as np
import trimesh

CARTELLA = Path(__file__).resolve().parent.parent / "assets" / "3d"

# ---- Main sizes (change these to adjust him)
ALTEZZA_FINALE = 64.0   # total height including the loop, after scaling
TAG_DIAMETRO = 25.0     # the NFC tag
TAG_GIOCO = 0.4         # extra room around the tag, so it presses in snugly (with a drop of glue)


def ellissoide(centro, raggi, dettaglio=5):
    m = trimesh.creation.icosphere(subdivisions=dettaglio)
    m.apply_scale(raggi)
    m.apply_translation(centro)
    return m


def unione(parti):
    return trimesh.boolean.union(parti, engine="manifold")


def meno(a, b):
    return trimesh.boolean.difference([a, b], engine="manifold")


def con(a, b):
    return trimesh.boolean.intersection([a, b], engine="manifold")


def ruota(mesh, gradi, asse, centro):
    mesh.apply_transform(trimesh.transformations.rotation_matrix(np.radians(gradi), asse, centro))
    return mesh


def costruisci(spessore_tag):
    # ---------------- shapes, before deciding colours
    corpo = ellissoide((0, 0.5, 9), (18, 16, 18))            # round sitting body
    testa = ellissoide((0, -1, 38), (15.5, 13.5, 13))        # big round head
    orecchie = []
    for lato in (-1, 1):
        o = trimesh.creation.cone(radius=5.4, height=11, sections=48)
        o.apply_scale((1, 0.6, 1))                            # flatter front to back, like a real ear
        ruota(o, 20 * lato, (0, 1, 0), (0, 0, 0))             # tip tilted outwards
        o.apply_translation((8.6 * lato, -1, 44.5))
        orecchie.append(o)
    coda = ellissoide((0, 15.5, 6), (5, 4.5, 4.5))            # the SHORT stub tail (a little round tuft)
    # round shoulders under the scarf, so the scarf rests on him instead of floating (printable without supports)
    spalle = ellissoide((0, -0.5, 21.5), (14.8, 13.8, 7.5))
    anello = trimesh.creation.torus(major_radius=4.2, minor_radius=1.5, major_sections=64, minor_sections=24)
    ruota(anello, 90, (1, 0, 0), (0, 0, 0))                   # standing up, so the string passes through
    anello.apply_translation((0, -1, 54.5))

    # white parts: chest, front paws, muzzle and the blaze between the eyes (they stick out a little)
    petto = ellissoide((0, -9.5, 13), (10.5, 8, 12))
    zampe = [ellissoide((5.8 * l, -13.5, 3), (4.6, 5.2, 4.2)) for l in (-1, 1)]
    muso = ellissoide((0, -11.6, 33.8), (6.6, 4.0, 4.6))     # a small soft muzzle (smaller: the big one looked like a dog)
    striscia = ellissoide((0, -13.2, 41), (2.4, 1.6, 6))     # thin blaze, just on the surface

    # red: scarf (a ring around the neck + the hanging end), and the little nose
    sciarpa_anello = trimesh.creation.torus(major_radius=13.2, minor_radius=2.9, major_sections=96, minor_sections=24)
    sciarpa_anello.apply_scale((1.0, 0.95, 0.8))
    sciarpa_anello.apply_translation((0, -0.5, 26.5))
    sciarpa_coda = trimesh.creation.capsule(height=7, radius=2.8, count=[32, 16])   # a soft rounded scarf end
    sciarpa_coda.apply_scale((1.05, 0.55, 1))
    ruota(sciarpa_coda, 10, (0, 1, 0), (0, 0, 0))
    sciarpa_coda.apply_translation((7.2, -13.6, 20.8))
    naso = ellissoide((0, -15.3, 35.9), (1.6, 1.2, 1.2), dettaglio=3)

    # black: the eyes
    occhi = [ellissoide((5.6 * l, -13.0, 39.5), (2.1, 1.4, 2.5), dettaglio=3) for l in (-1, 1)]

    # ---------------- colours, without overlaps: each colour gets what higher colours didn't take
    nero = unione(occhi)
    rosso = meno(unione([sciarpa_anello, sciarpa_coda, naso]), nero)
    bianco = meno(meno(unione([petto, muso, striscia] + zampe), rosso), nero)
    grigio = unione([corpo, testa, coda, anello, spalle] + orecchie)
    for sopra in (bianco, rosso, nero):
        grigio = meno(grigio, sopra)

    # ---------------- flat bottom
    sotto = trimesh.creation.box(extents=(200, 200, 200))
    sotto.apply_translation((0, 0, 100))                       # keeps only z >= 0
    parti = {}
    for nome, mesh in (("1_grigio", grigio), ("2_bianco", bianco), ("3_rosso", rosso), ("4_nero", nero)):
        parti[nome] = con(mesh, sotto)

    # ---------------- scale to the final height, all parts together
    alto = max(m.bounds[1][2] for m in parti.values())
    scala = ALTEZZA_FINALE / alto
    for m in parti.values():
        m.apply_scale(scala)

    # ---------------- the NFC recess, open underneath, cut AFTER scaling so it is exactly the tag's size
    raggio = (TAG_DIAMETRO + TAG_GIOCO) / 2
    tasca = trimesh.creation.cylinder(radius=raggio, height=(spessore_tag + 0.2) * 2, sections=128)
    tasca.apply_translation((0, 0.5 * scala, 0))
    for nome in parti:
        parti[nome] = meno(parti[nome], tasca)
    return parti, scala


def controlla(parti, spessore_tag, scala):
    tutto = trimesh.util.concatenate(list(parti.values()))
    b = tutto.bounds
    print(f"size: {b[1][0] - b[0][0]:.1f} x {b[1][1] - b[0][1]:.1f} x {b[1][2] - b[0][2]:.1f} mm (w x d x h)")
    for nome, m in parti.items():
        print(f"  {nome}: watertight={m.is_watertight}, volume={m.volume / 1000:.2f} cm3")
    print(f"NFC recess: {TAG_DIAMETRO + TAG_GIOCO:.1f} mm wide, {spessore_tag + 0.2:.1f} mm deep (tag {TAG_DIAMETRO} x {spessore_tag} mm)")
    # the flat bottom must be wider than the recess, with a solid rim around it
    fondo = parti["1_grigio"].section(plane_origin=(0, 0, 0.05), plane_normal=(0, 0, 1))
    if fondo is not None:
        piano, _ = fondo.to_2D()
        lati = piano.bounds[1] - piano.bounds[0]
        print(f"flat bottom: about {lati[0]:.1f} x {lati[1]:.1f} mm (recess {TAG_DIAMETRO + TAG_GIOCO:.1f} mm)")


def anteprima(parti, percorso):
    """Pictures from four sides: each triangle drawn flat, back to front ("painter"), with simple light."""
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    from matplotlib.collections import PolyCollection

    colori = {"1_grigio": "#8f949c", "2_bianco": "#f4f1ea", "3_rosso": "#c0392b", "4_nero": "#1c1c1c"}
    # (title, how much to turn around the vertical, how much to look from above)
    viste = [("davanti", 0, 0), ("tre quarti", -40, 12), ("lato", -90, 0), ("dietro", 180, 8), ("sotto (NFC)", 0, -90)]
    fig, assi = plt.subplots(1, len(viste), figsize=(4 * len(viste), 5))
    for ax, (titolo, giro, alto) in zip(assi, viste):
        g, a = np.radians(giro), np.radians(alto)
        rz = np.array([[np.cos(g), -np.sin(g), 0], [np.sin(g), np.cos(g), 0], [0, 0, 1]])
        rx = np.array([[1, 0, 0], [0, np.cos(a), -np.sin(a)], [0, np.sin(a), np.cos(a)]])
        r = rx @ rz
        poligoni, colori_f, profondita = [], [], []
        for nome, m in parti.items():
            v = m.vertices @ r.T                      # camera looks along +y (from the front)
            tri = v[m.faces]
            normali = m.face_normals @ r.T
            visibili = normali[:, 1] < 0              # facing the camera
            luce = 0.35 + 0.65 * np.clip(-normali[:, 1] * 0.7 + normali[:, 2] * 0.5 - normali[:, 0] * 0.2, 0, 1)
            base = np.array(matplotlib.colors.to_rgb(colori[nome]))
            for t, l in zip(tri[visibili], luce[visibili]):
                poligoni.append(t[:, [0, 2]])
                colori_f.append(np.clip(base * l, 0, 1))
                profondita.append(t[:, 1].mean())
        ordine = np.argsort(profondita)[::-1]          # far first, near last
        ax.add_collection(PolyCollection([poligoni[i] for i in ordine], facecolors=[colori_f[i] for i in ordine],
                                         edgecolors=[colori_f[i] for i in ordine], linewidths=0.2))
        tutti = np.concatenate(poligoni)
        c = (tutti.max(axis=0) + tutti.min(axis=0)) / 2
        lato = (tutti.max(axis=0) - tutti.min(axis=0)).max() / 2 + 3
        ax.set_xlim(c[0] - lato, c[0] + lato); ax.set_ylim(c[1] - lato, c[1] + lato)
        ax.set_aspect("equal"); ax.axis("off"); ax.set_title(titolo)
    plt.tight_layout()
    plt.savefig(percorso, dpi=110, facecolor="#dfe8f2")


def main():
    spessore_tag = float(sys.argv[1]) if len(sys.argv) > 1 else 1.2
    CARTELLA.mkdir(parents=True, exist_ok=True)
    parti, scala = costruisci(spessore_tag)
    controlla(parti, spessore_tag, scala)
    for nome, m in parti.items():
        m.export(CARTELLA / f"mario_{nome}.stl")
    anteprima(parti, CARTELLA / "anteprima.png")
    print(f"saved in {CARTELLA}")


if __name__ == "__main__":
    main()
