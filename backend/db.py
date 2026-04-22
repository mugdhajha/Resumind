import os
from contextlib import contextmanager

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, DeclarativeBase
from sqlalchemy import text


_default_sqlite_path = os.path.abspath(os.path.join(os.path.dirname(__file__), "resumind.db"))
DB_URL = os.getenv("RESUMIND_DB_URL", f"sqlite:///{_default_sqlite_path}")

# SQLite needs this flag for multithreaded FastAPI usage.
connect_args = {"check_same_thread": False} if DB_URL.startswith("sqlite") else {}

engine = create_engine(DB_URL, connect_args=connect_args)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    from models.db_models import User, UploadHistory  # noqa: F401

    Base.metadata.create_all(bind=engine)

    # Lightweight migration for existing SQLite DBs.
    # If the table exists without the new column, add it.
    try:
        if DB_URL.startswith("sqlite"):
            with engine.connect() as conn:
                cols = conn.execute(text("PRAGMA table_info(upload_history)"))
                names = {row[1] for row in cols.fetchall()}  # row[1] = name
                if "semantic_score" not in names:
                    conn.execute(text("ALTER TABLE upload_history ADD COLUMN semantic_score INTEGER"))
                    conn.commit()
                if "structured_score" not in names:
                    conn.execute(text("ALTER TABLE upload_history ADD COLUMN structured_score INTEGER"))
                    conn.commit()
                if "resume_skills_json" not in names:
                    conn.execute(text("ALTER TABLE upload_history ADD COLUMN resume_skills_json TEXT NOT NULL DEFAULT '[]'"))
                    conn.commit()
                if "resume_meta_json" not in names:
                    conn.execute(text("ALTER TABLE upload_history ADD COLUMN resume_meta_json TEXT NOT NULL DEFAULT '{}'"))
                    conn.commit()
    except Exception:
        # If migration fails, app can still run; history items just won't have resume_skills.
        pass


@contextmanager
def session_scope():
    db = SessionLocal()
    try:
        yield db
        db.commit()
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
