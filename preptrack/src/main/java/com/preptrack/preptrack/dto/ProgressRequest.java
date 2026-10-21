package com.preptrack.preptrack.dto;

import com.preptrack.preptrack.model.ProgressStatus;
import jakarta.validation.constraints.NotNull;

public record ProgressRequest(
        @NotNull(message = "status is required")
        ProgressStatus status
) {}
