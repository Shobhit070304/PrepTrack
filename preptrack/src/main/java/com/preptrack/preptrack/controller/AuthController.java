package com.preptrack.preptrack.controller;

import com.preptrack.preptrack.dto.GoogleLoginRequest;
import com.preptrack.preptrack.dto.UserResponse;
import com.preptrack.preptrack.security.AuthCookies;
import com.preptrack.preptrack.security.AuthUser;
import com.preptrack.preptrack.service.AuthService;
import com.preptrack.preptrack.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class AuthController {

    private final AuthService authService;
    private final UserService userService;
    private final boolean cookieSecure;

    public AuthController(AuthService authService,
                          UserService userService,
                          @Value("${app.cookie-secure:false}") boolean cookieSecure) {
        this.authService = authService;
        this.userService = userService;
        this.cookieSecure = cookieSecure;
    }

    // Login: the page sends the Google token, we verify it and set the cookie
    @PostMapping("/auth/google")
    public ResponseEntity<UserResponse> loginWithGoogle(@Valid @RequestBody GoogleLoginRequest request) {
        AuthService.LoginResult result = authService.loginWithGoogle(request.idToken());

        ResponseCookie cookie = AuthCookies.create(request.idToken(), result.cookieMaxAge(), cookieSecure);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, cookie.toString())
                .body(result.user());
    }

    // Logout: delete the cookie (nothing to clean up on the server)
    @PostMapping("/auth/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, AuthCookies.clear(cookieSecure).toString())
                .build();
    }

    // Who am I? (the frontend calls this to show name + profile picture)
    @GetMapping("/me")
    public UserResponse me(@AuthenticationPrincipal AuthUser principal) {
        return userService.getById(principal.userId());
    }
}
