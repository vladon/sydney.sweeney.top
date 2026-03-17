# AGENTS.md

This file provides guidance to agents when working with code in this repository.

## Project Overview
Static fan gallery website — pure HTML5, CSS3, vanilla JS. No build step, no frameworks, no package manager.

## Critical Synchronization Points
- **Gallery images are defined in TWO places** — must keep in sync:
  1. HTML: `.gallery__item` buttons in `index.html` (lines 83-114)
  2. JS: `GALLERY_IMAGES` array in [`script.js`](script.js:12)

## Adding Gallery Images
1. Add image to `/images/` directory (naming: `photo-XX.jpg`)
2. Add `<button class="gallery__item">` in HTML with `data-index` attribute (0-based)
3. Add corresponding entry to `GALLERY_IMAGES` array in script.js
4. Update `data-index` values if inserting mid-sequence

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
