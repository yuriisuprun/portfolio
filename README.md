# Yurii Suprun - Personal website

My personal website with Spring Boot backend and React frontend.

The backend powers:
- the **Projects** page (fetches my GitHub repositories)
- the **Contact** form (production-oriented email delivery + basic bot/rate-limit protections)

- Live website: https://yuriisuprun.vercel.app
- Backend: https://yuriisuprun.onrender.com

[![React](https://img.shields.io/badge/React-19-blue?logo=react)]()
[![React%20Router](https://img.shields.io/badge/React%20Router-7-red?logo=reactrouter)]()
[![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-blue?logo=tailwindcss)]()
[![Java](https://img.shields.io/badge/Java-17-orange?logo=openjdk)]()
[![Spring%20Boot](https://img.shields.io/badge/Spring%20Boot-3.3-green?logo=springboot)]()

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
- Projects grid populated from the backend API (GitHub integration + caching)
- Contact form backed by an API endpoint that delivers email via SMTP or Resend (with fallback to logging)

## Tech stack

Frontend:
- React 19 (`react`, `react-dom`)
- React Router 7 (`react-router-dom`)
- TailwindCSS 3
- Axios
- CRA (`react-scripts`)

Backend:
- Java 17
- Spring Boot 3.3 (Spring MVC + Validation + Mail + Cache)
- Caffeine cache
- Configurable CORS
- Contact rate limiting (simple in-memory, IP-based)

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

Backend starts on `http://localhost:8082` (or `${PORT}` if set).

### 2) Start the frontend

```bash
cd frontend
npm install
npm start
```

Frontend starts on `http://localhost:3000`.

Notes:
- In development, the frontend calls `/api/*` and proxies to `http://localhost:8082` via `frontend/package.json` (`proxy`).
- In production (Vercel), `/api/*` is rewritten to the Render backend via `frontend/vercel.json`.

## API

Backend endpoints (Spring MVC):

```http
GET /api/repos
POST /api/contact
GET /internal/ping
```

### `GET /api/repos`

- Fetches repositories from the public GitHub API for user `yuriisuprun`
- Response is cached in-memory (Caffeine)
- Uses the public GitHub API without authentication (requests can be subject to GitHub rate limits)

### `POST /api/contact`

Accepts JSON:

```json
{
  "name": "Your name",
  "email": "you@example.com",
  "message": "Hello!",
  "website": ""
}
```

Notes:
- `website` is a **honeypot** field (bots that fill it are ignored).
- Request body is validated; responses are intentionally generic.
- Endpoint is protected by a simple, IP-based rate limit (configurable).

### `GET /internal/ping`

Returns `204 No Content`. Used as a lightweight health check.

## Backend configuration (env vars)

The backend is configured via environment variables (see `backend/src/main/resources/application.properties`).

Common:
- `PORT`: server port (default `8082`)
- `CORS_ALLOWED_ORIGIN_PATTERNS`: comma-separated allowed origin patterns  
  Default includes `http://localhost:3000`, the production Vercel domain, and `https://*.vercel.app`

Contact email:
- `MAIL_ENABLED`: enable/disable sending (default `true`)
- `MAIL_PROVIDER`: `auto` | `smtp` | `resend` | `log` (default `auto`)
- `MAIL_TO`: recipients (defaults to `MAIL_USER`/`MAIL_FROM` when present)
- `MAIL_FROM`: From header (defaults to `MAIL_USER`)

SMTP (when using `smtp` or when `auto` selects SMTP):
- `MAIL_HOST` (default `smtp.gmail.com`)
- `MAIL_PORT` (default `587`)
- `MAIL_USER`
- `MAIL_PASSWORD`
- `MAIL_CONNECTION_TIMEOUT_MS`, `MAIL_TIMEOUT_MS`, `MAIL_WRITE_TIMEOUT_MS`
- `MAIL_COOLDOWN_SECONDS`: cooldown after connectivity failures (default `900`)

Resend (when using `resend` or when `auto` selects Resend):
- `RESEND_API_KEY`
- `RESEND_BASE_URL` (default `https://api.resend.com`)

Contact rate limit:
- `CONTACT_RATE_LIMIT_ENABLED` (default `true`)
- `CONTACT_RATE_LIMIT` (default `5`)
- `CONTACT_RATE_LIMIT_WINDOW_SECONDS` (default `60`)
- `CONTACT_RATE_LIMIT_MAX_KEYS` (default `10000`)

## Docker (backend)

Build and run the backend container:

```bash
docker build -t portfolio-backend ./backend
docker run --rm -p 8082:8082 portfolio-backend
```

## License

MIT license.

## Contact

- Email: iursuprun@gmail.com
- GitHub: https://github.com/yuriisuprun
- LinkedIn: https://www.linkedin.com/in/yurii-suprun/
