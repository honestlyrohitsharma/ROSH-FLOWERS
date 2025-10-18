// ===============================================
// 1. SUPABASE CONNECTION & CONFIG
// ===============================================
const SUPABASE_URL = 'https://rjefehuahgdqhtnofnrs.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqZWZlaHVhaGdkcWh0bm9mbnJzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA0MTg4NzgsImV4cCI6MjA3NTk5NDg3OH0.MT7B0s023uBp8D4HWM8VfUA0DNnYXBNFlbRoLzDmroM';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_EMAIL = "roshinfo25@gmail.com"; // Your admin email

// ===============================================
// 2. SECURITY: Check if user is admin
// ===============================================
// This function is defined globally so other scripts can use it
async function checkAdminStatus() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const user = session?.user;

    // If no user or not the admin, redirect away from the admin area
    if (!user || user.email !== ADMIN_EMAIL) {
        alert("Access denied. You must be an admin to view this page.");
        window.location.replace('/index.html'); // Use replace to prevent going back
        return false;
    }
    return true; // User is verified admin
}

// ===============================================
// 3. SHARED SIDEBAR LOGIC
// ===============================================
document.addEventListener('DOMContentLoaded', () => {
    // Logout Button
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.replace('/index.html');
        });
    }

    // Theme Toggle
    const themeToggleBtn = document.getElementById('theme-toggle');
    const htmlElement = document.documentElement;
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme) {
        htmlElement.setAttribute('data-theme', savedTheme);
    }

    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            let currentTheme = htmlElement.getAttribute('data-theme');
            if (currentTheme === 'dark') {
                htmlElement.setAttribute('data-theme', 'light');
                localStorage.setItem('theme', 'light');
            } else {
                htmlElement.setAttribute('data-theme', 'dark');
                localStorage.setItem('theme', 'dark');
            }
        });
    }
});

// ===============================================
// 4. DASHBOARD PAGE LOGIC (admin/index.html)
// ===============================================
async function loadDashboardStats() {
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) return;

    // Check if we are on the dashboard page by looking for a specific element
    const totalRevenueEl = document.getElementById('total-revenue');
    if (!totalRevenueEl) return; // Exit if not on the dashboard page

    const totalOrdersEl = document.getElementById('total-orders');
    const totalProductsEl = document.getElementById('total-products');

    // Fetch all data in parallel
    const [ordersResponse, productsResponse] = await Promise.all([
        supabaseClient.from('orders').select('total_price'),
        supabaseClient.from('products').select('id', { count: 'exact' })
    ]);

    // Calculate and display revenue
    const totalRevenue = ordersResponse.data.reduce((sum, order) => sum + (order.total_price || 0), 0);
    totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;

    // Display total orders
    totalOrdersEl.textContent = ordersResponse.data.length;

    // Display total products
    totalProductsEl.textContent = productsResponse.count;
}

// Run the dashboard loader only on the correct page
if (window.location.pathname.endsWith('/admin/') || window.location.pathname.endsWith('/admin/index.html')) {
    loadDashboardStats();
}