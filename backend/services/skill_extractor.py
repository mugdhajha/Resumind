import re
import spacy
from typing import List, Set

# Load spaCy model (small English model for NLP)
try:
    nlp = spacy.load("en_core_web_sm")
except OSError:
    from spacy.cli import download
    download("en_core_web_sm")
    nlp = spacy.load("en_core_web_sm")


# ─── Master Skills List (60+ skills) ───────────────────────────────────────
SKILLS_DB: Set[str] = {
    # Programming Languages
    "python", "java", "javascript", "typescript", "c++", "c#", "go", "rust",
    "scala", "kotlin", "swift", "ruby", "php", "r", "matlab", "bash",

    # Web & Frontend
    "react", "angular", "vue", "next.js", "html", "css", "tailwind",
    "redux", "graphql", "rest api", "restful api",

    # Backend & Frameworks
    "node.js", "django", "flask", "fastapi", "spring boot", "express",
    "laravel", "rails",

    # Data & ML
    "machine learning", "deep learning", "natural language processing",
    "nlp", "computer vision", "tensorflow", "pytorch", "scikit-learn",
    "keras", "pandas", "numpy", "matplotlib", "data analysis",
    "data visualization", "statistics", "feature engineering",
    "model training", "neural networks", "transformers", "bert",

    # Databases
    "sql", "mysql", "postgresql", "mongodb", "redis", "elasticsearch",
    "sqlite", "oracle", "cassandra", "dynamodb",

    # Cloud & DevOps
    "aws", "azure", "gcp", "docker", "kubernetes", "terraform", "ansible",
    "ci/cd", "jenkins", "github actions", "linux", "nginx",

    # Data Engineering
    "apache spark", "hadoop", "airflow", "kafka", "etl", "data pipeline",
    "databricks", "dbt",

    # Tools & Practices
    "git", "github", "agile", "scrum", "jira", "figma", "postman",
    "unit testing", "test driven development", "microservices",
    "system design", "object oriented programming", "oop",

    # Soft Skills / Domain
    "communication", "leadership", "problem solving", "teamwork",
    "project management", "time management",

    # Analytics
    "tableau", "power bi", "excel", "google analytics", "looker",

    # Security
    "cybersecurity", "oauth", "jwt", "ssl", "encryption",
}


def _normalize(text: str) -> str:
    """Lowercase and clean text for matching."""
    return re.sub(r"\s+", " ", text.lower().strip())


def extract_skills(text: str) -> List[str]:
    """
    Extract known skills from text using:
    1. Exact/phrase matching against SKILLS_DB
    2. spaCy token matching as fallback

    Returns a deduplicated, title-cased list of found skills.
    """
    normalized_text = _normalize(text)
    found: Set[str] = set()

    # ── Phase 1: Direct phrase matching ──────────────────────────────────
    for skill in SKILLS_DB:
        # Use word boundary matching to avoid partial matches
        pattern = r"\b" + re.escape(skill) + r"\b"
        if re.search(pattern, normalized_text):
            found.add(skill)

    # ── Phase 2: spaCy noun chunks for compound skill phrases ─────────────
    doc = nlp(text[:100_000])  # spaCy limit guard
    for chunk in doc.noun_chunks:
        chunk_lower = _normalize(chunk.text)
        if chunk_lower in SKILLS_DB:
            found.add(chunk_lower)

    # ── Format: title-case except known acronyms ──────────────────────────
    acronyms = {
        "sql", "aws", "gcp", "css", "html", "api", "nlp", "oop",
        "jwt", "ssl", "etl", "dbt", "ci/cd", "php", "r"
    }
    result = []
    for skill in sorted(found):
        if skill in acronyms:
            result.append(skill.upper())
        elif "/" in skill or "." in skill:
            result.append(skill)
        else:
            result.append(skill.title())

    return result
