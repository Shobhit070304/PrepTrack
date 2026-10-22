package com.preptrack.preptrack.security;

import com.preptrack.preptrack.model.AppUser;
import com.preptrack.preptrack.service.UserService;
import org.springframework.core.convert.converter.Converter;
import org.springframework.security.authentication.AbstractAuthenticationToken;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class GoogleJwtAuthConverter implements Converter<Jwt, AbstractAuthenticationToken> {
    private final UserService userService;

    public GoogleJwtAuthConverter(UserService userService) {
        this.userService = userService;
    }

    @Override
    public AbstractAuthenticationToken convert(Jwt jwt) {
        // "sub" is Google's permanent id for the user
        AppUser user = userService.findByGoogleId(jwt.getSubject())
                .orElseThrow(() -> new BadCredentialsException("User not found, please sign in again"));

        List<GrantedAuthority> authorities =
                List.of(new SimpleGrantedAuthority("ROLE_" + user.getRole().name()));

        return new UsernamePasswordAuthenticationToken(
                new AuthUser(user.getId(), user.getEmail()), jwt, authorities);
    }
}
