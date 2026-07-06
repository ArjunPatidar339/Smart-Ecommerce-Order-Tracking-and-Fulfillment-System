package com.ecommerce.service;

import com.ecommerce.dto.ShipmentCreateRequest;
import com.ecommerce.dto.ShipmentResponse;
import com.ecommerce.dto.ShipmentStatusUpdateRequest;

public interface ShipmentService {
    ShipmentResponse createShipment(ShipmentCreateRequest request);
    ShipmentResponse getShipmentByOrderIdAndPhone(Long orderId, String phone);
    ShipmentResponse updateShipmentStatus(ShipmentStatusUpdateRequest request);
}
