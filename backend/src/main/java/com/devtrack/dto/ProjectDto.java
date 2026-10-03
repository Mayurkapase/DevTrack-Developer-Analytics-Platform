package com.devtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectDto {

    private Long id;
    private Long userId;
    private String name;
    private String description;
    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED
    private LocalDate startDate;
    private LocalDate endDate;

    private int totalTasks;
    private int completedTasks;
    private int pendingTasks;
    private double completionPercentage;

    @Builder.Default
    private List<ProjectTaskDto> tasks = new ArrayList<>();

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
