package com.devtrack.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "github_stats")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GithubStats {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private User user;

    @Column(name = "github_username", nullable = false, length = 100)
    private String githubUsername;

    @Column(name = "name", length = 150)
    private String name;

    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;

    @Column(name = "company", length = 150)
    private String company;

    @Column(name = "location", length = 200)
    private String location;

    @Builder.Default
    private Integer repositories = 0;

    @Builder.Default
    private Integer followers = 0;

    @Builder.Default
    private Integer following = 0;

    @Column(name = "stars")
    @Builder.Default
    private Integer stars = 0;

    @Column(name = "total_forks")
    @Builder.Default
    private Integer totalForks = 0;

    @Column(name = "public_gists")
    @Builder.Default
    private Integer publicGists = 0;

    @Column(name = "avatar_url", length = 255)
    private String avatarUrl;

    @Column(name = "profile_url", length = 255)
    private String profileUrl;

    @Column(name = "account_created_at")
    private LocalDateTime accountCreatedAt;

    @Column(name = "top_language", length = 50)
    @Builder.Default
    private String topLanguage = "None";

    @Column(name = "languages_json", columnDefinition = "TEXT")
    private String languagesJson;

    @UpdateTimestamp
    @Column(name = "last_updated")
    private LocalDateTime lastUpdated;
}
