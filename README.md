# DevTrack – Developer Analytics & Project Management Platform 🚀📊

## Overview 📝

DevTrack is a full-stack web application that combines project management and GitHub analytics into a single platform. It enables developers to manage projects, track tasks, monitor progress, and synchronize real-time GitHub profile statistics through an interactive dashboard.

The application is designed to provide a centralized workspace where users can organize development activities, visualize productivity metrics, and manage project workflows efficiently.

---

## Features 🚀

### 🔐 Secure Authentication

- JWT-based Authentication
- Spring Security Integration
- Protected Routes & APIs
- BCrypt Password Encryption

### 📁 Project Management

- Create, Update, Delete, and Manage Projects
- Project Progress Tracking
- Automatic Status Updates
- Dashboard Analytics

### ✅ Task Management

- Add and Manage Tasks
- Task Status Tracking
- Dynamic Completion Percentage Calculation
- Real-Time Dashboard Updates

### 📊 GitHub Analytics

- Sync Any Public GitHub Profile
- Repository Statistics
- Followers & Following Count
- Language Distribution Analysis
- Stars & Forks Aggregation
- Real-Time GitHub API Integration

### 📈 Analytics Dashboard

- Project Completion Analytics
- Project Status Distribution
- Recent Activity Tracking
- KPI Summary Cards
- Interactive Charts

### 🐳 Deployment Support

- Docker & Docker Compose
- Environment Variable Configuration
- Swagger API Documentation

---

## Technologies Used ⚙️

### Backend

- Java 21 ☕
- Spring Boot 3.2 🚀
- Spring Security 🔐
- Hibernate / JPA 🗄️
- MySQL 🐬
- JWT Authentication 🔑

### Frontend

- React.js ⚛️
- Tailwind CSS 🎨
- Axios 🌐
- Recharts 📊

### Tools & Services

- Docker 🐳
- Swagger / OpenAPI 📖
- GitHub REST API 🔗
- Maven ⚙️

---

## Project Architecture 🏗️

```text
User Browser
      │
      ▼
 React Frontend
      │
      ▼
 Spring Boot REST API
      │
 ┌────┴────┐
 ▼         ▼
MySQL   GitHub API
```

---

## Setup Instructions 🔧

### Prerequisites 📦

- Java 21
- Node.js 18+
- MySQL 8
- Maven
- Docker (Optional)

---

### Backend Setup ⚙️

```bash
cd backend
mvn clean install
mvn spring-boot:run
```

### Frontend Setup ⚙️

```bash
cd frontend
npm install
npm run dev
```

### Docker Setup 🐳

```bash
docker compose up --build
```

---

## API Documentation 📖

Swagger UI:

```text
http://localhost:8080/swagger-ui.html
```

---

## Key Highlights ⭐

- Real GitHub API Integration
- Secure JWT Authentication
- Full CRUD Operations
- Dynamic Progress Tracking
- Production-Ready Docker Setup
- Clean First-Time User Experience
- Responsive UI Design

---

## Future Enhancements 🚀

- CI/CD Pipeline
- Email Notifications
- Team Collaboration Features
- Redis Caching
- AWS Deployment
- Role-Based Administration

---

## Author 👨‍💻

**Mayur Kapase**

- Java Full Stack Developer
- MERN Stack Developer
- B.Tech Information Technology

GitHub: [https://github.com/MayurKapase](https://github.com/MayurKapase)
LinkedIn: [https://www.linkedin.com/in/mayur-kapase/](https://www.linkedin.com/in/mayur-kapase/)

⭐ If you found this project useful, consider giving it a star.
