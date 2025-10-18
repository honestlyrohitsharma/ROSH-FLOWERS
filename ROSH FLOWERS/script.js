// 1. CONNECT TO YOUR SUPABASE DATABASE
const SUPABASE_URL = 'SUPABASE_PRO_URL';
const SUPABASE_ANON_KEY = 'ANON_KEY';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. FETCH AND DISPLAY PRODUCTS (WITH SEARCH)
async function fetchAndDisplayProducts(searchTerm = '') {
    const productsContainer = document.querySelector(".products");
    if (!productsContainer) return;
    productsContainer.innerHTML = '<p>Searching for flowers...</p>';

    let query = supabaseClient.from('products').select('*');


    if (searchTerm) {
        
        query = query.ilike('name', `%${searchTerm}%`);
    }

    const { data, error } = await query;

    if (error) {
        console.error("Error fetching products:", error);
        productsContainer.innerHTML = '<p>Could not find flowers. Please try again.</p>';
        return;
    }

    if (data.length === 0) {
        productsContainer.innerHTML = '<p>No flowers found matching your search.</p>';
        return;
    }

    productsContainer.innerHTML = ''; 
    data.forEach(product => {
        const card = document.createElement('article');
        card.classList.add('card');
        card.setAttribute('data-category', product.category);
        card.innerHTML = `
            <div class="thumb" role="img" style="background-image: url('${product.image_url}')" aria-label="${product.name}"></div>
            <h3>${product.name}</h3>
            <p class="muted">${product.description} • ${product.category}</p>
            <p class="price">₹${product.price}</p> 
            <button class="btn btn-accent" onclick="addToCart(${product.id}, '${product.name}')">Add to Cart</button>
        `;
        productsContainer.appendChild(card);
    });
}
// 3. FETCH AND DISPLAY REVIEWS
async function fetchAndDisplayReviews() {
    const reviewsPanel = document.getElementById('reviews-panel');
    if (!reviewsPanel) return;

    const { data, error } = await supabaseClient.from('reviews').select('*').order('created_at', { ascending: false });

    if (error || !data || data.length === 0) {
        const title = reviewsPanel.querySelector('h3').outerHTML;
        reviewsPanel.innerHTML = title + '<p>No reviews yet.</p>'; 
        return;
    }
    
    
    const title = reviewsPanel.querySelector('h3').outerHTML;
    reviewsPanel.innerHTML = title;

    data.forEach(review => {
        const blockquote = document.createElement('blockquote');
        blockquote.className = 'quote';
        blockquote.innerHTML = `
            “${review.quote}”
            <footer>— ${review.customer_name}</footer>
        `;
        reviewsPanel.appendChild(blockquote);
    });
}

// 4. SHOPPING CART
function addToCart(productId, productName) {
    let cart = JSON.parse(localStorage.getItem('cart')) || [];
    const existingProduct = cart.find(item => item.id === productId);

    if (existingProduct) {
        existingProduct.quantity++;
    } else {
        cart.push({ id: productId, quantity: 1 });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    alert(`"${productName}" was added to your cart!`);
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const cartCountElement = document.getElementById('cart-count');
    if (cartCountElement) {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = `(${totalItems})`;
        cartCountElement.style.display = totalItems > 0 ? 'inline' : 'none';
    }
}

// 5. USER AUTHENTICATION
async function signInWithGoogle() {
    await supabaseClient.auth.signInWithOAuth({ provider: 'google' });
}

async function signOut() {
    await supabaseClient.auth.signOut();
    localStorage.removeItem('cart'); 
    updateCartCount();
}

function updateUserUI(user) {
    const userNav = document.getElementById('user-nav');
    if (!userNav) return;
    if (user) {
        userNav.innerHTML = `<li><span class="user-email">${user.email}</span></li><li><a href="/cart.html">Cart <span id="cart-count"></span></a></li><li><button id="logout-btn" class="btn btn-accent">Logout</button></li>`;
        document.getElementById('logout-btn').addEventListener('click', signOut);
    } else {
        userNav.innerHTML = `<li><button id="login-btn" class="btn">Login with Google</button></li>`;
        document.getElementById('login-btn').addEventListener('click', signInWithGoogle);
    }
    updateCartCount();
}

// 6. INITIALIZE PAGE AND EVENT LISTENERS
document.addEventListener('DOMContentLoaded', () => {
    fetchAndDisplayProducts();
    fetchAndDisplayReviews();
    
    const searchForm = document.getElementById('search-form');
    const searchInput = document.getElementById('search-input');

    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        fetchAndDisplayProducts(searchInput.value.trim());
    });

    
    searchInput.addEventListener('input', () => {
        if (searchInput.value.trim() === '') {
            fetchAndDisplayProducts();
        }
    });
    supabaseClient.auth.onAuthStateChange((_event, session) => {
        updateUserUI(session?.user);
    });

    // Initialize footer year
    const yearEl = document.getElementById("year");
    if (yearEl) yearEl.textContent = new Date().getFullYear();

});
