# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
Static fan gallery website — pure HTML5, CSS3, vanilla JS. No build step, no frameworks, no package manager.

## Critical Synchronization Points
- **Gallery images are defined in TWO places** — must keep in sync:
  1. HTML: `.gallery__item` buttons in `index.html` (lines 122-171)
  2. JS: `GALLERY_IMAGES` array in [`script.js`](script.js:20)

## Responsive Image Structure
Images are served in multiple sizes for mobile optimization:
- `/images/photo-XX.jpg` — Original full-size JPEG (fallback)
- `/images/thumbs/photo-XX.webp` — 400px wide thumbnails (~20KB each)
- `/images/medium/photo-XX.webp` — 800px wide for mobile lightbox (~60KB each)
- `/images/large/photo-XX.webp` — 1200px wide for desktop (~110KB each)

## Adding Gallery Images
1. Add image to `/images/` directory (naming: `photo-XX.jpg`)
2. Generate responsive versions using sharp or similar tool:
   - Thumbnail: 400px wide, WebP, 80% quality
   - Medium: 800px wide, WebP, 85% quality
   - Large: 1200px wide, WebP, 85% quality
3. Add `<button class="gallery__item">` with `<picture>` element in HTML
4. Add corresponding entry to `GALLERY_IMAGES` array in script.js (include webp paths)
5. Update `data-index` values if inserting mid-sequence

## Lightbox Implementation
- Uses `hidden` attribute + `.active` class pattern (not `display:none`)
- Close animation timing: 250ms timeout in JS must match CSS transition
- Focus returns to triggering gallery item on close

## CSS Architecture
- Custom properties defined in [`:root`](styles.css:8) — use these, don't hardcode colors
- Typography uses `clamp()` for fluid scaling
- `prefers-reduced-motion` media query disables animations

## Running/Testing
- Open `index.html` directly in browser, or use any static server
- No lint/test commands — manual browser testing required
