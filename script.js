// Initialize Lenis Smooth Scroll
let lenis;

document.addEventListener('DOMContentLoaded', function() {
    // Detect browser to optimize performance
    const isEdgeOrOpera = /Edg|OPR/i.test(navigator.userAgent);
    const isChrome = /Chrome/i.test(navigator.userAgent) && !/Edg/i.test(navigator.userAgent);
    const isFirefox = /Firefox/i.test(navigator.userAgent);
    const isMobile = window.innerWidth <= 768;
    
    // Initialize Lenis with browser-specific optimizations
    let duration, mouseMultiplier, touchMultiplier;
    
    if (isEdgeOrOpera) {
        duration = 0.8;
        mouseMultiplier = 1;
        touchMultiplier = 1.5;
    } else if (isChrome) {
        // Optimize for Chrome performance
        duration = 1.0; // Slightly faster for better performance
        mouseMultiplier = 0.8; // Reduce mouse sensitivity for smoother scrolling
        touchMultiplier = 1.5; // Reduce touch multiplier
    } else if (isFirefox) {
        duration = 1.2;
        mouseMultiplier = 1;
        touchMultiplier = 2;
    } else {
        duration = 1.2;
        mouseMultiplier = 1;
        touchMultiplier = 2;
    }
    
    lenis = new Lenis({
        duration: duration,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: mouseMultiplier,
        smoothTouch: false,
        touchMultiplier: touchMultiplier,
        infinite: false,
    });

    // Lenis RAF with error handling
    let rafId;
    function raf(time) {
        try {
            lenis.raf(time);
            rafId = requestAnimationFrame(raf);
        } catch (error) {
            console.error('Lenis RAF error:', error);
            rafId = requestAnimationFrame(raf);
        }
    }
    rafId = requestAnimationFrame(raf);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        if (rafId) {
            cancelAnimationFrame(rafId);
        }
    });

    // Cache DOM elements for better performance
    const header = document.querySelector('.header');
    const hero = document.querySelector('.hero');
    let lastScrollY = 0;
    let lastHeaderState = false;
    
    // Optimized throttle for Chrome - use timestamp-based throttling
    let lastScrollTime = 0;
    const scrollThrottleMs = isChrome ? 16 : 33; // ~60fps for Chrome, ~30fps for others
    
    // Lenis scroll event with optimized performance
    lenis.on('scroll', (e) => {
        const now = performance.now();
        
        // Throttle scroll events using timestamp for better performance in Chrome
        if (now - lastScrollTime < scrollThrottleMs) return;
        lastScrollTime = now;
        
        // Use requestAnimationFrame for smooth updates
        requestAnimationFrame(() => {
            const scrollY = e.scroll;
            
            // Header background change on scroll (only update when state changes)
            if (header) {
                const shouldShowBg = scrollY > 100;
                if (shouldShowBg !== lastHeaderState) {
                    lastHeaderState = shouldShowBg;
                    if (shouldShowBg) {
                        header.style.background = 'rgba(255, 255, 255, 0.98)';
                        header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
                    } else {
                        header.style.background = 'rgba(255, 255, 255, 0.95)';
                        header.style.boxShadow = 'none';
                    }
                }
            }

            // Parallax effect for hero background (only update when scrollY changes significantly)
            // More aggressive throttling for Chrome
            const scrollThreshold = isChrome ? 2 : 1;
            if (hero && Math.abs(scrollY - lastScrollY) > scrollThreshold) {
                lastScrollY = scrollY;
                const parallaxSpeed = isChrome ? 0.08 : 0.1; // Slightly slower for Chrome
                const yPos = -(scrollY * parallaxSpeed);
                hero.style.setProperty('--parallax-y', yPos + 'px');
            }
        });
    });
});

// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.getElementById('nav-toggle');
    const mobileNavMenu = document.getElementById('mobile-nav-menu');
    const mobileNavOverlay = document.getElementById('mobile-nav-overlay');
    const mobileNavClose = document.getElementById('mobile-nav-close');
    
    // Open mobile menu
    if (navToggle && mobileNavMenu && mobileNavOverlay) {
        navToggle.addEventListener('click', function() {
            mobileNavMenu.classList.add('active');
            mobileNavOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
    }

    // Close mobile menu
    function closeMobileMenu() {
        mobileNavMenu.classList.remove('active');
        mobileNavOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Close button
    if (mobileNavClose) {
        mobileNavClose.addEventListener('click', closeMobileMenu);
    }

    // Overlay click
    if (mobileNavOverlay) {
        mobileNavOverlay.addEventListener('click', closeMobileMenu);
    }

    // Smooth scrolling for mobile navigation links (only on mobile)
    // Handle both regular links and dropdown toggle links
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link, .mobile-dropdown-link');
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Only handle if it's an anchor link
            if (href && href.startsWith('#')) {
                e.preventDefault();
                
                // If it's a dropdown toggle, ONLY toggle the dropdown (don't close menu or navigate)
                if (this.classList.contains('mobile-dropdown-toggle')) {
                    const dropdown = this.parentElement;
                    dropdown.classList.toggle('active');
                    return; // Stop here, don't close menu or navigate
                }
                
                // Close mobile menu first
                closeMobileMenu();
                
                // Wait for menu to close, then handle navigation
                setTimeout(() => {
                    // Check if this is a category link that should load gallery
                    if (href.startsWith('#kabeltragsysteme') || href.startsWith('#unterflursysteme') || 
                        href.startsWith('#bruestungskanaele') || href.startsWith('#systembeleuchtung')) {
                        
                        // Map href to category key
                        let categoryKey = href.substring(1); // Remove #
                        
                        // Load gallery for this category
                        if (window.loadGallery) {
                            window.loadGallery(categoryKey);
                        }
                    } else {
                        // Normal scrolling for other links
                        const target = document.querySelector(href);
                        if (target) {
                            const headerHeight = document.querySelector('.header').offsetHeight;
                            const targetPosition = target.offsetTop - headerHeight;
                            
                            // Use native smooth scroll for mobile (more reliable)
                            window.scrollTo({
                                top: targetPosition,
                                behavior: 'smooth'
                            });
                        }
                    }
                }, 300); // Wait for menu animation to complete
            }
        });
    });
});

// Smooth scrolling for anchor links with Lenis (Desktop only, exclude mobile links)
document.querySelectorAll('a[href^="#"]:not(.mobile-nav-link):not(.mobile-dropdown-link)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const href = this.getAttribute('href');
        const target = document.querySelector(href);
        
        // Check if this is a category link that should load gallery
        if (href.startsWith('#kabeltragsysteme') || href.startsWith('#unterflursysteme') || 
            href.startsWith('#bruestungskanaele') || href.startsWith('#systembeleuchtung')) {
            
            // Map href to category key
            let categoryKey = href.substring(1); // Remove #
            
            // Load gallery for this category
            if (window.loadGallery) {
                window.loadGallery(categoryKey);
            }
        } else if (target && lenis) {
            // Normal scrolling for other links
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            lenis.scrollTo(targetPosition, {
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
});


// Cable Lines Animation Observer
const cableObserverOptions = {
    threshold: 0.3,
    rootMargin: '0px 0px -100px 0px'
};

const cableObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-cables');
        } else {
            entry.target.classList.remove('animate-cables');
        }
    });
}, cableObserverOptions);

// Enhanced animation observer with different effects
const observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -80px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0) scale(1)';
            entry.target.classList.add('animated');
            // Unobserve after animation to prevent re-animation
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Left-right animation observer
const observerLeft = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
            entry.target.classList.add('animated');
            observerLeft.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

// Right-left animation observer
const observerRight = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateX(0)';
            entry.target.classList.add('animated');
            observerRight.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

// Scale-up animation observer
const observerScale = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'scale(1)';
            entry.target.classList.add('animated');
            observerScale.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -80px 0px' });

// Service cards observer for staggered animation
let serviceCardsAnimated = false;
const servicesSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !serviceCardsAnimated) {
            serviceCardsAnimated = true;
            const serviceCards = entry.target.querySelectorAll('.service-card');
            const isDesktop = window.innerWidth > 768;
            
            // Animate each card with staggered delay
            serviceCards.forEach((card, index) => {
                setTimeout(() => {
                    card.style.opacity = '1';
                    if (isDesktop) {
                        card.style.transform = 'translateY(0) scale(1) rotateY(0deg)';
                    } else {
                        card.style.transform = 'translateY(0) scale(1)';
                    }
                }, index * (isDesktop ? 150 : 100)); // Stagger delay: 150ms desktop, 100ms mobile
            });
            
            servicesSectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

// Promise features observer for staggered animation
let promiseFeaturesAnimated = false;
const promiseSectionObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting && !promiseFeaturesAnimated) {
            promiseFeaturesAnimated = true;
            const featureItems = entry.target.querySelectorAll('.feature-item');
            const isDesktop = window.innerWidth > 768;
            
            // Animate each feature with staggered delay
            featureItems.forEach((item, index) => {
                setTimeout(() => {
                    item.style.opacity = '1';
                    if (isDesktop) {
                        item.style.transform = 'translateY(0) scale(1)';
                    } else {
                        item.style.transform = 'translateY(0) scale(1)';
                    }
                }, index * (isDesktop ? 120 : 80)); // Stagger delay: 120ms desktop, 80ms mobile
            });
            
            promiseSectionObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    // Service cards - staggered fade up animation
    const servicesSection = document.querySelector('.services');
    const serviceCards = document.querySelectorAll('.service-card');
    const isDesktop = window.innerWidth > 768;
    
    // Initialize service cards as hidden
    serviceCards.forEach((el) => {
        el.style.opacity = '0';
        el.style.transition = isDesktop 
            ? 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)'
            : 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        
        if (isDesktop) {
            // Desktop: Start from below with scale and slight rotation
            el.style.transform = 'translateY(50px) scale(0.95) rotateY(-3deg)';
            el.style.perspective = '1000px';
        } else {
            // Mobile: Start from below with scale
            el.style.transform = 'translateY(40px) scale(0.95)';
        }
    });
    
    // Observe services section to trigger animation
    if (servicesSection) {
        servicesSectionObserver.observe(servicesSection);
    }
    
    // Add click handlers to service cards
    serviceCards.forEach((el) => {
        const serviceTitle = el.querySelector('.service-title');
        if (serviceTitle) {
            const titleText = serviceTitle.textContent.toLowerCase();
            let categoryKey = '';
            
            // Map German titles to category keys
            if (titleText.includes('kabeltrag')) {
                categoryKey = 'kabeltragsysteme';
            } else if (titleText.includes('unterflur')) {
                categoryKey = 'unterflursysteme';
            } else if (titleText.includes('brüstung')) {
                categoryKey = 'bruestungskanaele';
            } else if (titleText.includes('systembeleuchtung')) {
                categoryKey = 'systembeleuchtung';
            }
            
            if (categoryKey) {
                el.style.cursor = 'pointer';
                el.addEventListener('click', () => {
                    if (window.loadGallery) {
                        window.loadGallery(categoryKey);
                    }
                });
            }
        }
    });

    // Promise section features - staggered fade up animation
    const promiseSection = document.querySelector('.promise');
    const promiseFeaturesGrid = promiseSection ? promiseSection.querySelector('.promise-features') : null;
    
    if (promiseFeaturesGrid) {
        const featureItems = promiseFeaturesGrid.querySelectorAll('.feature-item');
        const isDesktop = window.innerWidth > 768;
        
        // Initialize feature items as hidden
        featureItems.forEach((el) => {
            el.style.opacity = '0';
            el.style.transition = isDesktop 
                ? 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)'
                : 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            
            if (isDesktop) {
                // Desktop: Start from below with scale
                el.style.transform = 'translateY(40px) scale(0.95)';
            } else {
                // Mobile: Start from below with smaller scale
                el.style.transform = 'translateY(30px) scale(0.95)';
            }
        });
        
        // Observe promise section to trigger animation
        if (promiseSection) {
            promiseSectionObserver.observe(promiseSection);
        }
    }

    // Stat items - scale up with stagger
    const statItems = document.querySelectorAll('.stat-item');
    statItems.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'scale(0.8)';
        el.style.transition = 'opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1), transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
        el.style.transitionDelay = `${index * 0.15}s`;
        observerScale.observe(el);
    });

    // About text - slide from left
    const aboutText = document.querySelector('.about-text');
    if (aboutText) {
        aboutText.style.opacity = '0';
        aboutText.style.transform = 'translateX(-50px)';
        aboutText.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observerLeft.observe(aboutText);
    }

    // About stats - slide from right
    const aboutStats = document.querySelector('.about-stats');
    if (aboutStats) {
        aboutStats.style.opacity = '0';
        aboutStats.style.transform = 'translateX(50px)';
        aboutStats.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observerRight.observe(aboutStats);
    }

    // Contact intro text
    const contactIntro = document.querySelector('.contact-intro');
    if (contactIntro) {
        contactIntro.style.opacity = '0';
        contactIntro.style.transform = 'translateY(30px)';
        contactIntro.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(contactIntro);
    }

    // Contact form wrapper - slide from right
    const contactFormWrapper = document.querySelector('.contact-form-wrapper');
    if (contactFormWrapper) {
        contactFormWrapper.style.opacity = '0';
        contactFormWrapper.style.transform = 'translateX(50px)';
        contactFormWrapper.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observerRight.observe(contactFormWrapper);
    }

    // Contact info box - slide from left
    const contactInfoBox = document.querySelector('.contact-info-box');
    if (contactInfoBox) {
        contactInfoBox.style.opacity = '0';
        contactInfoBox.style.transform = 'translateX(-50px)';
        contactInfoBox.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observerLeft.observe(contactInfoBox);
    }

    // Promise description - fade up
    const promiseDescription = document.querySelector('.promise-description');
    if (promiseDescription) {
        promiseDescription.style.opacity = '0';
        promiseDescription.style.transform = 'translateY(30px)';
        promiseDescription.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(promiseDescription);
    }

    // Gallery description - fade up
    const galleryDescription = document.querySelector('.gallery-description');
    if (galleryDescription) {
        galleryDescription.style.opacity = '0';
        galleryDescription.style.transform = 'translateY(30px)';
        galleryDescription.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(galleryDescription);
    }
    
    // Gallery container - fade up
    const galleryContainer = document.querySelector('.gallery-container');
    if (galleryContainer) {
        galleryContainer.style.opacity = '0';
        galleryContainer.style.transform = 'translateY(40px)';
        galleryContainer.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(galleryContainer);
    }

    // References description - fade up
    const referencesDescription = document.querySelector('.references-description');
    if (referencesDescription) {
        referencesDescription.style.opacity = '0';
        referencesDescription.style.transform = 'translateY(30px)';
        referencesDescription.style.transition = 'opacity 0.7s cubic-bezier(0.4, 0, 0.2, 1), transform 0.7s cubic-bezier(0.4, 0, 0.2, 1)';
        observer.observe(referencesDescription);
    }

    // Reference cards - slide in from sides
    const referenceCards = document.querySelectorAll('.reference-card');
    referenceCards.forEach((el, index) => {
        el.style.opacity = '0';
        
        if (isDesktop) {
            // Desktop: Slide in from alternate sides
            if (index % 2 === 0) {
                el.style.transform = 'translateX(-50px)';
                observerLeft.observe(el);
            } else {
                el.style.transform = 'translateX(50px)';
                observerRight.observe(el);
            }
        } else {
            // Mobile: Fade up
            el.style.transform = 'translateY(40px)';
            el.style.transition = 'opacity 0.8s cubic-bezier(0.4, 0, 0.2, 1), transform 0.8s cubic-bezier(0.4, 0, 0.2, 1)';
            el.style.transitionDelay = `${index * 0.15}s`;
            observer.observe(el);
        }
    });

    // Observe section titles for cable animation
    const sectionTitles = document.querySelectorAll('.section-title');
    sectionTitles.forEach(title => {
        cableObserver.observe(title);
    });
});

// Gallery data - 10 images per category
const galleryData = {
    'kabeltragsysteme': {
        title: 'Professionelle Kabeltragsysteme',
        description: 'Moderne und sichere Kabelverlegung für Ihre Projekte',
        images: Array(10).fill({ src: 'Kabeltragsysteme.webp' })
    },
    'unterflursysteme': {
        title: 'Unterflursysteme',
        description: 'Unauffällige und flexible Stromversorgung für moderne Räume',
        images: Array(10).fill({ src: 'Unterflursysteme.webp' })
    },
    'bruestungskanaele': {
        title: 'Brüstungskanäle',
        description: 'Eleganter Einbau von Elektroinstallationen in Brüstungen',
        images: Array(10).fill({ src: 'Brüstungskanäle.webp' })
    },
    'systembeleuchtung': {
        title: 'Systembeleuchtung',
        description: 'Energieeffiziente Beleuchtungslösungen',
        images: Array(10).fill({ src: 'Systembeleuchtung.webp' })
    }
};

// Gallery Slideshow Functionality
let currentGalleryCategory = null;
let currentSlide = 0;
let isTransitioning = false;

document.addEventListener('DOMContentLoaded', function() {
    const gallerySlider = document.querySelector('.gallery-slider');
    const dotsContainer = document.querySelector('.gallery-dots');
    
    if (!gallerySlider) return;
    
    // Get buttons once
    let prevButton, nextButton;
    
    // Function to load gallery for a specific category
    function loadGallery(categoryKey, shouldScroll = true) {
        const categoryData = galleryData[categoryKey];
        if (!categoryData) return;
        
        currentGalleryCategory = categoryKey;
        currentSlide = 0;
        stopAutoPlay();
        
        // Clear existing slides
        gallerySlider.innerHTML = '';
        dotsContainer.innerHTML = '';
        
        // Generate slides
        categoryData.images.forEach((img, index) => {
            const slide = document.createElement('div');
            slide.className = 'gallery-slide' + (index === 0 ? ' active' : '');
            slide.innerHTML = `
                <img src="${img.src}" alt="${categoryData.title} Referenz ${index + 1}" class="gallery-image" 
                     data-lightbox-src="${img.src}" data-lightbox-title="${categoryData.title} ${index + 1}">
                <div class="slide-info">
                    <h3 class="slide-title">${categoryData.title}</h3>
                    <p class="slide-description">${categoryData.description}</p>
                </div>
            `;
            gallerySlider.appendChild(slide);
            
            // Generate dots
            const dot = document.createElement('button');
            dot.className = 'gallery-dot' + (index === 0 ? ' active' : '');
            dot.setAttribute('aria-label', `Bild ${index + 1}`);
            dot.addEventListener('click', () => {
                if (index !== currentSlide) {
                    goToSlide(index);
                }
            });
            dotsContainer.appendChild(dot);
        });
        
        // Add event listeners to navigation buttons
        prevButton = document.querySelector('.gallery-prev');
        nextButton = document.querySelector('.gallery-next');
        
        if (prevButton) {
            prevButton.addEventListener('click', goToPrevSlide);
        }
        if (nextButton) {
            nextButton.addEventListener('click', goToNextSlide);
        }
        
        // Update active category filter button
        const categoryFilterButtons = document.querySelectorAll('.category-filter-btn');
        categoryFilterButtons.forEach(btn => {
            const btnCategory = btn.getAttribute('data-category');
            btn.classList.toggle('active', btnCategory === categoryKey);
        });
        
        // Scroll to gallery section only if shouldScroll is true
        if (shouldScroll && lenis) {
            const gallerySection = document.querySelector('.references-gallery');
            if (gallerySection) {
                const headerHeight = document.querySelector('.header').offsetHeight;
                const sectionTop = gallerySection.offsetTop;
                const sectionHeight = gallerySection.offsetHeight;
                const windowHeight = window.innerHeight;
                
                // Calculate position to center gallery in viewport
                // Position should be: sectionTop + (sectionHeight/2) - (windowHeight/2) - headerHeight
                const targetPosition = sectionTop + (sectionHeight / 2) - (windowHeight / 2) - headerHeight;
                
                lenis.scrollTo(targetPosition, {
                    duration: 1.2,
                    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
                });
            }
        }
        
        // Trigger event to re-collect lightbox images
        if (window.collectLightboxImages) {
            window.collectLightboxImages();
        }
    }
    
    // Wrapper function for loadGallery that adds scroll behavior
    function loadGalleryWithScroll(categoryKey) {
        loadGallery(categoryKey, true);
    }
    
    // Function to show a specific slide
    function showSlide(index) {
        if (isTransitioning) return;
        
        const slides = gallerySlider.querySelectorAll('.gallery-slide');
        const dots = dotsContainer.querySelectorAll('.gallery-dot');
        
        if (!slides.length) return;
        
        isTransitioning = true;
        
        // Remove active class from all slides and dots
        slides.forEach(slide => slide.classList.remove('active'));
        dots.forEach(dot => dot.classList.remove('active'));
        
        // Add active class to current slide and dot
        if (slides[index]) {
            slides[index].classList.add('active');
        }
        if (dots[index]) {
            dots[index].classList.add('active');
        }
        
        currentSlide = index;
        
        // Reset transition lock after animation
        setTimeout(() => {
            isTransitioning = false;
        }, 600);
    }
    
    // Next slide
    function nextSlide() {
        const slides = gallerySlider.querySelectorAll('.gallery-slide');
        if (!slides.length) return;
        const next = (currentSlide + 1) % slides.length;
        showSlide(next);
    }
    
    // Previous slide
    function prevSlide() {
        const slides = gallerySlider.querySelectorAll('.gallery-slide');
        if (!slides.length) return;
        const prev = (currentSlide - 1 + slides.length) % slides.length;
        showSlide(prev);
    }
    
    // Auto-play option
    let autoPlayInterval = null;
    let isAutoPlayActive = false;
    
    function startAutoPlay() {
        stopAutoPlay();
        
        autoPlayInterval = setInterval(() => {
            nextSlide();
        }, 4000);
        
        isAutoPlayActive = true;
    }
    
    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
        isAutoPlayActive = false;
    }
    
    // Navigation functions
    function goToNextSlide() {
        stopAutoPlay();
        nextSlide();
        setTimeout(() => {
            const rect = gallerySlider.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && !isAutoPlayActive) {
                startAutoPlay();
            }
        }, 100);
    }
    
    function goToPrevSlide() {
        stopAutoPlay();
        prevSlide();
        setTimeout(() => {
            const rect = gallerySlider.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && !isAutoPlayActive) {
                startAutoPlay();
            }
        }, 100);
    }
    
    function goToSlide(index) {
        stopAutoPlay();
        showSlide(index);
        setTimeout(() => {
            const rect = gallerySlider.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && !isAutoPlayActive) {
                startAutoPlay();
            }
        }, 100);
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        const gallerySection = document.querySelector('.references-gallery');
        if (!gallerySection) return;
        
        const rect = gallerySection.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        
        if (!isVisible) return;
        
        if (e.key === 'ArrowLeft') {
            goToPrevSlide();
        } else if (e.key === 'ArrowRight') {
            goToNextSlide();
        }
    });
    
    // Start auto-play when gallery is visible
    const galleryObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && currentGalleryCategory) {
                if (!isAutoPlayActive) {
                    startAutoPlay();
                }
            } else {
                stopAutoPlay();
            }
        });
    }, { threshold: 0.5 });
    
    if (gallerySlider) {
        galleryObserver.observe(gallerySlider);
    }
    
    // Pause auto-play on hover
    if (gallerySlider) {
        gallerySlider.addEventListener('mouseenter', stopAutoPlay);
        gallerySlider.addEventListener('mouseleave', () => {
            const rect = gallerySlider.getBoundingClientRect();
            const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
            if (isVisible && !isAutoPlayActive && currentGalleryCategory) {
                startAutoPlay();
            }
        });
    }
    
    // Make loadGallery function globally available (with scroll)
    window.loadGallery = loadGalleryWithScroll;
    
    // Also expose collectLightboxImages to re-scan after loading
    window.collectLightboxImages = function() {
        // This will be called by lightbox initialization
        const event = new CustomEvent('galleryLoaded');
        window.dispatchEvent(event);
    };
    
    // Category filter buttons functionality
    const categoryFilterButtons = document.querySelectorAll('.category-filter-btn');
    categoryFilterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const categoryKey = this.getAttribute('data-category');
            
            if (!categoryKey) return;
            
            // Update active state
            categoryFilterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            // Load gallery without scrolling (user is already at gallery)
            loadGallery(categoryKey, false);
        });
    });
    
    // Initialize gallery with first category on page load (without scroll)
    // Ensure first button is active
    categoryFilterButtons.forEach(btn => {
        const btnCategory = btn.getAttribute('data-category');
        if (btnCategory === 'kabeltragsysteme') {
            btn.classList.add('active');
        } else {
            btn.classList.remove('active');
        }
    });
    loadGallery('kabeltragsysteme', false);
});

// Lightbox Functionality
document.addEventListener('DOMContentLoaded', function() {
    const lightbox = document.getElementById('lightbox');
    const lightboxOverlay = document.getElementById('lightbox-overlay');
    const lightboxClose = document.getElementById('lightbox-close');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxTitle = document.getElementById('lightbox-title');
    const lightboxPrev = document.getElementById('lightbox-prev');
    const lightboxNext = document.getElementById('lightbox-next');
    
    if (!lightbox || !lightboxImage) return;
    
    let currentLightboxIndex = 0;
    let lightboxImages = [];
    
    // Function to collect all gallery images for lightbox
    function collectLightboxImages() {
        lightboxImages = [];
        const galleryImages = document.querySelectorAll('.gallery-image');
        galleryImages.forEach((img, index) => {
            const src = img.getAttribute('data-lightbox-src') || img.src;
            const title = img.getAttribute('data-lightbox-title') || img.alt;
            lightboxImages.push({ src, title, index });
        });
    }
    
    // Initial collection
    collectLightboxImages();
    
    // Re-collect images when new gallery is loaded
    window.addEventListener('galleryLoaded', function() {
        setTimeout(collectLightboxImages, 100);
    });
    
    // Open lightbox with specific image
    function openLightbox(index) {
        if (index < 0 || index >= lightboxImages.length) return;
        
        currentLightboxIndex = index;
        const imageData = lightboxImages[index];
        
        lightboxImage.src = imageData.src;
        lightboxImage.alt = imageData.title;
        lightboxTitle.textContent = imageData.title;
        
        lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }
    
    // Close lightbox
    function closeLightbox() {
        lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    // Navigate to next image in lightbox
    function goToNextLightboxImage() {
        const next = (currentLightboxIndex + 1) % lightboxImages.length;
        openLightbox(next);
    }
    
    // Navigate to previous image in lightbox
    function goToPrevLightboxImage() {
        const prev = (currentLightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
        openLightbox(prev);
    }
    
    // Use event delegation for dynamically loaded images
    const gallerySection = document.querySelector('.gallery-slider');
    if (gallerySection) {
        let touchStartTime = 0;
        let touchStartPos = { x: 0, y: 0 };
        
        // Track touch start
        gallerySection.addEventListener('touchstart', function(e) {
            if (e.target.classList.contains('gallery-image')) {
                touchStartTime = Date.now();
                const touch = e.touches[0];
                touchStartPos = { x: touch.clientX, y: touch.clientY };
            }
        }, { passive: true });
        
        // Handle touch end (tap)
        gallerySection.addEventListener('touchend', function(e) {
            if (e.target.classList.contains('gallery-image')) {
                const touchEndTime = Date.now();
                const timeDiff = touchEndTime - touchStartTime;
                const touch = e.changedTouches[0];
                const touchEndPos = { x: touch.clientX, y: touch.clientY };
                
                // Calculate distance moved
                const deltaX = Math.abs(touchEndPos.x - touchStartPos.x);
                const deltaY = Math.abs(touchEndPos.y - touchStartPos.y);
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
                
                // Only open if it was a quick tap (< 300ms) and minimal movement (< 10px)
                if (timeDiff < 300 && distance < 10) {
                    e.preventDefault();
                    e.stopPropagation();
                    const imgIndex = Array.from(document.querySelectorAll('.gallery-image')).indexOf(e.target);
                    if (imgIndex !== -1) {
                        openLightbox(imgIndex);
                    }
                }
            }
        });
        
        // Add click event (works on desktop and as fallback for mobile)
        gallerySection.addEventListener('click', function(e) {
            if (e.target.classList.contains('gallery-image')) {
                // Prevent double-firing on mobile devices
                if (e.type === 'click' && touchStartTime > 0 && Date.now() - touchStartTime < 500) {
                    e.preventDefault();
                    e.stopPropagation();
                    return;
                }
                e.preventDefault();
                e.stopPropagation();
                const imgIndex = Array.from(document.querySelectorAll('.gallery-image')).indexOf(e.target);
                if (imgIndex !== -1) {
                    openLightbox(imgIndex);
                }
            }
        });
    }
    
    // Close lightbox events
    if (lightboxClose) {
        lightboxClose.addEventListener('click', closeLightbox);
    }
    
    if (lightboxOverlay) {
        lightboxOverlay.addEventListener('click', closeLightbox);
    }
    
    // Navigation in lightbox
    if (lightboxNext) {
        lightboxNext.addEventListener('click', function(e) {
            e.stopPropagation();
            goToNextLightboxImage();
        });
    }
    
    if (lightboxPrev) {
        lightboxPrev.addEventListener('click', function(e) {
            e.stopPropagation();
            goToPrevLightboxImage();
        });
    }
    
    // Keyboard navigation for lightbox
    document.addEventListener('keydown', function(e) {
        if (!lightbox.classList.contains('active')) return;
        
        if (e.key === 'Escape') {
            closeLightbox();
        } else if (e.key === 'ArrowLeft') {
            goToPrevLightboxImage();
        } else if (e.key === 'ArrowRight') {
            goToNextLightboxImage();
        }
    });
    
    // Prevent body scroll when lightbox is open
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
                if (lightbox.classList.contains('active')) {
                    document.body.style.overflow = 'hidden';
                } else {
                    document.body.style.overflow = '';
                }
            }
        });
    });
    
    if (lightbox) {
        observer.observe(lightbox, { attributes: true });
    }
});

// Counter animation for statistics
function animateCounter(element, target, duration = 8000) {
    let start = 0;
    const increment = target / (duration / 16);
    
    // Hide the number initially
    element.style.opacity = '0';
    element.textContent = '0';
    
    function updateCounter() {
        start += increment;
        if (start < target) {
            element.textContent = Math.floor(start) + '+';
            requestAnimationFrame(updateCounter);
        } else {
            element.textContent = target + '+';
        }
    }
    
    // Start animation after a short delay and fade in
    setTimeout(() => {
        element.style.transition = 'opacity 0.5s ease';
        element.style.opacity = '1';
        updateCounter();
    }, 100);
}

// Trigger counter animation when stats section is visible
const statsObserver = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const statNumbers = entry.target.querySelectorAll('.stat-number');
            // Adjust duration based on screen size (mobile = shorter duration)
            const isMobile = window.innerWidth <= 768;
            const duration = isMobile ? 3000 : 8000;
            
            statNumbers.forEach(stat => {
                const target = parseInt(stat.textContent);
                if (!isNaN(target)) {
                    animateCounter(stat, target, duration);
                }
            });
            statsObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.5 });

document.addEventListener('DOMContentLoaded', function() {
    const statsSection = document.querySelector('.about-stats');
    if (statsSection) {
        statsObserver.observe(statsSection);
    }
});

// Form validation (if contact form is added later)
function validateForm(form) {
    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let isValid = true;
    
    inputs.forEach(input => {
        if (!input.value.trim()) {
            input.style.borderColor = '#ef4444';
            isValid = false;
        } else {
            input.style.borderColor = '#d1d5db';
        }
    });
    
    return isValid;
}

// Add loading state to buttons
function addLoadingState(button, text = 'Wird geladen...') {
    const originalText = button.textContent;
    button.textContent = text;
    button.disabled = true;
    button.style.opacity = '0.7';
    
    return function removeLoadingState() {
        button.textContent = originalText;
        button.disabled = false;
        button.style.opacity = '1';
    };
}

// Lazy loading for images (if added later)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.classList.remove('lazy');
                imageObserver.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Initialize lazy loading
document.addEventListener('DOMContentLoaded', lazyLoadImages);

// Contact Form Handler (Web3Forms)
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            
            // Add loading state
            submitButton.disabled = true;
            submitButton.textContent = 'Wird gesendet...';
            submitButton.style.opacity = '0.7';
            
            try {
                // Create FormData from the form
                const formData = new FormData(contactForm);
                
                // Submit to Web3Forms
                const response = await fetch('https://api.web3forms.com/submit', {
                    method: 'POST',
                    body: formData
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Show success message
                    submitButton.textContent = '✓ Nachricht gesendet!';
                    submitButton.style.background = '#10b981';
                    
                    // Reset form
                    contactForm.reset();
                    
                    // Reset button after 5 seconds
                    setTimeout(() => {
                        submitButton.textContent = originalText;
                        submitButton.style.background = '';
                        submitButton.disabled = false;
                        submitButton.style.opacity = '1';
                    }, 5000);
                } else {
                    throw new Error('Fehler beim Senden');
                }
            } catch (error) {
                // Show error message
                submitButton.textContent = '✗ Fehler! Bitte erneut versuchen.';
                submitButton.style.background = '#ef4444';
                
                // Reset button after 5 seconds
                setTimeout(() => {
                    submitButton.textContent = originalText;
                    submitButton.style.background = '';
                    submitButton.disabled = false;
                    submitButton.style.opacity = '1';
                }, 5000);
            }
        });
    }
});

// Position dropdown menu at the bottom of navigation bar
document.addEventListener('DOMContentLoaded', function() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownMenu = document.querySelector('.dropdown-menu');
    
    function updateDropdownPosition() {
        if (dropdown && dropdownMenu && window.innerWidth > 768) {
            const dropdownRect = dropdown.getBoundingClientRect();
            
            // Position at bottom of header (90px) and align left edge with dropdown button
            dropdownMenu.style.left = dropdownRect.left + 'px';
        }
    }
    
    // Update on load and resize
    updateDropdownPosition();
    window.addEventListener('resize', updateDropdownPosition);
    
    // Update when dropdown is hovered
    if (dropdown) {
        dropdown.addEventListener('mouseenter', function() {
            setTimeout(updateDropdownPosition, 10);
        });
    }
});

