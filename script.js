/* ============================================
   تراث الشموخ - JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // ========== SECRET ADMIN ACCESS (5 clicks on logo) ==========
    let logoClicks = 0;
    let logoTimer = null;
    const logo = document.querySelector('.logo');
    if (logo) {
        logo.addEventListener('click', (e) => {
            e.preventDefault();
            logoClicks++;
            clearTimeout(logoTimer);
            logoTimer = setTimeout(() => { logoClicks = 0; }, 2000);
            if (logoClicks >= 5) {
                logoClicks = 0;
                window.location.href = 'admin.html';
            }
        });
    }

    // ========== LOAD PRODUCTS FROM FIREBASE ==========
    loadProductsFromFirebase();

    async function loadProductsFromFirebase() {
        try {
            // Check if Firebase is configured
            if (typeof firebase === 'undefined' || !firebase.apps.length) return;
            if (firebaseConfig.apiKey === 'ضع_هنا_API_KEY') return;
            
            const products = await getVisibleProducts();
            if (products.length === 0) return; // Keep default HTML products
            
            const grid = document.getElementById('productsGrid');
            grid.innerHTML = '';
            
            products.forEach(p => {
                const card = document.createElement('div');
                card.className = 'product-card';
                card.setAttribute('data-category', p.category || 'janbiya');
                
                card.innerHTML = `
                    ${p.badge ? `<div class="product-badge">${p.badge}</div>` : ''}
                    <div class="product-image" onclick="openLightbox(this)">
                        <img src="${p.image}" alt="${p.name}">
                        <div class="product-overlay">
                            <button class="view-btn"><i class="fas fa-search-plus"></i> عرض الصورة</button>
                        </div>
                    </div>
                    <div class="product-info">
                        <h3>${p.name}</h3>
                        <p class="product-desc">${p.desc || ''}</p>
                        <div class="product-footer">
                            <div class="product-price">${p.price || 'اتصل للسعر'}</div>
                            <button class="order-btn" onclick="orderViaWhatsApp('${p.name}')">
                                <i class="fab fa-whatsapp"></i> اطلب الآن
                            </button>
                        </div>
                    </div>
                `;
                grid.appendChild(card);
            });

            // Re-attach filter buttons after loading products
            setupFilters();
        } catch (error) {
            console.log('Firebase not configured, using default products');
        }
    }

    function setupFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                filterButtons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                const filter = btn.getAttribute('data-filter');
                document.querySelectorAll('.product-card').forEach((card, index) => {
                    const category = card.getAttribute('data-category');
                    if (filter === 'all' || category === filter) {
                        card.style.display = 'block';
                        card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s backwards`;
                    } else {
                        card.style.display = 'none';
                    }
                });
            });
        });
    }

    // ========== NAVBAR SCROLL EFFECT ==========
    const navbar = document.getElementById('navbar');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    });

    // ========== HAMBURGER MENU ==========
    const hamburger = document.getElementById('hamburger');
    const navLinks = document.getElementById('navLinks');

    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });

    // ========== ACTIVE NAV LINK ON SCROLL ==========
    const sections = document.querySelectorAll('section[id]');
    const navLinksAll = document.querySelectorAll('.nav-links a');

    window.addEventListener('scroll', () => {
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            if (window.scrollY >= sectionTop) {
                current = section.getAttribute('id');
            }
        });

        navLinksAll.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });

    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // ========== PRODUCT FILTER ==========
    const filterButtons = document.querySelectorAll('.filter-btn');
    const productCards = document.querySelectorAll('.product-card');

    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            // Update active state
            filterButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const filter = btn.getAttribute('data-filter');

            productCards.forEach((card, index) => {
                const category = card.getAttribute('data-category');
                const isHidden = card.getAttribute('data-hidden') === 'true';

                // المنتجات المخفية لا تظهر أبداً
                if (isHidden) {
                    card.style.display = 'none';
                    return;
                }

                if (filter === 'all' || category === filter) {
                    card.style.display = 'block';
                    card.style.animation = `fadeInUp 0.5s ease ${index * 0.1}s backwards`;
                } else {
                    card.style.display = 'none';
                }
            });
        });
    });

    // ========== SCROLL ANIMATIONS ==========
    const animateElements = document.querySelectorAll('.animate-on-scroll');

    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animateElements.forEach(el => observer.observe(el));

    // ========== COUNTER ANIMATION FOR STATS ==========
    // (Optional - can add stats section later)

});

// ========== LIGHTBOX ==========
function openLightbox(element) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightboxImg');
    const img = element.querySelector('img');
    
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeLightbox() {
    const lightbox = document.getElementById('lightbox');
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
}

// Close lightbox on outside click
document.getElementById('lightbox').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) {
        closeLightbox();
    }
});

// Close lightbox on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeLightbox();
    }
});

// ========== WHATSAPP ORDER ==========
function orderViaWhatsApp(productName) {
    const message = encodeURIComponent(
        `السلام عليكم 🌹\n` +
        `أنا مهتم بالمنتج: ${productName}\n` +
        `من محل تراث الشموخ\n` +
        `أرجو التواصل معي للتفاصيل والسعر.\n` +
        `شكراً لكم 🙏`
    );
    window.open(`https://wa.me/967XXXXXXXXX?text=${message}`, '_blank');
}
