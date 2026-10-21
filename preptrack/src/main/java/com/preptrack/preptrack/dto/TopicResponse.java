package com.preptrack.preptrack.dto;

import com.preptrack.preptrack.model.Topic;

public record TopicResponse(Long id, String name, Long subjectId) {
    public static TopicResponse from(Topic topic) {
        return new TopicResponse(topic.getId(), topic.getName(), topic.getSubject().getId());
    }
}
