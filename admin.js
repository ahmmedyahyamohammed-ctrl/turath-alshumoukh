/* ============================================
   لوحة الإدارة - Admin Panel JavaScript
   تراث الشموخ
   ============================================
   
   🔑 كلمة المرور الافتراضية: admin123
   (غيّرها من المتغير ADMIN_PASSWORD أدناه)
   
   📌 طريقة الدخول: اضغط على لوقو "تراث الشموخ" 5 مرات متتالية
   ============================================ */

const ADMIN_PASSWORD = '12345678'; // ← غيّر كلمة المرور هنا

let isAdminMode = false;
let logoClickCount = 0;
let logoClickTimer = null;
let editingCardIndex = null;

// ========== دخول لوحة الإدارة ==========

// الضغط 5 مرات على اللوقو لإظهار صفحة تسجيل الدخول
document.addEventListener('DOMContentLoaded', () => {
    const logo = document.querySelector('.logo');
    
    logo.addEventListener('click', (e) => {
        e.preventDefault();
        logoClickCount++;
        
        clearTimeout(logoClickTimer);
        logoClickTimer = setTimeout(() => { logoClickCount = 0; }, 2000);
        
        if (logoClickCount >= 5) {
            logoClickCount = 0;
            if (isAdminMode) {
                exitAdminMode();
            } else {
                showAdminLogin();
            }
        }
    });

    // Load any saved products from localStorage
    loadSavedProducts();
});

// ========== تسجيل الدخول ==========

function showAdminLogin() {
    document.getElementById('adminLoginOverlay').classList.add('active');
    document.getElementById('adminPassword').focus();
    document.getElementById('loginError').style.display = 'none';
}

function hideAdminLogin() {
    document.getElementById('adminLoginOverlay').classList.remove('active');
    document.getElementById('adminPassword').value = '';
    document.getElementById('loginError').style.display = 'none';
}

function attemptAdminLogin() {
    const password = document.getElementById('adminPassword').value;
    if (password === ADMIN_PASSWORD) {
        hideAdminLogin();
        enterAdminMode();
    } else {
        document.getElementById('loginError').style.display = 'block';
        document.getElementById('adminPassword').value = '';
        document.getElementById('adminPassword').focus();
    }
}

// Enter on password field
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        const passField = document.getElementById('adminPassword');
        if (passField) {
            passField.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') attemptAdminLogin();
            });
        }
    }, 100);
});

// ========== وضع الإدارة ==========

function enterAdminMode() {
    isAdminMode = true;
    document.body.classList.add('admin-mode');
    document.querySelector('.admin-toolbar').classList.add('active');
    document.querySelector('.admin-badge').classList.add('active');
    
    // Show hidden products (faded)
    document.querySelectorAll('.product-card[data-hidden="true"]').forEach(card => {
        card.style.display = 'block';
    });
    
    // Add admin controls to all product cards
    addAdminControlsToCards();
    
    showToast('تم تفعيل وضع الإدارة ⚙️', 'info');
}

function exitAdminMode() {
    isAdminMode = false;
    document.body.classList.remove('admin-mode');
    document.querySelector('.admin-toolbar').classList.remove('active');
    document.querySelector('.admin-badge').classList.remove('active');
    
    // Hide hidden products again
    document.querySelectorAll('.product-card[data-hidden="true"]').forEach(card => {
        card.style.display = 'none';
    });
    
    // Remove admin controls
    document.querySelectorAll('.product-admin-controls').forEach(el => el.remove());
    
    showToast('تم الخروج من وضع الإدارة', 'info');
}

function addAdminControlsToCards() {
    // Remove existing controls first
    document.querySelectorAll('.product-admin-controls').forEach(el => el.remove());
    
    document.querySelectorAll('.product-card').forEach((card, index) => {
        const isHidden = card.getAttribute('data-hidden') === 'true';
        const controls = document.createElement('div');
        controls.className = 'product-admin-controls';
        controls.innerHTML = `
            <button class="product-ctrl-btn edit-btn" onclick="editProduct(${index})">
                <i class="fas fa-edit"></i> تعديل
            </button>
            <button class="product-ctrl-btn hide-btn" onclick="toggleProductVisibility(${index})">
                <i class="fas fa-${isHidden ? 'eye' : 'eye-slash'}"></i> ${isHidden ? 'إظهار' : 'إخفاء'}
            </button>
            <button class="product-ctrl-btn delete-btn" onclick="confirmDeleteProduct(${index})">
                <i class="fas fa-trash"></i> حذف
            </button>
        `;
        card.style.position = 'relative';
        card.appendChild(controls);
    });
}

// ========== إضافة منتج ==========

function showAddProductModal() {
    editingCardIndex = null;
    document.getElementById('modalTitle').textContent = 'إضافة منتج جديد';
    document.getElementById('productName').value = '';
    document.getElementById('productDesc').value = '';
    document.getElementById('productPrice').value = 'اتصل للسعر';
    document.getElementById('productCategory').value = 'janbiya';
    document.getElementById('productBadge').value = '';
    document.getElementById('productHidden').value = 'false';
    document.getElementById('imagePreview').style.display = 'none';
    document.getElementById('imagePreview').src = '';
    document.getElementById('productModalOverlay').classList.add('active');
}

function showEditProductModal(index) {
    const cards = document.querySelectorAll('.product-card');
    const card = cards[index];
    if (!card) return;
    
    editingCardIndex = index;
    document.getElementById('modalTitle').textContent = 'تعديل المنتج';
    document.getElementById('productName').value = card.querySelector('.product-info h3').textContent;
    document.getElementById('productDesc').value = card.querySelector('.product-desc').textContent;
    document.getElementById('productPrice').value = card.querySelector('.product-price').textContent.trim();
    document.getElementById('productCategory').value = card.getAttribute('data-category');
    
    const badge = card.querySelector('.product-badge');
    document.getElementById('productBadge').value = badge ? badge.textContent : '';
    
    document.getElementById('productHidden').value = card.getAttribute('data-hidden') === 'true' ? 'true' : 'false';
    
    const img = card.querySelector('.product-image img');
    if (img && img.src) {
        document.getElementById('imagePreview').src = img.src;
        document.getElementById('imagePreview').style.display = 'block';
    }
    
    document.getElementById('productModalOverlay').classList.add('active');
}

function closeProductModal() {
    document.getElementById('productModalOverlay').classList.remove('active');
    editingCardIndex = null;
}

function saveProduct() {
    const name = document.getElementById('productName').value.trim();
    const desc = document.getElementById('productDesc').value.trim();
    const price = document.getElementById('productPrice').value.trim();
    const category = document.getElementById('productCategory').value;
    const badge = document.getElementById('productBadge').value.trim();
    const hidden = document.getElementById('productHidden').value;
    
    if (!name) {
        showToast('يرجى إدخال اسم المنتج', 'error');
        return;
    }
    
    const fileInput = document.getElementById('productImage');
    const preview = document.getElementById('imagePreview');
    
    if (editingCardIndex !== null) {
        // Edit existing product
        const cards = document.querySelectorAll('.product-card');
        const card = cards[editingCardIndex];
        if (!card) return;
        
        card.querySelector('.product-info h3').textContent = name;
        card.querySelector('.product-desc').textContent = desc;
        card.querySelector('.product-price').textContent = price;
        card.setAttribute('data-category', category);
        card.setAttribute('data-hidden', hidden);
        
        // Update badge
        let badgeEl = card.querySelector('.product-badge');
        if (badge) {
            if (!badgeEl) {
                badgeEl = document.createElement('div');
                badgeEl.className = 'product-badge';
                card.insertBefore(badgeEl, card.firstChild);
            }
            badgeEl.textContent = badge;
        } else if (badgeEl) {
            badgeEl.remove();
        }
        
        // Update image if new one selected
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                card.querySelector('.product-image img').src = e.target.result;
                saveProductsToStorage();
            };
            reader.readAsDataURL(fileInput.files[0]);
        }
        
        // Update WhatsApp button
        card.querySelector('.order-btn').setAttribute('onclick', `orderViaWhatsApp('${name}')`);
        
        showToast('تم تعديل المنتج بنجاح ✅', 'success');
    } else {
        // Add new product
        let imageSrc = 'images/janbiya_silver.png'; // default image
        
        const addCard = (src) => {
            const grid = document.getElementById('productsGrid');
            const newCard = document.createElement('div');
            newCard.className = 'product-card';
            newCard.setAttribute('data-category', category);
            newCard.setAttribute('data-hidden', hidden);
            newCard.style.position = 'relative';
            
            newCard.innerHTML = `
                ${badge ? `<div class="product-badge">${badge}</div>` : ''}
                <div class="product-image" onclick="openLightbox(this)">
                    <img src="${src}" alt="${name}">
                    <div class="product-overlay">
                        <button class="view-btn"><i class="fas fa-search-plus"></i> عرض الصورة</button>
                    </div>
                </div>
                <div class="product-info">
                    <h3>${name}</h3>
                    <p class="product-desc">${desc}</p>
                    <div class="product-footer">
                        <div class="product-price">${price}</div>
                        <button class="order-btn" onclick="orderViaWhatsApp('${name}')">
                            <i class="fab fa-whatsapp"></i> اطلب الآن
                        </button>
                    </div>
                </div>
            `;
            
            grid.appendChild(newCard);
            
            if (isAdminMode) {
                addAdminControlsToCards();
                if (hidden === 'true') {
                    newCard.style.display = 'block'; // Show faded in admin mode
                }
            } else if (hidden === 'true') {
                newCard.style.display = 'none';
            }
            
            saveProductsToStorage();
        };
        
        if (fileInput.files && fileInput.files[0]) {
            const reader = new FileReader();
            reader.onload = (e) => {
                addCard(e.target.result);
            };
            reader.readAsDataURL(fileInput.files[0]);
        } else {
            addCard(imageSrc);
        }
        
        showToast('تم إضافة المنتج بنجاح ✅', 'success');
    }
    
    closeProductModal();
    saveProductsToStorage();
}

// ========== تعديل منتج ==========

function editProduct(index) {
    showEditProductModal(index);
}

// ========== إخفاء/إظهار منتج ==========

function toggleProductVisibility(index) {
    const cards = document.querySelectorAll('.product-card');
    const card = cards[index];
    if (!card) return;
    
    const isHidden = card.getAttribute('data-hidden') === 'true';
    card.setAttribute('data-hidden', isHidden ? 'false' : 'true');
    
    if (isAdminMode) addAdminControlsToCards();
    saveProductsToStorage();
    
    showToast(isHidden ? 'تم إظهار المنتج ✅' : 'تم إخفاء المنتج 🔒', 'success');
}

// ========== حذف منتج ==========

let deleteIndex = null;

function confirmDeleteProduct(index) {
    const cards = document.querySelectorAll('.product-card');
    const card = cards[index];
    if (!card) return;
    
    deleteIndex = index;
    const name = card.querySelector('.product-info h3').textContent;
    document.getElementById('deleteProductName').textContent = name;
    document.getElementById('deleteModalOverlay').classList.add('active');
}

function closeDeleteModal() {
    document.getElementById('deleteModalOverlay').classList.remove('active');
    deleteIndex = null;
}

function executeDelete() {
    if (deleteIndex === null) return;
    const cards = document.querySelectorAll('.product-card');
    const card = cards[deleteIndex];
    if (!card) return;
    
    card.remove();
    closeDeleteModal();
    if (isAdminMode) addAdminControlsToCards();
    saveProductsToStorage();
    
    showToast('تم حذف المنتج ✅', 'success');
}

// ========== حفظ واسترجاع المنتجات ==========

function saveProductsToStorage() {
    const cards = document.querySelectorAll('.product-card');
    const products = [];
    
    cards.forEach(card => {
        const badge = card.querySelector('.product-badge');
        products.push({
            name: card.querySelector('.product-info h3').textContent,
            desc: card.querySelector('.product-desc').textContent,
            price: card.querySelector('.product-price').textContent.trim(),
            category: card.getAttribute('data-category'),
            hidden: card.getAttribute('data-hidden') === 'true',
            badge: badge ? badge.textContent : '',
            image: card.querySelector('.product-image img').src
        });
    });
    
    localStorage.setItem('turath_products', JSON.stringify(products));
}

function loadSavedProducts() {
    const saved = localStorage.getItem('turath_products');
    if (!saved) return; // Use default HTML products
    
    const products = JSON.parse(saved);
    const grid = document.getElementById('productsGrid');
    grid.innerHTML = '';
    
    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'product-card';
        card.setAttribute('data-category', product.category);
        card.setAttribute('data-hidden', product.hidden ? 'true' : 'false');
        
        if (product.hidden) {
            card.style.display = 'none';
        }
        
        card.innerHTML = `
            ${product.badge ? `<div class="product-badge">${product.badge}</div>` : ''}
            <div class="product-image" onclick="openLightbox(this)">
                <img src="${product.image}" alt="${product.name}">
                <div class="product-overlay">
                    <button class="view-btn"><i class="fas fa-search-plus"></i> عرض الصورة</button>
                </div>
            </div>
            <div class="product-info">
                <h3>${product.name}</h3>
                <p class="product-desc">${product.desc}</p>
                <div class="product-footer">
                    <div class="product-price">${product.price}</div>
                    <button class="order-btn" onclick="orderViaWhatsApp('${product.name}')">
                        <i class="fab fa-whatsapp"></i> اطلب الآن
                    </button>
                </div>
            </div>
        `;
        
        grid.appendChild(card);
    });
}

// ========== معاينة الصورة ==========

function previewImage(input) {
    const preview = document.getElementById('imagePreview');
    if (input.files && input.files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
            preview.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(input.files[0]);
    }
}

// ========== إشعار Toast ==========

function showToast(message, type = 'success') {
    // Remove existing toast
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i> ${message}`;
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
