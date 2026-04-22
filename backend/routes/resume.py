from fastapi import APIRouter, UploadFile, File, Form, HTTPException, Depends
import json
from sqlalchemy.orm import Session

from models.schemas import AnalysisResponse
from services.parser import extract_text_from_pdf
from services.skill_extractor import extract_skills
from services.resume_structurer import extract_resume_meta
from services.matcher import compute_combined_match_score, compute_skill_gap

from db import get_db
from models.db_models import UploadHistory
from routes.auth import get_current_user

router = APIRouter()


@router.post("/analyze", response_model=AnalysisResponse)
async def analyze_resume(
    file: UploadFile = File(...),
    job_description: str = Form(...),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user),
):
    """
    POST /api/analyze

    Accepts:
      - file: PDF resume (multipart)
      - job_description: plain text string (form field)

    Returns:
      - match_score: integer 0–100
      - matching_skills: list of skills found in both resume and JD
      - missing_skills: list of skills in JD but not in resume
    """

    # ── Validate file type ───────────────────────────────────────────────
    if not file.filename.lower().endswith(".pdf"):
        raise HTTPException(
            status_code=400,
            detail="Only PDF files are accepted."
        )

    if not job_description or len(job_description.strip()) < 20:
        raise HTTPException(
            status_code=400,
            detail="Job description must be at least 20 characters."
        )

    # ── Read PDF bytes ───────────────────────────────────────────────────
    pdf_bytes = await file.read()
    if len(pdf_bytes) == 0:
        raise HTTPException(status_code=400, detail="Uploaded file is empty.")

    # ── Extract text from PDF ────────────────────────────────────────────
    try:
        resume_text = extract_text_from_pdf(pdf_bytes)
    except Exception as e:
        raise HTTPException(
            status_code=422,
            detail=f"Could not parse PDF: {str(e)}"
        )

    if not resume_text.strip():
        raise HTTPException(
            status_code=422,
            detail="No readable text found in PDF. Ensure it is not a scanned image."
        )

    # ── Extract skills ───────────────────────────────────────────────────
    resume_skills = extract_skills(resume_text)
    job_skills = extract_skills(job_description)

    resume_meta = extract_resume_meta(resume_text)

    # ── Compute combined match score (semantic + structured sections) ────
    match_score, semantic_score, structured_score = compute_combined_match_score(
        resume_text=resume_text,
        job_description=job_description,
        resume_meta=resume_meta,
        job_skills=job_skills,
        semantic_weight=0.7,
    )

    # ── Compute skill gap ────────────────────────────────────────────────
    matching_skills, missing_skills = compute_skill_gap(resume_skills, job_skills)

    history = UploadHistory(
        user_id=current_user.id,
        resume_filename=file.filename,
        job_description=job_description,
        match_score=match_score,
        semantic_score=semantic_score,
        structured_score=structured_score,
        matching_skills_json=json.dumps(matching_skills),
        missing_skills_json=json.dumps(missing_skills),
        resume_skills_json=json.dumps(resume_skills),
        resume_meta_json=json.dumps(resume_meta),
    )
    db.add(history)
    db.commit()

    return AnalysisResponse(
        match_score=match_score,
        matching_skills=matching_skills,
        missing_skills=missing_skills,
        resume_skills=resume_skills,
        resume_meta=resume_meta,
        semantic_score=semantic_score,
        structured_score=structured_score,
    )
