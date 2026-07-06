package com.ecommerce.service;

import com.ecommerce.dto.OrderStatusResponse;
import com.ecommerce.dto.OrderStatusUpdateRequest;

public interface OrderService {
    OrderStatusResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request);
}
