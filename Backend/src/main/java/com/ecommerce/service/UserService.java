package com.ecommerce.service;

import com.ecommerce.dto.UserResponseDto;
import com.ecommerce.dto.UserUpdateRequestDto;

public interface UserService {

    UserResponseDto getUserProfile(String email);

    UserResponseDto updateUser(String email, UserUpdateRequestDto request);
}