from __future__ import annotations

import re
from typing import Dict, List


_SECTION_ALIASES: dict[str, list[str]] = {
    "education": ["education", "academics", "academic background", "qualifications"],
    "coursework": ["coursework", "relevant coursework", "relevant subjects", "subjects"],
    "internships": ["internship", "internships", "experience", "work experience", "industrial training", "training"],
    "projects": ["projects", "project", "academic projects", "personal projects"],
    "certifications": ["certifications", "certification", "certificates", "licenses", "courses"],
    "achievements": ["achievements", "awards", "honors", "activities", "extra curricular", "extracurricular"],
}


def _normalize_line(line: str) -> str:
    line = re.sub(r"\s+", " ", (line or "").strip())
    line = re.sub(r"^[•\-\*\u2022\u25CF\u25AA\u25A0\u2013\u2014]+\s*", "", line)
    return line.strip()


def _is_heading(line: str) -> bool:
    if not line:
        return False
    # Headings are either:
    # - one of our known section names (Education/Projects/etc), OR
    # - explicit heading style like ALL CAPS or trailing ':'
    if _heading_key(line) is not None:
        return True
    if re.search(r"[:|]$", line):
        return True
    if line.isupper() and len(line) <= 40:
        return True
    return False


def _heading_key(line: str) -> str | None:
    low = re.sub(r"\s+", " ", line.lower().strip(" :|-"))
    for key, aliases in _SECTION_ALIASES.items():
        for a in aliases:
            if low == a or low.startswith(a + " "):
                return key
    return None


def extract_resume_meta(resume_text: str) -> Dict[str, List[str]]:
    """
    Heuristic resume section extractor.

    Returns a dict with keys:
      education, coursework, internships, projects, certifications, achievements

    Values are short bullet-like lines (deduped, preserving rough order).
    """
    out: Dict[str, List[str]] = {k: [] for k in _SECTION_ALIASES.keys()}
    if not resume_text:
        return out

    lines = [re.sub(r"\u00A0", " ", ln) for ln in resume_text.splitlines()]
    current: str | None = None

    for raw in lines:
        line = _normalize_line(raw)
        if not line:
            continue

        # Detect heading switches.
        key = _heading_key(line)
        if key:
            current = key
            continue

        if _is_heading(line):
            # Unknown heading: stop capturing until we find a known one.
            current = None
            continue

        # If we are inside a known section, capture.
        if current:
            # Drop very long paragraphs; keep it bullet-ish.
            if len(line) > 160:
                line = line[:157].rstrip() + "…"
            out[current].append(line)

    # Fallback: if no headings found, do light pattern-based extraction.
    if all(len(v) == 0 for v in out.values()):
        low = resume_text.lower()
        if any(x in low for x in ["intern", "trainee", "worked at", "experience"]):
            out["internships"] = ["Internship / experience details found (format not sectioned)."]
        if "project" in low:
            out["projects"] = ["Projects found (format not sectioned)."]
        if any(x in low for x in ["b.tech", "btech", "b.e", "be ", "degree", "university", "college"]):
            out["education"] = ["Education details found (format not sectioned)."]

    # Dedupe while preserving order.
    for k, items in out.items():
        seen = set()
        deduped: List[str] = []
        for item in items:
            norm = item.lower()
            if not norm or norm in seen:
                continue
            seen.add(norm)
            deduped.append(item)
        out[k] = deduped[:12]

    return out
