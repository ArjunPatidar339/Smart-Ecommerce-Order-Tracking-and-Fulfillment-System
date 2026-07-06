package com.ecommerce.controller;

import com.ecommerce.entity.Order;
import com.ecommerce.enums.OrderStatus;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderEntityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReturnRefundController {

    private final OrderEntityRepository orderRepository;

    /**
     * POST /api/returns/request
     * Customer requests a return for a delivered order.
     */
    @PostMapping("/returns/request")
    public ResponseEntity<Map<String, Object>> requestReturn(@RequestBody Map<String, Object> body) {
        Long orderId = Long.valueOf(body.get("orderId").toString());
        String reason = body.getOrDefault("reason", "No reason provided").toString();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        if (order.getStatus() != OrderStatus.DELIVERED) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Return can only be requested for DELIVERED orders. Current status: " + order.getStatus()
            ));
        }

        order.setStatus(OrderStatus.RETURNED);
        orderRepository.save(order);

        return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "status", "RETURN_REQUESTED",
                "reason", reason,
                "message", "Your return request has been submitted successfully."
        ));
    }

    /**
     * PATCH /api/returns/{id}/approve
     * Admin approves a return request.
     */
    @PatchMapping("/returns/{id}/approve")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> approveReturn(@PathVariable Long id) {
        Order order = orderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + id));

        if (order.getStatus() != OrderStatus.RETURNED) {
            return ResponseEntity.badRequest().body(Map.of(
                    "error", "Order is not in RETURNED state. Current status: " + order.getStatus()
            ));
        }

        return ResponseEntity.ok(Map.of(
                "orderId", id,
                "status", "RETURN_APPROVED",
                "message", "Return approved. Refund will be processed within 3-5 business days."
        ));
    }

    /**
     * PUT /api/refunds/process
     * Admin processes a refund for an approved return.
     */
    @PutMapping("/refunds/process")
    @PreAuthorize("hasAuthority('ROLE_ADMIN')")
    public ResponseEntity<Map<String, Object>> processRefund(@RequestBody Map<String, Object> body) {
        Long orderId = Long.valueOf(body.get("orderId").toString());
        String refundMethod = body.getOrDefault("method", "ORIGINAL_PAYMENT").toString();

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found: " + orderId));

        return ResponseEntity.ok(Map.of(
                "orderId", orderId,
                "refundAmount", order.getTotalAmount(),
                "method", refundMethod,
                "status", "REFUND_PROCESSED",
                "message", "Refund of " + order.getTotalAmount() + " has been processed via " + refundMethod
        ));
    }
}
