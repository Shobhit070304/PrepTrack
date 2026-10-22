package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.UserResponse;
import com.preptrack.preptrack.exception.ResourceNotFoundException;
import com.preptrack.preptrack.model.AppUser;
import com.preptrack.preptrack.model.Role;
import com.preptrack.preptrack.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;
    private final String adminEmail;

    public UserService(
            UserRepository userRepository,
            @Value("${app.admin-email}") String adminEmail) {
        this.userRepository = userRepository;
        this.adminEmail = adminEmail.trim().toLowerCase();
    }

    public UserResponse getById(Long id) {
        return UserResponse.from(findEntity(id));
    }

    public AppUser findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    // Used on every request to turn the token's "sub" into our user
    public Optional<AppUser> findByGoogleId(String googleId) {
        return userRepository.findByGoogleId(googleId);
    }

    // Called on every Google login: create the user the first time, update them after that
    @Transactional
    public AppUser upsertFromGoogle(String googleId, String email, String name, String pictureUrl) {
        String cleanEmail = email.trim().toLowerCase();

        AppUser user = userRepository.findByGoogleId(googleId)
                .or(() -> userRepository.findByEmailIgnoreCase(cleanEmail))   // link older users by email
                .orElseGet(AppUser::new);

        user.setGoogleId(googleId);
        user.setEmail(cleanEmail);
        user.setName(name != null && !name.isBlank() ? name : cleanEmail);
        user.setPictureUrl(pictureUrl);                                       // refreshed every login
        user.setRole(adminEmail.equals(cleanEmail) ? Role.ADMIN : Role.USER);
        user.setLastLoginAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}
