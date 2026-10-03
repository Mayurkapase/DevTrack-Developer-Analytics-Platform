package com.devtrack.repository;

import com.devtrack.entity.GithubStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface GithubStatsRepository extends JpaRepository<GithubStats, Long> {

    Optional<GithubStats> findByUserId(Long userId);

    Optional<GithubStats> findByGithubUsername(String githubUsername);
}
