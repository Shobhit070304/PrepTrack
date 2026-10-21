package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.SubjectRequest;
import com.preptrack.preptrack.exception.ResourceNotFoundException;
import com.preptrack.preptrack.model.Subject;
import com.preptrack.preptrack.repository.SubjectRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class SubjectService {

    private final SubjectRepository subjectRepository;
    private final ExamService examService;

    public SubjectService(SubjectRepository subjectRepository, ExamService examService) {
        this.subjectRepository = subjectRepository;
        this.examService = examService;
    }

    public List<Subject> getAll(Long examId) {
        if (examId != null) {
            return subjectRepository.findByExamId(examId);
        }
        return subjectRepository.findAll();
    }

    public Subject getById(Long id) {
        return subjectRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subject not found with id " + id));
    }

    public Subject create(SubjectRequest request) {
        examService.getById(request.examId());   // throws 404 if exam doesn't exist
        Subject subject = new Subject();
        subject.setName(request.name());
        subject.setExamId(request.examId());
        return subjectRepository.save(subject);
    }

    public Subject update(Long id, SubjectRequest request) {
        Subject subject = getById(id);
        examService.getById(request.examId());
        subject.setName(request.name());
        subject.setExamId(request.examId());
        return subjectRepository.save(subject);
    }

    public void delete(Long id) {
        Subject subject = getById(id);
        subjectRepository.delete(subject);
    }
}
