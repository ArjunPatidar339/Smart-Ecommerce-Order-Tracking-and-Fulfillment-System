package com.ecommerce.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryUpdateRequest {
    @NotNull(message = "Product ID is required")
    private Long productId;

    @Min(value = 0, message = "Quantity cannot be negative")
    private int quantity;
}
