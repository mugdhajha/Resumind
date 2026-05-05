from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from typing import Any, List, Tuple
import re
import numpy as np
import math

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


def _unique_lower_skills(skills: List[str]) -> List[str]:
    out: List[str] = []
    seen = set()
    for s in skills or []:
        if not isinstance(s, str):
            continue
        low = s.lower().strip()
        if not low or low in seen:
            continue
        seen.add(low)
        out.append(low)
    return out


def _canonical_skill(skill: str) -> str:
    """Normalize a skill string into a canonical form used for matching.

    This keeps matching robust against common variations (e.g. "fast api" vs "fastapi").
    """
    if not isinstance(skill, str):
        return ""
    s = skill.strip().lower()
    s = re.sub(r"\s+", " ", s)

    # Common spelling/format variants
    aliases = {
        "fast api": "fastapi",
        "restful api": "rest api",
        "node": "node.js",
        "nodejs": "node.js",
        "postgre": "postgresql",
        "postgre sql": "postgresql",
        "sci kit learn": "scikit-learn",
        "sklearn": "scikit-learn",
        "k8s": "kubernetes",
        "ci cd": "ci/cd",
        "githubaction": "github actions",
        "github-actions": "github actions",
    }
    if s in aliases:
        s = aliases[s]

    return s


# Related skill groups enable partial credit ("related match" = 0.5)
_RELATED_GROUPS: dict[str, set[str]] = {
    "backend_framework": {"fastapi", "django", "flask", "express", "spring boot", "rails", "laravel"},
    "frontend_framework": {"react", "angular", "vue", "next.js", "redux", "tailwind"},
    "ml_core": {"machine learning", "deep learning", "nlp", "natural language processing", "transformers", "bert"},
    "ml_libs": {"tensorflow", "pytorch", "scikit-learn", "keras"},
    "data_stack": {"pandas", "numpy", "matplotlib", "data analysis", "statistics", "feature engineering"},
    "cloud_devops": {"docker", "kubernetes", "aws", "azure", "gcp", "terraform", "ci/cd", "nginx", "linux"},
    "db": {"sql", "mysql", "postgresql", "mongodb", "redis", "sqlite", "elasticsearch"},
}


def _group_index() -> dict[str, str]:
    idx: dict[str, str] = {}
    for group, skills in _RELATED_GROUPS.items():
        for s in skills:
            idx[_canonical_skill(s)] = group
    return idx


_GROUP_BY_SKILL = _group_index()


def _is_related(job_skill: str, resume_skill: str) -> bool:
    j = _canonical_skill(job_skill)
    r = _canonical_skill(resume_skill)
    if not j or not r:
        return False
    return _GROUP_BY_SKILL.get(j) is not None and _GROUP_BY_SKILL.get(j) == _GROUP_BY_SKILL.get(r)


def _count_phrase_occurrences(text: str, phrase: str) -> int:
    if not text or not phrase:
        return 0
    t = _normalize_ws(text)
    p = _canonical_skill(phrase)
    if not p:
        return 0
    return len(re.findall(r"(^|[^a-z0-9])" + re.escape(p) + r"([^a-z0-9]|$)", t))


def _base_importance_weight(skill: str) -> float:
    """Base weight for skill importance (core skills > tools).

    Keep this small/simple and easy to tune.
    """
    s = _canonical_skill(skill)
    if not s:
        return 0.5

    # Very core fundamentals
    if s in {"python", "java", "javascript", "typescript", "sql"}:
        return 2.0

    # Core ML / backend indicators
    if s in {"machine learning", "deep learning", "nlp", "natural language processing", "fastapi", "django", "rest api"}:
        return 1.6

    # Major cloud / deployment / infra skills
    if s in {"docker", "kubernetes", "aws", "azure", "gcp"}:
        return 1.3

    # Default
    return 1.0


def _importance_weight(skill: str, job_description: str) -> float:
    """Importance weight for a JD skill.

    weight = base_weight * f(freq_in_jd)
    where f grows sublinearly so repetition increases importance but doesn't explode.
    """
    base = _base_importance_weight(skill)
    freq = _count_phrase_occurrences(job_description or "", skill)
    # 0->1.0, 1->1.25, 2->1.4, 3->1.5... (capped)
    freq_boost = 1.0 + min(0.7, 0.25 * math.log1p(freq))
    return max(0.1, base * freq_boost)


def compute_skill_relevance_score(resume_skills: List[str], job_skills: List[str]) -> int:
    """Compute a 0–100 score based on how many JD skills appear in the resume skills.

    This is intentionally simple/transparent: score = (matched_job_skills / total_job_skills) * 100.
    """
    job_unique = _unique_lower_skills(job_skills)
    if not job_unique:
        return 0

    resume_set = set(_unique_lower_skills(resume_skills))
    if not resume_set:
        return 0

    hits = sum(1 for s in job_unique if s in resume_set)
    return int(round((hits / len(job_unique)) * 100.0))


def compute_weighted_partial_skill_score(
    resume_skills: List[str],
    job_skills: List[str],
    job_description: str,
    related_credit: float = 0.5,
    top_k: int = 30,
) -> int:
    """Compute a 0–100 skill score with partial credit + importance weights.

    For each JD skill, we compute a best-match score in {1.0, related_credit, 0.0}
    and weight it by importance.

    - exact match: 1.0
    - related (same group): related_credit (default 0.5)
    - none: 0.0

    To avoid huge JDs dominating the denominator, we only score the top_k most
    important JD skills (default 30).
    """
    job_unique = [_canonical_skill(s) for s in _unique_lower_skills(job_skills)]
    job_unique = [s for s in job_unique if s]
    if not job_unique:
        return 0

    resume_unique = [_canonical_skill(s) for s in _unique_lower_skills(resume_skills)]
    resume_set = set([s for s in resume_unique if s])
    if not resume_set:
        return 0

    # Rank JD skills by importance and only consider the top_k.
    scored_job = []
    for js in job_unique:
        w = _importance_weight(js, job_description)
        scored_job.append((w, js))
    scored_job.sort(key=lambda t: t[0], reverse=True)
    if top_k and top_k > 0:
        scored_job = scored_job[: min(top_k, len(scored_job))]

    total_w = 0.0
    total = 0.0
    for w, js in scored_job:
        total_w += w
        if js in resume_set:
            total += w * 1.0
            continue
        # Related match: any resume skill in the same group
        group = _GROUP_BY_SKILL.get(js)
        if group:
            if any(_GROUP_BY_SKILL.get(rs) == group for rs in resume_set):
                total += w * float(related_credit)

    if total_w <= 0:
        return 0
    return int(round(min(max((total / total_w) * 100.0, 0.0), 100.0)))


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


def _phrase_hit_ratio(text: str, phrases: List[str]) -> float:
    """Return [0,1] ratio of phrases found in text (phrase-level boundary match)."""
    if not text:
        return 0.0
    phrase_unique = _unique_lower_skills(phrases)
    if not phrase_unique:
        return 0.0

    hits = 0
    for phrase in phrase_unique:
        if re.search(r"(^|[^a-z0-9])" + re.escape(phrase) + r"([^a-z0-9]|$)", text):
            hits += 1
    return hits / len(phrase_unique)


def _section_text(resume_meta: Any, key: str) -> str:
    if not isinstance(resume_meta, dict):
        return ""
    vals = resume_meta.get(key)
    if not isinstance(vals, list):
        return ""
    joined = " ".join([str(x) for x in vals if x])
    return _normalize_ws(joined)


def compute_weighted_structured_score(
    resume_meta: Any,
    resume_skills: List[str],
    job_skills: List[str],
    job_description: str,
    skill_weight: float = 0.8,
    projects_weight: float = 0.1,
    coursework_weight: float = 0.1,
) -> int:
    """Compute a 0–100 score using skill-first weighting.

    Weights (default): 80% Skills, 10% Projects, 10% Coursework.
    Missing sections do not penalize: weights are renormalized across available signals.
    """
    # Skills: weighted + partial credit
    skill_score = compute_weighted_partial_skill_score(
        resume_skills=resume_skills,
        job_skills=job_skills,
        job_description=job_description,
        related_credit=0.5,
        top_k=30,
    )

    # Projects/Coursework: semantic similarity (embeddings) vs the JD.
    # This is more robust than exact phrase matching.
    projects_text = _section_text(resume_meta, "projects")
    coursework_text = _section_text(resume_meta, "coursework")

    projects_score = compute_section_semantic_score(projects_text, job_description) if projects_text else 0
    coursework_score = compute_section_semantic_score(coursework_text, job_description) if coursework_text else 0

    components = []
    # Skills component is only meaningful if we actually have JD skills.
    if _unique_lower_skills(job_skills):
        components.append((float(skill_weight), float(skill_score)))
    if projects_text:
        components.append((float(projects_weight), float(projects_score)))
    if coursework_text:
        components.append((float(coursework_weight), float(coursework_score)))

    if not components:
        return 0

    total_w = sum(w for w, _ in components)
    if total_w <= 0:
        return 0

    final = sum((w / total_w) * s for w, s in components)
    return int(round(min(max(final, 0.0), 100.0)))


def compute_section_semantic_score(section_text: str, job_description: str) -> int:
    """Compute a 0–100 semantic similarity score between a resume section and the JD."""
    if not section_text or not job_description:
        return 0
    model = _get_model()
    embeddings = model.encode(
        [section_text[:10_000], job_description[:10_000]],
        convert_to_numpy=True,
        normalize_embeddings=True,
    )
    similarity = cosine_similarity([embeddings[0]], [embeddings[1]])[0][0]
    similarity = float(np.clip(similarity, 0.0, 1.0))
    return int(round(similarity * 100.0))


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
    resume_skills: List[str],
    job_skills: List[str],
    structured_weight: float = 0.6,
) -> tuple[int, int, int]:
    """Compute final match score.

    Primary score is structured and skills-first (skills/projects/coursework).
    Final score is a weighted hybrid of structured + semantic.

    Returns: (final_score, semantic_score, structured_score)
    """
    semantic = compute_match_score(resume_text, job_description)
    structured = compute_weighted_structured_score(
        resume_meta=resume_meta,
        resume_skills=resume_skills,
        job_skills=job_skills,
        job_description=job_description,
        skill_weight=0.8,
        projects_weight=0.1,
        coursework_weight=0.1,
    )

    # Hybrid combine: even if structured is weak/missing, semantic still contributes.
    w = float(min(max(structured_weight, 0.0), 1.0))
    final = int(round((w * structured) + ((1.0 - w) * semantic)))
    return min(max(final, 0), 100), semantic, structured
