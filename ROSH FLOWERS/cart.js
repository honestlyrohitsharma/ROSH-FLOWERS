
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';

const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);


// 2. LOCATION CONFIGURATION
const STORE_LAT = 23.3135;
const STORE_LON = 85.3045;

function getDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; const dLat = (lat2-lat1) * Math.PI / 180; const dLon = (lon2-lon1) * Math.PI / 180; const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2); const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); return R * c;
}

// 3. DISPLAY CART ITEMS & DYNAMIC FUNCTIONS
async function displayCartItems() {
    const cartItemsContainer = document.getElementById('cart-items-container'); 
    const totalPriceElement = document.getElementById('total-price'); 
    let cart = JSON.parse(localStorage.getItem('cart')) || []; 

    if (cart.length === 0) { 
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>'; 
        totalPriceElement.textContent = '₹0.00'; 
        document.getElementById('checkout-form').style.display = 'none'; 
        return; 
    } 

    const productIds = cart.map(item => item.id); 
    const { data: products, error } = await supabaseClient.from('products').select('*').in('id', productIds); 
    
    if (error) { 
        console.error('Error fetching cart products:', error); 
        cartItemsContainer.innerHTML = '<p>Could not load your cart.</p>'; 
        return; 
    } 

    cartItemsContainer.innerHTML = ''; 
    let totalPrice = 0; 
    products.forEach(product => { 
        const cartItem = cart.find(item => item.id === product.id); 
        if (!cartItem) return; 

        const itemTotalPrice = product.price * cartItem.quantity; 
        totalPrice += itemTotalPrice; 
        
        const itemElement = document.createElement('div'); 
        itemElement.classList.add('panel'); 
        itemElement.style.marginBottom = '1rem'; 
        itemElement.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px;">
                <div><h4>${product.name}</h4><p class="muted">Price: ₹${product.price} each</p></div>
                <div style="display: flex; align-items: center;">
                    <label>Qty: </label>
                    <input type="number" value="${cartItem.quantity}" min="1" onchange="updateQuantity(${product.id}, this.value)" style="width: 60px; padding: 5px; margin-left: 5px;">
                    <button class="btn" style="background-color:#b91c1c; margin-left:10px;" onclick="removeFromCart(${product.id})">Remove</button>
                </div>
            </div>
            <p style="text-align:right; font-weight:bold; margin-top: 10px;">Subtotal: ₹${itemTotalPrice.toFixed(2)}</p>`; 
        cartItemsContainer.appendChild(itemElement); 
    }); 
    
    totalPriceElement.textContent = `₹${totalPrice.toFixed(2)}`;
}

function updateQuantity(productId, newQuantity) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; 
    const itemToUpdate = cart.find(item => item.id === productId); 
    if (itemToUpdate) { 
        itemToUpdate.quantity = parseInt(newQuantity, 10); 
        if (itemToUpdate.quantity < 1) { itemToUpdate.quantity = 1; } 
    } 
    localStorage.setItem('cart', JSON.stringify(cart)); 
    displayCartItems();
}

function removeFromCart(productId) {
    let cart = JSON.parse(localStorage.getItem('cart')) || []; 
    const updatedCart = cart.filter(item => item.id !== productId); 
    localStorage.setItem('cart', JSON.stringify(updatedCart)); 
    displayCartItems();
}

window.updateQuantity = updateQuantity; 
window.removeFromCart = removeFromCart;

// 4. SIMPLIFIED COD CHECKOUT FLOW
async function handleCheckout(event) {
    event.preventDefault();

    const checkoutBtn = document.getElementById('checkout-btn');
    const checkoutMessage = document.getElementById('checkout-message');
    
    const addressDetails = {
        name: document.getElementById('full-name').value.trim(),
        phone: document.getElementById('phone-number').value.trim(),
        street: document.getElementById('street-address').value.trim(),
        city: document.getElementById('city').value.trim(),
        pincode: document.getElementById('pincode').value.trim(),
    };

    if (Object.values(addressDetails).some(detail => detail === '')) {
        checkoutMessage.textContent = 'Please fill out all address fields.';
        checkoutMessage.style.color = '#b91c1c';
        return;
    }

    checkoutBtn.disabled = true;
    checkoutBtn.textContent = 'Checking location...';

    navigator.geolocation.getCurrentPosition(async (position) => {
        const distance = getDistance(STORE_LAT, STORE_LON, position.coords.latitude, position.coords.longitude);

        if (distance > 5) {
            checkoutMessage.textContent = `Sorry, we only deliver within 5km. You are ${distance.toFixed(1)}km away.`;
            checkoutMessage.style.color = '#b91c1c';
            checkoutBtn.disabled = false;
            checkoutBtn.textContent = 'Place COD Order';
            return;
        }

        checkoutBtn.textContent = 'Placing Order...';
        const { data: { session } } = await supabaseClient.auth.getSession();
        if (!session) { /* handle not logged in */ return; }
      
        let finalPrice = 0;
        const cart = JSON.parse(localStorage.getItem('cart'));
        const productIds = cart.map(item => item.id);
        const { data: products } = await supabaseClient.from('products').select('id, price').in('id', productIds);
        cart.forEach(item => {
            const product = products.find(p => p.id === item.id);
            if(product) finalPrice += product.price * item.quantity;
        });

        const orderData = {
            user_id: session.user.id,
            user_email: session.user.email,
            shipping_address: JSON.stringify(addressDetails),
            order_details: cart,
            payment_method: 'COD',
            total_price: finalPrice
        };

        const { error } = await supabaseClient.from('orders').insert([orderData]);

        if (error) {
            checkoutMessage.textContent = 'There was an error placing your order.';
            checkoutMessage.style.color = '#b91c1c';
            checkoutBtn.disabled = false;
        } else {
            localStorage.removeItem('cart');
            checkoutMessage.textContent = 'Thank you! Your order has been placed successfully.';
            checkoutMessage.style.color = '#065f46';
            document.getElementById('checkout-form').style.display = 'none';
            displayCartItems();
        }

    }, (error) => {
        checkoutMessage.textContent = 'Could not get your location. Please enable location services.';
        checkoutMessage.style.color = '#b91c1c';
        checkoutBtn.disabled = false;
        checkoutBtn.textContent = 'Place COD Order';
    });
}

document.addEventListener('DOMContentLoaded', () => {
    displayCartItems();
    const checkoutForm = document.getElementById('checkout-form');
    if (checkoutForm) {
        checkoutForm.addEventListener('submit', handleCheckout);
    }

});
