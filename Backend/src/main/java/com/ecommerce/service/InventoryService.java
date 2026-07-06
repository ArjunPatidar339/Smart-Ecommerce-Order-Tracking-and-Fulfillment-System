package com.ecommerce.service;

import com.ecommerce.dto.InventoryResponse;
import com.ecommerce.dto.InventoryUpdateRequest;

public interface InventoryService {
    InventoryResponse getInventory(Long productId);
    InventoryResponse updateInventory(InventoryUpdateRequest request);
}
