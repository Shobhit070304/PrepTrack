package com.preptrack.preptrack.security;

import com.preptrack.preptrack.security.AuthCookies;
import com.preptrack.preptrack.security.GoogleJwtAuthConverter;
import jakarta.servlet.http.Cookie;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.oauth2.core.DelegatingOAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2Error;
import org.springframework.security.oauth2.core.OAuth2TokenValidator;
import org.springframework.security.oauth2.core.OAuth2TokenValidatorResult;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtValidators;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.server.resource.web.BearerTokenResolver;
import org.springframework.security.oauth2.server.resource.web.DefaultBearerTokenResolver;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.util.WebUtils;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http,
                                                   JwtDecoder jwtDecoder,
                                                   GoogleJwtAuthConverter authConverter,
                                                   BearerTokenResolver tokenResolver) throws Exception {
        http
                // See section 10 for why CSRF is off
                .csrf(csrf -> csrf.disable())

                // Stateless: Spring never creates a session
                .sessionManagement(s -> s.sessionCreationPolicy(SessionCreationPolicy.STATELESS))

                .authorizeHttpRequests(auth -> auth
                        // Swagger, test page, login and logout: open
                        .requestMatchers("/swagger-ui.html", "/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/error", "/login.html").permitAll()
                        .requestMatchers("/api/auth/**").permitAll()

                        // Syllabus: anyone can READ, only admins can CHANGE
                        .requestMatchers(HttpMethod.GET, "/api/exams/**", "/api/subjects/**", "/api/topics/**").permitAll()
                        .requestMatchers("/api/exams/**", "/api/subjects/**", "/api/topics/**").hasRole("ADMIN")

                        // Everything else (/api/me, /api/me/progress, ...): must be logged in
                        .anyRequest().authenticated()
                )

                // Read the token, verify it, turn it into our user
                .oauth2ResourceServer(oauth -> oauth
                        .bearerTokenResolver(tokenResolver)
                        .jwt(jwt -> jwt
                                .decoder(jwtDecoder)
                                .jwtAuthenticationConverter(authConverter))
                );

        return http.build();
    }

    // Checks a Google token: signature, expiry, issuer and audience
    @Bean
    public JwtDecoder jwtDecoder(@Value("${google.client-id}") String clientId) {
        NimbusJwtDecoder decoder = NimbusJwtDecoder
                .withJwkSetUri("https://www.googleapis.com/oauth2/v3/certs")   // Google's public keys
                .build();

        OAuth2TokenValidator<Jwt> googleValidator = jwt -> {
            String issuer = jwt.getClaimAsString("iss");
            boolean issuerOk = "https://accounts.google.com".equals(issuer)
                    || "accounts.google.com".equals(issuer);
            boolean audienceOk = jwt.getAudience() != null && jwt.getAudience().contains(clientId);

            return (issuerOk && audienceOk)
                    ? OAuth2TokenValidatorResult.success()
                    : OAuth2TokenValidatorResult.failure(
                    new OAuth2Error("invalid_token", "Token was not issued for this app", null));
        };

        // createDefault() already checks that the token is not expired
        decoder.setJwtValidator(
                new DelegatingOAuth2TokenValidator<>(JwtValidators.createDefault(), googleValidator));
        return decoder;
    }

    // Where to find the token: the Authorization header first, then the cookie
    @Bean
    public BearerTokenResolver bearerTokenResolver() {
        DefaultBearerTokenResolver headerResolver = new DefaultBearerTokenResolver();

        return request -> {
            // Login and logout never need a token (an old cookie must not block them)
            if (request.getRequestURI().startsWith("/api/auth/")) {
                return null;
            }

            String fromHeader = headerResolver.resolve(request);   // Authorization: Bearer <token>
            if (fromHeader != null) {
                return fromHeader;
            }

            Cookie cookie = WebUtils.getCookie(request, AuthCookies.NAME);
            return (cookie != null && !cookie.getValue().isBlank()) ? cookie.getValue() : null;
        };
    }
}
