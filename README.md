# Fitness Tracker Monorepo

A full-stack fitness app with:
- Frontend: React (Vite)
- Backend: Node.js/Express (auth, users, workouts)
- FastAPI Backend: Python (AI meal planning, AI coach)

## Project Structure

```
/
├── backend/           # Node.js/Express API (JWT auth, users, workouts)
├── frontend/          # React (Vite) client
├── fastapi_backend/   # FastAPI (Python) AI services (meal planning, coach)
├── docker-compose.yml # Optional orchestration
```

## Prerequisites

- Node.js 16+
- Python 3.8+
- MongoDB
- Redis (optional; FastAPI cache fallback is in-memory)

## Quick Start

1) Clone
```
git clone <your-repo-url>
cd fitme
```

2) Install dependencies
```
# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install

# FastAPI
cd ../fastapi_backend && pip install -r requirements.txt
```

3) Configure environment
Copy each example and edit values as needed.
```
# Backend
cp backend/env.example backend/.env

# Frontend
cp frontend/env.example frontend/.env

# FastAPI
cp fastapi_backend/env.example fastapi_backend/.env
```

Key variables (non-exhaustive):
- backend/.env
  - MONGODB_URI, JWT_SECRET, JWT_EXPIRE, CLIENT_URL, GEMINI_API_KEY, SMTP_HOST/PORT/USER/PASS
- frontend/.env
  - VITE_API_URL, VITE_FASTAPI_URL, VITE_GEMINI_API_KEY
- fastapi_backend/.env
  - MONGODB_URI, GEMINI_API_KEY, REDIS_URL, JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRE_MINUTES

4) Run services (development)
```
# 1) Node/Express API
cd backend
npm run dev   # http://localhost:5000

# 2) FastAPI
cd ../fastapi_backend
uvicorn main:app --host 0.0.0.0 --port 8000 --reload   # http://localhost:8000

# 3) Frontend (Vite)
cd ../frontend
npm run dev   # http://localhost:5173
```

Alternatively with Docker:
```
docker-compose up --build
```

## Services Overview

### Backend (Node.js/Express)
- JWT authentication, registration, login, token refresh
- Email verification and OTP (via SMTP; falls back to console logging if SMTP not set)
- User profile management, profile photo (base64), stats
- Workouts: generate fallback plan (primary generation handled on frontend via Gemini), save/load/delete, complete workout, statistics, weekly summary
- CORS defaults to http://localhost:5173 (configure CLIENT_URL)

Main endpoints (prefix /api):
- /auth: register, login, refresh, logout, me, change-password, verify, send-otp, verify-otp, resend-otp, forgot-password
- /user: profile, profile-photo, stats, email, preferences, account
- /workouts: generate, save, custom, saved, statistics, weekly-summary, :planId, :planId/activate

### FastAPI Backend
- AI meal planning and AI coach endpoints
- Uses MongoDB and optional Redis
- Configured with lifespan startup (no deprecated events)

Selected endpoints (prefix /api):
- /mealplan: generate, list, get, delete, regenerate, nutrition/analyze
- /aicoach: chat, suggestions, health

### Frontend
- React (Vite) app under frontend/
- Auth state persisted to localStorage
- Workout plan generation via Gemini on the client; if Gemini is unavailable/overloaded, the UI falls back to a demo plan

## Gemini Configuration
- Frontend uses VITE_GEMINI_API_KEY; set it in frontend/.env
- Client logic retries transient 503/rate-limit errors and falls back across models (gemini-2.0-flash, gemini-1.5-flash-8b, gemini-1.5-flash)
- If all attempts fail, a demo plan is shown

## Development

Backend
```
cd backend
npm run dev
```

Frontend
```
cd frontend
npm run dev
```

FastAPI
```
cd fastapi_backend
uvicorn main:app --reload
```

Testing (FastAPI)
```
cd fastapi_backend
pytest
```

## Troubleshooting

- Gemini returns demo plan: ensure VITE_GEMINI_API_KEY is set; temporary 503/overloaded will auto-retry and model-fallback
- CORS errors: set backend CLIENT_URL to the frontend URL (default http://localhost:5173)
- Emails: if SMTP is not configured, emails are logged to console for development
- JWT logs: sensitive token/secret logs are disabled by default

## License

See service-level READMEs for license details.