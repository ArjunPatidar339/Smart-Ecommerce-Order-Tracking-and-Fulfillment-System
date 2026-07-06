# 📘 E-Commerce Order Tracking System — Complete Project Guide (Part 1)

## Table of Contents — Part 1
1. [Complete Project Overview](#1-complete-project-overview)
2. [Full Project Architecture](#2-full-project-architecture)
3. [Data Flow Explanation](#3-data-flow-explanation)
4. [Important APIs Explained](#4-important-apis-explained)

---

# 1. Complete Project Overview

## 1.1 What is an E-Commerce Order Tracking System?

An **E-Commerce Order Tracking System** is a full-stack web application that allows customers to **browse products, place orders, and track their order status in real-time** — from order placement all the way to delivery. It also provides an **Admin panel** for managing users, products, inventory, orders, and shipments.

**Think of it like a mini version of Amazon or Flipkart** where:
- Customers can register, log in, shop, place orders, and track deliveries.
- Admins can manage the entire business from a dashboard.

## 1.2 What Problem Does This Project Solve?

| Problem | Solution |
|---------|----------|
| Customers don't know where their order is | Real-time order tracking with status timeline |
| No centralized product management | Admin can add/edit/delete products with inventory tracking |
| Manual order processing is error-prone | Automated order lifecycle with status transitions |
| Security concerns with user data | JWT-based authentication and role-based access control |
| No business analytics | Admin dashboard with revenue, order stats, and low-stock alerts |

## 1.3 Main Features

### Customer Features
- **User Registration & Login** — Secure signup with JWT token
- **Product Browsing** — View products with images, prices, ratings
- **Place Orders** — Add items and place orders with shipping details
- **Order Tracking** — Real-time status updates (auto-refreshes every 5 seconds)
- **Order Cancellation** — Cancel orders before shipment
- **Password Reset** — OTP-based forgot password via email
- **Profile Management** — Update name, phone, address

### Admin Features
- **Executive Dashboard** — Total revenue, order stats, low-stock alerts
- **User Management** — View, delete users, change roles
- **Product Management** — Full CRUD on products
- **Order Management** — View all orders, update order status
- **Inventory Management** — Track and update stock levels
- **Shipment Management** — Create shipments, update shipment status
- **Return/Refund Processing** — Approve returns, process refunds

## 1.4 Real-World Business Use Case

**Scenario:** "ShopHub" is an online store selling electronics, clothing, and footwear.

- **Customer (Rahul):** Registers → Browses products → Adds iPhone 15 Pro to cart → Places order → Receives order ID → Tracks order from PENDING → SHIPPED → DELIVERED
- **Admin (Priya):** Logs in → Sees dashboard → Updates Rahul's order to SHIPPED → Manages inventory → Processes refund for a returned item

## 1.5 Customer Flow

```
Register/Login → Browse Products → Select Items → Place Order
       ↓                                              ↓
  Get JWT Token                              Order Created (PENDING)
       ↓                                              ↓
  Access Protected APIs                    Track Order Status
       ↓                                              ↓
  View Profile / Update                    PENDING → CONFIRMED → PACKED
                                                      ↓
                                           SHIPPED → OUT_FOR_DELIVERY → DELIVERED
                                                      ↓
                                           (Optional) Request Return → Refund
```

## 1.6 Admin Flow

```
Login (admin@shop.com) → Dashboard Overview
       ↓
  ┌────┴─────────────────────────────────────────┐
  │   Manage Users  │  Manage Products  │  Manage Orders  │
  │   View/Delete   │  Add/Edit/Delete  │  Update Status  │
  │   Change Roles  │  Update Stock     │  View All       │
  └─────────────────┴───────────────────┴─────────────────┘
       ↓
  Process Returns → Approve → Issue Refund
```

## 1.7 Order Lifecycle (From Placement to Delivery)

```
 ┌──────────┐    ┌───────────┐    ┌────────┐    ┌─────────┐
 │ PENDING  │───>│ CONFIRMED │───>│ PACKED │───>│ SHIPPED │
 └──────────┘    └───────────┘    └────────┘    └─────────┘
                                                     │
                                                     ▼
                                            ┌─────────────────┐
                                            │ OUT_FOR_DELIVERY │
                                            └─────────────────┘
                                                     │
                                                     ▼
                                              ┌───────────┐
                                              │ DELIVERED │
                                              └───────────┘
                                                     │
                                              (If customer requests)
                                                     ▼
                                              ┌───────────┐
                                              │ RETURNED  │
                                              └───────────┘

  At any stage before SHIPPED:
  ┌───────────┐
  │ CANCELLED │  (Customer can cancel)
  └───────────┘
```

**Step-by-step lifecycle:**

| Step | Status | What Happens | Who Triggers |
|------|--------|-------------|-------------|
| 1 | PENDING | Order is placed, inventory deducted, shipment auto-created | Customer |
| 2 | CONFIRMED | Admin confirms order is valid and payment received | Admin |
| 3 | PACKED | Items are packed and ready for pickup | Admin |
| 4 | SHIPPED | Handed to courier, shipment status → IN_TRANSIT | Admin |
| 5 | OUT_FOR_DELIVERY | Last-mile delivery in progress | Admin |
| 6 | DELIVERED | Customer received the package, shipment → DELIVERED | Admin |
| 7 | CANCELLED | Order cancelled, inventory restored | Customer/Admin |
| 8 | RETURNED | Customer returns delivered order, shipment → FAILED | Customer |

## 1.8 Main Modules

### Module 1: User Management
- Registration with name, email, password, phone, address
- Login with email/password → JWT token returned
- Profile viewing and updating
- Password reset via OTP email
- Role assignment (ROLE_USER, ROLE_ADMIN)

### Module 2: Product Management
- CRUD operations on products (Admin only for Create/Update/Delete)
- Products have: name, brand, category, description, price, originalPrice, rating, reviews, image, stock
- Public browsing (no auth needed for GET)

### Module 3: Cart Management
- Cart is handled on the **Frontend** (React state)
- Items are sent as a list in `PlaceOrderRequest` when ordering
- Each item has `productId` and `quantity`

### Module 4: Order Management
- Place order with user ID, shipping address, phone, and item list
- View orders by user ID
- Cancel orders (restores inventory)
- Admin can update order status through defined lifecycle

### Module 5: Payment Handling
- Currently simulated — order is placed directly
- `totalAmount` is calculated server-side from product prices × quantities
- Refund processing available for returned orders (stub for payment gateway)

### Module 6: Shipment Tracking
- Auto-created when order is placed (carrier: "ShopHub Logistics")
- Tracking number generated: `TRK` + timestamp
- Estimated delivery: 5 days from order date
- Shipment statuses: PROCESSING → IN_TRANSIT → DELIVERED / FAILED
- Track by Order ID + Phone Number (security check)

### Module 7: Order Status Updates
- Admin updates via `PUT /api/orders/{id}/status`
- Shipment status auto-syncs with order status
- Frontend polls every 5 seconds for real-time updates

### Module 8: Authentication & Authorization
- JWT-based stateless authentication
- BCrypt password encoding
- Role-based access: ROLE_USER and ROLE_ADMIN
- `@PreAuthorize` for method-level security
- Security filter chain for URL-level access control

---

# 2. Full Project Architecture

## 2.1 Layered Architecture Overview

This project follows a **Layered (N-Tier) Architecture** pattern, where each layer has a specific responsibility and communicates only with its adjacent layers.

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT (React Frontend)               │
│              http://localhost:5173                        │
└─────────────────┬───────────────────────────────────────┘
                  │ HTTP Requests (JSON)
                  ▼
┌─────────────────────────────────────────────────────────┐
│              SECURITY LAYER (Filter Chain)                │
│  JwtAuthFilter → Extract Token → Validate → Set Auth     │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              CONTROLLER LAYER (@RestController)           │
│  AuthController, ProductController, NewOrderController    │
│  AdminController, ShipmentController, UserController      │
│  InventoryController, ShippingController, ReturnRefund    │
│                                                           │
│  Responsibility: Receive HTTP requests, validate input,   │
│  delegate to Service layer, return HTTP responses         │
└─────────────────┬───────────────────────────────────────┘
                  │ Method calls
                  ▼
┌─────────────────────────────────────────────────────────┐
│              SERVICE LAYER (@Service)                      │
│  NewOrderServiceImpl, ShipmentServiceImpl,                │
│  InventoryServiceImpl, OrderServiceImpl,                  │
│  UserServiceImpl, OtpService                              │
│                                                           │
│  Responsibility: Business logic, validation,              │
│  transaction management, data transformation              │
└─────────────────┬───────────────────────────────────────┘
                  │ Method calls
                  ▼
┌─────────────────────────────────────────────────────────┐
│            REPOSITORY LAYER (JpaRepository)               │
│  UserRepository, OrderEntityRepository,                   │
│  ProductEntityRepository, ShipmentEntityRepository,       │
│  InventoryEntityRepository, OrderItemRepository           │
│                                                           │
│  Responsibility: Database CRUD operations,                │
│  custom queries, data persistence                         │
└─────────────────┬───────────────────────────────────────┘
                  │ Hibernate ORM
                  ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (MySQL 8.0)                          │
│  Tables: users, products, orders, order_items,            │
│          shipments, inventory                             │
│                                                           │
│  Connection: jdbc:mysql://127.0.0.1:3306/ecommerce_db    │
└─────────────────────────────────────────────────────────┘
```

## 2.2 Each Layer Explained in Detail

### 2.2.1 Controller Layer

**Purpose:** Acts as the **entry point** for all HTTP requests. It receives requests from the client, performs basic input extraction, delegates processing to the Service layer, and returns appropriate HTTP responses.

**Why it exists:**
- Separates HTTP-handling logic from business logic
- Each controller handles a specific domain (Auth, Products, Orders, etc.)
- Makes the API clean and organized

**Files in this project:**
| Controller | Base Path | Purpose |
|-----------|-----------|---------|
| `AuthController` | `/api/auth` | Registration, Login, Password Reset |
| `ProductController` | `/api/products` | Product CRUD |
| `NewOrderController` | `/api/orders` | Place/View/Cancel/Update Orders |
| `AdminController` | `/api/admin` | Admin dashboard, user management |
| `ShipmentController` | `/api/shipment` | Create/Track/Update Shipments |
| `UserController` | `/api/users` | User profile management |
| `InventoryController` | `/api/inventory` | Stock management |
| `ShippingController` | `/api/shipping` | Address validation, labels, tracking |
| `ReturnRefundController` | `/api` | Returns and refunds |
| `HomeController` | `/` | Health check endpoint |

### 2.2.2 Service Layer

**Purpose:** Contains all **business logic**. It validates data, applies business rules, coordinates between multiple repositories, and manages transactions.

**Why it exists:**
- Keeps business logic separate from HTTP concerns
- Makes code reusable (multiple controllers can use same service)
- Transaction management happens here

**Pattern used:** **Interface + Implementation** pattern
- `NewOrderService` (interface) → `NewOrderServiceImpl` (implementation)
- This allows easy swapping of implementations and better testing

### 2.2.3 Repository Layer

**Purpose:** Handles all **database interactions**. Uses Spring Data JPA to automatically generate SQL queries from method names.

**Why it exists:**
- Eliminates boilerplate JDBC/SQL code
- Provides type-safe database operations
- Custom queries via method naming conventions

**Example:** `findByUser_Id(Long userId)` → Spring auto-generates: `SELECT * FROM orders WHERE user_id = ?`

### 2.2.4 Entity Layer

**Purpose:** Defines the **database tables** as Java classes. Each entity maps to a MySQL table.

**Entities in this project:**
| Entity | Table | Key Relationships |
|--------|-------|-------------------|
| `User` | `users` | Has many Orders |
| `Product` | `products` | Has one Inventory |
| `Order` | `orders` | Belongs to User, Has many OrderItems |
| `OrderItem` | `order_items` | Belongs to Order and Product |
| `Shipment` | `shipments` | Belongs to one Order (1:1) |
| `Inventory` | `inventory` | Belongs to one Product (1:1) |

### 2.2.5 DTO Layer

**Purpose:** **Data Transfer Objects** carry data between layers without exposing entity internals. They define what the API accepts (Request DTOs) and returns (Response DTOs).

**Why it exists:**
- Prevents exposing database structure to clients
- Allows different request/response shapes than entities
- Adds validation annotations

**Request DTOs:** `RegisterRequest`, `LoginRequest`, `PlaceOrderRequest`, `OrderItemRequest`, `ShipmentCreateRequest`, `InventoryUpdateRequest`, `OrderStatusUpdateRequest`, `ShipmentStatusUpdateRequest`, `ForgotPasswordRequest`, `ResetPasswordRequest`, `UserUpdateRequestDto`

**Response DTOs:** `AuthResponse`, `OrderResponse`, `ShipmentResponse`, `InventoryResponse`, `OrderStatusResponse`, `DashboardResponse`, `UserResponseDto`, `ErrorResponse`

### 2.2.6 Security Layer

**Purpose:** Handles **authentication and authorization**. Ensures only valid users access protected endpoints and only admins access admin endpoints.

**Components:**
- `SecurityConfig` — Configures filter chain, CORS, auth providers
- `JwtAuthFilter` — Intercepts every request, validates JWT token
- `JwtUtil` — Generates and validates JWT tokens
- `AppConfig` — Provides `UserDetailsService` bean

### 2.2.7 Exception Handling Layer

**Purpose:** Provides **centralized error handling** so all exceptions return consistent JSON error responses.

**Components:**
- `GlobalExceptionHandler` — Catches all exceptions globally
- `ResourceNotFoundException` — Custom 404 exception
- `ErrorResponse` — Standardized error response DTO

### 2.2.8 Configuration Layer

**Purpose:** Configures Spring Boot beans, CORS settings, security, and initial data seeding.

**Components:**
- `AppConfig` — UserDetailsService bean
- `CorsConfig` — Cross-origin settings
- `SecurityConfig` — Security filter chain
- `DataSeeder` — Creates default admin and demo products on startup

## 2.3 How Layers Communicate

```
Client  ──HTTP──>  Controller  ──method call──>  Service  ──method call──>  Repository
                                                                               │
Client  <──HTTP──  Controller  <──return──────  Service  <──return──────  Repository
                                                                               │
                                                                          Hibernate
                                                                               │
                                                                            MySQL DB
```

**Rules of communication:**
1. Controller can ONLY call Service (never Repository directly — ideally)
2. Service can call Repository and other Services
3. Repository interacts only with Database via Hibernate
4. No layer skipping is the best practice

## 2.4 Complete Request-Response Lifecycle

**Example: Customer places an order**

```
1. React Frontend sends POST /api/orders with JSON body and JWT token
          │
2. Request hits Tomcat (embedded server, port 8080)
          │
3. DispatcherServlet receives the request
          │
4. JwtAuthFilter intercepts → Extracts token from "Authorization: Bearer xxx"
   → Calls JwtUtil.extractEmail() → Finds User in DB → Sets SecurityContext
          │
5. SecurityFilterChain checks: Is /api/orders authenticated? YES
          │
6. DispatcherServlet routes to NewOrderController.placeOrder()
          │
7. @RequestBody deserializes JSON into PlaceOrderRequest (Jackson)
          │
8. Controller calls orderService.placeOrder(request)
          │
9. NewOrderServiceImpl:
   a. Validates user exists (UserRepository.findById)
   b. For each item: validates product, checks inventory stock
   c. Deducts inventory stock
   d. Creates Order entity with OrderItems
   e. Saves Order → Hibernate generates INSERT SQL
   f. Auto-creates Shipment record
   g. Maps Order → OrderResponse DTO
          │
10. Response DTO returned to Controller
          │
11. Controller wraps in ResponseEntity.ok() → HTTP 200 with JSON body
          │
12. Jackson serializes OrderResponse to JSON → Response sent to Frontend
```

---

# 3. Data Flow Explanation

## 3.1 Step-by-Step Data Travel (Place Order Example)

### Step 1: User Places an Order (Frontend)
The React frontend sends a POST request with JSON body and JWT token in the Authorization header.

### Step 2: Request Reaches Controller
- Spring's `DispatcherServlet` matches URL to `NewOrderController`
- `@RequestBody` triggers Jackson to deserialize JSON → `PlaceOrderRequest` object
- Controller delegates to Service

### Step 3: Controller Calls Service
- The `orderService` field is injected via `@RequiredArgsConstructor` (constructor injection)
- Spring's IoC container provides the `NewOrderServiceImpl` instance

### Step 4: Service Validates Business Logic
```java
// Validate user exists
User user = userRepository.findById(request.getUserId())
    .orElseThrow(() -> new ResourceNotFoundException("User not found"));

// For each item: validate product + check stock
Product product = productRepository.findById(itemReq.getProductId())...
Inventory inventory = inventoryRepository.findByProduct_Id(product.getId())...

if (inventory.getAvailableStock() < itemReq.getQuantity()) {
    throw new IllegalStateException("Insufficient stock...");
}
```

### Step 5: Repository Interacts with Database
`JpaRepository.findById()` is a built-in method. Spring Data generates the implementation at runtime using proxy classes.

### Step 6: Hibernate Converts Object to SQL
```sql
-- findById generates:
SELECT u.id, u.name, u.email, u.password, u.phone, u.address, u.role 
FROM users u WHERE u.id = ?

-- save() generates:
INSERT INTO orders (user_id, status, total_amount, shipping_address, 
    shipping_phone, created_at) VALUES (?, 'PENDING', ?, ?, ?, ?)

-- For each OrderItem:
INSERT INTO order_items (order_id, product_id, quantity, price_at_purchase) 
VALUES (?, ?, ?, ?)

-- Inventory update:
UPDATE inventory SET available_stock = ?, last_updated = ? WHERE id = ?
```

### Step 7: MySQL Stores Data
MySQL receives the SQL statements. Data is persisted in tables: `orders`, `order_items`, `inventory`, `shipments`. Auto-generated IDs are returned to Hibernate.

### Step 8: Response Returned to Frontend
Service maps Entity → DTO → Controller wraps in ResponseEntity → Jackson serializes to JSON → HTTP response sent back.

---

# 4. Important APIs Explained

## 4.1 User Registration API

**Endpoint:** `POST /api/auth/register`

**Request Body:**
```json
{
  "name": "Arjun Patidar",
  "email": "arjun@example.com",
  "password": "mypassword123",
  "phone": "9876543210",
  "address": "Indore, MP"
}
```

**Response (200 OK):**
```json
{
  "token": "eyJhbGciOiJIUzI1NiJ9...",
  "userId": 2,
  "name": "Arjun Patidar",
  "email": "arjun@example.com",
  "role": "ROLE_USER"
}
```

**Internal Flow:**
1. `AuthController.register()` receives `RegisterRequest`
2. Checks if email already exists via `userRepository.findByEmail()`
3. If exists → returns `400 BAD REQUEST`
4. Encodes password using `BCryptPasswordEncoder`
5. Builds `User` entity with `Role.ROLE_USER` (default)
6. Saves user via `userRepository.save(user)` → Hibernate INSERT
7. Generates JWT token via `jwtUtil.generateToken(user)`
8. Returns `AuthResponse` with token, userId, name, email, role

## 4.2 Login API

**Endpoint:** `POST /api/auth/login`

**Request:** `{ "email": "arjun@example.com", "password": "mypassword123" }`

**Response:** Same as registration (AuthResponse with token)

**Internal Flow:**
1. `AuthController.login()` receives `LoginRequest`
2. Finds user by email via `userRepository.findByEmail()`
3. Compares password using `passwordEncoder.matches(raw, encoded)`
4. If matches → generates JWT token → returns `AuthResponse`
5. If fails → returns `401 UNAUTHORIZED`

## 4.3 Add Product API (Admin Only)

**Endpoint:** `POST /api/products`  
**Headers:** `Authorization: Bearer <admin-jwt-token>`

**Internal Flow:**
1. `JwtAuthFilter` validates token → sets ROLE_ADMIN in SecurityContext
2. `SecurityFilterChain` checks: POST /api/products requires ROLE_ADMIN ✓
3. `ProductController.createProduct()` receives Product entity directly
4. `productRepository.save(product)` → Hibernate INSERT into `products` table
5. Returns saved Product with auto-generated ID

## 4.4 Place Order API

**Endpoint:** `POST /api/orders`

**Internal Flow (NewOrderServiceImpl.placeOrder):**
1. Validate user exists
2. For EACH item: validate product, check inventory, deduct stock, calculate total
3. Create `Order` entity with status = PENDING
4. Link OrderItems to Order (bidirectional)
5. Save Order (cascades to OrderItems via `CascadeType.ALL`)
6. Auto-create `Shipment` with tracking number
7. Map to `OrderResponse` DTO and return

## 4.5 Track Order API

**Endpoint:** `GET /api/shipment/{orderId}?phone=9876543210`

**Internal Flow:**
1. Find order by ID
2. Security check: Verify phone matches order's shipping phone
3. Find shipment by order ID
4. Return `ShipmentResponse` with tracking details

## 4.6 Update Order Status API (Admin Only)

**Endpoint:** `PUT /api/orders/{id}/status`  
**Request:** `{ "status": "SHIPPED" }`

**Internal Flow:**
1. Find order by ID → Update status
2. Sync shipment: SHIPPED → IN_TRANSIT, DELIVERED → DELIVERED, CANCELLED → FAILED
3. Save both order and shipment → Return updated `OrderResponse`

## 4.7 Cancel Order API

**Endpoint:** `PUT /api/orders/{id}/cancel`

**Internal Flow:**
1. Find order → Validate not DELIVERED/SHIPPED
2. Restore inventory for each item
3. Set status to CANCELLED → Save and return
