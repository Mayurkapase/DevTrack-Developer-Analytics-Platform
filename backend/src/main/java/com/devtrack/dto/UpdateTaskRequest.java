package com.devtrack.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UpdateTaskRequest {

    @NotBlank(message = "Task name is required")
    @Size(min = 2, max = 150, message = "Task name must be between 2 and 150 characters")
    private String name;

    private String description;

    private String status; // NOT_STARTED, IN_PROGRESS, COMPLETED

    private LocalDate dueDate;
}
