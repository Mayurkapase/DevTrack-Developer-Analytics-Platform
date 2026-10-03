# DevTrack - System Architecture & Technical Specifications

---

## 1. Architectural Overview

DevTrack is built following a clean, decoupled **Client-Server Architecture** adhering to enterprise domain-driven design, stateless session management, and strict relational normalization (3NF).

```mermaid
graph TD
    User["👨‍💻 Client Browser / User"]

    subgraph Presentation["Presentation Tier (Port 5173 / Port 80)"]
        SPA["React 18 SPA (Vite + Tailwind CSS + Recharts)"]
        Router["React Router v6 (Protected Route Guards)"]
        Axios["Axios Interceptor (JWT Auto-Injection & 401 Handler)"]
        SPA --> Router
        Router --> Axios
    end

    subgraph SecurityTier["Security & API Gateway (Port 8080)"]
        SecFilterChain["Spring Security 6 Filter Chain"]
        JWTFilter["JwtAuthenticationFilter (HMAC-SHA256 Token Validation)"]
        SecFilterChain --> JWTFilter
    end

    subgraph ServiceTier["Application Tier (Spring Boot 3.2.5 - Java 21)"]
        AuthCtrl["AuthController (/api/auth)"]
        GithubCtrl["GithubController (/api/github)"]
        ProjCtrl["ProjectController (/api/projects)"]

        AuthSvc["AuthService (BCrypt + JWT Generation)"]
        GithubSvc["GithubService (RestTemplate + Rate Limit Resilient)"]
        ProjSvc["ProjectService (Dynamic % Calculation & IDOR Check)"]

        AuthCtrl --> AuthSvc
        GithubCtrl --> GithubSvc
        ProjCtrl --> ProjSvc
    end

    subgraph PersistenceTier["Data & Integration Tier"]
        JPA["Spring Data JPA 3 / Hibernate 6 ORM"]
        MySQL[("MySQL 8.0 Database (users, github_stats, projects, project_tasks)")]
        GitHubAPI["🌐 Official GitHub REST API (api.github.com)"]

        AuthSvc --> JPA
        ProjSvc --> JPA
        GithubSvc --> JPA
        GithubSvc -->|HTTPS /api.github.com| GitHubAPI
        JPA -->|HikariCP Connection Pool| MySQL
    end

    User -->|HTTPS Requests| SPA
    Axios -->|REST API Calls + Bearer Token| SecFilterChain
    JWTFilter --> AuthCtrl
    JWTFilter --> GithubCtrl
    JWTFilter --> ProjCtrl
```

---

## 2. Core Architectural Pillars

### A. Presentation Tier (React 18 + Vite)
- **Component Hierarchy**: Modular UI with reusable atomic components (`Card`, `StatCard`, `Badge`, `EmptyState`, `LoadingSpinner`).
- **State Management**: Centralized `AuthContext` provides authenticated user context, persistent tokens, and proactive session clearing.
- **Route Protection**: `ProtectedRoute` wrapper enforces authentication boundaries prior to component rendering.
- **Data Visualizations**: Recharts declarative charts render real-time language distributions and project status breakdowns.

### B. Security & API Tier (Spring Security 6 + JJWT)
- **Stateless Authentication**: Completely session-free. Every authorized request requires an HMAC-SHA256 signed JWT Bearer token in the `Authorization` header.
- **Cryptographic Hashing**: User credentials hashed with BCrypt (10 rounds of salt) prior to database persistence.
- **CORS Whitelisting**: Strict origin controls prevent unauthorized cross-origin invocations.
- **OpenAPI 3.0 Documentation**: Interactive Swagger interface at `/swagger-ui/index.html`.

### C. Domain & Business Logic Tier
- **Data Isolation & IDOR Protection**: All mutations on projects and tasks verify that the entity's `user_id` matches the authenticated `UserPrincipal` extracted from the JWT token.
- **Dynamic Progress Engine**: Project completion percentages are dynamically computed:
  $$\text{Completion \%} = \left( \frac{\sum \text{Status} = \text{COMPLETED}}{\text{Total Tasks}} \right) \times 100$$
- **Automatic Status Synchronization**: When all tasks under a project reach `COMPLETED`, the project status automatically updates to `COMPLETED`.

### D. External Integration Tier (GitHub REST API)
- **Live Synchronization**: Queries `https://api.github.com/users/{username}` and `https://api.github.com/users/{username}/repos` with pagination up to 300 repositories.
- **Mathematical Accuracy**: Groups and ranks dominant codebase languages, sums total stargazers, and counts repository forks.
- **Rate Limit Resilience**: Catches HTTP 429 / 403 responses and serves cached snapshots from MySQL without crashing the user interface.

---

## 3. Relational Database Schema (3NF)

```mermaid
erDiagram
    USERS ||--|| GITHUB_STATS : "has 1:1"
    USERS ||--o{ PROJECTS : "owns 1:N"
    PROJECTS ||--o{ PROJECT_TASKS : "contains 1:N"

    USERS {
        bigint id PK
        varchar name
        varchar email UK
        varchar password
        varchar role
        timestamp created_at
        timestamp updated_at
    }

    GITHUB_STATS {
        bigint id PK
        bigint user_id FK,UK
        varchar github_username
        varchar name
        text bio
        varchar company
        varchar location
        varchar avatar_url
        varchar profile_url
        timestamp account_created_at
        int repositories
        int followers
        int following
        int stars
        int total_forks
        int public_gists
        varchar top_language
        text languages_json
        timestamp last_updated
    }

    PROJECTS {
        bigint id PK
        bigint user_id FK
        varchar name
        text description
        varchar status
        date start_date
        date end_date
        timestamp created_at
        timestamp updated_at
    }

    PROJECT_TASKS {
        bigint id PK
        bigint project_id FK
        varchar name
        text description
        varchar status
        date due_date
        timestamp created_at
        timestamp updated_at
    }
```
