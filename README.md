# RESUMIND

Resumind is a full‑stack resume + job description analyzer.
Upload a PDF resume, paste a JD, and it returns a match score, skill gaps, and career suggestions — plus a score breakdown that combines semantic similarity with structured resume sections (projects / internships / coursework).

## Features

- Auth (register/login) with JWT stored in `localStorage`
- Resume vs JD analysis (PDF upload + JD text)
- Match score + skill gap (matching skills + missing skills)
- Score breakdown:
  - `semantic_score` (resume ↔ JD similarity)
  - `structured_score` (relevance from projects/internships/coursework/etc)
- History: saves every analysis per user (SQLite)
- Career options: explores roles across multiple domains (tech + finance + core)
- About page + simple in-app navigation (no router)

## Tech Stack

- Backend: FastAPI, SQLAlchemy, SQLite
- Auth: JWT (`python-jose`), password hashing (`passlib`)
- NLP: `sentence-transformers` (embeddings) + `spaCy` (skill extraction)
- Frontend: React + Vite + Tailwind CSS + Framer Motion

## Project Structure (high level)

```
backend/          # FastAPI app
  main.py         # app entry
  db.py           # SQLite + lightweight migrations
  routes/         # auth, resume analyze, history
  services/       # parser, skill extractor, matcher
  models/         # ORM + Pydantic schemas

frontend/         # React app (Vite)
  src/lib/api.js   # axios client (+ token header)
  src/pages/       # Hero / Upload / Dashboard / History / About / etc

setup_backend.*   # convenience setup scripts
setup_frontend.*
```

## Quick Start (Windows)

### 1) Backend

Option A (recommended): run the setup script

```bat
setup_backend.bat
```

Option B (manual)

```powershell
cd backend
python -m venv venv
venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m spacy download en_core_web_sm
python -m uvicorn main:app --reload --port 8000
```

Backend runs at `http://127.0.0.1:8000` (docs: `http://127.0.0.1:8000/docs`).

### 2) Frontend

Option A: run the setup script

```bat
setup_frontend.bat
```

Option B (manual)

```powershell
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`.
In development, Vite proxies `/api` → `http://localhost:8000`.

## Environment Variables

Backend supports these environment variables:

- `RESUMIND_JWT_SECRET` (default: `dev-secret-change-me`)
- `RESUMIND_JWT_ALG` (default: `HS256`)
- `RESUMIND_JWT_EXPIRES_MIN` (default: `43200` = 30 days)
- `RESUMIND_DB_URL` (optional; defaults to local SQLite file under `backend/`)

For production, set `RESUMIND_JWT_SECRET` to a strong random value.

## API (summary)

All endpoints are under `/api`.

### Auth

- `POST /api/auth/register` → `{ access_token, token_type }`
- `POST /api/auth/login` → `{ access_token, token_type }`
- `GET /api/me` → current user

### Resume analysis

- `POST /api/analyze` (multipart/form-data)
  - fields: `file` (PDF), `job_description` (string)
  - returns:
    - `match_score` (0–100)
    - `semantic_score` (0–100, optional)
    - `structured_score` (0–100, optional)
    - `matching_skills`, `missing_skills`, `resume_skills`
    - `resume_meta` (structured sections)

### History

- `GET /api/history` → list of saved analyses
- `GET /api/history/{id}` → full detail for one analysis (includes `semantic_score` / `structured_score` when available)

## Notes / Troubleshooting

- PDF must contain selectable text (scanned images won’t parse well).
- First run may download ML models (network required).
- If you see dependency/wheel issues on very new Python versions, use Python 3.11/3.12 for smoother installs.
