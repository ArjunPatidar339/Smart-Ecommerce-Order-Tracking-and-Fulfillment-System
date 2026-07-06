# 📘 E-Commerce Order Tracking System — Complete Project Guide (Part 5)

## Table of Contents — Part 5
18. [Internal Spring Boot Concepts](#18-internal-spring-boot-concepts)
19. [Textual Diagrams](#19-textual-diagrams)
20. [Final Revision Section](#20-final-revision-section)

---

# 18. Internal Spring Boot Concepts

## 18.1 IoC Container (Inversion of Control)

**What is it?** The IoC Container is the core of Spring Framework. It creates, configures, and manages all beans (objects). Instead of YOU creating objects with `new`, SPRING creates them for you.

**Without IoC (Traditional):**
```java
// Developer manually creates objects
UserRepository repo = new UserRepositoryImpl();
UserService service = new UserServiceImpl(repo);  // Manual wiring!
UserController controller = new UserController(service);
```

**With IoC (Spring):**
```java
@Service
public class UserServiceImpl {
    private final UserRepository repo;  // Spring injects this automatically!
}
```

**How it works in our project:**
1. Spring scans `com.ecommerce` package for annotated classes
2. Creates instances of all `@Component`, `@Service`, `@Repository`, `@Controller` classes
3. Resolves dependencies and injects them via constructors
4. Stores all beans in the ApplicationContext (the IoC Container)

## 18.2 Dependency Injection (DI)

**Three types of DI:**

```java
// 1. Constructor Injection (USED IN OUR PROJECT - RECOMMENDED)
@RequiredArgsConstructor
public class AuthController {
    private final UserRepository userRepository;     // Injected via constructor
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
}

// 2. Field Injection (NOT recommended)
public class SomeService {
    @Autowired
    private UserRepository userRepository;  // Injected directly into field
}

// 3. Setter Injection (Rarely used)
public class SomeService {
    private UserRepository userRepository;
    
    @Autowired
    public void setUserRepository(UserRepository repo) {
        this.userRepository = repo;
    }
}
```

**Why Constructor Injection is best:**
- Fields can be `final` (immutable, thread-safe)
- Dependencies are explicit and required
- Easy to unit test (pass mocks via constructor)
- Fails fast at startup if dependency is missing

## 18.3 Bean Lifecycle

```
1. Spring Container Starts
        │
2. Bean Definition Loading
   (Scans @Component, @Service, @Repository, @Configuration classes)
        │
3. Bean Instantiation
   (Creates objects using constructors)
        │
4. Dependency Injection
   (Injects all @Autowired / constructor dependencies)
        │
5. @PostConstruct Method Called
   (Initialization logic)
        │
6. Bean is Ready for Use
   (Application is running, beans serve requests)
        │
7. Application Shutdown
        │
8. @PreDestroy Method Called
   (Cleanup logic)
        │
9. Bean Destroyed
```

**In our project:**
- `DataSeeder` implements `CommandLineRunner` → its `run()` method is called after step 6
- It creates the default admin user and demo products

## 18.4 DispatcherServlet

**What is it?** The DispatcherServlet is the **front controller** of Spring MVC. It's the single entry point for ALL HTTP requests.

```
HTTP Request (POST /api/orders)
        │
        ▼
┌─────────────────────┐
│  DispatcherServlet  │  ← Receives ALL requests
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  HandlerMapping     │  ← Finds: POST /api/orders → NewOrderController.placeOrder()
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  HandlerAdapter     │  ← Invokes the controller method
│  (resolves params)  │  ← Converts JSON body → PlaceOrderRequest (@RequestBody)
│                     │  ← Extracts path variables (@PathVariable)
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│  Controller Method  │  ← placeOrder() executes
│  Returns Object     │  ← Returns ResponseEntity<OrderResponse>
└────────┬────────────┘
         │
         ▼
┌─────────────────────┐
│ HttpMessageConverter│  ← Jackson converts OrderResponse → JSON string
│ (Jackson)           │
└────────┬────────────┘
         │
         ▼
    HTTP Response (200 OK with JSON body)
```

## 18.5 Auto-Configuration

**How Spring Boot knows what to configure:**

1. You add `spring-boot-starter-web` to `pom.xml`
2. This includes Tomcat, Jackson, Spring MVC
3. Spring Boot's auto-configuration detects these on the classpath
4. It automatically creates and configures:
   - Embedded Tomcat server on port 8080
   - DispatcherServlet
   - Jackson ObjectMapper for JSON
   - Error handling defaults

**Similarly for JPA:**
1. `spring-boot-starter-data-jpa` + `mysql-connector-j` in `pom.xml`
2. Spring Boot detects them + reads `application.properties`
3. Auto-creates: DataSource, EntityManagerFactory, TransactionManager, HikariCP pool

## 18.6 Starter Dependencies

Starters are **pre-packaged dependency bundles** that bring in everything you need:

| Starter | What It Includes |
|---------|-----------------|
| `spring-boot-starter-web` | Tomcat, Spring MVC, Jackson, Validation |
| `spring-boot-starter-data-jpa` | Hibernate, Spring Data JPA, Transaction Manager |
| `spring-boot-starter-security` | Spring Security, BCrypt, Filter Chain |
| `spring-boot-starter-validation` | Hibernate Validator, Bean Validation |
| `spring-boot-starter-mail` | JavaMail, Spring Mail |
| `spring-boot-starter-test` | JUnit, Mockito, Spring Test |

## 18.7 Embedded Tomcat

**Traditional Java deployment:** Build WAR file → Deploy to external Tomcat server
**Spring Boot:** Tomcat is EMBEDDED inside the JAR file!

- When `SpringApplication.run()` is called, it starts an embedded Tomcat server
- Default port: 8080 (configured in `application.properties`)
- No external server installation needed
- Run with: `java -jar app.jar` or `mvn spring-boot:run`

---

# 19. Textual Diagrams

## 19.1 Architecture Diagram

```
┌────────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React + Vite)                      │
│                        http://localhost:5173                         │
│  ┌──────┐  ┌──────────┐  ┌──────────┐  ┌───────────┐  ┌────────┐ │
│  │Login │  │ Products │  │  Orders  │  │  Tracking │  │ Admin  │ │
│  │Page  │  │  Page    │  │  Page    │  │   Page    │  │ Panel  │ │
│  └──────┘  └──────────┘  └──────────┘  └───────────┘  └────────┘ │
└──────────────────────────┬─────────────────────────────────────────┘
                           │ REST API (JSON over HTTP)
                           │ Authorization: Bearer <JWT>
                           ▼
┌────────────────────────────────────────────────────────────────────┐
│                     BACKEND (Spring Boot 3.5)                       │
│                     http://localhost:8080                            │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ SECURITY: JwtAuthFilter → SecurityFilterChain → CORS        │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐   │
│  │ CONTROLLERS                                                  │   │
│  │ Auth │ Product │ Order │ Admin │ Shipment │ User │ Inventory │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐   │
│  │ SERVICES                                                     │   │
│  │ OrderService │ ShipmentService │ InventoryService │ OtpSvc   │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│                                │                                    │
│  ┌─────────────────────────────▼───────────────────────────────┐   │
│  │ REPOSITORIES (Spring Data JPA)                               │   │
│  │ UserRepo │ OrderRepo │ ProductRepo │ ShipmentRepo │ InvRepo  │   │
│  └─────────────────────────────┬───────────────────────────────┘   │
│                                │ Hibernate ORM                      │
└────────────────────────────────┼────────────────────────────────────┘
                                 │ JDBC (HikariCP Connection Pool)
                                 ▼
┌────────────────────────────────────────────────────────────────────┐
│                        MySQL 8.0 Database                           │
│                     ecommerce_db (port 3306)                        │
│  ┌───────┐ ┌──────────┐ ┌────────┐ ┌─────────────┐ ┌───────────┐ │
│  │ users │ │ products │ │ orders │ │ order_items  │ │ shipments │ │
│  └───────┘ └──────────┘ └────────┘ └─────────────┘ └───────────┘ │
│  ┌───────────┐                                                     │
│  │ inventory │                                                     │
│  └───────────┘                                                     │
└────────────────────────────────────────────────────────────────────┘
```

## 19.2 API Flow Diagram

```
Client Request                                Server Processing
─────────────                                ─────────────────

POST /api/orders                    DispatcherServlet
  + JSON Body        ──────────>        │
  + JWT Token                           ▼
                                   JwtAuthFilter
                                   Extract Token
                                   Validate Token
                                   Set SecurityContext
                                        │
                                        ▼
                                   SecurityFilterChain
                                   Check Authorization
                                        │
                                        ▼
                                   NewOrderController
                                   .placeOrder()
                                        │
                                        ▼
                                   NewOrderServiceImpl
                                   .placeOrder()
                                   ├── Validate User
                                   ├── Check Inventory
                                   ├── Deduct Stock
                                   ├── Create Order
                                   ├── Create Items
                                   └── Create Shipment
                                        │
                                        ▼
                                   OrderEntityRepository
                                   .save(order)
                                        │
                                        ▼
                                   Hibernate → SQL
                                   INSERT INTO orders...
                                   INSERT INTO order_items...
                                   UPDATE inventory...
                                   INSERT INTO shipments...
                                        │
                                        ▼
    200 OK              <──────    MySQL Database
  + OrderResponse JSON                  ✓ Data Persisted
```

## 19.3 Authentication Flow Diagram

```
┌──────────┐                    ┌──────────────┐                 ┌────────┐
│  Client  │                    │    Server    │                 │  MySQL │
└────┬─────┘                    └──────┬───────┘                 └───┬────┘
     │                                 │                             │
     │ 1. POST /api/auth/login         │                             │
     │    {email, password}            │                             │
     │ ───────────────────────────────>│                             │
     │                                 │ 2. Find user by email       │
     │                                 │ ──────────────────────────>│
     │                                 │                             │
     │                                 │ 3. Return User entity       │
     │                                 │ <──────────────────────────│
     │                                 │                             │
     │                                 │ 4. BCrypt.matches(password) │
     │                                 │    ✓ Password valid         │
     │                                 │                             │
     │                                 │ 5. Generate JWT Token       │
     │                                 │    Header + Payload + Sign  │
     │                                 │                             │
     │ 6. Return AuthResponse          │                             │
     │    {token, userId, name, role}  │                             │
     │ <───────────────────────────────│                             │
     │                                 │                             │
     │ 7. GET /api/orders/user         │                             │
     │    Authorization: Bearer JWT    │                             │
     │ ───────────────────────────────>│                             │
     │                                 │ 8. JwtAuthFilter:           │
     │                                 │    Extract token            │
     │                                 │    Decode email             │
     │                                 │    Load user from DB        │
     │                                 │    Validate signature       │
     │                                 │    Set SecurityContext      │
     │                                 │                             │
     │ 9. Return orders data           │                             │
     │ <───────────────────────────────│                             │
```

## 19.4 Database Relation Diagram

```
┌─────────────────┐       ┌──────────────────┐       ┌─────────────────┐
│     USERS       │       │     ORDERS       │       │   ORDER_ITEMS   │
├─────────────────┤       ├──────────────────┤       ├─────────────────┤
│ id (PK)         │──┐    │ id (PK)          │──┐    │ id (PK)         │
│ name            │  │    │ user_id (FK)─────│──┘    │ order_id (FK)───│──→ ORDERS
│ email (UNIQUE)  │  └──→ │ status           │       │ product_id (FK) │──→ PRODUCTS
│ password        │       │ total_amount     │       │ quantity        │
│ phone           │       │ shipping_address │       │ price_at_purchase│
│ address         │       │ shipping_phone   │       └─────────────────┘
│ role            │       │ created_at       │
└─────────────────┘       └──────────────────┘
                                  │
                                  │ 1:1
                                  ▼
┌─────────────────┐       ┌──────────────────┐
│    PRODUCTS     │       │    SHIPMENTS     │
├─────────────────┤       ├──────────────────┤
│ id (PK)         │       │ id (PK)          │
│ name            │       │ order_id (FK, UQ)│──→ ORDERS
│ brand           │       │ carrier          │
│ category        │       │ tracking_number  │
│ description     │       │ status           │
│ price           │       │ estimated_delivery│
│ original_price  │       │ created_at       │
│ rating          │       └──────────────────┘
│ reviews         │
│ image           │
│ stock           │
└────────┬────────┘
         │ 1:1
         ▼
┌─────────────────┐
│   INVENTORY     │
├─────────────────┤
│ id (PK)         │
│ product_id (FK) │──→ PRODUCTS
│ available_stock │
│ last_updated    │
└─────────────────┘

Relationships:
  USERS     ──1:N──>  ORDERS      (One user has many orders)
  ORDERS    ──1:N──>  ORDER_ITEMS (One order has many items)
  PRODUCTS  ──1:N──>  ORDER_ITEMS (One product in many orders)
  ORDERS    ──1:1──>  SHIPMENTS   (One shipment per order)
  PRODUCTS  ──1:1──>  INVENTORY   (One inventory per product)
```

---

# 20. Final Revision Section

## 20.1 Quick Revision Notes

### Tech Stack
- **Backend:** Spring Boot 3.5, Java 21, Maven
- **Frontend:** React 19, Vite 5, Axios
- **Database:** MySQL 8.0, Hibernate 6.6, Spring Data JPA
- **Security:** Spring Security, JWT (jjwt 0.11.5), BCrypt
- **Others:** Lombok, HikariCP, JavaMail

### Key Numbers
- **6 Entities:** User, Product, Order, OrderItem, Shipment, Inventory
- **10 Controllers:** Auth, Product, Order, Admin, Shipment, User, Inventory, Shipping, ReturnRefund, Home
- **6 Repositories:** User, Order, Product, Shipment, Inventory, OrderItem
- **6 Services:** NewOrder, Shipment, Inventory, Order, User, OTP
- **19 DTOs:** 11 Request + 8 Response
- **8 Order Statuses:** PENDING, CONFIRMED, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED, RETURNED
- **2 Roles:** ROLE_USER, ROLE_ADMIN

### Architecture Flow
```
Client → JWT Filter → Security → Controller → Service → Repository → Hibernate → MySQL
```

## 20.2 Cheat Sheet

| Concept | This Project's Implementation |
|---------|-------------------------------|
| Entry Point | `EcommerceOrderTrackingApplication.java` with `@SpringBootApplication` |
| Controllers | `@RestController` + `@RequestMapping` |
| Services | Interface + `@Service` Implementation |
| Repositories | `extends JpaRepository<Entity, Long>` |
| Entities | `@Entity` + `@Table` + Lombok |
| Authentication | JWT token in Authorization header |
| Authorization | `@PreAuthorize("hasAuthority('ROLE_ADMIN')")` |
| Error Handling | `@RestControllerAdvice` + `@ExceptionHandler` |
| Data Seeding | `CommandLineRunner` in `DataSeeder` |
| CORS | `CorsConfigurationSource` in SecurityConfig |
| Password | `BCryptPasswordEncoder` |
| Transactions | `@Transactional` on service methods |

## 20.3 Most Important Interview Questions (Top 10)

1. **Tell me about your project** → See Section 15.1
2. **Explain one complete API flow** → Place Order API (Section 4.4)
3. **How does JWT authentication work?** → Section 10.2 and 10.3
4. **What is @Transactional?** → Wraps method in DB transaction, rollback on failure
5. **Difference between JPA and Hibernate?** → JPA = specification, Hibernate = implementation
6. **What is layered architecture?** → Controller → Service → Repository → DB
7. **How does Spring Data generate queries?** → Parses method names (findByEmail → WHERE email = ?)
8. **What is Dependency Injection?** → Spring creates and injects dependencies automatically
9. **Entity vs DTO?** → Entity maps to DB table, DTO carries data for API without exposing internals
10. **What is CascadeType.ALL?** → Parent operations cascade to children (save parent = save children)

## 20.4 2-Minute Project Explanation

"I built a **full-stack E-Commerce Order Tracking System** using **Spring Boot** backend and **React** frontend with **MySQL** database. Customers can register, browse products, place orders, and **track delivery status in real-time**. Admins manage users, products, inventory, and update order statuses through a dashboard. I implemented **JWT authentication**, **layered architecture** (Controller-Service-Repository), **Spring Data JPA** with Hibernate for database operations, and **centralized exception handling**. The system supports the complete order lifecycle from PENDING through DELIVERED with automatic shipment tracking."

## 20.5 5-Minute Detailed Explanation

Use the answer from Section 15.1 (5-Minute Detailed Version).

## 20.6 HR + Technical Combined Answers

**"Why did you choose this project?"**
"E-commerce is a real-world domain that covers all important backend concepts — authentication, CRUD operations, relational databases, role-based access, and status management. It demonstrates my ability to build production-ready applications."

**"What was the most challenging part?"**
"Implementing the order placement flow with transactional consistency. When a customer places an order, I need to validate inventory, deduct stock, create the order with items, and create a shipment — all atomically. Using `@Transactional` ensures if any step fails, everything rolls back."

**"What did you learn from this project?"**
"I gained deep understanding of Spring Boot internals — how auto-configuration works, how Hibernate maps objects to SQL, how JWT stateless authentication works, and the importance of layered architecture for maintainability. I also learned practical skills like centralized error handling and data seeding."

**"How would you improve this project?"**
"I would add: 1) Payment gateway integration (Razorpay/Stripe), 2) WebSocket for real-time order updates instead of polling, 3) Redis caching for product listings, 4) Email notifications on status changes, 5) Pagination and search for products, 6) Unit and integration tests, 7) Docker containerization for deployment."

**"Did you work in a team?"**
"This was an individual project where I handled both frontend and backend development. I followed clean code practices — separating concerns with layered architecture, using interfaces for services, and maintaining consistent error handling."

**"What technologies are you comfortable with?"**
"I'm proficient in Java, Spring Boot, Spring Data JPA, Hibernate, MySQL, REST APIs, and React. I understand core concepts like ORM, dependency injection, JWT security, and layered architecture. I'm also familiar with Git, Maven, and basic deployment practices."

---

## 📌 Remember for Viva

1. **Always explain with flow:** Client → Controller → Service → Repository → Database
2. **Mention annotations:** Name the specific annotations used in each layer
3. **Use project examples:** Reference actual classes like `NewOrderServiceImpl`, `AuthController`
4. **Know the WHY:** Why JWT? (stateless), Why DTOs? (security + decoupling), Why @Transactional? (data consistency)
5. **Be ready for code walkthrough:** Be able to explain `placeOrder()` method line by line
