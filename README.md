# DevTrack — Engineering Analytics & Project Management Platform

[![Java](https://img.shields.io/badge/Java-21%20LTS-orange.svg?style=flat-square)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.2.5-brightgreen.svg?style=flat-square)](https://spring.io/projects/spring-boot)
[![Spring Security](https://img.shields.io/badge/Spring%20Security-6.2-green.svg?style=flat-square)](https://spring.io/projects/spring-security)
[![React](https://img.shields.io/badge/React-18.3-blue.svg?style=flat-square)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-purple.svg?style=flat-square)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8.svg?style=flat-square)](https://tailwindcss.com/)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-blue.svg?style=flat-square)](https://www.mysql.com/)
[![Docker](https://img.shields.io/badge/Docker-Compose%20Ready-2496ED.svg?style=flat-square)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat-square)](LICENSE)

DevTrack is a production-grade, full-stack developer analytics and engineering workflow platform. It unifies real-time GitHub telemetry with a hierarchical Project and Task milestone engine, backed by a persistent MySQL 8 relational schema and secured with stateless JWT authentication.

---

## 📌 Problem Statement

Software engineers and tech leads often juggle multiple disconnected tools: GitHub for repository metrics, issue trackers for roadmaps, and personal notes for milestone completion. Most developer dashboards either display hardcoded mock data or fail to accurately synchronize live GitHub telemetry (such as official profile metadata, multi-page repository pagination, stargazers, and language distributions). 

Developers need a centralized, privacy-respecting platform that provides:
1. **Real-time GitHub Telemetry**: Exact parity with official public profiles without manual data entry.
2. **Project & Task Milestone Engine**: Granular task breakdown with mathematical progress tracking.
3. **True Relational Persistence**: Zero mock data, strict user data isolation, and persistent MySQL storage.

---

## 💡 Solution

DevTrack solves this by delivering an end-to-end, reactive full-stack web application:
- **Direct GitHub API Integration**: Synchronizes official public repositories, followers, following, total stargazers, repository forks, bio, company, location, and dominant codebase languages.
- **Dynamic Completion Engine**: Hierarchical Project $\rightarrow$ Task model where project completion percentage automatically updates as tasks are completed or modified.
- **Zero Mock Data Architecture**: Starts in a pristine zero-data state for new users and persists every action across server restarts.
- **Enterprise Security**: Stateless JWT authentication, BCrypt password hashing, and service-level IDOR protection.

---

## 🏗 System Architecture

```mermaid
graph TD
    Client["React 18 SPA (Vite + Tailwind CSS + Lucide Icons)"]
    API["Spring Boot 3 REST API (Java 21, Spring Security 6, JWT)"]
    DB[("MySQL 8.0 Database (users, github_stats, projects, project_tasks)")]
    GH["GitHub REST API (api.github.com)"]

    Client -->|Axios HTTP + JWT Bearer Auth| API
    API -->|Spring Data JPA / Hibernate (Cascade & Indexes)| DB
    API -->|Real-time REST Queries| GH
```

---

## ⚡ Tech Stack

| Layer | Technologies |
|:---|:---|
| **Frontend** | React 18.3, Vite 5, Tailwind CSS 3.4, React Router v6, Axios, Recharts, Lucide Icons |
| **Backend** | Java 21 LTS, Spring Boot 3.2.5, Spring Security 6, Spring Data JPA, Hibernate 6, JJWT 0.12.5 |
| **Database** | MySQL 8.0 (3NF Normalized, InnoDB, UTF8mb4), HikariCP Connection Pool |
| **API & Docs** | RESTful Architecture, OpenAPI 3.0, Swagger UI (`/swagger-ui/index.html`) |
| **DevOps & Containers** | Docker, Docker Compose, Multi-Stage Builds, Nginx Alpine Reverse Proxy |

---

## 📸 Screenshots & Visual Tour

High-resolution captures of the interface are cataloged below:

| Screenshot | Screen / View | Description |
|:---|:---|:---|
| `docs/screenshots/01-login.png` | **Login Portal** | Secure JWT authentication with dark engineering console aesthetic. |
| `docs/screenshots/02-register.png` | **Registration** | BCrypt-backed user sign-up with duplicate email validation. |
| `docs/screenshots/03-empty-dashboard.png` | **Zero-Data State** | Clean initial dashboard for new accounts without artificial mock data. |
| `docs/screenshots/04-workspace-setup-guide.png` | **Onboarding Guide** | Step-by-step setup cards directing users to sync GitHub and track projects. |
| `docs/screenshots/05-github-analytics.png` | **GitHub Analytics** | Live sync with official bio, stars, forks, and Recharts language distribution. |
| `docs/screenshots/06-project-management.png` | **Project Tracker** | Full CRUD roadmap management with status badges and deadlines. |
| `docs/screenshots/07-task-management.png` | **Task Management** | Granular milestones with live mathematical completion calculations. |
| `docs/screenshots/08-dashboard-analytics.png` | **Live Analytics** | Aggregated KPI cards, status distribution donut chart, and project summary. |
| `docs/screenshots/09-swagger-ui.png` | **OpenAPI Swagger** | Interactive API specification supporting JWT Bearer authentication. |

---

## 🚀 Getting Started

### Prerequisites
- **Java**: JDK 21+
- **Node.js**: v18+ and npm v9+
- **Database**: MySQL 8.0+ running on port 3306
- **Docker**: Optional, for containerized execution

---

### Option 1: Docker Compose (Recommended)

Run the entire platform (MySQL 8, Spring Boot Backend, and Nginx-powered React Frontend) with a single command:

```bash
# Clone the repository
git clone https://github.com/your-username/devtrack.git
cd devtrack

# Build and launch containers
docker compose up --build
```

- **Frontend Application**: [http://localhost](http://localhost) (or [http://localhost:3000](http://localhost:3000))
- **Backend API**: [http://localhost:8080/api](http://localhost:8080/api)
- **Interactive Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

---

### Option 2: Local Development Setup

#### 1. Configure MySQL Database
```sql
CREATE DATABASE IF NOT EXISTS devtrack_ai CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

#### 2. Start Spring Boot Backend
```bash
cd backend
./mvnw clean package -DskipTests
java -jar target/devtrack-ai-1.0.0.jar
```
Backend initializes on `http://localhost:8080`.

#### 3. Start React Frontend
```bash
cd frontend
npm install
npm run dev
```
Frontend development server launches on `http://localhost:5173`.

---

## 📡 REST API Specification

Interactive Swagger OpenAPI UI: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)

| Method | Endpoint | Description | Auth Required |
|:---|:---|:---|:---:|
| `POST` | `/api/auth/register` | Register new developer account | No |
| `POST` | `/api/auth/login` | Authenticate and receive signed JWT | No |
| `GET` | `/api/auth/me` | Fetch authenticated user profile | **Yes (Bearer)** |
| `PUT` | `/api/auth/profile` | Update display name and GitHub handle | **Yes (Bearer)** |
| `POST` | `/api/github/sync` | Synchronize live data from official GitHub API | **Yes (Bearer)** |
| `POST` | `/api/github/refresh` | Force-refresh bypassing local cache | **Yes (Bearer)** |
| `GET` | `/api/github/me` | Get saved GitHub telemetry | **Yes (Bearer)** |
| `GET` | `/api/projects` | List all projects owned by user | **Yes (Bearer)** |
| `POST` | `/api/projects` | Create a new engineering project | **Yes (Bearer)** |
| `GET` | `/api/projects/{id}` | Get project details and child tasks | **Yes (Bearer)** |
| `PUT` | `/api/projects/{id}` | Update project metadata or status | **Yes (Bearer)** |
| `DELETE` | `/api/projects/{id}` | Delete project (Cascade deletes tasks) | **Yes (Bearer)** |
| `POST` | `/api/projects/{id}/tasks` | Create task under project | **Yes (Bearer)** |
| `PUT` | `/api/projects/{id}/tasks/{taskId}` | Update task status or due date | **Yes (Bearer)** |
| `DELETE` | `/api/projects/{id}/tasks/{taskId}` | Delete specific task | **Yes (Bearer)** |
| `GET` | `/api/projects/summary` | Aggregate productivity metrics | **Yes (Bearer)** |

---

## 📂 Repository Structure

```
devtrack-ai/
├── backend/
│   ├── src/main/java/com/devtrack/
│   │   ├── config/          # Security, OpenAPI, and MVC configurations
│   │   ├── controller/      # REST API Controllers (Auth, GitHub, Projects)
│   │   ├── dto/             # Request & Response Data Transfer Objects
│   │   ├── entity/          # JPA Entities (User, GithubStats, Project, Task)
│   │   ├── exception/       # GlobalExceptionHandler & API error responses
│   │   ├── repository/      # Spring Data JPA Repositories
│   │   ├── security/        # JWT Authentication Filter, Token Provider
│   │   └── service/         # Business Logic & GitHub API Integration
│   ├── src/main/resources/  # application.yml and static React bundles
│   ├── Dockerfile           # Multi-stage Eclipse Temurin JDK/JRE Dockerfile
│   └── pom.xml              # Maven dependencies & build configuration
├── frontend/
│   ├── src/
│   │   ├── components/      # Reusable UI elements (Card, StatCard, Badge)
│   │   ├── context/         # AuthContext and state management
│   │   ├── layouts/         # Dashboard layout with Sidebar and Navbar
│   │   ├── pages/           # Dashboard, GitHubAnalytics, ProjectTracker, Profile
│   │   └── services/        # Axios API clients for backend communication
│   ├── Dockerfile           # Multi-stage Node.js & Nginx Alpine Dockerfile
│   ├── nginx.conf           # Nginx reverse proxy configuration
│   └── package.json         # React 18, Vite, Tailwind CSS dependencies
├── database/
│   ├── schema.sql           # MySQL 8.0 DDL schema definitions
│   └── data.sql             # Pristine zero-data initialization script
├── docs/
│   ├── ARCHITECTURE.md      # In-depth architectural specifications
│   └── screenshots/         # Portfolio screenshot checklist & assets
└── docker-compose.yml       # Production orchestration file
```

---

## 🔮 Future Roadmap

- [ ] Webhook integration for real-time GitHub commit streaming.
- [ ] Role-Based Team Workspaces for multi-developer collaboration.
- [ ] Exportable sprint reports in PDF / CSV format.
- [ ] OAuth2 Social Login (`Sign in with GitHub`).

---

## 👤 Author

- **Mayur Sanjay Kapase**
- **GitHub**: [@mskapase370822](https://github.com/mskapase370822)
- **LinkedIn**: [Mayur Kapase](https://www.linkedin.com/)

---

## 📄 License

This project is open-source and licensed under the [MIT License](LICENSE).
