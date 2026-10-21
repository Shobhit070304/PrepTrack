package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.ExamRequest;
import com.preptrack.preptrack.dto.ExamResponse;
import com.preptrack.preptrack.dto.ExamSyllabusResponse;
import com.preptrack.preptrack.exception.DuplicateResourceException;
import com.preptrack.preptrack.exception.ResourceNotFoundException;
import com.preptrack.preptrack.model.Exam;
import com.preptrack.preptrack.repository.ExamRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ExamService {

    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public List<ExamResponse> getAll() {
        return examRepository.findAll().stream().map(ExamResponse::from).toList();
    }

    public ExamResponse getById(Long id) {
        return ExamResponse.from(findEntity(id));
    }

    // Full tree: Exam -> Subjects -> Topics
    public ExamSyllabusResponse getSyllabus(Long id) {
        return ExamSyllabusResponse.from(findEntity(id));
    }

    // Used by other services
    public Exam findEntity(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id " + id));
    }

    @Transactional
    public ExamResponse create(ExamRequest request) {
        if (examRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Exam already exists: " + request.name());
        }
        Exam exam = new Exam();
        exam.setName(request.name());
        exam.setDescription(request.description());
        return ExamResponse.from(examRepository.save(exam));
    }

    @Transactional
    public ExamResponse update(Long id, ExamRequest request) {
        Exam exam = findEntity(id);

        boolean nameChanged = !exam.getName().equalsIgnoreCase(request.name());
        if (nameChanged && examRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Exam already exists: " + request.name());
        }

        exam.setName(request.name());
        exam.setDescription(request.description());
        return ExamResponse.from(examRepository.save(exam));
    }

    @Transactional
    public void delete(Long id) {
        examRepository.delete(findEntity(id));   // subjects and topics are deleted too (cascade)
    }
}
