package com.ecommerce.serviceImpl;

import com.ecommerce.dto.InventoryResponse;
import com.ecommerce.dto.InventoryUpdateRequest;
import com.ecommerce.entity.Inventory;
import com.ecommerce.exception.ResourceNotFoundException;
import com.ecommerce.repository.InventoryEntityRepository;
import com.ecommerce.service.InventoryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InventoryServiceImpl implements InventoryService {

    private final InventoryEntityRepository inventoryRepository;

    @Override
    public InventoryResponse getInventory(Long productId) {
        Inventory inventory = inventoryRepository.findByProduct_Id(productId)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product id: " + productId));
        
        return new InventoryResponse(
                inventory.getProduct().getId(),
                inventory.getAvailableStock(),
                inventory.getLastUpdated()
        );
    }

    @Override
    public InventoryResponse updateInventory(InventoryUpdateRequest request) {
        Inventory inventory = inventoryRepository.findByProduct_Id(request.getProductId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory not found for product id: " + request.getProductId()));
        
        inventory.setAvailableStock(request.getQuantity());
        inventory.setLastUpdated(LocalDateTime.now());
        
        Inventory updatedInventory = inventoryRepository.save(inventory);
        
        return new InventoryResponse(
                updatedInventory.getProduct().getId(),
                updatedInventory.getAvailableStock(),
                updatedInventory.getLastUpdated()
        );
    }
}
