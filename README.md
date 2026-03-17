# Sydney Sweeney Fan Gallery

A premium, editorial-style static fan landing page dedicated to Sydney Sweeney. Built with pure HTML5, CSS3, and minimal vanilla JavaScript — no frameworks, no build tools required.

## Preview

The site features a dark cinematic theme with elegant typography, a responsive photo gallery, and a keyboard-accessible lightbox.

## Quick Start

1. Clone or download this repository
2. Add your images to the `/images` directory (see Image Requirements below)
3. Open `index.html` in a browser, or deploy to any static hosting service

## Project Structure

```
sydney.sweeney.top/
├── index.html          # Main HTML file
├── styles.css          # All styles (dark theme, responsive)
├── script.js           # Lightbox, keyboard nav, reveal animations
├── README.md           # This file
└── images/             # Image assets (you provide these)
    ├── hero.jpg        # Hero section background
    ├── og-image.jpg    # Open Graph preview image
    ├── photo-01.jpg    # Gallery images
    ├── photo-02.jpg
    ├── photo-03.jpg
    ├── photo-04.jpg
    ├── photo-05.jpg
    ├── photo-06.jpg
    ├── photo-07.jpg
    └── photo-08.jpg
```

## Image Requirements

### Recommended Formats

- **WebP** or **AVIF** for best compression (with JPG fallback if needed)
- Standard **JPG** works fine for simplicity

### Recommended Dimensions

| Image | Dimensions | Notes |
|-------|------------|-------|
| `hero.jpg` | 1200×1600px (portrait) or 1920×1080px (landscape) | High quality, will be darkened by overlay |
| `photo-01.jpg` — `photo-08.jpg` | 800×1200px (portrait) | Consistent aspect ratio recommended |
| `og-image.jpg` | 1200×630px | For social media previews |

### Naming Convention

- Use lowercase with hyphens: `photo-01.jpg`, `photo-02.jpg`
- Number sequentially for easy reordering
- Keep file sizes under 500KB per image for fast loading

### Optimization Tips

```bash
# Using ImageMagick to resize and optimize
convert original.jpg -resize 800x1200 -quality 85 photo-01.jpg

# Using squoosh CLI (npm install -g @aspect-build/squoosh)
squoosh --webp auto --oxipng {} original.jpg
```

## Features

### Design
- Premium editorial aesthetic with dark cinematic theme
- Elegant serif display font paired with clean body text
- Strong visual hierarchy and generous spacing
- Subtle hover effects and transitions

### Performance
- No external dependencies or frameworks
- Lazy loading for gallery images (`loading="lazy"`)
- Hero image preloaded for instant display
- Minimal JavaScript (~3KB)
- CSS custom properties for maintainability
- Respects `prefers-reduced-motion`

### Accessibility
- Semantic HTML5 structure
- Full keyboard navigation
- Visible focus states
- ARIA labels on interactive elements
- Sufficient color contrast (WCAG AA)
- Lightbox traps focus and supports ESC to close

### SEO
- Proper `<title>` and meta description
- Open Graph tags for social sharing
- Twitter Card meta tags
- Semantic heading hierarchy
- Canonical URL

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

The site uses modern CSS features like `clamp()`, CSS custom properties, and `backdrop-filter`. Graceful degradation is provided for older browsers.

## Customization

### Changing Colors

Edit the CSS custom properties in `styles.css`:

```css
:root {
    --color-bg-deep: #0a0a0b;      /* Darkest background */
    --color-bg: #111113;            /* Section backgrounds */
    --color-accent: #d4a574;        /* Accent color (warm gold) */
    --color-text-primary: #f5f5f4;  /* Main text */
}
```

### Adding More Gallery Images

1. Add new images to `/images` directory
2. Update the gallery HTML in `index.html`:

```html
<button class="gallery__item" data-index="8" aria-label="View photo 9">
    <img src="images/photo-09.jpg" alt="Description" loading="lazy">
    <div class="gallery__item-overlay"></div>
</button>
```

3. Update the `GALLERY_IMAGES` array in `script.js`:

```javascript
const GALLERY_IMAGES = [
    // ... existing images
    { src: 'images/photo-09.jpg', alt: 'Description' }
];
```

### Changing Fonts

The site uses system fonts by default. To use custom fonts, add to `styles.css`:

```css
@font-face {
    font-family: 'Your Display Font';
    src: url('/fonts/your-font.woff2') format('woff2');
    font-weight: 400;
    font-display: swap;
}

:root {
    --font-display: 'Your Display Font', Georgia, serif;
}
```

## Deployment

This is a static site — deploy to any static hosting:

- **Netlify**: Drag and drop the folder, or connect to Git
- **Vercel**: `vercel --prod`
- **GitHub Pages**: Push to `main` branch, enable Pages in settings
- **Cloudflare Pages**: Connect repository
- **Any web server**: Just upload the files

No build step required.

## License

This is a fan site template. All images of Sydney Sweeney are copyrighted by their respective owners. This project is for educational and personal use only.

## Disclaimer

This is an unofficial fan site and is not affiliated with Sydney Sweeney or her representatives. No copyright infringement intended.
