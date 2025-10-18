document.addEventListener('DOMContentLoaded', async () => {
    // First, verify the user is an admin
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) return;

    // Get all necessary elements from the DOM
    const productsTableBody = document.querySelector('#products-table tbody');
    const addProductForm = document.getElementById('add-product-form');
    const editModal = document.getElementById('edit-modal');
    const editProductForm = document.getElementById('edit-product-form');
    const closeModalBtn = document.querySelector('.close-button');

    // --- LOAD ALL PRODUCTS ---
    async function loadProducts() {
        const { data: products, error } = await supabaseClient.from('products').select('*').order('name');
        if (error) {
            console.error('Error fetching products:', error);
            return;
        }

        productsTableBody.innerHTML = ''; // Clear table before populating
        products.forEach(product => {
            const row = `
                <tr>
                    <td>${product.name}</td>
                    <td>${product.category}</td>
                    <td>₹${product.price}</td>
                    <td>
                        <button class="btn btn-edit" data-id="${product.id}">Edit</button>
                        <button class="btn btn-delete" data-id="${product.id}">Delete</button>
                    </td>
                </tr>`;
            productsTableBody.insertAdjacentHTML('beforeend', row);
        });
    }

    // --- ADD NEW PRODUCT ---
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newProduct = {
            name: document.getElementById('name').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            price: document.getElementById('price').value,
            image_url: document.getElementById('image_url').value,
        };

        const { error } = await supabaseClient.from('products').insert([newProduct]);
        if (error) {
            alert('Error adding product: ' + error.message);
        } else {
            alert('Product added successfully!');
            addProductForm.reset();
            loadProducts(); // Refresh the product list
        }
    });

    // --- EDIT & DELETE LOGIC ---
    productsTableBody.addEventListener('click', async (e) => {
        const target = e.target;
        const productId = target.dataset.id;
        if (!productId) return;

        // DELETE product
        if (target.classList.contains('btn-delete')) {
            if (confirm('Are you sure you want to delete this product?')) {
                const { error } = await supabaseClient.from('products').delete().eq('id', productId);
                if (error) alert('Error deleting product: ' + error.message);
                else loadProducts();
            }
        }

        // EDIT product (Open Modal)
        if (target.classList.contains('btn-edit')) {
            const { data: product, error } = await supabaseClient.from('products').select('*').eq('id', productId).single();
            if (error) {
                alert('Could not fetch product details.');
                return;
            }
            // Populate modal form with product data
            document.getElementById('edit-id').value = product.id;
            document.getElementById('edit-name').value = product.name;
            document.getElementById('edit-description').value = product.description;
            document.getElementById('edit-category').value = product.category;
            document.getElementById('edit-price').value = product.price;
            document.getElementById('edit-image_url').value = product.image_url;
            editModal.style.display = 'block';
        }
    });

    // --- SAVE CHANGES FROM EDIT MODAL ---
    editProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const productId = document.getElementById('edit-id').value;
        const updatedProduct = {
            name: document.getElementById('edit-name').value,
            description: document.getElementById('edit-description').value,
            category: document.getElementById('edit-category').value,
            price: document.getElementById('edit-price').value,
            image_url: document.getElementById('edit-image_url').value,
        };

        const { error } = await supabaseClient.from('products').update(updatedProduct).eq('id', productId);
        if (error) {
            alert('Error updating product: ' + error.message);
        } else {
            editModal.style.display = 'none';
            loadProducts();
        }
    });

    // --- CLOSE MODAL ---
    closeModalBtn.onclick = () => editModal.style.display = 'none';
    window.onclick = (e) => { if (e.target == editModal) editModal.style.display = 'none'; };

    // Initial load of products when page is ready
    loadProducts();
});