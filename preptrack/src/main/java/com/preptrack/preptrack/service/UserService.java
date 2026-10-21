package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.UserRequest;
import com.preptrack.preptrack.dto.UserResponse;
import com.preptrack.preptrack.exception.DuplicateResourceException;
import com.preptrack.preptrack.exception.ResourceNotFoundException;
import com.preptrack.preptrack.model.AppUser;
import com.preptrack.preptrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public UserResponse getById(Long id) {
        return UserResponse.from(findEntity(id));
    }

    public AppUser findEntity(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id " + id));
    }

    @Transactional
    public UserResponse create(UserRequest request) {
        String email = request.email().trim().toLowerCase();
        if (userRepository.existsByEmailIgnoreCase(email)) {
            throw new DuplicateResourceException("Email already registered: " + email);
        }
        AppUser user = new AppUser();
        user.setName(request.name());
        user.setEmail(email);
        return UserResponse.from(userRepository.save(user));
    }
}
