"""
chunking_service.py  —  Stage 1: Section-aware chunking

Responsibilities
────────────────
  • Split a paper's full text into 700–900 token chunks
  • Detect academic section headers and tag each chunk with its section
  • Detect the references / acknowledgements boundary and flag those
    chunks as low-value so later stages can skip them for embedding

Design decisions
────────────────
  Token estimation  : chars ÷ 4  (no tiktoken dep; accurate enough for Gemini)
  Section detection : regex against a ranked list of common academic headers
  Splitting         : RecursiveCharacterTextSplitter (already a project dep)
                      applied *per section* so section boundaries are respected
  References        : skipped entirely — they add noise to vector retrieval
  Acknowledgements  : kept but flagged is_low_value=True
"""

import re
from dataclasses import dataclass
from typing import List, Optional

from langchain_text_splitters import RecursiveCharacterTextSplitter


# ─── Chunk size constants ────────────────────────────────────────────────────

TARGET_TOKENS   = 800          # midpoint of the 700–900 target
TARGET_CHARS    = TARGET_TOKENS * 4   # ≈ 3 200 chars
OVERLAP_CHARS   = 200          # ~50-token overlap to preserve cross-chunk context


# ─── Section header patterns ─────────────────────────────────────────────────
# Order matters: more specific patterns first to avoid mis-detection.
# Each tuple is (regex_pattern, canonical_section_name).

SECTION_PATTERNS: List[tuple] = [
    (r"\babstract\b",                                           "Abstract"),
    (r"\b(1[\.\s]?\s*)?introduction\b",                        "Introduction"),
    (r"\b(related\s+work|prior\s+work|literature\s+review|background)\b",
                                                               "Related Work"),
    (r"\b(method(ology)?s?|approach|proposed\s+method|model|system|framework|architecture|design)\b",
                                                               "Methodology"),
    (r"\b(dataset(s)?|data\s+collection|experimental\s+setup|implementation\s+details)\b",
                                                               "Experiments"),
    (r"\b(experiment(s|al)?|evaluation|benchmark(s)?|ablation)\b",
                                                               "Experiments"),
    (r"\b(result(s)?|finding(s)?|performance|comparison|analysis|discussion)\b",
                                                               "Results"),
    (r"\b(conclusion(s)?|summary|future\s+work|closing\s+remarks)\b",
                                                               "Conclusion"),
    (r"\backnowledge?ment(s)?\b",                              "Acknowledgements"),
    (r"\breference(s)?\b",                                     "References"),
    (r"\bappendix\b",                                          "Appendix"),
]

# Sections dropped from the chunk list entirely (too noisy for retrieval)
SKIP_SECTIONS = {"References"}

# Sections kept but marked as low priority
LOW_VALUE_SECTIONS = {"Acknowledgements", "Appendix"}


# ─── Data class ──────────────────────────────────────────────────────────────

@dataclass
class Chunk:
    chunk_index:    int
    text:           str
    section:        str    # canonical section name, e.g. "Methodology"
    token_estimate: int    # rough token count
    is_low_value:   bool   # True for acks / appendix; skip these in embedding


# ─── Internal helpers ─────────────────────────────────────────────────────────

def _estimate_tokens(text: str) -> int:
    """1 token ≈ 4 characters — fast and dependency-free."""
    return max(1, len(text) // 4)


def _detect_section_header(line: str) -> Optional[str]:
    """
    Return the canonical section name if `line` looks like a section header,
    otherwise return None.

    Heuristics applied before regex:
      • Strip leading numbering  (e.g. "3.", "2.1", "IV.")
      • Line must be short  (< 100 chars) — body text is almost always longer
      • Line must not end with a period that continues a sentence
    """
    stripped = line.strip()
    if not stripped or len(stripped) > 100:
        return None

    # Lines ending with '.' that are long are likely sentences, not headers
    if stripped.endswith(".") and len(stripped) > 60:
        return None

    # Remove leading numbering: "1.", "2.1", "III.", "A."
    cleaned = re.sub(r"^[A-Za-z\dIVXivx]+[\.\)]\s*", "", stripped).strip()

    for pattern, canonical_name in SECTION_PATTERNS:
        if re.search(pattern, cleaned, re.IGNORECASE):
            return canonical_name

    return None


def _split_by_sections(full_text: str) -> List[tuple]:
    """
    Walk the text line by line, detect section headers, and group the
    content between them.

    Returns a list of (section_name, section_text) tuples in reading order.
    The very first block before any header is labelled "Header" (title, authors,
    affiliations) and is kept because it contains the paper's identity.
    """
    lines = full_text.split("\n")
    sections: List[tuple] = []

    current_section = "Header"
    current_lines: List[str] = []

    for line in lines:
        detected = _detect_section_header(line)
        if detected:
            # Flush the accumulated lines for the previous section
            text = "\n".join(current_lines).strip()
            if text:
                sections.append((current_section, text))
            current_section = detected
            current_lines = []
        else:
            current_lines.append(line)

    # Flush the final section
    text = "\n".join(current_lines).strip()
    if text:
        sections.append((current_section, text))

    return sections


# ─── Public API ───────────────────────────────────────────────────────────────

def chunk_paper(full_text: str) -> List[Chunk]:
    """
    Main entry point for Stage 1.

    Takes the full extracted text of a PDF and returns an ordered list
    of Chunk objects ready to be embedded and stored in the next stage.

    Steps:
      1. Split into (section_name, text) pairs via header detection
      2. Skip references sections entirely
      3. For sections that exceed TARGET_TOKENS, sub-split with
         RecursiveCharacterTextSplitter
      4. Tag each chunk with section name and low-value flag
    """
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=TARGET_CHARS,
        chunk_overlap=OVERLAP_CHARS,
        separators=["\n\n", "\n", ". ", " ", ""],
    )

    sections = _split_by_sections(full_text)

    chunks: List[Chunk] = []
    chunk_index = 0

    for section_name, section_text in sections:

        # Drop noisy sections entirely — no embedding, no storage
        if section_name in SKIP_SECTIONS:
            continue

        is_low_value = section_name in LOW_VALUE_SECTIONS
        token_estimate = _estimate_tokens(section_text)

        if token_estimate <= TARGET_TOKENS:
            # Section is short enough to be a single chunk
            chunks.append(Chunk(
                chunk_index=chunk_index,
                text=section_text,
                section=section_name,
                token_estimate=token_estimate,
                is_low_value=is_low_value,
            ))
            chunk_index += 1

        else:
            # Section is too long — split it into sub-chunks
            sub_texts = splitter.split_text(section_text)
            for sub_text in sub_texts:
                sub_text = sub_text.strip()
                if not sub_text:
                    continue
                chunks.append(Chunk(
                    chunk_index=chunk_index,
                    text=sub_text,
                    section=section_name,
                    token_estimate=_estimate_tokens(sub_text),
                    is_low_value=is_low_value,
                ))
                chunk_index += 1

    return chunks
