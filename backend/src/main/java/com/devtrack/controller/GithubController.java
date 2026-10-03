package com.devtrack.controller;

import com.devtrack.dto.ApiResponse;
import com.devtrack.dto.GithubFetchRequest;
import com.devtrack.dto.GithubStatsDto;
import com.devtrack.entity.User;
import com.devtrack.service.AuthService;
import com.devtrack.service.GithubService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/github")
@RequiredArgsConstructor
@Tag(name = "GitHub Analytics", description = "Endpoints for fetching and analyzing GitHub repositories, stars, and language distribution")
public class GithubController {

    private final GithubService githubService;
    private final AuthService authService;

    @PostMapping({"/fetch", "/sync", "/refresh"})
    @Operation(summary = "Fetch, sync, or force refresh GitHub stats", description = "Connects to official GitHub REST API, calculates stars, languages, and updates user profile")
    public ResponseEntity<ApiResponse<GithubStatsDto>> fetchGithubStats(@Valid @RequestBody GithubFetchRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        GithubStatsDto stats = githubService.fetchAndSaveGithubStats(user, request.getUsername());
        return ResponseEntity.ok(ApiResponse.ok("GitHub statistics synchronized successfully", stats));
    }

    @GetMapping("/user/{id}")
    @Operation(summary = "Get GitHub stats by user ID")
    public ResponseEntity<ApiResponse<GithubStatsDto>> getStatsByUserId(@PathVariable Long id) {
        GithubStatsDto stats = githubService.getStatsByUserId(id);
        return ResponseEntity.ok(ApiResponse.ok("GitHub statistics retrieved", stats));
    }

    @GetMapping({"/me", "/profile"})
    @Operation(summary = "Get GitHub stats for current user")
    public ResponseEntity<ApiResponse<GithubStatsDto>> getMyGithubStats() {
        User user = authService.getCurrentAuthenticatedUser();
        GithubStatsDto stats = githubService.getStatsByUserId(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("GitHub statistics retrieved", stats));
    }
}
