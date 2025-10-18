// ===============================================
// 1. SUPABASE CONNECTION & CONFIG
// ===============================================
const SUPABASE_URL = '';
const SUPABASE_ANON_KEY = '';
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const ADMIN_EMAIL = "ADMIN_EMAIL@GMAIL.COM"; /

// 2. SECURITY: Check if user is admin
async function checkAdminStatus() {
    const { data: { session } } = await supabaseClient.auth.getSession();
    const user = session?.user;


    if (!user || user.email !== ADMIN_EMAIL) {
        alert("Access denied. You must be an admin to view this page.");
        window.location.replace('/index.html'); 
        return false;
    }
    return true;
}
// 3. SHARED SIDEBAR LOGIC

document.addEventListener('DOMContentLoaded', () => {
    
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            await supabaseClient.auth.signOut();
            window.location.replace('/index.html');
        });
    }


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


// 4. DASHBOARD PAGE LOGIC (admin/index.html)

async function loadDashboardStats() {
    const isAdmin = await checkAdminStatus();
    if (!isAdmin) return;

    
    const totalRevenueEl = document.getElementById('total-revenue');
    if (!totalRevenueEl) return; /

    const totalOrdersEl = document.getElementById('total-orders');
    const totalProductsEl = document.getElementById('total-products');

    const [ordersResponse, productsResponse] = await Promise.all([
        supabaseClient.from('orders').select('total_price'),
        supabaseClient.from('products').select('id', { count: 'exact' })
    ]);

    
    const totalRevenue = ordersResponse.data.reduce((sum, order) => sum + (order.total_price || 0), 0);
    totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;

    
    totalOrdersEl.textContent = ordersResponse.data.length;

   
    totalProductsEl.textContent = productsResponse.count;
}

if (window.location.pathname.endsWith('/admin/') || window.location.pathname.endsWith('/admin/index.html')) {
    loadDashboardStats();

}
