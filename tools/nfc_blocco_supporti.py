"""Adds a cylinder support blocker over the NFC recess made by tools/nfc_pallina.py, so Bambu Studio does not fill it with support.
Usage (after nfc_pallina.py):
    .venv/bin/python -I tools/nfc_blocco_supporti.py ~/Downloads/ornament_cat_3d_model_NFC.3mf <output.3mf>
"""
import sys, zipfile, numpy as np, trimesh
src, out = sys.argv[1], sys.argv[2]
CX, CY, R = 0.0164, -8.0452, 12.8
SUB = 3
z = zipfile.ZipFile(src)
obj = z.read('3D/Objects/object_2.model').decode()
import re
zs = [float(x) for x in re.findall(r' z="([^"]+)"', obj[:20000000])]
zmin = min(zs)
cyl = trimesh.creation.cylinder(radius=R, height=1.8, sections=96)
cyl.apply_translation([CX, CY, zmin + 0.9 - 0.1])   # from just below the bed to 1.7 mm up
vx = ''.join(f'     <vertex x="{a:.7g}" y="{b:.7g}" z="{c:.7g}"/>\n' for a,b,c in cyl.vertices)
tr = ''.join(f'     <triangle v1="{a}" v2="{b}" v3="{c}"/>\n' for a,b,c in cyl.faces)
blocco = (f'  <object id="{SUB}" p:UUID="00030000-81cb-4c03-9d28-80fed5dfa1dc" type="model">\n   <mesh>\n    <vertices>\n'
          + vx + '    </vertices>\n    <triangles>\n' + tr + '    </triangles>\n   </mesh>\n  </object>\n')
obj = obj.replace(' </resources>', blocco + ' </resources>')
main = z.read('3D/3dmodel.model').decode()
main = main.replace('</components>',
    f'    <component p:path="/3D/Objects/object_2.model" objectid="{SUB}" p:UUID="00020001-b206-40ff-9872-83e8017abed1" transform="1 0 0 0 1 0 0 0 1 0 0 0" />\n   </components>', 1)
assert f'objectid="{SUB}"' in main
cfg = z.read('Metadata/model_settings.config').decode()
part = (f'    <part id="{SUB}" subtype="support_blocker">\n      <metadata key="name" value="Blocco supporti NFC"/>\n'
        '      <metadata key="matrix" value="1 0 0 0 0 1 0 0 0 0 1 0 0 0 0 1"/>\n'
        f'      <mesh_stat face_count="{len(cyl.faces)}" edges_fixed="0" degenerate_facets="0" facets_removed="0" facets_reversed="0" backwards_edges="0"/>\n    </part>\n')
i = cfg.index('    </part>\n') + len('    </part>\n')
cfg = cfg[:i] + part + cfg[i:]
o = zipfile.ZipFile(out, 'w', zipfile.ZIP_DEFLATED)
for it in z.infolist():
    d = z.read(it.filename)
    if it.filename == '3D/Objects/object_2.model': d = obj.encode()
    elif it.filename == '3D/3dmodel.model': d = main.encode()
    elif it.filename == 'Metadata/model_settings.config': d = cfg.encode()
    o.writestr(it, d)
o.close(); print('zmin', zmin)
