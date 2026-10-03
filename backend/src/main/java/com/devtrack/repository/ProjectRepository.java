package com.devtrack.repository;

import com.devtrack.entity.Project;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ProjectRepository extends JpaRepository<Project, Long> {

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"tasks"})
    List<Project> findByUserIdOrderByCreatedAtDesc(Long userId);

    Optional<Project> findByIdAndUserId(Long id, Long userId);

    long countByUserId(Long userId);

    long countByUserIdAndStatus(Long userId, String status);

    @Query("SELECT p.status, COUNT(p) FROM Project p WHERE p.user.id = :userId GROUP BY p.status")
    List<Object[]> countProjectsByStatusGrouped(@Param("userId") Long userId);
}
