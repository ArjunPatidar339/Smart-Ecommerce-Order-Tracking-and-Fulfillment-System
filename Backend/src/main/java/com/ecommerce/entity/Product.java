package com.ecommerce.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;

@Entity
@Table(name = "products")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String brand;
    private String category;

    @Column(columnDefinition = "TEXT")
    private String description;

    private BigDecimal price;
    private BigDecimal originalPrice;
    private Integer rating;
    private Integer reviews;

    @Column(columnDefinition = "TEXT")
    private String image;

    @Column(nullable = false)
    @Builder.Default
    private Integer stock = 0;
}
