package com.preptrack.preptrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record SubjectRequest(
        @NotBlank(message = "Subject name is required")
        @Size(max = 100, message = "Subject name must be at most 100 characters")
        String name,

        @NotNull(message = "examId is required")
        Long examId
) {}
