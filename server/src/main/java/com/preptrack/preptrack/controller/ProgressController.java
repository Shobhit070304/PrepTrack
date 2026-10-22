package com.preptrack.preptrack.controller;

import com.preptrack.preptrack.dto.ProgressRequest;
import com.preptrack.preptrack.dto.ProgressResponse;
import com.preptrack.preptrack.model.ProgressStatus;
import com.preptrack.preptrack.security.AuthUser;
import com.preptrack.preptrack.service.ProgressService;
import jakarta.validation.Valid;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/me/progress")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    // PUT /api/me/progress/5   body: { "status": "LEARNING" }
    @PutMapping("/{topicId}")
    public ProgressResponse setStatus(@AuthenticationPrincipal AuthUser principal,
                                      @PathVariable Long topicId,
                                      @Valid @RequestBody ProgressRequest request) {
        return progressService.setStatus(principal.userId(), topicId, request);
    }

    // GET /api/me/progress   or   GET /api/me/progress?status=DONE
    @GetMapping
    public List<ProgressResponse> getMine(@AuthenticationPrincipal AuthUser principal,
                                          @RequestParam(required = false) ProgressStatus status) {
        return progressService.getForUser(principal.userId(), status);
    }
}
