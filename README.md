# 🍽️ Bistro Boss Restaurant Server

The robust backend powerhouse for the Bistro Boss Restaurant application. Built with **Node.js**, **Express.js**, and **MongoDB**, this server handles secure authentication, payment processing, and complex data management.

**Live Server URL:** [https://bistro-boss-server-pi-mocha.vercel.app](https://bistro-boss-server-pi-mocha.vercel.app)

---

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (NoSQL)
- **Security:** JSON Web Token (JWT)
- **Payments:** Stripe
- **Deployment:** Vercel

---

## ✨ Core Features

- **🔐 JWT Authentication:** Implements secure, token-based authentication for protected routes.
- **🛡️ Admin Middleware:** Custom middleware to verify admin roles, ensuring sensitive operations (like adding/deleting menu items) are restricted.
- **💳 Stripe Integration:** Securely processes payment intents and handles transaction records.
- **📁 CRUD Operations:** Complete management of Menu items, User profiles, Cart data, and Reviews.
- **📊 Admin Statistics:** Aggregates database data to provide insights on total revenue, total users, and order counts.

---

## 🔌 API Endpoints

### Public Routes
- `GET /menu` - Fetch all menu items.
- `GET /reviews` - Fetch all customer reviews.
- `POST /users` - Create a new user profile.

### User Routes (Protected)
- `GET /carts` - Get cart items for a specific user.
- `POST /carts` - Add an item to the cart.
- `POST /payments` - Process payment and save transaction history.

### Admin Routes (Protected + Admin Verify)
- `GET /users/admin/:email` - Check if a user has admin privileges.
- `PATCH /users/admin/:id` - Promote a user to Admin role.
- `POST /menu` - Add a new menu item.
- `DELETE /menu/:id` - Remove a menu item.
- `GET /admin-stats` - Get summary of revenue, users, and products.

---

## 🚀 Local Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/sumon3235/bistro-boss-server.git](https://github.com/sumon3235/bistro-boss-server.git)
   cd bistro-boss-server
Install dependencies:

Bash
npm install
Configure Environment Variables:
Create a .env file in the root directory and add the following:

Code snippet
DB_USER=your_mongodb_username
DB_PASS=your_mongodb_password
ACCESS_TOKEN_SECRET=your_jwt_secret_key
STRIPE_SECRET_KEY=your_stripe_secret_key
Start the server:

Bash
npm start


---

## 👨‍💻 Developer

**Md Rifat Bin Sumon**  
Junior Frontend Developer | MERN Stack Enthusiast

[![GitHub](https://img.shields.io/badge/GitHub-100000?style=flat&logo=github&logoColor=white)](https://github.com/sumon3235)