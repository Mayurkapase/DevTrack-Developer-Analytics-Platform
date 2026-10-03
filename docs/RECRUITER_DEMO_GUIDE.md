# DevTrack - Recruiter Live Demo Walkthrough (3-Minute Script)

This guide provides a professional demonstration flow for technical recruiters, engineering managers, and architecture interviewers.

---

## ⏱ Demo Outline (3 Minutes)

```
[0:00 - 0:30] -> Zero-Data Onboarding & Clean Architecture
[0:30 - 1:15] -> Live GitHub Telemetry Synchronization
[1:15 - 2:00] -> Project & Task Management (Dynamic Progress Engine)
[2:00 - 2:30] -> Consolidated Developer Productivity Dashboard
[2:30 - 3:00] -> Security, Relational Schema & Swagger API Documentation
```

---

### Step 1: User Registration & Clean Workspace (0:00 - 0:30)
1. Navigate to `http://localhost:5173/register` (or `http://localhost:80` in Docker).
2. Register a new account (e.g., your name, email `demo@example.com`, password `Password123!`).
3. **What to highlight to the interviewer**:
   - The application starts in a **pristine zero-data state**. There are **no fake seeded records** or artificial mock metrics.
   - Highlights the **Workspace Setup Guide** with 2 clear progressive onboarding actions:
     - Step 1: Connect GitHub Profile
     - Step 2: Track Your First Project

---

### Step 2: Live GitHub API Integration (0:30 - 1:15)
1. Click **"Sync Now"** on the GitHub onboarding card or navigate to `/github`.
2. Notice the central **Search & Connect Card**.
3. Type `mskapase370822` (or click the `@mskapase370822` quick test chip) and click **"Synchronize Profile"**.
4. **What to highlight to the interviewer**:
   - Point out the **100% exact parity** with official GitHub:
     - Real Name (`Mayur Sanjay Kapase`)
     - Official Bio (`"Busy"`)
     - Company & Location badges
     - Live Public Repositories count (`3`)
     - Stargazers, Forks, and Public Gists
     - Interactive **Recharts bar chart** showing the dynamic language distribution breakdown.
   - Explain that this data is queried live from `api.github.com/users/{username}` and `/repos`, and cached in MySQL to gracefully handle GitHub's 60 req/hr unauthenticated IP rate limit.

---

### Step 3: Project Management & Dynamic Progress Engine (1:15 - 2:00)
1. Navigate to `/projects`.
2. Click **"+ New Project"**:
   - **Name**: `Cloud Microservices Migration`
   - **Description**: `Containerized enterprise backend in Spring Boot 3 & Docker`
   - **Status**: `In Progress`
   - **Target Date**: Next month
3. Click **"Save Project"**.
4. Click on the project to expand its Task Manager:
   - Add Task 1: `Design OpenAPI 3.0 Endpoints` (Status: `Completed`)
     - *Show the progress bar immediately jumping to 100%!*
   - Add Task 2: `Implement JWT Stateless Filter` (Status: `In Progress`)
     - *Show the progress bar dynamically recalculating to 50%!*
   - Add Task 3: `Setup MySQL 8 Database Containers` (Status: `Not Started`)
     - *Show the progress bar dynamically recalculating to 33.3%!*
5. Update Task 2 and Task 3 to `Completed`:
   - *Notice that once 3/3 tasks are completed (100%), the parent project badge automatically transitions to `COMPLETED`!*

---

### Step 4: Consolidated Dashboard (2:00 - 2:30)
1. Click **Dashboard** in the sidebar.
2. **What to highlight to the interviewer**:
   - Total Projects: `1`, Active: `0`, Completed: `1`, Completion Rate: `100%`.
   - The **Interactive Status Distribution Donut Chart** dynamically reflects the completed project.
   - The **GitHub Telemetry Snapshot Card** shows the live synced avatar, official name, bio, and repositories.
   - The **Workspace Setup Guide** automatically shows checkmarks indicating both onboarding steps are complete!

---

### Step 5: Architecture & Swagger API Specification (2:30 - 3:00)
1. Open `http://localhost:8080/swagger-ui/index.html`.
2. Show the structured OpenAPI 3.0 specification covering:
   - `/api/auth/*`
   - `/api/github/*`
   - `/api/projects/*`
3. Point out that all project endpoints enforce **IDOR security** (a user can never access another user's projects or tasks).
4. Mention the **Docker Compose** one-command orchestration for rapid production deployment.
