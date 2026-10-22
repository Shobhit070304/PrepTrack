package com.preptrack.preptrack.security;

import org.springframework.http.ResponseCookie;

import java.time.Duration;

public final class AuthCookies {
    public static final String NAME = "id_token";

    private AuthCookies() {
    }

    public static ResponseCookie create(String token, Duration maxAge, boolean secure) {
        return base(token, secure).maxAge(maxAge).build();
    }

    public static ResponseCookie clear(boolean secure) {
        return base("", secure).maxAge(Duration.ZERO).build();
    }

    private static ResponseCookie.ResponseCookieBuilder base(String value, boolean secure) {
        return ResponseCookie.from(NAME, value)
                .httpOnly(true)     // JavaScript cannot read it
                .secure(secure)     // true = sent only over HTTPS
                .sameSite("Lax")    // not sent on cross-site POST / PUT / DELETE
                .path("/");
    }
}
