import re, os, urllib.request

ROOT = os.path.dirname(os.path.abspath(__file__))
FONT_DIR = os.path.join(ROOT, "fonts")
os.makedirs(FONT_DIR, exist_ok=True)

CSS_URL = ("https://fonts.googleapis.com/css2?"
           "family=Poppins:wght@500;600;700&"
           "family=Inter:wght@400;500;600&display=swap")
UA = ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/120.0 Safari/537.36")

css = urllib.request.urlopen(
    urllib.request.Request(CSS_URL, headers={"User-Agent": UA}), timeout=60).read().decode()

blocks = re.findall(r"/\*\s*([\w\-]+)\s*\*/\s*(@font-face\s*\{[^}]+\})", css)
out, seen = ["/* Self-hosted fonts (latin subset) */"], set()
for subset, block in blocks:
    if subset != "latin":
        continue
    fam = re.search(r"font-family:\s*'([^']+)'", block).group(1)
    wt = re.search(r"font-weight:\s*(\d+)", block).group(1)
    url = re.search(r"url\(([^)]+\.woff2)\)", block).group(1)
    fname = f"{fam.replace(' ', '')}-{wt}.woff2"
    if fname not in seen:
        data = urllib.request.urlopen(
            urllib.request.Request(url, headers={"User-Agent": UA}), timeout=60).read()
        open(os.path.join(FONT_DIR, fname), "wb").write(data)
        print(f"{fname:24s} {len(data)//1024} KB")
        seen.add(fname)
    out.append(f"@font-face{{font-family:'{fam}';font-style:normal;font-weight:{wt};"
               f"font-display:swap;src:url('fonts/{fname}') format('woff2');}}")

open(os.path.join(ROOT, "fonts.css"), "w", encoding="utf-8").write("\n".join(out) + "\n")
print("wrote fonts.css with", len(seen), "files")
