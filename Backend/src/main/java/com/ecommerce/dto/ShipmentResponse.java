package com.ecommerce.dto;

import com.ecommerce.enums.ShipmentStatus;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShipmentResponse {
    private Long id;
    private Long orderId;
    private String carrier;
    private String trackingNumber;
    private ShipmentStatus status;
    private String orderStatus;
    private LocalDate estimatedDelivery;
    private String shippingAddress;
    private String shippingPhone;
}
