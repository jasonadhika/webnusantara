// ===== DOM Elements =====
const navbar = document.getElementById('navbar');
const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');
const navLinks = document.querySelectorAll('.nav-link');
const backToTop = document.getElementById('back-to-top');

// ===== Navbar Scroll Effect =====
function handleNavbarScroll() {
    if (!navbar) return;
    
    const hero = document.querySelector('.hero');
    const heroHeight = hero ? hero.offsetHeight : 0;
    const scrollPosition = window.scrollY;
    
    // Update navbar background
    if (hero && scrollPosition > heroHeight * 0.8) {
        navbar.classList.add('scrolled');
        navbar.classList.remove('transparent');
        if (backToTop) backToTop.classList.add('active');
    } else {
        if (hero) {
            navbar.classList.add('transparent');
        }
        navbar.classList.remove('scrolled');
        if (backToTop) backToTop.classList.remove('active');
    }
    
    // Update active nav link
    const sections = document.querySelectorAll('section[id]');
    let current = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.clientHeight;
        
        if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
            current = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${current}`) {
            link.classList.add('active');
        }
    });
}

// ===== Handle Scroll Indicator =====
function initScrollIndicator() {
    const scrollIndicator = document.querySelector('.scroll-indicator');
    if (!scrollIndicator) return;
    
    // Hide on scroll
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            scrollIndicator.classList.add('hidden');
        } else {
            scrollIndicator.classList.remove('hidden');
        }
    });
    
    // Hide when button is clicked
    const exploreBtn = document.querySelector('.btn-hero');
    if (exploreBtn) {
        exploreBtn.addEventListener('click', () => {
            scrollIndicator.classList.add('hidden');
        });
    }
}

// ===== Mobile Menu Toggle =====
function toggleMobileMenu() {
    if (!navMenu || !hamburger) return;
    
    navMenu.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    }
    
    // Update aria-expanded for accessibility
    hamburger.setAttribute('aria-expanded', navMenu.classList.contains('active'));
    
    // Toggle body scroll
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
    
    // Focus management for accessibility
    if (navMenu.classList.contains('active')) {
        // Focus first link when menu opens
        const firstLink = navMenu.querySelector('a');
        if (firstLink) firstLink.focus();
    } else {
        // Focus hamburger when menu closes
        hamburger.focus();
    }
}

// ===== Smooth Scroll =====
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#') return;
            
            const targetId = this.getAttribute('href');
            const targetElement = targetId === '#' ? null : document.querySelector(targetId);
            
            if (targetElement) {
                e.preventDefault();
                const navbarHeight = navbar ? navbar.offsetHeight : 0;
                const targetPosition = targetElement.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                // Update URL hash without scrolling
                history.pushState(null, null, targetId);
                
                // Close mobile menu if open
                if (navMenu && navMenu.classList.contains('active')) {
                    toggleMobileMenu();
                }
            }
        });
    });
}

// ===== Carousel Functionality =====
class Carousel {
    constructor(sectionId) {
        this.sectionId = sectionId;
        this.section = document.getElementById(sectionId);
        if (!this.section) return;
        
        this.track = this.section.querySelector('.carousel-track');
        if (!this.track) return;
        
        this.cards = this.track.querySelectorAll('.carousel-item');
        this.leftSlideArea = this.section.querySelector('.carousel-slide-area.left');
        this.rightSlideArea = this.section.querySelector('.carousel-slide-area.right');
        this.dotsContainer = this.section.querySelector('.carousel-dots');
        
        // Mobile buttons
        const mobileButtons = this.section.querySelector('.mobile-nav-buttons');
        if (mobileButtons) {
            this.prevBtn = mobileButtons.querySelector('.prev-btn');
            this.nextBtn = mobileButtons.querySelector('.next-btn');
        }
        
        this.cardCount = this.cards.length;
        this.cardsPerView = this.getCardsPerView();
        this.currentIndex = 0;
        this.maxIndex = 0;
        
        this.init();
    }
    
    getCardsPerView() {
        if (window.innerWidth <= 768) return 1;
        if (window.innerWidth <= 992) return 2;
        return 3;
    }
    
    init() {
        if (this.cardCount <= this.cardsPerView) return;
        
        this.calculateMaxIndex();
        this.createDots();
        this.updateCarousel();
        this.addEventListeners();
        
        // Add keyboard navigation
        this.addKeyboardNavigation();
    }
    
    calculateMaxIndex() {
        this.maxIndex = Math.max(0, this.cardCount - this.cardsPerView);
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        const totalDots = this.maxIndex + 1;
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('button');
            dot.classList.add('carousel-dot');
            dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    updateCarousel() {
        if (!this.track || this.cards.length === 0) return;
        
        // Get card width including gap
        const card = this.cards[0];
        if (!card) return;
        
        const cardWidth = card.offsetWidth;
        const gap = 30;
        const totalWidth = cardWidth + gap;
        
        // Calculate translation
        const translateX = -this.currentIndex * totalWidth;
        
        // Apply transform
        this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Update dots
        this.updateDots();
        
        // Update slide areas
        this.updateSlideAreas();
        
        // Update ARIA live region for screen readers
        this.updateAriaLive();
    }
    
    updateDots() {
        if (!this.dotsContainer) return;
        
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
            dot.setAttribute('aria-current', index === this.currentIndex ? 'true' : 'false');
        });
    }
    
    updateSlideAreas() {
        if (this.leftSlideArea) {
            this.leftSlideArea.style.opacity = this.currentIndex === 0 ? '0.3' : '0.7';
            this.leftSlideArea.style.cursor = this.currentIndex === 0 ? 'default' : 'pointer';
            this.leftSlideArea.setAttribute('aria-disabled', this.currentIndex === 0 ? 'true' : 'false');
        }
        
        if (this.rightSlideArea) {
            this.rightSlideArea.style.opacity = this.currentIndex >= this.maxIndex ? '0.3' : '0.7';
            this.rightSlideArea.style.cursor = this.currentIndex >= this.maxIndex ? 'default' : 'pointer';
            this.rightSlideArea.setAttribute('aria-disabled', this.currentIndex >= this.maxIndex ? 'true' : 'false');
        }
    }
    
    updateAriaLive() {
        // Create or update ARIA live region
        let liveRegion = this.section.querySelector('.carousel-aria-live');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.className = 'carousel-aria-live';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            liveRegion.style.cssText = 'position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0, 0, 0, 0); white-space: nowrap; border: 0;';
            this.section.appendChild(liveRegion);
        }
        liveRegion.textContent = `Slide ${this.currentIndex + 1} of ${this.maxIndex + 1}`;
    }
    
    goToSlide(index) {
        this.currentIndex = Math.max(0, Math.min(index, this.maxIndex));
        this.updateCarousel();
    }
    
    nextSlide() {
        if (this.currentIndex < this.maxIndex) {
            this.currentIndex++;
            this.updateCarousel();
        }
    }
    
    prevSlide() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateCarousel();
        }
    }
    
    addEventListeners() {
        // Left slide area
        if (this.leftSlideArea) {
            this.leftSlideArea.addEventListener('click', (e) => {
                if (this.currentIndex > 0) {
                    this.prevSlide();
                    e.stopPropagation();
                }
            });
            
            // Add keyboard support
            this.leftSlideArea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (this.currentIndex > 0) {
                        this.prevSlide();
                    }
                }
            });
        }
        
        // Right slide area
        if (this.rightSlideArea) {
            this.rightSlideArea.addEventListener('click', (e) => {
                if (this.currentIndex < this.maxIndex) {
                    this.nextSlide();
                    e.stopPropagation();
                }
            });
            
            // Add keyboard support
            this.rightSlideArea.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    if (this.currentIndex < this.maxIndex) {
                        this.nextSlide();
                    }
                }
            });
        }
        
        // Mobile buttons
        if (this.prevBtn) {
            this.prevBtn.addEventListener('click', () => {
                this.prevSlide();
            });
        }
        
        if (this.nextBtn) {
            this.nextBtn.addEventListener('click', () => {
                this.nextSlide();
            });
        }
        
        // Touch events
        this.addTouchEvents();
    }
    
    addTouchEvents() {
        if (!this.track) return;
        
        let startX = 0;
        let currentX = 0;
        let isDragging = false;
        let startTime = 0;
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
            startTime = Date.now();
            this.track.style.transition = 'none';
        }, { passive: true });
        
        this.track.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diff = currentX - startX;
            
            // Update position during drag
            const card = this.cards[0];
            if (!card) return;
            
            const cardWidth = card.offsetWidth;
            const gap = 30;
            const totalWidth = cardWidth + gap;
            const baseTranslate = -this.currentIndex * totalWidth;
            const dragTranslate = baseTranslate + diff;
            
            this.track.style.transform = `translateX(${dragTranslate}px)`;
        }, { passive: true });
        
        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            this.track.style.transition = 'transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
            
            const diff = currentX - startX;
            const timeDiff = Date.now() - startTime;
            const velocity = Math.abs(diff) / timeDiff;
            const threshold = velocity > 0.3 ? 30 : 50;
            
            if (Math.abs(diff) > threshold) {
                if (diff > 0) {
                    this.prevSlide();
                } else {
                    this.nextSlide();
                }
            } else {
                this.updateCarousel();
            }
        });
    }
    
    addKeyboardNavigation() {
        // Add keyboard navigation for carousel items
        this.cards.forEach((card, index) => {
            card.setAttribute('tabindex', '0');
            
            card.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowRight') {
                    e.preventDefault();
                    if (index < this.cards.length - 1) {
                        this.cards[index + 1].focus();
                    }
                } else if (e.key === 'ArrowLeft') {
                    e.preventDefault();
                    if (index > 0) {
                        this.cards[index - 1].focus();
                    }
                }
            });
        });
    }
    
    handleResize() {
        const newCardsPerView = this.getCardsPerView();
        if (newCardsPerView !== this.cardsPerView) {
            this.cardsPerView = newCardsPerView;
            this.calculateMaxIndex();
            this.currentIndex = Math.min(this.currentIndex, this.maxIndex);
            this.createDots();
            this.updateCarousel();
        }
    }
}

// ===== Initialize All Carousels =====
let carousels = {};

function initCarousels() {
    const carouselSections = ['tradisi', 'alam'];
    
    carouselSections.forEach(sectionId => {
        const sectionElement = document.getElementById(sectionId);
        if (sectionElement && sectionElement.querySelector('.carousel-track')) {
            carousels[sectionId] = new Carousel(sectionId);
        }
    });
    
    return carousels;
}

// ===== Card Hover Effects =====
function initCardEffects() {
    const cards = document.querySelectorAll('.content-card');
    
    cards.forEach((card, index) => {
        card.style.setProperty('--card-index', index);
        
        // Add focus styles for keyboard navigation
        card.addEventListener('focus', function() {
            this.style.outline = '3px solid var(--primary)';
            this.style.outlineOffset = '2px';
        });
        
        card.addEventListener('blur', function() {
            this.style.outline = 'none';
        });
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.02)';
            this.style.boxShadow = '0 20px 40px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });
}

// ===== Lazy Load Images =====
function initLazyLoading() {
    if ('IntersectionObserver' in window) {
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    const src = img.getAttribute('data-src');
                    if (src) {
                        img.src = src;
                        img.removeAttribute('data-src');
                        img.classList.add('loaded');
                    }
                    observer.unobserve(img);
                }
            });
        });
        
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
    } else {
        // Fallback for browsers without IntersectionObserver
        document.querySelectorAll('img[data-src]').forEach(img => {
            img.src = img.getAttribute('data-src');
            img.removeAttribute('data-src');
        });
    }
}

// ===== Back to Top Button =====
function initBackToTop() {
    if (!backToTop) return;
    
    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
    
    // Keyboard support
    backToTop.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    });
}

// ===== Initialize Everything =====
function init() {
    // Initialize carousels
    carousels = initCarousels();
    
    // Handle window resize
    const resizeHandler = () => {
        handleNavbarScroll();
        
        // Update all carousels on resize
        Object.values(carousels).forEach(carousel => {
            if (carousel) carousel.handleResize();
        });
    };
    
    window.addEventListener('resize', resizeHandler);
    window.addEventListener('orientationchange', resizeHandler);
    
    // Handle scroll
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Handle scroll indicator
    initScrollIndicator();
    
    // Mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
        
        // Keyboard support for hamburger
        hamburger.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleMobileMenu();
            } else if (e.key === 'Escape' && navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    }
    
    // Close mobile menu when clicking outside
    if (navMenu && hamburger) {
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    }
    
    // Close mobile menu when pressing Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && navMenu && navMenu.classList.contains('active')) {
            toggleMobileMenu();
        }
    });
    
    // Initialize other features
    initSmoothScroll();
    initCardEffects();
    initLazyLoading();
    initBackToTop();
    
    // Initialize on load
    handleNavbarScroll();
    
    // Add loading state removal
    window.addEventListener('load', () => {
        document.body.classList.add('loaded');
        
        // Remove any loading skeletons
        const skeletons = document.querySelectorAll('.skeleton-loading');
        skeletons.forEach(skeleton => {
            skeleton.classList.remove('skeleton-loading');
        });
    });
}

// ===== Start the Application =====
document.addEventListener('DOMContentLoaded', init);

// Video Loading Effect
document.addEventListener('DOMContentLoaded', function() {
    const videoLinks = document.querySelectorAll('.video-link');
    const videoPreviews = document.querySelectorAll('.video-preview');
    
    // Preload gambar untuk efek yang lebih smooth
    videoPreviews.forEach(preview => {
        const img = new Image();
        img.src = preview.src;
        img.onload = function() {
            preview.classList.remove('loading');
            preview.style.opacity = '1';
        };
        preview.classList.add('loading');
    });
    
    // Efek hover dengan delay untuk performance
    videoLinks.forEach(link => {
        let hoverTimer;
        
        link.addEventListener('mouseenter', function() {
            clearTimeout(hoverTimer);
            const preview = this.querySelector('.video-preview');
            const overlay = this.querySelector('.video-overlay');
            
            hoverTimer = setTimeout(() => {
                if (preview) {
                    preview.style.transform = 'scale(1.05)';
                }
                if (overlay) {
                    overlay.style.backdropFilter = 'blur(2px)';
                }
            }, 50);
        });
        
        link.addEventListener('mouseleave', function() {
            clearTimeout(hoverTimer);
            const preview = this.querySelector('.video-preview');
            const overlay = this.querySelector('.video-overlay');
            
            if (preview) {
                preview.style.transform = 'scale(1)';
            }
            if (overlay) {
                overlay.style.backdropFilter = 'none';
            }
        });
        
        // Tambahkan tracking klik (optional untuk analytics)
        link.addEventListener('click', function(e) {
            // Optional: Bisa tambahkan Google Analytics atau logging di sini
            console.log('Video sejarah Bali diklik');
            
            // Tambahkan loading state
            this.style.opacity = '0.8';
            
            // Link akan tetap membuka halaman YouTube di tab yang sama
            // (default behavior dari <a href>)
        });
    });
    
    // Optional: Smooth transition untuk semua gambar
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.style.transition = 'opacity 0.3s ease';
        img.style.opacity = '0';
        
        if (img.complete) {
            img.style.opacity = '1';
        } else {
            img.addEventListener('load', function() {
                this.style.opacity = '1';
            });
        }
    });
});


// Efek hover dan loading untuk flex layout
document.addEventListener('DOMContentLoaded', function() {
    // Preload gambar video
    const videoThumb = document.querySelector('.video-thumbnail');
    if (videoThumb) {
        videoThumb.classList.add('loading');
        const img = new Image();
        img.src = videoThumb.src;
        img.onload = function() {
            videoThumb.classList.remove('loading');
        };
    }
    
    // Efek hover untuk period items
    const periods = document.querySelectorAll('.period');
    periods.forEach(period => {
        period.addEventListener('mouseenter', function() {
            this.style.transform = 'translateX(5px)';
        });
        
        period.addEventListener('mouseleave', function() {
            this.style.transform = 'translateX(0)';
        });
    });
    
    // Efek hover untuk facts list
    const factItems = document.querySelectorAll('.facts-list li');
    factItems.forEach(item => {
        item.addEventListener('mouseenter', function() {
            this.querySelector('i').style.transform = 'scale(1.2)';
        });
        
        item.addEventListener('mouseleave', function() {
            this.querySelector('i').style.transform = 'scale(1)';
        });
    });
});


// Fungsi untuk Modal Gambar Geografis
let isModalAnimating = false;

function openImageModal() {
    if (isModalAnimating) return;
    
    const modal = document.getElementById('imageModal');
    const currentImg = document.getElementById('geografis-img');
    const modalImg = document.getElementById('modalImage');
    const modalTitle = document.getElementById('modalTitle');
    const modalDesc = document.getElementById('modalDesc');
    
    // Update gambar modal
    modalImg.src = currentImg.src;
    modalImg.alt = currentImg.alt;
    modalTitle.textContent = 'Peta Lokasi Bali';
    modalDesc.textContent = 'Bali terletak di antara Pulau Jawa dan Pulau Lombok';
    
    // Reset animation state
    modal.classList.remove('closing');
    modal.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    
    // Focus tombol close untuk aksesibilitas
    setTimeout(() => {
        document.querySelector('.close-btn').focus();
    }, 100);
}

function closeImageModal() {
    if (isModalAnimating) return;
    
    const modal = document.getElementById('imageModal');
    isModalAnimating = true;
    
    // Tambah class closing untuk animasi
    modal.classList.add('closing');
    
    // Tunggu animasi selesai baru sembunyikan
    setTimeout(() => {
        modal.style.display = 'none';
        modal.classList.remove('closing');
        document.body.style.overflow = 'auto';
        isModalAnimating = false;
    }, 300);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('imageModal');
    
    // Tutup modal dengan klik di luar
    if (modal) {
        modal.addEventListener('click', function(e) {
            if (e.target === modal && !isModalAnimating) {
                closeImageModal();
            }
        });
    }
    
    // Tutup modal dengan tombol Escape
    document.addEventListener('keydown', function(e) {
        const modal = document.getElementById('imageModal');
        if (e.key === 'Escape' && modal && modal.style.display === 'flex' && !isModalAnimating) {
            closeImageModal();
        }
    });
    
    // Tambahkan touch events untuk mobile
    const imagePreview = document.querySelector('.image-preview');
    if (imagePreview) {
        imagePreview.addEventListener('touchstart', function(e) {
            e.preventDefault();
            openImageModal();
        });
    }
    
    // Tambahkan keyboard navigation untuk tombol zoom
    const zoomBtn = document.querySelector('.zoom-btn');
    if (zoomBtn) {
        zoomBtn.setAttribute('tabindex', '0');
        zoomBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                openImageModal();
            }
        });
    }
    
    // Tambahkan keyboard navigation untuk close button
    const closeBtn = document.querySelector('.close-btn');
    if (closeBtn) {
        closeBtn.addEventListener('keydown', function(e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                closeImageModal();
            }
        });
    }
});