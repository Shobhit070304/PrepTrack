package com.preptrack.preptrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record ExamRequest(
        @NotBlank(message = "Exam name is required")
        @Size(max = 100, message = "Exam name must be at most 100 characters")
        String name,

        @Size(max = 500, message = "Description must be at most 500 characters")
        String description
) {}
