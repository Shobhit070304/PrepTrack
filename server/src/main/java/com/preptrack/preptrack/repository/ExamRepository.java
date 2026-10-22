package com.preptrack.preptrack.repository;

import com.preptrack.preptrack.model.Exam;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ExamRepository extends JpaRepository<Exam, Long> {
    boolean existsByNameIgnoreCase(String name);
}
