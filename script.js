/**
 * Sydney Sweeney Fan Gallery — Minimal JavaScript
 * Lightbox, keyboard navigation, and reveal animations
 */

(function() {
    'use strict';

    // --------------------------------------------------------------------------
    // Configuration
    // --------------------------------------------------------------------------
    const GALLERY_IMAGES = [
        { src: 'images/photo-01.jpg', alt: 'Sydney Sweeney portrait' },
        { src: 'images/photo-02.jpg', alt: 'Sydney Sweeney editorial' },
        { src: 'images/photo-03.jpg', alt: 'Sydney Sweeney portrait session' },
        { src: 'images/photo-04.jpg', alt: 'Sydney Sweeney photoshoot' },
        { src: 'images/photo-05.jpg', alt: 'Sydney Sweeney fashion editorial' },
        { src: 'images/photo-06.jpg', alt: 'Sydney Sweeney studio portrait' },
        { src: 'images/photo-07.jpg', alt: 'Sydney Sweeney magazine cover' },
        { src: 'images/photo-08.jpg', alt: 'Sydney Sweeney red carpet' }
    ];

    const LIGHTBOX_CLOSE_DELAY = 250; // Must match CSS transition duration

    // --------------------------------------------------------------------------
    // DOM Elements
    // --------------------------------------------------------------------------
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCurrent = document.getElementById('lightbox-current');
    const lightboxTotal = document.getElementById('lightbox-total');
    const lightboxClose = document.querySelector('.lightbox__close');
    const lightboxPrev = document.querySelector('.lightbox__prev');
    const lightboxNext = document.querySelector('.lightbox__next');
    const galleryItems = document.querySelectorAll('.gallery__item');
    const yearSpan = document.getElementById('year');

    // State
    let currentIndex = 0;
    let isInLightbox = false;
    let previousActiveElement = null;
    let focusableElements = null;

    // --------------------------------------------------------------------------
    // Footer Year
    // --------------------------------------------------------------------------
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
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
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
    }

    /**
     * Trap focus within a container (for accessibility)
     * @param {KeyboardEvent} e 
     */
    function trapFocus(e) {
        if (!isInLightbox || !focusableElements || focusableElements.length === 0) {
            return;
        }

        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab') {
            if (e.shiftKey) {
                // Shift + Tab: going backwards
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                // Tab: going forwards
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        }
    }

    // --------------------------------------------------------------------------
    // Lightbox Functions
    // --------------------------------------------------------------------------

    /**
     * Open the lightbox at a specific index
     * @param {number} index 
     */
    function openLightbox(index) {
        if (!lightbox) return;

        // Store the element that triggered the lightbox
        previousActiveElement = document.activeElement;
        
        currentIndex = index;
        updateLightboxImage();
        lightbox.hidden = false;
        
        // Force reflow for animation
        void lightbox.offsetHeight;
        lightbox.classList.add('active');
        
        isInLightbox = true;
        document.body.style.overflow = 'hidden';
        
        // Get focusable elements for focus trap
        focusableElements = getFocusableElements(lightbox);
        
        // Focus management - focus close button
        if (lightboxClose) {
            lightboxClose.focus();
        }
    }

    /**
     * Close the lightbox
     */
    function closeLightbox() {
        if (!lightbox) return;

        lightbox.classList.remove('active');
        
        setTimeout(() => {
            lightbox.hidden = true;
            isInLightbox = false;
            document.body.style.overflow = '';
            focusableElements = null;
            
            // Return focus to the gallery item that opened the lightbox
            if (previousActiveElement && typeof previousActiveElement.focus === 'function') {
                previousActiveElement.focus();
            }
        }, LIGHTBOX_CLOSE_DELAY);
    }

    /**
     * Update the lightbox image and counter
     */
    function updateLightboxImage() {
        if (!lightboxImage || !lightboxCurrent || !lightboxTotal) return;

        const image = GALLERY_IMAGES[currentIndex];
        if (!image) return;

        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCurrent.textContent = currentIndex + 1;
        lightboxTotal.textContent = GALLERY_IMAGES.length;
    }

    /**
     * Show the previous image
     */
    function showPrevious() {
        currentIndex = (currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
        updateLightboxImage();
    }

    /**
     * Show the next image
     */
    function showNext() {
        currentIndex = (currentIndex + 1) % GALLERY_IMAGES.length;
        updateLightboxImage();
    }

    // --------------------------------------------------------------------------
    // Event Listeners — Lightbox
    // --------------------------------------------------------------------------
    
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
        
        // Keyboard activation is already handled by button default behavior
        // but we keep this for explicit Enter/Space handling
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }

    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', showPrevious);
    }

    if (lightboxNext) {
        lightboxNext.addEventListener('click', showNext);
    }

    // Close on backdrop click
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox || e.target.classList.contains('lightbox__content')) {
                closeLightbox();
            }
        });
    }

    // --------------------------------------------------------------------------
    // Keyboard Navigation
    // --------------------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
        // Focus trap for lightbox
        if (isInLightbox) {
            trapFocus(e);
        }

        if (!isInLightbox) return;

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
                currentIndex = 0;
                updateLightboxImage();
                break;
            case 'End':
                currentIndex = GALLERY_IMAGES.length - 1;
                updateLightboxImage();
                break;
        }
    });

    // --------------------------------------------------------------------------
    // Gallery Reveal Animation (IntersectionObserver)
    // --------------------------------------------------------------------------
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    // Stagger the reveal based on item index
                    const itemIndex = Array.from(galleryItems).indexOf(entry.target);
                    const delay = itemIndex * 100;
                    
                    setTimeout(() => {
                        entry.target.classList.add('revealed');
                    }, delay);
                    
                    revealObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1,
            rootMargin: '50px 0px'
        });

        galleryItems.forEach(item => {
            revealObserver.observe(item);
        });
    } else {
        // Fallback: show all items immediately (no animation)
        galleryItems.forEach(item => {
            item.classList.add('revealed');
        });
    }

    // --------------------------------------------------------------------------
    // Smooth Scroll for CTA (fallback for browsers without CSS smooth scroll)
    // --------------------------------------------------------------------------
    const heroCTA = document.querySelector('.hero__cta');
    
    if (heroCTA) {
        const supportsSmoothScroll = 'scrollBehavior' in document.documentElement.style;
        
        if (!supportsSmoothScroll) {
            heroCTA.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = heroCTA.getAttribute('href');
                const target = targetId ? document.querySelector(targetId) : null;
                
                if (target) {
                    target.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }
    }

    // --------------------------------------------------------------------------
    // Touch/Swipe Support for Lightbox (basic)
    // --------------------------------------------------------------------------
    if (lightbox && 'ontouchstart' in window) {
        let touchStartX = 0;
        let touchEndX = 0;
        const swipeThreshold = 50;

        lightbox.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        }, { passive: true });

        lightbox.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipe();
        }, { passive: true });

        function handleSwipe() {
            const swipeDistance = touchEndX - touchStartX;
            
            if (Math.abs(swipeDistance) > swipeThreshold) {
                if (swipeDistance > 0) {
                    showPrevious();
                } else {
                    showNext();
                }
            }
        }
    }

})();
