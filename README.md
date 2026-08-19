# 🎵 WAVELANE — Music Streaming Platform

WAVELANE is a containerized music streaming platform built with **React, Node.js, Express, SQLite, Docker, Jenkins, GitHub, Docker Hub, and AWS EC2**.

The project provides a complete music streaming workflow where users can browse and stream songs, while administrators can securely log in, upload songs, manage the music library, and delete songs.

The project is also designed as a **DevOps practice project**, demonstrating containerization, CI/CD automation, Docker image management, and deployment on an AWS EC2 instance.

---

## 🚀 Project Overview

WAVELANE follows a three-tier application architecture:

```text
                    ┌─────────────────────┐
                    │       User          │
                    │     Web Browser     │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   React Frontend    │
                    │      Port 3000      │
                    └──────────┬──────────┘
                               │
                               ▼
                    ┌─────────────────────┐
                    │   Node.js Backend   │
                    │      Port 3001      │
                    └──────────┬──────────┘
                               │
                    ┌──────────┴──────────┐
                    ▼                     ▼
             ┌──────────────┐      ┌──────────────┐
             │    SQLite    │      │    Uploads   │
             │   Database   │      │ Audio Files  │
             └──────────────┘      └──────────────┘


                    ┌─────────────────────┐
                    │    Admin Panel      │
                    │      Port 3002      │
                    └──────────┬──────────┘
                               │
                               ▼
                         Backend API
```

---

# ✨ Features

## 🎧 User Features

* Browse available songs
* Search songs by:

  * Title
  * Artist
  * Album
* Play songs directly from the browser
* Pause and resume playback
* Audio progress tracking
* Audio seeking using HTTP range requests
* View song information
* Responsive music player interface

## 🔐 Admin Features

* Admin registration
* Secure admin login
* JWT-based authentication
* Protected admin routes
* Upload audio files
* Add:

  * Song title
  * Artist
  * Album
* View uploaded songs
* Delete songs
* 100 MB maximum audio upload size
* Audio file type validation

---

# 🛠️ Technology Stack

### Frontend

* React.js
* Vite
* Axios
* HTML5 Audio API

### Backend

* Node.js
* Express.js
* CORS
* JWT
* bcryptjs
* Multer
* SQLite
* better-sqlite3

### DevOps

* Git
* GitHub
* Jenkins
* Docker
* Docker Compose
* Docker Hub
* AWS EC2
* Linux/Ubuntu

---

# 📁 Project Structure

```text
WAVELANE/
│
├── admin/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   └── Login.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   └── MusicPlayer.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── middleware/
│   │   │   └── auth.js
│   │   ├── routes/
│   │   │   ├── auth.js
│   │   │   ├── public-songs.js
│   │   │   └── admin-songs.js
│   │   ├── db.js
│   │   └── index.js
│   ├── uploads/
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── scripts/
│   ├── deploy.sh
│   ├── env-dev.sh
│   ├── env-staging.sh
│   └── env-production.sh
│
├── docker-compose.yml
├── Dockerfile
├── Jenkinsfile
├── .gitignore
├── QUICK-START.md
└── JENKINS-SETUP.md
```

---

# 🔌 Application Ports

| Service                 |   Port | Purpose                        |
| ----------------------- | -----: | ------------------------------ |
| Frontend                | `3000` | User music streaming interface |
| Backend                 | `3001` | REST API                       |
| Admin                   | `3002` | Admin dashboard                |
| WAVELANE EC2 deployment | `4000` | Current Docker deployment      |

> The standard Docker Compose configuration maps frontend to `3000`, backend to `3001`, and admin to `3002`. The current EC2 WAVELANE deployment is exposed on port `4000`.

---

# 🔗 API Endpoints

## Health Check

```http
GET /health
```

Example:

```bash
curl http://localhost:3001/health
```

Response:

```json
{
  "status": "ok",
  "version": "2.0.0",
  "env": "development"
}
```

---

## Authentication

### Register Admin

```http
POST /api/auth/register
```

Request:

```json
{
  "email": "admin@example.com",
  "password": "your-password"
}
```

### Admin Login

```http
POST /api/auth/login
```

Returns a JWT token after successful authentication.

### Verify Login

```http
GET /api/auth/me
```

Requires:

```text
Authorization: Bearer <JWT_TOKEN>
```

---

# 🎵 Song API

### Get Songs

```http
GET /api/songs
```

### Search Songs

```http
GET /api/songs?q=artist
```

### Stream Song

```http
GET /api/songs/stream/:id
```

The backend supports HTTP byte-range requests so the browser can seek through audio files.

---

# 🔐 Admin Song API

All admin song endpoints require JWT authentication.

### Get All Songs

```http
GET /api/admin/songs
```

### Upload Song

```http
POST /api/admin/songs/upload
```

Form data:

```text
title
artist
album
file
```

Only audio files are accepted.

Maximum file size:

```text
100 MB
```

### Delete Song

```http
DELETE /api/admin/songs/:id
```

---

# 🐳 Docker Architecture

WAVELANE is divided into Docker containers.

```text
                    WAVELANE
                       │
             ┌─────────┴─────────┐
             │   Docker Compose  │
             └─────────┬─────────┘
                       │
       ┌───────────────┼────────────────┐
       │               │                │
       ▼               ▼                ▼
 ┌──────────┐    ┌──────────┐    ┌──────────┐
 │ Frontend │    │ Backend  │    │  Admin   │
 │ React    │    │ Node.js  │    │ React    │
 │ Nginx    │    │ Express  │    │ Nginx    │
 └────┬─────┘    └────┬─────┘    └────┬─────┘
      │               │                │
   Port 3000       Port 3001        Port 3002
                      │
               ┌──────┴──────┐
               │             │
             SQLite       Uploads
```

---

# ▶️ Run WAVELANE Locally

## 1. Clone Repository

```bash
git clone <YOUR-GITHUB-REPOSITORY-URL>
cd WAVELANE
```

## 2. Start with Docker Compose

```bash
docker-compose up -d --build
```

## 3. Check Containers

```bash
docker-compose ps
```

Expected services:

```text
music-backend
music-frontend
music-admin
```

## 4. Access the Application

### User Website

```text
http://localhost:3000
```

### Admin Panel

```text
http://localhost:3002
```

### Backend

```text
http://localhost:3001
```

### Backend Health Check

```text
http://localhost:3001/health
```

---

# ☁️ AWS EC2 Deployment

WAVELANE is deployed on an **Ubuntu AWS EC2 instance** using Docker.

Current deployment exposes the application through:

```text
EC2_PUBLIC_IP:4000
```

Example:

```text
http://YOUR-EC2-PUBLIC-IP:4000
```

## EC2 Deployment Flow

```text
GitHub
   │
   ▼
Jenkins
   │
   ▼
Docker Build
   │
   ▼
Docker Image
   │
   ▼
Docker Compose
   │
   ▼
AWS EC2
   │
   ▼
WAVELANE
```

---

# 🔄 CI/CD Pipeline

Jenkins automates the WAVELANE deployment process.

The Jenkins pipeline performs:

```text
1. Checkout source code
        ↓
2. Build Backend Docker Image
        ↓
3. Build Frontend Docker Image
        ↓
4. Build Admin Docker Image
        ↓
5. Test Docker Images
        ↓
6. Push Images to Docker Hub
        ↓
7. Deploy Environment
        ↓
8. Health Check
```

The pipeline supports:

* Development
* Staging
* Production

---

# 🧰 Jenkins Pipeline

The project includes a `Jenkinsfile` that automates Docker image creation and deployment.

### Build Images

```bash
docker build
```

Separate images are created for:

```text
music-backend
music-frontend
music-admin
```

### Docker Hub

Images can be pushed to Docker Hub with:

```text
music-backend
music-frontend
music-admin
```

Images use both:

```text
latest
```

and build-specific tags.

Example:

```text
BUILD_NUMBER-GIT_COMMIT
```

---

# 🌎 Deployment Environments

The Jenkins pipeline supports:

```text
dev
staging
production
```

### Development

Automatically deploys after the development pipeline stage.

### Staging

Requires manual approval before deployment.

### Production

Requires explicit production approval before deployment.

This provides a basic controlled CI/CD workflow.

---

# 🔐 Security

The project uses:

* JWT authentication
* bcrypt password hashing
* Protected admin routes
* CORS
* Environment variables
* Docker container isolation
* Audio file validation
* Upload size restrictions

### Important

Before production deployment, change:

```env
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

to a strong randomly generated secret.

Do not commit real secrets, passwords, API keys, or production credentials to GitHub.

---

# 💾 Database

WAVELANE uses **SQLite** with `better-sqlite3`.

The database stores information such as:

```text
Admins
Songs
Song metadata
Uploaded file references
```

Audio files are stored separately inside:

```text
backend/uploads/
```

The Docker Compose configuration mounts this directory so uploaded audio can persist outside the container.

---

# 🩺 Health Monitoring

The backend provides:

```http
GET /health
```

This endpoint is also used by Docker health checks.

Example:

```bash
curl http://localhost:3001/health
```

Successful response:

```json
{
  "status": "ok",
  "version": "2.0.0",
  "env": "development"
}
```

---

# 🛠️ Useful Docker Commands

### View running containers

```bash
docker ps
```

### View all containers

```bash
docker ps -a
```

### View WAVELANE logs

```bash
docker logs wavelane
```

### Follow logs

```bash
docker logs -f wavelane
```

### Restart WAVELANE

```bash
docker-compose restart
```

### Stop application

```bash
docker-compose down
```

### Rebuild application

```bash
docker-compose up -d --build
```

### Check Compose services

```bash
docker-compose ps
```

---

# 🐳 Docker Troubleshooting

### Docker permission denied

If you receive:

```text
permission denied while trying to connect to the Docker API
```

run:

```bash
sudo usermod -aG docker ubuntu
```

Then refresh the session:

```bash
newgrp docker
```

Test:

```bash
docker ps
```

---

### Container name conflict

If you receive:

```text
Conflict. The container name "/wavelane" is already in use
```

remove the old container:

```bash
docker rm -f wavelane
```

Then recreate:

```bash
docker-compose up -d
```

---

# ☁️ AWS Security Group

When deploying on EC2, make sure the required ports are allowed in the EC2 Security Group.

For the current deployment:

```text
TCP 4000
```

For the standard Docker Compose setup:

```text
TCP 3000
TCP 3001
TCP 3002
```

For production, avoid exposing internal backend ports publicly unless required. Prefer routing traffic through a reverse proxy such as Nginx.

---

# 📊 DevOps Skills Demonstrated

This project demonstrates practical experience with:

* AWS EC2
* Linux/Ubuntu
* Git
* GitHub
* Jenkins
* CI/CD
* Docker
* Docker Compose
* Docker Hub
* Containerized applications
* Environment management
* Health checks
* Automated deployment
* Application troubleshooting
* Port and security-group configuration
* Git-based source control

---

# 🔁 Complete DevOps Workflow

```text
                 Developer
                     │
                     ▼
                  GitHub
                     │
                     ▼
                  Jenkins
                     │
              ┌──────┴──────┐
              │   CI Build  │
              └──────┬──────┘
                     │
                     ▼
             Build Docker Images
                     │
        ┌────────────┼────────────┐
        ▼            ▼            ▼
     Backend      Frontend      Admin
        │            │            │
        └────────────┼────────────┘
                     ▼
                Docker Hub
                     │
                     ▼
                 AWS EC2
                     │
                     ▼
              Docker Compose
                     │
                     ▼
                 WAVELANE
                     │
                     ▼
                   Users
```

---

# 📈 Future Improvements

Potential improvements for the project include:

* Nginx reverse proxy
* HTTPS with SSL/TLS
* Custom domain
* AWS Route 53
* AWS S3 for audio storage
* AWS RDS for production database
* Redis caching
* Kubernetes deployment
* Amazon EKS
* Prometheus monitoring
* Grafana dashboards
* Centralized logging
* Automated backups
* Blue/Green deployment
* Rolling deployment
* Docker image vulnerability scanning
* SonarQube code analysis
* Terraform infrastructure automation

---

# 👨‍💻 Project Purpose

WAVELANE was developed as a practical **Cloud and DevOps project** to understand how a full-stack application can be:

1. Developed
2. Version controlled with Git/GitHub
3. Containerized using Docker
4. Built automatically with Jenkins
5. Stored in Docker Hub
6. Deployed on AWS EC2
7. Tested using health checks
8. Managed through Docker Compose

The primary goal is to demonstrate practical implementation of **CI/CD, containerization, cloud deployment, and DevOps automation**.

---

# 👨‍💻 Author

**Burhanuddin Kuwala**

BBA – Digital Marketing
AWS & DevOps Practitioner

### Technologies

```text
AWS | Docker | Jenkins | GitHub | Docker Hub
Linux | Node.js | React | Express | SQLite
```

---

# 📄 License

This project is intended for educational and demonstration purposes.

You may modify and extend the project for learning and development.
