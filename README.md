# Yurii Suprun - Portfolio

Personal portfolio website with React frontend and Spring Boot backend used by the Projects page to fetch my GitHub repositories.

- Live site: https://yuriisuprun.vercel.app
- Backend: https://yuriisuprun.onrender.com/api/repos

[![React](https://img.shields.io/badge/React-19-blue?logo=react)]()
[![React%20Router](https://img.shields.io/badge/React%20Router-7-red?logo=reactrouter)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)]()
[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)]()
[![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-4-green?logo=springboot)]()

## Repository layout

```
.
├── frontend/   # React + TailwindCSS
└── backend/    # Spring Boot REST API (Maven, Java 17)
```

## Features

- SPA navigation: `/home`, `/about`, `/projects`, `/contacts`
- Light/dark mode toggle (Tailwind `dark` class)
- Language toggle: English/Italian
- Projects grid populated from the backend API

## Tech stack

Frontend:
- React 19 (`react`, `react-dom`)
- React Router 7 (`react-router-dom`)
- TailwindCSS 3
- Axios

Backend:
- Java 17
- Spring Boot 4 (Spring MVC)
- Caffeine cache (30 minute TTL for GitHub repos)

## Run locally

Prerequisites:
- Node.js (recommended version: 18+)
- Java version: 17

### 1) Start the backend

```bash
cd backend
./mvnw spring-boot:run
```

Windows PowerShell:

```powershell
cd backend
.\mvnw.cmd spring-boot:run
```

Backend starts on `http://localhost:8080`.

### 2) Start the frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts on `http://localhost:3000`.

Note: the frontend currently calls the production API URL directly in `frontend/src/components/Projects.js`. To use the local backend, replace it with `http://localhost:8080/api/repos`.

## API

Backend endpoint (Spring MVC):

```http
GET /api/repos
```

What it does:
- Fetches repositories from `https://api.github.com/users/yuriisuprun/repos`
- Caches the response in-memory for 30 minutes (Caffeine)
- Allows cross-origin requests to `/api/**` (currently `allowedOrigins("*")`)

Notes:
- The backend uses the public GitHub API without authentication, so requests can be subject to GitHub rate limits.

## Docker (backend)

Build and run the backend container:

```bash
docker build -t portfolio-backend ./backend
docker run --rm -p 8080:8080 portfolio-backend
```

## License

MIT license.

## Contact

- Email: iursuprun@gmail.com
- GitHub: https://github.com/yuriisuprun
- LinkedIn: https://www.linkedin.com/in/yurii-suprun/
