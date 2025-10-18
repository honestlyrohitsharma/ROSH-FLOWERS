document.addEventListener('DOMContentLoaded', async () => {
    // First, verify the user is an admin
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) return;

    const ordersTableBody = document.querySelector('#orders-table tbody');
    const orderModal = document.getElementById('order-details-modal');
    const closeModalBtn = orderModal.querySelector('.close-button');

    // --- LOAD ALL ORDERS AND PRODUCTS ---
    async function loadOrders() {
        const [ordersResponse, productsResponse] = await Promise.all([
            supabaseClient.from('orders').select('*').order('created_at', { ascending: false }),
            supabaseClient.from('products').select('id, name, price')
        ]);

        const { data: orders, error: ordersError } = ordersResponse;
        const { data: products, error: productsError } = productsResponse;

        if (ordersError || productsError) {
            console.error('Error fetching data:', ordersError || productsError);
            return;
        }

        const productsMap = new Map(products.map(p => [p.id, p]));
        ordersTableBody.innerHTML = '';

        orders.forEach(order => {
            const orderDate = new Date(order.created_at).toLocaleDateString('en-IN');
            const customerName = JSON.parse(order.shipping_address).name;

            // Generate action buttons dynamically
            let actionButtons = '';
            if (order.status !== 'Delivered' && order.status !== 'Spam') {
                actionButtons = `
                    <button class="btn btn-deliver" data-id="${order.id}">Mark Delivered</button>
                    <button class="btn btn-spam" data-id="${order.id}">Mark as Spam</button>
                    <button class="btn btn-delete" data-id="${order.id}">Delete</button>
                `;
            } else if (order.status === 'Spam') {
                actionButtons = `<span class="spam-text">Flagged as Spam</span>`;
            } else {
                actionButtons = 'Completed';
            }

            const row = `
                <tr data-order-id="${order.id}">
                    <td>${orderDate}</td>
                    <td>${customerName}</td>
                    <td>₹${order.total_price || '0.00'}</td>
                    <td>${order.status}</td>
                    <td><button class="btn btn-edit" data-id="${order.id}">View Details</button></td>
                    <td>${actionButtons}</td>
                </tr>`;
            ordersTableBody.insertAdjacentHTML('beforeend', row);
        });

        window.currentOrdersData = orders;
        window.productsMap = productsMap;
    }

    // --- HANDLE TABLE CLICKS ---
    ordersTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const orderId = target.dataset.id;
        if (!orderId) return;

        // MARK AS DELIVERED
        if (target.classList.contains('btn-deliver')) {
            if (confirm('Mark this order as delivered?')) {
                const { error } = await supabaseClient
                    .from('orders')
                    .update({ status: 'Delivered' })
                    .eq('id', orderId);
                if (error) alert('Error: ' + error.message);
                else loadOrders();
            }
        }

        // MARK AS SPAM
        if (target.classList.contains('btn-spam')) {
            if (confirm('Mark this order as SPAM?')) {
                const { error } = await supabaseClient
                    .from('orders')
                    .update({ status: 'Spam' })
                    .eq('id', orderId);
                if (error) alert('Error: ' + error.message);
                else loadOrders();
            }
        }

        // DELETE ORDER
        if (target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to permanently DELETE this order?')) {
                const { error } = await supabaseClient
                    .from('orders')
                    .delete()
                    .eq('id', orderId);
                if (error) alert('Error: ' + error.message);
                else loadOrders();
            }
        }

        // VIEW DETAILS
        if (target.classList.contains('btn-edit')) {
            populateAndShowModal(orderId);
        }
    });

    // --- POPULATE AND SHOW MODAL ---
    function populateAndShowModal(orderId) {
        const order = window.currentOrdersData.find(o => o.id == orderId);
        if (!order) return;

        const address = JSON.parse(order.shipping_address);
        document.getElementById('modal-customer-name').textContent = address.name;
        document.getElementById('modal-customer-phone').textContent = address.phone;
        document.getElementById('modal-customer-address').textContent = `${address.street}, ${address.city}, ${address.pincode}`;
        document.getElementById('modal-order-date').textContent = new Date(order.created_at).toLocaleString('en-IN');
        document.getElementById('modal-total-price').textContent = `₹${order.total_price.toFixed(2)}`;
        document.getElementById('modal-payment-method').textContent = order.payment_method;
        document.getElementById('modal-order-status').textContent = order.status;

        const productsListEl = document.getElementById('modal-products-list');
        productsListEl.innerHTML = '';
        order.order_details.forEach(item => {
            const product = window.productsMap.get(item.id);
            const li = document.createElement('li');
            li.innerHTML = `<span>${item.quantity} × ${product ? product.name : 'Unknown Product'}</span>
                            <strong>₹${(product.price * item.quantity).toFixed(2)}</strong>`;
            productsListEl.appendChild(li);
        });

        orderModal.style.display = 'block';
    }

    // --- CLOSE MODAL LOGIC ---
    closeModalBtn.onclick = () => orderModal.style.display = 'none';
    window.onclick = (e) => { if (e.target == orderModal) orderModal.style.display = 'none'; };

    // Initial Load
    loadOrders();
});
