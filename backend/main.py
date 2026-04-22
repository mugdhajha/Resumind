from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.resume import router as resume_router
from routes.auth import router as auth_router
from routes.history import router as history_router

from db import init_db

app = FastAPI(
    title="RESUMIND — AI Resume Analyzer",
    description="Analyze resume-to-job-description compatibility using NLP + semantic similarity.",
    version="1.0.0",
)


@app.on_event("startup")
def _startup():
    init_db()

# ── CORS — allow Vite dev server and production frontend ─────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev
        "http://localhost:3000",
        "http://127.0.0.1:5173",
    ],
    allow_origin_regex=r"^http://(localhost|127\\.0\\.0\\.1)(:\\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── Routes ───────────────────────────────────────────────────────────────────
app.include_router(resume_router, prefix="/api")
app.include_router(auth_router, prefix="/api")
app.include_router(history_router, prefix="/api")


@app.get("/")
def root():
    return {"status": "RESUMIND backend running", "docs": "/docs"}
