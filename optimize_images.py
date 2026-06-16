import io, os, urllib.request
from PIL import Image

ROOT = os.path.dirname(os.path.abspath(__file__))
IMG = os.path.join(ROOT, "imges")
os.makedirs(IMG, exist_ok=True)
UA = {"User-Agent": "Mozilla/5.0"}

# (name, unsplash_id, width)
ASSETS = [
    ("hero-dentist",   "1606811841689-23dfddce3e95", 1600),
    ("hero-dentist",   "1606811841689-23dfddce3e95", 900),
    ("about-clinic",   "1629909613654-28e377c37b09", 900),
    ("tech-scan",      "1666214280557-f1b5022eb634", 800),
    ("exam-closeup",   "1606811971618-4486d14f3f99", 800),
    ("treat-aligner",  "1609840114035-3c981b782dfe", 800),
    ("clinic-chair",   "1598256989800-fe5f95da9787", 800),
    ("clinic-xray",    "1588776814546-1ffcf47267a5", 800),
    ("doctor-1",       "1612349317150-e413f6a5b16d", 600),
    ("doctor-2",       "1559839734-2b71ea197ec2",    600),
    ("doctor-3",       "1612531386530-97286d97c2d2", 600),
    ("smile-1",        "1494790108377-be9c29b29330", 900),
    ("smile-2",        "1607990281513-2c110a25bd8c", 900),
    ("avatar-1",       "1494790108377-be9c29b29330", 160),
    ("avatar-2",       "1607990281513-2c110a25bd8c", 160),
    ("avatar-3",       "1573496359142-b8d87734a5a2", 160),
    ("avatar-4",       "1487412720507-e7ab37603c6f", 160),
]

for name, pid, w in ASSETS:
    out = os.path.join(IMG, f"{name}-{w}.webp")
    if os.path.exists(out):
        print(f"skip {name}-{w}")
        continue
    url = f"https://images.unsplash.com/photo-{pid}?auto=format&fit=crop&w={w}&q=80"
    data = urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()
    im = Image.open(io.BytesIO(data)).convert("RGB")
    if im.width > w:
        im = im.resize((w, round(im.height * w / im.width)), Image.LANCZOS)
    q = 72 if w >= 1400 else 82
    im.save(out, "WEBP", quality=q, method=6)
    print(f"{name}-{w}.webp  {os.path.getsize(out)//1024} KB")

print("done")
