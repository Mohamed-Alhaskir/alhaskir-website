# Mohamed Alhaskir — Personal CV Website

A single-page personal portfolio / CV for **Mohamed Alhaskir**, PhD Candidate in Medical AI
and Machine Learning Researcher & Engineer at RWTH Aachen University.

## Design

The aesthetic fuses **Syrian / oriental heritage** with the **future of medical AI**:

- **Palette** — deep midnight navy + teal (depth), oriental **gold** (heritage), electric **cyan** (AI).
- **Motifs** — Islamic 8-pointed *girih* geometry and a *mihrab* arch merged with neural-network
  nodes (animated hero visual), a tiled girih background, Arabic section labels and calligraphy.
- **Typography** — Playfair Display / Amiri for headings, Cairo for Arabic, Inter for body text.
- Glassmorphism cards, scroll-reveal animations, animated stat counters, and a responsive
  mobile menu. Respects `prefers-reduced-motion`.

## Content

All content is taken from the real CV (`CV_alhaskir.pdf`):

- Hero, About + languages
- Skills (Machine Learning, Trustworthy AI & Evaluation, Multimodal & Data, Software & Infrastructure, Deployment)
- Research & Experience timeline (RWTH PhD — MoniPy / HaMoJo / FORECAST LOS, FZ Jülich, Charité Berlin)
- Education
- Selected Publications
- Awards & Activities (DAAD Prize, NeuroTX Aachen e.V.)
- Contact (real emails, phone, GitHub) + CV download link

## Files

| File | Purpose |
|------|---------|
| `index.html` | Page structure and content |
| `style.css` | All styling, layout, animations |
| `script.js` | Navbar, mobile menu, scroll-reveal, active-link spy, stat counters |
| `CV_alhaskir.pdf` | Downloadable full CV (linked from the nav and contact section) |

## Running

It's a static site — no build step. Open `index.html` directly, or serve locally:

```bash
python3 -m http.server 8000
# then visit http://localhost:8000
```

## Publications — auto-updated from Google Scholar

The Publications section is populated from `publications.json`, which is produced by
`scrape_publications.py` (using the `scholarly` library). The page loads that file at
runtime; if it's missing or you open the page over `file://`, the built-in list in
`index.html` is shown as a fallback.

**One-time setup**

1. Put your Scholar profile ID (the `user=` value in your profile URL) into
   `scrape_publications.py` (`SCHOLAR_ID = "..."`), or pass it another way (below).
2. Install the dependency: `pip install -r requirements.txt`
3. Generate the file: `python scrape_publications.py`
   (or `python scrape_publications.py --id YOUR_ID`, or `SCHOLAR_ID=YOUR_ID python scrape_publications.py`)

**Automatic refresh (GitHub Actions)**

`.github/workflows/update-publications.yml` runs the scraper every Monday (and on demand
from the Actions tab), then commits `publications.json` if it changed. To use it:

- Host the repo on GitHub (e.g. with GitHub Pages).
- Add a repository **variable** named `SCHOLAR_ID`
  (Settings → Secrets and variables → Actions → Variables), or rely on the value in the script.

> Note: Google Scholar has no official API and rate-limits scraping, so keep the schedule
> modest (weekly). If a run is blocked, the site keeps serving the last good `publications.json`.

## Customizing

- **Colors** live in the `:root` block at the top of `style.css` (`--gold`, `--cyan`, `--navy-*`, …).
- **Content** is plain HTML in `index.html` — edit the relevant `<section>`.
- To add a profile photo, replace the hero `.neuro-star` SVG or add an `<img>` in the About section.
