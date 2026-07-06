# 📘 E-Commerce Order Tracking System — Complete Project Guide (Part 2)

## Table of Contents — Part 2
5. [Every Important Annotation Explained](#5-every-important-annotation-explained)
6. [CRUD Operation Internal Working](#6-crud-operation-internal-working)
7. [Spring Data JPA Deep Explanation](#7-spring-data-jpa-deep-explanation)
8. [Hibernate Internal Working](#8-hibernate-internal-working)

---

# 5. Every Important Annotation Explained

## 5.1 @SpringBootApplication
```java
@SpringBootApplication(scanBasePackages = "com.ecommerce")
public class EcommerceOrderTrackingApplication { ... }
```
**Purpose:** This is a **3-in-1 annotation** that combines:
- `@Configuration` — Marks this class as a source of bean definitions
- `@EnableAutoConfiguration` — Tells Spring Boot to automatically configure beans based on classpath dependencies (e.g., if `spring-boot-starter-web` is present, it auto-configures Tomcat, Jackson, etc.)
- `@ComponentScan` — Scans the base package and sub-packages for `@Component`, `@Service`, `@Repository`, `@Controller` classes

**How Spring Processes It:**
1. JVM starts `main()` method
2. `SpringApplication.run()` creates the ApplicationContext
3. Spring scans `com.ecommerce` package for all annotated classes
4. Auto-configures DataSource, JPA, Security, Web MVC based on dependencies in `pom.xml`

**Interview Q:** *Why do we use `scanBasePackages`?*
**A:** Because our main class is in `com.ecommerce.EcommerceOrderTracking` but our components are in `com.ecommerce.controller`, `com.ecommerce.service`, etc. Without `scanBasePackages`, Spring would only scan the main class's package.

## 5.2 @RestController
```java
@RestController
@RequestMapping("/api/auth")
public class AuthController { ... }
```
**Purpose:** Combines `@Controller` + `@ResponseBody`. Every method return value is automatically serialized to JSON and written to the HTTP response body.

**Difference from @Controller:**
- `@Controller` → Returns view names (HTML pages, Thymeleaf templates)
- `@RestController` → Returns data (JSON/XML) directly

**How Spring Processes It:** When a method returns an object, Spring uses `HttpMessageConverter` (Jackson) to convert it to JSON automatically.

## 5.3 @Service
```java
@Service
@RequiredArgsConstructor
public class NewOrderServiceImpl implements NewOrderService { ... }
```
**Purpose:** Marks a class as a **business logic component**. It is a specialization of `@Component`.

**Why not just use @Component?**
- Semantic clarity — developers know this class contains business logic
- Spring may apply service-specific features (like transaction proxies)
- AOP (Aspect-Oriented Programming) can target all `@Service` beans

## 5.4 @Repository
```java
@Repository
public interface UserRepository extends JpaRepository<User, Long> { ... }
```
**Purpose:** Marks a class/interface as a **data access component**. Specialization of `@Component`.

**Special behavior:** Automatically translates database exceptions (like `SQLException`) into Spring's `DataAccessException` hierarchy.

## 5.5 @Autowired vs @RequiredArgsConstructor
```java
// Method 1: @Autowired (field injection - NOT recommended)
@Autowired
private UserRepository userRepository;

// Method 2: Constructor injection via Lombok (RECOMMENDED - used in this project)
@RequiredArgsConstructor  // Lombok generates constructor for all 'final' fields
public class AuthController {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
}
```

**Why Constructor Injection is better:**
1. Fields can be `final` (immutable)
2. Easier to write unit tests (pass mocks via constructor)
3. Makes dependencies explicit
4. Spring officially recommends it

## 5.6 @Entity and @Table
```java
@Entity
@Table(name = "users")
public class User implements UserDetails { ... }
```
**@Entity:** Tells Hibernate "this Java class represents a database table"
**@Table:** Specifies the exact table name in MySQL. Without it, Hibernate uses the class name.

**How Spring Processes It:**
1. `@EntityScan` finds all `@Entity` classes
2. Hibernate creates a mapping: `User.java` ↔ `users` table
3. With `ddl-auto=update`, Hibernate auto-creates/updates the table schema

## 5.7 @Id and @GeneratedValue
```java
@Id
@GeneratedValue(strategy = GenerationType.IDENTITY)
private Long id;
```
**@Id:** Marks this field as the **primary key**
**@GeneratedValue(strategy = GenerationType.IDENTITY):** The database auto-generates the ID (MySQL `AUTO_INCREMENT`)

**GenerationType options:**
| Strategy | Description |
|----------|------------|
| `IDENTITY` | Database auto-increment (used in this project) |
| `SEQUENCE` | Uses database sequence (PostgreSQL) |
| `TABLE` | Uses a separate table to generate IDs |
| `AUTO` | Hibernate chooses the best strategy |

## 5.8 @RequestMapping, @GetMapping, @PostMapping, @PutMapping, @DeleteMapping
```java
@RequestMapping("/api/orders")     // Base path for all methods in this controller
@PostMapping                       // POST /api/orders
@GetMapping("/{id}")               // GET /api/orders/1
@PutMapping("/{id}/cancel")        // PUT /api/orders/1/cancel
@DeleteMapping("/{id}")            // DELETE /api/orders/1
```
**Purpose:** Map HTTP requests to specific controller methods based on URL pattern and HTTP method.

**How Spring Processes It:**
1. `DispatcherServlet` receives the request
2. `HandlerMapping` matches URL + HTTP method to a controller method
3. The matched method is invoked

## 5.9 @RequestBody
```java
public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) { ... }
```
**Purpose:** Tells Spring to **deserialize the HTTP request body (JSON)** into a Java object using Jackson.

**Internal process:**
1. Spring reads the raw JSON string from request body
2. Jackson's `ObjectMapper` converts JSON fields to Java object fields
3. The populated object is passed to the method parameter

## 5.10 @PathVariable
```java
@GetMapping("/{id}")
public ResponseEntity<Product> getProductById(@PathVariable Long id) { ... }
```
**Purpose:** Extracts a value from the **URL path**. For URL `/api/products/5`, `id` = 5.

## 5.11 @RequestParam
```java
@GetMapping("/user")
public ResponseEntity<List<OrderResponse>> getUserOrders(@RequestParam Long userId) { ... }
```
**Purpose:** Extracts a value from the **query string**. For URL `/api/orders/user?userId=2`, `userId` = 2.

**Difference:** `@PathVariable` = part of URL path. `@RequestParam` = query parameter after `?`.

## 5.12 @Component
```java
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner { ... }
```
**Purpose:** Generic annotation that marks a class as a Spring-managed bean. `@Service`, `@Repository`, `@Controller` are all specializations of `@Component`.

## 5.13 @Bean
```java
@Bean
public PasswordEncoder passwordEncoder() {
    return new BCryptPasswordEncoder();
}
```
**Purpose:** Tells Spring "the object returned by this method should be managed as a bean in the IoC container."

**When to use @Bean vs @Component:**
- `@Component` — When you own the class (your own code)
- `@Bean` — When you need to configure a third-party class (like `BCryptPasswordEncoder`)

## 5.14 @Configuration
```java
@Configuration
@EnableWebSecurity
public class SecurityConfig { ... }
```
**Purpose:** Marks a class as a source of `@Bean` definitions. Spring processes these classes at startup to register beans.

## 5.15 @Transactional
```java
@Override
@Transactional
public OrderResponse placeOrder(PlaceOrderRequest request) { ... }
```
**Purpose:** Wraps the entire method in a **database transaction**. If any exception occurs, ALL database changes in this method are **rolled back**.

**Example in this project:** When placing an order:
1. Deduct inventory ✓
2. Save order ✓
3. Save order items ✗ (fails!)
→ `@Transactional` rolls back step 1 and 2 automatically!

**Interview Q:** *What happens if @Transactional is not used?*
**A:** If step 3 fails, inventory would still be deducted (step 1) even though the order wasn't created — leaving the database in an inconsistent state.

## 5.16 Other Important Annotations Used

### @PreAuthorize
```java
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController { ... }
```
Checks if the authenticated user has the required role BEFORE the method executes.

### @Enumerated
```java
@Enumerated(EnumType.STRING)
private OrderStatus status = OrderStatus.PENDING;
```
Stores the enum value as a String in the database (e.g., "PENDING") instead of its ordinal number.

### @Column
```java
@Column(unique = true, nullable = false)
private String email;
```
Customizes the database column (unique constraint, not-null constraint, column name, etc.).

### @ManyToOne / @OneToMany / @OneToOne
```java
@ManyToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "user_id", nullable = false)
private User user;  // Many orders belong to one user

@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItem> items;  // One order has many items

@OneToOne(fetch = FetchType.LAZY)
@JoinColumn(name = "order_id", nullable = false, unique = true)
private Order order;  // One shipment per order
```

### @Builder (Lombok)
```java
@Builder
public class User { ... }
// Usage:
User user = User.builder().name("Arjun").email("arjun@test.com").build();
```
Generates the Builder design pattern automatically.

---

# 6. CRUD Operation Internal Working

## 6.1 CREATE — save()
```java
Product savedProduct = productRepository.save(product);
```
**Internal Steps:**
1. `save()` is called on the JpaRepository
2. Spring Data delegates to `EntityManager.persist()` (for new entities) or `EntityManager.merge()` (for existing)
3. Hibernate checks if the entity has an ID:
   - No ID → `persist()` → generates INSERT SQL
   - Has ID → `merge()` → generates UPDATE SQL
4. Hibernate adds the entity to the **Persistence Context** (first-level cache)
5. SQL is generated: `INSERT INTO products (name, brand, ...) VALUES (?, ?, ...)`
6. On transaction commit, SQL is flushed to MySQL
7. MySQL auto-generates the ID (AUTO_INCREMENT)
8. Hibernate sets the generated ID on the Java object

## 6.2 READ — findById() and findAll()
```java
Optional<Product> product = productRepository.findById(1L);
List<Product> allProducts = productRepository.findAll();
```
**findById Internal Steps:**
1. Hibernate first checks the **Persistence Context** (first-level cache)
2. If found in cache → returns cached entity (no SQL executed!)
3. If not in cache → generates: `SELECT * FROM products WHERE id = ?`
4. MySQL returns the row
5. Hibernate maps the ResultSet to a Product Java object
6. Entity is stored in the Persistence Context for future lookups

**findAll Internal Steps:**
1. Generates: `SELECT * FROM products`
2. Maps each row to a Product object
3. Returns a `List<Product>`

## 6.3 UPDATE — save() on existing entity
```java
product.setName("Updated Name");
productRepository.save(product);
```
**Internal Steps:**
1. `save()` detects the entity has an ID → calls `merge()`
2. Hibernate uses **Dirty Checking**: compares current field values with the original snapshot
3. If changes detected → generates: `UPDATE products SET name = ? WHERE id = ?`
4. Only changed columns are updated (optimized)

## 6.4 DELETE — deleteById() / delete()
```java
productRepository.deleteById(1L);
// or
productRepository.delete(product);
```
**Internal Steps:**
1. Hibernate first loads the entity (if not already in context)
2. Removes entity from Persistence Context
3. Generates: `DELETE FROM products WHERE id = ?`
4. On transaction commit, SQL is flushed to MySQL

## 6.5 Key Concepts

### Persistence Context
- A **cache** that Hibernate maintains during a session/transaction
- All loaded entities are stored here
- Ensures that the same database row always returns the same Java object instance
- Acts as a "unit of work" — tracks all changes

### Dirty Checking
- Hibernate keeps a **snapshot** of every entity when it's first loaded
- Before flushing, it compares current values with the snapshot
- Only generates UPDATE SQL for fields that actually changed
- This happens automatically — no need to explicitly call update

### Transaction Management
- `@Transactional` creates a transaction boundary
- All database operations within the method are part of ONE transaction
- If any operation fails → entire transaction is rolled back
- On success → transaction is committed, all SQL is flushed to DB

---

# 7. Spring Data JPA Deep Explanation

## 7.1 What is JPA?
**JPA (Java Persistence API)** is a **specification** (like an interface) that defines how Java objects should be mapped to relational database tables. It is NOT an implementation — it just defines the rules.

**Think of it as:** JPA is the "contract" that says "you must have methods like persist(), find(), remove()."

## 7.2 What is Hibernate?
**Hibernate** is the most popular **implementation** of the JPA specification. It provides the actual code that maps Java objects to SQL queries.

**Think of it as:** Hibernate is the "engine" that actually does the work defined by JPA.

## 7.3 Difference Between JPA and Hibernate

| Aspect | JPA | Hibernate |
|--------|-----|-----------|
| Type | Specification (interface) | Implementation (concrete) |
| Package | `jakarta.persistence` | `org.hibernate` |
| Provides | Annotations & interfaces | Working ORM framework |
| Standalone? | No | Yes (can work without JPA) |
| Example | `@Entity`, `EntityManager` | `Session`, `SessionFactory` |

**Analogy:** JPA is like the `List` interface, Hibernate is like `ArrayList` implementation.

## 7.4 How JpaRepository Works Internally

```java
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
}
```

**Internal Magic:**
1. You NEVER write the implementation — Spring creates it automatically!
2. At startup, Spring Data finds all interfaces extending `JpaRepository`
3. Creates a **proxy class** (using `SimpleJpaRepository`) at runtime
4. This proxy provides implementations for all standard methods (`save`, `findById`, `findAll`, `delete`, etc.)
5. For custom methods like `findByEmail`, it parses the method name and generates JPQL automatically

**Standard methods provided by JpaRepository:**
| Method | SQL Generated |
|--------|--------------|
| `save(entity)` | INSERT or UPDATE |
| `findById(id)` | SELECT WHERE id = ? |
| `findAll()` | SELECT * |
| `deleteById(id)` | DELETE WHERE id = ? |
| `count()` | SELECT COUNT(*) |
| `existsById(id)` | SELECT COUNT(*) WHERE id = ? |

## 7.5 Query Method Generation (Derived Queries)

Spring Data JPA can **generate queries from method names** by parsing the method name:

```java
// Method name → Generated SQL
findByEmail(String email)
→ SELECT * FROM users WHERE email = ?

findByUser_Id(Long userId)
→ SELECT * FROM orders WHERE user_id = ?

findByProduct_Id(Long productId)
→ SELECT * FROM inventory WHERE product_id = ?

findByOrder_Id(Long orderId)
→ SELECT * FROM shipments WHERE order_id = ?
```

**Naming Convention Rules:**
| Keyword | Example | SQL |
|---------|---------|-----|
| `findBy` | `findByName(String name)` | WHERE name = ? |
| `And` | `findByNameAndBrand(...)` | WHERE name = ? AND brand = ? |
| `Or` | `findByNameOrBrand(...)` | WHERE name = ? OR brand = ? |
| `OrderBy` | `findByBrandOrderByPriceAsc(...)` | ORDER BY price ASC |
| `Between` | `findByPriceBetween(min, max)` | WHERE price BETWEEN ? AND ? |
| `LessThan` | `findByPriceLessThan(price)` | WHERE price < ? |
| `Like` | `findByNameLike(pattern)` | WHERE name LIKE ? |
| `In` | `findByStatusIn(List statuses)` | WHERE status IN (?, ?) |

## 7.6 Custom Queries (JPQL and Native)

**JPQL (Java Persistence Query Language):**
```java
@Query("SELECT o FROM Order o WHERE o.user.id = :userId AND o.status = :status")
List<Order> findByUserIdAndStatus(@Param("userId") Long userId, @Param("status") OrderStatus status);
```
- JPQL uses **entity names and field names** (not table/column names)
- Database-independent

**Native Query:**
```java
@Query(value = "SELECT * FROM orders WHERE user_id = ? AND status = ?", nativeQuery = true)
List<Order> findByUserIdAndStatusNative(Long userId, String status);
```
- Uses raw SQL — database-specific
- Useful for complex queries that JPQL can't express

---

# 8. Hibernate Internal Working

## 8.1 ORM (Object-Relational Mapping) Concept

ORM bridges the gap between **object-oriented Java** and **relational databases**:

```
Java World                    Database World
───────────                   ──────────────
Class (User)          ←→      Table (users)
Object (user1)        ←→      Row (id=1, name="Arjun")
Field (user.name)     ←→      Column (name)
Reference (user.role) ←→      Foreign Key / Enum
List<Order>           ←→      JOIN query
```

## 8.2 Entity Lifecycle

```
    ┌─────────┐    persist()    ┌──────────┐
    │  NEW    │───────────────>│ MANAGED  │
    │(Transient)│              │(Persistent)│
    └─────────┘                └──────────┘
                                    │  │
                          detach()  │  │ merge()
                                    ▼  │
                               ┌──────────┐
                               │ DETACHED │
                               └──────────┘
                                    │
                          remove()  │
                                    ▼
                               ┌──────────┐
                               │ REMOVED  │
                               └──────────┘
```

| State | Description |
|-------|------------|
| **NEW (Transient)** | Object created with `new`, not yet saved to DB |
| **MANAGED (Persistent)** | Object is tracked by Hibernate, changes are auto-detected |
| **DETACHED** | Object was managed but the session/transaction ended |
| **REMOVED** | Object is marked for deletion |

## 8.3 First-Level Cache (Persistence Context)

- Every Hibernate Session has a **first-level cache** (enabled by default, cannot be disabled)
- When you load an entity, it's cached in memory
- If you load the same entity again within the same session, Hibernate returns the cached version (no SQL!)

```java
// First call → SQL executed
User user1 = userRepository.findById(1L);  // SELECT FROM users WHERE id = 1

// Second call → NO SQL! Returns cached object
User user2 = userRepository.findById(1L);  // Returns same object from cache

System.out.println(user1 == user2);  // true (same reference!)
```

## 8.4 Lazy Loading vs Eager Loading

```java
// LAZY: Related data loaded ONLY when accessed
@ManyToOne(fetch = FetchType.LAZY)
private User user;  // User data NOT loaded when Order is loaded

// EAGER: Related data loaded IMMEDIATELY with parent
@ManyToOne(fetch = FetchType.EAGER)
private User user;  // User data loaded WITH Order in same query
```

**This project uses LAZY for all relationships** (`@ManyToOne(fetch = FetchType.LAZY)`) to optimize performance.

**LAZY Loading SQL:**
```sql
-- When loading Order:
SELECT * FROM orders WHERE id = 1;  -- Only order data

-- When accessing order.getUser().getName():
SELECT * FROM users WHERE id = ?;   -- User loaded on demand
```

## 8.5 Cascade Types

```java
@OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
private List<OrderItem> items;
```

| Cascade Type | Meaning |
|-------------|---------|
| `ALL` | All operations cascade (PERSIST + MERGE + REMOVE + REFRESH + DETACH) |
| `PERSIST` | When parent is saved, children are also saved |
| `MERGE` | When parent is updated, children are also updated |
| `REMOVE` | When parent is deleted, children are also deleted |

**In this project:** When an Order is saved, all its OrderItems are automatically saved too (cascade = ALL). When an Order is deleted, its OrderItems are also deleted (orphanRemoval = true).

## 8.6 How Java Object Becomes SQL Query

```
Step 1: Java Code
    Order order = Order.builder().user(user).totalAmount(159999).build();
    orderRepository.save(order);

Step 2: Spring Data calls EntityManager.persist(order)

Step 3: Hibernate checks entity metadata:
    - @Table(name = "orders") → target table
    - @Column fields → column mappings
    - @GeneratedValue → ID generation strategy

Step 4: Hibernate generates SQL:
    INSERT INTO orders (user_id, status, total_amount, shipping_address, 
                        shipping_phone, created_at) 
    VALUES (?, ?, ?, ?, ?, ?)

Step 5: JDBC PreparedStatement binds parameters:
    Parameter 1: user.getId() = 1
    Parameter 2: "PENDING"
    Parameter 3: 159999.00
    Parameter 4: "123 Main St"
    Parameter 5: "9876543210"
    Parameter 6: "2026-05-13T16:45:00"

Step 6: MySQL executes the INSERT and returns generated ID

Step 7: Hibernate sets the ID on the Java object:
    order.setId(1L);  // Auto-populated!
```
