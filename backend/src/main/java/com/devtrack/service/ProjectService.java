package com.devtrack.service;

import com.devtrack.dto.*;
import com.devtrack.entity.Project;
import com.devtrack.entity.ProjectTask;
import com.devtrack.entity.User;
import com.devtrack.exception.ApiException;
import com.devtrack.exception.ResourceNotFoundException;
import com.devtrack.repository.ProjectRepository;
import com.devtrack.repository.ProjectTaskRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProjectService {

    private final ProjectRepository projectRepository;
    private final ProjectTaskRepository projectTaskRepository;

    private static final Set<String> VALID_STATUSES = new HashSet<>(Arrays.asList(
            "NOT_STARTED", "IN_PROGRESS", "COMPLETED"
    ));

    @Transactional(readOnly = true)
    public List<ProjectDto> getProjectsByUser(Long userId) {
        return projectRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ProjectDto getProjectById(Long userId, Long projectId) {
        Project project = findProjectAndVerifyOwnership(userId, projectId);
        return mapToDto(project);
    }

    @Transactional
    public ProjectDto createProject(User user, CreateProjectRequest request) {
        String status = normalizeStatus(request.getStatus());

        Project project = Project.builder()
                .user(user)
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(status)
                .startDate(request.getStartDate())
                .endDate(request.getEndDate())
                .build();

        Project saved = projectRepository.save(project);
        return mapToDto(saved);
    }

    @Transactional
    public ProjectDto updateProject(User user, Long projectId, UpdateProjectRequest request) {
        Project project = findProjectAndVerifyOwnership(user.getId(), projectId);

        project.setName(request.getName().trim());
        if (request.getDescription() != null) {
            project.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            project.setStatus(normalizeStatus(request.getStatus()));
        }
        project.setStartDate(request.getStartDate());
        project.setEndDate(request.getEndDate());

        Project saved = projectRepository.save(project);
        return mapToDto(saved);
    }

    @Transactional
    public void deleteProject(User user, Long projectId) {
        Project project = findProjectAndVerifyOwnership(user.getId(), projectId);
        projectRepository.delete(project);
    }

    @Transactional
    public ProjectTaskDto createTask(User user, Long projectId, CreateTaskRequest request) {
        Project project = findProjectAndVerifyOwnership(user.getId(), projectId);
        String status = normalizeStatus(request.getStatus());

        ProjectTask task = ProjectTask.builder()
                .project(project)
                .name(request.getName().trim())
                .description(request.getDescription() != null ? request.getDescription().trim() : null)
                .status(status)
                .dueDate(request.getDueDate())
                .build();

        project.addTask(task);
        ProjectTask savedTask = projectTaskRepository.save(task);

        // Auto-update project status if all tasks become completed or first task started
        syncProjectStatusFromTasks(project);

        return mapTaskToDto(savedTask);
    }

    @Transactional
    public ProjectTaskDto updateTask(User user, Long projectId, Long taskId, UpdateTaskRequest request) {
        Project project = findProjectAndVerifyOwnership(user.getId(), projectId);
        ProjectTask task = projectTaskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        task.setName(request.getName().trim());
        if (request.getDescription() != null) {
            task.setDescription(request.getDescription().trim());
        }
        if (request.getStatus() != null) {
            task.setStatus(normalizeStatus(request.getStatus()));
        }
        task.setDueDate(request.getDueDate());

        ProjectTask savedTask = projectTaskRepository.save(task);
        syncProjectStatusFromTasks(project);

        return mapTaskToDto(savedTask);
    }

    @Transactional
    public void deleteTask(User user, Long projectId, Long taskId) {
        Project project = findProjectAndVerifyOwnership(user.getId(), projectId);
        ProjectTask task = projectTaskRepository.findByIdAndProjectId(taskId, projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Task", "id", taskId));

        project.removeTask(task);
        projectTaskRepository.delete(task);
        syncProjectStatusFromTasks(project);
    }

    @Transactional(readOnly = true)
    public ProjectSummaryDto getProjectSummary(Long userId) {
        List<Project> projects = projectRepository.findByUserIdOrderByCreatedAtDesc(userId);

        long totalProjects = projects.size();
        long activeProjects = 0;
        long completedProjects = 0;
        long notStartedProjects = 0;

        int totalTasks = 0;
        int completedTasks = 0;

        Map<String, Long> statusDistribution = new LinkedHashMap<>();
        statusDistribution.put("NOT_STARTED", 0L);
        statusDistribution.put("IN_PROGRESS", 0L);
        statusDistribution.put("COMPLETED", 0L);

        for (Project p : projects) {
            String status = p.getStatus() != null ? p.getStatus() : "NOT_STARTED";
            statusDistribution.put(status, statusDistribution.getOrDefault(status, 0L) + 1L);

            if ("IN_PROGRESS".equals(status)) activeProjects++;
            else if ("COMPLETED".equals(status)) completedProjects++;
            else notStartedProjects++;

            List<ProjectTask> tasks = p.getTasks() != null ? p.getTasks() : Collections.emptyList();
            totalTasks += tasks.size();
            for (ProjectTask t : tasks) {
                if ("COMPLETED".equals(t.getStatus())) {
                    completedTasks++;
                }
            }
        }

        int pendingTasks = totalTasks - completedTasks;
        double overallPercentage = 0.0;
        if (totalTasks > 0) {
            overallPercentage = ((double) completedTasks / totalTasks) * 100.0;
        } else if (totalProjects > 0) {
            overallPercentage = ((double) completedProjects / totalProjects) * 100.0;
        }
        overallPercentage = Math.round(overallPercentage * 10.0) / 10.0;

        List<ProjectDto> recentProjects = projects.stream()
                .limit(5)
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return ProjectSummaryDto.builder()
                .totalProjects(totalProjects)
                .activeProjects(activeProjects)
                .completedProjects(completedProjects)
                .notStartedProjects(notStartedProjects)
                .totalTasks(totalTasks)
                .completedTasks(completedTasks)
                .pendingTasks(pendingTasks)
                .overallCompletionPercentage(overallPercentage)
                .statusDistribution(statusDistribution)
                .recentProjects(recentProjects)
                .build();
    }

    private void syncProjectStatusFromTasks(Project project) {
        List<ProjectTask> tasks = project.getTasks();
        if (tasks == null || tasks.isEmpty()) {
            return;
        }

        long completedCount = tasks.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        long inProgressCount = tasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();

        if (completedCount == tasks.size()) {
            project.setStatus("COMPLETED");
        } else if (completedCount > 0 || inProgressCount > 0) {
            project.setStatus("IN_PROGRESS");
        }
        projectRepository.save(project);
    }

    private Project findProjectAndVerifyOwnership(Long userId, Long projectId) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new ResourceNotFoundException("Project", "id", projectId));

        if (!project.getUser().getId().equals(userId)) {
            throw new ApiException("Not authorized to access this project", HttpStatus.FORBIDDEN);
        }
        return project;
    }

    private String normalizeStatus(String status) {
        if (status == null || status.trim().isEmpty()) {
            return "NOT_STARTED";
        }
        String upper = status.trim().toUpperCase().replace(" ", "_");
        if (!VALID_STATUSES.contains(upper)) {
            throw new ApiException("Invalid status. Must be NOT_STARTED, IN_PROGRESS, or COMPLETED", HttpStatus.BAD_REQUEST);
        }
        return upper;
    }

    public ProjectDto mapToDto(Project project) {
        List<ProjectTask> taskEntities = project.getTasks() != null ? project.getTasks() : Collections.emptyList();
        List<ProjectTaskDto> taskDtos = taskEntities.stream()
                .map(this::mapTaskToDto)
                .collect(Collectors.toList());

        int total = taskEntities.size();
        int completed = (int) taskEntities.stream().filter(t -> "COMPLETED".equals(t.getStatus())).count();
        int pending = total - completed;

        double percentage;
        if (total > 0) {
            percentage = ((double) completed / total) * 100.0;
        } else if ("COMPLETED".equals(project.getStatus())) {
            percentage = 100.0;
        } else {
            percentage = 0.0;
        }
        percentage = Math.round(percentage * 10.0) / 10.0;

        return ProjectDto.builder()
                .id(project.getId())
                .userId(project.getUser().getId())
                .name(project.getName())
                .description(project.getDescription())
                .status(project.getStatus())
                .startDate(project.getStartDate())
                .endDate(project.getEndDate())
                .totalTasks(total)
                .completedTasks(completed)
                .pendingTasks(pending)
                .completionPercentage(percentage)
                .tasks(taskDtos)
                .createdAt(project.getCreatedAt())
                .updatedAt(project.getUpdatedAt())
                .build();
    }

    public ProjectTaskDto mapTaskToDto(ProjectTask task) {
        return ProjectTaskDto.builder()
                .id(task.getId())
                .projectId(task.getProject().getId())
                .name(task.getName())
                .description(task.getDescription())
                .status(task.getStatus())
                .dueDate(task.getDueDate())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
