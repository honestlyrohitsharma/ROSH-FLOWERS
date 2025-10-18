# ROSH-FLOWERS
ROSH FLOWERS: Local e-commerce site (Ranchi). Features dynamic products, search, reviews, Google login, location-restricted COD checkout, admin panel. Built with HTML, CSS, vanilla JS, Supabase, Netlify.

# ROSH FLOWERS - E-commerce Website 💐

A functional e-commerce website for **ROSH FLOWERS**, a local flower shop specializing in deliveries within Ranchi. This project demonstrates a complete front-to-back solution using modern, free-tier services.

**[Live Demo](https://neon-cendol-05bc44.netlify.app/)** 🔗

## Screenshots

*(It's highly recommended to add screenshots of your storefront, cart page, and admin panel here. You can drag and drop images directly onto the GitHub README editor.)*

## Features

**Customer Facing:**
* **Dynamic Product Loading:** Fetches flower products directly from the Supabase database.
* **Search Functionality:** Allows users to search for specific flowers by name.
* **Category Filtering:** Buttons to filter flowers by category (e.g., Bouquets, Potted Plants).
* **Add to Cart:** Users can add items with quantity tracking (stored in `localStorage`).
* **Shopping Cart Page:** View cart items, update quantities, remove items.
* **COD Checkout:** Secure checkout process for Cash on Delivery.
* **5km Location Restriction:** Uses browser geolocation to ensure the customer is within the delivery radius (centered around Dhurwa, Ranchi) before allowing checkout.
* **Dynamic Reviews:** Displays customer reviews fetched from the database.
* **Secure Google Login:** Uses Supabase Auth for easy and secure user authentication.
* **Responsive Design:** Basic responsiveness for different screen sizes.

**Admin Panel (`/admin.html`):**
* **Secure Access:** Only accessible to the designated admin email (`roshinfo25@gmail.com`) via Google Login.
* **Add Products:** Form to add new flower products (name, description, price, image URL, category).
* **Add Reviews:** Form to add new customer testimonials.
* **View Orders:** Displays a list of recent customer orders.

## Tech Stack

* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Backend & Database:** [Supabase](https://supabase.com) (PostgreSQL Database, Authentication, Row Level Security)
* **Hosting:** [Netlify](https://netlify.com)

## Setup & Configuration

To run or modify this project, you'll need to configure your own Supabase instance:

1.  **Clone the Repository:**
    ```bash
    git clone [https://github.com/honestlyrohitsharma/ROSH-FLOWERS.git](https://github.com/honestlyrohitsharma/ROSH-FLOWERS.git)
    cd ROSH-FLOWERS
    ```
2.  **Create Supabase Project:** Go to [Supabase](https://supabase.com) and create a new free-tier project.
3.  **Database Setup:** Go to the SQL Editor in your Supabase project and run the setup script (found in previous instructions or `setup.sql` if you create one) to create the `products`, `reviews`, and `orders` tables with appropriate Row Level Security policies. Ensure RLS is enabled on all tables.
4.  **Get API Keys:** In your Supabase project settings (API section), find your **Project URL** and **`anon` (public) key**.
5.  **Update JS Files:** Paste your Supabase URL and Anon Key into the top of these files:
    * `script.js`
    * `cart.js`
    * `admin.js`
6.  **Configure Google Auth:**
    * In Supabase (Authentication > Providers > Google), enable Google Auth and copy the **Callback URL**.
    * In [Google Cloud Console](https://console.cloud.google.com/), create or use an existing OAuth 2.0 Client ID. Add your Supabase **Callback URL** to the "Authorised redirect URIs".
    * Copy the **Client ID** and **Client Secret** from Google Cloud Console and paste them into the Supabase Google Provider settings.
    * In Supabase (Authentication > URL Configuration), set the **Site URL** to your Netlify deployment URL (e.g., `https://your-site-name.netlify.app`).
7.  **Set Admin Email:** In `admin.js`, update the `ADMIN_EMAIL` constant to the Google email address you want to use for admin access.
8.  **Run Locally (Optional):** Use a simple live server extension (like VS Code's Live Server) to view the `index.html` file.

## Deployment

This project is deployed on Netlify. Changes pushed to the `main` branch of this repository *could* be configured for automatic deployment via Netlify's Git integration, or deployed manually by drag-and-drop.

Current live deployment: **[https://neon-cendol-05bc44.netlify.app/](https://neon-cendol-05bc44.netlify.app/)**

## License

*(This project does not currently have a license specified. Consider adding one like MIT if you want others to freely use or contribute.)*
