"""
Prompt for extracting entities from a user's question.
This is Step 1 of the Graph RAG query pipeline.
"""

QUERY_ENTITY_PROMPT = """You are an entity extraction engine.
Given a user's question about academic research papers, extract the core entities (models, datasets, methods, metrics, concepts, people, organisations).

Rules:
1. Extract 1-5 key entities.
2. Be exact with names (e.g. "BERT", "attention", "ImageNet").
3. Return ONLY a JSON array of strings — no markdown, no explanation.

Question:
{question}

Return ONLY this format:
["entity1", "entity2"]"""
