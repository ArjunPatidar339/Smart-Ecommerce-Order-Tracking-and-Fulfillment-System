package com.ecommerce.dto;

import com.ecommerce.enums.ShipmentStatus;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ShipmentStatusUpdateRequest {
    @NotNull(message = "Shipment ID is required")
    private Long shipmentId;

    @NotNull(message = "Status is required")
    private ShipmentStatus status;
}
