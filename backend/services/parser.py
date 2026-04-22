import fitz  # PyMuPDF
import io


def extract_text_from_pdf(file_bytes: bytes) -> str:
    """
    Extract all text from a PDF given its raw bytes.
    Returns cleaned, concatenated text from all pages.
    """
    text_parts = []

    with fitz.open(stream=io.BytesIO(file_bytes), filetype="pdf") as doc:
        for page in doc:
            text = page.get_text("text")
            if text.strip():
                text_parts.append(text.strip())

    full_text = "\n".join(text_parts)
    return full_text
