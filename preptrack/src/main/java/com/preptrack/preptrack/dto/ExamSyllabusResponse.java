package com.preptrack.preptrack.dto;

import com.preptrack.preptrack.model.Exam;
import java.util.List;

public record ExamSyllabusResponse(Long id, String name, List<SubjectNode> subjects) {

    public record SubjectNode(Long id, String name, List<TopicResponse> topics) {}

    public static ExamSyllabusResponse from(Exam exam) {
        List<SubjectNode> subjects = exam.getSubjects().stream()
                .map(s -> new SubjectNode(
                        s.getId(),
                        s.getName(),
                        s.getTopics().stream().map(TopicResponse::from).toList()))
                .toList();
        return new ExamSyllabusResponse(exam.getId(), exam.getName(), subjects);
    }
}
