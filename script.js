diff --git a/script.js b/script.js
index a1e20f82428308e9b2778bb56c1ca840d0d2d5fd..d207b0370cec3e2ed47ee6b51192011254cda4ac 100644
--- a/script.js
+++ b/script.js
@@ -1,38 +1,28 @@
-function login() {
-    const username = document.getElementById("username").value.trim();
-    const password = document.getElementById("password").value.trim();
-    const error = document.getElementById("login-error");
-
-    if (username === "admin" && password === "1234") {
-        document.getElementById("login-page").style.display = "none";
-        document.getElementById("main-content").style.display = "block";
-        renderFilteredCategory('all');
-    } else {
-        error.textContent = "Invalid username or password.";
-    }
-}
+const LOGIN_USERNAME = "admin";
+const LOGIN_PASSWORD = "1234";
+const AUTH_STORAGE_KEY = "isLoggedIn";
 
 const productData = [
     {
         title: "Featured Products", products: [
             { name: "PLAYABLE Jacket 5", price: 150, img: "images/j7-removebg-preview.png", label: "New Release!" },
             { name: "PLAYABLE Jacket 6", price: 129, img: "images/j9-removebg-preview.png", label: "New Release!" },
             { name: "PLAYABLE Jacket 7", price: 129, img: "images/j6-removebg-preview.png", label: "New Release!" },
             { name: "PLAYABLE Jacket 8", price: 129, img: "images/j5-removebg-preview.png", label: "New Release!" }
         ]
     },
     {
         title: "PLAYABLE Caps",
         products: [
             ["cap6", 150], ["cap1", 129], ["cap2", 129], ["cap3", 129],
             ["cap4", 129], ["cap5", 129], ["cap7", 129], ["cap8.1", 129]
         ].map(([img, price], i) => ({
             name: `PLAYABLE Cap V${i + 1}`, price, img: `images/${img}-removebg-preview.png`
         }))
     },
     {
         title: "PLAYABLE Shirts",
         products: [
             "shirt1.1", "1.1", "2.2", "3.3", "shirt3", "4.4", "5.5", "5", "7.7", "1.1.1", "2.2.2", "3.3.3"
         ].map((img, i) => ({
             name: `PLAYABLE Shirt ${i + 1}`,
@@ -55,242 +45,438 @@ const productData = [
         products: [10, 11, 3, 4, 5, 12, 13, 14].map((img, i) => ({
             name: `PLAYABLE Denim V${i + 1}`,
             price: i === 0 ? 150 : 129,
             img: `images/p${img}-removebg-preview.png`
         }))
     },
     {
         title: "KILLWINNER Shoes",
         products: [1, 2, 3, 4, 9, 10, 7, 8].map((img, i) => ({
             name: `KILLWINNER Shoe V${i + 1}`,
             price: i === 0 ? 150 : 129,
             img: `images/s${img}-removebg-preview.png`
         }))
     },
     {
         title: "UNKNWN Accessories",
         products: [1, 2, 3, 4, 15, 14, 9, 8].map((img, i) => ({
             name: `UNKNWN Accessories ${i + 1}`,
             price: i === 0 ? 150 : 129,
             img: `images/r${img}-removebg-preview.png`
         }))
     }
 ];
 
 let cart = JSON.parse(localStorage.getItem("cart")) || [];
+let currentCategory = "all";
+let currentSearch = "";
+let currentSort = "default";
+
+function login() {
+    const username = document.getElementById("username").value.trim();
+    const password = document.getElementById("password").value.trim();
+    const error = document.getElementById("login-error");
+
+    if (username === LOGIN_USERNAME && password === LOGIN_PASSWORD) {
+        localStorage.setItem(AUTH_STORAGE_KEY, "true");
+        setAuthenticatedView(true);
+        error.textContent = "";
+        applyFiltersAndRender();
+        showNotification("Welcome back!");
+    } else {
+        error.textContent = "Invalid username or password.";
+    }
+}
+
+function logout() {
+    localStorage.removeItem(AUTH_STORAGE_KEY);
+    setAuthenticatedView(false);
+    document.getElementById("password").value = "";
+    showNotification("Logged out successfully.");
+}
+
+function setAuthenticatedView(isLoggedIn) {
+    document.getElementById("login-page").style.display = isLoggedIn ? "none" : "block";
+    document.getElementById("main-content").style.display = isLoggedIn ? "block" : "none";
+}
+
+function getProductDescription(productName) {
+    const lower = productName.toLowerCase();
+    if (lower.includes("jacket")) {
+        return "This jacket offers unmatched warmth, premium insulation, and timeless street-style appeal. It is crafted for all-weather comfort and durability with a sleek modern cut from our latest PLAYABLE collection.";
+    }
+    if (lower.includes("cap")) {
+        return "This cap completes your outfit with bold urban flair, breathable fabric, and adjustable fit, making it perfect for casual and active wear from our latest PLAYABLE collection.";
+    }
+    if (lower.includes("shirt")) {
+        return "This shirt blends high-quality cotton with expressive prints, offering day-long comfort and bold personality for those who dare to stand out from our latest PLAYABLE collection.";
+    }
+    if (lower.includes("denim") || lower.includes("pant")) {
+        return "This pair of pants merges rugged function with street-ready styling, providing both stretch mobility and durable construction from our latest PLAYABLE collection.";
+    }
+    if (lower.includes("shoe")) {
+        return "This pair of shoes delivers next-level cushioning, standout sole traction, and a minimalist silhouette ideal for urban exploration or downtime from our latest PLAYABLE collection.";
+    }
+    if (lower.includes("accessories")) {
+        return "This accessory adds detail-driven style and functional edge, designed to complement and elevate your outfit from our latest PLAYABLE collection.";
+    }
+    return "This product is crafted with signature PLAYABLE quality, blending statement design and reliable performance from our latest collection.";
+}
+
+function initializeProductMetadata() {
+    productData.forEach(section => {
+        section.products.forEach(product => {
+            if (!product.description) {
+                product.description = getProductDescription(product.name);
+            }
+        });
+    });
+}
+
+function getVisibleSections() {
+    const sections = currentCategory === "all"
+        ? productData
+        : productData.filter(section => section.title === currentCategory);
+
+    const query = currentSearch.toLowerCase();
+
+    return sections.map(section => {
+        const filtered = section.products
+            .filter(product => product.name.toLowerCase().includes(query))
+            .sort((a, b) => {
+                if (currentSort === "price-asc") {
+                    return a.price - b.price;
+                }
+                if (currentSort === "price-desc") {
+                    return b.price - a.price;
+                }
+                if (currentSort === "name-asc") {
+                    return a.name.localeCompare(b.name);
+                }
+                return 0;
+            });
+
+        return {
+            title: section.title,
+            products: filtered
+        };
+    }).filter(section => section.products.length > 0);
+}
+
+function createProductCard(product) {
+    const card = document.createElement("div");
+    card.className = "col4";
+
+    const image = document.createElement("img");
+    image.src = product.img;
+    image.alt = product.name;
+    image.style.cursor = "pointer";
+    image.addEventListener("click", () => openModal(product));
+
+    const title = document.createElement("h4");
+    title.className = "label";
+    title.textContent = product.name;
+
+    const price = document.createElement("p");
+    price.textContent = `$${product.price.toFixed(2)}`;
+
+    const button = document.createElement("a");
+    button.href = "#";
+    button.className = "btn";
+    button.textContent = "Add to Cart";
+    button.addEventListener("click", (event) => {
+        event.preventDefault();
+        addToCart(product);
+    });
+
+    card.appendChild(image);
+    card.appendChild(title);
+
+    if (product.label) {
+        const label = document.createElement("h5");
+        label.textContent = product.label;
+        card.appendChild(label);
+    }
+
+    card.appendChild(price);
+    card.appendChild(button);
+
+    return card;
+}
 
 function renderProductsSection(section) {
-    const container = document.createElement('div');
-    container.classList.add('product-category');
+    const container = document.createElement("div");
+    container.classList.add("product-category");
 
-    const title = document.createElement('h2');
-    title.className = 'title';
+    const title = document.createElement("h2");
+    title.className = "title";
     title.textContent = section.title;
 
-    const row = document.createElement('div');
-    row.className = 'row';
+    const row = document.createElement("div");
+    row.className = "row";
 
     section.products.forEach(product => {
-        if (!product.description) {
-            product.description = `This ${product.name.toLowerCase().includes('jacket') ? 'jacket offers unmatched warmth, premium insulation, and timeless street-style appeal. It is crafted for all-weather comfort and durability with a sleek modern cut' :
-                product.name.toLowerCase().includes('cap') ? 'cap completes your outfit with bold urban flair, breathable fabric, and adjustable fit, making it perfect for casual and active wear' :
-                    product.name.toLowerCase().includes('shirt') ? 'shirt blends high-quality cotton with expressive prints, offering day-long comfort and bold personality for those who dare to stand out' :
-                        product.name.toLowerCase().includes('pant') ? 'pair of pants merges rugged function with street-ready styling, providing both stretch mobility and durable construction' :
-                            product.name.toLowerCase().includes('shoe') ? 'pair of shoes delivers next-level cushioning, standout sole traction, and a minimalist silhouette ideal for urban exploration or downtime' :
-                                product.name.toLowerCase().includes('accessories') ? 'accessory adds detail-driven style and functional edge, designed to complement and elevate your outfit' :
-                                    'product is crafted with signature PLAYABLE quality, blending statement design and reliable performance'
-                } from our latest PLAYABLE collection.`;
-        }
-
-        const card = document.createElement('div');
-        card.className = 'col4';
-        card.innerHTML = `
-            <img src="${product.img}" alt="${product.name}" style="cursor:pointer;" onclick='openModal(${JSON.stringify(product)})' />
-            <h4 class="label">${product.name}</h4>
-            ${product.label ? `<h5>${product.label}</h5>` : ""}
-            <p>$${product.price.toFixed(2)}</p>
-            <a href="#" class="btn" onclick='event.preventDefault(); addToCart(${JSON.stringify(product)})'>Add to Cart</a>
-        `;
-        row.appendChild(card);
+        row.appendChild(createProductCard(product));
     });
 
     container.appendChild(title);
     container.appendChild(row);
+
     return container;
 }
 
-
 function openModal(product) {
     document.getElementById("modal-img").src = product.img;
     document.getElementById("modal-title").textContent = product.name;
     document.getElementById("modal-price").textContent = `$${product.price.toFixed(2)}`;
     document.getElementById("modal-description").textContent = product.description || "No description provided.";
     document.getElementById("product-modal").style.display = "flex";
 
     const addBtn = document.getElementById("modal-add-btn");
     addBtn.onclick = function () {
         addToCart(product);
         closeModal();
     };
 }
 
-
-
 function closeModal() {
     document.getElementById("product-modal").style.display = "none";
 }
 
 function addToCart(product) {
     const index = cart.findIndex(item => item.name === product.name);
     if (index >= 0) {
         cart[index].qty += 1;
     } else {
         cart.push({ ...product, qty: 1 });
     }
     saveCart();
     updateCartUI();
     showNotification("Item added to cart!");
 }
 
-
 function removeFromCart(name) {
     cart = cart.filter(item => item.name !== name);
     saveCart();
     updateCartUI();
 }
 
 function updateQty(name, qty) {
     const item = cart.find(i => i.name === name);
     if (item) {
-        item.qty = parseInt(qty) || 1;
+        const parsedQty = Number.parseInt(qty, 10);
+        item.qty = Number.isFinite(parsedQty) && parsedQty > 0 ? parsedQty : 1;
         saveCart();
         updateCartUI();
     }
 }
 
+function clearCart() {
+    cart = [];
+    saveCart();
+    updateCartUI();
+    showNotification("Cart cleared.");
+}
+
 function saveCart() {
     localStorage.setItem("cart", JSON.stringify(cart));
 }
 
 function updateCartUI() {
     const cartContainer = document.getElementById("cart-items");
     const totalEl = document.getElementById("cart-total");
     cartContainer.innerHTML = "";
 
+    if (cart.length === 0) {
+        cartContainer.innerHTML = '<p class="empty-state">Your cart is empty. Add items to continue.</p>';
+        totalEl.textContent = "0.00";
+        return;
+    }
+
     let total = 0;
     cart.forEach(item => {
         total += item.qty * item.price;
+
         const div = document.createElement("div");
         div.className = "cart-item";
-        div.innerHTML = `
-                    <span>${item.name}</span>
-                    <div>
-                        <input type="number" value="${item.qty}" min="1" onchange="updateQty('${item.name}', this.value)" />
-                        <span>$${(item.price * item.qty).toFixed(2)}</span>
-                        <button class="remove-btn" onclick="removeFromCart('${item.name}')">Remove</button>
-                    </div>
-                `;
+
+        const nameSpan = document.createElement("span");
+        nameSpan.textContent = item.name;
+
+        const controls = document.createElement("div");
+
+        const qtyInput = document.createElement("input");
+        qtyInput.type = "number";
+        qtyInput.min = "1";
+        qtyInput.value = item.qty;
+        qtyInput.addEventListener("change", () => updateQty(item.name, qtyInput.value));
+
+        const subtotal = document.createElement("span");
+        subtotal.textContent = `$${(item.price * item.qty).toFixed(2)}`;
+
+        const removeButton = document.createElement("button");
+        removeButton.className = "remove-btn";
+        removeButton.textContent = "Remove";
+        removeButton.addEventListener("click", () => removeFromCart(item.name));
+
+        controls.appendChild(qtyInput);
+        controls.appendChild(subtotal);
+        controls.appendChild(removeButton);
+
+        div.appendChild(nameSpan);
+        div.appendChild(controls);
         cartContainer.appendChild(div);
     });
 
     totalEl.textContent = total.toFixed(2);
 }
 
 function scrollToCart() {
     document.getElementById("checkout").scrollIntoView({ behavior: "smooth" });
 }
 
 function checkout() {
     if (cart.length === 0) {
         showNotification("Your cart is empty.");
         return;
     }
-    cart.length = 0;
+
+    cart = [];
     saveCart();
     updateCartUI();
     showNotification("Checkout successful! Thank you for your purchase.");
 }
 
 function showNotification(message) {
     const notification = document.getElementById("cart-notification");
     notification.textContent = message;
     notification.style.display = "block";
+
     setTimeout(() => {
         notification.style.display = "none";
         notification.textContent = "Item added to cart!";
     }, 2000);
 }
 
 function createExclusiveProduct() {
     const container = document.createElement("div");
     container.className = "exclusive-container";
     container.innerHTML = `
-                <div class="exclusive-image">
-                    <img src="images/hhe-removebg-preview.png" alt="Playable Puffer Hoodie">
-                </div>
-                <div class="exclusive-text">
-                    <h1>PLAYABLE EXCLUSIVE</h1>
-                    <h4>Limited Stocks!</h4>
-                    <h3>PLAYABLE Puffer Jacket</h3>
-                    <p>Stay warm and stylish with this puffer hoodie, designed with a thick, insulated build to keep you cozy during colder days. Featuring a comfortable hood and a sleek, modern fit, it's perfect for both outdoor adventures and casual streetwear looks.</p>
-                    <h3><b>$499.00</b></h3>
-                    <a href="#" class="btn" onclick="event.preventDefault(); addToCart({
-                        name: 'PLAYABLE Puffer Jacket',
-                        price: 499,
-                        img: 'images/hhe-removebg-preview.png'
-                    })">Add to Cart</a>
-                </div>`;
+        <div class="exclusive-image">
+            <img src="images/hhe-removebg-preview.png" alt="Playable Puffer Hoodie">
+        </div>
+        <div class="exclusive-text">
+            <h1>PLAYABLE EXCLUSIVE</h1>
+            <h4>Limited Stocks!</h4>
+            <h3>PLAYABLE Puffer Jacket</h3>
+            <p>Stay warm and stylish with this puffer hoodie, designed with a thick, insulated build to keep you cozy during colder days. Featuring a comfortable hood and a sleek, modern fit, it's perfect for both outdoor adventures and casual streetwear looks.</p>
+            <h3><b>$499.00</b></h3>
+            <a href="#" class="btn" id="exclusive-add-btn">Add to Cart</a>
+        </div>`;
+
+    const exclusiveButton = container.querySelector("#exclusive-add-btn");
+    exclusiveButton.addEventListener("click", (event) => {
+        event.preventDefault();
+        addToCart({
+            name: "PLAYABLE Puffer Jacket",
+            price: 499,
+            img: "images/hhe-removebg-preview.png",
+            description: getProductDescription("PLAYABLE Puffer Jacket")
+        });
+    });
+
     return container;
 }
 
-function renderFilteredCategory(category) {
+function showNoResultsState() {
+    const productSections = document.getElementById("product-sections");
+    const noResults = document.createElement("div");
+    noResults.className = "empty-state no-results";
+    noResults.textContent = "No matching products found. Try another keyword or category.";
+    productSections.appendChild(noResults);
+}
+
+function applyFiltersAndRender() {
     const banner = document.getElementById("homepage-banner");
     const productSections = document.getElementById("product-sections");
+
     productSections.innerHTML = "";
 
-    if (category === 'all') {
-        banner.style.display = "block";
-        productData.forEach((section, index) => {
-            productSections.appendChild(renderProductsSection(section));
-            if (index === 0) productSections.appendChild(createExclusiveProduct());
-        });
-    } else {
-        banner.style.display = "none";
-        const section = productData.find(s => s.title === category);
-        if (section) {
-            productSections.appendChild(renderProductsSection(section));
-        }
+    const sections = getVisibleSections();
+    const shouldShowBanner = currentCategory === "all" && currentSearch.length === 0;
+    banner.style.display = shouldShowBanner ? "block" : "none";
+
+    if (sections.length === 0) {
+        showNoResultsState();
+        updateCartUI();
+        return;
     }
 
+    sections.forEach((section, index) => {
+        productSections.appendChild(renderProductsSection(section));
+        if (currentCategory === "all" && currentSearch.length === 0 && index === 0) {
+            productSections.appendChild(createExclusiveProduct());
+        }
+    });
+
     updateCartUI();
 }
 
+function renderFilteredCategory(category) {
+    currentCategory = category;
+    applyFiltersAndRender();
+}
+
+function handleBannerSearch() {
+    currentSearch = document.getElementById("nav-search").value.toLowerCase().trim();
+    applyFiltersAndRender();
+}
+
 document.addEventListener("DOMContentLoaded", () => {
+    initializeProductMetadata();
 
-});
+    const wasLoggedIn = localStorage.getItem(AUTH_STORAGE_KEY) === "true";
+    setAuthenticatedView(wasLoggedIn);
 
-function handleBannerSearch() {
-    const query = document.getElementById("nav-search").value.toLowerCase().trim();
-    const productSections = document.getElementById("product-sections");
-    const banner = document.getElementById("homepage-banner");
+    const searchInput = document.getElementById("nav-search");
+    const sortSelect = document.getElementById("sort-products");
+    const modal = document.getElementById("product-modal");
 
-    banner.style.display = "none";
-    productSections.innerHTML = "";
+    if (wasLoggedIn) {
+        applyFiltersAndRender();
+    }
 
-    productData.forEach(section => {
-        const filtered = section.products.filter(product =>
-            product.name.toLowerCase().includes(query)
-        );
-        if (filtered.length > 0) {
-            productSections.appendChild(renderProductsSection({
-                title: section.title,
-                products: filtered
-            }));
+    document.getElementById("password").addEventListener("keydown", (event) => {
+        if (event.key === "Enter") {
+            login();
         }
     });
 
-    updateCartUI();
-}
+    document.getElementById("username").addEventListener("keydown", (event) => {
+        if (event.key === "Enter") {
+            login();
+        }
+    });
 
+    searchInput.addEventListener("keydown", (event) => {
+        if (event.key === "Enter") {
+            handleBannerSearch();
+        }
+    });
 
+    sortSelect.addEventListener("change", (event) => {
+        currentSort = event.target.value;
+        applyFiltersAndRender();
+    });
 
+    modal.addEventListener("click", (event) => {
+        if (event.target.id === "product-modal") {
+            closeModal();
+        }
+    });
 
+    document.addEventListener("keydown", (event) => {
+        if (event.key === "Escape") {
+            closeModal();
+        }
+    });
+});
