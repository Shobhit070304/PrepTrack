package com.preptrack.preptrack.dto;

import com.preptrack.preptrack.model.Exam;

public record ExamResponse(Long id, String name, String description) {
    public static ExamResponse from(Exam exam) {
        return new ExamResponse(exam.getId(), exam.getName(), exam.getDescription());
    }
}
