package com.ecommerce.controller;

import com.ecommerce.dto.InventoryResponse;
import com.ecommerce.dto.InventoryUpdateRequest;
import com.ecommerce.service.InventoryService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class InventoryController {

    private final InventoryService inventoryService;

    @GetMapping("/{productId}")
    public ResponseEntity<InventoryResponse> getInventory(@PathVariable Long productId) {
        InventoryResponse response = inventoryService.getInventory(productId);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/update")
    public ResponseEntity<InventoryResponse> updateInventory(
            @Valid @RequestBody InventoryUpdateRequest request) {
        InventoryResponse response = inventoryService.updateInventory(request);
        return ResponseEntity.ok(response);
    }
}
