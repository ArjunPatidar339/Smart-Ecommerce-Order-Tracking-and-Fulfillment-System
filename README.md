# 🛒 Smart Ecommerce Order Tracking & Fulfillment System

<p align="center">

![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-green?style=for-the-badge)
![React](https://img.shields.io/badge/React-18-blue?style=for-the-badge)
![Vite](https://img.shields.io/badge/Vite-Frontend-purple?style=for-the-badge)
![MySQL](https://img.shields.io/badge/MySQL-Database-blue?style=for-the-badge)
![JWT](https://img.shields.io/badge/JWT-Authentication-red?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)

</p>

---

## 📖 Overview

The **Ecommerce Order Tracking & Fulfillment System** is a full-stack web application designed to simplify online shopping and order management.

Customers can browse products, manage carts, place orders, track deliveries, and manage their profiles, while administrators can efficiently handle products, inventory, users, categories, and order fulfillment through a secure dashboard.

This project demonstrates a modern full-stack architecture using **Spring Boot**, **React**, **MySQL**, **JWT Authentication**, and **REST APIs**.

---

# ✨ Features

## 👤 Customer Module

- User Registration
- Secure Login
- JWT Authentication
- User Profile
- Browse Products
- Search Products
- Filter Products
- Shopping Cart
- Wishlist
- Place Orders
- Order History
- Real-Time Order Tracking

---

## 👨‍💼 Admin Module

- Admin Dashboard
- Product Management
- Category Management
- Inventory Management
- User Management
- Order Management
- Order Fulfillment

---

## 🔐 Security

- Spring Security
- JWT Authentication
- Password Encryption
- Role-Based Authorization
- Protected REST APIs

---

# 🛠 Tech Stack

## Backend

- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA
- Hibernate
- Maven
- REST APIs

## Frontend

- React.js
- Vite
- React Router
- Axios
- HTML5
- CSS3
- JavaScript (ES6+)

## Database

- MySQL

---

# 📂 Project Structure

```text
ecommerce-order-tracking-system
│
├── Backend
│   ├── src
│   ├── pom.xml
│   ├── mvnw
│   └── mvnw.cmd
│
├── Frontend
│   ├── src
│   ├── public
│   ├── package.json
│   └── vite.config.js
│
├── documentation
│
└── README.md
```

---

# ⚙️ Installation

## Clone Repository

```bash
git clone https://github.com/ArjunPatidar339/ecommerce-and-order-tracking-system.git
```

---

## Backend Setup

```bash
cd Backend
mvnw.cmd spring-boot:run
```

Backend runs at:

```
http://localhost:8081
```

---

## Frontend Setup

```bash
cd Frontend
npm install
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# 🗄 Database Configuration

Configure MySQL credentials in:

```
Backend/src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/ecommerce
spring.datasource.username=root
spring.datasource.password=your_password
```

---

# 📦 Main Modules

- Authentication
- Product Management
- Category Management
- Shopping Cart
- Wishlist
- User Profile
- Order Management
- Order Tracking
- Order Fulfillment
- Inventory Management

---

# 🔒 Authentication

The project uses:

- JWT Authentication
- Spring Security
- Role-Based Authorization (Admin/User)

---

# 📸 Screenshots

Add screenshots here:

```
documentation/screenshots/
```

Suggested screenshots:

- Login
- Register
- Home
- Product List
- Product Details
- Shopping Cart
- Wishlist
- Checkout
- Orders
- Order Tracking
- Admin Dashboard

---

# 🚀 Future Enhancements

- Online Payment Gateway
- Email Notifications
- Sales Analytics Dashboard
- Product Recommendation System
- Docker Support
- CI/CD Pipeline
- Cloud Deployment (AWS/Azure)

---

# 👨‍💻 Author

**Arjun Patidar**

- GitHub: https://github.com/ArjunPatidar339
- LinkedIn: *(Add your LinkedIn profile here)*

---

# 📄 License

This project is licensed under the MIT License.

---

## ⭐ Support

If you like this project, consider giving it a ⭐ on GitHub!
