"""
Entity + relationship extraction prompt for the graph extraction pipeline.

Design decisions
────────────────
  • We send the FULL paper text (not individual chunks) because Gemini Flash
    can handle 4–15 page papers in a single context window. This gives the
    model global context to resolve coreferences ("the proposed model" → BERT)
    and avoids duplicate/conflicting entity extractions across chunk boundaries.

  • Entity types are constrained to a fixed set relevant to academic papers.
    This keeps the graph clean and prevents Gemini from inventing arbitrary types.

  • Relations are kept as free-form strings (e.g. "EVALUATED_ON", "PROPOSES")
    because constraining them to a fixed list causes the model to either
    force-fit or drop valid relations. The graph query layer (Stage 6) will
    traverse by structure, not by relation name.

  • The prompt explicitly asks for no explanation / no markdown — same pattern
    as the existing extraction_prompt.py.
"""

GRAPH_EXTRACTION_PROMPT = """You are a knowledge graph extraction engine for academic research papers.

Below is the full text of a research paper. Extract ALL important entities and the relationships between them.

ENTITY TYPES (use exactly these labels):
  - Model        (e.g. BERT, GPT-4, ResNet, Transformer)
  - Dataset      (e.g. SQuAD, ImageNet, MNIST, COCO)
  - Method       (e.g. attention mechanism, fine-tuning, dropout, backpropagation)
  - Metric       (e.g. F1 score, BLEU, accuracy, perplexity)
  - Task         (e.g. machine translation, object detection, sentiment analysis)
  - Tool         (e.g. PyTorch, TensorFlow, Hugging Face)
  - Person       (e.g. author names, referenced researchers)
  - Organisation (e.g. Google, OpenAI, MIT, Stanford)
  - Domain       (e.g. NLP, computer vision, reinforcement learning)

RULES:
  1. Extract 8–25 entities. Focus on the most important concepts mentioned in the paper.
  2. Extract 8–20 relationships between those entities.
  3. Use UPPERCASE_WITH_UNDERSCORES for relation names (e.g. USES, TRAINED_ON, OUTPERFORMS, PROPOSES, EVALUATED_ON, PART_OF, EXTENDS, COMPARED_TO, ACHIEVES).
  4. Every entity in a relationship MUST also appear in the entities list.
  5. Return ONLY a valid JSON object.

CRITICAL: Your response must be valid, parseable JSON only.
- Do NOT include any text before or after the JSON
- Do NOT use newlines inside string values
- Do NOT include any special characters that would break JSON parsing
- Ensure all strings are properly escaped

Paper text:
{text}

Return ONLY this JSON structure:
{{
  "entities": [
    {{"name": "...", "type": "..."}},
    {{"name": "...", "type": "..."}}
  ],
  "relations": [
    {{"source": "...", "relation": "...", "target": "..."}},
    {{"source": "...", "relation": "...", "target": "..."}}
  ]
}}"""
