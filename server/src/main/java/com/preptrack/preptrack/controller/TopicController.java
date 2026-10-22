package com.preptrack.preptrack.controller;

import com.preptrack.preptrack.dto.TopicRequest;
import com.preptrack.preptrack.dto.TopicResponse;
import com.preptrack.preptrack.model.Topic;
import com.preptrack.preptrack.service.TopicService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/topics")
public class TopicController {

    private final TopicService topicService;

    public TopicController(TopicService topicService) {
        this.topicService = topicService;
    }

    @GetMapping
    public List<TopicResponse> getAll(@RequestParam(required = false) Long subjectId) {
        return topicService.getAll(subjectId);
    }

    @GetMapping("/{id}")
    public TopicResponse getById(@PathVariable Long id) {
        return topicService.getById(id);
    }

    @PostMapping
    public ResponseEntity<TopicResponse> create(@Valid @RequestBody TopicRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(topicService.create(request));
    }

    @PutMapping("/{id}")
    public TopicResponse update(@PathVariable Long id, @Valid @RequestBody TopicRequest request) {
        return topicService.update(id, request);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        topicService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
