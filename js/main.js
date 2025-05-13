/**
 * CREAMY WORLD - Main JavaScript
 * Contains all shared functionality for the cake shop website
 */

///*
// * Created by Samyak kamble on 05/12/25, 11:33 PM
// *  Copyright (c) 2024 . All rights reserved.
// *  Last modified 05/12/25, 11:33 PM
// */

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize lazy loading for images
    initLazyLoading();
    
    // Initialize cart functionality
    initCart();
    
    // Initialize search functionality
    initSearch();
    
    // Initialize floating order button
    initOrderButton();
    
    // Initialize order buttons on product cards
    initProductOrderButtons();
    
    // Initialize page-specific functionality
    initSpecificPages();
    
    // Initialize bottom navigation bar
    initBottomNavigation();
});

/**
 * Initialize lazy loading for images
 */
function initLazyLoading() {
    const lazyImages = document.querySelectorAll('.lazy-load');
    
    lazyImages.forEach(img => {
        img.classList.add('loaded');
    });
}

/**
 * Initialize cart functionality
 */
function initCart() {
    // Update cart count from localStorage
    let cartCount = localStorage.getItem('cartCount') || 0;
    updateCartCount(cartCount);
    
    // Initialize clear cart button if it exists
    const clearCartBtn = document.getElementById('clearCart');
    if (clearCartBtn) {
        clearCartBtn.addEventListener('click', function() {
            localStorage.removeItem('cart');
            localStorage.setItem('cartCount', '0');
            loadCart();
        });
    }
    
    // Load cart items if on cart page
    if (document.getElementById('cartContent')) {
        loadCart();
    }
}

/**
 * Update cart count in UI
 */
function updateCartCount(count) {
    const cartCountElements = document.querySelectorAll('.cart-count');
    cartCountElements.forEach(el => {
        el.textContent = count;
        if (count > 0) {
            el.style.display = 'block';
        } else {
            el.style.display = 'none';
        }
    });
}

/**
 * Add item to cart
 */
function addToCart(title, price, img) {
    // Get existing cart or create new one
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    let cartCount = parseInt(localStorage.getItem('cartCount')) || 0;
    
    // Check if item already in cart
    const existingItem = cart.find(item => item.title === title);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: Date.now(),
            title: title,
            price: price,
            image: img,
            quantity: 1
        });
    }
    
    // Update cart count and save to localStorage
    cartCount++;
    localStorage.setItem('cartCount', cartCount);
    localStorage.setItem('cart', JSON.stringify(cart));
    
    // Update UI
    updateCartCount(cartCount);
    
    // Show notification
    showNotification(`${title} added to cart!`);
}

/**
 * Show notification to user
 */
function showNotification(message) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    // Add to DOM
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.classList.add('hide');
        setTimeout(() => {
            notification.remove();
        }, 500);
    }, 3000);
}

/**
 * Load cart items on cart page
 */
function loadCart() {
    const cartContent = document.getElementById('cartContent');
    if (!cartContent) return;
    
    // Get cart from localStorage
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // If cart is empty
    if (cart.length === 0) {
        cartContent.innerHTML = `
            <div class="cart-empty">
                <i class="fas fa-shopping-cart"></i>
                <h2>Your cart is empty</h2>
                <p>Looks like you haven't added any items to your cart yet.</p>
                <a href="home.html" class="shop-now-btn">Shop Now</a>
            </div>
        `;
        if (document.getElementById('clearCart')) {
            document.getElementById('clearCart').style.display = 'none';
        }
        return;
    }
    
    // Calculate cart totals
    let subtotal = 0;
    let itemCount = 0;
    
    cart.forEach(item => {
        // Extract the numeric part of the price and convert to number
        const priceValue = parseFloat(item.price.replace(/[^0-9.]/g, ''));
        subtotal += priceValue * item.quantity;
        itemCount += item.quantity;
    });
    
    const shipping = subtotal > 50 ? 0 : 5.99;
    const total = subtotal + shipping;
    
    // Create cart items HTML
    let cartItemsHTML = '<div class="cart-items">';
    
    cart.forEach(item => {
        cartItemsHTML += `
            <div class="cart-item" data-id="${item.id}">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.title}">
                </div>
                <div class="item-details">
                    <div class="item-title">${item.title}</div>
                    <div class="item-price">${item.price}</div>
                    <div class="item-quantity">
                        <button class="quantity-btn decrease-quantity">-</button>
                        <div class="quantity-value">${item.quantity}</div>
                        <button class="quantity-btn increase-quantity">+</button>
                    </div>
                </div>
                <button class="remove-item"><i class="fas fa-times"></i></button>
            </div>
        `;
    });
    
    cartItemsHTML += '</div>';
    
    // Create cart summary HTML
    const cartSummaryHTML = `
        <div class="cart-summary">
            <div class="summary-title">Order Summary</div>
            <div class="summary-row">
                <div>Subtotal (${itemCount} items)</div>
                <div>$${subtotal.toFixed(2)}</div>
            </div>
            <div class="summary-row">
                <div>Shipping</div>
                <div>${shipping === 0 ? 'Free' : '$' + shipping.toFixed(2)}</div>
            </div>
            <div class="summary-row summary-total">
                <div>Total</div>
                <div>$${total.toFixed(2)}</div>
            </div>
            <button id="checkoutBtn" class="checkout-btn">Checkout</button>
            <div class="continue-shopping">
                <a href="home.html"><i class="fas fa-arrow-left"></i> Continue Shopping</a>
            </div>
        </div>
    `;
    
    // Combine and insert HTML
    cartContent.innerHTML = cartItemsHTML + cartSummaryHTML;
    
    // Add event listeners
    const decreaseBtns = document.querySelectorAll('.decrease-quantity');
    const increaseBtns = document.querySelectorAll('.increase-quantity');
    const removeBtns = document.querySelectorAll('.remove-item');
    const checkoutBtn = document.getElementById('checkoutBtn');
    
    decreaseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.cart-item');
            const itemId = item.dataset.id;
            updateItemQuantity(itemId, -1);
        });
    });
    
    increaseBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.cart-item');
            const itemId = item.dataset.id;
            updateItemQuantity(itemId, 1);
        });
    });
    
    removeBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const item = this.closest('.cart-item');
            const itemId = item.dataset.id;
            removeItem(itemId);
        });
    });
    
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', processCheckout);
    }
}

/**
 * Update item quantity in cart
 */
function updateItemQuantity(itemId, change) {
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Find the item
    const itemIndex = cart.findIndex(item => item.id.toString() === itemId);
    
    if (itemIndex !== -1) {
        // Update quantity
        cart[itemIndex].quantity += change;
        
        // If quantity becomes 0 or less, remove the item
        if (cart[itemIndex].quantity <= 0) {
            cart.splice(itemIndex, 1);
        }
        
        // Update localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count
        updateCartCount();
        
        // Reload cart UI
        loadCart();
    }
}

/**
 * Remove item from cart
 */
function removeItem(itemId) {
    // Get cart from localStorage
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    
    // Find and remove the item
    const itemIndex = cart.findIndex(item => item.id.toString() === itemId);
    
    if (itemIndex !== -1) {
        const removedItem = cart.splice(itemIndex, 1)[0];
        
        // Update localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Update cart count (subtract the quantity of the removed item)
        let cartCount = parseInt(localStorage.getItem('cartCount') || '0');
        cartCount -= removedItem.quantity;
        localStorage.setItem('cartCount', cartCount < 0 ? 0 : cartCount);
        
        // Reload cart UI
        loadCart();
    }
}

/**
 * Process checkout
 */
function processCheckout() {
    const cartPage = document.getElementById('cartPage');
    const successPage = document.getElementById('successPage');
    
    if (cartPage && successPage) {
        // Hide cart page
        cartPage.style.display = 'none';
        
        // Show success page
        successPage.style.display = 'block';
        
        // Set current date as order date
        const now = new Date();
        const formattedOrderDate = now.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Set delivery date (3 days from now)
        const deliveryDate = new Date();
        deliveryDate.setDate(now.getDate() + 3);
        const formattedDeliveryDate = deliveryDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Generate random order reference
        const orderRef = 'CW-' + now.getFullYear() + 
                           (now.getMonth() + 1).toString().padStart(2, '0') + 
                           now.getDate().toString().padStart(2, '0') + '-' + 
                           Math.floor(1000 + Math.random() * 9000);
        
        // Update the DOM
        document.getElementById('orderDate').textContent = formattedOrderDate;
        document.getElementById('deliveryDate').textContent = formattedDeliveryDate;
        document.getElementById('orderRef').textContent = orderRef;
        
        // Clear cart
        localStorage.removeItem('cart');
        localStorage.setItem('cartCount', '0');
    }
}

/**
 * Initialize search functionality
 */
function initSearch() {
    const searchToggle = document.getElementById('search-toggle');
    const searchOverlay = document.querySelector('.search-overlay');
    const closeSearch = document.querySelector('.close-search');
    const searchInput = document.getElementById('search-input');
    const searchButton = document.getElementById('search-button');
    
    if (searchToggle && searchOverlay && closeSearch) {
        // Add click event to search toggle
        searchToggle.addEventListener('click', function(e) {
            e.preventDefault(); // Prevent default behavior if it's a link
            searchOverlay.style.display = 'flex';
            
            // Add animation class
            searchOverlay.classList.add('fade-in');
            
            // Focus the search input after a small delay
            setTimeout(() => {
                if (searchInput) searchInput.focus();
            }, 100);
        });
        
        // Close search when close button is clicked
        closeSearch.addEventListener('click', function() {
            searchOverlay.classList.add('fade-out');
            
            // Wait for animation to complete before hiding
            setTimeout(() => {
                searchOverlay.style.display = 'none';
                searchOverlay.classList.remove('fade-out', 'fade-in');
            }, 300);
        });
        
        // Close search on click outside the search container
        searchOverlay.addEventListener('click', function(e) {
            if (e.target === searchOverlay) {
                closeSearch.click();
            }
        });
        
        // Close search on escape key press
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && searchOverlay.style.display === 'flex') {
                closeSearch.click();
            }
        });
        
        // Set up search button and input
        if (searchButton && searchInput) {
            searchButton.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', function(e) {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }
}

/**
 * Perform search functionality
 */
function performSearch() {
    const searchInput = document.getElementById('search-input');
    const searchResults = document.querySelector('.search-results');
    
    if (!searchInput || !searchResults) return;
    
    const query = searchInput.value.toLowerCase().trim();
    
    if (!query) return;
    
    // Sample cake data - in a real application this would be fetched from a database
    const cakeProducts = [
        { title: "Chocolate Symphony Cake", price: "$42.99", image: "img/cake1.jpg", category: "Birthday Cakes" },
        { title: "Strawberry Shortcake", price: "$38.99", image: "img/cake2.jpg", category: "Birthday Cakes" },
        { title: "Blueberry Cheesecake", price: "$44.99", image: "img/cake3.jpg", category: "Wedding Cakes" },
        { title: "Classic Vanilla Cake", price: "$32.99", image: "img/cake4.jpg", category: "Wedding Cakes" },
        { title: "Red Velvet Delight", price: "$39.99", image: "img/cake5.jpg", category: "Birthday Cakes" },
        { title: "Tiramisu Cake", price: "$45.99", image: "img/cake6.jpg", category: "Pastries" },
        { title: "Fruit Paradise Cake", price: "$48.99", image: "img/cake7.jpg", category: "Wedding Cakes" },
        { title: "Butterscotch Cake", price: "$36.99", image: "img/cake8.jpg", category: "Birthday Cakes" },
        { title: "Chocolate Pastry", price: "$15.00", image: "img/ps.png", category: "Pastries" },
        { title: "Fruit Pastry", price: "$12.00", image: "img/ps2.png", category: "Pastries" },
        { title: "Classic Pancakes", price: "$15.00", image: "img/pan1.png", category: "Pancakes" },
        { title: "Chocolate Pancakes", price: "$12.00", image: "img/pan 2.png", category: "Pancakes" }
    ];
    
    // Also try to get products from current page if available
    try {
        const pageProducts = document.querySelectorAll('.product-card');
        pageProducts.forEach(product => {
            const title = product.querySelector('.card-title').textContent;
            const price = product.querySelector('.card-price').textContent;
            const image = product.querySelector('img').src;
            
            // Check if product already exists in our list
            if (!cakeProducts.some(p => p.title === title)) {
                // Determine category based on current page
                let category = "Other";
                if (window.location.pathname.includes('birth')) {
                    category = "Birthday Cakes";
                } else if (window.location.pathname.includes('wedd')) {
                    category = "Wedding Cakes";
                } else if (window.location.pathname.includes('pan')) {
                    category = "Pancakes";
                } else if (window.location.pathname.includes('pest')) {
                    category = "Pastries";
                }
                
                cakeProducts.push({
                    title: title,
                    price: price,
                    image: image,
                    category: category
                });
            }
        });
    } catch (e) {
        // Ignore errors if we can't get products from page
        console.log("Could not get products from current page");
    }
    
    const results = cakeProducts.filter(product => 
        product.title.toLowerCase().includes(query) || 
        product.category.toLowerCase().includes(query)
    );
    
    displaySearchResults(results);
}

/**
 * Display search results
 */
function displaySearchResults(results) {
    const searchResults = document.querySelector('.search-results');
    if (!searchResults) return;
    
    searchResults.innerHTML = '';
    
    if (results.length === 0) {
        searchResults.innerHTML = '<p class="no-results">No products found. Try a different search term.</p>';
        return;
    }
    
    results.forEach(result => {
        const resultItem = document.createElement('div');
        resultItem.className = 'search-result-item';
        
        resultItem.innerHTML = `
            <img src="${result.image}" alt="${result.title}">
            <div class="result-details">
                <h4>${result.title}</h4>
                <p>${result.price}</p>
                <small>${result.category}</small>
            </div>
            <button class="add-to-cart-btn"><i class="fas fa-cart-plus"></i></button>
        `;
        
        searchResults.appendChild(resultItem);
    });
    
    // Add click event for search results
    const addButtons = document.querySelectorAll('.add-to-cart-btn');
    addButtons.forEach(button => {
        button.addEventListener('click', function() {
            const resultItem = this.closest('.search-result-item');
            const title = resultItem.querySelector('h4').textContent;
            const price = resultItem.querySelector('p').textContent;
            const image = resultItem.querySelector('img').src;
            
            addToCart(title, price, image);
            
            // Feedback
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-cart-plus"></i>';
            }, 1500);
        });
    });
}

/**
 * Initialize floating order button
 */
function initOrderButton() {
    const floatingButton = document.querySelector('.order-now-fixed');
    
    if (floatingButton) {
        floatingButton.addEventListener('click', function() {
            window.location.href = 'order.html';
        });
    }
}

/**
 * Initialize product order buttons
 */
function initProductOrderButtons() {
    const orderButtons = document.querySelectorAll('.order-button');
    
    orderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product details from card
            const card = this.closest('.product-card');
            if (card) {
                const title = card.querySelector('.card-title').textContent;
                const price = card.querySelector('.card-price').textContent;
                const img = card.querySelector('img').src;
                
                // Add to cart
                addToCart(title, price, img);
                
                // Navigate to cart page
                window.location.href = 'order.html';
            }
        });
    });
}

/**
 * Initialize page-specific functionality
 */
function initSpecificPages() {
    // Login/Signup page
    initLoginPage();
    
    // Feedback page
    initFeedbackPage();
    
    // Category pages - add click events to category cards
    initCategoryLinks();
}

/**
 * Initialize login page functionality
 */
function initLoginPage() {
    // Tab switching
    const tabBtns = document.querySelectorAll('.tab-btn');
    const forms = document.querySelectorAll('.auth-form');
    
    if (tabBtns.length && forms.length) {
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const target = this.dataset.target;
                
                // Update active tab
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                // Show target form
                forms.forEach(form => {
                    form.classList.remove('active');
                    if (form.id === target) {
                        form.classList.add('active');
                    }
                });
            });
        });
        
        // Password toggle
        const toggleBtns = document.querySelectorAll('.toggle-password');
        
        toggleBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const passwordInput = this.parentElement.querySelector('input');
                const icon = this.querySelector('i');
                
                if (passwordInput.type === 'password') {
                    passwordInput.type = 'text';
                    icon.classList.remove('fa-eye');
                    icon.classList.add('fa-eye-slash');
                } else {
                    passwordInput.type = 'password';
                    icon.classList.remove('fa-eye-slash');
                    icon.classList.add('fa-eye');
                }
            });
        });
        
        // Form submission
        const loginForm = document.getElementById('login-form');
        const signupForm = document.getElementById('signup-form');
        
        if (loginForm) {
            loginForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Simulate login action
                window.location.href = 'home.html';
            });
        }
        
        if (signupForm) {
            signupForm.addEventListener('submit', function(e) {
                e.preventDefault();
                // Validate password match
                const password = document.getElementById('signup-password').value;
                const confirmPassword = document.getElementById('confirm-password').value;
                
                if (password !== confirmPassword) {
                    alert('Passwords do not match!');
                    return;
                }
                
                // Simulate signup success
                alert('Account created successfully! Please login.');
                
                // Reset form and switch to login tab
                this.reset();
                document.querySelector('[data-target="login-form"]').click();
            });
        }
    }
}

/**
 * Initialize feedback page functionality
 */
function initFeedbackPage() {
    const form = document.getElementById('feedbackForm');
    const thankYouMessage = document.querySelector('.thank-you-message');
    
    if (form && thankYouMessage) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Simulate form submission
            form.style.opacity = '0';
            setTimeout(() => {
                form.style.display = 'none';
                thankYouMessage.style.display = 'block';
                setTimeout(() => {
                    thankYouMessage.style.opacity = '1';
                }, 100);
            }, 500);
        });
        
        // Star rating functionality
        const stars = document.querySelectorAll('.star-rating input');
        
        stars.forEach(star => {
            star.addEventListener('click', function() {
                const value = this.value;
                stars.forEach(s => {
                    if (s.value <= value) {
                        s.nextElementSibling.classList.add('active');
                    } else {
                        s.nextElementSibling.classList.remove('active');
                    }
                });
            });
        });
    }
}

/**
 * Initialize category links on home page
 */
function initCategoryLinks() {
    const categoryCards = document.querySelectorAll('.category-card');
    
    categoryCards.forEach(card => {
        card.addEventListener('click', function() {
            const categoryName = this.querySelector('.category-name').textContent;
            
            if (categoryName === 'Wedding Cakes') {
                window.location.href = 'wedd.html';
            } else if (categoryName === 'Birthday Cakes') {
                window.location.href = 'birth.html';
            } else if (categoryName === 'Pancakes') {
                window.location.href = 'pan.html';
            } else if (categoryName === 'Pastries') {
                window.location.href = 'pest.html';
            }
        });
    });
}

/**
 * Initialize bottom navigation bar functionality
 */
function initBottomNavigation() {
    // Get current page path
    const currentPath = window.location.pathname;
    const pageName = currentPath.split('/').pop();
    
    // Select all footer items
    const footerItems = document.querySelectorAll('.footer-item');
    
    // Set active state based on current page
    footerItems.forEach(item => {
        // Remove active class from all items
        item.classList.remove('active');
        
        // Determine which item should be active
        if (pageName === 'home.html' && item.querySelector('i.fa-home')) {
            item.classList.add('active');
        } else if ((pageName === 'order.html' || pageName === 'cart.html') && item.querySelector('i.fa-shopping-cart')) {
            item.classList.add('active');
        } else if (pageName === 'login.html' && item.querySelector('i.fa-user')) {
            item.classList.add('active');
        }
    });
    
    // Ensure all footer items have proper click handling
    footerItems.forEach(item => {
        // Find the icon to determine what the item does
        const icon = item.querySelector('i');
        
        if (icon) {
            if (icon.classList.contains('fa-home')) {
                // Home icon
                item.addEventListener('click', function() {
                    window.location.href = 'home.html';
                });
            } else if (icon.classList.contains('fa-shopping-cart')) {
                // Cart icon
                item.addEventListener('click', function() {
                    window.location.href = 'order.html';
                });
            } else if (icon.classList.contains('fa-user')) {
                // User/profile icon
                item.addEventListener('click', function() {
                    window.location.href = 'login.html';
                });
            }
            // Search icon handled in initSearch()
        }
    });
} 