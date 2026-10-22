package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.TopicRequest;
import com.preptrack.preptrack.dto.TopicResponse;
import com.preptrack.preptrack.exception.ResourceNotFoundException;
import com.preptrack.preptrack.model.Subject;
import com.preptrack.preptrack.model.Topic;
import com.preptrack.preptrack.repository.TopicRepository;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubjectService subjectService;

    public TopicService(TopicRepository topicRepository, SubjectService subjectService) {
        this.topicRepository = topicRepository;
        this.subjectService = subjectService;
    }

    public List<TopicResponse> getAll(Long subjectId) {
        List<Topic> topics = (subjectId != null)
                ? topicRepository.findBySubjectId(subjectId)
                : topicRepository.findAll();
        return topics.stream().map(TopicResponse::from).toList();
    }

    public TopicResponse getById(Long id) {
        return TopicResponse.from(findEntity(id));
    }

    public Topic findEntity(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id " + id));
    }

    @Transactional
    public TopicResponse create(TopicRequest request) {
        Subject subject = subjectService.findEntity(request.subjectId());   // 404 if missing
        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setSubject(subject);
        return TopicResponse.from(topicRepository.save(topic));
    }

    @Transactional
    public TopicResponse update(Long id, TopicRequest request) {
        Topic topic = findEntity(id);
        topic.setName(request.name());
        topic.setSubject(subjectService.findEntity(request.subjectId()));
        return TopicResponse.from(topicRepository.save(topic));
    }

    @Transactional
    public void delete(Long id) {
        topicRepository.delete(findEntity(id));
    }
}