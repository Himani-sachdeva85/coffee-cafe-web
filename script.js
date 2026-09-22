/**
 * Coffee Time - Interactive Functionality Script
 * Handles Navigation, Mobile Menu, Cart State Management (LocalStorage),
 * Cart Panel Modal, Toast Notifications, and Contact Form Validation.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // 1. Cart State & LocalStorage Management
    // ==========================================
    const CART_STORAGE_KEY = 'coffeetime_cart';
    let cart = [];

    // Load cart from LocalStorage
    function loadCart() {
        try {
            const savedCart = localStorage.getItem(CART_STORAGE_KEY);
            cart = savedCart ? JSON.parse(savedCart) : [];
        } catch (e) {
            console.error('Failed to parse cart from localStorage:', e);
            cart = [];
        }
        updateCartBadge();
        renderCart();
    }

    // Save cart to LocalStorage
    function saveCart() {
        try {
            localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (e) {
            console.error('Failed to save cart to localStorage:', e);
        }
        updateCartBadge();
        renderCart();
    }

    // Calculate Total Cart Count
    function getCartCount() {
        return cart.reduce((total, item) => total + item.quantity, 0);
    }

    // Calculate Total Price
    function getCartTotal() {
        return cart.reduce((total, item) => total + (parseFloat(item.price) * item.quantity), 0);
    }

    // Update Cart Counter Badge across the site
    function updateCartBadge() {
        const countElements = document.querySelectorAll('#cart-count');
        const totalItems = getCartCount();
        countElements.forEach(el => {
            el.textContent = totalItems;
        });
    }

    // Add Item to Cart
    function addToCart(product) {
        const existingIndex = cart.findIndex(item => item.id === product.id);
        if (existingIndex > -1) {
            cart[existingIndex].quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: parseFloat(product.price),
                image: product.image || 'images/pngtree-black-coffee20059075.png',
                quantity: 1
            });
        }
        saveCart();
        showToast(`${product.name} added to cart.`);
    }

    // Remove Item from Cart
    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
    }

    // Change Item Quantity
    function updateQuantity(productId, delta) {
        const item = cart.find(i => i.id === productId);
        if (item) {
            item.quantity += delta;
            if (item.quantity <= 0) {
                removeFromCart(productId);
            } else {
                saveCart();
            }
        }
    }

    // Clear entire cart
    function clearCart() {
        cart = [];
        saveCart();
    }

    // ==========================================
    // 2. Render Cart Drawer / Modal DOM
    // ==========================================
    function renderCart() {
        const cartContainer = document.getElementById('cart-items-container');
        const cartTotalPrice = document.getElementById('cart-total-price');
        
        if (!cartContainer || !cartTotalPrice) return;

        cartTotalPrice.textContent = `$${getCartTotal().toFixed(2)}`;

        if (cart.length === 0) {
            cartContainer.innerHTML = `
                <div class="cart-empty-msg">
                    <p style="font-size: 40px; margin-bottom: 10px;">☕</p>
                    <p>Your cart is currently empty.</p>
                    <a href="menu.html" class="button" style="margin-top: 15px; font-size: 14px; padding: 8px 16px;">Browse Menu</a>
                </div>
            `;
            return;
        }

        cartContainer.innerHTML = cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                <div class="cart-item-details">
                    <div class="cart-item-name">${escapeHtml(item.name)}</div>
                    <div class="cart-item-price">$${item.price.toFixed(2)} each</div>
                    <div class="cart-item-qty-controls">
                        <button class="cart-qty-btn qty-minus-btn" data-id="${item.id}">-</button>
                        <span class="cart-item-qty">${item.quantity}</span>
                        <button class="cart-qty-btn qty-plus-btn" data-id="${item.id}">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <div style="font-weight: bold; color: #583702; font-size: 14px; margin-bottom: 6px;">
                        $${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <button class="cart-item-remove remove-item-btn" data-id="${item.id}" title="Remove item">&times;</button>
                </div>
            </div>
        `).join('');
    }

    // Helper to sanitize HTML strings
    function escapeHtml(str) {
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;');
    }

    // ==========================================
    // 3. Cart Modal & Event Controls
    // ==========================================
    const cartOverlay = document.getElementById('cart-modal-overlay');
    const cartCloseBtn = document.getElementById('cart-close-btn');
    const cartNavBtns = document.querySelectorAll('#cart-nav-btn, .cart-link');
    const cartClearBtn = document.getElementById('cart-clear-btn');

    function openCart() {
        if (cartOverlay) {
            cartOverlay.classList.add('active');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeCart() {
        if (cartOverlay) {
            cartOverlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    cartNavBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            openCart();
        });
    });

    if (cartCloseBtn) {
        cartCloseBtn.addEventListener('click', closeCart);
    }

    if (cartOverlay) {
        cartOverlay.addEventListener('click', (e) => {
            if (e.target === cartOverlay) {
                closeCart();
            }
        });
    }

    if (cartClearBtn) {
        cartClearBtn.addEventListener('click', () => {
            if (cart.length > 0) {
                clearCart();
                showToast('Cart cleared.');
            }
        });
    }

    // Delegate Cart Container Click Events (+, -, remove)
    const cartItemsContainer = document.getElementById('cart-items-container');
    if (cartItemsContainer) {
        cartItemsContainer.addEventListener('click', (e) => {
            const target = e.target;
            const productId = target.getAttribute('data-id');

            if (!productId) return;

            if (target.classList.contains('qty-plus-btn')) {
                updateQuantity(productId, 1);
            } else if (target.classList.contains('qty-minus-btn')) {
                updateQuantity(productId, -1);
            } else if (target.classList.contains('remove-item-btn')) {
                removeFromCart(productId);
                showToast('Item removed from cart.');
            }
        });
    }

    // Delegate Add to Cart Button Clicks across pages
    document.body.addEventListener('click', (e) => {
        const btn = e.target.closest('.add-to-cart-btn, .cart-icon-btn');
        if (btn) {
            e.preventDefault();
            const id = btn.getAttribute('data-id');
            const name = btn.getAttribute('data-name');
            const price = btn.getAttribute('data-price');
            const image = btn.getAttribute('data-image');

            if (id && name && price) {
                addToCart({ id, name, price, image });
            }
        }
    });

    // ==========================================
    // 4. Toast Notification Popup
    // ==========================================
    function showToast(message) {
        const container = document.getElementById('toast-container');
        if (!container) return;

        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `<span>☕</span> ${escapeHtml(message)}`;

        container.appendChild(toast);

        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateY(10px)';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 2800);
    }

    // ==========================================
    // 5. Mobile Navigation Hamburger Menu
    // ==========================================
    const hamburgerToggle = document.getElementById('hamburger-toggle');
    const mainNav = document.getElementById('main-nav');

    if (hamburgerToggle && mainNav) {
        hamburgerToggle.addEventListener('click', () => {
            mainNav.classList.toggle('nav-open');
        });

        // Close mobile nav when clicking a link
        mainNav.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mainNav.classList.remove('nav-open');
            });
        });
    }

    // ==========================================
    // 6. Contact Form Validation (contact.html)
    // ==========================================
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const nameInput = document.getElementById('contact-name');
            const emailInput = document.getElementById('contact-email');
            const messageInput = document.getElementById('contact-message');

            const nameError = document.getElementById('name-error');
            const emailError = document.getElementById('email-error');
            const messageError = document.getElementById('message-error');
            const successAlert = document.getElementById('contact-success-alert');

            let isValid = true;

            // Reset errors
            [nameInput, emailInput, messageInput].forEach(input => {
                if (input) input.classList.remove('error');
            });
            [nameError, emailError, messageError].forEach(err => {
                if (err) err.classList.remove('visible');
            });
            if (successAlert) successAlert.style.display = 'none';

            // Validate Name
            if (!nameInput || !nameInput.value.trim()) {
                if (nameInput) nameInput.classList.add('error');
                if (nameError) nameError.classList.add('visible');
                isValid = false;
            }

            // Validate Email
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailInput || !emailInput.value.trim() || !emailPattern.test(emailInput.value.trim())) {
                if (emailInput) emailInput.classList.add('error');
                if (emailError) emailError.classList.add('visible');
                isValid = false;
            }

            // Validate Message
            if (!messageInput || !messageInput.value.trim()) {
                if (messageInput) messageInput.classList.add('error');
                if (messageError) messageError.classList.add('visible');
                isValid = false;
            }

            if (isValid) {
                if (successAlert) {
                    successAlert.style.display = 'block';
                    successAlert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }
                contactForm.reset();
            }
        });
    }

    // ==========================================
    // 7. Smooth Section Scrolling for Hash Links
    // ==========================================
    function handleHashScroll() {
        if (window.location.hash) {
            const targetId = window.location.hash.substring(1);
            const targetElement = document.getElementById(targetId);
            if (targetElement) {
                setTimeout(() => {
                    targetElement.scrollIntoView({ behavior: 'smooth' });
                }, 100);
            }
        }
    }

    window.addEventListener('hashchange', handleHashScroll);

    // Initial load
    loadCart();
    handleHashScroll();
});
