package com.devtrack.controller;

import com.devtrack.dto.*;
import com.devtrack.entity.User;
import com.devtrack.service.AuthService;
import com.devtrack.service.ProjectService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/projects")
@RequiredArgsConstructor
@Tag(name = "Project Tracker", description = "Endpoints for managing full-stack developer projects and child tasks with automated progress analytics")
public class ProjectController {

    private final ProjectService projectService;
    private final AuthService authService;

    @GetMapping
    @Operation(summary = "Get all projects for current user")
    public ResponseEntity<ApiResponse<List<ProjectDto>>> getMyProjects() {
        User user = authService.getCurrentAuthenticatedUser();
        List<ProjectDto> list = projectService.getProjectsByUser(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Projects retrieved successfully", list));
    }

    @GetMapping("/summary")
    @Operation(summary = "Get project summary metrics for Dashboard")
    public ResponseEntity<ApiResponse<ProjectSummaryDto>> getProjectSummary() {
        User user = authService.getCurrentAuthenticatedUser();
        ProjectSummaryDto summary = projectService.getProjectSummary(user.getId());
        return ResponseEntity.ok(ApiResponse.ok("Project summary analytics retrieved", summary));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get project by ID")
    public ResponseEntity<ApiResponse<ProjectDto>> getProjectById(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        ProjectDto project = projectService.getProjectById(user.getId(), id);
        return ResponseEntity.ok(ApiResponse.ok("Project retrieved successfully", project));
    }

    @PostMapping
    @Operation(summary = "Create a new project")
    public ResponseEntity<ApiResponse<ProjectDto>> createProject(@Valid @RequestBody CreateProjectRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        ProjectDto created = projectService.createProject(user, request);
        return new ResponseEntity<>(ApiResponse.ok("Project created successfully", created), HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing project")
    public ResponseEntity<ApiResponse<ProjectDto>> updateProject(@PathVariable Long id, @Valid @RequestBody UpdateProjectRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        ProjectDto updated = projectService.updateProject(user, id, request);
        return ResponseEntity.ok(ApiResponse.ok("Project updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a project and its tasks")
    public ResponseEntity<ApiResponse<Void>> deleteProject(@PathVariable Long id) {
        User user = authService.getCurrentAuthenticatedUser();
        projectService.deleteProject(user, id);
        return ResponseEntity.ok(ApiResponse.ok("Project deleted successfully", null));
    }

    @PostMapping("/{id}/tasks")
    @Operation(summary = "Add a task to a project")
    public ResponseEntity<ApiResponse<ProjectTaskDto>> createTask(@PathVariable Long id, @Valid @RequestBody CreateTaskRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        ProjectTaskDto task = projectService.createTask(user, id, request);
        return new ResponseEntity<>(ApiResponse.ok("Task created successfully", task), HttpStatus.CREATED);
    }

    @PutMapping("/{id}/tasks/{taskId}")
    @Operation(summary = "Update a task within a project")
    public ResponseEntity<ApiResponse<ProjectTaskDto>> updateTask(
            @PathVariable Long id,
            @PathVariable Long taskId,
            @Valid @RequestBody UpdateTaskRequest request) {
        User user = authService.getCurrentAuthenticatedUser();
        ProjectTaskDto updated = projectService.updateTask(user, id, taskId, request);
        return ResponseEntity.ok(ApiResponse.ok("Task updated successfully", updated));
    }

    @DeleteMapping("/{id}/tasks/{taskId}")
    @Operation(summary = "Delete a task from a project")
    public ResponseEntity<ApiResponse<Void>> deleteTask(
            @PathVariable Long id,
            @PathVariable Long taskId) {
        User user = authService.getCurrentAuthenticatedUser();
        projectService.deleteTask(user, id, taskId);
        return ResponseEntity.ok(ApiResponse.ok("Task deleted successfully", null));
    }
}
