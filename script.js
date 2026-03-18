/**
 * Sydney Sweeney Fan Gallery
 * Lightbox, keyboard navigation, and reveal animations
 * 
 * @version 1.1.0
 * @license MIT
 */

(function() {
    'use strict';

    // --------------------------------------------------------------------------
    // Configuration - All magic numbers extracted to named constants
    // --------------------------------------------------------------------------
    
    /**
     * Gallery images array - MUST be kept in sync with HTML .gallery__item elements
     * Supports responsive images with WebP and JPEG fallbacks
     * @type {Array<{src: string, alt: string, webp: {medium: string, large: string}}>}
     */
    const GALLERY_IMAGES = [
        {
            src: 'images/photo-01.jpg',
            alt: 'Sydney Sweeney portrait',
            webp: { medium: 'images/medium/photo-01.webp', large: 'images/large/photo-01.webp' }
        },
        {
            src: 'images/photo-02.jpg',
            alt: 'Sydney Sweeney editorial',
            webp: { medium: 'images/medium/photo-02.webp', large: 'images/large/photo-02.webp' }
        },
        {
            src: 'images/photo-03.jpg',
            alt: 'Sydney Sweeney portrait session',
            webp: { medium: 'images/medium/photo-03.webp', large: 'images/large/photo-03.webp' }
        },
        {
            src: 'images/photo-04.jpg',
            alt: 'Sydney Sweeney photoshoot',
            webp: { medium: 'images/medium/photo-04.webp', large: 'images/large/photo-04.webp' }
        },
        {
            src: 'images/photo-05.jpg',
            alt: 'Sydney Sweeney fashion editorial',
            webp: { medium: 'images/medium/photo-05.webp', large: 'images/large/photo-05.webp' }
        },
        {
            src: 'images/photo-06.jpg',
            alt: 'Sydney Sweeney studio portrait',
            webp: { medium: 'images/medium/photo-06.webp', large: 'images/large/photo-06.webp' }
        },
        {
            src: 'images/photo-07.jpg',
            alt: 'Sydney Sweeney magazine cover',
            webp: { medium: 'images/medium/photo-07.webp', large: 'images/large/photo-07.webp' }
        },
        {
            src: 'images/photo-08.jpg',
            alt: 'Sydney Sweeney red carpet',
            webp: { medium: 'images/medium/photo-08.webp', large: 'images/large/photo-08.webp' }
        }
    ];

    /** @type {number} Must match CSS transition duration for lightbox */
    const LIGHTBOX_CLOSE_DELAY_MS = 250;

    /** @type {number} Touch swipe threshold in pixels */
    const SWIPE_THRESHOLD_PX = 50;

    /** @type {number} Stagger delay between gallery item reveals in ms */
    const REVEAL_STAGGER_DELAY_MS = 100;

    /** @type {number} Intersection observer threshold (0-1) */
    const INTERSECTION_THRESHOLD = 0.1;

    /** @type {string} Root margin for intersection observer */
    const INTERSECTION_ROOT_MARGIN = '50px 0px';

    // --------------------------------------------------------------------------
    // DOM Elements (cached for performance)
    // --------------------------------------------------------------------------
    
    const dom = {
        lightbox: document.getElementById('lightbox'),
        lightboxImage: document.getElementById('lightbox-image'),
        lightboxCurrent: document.getElementById('lightbox-current'),
        lightboxTotal: document.getElementById('lightbox-total'),
        lightboxClose: document.querySelector('.lightbox__close'),
        lightboxPrev: document.querySelector('.lightbox__prev'),
        lightboxNext: document.querySelector('.lightbox__next'),
        lightboxError: document.querySelector('.lightbox__error'),
        galleryItems: document.querySelectorAll('.gallery__item'),
        yearSpan: document.getElementById('year'),
        heroCTA: document.querySelector('.hero__cta')
    };

    // --------------------------------------------------------------------------
    // State
    // --------------------------------------------------------------------------
    
    const state = {
        currentIndex: 0,
        isInLightbox: false,
        previousActiveElement: null,
        focusableElements: null,
        touchStartX: 0,
        touchEndX: 0,
        imageLoadController: null // AbortController for image loading
    };

    // --------------------------------------------------------------------------
    // Feature Detection
    // --------------------------------------------------------------------------
    
    const features = {
        reducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
        intersectionObserver: 'IntersectionObserver' in window,
        smoothScroll: 'scrollBehavior' in document.documentElement.style,
        touch: 'ontouchstart' in window,
        // Cache WebP support check - avoid creating canvas on every image load
        webp: (function() {
            try {
                return document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
            } catch {
                return false;
            }
        })()
    };

    // --------------------------------------------------------------------------
    // Initialization
    // --------------------------------------------------------------------------
    
    /**
     * Initialize all functionality
     */
    function init() {
        setFooterYear();
        setupGalleryItems();
        setupLightboxControls();
        setupKeyboardNavigation();
        setupGalleryReveal();
        setupSmoothScroll();
        setupTouchSupport();
    }

    // Run initialization when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }

    // --------------------------------------------------------------------------
    // Footer Year
    // --------------------------------------------------------------------------
    
    /**
     * Set current year in footer copyright
     */
    function setFooterYear() {
        if (dom.yearSpan) {
            dom.yearSpan.textContent = new Date().getFullYear();
        }
    }

    // --------------------------------------------------------------------------
    // Utility Functions
    // --------------------------------------------------------------------------
    
    /**
     * Get all focusable elements within a container
     * @param {HTMLElement} container 
     * @returns {NodeList}
     */
    function getFocusableElements(container) {
        return container.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), ' +
            'select:not([disabled]), textarea:not([disabled]), ' +
            '[tabindex]:not([tabindex="-1"])'
        );
    }

    /**
     * Trap focus within a container (for accessibility)
     * @param {KeyboardEvent} event 
     */
    function trapFocus(event) {
        if (!state.isInLightbox || !state.focusableElements || state.focusableElements.length === 0) {
            return;
        }

        const firstElement = state.focusableElements[0];
        const lastElement = state.focusableElements[state.focusableElements.length - 1];

        if (event.key === 'Tab') {
            if (event.shiftKey) {
                // Shift + Tab: going backwards
                if (document.activeElement === firstElement) {
                    event.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab: going forwards
                if (document.activeElement === lastElement) {
                    event.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    /**
     * Clamp a number between min and max values
     * @param {number} value 
     * @param {number} min 
     * @param {number} max 
     * @returns {number}
     */
    function clamp(value, min, max) {
        return Math.max(min, Math.min(max, value));
    }

    // --------------------------------------------------------------------------
    // Lightbox Functions
    // --------------------------------------------------------------------------

    /**
     * Open the lightbox at a specific index
     * @param {number} index 
     */
    function openLightbox(index) {
        if (!dom.lightbox) return;

        // Store the element that triggered the lightbox
        state.previousActiveElement = document.activeElement;
        
        state.currentIndex = clamp(index, 0, GALLERY_IMAGES.length - 1);
        updateLightboxImage();
        dom.lightbox.hidden = false;
        
        // Force reflow for animation
        void dom.lightbox.offsetHeight;
        dom.lightbox.classList.add('active');
        
        state.isInLightbox = true;
        document.body.style.overflow = 'hidden';
        
        // Get focusable elements for focus trap
        state.focusableElements = getFocusableElements(dom.lightbox);
        
        // Announce to screen readers
        dom.lightbox.setAttribute('aria-hidden', 'false');
        
        // Focus management - focus close button
        if (dom.lightboxClose) {
            dom.lightboxClose.focus();
        }
    }

    /**
     * Close the lightbox
     */
    function closeLightbox() {
        if (!dom.lightbox) return;

        dom.lightbox.classList.remove('active');
        dom.lightbox.setAttribute('aria-hidden', 'true');
        
        // Abort any pending image load
        if (state.imageLoadController) {
            state.imageLoadController.abort();
            state.imageLoadController = null;
        }
        
        setTimeout(() => {
            dom.lightbox.hidden = true;
            state.isInLightbox = false;
            document.body.style.overflow = '';
            state.focusableElements = null;
            
            // Return focus to the gallery item that opened the lightbox
            if (state.previousActiveElement && typeof state.previousActiveElement.focus === 'function') {
                state.previousActiveElement.focus();
            }
            
            state.previousActiveElement = null;
        }, LIGHTBOX_CLOSE_DELAY_MS);
    }

    /**
     * Show image loading error state
     */
    function showImageError() {
        if (dom.lightboxImage) {
            dom.lightboxImage.hidden = true;
        }
        if (dom.lightboxError) {
            dom.lightboxError.hidden = false;
        }
    }

    /**
     * Hide image loading error state
     */
    function hideImageError() {
        if (dom.lightboxImage) {
            dom.lightboxImage.hidden = false;
        }
        if (dom.lightboxError) {
            dom.lightboxError.hidden = true;
        }
    }

    /**
     * Get the appropriate image source based on viewport width and WebP support
     * Uses cached WebP detection for performance
     * @param {Object} image - Image object from GALLERY_IMAGES
     * @returns {string} - Best image source for current conditions
     */
    function getResponsiveImageSrc(image) {
        const viewportWidth = window.innerWidth;
        const dpr = window.devicePixelRatio || 1;
        const effectiveWidth = viewportWidth * dpr;
        
        // Use WebP if supported and available (using cached detection)
        if (features.webp && image.webp) {
            // Account for high-DPI displays
            if (effectiveWidth <= 768) {
                return image.webp.medium; // 800px for mobile/standard displays
            } else {
                return image.webp.large; // 1200px for desktop/retina displays
            }
        }
        
        // Fallback to original JPEG
        return image.src;
    }

    /**
     * Update the lightbox image and counter
     */
    function updateLightboxImage() {
        if (!dom.lightboxImage || !dom.lightboxCurrent || !dom.lightboxTotal) return;

        const image = GALLERY_IMAGES[state.currentIndex];
        if (!image) return;

        // Abort any previous image load
        if (state.imageLoadController) {
            state.imageLoadController.abort();
        }
        
        // Create new AbortController for this load
        state.imageLoadController = new AbortController();
        
        // Hide error state when loading new image
        hideImageError();
        
        // Get responsive image source
        const responsiveSrc = getResponsiveImageSrc(image);
        
        // Preload image with error handling
        const tempImg = new Image();
        tempImg.src = responsiveSrc;
        
        tempImg.onload = () => {
            // Check if aborted
            if (state.imageLoadController && state.imageLoadController.signal.aborted) {
                return;
            }
            dom.lightboxImage.src = responsiveSrc;
            dom.lightboxImage.alt = image.alt;
        };
        
        tempImg.onerror = () => {
            // Check if aborted
            if (state.imageLoadController && state.imageLoadController.signal.aborted) {
                return;
            }
            // Fallback to original JPEG if WebP fails
            if (responsiveSrc !== image.src) {
                dom.lightboxImage.src = image.src;
                dom.lightboxImage.alt = image.alt;
            } else {
                showImageError();
            }
        };
        
        // Update counter display
        dom.lightboxCurrent.textContent = state.currentIndex + 1;
        dom.lightboxTotal.textContent = GALLERY_IMAGES.length;
        
        // Update button aria-labels with current position
        if (dom.lightboxPrev) {
            dom.lightboxPrev.setAttribute(
                'aria-label',
                `Previous image, currently showing ${state.currentIndex + 1} of ${GALLERY_IMAGES.length}`
            );
        }
        if (dom.lightboxNext) {
            dom.lightboxNext.setAttribute(
                'aria-label',
                `Next image, currently showing ${state.currentIndex + 1} of ${GALLERY_IMAGES.length}`
            );
        }
    }

    /**
     * Show the previous image
     */
    function showPrevious() {
        state.currentIndex = (state.currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
        updateLightboxImage();
    }

    /**
     * Show the next image
     */
    function showNext() {
        state.currentIndex = (state.currentIndex + 1) % GALLERY_IMAGES.length;
        updateLightboxImage();
    }

    /**
     * Go to a specific image by index
     * @param {number} index 
     */
    function goToImage(index) {
        state.currentIndex = clamp(index, 0, GALLERY_IMAGES.length - 1);
        updateLightboxImage();
    }

    // --------------------------------------------------------------------------
    // Event Setup Functions
    // --------------------------------------------------------------------------

    /**
     * Setup gallery item click handlers
     */
    function setupGalleryItems() {
        dom.galleryItems.forEach((item, index) => {
            // Click handler
            item.addEventListener('click', () => openLightbox(index));
            
            // Note: Buttons natively handle Enter and Space for activation
            // No redundant keydown handler needed - the click event handles all
        });
    }

    /**
     * Setup lightbox control buttons
     */
    function setupLightboxControls() {
        if (dom.lightboxClose) {
            dom.lightboxClose.addEventListener('click', closeLightbox);
        }

        if (dom.lightboxPrev) {
            dom.lightboxPrev.addEventListener('click', showPrevious);
        }

        if (dom.lightboxNext) {
            dom.lightboxNext.addEventListener('click', showNext);
        }

        // Close on backdrop click
        if (dom.lightbox) {
            dom.lightbox.addEventListener('click', (e) => {
                if (e.target === dom.lightbox || e.target.classList.contains('lightbox__content')) {
                    closeLightbox();
                }
            });
            
            // Set initial aria state
            dom.lightbox.setAttribute('aria-hidden', 'true');
        }
    }

    /**
     * Setup keyboard navigation for lightbox
     */
    function setupKeyboardNavigation() {
        document.addEventListener('keydown', (e) => {
            // Focus trap for lightbox
            if (state.isInLightbox) {
                trapFocus(e);
            }

            if (!state.isInLightbox) return;

            switch (e.key) {
                case 'Escape':
                    closeLightbox();
                    break;
                case 'ArrowLeft':
                    showPrevious();
                    break;
                case 'ArrowRight':
                    showNext();
                    break;
                case 'Home':
                    e.preventDefault();
                    goToImage(0);
                    break;
                case 'End':
                    e.preventDefault();
                    goToImage(GALLERY_IMAGES.length - 1);
                    break;
            }
        });
    }

    /**
     * Setup gallery reveal animation using IntersectionObserver
     */
    function setupGalleryReveal() {
        if (features.reducedMotion || !features.intersectionObserver) {
            // Fallback: show all items immediately (no animation)
            dom.galleryItems.forEach(item => item.classList.add('no-motion'));
            return;
        }

        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Stagger the reveal based on item index
                    const itemIndex = Array.from(dom.galleryItems).indexOf(entry.target);
                    const delay = itemIndex * REVEAL_STAGGER_DELAY_MS;
                    
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);
                    
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: INTERSECTION_THRESHOLD,
            rootMargin: INTERSECTION_ROOT_MARGIN
        });

        dom.galleryItems.forEach(item => revealObserver.observe(item));
    }

    /**
     * Setup smooth scroll for CTA button (fallback for older browsers)
     */
    function setupSmoothScroll() {
        if (!dom.heroCTA || features.smoothScroll) return;

        dom.heroCTA.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = dom.heroCTA.getAttribute('href');
            const target = targetId ? document.querySelector(targetId) : null;
            
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

    /**
     * Setup touch/swipe support for lightbox navigation
     */
    function setupTouchSupport() {
        if (!dom.lightbox || !features.touch) return;

        dom.lightbox.addEventListener('touchstart', (e) => {
            state.touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        dom.lightbox.addEventListener('touchend', (e) => {
            state.touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });
    }

    /**
     * Handle touch swipe gesture
     */
    function handleSwipe() {
        const swipeDistance = state.touchEndX - state.touchStartX;
        
        if (Math.abs(swipeDistance) > SWIPE_THRESHOLD_PX) {
            if (swipeDistance > 0) {
                showPrevious();
            } else {
                showNext();
            }
        }
    }

    // --------------------------------------------------------------------------
    // Listen for reduced motion preference changes
    // --------------------------------------------------------------------------
    
    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    
    motionQuery.addEventListener('change', (e) => {
        features.reducedMotion = e.matches;
        
        // If user enables reduced motion, immediately show all gallery items
        // Using class toggle instead of inline styles for maintainability
        if (e.matches) {
            dom.galleryItems.forEach(item => {
                item.classList.add('no-motion');
                item.classList.remove('revealed');
            });
        } else {
            // Restore animations
            dom.galleryItems.forEach(item => {
                item.classList.remove('no-motion');
            });
        }
    });

})();
