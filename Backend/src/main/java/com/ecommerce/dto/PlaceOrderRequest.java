package com.ecommerce.dto;

import lombok.Data;

import java.util.List;

@Data
public class PlaceOrderRequest {
    private Long userId;
    private String shippingAddress;
    private String shippingPhone;
    private List<OrderItemRequest> items;
}
