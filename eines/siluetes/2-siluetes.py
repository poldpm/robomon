import numpy as np, json
from PIL import Image, ImageDraw, ImageFilter
from collections import deque
I = np.asarray(Image.open('/home/user/robomon/src/imatges/mapa.webp').convert('RGB')).astype(np.int32)
H, W, _ = I.shape
fons = np.load('fons.npy'); terra = ~fons
PROP = 2752 / 1014
ILLES = [(8.9,53.5,6.2),(20.0,33.0,6.6),(32.3,49.5,7.4),(41.8,31.0,6.4),(52.0,33.0,6.6),(60.5,45.5,3.4),(68.7,52.0,5.4),(74.1,30.0,4.8),(92.0,38.0,9.5)]
cent = [(x/100*W, y/100*H, r/100*W) for x, y, r in ILLES]
# repartiment geodèsic: cada illa creix des del seu nucli per dins de la terra
masks = [np.zeros((H, W), bool) for _ in ILLES]
qui = np.full((H, W), -1, np.int32); q = deque()
yy, xx = np.mgrid[0:H, 0:W]
for i, (cx, cy, r) in enumerate(cent[:8]):
    nucli = terra & (np.hypot(xx - cx, yy - cy) < r * 0.45) & (qui < 0)
    for y, x in zip(*np.nonzero(nucli)): qui[y, x] = i; q.append((y, x))
while q:
    y, x = q.popleft(); i = qui[y, x]
    for y2, x2 in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
        if 0 <= y2 < H and 0 <= x2 < W and terra[y2, x2] and qui[y2, x2] < 0:
            qui[y2, x2] = i; q.append((y2, x2))
for i in range(8): masks[i] = qui == i
# illa 9: contorn a mà (eixamplat) ∩ punts que no són ni mar ni cel
OX = 1360
ridge=[(16,143),(70,116),(120,96),(170,71),(220,53),(270,31),(310,6),(336,0),(362,4),(385,30),(410,58),(440,92)]
shore=[(440,410),(380,400),(310,390),(248,378),(222,354),(236,330),(268,312),(278,292),(258,282),(210,276),(170,272),(158,250),(172,224),(184,210),(165,200),(118,190),(68,178),(24,160)]
pm = Image.new('L', (W, H), 0); ImageDraw.Draw(pm).polygon([(x+OX, y) for x, y in ridge+shore], fill=255)
pm0 = np.asarray(pm) > 0
pm = np.asarray(pm.filter(ImageFilter.MaxFilter(25))) > 0
R, G, B = I[...,0], I[...,1], I[...,2]
mar = (B > R + 6) & (G > R)
mx_, mn_ = I.max(2), I.min(2)
cel = (mx_ > 205) & ((mx_ - mn_) < 42)
m9 = pm & ~mar & ~cel
m9[:, W - 40:] |= pm0[:, W - 40:]   # la vora dreta de la imatge: el contorn dibuixat mana
# neteja la 9: només la component gran
l9 = np.zeros((H, W), np.int32); best = None; nn = 0
for y0, x0 in zip(*np.nonzero(m9)):
    if l9[y0, x0]: continue
    nn += 1; q = deque([(y0, x0)]); l9[y0, x0] = nn; c = 0
    while q:
        y, x = q.popleft(); c += 1
        for yy, xx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0 <= yy < H and 0 <= xx < W and m9[yy, xx] and not l9[yy, xx]:
                l9[yy, xx] = nn; q.append((yy, xx))
    if best is None or c > best[1]: best = (nn, c)
masks[8] = l9 == best[0]
# omple forats: tot el que no es pot assolir des de fora
def omple(m):
    ext = np.zeros_like(m); q = deque()
    for y in range(H):
        for x in (0, W-1):
            if not m[y, x] and not ext[y, x]: ext[y, x] = True; q.append((y, x))
    for x in range(W):
        for y in (0, H-1):
            if not m[y, x] and not ext[y, x]: ext[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for yy, xx in ((y+1,x),(y-1,x),(y,x+1),(y,x-1)):
            if 0 <= yy < H and 0 <= xx < W and not m[yy, xx] and not ext[yy, xx]:
                ext[yy, xx] = True; q.append((yy, xx))
    return ~ext
caixes = []; ESC = 2
for i, m in enumerate(masks):
    m = omple(m)
    ys, xs = np.nonzero(m); pad = 6
    x0, x1 = max(0, xs.min()-pad), min(W, xs.max()+pad+1); y0, y1 = max(0, ys.min()-pad), min(H, ys.max()+pad+1)
    a = Image.fromarray((m[y0:y1, x0:x1] * 255).astype(np.uint8))
    a = a.resize(((x1-x0)*ESC, (y1-y0)*ESC), Image.BILINEAR)
    a = a.filter(ImageFilter.MinFilter(3)).filter(ImageFilter.MaxFilter(3))   # treu punxes d'un píxel
    a = a.filter(ImageFilter.GaussianBlur(2.2))
    v = np.asarray(a).astype(np.float32); v = np.clip((v - 128) * 3.2 + 128, 0, 255).astype(np.uint8)
    rgba = np.zeros((v.shape[0], v.shape[1], 4), np.uint8); rgba[..., :3] = (18, 22, 27); rgba[..., 3] = v
    Image.fromarray(rgba, 'RGBA').save(f'/home/user/robomon/src/imatges/silueta-{i+1}.webp', lossless=True)
    caixes.append({'x': round(x0/W*100, 3), 'y': round(y0/H*100, 3), 'w': round((x1-x0)/W*100, 3), 'h': round((y1-y0)/H*100, 3)})
json.dump(caixes, open('caixes.json', 'w'))
# vista a 2x: mapa + siluetes
big = Image.open('/home/user/robomon/src/imatges/mapa.webp').convert('RGBA').resize((W*2, H*2), Image.LANCZOS)
for i, b in enumerate(caixes):
    s = Image.open(f'/home/user/robomon/src/imatges/silueta-{i+1}.webp').convert('RGBA')
    big.alpha_composite(s, (round(b['x']/100*W*2), round(b['y']/100*H*2)))
big.save('vista2x.png'); big.resize((1800, 663), Image.LANCZOS).save('vista.png')
print(caixes)
