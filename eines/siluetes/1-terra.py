import numpy as np, sys, time
from PIL import Image
I = np.asarray(Image.open('/home/user/robomon/src/imatges/mapa.webp').convert('RGB')).astype(np.int32)
H, W, _ = I.shape
T = int(sys.argv[1]) if len(sys.argv) > 1 else 12
# arestes transitables (veïns semblants)
dx = np.abs(I[:, 1:] - I[:, :-1]).sum(2) < T     # entre (y,x) i (y,x+1)
dy = np.abs(I[1:, :] - I[:-1, :]).sum(2) < T     # entre (y,x) i (y+1,x)
fons = np.zeros((H, W), bool)
fons[-1, :] = True; fons[:, 0] = True; fons[0, :1560] = True; fons[430:, -1] = True
t = time.time()
while True:
    n = fons.copy()
    n[:, 1:] |= fons[:, :-1] & dx; n[:, :-1] |= fons[:, 1:] & dx
    n[1:, :] |= fons[:-1, :] & dy; n[:-1, :] |= fons[1:, :] & dy
    if (n == fons).all(): break
    fons = n
np.save('fons.npy', fons)
print('fet', round(time.time() - t, 1), 's', 'terra', (~fons).sum())
Image.fromarray((~fons * 255).astype(np.uint8)).save('terra.png')
