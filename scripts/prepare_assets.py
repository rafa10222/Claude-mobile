"""Prepara os assets do motion da Feijoada a partir das 3 imagens em public/feijoada/.

Uso: python3 scripts/prepare_assets.py
Saídas (public/feijoada/): bg.png, tigela.png, logo.png, ifood-tag.png
Saída de conferência: out/previews/assets-check.png
"""
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter
from rembg import new_session, remove
from scipy import ndimage

ROOT = Path(__file__).resolve().parent.parent
A = ROOT / "public" / "feijoada"
PREV = ROOT / "out" / "previews"
PREV.mkdir(parents=True, exist_ok=True)
W, H = 1080, 1920


def cover(img: Image.Image) -> Image.Image:
    """Redimensiona em modo 'cover' para 1080x1920, sem distorcer."""
    s = max(W / img.width, H / img.height)
    nw, nh = round(img.width * s), round(img.height * s)
    img = img.resize((nw, nh), Image.LANCZOS)
    x, y = (nw - W) // 2, (nh - H) // 2
    return img.crop((x, y, x + W, y + H))


# Fator de escala da arte original (941x1672) para o canvas 1080x1920
SRC = Image.open(A / "original.png")
SCALE = max(W / SRC.width, H / SRC.height)

# ---------------------------------------------------------------- bg.png
bg = cover(Image.open(A / "fundo.png").convert("RGB"))
bg.save(A / "bg.png")

# ------------------------------------------------------------ tigela.png
scene = cover(Image.open(A / "cena-sem-texto.png").convert("RGB"))
a_isnet = np.array(remove(scene, session=new_session("isnet-general-use")))[..., 3]
a_u2 = np.array(remove(scene, session=new_session("u2net")))[..., 3]

# Contorno: isnet (borda afiada). Miolo: buracos preenchidos (isnet falha na couve).
solid = a_isnet > 128
# Borda direita e de baixo são corte do quadro: trata como "dentro" pra fechar buracos
pad = np.pad(solid, 1, constant_values=False)
pad[:, -1] = True
pad[-1, :] = True
filled = ndimage.binary_fill_holes(pad)[1:-1, 1:-1]
# Inclui o que o u2net viu com confiança dentro do contorno (couve/laranja)
core = ndimage.binary_erosion(filled, iterations=6)
alpha = a_isnet.astype(np.float32)
alpha[core] = 255
alpha[(a_u2 > 200) & ndimage.binary_erosion(filled, iterations=2)] = 255
# Remove halo: come 1px da borda e suaviza levemente
alpha_img = Image.fromarray(alpha.astype(np.uint8)).filter(ImageFilter.MinFilter(3))
alpha_img = alpha_img.filter(ImageFilter.GaussianBlur(0.8))
alpha = np.array(alpha_img).astype(np.float32)
# Só mantém o maior componente (a tigela)
lab, n = ndimage.label(alpha > 20)
if n > 1:
    sizes = ndimage.sum(np.ones_like(alpha), lab, range(1, n + 1))
    keep = lab == (1 + int(np.argmax(sizes)))
    alpha[~keep] = 0

rgb = np.array(scene).astype(np.float32)
# Descontamina cor da borda (puxa a cor de dentro do objeto pra borda semitransparente)
edge = (alpha > 0) & (alpha < 250)
blur_rgb = np.stack(
    [ndimage.grey_erosion(rgb[..., c], size=(5, 5)) for c in range(3)], axis=-1
)
rgb[edge] = rgb[edge] * 0.4 + blur_rgb[edge] * 0.6

# Ajuste fino de luz pra casar com o bg (bg é mais escuro/quente que a cena)
def stats(img_arr, mask):
    return img_arr[mask].mean(axis=0)

bg_arr = np.array(bg).astype(np.float32)
ring = ndimage.binary_dilation(alpha > 128, iterations=40) & ~ndimage.binary_dilation(
    alpha > 128, iterations=10
)
scene_ring = stats(rgb, ring)
bg_ring = stats(bg_arr, ring)
gain = np.clip(bg_ring / scene_ring, 0.85, 1.12)
# Aplica só metade do ganho (só para "casar" o clima de luz, sem lavar a comida)
gain = 1 + (gain - 1) * 0.5
rgb = np.clip(rgb * gain, 0, 255)
print("ganho RGB tigela:", gain.round(3))

tigela = np.dstack([rgb, alpha]).astype(np.uint8)
Image.fromarray(tigela, "RGBA").save(A / "tigela.png", optimize=True)

# -------------------------------------------------------------- logo.png
o = np.array(SRC.convert("RGB")).astype(np.int32)
# Pixels dourados (anel + letras) na região do topo
LX, LY = 370, 20
reg = o[LY:222, LX:570]
gold = (reg[..., 0] > 170) & (reg[..., 1] > 120) & (reg[..., 2] < 140) & (
    reg[..., 0] - reg[..., 2] > 70
)
ys, xs = np.nonzero(gold)
cx, cy = (xs.min() + xs.max()) / 2 + LX, (ys.min() + ys.max()) / 2 + LY
r = max(xs.max() - xs.min(), ys.max() - ys.min()) / 2 + 2.5
print(f"logo: centro=({cx:.1f},{cy:.1f}) raio={r:.1f} (px da original)")
box = (int(cx - r - 4), int(cy - r - 4), int(cx + r + 5), int(cy + r + 5))
logo = SRC.convert("RGB").crop(box)
k = 4  # recorte em 4x pra máscara circular suave
logo = logo.resize((logo.width * k, logo.height * k), Image.LANCZOS)
yy, xx = np.mgrid[0 : logo.height, 0 : logo.width]
ccx, ccy = (cx - box[0]) * k, (cy - box[1]) * k
d = np.sqrt((xx - ccx) ** 2 + (yy - ccy) ** 2)
m = np.clip((r * k - d) / 3.0, 0, 1) * 255
logo = Image.fromarray(np.dstack([np.array(logo), m]).astype(np.uint8), "RGBA")
# Salva em ~2x do tamanho de uso (o logo agora aparece grande, ~250px) + nitidez leve
LOGO_OUT = 2.0
logo = logo.resize((round(logo.width / k * SCALE * LOGO_OUT), round(logo.height / k * SCALE * LOGO_OUT)), Image.LANCZOS)
rgb_l, a_l = logo.convert("RGB"), logo.getchannel("A")
rgb_l = rgb_l.filter(ImageFilter.UnsharpMask(radius=2, percent=70, threshold=2))
logo = Image.merge("RGBA", (*rgb_l.split(), a_l))
logo.save(A / "logo.png", optimize=True)

# --------------------------------------------------------- ifood-tag.png
tx0, ty0, tx1, ty1 = 0, 1380, 520, 1650
crop = SRC.convert("RGB").crop((tx0, ty0, tx1, ty1))
c = np.array(crop).astype(np.float32)
mx, mn = c.max(-1), c.min(-1)
sat = (mx - mn) / np.maximum(mx, 1)
paper = (c[..., 1] > 145) & (c[..., 2] > 85) & (mx > 180)  # papel creme (kraft tem G<=135, B<=70)
paper = ndimage.binary_opening(paper, iterations=2)
lab, n = ndimage.label(paper)
sizes = ndimage.sum(paper, lab, range(1, n + 1))
big = np.isin(lab, 1 + np.nonzero(sizes > 400)[0])
# Etiqueta é um retângulo inclinado: casco convexo fecha os textos (escuros/vermelhos)
from scipy.spatial import ConvexHull
from PIL import ImageDraw
pts = np.argwhere(big)[:, ::-1]
hull = pts[ConvexHull(pts).vertices]
hm = Image.new("L", crop.size, 0)
ImageDraw.Draw(hm).polygon([tuple(map(float, p)) for p in hull], fill=255)
hull_m = np.array(hm) > 0
# Borda rasgada: perto do contorno do casco, só fica o que é papel de verdade
inner_m = ndimage.binary_erosion(hull_m, iterations=7)
paper = hull_m & (inner_m | ndimage.binary_closing(big, iterations=1))
ta = Image.fromarray((paper * 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(0.7))
ys, xs = np.nonzero(paper)
bb = (xs.min() - 3, ys.min() - 3, xs.max() + 4, ys.max() + 4)
print("tag bbox (original):", (bb[0] + tx0, bb[1] + ty0, bb[2] + tx0, bb[3] + ty0))
tag = Image.fromarray(np.dstack([c, np.array(ta)]).astype(np.uint8), "RGBA").crop(bb)
tag = tag.resize((round(tag.width * SCALE), round(tag.height * SCALE)), Image.LANCZOS)
tag.save(A / "ifood-tag.png", optimize=True)

# ----------------------------------------------------- assets-check.png
def checker(size, s=24):
    yy, xx = np.mgrid[0 : size[1], 0 : size[0]]
    v = np.where(((xx // s) + (yy // s)) % 2 == 0, 200, 140).astype(np.uint8)
    return Image.fromarray(np.dstack([v, v, v, np.full_like(v, 255)]), "RGBA")

orig_big = cover(SRC.convert("RGB")).convert("RGBA")
comp = bg.convert("RGBA")
comp.alpha_composite(Image.open(A / "tigela.png"))
sheet = Image.new("RGBA", (W * 3 + 80, H), (30, 30, 30, 255))
sheet.paste(orig_big, (0, 0))
sheet.paste(comp, (W + 40, 0))
col = checker((W, H))
y = 0
for name in ["tigela.png", "logo.png", "ifood-tag.png"]:
    im = Image.open(A / name)
    if name == "tigela.png":
        im = im.crop(im.getbbox())
    im.thumbnail((W - 40, 820))
    col.alpha_composite(im, (20, y + 20))
    y += im.height + 40
sheet.paste(col, (2 * W + 80, 0))
sheet.convert("RGB").resize((sheet.width // 2, sheet.height // 2), Image.LANCZOS).save(
    PREV / "assets-check.png"
)
print("ok")
