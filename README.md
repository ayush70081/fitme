# Fitness Tracker Monorepo

A full-stack fitness tracker application with:
- **Frontend**: Modern React (Vite) user interface
- **Backend**: Node.js/Express API
- **FastAPI Backend**: Python FastAPI service for AI-powered meal planning and nutrition

---

## Project Structure

```
/
├── backend/           # Node.js/Express API
├── frontend/          # React (Vite) frontend
├── fastapi_backend/   # FastAPI (Python) AI & meal planning
├── docker-compose.yml # (Optional) Multi-service orchestration
```

---

## Prerequisites

- **Node.js** (v16+ recommended)
- **Python** (3.8+)
- **MongoDB** (for backend and fastapi_backend)
- **Redis** (optional, for caching)
- **pip** (Python package manager)

---

## Quick Start

### 1. Clone the repository

```sh
git clone <your-repo-url>
cd Fitness-Tracker-GRP
```

### 2. Install dependencies

#### Backend (Node.js/Express)
```sh
cd backend
npm install
```

#### Frontend (React/Vite)
```sh
cd ../frontend
npm install
```

#### FastAPI Backend (Python)
```sh
cd ../fastapi_backend
pip install -r requirements.txt
```

### 3. Environment Variables

- Copy `.env.example` to `.env` in each service and fill in the required values.

### 4. Running the Services

#### Backend (Node.js/Express)
```sh
cd backend
npm start
```

#### Frontend (React/Vite)
```sh
cd frontend
npm run dev
```

#### FastAPI Backend
```sh
cd fastapi_backend
python main.py
```

---

## Docker (Optional)

You can use `docker-compose.yml` to run all services together:

```sh
docker-compose up --build
```

---

## Contributing

1. Fork the repo and create a feature branch
2. Make your changes and add tests
3. Submit a pull request

---

