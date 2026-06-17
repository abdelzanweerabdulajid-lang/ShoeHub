const STORAGE_CART_KEY = "shoehubCart";
const STORAGE_USERS_KEY = "shoehubUsers";
const STORAGE_AUTH_KEY = "shoehubAuth";
const STORAGE_PROFILE_KEY = "shoehubUser";
const STORAGE_THEME_KEY = "shoehubTheme";
let cart = [];
let total = 0;

function getStoredUsers() {
    return JSON.parse(localStorage.getItem(STORAGE_USERS_KEY) || "{}");
}

function saveStoredUsers(users) {
    localStorage.setItem(STORAGE_USERS_KEY, JSON.stringify(users));
}

function getCart() {
    return JSON.parse(localStorage.getItem(STORAGE_CART_KEY) || "[]");
}

function saveCart(items) {
    localStorage.setItem(STORAGE_CART_KEY, JSON.stringify(items));
}

function recalcCart() {
    total = cart.reduce((sum, item) => sum + item.price, 0);
}

function getAuthenticatedUser() {
    const email = localStorage.getItem(STORAGE_AUTH_KEY);
    if (!email) {
        return null;
    }

    const users = getStoredUsers();
    return users[email] || null;
}

function getStoredTheme() {
    return localStorage.getItem(STORAGE_THEME_KEY) || "dark";
}

function saveTheme(theme) {
    localStorage.setItem(STORAGE_THEME_KEY, theme);
}

function applyTheme(theme) {
    document.body.classList.toggle("light-theme", theme === "light");
    const toggle = document.getElementById("themeToggle");
    if (toggle) {
        toggle.textContent = theme === "light" ? "Dark" : "Light";
    }
}

function toggleTheme() {
    const current = getStoredTheme();
    const next = current === "light" ? "dark" : "light";
    saveTheme(next);
    applyTheme(next);
}

function setCartCount(count) {
    const countEl = document.getElementById("cart-count");
    if (countEl) {
        countEl.textContent = count;
    }
}

function renderCartItems() {
    const cartItems = document.getElementById("cart-items");
    const emptyMessage = document.querySelector(".empty-cart");

    if (!cartItems) {
        return;
    }

    cartItems.innerHTML = "";

    if (cart.length === 0) {
        if (emptyMessage) {
            emptyMessage.style.display = "block";
        }
        return;
    }

    if (emptyMessage) {
        emptyMessage.style.display = "none";
    }

    cart.forEach((item, index) => {
        const li = document.createElement("li");
        li.textContent = `${item.product} - ₱${item.price.toFixed(2)}`;
        cartItems.appendChild(li);
    });
}

function updateCartUI() {
    const totalElement = document.getElementById("total");

    if (totalElement) {
        totalElement.textContent = total.toFixed(2);
    }

    setCartCount(cart.length);
    renderCartItems();
}

function logoutUser() {
    localStorage.removeItem(STORAGE_AUTH_KEY);
    alert("You have been logged out.");
    window.location.reload();
}

function renderHeaderState() {
    const navButtons = document.querySelector(".nav-buttons");
    if (!navButtons) {
        return;
    }

    const currentUser = getAuthenticatedUser();
    navButtons.innerHTML = "";

    if (currentUser) {
        const welcomeBtn = document.createElement("button");
        welcomeBtn.type = "button";
        welcomeBtn.className = "nav-welcome";
        welcomeBtn.textContent = `Hi, ${currentUser.fullName}`;

        const logoutBtn = document.createElement("button");
        logoutBtn.type = "button";
        logoutBtn.textContent = "Logout";
        logoutBtn.onclick = logoutUser;

        navButtons.appendChild(welcomeBtn);
        navButtons.appendChild(logoutBtn);
    } else {
        const loginBtn = document.createElement("button");
        loginBtn.type = "button";
        loginBtn.textContent = "Login";
        loginBtn.onclick = () => window.location.href = "login.html";

        const registerBtn = document.createElement("button");
        registerBtn.type = "button";
        registerBtn.className = "register";
        registerBtn.textContent = "Register";
        registerBtn.onclick = () => window.location.href = "register.html";

        navButtons.appendChild(loginBtn);
        navButtons.appendChild(registerBtn);
    }
}

function addToCart(product, price, button) {
    cart = getCart();
    cart.push({ product, price });
    saveCart(cart);
    recalcCart();
    updateCartUI();
    showCheckoutPrompt();

    if (button) {
        const originalText = button.textContent;
        button.textContent = "Added!";
        button.classList.add("added");
        setTimeout(() => {
            button.textContent = originalText;
            button.classList.remove("added");
        }, 1000);
    }

    const badge = document.getElementById("cart-count");
    if (badge) {
        badge.classList.add("pulse");
        setTimeout(() => badge.classList.remove("pulse"), 400);
    }
}

function goToCheckout() {
    window.location.href = "checkout.html";
}

function buyNow(product, price) {
    cart = getCart();
    cart.push({ product, price });
    saveCart(cart);
    recalcCart();
    updateCartUI();
    window.location.href = "checkout.html";
}

function showCheckoutPrompt() {
    const prompt = document.getElementById("checkoutPrompt");
    if (!prompt) return;

    const count = cart.length;
    const promptLabel = document.getElementById("promptItemCount");
    if (promptLabel) {
        promptLabel.textContent = `${count} item${count === 1 ? "" : "s"} in your bag`;
    }

    prompt.style.display = "flex";
    prompt.classList.add("visible");
    clearTimeout(window.checkoutPromptTimeout);
    window.checkoutPromptTimeout = setTimeout(() => {
        prompt.style.display = "none";
        prompt.classList.remove("visible");
    }, 4200);
}

function showOrderConfirmation(customer, paymentMethod, orderItems, totalAmount) {
    const modal = document.getElementById("orderModal");
    if (!modal) return;

    document.getElementById("modalCustomerName").textContent = customer;
    document.getElementById("modalPaymentMethod").textContent = paymentMethod;
    document.getElementById("modalTotalAmount").textContent = totalAmount.toFixed(2);

    const itemsList = document.getElementById("modalOrderItems");
    itemsList.innerHTML = "";
    orderItems.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `<span>${item.product}</span><span>₱${item.price.toFixed(2)}</span>`;
        itemsList.appendChild(li);
    });

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
}

function closeOrderModal() {
    const modal = document.getElementById("orderModal");
    if (modal) {
        modal.style.display = "none";
        document.body.style.overflow = "auto";
        window.location.href = "index.html";
    }
}

function checkout() {
    cart = getCart();
    recalcCart();

    if (cart.length === 0) {
        alert("Your cart is empty!");
        return;
    }

    const currentUser = getAuthenticatedUser();
    if (!currentUser) {
        const goLogin = confirm("You must be logged in to complete checkout. Go to login?");
        if (goLogin) {
            window.location.href = "login.html";
        }
        return;
    }

    const paymentMethod = document.getElementById("payment")?.value || "Not selected";
    const orderItems = [...cart];

    showOrderConfirmation(currentUser.fullName, paymentMethod, orderItems, total);

    cart = [];
    total = 0;
    saveCart(cart);
    updateCartUI();
}

function saveProfile() {
    const usernameInput = document.getElementById("username");
    if (!usernameInput) {
        return;
    }

    const name = usernameInput.value.trim();
    if (name === "") {
        alert("Please enter your name.");
        return;
    }

    localStorage.setItem(STORAGE_PROFILE_KEY, name);
    alert("Profile Saved!");
}

function registerUser(event) {
    event.preventDefault();

    const username = document.getElementById("username")?.value.trim();
    const email = document.getElementById("email")?.value.trim().toLowerCase();
    const password = document.getElementById("password")?.value;
    const confirmPassword = document.getElementById("confirmPassword")?.value;

    if (!username || !email || !password || !confirmPassword) {
        alert("Please fill in all registration fields.");
        return;
    }

    if (password !== confirmPassword) {
        alert("Passwords do not match. Please try again.");
        return;
    }

    const users = getStoredUsers();
    if (users[email]) {
        alert("An account with this email already exists.");
        return;
    }

    const usernameTaken = Object.values(users).some((user) => user.username?.toLowerCase() === username.toLowerCase());
    if (usernameTaken) {
        alert("That username is already taken. Please choose another.");
        return;
    }

    users[email] = {
        username,
        fullName: username,
        email,
        password,
    };
    saveStoredUsers(users);
    localStorage.setItem(STORAGE_AUTH_KEY, email);

    alert("Registration successful! You are now logged in.");
    window.location.href = "index.html";
}

function loginUser(event) {
    event.preventDefault();

    const identifier = document.getElementById("identifier")?.value.trim();
    const password = document.getElementById("password")?.value;

    if (!identifier || !password) {
        alert("Please enter your email/username and password.");
        return;
    }

    const users = getStoredUsers();
    const lookupKey = identifier.toLowerCase();
    let user = users[lookupKey];

    if (!user) {
        user = Object.values(users).find((item) =>
            item.email.toLowerCase() === lookupKey ||
            item.username?.toLowerCase() === lookupKey ||
            item.fullName?.toLowerCase() === lookupKey
        );
    }

    if (!user || user.password !== password) {
        alert("Invalid login credentials. Please try again.");
        return;
    }

    localStorage.setItem(STORAGE_AUTH_KEY, user.email);
    alert(`Welcome back, ${user.fullName || user.username}!`);
    window.location.href = "index.html";
}

function getSearchQuery() {
    return document.getElementById("searchInput")?.value.trim().toLowerCase() || "";
}

function setSearchMessage(text) {
    const message = document.getElementById("searchMessage");
    if (message) {
        message.textContent = text;
    }
}

function searchProduct() {
    applyProductFilters();
}

function subscribe() {
    const email = document.getElementById("email")?.value;
    if (!email || email.trim() === "") {
        alert("Please enter your email.");
        return;
    }

    alert("Thank you for subscribing to ShoeHub!");
}

function loadSavedProfile() {
    const savedUser = localStorage.getItem(STORAGE_PROFILE_KEY);
    if (savedUser) {
        const usernameInput = document.getElementById("username");
        if (usernameInput) {
            usernameInput.value = savedUser;
        }
    }
}

function applyProductFilters() {
    const category = document.getElementById("categoryFilter")?.value || "All";
    const minPriceRaw = document.getElementById("minPriceFilter")?.value;
    const maxPriceRaw = document.getElementById("maxPriceFilter")?.value;
    const sort = document.getElementById("sortFilter")?.value || "name-asc";
    const query = getSearchQuery();
    const minPrice = minPriceRaw ? Math.max(0, Number(minPriceRaw)) : 0;
    const maxPrice = maxPriceRaw ? Math.max(minPrice, Number(maxPriceRaw)) : Infinity;
    const productGrid = document.querySelector(".product-grid");
    const cards = Array.from(document.querySelectorAll(".product-card"));

    let visibleCount = 0;

    cards.forEach((card) => {
        const cardCategory = (card.dataset.category || "").toLowerCase();
        const cardPrice = Number(card.dataset.price) || 0;
        const title = card.querySelector("h3")?.textContent.toLowerCase() || "";
        const description = card.querySelector("p")?.textContent.toLowerCase() || "";
        const altText = card.querySelector("img")?.alt.toLowerCase() || "";
        const matchesSearch = !query || title.includes(query) || description.includes(query) || cardCategory.includes(query) || altText.includes(query);
        const matchesCategory = category === "All" || cardCategory === category.toLowerCase();
        const matchesMin = cardPrice >= minPrice;
        const matchesMax = cardPrice <= maxPrice;
        const showCard = matchesSearch && matchesCategory && matchesMin && matchesMax;

        card.style.display = showCard ? "grid" : "none";
        if (showCard) {
            visibleCount += 1;
        }
    });

    if (productGrid) {
        const visibleCards = cards.filter((card) => card.style.display !== "none");
        visibleCards.sort((a, b) => {
            const aPrice = Number(a.dataset.price) || 0;
            const bPrice = Number(b.dataset.price) || 0;
            const aName = a.querySelector("h3")?.textContent || "";
            const bName = b.querySelector("h3")?.textContent || "";

            if (sort === "price-asc") return aPrice - bPrice;
            if (sort === "price-desc") return bPrice - aPrice;
            if (sort === "name-desc") return bName.localeCompare(aName);
            return aName.localeCompare(bName);
        });

        visibleCards.forEach((card) => productGrid.appendChild(card));
    }

    if (!query) {
        setSearchMessage("Search by name, brand, or category.");
    } else if (visibleCount === 0) {
        setSearchMessage("No matching shoes found. Try a different name or category.");
    } else {
        setSearchMessage(`Showing ${visibleCount} result${visibleCount === 1 ? "" : "s"}.`);
    }
}

function clearProductFilters() {
    const categoryFilter = document.getElementById("categoryFilter");
    const minPriceFilter = document.getElementById("minPriceFilter");
    const maxPriceFilter = document.getElementById("maxPriceFilter");
    const sortFilter = document.getElementById("sortFilter");
    const searchInput = document.getElementById("searchInput");

    if (categoryFilter) categoryFilter.value = "All";
    if (minPriceFilter) minPriceFilter.value = "";
    if (maxPriceFilter) maxPriceFilter.value = "";
    if (sortFilter) sortFilter.value = "name-asc";
    if (searchInput) searchInput.value = "";
    applyProductFilters();
}

function attachPageHandlers() {
    const themeToggle = document.getElementById("themeToggle");
    if (themeToggle) {
        themeToggle.addEventListener("click", toggleTheme);
    }

    const filterElements = [
        document.getElementById("categoryFilter"),
        document.getElementById("minPriceFilter"),
        document.getElementById("maxPriceFilter"),
        document.getElementById("sortFilter"),
    ];

    filterElements.forEach((element) => {
        if (element) {
            element.addEventListener("change", applyProductFilters);
        }
    });

    const clearFiltersBtn = document.getElementById("clearFilters");
    if (clearFiltersBtn) {
        clearFiltersBtn.addEventListener("click", clearProductFilters);
    }

    const searchInput = document.getElementById("searchInput");
    if (searchInput) {
        searchInput.addEventListener("keydown", (event) => {
            if (event.key === "Enter") {
                event.preventDefault();
                searchProduct();
            }
        });
    }

    applyTheme(getStoredTheme());
    applyProductFilters();
}

function renderPageState() {
    cart = getCart();
    recalcCart();
    updateCartUI();
    loadSavedProfile();
    renderHeaderState();
    attachPageHandlers();
}

window.addEventListener("DOMContentLoaded", renderPageState);
