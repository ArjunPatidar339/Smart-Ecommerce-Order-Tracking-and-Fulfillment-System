package com.ecommerce.config;

import com.ecommerce.entity.User;
import com.ecommerce.enums.Role;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final com.ecommerce.repository.ProductEntityRepository productRepository;
    private final com.ecommerce.repository.InventoryEntityRepository inventoryRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Create Admin
        if (userRepository.findByEmail("admin@shop.com").isEmpty()) {
            User admin = User.builder()
                    .name("System Admin")
                    .email("admin@shop.com")
                    .password(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .phone("0000000000")
                    .address("Headquarters")
                    .build();
            userRepository.save(admin);
            System.out.println(">>> Default Admin created: admin@shop.com / admin123");
        }

        // Create Demo Products and their Inventory
        if (productRepository.count() == 0) {
            java.util.List<com.ecommerce.entity.Product> demoProducts = java.util.List.of(
                createProduct("MacBook Pro M3", "Apple", "Electronics", "High performance laptop", 159999, 179999, 5, "https://images.unsplash.com/photo-1517336714460-4c50d1179ef7?w=500"),
                createProduct("iPhone 15 Pro", "Apple", "Electronics", "Latest flagship smartphone", 129999, 134999, 5, "https://images.unsplash.com/photo-1510557880182-3d4d3cba35a5?w=500"),
                createProduct("Wireless Headphones", "Sony", "Electronics", "Noise cancelling audio", 24999, 29999, 4, "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500"),
                createProduct("Premium Cotton T-Shirt", "Adidas", "Clothing", "Comfortable everyday wear", 1499, 1999, 4, "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500"),
                createProduct("Slim Fit Denim", "Levi's", "Clothing", "Classic blue denim jeans", 3499, 4500, 4, "https://images.unsplash.com/photo-1542272604-787c3835535d?w=500"),
                createProduct("UltraBoost Running", "Adidas", "Footwear", "Reactive cushioning shoes", 18999, 21999, 5, "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500")
            );
            productRepository.saveAll(demoProducts);
            System.out.println(">>> Created " + demoProducts.size() + " demo products.");
        }

        // Backfill missing inventory
        java.util.List<com.ecommerce.entity.Product> allProducts = productRepository.findAll();
        for (com.ecommerce.entity.Product p : allProducts) {
            if (inventoryRepository.findByProduct_Id(p.getId()).isEmpty()) {
                com.ecommerce.entity.Inventory inventory = com.ecommerce.entity.Inventory.builder()
                    .product(p)
                    .availableStock(50)
                    .lastUpdated(java.time.LocalDateTime.now())
                    .build();
                inventoryRepository.save(inventory);
                System.out.println(">>> Created missing inventory for product: " + p.getName());
            }
        }
    }

    private com.ecommerce.entity.Product createProduct(String name, String brand, String cat, String desc, double price, double oldPrice, int rating, String img) {
        return com.ecommerce.entity.Product.builder()
                .name(name).brand(brand).category(cat).description(desc)
                .price(java.math.BigDecimal.valueOf(price))
                .originalPrice(java.math.BigDecimal.valueOf(oldPrice))
                .rating(rating).reviews(120).image(img).stock(50)
                .build();
    }
}
