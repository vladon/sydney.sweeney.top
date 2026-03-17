# Frontend Audit Report — Sydney Sweeney Fan Gallery

**Audit Date:** 2026-03-17  
**Auditor:** Senior Frontend Engineer Review  
**Severity Scale:** 🔴 Critical | 🟠 High | 🟡 Medium | 🟢 Low

---

## Executive Summary

The codebase demonstrates solid fundamentals with good use of semantic HTML, CSS custom properties, and vanilla JS patterns. However, several issues impact performance, accessibility, and maintainability that should be addressed.

---

## 🔴 CRITICAL ISSUES

### 1. Missing `defer` on Script Tag
**File:** [`index.html:210`](index.html:210)  
**Category:** Performance

The script is loaded without `defer`, blocking HTML parsing.

```html
<!-- Current -->
<script src="script.js"></script>

<!-- Should be -->
<script src="script.js" defer></script>
```

**Impact:** Delays First Contentful Paint and Time to Interactive.

---

### 2. No Image Loading Error Handling
**File:** [`script.js`](script.js:236)  
**Category:** Maintainability / UX

The lightbox image [`updateLightboxImage()`](script.js:236) function sets `src` without any error handling. If an image fails to load, users see a broken image with no feedback.

---

### 3. Duplicate Data Definition
**Files:** [`index.html:117-164`](index.html:117), [`script.js:20-29`](script.js:20)  
**Category:** Maintainability

Gallery images are defined in TWO places requiring manual synchronization. This violates DRY principles and is a common source of bugs.

---

## 🟠 HIGH PRIORITY ISSUES

### 4. Missing `font-display` Declaration
**File:** [`styles.css:27-28`](styles.css:27)  
**Category:** Performance

Fonts reference Google Fonts but no `@font-face` with `font-display: swap` is defined. This causes FOIT (Flash of Invisible Text).

```css
/* Current */
--font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
--font-body: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;

/* Missing: Actual font-face declarations with font-display */
```

**Note:** Fonts are referenced but never actually loaded via `<link>` tags.

---

### 5. Preconnect Without Font Load
**File:** [`index.html:39-40`](index.html:39)  
**Category:** Performance

Preconnect hints to Google Fonts exist, but no font `<link>` tags are present. Wasted preconnect.

```html
<link rel="preconnect" href="https://fonts.googleapis.com" crossorigin>
<link rel="dns-prefetch" href="https://fonts.googleapis.com">
<!-- Missing: Actual font <link> tags! -->
```

---

### 6. No Modern Image Format Support
**File:** [`index.html:119`](index.html:119)  
**Category:** Performance

Using only `.jpg` without `<picture>` element for WebP/AVIF fallbacks results in larger payload sizes.

---

### 7. Lightbox Counter ARIA Role
**File:** [`index.html:204`](index.html:204)  
**Category:** Accessibility

The counter uses `aria-live="polite"` but should have explicit `role="status"` for broader screen reader support.

```html
<!-- Current -->
<div class="lightbox__counter" aria-live="polite" aria-atomic="true">

<!-- Better -->
<div class="lightbox__counter" role="status" aria-live="polite" aria-atomic="true">
```

---

### 8. Missing `aria-describedby` on Lightbox
**File:** [`index.html:183`](index.html:183)  
**Category:** Accessibility

The lightbox dialog lacks `aria-describedby` to provide context about the image being viewed.

---

### 9. No Safe Area Insets for Notched Devices
**File:** [`styles.css`](styles.css)  
**Category:** Responsive

No handling for iOS safe areas (notch, home indicator) which can obscure content on iPhone X+.

```css
/* Missing */
@supports (padding: max(0px)) {
    .lightbox__prev {
        left: max(var(--space-md), env(safe-area-inset-left));
    }
    .lightbox__next {
        right: max(var(--space-md), env(safe-area-inset-right));
    }
}
```

---

### 10. Magic Numbers in JavaScript
**File:** [`script.js:32-35`](script.js:32)  
**Category:** Maintainability

Constants like `LIGHTBOX_CLOSE_DELAY = 250` and `SWIPE_THRESHOLD = 50` are defined, but the stagger delay `100` in [`setupGalleryReveal()`](script.js:390) is hardcoded inline.

---

## 🟡 MEDIUM PRIORITY ISSUES

### 11. Missing `content-visibility` Optimization
**File:** [`styles.css`](styles.css)  
**Category:** Performance

The About section and Gallery items could benefit from `content-visibility: auto` to skip rendering off-screen content.

---

### 12. Heavy `backdrop-filter` Usage
**File:** [`styles.css:330-331`](styles.css:330)  
**Category:** Performance

`backdrop-filter: blur(12px)` is expensive on mobile GPUs. Should have a fallback and potentially be disabled on low-power devices.

---

### 13. No `will-change` Hints for Animations
**File:** [`styles.css`](styles.css)  
**Category:** Performance

Animated elements like `.gallery__item img` and `.hero__backdrop` lack `will-change` hints, causing repaints during animation.

---

### 14. Gallery Grid: `auto-fill` vs `auto-fit`
**File:** [`styles.css:474`](styles.css:474)  
**Category:** Responsive

Using `auto-fill` keeps empty grid tracks. `auto-fit` would collapse them for better centering with fewer items.

---

### 15. Missing `og:image:alt`
**File:** [`index.html`](index.html:23)  
**Category:** SEO / Accessibility

Open Graph image lacks alt text for social media previews.

```html
<meta property="og:image:alt" content="Sydney Sweeney Fan Gallery Preview">
```

---

### 16. Missing Twitter Site/Creator
**File:** [`index.html:29-33`](index.html:29)  
**Category:** SEO

Twitter cards lack `twitter:site` attribution.

---

### 17. Hero Title Overflow Risk
**File:** [`styles.css:294-302`](styles.css:294)  
**Category:** Responsive

On very small viewports (<320px), the hero title could overflow. No `min-height` or `overflow` handling.

---

### 18. Inline Styles in JavaScript
**File:** [`script.js:467-469`](script.js:467)  
**Category:** Maintainability

Reduced motion handler sets inline styles directly instead of toggling a class.

```javascript
// Current
item.style.opacity = '1';
item.style.transform = 'none';

// Better: Toggle a class
item.classList.add('no-motion');
```

---

### 19. Redundant Keydown Handler on Buttons
**File:** [`script.js:303-308`](script.js:303)  
**Category:** Accessibility / Code Quality

Buttons natively handle Enter and Space for activation. The explicit keydown handler is redundant.

```javascript
// This is redundant - buttons already handle Enter/Space
item.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(index);
    }
});
```

---

### 20. No Print Styles for Images
**File:** [`styles.css:773-800`](styles.css:773)  
**Category:** Responsive

Print styles hide lightbox but gallery images should have `page-break-inside: avoid` which is present, but images lack explicit print sizing.

---

## 🟢 LOW PRIORITY ISSUES

### 21. Meta Description Length
**File:** [`index.html:6`](index.html:6)  
**Category:** SEO

Description is ~155 characters which is good, but could be more compelling for CTR.

---

### 22. No Sitemap Reference
**File:** [`index.html`](index.html)  
**Category:** SEO

Missing `<link rel="sitemap" type="application/xml" href="/sitemap.xml">`.

---

### 23. CSS Could Use `@layer`
**File:** [`styles.css`](styles.css)  
**Category:** Maintainability

Modern CSS architecture would benefit from `@layer` for cascade management.

---

### 24. No CSS Custom Property for Lightbox Z-Index
**File:** [`styles.css:598`](styles.css:598)  
**Category:** Maintainability

`z-index: 1000` is hardcoded instead of using a custom property.

---

### 25. Skip Link Could Reference Main Content Better
**File:** [`index.html:69`](index.html:69)  
**Category:** Accessibility

"Skip to gallery" skips the About section too. "Skip to main content" would be more accurate.

---

## Summary Table

| Category | Critical | High | Medium | Low | Total |
|----------|----------|------|--------|-----|-------|
| Performance | 1 | 5 | 3 | 0 | 9 |
| Accessibility | 0 | 2 | 2 | 1 | 5 |
| Responsive | 0 | 1 | 2 | 0 | 3 |
| SEO | 0 | 0 | 2 | 2 | 4 |
| Maintainability | 2 | 1 | 2 | 2 | 7 |
| **Total** | **3** | **9** | **11** | **5** | **28** |

---

## Recommended Fix Order

1. Add `defer` to script tag (immediate performance win)
2. Either add Google Fonts links OR remove preconnect hints
3. Add image error handling in lightbox
4. Add `role="status"` to lightbox counter
5. Add safe area insets for notched devices
6. Extract magic numbers to constants
7. Remove redundant keydown handler
8. Add `content-visibility: auto` to off-screen sections
9. Add `og:image:alt` meta tag
10. Consolidate gallery data source (consider data attributes)

---

## Files Requiring Changes

- [`index.html`](index.html) — Script defer, font loading, meta tags, ARIA attributes
- [`styles.css`](styles.css) — Safe areas, content-visibility, will-change, z-index variable
- [`script.js`](script.js) — Error handling, magic numbers, redundant code removal
