package com.preptrack.preptrack.controller;

import com.preptrack.preptrack.dto.ExamRequest;
import com.preptrack.preptrack.dto.ExamResponse;
import com.preptrack.preptrack.dto.ExamSyllabusResponse;
import com.preptrack.preptrack.model.Exam;
import com.preptrack.preptrack.service.ExamService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exams")
public class ExamController {

    private final ExamService examService;

    public ExamController(ExamService examService) {
        this.examService = examService;
    }

    @GetMapping
    public List<ExamResponse> getAll() {
        return examService.getAll();
    }

    @GetMapping("/{id}")
    public ExamResponse getById(@PathVariable Long id) {
        return examService.getById(id);
    }

    // NEW: the full syllabus tree for one exam
    @GetMapping("/{id}/syllabus")
    public ExamSyllabusResponse getSyllabus(@PathVariable Long id) {
        return examService.getSyllabus(id);
    }

    @PostMapping
    public ResponseEntity<ExamResponse> create(@Valid @RequestBody ExamRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(examService.create(request));
    }

    @PutMapping("/{id}")
    public ExamResponse update(@PathVariable Long id, @Valid @RequestBody ExamRequest request) {
        return examService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        examService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
