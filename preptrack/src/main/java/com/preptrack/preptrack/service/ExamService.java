package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.ExamRequest;
import com.preptrack.preptrack.exception.DuplicateResourceException;
import com.preptrack.preptrack.exception.ResourceNotFoundException;
import com.preptrack.preptrack.model.Exam;
import com.preptrack.preptrack.repository.ExamRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ExamService {

    private final ExamRepository examRepository;

    public ExamService(ExamRepository examRepository) {
        this.examRepository = examRepository;
    }

    public List<Exam> getAll() {
        return examRepository.findAll();
    }

    public Exam getById(Long id) {
        return examRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Exam not found with id " + id));
    }

    public Exam create(ExamRequest request) {
        if (examRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Exam already exists: " + request.name());
        }
        Exam exam = new Exam();
        exam.setName(request.name());
        exam.setDescription(request.description());
        return examRepository.save(exam);
    }

    public Exam update(Long id, ExamRequest request) {
        Exam exam = getById(id);

        boolean nameChanged = !exam.getName().equalsIgnoreCase(request.name());
        if (nameChanged && examRepository.existsByNameIgnoreCase(request.name())) {
            throw new DuplicateResourceException("Exam already exists: " + request.name());
        }

        exam.setName(request.name());
        exam.setDescription(request.description());
        return examRepository.save(exam);
    }

    public void delete(Long id) {
        Exam exam = getById(id);
        examRepository.delete(exam);
    }
}
