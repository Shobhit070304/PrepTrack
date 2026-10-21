package com.preptrack.preptrack.service;

import com.preptrack.preptrack.dto.TopicRequest;
import com.preptrack.preptrack.exception.ResourceNotFoundException;
import com.preptrack.preptrack.model.Topic;
import com.preptrack.preptrack.repository.TopicRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class TopicService {

    private final TopicRepository topicRepository;
    private final SubjectService subjectService;

    public TopicService(TopicRepository topicRepository, SubjectService subjectService) {
        this.topicRepository = topicRepository;
        this.subjectService = subjectService;
    }

    public List<Topic> getAll(Long subjectId) {
        if (subjectId != null) {
            return topicRepository.findBySubjectId(subjectId);
        }
        return topicRepository.findAll();
    }

    public Topic getById(Long id) {
        return topicRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Topic not found with id " + id));
    }

    public Topic create(TopicRequest request) {
        subjectService.getById(request.subjectId());   // throws 404 if subject doesn't exist
        Topic topic = new Topic();
        topic.setName(request.name());
        topic.setSubjectId(request.subjectId());
        return topicRepository.save(topic);
    }

    public Topic update(Long id, TopicRequest request) {
        Topic topic = getById(id);
        subjectService.getById(request.subjectId());
        topic.setName(request.name());
        topic.setSubjectId(request.subjectId());
        return topicRepository.save(topic);
    }

    public void delete(Long id) {
        Topic topic = getById(id);
        topicRepository.delete(topic);
    }
}