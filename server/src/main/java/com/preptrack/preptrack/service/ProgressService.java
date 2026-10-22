package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.ProgressRequest;
import com.preptrack.preptrack.dto.ProgressResponse;
import com.preptrack.preptrack.model.AppUser;
import com.preptrack.preptrack.model.ProgressStatus;
import com.preptrack.preptrack.model.Topic;
import com.preptrack.preptrack.model.TopicProgress;
import com.preptrack.preptrack.repository.TopicProgressRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class ProgressService {

    private final TopicProgressRepository progressRepository;
    private final UserService userService;
    private final TopicService topicService;

    public ProgressService(TopicProgressRepository progressRepository,
                           UserService userService,
                           TopicService topicService) {
        this.progressRepository = progressRepository;
        this.userService = userService;
        this.topicService = topicService;
    }

    // "Upsert": update if a row exists, otherwise create it
    @Transactional
    public ProgressResponse setStatus(Long userId, Long topicId, ProgressRequest request) {
        AppUser user = userService.findEntity(userId);   // 404 if user missing
        Topic topic = topicService.findEntity(topicId);  // 404 if topic missing

        TopicProgress progress = progressRepository
                .findByUserIdAndTopicId(userId, topicId)
                .orElseGet(() -> {
                    TopicProgress p = new TopicProgress();
                    p.setUser(user);
                    p.setTopic(topic);
                    return p;
                });

        progress.setStatus(request.status());
        return ProgressResponse.from(progressRepository.save(progress));
    }

    public List<ProgressResponse> getForUser(Long userId, ProgressStatus status) {
        userService.findEntity(userId);   // 404 if user missing

        List<TopicProgress> list = (status != null)
                ? progressRepository.findByUserIdAndStatus(userId, status)
                : progressRepository.findByUserId(userId);

        return list.stream().map(ProgressResponse::from).toList();
    }
}
