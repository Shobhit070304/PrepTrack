package com.preptrack.preptrack.dto;

import com.preptrack.preptrack.model.Subject;

public record SubjectResponse(Long id, String name, Long examId) {
    public static SubjectResponse from(Subject subject) {
        return new SubjectResponse(subject.getId(), subject.getName(), subject.getExam().getId());
    }
}
