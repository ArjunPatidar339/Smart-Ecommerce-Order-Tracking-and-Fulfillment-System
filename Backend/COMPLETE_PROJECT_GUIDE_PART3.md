# 📘 E-Commerce Order Tracking System — Complete Project Guide (Part 3)

## Table of Contents — Part 3
9. [Database Connection Flow](#9-database-connection-flow)
10. [Security & Authentication](#10-security--authentication)
11. [Exception Handling](#11-exception-handling)
12. [DTO & Validation](#12-dto--validation)
13. [Folder Structure Explanation](#13-folder-structure-explanation)

---

# 9. Database Connection Flow

## 9.1 application.properties Explained

```properties
# Server runs on port 8080
server.port=8080

# MySQL connection URL
spring.datasource.url=jdbc:mysql://127.0.0.1:3306/ecommerce_db?useSSL=false&serverTimezone=UTC&allowPublicKeyRetrieval=true
spring.datasource.username=root
spring.datasource.password=root
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# Hibernate settings
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.MySQLDialect

# JWT configuration
jwt.secret=404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970
jwt.expiration=86400000
```

## 9.2 Line-by-Line Explanation

| Property | Purpose |
|----------|---------|
| `spring.datasource.url` | JDBC URL: protocol (jdbc:mysql), host (127.0.0.1), port (3306), database (ecommerce_db) |
| `spring.datasource.username` | MySQL username |
| `spring.datasource.password` | MySQL password |
| `driver-class-name` | MySQL JDBC driver class (com.mysql.cj.jdbc.Driver) |
| `ddl-auto=update` | Hibernate auto-updates table schema without dropping existing data |
| `show-sql=true` | Prints generated SQL in console (useful for debugging) |
| `hibernate.dialect` | Tells Hibernate to generate MySQL-specific SQL |
| `jwt.secret` | Base64-encoded secret key for signing JWT tokens |
| `jwt.expiration` | Token validity: 86400000ms = 24 hours |

## 9.3 DDL-Auto Options

| Value | Behavior |
|-------|----------|
| `create` | Drops all tables and recreates them on every startup (DATA LOSS!) |
| `create-drop` | Creates tables on startup, drops on shutdown |
| `update` | Updates schema without dropping data (used in this project) |
| `validate` | Only validates schema matches entities, no changes |
| `none` | No schema management |

## 9.4 How Spring Boot Connects to MySQL Automatically

```
Step 1: Spring Boot starts → reads application.properties

Step 2: Auto-Configuration detects spring-boot-starter-data-jpa in pom.xml
        → Configures DataSource, EntityManagerFactory, TransactionManager

Step 3: DataSource bean created:
        → Uses HikariCP connection pool (default in Spring Boot)
        → Connects to jdbc:mysql://127.0.0.1:3306/ecommerce_db

Step 4: HikariCP creates a connection pool:
        → Maintains a pool of reusable database connections
        → Default: 10 connections max

Step 5: Hibernate initializes:
        → Scans @Entity classes (User, Product, Order, etc.)
        → Generates DDL (CREATE TABLE / ALTER TABLE)
        → Executes DDL against MySQL (because ddl-auto=update)

Step 6: EntityManagerFactory is ready
        → All repositories can now execute queries

Step 7: DataSeeder runs (CommandLineRunner):
        → Creates default admin user
        → Creates demo products and inventory
```

## 9.5 Connection Pool (HikariCP)

**Why connection pool?** Opening a new database connection for every request is expensive (network handshake, authentication). A connection pool keeps connections open and reuses them.

```
Application ──> HikariCP Pool ──> MySQL
                  │
                  ├── Connection 1 (in use by Thread A)
                  ├── Connection 2 (in use by Thread B)
                  ├── Connection 3 (idle, ready to use)
                  └── ... up to 10 connections
```

---

# 10. Security & Authentication

## 10.1 Overview

This project uses **Spring Security + JWT (JSON Web Token)** for stateless authentication and role-based authorization.

```
┌──────────┐    POST /api/auth/login    ┌──────────────┐
│  Client  │ ─────────────────────────> │ AuthController│
│ (React)  │                            │              │
│          │ <───────────────────────── │  Returns JWT │
│          │    { token: "eyJhb..." }   │              │
└──────────┘                            └──────────────┘
     │
     │  All subsequent requests include:
     │  Authorization: Bearer eyJhb...
     ▼
┌──────────────────────────────────────────────────┐
│              JwtAuthFilter                        │
│  1. Extract token from Authorization header       │
│  2. Decode token → get email                      │
│  3. Load user from DB                             │
│  4. Validate token (signature + expiry)           │
│  5. Set authentication in SecurityContext         │
└─────────────┬────────────────────────────────────┘
              │
              ▼
┌──────────────────────────────────────────────────┐
│          SecurityFilterChain                      │
│  Check: Does user have required role?             │
│  /api/admin/** → needs ROLE_ADMIN                 │
│  /api/orders → needs authenticated user           │
│  /api/products (GET) → public, no auth needed     │
└──────────────────────────────────────────────────┘
```

## 10.2 Login Flow (Step by Step)

```
1. User sends: POST /api/auth/login
   Body: { "email": "arjun@test.com", "password": "pass123" }

2. AuthController.login() receives LoginRequest

3. userRepository.findByEmail("arjun@test.com")
   → Hibernate: SELECT * FROM users WHERE email = ?
   → Returns Optional<User>

4. passwordEncoder.matches("pass123", "$2a$10$hashedPassword...")
   → BCrypt verifies the password
   → Returns true/false

5. If password matches:
   → jwtUtil.generateToken(user)

6. JWT Token Generation:
   Header:  { "alg": "HS256" }
   Payload: { "sub": "arjun@test.com", "role": "ROLE_USER", 
              "userId": 2, "iat": 1715600000, "exp": 1715686400 }
   Signature: HMACSHA256(header + payload, secret_key)
   
   → Token: "eyJhbGciOiJIUzI1NiJ9.eyJzdWI..."

7. AuthResponse returned:
   { "token": "eyJ...", "userId": 2, "name": "Arjun", 
     "email": "arjun@test.com", "role": "ROLE_USER" }
```

## 10.3 Protected API Access Flow

```
1. Client sends: GET /api/orders/user?userId=2
   Headers: Authorization: Bearer eyJhbGciOiJIUzI1NiJ9...

2. JwtAuthFilter.doFilterInternal() intercepts:
   a. Reads "Authorization" header
   b. Strips "Bearer " prefix → gets raw token
   c. jwtUtil.extractEmail(token) → decodes payload → gets "arjun@test.com"
   d. userRepository.findByEmail("arjun@test.com") → loads User
   e. jwtUtil.isTokenValid(token, user):
      - Checks email matches
      - Checks token not expired (exp > current time)
   f. If valid → Creates UsernamePasswordAuthenticationToken
      → Sets in SecurityContextHolder (user is now "logged in" for this request)

3. SecurityFilterChain checks:
   /api/orders/user → requires authenticated user → YES (set in step 2f)

4. Request proceeds to NewOrderController.getUserOrders()

5. After response is sent, SecurityContext is cleared (stateless!)
```

## 10.4 JWT Token Structure

```
eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhcmp1bkB0ZXN0LmNvbSIsInJvbGUiOiJST0xFX1VTRVIiLCJ1c2VySWQiOjIsImlhdCI6MTcxNTYwMDAwMCwiZXhwIjoxNzE1Njg2NDAwfQ.signature

Part 1 (Header):    { "alg": "HS256" }
Part 2 (Payload):   { "sub": "arjun@test.com", "role": "ROLE_USER", "userId": 2 }
Part 3 (Signature): HMAC-SHA256(Part1 + Part2, secret_key)
```

## 10.5 Security Configuration Explained

```java
// Public endpoints (no token needed)
.requestMatchers("/api/auth/**").permitAll()
.requestMatchers(HttpMethod.GET, "/", "/api/products", "/api/products/**", 
                 "/api/shipment/**").permitAll()

// Admin-only endpoints
.requestMatchers(HttpMethod.POST, "/api/products").hasAuthority("ROLE_ADMIN")
.requestMatchers(HttpMethod.PUT, "/api/products/**").hasAuthority("ROLE_ADMIN")
.requestMatchers(HttpMethod.DELETE, "/api/products/**").hasAuthority("ROLE_ADMIN")
.requestMatchers("/api/admin/**").hasAuthority("ROLE_ADMIN")

// Everything else needs authentication
.anyRequest().authenticated()
```

## 10.6 Role-Based Access Summary

| Endpoint | ROLE_USER | ROLE_ADMIN | No Auth |
|----------|-----------|------------|---------|
| POST /api/auth/register | ✓ | ✓ | ✓ |
| POST /api/auth/login | ✓ | ✓ | ✓ |
| GET /api/products | ✓ | ✓ | ✓ |
| POST /api/products | ✗ | ✓ | ✗ |
| POST /api/orders | ✓ | ✓ | ✗ |
| PUT /api/orders/{id}/status | ✗ | ✓ | ✗ |
| GET /api/admin/dashboard | ✗ | ✓ | ✗ |

---

# 11. Exception Handling

## 11.1 Global Exception Handling

This project uses **centralized exception handling** via `@RestControllerAdvice` so ALL controllers share the same error-handling logic.

```
Any Controller throws exception
         │
         ▼
GlobalExceptionHandler catches it
         │
         ▼
Returns standardized ErrorResponse JSON:
{
  "status": 404,
  "message": "Order not found: 99",
  "timestamp": "2026-05-13T16:45:00"
}
```

## 11.2 @RestControllerAdvice

```java
@RestControllerAdvice
public class GlobalExceptionHandler { ... }
```
- Combines `@ControllerAdvice` + `@ResponseBody`
- Intercepts exceptions thrown by ANY `@RestController`
- Returns JSON error responses automatically

## 11.3 Exception Handlers in This Project

| Exception | HTTP Status | When Thrown |
|-----------|------------|-------------|
| `ResourceNotFoundException` | 404 NOT FOUND | Entity not found in DB |
| `MethodArgumentNotValidException` | 400 BAD REQUEST | Validation annotations fail |
| `IllegalStateException` | 400 BAD REQUEST | Business rule violation |
| `Exception` (generic) | 500 INTERNAL ERROR | Any unhandled exception |

## 11.4 Custom Exception

```java
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
```

**Usage example:**
```java
User user = userRepository.findById(id)
    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
```

If user not found → `ResourceNotFoundException` thrown → `GlobalExceptionHandler` catches it → returns 404 with message.

---

# 12. DTO & Validation

## 12.1 Why DTOs Are Used

| Without DTO | With DTO |
|-------------|----------|
| Entity exposed directly to client | Clean API contract |
| Password field visible in response | Sensitive fields hidden |
| API breaks when entity changes | Entity and API evolve independently |
| No input validation | Validation annotations on DTOs |

## 12.2 Entity vs DTO

| Aspect | Entity | DTO |
|--------|--------|-----|
| Purpose | Maps to database table | Carries data between layers |
| Annotations | `@Entity`, `@Table`, `@Column` | `@Data`, `@Builder`, validation |
| Contains | All database fields | Only needed fields |
| Example | `User` (has password, role) | `UserResponseDto` (no password!) |

## 12.3 Request DTOs (What the API Accepts)

```java
// RegisterRequest — what client sends for registration
@Data
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String phone;
    private String address;
}

// PlaceOrderRequest — what client sends to place order
@Data
public class PlaceOrderRequest {
    private Long userId;
    private String shippingAddress;
    private String shippingPhone;
    private List<OrderItemRequest> items;
}

// ShipmentCreateRequest — with validation
@Data
public class ShipmentCreateRequest {
    @NotNull(message = "Order ID is required")
    private Long orderId;

    @NotBlank(message = "Carrier is required")
    private String carrier;

    @NotBlank(message = "Tracking number is required")
    private String trackingNumber;

    @NotNull(message = "Estimated delivery date is required")
    @FutureOrPresent(message = "Estimated delivery date must be in the present or future")
    private LocalDate estimatedDelivery;
}
```

## 12.4 Response DTOs (What the API Returns)

```java
// AuthResponse — login/register response (NO password!)
@Data @Builder
public class AuthResponse {
    private String token;
    private Long userId;
    private String name;
    private String email;
    private String role;
}

// OrderResponse — order details for client
@Data @Builder
public class OrderResponse {
    private Long id;
    private Long userId;
    private OrderStatus status;
    private BigDecimal totalAmount;
    private String shippingAddress;
    private String shippingPhone;
    private LocalDateTime createdAt;
    private List<OrderItemResponse> items;
}
```

## 12.5 Validation Annotations Used

| Annotation | Purpose | Example |
|-----------|---------|---------|
| `@NotNull` | Field must not be null | `@NotNull(message = "Order ID is required")` |
| `@NotBlank` | String must not be null/empty/whitespace | `@NotBlank(message = "Carrier is required")` |
| `@Min` | Minimum numeric value | `@Min(value = 0, message = "Quantity cannot be negative")` |
| `@FutureOrPresent` | Date must be today or future | `@FutureOrPresent(message = "...")` |
| `@Valid` | Triggers validation on method parameter | `createShipment(@Valid @RequestBody ShipmentCreateRequest request)` |

**How validation works:**
1. Client sends request with invalid data (e.g., missing orderId)
2. `@Valid` triggers Bean Validation on the DTO
3. If validation fails → `MethodArgumentNotValidException` thrown
4. `GlobalExceptionHandler` catches it → returns 400 with error messages

---

# 13. Folder Structure Explanation

```
Backend/src/main/java/com/ecommerce/
├── EcommerceOrderTracking/
│   └── EcommerceOrderTrackingApplication.java   ← Main entry point
├── config/
│   ├── AppConfig.java             ← UserDetailsService bean
│   ├── CorsConfig.java            ← CORS configuration
│   ├── DataSeeder.java            ← Seeds default data on startup
│   ├── JwtAuthFilter.java         ← JWT authentication filter
│   ├── JwtUtil.java               ← JWT token generation/validation
│   └── SecurityConfig.java        ← Spring Security configuration
├── controller/
│   ├── AdminController.java       ← Admin APIs (dashboard, user mgmt)
│   ├── AuthController.java        ← Registration, Login, Password Reset
│   ├── HomeController.java        ← Health check endpoint
│   ├── InventoryController.java   ← Stock management APIs
│   ├── NewOrderController.java    ← Order CRUD APIs
│   ├── ProductController.java     ← Product CRUD APIs
│   ├── ReturnRefundController.java← Returns and refunds
│   ├── ShipmentController.java    ← Shipment tracking APIs
│   ├── ShippingController.java    ← Address validation, labels
│   └── UserController.java        ← User profile APIs
├── dto/
│   ├── AuthResponse.java          ← Login/Register response
│   ├── DashboardResponse.java     ← Admin dashboard data
│   ├── ErrorResponse.java         ← Standardized error format
│   ├── ForgotPasswordRequest.java ← Forgot password input
│   ├── InventoryResponse.java     ← Stock info response
│   ├── InventoryUpdateRequest.java← Stock update input
│   ├── LoginRequest.java          ← Login input
│   ├── OrderItemRequest.java      ← Order item input
│   ├── OrderResponse.java         ← Order details response
│   ├── OrderStatusResponse.java   ← Status update response
│   ├── OrderStatusUpdateRequest.java ← Status update input
│   ├── PlaceOrderRequest.java     ← Place order input
│   ├── RegisterRequest.java       ← Registration input
│   ├── ResetPasswordRequest.java  ← Reset password input
│   ├── ShipmentCreateRequest.java ← Create shipment input
│   ├── ShipmentResponse.java      ← Shipment details response
│   ├── ShipmentStatusUpdateRequest.java ← Shipment update input
│   ├── UserResponseDto.java       ← User profile response
│   └── UserUpdateRequestDto.java  ← User update input
├── entity/
│   ├── Inventory.java             ← inventory table
│   ├── Order.java                 ← orders table
│   ├── OrderItem.java             ← order_items table
│   ├── Product.java               ← products table
│   ├── Shipment.java              ← shipments table
│   └── User.java                  ← users table
├── enums/
│   ├── OrderStatus.java           ← PENDING, CONFIRMED, PACKED, etc.
│   ├── Role.java                  ← ROLE_USER, ROLE_ADMIN
│   └── ShipmentStatus.java        ← PROCESSING, IN_TRANSIT, etc.
├── exception/
│   ├── GlobalExceptionHandler.java← Centralized error handling
│   └── ResourceNotFoundException.java ← Custom 404 exception
├── repository/
│   ├── InventoryEntityRepository.java ← Inventory DB operations
│   ├── OrderEntityRepository.java     ← Order DB operations
│   ├── OrderItemRepository.java       ← OrderItem DB operations
│   ├── ProductEntityRepository.java   ← Product DB operations
│   ├── ShipmentEntityRepository.java  ← Shipment DB operations
│   └── UserRepository.java           ← User DB operations
├── service/
│   ├── InventoryService.java      ← Inventory interface
│   ├── NewOrderService.java       ← Order interface
│   ├── OrderService.java          ← Legacy order interface
│   ├── OtpService.java            ← OTP generation/validation
│   ├── ShipmentService.java       ← Shipment interface
│   ├── UserService.java           ← User interface
│   └── impl/
│       └── UserServiceImpl.java   ← User service implementation
└── serviceImpl/
    ├── InventoryServiceImpl.java  ← Inventory service implementation
    ├── NewOrderServiceImpl.java   ← Order service implementation
    ├── OrderServiceImpl.java      ← Legacy order implementation
    └── ShipmentServiceImpl.java   ← Shipment service implementation
```

### Clean Architecture Principles Applied

1. **Separation of Concerns:** Each package has ONE responsibility
2. **Dependency Inversion:** Controllers depend on Service interfaces, not implementations
3. **Single Responsibility:** Each class does one thing well
4. **Open/Closed:** New features added by creating new classes, not modifying existing ones
5. **Interface Segregation:** Service interfaces are focused (not one giant interface)
