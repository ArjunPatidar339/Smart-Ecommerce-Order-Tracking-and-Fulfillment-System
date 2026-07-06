package com.ecommerce.serviceImpl;

import com.ecommerce.dto.OrderItemRequest;
import com.ecommerce.dto.OrderResponse;
import com.ecommerce.dto.PlaceOrderRequest;
import com.ecommerce.entity.Inventory;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.OrderItem;
import com.ecommerce.entity.Product;
import com.ecommerce.entity.Shipment;
import com.ecommerce.entity.User;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.ShipmentStatus;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.InventoryEntityRepository;
import com.ecommerce.repository.OrderEntityRepository;
import com.ecommerce.repository.ProductEntityRepository;
import com.ecommerce.repository.ShipmentEntityRepository;
import com.ecommerce.repository.UserRepository;
import com.ecommerce.service.NewOrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NewOrderServiceImpl implements NewOrderService {

        private final OrderEntityRepository orderRepository;
        private final ProductEntityRepository productRepository;
        private final InventoryEntityRepository inventoryRepository;
        private final UserRepository userRepository;
        private final ShipmentEntityRepository shipmentRepository;

        @Override
        @Transactional
        public OrderResponse placeOrder(PlaceOrderRequest request) {
                // 1. Validate user
                User user = userRepository.findById(request.getUserId())
                                .orElseThrow(() -> new ResourceNotFoundException(
                                                "User not found: " + request.getUserId()));

                // 2. Validate products, check inventory, calculate total
                BigDecimal total = BigDecimal.ZERO;
                List<OrderItem> orderItems = new ArrayList<>();

                for (OrderItemRequest itemReq : request.getItems()) {
                        // 2a. Validate product exists
                        Product product = productRepository.findById(itemReq.getProductId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Product not found: " + itemReq.getProductId()));

                        // 2b. Check inventory
                        Inventory inventory = inventoryRepository.findByProduct_Id(product.getId())
                                        .orElseThrow(() -> new ResourceNotFoundException(
                                                        "Inventory not found for product: " + product.getId()));

                        if (inventory.getAvailableStock() < itemReq.getQuantity()) {
                                throw new IllegalStateException("Insufficient stock for product: " + product.getName()
                                                + ". Available: " + inventory.getAvailableStock()
                                                + ", Requested: " + itemReq.getQuantity());
                        }

                        // 2c. Deduct stock
                        inventory.setAvailableStock(inventory.getAvailableStock() - itemReq.getQuantity());
                        inventory.setLastUpdated(LocalDateTime.now());
                        inventoryRepository.save(inventory);

                        // 2d. Build order item
                        BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(itemReq.getQuantity()));
                        total = total.add(itemTotal);

                        OrderItem orderItem = OrderItem.builder()
                                        .product(product)
                                        .quantity(itemReq.getQuantity())
                                        .priceAtPurchase(product.getPrice())
                                        .build();
                        orderItems.add(orderItem);
                }

                // 3. Create and save the order
                Order order = Order.builder()
                                .user(user)
                                .shippingAddress(request.getShippingAddress())
                                .shippingPhone(request.getShippingPhone())
                                .status(OrderStatus.PENDING)
                                .totalAmount(total)
                                .createdAt(LocalDateTime.now())
                                .build();

                // Link items to order
                orderItems.forEach(item -> item.setOrder(order));
                order.setItems(orderItems);

                Order savedOrder = orderRepository.save(order);

                // Auto-create shipment record so tracking works immediately
                String trackingNum = "TRK" + System.currentTimeMillis();
                Shipment shipment = Shipment.builder()
                                .order(savedOrder)
                                .carrier("ShopHub Logistics")
                                .trackingNumber(trackingNum)
                                .status(ShipmentStatus.PROCESSING)
                                .estimatedDelivery(java.time.LocalDate.now().plusDays(5))
                                .createdAt(LocalDateTime.now())
                                .build();
                shipmentRepository.save(shipment);

                return mapToResponse(savedOrder);
        }

        @Override
        public OrderResponse getOrderById(Long orderId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
                return mapToResponse(order);
        }

        @Override
        public List<OrderResponse> getOrdersByUser(Long userId) {
                return orderRepository.findByUser_Id(userId)
                                .stream()
                                .map(this::mapToResponse)
                                .collect(Collectors.toList());
        }

        @Override
        @Transactional
        public OrderResponse cancelOrder(Long orderId) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

                if (order.getStatus() == OrderStatus.DELIVERED || order.getStatus() == OrderStatus.SHIPPED) {
                        throw new IllegalStateException("Cannot cancel an order that is already " + order.getStatus());
                }

                // Restore inventory
                for (OrderItem item : order.getItems()) {
                        inventoryRepository.findByProduct_Id(item.getProduct().getId()).ifPresent(inv -> {
                                inv.setAvailableStock(inv.getAvailableStock() + item.getQuantity());
                                inv.setLastUpdated(LocalDateTime.now());
                                inventoryRepository.save(inv);
                        });
                }

                order.setStatus(OrderStatus.CANCELLED);
                return mapToResponse(orderRepository.save(order));
        }

        @Override
        @Transactional
        public OrderResponse updateOrderStatus(Long orderId, OrderStatus status) {
                Order order = orderRepository.findById(orderId)
                                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));
                order.setStatus(status);

                // Sync shipment status
                shipmentRepository.findByOrder_Id(orderId).ifPresent(shipment -> {
                        if (status == OrderStatus.SHIPPED || status == OrderStatus.OUT_FOR_DELIVERY) {
                                shipment.setStatus(ShipmentStatus.IN_TRANSIT);
                        } else if (status == OrderStatus.DELIVERED) {
                                shipment.setStatus(ShipmentStatus.DELIVERED);
                        } else if (status == OrderStatus.CANCELLED || status == OrderStatus.RETURNED) {
                                shipment.setStatus(ShipmentStatus.FAILED);
                        }
                        shipmentRepository.save(shipment);
                });

                return mapToResponse(orderRepository.save(order));
        }

        private OrderResponse mapToResponse(Order order) {
                List<OrderResponse.OrderItemResponse> itemResponses = order.getItems().stream()
                                .map(i -> OrderResponse.OrderItemResponse.builder()
                                                .productId(i.getProduct().getId())
                                                .productName(i.getProduct().getName())
                                                .quantity(i.getQuantity())
                                                .priceAtPurchase(i.getPriceAtPurchase())
                                                .build())
                                .collect(Collectors.toList());

                return OrderResponse.builder()
                                .id(order.getId())
                                .userId(order.getUser().getId())
                                .status(order.getStatus())
                                .totalAmount(order.getTotalAmount())
                                .shippingAddress(order.getShippingAddress())
                                .shippingPhone(order.getShippingPhone())
                                .createdAt(order.getCreatedAt())
                                .items(itemResponses)
                                .build();
        }
}
