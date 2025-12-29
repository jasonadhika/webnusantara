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

// ===== Mobile Menu Toggle =====
function toggleMobileMenu() {
    if (!navMenu || !hamburger) return;
    
    navMenu.classList.toggle('active');
    const icon = hamburger.querySelector('i');
    if (icon) {
        icon.classList.toggle('fa-bars');
        icon.classList.toggle('fa-times');
    }
    
    // Toggle body scroll
    document.body.style.overflow = navMenu.classList.contains('active') ? 'hidden' : '';
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
        if (!this.section) {
            return;
        }
        
        // Cari elemen carousel di dalam section
        this.track = this.section.querySelector('.carousel-track');
        if (!this.track) {
            return;
        }
        
        this.cards = this.track.querySelectorAll('.carousel-item');
        this.leftSlideArea = this.section.querySelector('.carousel-slide-area.left');
        this.rightSlideArea = this.section.querySelector('.carousel-slide-area.right');
        this.dotsContainer = this.section.querySelector('.carousel-dots');
        
        // Tombol mobile
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
        if (this.cardCount <= this.cardsPerView) return; // Jika card kurang dari yang bisa ditampilkan, jangan buat carousel
        
        this.calculateMaxIndex();
        this.createDots();
        this.updateCarousel();
        this.addEventListeners();
    }
    
    calculateMaxIndex() {
        this.maxIndex = Math.max(0, this.cardCount - this.cardsPerView);
    }
    
    createDots() {
        if (!this.dotsContainer) return;
        
        this.dotsContainer.innerHTML = '';
        const totalDots = this.maxIndex + 1;
        
        for (let i = 0; i < totalDots; i++) {
            const dot = document.createElement('div');
            dot.classList.add('carousel-dot');
            if (i === 0) dot.classList.add('active');
            dot.addEventListener('click', () => this.goToSlide(i));
            this.dotsContainer.appendChild(dot);
        }
    }
    
    updateCarousel() {
        if (!this.track || this.cards.length === 0) return;
        
        // Get the width of one card (including margin/gap)
        const card = this.cards[0];
        if (!card) return;
        
        const cardWidth = card.offsetWidth;
        const gap = 30;
        const totalWidth = cardWidth + gap;
        
        // Calculate translation
        const translateX = -this.currentIndex * totalWidth;
        
        // Apply transform
        this.track.style.transition = 'transform 0.5s ease';
        this.track.style.transform = `translateX(${translateX}px)`;
        
        // Update dots
        this.updateDots();
        
        // Update slide areas
        this.updateSlideAreas();
    }
    
    updateDots() {
        if (!this.dotsContainer) return;
        
        const dots = this.dotsContainer.querySelectorAll('.carousel-dot');
        dots.forEach((dot, index) => {
            dot.classList.toggle('active', index === this.currentIndex);
        });
    }
    
    updateSlideAreas() {
        if (this.leftSlideArea) {
            this.leftSlideArea.style.opacity = this.currentIndex === 0 ? '0.3' : '0.5';
            this.leftSlideArea.style.cursor = this.currentIndex === 0 ? 'default' : 'pointer';
        }
        
        if (this.rightSlideArea) {
            this.rightSlideArea.style.opacity = this.currentIndex >= this.maxIndex ? '0.3' : '0.5';
            this.rightSlideArea.style.cursor = this.currentIndex >= this.maxIndex ? 'default' : 'pointer';
        }
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
                e.stopPropagation();
                if (this.currentIndex > 0) {
                    this.prevSlide();
                }
            });
        }
        
        // Right slide area
        if (this.rightSlideArea) {
            this.rightSlideArea.addEventListener('click', (e) => {
                e.stopPropagation();
                if (this.currentIndex < this.maxIndex) {
                    this.nextSlide();
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
        
        this.track.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            currentX = startX;
            isDragging = true;
            this.track.style.transition = 'none';
        });
        
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
        });
        
        this.track.addEventListener('touchend', () => {
            if (!isDragging) return;
            
            isDragging = false;
            this.track.style.transition = 'transform 0.5s ease';
            
            const diff = currentX - startX;
            const threshold = 50;
            
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
    const carouselSections = [
        'tradisi', 
        'alam'
    ];
    
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
        
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px)';
            this.style.boxShadow = '0 15px 30px rgba(0, 0, 0, 0.15)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
            this.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)';
        });
    });
}

// ===== Initialize Everything =====
function init() {
    // Initialize carousels (hanya tradisi dan alam)
    carousels = initCarousels();
    
    // Handle window resize
    window.addEventListener('resize', () => {
        handleNavbarScroll();
        
        // Update all carousels on resize
        Object.values(carousels).forEach(carousel => {
            if (carousel) carousel.handleResize();
        });
    });
    
    // Handle scroll
    window.addEventListener('scroll', handleNavbarScroll);
    
    // Mobile menu
    if (hamburger) {
        hamburger.addEventListener('click', toggleMobileMenu);
    }
    
    // Close mobile menu when clicking outside
    if (navMenu && hamburger) {
        document.addEventListener('click', (e) => {
            if (!navMenu.contains(e.target) && !hamburger.contains(e.target) && navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    }
    
    // Close mobile menu when clicking on a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            if (navMenu && navMenu.classList.contains('active')) {
                toggleMobileMenu();
            }
        });
    });
    
    // Initialize other features
    initSmoothScroll();
    initCardEffects();
    
    // Initialize on load
    handleNavbarScroll();
}

// ===== Start the Application =====
document.addEventListener('DOMContentLoaded', init);