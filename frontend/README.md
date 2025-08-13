# Frontend (React + Vite)

This is the React (Vite) client for the Fitness Tracker application.

## Prerequisites

- Node.js 16+
- npm

## Setup

1) Install dependencies
```bash
npm install
```

2) Environment variables

Copy the example and edit values as needed:
```bash
cp env.example .env
```

Common variables:
- `VITE_API_URL`          Backend (Express) base URL, e.g. http://localhost:5000/api
- `VITE_FASTAPI_URL`      FastAPI base URL, e.g. http://localhost:8000/api
- `VITE_GEMINI_API_KEY`   Gemini API key used by the client for workout generation

3) Run the dev server
```bash
npm run dev
```
Default dev server: http://localhost:5173

## Scripts

```bash
npm run dev       # start Vite dev server
npm run build     # production build
npm run preview   # preview production build locally
npm run lint      # run eslint
```

## Authentication

- Access and refresh tokens are stored in localStorage (`fitme_token`, `fitme_refresh_token`).
- `AuthContext` initializes auth state and fetches the current user when a token exists.

## API Clients

- `src/services/api.js` holds axios instances for Express and FastAPI backends.
- Authorization headers are automatically set from localStorage tokens.

## Gemini Integration (Workout Generation)

- Frontend uses the Gemini API directly with `VITE_GEMINI_API_KEY`.
- Client logic retries transient overload/rate-limit errors and falls back across models.
- If all attempts fail, a demo workout plan is shown.

## Build Output

Vite builds to `frontend/dist/`. Configure your hosting to serve that directory.
