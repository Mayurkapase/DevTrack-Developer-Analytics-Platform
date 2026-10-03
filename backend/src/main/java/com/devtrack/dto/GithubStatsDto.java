package com.devtrack.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GithubStatsDto {

    private Long id;
    private Long userId;
    private String githubUsername;
    private String name;
    private String bio;
    private String company;
    private String location;
    private Integer repositories;
    private Integer followers;
    private Integer following;
    private Integer stars;
    private Integer totalForks;
    private Integer publicGists;
    private String avatarUrl;
    private String profileUrl;
    private LocalDateTime accountCreatedAt;
    private String topLanguage;
    private Map<String, Integer> languageDistribution;
    private LocalDateTime lastUpdated;
}
