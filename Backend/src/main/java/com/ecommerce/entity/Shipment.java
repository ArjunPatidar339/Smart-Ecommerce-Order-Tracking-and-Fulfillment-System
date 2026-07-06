package com.ecommerce.entity;

import com.ecommerce.enums.ShipmentStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "shipments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Shipment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false, unique = true)
    private Order order;

    private String carrier;

    private String trackingNumber;

    @Enumerated(EnumType.STRING)
    private ShipmentStatus status;

    private LocalDate estimatedDelivery;

    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();
}
