-- =============================================================================
-- DevTrack AI - Production Database Schema DDL
-- Database: MySQL 8.0+
-- Core Tables: users, github_stats, projects, project_tasks
-- =============================================================================

CREATE DATABASE IF NOT EXISTS devtrack_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE devtrack_db;

-- Drop legacy / removed tables if they exist to guarantee clean state
DROP TABLE IF EXISTS dsa_progress;
DROP TABLE IF EXISTS readiness_score;
DROP TABLE IF EXISTS email_reports;
DROP TABLE IF EXISTS recommendations;
DROP TABLE IF EXISTS readiness_history;
DROP TABLE IF EXISTS resume_skills;
DROP TABLE IF EXISTS resume_analysis;
DROP TABLE IF EXISTS leetcode_stats;
DROP TABLE IF EXISTS github_languages;
DROP TABLE IF EXISTS refresh_tokens;

-- -----------------------------------------------------------------------------
-- 1. Table: users
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'ROLE_USER',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 2. Table: github_stats
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS github_stats (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL UNIQUE,
    github_username VARCHAR(100) NOT NULL,
    name VARCHAR(150),
    bio TEXT,
    company VARCHAR(150),
    location VARCHAR(200),
    avatar_url VARCHAR(255),
    profile_url VARCHAR(255),
    account_created_at TIMESTAMP NULL,
    repositories INT DEFAULT 0,
    followers INT DEFAULT 0,
    following INT DEFAULT 0,
    stars INT DEFAULT 0,
    total_forks INT DEFAULT 0,
    public_gists INT DEFAULT 0,
    top_language VARCHAR(50) DEFAULT 'None',
    languages_json TEXT,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_github_user (user_id),
    INDEX idx_github_username (github_username)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 3. Table: projects
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS projects (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_projects_user (user_id),
    INDEX idx_projects_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- -----------------------------------------------------------------------------
-- 4. Table: project_tasks
-- -----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_tasks (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    project_id BIGINT NOT NULL,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    status VARCHAR(30) NOT NULL DEFAULT 'NOT_STARTED',
    due_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE,
    INDEX idx_tasks_project (project_id),
    INDEX idx_tasks_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
