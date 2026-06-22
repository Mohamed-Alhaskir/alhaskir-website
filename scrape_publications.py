#!/usr/bin/env python3
"""
Fetch publications from a Google Scholar profile and write publications.json,
which the website loads to render the Publications section.

Usage:
    python scrape_publications.py                 # uses SCHOLAR_ID below / env var
    SCHOLAR_ID=XXXXXXXXXXXX python scrape_publications.py
    python scrape_publications.py --id XXXXXXXXXXXX

Notes:
    Google Scholar has no official API and rate-limits / blocks scraping.
    Keep the refresh interval modest (e.g. weekly). If you get blocked,
    the website keeps showing the last good publications.json, and the
    built-in fallback list in index.html shows if the file is missing.
"""

import argparse
import json
import os
import sys
from datetime import date

# ---------------------------------------------------------------------------
# 1. Set your Google Scholar profile ID here (the "user=" value in the URL).
#    e.g. https://scholar.google.com/citations?user=ABC123DEF  ->  "ABC123DEF"
# ---------------------------------------------------------------------------
SCHOLAR_ID = "ntHtVD8AAAAJ"

OUTPUT_FILE = os.path.join(os.path.dirname(__file__), "publications.json")


def _maybe_enable_proxies() -> None:
    """Best-effort: route scholarly through free proxies.

    Google Scholar blocks datacenter/CI IP ranges, so a direct request from a
    GitHub Actions runner is almost always refused. Free proxies are slow and
    unreliable, but they occasionally get through. Enabled when the env var
    USE_FREE_PROXIES is truthy. Any failure here is non-fatal — we just fall
    back to a direct request (which then degrades gracefully in main()).
    """
    if os.environ.get("USE_FREE_PROXIES", "").lower() not in ("1", "true", "yes"):
        return
    try:
        from scholarly import scholarly, ProxyGenerator
        pg = ProxyGenerator()
        if pg.FreeProxies():
            scholarly.use_proxy(pg)
            print("Using free proxies for Google Scholar requests.")
    except Exception as exc:  # noqa: BLE001 - best effort only
        print(f"Could not set up proxies ({exc}); continuing without them.")


def fetch(scholar_id: str) -> dict:
    """Return a dict ready to serialize to publications.json."""
    try:
        from scholarly import scholarly
    except ImportError:
        sys.exit("Missing dependency. Run:  pip install -r requirements.txt")

    _maybe_enable_proxies()

    author = scholarly.search_author_id(scholar_id)
    # Only fill the publications section to minimize requests (less blocking).
    author = scholarly.fill(author, sections=["publications"])

    pubs = []
    for p in author.get("publications", []):
        bib = p.get("bib", {})
        year = bib.get("pub_year")
        pub_id = p.get("author_pub_id")
        venue = (bib.get("citation") or bib.get("journal") or "").strip()
        # Scholar's venue string usually ends with ", YYYY" — drop it so the
        # year isn't shown twice (we render venue and year separately).
        if year and venue.rstrip().endswith(str(year)):
            venue = venue.rstrip()[: -len(str(year))].rstrip().rstrip(",").rstrip()
        pubs.append({
            "title": bib.get("title", "").strip(),
            "venue": venue,
            "year": int(year) if year and str(year).isdigit() else None,
            "citations": int(p.get("num_citations") or 0),
            "url": (
                f"https://scholar.google.com/citations?view_op=view_citation"
                f"&hl=en&user={scholar_id}&citation_for_view={pub_id}"
                if pub_id else None
            ),
        })

    # Newest first; within a year, most-cited first. Undated items go on top
    # (typically "in press" / under review).
    pubs.sort(key=lambda x: (x["year"] is not None, x["year"] or 0, x["citations"]),
              reverse=True)

    return {
        "author": author.get("name", ""),
        "profile_url": f"https://scholar.google.com/citations?user={scholar_id}",
        "updated": date.today().isoformat(),
        "publications": pubs,
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Scrape Google Scholar publications.")
    parser.add_argument("--id", dest="scholar_id",
                        default=os.environ.get("SCHOLAR_ID", SCHOLAR_ID),
                        help="Google Scholar profile ID (the user= value).")
    args = parser.parse_args()

    if not args.scholar_id or args.scholar_id == "REPLACE_WITH_YOUR_SCHOLAR_ID":
        sys.exit("No Scholar ID set. Edit SCHOLAR_ID in this file, pass --id, "
                 "or set the SCHOLAR_ID environment variable.")

    try:
        data = fetch(args.scholar_id)
    except Exception as exc:  # noqa: BLE001 - Scholar blocks/rate-limits are expected
        # Don't fail the build. The site keeps serving the last good
        # publications.json (or the static fallback list in index.html).
        print(f"WARNING: could not fetch from Google Scholar ({exc}).")
        print("Keeping the existing publications.json unchanged.")
        return

    if not data["publications"]:
        print("WARNING: Scholar returned no publications; keeping existing file.")
        return

    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

    print(f"Wrote {len(data['publications'])} publications to {OUTPUT_FILE} "
          f"(updated {data['updated']}).")


if __name__ == "__main__":
    main()
