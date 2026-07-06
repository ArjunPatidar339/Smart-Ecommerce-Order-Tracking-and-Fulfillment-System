package com.ecommerce.serviceImpl;

import com.ecommerce.dto.OrderStatusResponse;
import com.ecommerce.dto.OrderStatusUpdateRequest;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.entity.Order;
import com.ecommerce.repository.OrderEntityRepository;
import com.ecommerce.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class OrderServiceImpl implements OrderService {

    private final OrderEntityRepository orderRepository;

    @Override
    public OrderStatusResponse updateOrderStatus(Long orderId, OrderStatusUpdateRequest request) {
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        order.setStatus(request.getStatus());
        Order updatedOrder = orderRepository.save(order);
        
        return new OrderStatusResponse(
                updatedOrder.getId(),
                updatedOrder.getUser().getId(),
                updatedOrder.getStatus(),
                updatedOrder.getCreatedAt()
        );
    }
}
