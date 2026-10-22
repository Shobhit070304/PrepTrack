package com.preptrack.preptrack.repository;

import com.preptrack.preptrack.model.AppUser;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<AppUser, Long> {
    Optional<AppUser> findByGoogleId(String googleId);
    Optional<AppUser> findByEmailIgnoreCase(String email);
}
