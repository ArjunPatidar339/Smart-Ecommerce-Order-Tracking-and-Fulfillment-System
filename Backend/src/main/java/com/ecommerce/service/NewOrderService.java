package com.ecommerce.service;

import com.ecommerce.dto.OrderResponse;
import com.ecommerce.dto.PlaceOrderRequest;
import com.ecommerce.enums.OrderStatus;

import java.util.List;

public interface NewOrderService {
    OrderResponse placeOrder(PlaceOrderRequest request);
    OrderResponse getOrderById(Long orderId);
    List<OrderResponse> getOrdersByUser(Long userId);
    OrderResponse cancelOrder(Long orderId);
    OrderResponse updateOrderStatus(Long orderId, OrderStatus status);
}
