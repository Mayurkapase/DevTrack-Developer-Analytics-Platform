package com.devtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProjectSummaryDto {

    private long totalProjects;
    private long activeProjects;
    private long completedProjects;
    private long notStartedProjects;

    private int totalTasks;
    private int completedTasks;
    private int pendingTasks;

    private double overallCompletionPercentage;

    private Map<String, Long> statusDistribution;
    private List<ProjectDto> recentProjects;
}
