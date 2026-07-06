package com.ecommerce.controller;

import com.ecommerce.dto.ShipmentCreateRequest;
import com.ecommerce.dto.ShipmentResponse;
import com.ecommerce.dto.ShipmentStatusUpdateRequest;
import com.ecommerce.service.ShipmentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shipment")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class ShipmentController {

    private final ShipmentService shipmentService;

    @PostMapping("/create")
    public ResponseEntity<ShipmentResponse> createShipment(
            @Valid @RequestBody ShipmentCreateRequest request) {
        ShipmentResponse response = shipmentService.createShipment(request);
        return new ResponseEntity<>(response, HttpStatus.CREATED);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<ShipmentResponse> getShipmentByOrderId(
            @PathVariable Long orderId,
            @RequestParam String phone) {
        ShipmentResponse response = shipmentService.getShipmentByOrderIdAndPhone(orderId, phone);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update-status")
    public ResponseEntity<ShipmentResponse> updateShipmentStatus(
            @Valid @RequestBody ShipmentStatusUpdateRequest request) {
        ShipmentResponse response = shipmentService.updateShipmentStatus(request);
        return ResponseEntity.ok(response);
    }
}
