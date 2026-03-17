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

    let currentIndex = 0;
    let isInLightbox = false;

    // --------------------------------------------------------------------------
    // Footer Year
    // --------------------------------------------------------------------------
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --------------------------------------------------------------------------
    // Lightbox Functions
    // --------------------------------------------------------------------------
    function openLightbox(index) {
        currentIndex = index;
        updateLightboxImage();
        lightbox.hidden = false;
        
        // Force reflow for animation
        lightbox.offsetHeight;
        lightbox.classList.add('active');
        
        isInLightbox = true;
        document.body.style.overflow = 'hidden';
        
        // Focus management
        lightboxClose.focus();
    }

    function closeLightbox() {
        lightbox.classList.remove('active');
        
        setTimeout(() => {
            lightbox.hidden = true;
            isInLightbox = false;
            document.body.style.overflow = '';
            
            // Return focus to the gallery item that opened the lightbox
            const triggerItem = galleryItems[currentIndex];
            if (triggerItem) {
                triggerItem.focus();
            }
        }, 250);
    }

    function updateLightboxImage() {
        const image = GALLERY_IMAGES[currentIndex];
        lightboxImage.src = image.src;
        lightboxImage.alt = image.alt;
        lightboxCurrent.textContent = currentIndex + 1;
        lightboxTotal.textContent = GALLERY_IMAGES.length;
    }

    function showPrevious() {
        currentIndex = (currentIndex - 1 + GALLERY_IMAGES.length) % GALLERY_IMAGES.length;
        updateLightboxImage();
    }

    function showNext() {
        currentIndex = (currentIndex + 1) % GALLERY_IMAGES.length;
        updateLightboxImage();
    }

    // --------------------------------------------------------------------------
    // Event Listeners — Lightbox
    // --------------------------------------------------------------------------
    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openLightbox(index);
            }
        });
    });

    lightboxClose.addEventListener('click', closeLightbox);
    lightboxPrev.addEventListener('click', showPrevious);
    lightboxNext.addEventListener('click', showNext);

    // Close on backdrop click
    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target.classList.contains('lightbox__content')) {
            closeLightbox();
        }
    });

    // --------------------------------------------------------------------------
    // Keyboard Navigation
    // --------------------------------------------------------------------------
    document.addEventListener('keydown', (e) => {
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
        }
    });

    // --------------------------------------------------------------------------
    // Gallery Reveal Animation (IntersectionObserver)
    // --------------------------------------------------------------------------
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!prefersReducedMotion && 'IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry, index) => {
                if (entry.isIntersecting) {
                    // Stagger the reveal
                    const delay = Array.from(galleryItems).indexOf(entry.target) * 100;
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
        // Fallback: show all items immediately
        galleryItems.forEach(item => {
            item.classList.add('revealed');
        });
    }

    // --------------------------------------------------------------------------
    // Smooth Scroll for CTA (fallback for browsers without CSS smooth scroll)
    // --------------------------------------------------------------------------
    const heroCTA = document.querySelector('.hero__cta');
    
    if (heroCTA && !('scrollBehavior' in document.documentElement.style)) {
        heroCTA.addEventListener('click', (e) => {
            e.preventDefault();
            const target = document.querySelector(heroCTA.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth' });
            }
        });
    }

})();
