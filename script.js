// Initialize Lenis Smooth Scroll
let lenis;

document.addEventListener('DOMContentLoaded', function() {
    // Initialize Lenis
    lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        direction: 'vertical',
        gestureDirection: 'vertical',
        smooth: true,
        mouseMultiplier: 1,
        smoothTouch: false,
        touchMultiplier: 2,
        infinite: false,
    });

    // Lenis RAF
    function raf(time) {
        lenis.raf(time);
        requestAnimationFrame(raf);
    }
    requestAnimationFrame(raf);

    // Lenis scroll event
    lenis.on('scroll', (e) => {
        console.log(e);
        
        // Header background change on scroll
        const header = document.querySelector('.header');
        if (e.scroll > 100) {
            header.style.background = 'rgba(255, 255, 255, 0.98)';
            header.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            header.style.background = 'rgba(255, 255, 255, 0.95)';
            header.style.boxShadow = 'none';
        }

        // Parallax effect for hero background
        const hero = document.querySelector('.hero');
        if (hero) {
            const scrollY = e.scroll;
            const parallaxSpeed = 0.1;
            const yPos = -(scrollY * parallaxSpeed);
            hero.style.setProperty('--parallax-y', yPos + 'px');
        }

        // Parallax effect for CTA background
        const cta = document.querySelector('.cta');
        if (cta) {
            const scrollY = e.scroll;
            const parallaxSpeed = 0.08;
            const yPos = -(scrollY * parallaxSpeed);
            cta.style.setProperty('--parallax-y', yPos + 'px');
        }
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
                
                // If it's a dropdown toggle, also toggle the dropdown
                if (this.classList.contains('mobile-dropdown-toggle')) {
                    const dropdown = this.parentElement;
                    dropdown.classList.toggle('active');
                }
                
                // Close mobile menu first
                closeMobileMenu();
                
                // Wait for menu to close, then scroll smoothly
                setTimeout(() => {
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
                }, 300); // Wait for menu animation to complete
            }
        });
    });
});

// Smooth scrolling for anchor links with Lenis (Desktop only, exclude mobile links)
document.querySelectorAll('a[href^="#"]:not(.mobile-nav-link):not(.mobile-dropdown-link)').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target && lenis) {
            const headerHeight = document.querySelector('.header').offsetHeight;
            const targetPosition = target.offsetTop - headerHeight;
            
            lenis.scrollTo(targetPosition, {
                duration: 1.2,
                easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
            });
        }
    });
});


// Intersection Observer for animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver(function(entries) {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

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

// Observe elements for animation
document.addEventListener('DOMContentLoaded', function() {
    const animatedElements = document.querySelectorAll('.service-card, .feature-item, .stat-item');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });

    // Observe section titles for cable animation
    const sectionTitles = document.querySelectorAll('.section-title, .cta-title');
    sectionTitles.forEach(title => {
        cableObserver.observe(title);
    });
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

// Contact Form Handler
document.addEventListener('DOMContentLoaded', function() {
    const contactForm = document.getElementById('contact-form');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('name').value;
            const email = document.getElementById('email').value;
            const phone = document.getElementById('phone').value;
            const subject = document.getElementById('subject').value;
            const message = document.getElementById('message').value;
            
            // Prepare email subject and body
            const mailSubject = encodeURIComponent(subject);
            const mailBody = encodeURIComponent(
                `Name: ${name}\n` +
                `E-Mail: ${email}\n` +
                `Telefon: ${phone || 'Nicht angegeben'}\n\n` +
                `Nachricht:\n${message}`
            );
            
            // Open mailto link
            const mailtoLink = `mailto:info@pundr-montage.de?subject=${mailSubject}&body=${mailBody}`;
            window.location.href = mailtoLink;
            
            // Show success message
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = '✓ Nachricht vorbereitet!';
            submitButton.style.background = 'var(--primary-blue)';
            
            setTimeout(() => {
                submitButton.textContent = originalText;
                submitButton.style.background = '';
            }, 3000);
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

