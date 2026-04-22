from __future__ import annotations

from datetime import datetime
import json

from sqlalchemy import String, ForeignKey, DateTime, Integer, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from db import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    uploads: Mapped[list[UploadHistory]] = relationship("UploadHistory", back_populates="user")


class UploadHistory(Base):
    __tablename__ = "upload_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), index=True, nullable=False)

    resume_filename: Mapped[str] = mapped_column(String(255), nullable=False)
    job_description: Mapped[str] = mapped_column(Text, nullable=False)

    match_score: Mapped[int] = mapped_column(Integer, nullable=False)
    semantic_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    structured_score: Mapped[int | None] = mapped_column(Integer, nullable=True)
    matching_skills_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    missing_skills_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    resume_skills_json: Mapped[str] = mapped_column(Text, nullable=False, default="[]")
    resume_meta_json: Mapped[str] = mapped_column(Text, nullable=False, default="{}")

    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow, nullable=False)

    user: Mapped[User] = relationship("User", back_populates="uploads")

    @property
    def matching_skills(self) -> list[str]:
        try:
            return json.loads(self.matching_skills_json or "[]")
        except Exception:
            return []

    @property
    def missing_skills(self) -> list[str]:
        try:
            return json.loads(self.missing_skills_json or "[]")
        except Exception:
            return []

    @property
    def resume_skills(self) -> list[str]:
        try:
            return json.loads(self.resume_skills_json or "[]")
        except Exception:
            return []

    @property
    def resume_meta(self) -> dict:
        try:
            raw = json.loads(self.resume_meta_json or "{}")
            return raw if isinstance(raw, dict) else {}
        except Exception:
            return {}
