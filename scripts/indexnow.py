"""Notify IndexNow after production deploys; no third-party packages required."""
import argparse
import json
import os
from pathlib import Path
import subprocess
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET

ORIGIN = "https://beadsworldafrica.co.ke"
KEY = "5e0b51cbe8264cc28a4b68f83e625e5f"
KEY_URL = f"{ORIGIN}/{KEY}.txt"
ENDPOINT = "https://api.indexnow.org/indexnow"
STATE = Path(".indexnow/state.json")


def request(url, payload=None):
    data = None if payload is None else json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={
        "User-Agent": "BWA-IndexNow/1.0",
        "Content-Type": "application/json; charset=utf-8",
    })
    for attempt in range(4):
        try:
            with urllib.request.urlopen(req, timeout=30) as response:
                return response.status, response.read()
        except urllib.error.HTTPError as error:
            if error.code not in (429, 500, 502, 503, 504) or attempt == 3:
                raise
        except urllib.error.URLError:
            if attempt == 3:
                raise
        time.sleep(5 * (2 ** attempt))
    raise RuntimeError("Request retries exhausted")


def sitemap_urls(xml):
    root = ET.fromstring(xml)
    ns = {"s": "http://www.sitemaps.org/schemas/sitemap/0.9"}
    if root.tag != f"{{{ns['s']}}}urlset":
        raise ValueError("Expected the site's URL sitemap")
    urls = set()
    for loc in root.findall("s:url/s:loc", ns):
        url = (loc.text or "").strip().rstrip("/")
        parsed = urllib.parse.urlsplit(url)
        if f"{parsed.scheme}://{parsed.netloc}" != ORIGIN or parsed.query or parsed.fragment:
            raise ValueError(f"Unexpected sitemap URL: {url}")
        # /shop is deliberately noindex; /bracelets is the canonical collection.
        if parsed.path != "/shop":
            urls.add(url)
    if not urls:
        raise ValueError("Refusing an empty sitemap")
    return urls


def select_urls(current, previous, changed_files):
    if previous is None:
        return sorted(current)
    old = set(previous["urls"])
    selected = current ^ old  # Include removals so engines can drop old URLs.
    for file in changed_files:
        parts = Path(file).parts
        slug = None
        if file.startswith("content/journal/") and file.endswith(".md"):
            slug = Path(file).stem
        elif file.startswith("public/journal/") and len(parts) >= 4:
            slug = parts[2]
        elif (file.startswith((".github/", "scripts/", "docs/"))
              or file in ("AGENTS.md", "README.md", ".gitignore")):
            continue
        else:
            # Shared UI, catalogue logic, styles, config, etc. can affect every page.
            selected.update(current)
            continue
        url = f"{ORIGIN}/journal/{slug}"
        if url in current or url in old:
            selected.update((url, ORIGIN, f"{ORIGIN}/journal"))
    return sorted(selected)


def git(*args):
    return subprocess.check_output(["git", *args]).decode().strip()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()
    status, key = request(KEY_URL)
    if status != 200 or key.decode("utf-8") != KEY:
        raise ValueError("The live IndexNow key does not match")
    _, xml = request(f"{ORIGIN}/sitemap.xml")
    current = sitemap_urls(xml)
    previous = json.loads(STATE.read_text()) if STATE.exists() else None
    changed = []
    if previous:
        try:
            changed = git("diff", "--name-only", "--no-renames", previous["sha"], "HEAD").splitlines()
        except subprocess.CalledProcessError:
            # Cache may refer to a commit removed by a history rewrite.
            previous = None
    urls = select_urls(current, previous, changed)
    print(f"{len(urls)} URLs selected from {len(current)} live sitemap URLs")
    for url in urls:
        print(url)
    if args.dry_run:
        return
    for offset in range(0, len(urls), 10000):
        status, _ = request(ENDPOINT, {
            "host": urllib.parse.urlsplit(ORIGIN).netloc,
            "key": KEY,
            "keyLocation": KEY_URL,
            "urlList": urls[offset:offset + 10000],
        })
        if status not in (200, 202):
            raise RuntimeError(f"Unexpected IndexNow response: HTTP {status}")
        print(f"IndexNow HTTP {status}" + (" (key validation pending)" if status == 202 else ""))
    # Only advance the baseline after every batch was accepted.
    STATE.parent.mkdir(parents=True, exist_ok=True)
    STATE.write_text(json.dumps({"sha": git("rev-parse", "HEAD"), "urls": sorted(current)}))
    summary = os.environ.get("GITHUB_STEP_SUMMARY")
    if summary:
        with open(summary, "a") as output:
            output.write(f"IndexNow accepted {len(urls)} URL notifications. Acceptance does not guarantee indexing.\n")


if __name__ == "__main__":
    main()
