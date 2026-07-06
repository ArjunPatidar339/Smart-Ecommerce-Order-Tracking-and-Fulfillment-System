# ShopHub — User Manual & Guide Sheet
### Complete Step-by-Step Guide for All Roles · 2026

---

## 📋 Project Overview

| Property | Value |
| :--- | :--- |
| **Project** | **ShopHub — Ecommerce Order Tracking System** |
| **Backend** | Java 21 + Spring Boot 3.x + Spring Security 6 + JWT |
| **Frontend** | React 18 + Vite + FontAwesome |
| **Database** | MySQL (Production) / H2 (Development) |
| **Deployment** | Localhost:5173 (Frontend) / Localhost:8080 (Backend) |
| **License** | Academic Project — Medicaps University, Indore |
| **Team Members** | [Student Name 1] · [Student Name 2] · [Student Name 3] |

---

## 🚀 1. Getting Started

### 1.1 Accessing the Application
1.  Open your browser and navigate to the application URL: `http://localhost:5173`.
2.  The **Landing Page** appears with a premium "ShopHub" branding and a featured product showcase.
3.  Click **Login / Sign Up** in the header to access your account.

### 1.2 Logging In
1.  Enter your registered **Email address**.
2.  Enter your **Password**.
3.  Click **Sign In**.
4.  **Security Note:** Your session is secured using **JWT (JSON Web Token)**. If you remain inactive for a long period, you will be automatically redirected to the login page for security.

### 1.3 Creating an Account
1.  Click the **"Don't have an account? Sign up"** link on the login page.
2.  Fill in the registration form:
    *   **Full Name**
    *   **Email Address**
    *   **Phone Number** (Required for order validation)
    *   **Address**
    *   **Password**
3.  Select your role (User/Admin). *Note: In production, Admin roles are typically assigned by an existing administrator.*
4.  Click **Register**.

---

## 🛒 2. Customer Guide (ROLE_USER)

### 2.1 Browsing & Searching
*   **Home Page**: Explore featured categories and trending products.
*   **Search**: Use the search bar in the header to find products by name or category.
*   **Filters**: Sort products by price or popularity to find exactly what you need.

### 2.2 Shopping Cart
1.  Click **Add to Cart** on any product card.
2.  Click the **Cart Icon** in the header to view your items.
3.  Adjust quantities or remove items as needed.
4.  The total amount is calculated automatically in real-time.

### 2.3 Checkout Process
1.  Click **Checkout** from the cart page.
2.  Confirm your **Shipping Address** and **Phone Number**.
3.  Review the order summary and click **Place Order**.
4.  You will receive a unique **Order ID** for tracking.

### 2.4 Real-Time Order Tracking
1.  Navigate to the **"Track Order"** page.
2.  Enter your **Order ID** and **Phone Number**.
3.  View the **Visual Progress Timeline**:
    *   🟢 **Pending**: Order received and awaiting processing.
    *   🟡 **Shipped**: Order is on the way.
    *   🔵 **Delivered**: Order has reached its destination.
    *   🔴 **Cancelled/Returned**: Handled with specific status updates.
4.  **Note:** The status updates automatically every **5 seconds** without needing to refresh the page.

---

## 🔐 3. Admin Guide (ROLE_ADMIN)

### 3.1 Executive Dashboard
Upon login, Admins are greeted with a high-level analytics summary:
*   **Total Revenue**: Aggregate of all non-cancelled orders.
*   **Order Stats**: Visual breakdown of Pending, Delivered, and Cancelled orders.
*   **User Growth**: Total number of registered customers.
*   **Inventory Alerts**: Immediate notification for products with stock lower than **5 units**.

### 3.2 Product Management
1.  Navigate to the **"Manage Products"** section.
2.  **Add Product**: Enter Name, Description, Price, Category, and Initial Stock.
3.  **Update Stock**: Edit existing products to reflect new inventory arrivals.
4.  **Remove Product**: Deactivate products that are no longer available.

### 3.3 Order & Shipment Control
1.  Go to **"Manage Orders"**.
2.  View the list of all system orders.
3.  Click **Update Status** to move an order from *Pending* → *Shipped* → *Delivered*.
4.  Any change you make here is reflected on the Customer’s tracking page within **5 seconds**.

---

## 🛠️ 4. Technical Features & Support

### 4.1 Real-Time Synchronization
ShopHub uses an intelligent **Polling Mechanism** on the frontend. Every 5 seconds, the application checks the backend for status changes, ensuring that users and admins always see the most up-to-date information.

### 4.2 Security Best Practices
*   **JWT Authentication**: All API calls are protected by encrypted tokens.
*   **Role-Based Access Control (RBAC)**: Admins and Users see different interfaces tailored to their permissions.
*   **Data Validation**: Strict validation on phone numbers and emails to prevent order errors.

### 4.3 Troubleshooting & FAQ
*   **Login Failed?** Ensure your email is correct and your password meets the 6-character minimum.
*   **Order not showing?** Check if you are logged in; guests cannot view order history.
*   **Tracking Error?** Verify the Order ID and the phone number used during checkout.

---
© 2026 ShopHub Project Team. All Rights Reserved.
