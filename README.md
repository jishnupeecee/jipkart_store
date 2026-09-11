# Jipkart 🏗️

A hyperlocal e-commerce marketplace for building materials — inspired by Flipkart's model, built for a local construction-supplies business. Includes **Customer**, **Seller**, and **Admin** logins, full product management, a shopping cart, and checkout flow.

---

## Features

- **Storefront** — homepage, category browsing, product listing with search/sort/filter, individual product pages
- **Customer accounts** — register/login, add to cart, checkout, view order history
- **Seller accounts** — register/login, seller dashboard, add/edit/delete their own products, view orders containing their items
- **Admin accounts** — full dashboard with platform stats, manage **all** products (any seller), manage users, view and update order statuses
- **Data persistence** — orders, products, and users are saved to a local JSON file (`data/db.json`), so your data survives server restarts
- No external database required — runs entirely on your PC

---

## Requirements

- [Node.js](https://nodejs.org) version 16 or higher (includes `npm`). Check with:
  ```
  node -v
  npm -v
  ```

---

## Setup & Run (Windows / Mac / Linux)

1. **Unzip** this project folder anywhere on your PC.
2. Open a terminal / command prompt **inside the `jipkart` folder**.
3. Install dependencies:
   ```
   npm install
   ```
4. Start the server:
   ```
   npm start
   ```
5. You'll see:
   ```
   Jipkart is running!
   Open your browser at: http://localhost:3000
   ```
6. Open **http://localhost:3000** in your browser. That's it!

To stop the server, press `Ctrl + C` in the terminal.

---

## Demo Logins

The app comes pre-seeded with one account of each type and 22 sample products.

| Role     | Email                     | Password      |
|----------|----------------------------|---------------|
| Admin    | admin@jipkart.com          | admin123      |
| Seller   | seller@jipkart.com         | seller123     |
| Customer | customer@jipkart.com       | customer123   |

You can also register brand-new **Customer** or **Seller** accounts from the Sign Up page (choose the account type at the top of the form). New Admin accounts cannot be created through the UI for security — only the seeded admin account exists unless you edit `data/db.json` directly.

---

## How the roles work

- **Customer** — browses `/products`, adds items to cart, checks out with a delivery address (Cash on Delivery or Online), and can view past orders under "My Orders".
- **Seller** — after logging in, lands on `/seller/dashboard`, where they can add new products, edit/delete their own listings, and see orders that include their products. Sellers can only manage their own products, not other sellers'.
- **Admin** — lands on `/admin/dashboard` with site-wide stats. Can add/edit/delete **any** product regardless of seller, manage/delete user accounts, and update order statuses (Placed → Confirmed → Shipped → Delivered/Cancelled).

---

## Project structure

```
jipkart/
├── server.js              # App entry point
├── package.json
├── data/
│   └── db.json             # All data lives here (auto-created/seeded on first run)
├── middleware/
│   └── auth.js             # Login & role-based access control
├── routes/
│   ├── auth.js              # Login / Register / Logout
│   ├── main.js               # Home, product listing, product detail
│   ├── cart.js                # Cart, checkout, orders
│   ├── seller.js              # Seller dashboard & product CRUD
│   └── admin.js                # Admin dashboard, product/user/order management
├── utils/
│   └── db.js                # JSON-file data access layer
├── views/                   # EJS templates (all pages)
└── public/css/style.css     # Styling
```

---
---

## Notes & things you may want to customize

- **Product images** currently use placeholder URLs (picsum.photos). When adding/editing a product as a Seller or Admin, you can paste in any image URL you like.
- **Payments** are simulated — "Online Payment" doesn't connect to a real payment gateway; it simply records the order. Wire up Razorpay/Stripe later if you want real payments.
- **Data storage**: this uses a simple JSON file rather than a full database, which keeps setup to a single `npm install`. If you outgrow this (many concurrent users, need transactions, etc.), you can swap `utils/db.js` for a real database like PostgreSQL/MongoDB — the route files call a small, consistent API (`getProducts`, `createOrder`, etc.) so the swap is contained to that one file.
- **Session secret**: `server.js` uses a hardcoded session secret suitable for local development only. Change it before deploying anywhere public.
- To **reset all data** back to the original demo seed, stop the server, delete `data/db.json`, and restart — it will regenerate automatically.

---

## Troubleshooting

- **"Port 3000 already in use"** — another app is using that port. Either close it, or run `PORT=4000 npm start` (Mac/Linux) or `set PORT=4000 && npm start` (Windows) and visit `http://localhost:4000` instead.
- **`npm install` fails** — make sure Node.js is installed and up to date (v16+).
- **Blank/broken styling** — make sure you're accessing the site via `http://localhost:3000` (not by opening the HTML files directly).
