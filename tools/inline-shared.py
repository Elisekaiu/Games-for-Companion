#!/usr/bin/env python3
"""Copy shared/base.css and shared/bridge.js into every page.

Each page in this repo is deliberately one self-contained HTML file, so a single
game can be downloaded, forked, opened offline or dropped onto any static host
without the rest of the site. The shared code lives in shared/ and is copied into
these marked blocks in each page:

    <style data-shared="base.css"></style>
    <script data-shared="bridge.js"></script>

Usage:
    python3 tools/inline-shared.py          # update every page
    python3 tools/inline-shared.py --check  # exit 1 if any page is out of date
"""
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent.parent
SHARED = ROOT / "shared"
BLOCKS = (("style", "base.css"), ("script", "bridge.js"))


def pages():
    yield ROOT / "index.html"
    for page in sorted(ROOT.glob("*/index.html")):
        if page.parent.name not in {"shared", "tools", "node_modules"}:
            yield page


def inline(html: str) -> str:
    for tag, name in BLOCKS:
        code = (SHARED / name).read_text(encoding="utf-8").strip()
        pattern = re.compile(
            rf'(<{tag} data-shared="{re.escape(name)}">)(.*?)(</{tag}>)', re.S
        )
        html = pattern.sub(lambda m: f"{m.group(1)}\n{code}\n{m.group(3)}", html)
    return html


def main() -> int:
    check = "--check" in sys.argv
    stale = []
    for page in pages():
        if not page.exists():
            continue
        before = page.read_text(encoding="utf-8")
        after = inline(before)
        if before != after:
            stale.append(page.relative_to(ROOT))
            if not check:
                page.write_text(after, encoding="utf-8")
    if check and stale:
        print("Out of date (run python3 tools/inline-shared.py):")
        for p in stale:
            print("  ", p)
        return 1
    for p in stale:
        print("updated", p)
    return 0


if __name__ == "__main__":
    sys.exit(main())
