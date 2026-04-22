# RESUMIND — AI Resume Analyzer + Career Intelligence System

A full-stack AI-powered resume analyzer that computes semantic similarity between your resume and a job description using `sentence-transformers`, extracts skills with `spaCy`, and presents results in a futuristic React dashboard.

---

## 🗂 Project Structure

```
resumind/
├── backend/
│   ├── main.py                  # FastAPI entry point
│   ├── requirements.txt
│   ├── routes/
│   │   └── resume.py            # POST /api/analyze
│   ├── services/
│   │   ├── parser.py            # PDF text extraction (PyMuPDF)
│   │   ├── skill_extractor.py   # spaCy skill detection (60+ skills)
│   │   └── matcher.py           # Cosine similarity + skill gap
│   └── models/
│       └── schemas.py           # Pydantic response schema
└── frontend/
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── index.css
        └── pages/
            ├── HeroPage.jsx     # Animated hero with Three.js orb
            ├── UploadPage.jsx   # PDF upload + JD textarea
            └── Dashboard.jsx    # Results: score, skills, suggestions
```

---

## ⚡ Quick Start

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Download spaCy English model
python -m spacy download en_core_web_sm

# Start server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000
API docs at:    http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:5173

---

## 🔌 API Reference

### POST /api/analyze

**Request** (multipart/form-data):
| Field | Type | Description |
|---|---|---|
| `file` | File (PDF) | Resume PDF |
| `job_description` | string | Full job description text |

**Response** (JSON):
```json
{
  "match_score": 74,
  "matching_skills": ["Python", "SQL", "Machine Learning"],
  "missing_skills": ["Docker", "Kubernetes"]
}
```

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Backend | FastAPI + Uvicorn |
| PDF Parsing | PyMuPDF (fitz) |
| NLP | spaCy (en_core_web_sm) |
| Embeddings | sentence-transformers (all-MiniLM-L6-v2) |
| Similarity | scikit-learn cosine_similarity |
| Frontend | React 18 + Vite |
| Styling | Tailwind CSS |
| Animation | Framer Motion + Three.js |
| HTTP | Axios |

---

## 📝 Notes

- First run downloads `all-MiniLM-L6-v2` model (~90MB) automatically
- Resume must be a text-based PDF (not a scanned image)
- Skill list covers 60+ technologies across ML, web, cloud, DevOps, and databases
- Vite proxies `/api` requests to `localhost:8000` in development
