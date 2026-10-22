package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.UserResponse;
import com.preptrack.preptrack.exception.UnauthorizedException;
import com.preptrack.preptrack.model.AppUser;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.time.Instant;

@Service
public class AuthService {

    private final JwtDecoder jwtDecoder;
    private final UserService userService;

    public AuthService(JwtDecoder jwtDecoder, UserService userService) {
        this.jwtDecoder = jwtDecoder;
        this.userService = userService;
    }

    public record LoginResult(UserResponse user, Duration cookieMaxAge) {}

    public LoginResult loginWithGoogle(String idToken) {
        Jwt jwt;
        try {
            jwt = jwtDecoder.decode(idToken);   // verifies signature, expiry, issuer, audience
        } catch (JwtException ex) {
            throw new UnauthorizedException("Invalid or expired Google token");
        }

        // Only accept emails that Google has verified
        if (!Boolean.TRUE.equals(jwt.getClaimAsBoolean("email_verified"))) {
            throw new UnauthorizedException("Google email is not verified");
        }

        AppUser user = userService.upsertFromGoogle(
                jwt.getSubject(),
                jwt.getClaimAsString("email"),
                jwt.getClaimAsString("name"),
                jwt.getClaimAsString("picture"));

        // The cookie should disappear at the same moment the token expires
        Duration maxAge = Duration.between(Instant.now(), jwt.getExpiresAt());

        return new LoginResult(UserResponse.from(user), maxAge);
    }
}
