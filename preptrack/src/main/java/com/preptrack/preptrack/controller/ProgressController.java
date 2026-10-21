package com.preptrack.preptrack.controller;

import com.preptrack.preptrack.dto.ProgressRequest;
import com.preptrack.preptrack.dto.ProgressResponse;
import com.preptrack.preptrack.model.ProgressStatus;
import com.preptrack.preptrack.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users/{userId}/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    // PUT /api/users/1/progress/5  body: { "status": "LEARNING" }
    @PutMapping("/{topicId}")
    public ProgressResponse setStatus(@PathVariable Long userId,
                                      @PathVariable Long topicId,
                                      @Valid @RequestBody ProgressRequest request) {
        return progressService.setStatus(userId, topicId, request);
    }

    // GET /api/users/1/progress   or   GET /api/users/1/progress?status=DONE
    @GetMapping
    public List<ProgressResponse> getForUser(@PathVariable Long userId,
                                             @RequestParam(required = false) ProgressStatus status) {
        return progressService.getForUser(userId, status);
    }
}
