EXTRACTION_PROMPT = """You are an expert research paper analyst. Below is the extracted text from a research paper.

Your task is to extract the following fields and return ONLY a valid JSON object.

CRITICAL: Your response must be valid, parseable JSON only.
- Do NOT include any text before or after the JSON
- Do NOT use newlines inside string values — write the overview as a single continuous line
- Do NOT include any special characters that would break JSON parsing
- Ensure all strings are properly escaped

Fields to extract:
- "title": The full title of the paper. If not found, use "Unknown Title".
- "authors": A JSON array of author names (strings). If not found, return an empty array [].
- "published_date": The publication date or year as a string (e.g. "2023", "March 2024", "2024-05-12"). If not found, return "Unknown".
- "overview": A detailed, well-structured summary of the paper written in flowing paragraphs (not bullet points). It must cover all of the following in order:
    1. Problem & Motivation — What problem does this paper address and why does it matter?
    2. Methodology & Approach — What methods, models, datasets, or techniques are used?
    3. Key Findings & Results — What are the main results or discoveries, with numbers/metrics where available?
    4. Contributions — What is novel or significant about this work compared to prior art?
    5. Limitations & Future Work — What are the stated limitations or directions for future research?
  Write this as 5-8 sentences minimum. Be specific and technical. Do not use bullet points or headers inside the overview string.

Paper text:
{text}

Return ONLY this JSON structure:
{{
  "title": "...",
  "authors": ["...", "..."],
  "published_date": "...",
  "overview": "..."
}}"""