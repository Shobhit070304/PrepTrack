package com.preptrack.preptrack.dto;

import com.preptrack.preptrack.model.AppUser;

import com.preptrack.preptrack.model.AppUser;
import com.preptrack.preptrack.model.Role;

public record UserResponse(Long id, String name, String email, String pictureUrl, Role role) {
    public static UserResponse from(AppUser user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPictureUrl(),
                user.getRole());
    }
}
