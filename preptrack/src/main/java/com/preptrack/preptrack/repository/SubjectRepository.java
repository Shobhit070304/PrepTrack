package com.preptrack.preptrack.repository;

import com.preptrack.preptrack.model.Subject;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SubjectRepository extends JpaRepository<Subject, Long> {
    List<Subject> findByExamId(Long examId);
}
