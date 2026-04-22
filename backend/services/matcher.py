from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Any, List, Tuple
import re
import numpy as np

# Load model once at module level (cached after first load)
_model = None


def _get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        _model = SentenceTransformer("all-MiniLM-L6-v2")
    return _model


def compute_match_score(resume_text: str, job_description: str) -> int:
    """
    Compute semantic similarity between resume and job description
    using sentence-transformers (all-MiniLM-L6-v2).

    Returns an integer percentage (0–100).
    """
    model = _get_model()

    embeddings = model.encode(
        [resume_text[:10_000], job_description[:10_000]],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )

    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]

    # Map raw similarity (typically 0.3–0.9) to a user-friendly 0–100 scale
    # Clamp to [0, 1] first
    similarity = float(np.clip(similarity, 0.0, 1.0))

    # Scale: raw 0.3 → ~45%, raw 0.7 → ~85%
    scaled = similarity * 100
    score = int(round(scaled))

    return min(max(score, 0), 100)


def compute_skill_gap(
    resume_skills: List[str],
    job_skills: List[str],
) -> Tuple[List[str], List[str]]:
    """
    Compute matching and missing skills.

    Args:
        resume_skills: Skills extracted from the resume.
        job_skills:    Skills extracted from the job description.

    Returns:
        (matching_skills, missing_skills)
    """
    resume_set = {s.lower() for s in resume_skills}
    job_set = {s.lower() for s in job_skills}

    matching_lower = resume_set & job_set
    missing_lower = job_set - resume_set

    # Rebuild with original casing from job_skills list
    job_map = {s.lower(): s for s in job_skills}

    matching = sorted([job_map[s] for s in matching_lower if s in job_map])
    missing = sorted([job_map[s] for s in missing_lower if s in job_map])

    return matching, missing


def _normalize_ws(text: str) -> str:
    return re.sub(r"\s+", " ", (text or "").lower()).strip()


def compute_structured_relevance_score(resume_meta: Any, job_skills: List[str]) -> int:
    """Compute a 0–100 relevance score based on *structured resume sections* vs JD skills.

    This is deliberately simple and explainable:
    - Extracted JD skills (via SKILLS_DB) are the target set.
    - We look for those skill phrases inside the resume meta sections.
    - Sections are weighted so Projects/Internships matter more.

    If we don't have enough signals (no meta or no job skills), returns 0.
    """
    if not isinstance(resume_meta, dict):
        return 0

    job = [s for s in (job_skills or []) if isinstance(s, str) and s.strip()]
    if not job:
        return 0

    job_unique = []
    seen = set()
    for s in job:
        low = s.lower().strip()
        if low and low not in seen:
            seen.add(low)
            job_unique.append(low)

    if not job_unique:
        return 0

    weights = {
        "projects": 0.35,
        "internships": 0.35,
        "coursework": 0.15,
        "certifications": 0.10,
        "education": 0.03,
        "achievements": 0.02,
    }

    def section_text(key: str) -> str:
        vals = resume_meta.get(key)
        if not isinstance(vals, list):
            return ""
        joined = " ".join([str(x) for x in vals if x])
        return _normalize_ws(joined)

    total = 0.0
    for key, w in weights.items():
        text = section_text(key)
        if not text:
            continue
        hits = 0
        for skill in job_unique:
            # Phrase match with loose boundaries; works for multi-word skills too.
            if re.search(r"(^|[^a-z0-9])" + re.escape(skill) + r"([^a-z0-9]|$)", text):
                hits += 1

        ratio = hits / len(job_unique)
        total += w * ratio * 100.0

    return int(round(min(max(total, 0.0), 100.0)))


def compute_combined_match_score(
    resume_text: str,
    job_description: str,
    resume_meta: Any,
    job_skills: List[str],
    semantic_weight: float = 0.7,
) -> tuple[int, int, int]:
    """Combine semantic similarity and structured relevance into one 0–100 match score.

    Returns: (final_score, semantic_score, structured_score)
    """
    semantic = compute_match_score(resume_text, job_description)
    structured = compute_structured_relevance_score(resume_meta, job_skills)

    # If structured signals are missing, don't penalize; fall back to semantic.
    has_structured = structured > 0
    if not has_structured:
        return semantic, semantic, structured

    w = float(min(max(semantic_weight, 0.0), 1.0))
    final = int(round((w * semantic) + ((1.0 - w) * structured)))
    return min(max(final, 0), 100), semantic, structured
