	package com.ecommerce.controller;

import com.ecommerce.dto.UserResponseDto;
import com.ecommerce.dto.UserUpdateRequestDto;
import com.ecommerce.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:5174", "http://localhost:3000"})
public class UserController {

    private final UserService userService;

    // GET /api/users/profile
    @GetMapping("/profile")
    public ResponseEntity<UserResponseDto> getProfile(
            @RequestParam String email) {

        UserResponseDto response = userService.getUserProfile(email);
        return ResponseEntity.ok(response);
    }

    // PUT /api/users/update
    @PutMapping("/update")
    public ResponseEntity<UserResponseDto> updateUser(
            @RequestParam String email,
            @RequestBody UserUpdateRequestDto request) {

        UserResponseDto response = userService.updateUser(email, request);
        return ResponseEntity.ok(response);
    }
}
