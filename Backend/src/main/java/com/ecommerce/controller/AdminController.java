package com.ecommerce.controller;

import com.ecommerce.dto.DashboardResponse;
import com.ecommerce.dto.OrderResponse;
import com.ecommerce.dto.UserResponseDto;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.User;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.enums.Role;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.InventoryEntityRepository;
import com.ecommerce.repository.OrderEntityRepository;
import com.ecommerce.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

        private final UserRepository userRepository;
        private final OrderEntityRepository orderRepository;
        private final InventoryEntityRepository inventoryRepository;

        /** GET /api/admin/users — Get all registered users */
        @GetMapping("/users")
        public ResponseEntity<List<UserResponseDto>> getAllUsers() {
                List<UserResponseDto> users = userRepository.findAll().stream()
                                .map(this::mapUserToDto)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(users);
        }

        /** GET /api/admin/users/{id} — Get a specific user */
        @GetMapping("/users/{id}")
        public ResponseEntity<UserResponseDto> getUserById(@PathVariable Long id) {
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
                return ResponseEntity.ok(mapUserToDto(user));
        }

        /** DELETE /api/admin/users/{id} — Delete a user */
        @DeleteMapping("/users/{id}")
        public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
                if (!userRepository.existsById(id)) {
                        throw new ResourceNotFoundException("User not found: " + id);
                }
                userRepository.deleteById(id);
                return ResponseEntity.noContent().build();
        }

        /** PUT /api/admin/users/{id}/role — Change a user's role */
        @PutMapping("/users/{id}/role")
        public ResponseEntity<UserResponseDto> updateUserRole(
                        @PathVariable Long id,
                        @RequestParam Role role) {
                User user = userRepository.findById(id)
                                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
                user.setRole(role);
                userRepository.save(user);
                return ResponseEntity.ok(mapUserToDto(user));
        }

        /** GET /api/admin/orders — Get all orders in the system */
        @GetMapping("/orders")
        public ResponseEntity<List<OrderResponse>> getAllOrders() {
                List<OrderResponse> orders = orderRepository.findAll().stream()
                                .map(this::mapOrderToResponse)
                                .collect(Collectors.toList());
                return ResponseEntity.ok(orders);
        }

        /** GET /api/admin/dashboard — Analytics summary */
        @GetMapping("/dashboard")
        public ResponseEntity<DashboardResponse> getDashboard() {
                List<Order> allOrders = orderRepository.findAll();

                long pending = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.PENDING).count();
                long delivered = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.DELIVERED).count();
                long cancelled = allOrders.stream().filter(o -> o.getStatus() == OrderStatus.CANCELLED).count();

                BigDecimal revenue = allOrders.stream()
                                .filter(o -> o.getStatus() != OrderStatus.CANCELLED
                                                && o.getStatus() != OrderStatus.RETURNED)
                                .map(Order::getTotalAmount)
                                .reduce(BigDecimal.ZERO, BigDecimal::add);

                long lowStock = inventoryRepository.findAll().stream()
                                .filter(inv -> inv.getAvailableStock() < 5)
                                .count();

                DashboardResponse dashboard = DashboardResponse.builder()
                                .totalUsers(userRepository.count())
                                .totalOrders(allOrders.size())
                                .pendingOrders(pending)
                                .deliveredOrders(delivered)
                                .cancelledOrders(cancelled)
                                .totalRevenue(revenue)
                                .lowStockProducts(lowStock)
                                .build();

                return ResponseEntity.ok(dashboard);
        }

        private UserResponseDto mapUserToDto(User user) {
                return UserResponseDto.builder()
                                .id(user.getId())
                                .name(user.getName())
                                .email(user.getEmail())
                                .phone(user.getPhone())
                                .address(user.getAddress())
                                .build();
        }

        private OrderResponse mapOrderToResponse(Order order) {
                List<OrderResponse.OrderItemResponse> items = order.getItems().stream()
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
                                .items(items)
                                .build();
        }
}
