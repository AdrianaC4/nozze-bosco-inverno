"""Adds an open NFC tag recess under the cat-by-the-fireplace bauble (a MakerWorld model, not in this repo).
Cuts 3 mm off the round bottom (flat base about 37 x 33 mm) and a 25.6 mm wide, 1.4 mm deep recess in its centre.
Keeps the original Bambu Studio project settings. Usage:
    .venv/bin/python -I tools/nfc_pallina.py ~/Downloads/ornament_cat_3d_model.3mf ~/Downloads/ornament_cat_3d_model_NFC.3mf
"""
import sys, re, zipfile, numpy as np, trimesh, manifold3d as mf
src3mf, out3mf = sys.argv[1], sys.argv[2]
TAGLIO, DIAM, PROF = 3.0, 25.6, 1.4
z = zipfile.ZipFile(src3mf)
txt = z.read('3D/Objects/object_2.model').decode()
v = np.array(re.findall(r'<vertex x="([^"]+)" y="([^"]+)" z="([^"]+)"', txt), float)
f = np.array(re.findall(r'<triangle v1="(\d+)" v2="(\d+)" v3="(\d+)"', txt), np.uint32)
z0 = v[:,2].min(); zc = z0 + TAGLIO
orig = mf.Manifold(mf.Mesh(v.astype(np.float32), f))
# centre of the new flat base
m0 = trimesh.Trimesh(v, f, process=False)
sec = m0.section(plane_origin=[0,0,zc+0.01], plane_normal=[0,0,1])
c = sec.vertices.mean(axis=0); cx, cy = (sec.bounds[0][:2]+sec.bounds[1][:2])/2
print('new base x', sec.bounds[0][0], sec.bounds[1][0], 'y', sec.bounds[0][1], sec.bounds[1][1], 'centre', cx, cy)
big = 500
taglio = mf.Manifold.cube([big,big,big]).translate([-big/2,-big/2,zc-big])
foro = mf.Manifold.cylinder(PROF+1, DIAM/2, DIAM/2, 128).translate([cx,cy,zc-1])
res = orig - taglio - foro
mm = res.to_mesh()
V = np.asarray(mm.vert_properties)[:,:3]; F = np.asarray(mm.tri_verts)
t = trimesh.Trimesh(V, F, process=False)
print('watertight', t.is_watertight, 'faces', len(F), 'bounds', t.bounds, 'genus', res.genus())
t.export(out3mf.replace('.3mf','.stl'))
# rewrite mesh xml
vx = ''.join(f'     <vertex x="{a:.7g}" y="{b:.7g}" z="{c_:.7g}"/>\n' for a,b,c_ in V)
tr = ''.join(f'     <triangle v1="{a}" v2="{b}" v3="{c_}"/>\n' for a,b,c_ in F)
head = txt[:txt.index('<vertices>')+len('<vertices>')]
tail = txt[txt.index('</triangles>'):]
new = head + '\n' + vx + '    </vertices>\n    <triangles>\n' + tr + '    ' + tail
zmin = V[:,2].min()
out = zipfile.ZipFile(out3mf, 'w', zipfile.ZIP_DEFLATED)
for i in z.infolist():
    d = z.read(i.filename)
    if i.filename == '3D/Objects/object_2.model': d = new.encode()
    elif i.filename == '3D/3dmodel.model':
        s = d.decode(); s = s.replace('122.993021 109.62636 47.3566589', f'122.993021 109.62636 {-zmin:.7g}'); assert str(round(-zmin,3))[:5] in s; d = s.encode()
    elif i.filename == 'Metadata/model_settings.config':
        d = d.decode().replace('face_count="369950"', f'face_count="{len(F)}"').encode()
    out.writestr(i, d)
out.close(); print('zmin', zmin)
