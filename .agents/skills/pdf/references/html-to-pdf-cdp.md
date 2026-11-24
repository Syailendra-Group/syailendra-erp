# Pixel-Perfect HTML-to-PDF Rendering via Chromium CDP

Use this workflow when generating custom-designed, publication-grade, multi-page PDF documents (brand identity guidelines, design system sheets, executive briefs) where CSS Grid/Flexbox, exact typography, color swatches, and bespoke visual layouts exceed `pdf_create.py` (`reportlab`).

## Procedure

1. **Prepare Self-Contained Fonts and Images.**
   - Fetch required font subsets (e.g. Google Fonts WOFF2 for `latin`) and inline them via `@font-face { src: url(data:font/woff2;base64,...); }`.
   - Embed raster logos and assets as `data:image/png;base64,...` data URIs. Self-contained HTML avoids network flakiness and file-path isolation inside headless browser workers.

2. **Decontaminate Raster Logos for Dark/Colored Backgrounds.**
   - Do not use naive luminance thresholds (e.g. `r < 60 -> white`) when converting a white-background raster logo for dark containers — anti-aliased edge pixels retain white blends and create bright halos and dark outlines.
   - Instead, detect background white pixels (`r,g,b >= 250`), isolate 1–2px boundary pixels, sample the nearest solid interior foreground color $F$, un-premultiply alpha coverage via $\alpha = \|255 - C\| / \|255 - F\|$, and assign clean RGB $F$ with alpha $\alpha$.
   - For dark backgrounds (e.g. `#004E52`), map low-saturation dark charcoal/black interiors to crisp white (`#FFFFFF`), brighten dark greens for separation, and preserve metallic gold gradients.

3. **Author Fixed-Page Print CSS.**
   - Lock exact A4 geometry and preserve background fills:
     ```css
     @page { size: A4 portrait; margin: 0; }
     body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
     .page {
       width: 210mm;
       height: 297mm;
       max-height: 297mm;
       padding: 16mm 18mm 14mm 18mm;
       position: relative;
       overflow: hidden;
       page-break-after: always;
     }
     .page:last-child { page-break-after: avoid; }
     .footer { position: absolute; bottom: 12mm; left: 18mm; right: 18mm; }
     ```
   - Verify HTML body text contains no literal Markdown formatting (`*word*`) — convert all emphasis to `<em>...</em>` or `<strong>...</strong>` before writing to disk.

4. **Render to PDF via `browser_exec` + CDP.**
   - Load the local file via `goto_url("file:///path/to/doc.html")` and `wait_for_load()`.
   - Wait for embedded fonts before printing: `js("document.fonts.ready")`.
   - Invoke raw CDP `Page.printToPDF`:
     ```python
     pdf_data = cdp(
         "Page.printToPDF",
         printBackground=True,
         preferCSSPageSize=True,
         paperWidth=8.27,
         paperHeight=11.69,
         marginTop=0,
         marginBottom=0,
         marginLeft=0,
         marginRight=0,
     )
     raw_pdf = base64.b64decode(pdf_data["data"])
     ```

5. **Set DocInfo Metadata and Verify Visually.**
   - Apply `/Title`, `/Author`, `/Subject`, `/Keywords` using `pdf_meta.py --set-meta` or `pypdf.PdfWriter`.
   - Confirm exact expected page count with `pypdf` (catching unintended overflow pages).
   - Rasterize every page to PNG (`pypdfium2` `page.render(scale=2).to_pil()` or `pdf_page_image.py`) and inspect every page with `vision_analyze`, checking table header legibility, badge/pill wrapping symmetry, and footer clearance.

## Pitfalls

- **Shared table-column classes hiding `<th>` text:** Never share text-color utility classes (e.g. `.col-elem { color: #004E52; }`) across both `<th>` and `<td>` when `<thead>` uses that same dark background color — text disappears dark-on-dark. Always scope cell colors to `td.<class>` and set explicit `th { color: #FFFFFF !important; }`.
- **Markdown asterisks leaking into HTML:** Converting prose drafted in Markdown directly into HTML templates leaves literal `*term*` characters visible in the PDF. Run a regex check against `<body>` outside `<style>`/`<code>` comments before rendering.
- **Uneven card heights from wrapping badges:** In multi-column swatch or KPI grids, keep badge/pill labels concise enough to stay single-line across all cards, or use flex column spacing (`justify-content: space-between`) so bottom borders align.
