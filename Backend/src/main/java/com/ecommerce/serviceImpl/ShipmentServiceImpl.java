package com.ecommerce.serviceImpl;

import com.ecommerce.dto.ShipmentCreateRequest;
import com.ecommerce.dto.ShipmentResponse;
import com.ecommerce.dto.ShipmentStatusUpdateRequest;
import com.ecommerce.entity.Order;
import com.ecommerce.entity.Shipment;
import com.ecommerce.enums.ShipmentStatus;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.OrderEntityRepository;
import com.ecommerce.repository.ShipmentEntityRepository;
import com.ecommerce.service.ShipmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class ShipmentServiceImpl implements ShipmentService {

    private final ShipmentEntityRepository shipmentRepository;
    private final OrderEntityRepository orderRepository;

    @Override
    public ShipmentResponse createShipment(ShipmentCreateRequest request) {
        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + request.getOrderId()));

        Shipment shipment = Shipment.builder()
                .order(order)
                .carrier(request.getCarrier())
                .trackingNumber(request.getTrackingNumber())
                .status(ShipmentStatus.PROCESSING)
                .estimatedDelivery(request.getEstimatedDelivery())
                .createdAt(LocalDateTime.now())
                .build();
        
        Shipment savedShipment = shipmentRepository.save(shipment);
        
        return mapToResponse(savedShipment);
    }

    @Override
    public ShipmentResponse getShipmentByOrderIdAndPhone(Long orderId, String phone) {
        // 1. Find the order first to verify ownership/existence
        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("No order found with ID: " + orderId));
        
        // 2. Security check: Verify the phone number matches the order
        if (order.getShippingPhone() == null || !order.getShippingPhone().trim().equals(phone.trim())) {
            throw new ResourceNotFoundException("No order found matching the provided Order ID and Phone Number.");
        }

        // 3. Try to find the shipment
        return shipmentRepository.findByOrder_Id(orderId)
                .map(this::mapToResponse)
                .orElseGet(() -> {
                    // Fallback: If order exists but shipment isn't created yet, return order-only info
                    return ShipmentResponse.builder()
                            .orderId(order.getId())
                            .orderStatus(order.getStatus() != null ? order.getStatus().name() : "PENDING")
                            .shippingAddress(order.getShippingAddress())
                            .shippingPhone(order.getShippingPhone())
                            .status(ShipmentStatus.PROCESSING) // Default display status
                            .build();
                });
    }

    @Override
    public ShipmentResponse updateShipmentStatus(ShipmentStatusUpdateRequest request) {
        Shipment shipment = shipmentRepository.findById(request.getShipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Shipment not found with id: " + request.getShipmentId()));
        
        shipment.setStatus(request.getStatus());
        Shipment updatedShipment = shipmentRepository.save(shipment);
        
        return mapToResponse(updatedShipment);
    }
    
    private ShipmentResponse mapToResponse(Shipment shipment) {
        ShipmentResponse resp = new ShipmentResponse(
                shipment.getId(),
                shipment.getOrder().getId(),
                shipment.getCarrier(),
                shipment.getTrackingNumber(),
                shipment.getStatus(),
                shipment.getOrder().getStatus() != null ? shipment.getOrder().getStatus().name() : null,
                shipment.getEstimatedDelivery(),
                shipment.getOrder().getShippingAddress(),
                shipment.getOrder().getShippingPhone()
        );
        return resp;
    }
}
