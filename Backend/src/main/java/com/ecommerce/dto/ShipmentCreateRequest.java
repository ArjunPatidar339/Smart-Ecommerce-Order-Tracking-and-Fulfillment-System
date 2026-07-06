package com.ecommerce.dto;

import jakarta.validation.constraints.FutureOrPresent;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
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
