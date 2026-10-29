# sDMD project page

Public page for **sDMD: Sinkhorn Distribution Matching Distillation** (KAIST and Netflix, 2026).
Static HTML, CSS and JavaScript; no build step is needed to serve it.
All project media and data are included in this folder; the paper source and
supplementary bundle are not required. Fonts and KaTeX load from external CDNs
and require an internet connection.

## Layout

| Path | What |
| --- | --- |
| `index.html` | the page: hero, method, result tables, image and video comparisons, BibTeX |
| `assets/css/site.css` | styles |
| `assets/js/site.js` | reel, comparison viewers, lightbox, tabs |
| `assets/js/data.js` | prompts, labels and local media paths |
| `media/video`, `media/poster` | Wan2.1-14B clips and poster frames |
| `media/img` | teaser tiles, motivation panels, Qwen-Image and FLUX comparison images |

## Updating media

Add or replace files under `media/`, then edit the corresponding paths, prompts
and labels in `assets/js/data.js`. Change its `version` value when replacing
media so browsers fetch the updated files. The motivation images are referenced
directly in `index.html`.

## Before publishing

Search `index.html` for `TODO` and fill in the arXiv and code links.

## Local preview

```sh
python3 -m http.server 8000
```

then open <http://localhost:8000>.
