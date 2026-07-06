package com.ecommerce.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, String> home() {
        return Map.of(
            "status", "Running",
            "message", "Ecommerce Order Tracking API is live",
            "frontend_url", "http://localhost:5173"
        );
    }
}
