import os
import json
import re
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import HumanMessage
from langchain_community.document_loaders import PyPDFLoader
import tempfile

from prompts.extraction_prompt import EXTRACTION_PROMPT

load_dotenv()

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=GEMINI_API_KEY,
    temperature=0.1,
)


def extract_text_from_pdf_bytes(pdf_bytes: bytes) -> str:
    """Extract all text from the PDF without truncating."""
    with tempfile.NamedTemporaryFile(suffix=".pdf", delete=False) as tmp:
        tmp.write(pdf_bytes)
        tmp_path = tmp.name

    try:
        loader = PyPDFLoader(tmp_path)
        pages = loader.load()
    finally:
        os.unlink(tmp_path)

    full_text = "\n\n".join(page.page_content for page in pages)
    return full_text


def _clean_json_response(raw: str) -> str:
    raw = raw.strip()
    raw = re.sub(r"^```(?:json)?\s*", "", raw)
    raw = re.sub(r"\s*```$", "", raw)
    return raw.strip()


async def extract_paper_summary(text: str) -> dict:
    if not text.strip():
        raise ValueError("Could not extract text from the PDF. The file may be scanned/image-only.")

    prompt = EXTRACTION_PROMPT.format(text=text)

    response = await llm.ainvoke([HumanMessage(content=prompt)])
    raw_content = response.content

    cleaned = _clean_json_response(raw_content)
    try:
        data = json.loads(cleaned)
    except json.JSONDecodeError as e:
        raise ValueError(f"Model returned invalid JSON: {e}\nRaw: {raw_content[:500]}")

    return {
        "title":          data.get("title", "Unknown Title"),
        "authors":        data.get("authors", []),
        "published_date": data.get("published_date", "Unknown"),
        "overview":       data.get("overview", ""),
    }