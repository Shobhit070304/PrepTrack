package com.preptrack.preptrack.repository;

import com.preptrack.preptrack.model.ProgressStatus;
import com.preptrack.preptrack.model.TopicProgress;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TopicProgressRepository extends JpaRepository<TopicProgress, Long> {

    Optional<TopicProgress> findByUserIdAndTopicId(Long userId, Long topicId);

    // @EntityGraph loads the topic in the SAME query (avoids the "N+1 problem")
    @EntityGraph(attributePaths = "topic")
    List<TopicProgress> findByUserId(Long userId);

    @EntityGraph(attributePaths = "topic")
    List<TopicProgress> findByUserIdAndStatus(Long userId, ProgressStatus status);
}
