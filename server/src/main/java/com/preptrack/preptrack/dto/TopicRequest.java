package com.preptrack.preptrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record TopicRequest(
        @NotBlank(message = "Topic name is required")
        @Size(max = 100, message = "Topic name must be at most 100 characters")
        String name,

        @NotNull(message = "subjectId is required")
        Long subjectId
) {}
