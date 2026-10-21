package com.preptrack.preptrack.dto;

import com.preptrack.preptrack.model.ProgressStatus;
import com.preptrack.preptrack.model.TopicProgress;
import java.time.LocalDateTime;

public record ProgressResponse(
        Long topicId,
        String topicName,
        ProgressStatus status,
        LocalDateTime updatedAt
) {
    public static ProgressResponse from(TopicProgress p) {
        return new ProgressResponse(
                p.getTopic().getId(),
                p.getTopic().getName(),
                p.getStatus(),
                p.getUpdatedAt());
    }
}
