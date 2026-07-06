package com.ecommerce.dto;

import com.ecommerce.enums.OrderStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderStatusResponse {
    private Long id;
    private Long customerId;
    private OrderStatus status;
    private LocalDateTime createdAt;
}
