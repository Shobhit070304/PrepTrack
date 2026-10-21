package com.preptrack.preptrack.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI preptrackOpenAPI() {
        return new OpenAPI().info(new Info()
                .title("PrepTrack API")
                .description("Exam preparation tracker for government exam aspirants")
                .version("v1"));
    }
}
