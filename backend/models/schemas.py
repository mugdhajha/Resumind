from pydantic import BaseModel
from typing import List, Optional


class RegisterRequest(BaseModel):
    email: str
    password: str


class LoginRequest(BaseModel):
    email: str
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class MeResponse(BaseModel):
    id: int
    email: str


class ResumeMeta(BaseModel):
    education: List[str] = []
    coursework: List[str] = []
    internships: List[str] = []
    projects: List[str] = []
    certifications: List[str] = []
    achievements: List[str] = []


class AnalysisResponse(BaseModel):
    match_score: int
    matching_skills: List[str]
    missing_skills: List[str]
    resume_skills: List[str] = []
    resume_meta: Optional[ResumeMeta] = None
    semantic_score: Optional[int] = None
    structured_score: Optional[int] = None


class UploadHistoryItem(BaseModel):
    id: int
    resume_filename: str
    job_preview: Optional[str] = None
    match_score: int
    created_at: str


class UploadHistoryDetail(UploadHistoryItem):
    job_description: str
    matching_skills: List[str]
    missing_skills: List[str]
    resume_skills: List[str] = []
    resume_meta: Optional[ResumeMeta] = None
    semantic_score: Optional[int] = None
    structured_score: Optional[int] = None
