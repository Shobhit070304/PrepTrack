package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.SubjectRequest;
import com.preptrack.preptrack.dto.SubjectResponse;
import com.preptrack.preptrack.exception.ResourceNotFoundException;
import com.preptrack.preptrack.model.Exam;
import com.preptrack.preptrack.model.Subject;
import com.preptrack.preptrack.repository.SubjectRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final ExamService examService;

    public SubjectService(SubjectRepository subjectRepository, ExamService examService) {
        this.subjectRepository = subjectRepository;
        this.examService = examService;
    }

    public List<SubjectResponse> getAll(Long examId) {
        List<Subject> subjects = (examId != null)
                ? subjectRepository.findByExamId(examId)
                : subjectRepository.findAll();
        return subjects.stream().map(SubjectResponse::from).toList();
    }

    public SubjectResponse getById(Long id) {
        return SubjectResponse.from(findEntity(id));
    }

    public Subject findEntity(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id " + id));
    }

    @Transactional
    public SubjectResponse create(SubjectRequest request) {
        Exam exam = examService.findEntity(request.examId());   // 404 if exam doesn't exist
        Subject subject = new Subject();
        subject.setName(request.name());
        subject.setExam(exam);
        return SubjectResponse.from(subjectRepository.save(subject));
    }

    @Transactional
    public SubjectResponse update(Long id, SubjectRequest request) {
        Subject subject = findEntity(id);
        subject.setName(request.name());
        subject.setExam(examService.findEntity(request.examId()));
        return SubjectResponse.from(subjectRepository.save(subject));
    }

    @Transactional
    public void delete(Long id) {
        subjectRepository.delete(findEntity(id));   // topics are deleted too (cascade)
    }
}
