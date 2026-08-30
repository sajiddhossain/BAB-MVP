#!/usr/bin/env python3
"""
Estrae le zone del corpo dal disegno.

Il file body-map e' un unico path fuso: le zone non esistono come nodi. Pero' il
disegno LE CONTIENE gia' come linee. Qui le ricaviamo: rasterizziamo, troviamo
ogni area chiusa dalle linee, e ne tracciamo il contorno esatto. Le forme che
escono seguono quindi il tratto originale, non sono approssimazioni a mano.

Le zone si riconoscono dal baricentro, non da un punto di innesco: un seme messo
a occhio puo' cadere sulla linea o nel vuoto fra braccio e fianco, e in quel caso
il riempimento esonda su tutto lo sfondo senza che si veda.

  python3 tools/extract-zones.py            # scrive src/ui/bodyZones.ts
  python3 tools/extract-zones.py --debug    # e anche un'immagine di controllo
"""
import json
import subprocess
import sys
from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "src/ui/assets/bodymap/body-map.svg"
OUT_TS = ROOT / "src/ui/bodyZones.ts"
SCALE = 2                    # rasterizziamo a 2x per un contorno piu' fedele
VIEW = 1366
MIN_AREA = 150               # sotto questa soglia e' rumore fra le linee
PAD = 9                      # per far entrare il tratto esterno nel viewBox

# (id, etichetta, baricentro x, baricentro y) nello spazio del viewBox.
# Destra/sinistra sono ANATOMICHE: di fronte l'arto a sinistra di chi guarda e'
# il destro del soggetto, di spalle e' il contrario.
FRONT = [
    ("head",        "Head & neck",      390,  171),
    ("trap-r",      "Right trap",       367,  280),
    ("trap-l",      "Left trap",        414,  280),
    ("shoulder-r",  "Right shoulder",   292,  326),
    ("shoulder-l",  "Left shoulder",    487,  326),
    ("chest-r",     "Right chest",      347,  344),
    ("chest-l",     "Left chest",       433,  344),
    ("upperarm-r",  "Right upper arm",  281,  411),
    ("upperarm-l",  "Left upper arm",   500,  412),
    ("ribs-r",      "Right ribs",       353,  443),
    ("ribs-l",      "Left ribs",        427,  443),
    ("elbow-r",     "Right elbow",      269,  485),
    ("elbow-l",     "Left elbow",       511,  485),
    ("abs-r",       "Right abs",        351,  530),
    ("abs-l",       "Left abs",         429,  530),
    ("forearm-r",   "Right forearm",    252,  546),
    ("forearm-l",   "Left forearm",     528,  547),
    ("hip-r",       "Right hip",        349,  593),
    ("hip-l",       "Left hip",         431,  594),
    ("wrist-r",     "Right wrist",      230,  626),
    ("wrist-l",     "Left wrist",       550,  626),
    ("hand-r",      "Right hand",       222,  673),
    ("hand-l",      "Left hand",        558,  674),
    ("quad-r",      "Right quad",       330,  725),
    ("quad-l",      "Left quad",        450,  726),
    ("knee-r",      "Right knee",       344,  884),
    ("knee-l",      "Left knee",        436,  884),
    ("shin-r",      "Right shin",       342, 1004),
    ("shin-l",      "Left shin",        439, 1003),
    ("ankle-r",     "Right ankle",      351, 1141),
    ("ankle-l",     "Left ankle",       430, 1142),
    ("foot-r",      "Right foot",       348, 1201),
    ("foot-l",      "Left foot",        432, 1201),
]

BACK = [
    ("head",        "Head & neck",      950,  165),
    ("trap-l",      "Left trap",        929,  272),
    ("trap-r",      "Right trap",       971,  272),
    ("shoulder-l",  "Left shoulder",    850,  330),
    ("shoulder-r",  "Right shoulder",  1049,  331),
    ("upperback-l", "Left upper back",  906,  366),
    ("upperback-r", "Right upper back", 993,  366),
    ("upperarm-l",  "Left upper arm",   838,  419),
    ("upperarm-r",  "Right upper arm", 1062,  418),
    ("midback-l",   "Left mid back",    914,  469),
    ("midback-r",   "Right mid back",   985,  469),
    ("elbow-l",     "Left elbow",       826,  493),
    ("elbow-r",     "Right elbow",     1075,  493),
    ("lowback-l",   "Left lower back",  909,  538),
    ("lowback-r",   "Right lower back", 990,  539),
    ("forearm-l",   "Left forearm",     809,  556),
    ("forearm-r",   "Right forearm",   1091,  556),
    ("glute-l",     "Left glute",       907,  609),
    ("glute-r",     "Right glute",      993,  609),
    ("wrist-l",     "Left wrist",       788,  636),
    ("wrist-r",     "Right wrist",     1113,  636),
    ("hand-l",      "Left hand",        778,  693),
    ("hand-r",      "Right hand",      1121,  693),
    ("ham-l",       "Left hamstring",   887,  744),
    ("ham-r",       "Right hamstring", 1012,  743),
    ("knee-l",      "Left knee",        903,  895),
    ("knee-r",      "Right knee",       997,  895),
    ("calf-l",      "Left calf",        901, 1014),
    ("calf-r",      "Right calf",       999, 1013),
    ("ankle-l",     "Left ankle",       909, 1152),
    ("ankle-r",     "Right ankle",      990, 1151),
    ("heel-l",      "Left heel",        905, 1208),
    ("heel-r",      "Right heel",       994, 1207),
]


def rasterize():
    png = ROOT / ".zones.png"
    subprocess.run(
        ["/usr/local/bin/inkscape", "--export-type=png", f"--export-filename={png}",
         f"--export-width={VIEW * SCALE}", "--export-background=#ffffff",
         "--export-background-opacity=1", str(SRC)],
        check=True, capture_output=True,
    )
    a = np.array(Image.open(png).convert("L"))
    png.unlink()
    return a < 128           # True = linea nera = muro


def regions(walls):
    """Tutte le aree chiuse dalle linee, escluso lo sfondo."""
    h, w = walls.shape
    free = ~walls
    seen = np.zeros((h, w), bool)
    out = []
    for y0 in range(h):
        for x0 in np.nonzero(free[y0] & ~seen[y0])[0].tolist():
            seen[y0, x0] = True
            q, px, edge = deque([(x0, y0)]), [], False
            while q:
                x, y = q.popleft()
                px.append((x, y))
                if x == 0 or y == 0 or x == w - 1 or y == h - 1:
                    edge = True
                for nx, ny in ((x + 1, y), (x - 1, y), (x, y + 1), (x, y - 1)):
                    if 0 <= nx < w and 0 <= ny < h and free[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((nx, ny))
            if edge or len(px) < MIN_AREA * SCALE * SCALE:
                continue
            a = np.array(px)
            mask = np.zeros((h, w), bool)
            mask[a[:, 1], a[:, 0]] = True
            out.append({"mask": mask, "area": len(px) // (SCALE * SCALE),
                        "c": (a[:, 0].mean() / SCALE, a[:, 1].mean() / SCALE),
                        "box": (a[:, 0].min() / SCALE, a[:, 1].min() / SCALE,
                                a[:, 0].max() / SCALE, a[:, 1].max() / SCALE)})
    return out


def contour(mask):
    """Contorno esatto seguendo i bordi dei pixel.

    Ogni pixel della zona che confina col vuoto contribuisce quel lato come
    segmento orientato; poi si concatenano i segmenti in un anello. E' esatto
    per costruzione: nessun inseguimento che puo' incastrarsi fra due pixel.
    """
    h, w = mask.shape
    m = np.zeros((h + 2, w + 2), bool)
    m[1:-1, 1:-1] = mask
    nxt = {}

    def add(a, b):
        nxt.setdefault(a, []).append(b)

    ys, xs = np.nonzero(m)
    for y, x in zip(ys.tolist(), xs.tolist()):
        if not m[y - 1, x]:
            add((x, y), (x + 1, y))              # lato alto, verso destra
        if not m[y, x + 1]:
            add((x + 1, y), (x + 1, y + 1))      # lato destro, verso il basso
        if not m[y + 1, x]:
            add((x + 1, y + 1), (x, y + 1))      # lato basso, verso sinistra
        if not m[y, x - 1]:
            add((x, y + 1), (x, y))              # lato sinistro, verso l'alto

    start = min(nxt, key=lambda p: (p[1], p[0]))
    DIRS = [(1, 0), (0, 1), (-1, 0), (0, -1)]
    out, cur, din = [start], start, 1
    while True:
        opts = nxt.get(cur)
        if not opts:
            break
        # dove il contorno si strozza un vertice ha due uscite: prendiamo la
        # svolta piu' a destra, quella che resta sul bordo esterno
        pick = min(opts, key=lambda n: (
            DIRS.index((n[0] - cur[0], n[1] - cur[1])) - din - 1) % 4)
        din = DIRS.index((pick[0] - cur[0], pick[1] - cur[1]))
        opts.remove(pick)
        if not opts:
            del nxt[cur]
        cur = pick
        if cur == start:
            break
        out.append(cur)
    return [(x - 1, y - 1) for x, y in out]


def simplify(pts, eps):
    """Douglas-Peucker."""
    if len(pts) < 3:
        return pts
    a, b = np.array(pts[0]), np.array(pts[-1])
    ab = b - a
    n = float(np.hypot(*ab))
    p = np.array(pts)
    if n == 0:
        d = np.hypot(*(p - a).T)
    else:
        # prodotto vettoriale scritto a mano: np.cross su vettori 2D e' deprecato
        # in numpy 2 e restituiva distanze nulle, quindi ogni contorno si riduceva
        # a due punti e tutte le zone sparivano
        d = np.abs(ab[0] * (p[:, 1] - a[1]) - ab[1] * (p[:, 0] - a[0])) / n
    i = int(np.argmax(d))
    if d[i] > eps:
        return simplify(pts[: i + 1], eps)[:-1] + simplify(pts[i:], eps)
    return [pts[0], pts[-1]]


def to_path(pts):
    q = lambda v: round(v / SCALE, 1)
    d = f"M{q(pts[0][0])} {q(pts[0][1])}"
    for x, y in pts[1:]:
        d += f"L{q(x)} {q(y)}"
    return d + "Z"


def assign(table, pool, side):
    """Abbina ogni zona dichiarata alla regione col baricentro piu' vicino."""
    out, used = [], {}
    for zid, label, cx, cy in table:
        best = min(pool, key=lambda r: (r["c"][0] - cx) ** 2 + (r["c"][1] - cy) ** 2)
        dist = round(((best["c"][0] - cx) ** 2 + (best["c"][1] - cy) ** 2) ** 0.5, 1)
        if dist > 25:
            raise SystemExit(f"{side}/{zid}: nessuna regione vicino a ({cx},{cy}), la piu' "
                             f"vicina dista {dist}px — il baricentro e' sbagliato")
        if id(best) in used:
            raise SystemExit(f"{side}/{zid} e {used[id(best)]} puntano alla stessa regione")
        used[id(best)] = zid
        out.append({"id": zid, "label": label, "region": best})
    return out


def ink_box(walls, lo, hi):
    """Ingombro del TRATTO di una figura, non delle sue campiture.

    E' quello che si vede: usarlo come viewBox vuol dire che la figura tocca
    esattamente i bordi del riquadro, senza margini invisibili da compensare.
    """
    ys, xs = np.nonzero(walls[:, lo:hi])
    x0, x1 = float(xs.min() + lo) / SCALE, float(xs.max() + lo) / SCALE
    y0, y1 = float(ys.min()) / SCALE, float(ys.max()) / SCALE
    return [round(x0, 1), round(y0, 1), round(x1 - x0, 1), round(y1 - y0, 1)]


def main():
    debug = "--debug" in sys.argv
    walls = rasterize()
    pool = regions(walls)
    print(f"{len(pool)} aree chiuse nel disegno")
    front = assign(FRONT, [r for r in pool if r["c"][0] < VIEW / 2], "front")
    back = assign(BACK, [r for r in pool if r["c"][0] >= VIEW / 2], "back")

    dbg = Image.new("RGB", (VIEW * SCALE, VIEW * SCALE), "white")
    dd = ImageDraw.Draw(dbg)
    for side in (front, back):
        for i, z in enumerate(side):
            pts = simplify(contour(z["region"]["mask"]), 1.4 * SCALE)
            z["d"], z["n"] = to_path(pts), len(pts)
            if debug:
                dd.polygon(pts, fill=((i * 67) % 200 + 40, (i * 113) % 200 + 40,
                                      (i * 179) % 200 + 40), outline=(0, 0, 0))

    for z in front + back:
        print(f"  {z['id']:<12} {z['region']['area']:>7} px  {z['n']:>3} punti")

    def dump(zones):
        return json.dumps(
            [{"id": z["id"], "label": z["label"], "d": z["d"],
              "c": [round(z["region"]["c"][0], 1), round(z["region"]["c"][1], 1)]}
             for z in zones], indent=2, ensure_ascii=False)

    OUT_TS.write_text(
        "// GENERATO da tools/extract-zones.py — non modificare a mano.\n"
        "//\n"
        "// Le zone non esistono come nodi nel file di partenza (e' un path unico):\n"
        "// sono ricavate riempiendo ogni area chiusa dalle linee del disegno, quindi\n"
        "// seguono esattamente il tratto originale.\n"
        "// I path sono nello spazio del viewBox originale (1366); il viewBox per lato\n"
        "// ritaglia la figura giusta.\n\n"
        "// `c` e' il baricentro: serve a scegliere la zona piu' vicina quando il dito\n"
        "// cade sulla linea o appena fuori. Gomito e polso sono di pochi pixel:\n"
        "// pretendere il centro esatto li renderebbe intoccabili.\n"
        "export type BodyZone = { id: string; label: string; d: string; c: [number, number] }\n\n"
        "// Ingombro del tratto di ciascuna figura, come viewBox [x, y, w, h].\n"
        "// Le due figure stanno affiancate nello stesso disegno: il viewBox e' il\n"
        "// modo di ritagliare quella giusta.\n"
        "export type Ink = [number, number, number, number]\n"
        f"export const FRONT_INK: Ink = {ink_box(walls, 0, VIEW // 2 * SCALE)}\n"
        f"export const BACK_INK: Ink = {ink_box(walls, VIEW // 2 * SCALE, VIEW * SCALE)}\n"
        f"export const BODY_SIZE = {VIEW}\n\n"
        f"export const FRONT_ZONES: BodyZone[] = {dump(front)}\n\n"
        f"export const BACK_ZONES: BodyZone[] = {dump(back)}\n",
        encoding="utf8",
    )
    print(f"\n{len(front)} zone fronte + {len(back)} retro -> {OUT_TS.relative_to(ROOT)}")
    if debug:
        out = ROOT / "out/diff/zones-debug.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        dbg.resize((VIEW, VIEW)).save(out)
        print(f"controllo visivo -> {out.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
