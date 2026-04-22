from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from db import get_db
from models.db_models import UploadHistory
from models.schemas import UploadHistoryItem, UploadHistoryDetail
from routes.auth import get_current_user


router = APIRouter()


def _job_preview(text: str, limit: int = 140) -> str:
    cleaned = " ".join((text or "").split())
    if len(cleaned) <= limit:
        return cleaned
    return cleaned[:limit].rstrip() + "…"


@router.get("/history", response_model=list[UploadHistoryItem])
def list_history(db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    rows = (
        db.query(UploadHistory)
        .filter(UploadHistory.user_id == current_user.id)
        .order_by(UploadHistory.created_at.desc())
        .limit(200)
        .all()
    )

    return [
        UploadHistoryItem(
            id=r.id,
            resume_filename=r.resume_filename,
            job_preview=_job_preview(r.job_description),
            match_score=r.match_score,
            created_at=r.created_at.isoformat(),
        )
        for r in rows
    ]


@router.get("/history/{history_id}", response_model=UploadHistoryDetail)
def get_history_item(history_id: int, db: Session = Depends(get_db), current_user=Depends(get_current_user)):
    r = (
        db.query(UploadHistory)
        .filter(UploadHistory.id == history_id, UploadHistory.user_id == current_user.id)
        .first()
    )
    if r is None:
        # Deliberately avoid leaking existence across users
        from fastapi import HTTPException

        raise HTTPException(status_code=404, detail="Not found")

    return UploadHistoryDetail(
        id=r.id,
        resume_filename=r.resume_filename,
        match_score=r.match_score,
        created_at=r.created_at.isoformat(),
        job_description=r.job_description,
        matching_skills=r.matching_skills,
        missing_skills=r.missing_skills,
        resume_skills=r.resume_skills,
        resume_meta=r.resume_meta,
        semantic_score=r.semantic_score,
        structured_score=r.structured_score,
    )
